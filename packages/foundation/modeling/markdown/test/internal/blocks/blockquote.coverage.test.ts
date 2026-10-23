import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import type { BlockNode, BlockScanner, BlockType } from "@beep/markdown/internal/blockTypes";

const scanner = (overrides: Partial<BlockScanner> = {}): BlockScanner => {
  let offset = 0;
  return {
    currentLine: "",
    lineStart: 0,
    lineNumber: 1,
    get offset() {
      return offset;
    },
    column: 0,
    nextNonspace: 0,
    nextNonspaceColumn: 0,
    indent: 0,
    indented: false,
    blank: false,
    tip: makeBlockNode("document", 0, 1),
    allClosed: true,
    advanceOffset: dual(
      (args) => P.isNumber(args[0]),
      (count: number, _columns?: boolean): void => {
        offset += count;
      }
    ),
    advanceNextNonspace: () => {
      offset = overrides.nextNonspace ?? 0;
    },
    findNextNonspace: () => {},
    closeUnmatchedBlocks: () => {},
    addChild: dual(2, (type: BlockType, start: number): BlockNode => makeBlockNode(type, start, 1)),
    setScanPosition: dual(2, (start: number, _column: number): void => {
      offset = start;
    }),
    setLastLineLength: () => {},
    replaceBlock: dual(
      2,
      (block: BlockNode, type: BlockType): BlockNode => makeBlockNode(type, block.startOffset, block.startLine)
    ),
    insertBefore: dual(
      2,
      (block: BlockNode, type: BlockType): BlockNode => makeBlockNode(type, block.startOffset, block.startLine)
    ),
    finalizeBlock: dual(2, (block: BlockNode, _lineNumber: number): void => {
      block.open = false;
    }),
    addLine: () => {},
    ...overrides,
  };
};

import { blockquoteStart } from "@beep/markdown/internal/blocks/blockquote";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";

describe("blockquote marker boundary coverage", () => {
  it.effect("a bare marker opens a quote without consuming a nonexistent following space", () =>
    Effect.sync(() => {
      let child = makeBlockNode("document", 0, 1);
      const scan = scanner({
        currentLine: ">",
        addChild: dual(2, (type: BlockType, offset: number): BlockNode => {
          child = makeBlockNode(type, offset, 1);
          return child;
        }),
      });
      assert.strictEqual(blockquoteStart.trigger(scan, scan.tip), 1);
      assert.strictEqual(scan.offset, 1);
      assert.strictEqual(child.type, "blockquote");
    })
  );
});
