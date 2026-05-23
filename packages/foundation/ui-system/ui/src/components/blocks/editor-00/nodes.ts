// cspell:ignore Klass

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ParagraphNode, TextNode } from "lexical";
import type { Klass, LexicalNode, LexicalNodeReplacement } from "lexical";

/**
 * Lexical node set registered by the shared editor block.
 *
 * @since 0.0.0
 * @category components
 */
export const nodes: ReadonlyArray<Klass<LexicalNode> | LexicalNodeReplacement> = [
  HeadingNode,
  ParagraphNode,
  TextNode,
  QuoteNode,
];
