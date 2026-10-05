import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { colors, radius } from './theme';

export interface ProgressBarProps {
  /** 0..1+; values above 1 fill the bar and switch to the "over" colour. */
  value: number;
  color?: string;
  overColor?: string;
  height?: number;
  /** Draws a tick at this fraction (e.g. a "max" limit inside a longer scale). */
  marker?: number;
}

export const ProgressBar = ({
  value,
  color = colors.primary,
  overColor = colors.warm,
  height = 8,
  marker,
}: ProgressBarProps) => {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(Math.max(value, 0), 1), { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [value, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: value > 1 ? overColor : color, borderRadius: height }, fill]}
      />
      {marker !== undefined ? <View style={[styles.marker, { left: `${marker * 100}%` }]} /> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  track: { backgroundColor: colors.surfaceMuted, overflow: 'hidden', borderRadius: radius.pill },
  fill: { height: '100%' },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.text, opacity: 0.35 },
});
