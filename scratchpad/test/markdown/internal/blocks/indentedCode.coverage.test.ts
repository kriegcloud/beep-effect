import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { makeBlockNode } from "../../../../effected/markdown/internal/blockTypes.ts";
import type { BlockNode, BlockScanner, BlockType } from "../../../../effected/markdown/internal/blockTypes.ts";

const scanner = (overrides: Partial<BlockScanner> = {}): BlockScanner => {
  let offset = 0;
  return {
    currentLine: "", lineStart: 0, lineNumber: 1, get offset() { return offset; },
    column: 0, nextNonspace: 0, nextNonspaceColumn: 0, indent: 0, indented: false,
    blank: false, tip: makeBlockNode("document", 0, 1), allClosed: true,
    advanceOffset: dual((args) => P.isNumber(args[0]), (count: number, _columns?: boolean): void => { offset += count; }),
    advanceNextNonspace: () => { offset = overrides.nextNonspace ?? 0; },
    findNextNonspace: () => {}, closeUnmatchedBlocks: () => {},
    addChild: dual(2, (type: BlockType, start: number): BlockNode => makeBlockNode(type, start, 1)),
    setScanPosition: dual(2, (start: number, _column: number): void => { offset = start; }), setLastLineLength: () => {},
    replaceBlock: dual(2, (block: BlockNode, type: BlockType): BlockNode => makeBlockNode(type, block.startOffset, block.startLine)),
    insertBefore: dual(2, (block: BlockNode, type: BlockType): BlockNode => makeBlockNode(type, block.startOffset, block.startLine)),
    finalizeBlock: dual(2, (block: BlockNode, _lineNumber: number): void => { block.open = false; }), addLine: () => {}, ...overrides,
  };
};
import { indentedCodeStart } from "../../../../effected/markdown/internal/blocks/indentedCode.ts";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
describe("indented code start boundary coverage", () => {
 it.effect("unindented text, paragraph continuations and blank lines cannot open indented code", () => Effect.sync(() => {
  const samples = [scanner({currentLine: "text"}), scanner({currentLine: "    text", indent: 4, indented: true, tip: makeBlockNode("paragraph", 0, 1)}), scanner({currentLine: "    ", indent: 4, indented: true, blank: true})];
  for (const scan of samples) { assert.strictEqual(indentedCodeStart.trigger(scan, scan.tip), 0); assert.strictEqual(scan.offset, 0); }
 }));
});
