// Ported from commonmark.js@0.31.2 (https://github.com/commonmark/commonmark.js)
// Copyright (c) 2014-2023 John MacFarlane
// License: BSD-2-Clause
//
// THE port delta. Upstream parses link reference definitions off the front of
// every paragraph and DELETES them (`removeLinkReferenceDefinitions`), keeping
// only a refmap, because a renderer has nowhere to put them. This package
// edits markdown, so a deleted definition would be a lost edit: the
// definitions are split out of the paragraph exactly as upstream splits them,
// then spliced into the tree as `definition` nodes at their own source
// position, ahead of whatever is left of the paragraph.
//
// The other half of the delta is that references are never resolved during
// parsing. `parseBlocks` returns a refmap built from these nodes so the
// inline pass and any renderer can resolve on their own terms.
//
// Upstream also does the split in two places (the document finalize walk and
// the setext-heading start). This port does it in one — `extractDefinitions`,
// called from a paragraph's finalize and from the setext start before it
// decides whether any paragraph content is left to promote.

import * as O from "@beep/utils/Option";
import * as A from "effect/Array";
import * as Str from "effect/String";
import {
  BlockConstruct,
  containsNothing,
  DefinitionData,
  leafMaterializer,
  makeBlockNode,
  neverContinues,
} from "../blockTypes.ts";
import { trustedNode } from "../nodes.ts";
import { unitAt } from "../patterns.ts";
import { parseReference } from "../references.ts";
import { sliceWithSegments, sourceOffsetAt } from "../segments.ts";
import type { BlockNode } from "../blockTypes.ts";
import type { Definition } from "../nodes.ts";
import type { ParsedReference } from "../references.ts";

const reTrailingSpace = /[ \t\r\n]+$/;
const splitLines = Str.split("\n");

/** The number of line endings inside `text`. */
const newlinesIn = (text: string): number => splitLines(text).length - 1;

/**
 * The index the first split-out definition goes in at: `block`'s own
 * position among its parent's children.
 *
 * **Details**
 *
 * Streaming finalization visits the last child, so that case is checked
 * first; it avoids rescanning every preceding sibling for each
 * definition-bearing paragraph, while an older child still finds its
 * first-match position.
 */
const insertionIndexOf = (parent: BlockNode, block: BlockNode): number => {
  const lastIndex = parent.children.length - 1;
  return parent.children[lastIndex] === block
    ? lastIndex
    : O.getOrElse(
        A.findFirstIndex(parent.children, (child) => child === block),
        () => parent.children.length
      );
};

/**
 * The closed `definition` block for `reference`, found `consumedLength`
 * characters into `block`'s content.
 */
const definitionBlock = (block: BlockNode, parent: BlockNode, consumedLength: number, reference: ParsedReference) => {
  const consumed = Str.slice(consumedLength, consumedLength + reference.length)(block.stringContent);
  const startOffset = sourceOffsetAt(block.segments, consumedLength, block.startOffset);
  // The node ends at the definition's last content character. The parse
  // consumes trailing whitespace and the line ending to validate the
  // definition, but that consumption is not part of the node's span —
  // mdast-util ends definitions at content end, pinned by the interop
  // corpus.
  const contentLength = Str.replace(reTrailingSpace, "")(consumed).length;

  const node = makeBlockNode("definition", startOffset, block.startLine, block.depth);
  node.parent = parent;
  node.open = false;
  node.endOffset = sourceOffsetAt(block.segments, consumedLength + contentLength, startOffset);
  node.endLine = block.startLine + newlinesIn(Str.slice(0, contentLength)(consumed));
  node.data.definition = DefinitionData.make({
    key: reference.key,
    identifier: reference.identifier,
    label: reference.label,
    url: reference.url,
    ...O.getSomesStruct({ title: O.fromUndefinedOr(reference.title) }),
  });
  return { node, linesConsumed: newlinesIn(consumed) };
};

/**
 * Rebase `block` onto what is left of its content once `consumedLength`
 * characters of definitions have been split off.
 */
