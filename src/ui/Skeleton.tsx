import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { alpha, radius } from './theme';
import { useTheme } from './use-theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

const SWEEP_MS = 1400;

/** Placeholder with a light sweep while content loads — shaped like what's coming. */
export const Skeleton = ({ width = '100%', height = 16, rounded = radius.sm, style }: SkeletonProps) => {
  const { colors } = useTheme();
  const [measured, setMeasured] = useState(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: SWEEP_MS, easing: Easing.inOut(Easing.quad) }), -1);
  }, [progress]);

  // The highlight is as wide as the block and travels from fully off the left edge to off the right.
  const sweep = useAnimatedStyle(() => ({ transform: [{ translateX: (progress.value * 2 - 1) * measured }] }));

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setMeasured(e.nativeEvent.layout.width)}
      style={[styles.block, { width, height, borderRadius: rounded, backgroundColor: colors.surfaceMuted }, style]}
    >
      {measured > 0 ? (
        <Animated.View style={[StyleSheet.absoluteFill, sweep]}>
          <LinearGradient
            colors={[alpha(colors.surfaceRaised, 0), colors.surfaceRaised, alpha(colors.surfaceRaised, 0)]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({ block: { overflow: 'hidden' } });
