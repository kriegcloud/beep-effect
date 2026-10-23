// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// The setext-heading block start. There is no setext heading construct: an
// underline promotes the paragraph that is already open into a `heading`
// block, which `atxHeading.ts` owns for both spellings. The promoted block
// keeps the paragraph's content, segments and start position, so the heading
// spans from the text down to the underline exactly as upstream's does.

import { dual } from "effect/Function";
import { BlockStart } from "../blockTypes.ts";
import { unitAt } from "../patterns.ts";
import { extractDefinitions } from "./linkReferenceDefinition.ts";
import type { BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";

/** A setext underline, sticky at the scan position. */
const reSetextHeadingLine = /(?:=+|-+)[ \t]*$/y;

/**
 * Promotes a paragraph to a setext heading when followed by a run of `=` or `-`.
 *
 * **Details**
 *
 * An equals underline produces level 1; a hyphen underline produces level 2.
 * Leading definitions are extracted before promotion. If they exhaust the
 * paragraph, the underline does not become a heading.
 *
 * **Example** (Identify the setext heading start)
 *
 * ```ts
 * import { setextHeadingStart } from "@beep/markdown/internal/blocks/setextHeading";
 *
 * console.log(setextHeadingStart.name); // setextHeading
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const setextHeadingStart = new BlockStart(
  "setextHeading",
  dual(2, (scanner: BlockScanner, container: BlockNode): BlockStartResult => {
    if (scanner.indented || container.type !== "paragraph") {
      return 0;
    }

    reSetextHeadingLine.lastIndex = scanner.nextNonspace;
    const match = reSetextHeadingLine.exec(scanner.currentLine);
    if (match === null) {
      return 0;
    }

    scanner.closeUnmatchedBlocks();

    // Definitions come off the front first: `[a]: /b` under a `---` is a
    // definition plus a thematic break, not a heading.
    extractDefinitions(container);
    if (container.stringContent.length === 0) {
      return 0;
    }

    const heading = scanner.replaceBlock(container, "heading");
    heading.data.level = unitAt(match[0], 0) === "=" ? 1 : 2;
    heading.data.headingStyle = "setext";
    scanner.advanceOffset(scanner.currentLine.length - scanner.offset, false);
    return 2;
  })
);
