// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Port notes: this module owns the shared `heading` construct as well as the
// ATX block start, because upstream's `blocks.heading` entry serves both
// spellings. The setext start (`setextHeading.ts`) promotes a paragraph into
// a `heading` block and sets `data.headingStyle` to "setext"; materialization
// reads that field, so both spellings land on the same construct.
//
// The offset delta: upstream records only a start column for the heading and
// lets the inline pass inherit it. Here the content run is pushed onto the
// block's segment table with its absolute source offset, so the inline pass
// can place real offsets inside the heading.

import { dual, pipe } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { BlockConstruct, BlockStart, containsNothing, inlineHostMaterializer, neverContinues } from "../blockTypes.ts";
import { HeadingDepth, trustedNode } from "../nodes.ts";
import type { BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";
import type { Heading } from "../nodes.ts";

/** The opening run of hashes and its separator, sticky at the scan position. */
const reATXHeadingMarker = /#{1,6}(?:[ \t]+|$)/y;
const reOnlyTrailingHashes = /^[ \t]*#+[ \t]*$/;
const reClosingHashes = /[ \t]+#+[ \t]*$/;

/** Narrow a `#`-run length to the schema's depth literal; the regex caps it at 6. */
const headingDepth = (hashes: number): HeadingDepth => Result.getOrThrow(S.decodeUnknownResult(HeadingDepth)(hashes));

/**
 * Materializes a heading that never spans more than one line and contains no blocks.
 *
 * **Example** (Inspect heading containment)
 *
 * ```ts
 * import { headingConstruct } from "@beep/markdown/internal/blocks/atxHeading";
 *
 * console.log(headingConstruct.acceptsLines); // false
 * console.log(headingConstruct.canContain("paragraph")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const headingConstruct = new BlockConstruct("heading", false, {
  canContain: containsNothing,
  // A heading can never contain more than one line, so it never continues.
  continue: neverContinues,
  materialize: inlineHostMaterializer((block, inline, context) =>
    trustedNode<Heading>({
      type: "heading",
      depth: block.data.level ?? 1,
      children: inline.children,
      position: context.position(block.startOffset, block.endOffset),
      headingStyle: block.data.headingStyle ?? "atx",
    })
  ),
});

/**
 * Opens an ATX heading marked by `#` through `######`, optionally closed.
 *
 * **Example** (Identify the ATX start)
 *
 * ```ts
 * import { atxHeadingStart } from "@beep/markdown/internal/blocks/atxHeading";
 *
 * console.log(atxHeadingStart.name); // atxHeading
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const atxHeadingStart = new BlockStart(
  "atxHeading",
  dual(2, (scanner: BlockScanner, _container: BlockNode): BlockStartResult => {
    if (scanner.indented) {
      return 0;
    }

    reATXHeadingMarker.lastIndex = scanner.nextNonspace;
    const match = reATXHeadingMarker.exec(scanner.currentLine);
    if (match === null) {
      return 0;
    }

    scanner.advanceNextNonspace();
    scanner.advanceOffset(match[0].length, false);
    scanner.closeUnmatchedBlocks();

    const container = scanner.addChild("heading", scanner.nextNonspace);
    container.data.level = headingDepth(Str.trimEnd(match[0]).length);
    container.data.headingStyle = "atx";

    // Both replacements strip a suffix, so the surviving content is still a
    // prefix of the line remainder — which is what makes the single segment
    // below exact.
    const content = pipe(
      scanner.currentLine,
      Str.slice(scanner.offset),
      Str.replace(reOnlyTrailingHashes, ""),
      Str.replace(reClosingHashes, "")
    );
    container.stringContent = content;
    container.segments.push({
      textOffset: 0,
      sourceOffset: scanner.lineStart + scanner.offset,
      length: content.length,
    });

    scanner.advanceOffset(scanner.currentLine.length - scanner.offset, false);
    return 2;
  })
);
