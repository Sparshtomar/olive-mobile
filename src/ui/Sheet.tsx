import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { IconButton } from './IconButton';
import { X } from './icons';
import { Text } from './Text';
import { radius, space } from './theme';
import { useLayout } from './use-layout';
import { makeStyles } from './use-theme';

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Prevents dismissal while something important is in flight (e.g. saving). */
  dismissible?: boolean;
}

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;

/**
 * One API, two presentations: a draggable bottom sheet on phones and a centred
 * dialog on wide screens (desktop web / tablets). Callers never branch on platform.
 */
export const Sheet = ({ visible, onClose, title, subtitle, children, dismissible = true }: SheetProps) => {
  const { isWide, height } = useLayout();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  // Stay mounted while the exit animation plays.
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const dragY = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      dragY.value = 0;
      progress.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else if (mounted) {
      progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible, mounted, progress, dragY]);

  const requestClose = () => {
    if (dismissible) onClose();
  };

  const pan = Gesture.Pan()
    .enabled(!isWide && dismissible)
    .activeOffsetY(8)
    .onUpdate((e) => {
      dragY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(onClose);
      } else {
        dragY.value = withSpring(0, { damping: 20, stiffness: 220 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 0.6 + dragY.value }],
  }));
  const dialogStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.96 + progress.value * 0.04 }],
  }));

  if (!mounted) return null;

  const header =
    title || dismissible ? (
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {title ? (
            <Text variant="heading" accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        {dismissible ? <IconButton icon={X} label="Close" onPress={onClose} size={34} /> : null}
      </View>
    ) : null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={requestClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} accessibilityLabel="Dismiss" />
        </Animated.View>

        {isWide ? (
          <View style={[styles.dialogWrap, { pointerEvents: 'box-none' }]}>
            <Animated.View style={[styles.dialog, { maxHeight: height * 0.85 }, dialogStyle]} accessibilityViewIsModal>
              {header}
              <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
                {children}
              </ScrollView>
            </Animated.View>
          </View>
        ) : (
          <KeyboardAvoidingView behavior="padding" style={[styles.sheetWrap, { pointerEvents: 'box-none' }]}>
            <Animated.View
              style={[styles.sheet, { maxHeight: height * 0.9, paddingBottom: insets.bottom + space.lg }, sheetStyle]}
              accessibilityViewIsModal
            >
              <GestureDetector gesture={pan}>
                <View style={styles.grabArea}>
                  <View style={styles.grabber} />
                  {header}
                </View>
              </GestureDetector>
              <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" bounces={false}>
                {children}
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        )}
      </GestureHandlerRootView>
    </Modal>
  );
};

const useStyles = makeStyles(({ colors, shadow }) => ({
  backdrop: { backgroundColor: colors.overlay },
  sheetWrap: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    ...shadow.floating,
  },
  grabArea: { paddingTop: space.sm },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.borderStrong,
    marginBottom: space.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  body: { paddingHorizontal: space.xl, paddingBottom: space.sm, gap: space.md },
  dialogWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  dialog: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: colors.bg,
    borderRadius: radius.xl,
    paddingTop: space.xl,
    paddingBottom: space.xl,
    ...shadow.floating,
  },
}));
