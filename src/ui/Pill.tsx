import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { colors, radius, space } from './theme';

type Tone = 'neutral' | 'good' | 'warm' | 'danger';

const tones: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.surfaceMuted, fg: colors.textMuted },
  good: { bg: colors.primarySoft, fg: colors.primary },
  warm: { bg: colors.warmSoft, fg: colors.warm },
  danger: { bg: colors.dangerSoft, fg: colors.danger },
};

/** Small static status label. */
export const Pill = ({ label, tone = 'neutral' }: { label: string; tone?: Tone }) => (
  <View style={[styles.pill, { backgroundColor: tones[tone].bg }]}>
    <Text variant="label" style={{ color: tones[tone].fg, fontSize: 11, lineHeight: 14 }}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  pill: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
});
