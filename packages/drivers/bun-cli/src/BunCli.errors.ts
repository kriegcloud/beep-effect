/**
 * Typed errors for the Bun CLI driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $I as $PackagesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $BunCliId = $PackagesId.compose("bun-cli").$BunCliId;
const $I = $BunCliId.create("BunCli.errors");

/**
 * Options captured while normalizing unknown Bun CLI failures.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunCliErrorOptions extends S.Class<BunCliErrorOptions>($I`BunCliErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("BunCliErrorOptions", {
    description: "Optional process context captured while normalizing a Bun CLI failure.",
  })
) {}

/**
 * Technical failure raised by the Bun CLI driver boundary.
 *
 * @category errors
 * @since 0.0.0
 */
export class BunCliError extends TaggedErrorClass<BunCliError>($I`BunCliError`)(
  "BunCliError",
  {
    cause: S.optionalKey(S.DefectWithStack),
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    message: S.String,
    operation: S.String,
    stderr: S.optionalKey(S.String),
    stdout: S.optionalKey(S.String),
  },
  $I.annote("BunCliError", {
    description: "Technical failure emitted by the Bun CLI driver.",
  })
) {
  /**
   * Normalize a process or platform failure into a driver error.
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromUnknown: {
    (operation: string, message: string, options: BunCliErrorOptions): BunCliError;
    (message: string, options: BunCliErrorOptions): (operation: string) => BunCliError;
  } = dual(3, (operation: string, message: string, options: BunCliErrorOptions): BunCliError => {
    const { cause, ...context } = options;
    const normalizedCause = S.is(S.DefectWithStack)(cause) ? O.some(cause) : O.none();

    return new BunCliError({
      ...context,
      message,
      operation,
      ...(O.isSome(normalizedCause) ? { cause: normalizedCause.value } : {}),
    });
  });
}
