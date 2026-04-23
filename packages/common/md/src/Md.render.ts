/**
 * Markdown AST render adapters.
 *
 * @module @beep/md/Md.render
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { HtmlFragment, Markdown } from "@beep/schema";
import { Html, Str, thunkEmptyStr } from "@beep/utils";
import { Effect, flow, identity, Match, SchemaGetter, SchemaIssue } from "effect";
import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";

import type { Block, Document, Inline, Li, TaskItem } from "./Md.model.ts";

import { Document as DocumentSchema, H1, H2, H3, H4, H5, H6 } from "./Md.model.ts";
import {
  escapeMarkdownDestination,
  escapeMarkdownText,
  joinBlocks,
  prefixLines,
  renderFencedCode,
  renderInlineCode,
} from "./Md.utils.ts";

const $I = $MdId.create("Md.render");
const joinEmpty = A.join("");
const headingMarkerCount = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
} as const;

const HeadingBlock = S.Union([H1, H2, H3, H4, H5, H6]).pipe(S.toTaggedUnion("_tag"));
type HeadingBlock = H1 | H2 | H3 | H4 | H5 | H6;

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
 * void adapter
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
 * void adapter
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface EffectRenderAdapter<Output, Error = never, Requirements = never> {
  readonly name: string;
  readonly render: (document: Document) => Effect.Effect<Output, Error, Requirements>;
}

const renderMarkdownInlines = (children: ReadonlyArray<Inline>): string =>
  pipe(children, A.map(renderMarkdownInline), joinEmpty);

const renderHtmlInlines = (children: ReadonlyArray<Inline>): string =>
  pipe(children, A.map(renderHtmlInline), joinEmpty);

const renderMarkdownListItem = (item: Li): string => renderMarkdownInlines(item.children);

const renderHtmlListItem = (item: Li): string => `<li>${renderHtmlInlines(item.children)}</li>`;

const renderMarkdownTaskItem = (item: TaskItem): string =>
  `- [${item.checked ? "x" : " "}] ${renderMarkdownInlines(item.children)}`;

const renderHtmlTaskItem = (item: TaskItem): string => {
  const checked = item.checked ? " checked" : "";

  return `<li><input type="checkbox" disabled${checked} /> ${renderHtmlInlines(item.children)}</li>`;
};

const renderMarkdownHeading = (block: HeadingBlock): string =>
  `${pipe("#", Str.repeat(headingMarkerCount[block._tag]))} ${renderMarkdownInlines(block.children)}`;

const renderHtmlHeading = (block: HeadingBlock): string =>
  `<${block._tag}>${renderHtmlInlines(block.children)}</${block._tag}>`;

const languageToMarkdown = O.match({
  onNone: thunkEmptyStr,
  onSome: identity,
});

const languageToHtmlClass = O.match({
  onNone: thunkEmptyStr,
  onSome: flow(Html.escapeHtml, Str.prefix(` class="language-`)),
});

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
const renderMarkdownInline = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => escapeMarkdownText(value),
    rawMarkdown: ({ value }) => value,
    rawHtml: ({ value }) => escapeMarkdownText(value),
    strong: ({ children }) => `**${renderMarkdownInlines(children)}**`,
    em: ({ children }) => `*${renderMarkdownInlines(children)}*`,
    del: ({ children }) => `~~${renderMarkdownInlines(children)}~~`,
    code: ({ value }) => renderInlineCode(value),
    a: ({ href, children }) => `[${renderMarkdownInlines(children)}](${escapeMarkdownDestination(href)})`,
    img: ({ src, alt }) => `![${escapeMarkdownText(alt)}](${escapeMarkdownDestination(src)})`,
    br: () => "<br/>",
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
export const renderHtmlInline = Match.type<Inline>().pipe(
  Match.tagsExhaustive({
    text: ({ value }) => Html.escapeHtml(value),
    rawMarkdown: ({ value }) => Html.escapeHtml(value),
    rawHtml: (inline) => inline.value,
    strong: ({ children }) => `<strong>${renderHtmlInlines(children)}</strong>`,
    em: ({ children }) => `<em>${renderHtmlInlines(children)}</em>`,
    del: ({ children }) => `<del>${renderHtmlInlines(children)}</del>`,
    code: ({ value }) => `<code>${Html.escapeHtml(value)}</code>`,
    a: ({ href, children }) => `<a href="${Html.escapeHtml(href)}">${renderHtmlInlines(children)}</a>`,
    img: ({ src, alt }) => `<img src="${Html.escapeHtml(src)}" alt="${Html.escapeHtml(alt)}" />`,
    br: () => "<br />",
  })
);

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
const renderMarkdownBlock = Match.type<Block>().pipe(
  Match.when(S.is(HeadingBlock), (block) => renderMarkdownHeading(block)),
  Match.tags({
    p: (block) => renderMarkdownInlines(block.children),
    blockquote: (block) => pipe(block.children, renderMarkdownBlocks, prefixLines("> ")),
    pre: (block) => renderFencedCode(block.value, languageToMarkdown(block.language)),
    ul: (block) => pipe(block.children, A.map(flow(renderMarkdownListItem, Str.prefix(`- `))), A.join("\n")),
    ol: (block) =>
      pipe(
        block.children,
        A.map((item, index) => `${index + 1}. ${renderMarkdownListItem(item)}`),
        A.join("\n")
      ),
    li: renderMarkdownListItem,
    taskList: (block) => pipe(block.children, A.map(renderMarkdownTaskItem), A.join("\n")),
  }),
  Match.orElse(() => "---")
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
export const renderHtmlBlock = Match.type<Block>().pipe(
  Match.when(S.is(HeadingBlock), (block) => renderHtmlHeading(block)),
  Match.tags({
    p: (block) => `<p>${renderHtmlInlines(block.children)}</p>`,
    blockquote: (block) => `<blockquote>${renderHtmlBlocks(block.children)}</blockquote>`,
    pre: (block) => `<pre><code${languageToHtmlClass(block.language)}>${Html.escapeHtml(block.value)}</code></pre>`,
    ul: (block) => `<ul>${pipe(block.children, A.map(renderHtmlListItem), joinEmpty)}</ul>`,
    ol: (block) => `<ol>${pipe(block.children, A.map(renderHtmlListItem), joinEmpty)}</ol>`,
    li: (block) => renderHtmlListItem(block),
    taskList: (block) =>
      `<ul class="contains-task-list">${pipe(block.children, A.map(renderHtmlTaskItem), joinEmpty)}</ul>`,
  }),
  Match.orElse(() => "<hr />")
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
export const renderMarkdownBlocks = (blocks: ReadonlyArray<Block>): Markdown =>
  pipe(blocks, A.map(renderMarkdownBlock), joinBlocks);

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
export const renderHtmlBlocks = (blocks: ReadonlyArray<Block>): HtmlFragment =>
  pipe(blocks, A.map(renderHtmlBlock), A.join("\n"), HtmlFragment.make);

/**
 * Renders a document through the Markdown adapter.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { render } from "@beep/md/Md.render"
 *
 * console.log(render(Md.make([Md.h1("Hello")]))) // "# Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const render = (document: Document): Markdown => renderMarkdownBlocks(document.children);

/**
 * Renders a document through the HTML fragment adapter.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { renderHtml } from "@beep/md/Md.render"
 *
 * console.log(renderHtml(Md.make([Md.p("Hello")]))) // "<p>Hello</p>"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderHtml = (document: Document): HtmlFragment => renderHtmlBlocks(document.children);

/**
 * Renders a document with a custom pure adapter.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { MarkdownAdapter, renderWith } from "@beep/md/Md.render"
 *
 * const output = renderWith(MarkdownAdapter, Md.make([Md.p("Hello")]))
 * console.log(output) // "Hello"
 * ```
 *
 * @category utilities
 * @since 0.0.0
 */
