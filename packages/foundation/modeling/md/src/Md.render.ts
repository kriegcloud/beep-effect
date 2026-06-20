/**
 * Markdown AST render adapters.
 *
 * @packageDocumentation \@beep/md/Md.render
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { HtmlFragment, Markdown, TaggedErrorClass } from "@beep/schema";
import { A, Html, Str, thunkEmptyStr } from "@beep/utils";
import { Effect, flow, identity, Match, Number as N, Result, SchemaGetter, SchemaIssue } from "effect";
import { dual, pipe } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { Document as DocumentSchema, Inline as InlineSchema, TableCell, TableRow } from "./Md.model.ts";
import {
  escapeHtmlUrlAttribute,
  escapeMarkdownDestination,
  escapeMarkdownText,
  joinBlocks,
  prefixLines,
  renderFencedCode,
  renderInlineCode,
  sanitizeCodeFenceLanguage,
} from "./Md.utils.ts";
import type {
  Block,
  Document,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Inline,
  Li,
  ListItemChild,
  Table,
  TaskItem,
} from "./Md.model.ts";

const $I = $MdId.create("Md.render");
const joinEmpty = A.join("");
const lineSeparatorPattern = /\r\n?|\n/;
const lineSeparatorGlobalPattern = /\r\n?|\n/g;
const headingMarkerCount = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
} as const;

type HeadingBlock = H1 | H2 | H3 | H4 | H5 | H6;
const isInlineListItemChild = S.is(InlineSchema);

/**
 * Error raised when a render adapter fails while producing output.
 *
 * @example
 * ```ts
 * import { RenderError } from "@beep/md/Md.render"
 *
 * const error = RenderError.make({
 *   adapter: "markdown",
 *   message: "Render adapter markdown failed.",
 *   cause: "boom"
 * })
 * console.log(error._tag) // "RenderError"
 * ```
 *
 * @category error-handling
 * @since 0.0.0
 */
export class RenderError extends TaggedErrorClass<RenderError>($I`RenderError`)(
  "RenderError",
  {
    adapter: S.String,
    message: S.String,
    cause: S.Defect({ includeStack: true }),
  },
  $I.annote("RenderError", {
    description: "Typed error raised when a Markdown render adapter fails.",
  })
) {}

