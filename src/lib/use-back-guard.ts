import { useEffect } from 'react';
import { BackHandler } from 'react-native';

/**
 * Intercepts Android's hardware back while `active` (e.g. unsaved edits) so the
 * screen can ask before discarding. iOS swipe-back is disabled on these screens.
 */
export const useBackGuard = (active: boolean, onAttempt: () => void) => {
  useEffect(() => {
    if (!active) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onAttempt();
      return true;
    });
    return () => sub.remove();
  }, [active, onAttempt]);
};
