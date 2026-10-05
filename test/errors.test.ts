import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api-error';
import { describeError, errorMessage, isNotFound } from '@/lib/errors';

describe('error copy', () => {
  it('explains a non-food photo without offering a pointless retry', () => {
    const e = describeError(new ApiError('NOT_FOOD', 'No food here', 422));
    expect(e.retryable).toBe(false);
    expect(e.mood).toBe('curious');
  });

  it('offers a retry for transient failures', () => {
    for (const code of ['NETWORK', 'TIMEOUT', 'AI_BUSY', 'RATE_LIMITED'] as const) {
      expect(describeError(new ApiError(code, 'x')).retryable).toBe(true);
    }
  });

  it('never shows a raw exception to the user', () => {
    const e = describeError(new TypeError('undefined is not a function'));
    expect(e.title).toBe('Something went wrong');
    expect(e.body).not.toMatch(/undefined/);
    expect(errorMessage(new TypeError('boom'))).toBeUndefined();
  });

  it('uses the server message for API errors', () => {
    expect(errorMessage(new ApiError('VALIDATION', 'Age must be at least 13', 400))).toBe('Age must be at least 13');
  });

  it('recognises missing resources', () => {
    expect(isNotFound(new ApiError('NOT_FOUND', 'Meal not found', 404))).toBe(true);
    expect(isNotFound(new ApiError('INTERNAL', 'x', 500))).toBe(false);
  });
});

describe('retry policy', () => {
  it('treats network, timeout, busy AI and 5xx as transient', () => {
    expect(new ApiError('NETWORK', 'x').isTransient).toBe(true);
    expect(new ApiError('INTERNAL', 'x', 503).isTransient).toBe(true);
    expect(new ApiError('VALIDATION', 'x', 400).isTransient).toBe(false);
  });
});
