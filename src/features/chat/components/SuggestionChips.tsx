import { StyleSheet, View } from 'react-native';
import { PressableScale, Text, makeStyles, radius, space, useTheme } from '@/ui';
import { Sparkles } from '@/ui/icons';

/** Opening questions, grounded in the user's data where possible (see lib/suggestions). */
export const SuggestionChips = ({ suggestions, onPick }: { suggestions: string[]; onPick: (q: string) => void }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      {suggestions.map((q) => (
        <PressableScale
          key={q}
          onPress={() => onPick(q)}
          style={styles.chip}
          accessibilityRole="button"
          accessibilityLabel={q}
          accessibilityHint="Asks Olive this"
        >
          <Sparkles size={14} color={colors.primary} />
          <Text variant="label" style={StyleSheet.flatten({ flexShrink: 1 })}>
            {q}
          </Text>
        </PressableScale>
      ))}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  wrap: { gap: space.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));
