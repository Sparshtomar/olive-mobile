import type { DailyTargets, Nutrients } from '@sparshtomar/olive-shared';
import { View } from 'react-native';
import { ProgressBar, Text, colors, space } from '@/ui';

const MACROS = [
  { key: 'protein', label: 'Protein', color: colors.protein },
  { key: 'carbs', label: 'Carbs', color: colors.carbs },
  { key: 'fat', label: 'Fat', color: colors.fat },
] as const;

export const MacroBars = ({ totals, targets }: { totals: Nutrients; targets: DailyTargets }) => (
  <View style={{ gap: space.md, flex: 1, minWidth: 160 }}>
    {MACROS.map(({ key, label, color }) => (
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
          color={color}
          overColor={key === 'protein' ? color : colors.warm}
        />
      </View>
    ))}
  </View>
);
