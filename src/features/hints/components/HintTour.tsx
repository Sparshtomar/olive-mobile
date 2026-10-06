import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';
import { haptics } from '@/lib/haptics';
import { Button, Text, alpha, makeStyles, radius, space, useTheme } from '@/ui';
import { availableSteps, cardTopFor, placementFor, spotlightFor, type HintTour as Tour } from '../lib/steps';
import { useHints } from '../stores/hints';

const CARD_WIDTH = 320;
const CARD_HEIGHT_GUESS = 150;
const SPOTLIGHT_PAD = 8;
/** Lets the screen settle (data, skeletons, the splash) before pointing at things. */
const START_DELAY_MS = 900;

/**
 * Walks the user through a screen the first time they see it. Declare the tour as data
 * next to the screen and wrap each thing it points at in a HintTarget; this component
 * does the rest: waits for the screen to be focused and ready, skips steps whose target
 * did not render, spotlights the current target, and remembers that the tour was seen.
 */
export const HintTour = ({ tour }: { tour: Tour }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { active, targets, hydrated, ready, start, finish } = useHints();
  const [index, setIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(CARD_HEIGHT_GUESS);

  useFocusEffect(
    useCallback(() => {
      if (!hydrated || !ready) return;
      const timer = setTimeout(() => start(tour.id), START_DELAY_MS);
      return () => clearTimeout(timer);
    }, [hydrated, ready, start, tour.id]),
  );

  const isActive = active === tour.id;
  const steps = isActive ? availableSteps(tour, targets) : [];

  useEffect(() => {
    if (isActive) setIndex(0);
  }, [isActive]);

  // Nothing renderable (targets never appeared): don't nag, and don't show it again.
  useEffect(() => {
    if (isActive && steps.length === 0) finish(tour.id);
  }, [isActive, steps.length, finish, tour.id]);

  if (!isActive || steps.length === 0) return null;
  const step = steps[Math.min(index, steps.length - 1)]!;
  const rect = targets[step.target]!;
  const spot = spotlightFor(rect, SPOTLIGHT_PAD, W, H);
  const safe = { top: insets.top, bottom: insets.bottom };
  const placement = placementFor(spot, H, cardHeight, safe);
  const cardWidth = Math.min(CARD_WIDTH, W - space.lg * 2);
  const cardLeft = Math.min(Math.max(space.lg, spot.x + spot.width / 2 - cardWidth / 2), W - space.lg - cardWidth);
  const cardTop = cardTopFor(placement, spot, H, cardHeight, safe);
  const last = index >= steps.length - 1;

  const next = () => {
    haptics.tap();
    if (last) finish(tour.id);
    else setIndex((i) => i + 1);
  };
  const skip = () => finish(tour.id);

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={skip}>
      <Animated.View entering={FadeIn.duration(220)} exiting={FadeOut.duration(160)} style={StyleSheet.absoluteFill}>
        <Svg width={W} height={H} style={StyleSheet.absoluteFill}>
          <Defs>
            <Mask id="spotlight">
              <Rect width="100%" height="100%" fill="white" />
              <Rect x={spot.x} y={spot.y} width={spot.width} height={spot.height} rx={radius.lg} fill="black" />
            </Mask>
          </Defs>
          <Rect width="100%" height="100%" fill={alpha(colors.bg, 0.78)} mask="url(#spotlight)" />
          <Rect
            x={spot.x}
            y={spot.y}
            width={spot.width}
            height={spot.height}
            rx={radius.lg}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
          />
        </Svg>
        {/* Tapping anywhere outside the card advances, like a story. */}
        <Pressable style={StyleSheet.absoluteFill} onPress={next} accessibilityLabel="Next tip" />

        <Animated.View
          key={step.target}
          entering={FadeInDown.duration(240)}
          onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
          style={[styles.card, { width: cardWidth, left: cardLeft, top: cardTop }]}
          accessibilityLiveRegion="polite"
        >
          <View style={styles.dots}>
            {steps.map((s, i) => (
              <View key={s.target} style={[styles.dot, i === index && styles.dotOn]} />
            ))}
          </View>
          <Text variant="subheading">{step.title}</Text>
          <Text variant="caption" tone="muted">
            {step.body}
          </Text>
          <View style={styles.actions}>
            <Button label="Skip tips" variant="ghost" onPress={skip} />
            <Button label={last ? 'Got it' : 'Next'} onPress={next} />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const useStyles = makeStyles(({ colors, shadow }) => ({
  card: {
    position: 'absolute',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    gap: space.sm,
    ...shadow.floating,
  },
  dots: { flexDirection: 'row', gap: 5, marginBottom: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.borderStrong },
  dotOn: { backgroundColor: colors.primary, width: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.sm, marginTop: space.xs },
}));
