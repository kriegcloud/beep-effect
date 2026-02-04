/**
 * @file Agents-Usage-Report Input Validation Schemas
 *
 * Defines Effect Schema validation for agents-usage-report command inputs.
 * Provides type-safe validation for telemetry events and command options.
 *
 * @module agents-usage-report/schemas
 * @since 1.0.0
 */

import * as S from "effect/Schema";

// -----------------------------------------------------------------------------
// Event Schemas (matching telemetry hook output)
// -----------------------------------------------------------------------------

/**
 * Trigger source for agent spawn.
 *
 * @since 0.1.0
 * @category schemas
 */
export const TriggerSource = S.Literal("explicit", "suggested", "auto");
export type TriggerSource = S.Schema.Type<typeof TriggerSource>;

/**
 * Outcome of agent execution.
 *
 * @since 0.1.0
 * @category schemas
 */
export const AgentOutcome = S.Literal("success", "partial", "failed");
export type AgentOutcome = S.Schema.Type<typeof AgentOutcome>;

/**
 * Start event - emitted when a subagent is spawned.
 *
 * @since 0.1.0
 * @category schemas
 */
export const AgentStartEvent = S.Struct({
  eventType: S.Literal("start"),
  timestamp: S.String,
  sessionId: S.String,
  agentType: S.String,
  triggeredBy: TriggerSource,
});
export type AgentStartEvent = S.Schema.Type<typeof AgentStartEvent>;

/**
 * Stop event - emitted when a subagent completes.
 *
 * @since 0.1.0
 * @category schemas
 */
export const AgentStopEvent = S.Struct({
  eventType: S.Literal("stop"),
  timestamp: S.String,
  sessionId: S.String,
  agentType: S.String,
  durationMs: S.Number,
  outcome: AgentOutcome,
});
export type AgentStopEvent = S.Schema.Type<typeof AgentStopEvent>;

/**
 * Union of all telemetry events.
 *
 * @since 0.1.0
 * @category schemas
 */
export const AgentUsageEvent = S.Union(AgentStartEvent, AgentStopEvent);
export type AgentUsageEvent = S.Schema.Type<typeof AgentUsageEvent>;

// -----------------------------------------------------------------------------
// Output Format
// -----------------------------------------------------------------------------

/**
 * Output format options.
 *
 * @since 0.1.0
 * @category schemas
 */
export const OutputFormat = S.Literal("table", "json");
export type OutputFormat = S.Schema.Type<typeof OutputFormat>;

// -----------------------------------------------------------------------------
// Command Input
// -----------------------------------------------------------------------------

/**
 * Input schema for the agents-usage-report command.
 *
 * @since 0.1.0
 * @category schemas
 */
export class AgentsUsageReportInput extends S.Class<AgentsUsageReportInput>("AgentsUsageReportInput")({
  /** Filter events to those on or after this date (ISO 8601 or YYYY-MM-DD) */
  since: S.optionalWith(S.String, { default: () => "" }),
  /** Output format: table (default) or json */
  output: S.optionalWith(OutputFormat, { default: () => "table" as const }),
}) {}

// -----------------------------------------------------------------------------
// Aggregation Types
// -----------------------------------------------------------------------------

/**
 * Aggregated statistics for a single agent type.
 *
 * @since 0.1.0
 * @category models
 */
export const AgentStats = S.Struct({
  agentType: S.String,
  calls: S.Number,
  successCount: S.Number,
  partialCount: S.Number,
  failedCount: S.Number,
  totalDurationMs: S.Number,
});
export type AgentStats = S.Schema.Type<typeof AgentStats>;

/**
 * Complete report with all agent statistics.
 *
 * @since 0.1.0
 * @category models
 */
export const UsageReport = S.Struct({
  periodStart: S.optional(S.String),
  periodEnd: S.optional(S.String),
  agents: S.Array(AgentStats),
  totals: AgentStats,
});
export type UsageReport = S.Schema.Type<typeof UsageReport>;
