/**
 * Public grounded citation model re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Grounded citation model re-exports.
 *
 * @example
 * ```ts
 * import { Citation, CitationSpan } from "@beep/repo-memory-model"
 *
 * const schemas = [Citation, CitationSpan]
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export {
  /**
   * Grounded citation model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  Citation,
  /**
   * Grounding citation span model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  CitationSpan,
} from "../internal/domain.js";
