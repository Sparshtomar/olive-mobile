import { profileFieldsSchema, type ProfileInput } from '@sparshtomar/olive-shared';

export type Draft = Partial<ProfileInput>;
export type FieldErrors = Partial<Record<keyof ProfileInput, string>>;

export const STEPS = ['intro', 'name', 'body', 'activity', 'goal'] as const;
export type Step = (typeof STEPS)[number];

/** Which fields each step owns, so validation errors show where the user can fix them. */
const STEP_FIELDS: Record<Exclude<Step, 'intro'>, (keyof ProfileInput)[]> = {
  name: ['name'],
  body: ['sex', 'age', 'heightCm', 'weightKg'],
  activity: ['activityLevel'],
  goal: ['goalType', 'paceKgPerWeek'],
};

const REQUIRED_MESSAGE: Partial<Record<keyof ProfileInput, string>> = {
  sex: 'Pick one - it changes the math',
  activityLevel: 'Pick the closest match',
  goalType: 'Pick a goal',
};

/** Validates only the fields a step owns, with friendlier copy for choices the user hasn't made yet. */
export const validateStep = (step: Exclude<Step, 'intro'>, draft: Draft): FieldErrors => {
  const fields = STEP_FIELDS[step];
  const shape = Object.fromEntries(fields.map((f) => [f, true])) as Record<keyof ProfileInput, true>;
  const result = profileFieldsSchema.pick(shape).safeParse(draft);
  if (result.success) return {};
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ProfileInput;
    errors[key] ??= draft[key] === undefined ? (REQUIRED_MESSAGE[key] ?? 'Required') : issue.message;
  }
  return errors;
};

/** Lenient number parsing for typed input: accepts a decimal comma; blank or garbage is "not answered". */
export const parseNumber = (text: string) => {
  const n = Number(text.replace(',', '.'));
  return text.trim() === '' || Number.isNaN(n) ? undefined : n;
};
