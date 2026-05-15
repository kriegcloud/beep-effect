/**
 * Typed technical errors for the Sanity driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SanityId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { pipe, Result } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";

const $I = $SanityId.create("Sanity.errors");

/**
 * Technical error reasons emitted by the Sanity driver.
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
] as const).pipe(
  $I.annoteSchema("SanityErrorReason", {
    description: "Redacted technical error reasons emitted by the Sanity API driver.",
  })
);

/**
 * Type for {@link SanityErrorReason}.
 *
 * @category errors
 * @since 0.0.0
 */
export type SanityErrorReason = typeof SanityErrorReason.Type;

/**
 * Technical failure raised by the Sanity driver boundary.
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
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (reason: SanityErrorReason, options: SanityErrorOptions = {}): SanityError =>
    new SanityError({
      reason,
      ...R.getSomes({
        cause: causeFromUnknown(options.cause),
      }),
      ...R.getSomes({
        status: O.fromUndefinedOr(options.status),
      }),
      ...R.getSomes({
        url: O.fromUndefinedOr(options.url),
      }),
    });
}

/**
 * Options used when constructing Sanity driver errors.
 *
 * @category errors
 * @since 0.0.0
 */
export class SanityErrorOptions extends S.Class<SanityErrorOptions>($I`SanityErrorOptions`)(
  {
    cause: S.optionalKey(S.Unknown),
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
      () => undefined
    )
  );
};

const readString = (value: unknown, key: PropertyKey): O.Option<string> =>
  O.filter(readProperty(value, key), P.isString);

const safeBoolean = (evaluate: () => boolean): boolean => Result.getOrElse(Result.try(evaluate), () => false);

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
