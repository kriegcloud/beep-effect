/**
 * Technical errors raised by the PGlite driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PgliteId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import * as S from "effect/Schema";

const $I = $PgliteId.create("Pglite.errors");

const decodeDefectOption = S.decodeUnknownOption(S.Defect({ includeStack: true }));

const getErrorMessage = (value: unknown): O.Option<string> =>
  value instanceof Error ? O.some(value.message) : O.none();

/**
 * Technical failure raised by the `@beep/pglite` driver boundary.
 *
 * `operation` identifies the driver operation that failed (for example
 * `"connect"`). The originating defect is preserved in `cause`. These are
 * driver-internal failures: server adapters translate them into port-declared
 * errors and they never escape as themselves.
 *
 * @example
 * ```ts
 * import { PgliteError } from "@beep/pglite"
 *
 * const error = PgliteError.fromUnknown("connect", new Error("boom"))
 * console.log(error.operation)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class PgliteError extends TaggedErrorClass<PgliteError>($I`PgliteError`)(
  "PgliteError",
  {
    operation: S.String,
    cause: S.OptionFromOptionalKey(S.Defect({ includeStack: true })),
    message: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("PgliteError", {
    description: "Technical PGlite driver failure scoped to a driver operation.",
  })
) {
  /**
   * Normalize an unknown PGlite-adjacent failure into a {@link PgliteError}.
   *
   * @example
   * ```ts
   * import { PgliteError } from "@beep/pglite"
   *
   * const error = PgliteError.fromUnknown("connect", new Error("failed"))
   * console.log(error)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown = (operation: string, cause?: unknown): PgliteError =>
    PgliteError.make({
      operation,
      cause: decodeDefectOption(cause),
      message: getErrorMessage(cause),
    });
}
