import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/** Where a target sits on screen, in window coordinates. */
export interface TargetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface HintsState {
  /** Tour ids the user has finished or skipped. Persisted, so a tour runs once per install. */
  seen: Record<string, true>;
  /** Live positions of registered targets, by target id. Not persisted. */
  targets: Record<string, TargetRect>;
  /** The tour currently on screen, if any. Only one at a time. */
  active: string | null;
  hydrated: boolean;
  /** False while the splash plays; tours wait for it. Not persisted. */
  ready: boolean;
  setReady: () => void;
  setTarget: (id: string, rect: TargetRect | null) => void;
  start: (tourId: string) => void;
  finish: (tourId: string) => void;
  /** Forgets every tour, so they all play again (Settings-style "replay tips"). */
  reset: () => void;
}

export const useHints = create<HintsState>()(
  persist(
    (set, get) => ({
      seen: {},
      targets: {},
      active: null,
      hydrated: false,
      ready: false,
      setReady: () => set({ ready: true }),
      setTarget: (id, rect) =>
        set((s) => {
          const targets = { ...s.targets };
          if (rect) targets[id] = rect;
          else delete targets[id];
          return { targets };
        }),
      start: (tourId) => {
        if (get().active || get().seen[tourId]) return;
        set({ active: tourId });
      },
      finish: (tourId) =>
        set((s) => ({ active: s.active === tourId ? null : s.active, seen: { ...s.seen, [tourId]: true } })),
      reset: () => set({ seen: {}, active: null }),
    }),
    {
      name: 'olive.hints',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ seen: s.seen }),
      onRehydrateStorage: () => () => useHints.setState({ hydrated: true }),
    },
  ),
);
