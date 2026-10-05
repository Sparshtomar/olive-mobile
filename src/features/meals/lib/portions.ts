import { scaleNutrients, type FoodItem } from '@sparshtomar/olive-shared';

/** Portion multipliers that make sense for food ("half", "one and a half"…). */
export const PORTION_STEPS = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10] as const;
export const MIN_PORTION = Math.min(...PORTION_STEPS);
export const MAX_PORTION = Math.max(...PORTION_STEPS);

/** Upper bound for a hand-typed calorie value; anything above is treated as a typo. */
export const MAX_ITEM_CALORIES = 5000;

/** The next portion step up or down, or the same quantity at either end of the scale. */
export const stepQuantity = (quantity: number, dir: 1 | -1): number => {
  if (dir === 1) return PORTION_STEPS.find((s) => s > quantity + 1e-9) ?? quantity;
  return [...PORTION_STEPS].reverse().find((s) => s < quantity - 1e-9) ?? quantity;
};

export const formatQuantity = (q: number) => (q === 0.25 ? '¼' : q === 0.5 ? '½' : q === 0.75 ? '¾' : `${q}`);

/**
 * Applies a hand-typed calorie value to one portion. Every nutrient scales with it so
 * macros stay consistent with the new number. Returns null when the input should be
 * ignored (blank, not a number, out of range, or unchanged). Blank is not zero: clearing
 * the field and tapping away must not wipe the item's calories.
 */
export const withCalories = (item: FoodItem, typed: string): FoodItem | null => {
  if (typed.trim() === '') return null;
  const value = Number(typed);
  const current = item.nutrients.calories;
  if (!Number.isFinite(value) || value < 0 || value > MAX_ITEM_CALORIES || Math.round(value) === Math.round(current)) {
    return null;
  }
  const nutrients =
    current > 0 ? scaleNutrients(item.nutrients, value / current) : { ...item.nutrients, calories: value };
  // The user corrected it, so it's no longer a guess.
  return { ...item, nutrients, confidence: 'high' };
};
