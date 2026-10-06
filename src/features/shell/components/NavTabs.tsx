import type { TabTriggerSlotProps } from 'expo-router/ui';
import { forwardRef, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { Text, makeStyles, radius, space, useTheme } from '@/ui';
import type { LucideIcon } from '@/ui/icons';

type TabProps = TabTriggerSlotProps & {
  icon?: LucideIcon;
  /** Something other than a line icon (the Ask tab's orb). Receives the focused state. */
  renderIcon?: (focused: boolean) => ReactNode;
  label: string;
};

/** Bottom bar tab: the active one sits on a lighter pill. */
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
      style={styles.bottomTabHit}
    >
      <View style={[styles.bottomTab, isFocused && styles.bottomTabOn]}>
        {renderIcon ? (
          renderIcon(!!isFocused)
        ) : Icon ? (
          <Icon size={22} color={isFocused ? colors.text : colors.textMuted} strokeWidth={isFocused ? 2.4 : 2} />
        ) : null}
        <Text variant="labelSmall" tone={isFocused ? 'default' : 'muted'}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
});
BottomTab.displayName = 'BottomTab';

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
  bottomTabHit: { justifyContent: 'center' },
  bottomTab: {
    width: 76,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    borderRadius: radius.pill,
  },
  bottomTabOn: { backgroundColor: colors.surfaceRaised },
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
