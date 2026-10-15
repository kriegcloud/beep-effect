import { assert, describe, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import { makeBlockNode } from "../../../../effected/markdown/internal/blockTypes.ts";
import type { BlockNode, BlockScanner, BlockType, InlineHost, MaterializeContext, PreparedInline } from "../../../../effected/markdown/internal/blockTypes.ts";
import { Position } from "../../../../effected/markdown/MarkdownNode.ts";

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
const context: MaterializeContext = {
  position: dual(2, (_startOffset: number, _endOffset: number): Position => Position.synthetic),
  inlineSlice: (block) => ({text: block.stringContent, startOffset: block.startOffset,
    endOffset: block.endOffset, segments: block.segments, children: []}),
  registerInline: dual(2, (_parent: InlineHost, _prepared: PreparedInline): void => {}),
};
import { headingConstruct, atxHeadingStart } from "../../../../effected/markdown/internal/blocks/atxHeading.ts";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
describe("ATX heading construct coverage", () => {
 it.effect("leaf containment, termination and materialization defaults", () => Effect.sync(() => {
  const block = makeBlockNode("heading", 0, 1);
  assert.strictEqual(headingConstruct.canContain("paragraph"), false);
  assert.strictEqual(headingConstruct.continue(scanner(), block), 1);
  const node = headingConstruct.materialize(block, [], context);
  assert.strictEqual(node?.type, "heading");
  if (node?.type === "heading") { assert.strictEqual(node.depth, 1); assert.strictEqual(node.headingStyle, "atx"); }
  block.data.level = 2; block.data.headingStyle = "setext";
  const setext = headingConstruct.materialize(block, [], context);
  if (setext?.type !== "heading") { assert.fail("expected heading"); }
  assert.strictEqual(setext.depth, 2); assert.strictEqual(setext.headingStyle, "setext");
 }));
 it.effect("indented markers cannot open headings", () => Effect.sync(() => {
  const scan = scanner({currentLine: "    # title", indented: true});
  assert.strictEqual(atxHeadingStart.trigger(scan, scan.tip), 0);
 }));
});
