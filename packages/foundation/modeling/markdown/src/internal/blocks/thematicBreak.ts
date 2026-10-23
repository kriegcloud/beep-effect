// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// Port notes: `markerChar` is a fidelity extra with no upstream counterpart —
// upstream renders `<hr />` and forgets which character drew it.

import * as O from "@beep/utils/Option";
import { dual } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { BlockConstruct, BlockStart, containsNothing, leafMaterializer, neverContinues } from "../blockTypes.ts";
import { ThematicBreakChar, trustedNode } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import { matchesAt } from "../preprocess.ts";
import type { BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";
import type { ThematicBreak } from "../nodes.ts";

/** A thematic break of one marker character, sticky at the scan position. */
const reThematicBreak = /(?:(?:\*[ \t]*){3,}|(?:_[ \t]*){3,}|(?:-[ \t]*){3,})$/y;

const decodeThematicBreakChar = S.decodeUnknownResult(ThematicBreakChar);

/**
 * Represents a thematic break occupying one line with no children.
 *
 * **Example** (Check thematic break child rejection)
 *
 * ```ts
 * import { thematicBreakConstruct } from "@beep/markdown/internal/blocks/thematicBreak"
 *
 * console.log(thematicBreakConstruct.canContain("paragraph")) // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const thematicBreakConstruct = new BlockConstruct("thematicBreak", false, {
  canContain: containsNothing,
  // A thematic break can never contain more than one line.
  continue: neverContinues,
  materialize: leafMaterializer((block, context) =>
    trustedNode<ThematicBreak>({
      type: "thematicBreak",
      position: context.position(block.startOffset, block.endOffset),
      // Conditional spread: an absent optionalKey must be genuinely absent,
      // never an explicit `undefined` — passing one throws at construction.
      ...O.getSomesStruct({ markerChar: O.fromUndefinedOr(block.data.markerChar) }),
    })
  ),
});

/**
 * Recognizes a thematic-break block start made of three or more `-`, `_` or `*`.
 *
 * **Example** (Identify the thematic break start)
 *
 * ```ts
 * import { thematicBreakStart } from "@beep/markdown/internal/blocks/thematicBreak"
 *
 * console.log(thematicBreakStart.name) // thematicBreak
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const thematicBreakStart = new BlockStart(
  "thematicBreak",
  dual(2, (scanner: BlockScanner, _container: BlockNode): BlockStartResult => {
    if (scanner.indented || !matchesAt(reThematicBreak, scanner.currentLine, scanner.nextNonspace)) {
      return 0;
    }

    scanner.closeUnmatchedBlocks();
    const container = scanner.addChild("thematicBreak", scanner.nextNonspace);
    container.data.markerChar = Result.getOrThrow(
      decodeThematicBreakChar(unitAt(scanner.currentLine, scanner.nextNonspace))
    );
    scanner.advanceOffset(scanner.currentLine.length - scanner.offset, false);
    return 2;
  })
);
