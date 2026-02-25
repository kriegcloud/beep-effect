/**
 * Bench flag parsing and validation helpers.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalConfigError } from "../errors.js";
import type { AgentName, BenchCondition } from "../schemas/index.js";

/**
 * Canonical ordered list of supported benchmark conditions.
 *
 * @since 0.0.0
 * @category models
 */
export const AllBenchConditions: ReadonlyArray<BenchCondition> = ["current", "minimal", "adaptive", "adaptive_kg"];

/**
 * Canonical ordered list of supported benchmark agents.
 *
 * @since 0.0.0
 * @category models
 */
export const AllBenchAgents: ReadonlyArray<AgentName> = ["codex", "claude"];

/**
 * Parse a comma-separated CLI flag into trimmed, unique values in first-seen order.
 *
 * @param raw - Raw flag value.
 * @returns Normalized unique values.
 * @since 0.0.0
 * @category functions
 */
export const parseCsvFlag = (raw: string): ReadonlyArray<string> => {
  const tokens = raw
    .split(",")
    .map((token) => token.trim())
    .filter((token) => token.length > 0);

  const unique: Array<string> = [];
  for (const token of tokens) {
    if (!unique.includes(token)) {
      unique.push(token);
    }
  }

  return unique;
};

const parseConstrainedValues = <T extends string>(
  raw: string,
  allowed: ReadonlyArray<T>,
  flagName: string,
  defaultValues: ReadonlyArray<T>
): ReadonlyArray<T> => {
  const parsed = parseCsvFlag(raw);
  if (parsed.length === 0) {
    return defaultValues;
  }

  const unknown = parsed.filter((value) => !allowed.includes(value as T));
  if (unknown.length > 0) {
    throw new AgentEvalConfigError({
      message: `${flagName} contains unsupported values: ${unknown.join(", ")}. Allowed: ${allowed.join(", ")}`,
    });
  }

  return parsed as ReadonlyArray<T>;
};

/**
 * Parse and validate selected conditions for one bench run.
 *
 * Empty input selects all conditions.
 *
 * @param raw - Raw `--conditions` value.
 * @returns Selected ordered conditions.
 * @since 0.0.0
 * @category functions
 */
export const parseBenchConditionsFlag = (raw: string): ReadonlyArray<BenchCondition> =>
  parseConstrainedValues(raw, AllBenchConditions, "--conditions", AllBenchConditions);

/**
 * Parse and validate selected agents for one bench run.
 *
 * Empty input selects all agents.
 *
 * @param raw - Raw `--agents` value.
 * @returns Selected ordered agents.
 * @since 0.0.0
 * @category functions
 */
export const parseBenchAgentsFlag = (raw: string): ReadonlyArray<AgentName> =>
  parseConstrainedValues(raw, AllBenchAgents, "--agents", AllBenchAgents);

/**
 * Parse selected benchmark task IDs.
 *
 * Empty input means no explicit filtering (all loaded tasks).
 *
 * @param raw - Raw `--task-ids` value.
 * @returns Normalized task IDs.
 * @since 0.0.0
 * @category functions
 */
export const parseTaskIdsFlag = (raw: string): ReadonlyArray<string> => parseCsvFlag(raw);

/**
 * Parse an optional positive wall-clock limit in minutes.
 *
 * @param raw - Raw `--max-wall-minutes` value. Undefined means no wall cap.
 * @returns Parsed positive minutes or undefined when omitted.
 * @since 0.0.0
 * @category functions
 */
export const parseMaxWallMinutesFlag = (raw: string | undefined): number | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  const parsed = Number.parseFloat(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AgentEvalConfigError({
      message: `--max-wall-minutes must be a positive number. Received: ${raw}`,
    });
  }

  return parsed;
};
