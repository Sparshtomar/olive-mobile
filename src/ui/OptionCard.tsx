import { StyleSheet, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import type { LucideIcon } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { colors, radius, space } from './theme';

export interface OptionCardProps {
  title: string;
  hint?: string;
  icon?: LucideIcon;
  selected: boolean;
  onPress: () => void;
}

/** Large tappable choice with a title and explanation — for decisions that need context. */
export const OptionCard = ({ title, hint, icon: Icon, selected, onPress }: OptionCardProps) => (
  <PressableScale
    onPress={() => {
      haptics.tap();
      onPress();
    }}
    accessibilityRole="radio"
    accessibilityState={{ checked: selected }}
    accessibilityLabel={hint ? `${title}. ${hint}` : title}
    style={[styles.card, selected && styles.selected]}
  >
    {Icon ? (
      <View style={[styles.icon, selected && { backgroundColor: colors.primary }]}>
        <Icon size={20} color={selected ? colors.textOnPrimary : colors.primary} strokeWidth={2} />
      </View>
    ) : null}
    <View style={{ flex: 1 }}>
      <Text variant="bodyStrong">{title}</Text>
      {hint ? (
        <Text variant="caption" tone="muted">
          {hint}
        </Text>
      ) : null}
    </View>
    <View style={[styles.radio, selected && styles.radioOn]}>{selected ? <View style={styles.dot} /> : null}</View>
  </PressableScale>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.primary, backgroundColor: colors.primaryTint },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
