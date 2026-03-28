/**
 * Core Effect schema models for the Model Context Protocol (MCP).
 *
 * @module @beep/ai-sdk/Mcp
 * cspell:ignore modelcontextprotocol pollable
 * @since 0.0.0
 */
import { $AiSdkId } from "@beep/identity/packages";
import { LiteralKit, MappedLiteralKit } from "@beep/schema";
import { destructiveTransform } from "@beep/schema/Transformations";
import { Effect, SchemaAST, SchemaTransformation, Struct } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("Mcp");

const annote = (name: string, description: string, documentation?: string) =>
  $I.annote(name, documentation === undefined ? { description } : { description, documentation });

const annoteSchema =
  (name: string, description: string, documentation?: string) =>
  <Schema extends S.Top>(self: Schema): Schema["~rebuild.out"] =>
    $I.annoteSchema(name, documentation === undefined ? { description } : { description, documentation })(self);

const annotateKey = (description: string, documentation?: string) =>
  documentation === undefined ? { description } : { description, documentation };

const isLooseRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  P.isObject(value) ? !Array.isArray(value) : false;

const encodedObjectSchema = <Schema extends S.Top>(schema: Schema) => {
  const encodedAst = S.toEncoded(schema).ast;
  if (SchemaAST.isObjects(encodedAst)) {
    return S.make<S.toEncoded<Schema> & { readonly ast: typeof encodedAst }>(encodedAst);
  }

  throw new Error("Expected encoded loose-object schema to have an object AST.");
};

const LooseUnknownObject = <Fields extends S.Struct.Fields>(fields: Fields) => {
  const strict = S.Struct(fields);
  const knownKeys = R.keys(fields);
  const decoded = S.make<
    S.Codec<
      Readonly<Record<string, unknown>> & S.Schema.Type<typeof strict>,
      Readonly<Record<string, unknown>> & S.Schema.Type<typeof strict>
    >
  >(S.StructWithRest(S.toType(strict), [S.Record(S.String, S.Unknown)]).ast);
  const encoded = S.make<
    S.Codec<
      Readonly<Record<string, unknown>> & S.Codec.Encoded<typeof strict>,
      Readonly<Record<string, unknown>> & S.Codec.Encoded<typeof strict>
    >
  >(S.StructWithRest(encodedObjectSchema(strict), [S.Record(S.String, S.Unknown)]).ast);
  const decodeStrict = S.decodeUnknownEffect(strict);
  const encodeStrict = S.encodeEffect(strict);
  const decodeRest = S.decodeUnknownEffect(S.Record(S.String, S.Unknown));

  const pickUnknownKeys = <Value extends Readonly<Record<string, unknown>>>(value: Value) =>
    R.filter(value, (_value, key) => !A.contains(knownKeys, key));

  return encoded.pipe(
    S.decodeTo(
      decoded,
      SchemaTransformation.transformOrFail({
        decode: (input, options) =>
          isLooseRecord(input)
            ? Effect.zipWith(
                decodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
                decodeRest(pickUnknownKeys(input), options).pipe(Effect.mapError(Struct.get("issue"))),
                (decodedValue, decodedRest) => ({ ...decodedRest, ...decodedValue })
              )
            : decodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
        encode: (input, options) =>
          Effect.zipWith(
            encodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
            decodeRest(pickUnknownKeys(input), options).pipe(Effect.mapError(Struct.get("issue"))),
            (encodedValue, encodedRest) => ({ ...encodedRest, ...encodedValue })
          ),
      })
    )
  );
};

const LooseJsonObject = <Fields extends S.Struct.Fields>(fields: Fields) => {
  const strict = S.Struct(fields);
  const knownKeys = R.keys(fields);
  const decoded = S.make<
    S.Codec<
      Readonly<Record<string, unknown>> & S.Schema.Type<typeof strict>,
      Readonly<Record<string, unknown>> & S.Schema.Type<typeof strict>
    >
  >(S.StructWithRest(S.toType(strict), [S.Record(S.String, S.Json)]).ast);
  const encoded = S.make<
    S.Codec<
      Readonly<Record<string, unknown>> & S.Codec.Encoded<typeof strict>,
      Readonly<Record<string, unknown>> & S.Codec.Encoded<typeof strict>
    >
  >(S.StructWithRest(encodedObjectSchema(strict), [S.Record(S.String, S.Json)]).ast);
  const decodeStrict = S.decodeUnknownEffect(strict);
  const encodeStrict = S.encodeEffect(strict);
  const decodeRest = S.decodeUnknownEffect(S.Record(S.String, S.Json));

  const pickUnknownKeys = <Value extends Readonly<Record<string, unknown>>>(value: Value) =>
    R.filter(value, (_value, key) => !A.contains(knownKeys, key));

  return encoded.pipe(
    S.decodeTo(
      decoded,
      SchemaTransformation.transformOrFail({
        decode: (input, options) =>
          isLooseRecord(input)
            ? Effect.zipWith(
                decodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
                decodeRest(pickUnknownKeys(input), options).pipe(Effect.mapError(Struct.get("issue"))),
                (decodedValue, decodedRest) => ({ ...decodedRest, ...decodedValue })
              )
            : decodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
        encode: (input, options) =>
          Effect.zipWith(
            encodeStrict(input, options).pipe(Effect.mapError(Struct.get("issue"))),
            decodeRest(pickUnknownKeys(input), options).pipe(Effect.mapError(Struct.get("issue"))),
            (encodedValue, encodedRest) => ({ ...encodedRest, ...encodedValue })
          ),
      })
    )
  );
};

const EmptyLooseUnknownObject = LooseUnknownObject({});

const UnitInterval = S.Number.check(S.makeFilterGroup([S.isGreaterThanOrEqualTo(0), S.isLessThanOrEqualTo(1)])).pipe(
  annoteSchema("UnitInterval", "A numeric value between 0 and 1 inclusive.")
);

const Base64String = S.String.check(
  S.isBase64({
    identifier: $I`Base64String`,
    title: "Base64 String",
    description: "A valid Base64-encoded string.",
    message: "Expected a valid Base64-encoded string.",
  })
).pipe(annoteSchema("Base64String", "A valid Base64-encoded string."));

const UrlString = S.String.check(
  S.makeFilter((value) => URL.canParse(value), {
    identifier: $I`UrlString`,
    title: "URL String",
    description: "A valid absolute URL string.",
    message: "Expected a valid URL string.",
  })
).pipe(annoteSchema("UrlString", "A valid absolute URL string."));

const FileUriString = S.String.check(
  S.isStartsWith("file://", {
    identifier: $I`FileUriString`,
    title: "File URI String",
    description: "A URI string that begins with `file://`.",
    message: "Expected a URI that starts with `file://`.",
  })
).pipe(annoteSchema("FileUriString", "A URI string that begins with `file://`."));

const RootMeta = EmptyLooseUnknownObject.pipe(
  annoteSchema(
    "RootMeta",
    "Loose metadata object carried in `_meta` fields for roots, prompts, resources, and content blocks."
  )
);

const JsonSchemaObject = LooseUnknownObject({
  type: S.tag("object").annotateKey(
    annotateKey("A JSON Schema 2020-12 object definition whose root `type` must be `object`.")
  ),
  properties: S.Record(S.String, S.Json)
    .pipe(S.OptionFromOptionalKey)
    .annotateKey(annotateKey("Optional JSON Schema property definitions keyed by property name.")),
  required: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
    annotateKey("Optional list of required property names.")
  ),
}).pipe(annoteSchema("JsonSchemaObject", "A loose JSON Schema 2020-12 object definition with an `object` root type."));

/**
 * The latest MCP protocol version copied from the upstream core package.
 *
 * @since 0.0.0
 * @category Constants
 */
export const LATEST_PROTOCOL_VERSION = "2025-11-25";

/**
 * The default negotiated protocol version copied from the upstream core package.
 *
 * @since 0.0.0
 * @category Constants
 */
export const DEFAULT_NEGOTIATED_PROTOCOL_VERSION = "2025-03-26";

/**
 * Protocol versions currently supported by the upstream MCP core package.
 *
 * @since 0.0.0
 * @category Constants
 */
export const SUPPORTED_PROTOCOL_VERSIONS = [
  LATEST_PROTOCOL_VERSION,
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
  "2024-10-07",
];

/**
 * Metadata key used to associate a message with a related task.
 *
 * @since 0.0.0
 * @category Constants
 */
export const RELATED_TASK_META_KEY = "io.modelcontextprotocol/related-task";

/**
 * The JSON-RPC version used by MCP.
 *
 * @since 0.0.0
 * @category Constants
 */
export const JSONRPC_VERSION = "2.0";

/**
 * Standard JSON-RPC parse error code.
 *
 * @since 0.0.0
 * @category Constants
 */
export const PARSE_ERROR = -32_700;

/**
 * Standard JSON-RPC invalid request error code.
 *
 * @since 0.0.0
 * @category Constants
 */
export const INVALID_REQUEST = -32_600;

/**
 * Standard JSON-RPC method not found error code.
 *
 * @since 0.0.0
 * @category Constants
 */
export const METHOD_NOT_FOUND = -32_601;

/**
 * Standard JSON-RPC invalid params error code.
 *
 * @since 0.0.0
 * @category Constants
 */
export const INVALID_PARAMS = -32_602;

/**
 * Standard JSON-RPC internal error code.
 *
 * @since 0.0.0
 * @category Constants
 */
export const INTERNAL_ERROR = -32_603;

