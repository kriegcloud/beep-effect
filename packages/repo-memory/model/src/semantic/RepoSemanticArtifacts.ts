/**
 * Public semantic artifacts model re-export.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Snapshot-scoped semantic artifacts model re-export.
 *
 * @example
 * ```ts
 * import { RepoSemanticArtifacts } from "@beep/repo-memory-model"
 *
 * const schema = RepoSemanticArtifacts
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export {
  /**
   * Snapshot-scoped semantic artifacts derived from deterministic repo indexing.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RepoSemanticArtifacts,
} from "../internal/domain.js";
