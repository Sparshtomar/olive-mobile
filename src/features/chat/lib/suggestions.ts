import type { DaySummary, MarkerTrend } from '@sparshtomar/olive-shared';

const GENERAL = [
  'Plan a high-protein vegetarian dinner for me',
  'Is ghee bad for cholesterol?',
  'How much sugar is okay in a day?',
  'What should I eat before a workout?',
];

const MAX = 4;

/**
 * Opening prompts for an empty chat. Flagged lab markers come first - they are the
 * reason to talk to Olive - then today's situation, then general questions to fill up.
 */
export const suggestionsFor = ({ markers, day }: { markers?: MarkerTrend[]; day?: DaySummary }): string[] => {
  const out: string[] = [];
  for (const m of markers ?? []) {
    if (m.latest.status === 'normal') continue;
    out.push(`What does ${m.latest.status} ${m.name.toLowerCase()} mean for what I eat?`);
    if (out.length >= 2) break;
  }
  if (day) {
    const left = day.targets.calories - day.totals.calories;
    if (day.meals.length > 0 && left < 0) out.push("I've gone over today - what should dinner look like?");
    else if (day.meals.length > 0 && left < day.targets.calories * 0.35)
      out.push(`I have about ${Math.round(left / 50) * 50} kcal left - ideas for a light dinner?`);
    else if (day.meals.length === 0) out.push('What makes a good breakfast for my goal?');
    const protein = day.targets.protein - day.totals.protein;
    if (day.meals.length > 0 && protein > day.targets.protein * 0.5)
      out.push(`How do I get ${Math.round(protein)} g more protein today?`);
  }
  for (const g of GENERAL) {
    if (out.length >= MAX) break;
    out.push(g);
  }
  return out.slice(0, MAX);
};
