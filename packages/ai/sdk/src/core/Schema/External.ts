import * as S from "effect/Schema";

export type BetaMessage = unknown;
export type BetaRawMessageStreamEvent = unknown;
export type BetaUsage = unknown;
export type MessageParam = unknown;
export type JSONRPCMessage = unknown;
export type CallToolResult = {
  readonly content?: ReadonlyArray<unknown>;
  readonly structuredContent?: Record<string, unknown>;
  readonly isError?: boolean;
};
export type McpServer = unknown;

export const BetaMessage = S.declare((_: unknown): _ is BetaMessage => true).pipe(
  S.annotate({ identifier: "BetaMessage", jsonSchema: {} })
);

export const BetaRawMessageStreamEvent = S.declare((_: unknown): _ is BetaRawMessageStreamEvent => true).pipe(
  S.annotate({ identifier: "BetaRawMessageStreamEvent", jsonSchema: {} })
);

export const BetaUsage = S.declare((_: unknown): _ is BetaUsage => true).pipe(
  S.annotate({ identifier: "BetaUsage", jsonSchema: {} })
);

export const MessageParam = S.declare((_: unknown): _ is MessageParam => true).pipe(
  S.annotate({ identifier: "MessageParam", jsonSchema: {} })
);

export const JSONRPCMessage = S.declare((_: unknown): _ is JSONRPCMessage => true).pipe(
  S.annotate({ identifier: "JSONRPCMessage", jsonSchema: {} })
);

export const CallToolResult = S.Struct({
  content: S.optional(S.Array(S.Unknown)),
  structuredContent: S.optional(S.Record(S.String, S.Unknown)),
  isError: S.optional(S.Boolean),
}).pipe(S.annotate({ identifier: "CallToolResult" }));

export const McpServer = S.declare((_: unknown): _ is McpServer => true).pipe(
  S.annotate({ identifier: "McpServer", jsonSchema: {} })
);
