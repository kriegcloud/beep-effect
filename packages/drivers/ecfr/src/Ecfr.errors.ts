/**
 * Typed technical errors for the eCFR driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $EcfrId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $EcfrId.create("Ecfr.errors");

/**
 * Technical error reasons emitted by the eCFR REST API driver.
 *
 * @example
 * ```ts
 * import { EcfrErrorReason } from "@beep/ecfr"
 *
 * console.log(EcfrErrorReason.ast)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const EcfrErrorReason = LiteralKit(["config", "response decoding", "response status", "transport"]).pipe(
  $I.annoteSchema("EcfrErrorReason", {
    description: "Redacted technical error reasons emitted by the eCFR REST API driver.",
  })
);

/**
 * Type for {@link EcfrErrorReason}.
 *
 * @example
 * ```ts
 * import type { EcfrErrorReason } from "@beep/ecfr"
 *
 * const reason: EcfrErrorReason = "transport"
 * console.log(reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type EcfrErrorReason = typeof EcfrErrorReason.Type;

/**
 * Options used when constructing {@link EcfrError} instances.
 *
 * @example
 * ```ts
 * import { EcfrErrorOptions } from "@beep/ecfr"
 *
 * const options = EcfrErrorOptions.make({ status: 503 })
 * console.log(options.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class EcfrErrorOptions extends S.Class<EcfrErrorOptions>($I`EcfrErrorOptions`)(
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    status: S.optionalKey(S.Finite),
  },
  $I.annote("EcfrErrorOptions", {
    description: "Options for configuring EcfrError instances.",
  })
) {}

/**
 * Technical failure raised by the eCFR REST API driver boundary.
 *
 * @example
 * ```ts
 * import { EcfrError } from "@beep/ecfr"
 *
 * const error = EcfrError.of("transport")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class EcfrError extends TaggedErrorClass<EcfrError>($I`EcfrError`)(
  "EcfrError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    reason: EcfrErrorReason,
    status: S.optionalKey(S.Finite),
  },
  $I.annote("EcfrError", {
    description: "Redacted technical failure raised by the eCFR REST API driver boundary.",
  })
) {
  /**
   * Create an eCFR driver error for a reason, optionally carrying a cause and status.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly of = (reason: EcfrErrorReason, options: EcfrErrorOptions = EcfrErrorOptions.make({})): EcfrError =>
    EcfrError.make({
      reason,
      ...O.getSomesStruct({
        cause: O.fromUndefinedOr(options.cause),
        status: O.fromUndefinedOr(options.status),
      }),
    });

  /**
   * Create an eCFR configuration error.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly config = (cause?: unknown): EcfrError =>
    EcfrError.make({
      reason: "config",
      ...O.getSomesStruct({
        cause: O.fromUndefinedOr(cause),
      }),
    });
}
