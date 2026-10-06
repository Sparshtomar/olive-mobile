import { Text as RNText, type TextProps as RNTextProps } from 'react-native';
import type { ColorToken } from './theme';
import { type as typeScale, type TypeVariant } from './typography';
import { useTheme } from './use-theme';

type Tone = 'default' | 'muted' | 'faint' | 'primary' | 'warm' | 'danger' | 'inverse';

const toneColor: Record<Tone, ColorToken> = {
  default: 'text',
  muted: 'textMuted',
  faint: 'textFaint',
  primary: 'primary',
  warm: 'warm',
  danger: 'danger',
  inverse: 'textOnPrimary',
};

export interface TextProps extends RNTextProps {
  variant?: TypeVariant;
  tone?: Tone;
  align?: 'left' | 'center' | 'right';
}

export const Text = ({ variant = 'body', tone = 'default', align, style, ...rest }: TextProps) => {
  const { colors } = useTheme();
  return (
    <RNText
      {...rest}
      style={[typeScale[variant], { color: colors[toneColor[tone]] }, align && { textAlign: align }, style]}
    />
  );
};
