/**
 * @since 0.0.0
 */
import * as S from "effect/Schema";

/**
 * Agent identifier used in benchmark runs.
 *
 * @since 0.0.0
 * @category models
 */
export const AgentNameSchema = S.Literals(["codex", "claude"]);

/**
 * Agent identifier used in benchmark runs.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentName = typeof AgentNameSchema.Type;

/**
 * Benchmark condition identifier.
 *
 * @since 0.0.0
 * @category models
 */
export const BenchConditionSchema = S.Literals(["current", "minimal", "adaptive", "adaptive_kg"]);

/**
 * Benchmark condition identifier.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchCondition = typeof BenchConditionSchema.Type;

/**
 * Run-level configuration for one agent/condition/trial tuple.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentRunConfig = {
  readonly agent: AgentName;
  readonly model: string;
  readonly condition: BenchCondition;
  readonly trial: number;
};

/**
 * Runtime schema for run-level configuration.
 *
 * @since 0.0.0
 * @category schemas
 */
export const AgentRunConfigSchema = S.Struct({
  agent: AgentNameSchema,
  model: S.NonEmptyString,
  condition: BenchConditionSchema,
  trial: S.Int,
});
