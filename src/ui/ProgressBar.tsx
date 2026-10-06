import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { radius } from './theme';
import { makeStyles, useTheme } from './use-theme';

export interface ProgressBarProps {
  /** 0..1+; values above 1 fill the bar and switch to the "over" colour. */
  value: number;
  /** Defaults to the primary colour. */
  color?: string;
  /** Defaults to the warm colour. */
  overColor?: string;
  height?: number;
  /** Draws a tick at this fraction (e.g. a "max" limit inside a longer scale). */
  marker?: number;
}

export const ProgressBar = ({ value, color, overColor, height = 8, marker }: ProgressBarProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(Math.min(Math.max(value, 0), 1), { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [value, progress]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View style={[styles.track, { height, borderRadius: height }]}>
      <Animated.View
        style={[
          styles.fill,
          { backgroundColor: value > 1 ? (overColor ?? colors.warm) : (color ?? colors.primary), borderRadius: height },
          fill,
        ]}
      />
      {marker !== undefined ? <View style={[styles.marker, { left: `${marker * 100}%` }]} /> : null}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  track: { backgroundColor: colors.surfaceMuted, overflow: 'hidden', borderRadius: radius.pill },
  fill: { height: '100%' },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: colors.text, opacity: 0.35 },
}));
