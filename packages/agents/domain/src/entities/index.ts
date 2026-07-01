/**
 * Agents domain entity namespaces.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Agent entity and value-schema exports.
 *
 * @example
 * ```ts
 * import { Agent } from "@beep/agents-domain/entities"
 *
 * console.log(Agent.definition.entityId.entityType)
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export * from "./Agent/index.js";
/**
 * Skill entity exports.
 *
 * @example
 * ```ts
 * import { Skill } from "@beep/agents-domain/entities"
 *
 * console.log(Skill.definition.entityId.tableName)
 * ```
 *
 * @category entities
 * @since 0.0.0
 */
export * from "./Skill/index.js";
