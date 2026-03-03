import * as S from "effect/Schema";

/**
 * Per-run benchmark result metrics.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type AgentRunResult = {
  readonly runId: string;
  readonly taskId: string;
  readonly success: boolean;
  readonly checkPass: boolean;
  readonly lintPass: boolean;
  readonly testPass: boolean;
  readonly wrongApiIncidentCount: number;
  readonly steps: number;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number;
  readonly wallMs: number;
};

/**
 * Runtime schema for benchmark result metrics.
 *
 * @since 0.0.0
 * @category Validation
 */
export const AgentRunResultSchema = S.Struct({
  runId: S.NonEmptyString,
  taskId: S.NonEmptyString,
  success: S.Boolean,
  checkPass: S.Boolean,
  lintPass: S.Boolean,
  testPass: S.Boolean,
  wrongApiIncidentCount: S.Int,
  steps: S.Int,
  inputTokens: S.Int,
  outputTokens: S.Int,
  costUsd: S.Number,
  wallMs: S.Number,
});
