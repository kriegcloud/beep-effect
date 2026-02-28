import { $AiSdkId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AiSdkId.create("core/Schema/External");

/**
 * @since 0.0.0
 */
export type BetaMessage = unknown;
/**
 * @since 0.0.0
 */
export type BetaRawMessageStreamEvent = unknown;
/**
 * @since 0.0.0
 */
export type BetaUsage = unknown;
/**
 * @since 0.0.0
 */
export type MessageParam = unknown;
/**
 * @since 0.0.0
 */
export type JSONRPCMessage = unknown;
/**
 * @since 0.0.0
 */
export type CallToolResult = {
  readonly content?: ReadonlyArray<unknown>;
  readonly structuredContent?: Record<string, unknown>;
  readonly isError?: boolean;
};
/**
 * @since 0.0.0
 */
export type McpServer = unknown;

/**
 * @since 0.0.0
 */
export const BetaMessage = S.Json.pipe(
  S.annotate(
    $I.annote("BetaMessage", {
      description: "Schema for BetaMessage.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export const BetaRawMessageStreamEvent = S.Json.pipe(
  S.annotate(
    $I.annote("BetaRawMessageStreamEvent", {
      description: "Schema for BetaRawMessageStreamEvent.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export const BetaUsage = S.Json.pipe(
  S.annotate(
    $I.annote("BetaUsage", {
      description: "Schema for BetaUsage.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export const MessageParam = S.Json.pipe(
  S.annotate(
    $I.annote("MessageParam", {
      description: "Schema for MessageParam.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export const JSONRPCMessage = S.Json.pipe(
  S.annotate(
    $I.annote("JSONRPCMessage", {
      description: "Schema for JSONRPCMessage.",
      jsonSchema: {},
    })
  )
);

/**
 * @since 0.0.0
 */
export const CallToolResult = S.Struct({
  content: S.optional(S.Array(S.Unknown)),
  structuredContent: S.optional(S.Record(S.String, S.Unknown)),
  isError: S.optional(S.Boolean),
}).pipe(
  S.annotate(
    $I.annote("CallToolResult", {
      description: "Schema for CallToolResult.",
    })
  )
);

/**
 * @since 0.0.0
 */
export const McpServer = S.Json.pipe(
  S.annotate(
    $I.annote("McpServer", {
      description: "Schema for McpServer.",
      jsonSchema: {},
    })
  )
);
