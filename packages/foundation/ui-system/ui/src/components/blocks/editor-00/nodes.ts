// cspell:ignore Klass

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { type Klass, type LexicalNode, type LexicalNodeReplacement, ParagraphNode, TextNode } from "lexical";

/**
 * Lexical node set registered by the shared editor block.
 *
 * @since 0.0.0
 * @category Presentation
 */
export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
];
