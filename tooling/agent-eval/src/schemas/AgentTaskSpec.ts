import * as S from "effect/Schema";

/**
 * Task category for benchmark coverage balancing.
 *
 * @since 0.0.0
 * @category models
 */
export const TaskCategorySchema = S.Literals(["apps_web", "tooling_cli", "package_lib"]);

/**
 * Task category for benchmark coverage balancing.
 *
 * @since 0.0.0
 * @category models
 */
export type TaskCategory = typeof TaskCategorySchema.Type;

/**
 * Benchmark task definition for one real-world agent trial target.
 *
 * @since 0.0.0
 * @category models
 */
export type AgentTaskSpec = {
  readonly id: string;
  readonly title: string;
  readonly category: TaskCategory;
  readonly prompt: string;
  readonly cwd: string;
  readonly acceptanceCommands: ReadonlyArray<string>;
  readonly timeoutMinutes: number;
  readonly touchedPathAllowlist: ReadonlyArray<string>;
};

/**
 * Runtime schema for benchmark task definition.
 *
 * @since 0.0.0
 * @category schemas
 */
export const AgentTaskSpecSchema = S.Struct({
  id: S.NonEmptyString,
  title: S.NonEmptyString,
  category: TaskCategorySchema,
  prompt: S.NonEmptyString,
  cwd: S.NonEmptyString,
  acceptanceCommands: S.Array(S.NonEmptyString),
  timeoutMinutes: S.Int,
  touchedPathAllowlist: S.Array(S.NonEmptyString),
});
