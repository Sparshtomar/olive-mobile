import { formatRange, type MarkerTrend, type ReportSummary } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useMarkers, useReports } from '@/api';
import { describeError } from '@/lib/errors';
import { longDate } from '@/lib/format';
import {
  Button,
  Card,
  Olive,
  Pill,
  PressableScale,
  Screen,
  Skeleton,
  StateView,
  TAB_BAR_CLEARANCE,
  Text,
  makeStyles,
  radius,
  space,
  useLayout,
  useTheme,
} from '@/ui';
import { ChevronRight, FileText, Plus } from '@/ui/icons';
import { Sparkline } from '../components/TrendChart';
import { UploadReportSheet } from '../components/UploadReportSheet';
import { STATUS_LABEL, statusTone } from '../lib/status';

export const ReportsScreen = () => {
  const reports = useReports();
  const markers = useMarkers();
  const [uploadOpen, setUploadOpen] = useState(false);
  const { isWide } = useLayout();
  const styles = useStyles();

  const refresh = () => Promise.all([reports.refetch(), markers.refetch()]);
  const loading = !reports.data && reports.isLoading;
  const empty = reports.data?.length === 0;
  const flagged = markers.data?.filter((m) => m.latest.status !== 'normal') ?? [];

  return (
    <>
      <Screen onRefresh={refresh} refreshing={reports.isRefetching} bottomInset={TAB_BAR_CLEARANCE}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="title" accessibilityRole="header">
              Health reports
            </Text>
            <Text tone="muted">
              {flagged.length > 0
                ? `${flagged.length} marker${flagged.length > 1 ? 's' : ''} to work on`
                : 'Your lab results, tracked over time'}
            </Text>
          </View>
          {!empty ? <Button label="Add" icon={Plus} onPress={() => setUploadOpen(true)} /> : null}
        </View>

        {loading ? (
          <View style={{ gap: space.md }}>
            <Skeleton height={96} rounded={radius.lg} />
            <Skeleton height={96} rounded={radius.lg} />
          </View>
        ) : reports.isError && !reports.data ? (
          <StateView
            art={<Olive mood="concerned" size={100} />}
            title={describeError(reports.error).title}
            body={describeError(reports.error).body}
            action={{ label: 'Try again', onPress: () => void refresh() }}
          />
        ) : empty ? (
          <Card style={styles.empty}>
            <Olive mood="curious" size={110} />
            <Text variant="heading" align="center">
              Turn your blood test into daily targets
            </Text>
            <Text tone="muted" align="center" style={{ maxWidth: 380 }}>
              Upload a recent report. If something like LDL or HbA1c is out of range, Olive tracks the foods that move
              it — every day, on your Today screen.
            </Text>
            <Button label="Add your first report" icon={Plus} size="lg" onPress={() => setUploadOpen(true)} />
          </Card>
        ) : (
          <>
            {markers.data && markers.data.length > 0 ? (
              <View style={{ gap: space.sm }}>
                <Text variant="overline" tone="muted">
                  Your markers
                </Text>
                <View style={[styles.grid, isWide && { gap: space.md }]}>
                  {markers.data.map((m) => (
                    <MarkerCard key={m.key} marker={m} wide={isWide} />
                  ))}
                </View>
              </View>
            ) : null}

            <View style={{ gap: space.sm }}>
              <Text variant="overline" tone="muted">
                Reports
              </Text>
              {reports.data?.map((r) => (
                <ReportRow key={r.id} report={r} />
              ))}
            </View>
          </>
        )}
      </Screen>
      <UploadReportSheet visible={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
};

const MarkerCard = ({ marker, wide }: { marker: MarkerTrend; wide: boolean }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const tone = statusTone(marker.latest.status);
  const values = marker.history.map((h) => h.value);
  return (
    <PressableScale
      onPress={() => router.push(`/marker/${marker.key}`)}
      style={[styles.markerCard, wide && { flexBasis: '31%' }]}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={`${marker.name}: ${marker.latest.value} ${marker.unit}, ${STATUS_LABEL[marker.latest.status]}`}
    >
      <View style={styles.markerTop}>
        <Text variant="label" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
          {marker.name}
        </Text>
        <Pill label={STATUS_LABEL[marker.latest.status]} tone={tone} />
      </View>
      <View style={styles.markerBottom}>
        <Text variant="heading">
          {marker.latest.value}
          <Text variant="caption" tone="muted">
            {' '}
            {marker.unit}
          </Text>
        </Text>
        <Sparkline values={values} color={tone === 'warm' ? colors.warm : colors.primary} />
      </View>
      <Text variant="caption" tone="faint">
        Healthy {formatRange(marker.range, marker.unit)}
      </Text>
    </PressableScale>
  );
};

const ReportRow = ({ report }: { report: ReportSummary }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  return (
    <PressableScale
      onPress={() => router.push(`/report/${report.id}`)}
      style={styles.reportRow}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${report.title}, ${longDate(report.reportDate)}, ${report.flaggedCount} out of range`}
    >
      <View style={styles.reportIcon}>
        <FileText size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {report.title}
        </Text>
        <Text variant="caption" tone="muted">
          {longDate(report.reportDate)} · {report.markerCount} values
          {report.flaggedCount > 0 ? ` · ${report.flaggedCount} out of range` : ''}
        </Text>
      </View>
      <ChevronRight size={18} color={colors.textFaint} />
    </PressableScale>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  markerCard: {
    flexGrow: 1,
    flexBasis: '46%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
  },
  markerTop: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  markerBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
