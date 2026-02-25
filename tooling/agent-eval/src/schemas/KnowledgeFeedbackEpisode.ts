import * as S from "effect/Schema";
import { type BenchCondition, BenchConditionSchema } from "./AgentRunConfig.js";

/**
 * Structured feedback episode emitted from failed benchmark runs.
 *
 * @since 0.0.0
 * @category models
 */
export type KnowledgeFeedbackEpisode = {
  readonly runId: string;
  readonly taskId: string;
  readonly failureType: string;
  readonly rootCause: string;
  readonly correctionFacts: ReadonlyArray<string>;
  readonly sourceFiles: ReadonlyArray<string>;
  readonly condition: BenchCondition;
};

/**
 * Runtime schema for feedback episodes.
 *
 * @since 0.0.0
 * @category schemas
 */
export const KnowledgeFeedbackEpisodeSchema = S.Struct({
  runId: S.NonEmptyString,
  taskId: S.NonEmptyString,
  failureType: S.NonEmptyString,
  rootCause: S.NonEmptyString,
  correctionFacts: S.Array(S.NonEmptyString),
  sourceFiles: S.Array(S.NonEmptyString),
  condition: BenchConditionSchema,
});
