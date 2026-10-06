import { MARKER_CATALOG, NUTRIENT_META, formatRange, type MarkerKey } from '@sparshtomar/olive-shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useMarkers } from '@/api';
import { longDate } from '@/lib/format';
import {
  Card,
  IconButton,
  ListGroup,
  ListRow,
  Olive,
  Pill,
  Screen,
  SectionHeader,
  Skeleton,
  StateView,
  Text,
  makeStyles,
  radius,
  space,
  useTheme,
} from '@/ui';
import { ArrowLeft, Lightbulb, TrendingDown, TrendingUp } from '@/ui/icons';
import { TrendChart } from '../components/TrendChart';
import { STATUS_LABEL, statusTone } from '../lib/status';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/reports'));

export const MarkerScreen = () => {
  const { key } = useLocalSearchParams<{ key: MarkerKey }>();
  const markers = useMarkers();
  const { colors } = useTheme();
  const styles = useStyles();
  const [chartWidth, setChartWidth] = useState(0);
  const trend = markers.data?.find((m) => m.key === key);
  const def = MARKER_CATALOG[key];

  const header = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
      <Text variant="heading">{def?.name ?? 'Marker'}</Text>
    </View>
  );

  if (!trend || !def) {
    return (
      <Screen maxWidth={720}>
        {header}
        {markers.isLoading ? (
          <Skeleton height={240} rounded={radius.lg} />
        ) : (
          <StateView
            art={<Olive mood="curious" size={100} />}
            title="No readings yet"
            body="This marker isn't in any of your saved reports."
            action={{ label: 'Back', onPress: goBack }}
          />
        )}
      </Screen>
    );
  }

  const first = trend.history[0]!;
  const delta = trend.latest.value - first.value;
  const towardRange = trend.latest.status === 'high' ? delta < 0 : trend.latest.status === 'low' ? delta > 0 : true;
  const focus = trend.latest.status !== 'normal' ? def.focus?.[trend.latest.status] : undefined;

  return (
    <Screen maxWidth={720}>
      {header}
      <Card style={{ gap: space.md }}>
        <View style={styles.hero}>
          <View style={{ flex: 1 }}>
            <Text variant="hero">
              {trend.latest.value}
              <Text variant="bodyStrong" tone="muted">
                {' '}
                {trend.unit}
              </Text>
            </Text>
            <Text variant="caption" tone="muted">
              {longDate(trend.latest.date)} · healthy {formatRange(trend.range, trend.unit)}
            </Text>
          </View>
          <Pill label={STATUS_LABEL[trend.latest.status]} tone={statusTone(trend.latest.status)} />
        </View>
        {trend.history.length > 1 ? (
          <View style={styles.delta}>
            {delta < 0 ? (
              <TrendingDown size={18} color={towardRange ? colors.primary : colors.warm} />
            ) : (
              <TrendingUp size={18} color={towardRange ? colors.primary : colors.warm} />
            )}
            <Text variant="bodyStrong" style={{ color: towardRange ? colors.primary : colors.warm }}>
              {delta > 0 ? '+' : ''}
              {Math.round(delta * 10 ** def.decimals) / 10 ** def.decimals} {trend.unit} since {longDate(first.date)}
            </Text>
          </View>
        ) : null}
        <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}>
          {chartWidth > 0 ? <TrendChart trend={trend} width={chartWidth} /> : <View style={{ height: 180 }} />}
        </View>
        {trend.history.length === 1 ? (
          <Text variant="caption" tone="muted" align="center">
            Add your next report to see the trend.
          </Text>
        ) : null}
      </Card>

      {trend.tip ? (
        <Card style={styles.tip}>
          <Lightbulb size={20} color={colors.tip} />
          <Text style={{ flex: 1 }}>{trend.tip}</Text>
        </Card>
      ) : null}

      {focus?.length ? (
        <Card style={{ gap: space.sm }}>
          <Text variant="overline" tone="primary">
            What Olive tracks for this
          </Text>
          {focus.map((f) => (
            <Text key={f.nutrient}>
              {NUTRIENT_META[f.nutrient].label}: {f.kind === 'max' ? 'under' : 'at least'} {f.amount}{' '}
              {NUTRIENT_META[f.nutrient].unit} a day
            </Text>
          ))}
          <Text variant="caption" tone="muted">
            You'll see these on your Today screen as you log meals.
          </Text>
        </Card>
      ) : null}

      <View style={{ gap: space.md }}>
        <SectionHeader title="Readings" subtitle={`${trend.history.length} from your reports`} />
        <ListGroup>
          {[...trend.history].reverse().map((h) => (
            <ListRow
              key={h.reportId + h.date}
              title={longDate(h.date)}
              trailing={
                <Text variant="bodyStrong">
                  {h.value} {trend.unit}
                </Text>
              }
            />
          ))}
        </ListGroup>
      </View>
    </Screen>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  hero: { flexDirection: 'row', alignItems: 'flex-start', gap: space.md },
  delta: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  tip: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
    backgroundColor: colors.tipSoft,
    borderColor: colors.tipBorder,
  },
}));
