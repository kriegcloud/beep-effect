/**
 * Public repo run service re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export type {
  /**
   * Repo run service shape.
   *
   * @example
   * ```ts
   * import type { RepoRunServiceShape } from "@beep/repo-memory-runtime"
   *
   * const methods = [
   *   "executeIndexRun",
   *   "executeQueryRun",
   *   "streamRunEvents"
   * ] satisfies ReadonlyArray<keyof RepoRunServiceShape>
   * ```
   *
   * @since 0.0.0
   * @category port contract
   */
  RepoRunServiceShape,
} from "../internal/RepoMemoryRuntime.js";

export {
  /**
   * Repo run service.
   *
   * @example
   * ```ts
   * import { RepoRunService } from "@beep/repo-memory-runtime"
   * import { Effect } from "effect"
   *
   * const program = Effect.gen(function* () {
   *   const service = yield* RepoRunService
   *   return service.listRuns
   * })
   * ```
   *
   * @since 0.0.0
   * @category port contract
   */
  RepoRunService,
  /**
   * Repo run service error.
   *
   * @example
   * ```ts
   * import { RepoRunServiceError } from "@beep/repo-memory-runtime"
   *
   * const error = RepoRunServiceError.noCause("Run not found.", 404)
   * ```
   *
   * @since 0.0.0
   * @category domain model
   */
  RepoRunServiceError,
} from "../internal/RepoMemoryRuntime.js";
