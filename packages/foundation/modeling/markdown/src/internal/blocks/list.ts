// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// `blocks.list`, `blocks.item`, `parseListMarker`, `listsMatch`,
// `endsWithBlankLine` and the list-item block start. Upstream calls the item
// construct `item`; this port calls it `listItem`, which is the mdast name.
//
// Port notes:
//
// 1. Tightness. Upstream computes one `tight` flag per list and renders
//    accordingly. mdast wants `spread` on the list AND on each item, so the
//    finalize pass records both: the list's `spread` is the negation of
//    upstream's `tight`, and an item's `spread` is set by the same
//    blank-line rule applied to that item's own children.
// 2. The empty-item end position. Upstream sets the end COLUMN to
//    `markerOffset + padding`; the offset form of that is the item's start
//    plus its padding, which is what the fallback below uses.

import * as O from "@beep/utils/Option";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as Result from "effect/Result";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  alwaysContinues,
  BlockConstruct,
  BlockStart,
  containerMaterializer,
  containsFlow,
  flowChildren,
  ListData,
  listItemChildren,
} from "../blockTypes.ts";
import { BulletChar, ListDelimiter, trustedNode } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import { isSpaceOrTab, matchesAt } from "../preprocess.ts";
import type { BlockContinueResult, BlockNode, BlockScanner, BlockStartResult } from "../blockTypes.ts";
import type { List, ListItem } from "../nodes.ts";

/** A bullet marker, sticky at the scan position. */
const reBulletListMarker = /[*+-]/y;
/** An ordered marker — up to nine digits and a `.` or `)` — sticky at the scan position. */
const reOrderedListMarker = /\d{1,9}[.)]/y;
/** Any non-space character, searched forward from `lastIndex`. */
const reNonSpaceFrom = /[^ \t\f\v\r\n]/g;

const decodeBulletChar = S.decodeUnknownResult(BulletChar);
const decodeListDelimiter = S.decodeUnknownResult(ListDelimiter);

/** A recognized list marker: its parsed shape and its width in characters. */
interface ListMarker {
  readonly data: ListData;
  readonly markerLength: number;
}

const bulletMarker = (marker: string, markerOffset: number): ListMarker => {
  const data = new ListData("bullet", markerOffset);
  data.bulletChar = Result.getOrThrow(decodeBulletChar(marker));
  return { data, markerLength: marker.length };
};

const orderedMarker = (marker: string, markerOffset: number): ListMarker => {
  const data = new ListData("ordered", markerOffset);
  data.start = Number.parseInt(Str.slice(0, -1)(marker), 10);
  data.delimiter = Result.getOrThrow(decodeListDelimiter(Str.slice(-1)(marker)));
  return { data, markerLength: marker.length };
};

/**
 * The list marker at the scan position, when there is one. Only an ordered
 * list starting at 1 may interrupt a paragraph.
 */
const markerAt = (scanner: BlockScanner, container: BlockNode): ListMarker | undefined => {
  const line = scanner.currentLine;
  reBulletListMarker.lastIndex = scanner.nextNonspace;
  const bullet = reBulletListMarker.exec(line);
  if (bullet !== null) {
    return bulletMarker(bullet[0], scanner.indent);
  }
  reOrderedListMarker.lastIndex = scanner.nextNonspace;
  const ordered = reOrderedListMarker.exec(line);
  if (ordered === null) {
    return undefined;
  }
  const marker = orderedMarker(ordered[0], scanner.indent);
  return container.type !== "paragraph" || marker.data.start === 1 ? marker : undefined;
};

/**
 * Whether the marker may open an item here: it must be followed by
 * whitespace or the end of the line, and a marker interrupting a paragraph
 * may not open an empty item.
 */
const mayOpenItem = (scanner: BlockScanner, container: BlockNode, markerLength: number): boolean => {
  const after = scanner.nextNonspace + markerLength;
  const next = unitAt(scanner.currentLine, after);
  if (next !== "" && !isSpaceOrTab(next)) {
    return false;
  }
  return container.type !== "paragraph" || matchesAt(reNonSpaceFrom, scanner.currentLine, after);
};

/**
 * Consume the marker and the spaces after it, recording the item's content
 * padding: one to four spaces count, while five or more (or none, or an
 * empty item) mean the content starts one space after the marker.
 */
