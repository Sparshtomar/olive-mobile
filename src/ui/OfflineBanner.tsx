import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsOnline } from '@/lib/network';
import { WifiOff } from './icons';
import { Text } from './Text';
import { colors, space } from './theme';

/** Shown while offline: cached data stays readable; logging waits for a connection. */
export const OfflineBanner = () => {
  const online = useIsOnline();
  const insets = useSafeAreaInsets();
  if (online) return null;
  return (
    <Animated.View
      entering={FadeInUp}
      exiting={FadeOutUp}
      style={[styles.banner, { paddingTop: insets.top + space.sm }]}
    >
      <View style={styles.row} accessibilityRole="alert">
        <WifiOff size={16} color={colors.text} />
        <Text variant="caption">You're offline — showing your saved data.</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: { backgroundColor: colors.warmSoft, paddingBottom: space.sm, paddingHorizontal: space.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, justifyContent: 'center' },
});
