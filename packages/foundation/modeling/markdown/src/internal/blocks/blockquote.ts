// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// `blocks.block_quote` and its block start. The `>` marker consumes one
// optional following space or tab, which is where a partially consumed tab
// first becomes reachable (`addLine` pads the remainder back out).

import { dual } from "effect/Function";
import { BlockConstruct, BlockStart, containerMaterializer, containsFlow, flowChildren } from "../blockTypes.ts";
import { trustedNode } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import { isSpaceOrTab } from "../preprocess.ts";
import type { BlockContinueResult, BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";
import type { Blockquote } from "../nodes.ts";

/**
 * Consume a `>` marker at the scan position and the one optional space or
 * tab after it — where a partially consumed tab first becomes reachable.
 * Returns whether there was a marker to consume.
 */
const consumeMarker = (scanner: BlockScanner): boolean => {
  if (scanner.indented || unitAt(scanner.currentLine, scanner.nextNonspace) !== ">") {
    return false;
  }
  scanner.advanceNextNonspace();
  scanner.advanceOffset(1, false);
  if (isSpaceOrTab(unitAt(scanner.currentLine, scanner.offset))) {
    scanner.advanceOffset(1, true);
  }
  return true;
};

/**
 * Materializes a blockquote that continues while each line carries its `>` marker.
 *
 * **Example** (Inspect blockquote containment)
 *
 * ```ts
 * import { blockquoteConstruct } from "@beep/markdown/internal/blocks/blockquote";
 *
 * console.log(blockquoteConstruct.canContain("paragraph")); // true
 * console.log(blockquoteConstruct.canContain("listItem")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const blockquoteConstruct = new BlockConstruct("blockquote", false, {
  canContain: containsFlow,
  continue: dual(
    2,
    (scanner: BlockScanner, _block: BlockNode): BlockContinueResult => (consumeMarker(scanner) ? 0 : 1)
  ),
  materialize: containerMaterializer((block, children, context) =>
    trustedNode<Blockquote>({
      type: "blockquote",
      children: flowChildren(children),
      position: context.position(block.startOffset, block.endOffset),
    })
  ),
});

/**
 * Opens a blockquote at an unindented `>` marker.
 *
 * **Example** (Identify the blockquote start)
 *
 * ```ts
 * import { blockquoteStart } from "@beep/markdown/internal/blocks/blockquote";
 *
 * console.log(blockquoteStart.name); // blockquote
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const blockquoteStart = new BlockStart(
  "blockquote",
  dual(2, (scanner: BlockScanner, _container: BlockNode): BlockStartResult => {
    if (!consumeMarker(scanner)) {
      return 0;
    }
    scanner.closeUnmatchedBlocks();
    scanner.addChild("blockquote", scanner.nextNonspace);
    return 1;
  })
);
