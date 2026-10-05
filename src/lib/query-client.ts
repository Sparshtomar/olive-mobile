import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { MutationCache, QueryCache, QueryClient, onlineManager } from '@tanstack/react-query';
import { ApiError } from './api-error';
import { useSession } from './session';

// Let React Query pause/resume with real connectivity instead of failing offline.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(state.isConnected !== false)),
);

/** The server no longer knows this device (e.g. data was wiped): start onboarding again. */
const handleUnknownUser = (error: unknown) => {
  if (error instanceof ApiError && error.code === 'UNKNOWN_USER') {
    queryClient.clear();
    useSession.getState().signOut();
  }
};

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: handleUnknownUser }),
  mutationCache: new MutationCache({ onError: handleUnknownUser }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Cached data is shown instantly (and offline); keep it around for a week.
      gcTime: 7 * 24 * 60 * 60 * 1000,
      retry: (count, error) => error instanceof ApiError && error.isTransient && count < 2,
    },
    mutations: { retry: false },
  },
});

export const queryPersister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'olive.query-cache' });

/** Bump when cached response shapes change so stale caches are dropped. */
export const CACHE_BUSTER = 'v1';
