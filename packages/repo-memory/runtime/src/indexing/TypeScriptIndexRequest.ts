/**
 * Public re-exports for TypeScript indexing request models.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

export {
  /**
   * Indexed TypeScript artifacts model.
   *
   * @example
   * ```ts
   * import { IndexedTypeScriptArtifacts } from "@beep/repo-memory-runtime"
   *
   * const schema = IndexedTypeScriptArtifacts
   * ```
   *
   * @since 0.0.0
   * @category domain model
   */
  IndexedTypeScriptArtifacts,
  /**
   * TypeScript index request model.
   *
   * @example
   * ```ts
   * import { TypeScriptIndexRequest } from "@beep/repo-memory-runtime"
   *
   * const schema = TypeScriptIndexRequest
   * ```
   *
   * @since 0.0.0
   * @category domain model
   */
  TypeScriptIndexRequest,
} from "./TypeScriptIndexer.js";