export const renderWith = <Output>(adapter: PureRenderAdapter<Output>, document: Document): Output =>
  adapter.render(document);

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
  render,
};

/**
 * Built-in HTML fragment render adapter.
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
  render: renderHtml,
};

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
 * import * as S from "effect/Schema"
 * import { Md } from "@beep/md"
 * import { DocumentToMarkdown } from "@beep/md/Md.render"
 *
 * const markdown = S.decodeUnknownSync(DocumentToMarkdown)(Md.make([Md.h1("Hello")]))
 * console.log(markdown) // "# Hello"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DocumentToMarkdown = DocumentSchema.pipe(
  S.decodeTo(Markdown, {
    decode: SchemaGetter.transform(render),
    encode: SchemaGetter.transformOrFail(encodeUnsupported<Document>("Markdown")),
  }),
  $I.annoteSchema("DocumentToMarkdown", {
    description: "Schema transformation from a document AST to branded Markdown text.",
  })
);

/**
 * Type for {@link DocumentToMarkdown}. {@inheritDoc DocumentToMarkdown}
 *
 * @example
 * ```ts
 * import type { DocumentToMarkdown } from "@beep/md/Md.render"
 *
 * const acceptMarkdown = (value: DocumentToMarkdown) => value
 * void acceptMarkdown
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
 * import * as S from "effect/Schema"
 * import { Md } from "@beep/md"
 * import { DocumentToHtmlFragment } from "@beep/md/Md.render"
 *
 * const html = S.decodeUnknownSync(DocumentToHtmlFragment)(Md.make([Md.p("Hello")]))
 * console.log(html) // "<p>Hello</p>"
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const DocumentToHtmlFragment = DocumentSchema.pipe(
  S.decodeTo(HtmlFragment, {
    decode: SchemaGetter.transform(renderHtml),
    encode: SchemaGetter.transformOrFail(encodeUnsupported<Document>("HTML fragment")),
  }),
  $I.annoteSchema("DocumentToHtmlFragment", {
    description: "Schema transformation from a document AST to a branded HTML fragment.",
  })
);

/**
 * Type for {@link DocumentToHtmlFragment}. {@inheritDoc DocumentToHtmlFragment}
 *
 * @example
 * ```ts
 * import type { DocumentToHtmlFragment } from "@beep/md/Md.render"
 *
 * const acceptHtml = (value: DocumentToHtmlFragment) => value
 * void acceptHtml
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DocumentToHtmlFragment = typeof DocumentToHtmlFragment.Type;
