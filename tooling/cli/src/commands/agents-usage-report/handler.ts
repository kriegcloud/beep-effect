/**
 * @file Agents-Usage-Report Command Handler
 *
 * Main handler for the agents-usage-report command. Orchestrates:
 * - Reading telemetry JSONL file
 * - Parsing and validating events
 * - Matching start/stop events by sessionId + agentType
 * - Aggregating statistics per agent type
 * - Formatting output as table or JSON
 *
 * @module agents-usage-report/handler
 * @since 1.0.0
 */

import { FileSystem } from "@effect/platform";
import type { PlatformError } from "@effect/platform/Error";
import * as A from "effect/Array";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as Order from "effect/Order";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import color from "picocolors";
import { InvalidDateFilterError, NoTelemetryDataError, TelemetryReadError } from "./errors.js";
import type { AgentsUsageReportInput } from "./schemas.js";
import {
  AgentStartEvent as AgentStartEventSchema,
  type AgentStats,
  type AgentStopEvent,
  AgentStopEvent as AgentStopEventSchema,
  type AgentUsageEvent,
  type UsageReport,
} from "./schemas.js";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const TELEMETRY_PATH = ".claude/.telemetry/usage.jsonl";

// -----------------------------------------------------------------------------
// Parsing
// -----------------------------------------------------------------------------

/**
 * Parse a single JSONL line into an event.
 * Returns Option.none for invalid lines (silently skip malformed entries).
 */
const parseEventLine = (line: string): O.Option<AgentUsageEvent> => {
  if (F.pipe(line, Str.trim, Str.isEmpty)) {
    return O.none();
  }

  try {
    const parsed = JSON.parse(line) as unknown;

    // Try decoding as start event first
    const startResult = S.decodeUnknownOption(AgentStartEventSchema)(parsed);
    if (O.isSome(startResult)) {
      return startResult;
    }

    // Try decoding as stop event
    const stopResult = S.decodeUnknownOption(AgentStopEventSchema)(parsed);
    if (O.isSome(stopResult)) {
      return stopResult;
    }

    return O.none();
  } catch {
    return O.none();
  }
};

/**
 * Parse date filter string into a Date object.
 * Accepts ISO 8601 or YYYY-MM-DD format.
 */
const parseDateFilter = (dateStr: string): Effect.Effect<Date, InvalidDateFilterError> =>
  Effect.gen(function* () {
    if (F.pipe(dateStr, Str.trim, Str.isEmpty)) {
      // No filter specified - return epoch (include all)
      return new Date(0);
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return yield* Effect.fail(
        new InvalidDateFilterError({
          value: dateStr,
          reason: "Invalid date format. Use ISO 8601 (e.g., 2024-01-15) or YYYY-MM-DD",
        })
      );
    }

    return date;
  });

// -----------------------------------------------------------------------------
// Aggregation
// -----------------------------------------------------------------------------

interface MutableAgentStats {
  calls: number;
  successCount: number;
  partialCount: number;
  failedCount: number;
  totalDurationMs: number;
}

/**
 * Order for AgentStats by calls (descending).
 */
const agentStatsByCallsDesc: Order.Order<AgentStats> = F.pipe(
  Order.number,
  Order.mapInput((stats: AgentStats) => stats.calls),
  Order.reverse
);

/**
 * Aggregate stop events into per-agent statistics.
 * Only stop events have duration and outcome data.
 */