/**
 * Pure render adapter contract for synchronous output formats.
 *
 * @example
 * ```ts
 * import type { PureRenderAdapter } from "@beep/md/Md.render"
 *
 * const adapter: PureRenderAdapter<string> = {
 *   name: "noop",
 *   render: (document) => document._tag
 * }
 * console.log(adapter)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface PureRenderAdapter<Output> {
  readonly name: string;
  readonly render: (document: Document) => Output;
}

/**
 * Effectful render adapter contract for resourceful output formats.
 *
 * Future PDF and DOCX adapters can use this shape when rendering needs fonts,
 * files, streams, or other services.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import type { EffectRenderAdapter } from "@beep/md/Md.render"
 *
 * const adapter: EffectRenderAdapter<Uint8Array> = {
 *   name: "bytes",
 *   render: () => Effect.succeed(new Uint8Array())
 * }
 * console.log(adapter)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface EffectRenderAdapter<Output, Error = never, Requirements = never> {
  readonly name: string;
  readonly render: (document: Document) => Effect.Effect<Output, Error, Requirements>;
}

const renderMarkdownInlines: (children: ReadonlyArray<Inline>) => string = flow(A.map(renderMarkdownInline), joinEmpty);

const renderMarkdownLinkLabelInlines: (children: ReadonlyArray<Inline>) => string = flow(
  A.map(renderMarkdownInlineForLinkLabel),
  joinEmpty
);

const renderHtmlInlines: (children: ReadonlyArray<Inline>) => string = flow(A.map(renderHtmlInline), joinEmpty);

const renderListItemChildSegments = (
  children: ReadonlyArray<ListItemChild>,
  renderInlines: (children: ReadonlyArray<Inline>) => string,
  renderBlock: (block: Block) => string
): ReadonlyArray<string> => {
  const out: Array<string> = [];
  let pendingInlines: Array<Inline> = [];
  const flushInlines = (): void => {
    if (pendingInlines.length > 0) {
      A.appendInPlace(out, renderInlines(pendingInlines));
      pendingInlines = [];
    }
  };

  for (const child of children) {
    if (isInlineListItemChild(child)) {
      A.appendInPlace(pendingInlines, child);
    } else {
      flushInlines();
      A.appendInPlace(out, renderBlock(child));
    }
  }

  flushInlines();

  return out;
};

const renderMarkdownListItemChildren = (children: ReadonlyArray<ListItemChild>): string =>
  pipe(
    children,
    (items) => renderListItemChildSegments(items, renderMarkdownInlines, renderMarkdownBlock),
    A.join("\n")
  );

const renderMarkdownListItem = (item: Li): string => renderMarkdownListItemChildren(item.children);

const renderHtmlListItemChildren = (children: ReadonlyArray<ListItemChild>): string =>
  pipe(children, (items) => renderListItemChildSegments(items, renderHtmlInlines, renderHtmlBlock), joinEmpty);

const renderHtmlListItem = (item: Li): string => `<li>${renderHtmlListItemChildren(item.children)}</li>`;

const renderHtmlTaskItem = (item: TaskItem): string => {
  const checked = item.checked ? " checked" : "";

  return `<li><input type="checkbox" disabled${checked} /> ${renderHtmlListItemChildren(item.children)}</li>`;
};

const renderMarkdownTableCell = (cell: TableCell): string =>
  pipe(
    renderMarkdownInlines(cell.children),
    Str.replace(/\|/g, "\\|"),
    Str.replace(lineSeparatorGlobalPattern, "<br/>")
  );

const renderMarkdownTableFence = (cells: string): string => `| ${cells} |`;

const tableRowColumnCount = (row: TableRow): number => A.length(row.children);

const tableColumnCount: (rows: ReadonlyArray<TableRow>) => number = A.reduce(0, (max, row) =>
  N.max(max, tableRowColumnCount(row))
);

const renderMarkdownTableSeparator = (columns: number): string =>
  pipe(
    A.makeBy(columns, () => "---"),
    A.join(" | "),
    renderMarkdownTableFence
  );

const emptyTableCell = (): TableCell => TableCell.make({ children: [] });

const padTableRow =
  (columns: number) =>
  (row: TableRow): TableRow => {
    const missing = columns - tableRowColumnCount(row);

    return missing > 0 ? TableRow.make({ children: [...row.children, ...A.makeBy(missing, emptyTableCell)] }) : row;
  };

const renderMarkdownTableRow = (row: TableRow): string =>
  pipe(row.children, A.map(renderMarkdownTableCell), A.join(" | "), renderMarkdownTableFence);

const renderMarkdownTable = (block: Table): string => {
  const columns = tableColumnCount(block.children);
  if (columns === 0) {
    return "";
  }

  const paddedRows = A.map(block.children, padTableRow(columns));

  if (block.headerRow) {
    return pipe(paddedRows, A.map(renderMarkdownTableRow), ([header, ...body]) =>
      A.join([header, renderMarkdownTableSeparator(columns), ...body], "\n")
    );
  }

  const emptyHeader = renderMarkdownTableRow(
    TableRow.make({
      children: A.makeBy(columns, () => TableCell.make({ children: [] })),
    })
  );

  return pipe(paddedRows, A.map(renderMarkdownTableRow), (rows) =>
    A.join([emptyHeader, renderMarkdownTableSeparator(columns), ...rows], "\n")
  );
};

const renderHtmlTableCell =
  (tag: "td" | "th") =>
  (cell: TableCell): string =>
    `<${tag}>${renderHtmlInlines(cell.children)}</${tag}>`;

const renderHtmlTableRow =
  (tag: "td" | "th") =>
  (row: TableRow): string =>
    `<tr>${pipe(row.children, A.map(renderHtmlTableCell(tag)), joinEmpty)}</tr>`;

const renderHtmlTable = (block: Table): string => {
  if (block.headerRow) {
    const header = pipe(block.children, A.head, O.map(renderHtmlTableRow("th")));
    const body = pipe(block.children, A.drop(1), A.map(renderHtmlTableRow("td")), joinEmpty);

    return `<table>${pipe(
      header,
      O.map((row) => `<thead>${row}</thead>`),
      O.getOrElse(thunkEmptyStr)
    )}<tbody>${body}</tbody></table>`;
  }

  return `<table><tbody>${pipe(block.children, A.map(renderHtmlTableRow("td")), joinEmpty)}</tbody></table>`;
};

const youtubeWatchUrl = (videoId: string): string => `https://www.youtube.com/watch?v=${videoId}`;
const youtubeEmbedUrl = (videoId: string): string => `https://www.youtube-nocookie.com/embed/${videoId}`;

// Built-in adapters keep `rawHtml` escaped by default; trusted passthrough is a custom-adapter concern.
const renderEscapedRawHtmlAsMarkdown = ({ value }: { readonly value: string }): string => escapeMarkdownText(value);
const renderEscapedRawHtmlAsHtml = ({ value }: { readonly value: string }): string => Html.escapeHtml(value);

const renderMarkdownHeading = (block: HeadingBlock): string =>
  `${pipe("#", Str.repeat(headingMarkerCount[block._tag]))} ${renderMarkdownInlines(block.children)}`;

const renderHtmlHeading = (block: HeadingBlock): string =>
  `<${block._tag}>${renderHtmlInlines(block.children)}</${block._tag}>`;

const indentContinuationLines = (text: string, indent: string): string =>
  pipe(
    text,
    Str.split(lineSeparatorPattern),
    A.map((line, index) => (index === 0 ? line : `${indent}${line}`)),
    A.join("\n")
  );

const renderMarkdownMarkedItem: {
  (marker: string, content: string): string;
  (content: string): (marker: string) => string;
} = dual(
  2,
  (marker: string, content: string): string =>
    `${marker}${indentContinuationLines(content, pipe(" ", Str.repeat(Str.length(marker))))}`
);

const languageToMarkdown = O.match({
  onNone: thunkEmptyStr,
  onSome: identity,
});

const languageToHtmlClass = O.match({
  onNone: thunkEmptyStr,
  onSome: flow(
    sanitizeCodeFenceLanguage,
    O.liftPredicate(Str.isNonEmpty),
    O.map(flow(Html.escapeHtml, (language) => ` class="language-${language}"`)),
    O.getOrElse(thunkEmptyStr)
  ),
});

const causeMessage = (cause: unknown): string =>
  Result.getOrElse(
    Result.try(() => {
      if (P.isError(cause)) {
        return cause.message;
      }

      return P.isSymbol(cause) ? globalThis.String(cause) : `${cause}`;
    }),
    () => "Cannot render thrown value."
  );

const toRenderError =
  (adapter: string) =>
  (cause: unknown): RenderError =>
    RenderError.make({
      adapter,
      message: `Render adapter ${adapter} failed. ${causeMessage(cause)}`,
      cause,
    });

const adapterName = (adapter: { readonly name: string }): string =>
  Result.getOrElse(
    Result.try(() => (P.isString(adapter.name) ? adapter.name : "unknown")),
    () => "unknown"
  );

const renderMarkdownDocumentUnsafe = (document: Document): Markdown => renderMarkdownBlocks(document.children);

const renderHtmlDocumentUnsafe = (document: Document): HtmlFragment => renderHtmlBlocks(document.children);

/**
 * Renders an inline node as Markdown.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderMarkdownInline } from "@beep/md/Md.render"
 *
 * console.log(renderMarkdownInline(Md.strong("beep"))) // "**beep**"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
const renderMarkdownInlineMatcher = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => escapeMarkdownText(value),
    rawMarkdown: ({ value }) => value,
    rawHtml: renderEscapedRawHtmlAsMarkdown,
    strong: ({ children }) => `**${renderMarkdownInlines(children)}**`,
    em: ({ children }) => `*${renderMarkdownInlines(children)}*`,
    del: ({ children }) => `~~${renderMarkdownInlines(children)}~~`,
    code: ({ value }) => renderInlineCode(value),
    a: ({ href, children }) => `[${renderMarkdownLinkLabelInlines(children)}](${escapeMarkdownDestination(href)})`,
    img: ({ src, alt }) => `![${escapeMarkdownText(alt)}](${escapeMarkdownDestination(src)})`,
    br: () => "<br/>",
  })
);

const renderMarkdownInlineForLinkLabelMatcher = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => escapeMarkdownText(value),
    rawMarkdown: ({ value }) => escapeMarkdownText(value),
    rawHtml: renderEscapedRawHtmlAsMarkdown,
    strong: ({ children }) => `**${renderMarkdownLinkLabelInlines(children)}**`,
    em: ({ children }) => `*${renderMarkdownLinkLabelInlines(children)}*`,
    del: ({ children }) => `~~${renderMarkdownLinkLabelInlines(children)}~~`,
    code: ({ value }) => renderInlineCode(value),
    a: ({ href, children }) => `[${renderMarkdownLinkLabelInlines(children)}](${escapeMarkdownDestination(href)})`,
    img: ({ src, alt }) => `![${escapeMarkdownText(alt)}](${escapeMarkdownDestination(src)})`,
    br: () => "<br/>",
  })
);

function renderMarkdownInlineForLinkLabel(inline: Inline): string {
  return renderMarkdownInlineForLinkLabelMatcher(inline);
}

/**
 * Renders an inline node as Markdown.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderMarkdownInline } from "@beep/md/Md.render"
 *
 * console.log(renderMarkdownInline(Md.strong("beep"))) // "**beep**"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function renderMarkdownInline(inline: Inline): string {
  return renderMarkdownInlineMatcher(inline);
}

/**
 * Renders an inline node as an HTML fragment.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtmlInline } from "@beep/md/Md.render"
 *
 * console.log(renderHtmlInline(Md.em("beep"))) // "<em>beep</em>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
const renderHtmlInlineMatcher = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => Html.escapeHtml(value),
    rawMarkdown: ({ value }) => Html.escapeHtml(value),
    rawHtml: renderEscapedRawHtmlAsHtml,
    strong: ({ children }) => `<strong>${renderHtmlInlines(children)}</strong>`,
    em: ({ children }) => `<em>${renderHtmlInlines(children)}</em>`,
    del: ({ children }) => `<del>${renderHtmlInlines(children)}</del>`,
    code: ({ value }) => `<code>${Html.escapeHtml(value)}</code>`,
    a: ({ href, children }) => `<a href="${escapeHtmlUrlAttribute(href)}">${renderHtmlInlines(children)}</a>`,
    img: ({ src, alt }) => `<img src="${escapeHtmlUrlAttribute(src)}" alt="${Html.escapeHtml(alt)}" />`,
    br: () => "<br />",
  })
);

/**
 * Renders an inline node as an HTML fragment.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtmlInline } from "@beep/md/Md.render"
 *
 * console.log(renderHtmlInline(Md.em("beep"))) // "<em>beep</em>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function renderHtmlInline(inline: Inline): string {
  return renderHtmlInlineMatcher(inline);
}

const renderPlainTextInlines: (children: ReadonlyArray<Inline>) => string = flow(
  A.map(renderPlainTextInline),
  joinEmpty
);

const renderPlainTextListItemChildren = (children: ReadonlyArray<ListItemChild>): string =>
  pipe(
    children,
    (items) => renderListItemChildSegments(items, renderPlainTextInlines, renderPlainTextBlock),
    A.join("\n")
  );

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

/**
 * Renders an inline node as plain text.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextInline } from "@beep/md/Md.render"
 *
 * console.log(renderPlainTextInline(Md.strong("beep"))) // "beep"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
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
 * Renders an inline node as plain text.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextInline } from "@beep/md/Md.render"
 *
 * console.log(renderPlainTextInline(Md.code("beep"))) // "beep"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export function renderPlainTextInline(inline: Inline): string {
  return renderPlainTextInlineMatcher(inline);
}

/**
 * Renders a block node as Markdown.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderMarkdownBlock } from "@beep/md/Md.render"
 *
 * console.log(renderMarkdownBlock(Md.h1("Hello"))) // "# Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderMarkdownBlock: (block: Block) => string = Match.type<Block>().pipe(
  Match.tagsExhaustive({
    h1: renderMarkdownHeading,
    h2: renderMarkdownHeading,
    h3: renderMarkdownHeading,
    h4: renderMarkdownHeading,
    h5: renderMarkdownHeading,
    h6: renderMarkdownHeading,
    p: (block) => renderMarkdownInlines(block.children),
    blockquote: (block) => pipe(block.children, renderMarkdownBlocks, prefixLines("> ")),
    pre: (block) => renderFencedCode(block.value, languageToMarkdown(block.language)),
    ul: (block) =>
      pipe(
        block.children,
        A.map((item) => renderMarkdownMarkedItem("- ", renderMarkdownListItem(item))),
        A.join("\n")
      ),
    ol: (block) =>
      pipe(
        block.children,
        A.map((item, index) => {
          const marker = `${index + 1}. `;

          return renderMarkdownMarkedItem(marker, renderMarkdownListItem(item));
        }),
        A.join("\n")
      ),
    taskList: (block) =>
      pipe(
        block.children,
        A.map((item) =>
          renderMarkdownMarkedItem(`- [${item.checked ? "x" : " "}] `, renderMarkdownListItemChildren(item.children))
        ),
        A.join("\n")
      ),
    table: renderMarkdownTable,
    youtube: (block) => youtubeWatchUrl(block.videoId),
    hr: () => "---",
  })
);

/**
 * Renders a block node as an HTML fragment.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtmlBlock } from "@beep/md/Md.render"
 *
 * console.log(renderHtmlBlock(Md.p("Hello"))) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderHtmlBlock: (block: Block) => string = Match.type<Block>().pipe(
  Match.tagsExhaustive({
    h1: renderHtmlHeading,
    h2: renderHtmlHeading,
    h3: renderHtmlHeading,
    h4: renderHtmlHeading,
    h5: renderHtmlHeading,
    h6: renderHtmlHeading,
    p: (block) => `<p>${renderHtmlInlines(block.children)}</p>`,
    blockquote: (block) => `<blockquote>${renderHtmlBlocks(block.children)}</blockquote>`,
    pre: (block) => `<pre><code${languageToHtmlClass(block.language)}>${Html.escapeHtml(block.value)}</code></pre>`,
    ul: (block) => `<ul>${pipe(block.children, A.map(renderHtmlListItem), joinEmpty)}</ul>`,
    ol: (block) => `<ol>${pipe(block.children, A.map(renderHtmlListItem), joinEmpty)}</ol>`,
    taskList: (block) =>
      `<ul class="contains-task-list">${pipe(block.children, A.map(renderHtmlTaskItem), joinEmpty)}</ul>`,
    table: renderHtmlTable,
    youtube: (block) =>
      `<iframe src="${escapeHtmlUrlAttribute(youtubeEmbedUrl(block.videoId))}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    hr: () => "<hr />",
  })
);

/**
 * Renders a block node as plain text.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextBlock } from "@beep/md/Md.render"
 *
 * console.log(renderPlainTextBlock(Md.h1("Hello"))) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainTextBlock: (block: Block) => string = Match.type<Block>().pipe(
  Match.tagsExhaustive({
    h1: (block) => renderPlainTextInlines(block.children),
    h2: (block) => renderPlainTextInlines(block.children),
    h3: (block) => renderPlainTextInlines(block.children),
    h4: (block) => renderPlainTextInlines(block.children),
    h5: (block) => renderPlainTextInlines(block.children),
    h6: (block) => renderPlainTextInlines(block.children),
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
 * Renders block nodes as a Markdown document body.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderMarkdownBlocks } from "@beep/md/Md.render"
 *
 * console.log(renderMarkdownBlocks([Md.h1("Hello"), Md.p("World")]))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderMarkdownBlocks: (blocks: ReadonlyArray<Block>) => Markdown = flow(
  A.map(renderMarkdownBlock),
  joinBlocks
);

/**
 * Renders block nodes as an HTML fragment body.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtmlBlocks } from "@beep/md/Md.render"
 *
 * console.log(renderHtmlBlocks([Md.p("Hello")])) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderHtmlBlocks: (blocks: ReadonlyArray<Block>) => HtmlFragment = flow(
  A.map(renderHtmlBlock),
  A.join("\n"),
  HtmlFragment.make
);

/**
 * Renders block nodes as plain text.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextBlocks } from "@beep/md/Md.render"
 *
 * console.log(renderPlainTextBlocks([Md.h1("Hello"), Md.p("World")]))
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainTextBlocks: (blocks: ReadonlyArray<Block>) => string = flow(
  A.map(renderPlainTextBlock),
  A.join("\n")
);

/**
 * Renders a document through the Markdown adapter and returns the output directly.
 *
 * Prefer {@link render} when callers should handle adapter failure explicitly.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderUnsafe } from "@beep/md/Md.render"
 *
 * console.log(renderUnsafe(Md.make([Md.h1("Hello")]))) // "# Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderUnsafe = (document: Document): Markdown => renderWithUnsafe(MarkdownAdapter, document);

/**
 * Renders a document through the HTML fragment adapter and returns the output directly.
 *
 * Prefer {@link renderHtml} when callers should handle adapter failure explicitly.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtmlUnsafe } from "@beep/md/Md.render"
 *
 * console.log(renderHtmlUnsafe(Md.make([Md.p("Hello")]))) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderHtmlUnsafe = (document: Document): HtmlFragment => renderWithUnsafe(HtmlFragmentAdapter, document);

/**
 * Renders a document through the plain text adapter and returns the output directly.
 *
 * Prefer {@link renderPlainText} when callers should handle adapter failure explicitly.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderPlainTextUnsafe } from "@beep/md/Md.render"
 *
 * console.log(renderPlainTextUnsafe(Md.make([Md.h1("Hello")]))) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainTextUnsafe = (document: Document): string => renderWithUnsafe(PlainTextAdapter, document);

/**
 * Renders a document with a custom pure adapter and returns the output directly.
 *
 * Prefer {@link renderWith} when callers should handle adapter failure explicitly.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { MarkdownAdapter, renderWithUnsafe } from "@beep/md/Md.render"
 *
 * const output = renderWithUnsafe(MarkdownAdapter, Md.make([Md.p("Hello")]))
 * console.log(output) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderWithUnsafe: {
  <Output>(adapter: PureRenderAdapter<Output>, document: Document): Output;
  <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Output;
} = dual(2, <Output>(adapter: PureRenderAdapter<Output>, document: Document): Output => adapter.render(document));

/**
 * Starts an effectful render adapter and returns its effect directly.
 *
 * Prefer {@link renderEffectWith} when adapter construction failures should be
 * reported as {@link RenderError}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Md } from "@beep/md"
 * import { renderEffectWithUnsafe } from "@beep/md/Md.render"
 *
 * const adapter = {
 *   name: "bytes",
 *   render: () => Effect.succeed(new Uint8Array())
 * }
 * const program = renderEffectWithUnsafe(adapter, Md.make([]))
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderEffectWithUnsafe: {
  <Output, Error, Requirements>(
    adapter: EffectRenderAdapter<Output, Error, Requirements>,
    document: Document
  ): Effect.Effect<Output, Error, Requirements>;
  <Output, Error, Requirements>(
    document: Document
  ): (adapter: EffectRenderAdapter<Output, Error, Requirements>) => Effect.Effect<Output, Error, Requirements>;
} = dual(
  2,
  <Output, Error, Requirements>(
    adapter: EffectRenderAdapter<Output, Error, Requirements>,
    document: Document
  ): Effect.Effect<Output, Error, Requirements> => adapter.render(document)
);

/**
 * Starts an effectful render adapter with synchronous adapter failures captured.
 *
 * Adapter effects keep their original error and requirement channels. Only
 * failures thrown while starting the adapter are wrapped as {@link RenderError}.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Md } from "@beep/md"
 * import { renderEffectWith } from "@beep/md/Md.render"
 *
 * const adapter = {
 *   name: "bytes",
 *   render: () => Effect.succeed(new Uint8Array())
 * }
 * const program = renderEffectWith(adapter, Md.make([]))
 * console.log(program)
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderEffectWith: {
  <Output, Error, Requirements>(
    adapter: EffectRenderAdapter<Output, Error, Requirements>,
    document: Document
  ): Effect.Effect<Output, Error | RenderError, Requirements>;
  <Output, Error, Requirements>(
    document: Document
  ): (
    adapter: EffectRenderAdapter<Output, Error, Requirements>
  ) => Effect.Effect<Output, Error | RenderError, Requirements>;
} = dual(
  2,
  <Output, Error, Requirements>(
    adapter: EffectRenderAdapter<Output, Error, Requirements>,
    document: Document
  ): Effect.Effect<Output, Error | RenderError, Requirements> =>
    Effect.fromResult(
      Result.try({
        try: () => renderEffectWithUnsafe(adapter, document),
        catch: toRenderError(adapterName(adapter)),
      })
    ).pipe(Effect.flatMap(identity))
);

/**
 * Built-in Markdown render adapter.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { MarkdownAdapter } from "@beep/md/Md.render"
 *
 * console.log(MarkdownAdapter.render(Md.make([Md.h1("Hello")]))) // "# Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const MarkdownAdapter: PureRenderAdapter<Markdown> = {
  name: "markdown",
  render: renderMarkdownDocumentUnsafe,
};

/**
 * Built-in HTML fragment render adapter.
 *
 * Note: this adapter escapes `rawHtml` inline nodes by default. Treat trusted
 * HTML pass-through as an explicit custom-adapter boundary.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { HtmlFragmentAdapter } from "@beep/md/Md.render"
 *
 * console.log(HtmlFragmentAdapter.render(Md.make([Md.p("Hello")]))) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const HtmlFragmentAdapter: PureRenderAdapter<HtmlFragment> = {
  name: "html-fragment",
  render: renderHtmlDocumentUnsafe,
};

/**
 * Built-in plain-text render adapter.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { PlainTextAdapter } from "@beep/md/Md.render"
 *
 * console.log(PlainTextAdapter.render(Md.make([Md.h1("Hello")]))) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const PlainTextAdapter: PureRenderAdapter<string> = {
  name: "plain-text",
  render: (document) => renderPlainTextBlocks(document.children),
};

/**
 * Renders a document with a custom pure adapter.
 *
 * Adapter failures are captured as {@link RenderError}. Use
 * {@link renderWithUnsafe} only at boundaries that intentionally throw.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { Md } from "@beep/md"
 * import { MarkdownAdapter, renderWith } from "@beep/md/Md.render"
 *
 * const output = renderWith(MarkdownAdapter, Md.make([Md.p("Hello")]))
 * console.log(Result.getOrThrow(output)) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderWith: {
  <Output>(adapter: PureRenderAdapter<Output>, document: Document): Result.Result<Output, RenderError>;
  <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Result.Result<Output, RenderError>;
} = dual(
  2,
  <Output>(adapter: PureRenderAdapter<Output>, document: Document): Result.Result<Output, RenderError> =>
    Result.try({
      try: () => adapter.render(document),
      catch: toRenderError(adapterName(adapter)),
    })
);

/**
 * Renders a document through the Markdown adapter.
 *
 * Adapter failures are captured as {@link RenderError}. Use
 * {@link renderUnsafe} only at boundaries that intentionally throw.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { Md } from "@beep/md"
 * import { render } from "@beep/md/Md.render"
 *
 * const output = render(Md.make([Md.h1("Hello")]))
 * console.log(Result.getOrThrow(output)) // "# Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const render = (document: Document): Result.Result<Markdown, RenderError> =>
  renderWith(MarkdownAdapter, document);

/**
 * Renders a document through the HTML fragment adapter.
 *
 * Adapter failures are captured as {@link RenderError}. Use
 * {@link renderHtmlUnsafe} only at boundaries that intentionally throw.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { Md } from "@beep/md"
 * import { renderHtml } from "@beep/md/Md.render"
 *
 * const output = renderHtml(Md.make([Md.p("Hello")]))
 * console.log(Result.getOrThrow(output)) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderHtml = (document: Document): Result.Result<HtmlFragment, RenderError> =>
  renderWith(HtmlFragmentAdapter, document);

/**
 * Renders a document through the plain text adapter.
 *
 * Adapter failures are captured as {@link RenderError}. Use
 * {@link renderPlainTextUnsafe} only at boundaries that intentionally throw.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import { Md } from "@beep/md"
 * import { renderPlainText } from "@beep/md/Md.render"
 *
 * const output = renderPlainText(Md.make([Md.h1("Hello")]))
 * console.log(Result.getOrThrow(output)) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderPlainText = (document: Document): Result.Result<string, RenderError> =>
  renderWith(PlainTextAdapter, document);

const encodeUnsupported =
  <Output>(name: string) =>
  (value: unknown): Effect.Effect<Output, SchemaIssue.Issue> =>
    Effect.fail(
      new SchemaIssue.InvalidValue(O.some(value), {
        message: `Encoding ${name} output back into a Markdown document AST is not supported.`,
      })
    );

/**
 * Schema transformation from a document AST to branded Markdown text.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Md } from "@beep/md"
 * import { DocumentToMarkdown } from "@beep/md/Md.render"
 *
 * const program = S.decodeUnknownEffect(DocumentToMarkdown)(Md.make([Md.h1("Hello")]))
 * console.log(Effect.runSync(program)) // "# Hello"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DocumentToMarkdown = DocumentSchema.pipe(
  S.decodeTo(Markdown, {
    decode: SchemaGetter.transform(renderMarkdownDocumentUnsafe),
    encode: SchemaGetter.transformOrFail(encodeUnsupported<Document>("Markdown")),
  }),
  $I.annoteSchema("DocumentToMarkdown", {
    description: "Schema transformation from a document AST to branded Markdown text.",
  })
);

/**
 * Type for {@link DocumentToMarkdown}.
 *
 * @example
 * ```ts
 * import type { DocumentToMarkdown } from "@beep/md/Md.render"
 *
 * const acceptMarkdown = (value: DocumentToMarkdown) => value
 * console.log(acceptMarkdown)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DocumentToMarkdown = typeof DocumentToMarkdown.Type;

/**
 * Schema transformation from a document AST to a branded HTML fragment.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Md } from "@beep/md"
 * import { DocumentToHtmlFragment } from "@beep/md/Md.render"
 *
 * const program = S.decodeUnknownEffect(DocumentToHtmlFragment)(Md.make([Md.p("Hello")]))
 * console.log(Effect.runSync(program)) // "<p>Hello</p>"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DocumentToHtmlFragment = DocumentSchema.pipe(
  S.decodeTo(HtmlFragment, {
    decode: SchemaGetter.transform(renderHtmlDocumentUnsafe),
    encode: SchemaGetter.transformOrFail(encodeUnsupported<Document>("HTML fragment")),
  }),
  $I.annoteSchema("DocumentToHtmlFragment", {
    description: "Schema transformation from a document AST to a branded HTML fragment.",
  })
);

/**
 * Schema transformation from a document AST to plain text.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import * as S from "effect/Schema"
 * import { Md } from "@beep/md"
 * import { DocumentToPlainText } from "@beep/md/Md.render"
 *
 * const program = S.decodeUnknownEffect(DocumentToPlainText)(Md.make([Md.h1("Hello")]))
 * console.log(Effect.runSync(program)) // "Hello"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DocumentToPlainText = DocumentSchema.pipe(
  S.decodeTo(S.String, {
    decode: SchemaGetter.transform((document: Document) => renderPlainTextBlocks(document.children)),
    encode: SchemaGetter.transformOrFail(encodeUnsupported<Document>("plain text")),
  }),
  $I.annoteSchema("DocumentToPlainText", {
    description: "Schema transformation from a document AST to plain text.",
  })
);

/**
 * Type for {@link DocumentToPlainText}.
 *
 * @example
 * ```ts
 * import type { DocumentToPlainText } from "@beep/md/Md.render"
 *
 * const acceptPlainText = (value: DocumentToPlainText) => value
 * console.log(acceptPlainText)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DocumentToPlainText = typeof DocumentToPlainText.Type;

/**
 * Type for {@link DocumentToHtmlFragment}.
 *
 * @example
 * ```ts
 * import type { DocumentToHtmlFragment } from "@beep/md/Md.render"
 *
 * const acceptHtml = (value: DocumentToHtmlFragment) => value
 * console.log(acceptHtml)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DocumentToHtmlFragment = typeof DocumentToHtmlFragment.Type;
