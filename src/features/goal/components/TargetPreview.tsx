import { computeTargets, isAggressivePace, type ProfileInput } from '@sparshtomar/olive-shared';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { kcal } from '@/lib/format';
import { Card, PressableScale, Text, colors, space } from '@/ui';
import { ChevronDown, ChevronUp } from '@/ui/icons';

/** Live daily target with the math behind it, so the number is never a black box. */
export const TargetPreview = ({ profile }: { profile: ProfileInput }) => {
  const [open, setOpen] = useState(false);
  const t = computeTargets(profile);
  const aggressive = isAggressivePace(profile);
  const adjustmentLabel =
    t.breakdown.adjustment < 0
      ? 'Deficit for your goal'
      : t.breakdown.adjustment > 0
        ? 'Surplus for your goal'
        : 'Adjustment';

  return (
    <Card style={styles.card}>
      <Text variant="overline" tone="primary">
        Your daily target
      </Text>
      <View style={styles.row}>
        <Text variant="hero" accessibilityLabel={`${t.calories} calories a day`}>
          {kcal(t.calories)}
        </Text>
        <Text variant="bodyStrong" tone="muted" style={{ marginBottom: 8 }}>
          kcal / day
        </Text>
      </View>
      <View style={styles.macros}>
        <Macro label="Protein" value={t.protein} color={colors.protein} />
        <Macro label="Carbs" value={t.carbs} color={colors.carbs} />
        <Macro label="Fat" value={t.fat} color={colors.fat} />
      </View>

      {t.breakdown.clampedToMinimum ? (
        <Text variant="caption" tone="warm">
          Olive keeps you at a safe minimum of {kcal(t.calories)} kcal, so progress may be a little slower than the pace
          you picked.
        </Text>
      ) : aggressive ? (
        <Text variant="caption" tone="warm">
          That's a fast pace for your weight. A slower one is easier to stick with.
        </Text>
      ) : null}

      <PressableScale
        onPress={() => setOpen((o) => !o)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <Text variant="label" tone="primary">
          How Olive got this
        </Text>
        {open ? <ChevronUp size={16} color={colors.primary} /> : <ChevronDown size={16} color={colors.primary} />}
      </PressableScale>
      {open ? (
        <Animated.View entering={FadeIn} style={{ gap: 6 }}>
          <Line label="Energy at rest (Mifflin-St Jeor)" value={t.breakdown.bmr} />
          <Line label="With your daily activity" value={t.breakdown.tdee} />
          <Line label={adjustmentLabel} value={t.breakdown.adjustment} signed />
        </Animated.View>
      ) : null}
    </Card>
  );
};

const Macro = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={styles.macro}>
    <View style={[styles.dot, { backgroundColor: color }]} />
    <Text variant="caption" tone="muted">
      {label}
    </Text>
    <Text variant="bodyStrong">{value} g</Text>
  </View>
);

const Line = ({ label, value, signed }: { label: string; value: number; signed?: boolean }) => (
  <View style={styles.line}>
    <Text variant="caption" tone="muted" style={{ flex: 1 }}>
      {label}
    </Text>
    <Text variant="bodyStrong">
      {signed && value > 0 ? '+' : ''}
      {kcal(value)} kcal
    </Text>
  </View>
);

const styles = StyleSheet.create({
  card: { gap: space.sm, backgroundColor: colors.primaryTint, borderColor: colors.primarySoft },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  macros: { flexDirection: 'row', gap: space.lg, flexWrap: 'wrap' },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingVertical: 4 },
  line: { flexDirection: 'row', alignItems: 'center' },
});
