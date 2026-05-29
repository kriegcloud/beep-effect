/**
 * Workspace entity table namespaces.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * CandidateDraft table metadata namespace.
 *
 * @example
 * ```ts
 * import { CandidateDraft } from "@beep/workspace-tables/entities"
 *
 * console.log(CandidateDraft.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * as CandidateDraft from "./CandidateDraft/index.ts";
/**
 * CandidateProject table metadata namespace.
 *
 * @example
 * ```ts
 * import { CandidateProject } from "@beep/workspace-tables/entities"
 *
 * console.log(CandidateProject.Table.definition.tableName)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * as CandidateProject from "./CandidateProject/index.ts";
