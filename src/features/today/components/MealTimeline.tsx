import { MEAL_SLOTS, MEAL_SLOT_LABEL, type Meal, type MealSlot } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { Image, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { mealPhotoUrl } from '@/api';
import { useLogSheet } from '@/features/meals';
import { kcal, time } from '@/lib/format';
import { PressableScale, Text, makeStyles, radius, space, useTheme } from '@/ui';
import { Camera, ChevronRight, Keyboard, Mic, Plus, type LucideIcon } from '@/ui/icons';

const SOURCE_ICON: Record<Meal['source'], LucideIcon> = { photo: Camera, voice: Mic, text: Keyboard };

/** The day by meal slot. Empty main meals invite logging; an empty snack slot stays out of the way. */
export const MealTimeline = ({ meals, date }: { meals: Meal[]; date: string }) => {
  const showLog = useLogSheet((s) => s.show);
  const styles = useStyles();
  return (
    <View style={{ gap: space.lg }}>
      {MEAL_SLOTS.map((slot) => {
        const inSlot = meals.filter((m) => m.slot === slot);
        if (inSlot.length === 0 && slot === 'snack') return null;
        const total = inSlot.reduce((s, m) => s + m.totals.calories, 0);
        return (
          <Animated.View key={slot} layout={LinearTransition} style={{ gap: space.sm }}>
            <View style={styles.slotHead}>
              <Text variant="overline" tone="muted">
                {MEAL_SLOT_LABEL[slot]}
              </Text>
              {total > 0 ? (
                <Text variant="caption" tone="muted">
                  {kcal(total)} kcal
                </Text>
              ) : null}
            </View>
            {inSlot.map((meal) => (
              <MealRow key={meal.id} meal={meal} />
            ))}
            {inSlot.length === 0 ? <AddRow slot={slot} onPress={() => showLog({ slot, date })} /> : null}
          </Animated.View>
        );
      })}
    </View>
  );
};

const MealRow = ({ meal }: { meal: Meal }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const Icon = SOURCE_ICON[meal.source];
  const photo = mealPhotoUrl(meal);
  return (
    <Animated.View entering={FadeIn}>
      <PressableScale
        onPress={() => router.push(`/meal/${meal.id}`)}
        style={styles.row}
        scaleTo={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${meal.title}, ${Math.round(meal.totals.calories)} calories, at ${time(meal.loggedAt)}`}
        accessibilityHint="Opens the meal to edit"
      >
        {photo ? (
          <Image source={{ uri: photo }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.iconThumb]}>
            <Icon size={20} color={colors.primary} />
          </View>
        )}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {meal.title}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {time(meal.loggedAt)} · P {Math.round(meal.totals.protein)} · C {Math.round(meal.totals.carbs)} · F{' '}
            {Math.round(meal.totals.fat)}
          </Text>
        </View>
        <Text variant="bodyStrong">{kcal(meal.totals.calories)}</Text>
        <ChevronRight size={18} color={colors.textFaint} />
      </PressableScale>
    </Animated.View>
  );
};

const AddRow = ({ slot, onPress }: { slot: MealSlot; onPress: () => void }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={onPress}
      style={styles.add}
      accessibilityRole="button"
      accessibilityLabel={`Log ${MEAL_SLOT_LABEL[slot].toLowerCase()}`}
    >
      <Plus size={18} color={colors.primary} />
      <Text variant="bodyStrong" tone="primary">
        Add {MEAL_SLOT_LABEL[slot].toLowerCase()}
      </Text>
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  slotHead: { flexDirection: 'row', justifyContent: 'space-between' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: space.sm,
    paddingRight: space.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 52, height: 52, borderRadius: radius.md, backgroundColor: colors.surfaceMuted },
  iconThumb: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderStrong,
  },
}));
