import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

/** Mirrors React Query's online state so UI and queries never disagree. */
export const useIsOnline = () =>
  useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    () => onlineManager.isOnline(),
    () => true,
  );
