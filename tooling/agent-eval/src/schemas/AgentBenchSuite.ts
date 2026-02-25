import * as S from "effect/Schema";
import { AgentRunConfigSchema, type BenchCondition, BenchConditionSchema } from "./AgentRunConfig.js";
import { AgentRunResultSchema } from "./AgentRunResult.js";
import { AgentTaskSpecSchema } from "./AgentTaskSpec.js";

/**
 * Expanded run record with config, task, and preflight metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentRunRecord = {
  readonly config: typeof AgentRunConfigSchema.Type;
  readonly task: typeof AgentTaskSpecSchema.Type;
  readonly result: typeof AgentRunResultSchema.Type;
  readonly selectedPolicyIds: ReadonlyArray<string>;
  readonly selectedSkills: ReadonlyArray<string>;
  readonly correctionFacts: ReadonlyArray<string>;
  readonly retrievedFacts: ReadonlyArray<string>;
};

/**
 * Benchmark suite artifact persisted per execution.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentBenchSuite = {
  readonly formatVersion: 1;
  readonly runAtEpochMs: number;
  readonly strictTaskCount: number;
  readonly conditions: ReadonlyArray<BenchCondition>;
  readonly records: ReadonlyArray<AgentRunRecord>;
};

/**
 * Runtime schema for expanded run record.
 *
 * @since 0.0.0
 * @category schemas
 */
export const AgentRunRecordSchema = S.Struct({
  config: AgentRunConfigSchema,
  task: AgentTaskSpecSchema,
  result: AgentRunResultSchema,
  selectedPolicyIds: S.Array(S.NonEmptyString),
  selectedSkills: S.Array(S.NonEmptyString),
  correctionFacts: S.Array(S.NonEmptyString),
  retrievedFacts: S.Array(S.NonEmptyString),
});

/**
 * Runtime schema for benchmark suite artifact.
 *
 * @since 0.0.0
 * @category schemas
 */
export const AgentBenchSuiteSchema = S.Struct({
  formatVersion: S.Literal(1),
  runAtEpochMs: S.Int,
  strictTaskCount: S.Int,
  conditions: S.Array(BenchConditionSchema),
  records: S.Array(AgentRunRecordSchema),
});
