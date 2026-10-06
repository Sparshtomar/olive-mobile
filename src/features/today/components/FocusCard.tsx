import { NUTRIENT_META, type FocusProgress } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { grams } from '@/lib/format';
import { Card, PressableScale, ProgressBar, Text, space, useTheme } from '@/ui';
import { FlaskConical } from '@/ui/icons';

/**
 * Where lab reports meet the plate: each out-of-range marker becomes a daily nutrient
 * budget ("max") or goal ("min") tracked against what was eaten.
 */
export const FocusCard = ({ focus }: { focus: FocusProgress[] }) => {
  const { colors } = useTheme();
  if (focus.length === 0) return null;
  return (
    <PressableScale
      onPress={() => router.navigate('/reports')}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityHint="Opens your health reports"
    >
      <Card style={styles.card}>
        <View style={styles.head}>
          <FlaskConical size={18} color={colors.primary} />
          <Text variant="overline" tone="primary">
            From your reports
          </Text>
        </View>
        {focus.map((f) => {
          const meta = NUTRIENT_META[f.nutrient];
          const ratio = f.amount > 0 ? f.consumed / f.amount : 0;
          const ok = f.kind === 'max' ? f.consumed <= f.amount : f.consumed >= f.amount;
          const because = f.reasons.map((r) => r.name).join(', ');
          return (
            <View
              key={f.nutrient}
              style={{ gap: 6 }}
              accessible
              accessibilityLabel={`${meta.label}: ${grams(f.consumed)} of ${f.kind === 'max' ? 'at most' : 'at least'} ${f.amount} ${meta.unit}, because of ${because}`}
            >
              <View style={styles.line}>
                <Text variant="bodyStrong">
                  {meta.label}{' '}
                  <Text variant="caption" tone="muted">
                    {f.kind === 'max' ? 'keep under' : 'aim for'} {f.amount} {meta.unit}
                  </Text>
                </Text>
                <Text
                  variant="label"
                  style={{ color: ok ? colors.primary : f.kind === 'max' ? colors.warm : colors.textMuted }}
                >
                  {grams(f.consumed)} {meta.unit}
                </Text>
              </View>
              <ProgressBar
                value={ratio}
                color={f.kind === 'max' ? colors.primary : colors.carbs}
                overColor={f.kind === 'max' ? colors.warm : colors.primary}
                height={6}
              />
              <Text variant="caption" tone="faint">
                for your {because}
              </Text>
            </View>
          );
        })}
      </Card>
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  card: { gap: space.md },
  head: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm },
});
