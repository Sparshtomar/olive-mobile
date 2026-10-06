import { forwardRef, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import { Text } from './Text';
import { radius, space } from './theme';
import { inputType } from './typography';
import { makeStyles, useTheme } from './use-theme';

export interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
  suffix?: string;
}

export const Field = forwardRef<TextInput, FieldProps>(
  ({ label, error, suffix, style, onFocus, onBlur, ...rest }, ref) => {
    const { colors } = useTheme();
    const styles = useStyles();
    const [focused, setFocused] = useState(false);
    return (
      <View style={{ gap: space.xs }}>
        {label ? (
          <Text variant="label" tone="muted">
            {label}
          </Text>
        ) : null}
        <View style={[styles.box, focused && styles.focused, !!error && styles.error]}>
          <TextInput
            ref={ref}
            placeholderTextColor={colors.textFaint}
            {...rest}
            accessibilityLabel={rest.accessibilityLabel ?? label}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            style={[styles.input, style]}
          />
          {suffix ? (
            <Text variant="bodyStrong" tone="muted">
              {suffix}
            </Text>
          ) : null}
        </View>
        {error ? (
          <Text variant="caption" tone="danger">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);
Field.displayName = 'Field';

const useStyles = makeStyles(({ colors }) => ({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    minHeight: 50,
  },
  focused: { borderColor: colors.primary },
  error: { borderColor: colors.danger },
  input: {
    flex: 1,
    ...inputType.body,
    color: colors.text,
    paddingVertical: space.md,
    // Removes the web focus ring; the border shows focus instead.
    outlineWidth: 0,
  },
}));
