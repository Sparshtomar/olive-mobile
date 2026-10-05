import type { DaySummary, Insight, Trends } from '@sparshtomar/olive-shared';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '@/lib/http';
import { qk } from './query-keys';

export const useDay = (date: string) =>
  useQuery({ queryKey: qk.day(date), queryFn: () => request<DaySummary>(`/days/${date}`) });

export const useTrends = (end: string) =>
  useQuery({ queryKey: qk.trends(end), queryFn: () => request<Trends>(`/trends?end=${end}&days=7`) });

export const useInsights = (today: string) =>
  useQuery({
    queryKey: qk.insights(today),
    queryFn: () => request<Insight[]>(`/insights?today=${today}`),
    staleTime: 5 * 60_000,
  });

/** Reads the last known streak from cache without fetching — for celebratory copy right after a save. */
export const useStreakSnapshot = () => {
  const client = useQueryClient();
  return (today: string) => client.getQueryData<Trends>(qk.trends(today))?.streak ?? 0;
};
