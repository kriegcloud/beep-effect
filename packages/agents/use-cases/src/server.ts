/**
 * Server-only agents use-case exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Server-only assistant-turn use-case exports.
 *
 * @example
 * ```ts
 * import { AssistantTurn } from "@beep/agents-use-cases/server"
 *
 * const error = AssistantTurn.BlockRepairFailed.make({ message: "repair call failed" })
 * console.log(error.message)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export * as AssistantTurn from "./processes/AssistantTurn/server.js";
/**
 * Direct server-only assistant-turn exports.
 *
 * @example
 * ```ts
 * import { BlockRepairFailed } from "@beep/agents-use-cases/server"
 *
 * const error = BlockRepairFailed.make({ message: "repair call failed" })
 * console.log(error._tag) // "BlockRepairFailed"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./processes/AssistantTurn/server.js";
