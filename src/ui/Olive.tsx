import { useEffect } from 'react';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { mascot } from './theme';
import { useTheme } from './use-theme';

export type OliveMood = 'happy' | 'proud' | 'sleepy' | 'curious' | 'concerned';

const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);

const MOUTH: Record<OliveMood, string> = {
  happy: 'M40 66 Q50 74 60 66',
  proud: 'M38 64 Q50 78 62 64 Z',
  sleepy: 'M45 68 Q50 70 55 68',
  curious: 'M46 68 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0',
  concerned: 'M41 70 Q45.5 66 50 69 Q54.5 72 59 68',
};

export interface OliveProps {
  mood?: OliveMood;
  size?: number;
  /** Gentle idle bob. Off for static contexts (lists, small badges). */
  animated?: boolean;
}

/**
 * Olive - a little sprout-bean who reacts to your day. Purely decorative, so it's
 * hidden from screen readers; the copy next to it carries the meaning.
 */
export const Olive = ({ mood = 'happy', size = 96, animated = true }: OliveProps) => {
  const { colors } = useTheme();
  const bob = useSharedValue(0);
  const blink = useSharedValue(1);

  useEffect(() => {
    if (!animated) return;
    bob.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true);
    blink.value = withRepeat(
      withSequence(withDelay(2600, withTiming(0.1, { duration: 90 })), withTiming(1, { duration: 120 })),
      -1,
    );
  }, [animated, bob, blink]);

  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -bob.value * 4 }] }));
  const eyeProps = useAnimatedProps(() => ({ ry: 5.5 * blink.value }));
  const eyesClosed = mood === 'sleepy';

  return (
    <Animated.View
      style={[{ width: size, height: size }, bodyStyle]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 100 100">
        {/* sprout */}
        <Path d="M50 22 C50 14 52 9 56 6" stroke={mascot.stem} strokeWidth={3} strokeLinecap="round" fill="none" />
        <Path d="M55 8 C62 2 72 4 74 9 C68 14 60 13 55 8 Z" fill={mascot.leaf} />
        <Path d="M50 16 C44 9 35 10 33 15 C39 20 46 19 50 16 Z" fill={mascot.leafLight} />
        {/* body */}
        <Path
          d="M50 20 C74 20 86 40 86 60 C86 80 70 92 50 92 C30 92 14 80 14 60 C14 40 26 20 50 20 Z"
          fill={mascot.body}
        />
        <Path
          d="M50 26 C68 26 78 42 78 58 C70 50 58 46 46 46 C36 46 26 49 22 54 C24 40 34 26 50 26 Z"
          fill={mascot.bodyHighlight}
          opacity={0.6}
        />
        {/* cheeks */}
        <Ellipse cx={30} cy={64} rx={6} ry={3.5} fill={mascot.cheek} opacity={0.55} />
        <Ellipse cx={70} cy={64} rx={6} ry={3.5} fill={mascot.cheek} opacity={0.55} />
        {/* eyes */}
        {eyesClosed ? (
          <G stroke={mascot.ink} strokeWidth={2.6} strokeLinecap="round" fill="none">
            <Path d="M33 55 Q38 59 43 55" />
            <Path d="M57 55 Q62 59 67 55" />
          </G>
        ) : (
          <G fill={mascot.ink}>
            <AnimatedEllipse cx={38} cy={55} rx={4.5} animatedProps={eyeProps} />
            <AnimatedEllipse cx={62} cy={55} rx={4.5} animatedProps={eyeProps} />
            <Circle cx={39.5} cy={53} r={1.4} fill={mascot.eyeGlint} />
            <Circle cx={63.5} cy={53} r={1.4} fill={mascot.eyeGlint} />
          </G>
        )}
        {mood === 'concerned' ? (
          <G stroke={mascot.ink} strokeWidth={2} strokeLinecap="round">
            <Path d="M32 45 L42 47" />
            <Path d="M68 45 L58 47" />
          </G>
        ) : null}
        {/* mouth */}
        <Path
          d={MOUTH[mood]}
          stroke={mascot.ink}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={mood === 'proud' ? mascot.mouth : 'none'}
        />
        {mood === 'proud' ? (
          <Path d="M84 22 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 Z" fill={mascot.sparkle} />
        ) : null}
        {mood === 'sleepy' ? (
          <Path
            d="M76 30 h7 l-7 8 h7"
            stroke={colors.textMuted}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
    </Animated.View>
  );
};
