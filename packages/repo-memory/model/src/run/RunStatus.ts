/**
 * Public run status model re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Run status and terminal-state model re-exports.
 *
 * @example
 * ```ts
 * import { RepoRunStatus, RunTerminalState } from "@beep/repo-memory-model"
 *
 * const schemas = [RepoRunStatus, RunTerminalState]
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export {
  /**
   * Canonical repo-memory run status model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RepoRunStatus,
  /**
   * Terminal run state model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RunTerminalState,
} from "../internal/domain.js";
