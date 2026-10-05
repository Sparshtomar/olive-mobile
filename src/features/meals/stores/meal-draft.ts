import type { MealSlot } from '@sparshtomar/olive-shared';
import { create } from 'zustand';
import type { MealCapture } from '@/api';

interface MealDraftState {
  capture: MealCapture | null;
  slot: MealSlot | null;
  date: string | null;
  start: (capture: MealCapture, opts: { slot?: MealSlot; date?: string }) => void;
  clear: () => void;
}

/**
 * Hands a capture (photo/voice/text) from the log sheet to the review screen.
 * Files and long text don't belong in route params.
 */
export const useMealDraft = create<MealDraftState>((set) => ({
  capture: null,
  slot: null,
  date: null,
  start: (capture, { slot, date }) => set({ capture, slot: slot ?? null, date: date ?? null }),
  clear: () => set({ capture: null, slot: null, date: null }),
}));
