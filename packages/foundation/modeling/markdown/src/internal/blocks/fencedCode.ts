// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// The fenced-code block start. The construct both code spellings share lives
// in `code.ts`, which branches on the `isFenced` flag this start sets.

import { dual } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import { BlockStart } from "../blockTypes.ts";
import { FenceChar } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import type { BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";

/** An opening fence, sticky at the scan position: backticks with none in the info string, or tildes. */
const reCodeFence = /`{3,}(?!.*`)|~{3,}/y;

const decodeFenceChar = S.decodeUnknownResult(FenceChar);

/**
 * Opens a fenced code block with three or more backticks or tildes.
 *
 * **Example** (Identify the fenced code start)
 *
 * ```ts
 * import { fencedCodeStart } from "@beep/markdown/internal/blocks/fencedCode";
 *
 * console.log(fencedCodeStart.name); // fencedCode
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const fencedCodeStart = new BlockStart(
  "fencedCode",
  dual(2, (scanner: BlockScanner, _container: BlockNode): BlockStartResult => {
    if (scanner.indented) {
      return 0;
    }

    reCodeFence.lastIndex = scanner.nextNonspace;
    const match = reCodeFence.exec(scanner.currentLine);
    if (match === null) {
      return 0;
    }

    const fenceChar = Result.getOrThrow(decodeFenceChar(unitAt(match[0], 0)));

    scanner.closeUnmatchedBlocks();
    const container = scanner.addChild("code", scanner.nextNonspace);
    container.data.isFenced = true;
    container.data.fenceLength = match[0].length;
    container.data.fenceChar = fenceChar;
    container.data.fenceOffset = scanner.indent;
    scanner.advanceNextNonspace();
    scanner.advanceOffset(match[0].length, false);
    return 2;
  })
);
