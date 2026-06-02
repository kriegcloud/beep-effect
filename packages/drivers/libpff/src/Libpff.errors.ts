/**
 * Typed technical errors for the libpff driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { makeFileProcessingDriverErrorFactory } from "@beep/file-processing/Strategy";
import { $LibpffId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import type { FileProcessingDriverError } from "@beep/file-processing/Strategy";

const $I = $LibpffId.create("Libpff.errors");

/**
 * Technical libpff failure reasons.
 *
 * @example
 * ```ts
 * import { LibpffErrorReason } from "@beep/libpff"
 *
 * console.log(LibpffErrorReason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const LibpffErrorReason = LiteralKit([
  "config",
  "engine-unavailable",
  "output-limit",
  "process",
  "timeout",
]).pipe(
  $I.annoteSchema("LibpffErrorReason", {
    description: "Redacted technical error reasons emitted by the libpff driver.",
  })
);

/**
 * Type for {@link LibpffErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type LibpffErrorReason = typeof LibpffErrorReason.Type;

/**
 * Technical failure raised inside the libpff driver boundary.
 *
 * @example
 * ```ts
 * import { makeLibpffError } from "@beep/libpff"
 *
 * const error = makeLibpffError("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type LibpffError = FileProcessingDriverError;

/**
 * Create a libpff technical error with a typed reason.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeLibpffError = makeFileProcessingDriverErrorFactory<LibpffErrorReason>("libpff");
