import type { LogLevel } from "effect";

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export type AgentLogCategory = "messages" | "queryEvents" | "hooks";

/**
 * @since 0.0.0
 * @category CrossCutting
 */
export type AgentLogEvent = Readonly<{
  readonly level: LogLevel.Severity;
  readonly category: AgentLogCategory;
  readonly event: string;
  readonly message: string;
  readonly annotations: Record<string, unknown>;
  readonly data?: Record<string, unknown>;
}>;
