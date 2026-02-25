/**
 * Bench flag parsing and validation helpers.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalConfigError } from "../errors.js";
import type { AgentName, BenchCondition } from "../schemas/index.js";

/**
 * Supported Claude effort levels.
 *
 * @since 0.0.0
 * @category models
 */
export type ClaudeEffort = "low" | "medium" | "high";

const AllClaudeEffortLevels: ReadonlyArray<ClaudeEffort> = ["low", "medium", "high"];

/**
 * Unified reasoning levels supported by benchmark CLI.
 *
 * Mirrors Codex-supported effort levels.
 *
 * @since 0.0.0
 * @category models
 */
export type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

const AllReasoningEffortLevels: ReadonlyArray<ReasoningEffort> = ["none", "minimal", "low", "medium", "high", "xhigh"];

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
 * Supported execution backend selection modes.
 *
 * @since 0.0.0
 * @category models
 */
export type ExecutionBackend = "auto" | "cli" | "sdk";

const AllExecutionBackends: ReadonlyArray<ExecutionBackend> = ["auto", "cli", "sdk"];

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

/**
 * Parse an optional model override and ensure non-empty value.
 *
 * @param raw - Raw model value from CLI.
 * @param flagName - Name of the CLI flag.
 * @param fallback - Default model when omitted.
 * @returns Parsed model value.
 * @since 0.0.0
 * @category functions
 */
export const parseModelFlag = (raw: string | undefined, flagName: string, fallback: string): string => {
  if (raw === undefined) {
    return fallback;
  }

  const model = raw.trim();
  if (model.length === 0) {
    throw new AgentEvalConfigError({
      message: `${flagName} must be a non-empty model identifier.`,
    });
  }

  return model;
};

/**
 * Parse optional Claude effort level.
 *
 * @param raw - Raw `--claude-effort` value.
 * @returns Parsed effort level or undefined when omitted.
 * @since 0.0.0
 * @category functions
 */
export const parseClaudeEffortFlag = (raw: string | undefined): ClaudeEffort | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  const effort = raw.trim() as ClaudeEffort;
  if (!AllClaudeEffortLevels.includes(effort)) {
    throw new AgentEvalConfigError({
      message: `--claude-effort contains unsupported value: ${raw}. Allowed: ${AllClaudeEffortLevels.join(", ")}`,
    });
  }

  return effort;
};

/**
 * Parse optional unified reasoning level.
 *
 * @param raw - Raw `--reasoning` value.
 * @returns Parsed reasoning level or undefined when omitted.
 * @since 0.0.0
 * @category functions
 */
export const parseReasoningFlag = (raw: string | undefined): ReasoningEffort | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  const effort = raw.trim() as ReasoningEffort;
  if (!AllReasoningEffortLevels.includes(effort)) {
    throw new AgentEvalConfigError({
      message: `--reasoning contains unsupported value: ${raw}. Allowed: ${AllReasoningEffortLevels.join(", ")}`,
    });
  }

  return effort;
};

/**
 * Parse execution backend mode.
 *
 * @param raw - Raw `--execution-backend` value.
 * @returns Parsed backend mode, defaulting to `auto` when omitted.
 * @since 0.0.0
 * @category functions
 */
export const parseExecutionBackendFlag = (raw: string | undefined): ExecutionBackend => {
  if (raw === undefined) {
    return "auto";
  }

  const backend = raw.trim();
  if (backend !== "auto" && backend !== "cli" && backend !== "sdk") {
    throw new AgentEvalConfigError({
      message: `--execution-backend contains unsupported value: ${raw}. Allowed: ${AllExecutionBackends.join(", ")}`,
    });
  }

  return backend;
};

const trimNonEmpty = (raw: string | undefined): string | undefined => {
  if (raw === undefined) {
    return undefined;
  }
  const normalized = raw.trim();
  return normalized.length === 0 ? undefined : normalized;
};

const PathSeparatorPattern = /[\\/]+/g;

const splitPathSegments = (pathValue: string): ReadonlyArray<string> =>
  pathValue.split(PathSeparatorPattern).filter((segment) => segment.length > 0);

const expandHomePrefix = (pathValue: string, home: string | undefined, source: string): string => {
  if (!(pathValue === "~" || pathValue.startsWith("~/"))) {
    return pathValue;
  }

  const normalizedHome = trimNonEmpty(home);
  if (normalizedHome === undefined) {
    throw new AgentEvalConfigError({
      message: `${source} uses '~' but HOME is not set.`,
    });
  }

  return pathValue === "~" ? normalizedHome : `${normalizedHome}/${pathValue.slice(2)}`;
};

/**
 * Parse optional `--worktree-root` and expand `~` using HOME.
 *
 * @param raw - Raw `--worktree-root` value.
 * @param home - HOME environment variable value.
 * @returns Parsed root path, or undefined when omitted.
 * @since 0.0.0
 * @category functions
 */
export const parseWorktreeRootFlag = (raw: string | undefined, home: string | undefined): string | undefined => {
  if (raw === undefined) {
    return undefined;
  }

  const normalized = raw.trim();
  if (normalized.length === 0) {
    throw new AgentEvalConfigError({
      message: "--worktree-root must be a non-empty path.",
    });
  }

  return expandHomePrefix(normalized, home, "--worktree-root");
};

/**
 * Derive repository basename used by portable cache defaults.
 *
 * @param repoRoot - Repository root path (typically current working directory).
 * @returns Repository basename.
 * @since 0.0.0
 * @category functions
 */
export const deriveRepoBasename = (repoRoot: string | undefined): string => {
  const normalizedRoot = trimNonEmpty(repoRoot);
  if (normalizedRoot === undefined) {
    throw new AgentEvalConfigError({
      message: "Worktree isolation requires a resolvable repository root for default worktree path.",
    });
  }

  const segments = splitPathSegments(normalizedRoot);
  const repoBasename = segments.at(-1);
  if (repoBasename === undefined || repoBasename.length === 0) {
    throw new AgentEvalConfigError({
      message: `Unable to derive repository basename from path: ${normalizedRoot}`,
    });
  }

  return repoBasename;
};

/**
 * Resolve default external worktree root from XDG/HOME.
 *
 * @param xdgCacheHome - XDG_CACHE_HOME environment variable value.
 * @param home - HOME environment variable value.
 * @param repoBasename - Repository basename used for portable cache partitioning.
 * @returns Default worktree root path.
 * @since 0.0.0
 * @category functions
 */
export const resolveDefaultWorktreeRoot = (
  xdgCacheHome: string | undefined,
  home: string | undefined,
  repoBasename: string
): string => {
  const normalizedRepoBasename = trimNonEmpty(repoBasename);
  if (normalizedRepoBasename === undefined) {
    throw new AgentEvalConfigError({
      message: "Worktree isolation requires a non-empty repository basename.",
    });
  }

  const normalizedXdg = trimNonEmpty(xdgCacheHome);
  if (normalizedXdg !== undefined) {
    const expandedXdg = expandHomePrefix(normalizedXdg, home, "XDG_CACHE_HOME");
    return `${expandedXdg}/${normalizedRepoBasename}/agent-eval/worktrees`;
  }

  const normalizedHome = trimNonEmpty(home);
  if (normalizedHome === undefined) {
    throw new AgentEvalConfigError({
      message: "Worktree isolation requires XDG_CACHE_HOME or HOME to resolve default --worktree-root.",
    });
  }

  return `${normalizedHome}/.cache/${normalizedRepoBasename}/agent-eval/worktrees`;
};
