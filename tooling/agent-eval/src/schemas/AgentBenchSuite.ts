import * as S from "effect/Schema";
import {
  type AgentRunConfig,
  AgentRunConfigSchema,
  type BenchCondition,
  BenchConditionSchema,
} from "./AgentRunConfig.js";
import { type AgentRunResult, AgentRunResultSchema } from "./AgentRunResult.js";
import { type AgentRunTranscript, AgentRunTranscriptSchema } from "./AgentRunTranscript.js";
import { type AgentTaskSpec, AgentTaskSpecSchema } from "./AgentTaskSpec.js";
import { type FailureSignature, FailureSignatureSchema } from "./FailureSignature.js";

/**
 * Benchmark suite completion status.
 *
 * @since 0.0.0
 * @category models
 */
export const BenchSuiteStatusSchema = S.Literals(["completed", "aborted_wall_cap"]);

/**
 * Benchmark suite completion status.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchSuiteStatus = typeof BenchSuiteStatusSchema.Type;

/**
 * Expanded run record with config, task, and preflight metadata.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentRunRecord = {
  readonly config: AgentRunConfig;
  readonly task: AgentTaskSpec;
  readonly result: AgentRunResult;
  readonly selectedPolicyIds: ReadonlyArray<string>;
  readonly selectedSkills: ReadonlyArray<string>;
  readonly correctionFacts: ReadonlyArray<string>;
  readonly retrievedFacts: ReadonlyArray<string>;
  readonly allowlistPass: boolean;
  readonly touchedPaths: ReadonlyArray<string>;
  readonly transcript: AgentRunTranscript | null;
  readonly failureSignature: FailureSignature | null;
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
  readonly status?: BenchSuiteStatus | undefined;
  readonly plannedRunCount?: number | undefined;
  readonly completedRunCount?: number | undefined;
  readonly abortReason?: string | null | undefined;
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
  allowlistPass: S.Boolean,
  touchedPaths: S.Array(S.NonEmptyString),
  transcript: S.NullOr(AgentRunTranscriptSchema),
  failureSignature: S.NullOr(FailureSignatureSchema),
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
  status: S.optional(BenchSuiteStatusSchema),
  plannedRunCount: S.optional(S.Int),
  completedRunCount: S.optional(S.Int),
  abortReason: S.optional(S.NullOr(S.NonEmptyString)),
  records: S.Array(AgentRunRecordSchema),
});
