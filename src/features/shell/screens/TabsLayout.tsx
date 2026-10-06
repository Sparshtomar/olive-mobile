import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
            <TabTrigger name="reports" asChild>
              <SideTab icon={ClipboardList} label="Health reports" />
            </TabTrigger>
          </View>
          <Button label="Log a meal" icon={Plus} onPress={openLog} />
        </View>
      ) : null}

      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <TabSlot />
      </View>

      {!isWide ? (
        <View
          style={[styles.bottomWrap, { paddingBottom: Math.max(insets.bottom, space.md), pointerEvents: 'box-none' }]}
        >
          <View style={styles.bottomBar} accessibilityRole="tablist">
            <TabTrigger name="today" asChild>
              <BottomTab icon={Sun} label="Today" />
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
  bottomWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    width: 300,
    height: 68,
    paddingHorizontal: space.sm + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.floating,
  },
  fab: {
    position: 'absolute',
    top: -14,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.bg,
    ...shadow.floating,
  },
}));
