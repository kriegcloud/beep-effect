/**
 * Pure, escaping-free node behavior for the Markdown AST.
 *
 * This module owns the plain-text projection of a document (the "signal" read
 * off a node, distinct from the escaping render adapters) plus the shared
 * inline/block run segmentation used by every list-item renderer.
 *
 * @packageDocumentation \@beep/md/Md.behavior
 * @since 0.0.0
 */

import { A, thunkEmptyStr } from "@beep/utils";
import { Match } from "effect";
import { flow, pipe } from "effect/Function";
import * as O from "effect/Option";
import type { Block, Inline, Li, ListItemChild, Table, TaskItem } from "./Md.model.ts";
import { Inline as InlineSchema } from "./Md.model.ts";

const joinEmpty = A.join("");
const youtubeWatchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;

/**
 * Renders a list-item child sequence into per-segment strings: each maximal run
 * of inline children collapses to one inline render, while every block child
 * renders on its own.
 *
 * The runs are grouped with {@link A.groupWith} keyed by the inline guard, then
 * each run is rendered by the matching handler — inline runs through
 * `renderInlineRun`, block children individually through `renderBlock`.
 *
 * @example
 * ```ts
 * import { Inline } from "@beep/md/Md.model"
 * import { segmentInlineRuns } from "@beep/md/Md.behavior"
 * import { Md } from "@beep/md"
 *
 * const segments = segmentInlineRuns(
 *   [Md.text("a"), Md.text("b"), Md.p("para")],
 *   Inline.is,
 *   (run) => `inline:${run.length}`,
 *   (block) => `block:${block._tag}`
 * )
 * console.log(segments) // ["inline:2", "block:p"]
 * ```
 *
 * @template I - Inline child element type.
 * @template B - Block child element type.
 * @param items - The list-item children to segment.
 * @param isInline - Type guard selecting inline children.
 * @param renderInlineRun - Renders a contiguous run of inline children.
 * @param renderBlock - Renders a single block child.
 * @returns One rendered string per inline run and per block child, in order.
 * @category utilities
 * @since 0.0.0
 */
export const segmentInlineRuns = <I, B>(
  items: ReadonlyArray<I | B>,
  isInline: (item: I | B) => item is I,
  renderInlineRun: (run: ReadonlyArray<I>) => string,
  renderBlock: (block: B) => string
): ReadonlyArray<string> =>
  A.match(items, {
    onEmpty: A.empty<string>,
    onNonEmpty: (nonEmpty) =>
      pipe(
        nonEmpty,
        A.groupWith((left, right) => isInline(left) === isInline(right)),
        A.flatMap((run) =>
          isInline(A.headNonEmpty(run))
            ? [renderInlineRun(A.filter(run, isInline))]
            : A.getSomes(A.map(run, (item) => (isInline(item) ? O.none<string>() : O.some(renderBlock(item)))))
        )
      ),
  });

const renderPlainTextInlines: (children: ReadonlyArray<Inline>) => string = flow(
  A.map(renderPlainTextInline),
  joinEmpty
);

const renderPlainTextListItemChildren = (children: ReadonlyArray<ListItemChild>): string =>
  pipe(segmentInlineRuns(children, InlineSchema.is, renderPlainTextInlines, renderPlainTextBlock), A.join("\n"));

const renderPlainTextListItem = (item: Li): string => renderPlainTextListItemChildren(item.children);

const renderPlainTextTaskItem = (item: TaskItem): string => renderPlainTextListItemChildren(item.children);

const renderPlainTextTable = (block: Table): string =>
  pipe(
    block.children,
    A.map((row) =>
      pipe(
        row.children,
        A.map((cell) => renderPlainTextInlines(cell.children)),
        A.join("\t")
      )
    ),
    A.join("\n")
  );

const renderPlainTextInlineMatcher = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => value,
    rawMarkdown: ({ value }) => value,
    rawHtml: ({ value }) => value,
    strong: ({ children }) => renderPlainTextInlines(children),
    em: ({ children }) => renderPlainTextInlines(children),
    del: ({ children }) => renderPlainTextInlines(children),
    code: ({ value }) => value,
    a: ({ children }) => renderPlainTextInlines(children),
    img: thunkEmptyStr,
    br: thunkEmptyStr,
  })
);

/**
 * Projects an inline node to its escaping-free plain-text content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextInline } from "@beep/md/Md.behavior"
 *
 * console.log(renderPlainTextInline(Md.strong("beep"))) // "beep"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function renderPlainTextInline(inline: Inline): string {
  return renderPlainTextInlineMatcher(inline);
}

/**
 * Projects a block node to its escaping-free plain-text content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextBlock } from "@beep/md/Md.behavior"
 *
 * console.log(renderPlainTextBlock(Md.h1("Hello"))) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainTextBlock: (block: Block) => string = Match.type<Block>().pipe(
  Match.tagsExhaustive({
    heading: (block) => renderPlainTextInlines(block.children),
    p: (block) => renderPlainTextInlines(block.children),
    blockquote: (block) => renderPlainTextBlocks(block.children),
    pre: (block) => block.value,
    ul: (block) => pipe(block.children, A.map(renderPlainTextListItem), A.join("\n")),
    ol: (block) => pipe(block.children, A.map(renderPlainTextListItem), A.join("\n")),
    taskList: (block) => pipe(block.children, A.map(renderPlainTextTaskItem), A.join("\n")),
    table: renderPlainTextTable,
    youtube: (block) => youtubeWatchUrl(block.videoId),
    hr: thunkEmptyStr,
  })
);

/**
 * Projects block nodes to plain text, one block per line.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextBlocks } from "@beep/md/Md.behavior"
 *
 * console.log(renderPlainTextBlocks([Md.h1("Hello"), Md.p("World")])) // "Hello\nWorld"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainTextBlocks: (blocks: ReadonlyArray<Block>) => string = flow(
  A.map(renderPlainTextBlock),
  A.join("\n")
);
