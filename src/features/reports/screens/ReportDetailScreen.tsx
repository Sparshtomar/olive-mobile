import { formatRange, type ReportMarker } from '@sparshtomar/olive-shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useDeleteReport, useReport } from '@/api';
import { describeError, errorMessage, isNotFound } from '@/lib/errors';
import { longDate } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import {
  ConfirmSheet,
  IconButton,
  Olive,
  Pill,
  PressableScale,
  Screen,
  Skeleton,
  StateView,
  Text,
  makeStyles,
  radius,
  space,
  toast,
  useTheme,
} from '@/ui';
import { ArrowLeft, ChevronRight, Trash2 } from '@/ui/icons';
import { STATUS_LABEL, statusTone } from '../lib/status';

const goBack = () => (router.canGoBack() ? router.back() : router.replace('/reports'));

export const ReportDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useReport(id);
  const remove = useDeleteReport();
  const styles = useStyles();
  const [confirm, setConfirm] = useState(false);

  const header = (
    <View style={styles.header}>
      <IconButton icon={ArrowLeft} label="Back" onPress={goBack} />
      <View style={{ flex: 1 }} />
      {report.data ? <IconButton icon={Trash2} label="Delete report" onPress={() => setConfirm(true)} /> : null}
    </View>
  );

  if (!report.data) {
    return (
      <Screen maxWidth={720}>
        {header}
        {report.isError ? (
          <StateView
            art={<Olive mood="concerned" size={100} />}
            title={isNotFound(report.error) ? 'Report not found' : describeError(report.error).title}
            body={describeError(report.error).body}
            action={{ label: 'Back to reports', onPress: goBack }}
          />
        ) : (
          <View style={{ gap: space.md }}>
            <Skeleton height={32} width="70%" />
            <Skeleton height={60} rounded={radius.lg} />
            <Skeleton height={60} rounded={radius.lg} />
          </View>
        )}
      </Screen>
    );
  }

  const r = report.data;
  const flagged = r.markers.filter((m) => m.status && m.status !== 'normal');
  const ordered = [...flagged, ...r.markers.filter((m) => !flagged.includes(m))];

  return (
    <>
      <Screen maxWidth={720}>
        {header}
        <View style={{ gap: space.xs }}>
          <Text variant="title" accessibilityRole="header">
            {r.title}
          </Text>
          <Text tone="muted">
            {longDate(r.reportDate)} · {r.markers.length} values
            {flagged.length ? ` · ${flagged.length} out of range` : ''}
          </Text>
        </View>
        <View style={{ gap: space.sm }}>
          {ordered.map((m) => (
            <MarkerRow key={m.id} marker={m} />
          ))}
        </View>
        <Text variant="caption" tone="faint" align="center">
          Olive isn't a doctor. Discuss your results with yours.
        </Text>
      </Screen>
      <ConfirmSheet
        visible={confirm}
        title="Delete this report?"
        body="Its values will be removed from your marker trends and daily focus."
        confirmLabel="Delete report"
        destructive
        loading={remove.isPending}
        onConfirm={() =>
          remove.mutate(r.id, {
            onSuccess: () => {
              haptics.success();
              toast.info('Report deleted');
              setConfirm(false);
              goBack();
            },
            onError: (err) => toast.error("Couldn't delete", errorMessage(err)),
          })
        }
        onCancel={() => setConfirm(false)}
      />
    </>
  );
};

const MarkerRow = ({ marker: m }: { marker: ReportMarker }) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const printedRange = formatRange({ low: m.refLow ?? undefined, high: m.refHigh ?? undefined }, m.unit);
  const content = (
    <>
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong">{m.name}</Text>
        {printedRange ? (
          <Text variant="caption" tone="faint">
            Lab range {printedRange}
          </Text>
        ) : null}
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text variant="bodyStrong">
          {m.value}{' '}
          <Text variant="caption" tone="muted">
            {m.unit}
          </Text>
        </Text>
        {m.status ? <Pill label={STATUS_LABEL[m.status]} tone={statusTone(m.status)} /> : null}
      </View>
      {m.key ? <ChevronRight size={18} color={colors.textFaint} /> : <View style={{ width: 18 }} />}
    </>
  );
  return m.key ? (
    <PressableScale
      onPress={() => router.push(`/marker/${m.key}`)}
      style={styles.row}
      scaleTo={0.98}
      accessibilityRole="button"
      accessibilityHint="Shows this marker's trend"
    >
      {content}
    </PressableScale>
  ) : (
    <View style={styles.row}>{content}</View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
}));
