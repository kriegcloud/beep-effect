/**
 * Typed technical errors for the Tika driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $TikaId } from "@beep/identity";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

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
 * @example
 * ```ts
 * import type { TikaErrorReason } from "@beep/tika"
 *
 * const reason: TikaErrorReason = "engine-unavailable"
 * console.log(reason)
 * ```
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
 * import { TikaError } from "@beep/tika"
 *
 * const error = TikaError.fromReason("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class TikaError extends TaggedErrorClass<TikaError>($I`TikaError`)(
  "TikaError",
  {
    cause: S.optionalKey(S.String),
    reason: TikaErrorReason,
    statusCode: S.optionalKey(NonNegativeInt),
  },
  $I.annote("TikaError", {
    description: "Redacted technical failure raised inside the Tika driver boundary.",
  })
) {
  /**
   * Create a Tika technical error with sanitized context.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    reason: TikaErrorReason,
    options: { readonly cause?: string; readonly statusCode?: NonNegativeInt } = {}
  ): TikaError =>
    TikaError.make({
      reason,
      ...R.getSomes({ cause: O.fromUndefinedOr(options.cause) }),
      ...R.getSomes({ statusCode: O.fromUndefinedOr(options.statusCode) }),
    });
}

/**
 * Create a Tika technical error with a typed reason.
 *
 * @example
 * ```ts
 * import { makeTikaError } from "@beep/tika"
 *
 * const error = makeTikaError("engine-unavailable")
 * console.log(error.reason)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeTikaError = (
  reason: TikaErrorReason,
  options: { readonly cause?: string; readonly statusCode?: NonNegativeInt } = {}
): TikaError => TikaError.fromReason(reason, options);
