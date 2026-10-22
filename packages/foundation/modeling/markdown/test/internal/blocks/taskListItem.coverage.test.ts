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
    blank: currentLine.trim().length === 0,
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

import { taskListItemStart } from "@beep/markdown/internal/blocks/taskListItem";
import { dual } from "effect/Function";
import * as P from "effect/Predicate";
import type { BlockType } from "@beep/markdown/internal/blockTypes";

it.effect("an unrecognized checkbox remains literal item content", () =>
  Effect.sync(() => {
    const block = makeBlockNode("listItem", 0, 1);
    const scanner = scannerFor("- [z] task", block);
    assert.strictEqual(taskListItemStart.trigger(scanner, block), 0);
    assert.strictEqual(block.data.checked, undefined);
    assert.strictEqual(scanner.offset, 0);
  })
);
