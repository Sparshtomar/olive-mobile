import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { radius, space } from './theme';
import { makeStyles } from './use-theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Outlined filter pill; selection brightens the border and text rather than filling it. */
export const Chip = ({ label, selected, onPress }: ChipProps) => {
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected, checked: !!selected }}
      style={[styles.chip, selected && styles.selected]}
    >
      <Text variant="label" tone={selected ? 'default' : 'muted'}>
        {label}
      </Text>
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  chip: {
    paddingHorizontal: space.lg,
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.surfaceMuted, borderColor: colors.text },
}));
