import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from './icons';
import { PressableScale } from './PressableScale';
import { Text } from './Text';
import { radius, space, type ColorToken } from './theme';
import { useTheme } from './use-theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variants: Record<Variant, { bg: ColorToken | 'transparent'; fg: ColorToken; border?: ColorToken }> = {
  primary: { bg: 'primary', fg: 'textOnPrimary' },
  secondary: { bg: 'primarySoft', fg: 'primary' },
  ghost: { bg: 'transparent', fg: 'text', border: 'borderStrong' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
};

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'md' | 'lg';
  icon?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityHint,
}: ButtonProps) => {
  const { colors } = useTheme();
  const v = variants[variant];
  const bg = v.bg === 'transparent' ? 'transparent' : colors[v.bg];
  const fg = colors[v.fg];
  const inactive = disabled || loading;
  return (
    <PressableScale
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: !!loading, disabled: !!inactive }}
      style={[
        styles.base,
        size === 'lg' ? styles.lg : styles.md,
        { backgroundColor: bg, borderColor: v.border ? colors[v.border] : bg },
        fullWidth && styles.full,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {Icon ? <Icon size={size === 'lg' ? 20 : 18} color={fg} strokeWidth={2.2} /> : null}
          <Text variant={size === 'lg' ? 'buttonLarge' : 'button'} style={{ color: fg }}>
            {label}
          </Text>
        </View>
      )}
    </PressableScale>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  md: { minHeight: 44, paddingHorizontal: space.lg },
  lg: { minHeight: 54, paddingHorizontal: space.xl },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.45 },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