/**
 * Error codes for protocol errors that cross the wire as JSON-RPC error responses.
 * These follow the JSON-RPC specification and MCP-specific extensions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ProtocolErrorCode = MappedLiteralKit([
  ["ParseError", PARSE_ERROR],
  ["InvalidRequest", INVALID_REQUEST],
  ["MethodNotFound", METHOD_NOT_FOUND],
  ["InvalidParams", INVALID_PARAMS],
  ["InternalError", INTERNAL_ERROR],
  ["ResourceNotFound", -32_002],
  ["UrlElicitationRequired", -32_042],
]).pipe(
  annoteSchema(
    "ProtocolErrorCode",
    "Error codes for protocol errors that cross the wire as JSON-RPC error responses.",
    "These follow the JSON-RPC specification and MCP-specific extensions."
  )
);

/**
 * Type of {@link ProtocolErrorCode}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ProtocolErrorCode = typeof ProtocolErrorCode.Type;

/**
 * JSON value accepted by MCP payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JSONValue = S.Json.pipe(annoteSchema("JSONValue", "Any JSON value accepted by MCP payloads."));

/**
 * Type of {@link JSONValue}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JSONValue = typeof JSONValue.Type;

/**
 * JSON object accepted by MCP payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JSONObject = S.Record(S.String, S.Json).pipe(
  annoteSchema("JSONObject", "A JSON object accepted by MCP payloads.")
);

/**
 * Type of {@link JSONObject}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JSONObject = typeof JSONObject.Type;

/**
 * JSON array accepted by MCP payloads.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JSONArray = S.Array(S.Json).pipe(annoteSchema("JSONArray", "A JSON array accepted by MCP payloads."));

/**
 * Type of {@link JSONArray}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JSONArray = typeof JSONArray.Type;

/**
 * A progress token, used to associate progress notifications with the original request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ProgressToken = S.Union([S.String, S.Int]).pipe(
  annoteSchema("ProgressToken", "A progress token, used to associate progress notifications with the original request.")
);

/**
 * Type of {@link ProgressToken}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ProgressToken = typeof ProgressToken.Type;

/**
 * An opaque token used to represent a cursor for pagination.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Cursor = S.String.pipe(
  annoteSchema("Cursor", "An opaque token used to represent a cursor for pagination.")
);

/**
 * Type of {@link Cursor}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Cursor = typeof Cursor.Type;

/**
 * Task creation parameters, used to ask that the server create a task to represent a request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TaskCreationParams = LooseUnknownObject({
  ttl: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey(
    annotateKey("Requested duration in milliseconds to retain task from creation.")
  ),
  pollInterval: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey(
    annotateKey("Time in milliseconds to wait between task status requests.")
  ),
}).pipe(
  annoteSchema(
    "TaskCreationParams",
    "Task creation parameters, used to ask that the server create a task to represent a request."
  )
);

/**
 * Type of {@link TaskCreationParams}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TaskCreationParams = typeof TaskCreationParams.Type;

/**
 * Task creation metadata attached to task-augmented requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TaskMetadata extends S.Class<TaskMetadata>($I`TaskMetadata`)(
  {
    ttl: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey(
      annotateKey("Requested duration in milliseconds to retain task from creation.")
    ),
  },
  annote("TaskMetadata", "Task creation metadata attached to task-augmented requests.")
) {}

/**
 * Metadata for associating messages with a task.
 * Include this in the `_meta` field under the key `io.modelcontextprotocol/related-task`.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RelatedTaskMetadata extends S.Class<RelatedTaskMetadata>($I`RelatedTaskMetadata`)(
  {
    taskId: S.String.annotateKey(annotateKey("The identifier of the related task.")),
  },
  annote(
    "RelatedTaskMetadata",
    "Metadata for associating messages with a task.",
    "Include this in the `_meta` field under the key `io.modelcontextprotocol/related-task`."
  )
) {}

/**
 * Metadata object attached to requests and notifications.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RequestMeta = LooseUnknownObject({
  progressToken: S.OptionFromOptionalKey(ProgressToken).annotateKey(
    annotateKey(
      "If specified, the caller is requesting out-of-band progress notifications for this request (as represented by notifications/progress). The value of this parameter is an opaque token that will be attached to any subsequent notifications. The receiver is not obligated to provide these notifications."
    )
  ),
  [RELATED_TASK_META_KEY]: S.OptionFromOptionalKey(RelatedTaskMetadata).annotateKey(
    annotateKey("If specified, this request is related to the provided task.")
  ),
}).pipe(annoteSchema("RequestMeta", "Metadata object attached to requests and notifications."));

/**
 * Type of {@link RequestMeta}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RequestMeta = typeof RequestMeta.Type;

/**
 * Common params for any request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BaseRequestParams extends S.Class<BaseRequestParams>($I`BaseRequestParams`)(
  {
    _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
      annotateKey("See [General fields: `_meta`](/specification/draft/basic/index#meta) for notes on `_meta` usage.")
    ),
  },
  annote("BaseRequestParams", "Common params for any request.")
) {}

const BaseRequestParamsLoose = LooseUnknownObject(BaseRequestParams.fields).pipe(
  annoteSchema(
    "BaseRequestParamsLoose",
    "Loose object variant of base request params that preserves MCP-compatible extra keys."
  )
);

/**
 * Common params for any task-augmented request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TaskAugmentedRequestParams extends S.Class<TaskAugmentedRequestParams>($I`TaskAugmentedRequestParams`)(
  {
    ...BaseRequestParams.fields,
    task: S.OptionFromOptionalKey(TaskMetadata).annotateKey(
      annotateKey(
        "If specified, the caller is requesting task-augmented execution for this request.",
        "The request will return a `CreateTaskResult` immediately, and the actual result can be retrieved later via `tasks/result`.\n\nTask augmentation is subject to capability negotiation - receivers MUST declare support for task augmentation of specific request types in their capabilities."
      )
    ),
  },
  annote("TaskAugmentedRequestParams", "Common params for any task-augmented request.")
) {}

/**
 * Common shape for an MCP request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Request extends S.Class<Request>($I`Request`)(
  {
    method: S.String.annotateKey(annotateKey("The MCP request method name.")),
    params: S.OptionFromOptionalKey(BaseRequestParamsLoose).annotateKey(
      annotateKey("Request parameters, including `_meta` when present.")
    ),
  },
  annote("Request", "Common shape for an MCP request.")
) {}

/**
 * Common params for any notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NotificationsParams extends S.Class<NotificationsParams>($I`NotificationsParams`)(
  {
    _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("NotificationsParams", "Common params for any notification.")
) {}

const NotificationsParamsLoose = LooseUnknownObject(NotificationsParams.fields).pipe(
  annoteSchema(
    "NotificationsParamsLoose",
    "Loose object variant of notification params that preserves MCP-compatible extra keys."
  )
);

/**
 * Common shape for an MCP notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Notification extends S.Class<Notification>($I`Notification`)(
  {
    method: S.String.annotateKey(annotateKey("The MCP notification method name.")),
    params: S.OptionFromOptionalKey(NotificationsParamsLoose).annotateKey(
      annotateKey("Notification parameters, including `_meta` when present.")
    ),
  },
  annote("Notification", "Common shape for an MCP notification.")
) {}

/**
 * Common result shape for MCP results. This remains a loose object because MCP results may carry extra keys.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Result = LooseUnknownObject({
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
}).pipe(
  annoteSchema(
    "Result",
    "Common result shape for MCP results. This remains a loose object because MCP results may carry extra keys."
  )
);

/**
 * Type of {@link Result}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Result = typeof Result.Type;

/**
 * A uniquely identifying ID for a request in JSON-RPC.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RequestId = S.Union([S.String, S.Int]).pipe(
  annoteSchema("RequestId", "A uniquely identifying ID for a request in JSON-RPC.")
);

/**
 * Type of {@link RequestId}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RequestId = typeof RequestId.Type;

/**
 * A request that expects a response.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JSONRPCRequest extends S.Class<JSONRPCRequest>($I`JSONRPCRequest`)(
  {
    jsonrpc: S.Literal(JSONRPC_VERSION).annotateKey(annotateKey("The JSON-RPC protocol version used by MCP.")),
    id: RequestId.annotateKey(annotateKey("The JSON-RPC request identifier.")),
    method: S.String.annotateKey(annotateKey("The MCP request method name.")),
    params: S.OptionFromOptionalKey(BaseRequestParamsLoose).annotateKey(
      annotateKey("Request parameters, including `_meta` when present.")
    ),
  },
  annote("JSONRPCRequest", "A request that expects a response.")
) {}

/**
 * A notification which does not expect a response.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JSONRPCNotification extends S.Class<JSONRPCNotification>($I`JSONRPCNotification`)(
  {
    jsonrpc: S.Literal(JSONRPC_VERSION).annotateKey(annotateKey("The JSON-RPC protocol version used by MCP.")),
    method: S.String.annotateKey(annotateKey("The MCP notification method name.")),
    params: S.OptionFromOptionalKey(NotificationsParamsLoose).annotateKey(
      annotateKey("Notification parameters, including `_meta` when present.")
    ),
  },
  annote("JSONRPCNotification", "A notification which does not expect a response.")
) {}

class JSONRPCError extends S.Class<JSONRPCError>($I`JSONRPCError`)(
  {
    code: S.Int.annotateKey(annotateKey("The error type that occurred.")),
    message: S.String.annotateKey(
      annotateKey("A short description of the error. The message SHOULD be limited to a concise single sentence.")
    ),
    data: S.OptionFromOptionalKey(S.Unknown).annotateKey(
      annotateKey(
        "Additional information about the error. The value of this member is defined by the sender (e.g. detailed error information, nested errors etc.)."
      )
    ),
  },
  annote("JSONRPCError", "JSON-RPC error object carried by protocol-level error responses.")
) {}

/**
 * A successful (non-error) response to a request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JSONRPCResultResponse extends S.Class<JSONRPCResultResponse>($I`JSONRPCResultResponse`)(
  {
    jsonrpc: S.Literal(JSONRPC_VERSION).annotateKey(annotateKey("The JSON-RPC protocol version used by MCP.")),
    id: RequestId.annotateKey(annotateKey("The JSON-RPC request identifier.")),
    result: Result.annotateKey(annotateKey("The successful result payload.")),
  },
  annote("JSONRPCResultResponse", "A successful (non-error) response to a request.")
) {}

/**
 * A response to a request that indicates an error occurred.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class JSONRPCErrorResponse extends S.Class<JSONRPCErrorResponse>($I`JSONRPCErrorResponse`)(
  {
    jsonrpc: S.Literal(JSONRPC_VERSION).annotateKey(annotateKey("The JSON-RPC protocol version used by MCP.")),
    id: S.OptionFromOptionalKey(RequestId).annotateKey(annotateKey("The JSON-RPC request identifier, if known.")),
    error: JSONRPCError.annotateKey(annotateKey("The JSON-RPC error payload.")),
  },
  annote("JSONRPCErrorResponse", "A response to a request that indicates an error occurred.")
) {}

/**
 * Any JSON-RPC message accepted by MCP.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JSONRPCMessage = S.Union([
  JSONRPCRequest,
  JSONRPCNotification,
  JSONRPCResultResponse,
  JSONRPCErrorResponse,
]).pipe(annoteSchema("JSONRPCMessage", "Any JSON-RPC message accepted by MCP."));

/**
 * Type of {@link JSONRPCMessage}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JSONRPCMessage = typeof JSONRPCMessage.Type;

/**
 * Any JSON-RPC response accepted by MCP.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const JSONRPCResponse = S.Union([JSONRPCResultResponse, JSONRPCErrorResponse]).pipe(
  annoteSchema("JSONRPCResponse", "Any JSON-RPC response accepted by MCP.")
);

/**
 * Type of {@link JSONRPCResponse}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type JSONRPCResponse = typeof JSONRPCResponse.Type;

/**
 * A response that indicates success but carries no data.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EmptyResult extends S.Class<EmptyResult>($I`EmptyResult`)(
  {
    _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("EmptyResult", "A response that indicates success but carries no data.")
) {}

/**
 * Parameters for a cancellation notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CancelledNotificationParams extends S.Class<CancelledNotificationParams>($I`CancelledNotificationParams`)(
  {
    ...NotificationsParams.fields,
    requestId: S.OptionFromOptionalKey(RequestId).annotateKey(
      annotateKey(
        "The ID of the request to cancel.",
        "This MUST correspond to the ID of a request previously issued in the same direction."
      )
    ),
    reason: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey(
        "An optional string describing the reason for the cancellation. This MAY be logged or presented to the user."
      )
    ),
  },
  annote("CancelledNotificationParams", "Parameters for a cancellation notification.")
) {}

/**
 * This notification can be sent by either side to indicate that it is cancelling a previously-issued request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CancelledNotification extends S.Class<CancelledNotification>($I`CancelledNotification`)(
  {
    method: S.tag("notifications/cancelled").annotateKey(
      annotateKey("Discriminator for MCP cancellation notifications.")
    ),
    params: CancelledNotificationParams.annotateKey(annotateKey("Cancellation notification parameters.")),
  },
  annote(
    "CancelledNotification",
    "This notification can be sent by either side to indicate that it is cancelling a previously-issued request.",
    "The request SHOULD still be in-flight, but due to communication latency, it is always possible that this notification MAY arrive after the request has already finished.\n\nThis notification indicates that the result will be unused, so any associated processing SHOULD cease.\n\nA client MUST NOT attempt to cancel its `initialize` request."
  )
) {}

const IconTheme = LiteralKit(["light", "dark"]).pipe(
  annoteSchema("IconTheme", "Supported icon theme hints for MCP metadata.")
);

/**
 * Type of {@link IconTheme}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type IconTheme = typeof IconTheme.Type;

/**
 * Icon schema for use in tools, prompts, resources, and implementations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Icon extends S.Class<Icon>($I`Icon`)(
  {
    src: S.String.annotateKey(annotateKey("URL or data URI for the icon.")),
    mimeType: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional MIME type for the icon.")),
    sizes: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey(
        "Optional array of strings that specify sizes at which the icon can be used.",
        "Each string should be in WxH format or `any` for scalable formats like SVG."
      )
    ),
    theme: S.OptionFromOptionalKey(IconTheme).annotateKey(
      annotateKey("Optional specifier for the theme this icon is designed for.")
    ),
  },
  annote("Icon", "Icon schema for use in tools, prompts, resources, and implementations.")
) {}

/**
 * Base schema to add an `icons` property.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Icons extends S.Class<Icons>($I`Icons`)(
  {
    icons: Icon.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Optional set of sized icons that the client can display in a user interface.")
    ),
  },
  annote("Icons", "Base schema to add an `icons` property.")
) {}

/**
 * Base metadata interface for common properties across resources, tools, prompts, and implementations.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BaseMetadata extends S.Class<BaseMetadata>($I`BaseMetadata`)(
  {
    name: S.String.annotateKey(
      annotateKey("Intended for programmatic or logical use, but used as a display name in past specs or fallback.")
    ),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Intended for UI and end-user contexts.")),
  },
  annote(
    "BaseMetadata",
    "Base metadata interface for common properties across resources, tools, prompts, and implementations."
  )
) {}

/**
 * Describes the name and version of an MCP implementation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Implementation extends S.Class<Implementation>($I`Implementation`)(
  {
    ...BaseMetadata.fields,
    ...Icons.fields,
    version: S.String.annotateKey(annotateKey("The implementation version string.")),
    websiteUrl: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional URL of the website for this implementation.")
    ),
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional human-readable description of what this implementation does.")
    ),
  },
  annote("Implementation", "Describes the name and version of an MCP implementation.")
) {}

const FormElicitationCapabilityBase = LooseJsonObject({
  applyDefaults: S.OptionFromOptionalKey(S.Boolean).annotateKey(
    annotateKey("Whether the client should apply schema defaults automatically.")
  ),
});

/**
 * Form elicitation capability details advertised by a client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const FormElicitationCapability = FormElicitationCapabilityBase.pipe(
  annoteSchema("FormElicitationCapability", "Form elicitation capability details advertised by a client.")
);

/**
 * Type of {@link FormElicitationCapability}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FormElicitationCapability = typeof FormElicitationCapability.Type;

const ElicitationCapabilityBase = LooseJsonObject({
  form: S.OptionFromOptionalKey(FormElicitationCapability).annotateKey(
    annotateKey("Capabilities for form-based elicitation.")
  ),
  url: S.OptionFromOptionalKey(JSONObject).annotateKey(annotateKey("Capabilities for URL-based elicitation.")),
});

/**
 * Elicitation capabilities advertised by a client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ElicitationCapability = destructiveTransform(ElicitationCapabilityBase, (value) =>
  O.isNone(value.form) && O.isNone(value.url) && R.toEntries(value).length === 2
    ? { ...value, form: O.some({ applyDefaults: O.none() }) }
    : value
).pipe(
  annoteSchema(
    "ElicitationCapability",
    "Elicitation capabilities advertised by a client.",
    "For compatibility with upstream MCP behavior, an empty object decodes as `{ form: {} }`."
  )
);

/**
 * Type of {@link ElicitationCapability}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ElicitationCapability = typeof ElicitationCapability.Type;

const ClientSamplingTaskCapability = LooseUnknownObject({
  createMessage: S.OptionFromOptionalKey(JSONObject).annotateKey(
    annotateKey("Task support for sampling `createMessage` requests.")
  ),
});

const ClientElicitationTaskCapability = LooseUnknownObject({
  create: S.OptionFromOptionalKey(JSONObject).annotateKey(
    annotateKey("Task support for elicitation `create` requests.")
  ),
});

const ClientTaskRequestsCapability = LooseUnknownObject({
  sampling: S.OptionFromOptionalKey(ClientSamplingTaskCapability).annotateKey(
    annotateKey("Task support for sampling requests.")
  ),
  elicitation: S.OptionFromOptionalKey(ClientElicitationTaskCapability).annotateKey(
    annotateKey("Task support for elicitation requests.")
  ),
});

/**
 * Task capabilities for clients, indicating which request types support task creation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ClientTasksCapability = LooseUnknownObject({
  list: S.OptionFromOptionalKey(JSONObject).annotateKey(annotateKey("Present if the client supports listing tasks.")),
  cancel: S.OptionFromOptionalKey(JSONObject).annotateKey(
    annotateKey("Present if the client supports cancelling tasks.")
  ),
  requests: S.OptionFromOptionalKey(ClientTaskRequestsCapability).annotateKey(
    annotateKey("Capabilities for task creation on specific request types.")
  ),
}).pipe(
  annoteSchema(
    "ClientTasksCapability",
    "Task capabilities for clients, indicating which request types support task creation."
  )
);

/**
 * Type of {@link ClientTasksCapability}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ClientTasksCapability = typeof ClientTasksCapability.Type;

const ServerToolTaskCapability = LooseUnknownObject({
  call: S.OptionFromOptionalKey(JSONObject).annotateKey(annotateKey("Task support for tool `call` requests.")),
});

const ServerTaskRequestsCapability = LooseUnknownObject({
  tools: S.OptionFromOptionalKey(ServerToolTaskCapability).annotateKey(annotateKey("Task support for tool requests.")),
});

/**
 * Task capabilities for servers, indicating which request types support task creation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ServerTasksCapability = LooseUnknownObject({
  list: S.OptionFromOptionalKey(JSONObject).annotateKey(annotateKey("Present if the server supports listing tasks.")),
  cancel: S.OptionFromOptionalKey(JSONObject).annotateKey(
    annotateKey("Present if the server supports cancelling tasks.")
  ),
  requests: S.OptionFromOptionalKey(ServerTaskRequestsCapability).annotateKey(
    annotateKey("Capabilities for task creation on specific request types.")
  ),
}).pipe(
  annoteSchema(
    "ServerTasksCapability",
    "Task capabilities for servers, indicating which request types support task creation."
  )
);

/**
 * Type of {@link ServerTasksCapability}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ServerTasksCapability = typeof ServerTasksCapability.Type;

class ClientSamplingCapability extends S.Class<ClientSamplingCapability>($I`ClientSamplingCapability`)(
  {
    context: S.OptionFromOptionalKey(JSONObject).annotateKey(
      annotateKey("Present if the client supports context inclusion via `includeContext`.")
    ),
    tools: S.OptionFromOptionalKey(JSONObject).annotateKey(
      annotateKey("Present if the client supports tool use via `tools` and `toolChoice`.")
    ),
  },
  annote("ClientSamplingCapability", "Sampling capabilities advertised by a client.")
) {}

class ClientRootsCapability extends S.Class<ClientRootsCapability>($I`ClientRootsCapability`)(
  {
    listChanged: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether the client supports issuing notifications for changes to the roots list.")
    ),
  },
  annote("ClientRootsCapability", "Roots capability details advertised by a client.")
) {}

/**
 * Capabilities a client may support.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ClientCapabilities extends S.Class<ClientCapabilities>($I`ClientCapabilities`)(
  {
    experimental: S.OptionFromOptionalKey(S.Record(S.String, JSONObject)).annotateKey(
      annotateKey("Experimental, non-standard capabilities that the client supports.")
    ),
    sampling: S.OptionFromOptionalKey(ClientSamplingCapability).annotateKey(
      annotateKey("Present if the client supports sampling from an LLM.")
    ),
    elicitation: S.OptionFromOptionalKey(ElicitationCapability).annotateKey(
      annotateKey("Present if the client supports eliciting user input.")
    ),
    roots: S.OptionFromOptionalKey(ClientRootsCapability).annotateKey(
      annotateKey("Present if the client supports listing roots.")
    ),
    tasks: S.OptionFromOptionalKey(ClientTasksCapability).annotateKey(
      annotateKey("Present if the client supports task creation.")
    ),
    extensions: S.OptionFromOptionalKey(S.Record(S.String, JSONObject)).annotateKey(
      annotateKey("Extensions that the client supports.")
    ),
  },
  annote("ClientCapabilities", "Capabilities a client may support.")
) {}

/**
 * Parameters for the `initialize` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InitializeRequestParams extends S.Class<InitializeRequestParams>($I`InitializeRequestParams`)(
  {
    ...BaseRequestParams.fields,
    protocolVersion: S.String.annotateKey(
      annotateKey("The latest version of the Model Context Protocol that the client supports.")
    ),
    capabilities: ClientCapabilities.annotateKey(annotateKey("Client capabilities.")),
    clientInfo: Implementation.annotateKey(annotateKey("Client implementation information.")),
  },
  annote("InitializeRequestParams", "Parameters for the `initialize` request.")
) {}

/**
 * This request is sent from the client to the server when it first connects, asking it to begin initialization.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InitializeRequest extends S.Class<InitializeRequest>($I`InitializeRequest`)(
  {
    method: S.tag("initialize").annotateKey(annotateKey("Discriminator for the initialize request.")),
    params: InitializeRequestParams.annotateKey(annotateKey("Initialize request parameters.")),
  },
  annote(
    "InitializeRequest",
    "This request is sent from the client to the server when it first connects, asking it to begin initialization."
  )
) {}

class ServerPromptsCapability extends S.Class<ServerPromptsCapability>($I`ServerPromptsCapability`)(
  {
    listChanged: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether this server supports issuing notifications for changes to the prompt list.")
    ),
  },
  annote("ServerPromptsCapability", "Prompt capability details advertised by a server.")
) {}

class ServerResourcesCapability extends S.Class<ServerResourcesCapability>($I`ServerResourcesCapability`)(
  {
    subscribe: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether this server supports clients subscribing to resource updates.")
    ),
    listChanged: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether this server supports issuing notifications for changes to the resource list.")
    ),
  },
  annote("ServerResourcesCapability", "Resource capability details advertised by a server.")
) {}

class ServerToolsCapability extends S.Class<ServerToolsCapability>($I`ServerToolsCapability`)(
  {
    listChanged: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether this server supports issuing notifications for changes to the tool list.")
    ),
  },
  annote("ServerToolsCapability", "Tool capability details advertised by a server.")
) {}

/**
 * Capabilities that a server may support.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ServerCapabilities extends S.Class<ServerCapabilities>($I`ServerCapabilities`)(
  {
    experimental: S.OptionFromOptionalKey(S.Record(S.String, JSONObject)).annotateKey(
      annotateKey("Experimental, non-standard capabilities that the server supports.")
    ),
    logging: S.OptionFromOptionalKey(JSONObject).annotateKey(
      annotateKey("Present if the server supports sending log messages to the client.")
    ),
    completions: S.OptionFromOptionalKey(JSONObject).annotateKey(
      annotateKey("Present if the server supports sending completions to the client.")
    ),
    prompts: S.OptionFromOptionalKey(ServerPromptsCapability).annotateKey(
      annotateKey("Present if the server offers any prompt templates.")
    ),
    resources: S.OptionFromOptionalKey(ServerResourcesCapability).annotateKey(
      annotateKey("Present if the server offers any resources to read.")
    ),
    tools: S.OptionFromOptionalKey(ServerToolsCapability).annotateKey(
      annotateKey("Present if the server offers any tools to call.")
    ),
    tasks: S.OptionFromOptionalKey(ServerTasksCapability).annotateKey(
      annotateKey("Present if the server supports task creation.")
    ),
    extensions: S.OptionFromOptionalKey(S.Record(S.String, JSONObject)).annotateKey(
      annotateKey("Extensions that the server supports.")
    ),
  },
  annote("ServerCapabilities", "Capabilities that a server may support.")
) {}

const InitializeResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  protocolVersion: S.String.annotateKey(
    annotateKey("The version of the Model Context Protocol that the server wants to use.")
  ),
  capabilities: ServerCapabilities.annotateKey(annotateKey("Server capabilities.")),
  serverInfo: Implementation.annotateKey(annotateKey("Server implementation information.")),
  instructions: S.OptionFromOptionalKey(S.String).annotateKey(
    annotateKey("Instructions describing how to use the server and its features.")
  ),
};

/**
 * After receiving an initialize request from the client, the server sends this response.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const InitializeResult = LooseUnknownObject(InitializeResultFields).pipe(
  annoteSchema(
    "InitializeResult",
    "After receiving an initialize request from the client, the server sends this response."
  )
);

/**
 * Type of {@link InitializeResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type InitializeResult = typeof InitializeResult.Type;

/**
 * This notification is sent from the client to the server after initialization has finished.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class InitializedNotification extends S.Class<InitializedNotification>($I`InitializedNotification`)(
  {
    method: S.tag("notifications/initialized").annotateKey(
      annotateKey("Discriminator for the initialized notification.")
    ),
    params: S.OptionFromOptionalKey(NotificationsParams).annotateKey(
      annotateKey("Optional initialized notification params.")
    ),
  },
  annote(
    "InitializedNotification",
    "This notification is sent from the client to the server after initialization has finished."
  )
) {}

/**
 * A ping, issued by either the server or the client, to check that the other party is still alive.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PingRequest extends S.Class<PingRequest>($I`PingRequest`)(
  {
    method: S.tag("ping").annotateKey(annotateKey("Discriminator for the ping request.")),
    params: S.OptionFromOptionalKey(BaseRequestParams).annotateKey(annotateKey("Optional ping request params.")),
  },
  annote(
    "PingRequest",
    "A ping, issued by either the server or the client, to check that the other party is still alive."
  )
) {}

/**
 * Progress payload for long-running requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Progress extends S.Class<Progress>($I`Progress`)(
  {
    progress: S.Number.annotateKey(
      annotateKey(
        "The progress thus far. This should increase every time progress is made, even if the total is unknown."
      )
    ),
    total: S.OptionFromOptionalKey(S.Number).annotateKey(
      annotateKey("Total number of items to process (or total progress required), if known.")
    ),
    message: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional message describing the current progress.")
    ),
  },
  annote("Progress", "Progress payload for long-running requests.")
) {}

/**
 * Parameters for a progress notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ProgressNotificationParams extends S.Class<ProgressNotificationParams>($I`ProgressNotificationParams`)(
  {
    ...NotificationsParams.fields,
    ...Progress.fields,
    progressToken: ProgressToken.annotateKey(
      annotateKey(
        "The progress token which was given in the initial request, used to associate this notification with the request that is proceeding."
      )
    ),
  },
  annote("ProgressNotificationParams", "Parameters for a progress notification.")
) {}

/**
 * An out-of-band notification used to inform the receiver of a progress update for a long-running request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ProgressNotification extends S.Class<ProgressNotification>($I`ProgressNotification`)(
  {
    method: S.tag("notifications/progress").annotateKey(annotateKey("Discriminator for the progress notification.")),
    params: ProgressNotificationParams.annotateKey(annotateKey("Progress notification parameters.")),
  },
  annote(
    "ProgressNotification",
    "An out-of-band notification used to inform the receiver of a progress update for a long-running request."
  )
) {}

/**
 * Parameters common to paginated requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PaginatedRequestParams extends S.Class<PaginatedRequestParams>($I`PaginatedRequestParams`)(
  {
    ...BaseRequestParams.fields,
    cursor: S.OptionFromOptionalKey(Cursor).annotateKey(
      annotateKey(
        "An opaque token representing the current pagination position. If provided, the server should return results starting after this cursor."
      )
    ),
  },
  annote("PaginatedRequestParams", "Parameters common to paginated requests.")
) {}

/**
 * Base request shape for paginated requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PaginatedRequest extends S.Class<PaginatedRequest>($I`PaginatedRequest`)(
  {
    method: S.String.annotateKey(annotateKey("The paginated request method name.")),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional paginated request params.")
    ),
  },
  annote("PaginatedRequest", "Base request shape for paginated requests.")
) {}

const PaginatedResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  nextCursor: S.OptionFromOptionalKey(Cursor).annotateKey(
    annotateKey(
      "An opaque token representing the pagination position after the last returned result. If present, there may be more results available."
    )
  ),
};

/**
 * Base result shape for paginated results.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PaginatedResult = LooseUnknownObject(PaginatedResultFields).pipe(
  annoteSchema("PaginatedResult", "Base result shape for paginated results.")
);

/**
 * Type of {@link PaginatedResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PaginatedResult = typeof PaginatedResult.Type;

/**
 * The status of a task.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TaskStatus = LiteralKit(["working", "input_required", "completed", "failed", "cancelled"]).pipe(
  annoteSchema("TaskStatus", "The status of a task.")
);

/**
 * Type of {@link TaskStatus}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TaskStatus = typeof TaskStatus.Type;

/**
 * A pollable state object associated with a request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Task extends S.Class<Task>($I`Task`)(
  {
    taskId: S.String.annotateKey(annotateKey("The task identifier.")),
    status: TaskStatus.annotateKey(annotateKey("The status of a task.")),
    ttl: S.OptionFromNullOr(S.DurationFromMillis).annotateKey(
      annotateKey(
        "Time in milliseconds to keep task results available after completion.",
        "If `null`, the task has unlimited lifetime until manually cleaned up."
      )
    ),
    createdAt: S.DateTimeUtcFromString.annotateKey(annotateKey("ISO 8601 timestamp when the task was created.")),
    lastUpdatedAt: S.DateTimeUtcFromString.annotateKey(
      annotateKey("ISO 8601 timestamp when the task was last updated.")
    ),
    pollInterval: S.OptionFromOptionalKey(S.DurationFromMillis).annotateKey(
      annotateKey("Optional recommended polling interval in milliseconds.")
    ),
    statusMessage: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("Optional diagnostic message for failed tasks or other status information.")
    ),
  },
  annote("Task", "A pollable state object associated with a request.")
) {}

const CreateTaskResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  task: Task.annotateKey(annotateKey("The created task data wrapped in a `task` field.")),
};

/**
 * Result returned when a task is created, containing the task data wrapped in a `task` field.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CreateTaskResult = LooseUnknownObject(CreateTaskResultFields).pipe(
  annoteSchema(
    "CreateTaskResult",
    "Result returned when a task is created, containing the task data wrapped in a `task` field."
  )
);

/**
 * Type of {@link CreateTaskResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CreateTaskResult = typeof CreateTaskResult.Type;

/**
 * Parameters for task status notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TaskStatusNotificationParams extends S.Class<TaskStatusNotificationParams>(
  $I`TaskStatusNotificationParams`
)(
  {
    ...NotificationsParams.fields,
    ...Task.fields,
  },
  annote("TaskStatusNotificationParams", "Parameters for task status notification.")
) {}

/**
 * A notification sent when a task's status changes.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TaskStatusNotification extends S.Class<TaskStatusNotification>($I`TaskStatusNotification`)(
  {
    method: S.tag("notifications/tasks/status").annotateKey(
      annotateKey("Discriminator for the task status notification.")
    ),
    params: TaskStatusNotificationParams.annotateKey(annotateKey("Task status notification parameters.")),
  },
  annote("TaskStatusNotification", "A notification sent when a task's status changes.")
) {}

class GetTaskRequestParams extends S.Class<GetTaskRequestParams>($I`GetTaskRequestParams`)(
  {
    ...BaseRequestParams.fields,
    taskId: S.String.annotateKey(annotateKey("The task identifier.")),
  },
  annote("GetTaskRequestParams", "Parameters for the `tasks/get` request.")
) {}

/**
 * A request to get the state of a specific task.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GetTaskRequest extends S.Class<GetTaskRequest>($I`GetTaskRequest`)(
  {
    method: S.tag("tasks/get").annotateKey(annotateKey("Discriminator for the `tasks/get` request.")),
    params: GetTaskRequestParams.annotateKey(annotateKey("The `tasks/get` request params.")),
  },
  annote("GetTaskRequest", "A request to get the state of a specific task.")
) {}

const TaskResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  ...Task.fields,
};

/**
 * The response to a `tasks/get` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const GetTaskResult = LooseUnknownObject(TaskResultFields).pipe(
  annoteSchema("GetTaskResult", "The response to a `tasks/get` request.")
);

/**
 * Type of {@link GetTaskResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GetTaskResult = typeof GetTaskResult.Type;

class GetTaskPayloadRequestParams extends S.Class<GetTaskPayloadRequestParams>($I`GetTaskPayloadRequestParams`)(
  {
    ...BaseRequestParams.fields,
    taskId: S.String.annotateKey(annotateKey("The task identifier.")),
  },
  annote("GetTaskPayloadRequestParams", "Parameters for the `tasks/result` request.")
) {}

/**
 * A request to get the result of a specific task.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GetTaskPayloadRequest extends S.Class<GetTaskPayloadRequest>($I`GetTaskPayloadRequest`)(
  {
    method: S.tag("tasks/result").annotateKey(annotateKey("Discriminator for the `tasks/result` request.")),
    params: GetTaskPayloadRequestParams.annotateKey(annotateKey("The `tasks/result` request params.")),
  },
  annote("GetTaskPayloadRequest", "A request to get the result of a specific task.")
) {}

/**
 * The response to a `tasks/result` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const GetTaskPayloadResult = Result.pipe(
  annoteSchema("GetTaskPayloadResult", "The response to a `tasks/result` request.")
);

/**
 * Type of {@link GetTaskPayloadResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GetTaskPayloadResult = typeof GetTaskPayloadResult.Type;

/**
 * A request to list tasks.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListTasksRequest extends S.Class<ListTasksRequest>($I`ListTasksRequest`)(
  {
    method: S.tag("tasks/list").annotateKey(annotateKey("Discriminator for the `tasks/list` request.")),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional pagination params for `tasks/list`.")
    ),
  },
  annote("ListTasksRequest", "A request to list tasks.")
) {}

const ListTasksResultFields = {
  ...PaginatedResultFields,
  tasks: S.Array(Task).annotateKey(annotateKey("The returned tasks.")),
};

/**
 * The response to a `tasks/list` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListTasksResult = LooseUnknownObject(ListTasksResultFields).pipe(
  annoteSchema("ListTasksResult", "The response to a `tasks/list` request.")
);

/**
 * Type of {@link ListTasksResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListTasksResult = typeof ListTasksResult.Type;

class CancelTaskRequestParams extends S.Class<CancelTaskRequestParams>($I`CancelTaskRequestParams`)(
  {
    ...BaseRequestParams.fields,
    taskId: S.String.annotateKey(annotateKey("The task identifier.")),
  },
  annote("CancelTaskRequestParams", "Parameters for the `tasks/cancel` request.")
) {}

/**
 * A request to cancel a specific task.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CancelTaskRequest extends S.Class<CancelTaskRequest>($I`CancelTaskRequest`)(
  {
    method: S.tag("tasks/cancel").annotateKey(annotateKey("Discriminator for the `tasks/cancel` request.")),
    params: CancelTaskRequestParams.annotateKey(annotateKey("The `tasks/cancel` request params.")),
  },
  annote("CancelTaskRequest", "A request to cancel a specific task.")
) {}

/**
 * The response to a `tasks/cancel` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CancelTaskResult = LooseUnknownObject(TaskResultFields).pipe(
  annoteSchema("CancelTaskResult", "The response to a `tasks/cancel` request.")
);

/**
 * Type of {@link CancelTaskResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CancelTaskResult = typeof CancelTaskResult.Type;

/**
 * The contents of a specific resource or sub-resource.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceContents extends S.Class<ResourceContents>($I`ResourceContents`)(
  {
    uri: S.String.annotateKey(annotateKey("The URI of this resource.")),
    mimeType: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("The MIME type of this resource, if known.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("ResourceContents", "The contents of a specific resource or sub-resource.")
) {}

class TextResourceContentsBase extends S.Class<TextResourceContentsBase>($I`TextResourceContents`)(
  {
    ...ResourceContents.fields,
    text: S.String.annotateKey(
      annotateKey(
        "The text of the item. This must only be set if the item can actually be represented as text (not binary data)."
      )
    ),
  },
  annote("TextResourceContents", "Text resource contents.")
) {}

/**
 * The text contents of a specific resource or sub-resource.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const TextResourceContents = TextResourceContentsBase;

class BlobResourceContentsBase extends S.Class<BlobResourceContentsBase>($I`BlobResourceContents`)(
  {
    ...ResourceContents.fields,
    blob: Base64String.annotateKey(annotateKey("A base64-encoded string representing the binary data of the item.")),
  },
  annote("BlobResourceContents", "Binary resource contents encoded as Base64.")
) {}

/**
 * Binary resource contents encoded as Base64.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const BlobResourceContents = BlobResourceContentsBase;

const ResourceContentsMember = S.Union([TextResourceContentsBase, BlobResourceContentsBase]).pipe(
  annoteSchema("ResourceContentsMember", "A text or binary resource contents payload.")
);

/**
 * The sender or recipient of messages and data in a conversation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const Role = LiteralKit(["user", "assistant"]).pipe(
  annoteSchema("Role", "The sender or recipient of messages and data in a conversation.")
);

/**
 * Type of {@link Role}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Role = typeof Role.Type;

/**
 * Optional annotations providing clients additional context about a resource.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Annotations extends S.Class<Annotations>($I`Annotations`)(
  {
    audience: Role.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Intended audience(s) for the resource.")
    ),
    priority: S.OptionFromOptionalKey(UnitInterval).annotateKey(
      annotateKey("Importance hint for the resource, from 0 (least) to 1 (most).")
    ),
    lastModified: S.OptionFromOptionalKey(S.DateTimeUtcFromString).annotateKey(
      annotateKey("ISO 8601 timestamp for the most recent modification.")
    ),
  },
  annote("Annotations", "Optional annotations providing clients additional context about a resource.")
) {}

/**
 * A known resource that the server is capable of reading.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Resource extends S.Class<Resource>($I`Resource`)(
  {
    ...BaseMetadata.fields,
    ...Icons.fields,
    uri: S.String.annotateKey(annotateKey("The URI of this resource.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("A description of what this resource represents.")
    ),
    mimeType: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("The MIME type of this resource, if known.")),
    size: S.OptionFromOptionalKey(S.Number).annotateKey(
      annotateKey("The size of the raw resource content, in bytes, if known.")
    ),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(RootMeta).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("Resource", "A known resource that the server is capable of reading.")
) {}

/**
 * A template description for resources available on the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceTemplate extends S.Class<ResourceTemplate>($I`ResourceTemplate`)(
  {
    ...BaseMetadata.fields,
    ...Icons.fields,
    uriTemplate: S.String.annotateKey(
      annotateKey("A URI template (according to RFC 6570) that can be used to construct resource URIs.")
    ),
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("A description of what this template is for.")
    ),
    mimeType: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("The MIME type for all resources that match this template.")
    ),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(RootMeta).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("ResourceTemplate", "A template description for resources available on the server.")
) {}

/**
 * Sent from the client to request a list of resources the server has.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListResourcesRequest extends S.Class<ListResourcesRequest>($I`ListResourcesRequest`)(
  {
    method: S.tag("resources/list").annotateKey(annotateKey("Discriminator for the `resources/list` request.")),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional pagination params for `resources/list`.")
    ),
  },
  annote("ListResourcesRequest", "Sent from the client to request a list of resources the server has.")
) {}

const ListResourcesResultFields = {
  ...PaginatedResultFields,
  resources: S.Array(Resource).annotateKey(annotateKey("The returned resources.")),
};

/**
 * The server's response to a `resources/list` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListResourcesResult = LooseUnknownObject(ListResourcesResultFields).pipe(
  annoteSchema("ListResourcesResult", "The server's response to a `resources/list` request.")
);

/**
 * Type of {@link ListResourcesResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListResourcesResult = typeof ListResourcesResult.Type;

/**
 * Sent from the client to request a list of resource templates the server has.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListResourceTemplatesRequest extends S.Class<ListResourceTemplatesRequest>(
  $I`ListResourceTemplatesRequest`
)(
  {
    method: S.tag("resources/templates/list").annotateKey(
      annotateKey("Discriminator for the `resources/templates/list` request.")
    ),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional pagination params for `resources/templates/list`.")
    ),
  },
  annote("ListResourceTemplatesRequest", "Sent from the client to request a list of resource templates the server has.")
) {}

const ListResourceTemplatesResultFields = {
  ...PaginatedResultFields,
  resourceTemplates: S.Array(ResourceTemplate).annotateKey(annotateKey("The returned resource templates.")),
};

/**
 * The server's response to a `resources/templates/list` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListResourceTemplatesResult = LooseUnknownObject(ListResourceTemplatesResultFields).pipe(
  annoteSchema("ListResourceTemplatesResult", "The server's response to a `resources/templates/list` request.")
);

/**
 * Type of {@link ListResourceTemplatesResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListResourceTemplatesResult = typeof ListResourceTemplatesResult.Type;

/**
 * Parameters for resource read and subscription requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceRequestParams extends S.Class<ResourceRequestParams>($I`ResourceRequestParams`)(
  {
    ...BaseRequestParams.fields,
    uri: S.String.annotateKey(
      annotateKey(
        "The URI of the resource to read. The URI can use any protocol; it is up to the server how to interpret it."
      )
    ),
  },
  annote("ResourceRequestParams", "Parameters for resource read and subscription requests.")
) {}

/**
 * Parameters for a `resources/read` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ReadResourceRequestParams = ResourceRequestParams.pipe(
  annoteSchema("ReadResourceRequestParams", "Parameters for a `resources/read` request.")
);

/**
 * Type of {@link ReadResourceRequestParams}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ReadResourceRequestParams = typeof ReadResourceRequestParams.Type;

/**
 * Sent from the client to the server, to read a specific resource URI.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ReadResourceRequest extends S.Class<ReadResourceRequest>($I`ReadResourceRequest`)(
  {
    method: S.tag("resources/read").annotateKey(annotateKey("Discriminator for the `resources/read` request.")),
    params: ReadResourceRequestParams.annotateKey(annotateKey("The `resources/read` request params.")),
  },
  annote("ReadResourceRequest", "Sent from the client to the server, to read a specific resource URI.")
) {}

const ReadResourceResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  contents: S.Array(ResourceContentsMember).annotateKey(annotateKey("The returned resource contents.")),
};

/**
 * The server's response to a `resources/read` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ReadResourceResult = LooseUnknownObject(ReadResourceResultFields).pipe(
  annoteSchema("ReadResourceResult", "The server's response to a `resources/read` request.")
);

/**
 * Type of {@link ReadResourceResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ReadResourceResult = typeof ReadResourceResult.Type;

/**
 * An optional notification informing the client that the list of resources changed.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceListChangedNotification extends S.Class<ResourceListChangedNotification>(
  $I`ResourceListChangedNotification`
)(
  {
    method: S.tag("notifications/resources/list_changed").annotateKey(
      annotateKey("Discriminator for the `notifications/resources/list_changed` notification.")
    ),
    params: S.OptionFromOptionalKey(NotificationsParams).annotateKey(
      annotateKey("Optional params for the resource list changed notification.")
    ),
  },
  annote(
    "ResourceListChangedNotification",
    "An optional notification informing the client that the list of resources changed."
  )
) {}

/**
 * Parameters for a `resources/subscribe` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SubscribeRequestParams = ResourceRequestParams.pipe(
  annoteSchema("SubscribeRequestParams", "Parameters for a `resources/subscribe` request.")
);

/**
 * Type of {@link SubscribeRequestParams}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SubscribeRequestParams = typeof SubscribeRequestParams.Type;

/**
 * Sent from the client to request `resources/updated` notifications from the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SubscribeRequest extends S.Class<SubscribeRequest>($I`SubscribeRequest`)(
  {
    method: S.tag("resources/subscribe").annotateKey(
      annotateKey("Discriminator for the `resources/subscribe` request.")
    ),
    params: SubscribeRequestParams.annotateKey(annotateKey("The `resources/subscribe` request params.")),
  },
  annote("SubscribeRequest", "Sent from the client to request `resources/updated` notifications from the server.")
) {}

/**
 * Parameters for a `resources/unsubscribe` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const UnsubscribeRequestParams = ResourceRequestParams.pipe(
  annoteSchema("UnsubscribeRequestParams", "Parameters for a `resources/unsubscribe` request.")
);

/**
 * Type of {@link UnsubscribeRequestParams}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UnsubscribeRequestParams = typeof UnsubscribeRequestParams.Type;

/**
 * Sent from the client to request cancellation of resource update notifications.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UnsubscribeRequest extends S.Class<UnsubscribeRequest>($I`UnsubscribeRequest`)(
  {
    method: S.tag("resources/unsubscribe").annotateKey(
      annotateKey("Discriminator for the `resources/unsubscribe` request.")
    ),
    params: UnsubscribeRequestParams.annotateKey(annotateKey("The `resources/unsubscribe` request params.")),
  },
  annote("UnsubscribeRequest", "Sent from the client to request cancellation of resource update notifications.")
) {}

/**
 * Parameters for a `notifications/resources/updated` notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceUpdatedNotificationParams extends S.Class<ResourceUpdatedNotificationParams>(
  $I`ResourceUpdatedNotificationParams`
)(
  {
    ...NotificationsParams.fields,
    uri: S.String.annotateKey(
      annotateKey(
        "The URI of the resource that has been updated. This might be a sub-resource of the one that the client actually subscribed to."
      )
    ),
  },
  annote("ResourceUpdatedNotificationParams", "Parameters for a `notifications/resources/updated` notification.")
) {}

/**
 * A notification from the server to the client, informing it that a resource has changed.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceUpdatedNotification extends S.Class<ResourceUpdatedNotification>($I`ResourceUpdatedNotification`)(
  {
    method: S.tag("notifications/resources/updated").annotateKey(
      annotateKey("Discriminator for the `notifications/resources/updated` notification.")
    ),
    params: ResourceUpdatedNotificationParams.annotateKey(annotateKey("The `notifications/resources/updated` params.")),
  },
  annote(
    "ResourceUpdatedNotification",
    "A notification from the server to the client, informing it that a resource has changed."
  )
) {}

/**
 * Describes an argument that a prompt can accept.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PromptArgument extends S.Class<PromptArgument>($I`PromptArgument`)(
  {
    name: S.String.annotateKey(annotateKey("The name of the argument.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("A human-readable description of the argument.")
    ),
    required: S.OptionFromOptionalKey(S.Boolean).annotateKey(annotateKey("Whether this argument must be provided.")),
  },
  annote("PromptArgument", "Describes an argument that a prompt can accept.")
) {}

/**
 * A prompt or prompt template that the server offers.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Prompt extends S.Class<Prompt>($I`Prompt`)(
  {
    ...BaseMetadata.fields,
    ...Icons.fields,
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional description of what this prompt provides.")
    ),
    arguments: PromptArgument.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("A list of arguments to use for templating the prompt.")
    ),
    _meta: S.OptionFromOptionalKey(RootMeta).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("Prompt", "A prompt or prompt template that the server offers.")
) {}

/**
 * Sent from the client to request a list of prompts and prompt templates the server has.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListPromptsRequest extends S.Class<ListPromptsRequest>($I`ListPromptsRequest`)(
  {
    method: S.tag("prompts/list").annotateKey(annotateKey("Discriminator for the `prompts/list` request.")),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional pagination params for `prompts/list`.")
    ),
  },
  annote("ListPromptsRequest", "Sent from the client to request a list of prompts and prompt templates the server has.")
) {}

const ListPromptsResultFields = {
  ...PaginatedResultFields,
  prompts: S.Array(Prompt).annotateKey(annotateKey("The returned prompts.")),
};

/**
 * The server's response to a `prompts/list` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListPromptsResult = LooseUnknownObject(ListPromptsResultFields).pipe(
  annoteSchema("ListPromptsResult", "The server's response to a `prompts/list` request.")
);

/**
 * Type of {@link ListPromptsResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListPromptsResult = typeof ListPromptsResult.Type;

/**
 * Parameters for a `prompts/get` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GetPromptRequestParams extends S.Class<GetPromptRequestParams>($I`GetPromptRequestParams`)(
  {
    ...BaseRequestParams.fields,
    name: S.String.annotateKey(annotateKey("The name of the prompt or prompt template.")),
    arguments: S.OptionFromOptionalKey(S.Record(S.String, S.String)).annotateKey(
      annotateKey("Arguments to use for templating the prompt.")
    ),
  },
  annote("GetPromptRequestParams", "Parameters for a `prompts/get` request.")
) {}

/**
 * Used by the client to get a prompt provided by the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GetPromptRequest extends S.Class<GetPromptRequest>($I`GetPromptRequest`)(
  {
    method: S.tag("prompts/get").annotateKey(annotateKey("Discriminator for the `prompts/get` request.")),
    params: GetPromptRequestParams.annotateKey(annotateKey("The `prompts/get` request params.")),
  },
  annote("GetPromptRequest", "Used by the client to get a prompt provided by the server.")
) {}

/**
 * Text provided to or from an LLM.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TextContent extends S.Class<TextContent>($I`TextContent`)(
  {
    type: S.tag("text").annotateKey(annotateKey("Discriminator for text content blocks.")),
    text: S.String.annotateKey(annotateKey("The text content of the message.")),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("TextContent", "Text provided to or from an LLM.")
) {}

/**
 * An image provided to or from an LLM.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ImageContent extends S.Class<ImageContent>($I`ImageContent`)(
  {
    type: S.tag("image").annotateKey(annotateKey("Discriminator for image content blocks.")),
    data: Base64String.annotateKey(annotateKey("The base64-encoded image data.")),
    mimeType: S.String.annotateKey(annotateKey("The MIME type of the image.")),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("ImageContent", "An image provided to or from an LLM.")
) {}

/**
 * Audio content provided to or from an LLM.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class AudioContent extends S.Class<AudioContent>($I`AudioContent`)(
  {
    type: S.tag("audio").annotateKey(annotateKey("Discriminator for audio content blocks.")),
    data: Base64String.annotateKey(annotateKey("The base64-encoded audio data.")),
    mimeType: S.String.annotateKey(annotateKey("The MIME type of the audio.")),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("AudioContent", "Audio content provided to or from an LLM.")
) {}

/**
 * A tool call request from an assistant.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolUseContent extends S.Class<ToolUseContent>($I`ToolUseContent`)(
  {
    type: S.tag("tool_use").annotateKey(annotateKey("Discriminator for tool-use content blocks.")),
    name: S.String.annotateKey(annotateKey("The name of the tool to invoke.")),
    id: S.String.annotateKey(annotateKey("Unique identifier for this tool call.")),
    input: S.Record(S.String, S.Unknown).annotateKey(annotateKey("Arguments to pass to the tool.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("ToolUseContent", "A tool call request from an assistant.")
) {}

/**
 * The contents of a resource, embedded into a prompt or tool call result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class EmbeddedResource extends S.Class<EmbeddedResource>($I`EmbeddedResource`)(
  {
    type: S.tag("resource").annotateKey(annotateKey("Discriminator for embedded resource content blocks.")),
    resource: ResourceContentsMember.annotateKey(annotateKey("The embedded resource contents.")),
    annotations: S.OptionFromOptionalKey(Annotations).annotateKey(annotateKey("Optional annotations for the client.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("EmbeddedResource", "The contents of a resource, embedded into a prompt or tool call result.")
) {}

/**
 * A resource that the server is capable of reading, included in a prompt or tool call result.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceLink extends S.Class<ResourceLink>($I`ResourceLink`)(
  {
    type: S.tag("resource_link").annotateKey(annotateKey("Discriminator for resource-link content blocks.")),
    ...Resource.fields,
  },
  annote("ResourceLink", "A resource that the server is capable of reading, included in a prompt or tool call result.")
) {}

/**
 * A content block that can be used in prompts and tool results.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ContentBlock = S.Union([TextContent, ImageContent, AudioContent, ResourceLink, EmbeddedResource]).pipe(
  S.toTaggedUnion("type"),
  annoteSchema("ContentBlock", "A content block that can be used in prompts and tool results.")
);

/**
 * Type of {@link ContentBlock}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ContentBlock = typeof ContentBlock.Type;

/**
 * Describes a message returned as part of a prompt.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PromptMessage extends S.Class<PromptMessage>($I`PromptMessage`)(
  {
    role: Role.annotateKey(annotateKey("The role associated with the prompt message.")),
    content: ContentBlock.annotateKey(annotateKey("The prompt message content block.")),
  },
  annote("PromptMessage", "Describes a message returned as part of a prompt.")
) {}

const GetPromptResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("An optional description for the prompt.")),
  messages: S.Array(PromptMessage).annotateKey(annotateKey("The returned prompt messages.")),
};

/**
 * The server's response to a `prompts/get` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const GetPromptResult = LooseUnknownObject(GetPromptResultFields).pipe(
  annoteSchema("GetPromptResult", "The server's response to a `prompts/get` request.")
);

/**
 * Type of {@link GetPromptResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type GetPromptResult = typeof GetPromptResult.Type;

/**
 * An optional notification informing the client that the list of prompts changed.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PromptListChangedNotification extends S.Class<PromptListChangedNotification>(
  $I`PromptListChangedNotification`
)(
  {
    method: S.tag("notifications/prompts/list_changed").annotateKey(
      annotateKey("Discriminator for the `notifications/prompts/list_changed` notification.")
    ),
    params: S.OptionFromOptionalKey(NotificationsParams).annotateKey(
      annotateKey("Optional params for the prompt list changed notification.")
    ),
  },
  annote(
    "PromptListChangedNotification",
    "An optional notification informing the client that the list of prompts changed."
  )
) {}

/**
 * Additional properties describing a `Tool` to clients.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolAnnotations extends S.Class<ToolAnnotations>($I`ToolAnnotations`)(
  {
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("A human-readable title for the tool.")),
    readOnlyHint: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("If `true`, the tool does not modify its environment.")
    ),
    destructiveHint: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("If `true`, the tool may perform destructive updates to its environment.")
    ),
    idempotentHint: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("If `true`, calling the tool repeatedly with the same arguments will have no additional effect.")
    ),
    openWorldHint: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("If `true`, this tool may interact with an open world of external entities.")
    ),
  },
  annote("ToolAnnotations", "Additional properties describing a `Tool` to clients.")
) {}

const ToolTaskSupport = LiteralKit(["required", "optional", "forbidden"]).pipe(
  annoteSchema("ToolTaskSupport", "Task execution support preference for a tool.")
);

/**
 * Type of {@link ToolTaskSupport}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolTaskSupport = typeof ToolTaskSupport.Type;

/**
 * Execution-related properties for a tool.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolExecution extends S.Class<ToolExecution>($I`ToolExecution`)(
  {
    taskSupport: S.OptionFromOptionalKey(ToolTaskSupport).annotateKey(
      annotateKey("Indicates the tool's preference for task-augmented execution.")
    ),
  },
  annote("ToolExecution", "Execution-related properties for a tool.")
) {}

/**
 * Definition for a tool the client can call.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Tool extends S.Class<Tool>($I`Tool`)(
  {
    ...BaseMetadata.fields,
    ...Icons.fields,
    description: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("A human-readable description of the tool.")
    ),
    inputSchema: JsonSchemaObject.annotateKey(
      annotateKey("A JSON Schema 2020-12 object defining the expected parameters for the tool.")
    ),
    outputSchema: S.OptionFromOptionalKey(JsonSchemaObject).annotateKey(
      annotateKey("An optional JSON Schema 2020-12 object defining the structure of the tool's output.")
    ),
    annotations: S.OptionFromOptionalKey(ToolAnnotations).annotateKey(
      annotateKey("Optional additional tool information.")
    ),
    execution: S.OptionFromOptionalKey(ToolExecution).annotateKey(
      annotateKey("Execution-related properties for this tool.")
    ),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("Tool", "Definition for a tool the client can call.")
) {}

/**
 * Sent from the client to request a list of tools the server has.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListToolsRequest extends S.Class<ListToolsRequest>($I`ListToolsRequest`)(
  {
    method: S.tag("tools/list").annotateKey(annotateKey("Discriminator for the `tools/list` request.")),
    params: S.OptionFromOptionalKey(PaginatedRequestParams).annotateKey(
      annotateKey("Optional pagination params for `tools/list`.")
    ),
  },
  annote("ListToolsRequest", "Sent from the client to request a list of tools the server has.")
) {}

const ListToolsResultFields = {
  ...PaginatedResultFields,
  tools: S.Array(Tool).annotateKey(annotateKey("The returned tools.")),
};

/**
 * The server's response to a `tools/list` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListToolsResult = LooseUnknownObject(ListToolsResultFields).pipe(
  annoteSchema("ListToolsResult", "The server's response to a `tools/list` request.")
);

/**
 * Type of {@link ListToolsResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListToolsResult = typeof ListToolsResult.Type;

const CallToolResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  content: S.Array(ContentBlock)
    .pipe(S.withDecodingDefaultKey(() => []))
    .annotateKey(annotateKey("A list of content objects that represent the result of the tool call.")),
  structuredContent: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
    annotateKey("An object containing structured tool output.")
  ),
  isError: S.OptionFromOptionalKey(S.Boolean).annotateKey(annotateKey("Whether the tool call ended in an error.")),
};

/**
 * The server's response to a tool call.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CallToolResult = LooseUnknownObject(CallToolResultFields).pipe(
  annoteSchema("CallToolResult", "The server's response to a tool call.")
);

/**
 * Type of {@link CallToolResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CallToolResult = typeof CallToolResult.Type;

const CompatibilityCallToolResultLegacy = LooseUnknownObject({
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  toolResult: S.Unknown.annotateKey(annotateKey("Legacy tool result payload for older protocol compatibility.")),
});

/**
 * `CallToolResult` extended with backwards compatibility to protocol version 2024-10-07.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CompatibilityCallToolResult = S.Union([CallToolResult, CompatibilityCallToolResultLegacy]).pipe(
  annoteSchema(
    "CompatibilityCallToolResult",
    "`CallToolResult` extended with backwards compatibility to protocol version 2024-10-07."
  )
);

/**
 * Type of {@link CompatibilityCallToolResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CompatibilityCallToolResult = typeof CompatibilityCallToolResult.Type;

/**
 * Parameters for a `tools/call` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CallToolRequestParams extends S.Class<CallToolRequestParams>($I`CallToolRequestParams`)(
  {
    ...TaskAugmentedRequestParams.fields,
    name: S.String.annotateKey(annotateKey("The name of the tool to call.")),
    arguments: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey("Arguments to pass to the tool.")
    ),
  },
  annote("CallToolRequestParams", "Parameters for a `tools/call` request.")
) {}

/**
 * Used by the client to invoke a tool provided by the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CallToolRequest extends S.Class<CallToolRequest>($I`CallToolRequest`)(
  {
    method: S.tag("tools/call").annotateKey(annotateKey("Discriminator for the `tools/call` request.")),
    params: CallToolRequestParams.annotateKey(annotateKey("The `tools/call` request params.")),
  },
  annote("CallToolRequest", "Used by the client to invoke a tool provided by the server.")
) {}

/**
 * An optional notification informing the client that the list of tools changed.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolListChangedNotification extends S.Class<ToolListChangedNotification>($I`ToolListChangedNotification`)(
  {
    method: S.tag("notifications/tools/list_changed").annotateKey(
      annotateKey("Discriminator for the `notifications/tools/list_changed` notification.")
    ),
    params: S.OptionFromOptionalKey(NotificationsParams).annotateKey(
      annotateKey("Optional params for the tool list changed notification.")
    ),
  },
  annote("ToolListChangedNotification", "An optional notification informing the client that the list of tools changed.")
) {}

/**
 * Base schema for list changed subscription options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListChangedOptionsBase extends S.Class<ListChangedOptionsBase>($I`ListChangedOptionsBase`)(
  {
    autoRefresh: S.Boolean.pipe(S.withDecodingDefaultKey(() => true)).annotateKey(
      annotateKey("If `true`, the list will be refreshed automatically when a list changed notification is received.")
    ),
    debounceMs: S.Int.check(S.isGreaterThanOrEqualTo(0))
      .pipe(S.withDecodingDefaultKey(() => 300))
      .annotateKey(annotateKey("Debounce time in milliseconds for list changed notification processing.")),
  },
  annote("ListChangedOptionsBase", "Base schema for list changed subscription options.")
) {}

/**
 * The severity of a log message.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const LoggingLevel = LiteralKit([
  "debug",
  "info",
  "notice",
  "warning",
  "error",
  "critical",
  "alert",
  "emergency",
]).pipe(annoteSchema("LoggingLevel", "The severity of a log message."));

/**
 * Type of {@link LoggingLevel}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type LoggingLevel = typeof LoggingLevel.Type;

/**
 * Parameters for a `logging/setLevel` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SetLevelRequestParams extends S.Class<SetLevelRequestParams>($I`SetLevelRequestParams`)(
  {
    ...BaseRequestParams.fields,
    level: LoggingLevel.annotateKey(
      annotateKey("The level of logging that the client wants to receive from the server.")
    ),
  },
  annote("SetLevelRequestParams", "Parameters for a `logging/setLevel` request.")
) {}

/**
 * A request from the client to the server, to enable or adjust logging.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SetLevelRequest extends S.Class<SetLevelRequest>($I`SetLevelRequest`)(
  {
    method: S.tag("logging/setLevel").annotateKey(annotateKey("Discriminator for the `logging/setLevel` request.")),
    params: SetLevelRequestParams.annotateKey(annotateKey("The `logging/setLevel` request params.")),
  },
  annote("SetLevelRequest", "A request from the client to the server, to enable or adjust logging.")
) {}

/**
 * Parameters for a `notifications/message` notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LoggingMessageNotificationParams extends S.Class<LoggingMessageNotificationParams>(
  $I`LoggingMessageNotificationParams`
)(
  {
    ...NotificationsParams.fields,
    level: LoggingLevel.annotateKey(annotateKey("The severity of this log message.")),
    logger: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional name of the logger issuing this message.")
    ),
    data: S.Unknown.annotateKey(annotateKey("The data to be logged, such as a string message or an object.")),
  },
  annote("LoggingMessageNotificationParams", "Parameters for a `notifications/message` notification.")
) {}

/**
 * Notification of a log message passed from server to client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LoggingMessageNotification extends S.Class<LoggingMessageNotification>($I`LoggingMessageNotification`)(
  {
    method: S.tag("notifications/message").annotateKey(
      annotateKey("Discriminator for the `notifications/message` notification.")
    ),
    params: LoggingMessageNotificationParams.annotateKey(annotateKey("The `notifications/message` params.")),
  },
  annote("LoggingMessageNotification", "Notification of a log message passed from server to client.")
) {}

/**
 * Hints to use for model selection.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ModelHint extends S.Class<ModelHint>($I`ModelHint`)(
  {
    name: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("A hint for a model name.")),
  },
  annote("ModelHint", "Hints to use for model selection.")
) {}

/**
 * The server's preferences for model selection, requested of the client during sampling.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ModelPreferences extends S.Class<ModelPreferences>($I`ModelPreferences`)(
  {
    hints: ModelHint.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Optional hints to use for model selection.")
    ),
    costPriority: S.OptionFromOptionalKey(UnitInterval).annotateKey(
      annotateKey("How much to prioritize cost when selecting a model.")
    ),
    speedPriority: S.OptionFromOptionalKey(UnitInterval).annotateKey(
      annotateKey("How much to prioritize sampling speed when selecting a model.")
    ),
    intelligencePriority: S.OptionFromOptionalKey(UnitInterval).annotateKey(
      annotateKey("How much to prioritize intelligence and capabilities when selecting a model.")
    ),
  },
  annote("ModelPreferences", "The server's preferences for model selection.")
) {}

const ToolChoiceMode = LiteralKit(["auto", "required", "none"]).pipe(
  annoteSchema("ToolChoiceMode", "Controls tool usage behavior in sampling requests.")
);

/**
 * Type of {@link ToolChoiceMode}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ToolChoiceMode = typeof ToolChoiceMode.Type;

/**
 * Controls tool usage behavior in sampling requests.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolChoice extends S.Class<ToolChoice>($I`ToolChoice`)(
  {
    mode: ToolChoiceMode.pipe(S.withDecodingDefaultKey(() => "auto")).annotateKey(
      annotateKey("Controls when tools are used.")
    ),
  },
  annote("ToolChoice", "Controls tool usage behavior in sampling requests.")
) {}

const ToolResultStructuredContent = EmptyLooseUnknownObject.pipe(
  annoteSchema("ToolResultStructuredContent", "Loose structured content object returned from a tool result.")
);

/**
 * The result of a tool execution, provided by the user (server).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ToolResultContent extends S.Class<ToolResultContent>($I`ToolResultContent`)(
  {
    type: S.tag("tool_result").annotateKey(annotateKey("Discriminator for tool-result content blocks.")),
    toolUseId: S.String.annotateKey(annotateKey("The unique identifier for the corresponding tool call.")),
    content: S.Array(ContentBlock)
      .pipe(S.withDecodingDefaultKey(() => []))
      .annotateKey(annotateKey("Result content blocks returned from the tool.")),
    structuredContent: S.OptionFromOptionalKey(ToolResultStructuredContent).annotateKey(
      annotateKey("Optional structured content returned from the tool.")
    ),
    isError: S.OptionFromOptionalKey(S.Boolean).annotateKey(
      annotateKey("Whether the tool result represents an error.")
    ),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("ToolResultContent", "The result of a tool execution, provided by the user (server).")
) {}

/**
 * Basic content types for sampling responses (without tool use).
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SamplingContent = S.Union([TextContent, ImageContent, AudioContent]).pipe(
  S.toTaggedUnion("type"),
  annoteSchema("SamplingContent", "Basic content types for sampling responses (without tool use).")
);

/**
 * Type of {@link SamplingContent}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SamplingContent = typeof SamplingContent.Type;

/**
 * Content block types allowed in sampling messages.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SamplingMessageContentBlock = S.Union([
  TextContent,
  ImageContent,
  AudioContent,
  ToolUseContent,
  ToolResultContent,
]).pipe(
  S.toTaggedUnion("type"),
  annoteSchema("SamplingMessageContentBlock", "Content block types allowed in sampling messages.")
);

/**
 * Type of {@link SamplingMessageContentBlock}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SamplingMessageContentBlock = typeof SamplingMessageContentBlock.Type;

/**
 * Describes a message issued to or received from an LLM API.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SamplingMessage extends S.Class<SamplingMessage>($I`SamplingMessage`)(
  {
    role: Role.annotateKey(annotateKey("The role associated with the sampling message.")),
    content: S.Union([SamplingMessageContentBlock, S.Array(SamplingMessageContentBlock)]).annotateKey(
      annotateKey("The sampling message content block or blocks.")
    ),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("SamplingMessage", "Describes a message issued to or received from an LLM API.")
) {}

const IncludeContext = LiteralKit(["none", "thisServer", "allServers"]).pipe(
  annoteSchema("IncludeContext", "Context inclusion modes for sampling requests.")
);

/**
 * Type of {@link IncludeContext}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type IncludeContext = typeof IncludeContext.Type;

/**
 * Parameters for a `sampling/createMessage` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CreateMessageRequestParams extends S.Class<CreateMessageRequestParams>($I`CreateMessageRequestParams`)(
  {
    ...TaskAugmentedRequestParams.fields,
    messages: S.Array(SamplingMessage).annotateKey(annotateKey("The messages sent to the model.")),
    modelPreferences: S.OptionFromOptionalKey(ModelPreferences).annotateKey(
      annotateKey("The server's preferences for which model to select.")
    ),
    systemPrompt: S.OptionFromOptionalKey(S.String).annotateKey(
      annotateKey("An optional system prompt the server wants to use for sampling.")
    ),
    includeContext: S.OptionFromOptionalKey(IncludeContext).annotateKey(
      annotateKey("A request to include context from one or more MCP servers.")
    ),
    temperature: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("The requested sampling temperature.")),
    maxTokens: S.Int.annotateKey(annotateKey("The requested maximum number of tokens to sample.")),
    stopSequences: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(annotateKey("Optional stop sequences.")),
    metadata: S.OptionFromOptionalKey(JSONObject).annotateKey(
      annotateKey("Optional metadata to pass through to the LLM provider.")
    ),
    tools: Tool.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Tools that the model may use during generation.")
    ),
    toolChoice: S.OptionFromOptionalKey(ToolChoice).annotateKey(annotateKey("Controls how the model uses tools.")),
  },
  annote("CreateMessageRequestParams", "Parameters for a `sampling/createMessage` request.")
) {}

/**
 * A request from the server to sample an LLM via the client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CreateMessageRequest extends S.Class<CreateMessageRequest>($I`CreateMessageRequest`)(
  {
    method: S.tag("sampling/createMessage").annotateKey(
      annotateKey("Discriminator for the `sampling/createMessage` request.")
    ),
    params: CreateMessageRequestParams.annotateKey(annotateKey("The `sampling/createMessage` request params.")),
  },
  annote("CreateMessageRequest", "A request from the server to sample an LLM via the client.")
) {}

const CreateMessageResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  model: S.String.annotateKey(annotateKey("The name of the model that generated the message.")),
  stopReason: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("The reason why sampling stopped, if known.")),
  role: Role.annotateKey(annotateKey("The role associated with the generated message.")),
  content: SamplingContent.annotateKey(annotateKey("Response content as a single text, image, or audio block.")),
};

/**
 * The client's response to a `sampling/createMessage` request from the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CreateMessageResult = LooseUnknownObject(CreateMessageResultFields).pipe(
  annoteSchema("CreateMessageResult", "The client's response to a `sampling/createMessage` request from the server.")
);

/**
 * Type of {@link CreateMessageResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CreateMessageResult = typeof CreateMessageResult.Type;

const CreateMessageResultWithToolsFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  model: S.String.annotateKey(annotateKey("The name of the model that generated the message.")),
  stopReason: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("The reason why sampling stopped, if known.")),
  role: Role.annotateKey(annotateKey("The role associated with the generated message.")),
  content: S.Union([SamplingMessageContentBlock, S.Array(SamplingMessageContentBlock)]).annotateKey(
    annotateKey("Response content, which may be a single block or an array of blocks.")
  ),
};

/**
 * The client's response to a `sampling/createMessage` request when tools were provided.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CreateMessageResultWithTools = LooseUnknownObject(CreateMessageResultWithToolsFields).pipe(
  annoteSchema(
    "CreateMessageResultWithTools",
    "The client's response to a `sampling/createMessage` request when tools were provided."
  )
);

/**
 * Type of {@link CreateMessageResultWithTools}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CreateMessageResultWithTools = typeof CreateMessageResultWithTools.Type;

/**
 * Primitive schema definition for boolean fields.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class BooleanSchema extends S.Class<BooleanSchema>($I`BooleanSchema`)(
  {
    type: S.tag("boolean").annotateKey(annotateKey("Discriminator for boolean schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    default: S.OptionFromOptionalKey(S.Boolean).annotateKey(annotateKey("Optional default value.")),
  },
  annote("BooleanSchema", "Primitive schema definition for boolean fields.")
) {}

const StringSchemaFormat = LiteralKit(["email", "uri", "date", "date-time"]).pipe(
  annoteSchema("StringSchemaFormat", "Supported string schema formats.")
);

/**
 * Type of {@link StringSchemaFormat}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type StringSchemaFormat = typeof StringSchemaFormat.Type;

/**
 * Primitive schema definition for string fields.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class StringSchema extends S.Class<StringSchema>($I`StringSchema`)(
  {
    type: S.tag("string").annotateKey(annotateKey("Discriminator for string schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    minLength: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional minimum string length.")),
    maxLength: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional maximum string length.")),
    format: S.OptionFromOptionalKey(StringSchemaFormat).annotateKey(annotateKey("Optional string format hint.")),
    default: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional default value.")),
  },
  annote("StringSchema", "Primitive schema definition for string fields.")
) {}

const NumberSchemaType = LiteralKit(["number", "integer"]).pipe(
  annoteSchema("NumberSchemaType", "Supported numeric schema kinds.")
);

/**
 * Type of {@link NumberSchemaType}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NumberSchemaType = typeof NumberSchemaType.Type;

/**
 * Primitive schema definition for number fields.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class NumberSchema extends S.Class<NumberSchema>($I`NumberSchema`)(
  {
    type: NumberSchemaType.annotateKey(annotateKey("Discriminator for numeric schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    minimum: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional minimum numeric value.")),
    maximum: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional maximum numeric value.")),
    default: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional default value.")),
  },
  annote("NumberSchema", "Primitive schema definition for number fields.")
) {}

/**
 * Schema for single-selection enumeration without display titles for options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UntitledSingleSelectEnumSchema extends S.Class<UntitledSingleSelectEnumSchema>(
  $I`UntitledSingleSelectEnumSchema`
)(
  {
    type: S.tag("string").annotateKey(annotateKey("Discriminator for single-select enum schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    enum: S.Array(S.String).annotateKey(annotateKey("Allowed enum values.")),
    default: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional default value.")),
  },
  annote(
    "UntitledSingleSelectEnumSchema",
    "Schema for single-selection enumeration without display titles for options."
  )
) {}

class TitledEnumValue extends S.Class<TitledEnumValue>($I`TitledEnumValue`)(
  {
    const: S.String.annotateKey(annotateKey("The enum value.")),
    title: S.String.annotateKey(annotateKey("Display title for the enum value.")),
  },
  annote("TitledEnumValue", "Enum value paired with a display title.")
) {}

/**
 * Schema for single-selection enumeration with display titles for each option.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TitledSingleSelectEnumSchema extends S.Class<TitledSingleSelectEnumSchema>(
  $I`TitledSingleSelectEnumSchema`
)(
  {
    type: S.tag("string").annotateKey(annotateKey("Discriminator for single-select enum schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    oneOf: S.Array(TitledEnumValue).annotateKey(annotateKey("Allowed enum values with display titles.")),
    default: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional default value.")),
  },
  annote("TitledSingleSelectEnumSchema", "Schema for single-selection enumeration with display titles for each option.")
) {}

/**
 * Legacy enum schema with parallel `enum` and `enumNames` arrays.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class LegacyTitledEnumSchema extends S.Class<LegacyTitledEnumSchema>($I`LegacyTitledEnumSchema`)(
  {
    type: S.tag("string").annotateKey(annotateKey("Discriminator for legacy titled enum schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    enum: S.Array(S.String).annotateKey(annotateKey("Allowed enum values.")),
    enumNames: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Optional display titles parallel to the `enum` values.")
    ),
    default: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional default value.")),
  },
  annote("LegacyTitledEnumSchema", "Legacy enum schema with parallel `enum` and `enumNames` arrays.")
) {}

/**
 * Combined single-selection enumeration schema.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const SingleSelectEnumSchema = S.Union([UntitledSingleSelectEnumSchema, TitledSingleSelectEnumSchema]).pipe(
  annoteSchema("SingleSelectEnumSchema", "Combined single-selection enumeration schema.")
);

/**
 * Type of {@link SingleSelectEnumSchema}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type SingleSelectEnumSchema = typeof SingleSelectEnumSchema.Type;

class UntitledMultiSelectEnumItems extends S.Class<UntitledMultiSelectEnumItems>($I`UntitledMultiSelectEnumItems`)(
  {
    type: S.tag("string").annotateKey(annotateKey("The item type.")),
    enum: S.Array(S.String).annotateKey(annotateKey("Allowed enum values.")),
  },
  annote("UntitledMultiSelectEnumItems", "Item schema for untitled multi-select enums.")
) {}

/**
 * Schema for multiple-selection enumeration without display titles for options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class UntitledMultiSelectEnumSchema extends S.Class<UntitledMultiSelectEnumSchema>(
  $I`UntitledMultiSelectEnumSchema`
)(
  {
    type: S.tag("array").annotateKey(annotateKey("Discriminator for multi-select enum schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    minItems: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional minimum number of selected items.")),
    maxItems: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional maximum number of selected items.")),
    items: UntitledMultiSelectEnumItems.annotateKey(annotateKey("Schema for the enum array items.")),
    default: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(annotateKey("Optional default values.")),
  },
  annote(
    "UntitledMultiSelectEnumSchema",
    "Schema for multiple-selection enumeration without display titles for options."
  )
) {}

class TitledMultiSelectEnumItems extends S.Class<TitledMultiSelectEnumItems>($I`TitledMultiSelectEnumItems`)(
  {
    anyOf: S.Array(TitledEnumValue).annotateKey(annotateKey("Allowed enum values with display titles.")),
  },
  annote("TitledMultiSelectEnumItems", "Item schema for titled multi-select enums.")
) {}

/**
 * Schema for multiple-selection enumeration with display titles for each option.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class TitledMultiSelectEnumSchema extends S.Class<TitledMultiSelectEnumSchema>($I`TitledMultiSelectEnumSchema`)(
  {
    type: S.tag("array").annotateKey(annotateKey("Discriminator for multi-select enum schema definitions.")),
    title: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field title.")),
    description: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("Optional field description.")),
    minItems: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional minimum number of selected items.")),
    maxItems: S.OptionFromOptionalKey(S.Number).annotateKey(annotateKey("Optional maximum number of selected items.")),
    items: TitledMultiSelectEnumItems.annotateKey(annotateKey("Schema for the enum array items.")),
    default: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(annotateKey("Optional default values.")),
  },
  annote(
    "TitledMultiSelectEnumSchema",
    "Schema for multiple-selection enumeration with display titles for each option."
  )
) {}

/**
 * Combined schema for multiple-selection enumeration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const MultiSelectEnumSchema = S.Union([UntitledMultiSelectEnumSchema, TitledMultiSelectEnumSchema]).pipe(
  annoteSchema("MultiSelectEnumSchema", "Combined schema for multiple-selection enumeration.")
);

/**
 * Type of {@link MultiSelectEnumSchema}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type MultiSelectEnumSchema = typeof MultiSelectEnumSchema.Type;

/**
 * Primitive schema definition for enum fields.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const EnumSchema = S.Union([LegacyTitledEnumSchema, SingleSelectEnumSchema, MultiSelectEnumSchema]).pipe(
  annoteSchema("EnumSchema", "Primitive schema definition for enum fields.")
);

/**
 * Type of {@link EnumSchema}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EnumSchema = typeof EnumSchema.Type;

/**
 * Union of all primitive schema definitions.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PrimitiveSchemaDefinition = S.Union([EnumSchema, BooleanSchema, StringSchema, NumberSchema]).pipe(
  annoteSchema("PrimitiveSchemaDefinition", "Union of all primitive schema definitions.")
);

/**
 * Type of {@link PrimitiveSchemaDefinition}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PrimitiveSchemaDefinition = typeof PrimitiveSchemaDefinition.Type;

class ElicitRequestedSchema extends S.Class<ElicitRequestedSchema>($I`ElicitRequestedSchema`)(
  {
    type: S.tag("object").annotateKey(annotateKey("The requested schema root type.")),
    properties: S.Record(S.String, PrimitiveSchemaDefinition).annotateKey(annotateKey("Requested top-level fields.")),
    required: S.String.pipe(S.Array, S.OptionFromOptionalKey).annotateKey(
      annotateKey("Optional required field names.")
    ),
  },
  annote("ElicitRequestedSchema", "Restricted JSON Schema subset used for form-based elicitation.")
) {}

/**
 * Parameters for an `elicitation/create` request for form-based elicitation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ElicitRequestFormParams extends S.Class<ElicitRequestFormParams>($I`ElicitRequestFormParams`)(
  {
    ...TaskAugmentedRequestParams.fields,
    mode: S.tag("form")
      .pipe(S.withDecodingDefaultKey(() => "form"))
      .annotateKey(
        annotateKey(
          "The elicitation mode.",
          "Optional for backward compatibility. Clients MUST treat missing `mode` as `form`."
        )
      ),
    message: S.String.annotateKey(
      annotateKey("The message to present to the user describing what information is being requested.")
    ),
    requestedSchema: ElicitRequestedSchema.annotateKey(
      annotateKey("A restricted subset of JSON Schema describing the requested form fields.")
    ),
  },
  annote("ElicitRequestFormParams", "Parameters for an `elicitation/create` request for form-based elicitation.")
) {}

/**
 * Parameters for an `elicitation/create` request for URL-based elicitation.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ElicitRequestURLParams extends S.Class<ElicitRequestURLParams>($I`ElicitRequestURLParams`)(
  {
    ...TaskAugmentedRequestParams.fields,
    mode: S.tag("url").annotateKey(annotateKey("The elicitation mode.")),
    message: S.String.annotateKey(
      annotateKey("The message to present to the user explaining why the interaction is needed.")
    ),
    elicitationId: S.String.annotateKey(
      annotateKey("The ID of the elicitation, which must be unique within the context of the server.")
    ),
    url: UrlString.annotateKey(annotateKey("The URL that the user should navigate to.")),
  },
  annote("ElicitRequestURLParams", "Parameters for an `elicitation/create` request for URL-based elicitation.")
) {}

/**
 * The parameters for a request to elicit additional information from the user via the client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ElicitRequestParams = S.Union([ElicitRequestFormParams, ElicitRequestURLParams]).pipe(
  S.toTaggedUnion("mode"),
  annoteSchema(
    "ElicitRequestParams",
    "The parameters for a request to elicit additional information from the user via the client."
  )
);

/**
 * Type of {@link ElicitRequestParams}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ElicitRequestParams = typeof ElicitRequestParams.Type;

/**
 * A request from the server to elicit user input via the client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ElicitRequest extends S.Class<ElicitRequest>($I`ElicitRequest`)(
  {
    method: S.tag("elicitation/create").annotateKey(annotateKey("Discriminator for the `elicitation/create` request.")),
    params: ElicitRequestParams.annotateKey(annotateKey("The `elicitation/create` request params.")),
  },
  annote("ElicitRequest", "A request from the server to elicit user input via the client.")
) {}

/**
 * Parameters for a `notifications/elicitation/complete` notification.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ElicitationCompleteNotificationParams extends S.Class<ElicitationCompleteNotificationParams>(
  $I`ElicitationCompleteNotificationParams`
)(
  {
    ...NotificationsParams.fields,
    elicitationId: S.String.annotateKey(annotateKey("The ID of the elicitation that completed.")),
  },
  annote("ElicitationCompleteNotificationParams", "Parameters for a `notifications/elicitation/complete` notification.")
) {}

/**
 * A notification from the server to the client, informing it of completion of an out-of-band elicitation request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ElicitationCompleteNotification extends S.Class<ElicitationCompleteNotification>(
  $I`ElicitationCompleteNotification`
)(
  {
    method: S.tag("notifications/elicitation/complete").annotateKey(
      annotateKey("Discriminator for the `notifications/elicitation/complete` notification.")
    ),
    params: ElicitationCompleteNotificationParams.annotateKey(
      annotateKey("The `notifications/elicitation/complete` params.")
    ),
  },
  annote(
    "ElicitationCompleteNotification",
    "A notification from the server to the client, informing it of completion of an out-of-band elicitation request."
  )
) {}

const ElicitAction = LiteralKit(["accept", "decline", "cancel"]).pipe(
  annoteSchema("ElicitAction", "The user action in response to an elicitation.")
);

/**
 * Type of {@link ElicitAction}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ElicitAction = typeof ElicitAction.Type;

const ElicitResultContent = S.Record(S.String, S.Union([S.String, S.Number, S.Boolean, S.String.pipe(S.Array)])).pipe(
  annoteSchema("ElicitResultContent", "Submitted form data returned by an accepted elicitation.")
);

const ElicitResultBase = LooseUnknownObject({
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  action: ElicitAction.annotateKey(annotateKey("The user action in response to the elicitation.")),
  content: ElicitResultContent.pipe(S.OptionFromOptionalNullOr).annotateKey(
    annotateKey("The submitted form data, only present when action is `accept`.")
  ),
});

/**
 * The client's response to an `elicitation/create` request from the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ElicitResult = ElicitResultBase.pipe(
  annoteSchema(
    "ElicitResult",
    "The client's response to an `elicitation/create` request from the server.",
    "For compatibility with upstream MCP behavior, `null` content is normalized to absence."
  )
);

/**
 * Type of {@link ElicitResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ElicitResult = typeof ElicitResult.Type;

/**
 * A reference to a resource or resource template definition.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ResourceTemplateReference extends S.Class<ResourceTemplateReference>($I`ResourceTemplateReference`)(
  {
    type: S.tag("ref/resource").annotateKey(annotateKey("Discriminator for resource template references.")),
    uri: S.String.annotateKey(annotateKey("The URI or URI template of the resource.")),
  },
  annote("ResourceTemplateReference", "A reference to a resource or resource template definition.")
) {}

/**
 * Identifies a prompt.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class PromptReference extends S.Class<PromptReference>($I`PromptReference`)(
  {
    type: S.tag("ref/prompt").annotateKey(annotateKey("Discriminator for prompt references.")),
    name: S.String.annotateKey(annotateKey("The name of the prompt or prompt template.")),
  },
  annote("PromptReference", "Identifies a prompt.")
) {}

const CompleteRef = S.Union([PromptReference, ResourceTemplateReference]).pipe(
  S.toTaggedUnion("type"),
  annoteSchema("CompleteRef", "Reference target for completion requests.")
);

class CompleteArgument extends S.Class<CompleteArgument>($I`CompleteArgument`)(
  {
    name: S.String.annotateKey(annotateKey("The name of the argument.")),
    value: S.String.annotateKey(annotateKey("The value of the argument to use for completion matching.")),
  },
  annote("CompleteArgument", "Argument information used for completion matching.")
) {}

class CompleteContext extends S.Class<CompleteContext>($I`CompleteContext`)(
  {
    arguments: S.OptionFromOptionalKey(S.Record(S.String, S.String)).annotateKey(
      annotateKey("Previously-resolved variables in a URI template or prompt.")
    ),
  },
  annote("CompleteContext", "Context object for completion requests.")
) {}

/**
 * Parameters for a `completion/complete` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompleteRequestParams extends S.Class<CompleteRequestParams>($I`CompleteRequestParams`)(
  {
    ...BaseRequestParams.fields,
    ref: CompleteRef.annotateKey(annotateKey("The completion reference target.")),
    argument: CompleteArgument.annotateKey(annotateKey("The argument information.")),
    context: S.OptionFromOptionalKey(CompleteContext).annotateKey(annotateKey("Optional completion context.")),
  },
  annote("CompleteRequestParams", "Parameters for a `completion/complete` request.")
) {}

/**
 * A request from the client to the server, to ask for completion options.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class CompleteRequest extends S.Class<CompleteRequest>($I`CompleteRequest`)(
  {
    method: S.tag("completion/complete").annotateKey(
      annotateKey("Discriminator for the `completion/complete` request.")
    ),
    params: CompleteRequestParams.annotateKey(annotateKey("The `completion/complete` request params.")),
  },
  annote("CompleteRequest", "A request from the client to the server, to ask for completion options.")
) {}

const CompletionInfoBase = LooseUnknownObject({
  values: S.Array(S.String)
    .check(S.isMaxLength(100))
    .annotateKey(annotateKey("An array of completion values. Must not exceed 100 items.")),
  total: S.OptionFromOptionalKey(S.Int).annotateKey(
    annotateKey(
      "The total number of completion options available. This can exceed the number of values actually sent in the response."
    )
  ),
  hasMore: S.OptionFromOptionalKey(S.Boolean).annotateKey(
    annotateKey(
      "Indicates whether there are additional completion options beyond those provided in the current response, even if the exact total is unknown."
    )
  ),
});

const CompleteResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  completion: CompletionInfoBase.annotateKey(annotateKey("Completion response information.")),
};

/**
 * The server's response to a `completion/complete` request.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const CompleteResult = LooseUnknownObject(CompleteResultFields).pipe(
  annoteSchema("CompleteResult", "The server's response to a `completion/complete` request.")
);

/**
 * Type of {@link CompleteResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CompleteResult = typeof CompleteResult.Type;

/**
 * Represents a root directory or file that the server can operate on.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Root extends S.Class<Root>($I`Root`)(
  {
    uri: FileUriString.annotateKey(
      annotateKey("The URI identifying the root. This must start with `file://` for now.")
    ),
    name: S.OptionFromOptionalKey(S.String).annotateKey(annotateKey("An optional name for the root.")),
    _meta: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)).annotateKey(
      annotateKey(
        "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
      )
    ),
  },
  annote("Root", "Represents a root directory or file that the server can operate on.")
) {}

/**
 * Sent from the server to request a list of root URIs from the client.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class ListRootsRequest extends S.Class<ListRootsRequest>($I`ListRootsRequest`)(
  {
    method: S.tag("roots/list").annotateKey(annotateKey("Discriminator for the `roots/list` request.")),
    params: S.OptionFromOptionalKey(BaseRequestParams).annotateKey(
      annotateKey("Optional `roots/list` request params.")
    ),
  },
  annote("ListRootsRequest", "Sent from the server to request a list of root URIs from the client.")
) {}

const ListRootsResultFields = {
  _meta: S.OptionFromOptionalKey(RequestMeta).annotateKey(
    annotateKey(
      "See [MCP specification](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/47339c03c143bb4ec01a26e721a1b8fe66634ebe/docs/specification/draft/basic/index.mdx#general-fields) for notes on `_meta` usage."
    )
  ),
  roots: S.Array(Root).annotateKey(annotateKey("The returned roots.")),
};

/**
 * The client's response to a `roots/list` request from the server.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ListRootsResult = LooseUnknownObject(ListRootsResultFields).pipe(
  annoteSchema("ListRootsResult", "The client's response to a `roots/list` request from the server.")
);

/**
 * Type of {@link ListRootsResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ListRootsResult = typeof ListRootsResult.Type;

/**
 * A notification from the client to the server, informing it that the list of roots has changed.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RootsListChangedNotification extends S.Class<RootsListChangedNotification>(
  $I`RootsListChangedNotification`
)(
  {
    method: S.tag("notifications/roots/list_changed").annotateKey(
      annotateKey("Discriminator for the `notifications/roots/list_changed` notification.")
    ),
    params: S.OptionFromOptionalKey(NotificationsParams).annotateKey(
      annotateKey("Optional params for the roots list changed notification.")
    ),
  },
  annote(
    "RootsListChangedNotification",
    "A notification from the client to the server, informing it that the list of roots has changed."
  )
) {}

/**
 * Client request message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ClientRequest = S.Union([
  PingRequest,
  InitializeRequest,
  CompleteRequest,
  SetLevelRequest,
  GetPromptRequest,
  ListPromptsRequest,
  ListResourcesRequest,
  ListResourceTemplatesRequest,
  ReadResourceRequest,
  SubscribeRequest,
  UnsubscribeRequest,
  CallToolRequest,
  ListToolsRequest,
  GetTaskRequest,
  GetTaskPayloadRequest,
  ListTasksRequest,
  CancelTaskRequest,
]).pipe(S.toTaggedUnion("method"), annoteSchema("ClientRequest", "Client request message union."));

/**
 * Type of {@link ClientRequest}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ClientRequest = typeof ClientRequest.Type;

/**
 * Client notification message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ClientNotification = S.Union([
  CancelledNotification,
  ProgressNotification,
  InitializedNotification,
  RootsListChangedNotification,
  TaskStatusNotification,
]).pipe(S.toTaggedUnion("method"), annoteSchema("ClientNotification", "Client notification message union."));

/**
 * Type of {@link ClientNotification}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ClientNotification = typeof ClientNotification.Type;

/**
 * Client result message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ClientResult = S.Union([
  EmptyResult,
  CreateMessageResult,
  CreateMessageResultWithTools,
  ElicitResult,
  ListRootsResult,
  GetTaskResult,
  ListTasksResult,
  CreateTaskResult,
]).pipe(
  annoteSchema(
    "ClientResult",
    "Client result message union.",
    "This union is intentionally untagged because MCP client result payloads do not share a common wire-level discriminator."
  )
);

/**
 * Type of {@link ClientResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ClientResult = typeof ClientResult.Type;

/**
 * Server request message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ServerRequest = S.Union([
  PingRequest,
  CreateMessageRequest,
  ElicitRequest,
  ListRootsRequest,
  GetTaskRequest,
  GetTaskPayloadRequest,
  ListTasksRequest,
  CancelTaskRequest,
]).pipe(S.toTaggedUnion("method"), annoteSchema("ServerRequest", "Server request message union."));

/**
 * Type of {@link ServerRequest}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ServerRequest = typeof ServerRequest.Type;

/**
 * Server notification message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ServerNotification = S.Union([
  CancelledNotification,
  ProgressNotification,
  LoggingMessageNotification,
  ResourceUpdatedNotification,
  ResourceListChangedNotification,
  ToolListChangedNotification,
  PromptListChangedNotification,
  TaskStatusNotification,
  ElicitationCompleteNotification,
]).pipe(S.toTaggedUnion("method"), annoteSchema("ServerNotification", "Server notification message union."));

/**
 * Type of {@link ServerNotification}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ServerNotification = typeof ServerNotification.Type;

/**
 * Server result message union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const ServerResult = S.Union([
  EmptyResult,
  InitializeResult,
  CompleteResult,
  GetPromptResult,
  ListPromptsResult,
  ListResourcesResult,
  ListResourceTemplatesResult,
  ReadResourceResult,
  CallToolResult,
  ListToolsResult,
  GetTaskResult,
  ListTasksResult,
  CreateTaskResult,
]).pipe(
  annoteSchema(
    "ServerResult",
    "Server result message union.",
    "This union is intentionally untagged because MCP server result payloads do not share a common wire-level discriminator."
  )
);

/**
 * Type of {@link ServerResult}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ServerResult = typeof ServerResult.Type;

/**
 * All known MCP request methods.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const RequestMethod = LiteralKit([
  "ping",
  "initialize",
  "completion/complete",
  "logging/setLevel",
  "prompts/get",
  "prompts/list",
  "resources/list",
  "resources/templates/list",
  "resources/read",
  "resources/subscribe",
  "resources/unsubscribe",
  "tools/call",
  "tools/list",
  "tasks/get",
  "tasks/result",
  "tasks/list",
  "tasks/cancel",
  "sampling/createMessage",
  "elicitation/create",
  "roots/list",
]).pipe(annoteSchema("RequestMethod", "All known MCP request methods."));

/**
 * Type of {@link RequestMethod}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RequestMethod = typeof RequestMethod.Type;

/**
 * All known MCP notification methods.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const NotificationMethod = LiteralKit([
  "notifications/cancelled",
  "notifications/progress",
  "notifications/initialized",
  "notifications/roots/list_changed",
  "notifications/tasks/status",
  "notifications/message",
  "notifications/resources/updated",
  "notifications/resources/list_changed",
  "notifications/tools/list_changed",
  "notifications/prompts/list_changed",
  "notifications/elicitation/complete",
]).pipe(annoteSchema("NotificationMethod", "All known MCP notification methods."));

/**
 * Type of {@link NotificationMethod}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NotificationMethod = typeof NotificationMethod.Type;

const requestSchemas = {
  ping: PingRequest,
  initialize: InitializeRequest,
  "completion/complete": CompleteRequest,
  "logging/setLevel": SetLevelRequest,
  "prompts/get": GetPromptRequest,
  "prompts/list": ListPromptsRequest,
  "resources/list": ListResourcesRequest,
  "resources/templates/list": ListResourceTemplatesRequest,
  "resources/read": ReadResourceRequest,
  "resources/subscribe": SubscribeRequest,
  "resources/unsubscribe": UnsubscribeRequest,
  "tools/call": CallToolRequest,
  "tools/list": ListToolsRequest,
  "tasks/get": GetTaskRequest,
  "tasks/result": GetTaskPayloadRequest,
  "tasks/list": ListTasksRequest,
  "tasks/cancel": CancelTaskRequest,
  "sampling/createMessage": CreateMessageRequest,
  "elicitation/create": ElicitRequest,
  "roots/list": ListRootsRequest,
};

const notificationSchemas = {
  "notifications/cancelled": CancelledNotification,
  "notifications/progress": ProgressNotification,
  "notifications/initialized": InitializedNotification,
  "notifications/roots/list_changed": RootsListChangedNotification,
  "notifications/tasks/status": TaskStatusNotification,
  "notifications/message": LoggingMessageNotification,
  "notifications/resources/updated": ResourceUpdatedNotification,
  "notifications/resources/list_changed": ResourceListChangedNotification,
  "notifications/tools/list_changed": ToolListChangedNotification,
  "notifications/prompts/list_changed": PromptListChangedNotification,
  "notifications/elicitation/complete": ElicitationCompleteNotification,
};

const resultSchemas = {
  ping: EmptyResult,
  initialize: InitializeResult,
  "completion/complete": CompleteResult,
  "logging/setLevel": EmptyResult,
  "prompts/get": GetPromptResult,
  "prompts/list": ListPromptsResult,
  "resources/list": ListResourcesResult,
  "resources/templates/list": ListResourceTemplatesResult,
  "resources/read": ReadResourceResult,
  "resources/subscribe": EmptyResult,
  "resources/unsubscribe": EmptyResult,
  "tools/call": S.Union([CallToolResult, CreateTaskResult]).pipe(
    annoteSchema("ToolsCallResultUnion", "Result union for `tools/call` requests.")
  ),
  "tools/list": ListToolsResult,
  "sampling/createMessage": S.Union([CreateMessageResultWithTools, CreateTaskResult]).pipe(
    annoteSchema("SamplingCreateMessageResultUnion", "Result union for `sampling/createMessage` requests.")
  ),
  "elicitation/create": S.Union([ElicitResult, CreateTaskResult]).pipe(
    annoteSchema("ElicitationCreateResultUnion", "Result union for `elicitation/create` requests.")
  ),
  "roots/list": ListRootsResult,
  "tasks/get": GetTaskResult,
  "tasks/result": Result,
  "tasks/list": ListTasksResult,
  "tasks/cancel": CancelTaskResult,
};

/**
 * Request schema lookup map by request method.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type RequestTypeMap = {
  readonly [M in keyof typeof requestSchemas]: (typeof requestSchemas)[M]["Type"];
};

/**
 * Notification schema lookup map by notification method.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NotificationTypeMap = {
  readonly [M in keyof typeof notificationSchemas]: (typeof notificationSchemas)[M]["Type"];
};

/**
 * Result schema lookup map by request method.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type ResultTypeMap = {
  readonly [M in keyof typeof resultSchemas]: (typeof resultSchemas)[M]["Type"];
};

/**
 * Gets the schema for a given request method.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const getRequestSchema = <M extends keyof typeof requestSchemas>(method: M) => requestSchemas[method];

/**
 * Gets the schema for a given notification method.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const getNotificationSchema = <M extends keyof typeof notificationSchemas>(method: M) =>
  notificationSchemas[method];

/**
 * Gets the schema for validating results of a given request method.
 *
 * @since 0.0.0
 * @category Helpers
 */
export const getResultSchema = <M extends keyof typeof resultSchemas>(method: M) => resultSchemas[method];
