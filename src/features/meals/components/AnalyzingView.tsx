import { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { MealCapture } from '@/api';
import { Olive, Skeleton, Text, makeStyles, media, radius, space } from '@/ui';

const MESSAGES: Record<MealCapture['kind'], string[]> = {
  photo: ['Looking at your plate…', 'Spotting each dish…', 'Estimating portions…', 'Checking for hidden ghee…'],
  voice: ['Listening back…', 'Picking out the foods…', 'Estimating portions…'],
  text: ['Reading that…', 'Estimating portions…', 'Adding it up…'],
};

/** Keeps the 3–8 s of analysis feeling alive: a scanning line, rotating copy, and the shape of what's coming. */
export const AnalyzingView = ({ capture }: { capture: MealCapture }) => {
  const styles = useStyles();
  const [index, setIndex] = useState(0);
  const messages = MESSAGES[capture.kind];
  const scan = useSharedValue(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1800);
    return () => clearInterval(timer);
  }, [messages.length]);

  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [scan]);

  const lineStyle = useAnimatedStyle(() => ({ top: `${scan.value * 96}%` }));

  return (
    <View style={styles.wrap} accessibilityLiveRegion="polite" accessibilityLabel={messages[index]}>
      {capture.kind === 'photo' ? (
        <View style={styles.photoWrap}>
          <Image source={{ uri: capture.uri }} style={styles.photo} />
          <View style={styles.tint} />
          <Animated.View style={[styles.scanLine, lineStyle]} />
        </View>
      ) : (
        <View style={styles.olive}>
          <Olive mood="curious" size={120} />
        </View>
      )}

      <View style={styles.copy}>
        {capture.kind === 'photo' ? <Olive mood="curious" size={48} /> : null}
        <Animated.View key={index} entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)}>
          <Text variant="heading">{messages[index]}</Text>
        </Animated.View>
      </View>
      {capture.kind === 'text' ? (
        <Text tone="muted" align="center">
          "{capture.text}"
        </Text>
      ) : null}

      <View style={{ gap: space.sm, width: '100%' }}>
        {[0.7, 0.55, 0.62].map((w, i) => (
          <View key={i} style={styles.skeletonRow}>
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width={`${w * 100}%`} height={16} />
              <Skeleton width="40%" height={12} />
            </View>
            <Skeleton width={56} height={22} />
          </View>
        ))}
      </View>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  wrap: { gap: space.xl, alignItems: 'center' },
  photoWrap: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  tint: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: media.tint },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: media.scanLine,
    shadowColor: media.glow,
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 4,
  },
  olive: { paddingTop: space.xxl },
  copy: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));
