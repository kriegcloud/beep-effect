/**
 * Public repository registration model re-exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Repository registration model re-exports.
 *
 * @example
 * ```ts
 * import { RepoRegistration, RepoRegistrationInput } from "@beep/repo-memory-model"
 *
 * const schemas = [RepoRegistration, RepoRegistrationInput]
 * ```
 *
 * @category domain model
 * @since 0.0.0
 */
export {
  /**
   * Repository registration model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RepoRegistration,
  /**
   * Repository registration input model.
   *
   * @since 0.0.0
   * @category DomainModel
   */
  RepoRegistrationInput,
} from "../internal/protocolModels.js";
