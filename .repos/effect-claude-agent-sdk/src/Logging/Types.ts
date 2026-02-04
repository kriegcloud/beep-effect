import type * as LogLevel from "effect/LogLevel"

export type AgentLogCategory = "messages" | "queryEvents" | "hooks"

export type AgentLogEvent = {
  readonly level: LogLevel.LogLevel
  readonly category: AgentLogCategory
  readonly event: string
  readonly message: string
  readonly annotations: Record<string, unknown>
  readonly data?: Record<string, unknown>
}