const consumeMarker = (scanner: BlockScanner, data: ListData, markerLength: number): void => {
  scanner.advanceNextNonspace();
  scanner.advanceOffset(markerLength, true);
  const spacesStartColumn = scanner.column;
  const spacesStartOffset = scanner.offset;

  do {
    scanner.advanceOffset(1, true);
  } while (scanner.column - spacesStartColumn < 5 && isSpaceOrTab(unitAt(scanner.currentLine, scanner.offset)));

  const blankItem = unitAt(scanner.currentLine, scanner.offset) === "";
  const spacesAfterMarker = scanner.column - spacesStartColumn;

  if (spacesAfterMarker >= 5 || spacesAfterMarker < 1 || blankItem) {
    data.padding = markerLength + 1;
    scanner.setScanPosition(spacesStartOffset, spacesStartColumn);
    if (isSpaceOrTab(unitAt(scanner.currentLine, scanner.offset))) {
      scanner.advanceOffset(1, true);
    }
  } else {
    data.padding = markerLength + spacesAfterMarker;
  }
};

/**
 * Parse a list marker at the scanner's next non-whitespace position,
 * advancing past it on success.
 */
const parseListMarker: {
  (scanner: BlockScanner, container: BlockNode): ListData | undefined;
  (container: BlockNode): (scanner: BlockScanner) => ListData | undefined;
} = dual(2, (scanner: BlockScanner, container: BlockNode): ListData | undefined => {
  if (scanner.indent >= 4) {
    return undefined;
  }
  const marker = markerAt(scanner, container);
  if (marker === undefined || !mayOpenItem(scanner, container, marker.markerLength)) {
    return undefined;
  }
  consumeMarker(scanner, marker.data, marker.markerLength);
  return marker.data;
});

/** Two markers belong to the same list when type, delimiter and bullet agree. */
const listsMatch: {
  (listData: ListData, itemData: ListData): boolean;
  (itemData: ListData): (listData: ListData) => boolean;
} = dual(
  2,
  (listData: ListData, itemData: ListData): boolean =>
    listData.type === itemData.type &&
    listData.delimiter === itemData.delimiter &&
    listData.bulletChar === itemData.bulletChar
);

/** Whether `block` is followed by a sibling that a blank line separates from it. */
const endsWithBlankLine: {
  (block: BlockNode, next: BlockNode | undefined): boolean;
  (next: BlockNode | undefined): (block: BlockNode) => boolean;
} = dual(
  2,
  (block: BlockNode, next: BlockNode | undefined): boolean => next !== undefined && block.endLine !== next.startLine - 1
);

/** Whether any of `block`'s children are separated from the next by a blank line. */
const hasBlankLineBetweenChildren = (block: BlockNode): boolean =>
  A.some(block.children, (child, index) => endsWithBlankLine(child, block.children[index + 1]));

