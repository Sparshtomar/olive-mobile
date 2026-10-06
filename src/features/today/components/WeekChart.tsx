import type { Trends } from '@sparshtomar/olive-shared';
import { View } from 'react-native';
import { kcal, todayKey, weekdayShort } from '@/lib/format';
import { Card, Text, makeStyles, radius, space, useTheme } from '@/ui';

const CHART_HEIGHT = 120;

/** Seven bars against the target line: patterns at a glance, not a spreadsheet. */
export const WeekChart = ({ trends, selected }: { trends: Trends; selected: string }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const target = trends.days[0]?.target ?? 0;
  const max = Math.max(target * 1.3, ...trends.days.map((d) => d.calories));
  const logged = trends.days.filter((d) => d.logged && d.date !== todayKey());
  const avg = logged.length ? logged.reduce((s, d) => s + d.calories, 0) / logged.length : null;
  const targetY = CHART_HEIGHT - (target / max) * CHART_HEIGHT;

  return (
    <Card style={{ gap: space.md }}>
      <View style={styles.head}>
        <Text variant="subheading">This week</Text>
        {avg !== null ? (
          <Text variant="caption" tone="muted">
            avg {kcal(avg)} kcal · target {kcal(target)}
          </Text>
        ) : null}
      </View>
      <View
        style={styles.chart}
        accessible
        accessibilityLabel={trends.days
          .map((d) => `${weekdayShort(d.date)}: ${d.logged ? `${d.calories} calories` : 'not logged'}`)
          .join(', ')}
      >
        <View style={[styles.targetLine, { top: targetY }]} />
        {trends.days.map((d) => {
          const h = d.logged ? Math.max((d.calories / max) * CHART_HEIGHT, 4) : 4;
          const over = d.calories > d.target * 1.1;
          return (
            <View key={d.date} style={styles.col}>
              <View style={styles.barArea}>
                <View
                  style={[
                    styles.bar,
                    { height: h },
                    !d.logged && { backgroundColor: colors.surfaceMuted },
                    d.logged && { backgroundColor: over ? colors.warm : colors.primary },
                    d.date === selected && styles.barSelected,
                  ]}
                />
              </View>
              <Text variant="micro" tone={d.date === selected ? 'default' : 'faint'}>
                {weekdayShort(d.date).slice(0, 2)}
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chart: { flexDirection: 'row', gap: space.sm, position: 'relative' },
  targetLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 0,
    borderTopWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.textFaint,
  },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  barArea: { height: CHART_HEIGHT, width: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '70%', maxWidth: 28, borderRadius: radius.sm },
  barSelected: { borderWidth: 2, borderColor: colors.text },
}));
