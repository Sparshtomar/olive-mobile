import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { radius, space, type ColorToken } from './theme';
import { useTheme } from './use-theme';

type Tone = 'neutral' | 'good' | 'warm' | 'danger';

const tones: Record<Tone, { bg: ColorToken; fg: ColorToken }> = {
  neutral: { bg: 'surfaceMuted', fg: 'textMuted' },
  good: { bg: 'primarySoft', fg: 'primary' },
  warm: { bg: 'warmSoft', fg: 'warm' },
  danger: { bg: 'dangerSoft', fg: 'danger' },
};

/** Small static status label. */
export const Pill = ({ label, tone = 'neutral' }: { label: string; tone?: Tone }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors[tones[tone].bg] }]}>
      <Text variant="labelSmall" style={{ color: colors[tones[tone].fg] }}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: { paddingHorizontal: space.sm, paddingVertical: 3, borderRadius: radius.pill, alignSelf: 'flex-start' },
});
