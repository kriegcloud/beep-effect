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

import { htmlBlockConstruct, htmlBlockStart, isHtmlBlockEnd } from "@beep/markdown/internal/blocks/htmlBlock";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";

describe("HTML block construct coverage", () => {
  it.effect("HTML is a leaf and absent, invalid or fractional kinds have no closer", () =>
    Effect.sync(() => {
      const block = makeBlockNode("html", 0, 1);
      assert.strictEqual(htmlBlockConstruct.canContain("paragraph"), false);
      assert.strictEqual(htmlBlockConstruct.continue(scanner({ blank: true }), block), 0);
      block.stringContent = "<!-- raw -->";
      const node = htmlBlockConstruct.materialize(block, [], context);
      if (node?.type !== "html") {
        assert.fail("expected HTML");
      }
      assert.strictEqual(node.value, "<!-- raw -->");
      assert.strictEqual(isHtmlBlockEnd(block, "</script>"), false);
      for (const type of [0, 8, 1.5]) {
        block.data.htmlBlockType = type;
        assert.strictEqual(isHtmlBlockEnd("</script>")(block), false);
      }
      block.data.htmlBlockType = 1;
      assert.strictEqual(isHtmlBlockEnd("</script>")(block), true);
    })
  );
  it.effect("generic HTML tags cannot interrupt a paragraph or its lazy continuation", () =>
    Effect.sync(() => {
      const document = makeBlockNode("document", 0, 1);
      const paragraph = makeBlockNode("paragraph", 0, 1);
      assert.strictEqual(htmlBlockStart.trigger(scanner({ currentLine: "<widget>" }), document), 2);
      assert.strictEqual(htmlBlockStart.trigger(scanner({ currentLine: "<widget>" }), paragraph), 0);
      assert.strictEqual(
        htmlBlockStart.trigger(scanner({ currentLine: "<widget>", allClosed: false, tip: paragraph }), document),
        0
      );
      assert.strictEqual(htmlBlockStart.trigger(scanner({ currentLine: "<" }), document), 0);
      for (const type of [6, 7]) {
        const block = makeBlockNode("html", 0, 1);
        block.data.htmlBlockType = type;
        assert.strictEqual(htmlBlockConstruct.continue(scanner({ blank: true }), block), 1);
        assert.strictEqual(htmlBlockConstruct.continue(scanner({ blank: false }), block), 0);
      }
    })
  );
});
