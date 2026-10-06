import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { radius, space } from './theme';
import { makeStyles } from './use-theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip = ({ label, selected, onPress }: ChipProps) => {
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected, checked: !!selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text variant="label" tone={selected ? 'inverse' : 'default'}>
        {label}
      </Text>
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  chip: {
    paddingHorizontal: space.md + 2,
    minHeight: 36,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
}));
