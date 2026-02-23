/**
 * Tagged error types for the PWA module.
 *
 * Uses Effect's Data.TaggedError for proper error handling and discrimination.
 *
 * @module pwa/errors
 */

import * as Data from "effect/Data";

/**
 * Error thrown when webpack compilation fails.
 */
export class WebpackBuildError extends Data.TaggedError("WebpackBuildError")<{
  readonly message: string;
  readonly details?: string | undefined;
}> {}

/**
 * Error thrown when a required file is not found.
 */
export class FileNotFoundError extends Data.TaggedError("FileNotFoundError")<{
  readonly path: string;
  readonly message: string;
}> {}

/**
 * Error thrown when file reading fails.
 */
export class FileReadError extends Data.TaggedError("FileReadError")<{
  readonly path: string;
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Error thrown when globbing files fails.
 */
export class GlobError extends Data.TaggedError("GlobError")<{
  readonly pattern: string | readonly string[];
  readonly message: string;
  readonly cause?: unknown;
}> {}

/**
 * Union type of all PWA errors for convenience.
 */
export type PWAError = WebpackBuildError | FileNotFoundError | FileReadError | GlobError;
