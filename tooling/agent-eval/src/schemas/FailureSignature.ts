import * as S from "effect/Schema";
import { AgentNameSchema, type BenchCondition, BenchConditionSchema } from "./AgentRunConfig.js";

/**
 * Failure signature used for retrieval and run-level triage.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FailureSignature = {
  readonly id: string;
  readonly runId: string;
  readonly taskId: string;
  readonly condition: BenchCondition;
  readonly agent: typeof AgentNameSchema.Type;
  readonly failureType: "wrong_api" | "effect_compliance" | "acceptance" | "allowlist" | "runtime";
  readonly rootCause: string;
  readonly ruleIds: ReadonlyArray<string>;
  readonly touchedPaths: ReadonlyArray<string>;
};

/**
 * Runtime schema for failure signature records.
 *
 * @since 0.0.0
 * @category Validation
 */
export const FailureSignatureSchema = S.Struct({
  id: S.NonEmptyString,
  runId: S.NonEmptyString,
  taskId: S.NonEmptyString,
  condition: BenchConditionSchema,
  agent: AgentNameSchema,
  failureType: S.Literals(["wrong_api", "effect_compliance", "acceptance", "allowlist", "runtime"]),
  rootCause: S.NonEmptyString,
  ruleIds: S.Array(S.NonEmptyString),
  touchedPaths: S.Array(S.NonEmptyString),
});
