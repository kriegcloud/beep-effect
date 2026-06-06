/**
 * Typed errors for the 1Password CLI driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $OnepasswordCliId } from "@beep/identity";
import { TaggedErrorClass } from "@beep/schema";
import { P } from "@beep/utils";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $OnepasswordCliId.create("OnePasswordCli.errors");

/**
 * Options captured while normalizing unknown 1Password CLI failures.
 *
 * @example
 * ```ts
 * import { OnePasswordCliErrorOptions } from "@beep/onepassword-cli/OnePasswordCli.errors"
 *
 * console.log(OnePasswordCliErrorOptions)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class OnePasswordCliErrorOptions extends S.Class<OnePasswordCliErrorOptions>($I`OnePasswordCliErrorOptions`)(
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Finite),
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("OnePasswordCliErrorOptions", {
    description: "Optional redacted process context for a 1Password CLI failure.",
  })
) {}

/**
 * Technical failure raised by the `@beep/onepassword-cli` driver boundary.
 *
 * @example
 * ```ts
 * import { OnePasswordCliError } from "@beep/onepassword-cli/OnePasswordCli.errors"
 *
 * console.log(OnePasswordCliError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class OnePasswordCliError extends TaggedErrorClass<OnePasswordCliError>($I`OnePasswordCliError`)(
  "OnePasswordCliError",
  {
    cause: S.optionalKey(S.Defect({ includeStack: true })),
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Finite),
    message: S.String,
    operation: S.String,
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("OnePasswordCliError", {
    description: "Redacted technical failure emitted by the 1Password CLI driver.",
  })
) {
  /**
   * Normalize a process or platform failure into a driver error.
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown: {
    (operation: string, message: string, options: OnePasswordCliErrorOptions): OnePasswordCliError;
    (message: string, options: OnePasswordCliErrorOptions): (operation: string) => OnePasswordCliError;
  } = dual(3, (operation: string, message: string, options: OnePasswordCliErrorOptions): OnePasswordCliError => {
    const { cause, ...context } = options;
    const normalizedCause =
      P.hasInspectableObjectShape(cause) && S.is(S.Defect({ includeStack: true }))(cause) ? O.some(cause) : O.none();

    return OnePasswordCliError.make({
      ...context,
      message,
      operation,
      ...(O.isSome(normalizedCause) ? { cause: normalizedCause.value } : {}),
    });
  });
}
