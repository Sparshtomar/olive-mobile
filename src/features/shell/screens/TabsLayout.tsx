import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OliveOrb } from '@/features/chat';
import { LogSheet, useLogSheet } from '@/features/meals';
import { haptics } from '@/lib/haptics';
import {
  Button,
  Olive,
  OfflineBanner,
  PressableScale,
  Text,
  makeStyles,
  radius,
  space,
  useLayout,
  useTheme,
} from '@/ui';
import { ClipboardList, Plus, Sun } from '@/ui/icons';
import { BottomTab, SideTab } from '../components/NavTabs';

/** The signed-in shell: floating tab bar + log button on phones, sidebar on wide screens. */
export const TabsLayout = () => {
  const { isWide } = useLayout();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const showLogSheet = useLogSheet((s) => s.show);

  const openLog = () => {
    haptics.impact();
    showLogSheet();
  };

  return (
    <Tabs style={{ flex: 1, flexDirection: isWide ? 'row' : 'column', backgroundColor: colors.bg }}>
      {/* Registers the routes (must be a direct child of Tabs); the visible buttons live in the bars below. */}
      <TabList style={{ display: 'none' }}>
        <TabTrigger name="today" href="/" />
        <TabTrigger name="ask" href="/ask" />
        <TabTrigger name="reports" href="/reports" />
      </TabList>

      {isWide ? (
        <View style={[styles.sidebar, { paddingTop: insets.top + space.xxl }]}>
          <View style={styles.brand}>
            <Olive size={40} animated={false} />
            <Text variant="heading">Olive</Text>
          </View>
          <View style={styles.sideList} accessibilityRole="tablist">
            <TabTrigger name="today" asChild>
              <SideTab icon={Sun} label="Today" />
            </TabTrigger>
            <TabTrigger name="ask" asChild>
              <SideTab renderIcon={(focused) => <OliveOrb size={24} active={focused} />} label="Ask Olive" />
            </TabTrigger>
            <TabTrigger name="reports" asChild>
              <SideTab icon={ClipboardList} label="Health reports" />
            </TabTrigger>
          </View>
          <Button label="Log a meal" icon={Plus} onPress={openLog} />
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <OfflineBanner />
        {/* expo-router sizes the slot with flexShrink: 0. On web that lets it grow to the content, so
            the ScrollView inside never has anything to scroll; let it shrink to the viewport instead. */}
        <TabSlot style={styles.slot} />
      </View>

      {!isWide ? (
        <View
          style={[styles.bottomWrap, { paddingBottom: Math.max(insets.bottom, space.md), pointerEvents: 'box-none' }]}
        >
          <View style={styles.bottomBar} accessibilityRole="tablist">
            <TabTrigger name="today" asChild>
              <BottomTab icon={Sun} label="Today" />
            </TabTrigger>
            <TabTrigger name="ask" asChild>
              <BottomTab renderIcon={(focused) => <OliveOrb size={26} active={focused} />} label="Ask" />
            </TabTrigger>
            <TabTrigger name="reports" asChild>
              <BottomTab icon={ClipboardList} label="Reports" />
            </TabTrigger>
          </View>
          <PressableScale
            onPress={openLog}
            style={styles.fab}
            scaleTo={0.92}
            accessibilityRole="button"
            accessibilityLabel="Log a meal"
          >
            <Plus size={28} color={colors.textOnPrimary} strokeWidth={2.6} />
          </PressableScale>
        </View>
      ) : null}

      <LogSheet />
    </Tabs>
  );
};

const useStyles = makeStyles(({ colors, shadow }) => ({
  slot: { flexShrink: 1, minHeight: 0 },
  sidebar: {
    width: 248,
    paddingHorizontal: space.xl,
    gap: space.xxl,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  sideList: { flexDirection: 'column', gap: space.xs },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: 264,
    height: 68,
    paddingHorizontal: space.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
}));
