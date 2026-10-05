import type { MarkerInput, MarkerStatus } from '@sparshtomar/olive-shared';
import { StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeOut, LinearTransition } from 'react-native-reanimated';
import { IconButton, Pill, Text, colors, fonts, radius, space } from '@/ui';
import { Trash2 } from '@/ui/icons';
import { isValidMarkerValue } from '../lib/review';
import { STATUS_LABEL, statusTone } from '../lib/status';

/** A marker being reviewed: the raw text is kept so "5," can be typed on the way to "5,2". */
export type ReviewRow = MarkerInput & { key: number; valueText: string };

interface ReviewMarkerRowProps {
  row: ReviewRow;
  tracked: boolean;
  status: MarkerStatus | null;
  onChangeValue: (text: string) => void;
  onRemove: () => void;
}

export const ReviewMarkerRow = ({ row, tracked, status, onChangeValue, onRemove }: ReviewMarkerRowProps) => (
  <Animated.View
    layout={LinearTransition}
    exiting={FadeOut}
    style={[styles.row, !isValidMarkerValue(row.valueText) && { borderColor: colors.danger }]}
  >
    <View style={{ flex: 1, gap: 4 }}>
      <Text variant="bodyStrong" numberOfLines={2}>
        {row.name}
      </Text>
      <View style={{ flexDirection: 'row', gap: space.xs, flexWrap: 'wrap' }}>
        {status ? <Pill label={STATUS_LABEL[status]} tone={statusTone(status)} /> : null}
        {tracked ? null : <Pill label="Not tracked" />}
      </View>
    </View>
    <View style={styles.valueBox}>
      <TextInput
        value={row.valueText}
        onChangeText={onChangeValue}
        keyboardType="decimal-pad"
        style={styles.valueInput}
        maxLength={10}
        accessibilityLabel={`${row.name} value`}
      />
      <Text variant="caption" tone="muted" numberOfLines={1} style={{ maxWidth: 70 }}>
        {row.unit}
      </Text>
    </View>
    <IconButton icon={Trash2} label={`Remove ${row.name}`} size={34} onPress={onRemove} />
  </Animated.View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    padding: space.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  valueBox: { alignItems: 'flex-end', gap: 2 },
  valueInput: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: colors.text,
    textAlign: 'right',
    minWidth: 64,
    paddingVertical: 6,
    paddingHorizontal: space.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    outlineWidth: 0,
  },
});
