import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
import { Position } from "@beep/markdown/MarkdownNode";
import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import type {
  BlockNode,
  BlockScanner,
  BlockType,
  InlineHost,
  MaterializeContext,
  PreparedInline,
} from "@beep/markdown/internal/blockTypes";

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
const context: MaterializeContext = {
  position: dual(2, (_startOffset: number, _endOffset: number): Position => Position.synthetic),
  inlineSlice: (block) => ({
    text: block.stringContent,
    startOffset: block.startOffset,
    endOffset: block.endOffset,
    segments: block.segments,
    children: [],
  }),
  registerInline: dual(2, (_parent: InlineHost, _prepared: PreparedInline): void => {}),
};

import {
  footnoteDefinitionConstruct,
  footnoteDefinitionStart,
} from "@beep/markdown/internal/blocks/footnoteDefinition";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";

describe("footnote definition construct coverage", () => {
  it.effect("missing metadata drops a block and Unicode whitespace labels do not open one", () =>
    Effect.sync(() => {
      const block = makeBlockNode("footnoteDefinition", 0, 1);
      assert.strictEqual(footnoteDefinitionConstruct.materialize(block, [], context), undefined);
      const scan = scanner({ currentLine: "[^\u00a0]: content" });
      assert.strictEqual(footnoteDefinitionStart.trigger(scan, scan.tip), 0);
    })
  );
  it.effect("four-column indentation prevents a footnote start", () =>
    Effect.sync(() => {
      const scan = scanner({ currentLine: "    [^a]: text", indent: 4, nextNonspace: 4, indented: true });
      assert.strictEqual(footnoteDefinitionStart.trigger(scan, scan.tip), 0);
      assert.strictEqual(scan.offset, 0);
    })
  );
  it.effect("empty, whitespace-bearing and displaced labels do not open a definition", () =>
    Effect.sync(() => {
      for (const currentLine of ["[^]: text", "[^a b]: text", "text [^a]: text"]) {
        const scan = scanner({ currentLine });
        assert.strictEqual(footnoteDefinitionStart.trigger(scan, scan.tip), 0);
        assert.strictEqual(scan.offset, 0);
      }
    })
  );
});
