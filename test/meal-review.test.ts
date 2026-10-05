import type { FoodItem } from '@sparshtomar/olive-shared';
import { describe, expect, it } from 'vitest';
import { MAX_PORTION, MIN_PORTION, formatQuantity, stepQuantity, withCalories } from '@/features/meals/lib/portions';
import { caloriesLeftAfter, mealTitle, mealTotals } from '@/features/meals/lib/review';

const item = (overrides: Partial<FoodItem> = {}): FoodItem => ({
  name: 'Dal',
  portion: '1 katori',
  grams: 150,
  quantity: 1,
  confidence: 'low',
  nutrients: { calories: 200, protein: 10, carbs: 25, fat: 5, fiber: 5, sugar: 2, saturatedFat: 2, sodiumMg: 400 },
  ...overrides,
});

describe('portion stepper', () => {
  it('moves through food-friendly steps', () => {
    expect(stepQuantity(1, 1)).toBe(1.5);
    expect(stepQuantity(1, -1)).toBe(0.75);
    expect(stepQuantity(0.5, -1)).toBe(0.25);
  });

  it('snaps an off-scale quantity from the AI to the nearest step in the chosen direction', () => {
    expect(stepQuantity(1.2, 1)).toBe(1.5);
    expect(stepQuantity(1.2, -1)).toBe(1);
  });

  it('stops at both ends of the scale', () => {
    expect(stepQuantity(MIN_PORTION, -1)).toBe(MIN_PORTION);
    expect(stepQuantity(MAX_PORTION, 1)).toBe(MAX_PORTION);
  });

  it('shows common fractions as glyphs', () => {
    expect(formatQuantity(0.5)).toBe('½');
    expect(formatQuantity(1.5)).toBe('1.5');
  });
});

describe('calorie override', () => {
  it('rescales every nutrient so macros stay consistent with the new calories', () => {
    const next = withCalories(item(), '300');
    expect(next?.nutrients.calories).toBe(300);
    expect(next?.nutrients.protein).toBe(15);
    expect(next?.nutrients.sodiumMg).toBe(600);
  });

  it('marks a corrected item as confident', () => {
    expect(withCalories(item({ confidence: 'low' }), '250')?.confidence).toBe('high');
  });

  it('sets calories directly when the item had none to scale from', () => {
    const zero = item({ nutrients: { ...item().nutrients, calories: 0, protein: 3 } });
    const next = withCalories(zero, '40');
    expect(next?.nutrients.calories).toBe(40);
    expect(next?.nutrients.protein).toBe(3);
  });

  it.each(['', '  ', 'abc', '-5', '99999', '200'])(
    'ignores %j (blank, invalid, out of range or unchanged)',
    (typed) => {
      expect(withCalories(item(), typed)).toBeNull();
    },
  );

  it('still accepts an explicit zero (black coffee, water)', () => {
    expect(withCalories(item(), '0')?.nutrients.calories).toBe(0);
  });
});

describe('meal review footer', () => {
  it('applies each portion multiplier to the meal total', () => {
    expect(mealTotals([item({ quantity: 2 }), item()]).calories).toBe(600);
  });

  it('subtracts the meal from what is left today', () => {
    const day = { targets: { calories: 2000 }, totals: { calories: 1200 } };
    expect(caloriesLeftAfter(day, 300)).toBe(500);
    expect(caloriesLeftAfter(day, 1000)).toBe(-200);
  });

  it("doesn't double-count a meal that is being edited", () => {
    const day = { targets: { calories: 2000 }, totals: { calories: 1200 } };
    // The 400 kcal meal is already inside today's 1200; editing it down to 300 frees 100.
    expect(caloriesLeftAfter(day, 300, 400)).toBe(900);
  });

  it('falls back to the item names when the title is blank', () => {
    expect(mealTitle('  ', [{ name: 'Dal' }, { name: 'Rice' }])).toBe('Dal, Rice');
    expect(mealTitle('Lunch', [{ name: 'Dal' }])).toBe('Lunch');
  });
});
