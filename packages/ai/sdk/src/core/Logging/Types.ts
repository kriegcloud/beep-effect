import type * as LogLevel from "effect/LogLevel";

/**
 * @since 0.0.0
 */
export type AgentLogCategory = "messages" | "queryEvents" | "hooks";

/**
 * @since 0.0.0
 */
export type AgentLogEvent = {
  readonly level: LogLevel.Severity;
  readonly category: AgentLogCategory;
  readonly event: string;
  readonly message: string;
  readonly annotations: Record<string, unknown>;
  readonly data?: Record<string, unknown>;
};
