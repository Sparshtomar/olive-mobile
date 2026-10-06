import type { DaySummary } from '@sparshtomar/olive-shared';
import { useState } from 'react';
import { View } from 'react-native';
import { useMe, useDay, useInsights, useMarkers, useTrends } from '@/api';
import { AskOliveCard } from '@/features/chat';
import { GoalSheet } from '@/features/goal';
import { useLogSheet } from '@/features/meals';
import { describeError } from '@/lib/errors';
import { greeting, relativeDay, todayKey } from '@/lib/format';
import {
  Button,
  Card,
  IconButton,
  Olive,
  Screen,
  StateView,
  Text,
  TAB_BAR_CLEARANCE,
  makeStyles,
  radius,
  space,
  useLayout,
  useTheme,
  type OliveMood,
} from '@/ui';
import { Flame, Target } from '@/ui/icons';
import { CalorieRing } from '../components/CalorieRing';
import { DateStrip } from '../components/DateStrip';
import { FocusCard } from '../components/FocusCard';
import { InsightCards } from '../components/InsightCards';
import { MacroBars } from '../components/MacroBars';
import { MealTimeline } from '../components/MealTimeline';
import { TodaySkeleton } from '../components/TodaySkeleton';
import { WeekChart } from '../components/WeekChart';

/** Olive's face is a summary of the day you can read in half a second. */
const moodFor = (day: DaySummary, isToday: boolean): { mood: OliveMood; line: string } => {
  const ratio = day.totals.calories / day.targets.calories;
  if (day.meals.length === 0) {
    return isToday
      ? { mood: 'sleepy', line: "Nothing logged yet. What's first on the menu?" }
      : { mood: 'sleepy', line: 'Nothing was logged this day.' };
  }
  if (ratio > 1.15) return { mood: 'concerned', line: 'A heavier day. One day never undoes a good week.' };
  if (ratio >= 0.85)
    return { mood: 'proud', line: isToday ? 'Right on target. Lovely work.' : 'Landed right on target.' };
  return { mood: 'happy', line: isToday ? 'Good going - plenty of room left.' : 'Under target this day.' };
};

export const TodayScreen = () => {
  const today = todayKey();
  const [date, setDate] = useState(today);
  const [goalOpen, setGoalOpen] = useState(false);
  const { isWide } = useLayout();
  const { colors } = useTheme();
  const styles = useStyles();
  const me = useMe();
  const day = useDay(date);
  const trends = useTrends(today);
  const insights = useInsights(today);
  const markers = useMarkers();
  const showLog = useLogSheet((s) => s.show);

  const refresh = () => Promise.all([day.refetch(), trends.refetch(), insights.refetch()]);
  const isToday = date === today;
  const streak = trends.data?.streak ?? 0;

  const header = (
    <View style={styles.header}>
      <View style={{ flex: 1 }}>
        <Text variant="caption" tone="muted">
          {greeting()}
          {me.data?.isDemo ? ' · demo' : ''}
        </Text>
        <Text variant="title" accessibilityRole="header">
          {me.data?.name ?? ' '}
        </Text>
      </View>
      {streak > 0 ? (
        <View style={styles.streak} accessible accessibilityLabel={`${streak} day logging streak`}>
          <Flame size={16} color={colors.warm} fill={colors.warm} />
          <Text variant="label" tone="warm">
            {streak}
          </Text>
        </View>
      ) : null}
      {me.data ? <IconButton icon={Target} label="Edit your goal" onPress={() => setGoalOpen(true)} /> : null}
    </View>
  );

  if (!day.data) {
    return (
      <Screen bottomInset={TAB_BAR_CLEARANCE}>
        {header}
        {day.isError ? (
          <StateView
            art={<Olive mood="concerned" size={100} />}
            title={describeError(day.error).title}
            body={describeError(day.error).body}
            action={{ label: 'Try again', onPress: () => void day.refetch() }}
          />
        ) : (
          <TodaySkeleton />
        )}
      </Screen>
    );
  }

  const d = day.data;
  const { mood, line } = moodFor(d, isToday);

  const summary = (
    <Card style={styles.hero}>
      <View style={styles.heroTop}>
        <Olive mood={mood} size={56} />
        <Text variant="bodyStrong" style={{ flex: 1 }}>
          {line}
        </Text>
      </View>
      <View style={styles.heroBody}>
        <CalorieRing eaten={d.totals.calories} target={d.targets.calories} />
        <MacroBars totals={d.totals} targets={d.targets} />
      </View>
    </Card>
  );

  const meals = (
    <View style={{ gap: space.md }}>
      <View style={styles.sectionHead}>
        <Text variant="heading">{isToday ? "Today's meals" : relativeDay(date)}</Text>
        {!isToday ? <Button label="Back to today" variant="secondary" onPress={() => setDate(today)} /> : null}
      </View>
      <MealTimeline meals={d.meals} date={date} />
      {d.meals.length === 0 && isToday ? (
        <Button label="Log your first meal" size="lg" onPress={() => showLog({ date })} fullWidth />
      ) : null}
    </View>
  );

  const side = (
    <>
      <AskOliveCard markers={markers.data} day={d} />
      <FocusCard focus={d.focus} />
      {trends.data ? <WeekChart trends={trends.data} selected={date} /> : null}
      <InsightCards insights={insights.data} loading={insights.isLoading} />
    </>
  );

  return (
    <>
      <Screen onRefresh={refresh} refreshing={day.isRefetching} bottomInset={TAB_BAR_CLEARANCE}>
        {header}
        <DateStrip selected={date} onSelect={setDate} days={trends.data?.days} />
        {isWide ? (
          <View style={styles.columns}>
            <View style={styles.mainCol}>
              {summary}
              {meals}
            </View>
            <View style={styles.sideCol}>{side}</View>
          </View>
        ) : (
          <>
            {summary}
            <AskOliveCard markers={markers.data} day={d} />
            <FocusCard focus={d.focus} />
            {meals}
            {trends.data ? <WeekChart trends={trends.data} selected={date} /> : null}
            <InsightCards insights={insights.data} loading={insights.isLoading} />
          </>
        )}
      </Screen>
      {me.data ? <GoalSheet user={me.data} visible={goalOpen} onClose={() => setGoalOpen(false)} /> : null}
    </>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: space.md,
    height: 36,
    borderRadius: radius.pill,
  },
  hero: { gap: space.lg },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  heroBody: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: space.xl },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  columns: { flexDirection: 'row', gap: space.xl, alignItems: 'flex-start' },
  mainCol: { flex: 3, gap: space.lg },
  sideCol: { flex: 2, gap: space.lg },
}));
