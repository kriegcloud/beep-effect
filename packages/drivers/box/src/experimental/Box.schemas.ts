import { $BoxId } from "@beep/identity";
import { HttpMethod } from "@beep/schema/HttpMethod";
import { HttpStatus } from "@beep/schema/HttpStatus";
import * as Box from "box-node-sdk/box";
import * as BoxSchemas from "box-node-sdk/schemas";
import * as S from "effect/Schema";

const $I = $BoxId.create("experimental/Box.schemas");

/**
 * Namespace for {@link SerializedData} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedData.Encoded = ["report.pdf", 1024, true, null]
 * console.log(encoded)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedData {
  /**
   * The encoded form of {@link SerializedData}, expressed recursively to break the schema cycle.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded =
    | undefined
    | null
    | boolean
    | number
    | string
    | SerializedDataList.Encoded
    | SerializedDataMap.Encoded;
}

/**
 * Recursive schema for serializable Box payload data: primitives, lists, and string-keyed maps.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedData)({ name: "report.pdf", size: 1024 })
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedData = S.Union([
  S.Undefined,
  S.Null,
  S.Boolean,
  S.Finite,
  S.String,
  S.suspend((): S.Codec<SerializedDataList.Encoded> => SerializedDataList),
  S.suspend((): S.Codec<SerializedDataMap.Encoded> => SerializedDataMap),
]).pipe(
  $I.annoteSchema("SerializedData", {
    description:
      "A schema for serializable data types used in the Box driver, including undefined, null, booleans, numbers, strings, lists, and maps.",
  })
);

/**
 * Type for {@link SerializedData}. {@inheritDoc SerializedData}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedData = typeof SerializedData.Type;

/**
 * Namespace for {@link SerializedDataList} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedDataList.Encoded = ["file.txt", 42, false]
 * console.log(encoded.length)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedDataList {
  /**
   * The encoded form of {@link SerializedDataList}: a readonly array of encoded serialized data.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = readonly SerializedData.Encoded[];
}

/**
 * Schema for lists of serializable Box payload data.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataList)(["file.txt", 42, true])
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedDataList = S.Array(S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)).pipe(
  $I.annoteSchema("SerializedDataList", {
    description:
      "A schema for serializable data lists used in the Box driver, containing encoded serialized data elements.",
  })
);

/**
 * Type for {@link SerializedDataList}. {@inheritDoc SerializedDataList}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedDataList = typeof SerializedDataList.Type;

/**
 * Namespace for {@link SerializedDataMap} containing the recursive encoded type.
 *
 * @example
 * ```ts
 * import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const encoded: BoxSchemas.SerializedDataMap.Encoded = { name: "report.pdf", size: 1024 }
 * console.log(encoded)
 * ```
 *
 * @category type-level
 * @since 0.0.0
 */
export declare namespace SerializedDataMap {
  /**
   * The encoded form of {@link SerializedDataMap}: string keys to encoded serialized data values.
   *
   * @category type-level
   * @since 0.0.0
   */
  export type Encoded = {
    readonly [key: string]: SerializedData.Encoded;
  };
}

/**
 * Schema for string-keyed maps of serializable Box payload data.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataMap)({ name: "report.pdf", size: 1024 })
 * console.log(decoded)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const SerializedDataMap = S.Record(
  S.String,
  S.suspend((): S.Codec<SerializedData.Encoded> => SerializedData)
).pipe(
  $I.annoteSchema("SerializedDataMap", {
    description:
      "A schema for serializable data maps used in the Box driver, mapping string keys to encoded serialized data values.",
  })
);

/**
 * Type for {@link SerializedDataMap}. {@inheritDoc SerializedDataMap}
 *
 * @category type-level
 * @since 0.0.0
 */
export type SerializedDataMap = typeof SerializedDataMap.Type;

/**
 * Schema class describing an outgoing Box API request: method, URL, query params, headers, and body.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 *
 * const request = BoxSchemas.RequestInfo.make({
 *   method: "GET",
 *   url: new URL("https://api.box.com/2.0/users/me"),
 *   queryParams: {},
 *   headers: {}
 * })
 * console.log(request.url.href)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class RequestInfo extends S.Class<RequestInfo>($I`RequestInfo`)(
  {
    contentType: S.optionalKey(S.String),
    method: HttpMethod,
    url: S.URLFromString,
    queryParams: S.Record(S.String, S.String),
    headers: S.Record(S.String, S.String),
    body: S.optionalKey(S.Any),
  },
  $I.annote("RequestInfo", {
    description: "A schema for request information used in the Box driver, encapsulating details about API requests.",
  })
) {}

/**
 * Schema class describing a Box API response: status code, headers, body, and error context fields.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const isResponseInfo = S.is(BoxSchemas.ResponseInfo)
 * console.log(isResponseInfo({ statusCode: 0 }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ResponseInfo extends S.Class<ResponseInfo>($I`ResponseInfo`)(
  {
    statusCode: HttpStatus,
    headers: S.Record(S.String, S.String),
    body: S.optionalKey(SerializedData),
    rawBody: S.optionalKey(S.String),
    code: S.optionalKey(S.String),
    contextInfo: S.optionalKey(S.Record(S.String, S.Any)),
    requestId: S.optionalKey(S.String),
    helpUrl: S.optionalKey(S.String),
  },
  $I.annote("ResponseInfo", {
    description: "A schema for response information used in the Box driver, encapsulating details about API responses.",
  })
) {}

/**
 * Schema matching instances of the Box SDK's `BoxSdkError`.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const isBoxSdkError = S.is(BoxSchemas.BoxSdkError)
 * console.log(isBoxSdkError(new Error("not a box error")))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const BoxSdkError = S.instanceOf(Box.BoxSdkError).pipe(
  $I.annoteSchema("BoxSdkError", {
    description: "A schema for errors thrown by the Box SDK, encapsulating details about the error.",
  })
);

/**
 * Type for {@link BoxSdkError}. {@inheritDoc BoxSdkError}
 *
 * @category type-level
 * @since 0.0.0
 */
export type BoxSdkError = typeof BoxSdkError.Type;

/**
 * Schema matching instances of the Box SDK's `BoxApiError` returned by the Box API.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const isBoxApiError = S.is(BoxSchemas.BoxApiError)
 * console.log(isBoxApiError(new Error("not a box api error")))
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const BoxApiError = S.instanceOf(Box.BoxApiError).pipe(
  $I.annoteSchema("BoxApiError", {
    description: "A schema for errors returned by the Box API, encapsulating details about the error.",
  })
);

/**
 * Type for {@link BoxApiError}. {@inheritDoc BoxApiError}
 *
 * @category type-level
 * @since 0.0.0
 */
export type BoxApiError = typeof BoxApiError.Type;

/**
 * Schema matching instances of the Box SDK's `AiAgentAsk` AI-agent request configuration.
 *
 * @example
 * ```ts
 * import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
 * import * as S from "effect/Schema"
 *
 * const isAiAgentAsk = S.is(BoxSchemas.AiAgentAsk)
 * console.log(isAiAgentAsk({ type: "ai_agent_ask" }))
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const AiAgentAsk = S.instanceOf(BoxSchemas.AiAgentAsk).pipe(
  $I.annoteSchema("AiAgentAsk", {
    description: "A schema for requests to AI agents, encapsulating details about the request.",
  })
);
