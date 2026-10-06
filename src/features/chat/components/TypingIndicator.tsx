import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Text, makeStyles, radius, space } from '@/ui';
import { OliveOrb } from './OliveOrb';

const Dot = ({ delay }: { delay: number }) => {
  const styles = useStyles();
  const lift = useSharedValue(0);
  useEffect(() => {
    lift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 280, easing: Easing.in(Easing.quad) }),
          withTiming(0, { duration: 360 }),
        ),
        -1,
      ),
    );
  }, [delay, lift]);
  const style = useAnimatedStyle(() => ({
    opacity: 0.35 + lift.value * 0.65,
    transform: [{ translateY: -lift.value * 4 }],
  }));
  return <Animated.View style={[styles.dot, style]} />;
};

/** Olive is "thinking": a bubble with three dots that ripple, and a line about what she's doing. */
export const TypingIndicator = ({ hint = 'Reading your reports…' }: { hint?: string }) => {
  const styles = useStyles();
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={styles.row}
      accessibilityLiveRegion="polite"
      accessibilityLabel={hint}
    >
      <OliveOrb size={30} />
      <View style={styles.bubble}>
        <View style={styles.dots}>
          <Dot delay={0} />
          <Dot delay={140} />
          <Dot delay={280} />
        </View>
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      </View>
    </Animated.View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 6,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  dots: { flexDirection: 'row', gap: 5, alignItems: 'center', height: 14 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
}));