const rebaseRemainder = (block: BlockNode, consumedLength: number, endOffset: number): void => {
  // Keep original coordinates throughout extraction, then rebase the suffix
  // once. Retain the segment array without expanding it into call arguments.
  const remaining = sliceWithSegments(block.segments, consumedLength, block.stringContent.length);
  block.stringContent = Str.slice(consumedLength)(block.stringContent);
  block.segments.length = 0;
  for (const segment of remaining) block.segments.push(segment);
  block.startOffset = remaining[0]?.sourceOffset ?? endOffset;
};

/** The next definition at `consumedLength` in `text`, when one starts there. */
const referenceAt = (text: string, consumedLength: number): O.Option<ParsedReference> =>
  unitAt(text, consumedLength) === "[" ? parseReference(Str.slice(consumedLength)(text)) : O.none();

/**
 * Splits every leading link reference definition out of `block`, inserting one
 * `definition` node per definition into `block`'s parent, immediately before
 * `block` itself.
 *
 * **Details**
 *
 * Definitions can only ever start a paragraph — they cannot interrupt one —
 * so a single leading pass is exhaustive. A block without a parent is unchanged.
 *
 * **Example** (Extract a definition ahead of paragraph text)
 *
 * ```ts
 * import { extractDefinitions } from "@beep/markdown/internal/blocks/linkReferenceDefinition";
 * import { makeBlockNode } from "@beep/markdown/internal/blockTypes";
 *
 * const parent = makeBlockNode("document", 0, 1);
 * const paragraph = makeBlockNode("paragraph", 0, 1, 1);
 * paragraph.parent = parent;
 * paragraph.stringContent = "[guide]: /guide\nRead on";
 * paragraph.segments.push({ textOffset: 0, sourceOffset: 0, length: paragraph.stringContent.length });
 * parent.children.push(paragraph);
 *
 * extractDefinitions(paragraph);
 *
 * console.log(parent.children[0]?.type); // definition
 * console.log(parent.children[0]?.data.definition?.url); // /guide
 * console.log(paragraph.stringContent); // Read on
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const extractDefinitions = (block: BlockNode): void => {
  const parent = block.parent;
  if (parent === undefined) {
    return;
  }

  const text = block.stringContent;
  let consumedLength = 0;
  let insertionIndex = 0;
  let endOffset = block.startOffset;
  for (let reference = referenceAt(text, 0); O.isSome(reference); reference = referenceAt(text, consumedLength)) {
    const { node, linesConsumed } = definitionBlock(block, parent, consumedLength, reference.value);
    endOffset = node.endOffset;
    if (consumedLength === 0) {
      insertionIndex = insertionIndexOf(parent, block);
    }
    parent.children.splice(insertionIndex, 0, node);
    insertionIndex += 1;

    consumedLength += reference.value.length;
    block.startLine += linesConsumed;
  }
  if (consumedLength > 0) {
    rebaseRemainder(block, consumedLength, endOffset);
  }
};

/**
 * Materializes a definition node with no block start of its own.
 *
 * **Details**
 *
 * {@link extractDefinitions} is the only thing that ever creates one, already
 * closed. A block without definition data produces no materialized node.
 *
 * **Example** (Inspect definition containment)
 *
 * ```ts
 * import { definitionConstruct } from "@beep/markdown/internal/blocks/linkReferenceDefinition";
 *
 * console.log(definitionConstruct.acceptsLines); // false
 * console.log(definitionConstruct.canContain("paragraph")); // false
 * ```
 *
 * @category parsing
 * @since 0.0.0
 */
export const definitionConstruct = new BlockConstruct("definition", false, {
  canContain: containsNothing,
  continue: neverContinues,
  materialize: leafMaterializer((block, context) => {
    const definition = block.data.definition;
    if (definition === undefined) {
      return undefined;
    }
    return trustedNode<Definition>({
      type: "definition",
      identifier: definition.identifier,
      label: definition.label,
      url: definition.url,
      position: context.position(block.startOffset, block.endOffset),
      ...O.getSomesStruct({ title: O.fromUndefinedOr(definition.title) }),
    });
  }),
});
