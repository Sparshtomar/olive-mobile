import type { QueryClient } from '@tanstack/react-query';

/** Single source of truth for cache keys, so invalidation can't drift from queries. */
export const qk = {
  me: ['me'] as const,
  day: (date: string) => ['day', date] as const,
  days: ['day'] as const,
  trends: (end: string) => ['trends', end] as const,
  allTrends: ['trends'] as const,
  insights: (today: string) => ['insights', today] as const,
  allInsights: ['insights'] as const,
  meal: (id: string) => ['meal', id] as const,
  reports: ['reports'] as const,
  report: (id: string) => ['report', id] as const,
  markers: ['markers'] as const,
};

/** Meals, goals and reports all feed the progress views, so any change refreshes them together. */
export const invalidateProgress = (client: QueryClient) =>
  Promise.all([
    client.invalidateQueries({ queryKey: qk.days }),
    client.invalidateQueries({ queryKey: qk.allTrends }),
    client.invalidateQueries({ queryKey: qk.allInsights }),
  ]);
