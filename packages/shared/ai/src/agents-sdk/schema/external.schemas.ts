import * as S from "effect/Schema";

export type BetaMessage = unknown;
export type BetaRawMessageStreamEvent = unknown;
export type BetaUsage = unknown;
export type MessageParam = unknown;
export type JSONRPCMessage = unknown;
export type CallToolResult = {
  readonly content?: undefined | ReadonlyArray<unknown>;
  readonly structuredContent?: undefined | Record<string, unknown>;
  readonly isError?: undefined | boolean;
};
export type McpServer = unknown;

export const BetaMessage = S.declare((_: unknown): _ is BetaMessage => true).pipe(
  S.annotations({ identifier: "BetaMessage", jsonSchema: {} })
);

export const BetaRawMessageStreamEvent = S.declare((_: unknown): _ is BetaRawMessageStreamEvent => true).pipe(
  S.annotations({ identifier: "BetaRawMessageStreamEvent", jsonSchema: {} })
);

export const BetaUsage = S.declare((_: unknown): _ is BetaUsage => true).pipe(
  S.annotations({ identifier: "BetaUsage", jsonSchema: {} })
);

export const MessageParam = S.declare((_: unknown): _ is MessageParam => true).pipe(
  S.annotations({ identifier: "MessageParam", jsonSchema: {} })
);

export const JSONRPCMessage = S.declare((_: unknown): _ is JSONRPCMessage => true).pipe(
  S.annotations({ identifier: "JSONRPCMessage", jsonSchema: {} })
);

export const CallToolResult = S.Struct({
  content: S.optional(S.Array(S.Unknown)),
  structuredContent: S.optional(S.Record({ key: S.String, value: S.Unknown })),
  isError: S.optional(S.Boolean),
}).pipe(S.annotations({ identifier: "CallToolResult" }));

export const McpServer = S.declare((_: unknown): _ is McpServer => true).pipe(
  S.annotations({ identifier: "McpServer", jsonSchema: {} })
);
