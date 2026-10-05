import type { CreateReportInput, MarkerTrend, Report, ReportDraft, ReportSummary } from '@sparshtomar/olive-shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appendFile, request } from '@/lib/http';
import { qk } from './query-keys';

export interface ReportFile {
  uri: string;
  name: string;
  mimeType: string;
}

export const analyzeReport = async (file: ReportFile): Promise<ReportDraft> => {
  const form = new FormData();
  await appendFile(form, 'file', { uri: file.uri, name: file.name, type: file.mimeType });
  // Multi-page PDFs can take a while to read.
  return request<ReportDraft>('/reports/analyze', { method: 'POST', form, timeoutMs: 120_000 });
};

export const useReports = () => useQuery({ queryKey: qk.reports, queryFn: () => request<ReportSummary[]>('/reports') });

export const useReport = (id: string) =>
  useQuery({ queryKey: qk.report(id), queryFn: () => request<Report>(`/reports/${id}`) });

export const useMarkers = () => useQuery({ queryKey: qk.markers, queryFn: () => request<MarkerTrend[]>('/markers') });

/** Reports change markers, which change nutrition focus on Today and insights. */
const useInvalidateHealth = () => {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: qk.reports }),
      client.invalidateQueries({ queryKey: qk.markers }),
      client.invalidateQueries({ queryKey: qk.days }),
      client.invalidateQueries({ queryKey: qk.allInsights }),
    ]);
};

export const useCreateReport = () => {
  const invalidate = useInvalidateHealth();
  return useMutation({
    mutationFn: (input: CreateReportInput) => request<Report>('/reports', { method: 'POST', body: input }),
    onSuccess: () => invalidate(),
  });
};

export const useDeleteReport = () => {
  const invalidate = useInvalidateHealth();
  return useMutation({
    mutationFn: (id: string) => request<void>(`/reports/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidate(),
  });
};
