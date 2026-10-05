import { ApiError } from './api-error';

/** The Olive expressions that fit an error. A subset of the mascot's moods, kept here so lib doesn't depend on ui. */
type ErrorMood = 'curious' | 'concerned' | 'sleepy';

export interface FriendlyError {
  title: string;
  body: string;
  mood: ErrorMood;
  /** Retrying the same request could work (network blips, busy AI). */
  retryable: boolean;
}

/** One place that turns API error codes into human copy. */
export const describeError = (err: unknown): FriendlyError => {
  if (!(err instanceof ApiError)) {
    return { title: 'Something went wrong', body: 'Please try again.', mood: 'concerned', retryable: true };
  }
  switch (err.code) {
    case 'NOT_FOOD':
      return { title: "Hmm, I don't see food", body: err.message, mood: 'curious', retryable: false };
    case 'NOT_A_REPORT':
      return { title: "That doesn't look like a lab report", body: err.message, mood: 'curious', retryable: false };
    case 'UNSUPPORTED_FILE':
    case 'FILE_TOO_LARGE':
      return { title: "Olive can't open that file", body: err.message, mood: 'concerned', retryable: false };
    case 'AI_BUSY':
    case 'RATE_LIMITED':
      return { title: 'Olive needs a breather', body: err.message, mood: 'sleepy', retryable: true };
    case 'NETWORK':
    case 'TIMEOUT':
      return { title: "Can't reach Olive", body: err.message, mood: 'concerned', retryable: true };
    case 'AI_FAILED':
      return {
        title: 'That one stumped me',
        body: `${err.message}. Try again, or describe it in words.`,
        mood: 'concerned',
        retryable: true,
      };
    default:
      return { title: 'Something went wrong', body: err.message, mood: 'concerned', retryable: true };
  }
};

/** The server's message for toasts and inline errors, or undefined when the failure wasn't an API error. */
export const errorMessage = (err: unknown): string | undefined => (err instanceof ApiError ? err.message : undefined);

export const isNotFound = (err: unknown) => err instanceof ApiError && err.code === 'NOT_FOUND';
