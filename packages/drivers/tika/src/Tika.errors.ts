/**
 * Typed technical errors for the Tika driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { makeFileProcessingDriverErrorFactory } from "@beep/file-processing/Strategy";
import { $TikaId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import type { FileProcessingDriverError } from "@beep/file-processing/Strategy";

const $I = $TikaId.create("Tika.errors");

/**
 * Technical Tika failure reasons.
 *
 * @example
 * ```ts
 * import { TikaErrorReason } from "@beep/tika"
 *
 * console.log(TikaErrorReason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const TikaErrorReason = LiteralKit([
  "config",
  "engine-unavailable",
  "response-decoding",
  "response-status",
  "timeout",
  "transport",
]).pipe(
  $I.annoteSchema("TikaErrorReason", {
    description: "Redacted technical error reasons emitted by the Tika driver.",
  })
);

/**
 * Type for {@link TikaErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type TikaErrorReason = typeof TikaErrorReason.Type;

/**
 * Technical failure raised inside the Tika driver boundary.
 *
 * @example
 * ```ts
 * import { makeTikaError } from "@beep/tika"
 *
 * const error = makeTikaError("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type TikaError = FileProcessingDriverError;

/**
 * Create a Tika technical error with a typed reason.
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeTikaError = makeFileProcessingDriverErrorFactory<TikaErrorReason>("tika");
