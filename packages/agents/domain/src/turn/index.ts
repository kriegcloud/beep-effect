/**
 * Backward-compatible assistant turn content exports.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * AssistantContent compatibility namespace.
 *
 * @example
 * ```ts
 * import { AssistantContent } from "@beep/agents-domain/turn"
 *
 * console.log(AssistantContent.AssistantContent)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export * as AssistantContent from "../values/AssistantContent/index.js";
/**
 * Flat assistant content compatibility exports.
 *
 * @example
 * ```ts
 * import { AssistantBlock } from "@beep/agents-domain/turn"
 *
 * console.log(AssistantBlock)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export {
  AssistantBlock,
  assistantContentToDocument,
  blockToMd,
  CodeBlock,
  HeadingBlock,
  InlineNode,
  inlineToMd,
  LinkInline,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  TextInline,
} from "../values/AssistantContent/index.js";
/**
 * Type-only assistant content compatibility aliases.
 *
 * @example
 * ```ts
 * import type { AssistantContentType } from "@beep/agents-domain/turn"
 *
 * const content: AssistantContentType = { blocks: [] }
 * console.log(content.blocks.length)
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export type {
  AssistantBlock as AssistantBlockType,
  AssistantContent as AssistantContentType,
  InlineNode as InlineNodeType,
} from "../values/AssistantContent/index.js";
