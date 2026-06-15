/**
 * Anthropic provider adaptation for the assistant-turn structured output.
 *
 * `toCodecAnthropic` compiles a stratified schema into an Anthropic-compatible
 * JSON Schema plus a codec that decodes model output back into the domain type.
 * It THROWS at module load if the schema ever grows a construct the provider
 * cannot express (recursion, `Unknown`, `S.optional`, ...), so importing this
 * module doubles as a structural guarantee that the v1 md-aligned block scope
 * (paragraph/heading/quote/list/code) stays provider-expressible.
 *
 * Provider adaptation belongs in the server slice, never in the domain.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { Turn } from "@beep/agents-domain";
import { AnthropicStructuredOutput } from "effect/unstable/ai";

/**
 * Per-block Anthropic codec for decoding individually streamed array elements.
 * Used to validate each completed `"blocks"` element slice as it arrives.
 *
 * @example
 * ```ts
 * import { assistantBlockOutput } from "@beep/agents-server/AnthropicTurnCodec"
 *
 * console.log(assistantBlockOutput.codec)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const assistantBlockOutput = AnthropicStructuredOutput.toCodecAnthropic(Turn.AssistantBlock);

/**
 * Whole-envelope Anthropic codec for the assistant turn. Its `jsonSchema`
 * feeds the forced-tool parameters; its `codec` is the provider's end-of-turn
 * decoder for the complete `AssistantContent` envelope.
 *
 * @example
 * ```ts
 * import { assistantOutput } from "@beep/agents-server/AnthropicTurnCodec"
 *
 * console.log(assistantOutput.jsonSchema)
 * ```
 *
 * @category codecs
 * @since 0.0.0
 */
export const assistantOutput = AnthropicStructuredOutput.toCodecAnthropic(Turn.AssistantContent);
