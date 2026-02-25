import * as S from "effect/Schema";
import { AgentNameSchema } from "./AgentRunConfig.js";

/**
 * Agent execution transcript captured per run.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentRunTranscript = {
  readonly runId: string;
  readonly taskId: string;
  readonly agent: typeof AgentNameSchema.Type;
  readonly model: string;
  readonly command: string;
  readonly promptPacket: string;
  readonly rawOutput: string;
  readonly assistantText: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number;
  readonly touchedPaths: ReadonlyArray<string>;
};

/**
 * Runtime schema for execution transcript.
 *
 * @since 0.0.0
 * @category schemas
 */
export const AgentRunTranscriptSchema = S.Struct({
  runId: S.NonEmptyString,
  taskId: S.NonEmptyString,
  agent: AgentNameSchema,
  model: S.NonEmptyString,
  command: S.NonEmptyString,
  promptPacket: S.String,
  rawOutput: S.String,
  assistantText: S.String,
  inputTokens: S.Int,
  outputTokens: S.Int,
  costUsd: S.Number,
  touchedPaths: S.Array(S.NonEmptyString),
});
