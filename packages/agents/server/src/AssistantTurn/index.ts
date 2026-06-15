/**
 * Assistant-turn streaming primitives for the agents server slice.
 *
 * @packageDocumentation
 * @category parsing
 * @since 0.0.0
 */

/**
 * Anthropic provider-adaptation codecs for the assistant-turn output.
 *
 * @example
 * ```ts
 * import { assistantBlockOutput } from "@beep/agents-server/AssistantTurn"
 *
 * console.log(assistantBlockOutput.codec)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export * from "./AnthropicTurnCodec.js";
/**
 * Anthropic streaming kernel Layer satisfying the `AgentTurnKernel` port.
 *
 * @example
 * ```ts
 * import { AnthropicTurnKernel } from "@beep/agents-server/AssistantTurn"
 *
 * console.log(AnthropicTurnKernel)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export * from "./AnthropicTurnKernel.js";
/**
 * Incremental completed-block extractor and its carry state.
 *
 * @example
 * ```ts
 * import { initialScanState, scanChunk } from "@beep/agents-server/AssistantTurn"
 *
 * console.log(initialScanState, scanChunk)
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export * from "./ScanState.js";
