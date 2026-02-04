import * as Schema from "effect/Schema"

export type BetaMessage = unknown
export type BetaRawMessageStreamEvent = unknown
export type BetaUsage = unknown
export type MessageParam = unknown
export type JSONRPCMessage = unknown
export type CallToolResult = {
  readonly content?: ReadonlyArray<unknown>
  readonly structuredContent?: Record<string, unknown>
  readonly isError?: boolean
}
export type McpServer = unknown

export const BetaMessage = Schema.declare((_: unknown): _ is BetaMessage => true).pipe(
  Schema.annotations({ identifier: "BetaMessage", jsonSchema: {} })
)

export const BetaRawMessageStreamEvent = Schema.declare(
  (_: unknown): _ is BetaRawMessageStreamEvent => true
).pipe(
  Schema.annotations({ identifier: "BetaRawMessageStreamEvent", jsonSchema: {} })
)

export const BetaUsage = Schema.declare((_: unknown): _ is BetaUsage => true).pipe(
  Schema.annotations({ identifier: "BetaUsage", jsonSchema: {} })
)

export const MessageParam = Schema.declare((_: unknown): _ is MessageParam => true).pipe(
  Schema.annotations({ identifier: "MessageParam", jsonSchema: {} })
)

export const JSONRPCMessage = Schema.declare((_: unknown): _ is JSONRPCMessage => true).pipe(
  Schema.annotations({ identifier: "JSONRPCMessage", jsonSchema: {} })
)

export const CallToolResult = Schema.Struct({
  content: Schema.optional(Schema.Array(Schema.Unknown)),
  structuredContent: Schema.optional(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
  isError: Schema.optional(Schema.Boolean)
}).pipe(Schema.annotations({ identifier: "CallToolResult" }))

export const McpServer = Schema.declare((_: unknown): _ is McpServer => true).pipe(
  Schema.annotations({ identifier: "McpServer", jsonSchema: {} })
)
