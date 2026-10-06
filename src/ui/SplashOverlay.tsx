import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
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

// Timeline (ms). Mascot pops first, the wordmark follows, then the whole thing lifts away.
const MASCOT_IN = 0;
const WORDMARK_IN = 380;
const TAGLINE_IN = 620;
const HOLD_UNTIL = 1450;
const LIFT_MS = 420;

/**
 * The first thing a user sees: Olive sprouts in on the page colour, the wordmark rises
 * beneath her, then the screen lifts away to reveal the app already rendered underneath.
 * Matches the native splash background, so the hand-off from the OS splash is seamless.
 * Honours the reduce-motion setting by cutting straight to the end.
 */
export const SplashOverlay = ({ onDone, onReady }: SplashOverlayProps) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();

  const mascot = useSharedValue(reduceMotion ? 1 : 0);
  const glow = useSharedValue(reduceMotion ? 1 : 0);
  const wordmark = useSharedValue(reduceMotion ? 1 : 0);
  const tagline = useSharedValue(reduceMotion ? 1 : 0);
  const lift = useSharedValue(0);
  // The native splash shows the same mascot and fades out after hideAsync resolves; starting before that doubles it.
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
    mascot.value = withDelay(MASCOT_IN, withSpring(1, { damping: 12, stiffness: 160, mass: 0.9 }));
    glow.value = withDelay(MASCOT_IN + 80, withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }));
    wordmark.value = withDelay(WORDMARK_IN, withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }));
    tagline.value = withDelay(TAGLINE_IN, withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }));
    lift.value = withDelay(
      HOLD_UNTIL,
      withTiming(1, { duration: LIFT_MS, easing: Easing.in(Easing.cubic) }, (done) => {
        if (done) scheduleOnRN(onDone);
      }),
    );
  }, [go, reduceMotion, mascot, glow, wordmark, tagline, lift, onDone]);

  const ready = () => {
    void Promise.resolve(onReady?.()).finally(() => setTimeout(() => setGo(true), 200));
  };

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: 1 - lift.value,
    transform: [{ scale: 1 + lift.value * 0.06 }],
  }));
  const mascotStyle = useAnimatedStyle(() => ({
    opacity: mascot.value,
    transform: [{ scale: 0.4 + mascot.value * 0.6 }, { translateY: (1 - mascot.value) * 24 }],
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
        <Animated.View style={mascotStyle}>
          <Olive mood="happy" size={132} />
        </Animated.View>
      </View>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: { zIndex: 1000, alignItems: 'center', justifyContent: 'center', gap: space.sm, padding: space.xl },
  stage: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: space.md },
  glow: { position: 'absolute', width: 200, height: 200, borderRadius: 100 },
});
