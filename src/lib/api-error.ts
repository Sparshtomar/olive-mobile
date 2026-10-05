import type { ErrorCode } from '@sparshtomar/olive-shared';

export type ClientErrorCode = ErrorCode | 'NETWORK' | 'TIMEOUT';

/** Every failed request becomes one of these, so screens can switch on `code`. */
export class ApiError extends Error {
  constructor(
    readonly code: ClientErrorCode,
    message: string,
    readonly status = 0,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** Worth an automatic retry: the request may succeed unchanged. */
  get isTransient() {
    return this.code === 'NETWORK' || this.code === 'TIMEOUT' || this.code === 'AI_BUSY' || this.status >= 500;
  }
}
