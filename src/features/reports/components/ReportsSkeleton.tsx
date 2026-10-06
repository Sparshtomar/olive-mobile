import { StyleSheet, View } from 'react-native';
import { Skeleton, radius, space } from '@/ui';

/** The Reports screen in grey: a 2-up marker grid, then report rows. */
export const ReportsSkeleton = () => (
  <View style={{ gap: space.lg }}>
    <Skeleton width="40%" height={22} />
    <View style={styles.grid}>
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} height={116} rounded={radius.lg} style={styles.cell} />
      ))}
    </View>
    <Skeleton width="30%" height={22} />
    <Skeleton height={132} rounded={radius.lg} />
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  cell: { flexGrow: 1, flexBasis: '46%' },
});
