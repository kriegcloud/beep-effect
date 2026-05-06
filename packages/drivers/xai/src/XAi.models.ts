/**
 * Schema-backed request and response models for the xAI driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $XaiId } from "@beep/identity";
import { LiteralKit } from "@beep/schema";
import { pipe, Tuple } from "effect";
import * as S from "effect/Schema";

const $I = $XaiId.create("XAi.models");

/**
 * URL query value accepted by xAI request options.
 *
 * @example
 * ```ts
 * import type { XAiQueryValue } from "@beep/xai"
 *
 * const value: XAiQueryValue = ["invoice", "usage"]
 * void value
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const XAiQueryValue = S.Union([
  S.Array(S.Union([S.Boolean, S.Null, S.Number, S.String])),
  S.Boolean,
  S.Null,
  S.Number,
  S.String,
]).pipe(
  $I.annoteSchema("XAiQueryValue", {
    description: "URL query value accepted by the xAI driver.",
  })
);

/**
 * Type for {@link XAiQueryValue}.
 *
 * @example
 * ```ts
 * import type { XAiQueryValue } from "@beep/xai"
 *
 * const value: XAiQueryValue = "usage"
 * void value
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type XAiQueryValue = typeof XAiQueryValue.Type;

/**
 * Request options accepted by every xAI endpoint method.
 *
 * `path` fills route parameters, `query` fills URL parameters, `body` sends
 * JSON, `formData` sends multipart/form-data, and `bytes` sends raw binary.
 *
 * @example
 * ```ts
 * import { XAiRequestOptions } from "@beep/xai"
 *
 * const request = new XAiRequestOptions({
 *   body: { model: "grok-4", messages: [] },
 *   query: { limit: 10 }
 * })
 *
 * void request
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiRequestOptions extends S.Class<XAiRequestOptions>($I`XAiRequestOptions`)(
  {
    accept: S.optionalKey(S.String),
    body: S.optionalKey(S.Unknown),
    bytes: S.optionalKey(S.Uint8Array),
    contentType: S.optionalKey(S.String),
    formData: S.optionalKey(S.instanceOf(FormData)),
    headers: S.optionalKey(S.Record(S.String, S.String)),
    path: S.optionalKey(S.Record(S.String, S.String)),
    query: S.optionalKey(S.Record(S.String, XAiQueryValue)),
  },
  $I.annote("XAiRequestOptions", {
    description: "Request options accepted by every xAI endpoint method.",
  })
) {}

/**
 * JSON response returned by the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiJsonResponse } from "@beep/xai"
 *
 * const response = new XAiJsonResponse({
 *   body: { ok: true },
 *   headers: {},
 *   status: 200
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiJsonResponse extends S.TaggedClass<XAiJsonResponse>($I`XAiJsonResponse`)(
  "Json",
  {
    body: S.Unknown,
    contentType: S.optionalKey(S.String),
    headers: S.Record(S.String, S.String),
    status: S.Number,
  },
  $I.annote("XAiJsonResponse", {
    description: "JSON response returned by the xAI driver.",
  })
) {}

/**
 * Text response returned by the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiTextResponse } from "@beep/xai"
 *
 * const response = new XAiTextResponse({
 *   headers: {},
 *   status: 200,
 *   text: "ok"
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiTextResponse extends S.TaggedClass<XAiTextResponse>($I`XAiTextResponse`)(
  "Text",
  {
    contentType: S.optionalKey(S.String),
    headers: S.Record(S.String, S.String),
    status: S.Number,
    text: S.String,
  },
  $I.annote("XAiTextResponse", {
    description: "Text response returned by the xAI driver.",
  })
) {}

/**
 * Binary response returned by the xAI driver.
 *
 * @example
 * ```ts
 * import { XAiBinaryResponse } from "@beep/xai"
 *
 * const response = new XAiBinaryResponse({
 *   bytes: new Uint8Array([1, 2, 3]),
 *   headers: {},
 *   status: 200
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiBinaryResponse extends S.TaggedClass<XAiBinaryResponse>($I`XAiBinaryResponse`)(
  "Binary",
  {
    bytes: S.Uint8Array,
    contentType: S.optionalKey(S.String),
    headers: S.Record(S.String, S.String),
    status: S.Number,
  },
  $I.annote("XAiBinaryResponse", {
    description: "Binary response returned by the xAI driver.",
  })
) {}

/**
 * Empty response returned by xAI endpoints that have no body.
 *
 * @example
 * ```ts
 * import { XAiNoBodyResponse } from "@beep/xai"
 *
 * const response = new XAiNoBodyResponse({
 *   headers: {},
 *   status: 204
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiNoBodyResponse extends S.TaggedClass<XAiNoBodyResponse>($I`XAiNoBodyResponse`)(
  "NoBody",
  {
    contentType: S.optionalKey(S.String),
    headers: S.Record(S.String, S.String),
    status: S.Number,
  },
  $I.annote("XAiNoBodyResponse", {
    description: "Empty response returned by xAI endpoints that have no body.",
  })
) {}

/**
 * Response union returned by non-streaming xAI endpoint methods.
 *
 * @example
 * ```ts
 * import type { XAiResponse } from "@beep/xai"
 *
 * const tag = (response: XAiResponse) => response._tag
 * void tag
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const XAiResponse = S.Union([XAiBinaryResponse, XAiJsonResponse, XAiNoBodyResponse, XAiTextResponse]).pipe(
  $I.annoteSchema("XAiResponse", {
    description: "Response union returned by non-streaming xAI endpoint methods.",
  })
);

/**
 * Type for {@link XAiResponse}.
 *
 * @example
 * ```ts
 * import { XAiJsonResponse } from "@beep/xai"
 * import type { XAiResponse } from "@beep/xai"
 *
 * const response: XAiResponse = new XAiJsonResponse({
 *   body: { ok: true },
 *   headers: {},
 *   status: 200
 * })
 *
 * void response
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type XAiResponse = typeof XAiResponse.Type;

/**
 * Parsed server-sent event emitted by streaming xAI endpoints.
 *
 * @example
 * ```ts
 * import { XAiServerSentEvent } from "@beep/xai"
 *
 * const event = new XAiServerSentEvent({
 *   data: { delta: "hello" },
 *   done: false,
 *   index: 0
 * })
 *
 * void event
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class XAiServerSentEvent extends S.Class<XAiServerSentEvent>($I`XAiServerSentEvent`)(
  {
    data: S.optionalKey(S.Unknown),
    done: S.Boolean,
    index: S.Number,
  },
  $I.annote("XAiServerSentEvent", {
    description: "Parsed server-sent event emitted by streaming xAI endpoints.",
  })
) {}

/**
 * WebSocket event kinds emitted by xAI realtime and streaming audio sessions.
 *
 * @example
 * ```ts
 * import type { XAiWebSocketEventKind } from "@beep/xai"
 *
 * const kind: XAiWebSocketEventKind = "message"
 * void kind
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const XAiWebSocketEventKind = LiteralKit(["close", "error", "message"] as const).pipe(
  $I.annoteSchema("XAiWebSocketEventKind", {
    description: "WebSocket event kinds emitted by xAI realtime and streaming audio sessions.",
  })
);

/**
 * Type for {@link XAiWebSocketEventKind}.
 *
 * @example
 * ```ts
 * import type { XAiWebSocketEventKind } from "@beep/xai"
 *
 * const kind: XAiWebSocketEventKind = "message"
 * void kind
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type XAiWebSocketEventKind = typeof XAiWebSocketEventKind.Type;

type XAiWebSocketEventMember<T extends XAiWebSocketEventKind> = {
  readonly bytes?: Uint8Array;
  readonly code?: number;
  readonly data?: unknown;
  readonly isBinary?: boolean;
  readonly kind: T;
  readonly reason?: string;
  readonly text?: string;
};

/**
 * Event emitted by an xAI WebSocket endpoint session.
 *
 * @example
 * ```ts
 * import { XAiWebSocketEvent } from "@beep/xai"
 *
 * const event: XAiWebSocketEvent = {
 *   kind: "message",
 *   text: "{\"type\":\"session.created\"}"
 * }
 *
 * void event
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const XAiWebSocketEvent = XAiWebSocketEventKind.mapMembers((members) => {
  const make = <T extends XAiWebSocketEventKind>(literal: S.Literal<T>) =>
    S.Class<XAiWebSocketEventMember<T>>($I`XAiWebSocketEventMember`)(
      {
        bytes: S.optionalKey(S.Uint8Array),
        code: S.optionalKey(S.Number),
        data: S.optionalKey(S.Unknown),
        isBinary: S.optionalKey(S.Boolean),
        kind: S.tag(literal.literal),
        reason: S.optionalKey(S.String),
        text: S.optionalKey(S.String),
      },
      $I.annote("XAiWebSocketEventMember", {
        description: "Event member emitted by an xAI WebSocket endpoint session.",
      })
    );

  return pipe(members, Tuple.evolve([make, make, make]));
}).pipe(
  $I.annoteSchema("XAiWebSocketEvent", {
    description: "Event emitted by an xAI WebSocket endpoint session.",
  }),
  S.toTaggedUnion("kind")
);

/**
 * Type for {@link XAiWebSocketEvent}.
 *
 * @example
 * ```ts
 * import type { XAiWebSocketEvent } from "@beep/xai"
 *
 * const event: XAiWebSocketEvent = { kind: "message", text: "ok" }
 * void event
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type XAiWebSocketEvent = typeof XAiWebSocketEvent.Type;
