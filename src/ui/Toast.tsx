import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { CheckCircle2, Info, TriangleAlert, type LucideIcon } from './icons';
import { Text } from './Text';
import { colors, radius, shadow, space } from './theme';

type ToastTone = 'success' | 'info' | 'error';

interface Toast {
  id: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

interface ToastStore {
  current: Toast | null;
  show: (t: Omit<Toast, 'id'>) => void;
  dismiss: () => void;
}

let nextId = 1;

const useToastStore = create<ToastStore>((set) => ({
  current: null,
  show: (t) => set({ current: { ...t, id: nextId++ } }),
  dismiss: () => set({ current: null }),
}));

/** Fire-and-forget feedback from anywhere (mutations, hooks) without prop drilling. */
export const toast = {
  success: (title: string, body?: string) => useToastStore.getState().show({ tone: 'success', title, body }),
  info: (title: string, body?: string) => useToastStore.getState().show({ tone: 'info', title, body }),
  error: (title: string, body?: string) => useToastStore.getState().show({ tone: 'error', title, body }),
};

const ICON: Record<ToastTone, { icon: LucideIcon; color: string }> = {
  success: { icon: CheckCircle2, color: colors.primary },
  info: { icon: Info, color: colors.fat },
  error: { icon: TriangleAlert, color: colors.danger },
};

export const ToastHost = () => {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(dismiss, current.tone === 'error' ? 5000 : 3200);
    return () => clearTimeout(timer);
  }, [current, dismiss]);

  if (!current) return null;
  const { icon: Icon, color } = ICON[current.tone];

  return (
    <View style={[styles.host, { top: insets.top + space.sm, pointerEvents: 'box-none' }]}>
      <Animated.View
        key={current.id}
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOutUp.duration(180)}
        style={styles.toast}
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
      >
        <Icon size={20} color={color} strokeWidth={2.2} />
        <View style={{ flex: 1 }}>
          <Text variant="bodyStrong">{current.title}</Text>
          {current.body ? (
            <Text variant="caption" tone="muted">
              {current.body}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 0, right: 0, alignItems: 'center', paddingHorizontal: space.lg, zIndex: 100 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
});
