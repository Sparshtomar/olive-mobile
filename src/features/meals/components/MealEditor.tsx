import { MEAL_SLOTS, MEAL_SLOT_LABEL, type FoodItem, type MealSlot } from '@sparshtomar/olive-shared';
import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDay, analyzeMeal } from '@/api';
import { errorMessage } from '@/lib/errors';
import { kcal, relativeDay } from '@/lib/format';
import { useBackGuard } from '@/lib/use-back-guard';
import {
  Button,
  Card,
  Chip,
  ConfirmSheet,
  Field,
  IconButton,
  Screen,
  Text,
  colors,
  fonts,
  radius,
  shadow,
  space,
  useLayout,
} from '@/ui';
import { ArrowLeft, Mic, Plus, Trash2 } from '@/ui/icons';
import { caloriesLeftAfter, mealTitle, mealTotals } from '../lib/review';
import { FoodItemRow } from './FoodItemRow';

export interface MealValues {
  title: string;
  slot: MealSlot;
  items: FoodItem[];
}

export interface MealEditorProps {
  heading: string;
  date: string;
  initial: MealValues;
  photoUri?: string | null;
  transcript?: string;
  saveLabel: string;
  saving: boolean;
  onSave: (values: MealValues) => void;
  onDelete?: () => void;
  deleting?: boolean;
  /** Calories this meal already contributes to the day (when editing), so "left today" isn't double-counted. */
  alreadyCounted?: number;
  banner?: ReactNode;
}

type Keyed = { key: number; item: FoodItem };

