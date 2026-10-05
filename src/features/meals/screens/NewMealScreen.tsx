import { MEAL_SLOT_LABEL, slotForTime } from '@sparshtomar/olive-shared';
import { useMutation } from '@tanstack/react-query';
import * as Crypto from 'expo-crypto';
import { Redirect, router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { analyzeMeal, useCreateMeal, useDay, useStreakSnapshot, type MealCapture } from '@/api';
import { describeError, errorMessage } from '@/lib/errors';
import { kcal, todayKey } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { makeThumbnail, prepareForAnalysis } from '@/lib/photos';
import { IconButton, Olive, Screen, StateView, Text, space, toast } from '@/ui';
import { ArrowLeft } from '@/ui/icons';
import { AnalyzingView } from '../components/AnalyzingView';
import { MealEditor, type MealValues } from '../components/MealEditor';
import { useLogSheet } from '../stores/log-sheet';
import { useMealDraft } from '../stores/meal-draft';

const runAnalysis = async (capture: MealCapture) =>
  capture.kind === 'photo'
    ? analyzeMeal({ ...capture, uri: await prepareForAnalysis(capture.uri) })
    : analyzeMeal(capture);

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

export const NewMealScreen = () => {
  const { capture, slot, date } = useMealDraft();
  const showLogSheet = useLogSheet((s) => s.show);
  const readStreak = useStreakSnapshot();
  const analysis = useMutation({ mutationFn: runAnalysis });
  const createMeal = useCreateMeal();
  const started = useRef(false);
  // One id per review session: a retried or double-tapped save can only create one meal.
  const clientId = useRef(Crypto.randomUUID());

  const day = date ?? todayKey();
  const dayQuery = useDay(day);

  useEffect(() => {
    if (capture && !started.current) {
      started.current = true;
      analysis.mutate(capture);
    }
  }, [capture, analysis]);

  // Reloaded on web, or opened without going through the log sheet.
  if (!capture) return <Redirect href="/" />;

  const save = async ({ title, slot: chosenSlot, items }: MealValues) => {
    const wasFirstToday = day === todayKey() && dayQuery.data?.meals.length === 0;
    const photoBase64 = capture.kind === 'photo' ? await makeThumbnail(capture.uri).catch(() => undefined) : undefined;

    createMeal.mutate(
      {
        clientId: clientId.current,
        date: day,
        slot: chosenSlot,
        source: capture.kind,
        title,
        loggedAt: new Date().toISOString(),
        items,
        photoBase64,
      },
      {
        onSuccess: (meal) => {
          haptics.success();
          const streak = readStreak(todayKey());
          if (wasFirstToday && streak > 0) {
            toast.success(
              `${streak + 1}-day streak 🔥`,
              `${MEAL_SLOT_LABEL[chosenSlot]} logged · ${kcal(meal.totals.calories)} kcal`,
            );
          } else {
            toast.success(
              `${MEAL_SLOT_LABEL[chosenSlot]} logged`,
              `${kcal(meal.totals.calories)} kcal added to ${day === todayKey() ? 'today' : 'that day'}`,
            );
          }
          goBack();
        },
        onError: (err) => toast.error("Couldn't save", errorMessage(err) ?? 'Please try again'),
      },
    );
  };

  if (analysis.isSuccess) {
    const draft = analysis.data;
    return (
      <MealEditor
        heading="Review your meal"
        date={day}
        initial={{ title: draft.title, slot: slot ?? slotForTime(new Date()), items: draft.items }}
        photoUri={capture.kind === 'photo' ? capture.uri : null}
        transcript={draft.transcript}
        saveLabel="Save"
        saving={createMeal.isPending}
        onSave={save}
      />
    );
  }

  const error = analysis.isError ? describeError(analysis.error) : null;

  return (
    <Screen maxWidth={640}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
        <Text variant="heading">{error ? 'Not quite' : 'Olive is thinking'}</Text>
      </View>
      {error ? (
        <StateView
          art={<Olive mood={error.mood} size={110} />}
          title={error.title}
          body={error.body}
          action={
            error.retryable
              ? { label: 'Try again', onPress: () => analysis.mutate(capture) }
              : {
                  label: capture.kind === 'photo' ? 'Retake photo' : 'Try again',
                  onPress: () => {
                    goBack();
                    showLogSheet({ slot: slot ?? undefined, date: day });
                  },
                }
          }
          secondaryAction={
            capture.kind !== 'text'
              ? {
                  label: 'Type it instead',
                  onPress: () => {
                    goBack();
                    showLogSheet({ slot: slot ?? undefined, date: day, startWithText: true });
                  },
                }
              : undefined
          }
        />
      ) : (
        <AnalyzingView capture={capture} />
      )}
    </Screen>
  );
};
