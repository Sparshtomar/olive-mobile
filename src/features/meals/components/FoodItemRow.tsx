import { scaleNutrients, type FoodItem } from '@sparshtomar/olive-shared';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { grams, kcal } from '@/lib/format';
import { haptics } from '@/lib/haptics';
import { Field, IconButton, Pill, PressableScale, Text, makeStyles, radius, space, useTheme } from '@/ui';
import { ChevronDown, ChevronUp, Minus, Plus, Trash2 } from '@/ui/icons';
import { MAX_PORTION, MIN_PORTION, formatQuantity, stepQuantity, withCalories } from '../lib/portions';

export interface FoodItemRowProps {
  item: FoodItem;
  onChange: (item: FoodItem) => void;
  onRemove: () => void;
}

export const FoodItemRow = ({ item, onChange, onRemove }: FoodItemRowProps) => {
  const { colors } = useTheme();
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  const [kcalText, setKcalText] = useState(String(Math.round(item.nutrients.calories)));
  useEffect(() => setKcalText(String(Math.round(item.nutrients.calories))), [item.nutrients.calories]);

  const total = scaleNutrients(item.nutrients, item.quantity);
  const unsure = item.confidence === 'low';

  const setQuantity = (dir: 1 | -1) => {
    const next = stepQuantity(item.quantity, dir);
    if (next === item.quantity) return;
    haptics.tap();
    onChange({ ...item, quantity: next });
  };

  const commitCalories = () => {
    const next = withCalories(item, kcalText);
    if (next) onChange(next);
    else setKcalText(String(Math.round(item.nutrients.calories)));
  };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      layout={LinearTransition}
      style={[styles.card, unsure && styles.unsure]}
    >
      <View style={styles.top}>
        <PressableScale
          onPress={() => setOpen((o) => !o)}
          style={{ flex: 1, gap: 2 }}
          scaleTo={0.99}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${item.name}, ${formatQuantity(item.quantity)} times ${item.portion}, ${Math.round(total.calories)} calories`}
          accessibilityHint="Shows nutrition details and lets you correct calories"
        >
          <View style={styles.nameRow}>
            <Text variant="bodyStrong" numberOfLines={2} style={{ flexShrink: 1 }}>
              {item.name}
            </Text>
            {open ? (
              <ChevronUp size={16} color={colors.textFaint} />
            ) : (
              <ChevronDown size={16} color={colors.textFaint} />
            )}
          </View>
          <Text variant="caption" tone="muted">
            {item.quantity !== 1 ? `${formatQuantity(item.quantity)} × ` : ''}
            {item.portion}
            {item.grams ? ` · ${Math.round(item.grams * item.quantity)} g` : ''}
          </Text>
          {unsure ? <Pill label="Olive isn't sure - check the portion" tone="warm" /> : null}
        </PressableScale>
        <View style={{ alignItems: 'flex-end', gap: space.xs }}>
          <Text variant="subheading">
            {kcal(total.calories)}
            <Text variant="caption" tone="muted">
              {' '}
              kcal
            </Text>
          </Text>
          <View style={styles.stepper}>
            <IconButton
              icon={Minus}
              label={`Less ${item.name}`}
              size={30}
              onPress={() => setQuantity(-1)}
              disabled={item.quantity <= MIN_PORTION}
            />
            <Text variant="label" style={styles.qty} accessibilityLabel={`Quantity ${item.quantity}`}>
              {formatQuantity(item.quantity)}×
            </Text>
            <IconButton
              icon={Plus}
              label={`More ${item.name}`}
              size={30}
              onPress={() => setQuantity(1)}
              disabled={item.quantity >= MAX_PORTION}
            />
          </View>
        </View>
      </View>

      {open ? (
        <Animated.View entering={FadeIn} style={styles.details}>
          <View style={styles.macroRow}>
            <Macro label="Protein" value={total.protein} color={colors.protein} />
            <Macro label="Carbs" value={total.carbs} color={colors.carbs} />
            <Macro label="Fat" value={total.fat} color={colors.fat} />
            <Macro label="Fiber" value={total.fiber} color={colors.primary} />
            <Macro label="Sugar" value={total.sugar} color={colors.warm} />
            <Macro label="Sat. fat" value={total.saturatedFat} color={colors.textMuted} />
          </View>
          <View style={styles.editRow}>
            <View style={{ flex: 1 }}>
              <Field
                label={`Calories per ${item.portion}`}
                value={kcalText}
                onChangeText={setKcalText}
                onBlur={commitCalories}
                onSubmitEditing={commitCalories}
                keyboardType="number-pad"
                suffix="kcal"
                maxLength={4}
                returnKeyType="done"
              />
            </View>
            <IconButton
              icon={Trash2}
              label={`Remove ${item.name}`}
              onPress={onRemove}
              size={44}
              style={{ marginTop: 22 }}
            />
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
};

const Macro = ({ label, value, color }: { label: string; value: number; color: string }) => {
  const styles = useStyles();
  return (
    <View style={styles.macro}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
      <Text variant="label">{grams(value)} g</Text>
    </View>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.md,
  },
  unsure: { borderColor: colors.warmBorder },
  top: { flexDirection: 'row', gap: space.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qty: { minWidth: 30, textAlign: 'center' },
  details: { gap: space.md, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.md },
  macroRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: space.lg, rowGap: space.xs },
  macro: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  editRow: { flexDirection: 'row', gap: space.sm, alignItems: 'flex-start' },
}));
