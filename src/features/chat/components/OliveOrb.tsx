import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Olive, alpha, useTheme } from '@/ui';

export interface OliveOrbProps {
  /** Diameter of the orb. The mascot sits inside at ~70%. */
  size?: number;
  /** Breathing glow. Off for static contexts. */
  animated?: boolean;
  /** Brighter ring, for the active tab. */
  active?: boolean;
}

/**
 * Olive as an "AI presence": the mascot on a soft primary disc with a glow that
 * breathes. The entry point to Ask Olive wherever it appears - tab bar, Today, chat.
 */
export const OliveOrb = ({ size = 40, animated = true, active = false }: OliveOrbProps) => {
  const { colors } = useTheme();
  const reduceMotion = useReducedMotion();
  const breath = useSharedValue(0);

  useEffect(() => {
    if (!animated || reduceMotion) return;
    breath.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [animated, reduceMotion, breath]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: (active ? 0.55 : 0.3) + breath.value * 0.3,
    transform: [{ scale: 1 + breath.value * 0.18 }],
  }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: alpha(colors.primary, 0.45) },
          glowStyle,
        ]}
      />
      <View
        style={[
          styles.disc,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primarySoft,
            borderColor: active ? colors.primary : alpha(colors.primary, 0.35),
          },
        ]}
      >
        <Olive size={size * 0.72} animated={false} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  glow: { position: 'absolute' },
  disc: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, overflow: 'hidden' },
});
