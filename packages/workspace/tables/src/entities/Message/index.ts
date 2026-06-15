/**
 * Workspace Message table metadata.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Message row converter exports.
 *
 * @example
 * ```ts
 * import * as Message from "@beep/workspace-tables/entities/Message"
 *
 * console.log(Message.toMessageInsert)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * from "./Message.converters.ts";
/**
 * Message table exports.
 *
 * @example
 * ```ts
 * import * as Message from "@beep/workspace-tables/entities/Message"
 *
 * console.log(Message.Table.definition.entityId.entityType)
 * ```
 *
 * @category tables
 * @since 0.0.0
 */
export * from "./Message.table.ts";
