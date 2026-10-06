import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Olive } from './Olive';
import { Text } from './Text';
import { alpha, space } from './theme';
import { useTheme } from './use-theme';

export interface SplashOverlayProps {
  /** Called when the overlay has finished and unmounted itself from view. */
  onDone: () => void;
  /** Fires on first layout - the moment the native splash can hide. Resolve when it has, so the mascot waits. */
  onReady?: () => void | Promise<void>;
}

// Timeline (ms) from the moment the native splash has gone. The mascot is already there: the
// OS splash drew it at the same spot and size, so the glow and the wordmark grow around it.
const WORDMARK_IN = 200;
const TAGLINE_IN = 440;
const HOLD_UNTIL = 1300;
/** Matches the `imageWidth` the native splash draws the icon at. */
const MASCOT_SIZE = 120;
const LIFT_MS = 420;

/**
 * Takes over from the OS splash without a seam: same background, and the mascot sits exactly
 * where the OS drew it (screen centre, same size) from the first frame, so the system's fade
 * lands on an identical picture. Then the glow and wordmark rise and the screen lifts away to
 * reveal the app already rendered underneath.
 * Honours the reduce-motion setting by cutting straight to the end.
 */
export const SplashOverlay = ({ onDone, onReady }: SplashOverlayProps) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

  const glow = useSharedValue(reduceMotion ? 1 : 0);
  const wordmark = useSharedValue(reduceMotion ? 1 : 0);
  const tagline = useSharedValue(reduceMotion ? 1 : 0);
  const lift = useSharedValue(0);
  // Nothing moves until the native splash has faded, so the two never animate against each other.
  const [go, setGo] = useState(false);

  useEffect(() => {
    if (!go) return;
    // Animation callbacks run on the UI thread: hop back to JS with scheduleOnRN rather than calling a closure.
    if (reduceMotion) {
      lift.value = withDelay(
        600,
        withTiming(1, { duration: 200 }, (done) => {
          if (done) scheduleOnRN(onDone);
        }),
      );
      return;
    }
    glow.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    wordmark.value = withDelay(WORDMARK_IN, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    tagline.value = withDelay(TAGLINE_IN, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
    lift.value = withDelay(
      HOLD_UNTIL,
      withTiming(1, { duration: LIFT_MS, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) scheduleOnRN(onDone);
      }),
    );
  }, [go, reduceMotion, glow, wordmark, tagline, lift, onDone]);

  const ready = () => {
    void Promise.resolve(onReady?.()).finally(() => setTimeout(() => setGo(true), 200));
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: 1 - lift.value,
    transform: [{ scale: 1 + lift.value * 0.06 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glow.value * 0.9,
    transform: [{ scale: 0.6 + glow.value * 0.4 }],
  }));
  const wordmarkStyle = useAnimatedStyle(() => ({
    opacity: wordmark.value,
    transform: [{ translateY: (1 - wordmark.value) * 18 }],
  }));
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: tagline.value,
    transform: [{ translateY: (1 - tagline.value) * 10 }],
  }));

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, styles.overlay, { backgroundColor: colors.bg }, overlayStyle]}
      onLayout={ready}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="auto"
    >
      <View style={styles.stage}>
        <Animated.View style={[styles.glow, { backgroundColor: alpha(colors.primary, 0.18) }, glowStyle]} />
        <Olive mood="happy" size={MASCOT_SIZE} animated={go} />
      </View>
      <View style={styles.words}>
        <Animated.View style={wordmarkStyle}>
          <Text variant="display" align="center">
            Olive
          </Text>
        </Animated.View>
        <Animated.View style={taglineStyle}>
          <Text variant="body" tone="muted" align="center">
            Your plate and your reports, in one picture.
          </Text>
        </Animated.View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { zIndex: 1000, alignItems: 'center', justifyContent: 'center' },
  // Centred on the screen, like the OS icon. The words hang below it instead of sharing the centre.
  stage: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
  words: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: MASCOT_SIZE / 2 + space.md,
    paddingHorizontal: space.xl,
    gap: space.sm,
  },
});
