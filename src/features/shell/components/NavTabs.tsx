import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { Text, alpha, makeStyles, radius, space, useTheme } from '@/ui';
import { Plus, type LucideIcon } from '@/ui/icons';

type TabProps = TabTriggerSlotProps & {
  icon?: LucideIcon;
  /** Something other than a line icon (the Ask tab's orb). Receives the focused state. */
  renderIcon?: (focused: boolean) => ReactNode;
  label: string;
};

/**
 * Bottom bar tab. The pressable itself is the rounded pill, so the press highlight and
 * the Android ripple are clipped to the same shape the eye sees - no square flash.
 */
export const BottomTab = forwardRef<View, TabProps>(({ icon: Icon, renderIcon, label, isFocused, ...props }, ref) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
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
      android_ripple={{ color: alpha(colors.text, 0.12), borderless: false, foreground: true }}
      style={({ pressed }) => [styles.tab, isFocused && styles.tabOn, pressed && styles.tabPressed]}
    >
      {renderIcon ? (
        renderIcon(!!isFocused)
      ) : Icon ? (
        <Icon size={22} color={isFocused ? colors.text : colors.textMuted} strokeWidth={isFocused ? 2.4 : 2} />
      ) : null}
      <Text variant="labelSmall" tone={isFocused ? 'default' : 'muted'}>
        {label}
      </Text>
    </Pressable>
  );
});
BottomTab.displayName = 'BottomTab';

/** The one action in the bar that is not a tab: logging a meal. Same shape as a tab, so the bar reads as one pill. */
export const BottomAction = ({ label, onPress }: { label: string; onPress: () => void }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{ color: alpha(colors.primary, 0.2), borderless: false, foreground: true }}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
    >
      <View style={styles.actionDisc}>
        <Plus size={18} color={colors.textOnPrimary} strokeWidth={2.8} />
      </View>
      <Text variant="labelSmall" tone="primary">
        Log
      </Text>
    </Pressable>
  );
};

export const SideTab = forwardRef<View, TabProps>(({ icon: Icon, renderIcon, label, isFocused, ...props }, ref) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <Pressable
      ref={ref}
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={[styles.sideTab, isFocused && styles.sideTabOn]}
    >
      {renderIcon ? (
        renderIcon(!!isFocused)
      ) : Icon ? (
        <Icon size={20} color={isFocused ? colors.text : colors.textMuted} strokeWidth={2.2} />
      ) : null}
      <Text variant="bodyStrong" tone={isFocused ? 'default' : 'muted'}>
        {label}
      </Text>
    </Pressable>
  );
});
SideTab.displayName = 'SideTab';

const useStyles = makeStyles(({ colors }) => ({
  tab: {
    width: 70,
    height: 56,
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabOn: { backgroundColor: alpha(colors.text, 0.09) },
  tabPressed: { opacity: 0.75, transform: [{ scale: 0.96 }] },
  actionDisc: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    borderRadius: radius.md,
  },
  sideTabOn: { backgroundColor: colors.surfaceMuted },
}));
