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
 * @category DomainModel
 */
export const BenchSuiteStatusSchema = S.Literals(["completed", "aborted_wall_cap"]);

/**
 * Benchmark suite completion status.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type BenchSuiteStatus = typeof BenchSuiteStatusSchema.Type;

/**
 * Expanded run record with config, task, and preflight metadata.
 *
 * @since 0.0.0
 * @category DomainModel
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
  readonly retrievalTop5?:
    | {
        readonly labeled: boolean;
        readonly expectedTargets: ReadonlyArray<string>;
        readonly top5Facts: ReadonlyArray<string>;
        readonly matchedTargets: ReadonlyArray<string>;
        readonly hit: boolean | null;
      }
    | undefined;
  readonly kgContextReview?:
    | {
        readonly reviewerScores: ReadonlyArray<{
          readonly reviewerId: string;
          readonly score: number;
        }>;
        readonly meanScore: number | null;
        readonly minimumReviewers: number;
        readonly qualifies: boolean;
      }
    | undefined;
};

/**
 * Benchmark suite artifact persisted per execution.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AgentBenchSuite = {
  readonly formatVersion: 1;
  readonly runAtEpochMs: number;
  readonly strictTaskCount: number;
  readonly conditions: ReadonlyArray<BenchCondition>;
  readonly runMode?: "simulate" | "live" | undefined;
  readonly executionBackend?: "cli" | "sdk" | "mixed" | undefined;
  readonly matrixFingerprint?: string | undefined;
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
 * @category Validation
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
  retrievalTop5: S.optional(
    S.Struct({
      labeled: S.Boolean,
      expectedTargets: S.Array(S.NonEmptyString),
      top5Facts: S.Array(S.NonEmptyString),
      matchedTargets: S.Array(S.NonEmptyString),
      hit: S.NullOr(S.Boolean),
    })
  ),
  kgContextReview: S.optional(
    S.Struct({
      reviewerScores: S.Array(
        S.Struct({
          reviewerId: S.NonEmptyString,
          score: S.Number,
        })
      ),
      meanScore: S.NullOr(S.Number),
      minimumReviewers: S.Int,
      qualifies: S.Boolean,
    })
  ),
});

/**
 * Runtime schema for benchmark suite artifact.
 *
 * @since 0.0.0
 * @category Validation
 */
export const AgentBenchSuiteSchema = S.Struct({
  formatVersion: S.Literal(1),
  runAtEpochMs: S.Int,
  strictTaskCount: S.Int,
  conditions: S.Array(BenchConditionSchema),
  runMode: S.optional(S.Literals(["simulate", "live"])),
  executionBackend: S.optional(S.Literals(["cli", "sdk", "mixed"])),
  matrixFingerprint: S.optional(S.String),
  status: S.optional(BenchSuiteStatusSchema),
  plannedRunCount: S.optional(S.Int),
  completedRunCount: S.optional(S.Int),
  abortReason: S.optional(S.NullOr(S.NonEmptyString)),
  records: S.Array(AgentRunRecordSchema),
});
