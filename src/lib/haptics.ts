import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';

/** Thin wrapper so call sites don't care about platform support. */
export const haptics = {
  tap: () => enabled && void Haptics.selectionAsync(),
  success: () => enabled && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => enabled && void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  impact: () => enabled && void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
};
