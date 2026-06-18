/**
 * Typed technical errors for the Microsoft 365 (Graph) driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $M365Id } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O } from "@beep/utils";
import { Effect, flow, pipe, Result } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";

const $I = $M365Id.create("M365.errors");

/**
 * Technical error reasons emitted by the Microsoft 365 driver.
 *
 * @example
 * ```ts
 * import { M365ErrorReason } from "@beep/m365"
 *
 * console.log(M365ErrorReason.is.throttled("throttled")) // true
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const M365ErrorReason = LiteralKit([
  "config",
  "auth",
  "request encoding",
  "response decoding",
  "response status",
  "transport",
  "throttled",
  "encrypted item",
]).pipe(
  $I.annoteSchema("M365ErrorReason", {
    description: "Redacted technical error reasons emitted by the Microsoft 365 Graph driver.",
  })
);

/**
 * Type for {@link M365ErrorReason}.
 *
 * @example
 * ```ts
 * import type { M365ErrorReason as M365ErrorReasonType } from "@beep/m365"
 *
 * const reason: M365ErrorReasonType = "throttled"
 * console.log(reason) // "throttled"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type M365ErrorReason = typeof M365ErrorReason.Type;

type M365ErrorOptionsInput = {
  readonly cause?: unknown;
  readonly itemId?: string;
  readonly resource?: string;
  readonly retryAfterSeconds?: number;
  readonly status?: number;
  readonly url?: string;
};

/**
 * Technical failure raised by the Microsoft 365 driver boundary.
 *
 * Carries only sanitized, technical context (reason, HTTP status, requested
 * resource, item id, throttle hint) modeled as `Option`. Never raw file
 * content, mail bodies, or tokens.
 *
 * @example
 * ```ts
 * import { M365Error } from "@beep/m365"
 *
 * const error = M365Error.fromReason("throttled", {
 *   resource: "drives",
 *   status: 429,
 *   retryAfterSeconds: 12
 * })
 *
 * console.log(error.reason) // "throttled"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class M365Error extends TaggedErrorClass<M365Error>($I`M365Error`)(
  "M365Error",
  {
    reason: M365ErrorReason.annotateKey({ description: "Redacted technical failure reason." }),
    cause: S.OptionFromOptionalKey(S.String).annotateKey({ description: "Sanitized cause label (tag/name), if any." }),
    itemId: S.OptionFromOptionalKey(S.String).annotateKey({ description: "Graph item id involved, if any." }),
    resource: S.OptionFromOptionalKey(S.String).annotateKey({
      description: "Graph resource family (drives/sites/messages/events), if any.",
    }),
    retryAfterSeconds: S.OptionFromOptionalKey(S.Finite).annotateKey({
      description: "Honored Retry-After delay in seconds, if the response was throttled.",
    }),
    status: S.OptionFromOptionalKey(S.Finite).annotateKey({ description: "HTTP status code, if any." }),
    url: S.OptionFromOptionalKey(S.String).annotateKey({ description: "Request URL involved, if any." }),
  },
  $I.annote("M365Error", {
    description: "Redacted technical failure raised by the Microsoft 365 Graph driver boundary.",
  })
) {
  /**
   * Create a Microsoft 365 driver error.
   *
   * @example
   * ```ts
   * import { M365Error } from "@beep/m365"
   *
   * const error = M365Error.fromReason("response status", { status: 401, resource: "messages" })
   * console.log(error.reason) // "response status"
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly fromReason = (reason: M365ErrorReason, options: M365ErrorOptionsInput = {}): M365Error =>
    M365Error.make({
      reason,
      cause: causeFromUnknown(options.cause),
      itemId: O.fromUndefinedOr(options.itemId),
      resource: O.fromUndefinedOr(options.resource),
      retryAfterSeconds: O.fromUndefinedOr(options.retryAfterSeconds),
      status: O.fromUndefinedOr(options.status),
      url: O.fromUndefinedOr(options.url),
    });

  /**
   * Create a failed Effect containing a Microsoft 365 driver error.
   *
   * @example
   * ```ts
   * import { M365Error } from "@beep/m365"
   *
   * const effect = M365Error.failEffectFromReason("transport")
   * console.log(effect)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly failEffectFromReason = flow(this.fromReason, Effect.fail);

  /**
   * Create a thunk returning a failed Effect containing a Microsoft 365 driver error.
   *
   * @example
   * ```ts
   * import { M365Error } from "@beep/m365"
   *
   * const thunk = M365Error.failEffectFromReasonThunk("config")
   * console.log(thunk)
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly failEffectFromReasonThunk = flow(this.failEffectFromReason, (effect) => () => effect);
}

const readProperty = (value: unknown, key: PropertyKey): O.Option<unknown> => {
  const target = O.fromNullishOr(value);

  return pipe(
    target,
    O.filter(P.isObject),
    O.flatMap((object) =>
      Result.match(
        Result.try(() => Reflect.get(object, key)),
        {
          onFailure: O.none,
          onSuccess: O.fromUndefinedOr,
        }
      )
    )
  );
};

const readString =
  (key: PropertyKey) =>
  (value: unknown): O.Option<string> =>
    pipe(readProperty(value, key), O.filter(P.isString));

const safeBoolean = (evaluate: () => boolean): boolean =>
  pipe(
    Result.try(evaluate),
    Result.getOrElse(() => false)
  );

const httpClientCauseLabel = (cause: unknown): O.Option<string> =>
  pipe(
    O.fromNullishOr(cause),
    O.filter((value) => safeBoolean(() => HttpClientError.isHttpClientError(value))),
    O.flatMap((value) => readProperty(value, "reason")),
    O.flatMap(readString("_tag")),
    O.map((tag) => `HttpClientError:${tag}`)
  );

const stringCauseLabel = (cause: unknown): O.Option<string> => (P.isString(cause) ? O.some("String") : O.none());

const causeLabelReaders: ReadonlyArray<(cause: unknown) => O.Option<string>> = [
  httpClientCauseLabel,
  readString("_tag"),
  readString("name"),
  stringCauseLabel,
];

const causeFromUnknown = (cause: unknown): O.Option<string> =>
  pipe(
    causeLabelReaders,
    A.findFirst((reader) => O.isSome(reader(cause))),
    O.flatMap((reader) => reader(cause))
  );
