import type { LogLevel } from "effect";

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
