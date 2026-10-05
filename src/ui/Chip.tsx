import { StyleSheet } from 'react-native';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { colors, radius, space } from './theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export const Chip = ({ label, selected, onPress }: ChipProps) => (
  <PressableScale
    onPress={onPress}
    accessibilityRole="radio"
    accessibilityState={{ selected: !!selected, checked: !!selected }}
    style={[styles.chip, selected && styles.selected]}
  >
    <Text variant="label" style={{ color: selected ? colors.textOnPrimary : colors.text }}>
      {label}
    </Text>
  </PressableScale>
);

const styles = StyleSheet.create({
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
});
