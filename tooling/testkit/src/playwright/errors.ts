import { Data } from "effect";
import { errors } from "playwright-core";

/**
 * Playwright does not provide detailed error information but there is
 * a distinction between timeout and other errors.
 *
 * @category error
 * @since 0.1.0
 */
export type PlaywrightErrorReason = "Timeout" | "Unknown";

/**
 * Error type that is returned when a Playwright error occurs.
 * Reason can either be "Timeout" or "Unknown".
 *
 * Timeout errors occur when a timeout is reached. All other errors are
 * grouped under "Unknown".
 *
 * @category error
 * @since 0.1.0
 */
export class PlaywrightError extends Data.TaggedError("PlaywrightError")<{
  reason: PlaywrightErrorReason;
  cause: unknown;
}> {}

export function wrapError(error: unknown): PlaywrightError {
  if (error instanceof errors.TimeoutError) {
    return new PlaywrightError({
      reason: "Timeout",
      cause: error,
    });
  }
  return new PlaywrightError({
    reason: "Unknown",
    cause: error,
  });
}
