// cspell:ignore codegraph
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("codegraph/graphiti/mcp-models");

/**
 * JSON-RPC protocol version.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const JsonRpcVersion = S.Literal("2.0").annotate(
  $I.annote("JsonRpcVersion", {
    description: "JSON-RPC protocol version used for Graphiti MCP transport.",
  })
);

/**
 * MCP initialize client info.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpClientInfo extends S.Class<McpClientInfo>($I`McpClientInfo`)(
  {
    name: S.String,
    version: S.String,
  },
  $I.annote("McpClientInfo", {
    description: "Client metadata sent during MCP initialize.",
  })
) {}

/**
 * MCP tool call params payload.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpToolCallParams extends S.Class<McpToolCallParams>($I`McpToolCallParams`)(
  {
    name: S.String,
    arguments: S.Record(S.String, S.Unknown),
  },
  $I.annote("McpToolCallParams", {
    description: "JSON-RPC params payload for MCP tools/call requests.",
  })
) {}

/**
 * JSON-RPC MCP tool call request.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpToolCallRequest extends S.Class<McpToolCallRequest>($I`McpToolCallRequest`)(
  {
    jsonrpc: JsonRpcVersion,
    id: S.String,
    method: S.Literal("tools/call"),
    params: McpToolCallParams,
  },
  $I.annote("McpToolCallRequest", {
    description: "JSON-RPC request envelope for Graphiti MCP tool calls.",
  })
) {}

/**
 * JSON-RPC initialize request params.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpInitializeParams extends S.Class<McpInitializeParams>($I`McpInitializeParams`)(
  {
    protocolVersion: S.String,
    capabilities: S.Record(S.String, S.Unknown),
    clientInfo: McpClientInfo,
  },
  $I.annote("McpInitializeParams", {
    description: "JSON-RPC initialize params for Graphiti MCP session startup.",
  })
) {}

/**
 * JSON-RPC initialize request.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpInitializeRequest extends S.Class<McpInitializeRequest>($I`McpInitializeRequest`)(
  {
    jsonrpc: JsonRpcVersion,
    id: S.String,
    method: S.Literal("initialize"),
    params: McpInitializeParams,
  },
  $I.annote("McpInitializeRequest", {
    description: "JSON-RPC initialize request envelope.",
  })
) {}

/**
 * JSON-RPC initialized notification.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpInitializedNotification extends S.Class<McpInitializedNotification>($I`McpInitializedNotification`)(
  {
    jsonrpc: JsonRpcVersion,
    method: S.Literal("notifications/initialized"),
  },
  $I.annote("McpInitializedNotification", {
    description: "JSON-RPC notification emitted after successful MCP initialize.",
  })
) {}

/**
 * Top-level JSON-RPC payload extracted from an MCP response.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export class McpJsonRpcPayload extends S.Class<McpJsonRpcPayload>($I`McpJsonRpcPayload`)(
  {
    jsonrpc: S.OptionFromOptionalKey(S.String),
    id: S.OptionFromOptionalKey(S.Union([S.String, S.Number, S.Null])),
    result: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)),
    error: S.OptionFromOptionalKey(S.Record(S.String, S.Unknown)),
  },
  $I.annote("McpJsonRpcPayload", {
    description: "Decoded JSON-RPC response envelope from Graphiti MCP transport.",
  })
) {}

/**
 * Decoder for unknown payloads into `McpJsonRpcPayload`.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const decodeMcpJsonRpcPayload = S.decodeUnknownEffect(McpJsonRpcPayload);
