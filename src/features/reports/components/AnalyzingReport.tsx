import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Olive, Skeleton, Text, radius, space } from '@/ui';

const MESSAGES = [
  'Reading your report…',
  'Finding the test results…',
  'Matching markers Olive tracks…',
  'Almost there…',
];
const MESSAGE_INTERVAL_MS = 3500;

/** Progress copy that moves forward while extraction runs, so a long PDF doesn't look stuck. */
export const AnalyzingReport = () => {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => Math.min(n + 1, MESSAGES.length - 1)), MESSAGE_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);
  return (
    <View style={{ alignItems: 'center', gap: space.lg, paddingTop: space.xl }} accessibilityLiveRegion="polite">
      <Olive mood="curious" size={120} />
      <Animated.View key={i} entering={FadeIn} exiting={FadeOut}>
        <Text variant="heading">{MESSAGES[i]}</Text>
      </Animated.View>
      <Text tone="muted" align="center">
        Multi-page PDFs can take up to a minute.
      </Text>
      <View style={{ width: '100%', gap: space.sm }}>
        {[0, 1, 2, 3].map((n) => (
          <Skeleton key={n} height={58} rounded={radius.lg} />
        ))}
      </View>
    </View>
  );
};
