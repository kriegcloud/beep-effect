import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
import { assert, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import type { BlockNode, BlockScanner } from "@beep/markdown/internal/blockTypes";

const scannerFor = (currentLine: string, tip: BlockNode, indent = 0): BlockScanner => {
  let offset = 0;
  let column = 0;
  let currentTip = tip;
  return {
    currentLine,
    lineStart: 0,
    lineNumber: 2,
    get offset() {
      return offset;
    },
    get column() {
      return column;
    },
    nextNonspace: indent,
    nextNonspaceColumn: indent,
    indent,
    indented: indent >= 4,
    blank: Str.trim(currentLine).length === 0,
    get tip() {
      return currentTip;
    },
    allClosed: true,
    advanceOffset: dual(
      (args) => P.isNumber(args[0]),
      (count: number, _columns?: boolean): void => {
        offset += count;
        column += count;
      }
    ),
    advanceNextNonspace: () => {
      offset = indent;
      column = indent;
    },
    findNextNonspace: () => {},
    closeUnmatchedBlocks: () => {},
    setScanPosition: dual(2, (at: number, col: number): void => {
      offset = at;
      column = col;
    }),
    setLastLineLength: () => {},
    addLine: () => {},
    addChild: dual(2, (type: BlockType, at: number): BlockNode => {
      const node = makeBlockNode(type, at, 2);
      node.parent = currentTip;
      currentTip.children.push(node);
      currentTip = node;
      return node;
    }),
    replaceBlock: dual(2, (block: BlockNode, type: BlockType): BlockNode => {
      const node = makeBlockNode(type, block.startOffset, block.startLine);
      node.stringContent = block.stringContent;
      node.segments.push(...block.segments);
      currentTip = node;
      return node;
    }),
    insertBefore: dual(2, (block: BlockNode, type: BlockType): BlockNode => {
      const node = makeBlockNode(type, block.startOffset, block.startLine);
      node.parent = block.parent;
      block.parent?.children.unshift(node);
      return node;
    }),
    finalizeBlock: dual(2, (block: BlockNode, _lineNumber: number): void => {
      block.open = false;
      currentTip = block.parent ?? tip;
    }),
  };
};

import { setextHeadingStart } from "@beep/markdown/internal/blocks/setextHeading";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import type { BlockType } from "@beep/markdown/internal/blockTypes";

it.effect("definitions alone do not become a setext heading", () =>
  Effect.sync(() => {
    const parent = makeBlockNode("document", 0, 1);
    const block = makeBlockNode("paragraph", 0, 1);
    block.parent = parent;
    parent.children.push(block);
    block.stringContent = "[key]: /target\n";
    const scanner = scannerFor("---", block);
    assert.strictEqual(setextHeadingStart.trigger(scanner, block), 0);
    assert.strictEqual(block.stringContent, "");
    assert.strictEqual(parent.children[0]?.type, "definition");
  })
);
