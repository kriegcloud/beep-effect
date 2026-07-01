/**
 * Typed technical errors for the GovInfo driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $GovinfoId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $GovinfoId.create("Govinfo.errors");

/**
 * Technical error reasons emitted by the GovInfo REST API driver.
 *
 * @example
 * ```ts
 * import { GovinfoErrorReason } from "@beep/govinfo"
 *
 * console.log(GovinfoErrorReason.ast)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const GovinfoErrorReason = LiteralKit([
  "config",
  "request encoding",
  "response decoding",
  "response status",
  "transport",
]).pipe(
  $I.annoteSchema("GovinfoErrorReason", {
    description: "Redacted technical error reasons emitted by the GovInfo REST API driver.",
  })
);

/**
 * Type for {@link GovinfoErrorReason}.
 *
 * @example
 * ```ts
 * import type { GovinfoErrorReason } from "@beep/govinfo"
 *
 * const reason: GovinfoErrorReason = "transport"
 * console.log(reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type GovinfoErrorReason = typeof GovinfoErrorReason.Type;

/**
 * Options used when constructing {@link GovinfoError} instances.
 *
 * @example
 * ```ts
 * import { GovinfoErrorOptions } from "@beep/govinfo"
 *
 * const options = GovinfoErrorOptions.make({ status: 429 })
 * console.log(options.status)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GovinfoErrorOptions extends S.Class<GovinfoErrorOptions>($I`GovinfoErrorOptions`)(
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    status: S.optionalKey(S.Finite),
  },
  $I.annote("GovinfoErrorOptions", {
    description: "Options for configuring GovinfoError instances.",
  })
) {}

/**
 * Technical failure raised by the GovInfo REST API driver boundary.
 *
 * @example
 * ```ts
 * import { GovinfoError } from "@beep/govinfo"
 *
 * const error = GovinfoError.of("config")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class GovinfoError extends TaggedErrorClass<GovinfoError>($I`GovinfoError`)(
  "GovinfoError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    reason: GovinfoErrorReason,
    status: S.optionalKey(S.Finite),
  },
  $I.annote("GovinfoError", {
    description: "Redacted technical failure raised by the GovInfo REST API driver boundary.",
  })
) {
  /**
   * Create a GovInfo driver error for a reason, optionally carrying a cause and status.
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly of = (
    reason: GovinfoErrorReason,
    options: GovinfoErrorOptions = GovinfoErrorOptions.make({})
  ): GovinfoError =>
    GovinfoError.make({
      reason,
      ...O.getSomesStruct({
        cause: O.fromUndefinedOr(options.cause),
        status: O.fromUndefinedOr(options.status),
      }),
    });

  /**
   * Create a GovInfo configuration error (for example, a missing API key).
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly config = (cause?: unknown): GovinfoError =>
    GovinfoError.make({
      reason: "config",
      ...O.getSomesStruct({
        cause: O.fromUndefinedOr(cause),
      }),
    });
}
