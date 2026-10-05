import type { MealSlot } from '@sparshtomar/olive-shared';
import { create } from 'zustand';

interface LogSheetState {
  open: boolean;
  /** Pre-selected slot when opened from an empty "Add breakfast" row. */
  slot?: MealSlot;
  /** Logging for a past day picked on Today's date strip. */
  date?: string;
  /** Jump straight to typing (e.g. "Type it instead" after a failed photo). */
  startWithText?: boolean;
  show: (opts?: { slot?: MealSlot; date?: string; startWithText?: boolean }) => void;
  hide: () => void;
}

/** The log sheet opens from several places (tab bar, empty meal slots, desktop sidebar). */
export const useLogSheet = create<LogSheetState>((set) => ({
  open: false,
  show: (opts) => set({ open: true, slot: opts?.slot, date: opts?.date, startWithText: opts?.startWithText }),
  hide: () => set({ open: false }),
}));
