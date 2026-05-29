/**
 * Typed technical errors for the Sanity driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SanityId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O, thunkFalse, thunkUndefined } from "@beep/utils";
import { pipe, Result } from "effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";

const $I = $SanityId.create("Sanity.errors");

/**
 * Technical error reasons emitted by the Sanity driver.
 *
 * @example
 * ```ts
 * import { SanityErrorReason } from "@beep/sanity"
 * import * as S from "effect/Schema"
 *
 * const isReason = S.is(SanityErrorReason)
 *
 * console.log(isReason("transport")) // true
 * console.log(isReason("unexpected")) // false
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const SanityErrorReason = LiteralKit([
  "config",
  "request encoding",
  "response decoding",
  "response status",
  "transport",
]).pipe(
  $I.annoteSchema("SanityErrorReason", {
    description: "Redacted technical error reasons emitted by the Sanity API driver.",
  })
);

/**
 * Type for {@link SanityErrorReason}.
 *
 * @example
 * ```ts
 * import type { SanityErrorReason } from "@beep/sanity"
 *
 * const reason: SanityErrorReason = "response decoding"
 *
 * console.log(reason) // "response decoding"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type SanityErrorReason = typeof SanityErrorReason.Type;

/**
 * Technical failure raised by the Sanity driver boundary.
 *
 * @example
 * ```ts
 * import { SanityError } from "@beep/sanity"
 *
 * const error = SanityError.fromReason("response status", {
 *   status: 404,
 *   url: "https://api.sanity.io/v2025-05-14/data/query/production"
 * })
 *
 * console.log(error.reason) // "response status"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SanityError extends TaggedErrorClass<SanityError>($I`SanityError`)(
  "SanityError",
  {
    cause: S.optionalKey(S.String),
    reason: SanityErrorReason,
    status: S.optionalKey(S.Number),
    url: S.optionalKey(S.String),
  },
  $I.annote("SanityError", {
    description: "Redacted technical failure raised by the Sanity API driver boundary.",
  })
) {
  /**
   * Create a Sanity driver error.
   *
   * @example
   * ```ts
   * import { SanityError } from "@beep/sanity"
   *
   * const error = SanityError.fromReason("transport", {
   *   cause: new Error("connection reset")
   * })
   *
   * console.log(error.cause) // "Error"
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (reason: SanityErrorReason, options: SanityErrorOptions = {}): SanityError =>
    SanityError.make({
      reason,
      ...O.getSomesStruct({
        cause: causeFromUnknown(options.cause),
        status: O.fromUndefinedOr(options.status),
        url: O.fromUndefinedOr(options.url),
      }),
    });
}

/**
 * Options used when constructing Sanity driver errors.
 *
 * @example
 * ```ts
 * import { SanityErrorOptions } from "@beep/sanity"
 *
 * const options = SanityErrorOptions.make({
 *   status: 500,
 *   url: "https://api.sanity.io/v2025-05-14/data/query/production"
 * })
 *
 * console.log(options.status) // 500
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class SanityErrorOptions extends S.Class<SanityErrorOptions>($I`SanityErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    status: S.optionalKey(S.Number),
    url: S.optionalKey(S.String),
  },
  $I.annote("SanityErrorOptions", {
    description: "Options for configuring SanityError instances.",
  })
) {}

const readProperty = (value: unknown, key: PropertyKey): O.Option<unknown> => {
  if (!P.isObject(value)) {
    return O.none();
  }

  return O.fromUndefinedOr(
    Result.getOrElse(
      Result.try(() => Reflect.get(value, key)),
      thunkUndefined
    )
  );
};

const readString = (value: unknown, key: PropertyKey): O.Option<string> =>
  O.filter(readProperty(value, key), P.isString);

const safeBoolean = (evaluate: () => boolean): boolean => Result.getOrElse(Result.try(evaluate), thunkFalse);

const httpClientCauseLabel = (cause: unknown): O.Option<string> =>
  safeBoolean(() => HttpClientError.isHttpClientError(cause))
    ? pipe(
        readProperty(cause, "reason"),
        O.flatMap((reason) => readString(reason, "_tag")),
        O.map((tag) => `HttpClientError:${tag}`)
      )
    : O.none();

const causeFromUnknown = (cause: unknown): O.Option<string> =>
  P.isUndefined(cause)
    ? O.none()
    : O.firstSomeOf([
        httpClientCauseLabel(cause),
        readString(cause, "_tag"),
        readString(cause, "name"),
        P.isString(cause) ? O.some("String") : O.none(),
      ]);
