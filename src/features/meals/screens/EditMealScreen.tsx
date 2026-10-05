import { MEAL_SLOT_LABEL } from '@sparshtomar/olive-shared';
import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { mealPhotoUrl, useDeleteMeal, useMeal, useUpdateMeal } from '@/api';
import { describeError, errorMessage, isNotFound } from '@/lib/errors';
import { relativeDay, time } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { IconButton, Olive, Screen, Skeleton, StateView, space, toast } from '@/ui';
import { ArrowLeft } from '@/ui/icons';
import { MealEditor } from '../components/MealEditor';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export const EditMealScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const meal = useMeal(id);
  const update = useUpdateMeal(id);
  const remove = useDeleteMeal();

  if (!meal.data) {
    const error = meal.isError ? describeError(meal.error) : null;
    return (
      <Screen maxWidth={720}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
        </View>
        {error ? (
          <StateView
            art={<Olive mood="concerned" size={100} />}
            title={isNotFound(meal.error) ? 'This meal is gone' : error.title}
            body={isNotFound(meal.error) ? 'It may have been deleted.' : error.body}
            action={{ label: 'Back to today', onPress: goBack }}
          />
        ) : (
          <View style={{ gap: space.md }}>
            <Skeleton height={32} width="60%" />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </View>
        )}
      </Screen>
    );
  }

  const m = meal.data;
  return (
    <MealEditor
      heading={`${MEAL_SLOT_LABEL[m.slot]} · ${relativeDay(m.date)}, ${time(m.loggedAt)}`}
      date={m.date}
      initial={{ title: m.title, slot: m.slot, items: m.items }}
      photoUri={mealPhotoUrl(m)}
      saveLabel="Save changes"
      saving={update.isPending}
      alreadyCounted={m.totals.calories}
      onSave={(values) =>
        update.mutate(
          {
            title: values.title,
            slot: values.slot,
            items: values.items.map(({ name, portion, grams, quantity, nutrients, confidence }) => ({
              name,
              portion,
              grams,
              quantity,
              nutrients,
              confidence,
            })),
          },
          {
            onSuccess: () => {
              haptics.success();
              toast.success('Meal updated');
              goBack();
            },
            onError: (err) => toast.error("Couldn't save changes", errorMessage(err)),
          },
        )
      }
      deleting={remove.isPending}
      onDelete={() =>
        remove.mutate(m, {
          onSuccess: () => {
            haptics.success();
            toast.info('Meal deleted');
            goBack();
          },
          onError: (err) => toast.error("Couldn't delete", errorMessage(err)),
        })
      }
    />
  );
};
