// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// `blocks.html_block`, the seven open conditions from `reHtmlBlockOpen` and
// the five close conditions from `reHtmlBlockClose`. Types 6 and 7 end at a
// blank line; types 1 through 5 end at their own closing pattern, which the
// line loop checks after appending each line (`isHtmlBlockEnd`).
//
// The tag grammar lives in `htmlTags.ts`, shared with the inline pass, which
// matches the full `HTMLTAG` union this file's type 7 is a subset of.

import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { BlockConstruct, BlockStart, containsNothing, leafMaterializer } from "../blockTypes.ts";
import { CLOSETAG, OPENTAG } from "../htmlTags.ts";
import { trustedNode } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import type { BlockContinueResult, BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";
import type { Html } from "../nodes.ts";

// The open conditions of block types 1 through 6, in the spec's order: the
// entry at index `i` opens type `i + 1`. Type 7 is separate because it alone
// may not interrupt a paragraph.
const reHtmlBlockOpen: ReadonlyArray<RegExp> = [
  /^<(?:script|pre|textarea|style)(?:\s|>|$)/i,
  /^<!--/,
  /^<[?]/,
  /^<![A-Za-z]/,
  /^<!\[CDATA\[/,
  /^<[/]?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[123456]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|search|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|[/]?[>]|$)/i,
];

const reHtmlBlockOpen7 = new RegExp(`^(?:${OPENTAG}|${CLOSETAG})\\s*$`, "i");

const reTrailingNewline = /\n$/;

/**
 * Type 7 may not interrupt a paragraph, nor be opened by a line that is about
 * to become a lazy continuation of one.
 */
const mayOpenType7 = (scanner: BlockScanner, container: BlockNode): boolean =>
  container.type !== "paragraph" && !(!scanner.allClosed && !scanner.blank && scanner.tip.type === "paragraph");

/** The first block type whose open condition `rest` meets, or `0` for none. */
const openingType = (rest: string, scanner: BlockScanner, container: BlockNode): number => {
  const found = A.findFirstIndex(reHtmlBlockOpen, (pattern) => pattern.test(rest));
  if (O.isSome(found)) {
    return found.value + 1;
  }
  return reHtmlBlockOpen7.test(rest) && mayOpenType7(scanner, container) ? 7 : 0;
};

const reHtmlBlockClose: ReadonlyArray<RegExp> = [/./, /<\/(?:script|pre|textarea|style)>/i, /-->/, /\?>/, />/, /\]\]>/];

/**
 * Tests whether a line closes an HTML block.
 *
 * **Details**
 *
 * Only types 1 through 5 have a closing pattern, and the line loop calls this
 * after the line has been appended. Types 6 and 7 end at a blank line instead.
 *
 * **Example** (Recognize a script closing line)
 *
 * ```ts
 * import { isHtmlBlockEnd } from "@beep/markdown/internal/blocks/htmlBlock";
 * import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
 *
 * const block = makeBlockNode("html", 0, 1);
 * block.data.htmlBlockType = 1;
 *
 * console.log(isHtmlBlockEnd(block, "</script>")); // true
 * console.log(isHtmlBlockEnd("still inside")(block)); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const isHtmlBlockEnd: {
  (block: BlockNode, rest: string): boolean;
  (rest: string): (block: BlockNode) => boolean;
} = dual(2, (block: BlockNode, rest: string): boolean => {
  const type = block.data.htmlBlockType;
  if (type === undefined || type < 1 || type > 5) {
    return false;
  }
  return reHtmlBlockClose[type]?.test(rest) ?? false;
});

/**
 * Absorbs HTML block lines verbatim and contains no child blocks.
 *
 * **Details**
 *
 * Finalization removes the final newline before materializing the HTML value.
 *
 * **Example** (Inspect HTML line absorption)
 *
 * ```ts
 * import { htmlBlockConstruct } from "@beep/markdown/internal/blocks/htmlBlock";
 *
 * console.log(htmlBlockConstruct.acceptsLines); // true
 * console.log(htmlBlockConstruct.canContain("paragraph")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const htmlBlockConstruct = new BlockConstruct("html", true, {
  canContain: containsNothing,
  continue: dual(2, (scanner: BlockScanner, block: BlockNode): BlockContinueResult => {
    const type = block.data.htmlBlockType;
    // Types 6 and 7 have no closing pattern: a blank line ends them.
    return scanner.blank && (type === 6 || type === 7) ? 1 : 0;
  }),
  finalize: dual(2, (_scanner: BlockScanner, block: BlockNode): void => {
    block.stringContent = Str.replace(reTrailingNewline, "")(block.stringContent);
  }),
  materialize: leafMaterializer((block, context) =>
    trustedNode<Html>({
      type: "html",
      value: block.stringContent,
      position: context.position(block.startOffset, block.endOffset),
    })
  ),
});

/**
 * Opens an HTML block using one of seven open conditions after an unindented `<`.
 *
 * **Details**
 *
 * Type 7 cannot interrupt a paragraph or begin on its lazy continuation.
 * Leading spaces remain part of the HTML content because opening the block
 * does not advance the scan position.
 *
 * **Example** (Identify the HTML block start)
 *
 * ```ts
 * import { htmlBlockStart } from "@beep/markdown/internal/blocks/htmlBlock";
 *
 * console.log(htmlBlockStart.name); // htmlBlock
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const htmlBlockStart = new BlockStart(
  "htmlBlock",
  dual(2, (scanner: BlockScanner, container: BlockNode): BlockStartResult => {
    if (scanner.indented || unitAt(scanner.currentLine, scanner.nextNonspace) !== "<") {
      return 0;
    }

    const blockType = openingType(Str.slice(scanner.nextNonspace)(scanner.currentLine), scanner, container);
    if (blockType === 0) {
      return 0;
    }

    scanner.closeUnmatchedBlocks();
    // The scan position is deliberately not advanced: leading spaces are
    // part of the HTML block's content.
    const block = scanner.addChild("html", scanner.offset);
    block.data.htmlBlockType = blockType;
    return 2;
  })
);
