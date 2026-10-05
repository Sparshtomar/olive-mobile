import { ACTIVITY_LABEL, ACTIVITY_LEVELS, PACES, type ActivityLevel, type GoalType } from '@sparshtomar/olive-shared';
import { View } from 'react-native';
import { Chip, OptionCard, Text, space } from '@/ui';
import { Scale, TrendingDown, TrendingUp } from '@/ui/icons';

export const ActivityPicker = ({
  value,
  onChange,
}: {
  value?: ActivityLevel;
  onChange: (v: ActivityLevel) => void;
}) => (
  <View style={{ gap: space.sm }} accessibilityRole="radiogroup" accessibilityLabel="Activity level">
    {ACTIVITY_LEVELS.map((level) => (
      <OptionCard
        key={level}
        title={ACTIVITY_LABEL[level].title}
        hint={ACTIVITY_LABEL[level].hint}
        selected={value === level}
        onPress={() => onChange(level)}
      />
    ))}
  </View>
);

const GOALS: { value: GoalType; title: string; hint: string; icon: typeof Scale }[] = [
  { value: 'lose', title: 'Lose weight', hint: 'A gentle, sustainable deficit', icon: TrendingDown },
  { value: 'maintain', title: 'Stay where I am', hint: 'Eat better without changing weight', icon: Scale },
  { value: 'gain', title: 'Gain weight', hint: 'Build up with a small surplus', icon: TrendingUp },
];

export interface GoalPickerProps {
  goalType?: GoalType;
  pace?: number;
  onChange: (goalType: GoalType, pace: number) => void;
}

/** Goal and pace move together: maintain has no pace, the others default to 0.5 kg/week. */
export const GoalPicker = ({ goalType, pace, onChange }: GoalPickerProps) => (
  <View style={{ gap: space.sm }}>
    <View style={{ gap: space.sm }} accessibilityRole="radiogroup" accessibilityLabel="Goal">
      {GOALS.map((g) => (
        <OptionCard
          key={g.value}
          title={g.title}
          hint={g.hint}
          icon={g.icon}
          selected={goalType === g.value}
          onPress={() => onChange(g.value, g.value === 'maintain' ? 0 : pace || 0.5)}
        />
      ))}
    </View>
    {goalType && goalType !== 'maintain' ? (
      <View style={{ gap: space.sm, marginTop: space.sm }}>
        <Text variant="label" tone="muted">
          How fast?
        </Text>
        <View style={{ flexDirection: 'row', gap: space.sm }} accessibilityRole="radiogroup" accessibilityLabel="Pace">
          {PACES.map((p) => (
            <Chip key={p} label={`${p} kg / week`} selected={pace === p} onPress={() => onChange(goalType, p)} />
          ))}
        </View>
      </View>
    ) : null}
  </View>
);
