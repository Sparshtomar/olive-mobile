import type { Insight, InsightTone } from '@sparshtomar/olive-shared';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Skeleton, Text, colors, radius, space } from '@/ui';
import { Lightbulb, Sparkles, TrendingUp, type LucideIcon } from '@/ui/icons';

const TONE: Record<InsightTone, { icon: LucideIcon; bg: string; fg: string }> = {
  positive: { icon: Sparkles, bg: colors.primarySoft, fg: colors.primary },
  nudge: { icon: TrendingUp, bg: colors.warmSoft, fg: colors.warm },
  info: { icon: Lightbulb, bg: colors.infoSoft, fg: colors.fat },
};

export const InsightCards = ({ insights, loading }: { insights?: Insight[]; loading: boolean }) => {
  if (loading && !insights) {
    return (
      <View style={{ gap: space.sm }}>
        <Skeleton height={84} rounded={radius.lg} />
        <Skeleton height={84} rounded={radius.lg} />
      </View>
    );
  }
  if (!insights?.length) return null;
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="overline" tone="muted">
        Olive noticed
      </Text>
      {insights.map((insight, i) => {
        const { icon: Icon, bg, fg } = TONE[insight.tone];
        return (
          <Animated.View
            key={insight.id}
            entering={FadeInDown.delay(i * 80)}
            style={[styles.card, { backgroundColor: bg }]}
          >
            <View style={[styles.icon, { backgroundColor: 'rgba(255,255,255,0.7)' }]}>
              <Icon size={18} color={fg} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="bodyStrong">{insight.title}</Text>
              <Text variant="caption" style={{ color: colors.text, opacity: 0.8 }}>
                {insight.body}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: radius.lg },
  icon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
});
