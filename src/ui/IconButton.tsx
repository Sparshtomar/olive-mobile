import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from './icons';
import { PressableScale } from './PressableScale';
import { radius } from './theme';
import { useTheme } from './use-theme';

export interface IconButtonProps {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
  tone?: 'default' | 'primary' | 'plain';
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const IconButton = ({
  icon: Icon,
  label,
  onPress,
  tone = 'default',
  size = 40,
  disabled,
  style,
}: IconButtonProps) => {
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      scaleTo={0.9}
      style={[
        styles.base,
        { width: size, height: size },
        tone === 'primary' && { backgroundColor: colors.primarySoft },
        tone === 'default' && { backgroundColor: colors.surfaceMuted },
        disabled && { opacity: 0.4 },
        style,
      ]}
    >
      <Icon size={size * 0.48} color={tone === 'primary' ? colors.primary : colors.text} strokeWidth={2} />
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
