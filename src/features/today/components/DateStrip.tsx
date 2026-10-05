import { fromDateKey, lastNDays, type TrendDay } from '@sparshtomar/olive-shared';
import { StyleSheet, View } from 'react-native';
import { relativeDay, todayKey, weekdayShort } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { PressableScale, Text, colors, radius, space } from '@/ui';

export interface DateStripProps {
  selected: string;
  onSelect: (date: string) => void;
  days?: TrendDay[];
}

/** The last 7 days, each with a dot showing how it went. */
export const DateStrip = ({ selected, onSelect, days }: DateStripProps) => {
  const today = todayKey();
  const byDate = new Map(days?.map((d) => [d.date, d]));
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {lastNDays(today, 7).map((date) => {
        const isSelected = date === selected;
        const d = byDate.get(date);
        const dot = !d?.logged ? null : d.calories > d.target * 1.1 ? colors.warm : colors.primary;
        return (
          <PressableScale
            key={date}
            onPress={() => {
              haptics.tap();
              onSelect(date);
            }}
            style={[styles.day, isSelected && styles.selected]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={`${relativeDay(date)}${d?.logged ? `, ${d.calories} calories` : ', nothing logged'}`}
          >
            <Text variant="caption" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textMuted }}>
              {date === today ? 'Today' : weekdayShort(date)}
            </Text>
            <Text variant="bodyStrong" style={{ color: isSelected ? colors.textOnPrimary : colors.text }}>
              {fromDateKey(date).getDate()}
            </Text>
            <View
              style={[
                styles.dot,
                { backgroundColor: dot ?? 'transparent' },
                isSelected && dot && { backgroundColor: colors.textOnPrimary },
              ]}
            />
          </PressableScale>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: space.xs, justifyContent: 'space-between' },
  day: { flex: 1, alignItems: 'center', paddingVertical: space.sm, borderRadius: radius.md, gap: 2, maxWidth: 64 },
  selected: { backgroundColor: colors.primary },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
