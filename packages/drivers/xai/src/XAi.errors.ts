/**
 * Typed technical errors for the xAI driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $XaiId } from "@beep/identity";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import {
  XAiEndpoint,
  type XAiEndpointDescriptor,
  XAiEndpointId,
  XAiEndpointMethodName,
  XAiHttpMethod,
} from "./XAi.endpoints.ts";

const $I = $XaiId.create("XAi.errors");

/**
 * Technical error reasons emitted by the xAI driver.
 *
 * @example
 * ```ts
 * import type { XAiErrorReason } from "@beep/xai"
 *
 * const reason: XAiErrorReason = "response status"
 * void reason
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
] as const).pipe(
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
 * void reason
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
 * void error.reason
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class XAiError extends TaggedErrorClass<XAiError>($I`XAiError`)(
  "XAiError",
  {
    cause: S.optionalKey(S.Unknown),
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
   * void error.endpoint
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
      new XAiError({
        endpoint: descriptor.id,
        method: descriptor.method,
        methodName: descriptor.methodName,
        path: descriptor.path,
        reason,
        ...R.getSomes({
          cause: O.fromUndefinedOr(options.cause),
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
   * void error.reason
   * ```
   *
   * @category errors
   * @since 0.0.0
   */
  static readonly config = (cause?: unknown): XAiError =>
    new XAiError({
      reason: "config",
      ...R.getSomes({
        cause: O.fromUndefinedOr(cause),
      }),
    });
}

/**
 * Options used when constructing xAI driver errors.
 *
 * @example
 * ```ts
 * import { XAiErrorOptions } from "@beep/xai"
 *
 * const options = new XAiErrorOptions({ status: 500 })
 * void options
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
    description: "Options for configuring XAiError instances, including optional cause and status fields.",
  })
) {}
