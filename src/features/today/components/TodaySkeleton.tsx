import { View } from 'react-native';
import { Skeleton, makeStyles, radius, space } from '@/ui';

/** The Today screen in grey: date strip, summary card, then meal rows — so nothing jumps when data lands. */
export const TodaySkeleton = () => {
  const styles = useStyles();
  return (
    <View style={{ gap: space.lg }}>
      <View style={styles.strip}>
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} height={68} rounded={radius.md} style={{ flex: 1, maxWidth: 64 }} />
        ))}
      </View>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Skeleton width={56} height={56} rounded={28} />
          <Skeleton width="60%" height={18} />
        </View>
        <Skeleton width={188} height={188} rounded={94} style={{ alignSelf: 'center' }} />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={8} rounded={4} />
        ))}
      </View>
      <Skeleton width="45%" height={22} />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} height={68} rounded={radius.lg} />
      ))}
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  strip: { flexDirection: 'row', gap: space.xs, justifyContent: 'space-between' },
  hero: {
    gap: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: space.md },
}));
