import { LinearGradient } from 'expo-linear-gradient';
import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { OliveOrb } from '@/features/chat';
import { HintTarget } from '@/features/hints';
import { LogSheet, useLogSheet } from '@/features/meals';
import { haptics } from '@/lib/haptics';
import { Button, Olive, OfflineBanner, Text, alpha, makeStyles, space, useLayout, useTheme } from '@/ui';
import { ClipboardList, Plus, Sun } from '@/ui/icons';
import { GlassPill } from '../components/GlassPill';
import { BottomAction, BottomTab, SideTab } from '../components/NavTabs';

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
        <View style={[styles.bottomWrap, { paddingBottom: insets.bottom + space.md, pointerEvents: 'box-none' }]}>
          {/* Content fades out under the bar instead of showing through it. */}
          <LinearGradient
            colors={[alpha(colors.bg, 0), alpha(colors.bg, 0.9), colors.bg]}
            locations={[0, 0.55, 1]}
            style={styles.scrim}
            pointerEvents="none"
          />
          <GlassPill>
            <View style={styles.bottomItems} accessibilityRole="tablist">
              <TabTrigger name="today" asChild>
                <BottomTab icon={Sun} label="Today" />
              </TabTrigger>
              <HintTarget id="nav.log">
                <BottomAction label="Log a meal" onPress={openLog} />
              </HintTarget>
              <HintTarget id="nav.ask">
                <TabTrigger name="ask" asChild>
                  <BottomTab renderIcon={(focused) => <OliveOrb size={26} active={focused} />} label="Ask" />
                </TabTrigger>
              </HintTarget>
              <TabTrigger name="reports" asChild>
                <BottomTab icon={ClipboardList} label="Reports" />
              </TabTrigger>
            </View>
          </GlassPill>
        </View>
      ) : null}

      <LogSheet />
    </Tabs>
  );
};

const useStyles = makeStyles(({ colors }) => ({
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
  bottomWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, alignItems: 'center' },
  scrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 150 },
  bottomItems: { flexDirection: 'row', alignItems: 'center', padding: space.xs, gap: 2 },
}));