const aggregateEvents = (
  events: ReadonlyArray<AgentUsageEvent>,
  sinceDate: Date
): { agents: Array<AgentStats>; periodStart: string | undefined; periodEnd: string | undefined } => {
  // Filter to stop events only (they have all the data we need)
  const stopEvents = F.pipe(
    events,
    A.filter((e): e is S.Schema.Type<typeof AgentStopEvent> => e.eventType === "stop"),
    A.filter((e) => new Date(e.timestamp) >= sinceDate)
  );

  if (A.isEmptyArray(stopEvents)) {
    return { agents: [], periodStart: undefined, periodEnd: undefined };
  }

  // Find period bounds
  const timestamps = F.pipe(
    stopEvents,
    A.map((e) => e.timestamp)
  );
  const sortedTimestamps = F.pipe(timestamps, A.sort(Str.Order));
  const periodStart = F.pipe(A.head(sortedTimestamps), O.getOrUndefined);
  const periodEnd = F.pipe(A.last(sortedTimestamps), O.getOrUndefined);

  // Group by agent type and aggregate
  const statsByAgent: Record<string, MutableAgentStats> = {};

  for (const event of stopEvents) {
    const agentType = event.agentType;
    const existing = statsByAgent[agentType];

    if (existing === undefined) {
      statsByAgent[agentType] = {
        calls: 1,
        successCount: event.outcome === "success" ? 1 : 0,
        partialCount: event.outcome === "partial" ? 1 : 0,
        failedCount: event.outcome === "failed" ? 1 : 0,
        totalDurationMs: event.durationMs,
      };
    } else {
      existing.calls += 1;
      if (event.outcome === "success") existing.successCount += 1;
      if (event.outcome === "partial") existing.partialCount += 1;
      if (event.outcome === "failed") existing.failedCount += 1;
      existing.totalDurationMs += event.durationMs;
    }
  }

  // Convert to array sorted by calls (descending)
  const agents = F.pipe(
    R.toEntries(statsByAgent),
    A.map(
      ([agentType, stats]): AgentStats => ({
        agentType,
        calls: stats.calls,
        successCount: stats.successCount,
        partialCount: stats.partialCount,
        failedCount: stats.failedCount,
        totalDurationMs: stats.totalDurationMs,
      })
    ),
    A.sort(agentStatsByCallsDesc)
  );

  return { agents: [...agents], periodStart, periodEnd };
};

/**
 * Calculate totals across all agents.
 */
const calculateTotals = (agents: ReadonlyArray<AgentStats>): AgentStats => ({
  agentType: "Total",
  calls: F.pipe(
    agents,
    A.reduce(0, (acc, a) => acc + a.calls)
  ),
  successCount: F.pipe(
    agents,
    A.reduce(0, (acc, a) => acc + a.successCount)
  ),
  partialCount: F.pipe(
    agents,
    A.reduce(0, (acc, a) => acc + a.partialCount)
  ),
  failedCount: F.pipe(
    agents,
    A.reduce(0, (acc, a) => acc + a.failedCount)
  ),
  totalDurationMs: F.pipe(
    agents,
    A.reduce(0, (acc, a) => acc + a.totalDurationMs)
  ),
});

// -----------------------------------------------------------------------------
// Formatting
// -----------------------------------------------------------------------------

/**
 * Format duration in milliseconds to human-readable string.
 */
const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const minutes = seconds / 60;
  return `${minutes.toFixed(1)}m`;
};

/**
 * Format success rate as percentage.
 */
const formatSuccessRate = (stats: AgentStats): string => {
  if (stats.calls === 0) return "N/A";
  const rate = (stats.successCount / stats.calls) * 100;
  return `${rate.toFixed(1)}%`;
};

/**
 * Format average duration.
 */
const formatAvgDuration = (stats: AgentStats): string => {
  if (stats.calls === 0) return "N/A";
  return formatDuration(stats.totalDurationMs / stats.calls);
};

/**
 * Pad string to width.
 */
const padEnd = (str: string, width: number): string => {
  const len = Str.length(str);
  if (len >= width) return str;
  return str + " ".repeat(width - len);
};

const padStart = (str: string, width: number): string => {
  const len = Str.length(str);
  if (len >= width) return str;
  return " ".repeat(width - len) + str;
};

/**
 * Format report as ASCII table.
 */
const formatTable = (report: UsageReport): string => {
  const lines: string[] = [];

  lines.push(color.cyan("Agent Usage Report"));
  lines.push(color.cyan("=================="));

  // Period line
  const periodStart = O.fromNullable(report.periodStart);
  const periodEnd = O.fromNullable(report.periodEnd);
  if (O.isSome(periodStart) && O.isSome(periodEnd)) {
    const startDate = F.pipe(periodStart.value, Str.slice(0, 10));
    const endDate = F.pipe(periodEnd.value, Str.slice(0, 10));
    lines.push(`Period: ${startDate} to ${endDate}`);
  }
  lines.push("");

  // Column widths
  const COL_AGENT = 25;
  const COL_CALLS = 8;
  const COL_SUCCESS = 10;
  const COL_DURATION = 12;

  // Header
  const header = [
    padEnd("Agent Type", COL_AGENT),
    padStart("Calls", COL_CALLS),
    padStart("Success%", COL_SUCCESS),
    padStart("Avg Duration", COL_DURATION),
  ].join("  ");
  lines.push(color.bold(header));

  // Separator
  const separator = "\u2500".repeat(COL_AGENT + COL_CALLS + COL_SUCCESS + COL_DURATION + 6);
  lines.push(separator);

  // Agent rows
  for (const agent of report.agents) {
    const row = [
      padEnd(agent.agentType, COL_AGENT),
      padStart(String(agent.calls), COL_CALLS),
      padStart(formatSuccessRate(agent), COL_SUCCESS),
      padStart(formatAvgDuration(agent), COL_DURATION),
    ].join("  ");
    lines.push(row);
  }

  // Separator before totals
  lines.push(separator);

  // Totals row
  const totalsRow = [
    padEnd(color.bold("Total"), COL_AGENT),
    padStart(color.bold(String(report.totals.calls)), COL_CALLS),
    padStart(color.bold(formatSuccessRate(report.totals)), COL_SUCCESS),
    padStart(color.bold(formatAvgDuration(report.totals)), COL_DURATION),
  ].join("  ");
  lines.push(totalsRow);

  return A.join(lines, "\n");
};

