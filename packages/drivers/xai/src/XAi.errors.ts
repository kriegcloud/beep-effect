/**
 * Typed technical errors for the xAI driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $XaiId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { pipe, Result } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import { XAiEndpoint, XAiEndpointId, XAiEndpointMethodName, XAiHttpMethod } from "./XAiEndpoints.models.ts";
import type { XAiEndpointDescriptor } from "./XAiEndpoints.models.ts";

const $I = $XaiId.create("XAi.errors");

/**
 * Technical error reasons emitted by the xAI driver.
 *
 * @example
 * ```ts
 * import type { XAiErrorReason } from "@beep/xai"
 *
 * const reason: XAiErrorReason = "response status"
 * console.log(reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const XAiErrorReason = LiteralKit([
  "config",
  "multipart encoding",
  "request encoding",
  "response decoding",
  "response status",
  "sse decoding",
  "transport",
  "websocket",
]).pipe(
  $I.annoteSchema("XAiErrorReason", {
    description: "Redacted technical error reasons emitted by the xAI driver.",
  })
);

/**
 * Type for {@link XAiErrorReason}.
 *
 * @example
 * ```ts
 * import type { XAiErrorReason } from "@beep/xai"
 *
 * const reason: XAiErrorReason = "transport"
 * console.log(reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type XAiErrorReason = typeof XAiErrorReason.Type;

const isXAiEndpointDescriptor = S.is(XAiEndpoint);

/**
 * Technical failure raised by the xAI driver boundary.
 *
 * @example
 * ```ts
 * import { XAiError, XAI_ENDPOINTS } from "@beep/xai"
 *
 * const error = XAiError.fromDescriptor(XAI_ENDPOINTS[0], "transport")
 * console.log(error.reason)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class XAiError extends TaggedErrorClass<XAiError>($I`XAiError`)(
  "XAiError",
  {
    cause: S.optionalKey(S.String),
    endpoint: S.optionalKey(XAiEndpointId),
    method: S.optionalKey(XAiHttpMethod),
    methodName: S.optionalKey(XAiEndpointMethodName),
    path: S.optionalKey(S.String),
    reason: XAiErrorReason,
    status: S.optionalKey(S.Number),
  },
  $I.annote("XAiError", {
    description: "Redacted technical failure raised by the xAI driver boundary.",
  })
) {
  /**
   * Create a driver error scoped to a documented xAI endpoint.
   *
   * @example
   * ```ts
   * import { XAiError, XAI_ENDPOINTS } from "@beep/xai"
   *
   * const error = XAiError.fromDescriptor(XAI_ENDPOINTS[0], "request encoding")
   * console.log(error.endpoint)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly fromDescriptor: {
    (descriptor: XAiEndpointDescriptor, reason: XAiErrorReason, options?: XAiErrorOptions): XAiError;
    (reason: XAiErrorReason, options?: XAiErrorOptions): (descriptor: XAiEndpointDescriptor) => XAiError;
  } = dual(
    (args) => args.length >= 2 && isXAiEndpointDescriptor(args[0]),
    (descriptor: XAiEndpointDescriptor, reason: XAiErrorReason, options: XAiErrorOptions = {}): XAiError =>
      XAiError.make({
        endpoint: descriptor.id,
        method: descriptor.method,
        methodName: descriptor.methodName,
        path: descriptor.path,
        reason,
        ...R.getSomes({
          cause: causeFromUnknown(options.cause),
        }),
        ...R.getSomes({
          status: O.fromUndefinedOr(options.status),
        }),
      })
  );

  /**
   * Create a configuration error before a specific endpoint exists.
   *
   * @example
   * ```ts
   * import { XAiError } from "@beep/xai"
   *
   * const error = XAiError.config()
   * console.log(error.reason)
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly config = (cause?: unknown): XAiError =>
    XAiError.make({
      reason: "config",
      ...R.getSomes({
        cause: causeFromUnknown(cause),
      }),
    });
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

/**
 * Options used when constructing xAI driver errors.
 *
 * @example
 * ```ts
 * import { XAiErrorOptions } from "@beep/xai"
 *
 * const options = XAiErrorOptions.make({ status: 500 })
 * console.log(options)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class XAiErrorOptions extends S.Class<XAiErrorOptions>($I`XAiErrorOptions`)(
  {
    cause: S.optionalKey(S.DefectWithStack),
    status: S.optionalKey(S.Number),
  },
  $I.annote("XAiErrorOptions", {
    description: "Options for configuring XAiError instances, including optional redacted cause and status fields.",
  })
) {}
