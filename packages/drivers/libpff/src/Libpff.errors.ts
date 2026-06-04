/**
 * Typed technical errors for the libpff driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $LibpffId } from "@beep/identity";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

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
 * @example
 * ```ts
 * import type { LibpffErrorReason } from "@beep/libpff"
 *
 * const reason: LibpffErrorReason = "engine-unavailable"
 * console.log(reason)
 * ```
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
 * import { LibpffError } from "@beep/libpff"
 *
 * const error = LibpffError.fromReason("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class LibpffError extends TaggedErrorClass<LibpffError>($I`LibpffError`)(
  "LibpffError",
  {
    cause: S.optionalKey(S.String),
    exitCode: S.optionalKey(NonNegativeInt),
    reason: LibpffErrorReason,
  },
  $I.annote("LibpffError", {
    description: "Redacted technical failure raised inside the libpff driver boundary.",
  })
) {
  /**
   * Create a libpff technical error with sanitized context.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    reason: LibpffErrorReason,
    options: { readonly cause?: string; readonly exitCode?: NonNegativeInt } = {}
  ): LibpffError =>
    LibpffError.make({
      reason,
      ...R.getSomes({ cause: O.fromUndefinedOr(options.cause) }),
      ...R.getSomes({ exitCode: O.fromUndefinedOr(options.exitCode) }),
    });
}

/**
 * Create a libpff technical error with a typed reason.
 *
 * @example
 * ```ts
 * import { makeLibpffError } from "@beep/libpff"
 *
 * const error = makeLibpffError("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeLibpffError = (
  reason: LibpffErrorReason,
  options: { readonly cause?: string; readonly exitCode?: NonNegativeInt } = {}
): LibpffError => LibpffError.fromReason(reason, options);
