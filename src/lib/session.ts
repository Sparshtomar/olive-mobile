import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SessionState {
  userId: string | null;
  /** False until persisted state has loaded — avoids flashing onboarding on cold start. */
  hydrated: boolean;
  signIn: (userId: string) => void;
  signOut: () => void;
}

/** The device's identity. Persisted so data survives app restarts (no login by design). */
export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      userId: null,
      hydrated: false,
      signIn: (userId) => set({ userId }),
      signOut: () => set({ userId: null }),
    }),
    {
      name: 'olive.session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ userId: s.userId }),
      onRehydrateStorage: () => () => useSession.setState({ hydrated: true }),
    },
  ),
);
