import type { DaySummary, MarkerTrend } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { View } from 'react-native';
import { PressableScale, Text, makeStyles, radius, space, useTheme } from '@/ui';
import { ChevronRight } from '@/ui/icons';
import { suggestionsFor } from '../lib/suggestions';
import { OliveOrb } from './OliveOrb';

/** Today's doorway into the chat: the orb breathing beside a question that fits this user's day. */
export const AskOliveCard = ({ markers, day }: { markers?: MarkerTrend[]; day?: DaySummary }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const prompt = suggestionsFor({ markers, day })[0]!;
  return (
    <PressableScale
      onPress={() => router.push({ pathname: '/chat/[id]', params: { id: 'new', q: prompt } })}
      scaleTo={0.985}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`Ask Olive: ${prompt}`}
      accessibilityHint="Opens a chat with Olive"
    >
      <OliveOrb size={48} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="subheading">Ask Olive</Text>
        <Text variant="caption" tone="muted" numberOfLines={2}>
          “{prompt}”
        </Text>
      </View>
      <ChevronRight size={20} color={colors.textMuted} />
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primarySoft,
  },
}));
