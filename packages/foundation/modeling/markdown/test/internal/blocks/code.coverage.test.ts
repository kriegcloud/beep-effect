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

import { codeConstruct } from "@beep/markdown/internal/blocks/code";
import { Markdown } from "@beep/markdown/Markdown";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";

describe("code construct coverage", () => {
  it.effect("empty indented content finalizes without a surviving segment", () =>
    Effect.sync(() => {
      const block = makeBlockNode("code", 12, 3);
      block.stringContent = " \n\t\n";
      assert.strictEqual(codeConstruct.canContain("paragraph"), false);
      codeConstruct.finalize?.(scanner(), block);
      assert.strictEqual(block.stringContent, "");
      assert.strictEqual(block.endOffset, 12);
      const node = codeConstruct.materialize(block, [], context);
      if (node?.type !== "code") {
        assert.fail("expected code");
      }
      assert.strictEqual(node.value, "");
      assert.strictEqual(node.fenceChar, undefined);
    })
  );
  it.effect("fenced finalization accepts an info line without a terminator", () =>
    Effect.sync(() => {
      const block = makeBlockNode("code", 0, 1);
      block.data.isFenced = true;
      block.stringContent = "ts";
      codeConstruct.finalize?.(scanner(), block);
      assert.strictEqual(block.stringContent, "");
      assert.strictEqual(block.data.lang, "ts");
      const node = codeConstruct.materialize(block, [], context);
      if (node?.type !== "code") {
        assert.fail("expected code");
      }
      assert.strictEqual(node.fenceChar, undefined);
      assert.strictEqual(node.fenceLength, undefined);
    })
  );
  it.effect("closing fences use the default length and update the source boundary", () =>
    Effect.sync(() => {
      const block = makeBlockNode("code", 0, 1);
      block.data.isFenced = true;
      block.data.fenceChar = "`";
      let end = 0;
      assert.strictEqual(
        codeConstruct.continue(
          scanner({
            currentLine: "```",
            setLastLineLength: (length) => {
              end = length;
            },
          }),
          block
        ),
        2
      );
      assert.strictEqual(end, 3);
      assert.strictEqual(block.open, false);
      const open = makeBlockNode("code", 0, 1);
      open.data.isFenced = true;
      assert.strictEqual(codeConstruct.continue(scanner({ currentLine: "text" }), open), 0);
      assert.strictEqual(open.open, true);
      open.data.fenceOffset = 2;
      const padded = scanner({ currentLine: " x" });
      assert.strictEqual(codeConstruct.continue(padded, open), 0);
      assert.strictEqual(padded.offset, 1);
    })
  );
  it.effect("empty fences and a single blank code line carry distinct literal values", () =>
    Effect.gen(function* () {
      const empty = yield* Markdown.parse("```\n```\n");
      const blank = yield* Markdown.parse("```\n\n```\n");
      const emptyCode = empty.children[0];
      const blankCode = blank.children[0];
      if (emptyCode?.type !== "code" || blankCode?.type !== "code") {
        assert.fail("expected code blocks");
      }
      assert.strictEqual(emptyCode.value, "");
      assert.strictEqual(blankCode.value, "\n");
    })
  );
});
