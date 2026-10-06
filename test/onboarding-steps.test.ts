import { describe, expect, it } from 'vitest';
import { parseNumber, validateStep } from '@/features/onboarding/lib/steps';

describe('onboarding validation', () => {
  it('only reports errors for the fields the current step owns', () => {
    // Nothing filled in yet, but on the name step only `name` may complain.
    expect(Object.keys(validateStep('name', {}))).toEqual(['name']);
  });

  it('asks the user to choose rather than saying "Required" for unanswered choices', () => {
    expect(validateStep('activity', {}).activityLevel).toBe('Pick the closest match');
    expect(validateStep('body', { age: 30, heightCm: 170, weightKg: 70 }).sex).toBe('Pick one - it changes the math');
  });

  it("uses the schema's message when a value is present but out of range", () => {
    const errors = validateStep('body', { sex: 'female', age: 4, heightCm: 170, weightKg: 70 });
    expect(errors.age).toBeDefined();
    expect(errors.age).not.toBe('Required');
  });

  it('passes a complete step', () => {
    expect(validateStep('body', { sex: 'male', age: 35, heightCm: 175, weightKg: 80 })).toEqual({});
  });
});

describe('number inputs', () => {
  it('accepts a decimal comma', () => expect(parseNumber('65,5')).toBe(65.5));
  it('treats blank as unanswered, not zero', () => expect(parseNumber('  ')).toBeUndefined());
  it('treats garbage as unanswered', () => expect(parseNumber('abc')).toBeUndefined());
});