/**
 * Format report as JSON.
 */
const formatJson = (report: UsageReport): string => {
  // Transform to a more readable JSON structure
  const output = {
    period: {
      start: report.periodStart,
      end: report.periodEnd,
    },
    agents: F.pipe(
      report.agents,
      A.map((a) => ({
        agentType: a.agentType,
        calls: a.calls,
        successRate: a.calls > 0 ? (a.successCount / a.calls) * 100 : 0,
        avgDurationMs: a.calls > 0 ? a.totalDurationMs / a.calls : 0,
        outcomes: {
          success: a.successCount,
          partial: a.partialCount,
          failed: a.failedCount,
        },
      }))
    ),
    totals: {
      calls: report.totals.calls,
      successRate: report.totals.calls > 0 ? (report.totals.successCount / report.totals.calls) * 100 : 0,
      avgDurationMs: report.totals.calls > 0 ? report.totals.totalDurationMs / report.totals.calls : 0,
    },
  };

  return JSON.stringify(output, null, 2);
};

// -----------------------------------------------------------------------------
// Handler
// -----------------------------------------------------------------------------

/**
 * Main handler for the agents-usage-report command.
 *
 * Reads telemetry data, aggregates statistics, and outputs a formatted report.
 *
 * @param input - Validated command input
 * @returns Effect that generates the report or fails with appropriate error
 *
 * @since 0.1.0
 * @category handlers
 */
export const agentsUsageReportHandler = (
  input: AgentsUsageReportInput
): Effect.Effect<
  void,
  TelemetryReadError | NoTelemetryDataError | InvalidDateFilterError | PlatformError,
  FileSystem.FileSystem
> =>
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;

    // 1. Parse date filter
    const sinceDate = yield* parseDateFilter(input.since);

    // 2. Check if telemetry file exists
    const telemetryExists = yield* fs.exists(TELEMETRY_PATH);
    if (!telemetryExists) {
      return yield* Effect.fail(
        new NoTelemetryDataError({
          message: `No telemetry data found. File does not exist: ${TELEMETRY_PATH}`,
        })
      );
    }

    // 3. Read telemetry file
    const content = yield* fs.readFileString(TELEMETRY_PATH).pipe(
      Effect.mapError(
        () =>
          new TelemetryReadError({
            message: "Failed to read telemetry file",
            path: TELEMETRY_PATH,
          })
      )
    );

    // 4. Parse JSONL into events
    const lines = F.pipe(content, Str.split("\n"));
    const events = F.pipe(lines, A.filterMap(parseEventLine));

    if (A.isEmptyArray(events)) {
      return yield* Effect.fail(
        new NoTelemetryDataError({
          message: "Telemetry file contains no valid events",
        })
      );
    }

    // 5. Aggregate statistics
    const { agents, periodStart, periodEnd } = aggregateEvents(events, sinceDate);

    if (A.isEmptyArray(agents)) {
      yield* Console.log(color.yellow("No events found matching the filter criteria."));
      return;
    }

    const totals = calculateTotals(agents);

    const report: UsageReport = {
      periodStart,
      periodEnd,
      agents,
      totals,
    };

    // 6. Format and output
    const formatted = input.output === "json" ? formatJson(report) : formatTable(report);

    yield* Console.log(formatted);
  }).pipe(Effect.withSpan("agentsUsageReportHandler"));
