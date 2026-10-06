import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { kcal } from '@/lib/format';
import { Text, useTheme } from '@/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface CalorieRingProps {
  eaten: number;
  target: number;
  size?: number;
}

/**
 * Remaining calories, front and centre. Going over turns the ring warm (not red) and
 * the copy factual — being 80 kcal over is information, not failure.
 */
export const CalorieRing = ({ eaten, target, size = 188 }: CalorieRingProps) => {
  const { colors } = useTheme();
  const stroke = 16;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const ratio = target > 0 ? eaten / target : 0;
  const over = eaten > target;
  const remaining = Math.round(target - eaten);

  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(ratio, 1), { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [ratio, progress]);

  const animatedProps = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - progress.value) }));

  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={
        over
          ? `${kcal(-remaining)} calories over your ${kcal(target)} calorie target`
          : `${kcal(remaining)} of ${kcal(target)} calories left today`
      }
    >
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceMuted} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? colors.warm : colors.primary}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text variant="hero" style={{ color: over ? colors.warm : colors.text }}>
          {kcal(Math.abs(remaining))}
        </Text>
        <Text variant="caption" tone="muted">
          {over ? 'kcal over' : 'kcal left'}
        </Text>
        <Text variant="caption" tone="faint">
          {kcal(eaten)} / {kcal(target)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({ center: { alignItems: 'center', justifyContent: 'center' } });
