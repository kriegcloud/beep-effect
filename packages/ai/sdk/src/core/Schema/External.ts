import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/External");

/**
 * @since 0.0.0
 * @category Validation
 */
export type BetaMessage = unknown;
/**
 * @since 0.0.0
 * @category Validation
 */
export type BetaRawMessageStreamEvent = unknown;
/**
 * @since 0.0.0
 * @category Validation
 */
export type BetaUsage = unknown;
/**
 * @since 0.0.0
 * @category Validation
 */
export type MessageParam = unknown;
/**
 * @since 0.0.0
 * @category Validation
 */
export type JSONRPCMessage = unknown;
/**
 * @since 0.0.0
 * @category Validation
 */
export type McpServer = unknown;

/**
 * @since 0.0.0
 * @category Validation
 */
export const BetaMessage = S.Json.pipe(
  S.annotate(
    $I.annote("BetaMessage", {
      description: "JSON-shaped Anthropic beta message payload bridged through the SDK boundary.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export const BetaRawMessageStreamEvent = S.Json.pipe(
  S.annotate(
    $I.annote("BetaRawMessageStreamEvent", {
      description: "JSON-shaped Anthropic beta raw stream event payload at the SDK boundary.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export const BetaUsage = S.Json.pipe(
  S.annotate(
    $I.annote("BetaUsage", {
      description: "JSON-shaped Anthropic beta usage payload carried through the SDK boundary.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export const MessageParam = S.Json.pipe(
  S.annotate(
    $I.annote("MessageParam", {
      description: "JSON-shaped upstream message parameter payload accepted by external clients.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export const JSONRPCMessage = S.Json.pipe(
  S.annotate(
    $I.annote("JSONRPCMessage", {
      description: "JSON-RPC message payload passed through external MCP boundaries.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 * @category Validation
 */
export class CallToolResult extends S.Class<CallToolResult>($I`CallToolResult`)(
  {
    content: S.optional(S.Unknown.pipe(S.Array)),
    structuredContent: S.optional(S.Record(S.String, S.Unknown)),
    isError: S.optional(S.Boolean),
  },
  $I.annote("CallToolResult", {
    description: "Normalized MCP call-tool result payload returned by external tool handlers.",
  })
) {}

/**
 * @since 0.0.0
 * @category Validation
 */
export const McpServer = S.Unknown.pipe(
  S.annotate(
    $I.annote("McpServer", {
      description: "Opaque external MCP server instance handle.",
    })
  )
);
