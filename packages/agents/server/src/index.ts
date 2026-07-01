/**
 * Package entry point for `@beep/agents-server`.
 *
 * @packageDocumentation
 * @category parsing
 * @since 0.0.0
 */

/**
 * Assistant-turn streaming primitives namespace.
 *
 * @example
 * ```ts
 * import { AssistantTurn } from "@beep/agents-server"
 *
 * const [, completed] = AssistantTurn.scanChunk(
 *   AssistantTurn.initialScanState,
 *   '{"blocks":[{"type":"paragraph"}]}'
 * )
 * console.log(completed.length) // 1
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export * as AssistantTurn from "./AssistantTurn/index.js";
