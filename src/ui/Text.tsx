import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { colors, type as typeScale } from './theme';

type Variant = keyof typeof typeScale;
type Tone = 'default' | 'muted' | 'faint' | 'primary' | 'warm' | 'danger' | 'inverse';

const toneColor: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  faint: colors.textFaint,
  primary: colors.primary,
  warm: colors.warm,
  danger: colors.danger,
  inverse: colors.textOnPrimary,
};

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
}

export const Text = ({ variant = 'body', tone = 'default', align, style, ...rest }: TextProps) => (
  <RNText {...rest} style={[typeScale[variant], { color: toneColor[tone] }, align && { textAlign: align }, style]} />
);
