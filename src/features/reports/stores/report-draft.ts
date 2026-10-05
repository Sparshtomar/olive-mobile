import { create } from 'zustand';
import type { ReportFile } from '@/api';

interface ReportDraftState {
  file: ReportFile | null;
  start: (file: ReportFile) => void;
}

/** Hands the picked file from the upload sheet to the review screen. */
export const useReportDraft = create<ReportDraftState>((set) => ({
  file: null,
  start: (file) => set({ file }),
}));
