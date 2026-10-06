import type { DailyTargets, Nutrients } from '@sparshtomar/olive-shared';
import { View } from 'react-native';
import { ProgressBar, Text, space, useTheme } from '@/ui';

const MACROS = [
  { key: 'protein', label: 'Protein' },
  { key: 'carbs', label: 'Carbs' },
  { key: 'fat', label: 'Fat' },
] as const;

export const MacroBars = ({ totals, targets }: { totals: Nutrients; targets: DailyTargets }) => {
  const { colors } = useTheme();
  return (
    <View style={{ gap: space.md, flex: 1, minWidth: 160 }}>
      {MACROS.map(({ key, label }) => (
        <View
          key={key}
          style={{ gap: 6 }}
          accessible
          accessibilityLabel={`${label}: ${Math.round(totals[key])} of ${targets[key]} grams`}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="label">{label}</Text>
            <Text variant="caption" tone="muted">
              {Math.round(totals[key])} / {targets[key]} g
            </Text>
          </View>
          {/* Protein over target is good news, so it never turns warm. */}
          <ProgressBar
            value={totals[key] / targets[key]}
            color={colors[key]}
            overColor={key === 'protein' ? colors[key] : colors.warm}
          />
        </View>
      ))}
    </View>
  );
};