export const MealEditor = ({
  heading,
  date,
  initial,
  photoUri,
  transcript,
  saveLabel,
  saving,
  onSave,
  onDelete,
  deleting,
  alreadyCounted = 0,
  banner,
}: MealEditorProps) => {
  const insets = useSafeAreaInsets();
  const { isWide } = useLayout();
  const nextKey = useRef(0);
  const keyed = (item: FoodItem): Keyed => ({ key: nextKey.current++, item });

  const [title, setTitle] = useState(initial.title);
  const [slot, setSlot] = useState(initial.slot);
  const [items, setItems] = useState<Keyed[]>(() => initial.items.map(keyed));
  const [dirty, setDirty] = useState(false);
  const [confirm, setConfirm] = useState<'discard' | 'delete' | null>(null);

  const [addText, setAddText] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const addRef = useRef<TextInput>(null);

  const day = useDay(date);
  const totals = mealTotals(items.map((k) => k.item));
  const left = day.data ? caloriesLeftAfter(day.data, totals.calories, alreadyCounted) : null;

  const touch = () => setDirty(true);

  const addMissing = async () => {
    const text = addText.trim();
    if (text.length < 2) return;
    setAdding(true);
    setAddError(null);
    try {
      const draft = await analyzeMeal({ kind: 'text', text });
      setItems((list) => [...list, ...draft.items.map(keyed)]);
      setAddText('');
      touch();
    } catch (err) {
      setAddError(errorMessage(err) ?? "Couldn't add that");
    } finally {
      setAdding(false);
    }
  };

  const leave = () => (dirty ? setConfirm('discard') : router.back());
  useBackGuard(dirty, () => setConfirm('discard'));

  const save = () => {
    const list = items.map((k) => k.item);
    onSave({ title: mealTitle(title, list), slot, items: list });
  };

  const footer = (
    <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
      <View style={[styles.footerInner, isWide && { maxWidth: 720 }]}>
        <View style={{ flex: 1 }}>
          <Text variant="heading">{kcal(totals.calories)} kcal</Text>
          <Text variant="caption" tone={left !== null && left < 0 ? 'warm' : 'muted'}>
            {left === null
              ? `P ${Math.round(totals.protein)} · C ${Math.round(totals.carbs)} · F ${Math.round(totals.fat)} g`
              : left >= 0
                ? `Leaves ${kcal(left)} kcal for ${relativeDay(date).toLowerCase()}`
                : `${kcal(-left)} kcal over ${relativeDay(date).toLowerCase()}'s target`}
          </Text>
        </View>
        <Button label={saveLabel} size="lg" onPress={save} loading={saving} disabled={items.length === 0 || deleting} />
      </View>
    </View>
  );

  return (
    <>
      <Screen footer={footer} maxWidth={720}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} label="Back" onPress={leave} />
          <Text variant="heading" style={{ flex: 1 }} accessibilityRole="header">
            {heading}
          </Text>
          {onDelete ? <IconButton icon={Trash2} label="Delete meal" onPress={() => setConfirm('delete')} /> : null}
        </View>

        {banner}

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} accessibilityLabel="Your meal photo" />
        ) : null}

        {transcript ? (
          <Card style={styles.transcript}>
            <Mic size={18} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="overline" tone="primary">
                Olive heard
              </Text>
              <Text style={{ fontStyle: 'italic' }}>"{transcript}"</Text>
            </View>
          </Card>
        ) : null}

        <TextInput
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            touch();
          }}
          placeholder="Name this meal"
          placeholderTextColor={colors.textFaint}
          maxLength={80}
          style={styles.titleInput}
          accessibilityLabel="Meal name"
        />

        <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Meal">
          {MEAL_SLOTS.map((s) => (
            <Chip
              key={s}
              label={MEAL_SLOT_LABEL[s]}
              selected={slot === s}
              onPress={() => {
                setSlot(s);
                touch();
              }}
            />
          ))}
        </View>

        <View style={{ gap: space.sm }}>
          {items.map(({ key, item }) => (
            <FoodItemRow
              key={key}
              item={item}
              onChange={(next) => {
                setItems((list) => list.map((k) => (k.key === key ? { key, item: next } : k)));
                touch();
              }}
              onRemove={() => {
                setItems((list) => list.filter((k) => k.key !== key));
                touch();
              }}
            />
          ))}
          {items.length === 0 ? (
            <Text tone="muted" align="center" style={{ paddingVertical: space.lg }}>
              No items left. Add what you ate below.
            </Text>
          ) : null}
        </View>

        <View style={styles.addRow}>
          <View style={{ flex: 1 }}>
            <Field
              ref={addRef}
              placeholder="Missed something? e.g. a glass of buttermilk"
              value={addText}
              onChangeText={(t) => {
                setAddText(t);
                setAddError(null);
              }}
              onSubmitEditing={addMissing}
              returnKeyType="done"
              maxLength={200}
              error={addError ?? undefined}
              accessibilityLabel="Add a food Olive missed"
            />
          </View>
          <IconButton
            icon={Plus}
            label="Add item"
            tone="primary"
            size={50}
            onPress={addMissing}
            disabled={adding || addText.trim().length < 2}
          />
        </View>
        {adding ? (
          <Text variant="caption" tone="muted">
            Working out "{addText}"…
          </Text>
        ) : null}
      </Screen>

      <ConfirmSheet
        visible={confirm === 'discard'}
        title="Discard this meal?"
        body="Your changes won't be saved."
        confirmLabel="Discard"
        destructive
        onConfirm={() => {
          setConfirm(null);
          router.back();
        }}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmSheet
        visible={confirm === 'delete'}
        title="Delete this meal?"
        body="It'll be removed from your day and your trends."
        confirmLabel="Delete meal"
        destructive
        loading={deleting}
        onConfirm={() => onDelete?.()}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted },
  transcript: {
    flexDirection: 'row',
    gap: space.md,
    alignItems: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primarySoft,
  },
  titleInput: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.text,
    paddingVertical: space.xs,
    outlineWidth: 0,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  footer: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: space.md,
    paddingHorizontal: space.lg,
    ...shadow.floating,
  },
  footerInner: { flexDirection: 'row', alignItems: 'center', gap: space.md, width: '100%', alignSelf: 'center' },
});
