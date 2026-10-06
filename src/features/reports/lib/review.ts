import { DATE_KEY_REGEX, NUTRIENT_META, type NutritionFocus } from '@sparshtomar/olive-shared';

/** Parses a typed lab value. Accepts a decimal comma ("5,2"); blank input is NaN, never 0. */
export const parseMarkerValue = (text: string): number => (text.trim() === '' ? NaN : Number(text.replace(',', '.')));

export const isValidMarkerValue = (text: string) => Number.isFinite(parseMarkerValue(text));

/** Why a report date can't be saved, or undefined when it's fine. `today` is the device's local date key. */
export const reportDateError = (date: string, today: string): string | undefined => {
  if (!DATE_KEY_REGEX.test(date)) return 'Use the format YYYY-MM-DD';
  if (date > today) return "The report date can't be in the future";
  return undefined;
};

/** Tracked markers first - they're the ones that affect the user's day. Stable within each group. */
export const trackedFirst = <T extends { key: string | null }>(markers: T[]): T[] =>
  [...markers].sort((a, b) => Number(b.key !== null) - Number(a.key !== null));

/** The toast shown after saving: what changes on Today, else how many markers need attention. */
export const savedReportMessage = (focus: Pick<NutritionFocus, 'nutrient'>[], outOfRange: number): string => {
  if (focus.length) {
    const nutrients = focus.map((f) => NUTRIENT_META[f.nutrient].label.toLowerCase()).join(' and ');
    return `Olive will now track ${nutrients} on your Today screen.`;
  }
  if (outOfRange) return `${outOfRange} marker${outOfRange > 1 ? 's' : ''} out of range.`;
  return 'Everything Olive tracks is in range. 🎉';
};
