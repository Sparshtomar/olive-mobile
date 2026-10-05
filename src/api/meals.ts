import type { CreateMealInput, DaySummary, Meal, MealDraft, UpdateMealInput } from '@sparshtomar/olive-shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiUrl, appendFile, request } from '@/lib/http';
import { invalidateProgress, qk } from './query-keys';

/** Analysis can take a while on a cold model or slow network. */
const ANALYZE_TIMEOUT = 60_000;

export type MealCapture =
  | { kind: 'photo'; uri: string; caption?: string }
  | { kind: 'voice'; uri: string; mimeType: string }
  | { kind: 'text'; text: string };

export const analyzeMeal = async (capture: MealCapture): Promise<MealDraft> => {
  if (capture.kind === 'text') {
    return request<MealDraft>('/meals/analyze/text', {
      method: 'POST',
      body: { text: capture.text },
      timeoutMs: ANALYZE_TIMEOUT,
    });
  }
  const form = new FormData();
  if (capture.kind === 'photo') {
    if (capture.caption) form.append('caption', capture.caption);
    await appendFile(form, 'file', { uri: capture.uri, name: 'meal.jpg', type: 'image/jpeg' });
    return request<MealDraft>('/meals/analyze/photo', { method: 'POST', form, timeoutMs: ANALYZE_TIMEOUT });
  }
  const ext = capture.mimeType.includes('webm') ? 'webm' : 'm4a';
  await appendFile(form, 'file', { uri: capture.uri, name: `voice.${ext}`, type: capture.mimeType });
  return request<MealDraft>('/meals/analyze/voice', { method: 'POST', form, timeoutMs: ANALYZE_TIMEOUT });
};

/** Absolute URL of a meal's stored photo (the API returns it as a relative path). */
export const mealPhotoUrl = (meal: Pick<Meal, 'photoUrl'>) => (meal.photoUrl ? apiUrl(meal.photoUrl) : null);

export const useMeal = (id: string) =>
  useQuery({ queryKey: qk.meal(id), queryFn: () => request<Meal>(`/meals/${id}`) });

export const useCreateMeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateMealInput) => request<Meal>('/meals', { method: 'POST', body: input, timeoutMs: 30_000 }),
    onSuccess: () => invalidateProgress(client),
  });
};

export const useUpdateMeal = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateMealInput) => request<Meal>(`/meals/${id}`, { method: 'PATCH', body: patch }),
    onSuccess: (meal) => {
      client.setQueryData(qk.meal(id), meal);
      return invalidateProgress(client);
    },
  });
};

export const useDeleteMeal = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (meal: Meal) => request<void>(`/meals/${meal.id}`, { method: 'DELETE' }),
    // Remove it from the day immediately; roll back if the server says no.
    onMutate: async (meal) => {
      await client.cancelQueries({ queryKey: qk.day(meal.date) });
      const previous = client.getQueryData<DaySummary>(qk.day(meal.date));
      if (previous) {
        client.setQueryData<DaySummary>(qk.day(meal.date), {
          ...previous,
          meals: previous.meals.filter((m) => m.id !== meal.id),
        });
      }
      return { previous };
    },
    onError: (_err, meal, context) => {
      if (context?.previous) client.setQueryData(qk.day(meal.date), context.previous);
    },
    onSettled: () => invalidateProgress(client),
  });
};
