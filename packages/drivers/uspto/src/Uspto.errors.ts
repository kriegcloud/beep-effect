/**
 * Typed technical errors for the USPTO driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $UsptoId } from "@beep/identity";
import { LiteralKit, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $UsptoId.create("Uspto.errors");

/**
 * Technical USPTO driver failure reasons.
 *
 * @example
 * ```ts
 * import { UsptoErrorReason } from "@beep/uspto"
 *
 * console.log(UsptoErrorReason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const UsptoErrorReason = LiteralKit([
  "config",
  "not-found",
  "rate-limited",
  "response-decoding",
  "response-status",
  "transport",
]).pipe(
  $I.annoteSchema("UsptoErrorReason", {
    description: "Redacted technical error reasons emitted by the USPTO driver.",
  })
);

/**
 * Type for {@link UsptoErrorReason}.
 *
 * @example
 * ```ts
 * import type { UsptoErrorReason } from "@beep/uspto"
 *
 * const reason: UsptoErrorReason = "transport"
 * console.log(reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type UsptoErrorReason = typeof UsptoErrorReason.Type;

/**
 * Technical failure raised inside the USPTO driver boundary.
 *
 * @example
 * ```ts
 * import { UsptoError } from "@beep/uspto"
 *
 * const error = UsptoError.fromReason("transport")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class UsptoError extends TaggedErrorClass<UsptoError>($I`UsptoError`)(
  "UsptoError",
  {
    cause: S.optionalKey(S.String),
    reason: UsptoErrorReason,
    status: S.optionalKey(NonNegativeInt),
  },
  $I.annote("UsptoError", {
    description: "Redacted technical failure raised inside the USPTO driver boundary.",
  })
) {
  /**
   * Create a USPTO technical error with sanitized context.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (
    reason: UsptoErrorReason,
    options: { readonly cause?: string; readonly status?: NonNegativeInt } = {}
  ): UsptoError =>
    UsptoError.make({
      reason,
      ...R.getSomes({ cause: O.fromUndefinedOr(options.cause) }),
      ...R.getSomes({ status: O.fromUndefinedOr(options.status) }),
    });
}

/**
 * Create a USPTO technical error with a typed reason.
 *
 * @example
 * ```ts
 * import { makeUsptoError } from "@beep/uspto"
 *
 * const error = makeUsptoError("response-decoding")
 * console.log(error.reason)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const makeUsptoError = (
  reason: UsptoErrorReason,
  options: { readonly cause?: string; readonly status?: NonNegativeInt } = {}
): UsptoError => UsptoError.fromReason(reason, options);
