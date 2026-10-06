import {
  NUTRIENT_META,
  deriveNutritionFocus,
  evaluateMarker,
  type ReportDraft,
  type Sex,
} from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateReport } from '@/api';
import { errorMessage } from '@/lib/errors';
import { todayKey } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { useBackGuard } from '@/lib/use-back-guard';
import {
  Button,
  Card,
  ConfirmSheet,
  Field,
  IconButton,
  Screen,
  Text,
  inputType,
  makeStyles,
  space,
  toast,
  useTheme,
} from '@/ui';
import { ArrowLeft, Check } from '@/ui/icons';
import { isValidMarkerValue, parseMarkerValue, reportDateError, savedReportMessage, trackedFirst } from '../lib/review';
import { ReviewMarkerRow, type ReviewRow } from './ReviewMarkerRow';

interface ReportReviewProps {
  draft: ReportDraft;
  sex: Sex;
  onLeave: () => void;
}

/** Every extracted value is editable before saving - a misread decimal in health data matters. */
export const ReportReview = ({ draft, sex, onLeave }: ReportReviewProps) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useStyles();
  const create = useCreateReport();
  const nextKey = useRef(0);
  const [title, setTitle] = useState(draft.labName ?? 'Lab report');
  const [date, setDate] = useState(draft.reportDate ?? '');
  const [rows, setRows] = useState<ReviewRow[]>(() =>
    draft.markers.map((m) => ({ ...m, key: nextKey.current++, valueText: String(m.value) })),
  );
  const [confirmLeave, setConfirmLeave] = useState(false);
  useBackGuard(true, () => setConfirmLeave(true));

  const dateError = reportDateError(date, todayKey());
  const invalidValues = rows.some((r) => !isValidMarkerValue(r.valueText));
  const canSave = !dateError && !invalidValues && rows.length > 0;

  // Same evaluation the server stores, so status chips and focus update live while editing.
  const evaluated = rows.map((row) => ({ row, ...evaluateMarker(row, sex) }));
  const trackedCount = evaluated.filter((e) => e.key !== null).length;
  const focus = deriveNutritionFocus(
    evaluated.flatMap((e) => (e.key && e.status ? [{ key: e.key, status: e.status }] : [])),
  );

  const changeValue = (key: number, valueText: string) =>
    setRows((list) =>
      list.map((r) => {
        if (r.key !== key) return r;
        // While the text is mid-edit or invalid, keep evaluating the last valid number so rows don't jump.
        const parsed = parseMarkerValue(valueText);
        return { ...r, valueText, value: Number.isFinite(parsed) ? parsed : r.value };
      }),
    );

  const save = () => {
    if (!canSave) return;
    create.mutate(
      {
        title: title.trim() || 'Lab report',
        reportDate: date,
        markers: rows.map(({ name, value, unit, refLow, refHigh }) => ({ name, value, unit, refLow, refHigh })),
      },
      {
        onSuccess: (report) => {
          haptics.success();
          const outOfRange = report.markers.filter((m) => m.key && m.status !== 'normal').length;
          toast.success('Report saved', savedReportMessage(focus, outOfRange));
          router.replace(`/report/${report.id}`);
        },
        onError: (err) => toast.error("Couldn't save the report", errorMessage(err)),
      },
    );
  };

  const footer = (
    <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">
          {rows.length} values · {trackedCount} tracked
        </Text>
        <Text variant="caption" tone="muted">
          {invalidValues ? 'Fix the highlighted values' : 'Check them against your report'}
        </Text>
      </View>
      <Button
        label="Save report"
        icon={Check}
        size="lg"
        onPress={save}
        loading={create.isPending}
        disabled={!canSave}
      />
    </View>
  );

  return (
    <>
      <Screen footer={footer} maxWidth={720}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} label="Back" onPress={() => setConfirmLeave(true)} />
          <Text variant="heading" accessibilityRole="header">
            Check what Olive read
          </Text>
        </View>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Report name"
          placeholderTextColor={colors.textFaint}
          maxLength={80}
          style={styles.titleInput}
          accessibilityLabel="Report name"
        />
        <Field
          label={draft.reportDate ? 'Report date' : "Report date - Olive couldn't find it"}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
          maxLength={10}
          keyboardType="numbers-and-punctuation"
          error={date ? dateError : undefined}
        />

        {focus.length > 0 ? (
          <Card style={styles.focusCard}>
            <Text variant="overline" tone="primary">
              What this means day to day
            </Text>
            {focus.map((f) => (
              <Text key={f.nutrient}>
                {f.kind === 'max' ? 'Keep' : 'Get'}{' '}
                <Text variant="bodyStrong">{NUTRIENT_META[f.nutrient].label.toLowerCase()}</Text>{' '}
                {f.kind === 'max' ? 'under' : 'to at least'} {f.amount} {NUTRIENT_META[f.nutrient].unit} a day
                <Text tone="muted"> - for your {f.reasons.map((r) => r.name).join(', ')}</Text>
              </Text>
            ))}
          </Card>
        ) : null}

        <View style={{ gap: space.sm }}>
          {trackedFirst(evaluated).map(({ row, key, status }) => (
            <ReviewMarkerRow
              key={row.key}
              row={row}
              tracked={key !== null}
              status={status}
              onChangeValue={(text) => changeValue(row.key, text)}
              onRemove={() => setRows((list) => list.filter((r) => r.key !== row.key))}
            />
          ))}
        </View>
      </Screen>
      <ConfirmSheet
        visible={confirmLeave}
        title="Discard this report?"
        body="Nothing has been saved yet."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setConfirmLeave(false);
          onLeave();
        }}
        onCancel={() => setConfirmLeave(false)}
      />
    </>
  );
};

const useStyles = makeStyles(({ colors, shadow }) => ({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  titleInput: {
    ...inputType.title,
    color: colors.text,
    paddingVertical: space.xs,
    outlineWidth: 0,
  },
  focusCard: { gap: space.sm, backgroundColor: colors.primarySoft, borderColor: colors.primarySoft },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    ...shadow.floating,
  },
}));
