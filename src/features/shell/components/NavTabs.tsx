import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef } from 'react';
import { Pressable, StyleSheet, type View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { Text, colors, radius, space } from '@/ui';
import type { LucideIcon } from '@/ui/icons';

type TabProps = TabTriggerSlotProps & { icon: LucideIcon; label: string };

export const BottomTab = forwardRef<View, TabProps>(({ icon: Icon, label, isFocused, ...props }, ref) => (
  <Pressable
    ref={ref}
    {...props}
    onPress={(e) => {
      haptics.tap();
      props.onPress?.(e);
    }}
    accessibilityRole="tab"
    accessibilityState={{ selected: !!isFocused }}
    accessibilityLabel={label}
    style={styles.bottomTab}
  >
    <Icon size={22} color={isFocused ? colors.primary : colors.textFaint} strokeWidth={isFocused ? 2.4 : 2} />
    <Text variant="label" style={{ fontSize: 11, color: isFocused ? colors.primary : colors.textFaint }}>
      {label}
    </Text>
  </Pressable>
));
BottomTab.displayName = 'BottomTab';

export const SideTab = forwardRef<View, TabProps>(({ icon: Icon, label, isFocused, ...props }, ref) => (
  <Pressable
    ref={ref}
    {...props}
    accessibilityRole="tab"
    accessibilityState={{ selected: !!isFocused }}
    style={[styles.sideTab, isFocused && styles.sideTabOn]}
  >
    <Icon size={20} color={isFocused ? colors.primary : colors.textMuted} strokeWidth={2.2} />
    <Text variant="bodyStrong" style={{ color: isFocused ? colors.primary : colors.textMuted }}>
      {label}
    </Text>
  </Pressable>
));
SideTab.displayName = 'SideTab';

const styles = StyleSheet.create({
  bottomTab: { width: 72, alignItems: 'center', justifyContent: 'center', gap: 2 },
  sideTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  sideTabOn: { backgroundColor: colors.surface },
});
