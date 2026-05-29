/**
 * Typed technical errors for the Phoenix driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $PhoenixId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { Result } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $PhoenixId.create("Phoenix.errors");

/**
 * Driver operation names surfaced in {@link PhoenixError} diagnostics.
 *
 * @example
 * ```ts
 * import { PhoenixOperation } from "@beep/phoenix"
 *
 * console.log(PhoenixOperation.Enum.createDataset)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const PhoenixOperation = LiteralKit([
  "addAnnotation",
  "appendDatasetExamples",
  "createDataset",
  "createExperiment",
  "createPrompt",
  "doctor",
  "getDatasetExamples",
  "getDatasetInfo",
  "getExperimentInfo",
  "getPrompt",
  "init",
]).pipe(
  $I.annoteSchema("PhoenixOperation", {
    description: "Phoenix driver operation names used in technical error diagnostics.",
  })
);

/**
 * Type for {@link PhoenixOperation}.
 *
 * @category errors
 * @since 0.0.0
 */
export type PhoenixOperation = typeof PhoenixOperation.Type;
const isPhoenixOperation = S.is(PhoenixOperation);

/**
 * Technical error reasons emitted by the Phoenix driver.
 *
 * @example
 * ```ts
 * import { PhoenixErrorReason } from "@beep/phoenix"
 *
 * console.log(PhoenixErrorReason.Enum.transport)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const PhoenixErrorReason = LiteralKit(["config", "response decoding", "transport"]).pipe(
  $I.annoteSchema("PhoenixErrorReason", {
    description: "Redacted technical error reasons emitted by the Phoenix driver.",
  })
);

/**
 * Type for {@link PhoenixErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type PhoenixErrorReason = typeof PhoenixErrorReason.Type;

/**
 * Options used when constructing Phoenix driver errors.
 *
 * @example
 * ```ts
 * import { PhoenixErrorOptions } from "@beep/phoenix"
 *
 * const options = PhoenixErrorOptions.make({ cause: "network" })
 * console.log(options)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class PhoenixErrorOptions extends S.Class<PhoenixErrorOptions>($I`PhoenixErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
  },
  $I.annote("PhoenixErrorOptions", {
    description: "Options for configuring PhoenixError instances, including optional redacted cause data.",
  })
) {}

/**
 * Technical failure raised by the Phoenix driver boundary.
 *
 * @example
 * ```ts
 * import { PhoenixError } from "@beep/phoenix"
 *
 * const error = PhoenixError.operation("doctor", "transport")
 * console.log(error.operation)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class PhoenixError extends TaggedErrorClass<PhoenixError>($I`PhoenixError`)(
  "PhoenixError",
  {
    cause: S.optionalKey(S.String),
    operation: PhoenixOperation,
    reason: PhoenixErrorReason,
  },
  $I.annote("PhoenixError", {
    description: "Redacted technical failure raised by the Phoenix driver boundary.",
  })
) {
  /**
   * Create a Phoenix driver error scoped to one operation.
   *
   * @example
   * ```ts
   * import { PhoenixError } from "@beep/phoenix"
   *
   * const error = PhoenixError.operation("createDataset", "transport", { cause: "offline" })
   * console.log(error.reason)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly operation: {
    (
      operation: PhoenixOperation,
      reason: PhoenixErrorReason,
      options?: PhoenixErrorOptions | { readonly cause?: unknown }
    ): PhoenixError;
    (
      reason: PhoenixErrorReason,
      options?: PhoenixErrorOptions | { readonly cause?: unknown }
    ): (operation: PhoenixOperation) => PhoenixError;
  } = dual(
    (args) => args.length >= 2 && isPhoenixOperation(args[0]),
    (
      operation: PhoenixOperation,
      reason: PhoenixErrorReason,
      options: PhoenixErrorOptions | { readonly cause?: unknown } = {}
    ): PhoenixError =>
      PhoenixError.make({
        operation,
        reason,
        ...R.getSomes({
          cause: causeFromUnknown(options.cause),
        }),
      })
  );
}

const readProperty = (value: unknown, key: PropertyKey): O.Option<unknown> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  return O.fromUndefinedOr(
    Result.getOrElse(
      Result.try(() => Reflect.get(value, key)),
      () => undefined
    )
  );
};

const readString = (value: unknown, key: PropertyKey): O.Option<string> =>
  O.filter(readProperty(value, key), P.isString);

const causeFromUnknown = (cause: unknown): O.Option<string> =>
  P.isUndefined(cause)
    ? O.none()
    : O.firstSomeOf([
        readString(cause, "_tag"),
        readString(cause, "message"),
        readString(cause, "name"),
        P.isString(cause) ? O.some("String") : O.none(),
      ]);
