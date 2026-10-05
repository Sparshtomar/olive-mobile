import { scaleNutrients, sumNutrients, type FoodItem, type Nutrients } from '@sparshtomar/olive-shared';

const MAX_TITLE_LENGTH = 80;

/** Nutrients of the whole meal, with each item's portion multiplier applied. */
export const mealTotals = (items: FoodItem[]): Nutrients =>
  sumNutrients(items.map((item) => scaleNutrients(item.nutrients, item.quantity)));

/**
 * Calories left in the day's target if this meal is saved. Negative means over.
 * `alreadyCounted` is what this meal contributes today when editing it, so it isn't counted twice.
 */
export const caloriesLeftAfter = (
  day: { targets: { calories: number }; totals: { calories: number } },
  mealCalories: number,
  alreadyCounted = 0,
): number => day.targets.calories - (day.totals.calories - alreadyCounted) - mealCalories;

/** The user's title, or the item names when they left it blank. */
export const mealTitle = (typed: string, items: Pick<FoodItem, 'name'>[]): string =>
  typed.trim() ||
  items
    .map((i) => i.name)
    .join(', ')
    .slice(0, MAX_TITLE_LENGTH);