/**
 * Contains list items and nothing else.
 *
 * **Details**
 *
 * Finalization records spread on each item and on the list. A blank line
 * between items, or between an item's children, makes the list loose.
 *
 * **Example** (Check list child eligibility)
 *
 * ```ts
 * import { listConstruct } from "@beep/markdown/internal/blocks/list";
 *
 * console.log(listConstruct.canContain("listItem")); // true
 * console.log(listConstruct.canContain("paragraph")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const listConstruct = new BlockConstruct("list", false, {
  canContain: (child) => child === "listItem",
  continue: alwaysContinues,
  finalize: dual(2, (_scanner: BlockScanner, block: BlockNode): void => {
    let tight = true;
    A.forEach(block.children, (item, index) => {
      // An item followed by a blank line, or one whose own children are
      // blank-line separated, makes the whole list loose.
      const itemSpread = hasBlankLineBetweenChildren(item);
      item.data.spread = itemSpread;
      if (endsWithBlankLine(item, block.children[index + 1]) || itemSpread) {
        tight = false;
      }
    });

    const listData = block.data.listData;
    if (listData !== undefined) {
      listData.tight = tight;
    }
    block.data.spread = !tight;

    const last = block.children[block.children.length - 1];
    if (last !== undefined) {
      block.endOffset = last.endOffset;
      block.endLine = last.endLine;
    }
  }),
  materialize: containerMaterializer((block, children, context) => {
    const listData = block.data.listData;
    const ordered = listData?.type === "ordered";
    return trustedNode<List>({
      type: "list",
      ordered,
      spread: block.data.spread ?? false,
      children: listItemChildren(children),
      position: context.position(block.startOffset, block.endOffset),
      ...(ordered && listData.start !== undefined ? { start: listData.start } : {}),
      ...O.getSomesStruct({
        bulletChar: O.fromUndefinedOr(listData?.bulletChar),
        delimiter: O.fromUndefinedOr(listData?.delimiter),
      }),
    });
  }),
});

/**
 * Contains block content other than a bare list item.
 *
 * **Details**
 *
 * An empty item closes on the next blank line and ends at its marker plus
 * padding. Materialization keeps the checked key absent when no task-list
 * checkbox was parsed.
 *
 * **Example** (Check list item child eligibility)
 *
 * ```ts
 * import { listItemConstruct } from "@beep/markdown/internal/blocks/list";
 *
 * console.log(listItemConstruct.canContain("paragraph")); // true
 * console.log(listItemConstruct.canContain("list")); // true
 * console.log(listItemConstruct.canContain("listItem")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const listItemConstruct = new BlockConstruct("listItem", false, {
  canContain: containsFlow,
  continue: dual(2, (scanner: BlockScanner, block: BlockNode): BlockContinueResult => {
    const listData = block.data.listData;
    if (listData === undefined) {
      return 1;
    }

    if (scanner.blank) {
      if (block.children.length === 0) {
        // A blank line straight after an empty item closes it.
        return 1;
      }
      scanner.advanceNextNonspace();
    } else if (scanner.indent >= listData.markerOffset + listData.padding) {
      scanner.advanceOffset(listData.markerOffset + listData.padding, true);
    } else {
      return 1;
    }
    return 0;
  }),
  finalize: dual(2, (_scanner: BlockScanner, block: BlockNode): void => {
    const last = block.children[block.children.length - 1];
    if (last !== undefined) {
      block.endOffset = last.endOffset;
      block.endLine = last.endLine;
      return;
    }
    // An empty item ends where its marker and padding do.
    block.endLine = block.startLine;
    block.endOffset = block.startOffset + (block.data.listData?.padding ?? 0);
  }),
  materialize: containerMaterializer((block, children, context) =>
    trustedNode<ListItem>({
      type: "listItem",
      spread: block.data.spread ?? false,
      children: flowChildren(children),
      position: context.position(block.startOffset, block.endOffset),
      // GFM's task-list start (`gfm` dialect only) is the only writer of
      // `checked`; an item that carried no checkbox keeps the key ABSENT
      // rather than false, which is the mdast contract.
      ...O.getSomesStruct({ checked: O.fromUndefinedOr(block.data.checked) }),
    })
  ),
});

/**
 * Opens a list item from a bullet or ordered marker.
 *
 * **Details**
 *
 * A new list opens when the marker differs in type, delimiter or bullet from
 * the current list. Only an ordered marker starting at 1 may interrupt a
 * paragraph, and an interrupting marker must have nonempty item content.
 *
 * **Example** (Identify the list item start)
 *
 * ```ts
 * import { listItemStart } from "@beep/markdown/internal/blocks/list";
 *
 * console.log(listItemStart.name); // listItem
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const listItemStart = new BlockStart(
  "listItem",
  dual(2, (scanner: BlockScanner, container: BlockNode): BlockStartResult => {
    if (scanner.indented && container.type !== "list") {
      return 0;
    }

    const data = parseListMarker(scanner, container);
    if (data === undefined) {
      return 0;
    }

    scanner.closeUnmatchedBlocks();

    // Open a new list unless the marker continues the one already open.
    const openList = scanner.tip;
    const openListData = openList.data.listData;
    if (openList.type !== "list" || openListData === undefined || !listsMatch(openListData, data)) {
      const list = scanner.addChild("list", scanner.nextNonspace);
      list.data.listData = data;
    }

    const item = scanner.addChild("listItem", scanner.nextNonspace);
    item.data.listData = data;
    return 1;
  })
);
