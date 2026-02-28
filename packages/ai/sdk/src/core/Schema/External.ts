import * as S from "effect/Schema";

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
export const BetaMessage = S.declare((_: unknown): _ is BetaMessage => true).pipe(
  S.annotate({ identifier: "BetaMessage", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export const BetaRawMessageStreamEvent = S.declare((_: unknown): _ is BetaRawMessageStreamEvent => true).pipe(
  S.annotate({ identifier: "BetaRawMessageStreamEvent", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export const BetaUsage = S.declare((_: unknown): _ is BetaUsage => true).pipe(
  S.annotate({ identifier: "BetaUsage", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export const MessageParam = S.declare((_: unknown): _ is MessageParam => true).pipe(
  S.annotate({ identifier: "MessageParam", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export const JSONRPCMessage = S.declare((_: unknown): _ is JSONRPCMessage => true).pipe(
  S.annotate({ identifier: "JSONRPCMessage", jsonSchema: {} })
);

/**
 * @since 0.0.0
 */
export const CallToolResult = S.Struct({
  content: S.optional(S.Array(S.Unknown)),
  structuredContent: S.optional(S.Record(S.String, S.Unknown)),
  isError: S.optional(S.Boolean),
}).pipe(S.annotate({ identifier: "CallToolResult" }));

/**
 * @since 0.0.0
 */
export const McpServer = S.declare((_: unknown): _ is McpServer => true).pipe(
  S.annotate({ identifier: "McpServer", jsonSchema: {} })
);
