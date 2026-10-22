import { thematicBreakConstruct } from "@beep/markdown/internal/blocks/thematicBreak";
import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
import { Position } from "@beep/markdown/MarkdownNode";
import { assert, it } from "@effect/vitest";
import { assertDefined } from "@effect/vitest/utils";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import type {
  BlockNode,
  BlockScanner,
  BlockType,
  InlineHost,
  PreparedInline,
} from "@beep/markdown/internal/blockTypes";

it.effect("rejects children and materializes a synthetic break without inventing a marker", () =>
  Effect.sync(() => {
    const block = makeBlockNode("thematicBreak", 0, 0, 1);
    const position = Position.make({
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: 1, offset: 0 },
    });
    const node = thematicBreakConstruct.materialize(block, [], {
      position: dual(2, (_startOffset: number, _endOffset: number): Position => position),
      registerInline: dual(2, (_parent: InlineHost, _prepared: PreparedInline): void => undefined),
      inlineSlice: () => ({ text: "", startOffset: 0, endOffset: 0, segments: [], children: [] }),
    });
    assertDefined(node);
    assert.strictEqual(thematicBreakConstruct.canContain("paragraph"), false);
    assert.strictEqual(node.type, "thematicBreak");
    assert.deepStrictEqual(node.position, position);
    assert.strictEqual("markerChar" in node, false);
  })
);

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

it.effect("ends on the next line rather than absorbing it", () =>
  Effect.sync(() => {
    const block = makeBlockNode("thematicBreak", 0, 1);
    assert.strictEqual(thematicBreakConstruct.continue(scanner({ currentLine: "next" }), block), 1);
  })
);
