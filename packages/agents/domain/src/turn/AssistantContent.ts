/**
 * Assistant-turn block schema — the stratified (non-recursive) block→inline
 * subset of rich text used for forced-tool structured outputs. Blocks contain
 * inlines and inlines contain nothing, so the schema is non-recursive. Field
 * annotations become JSON-Schema descriptions that steer generation.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $AgentsDomainId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $AgentsDomainId.create("turn/AssistantContent");

// ---------------------------------------------------------------------------
// Inlines (stratified, non-recursive — inlines contain no blocks)
// ---------------------------------------------------------------------------

/**
 * A run of styled text.
 *
 * @example
 * ```ts
 * import { TextInline } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const inline = S.decodeUnknownSync(TextInline)({
 *   type: "text",
 *   text: "Hello",
 *   bold: true,
 * })
 * console.log(inline.text)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TextInline extends S.Class<TextInline>($I`TextInline`)(
  {
    type: S.tag("text"),
    text: S.String.annotateKey({ description: "The visible text content" }),
    bold: S.optionalKey(S.Boolean.annotate({ description: "Render bold" })).annotateKey({ description: "Render bold" }),
    italic: S.optionalKey(S.Boolean.annotate({ description: "Render italic" })).annotateKey({
      description: "Render italic",
    }),
    code: S.optionalKey(S.Boolean.annotate({ description: "Render as inline code" })).annotateKey({
      description: "Render as inline code",
    }),
  },
  $I.annote("TextInline", {
    description: "A run of styled text.",
  })
) {}

/**
 * A hyperlink inline.
 *
 * @example
 * ```ts
 * import { LinkInline } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const inline = S.decodeUnknownSync(LinkInline)({
 *   type: "link",
 *   url: "https://example.com",
 *   text: "Example",
 * })
 * console.log(inline.url)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class LinkInline extends S.Class<LinkInline>($I`LinkInline`)(
  {
    type: S.tag("link"),
    url: S.String.annotateKey({ description: "Absolute http(s) url" }),
    text: S.String.annotateKey({ description: "The visible link text" }),
  },
  $I.annote("LinkInline", {
    description: "A hyperlink.",
  })
) {}

/**
 * Inline content held by an assistant block.
 *
 * @example
 * ```ts
 * import { InlineNode } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const node = S.decodeUnknownSync(InlineNode)({ type: "text", text: "Hello" })
 * console.log(node.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const InlineNode = S.Union([TextInline, LinkInline]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("InlineNode", {
    description: "Inline content held by an assistant block.",
  })
);

/**
 * Runtime type for {@link InlineNode}.
 *
 * @category models
 * @since 0.0.0
 */
export type InlineNode = typeof InlineNode.Type;

// ---------------------------------------------------------------------------
// Blocks (v1 md-aligned scope only — no table/mermaid/youtube)
// ---------------------------------------------------------------------------

/**
 * A paragraph of inline content.
 *
 * @example
 * ```ts
 * import { ParagraphBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(ParagraphBlock)({
 *   type: "paragraph",
 *   children: [{ type: "text", text: "Hello" }],
 * })
 * console.log(block.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ParagraphBlock extends S.Class<ParagraphBlock>($I`ParagraphBlock`)(
  {
    type: S.tag("paragraph"),
    children: S.Array(InlineNode).annotateKey({ description: "Inline content in order" }),
  },
  $I.annote("ParagraphBlock", {
    description: "A paragraph of inline content.",
  })
) {}

/**
 * A section heading.
 *
 * @example
 * ```ts
 * import { HeadingBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(HeadingBlock)({
 *   type: "heading",
 *   level: "h1",
 *   children: [{ type: "text", text: "Title" }],
 * })
 * console.log(block.level)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class HeadingBlock extends S.Class<HeadingBlock>($I`HeadingBlock`)(
  {
    type: S.tag("heading"),
    level: S.Literals(["h1", "h2", "h3"]).annotateKey({ description: "Heading level" }),
    children: S.Array(InlineNode).annotateKey({ description: "Inline content in order" }),
  },
  $I.annote("HeadingBlock", {
    description: "A section heading.",
  })
) {}

/**
 * A block quotation.
 *
 * @example
 * ```ts
 * import { QuoteBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(QuoteBlock)({
 *   type: "quote",
 *   children: [{ type: "text", text: "Quote" }],
 * })
 * console.log(block.type)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class QuoteBlock extends S.Class<QuoteBlock>($I`QuoteBlock`)(
  {
    type: S.tag("quote"),
    children: S.Array(InlineNode).annotateKey({ description: "Inline content in order" }),
  },
  $I.annote("QuoteBlock", {
    description: "A block quotation.",
  })
) {}

/**
 * A flat list of items.
 *
 * @example
 * ```ts
 * import { ListBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(ListBlock)({
 *   type: "list",
 *   listType: "bullet",
 *   items: [{ children: [{ type: "text", text: "Item" }] }],
 * })
 * console.log(block.listType)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class ListBlock extends S.Class<ListBlock>($I`ListBlock`)(
  {
    type: S.tag("list"),
    listType: S.Literals(["bullet", "number"]).annotateKey({ description: "Bulleted or numbered list" }),
    items: S.Array(
      S.Struct({
        children: S.Array(InlineNode).annotateKey({ description: "Inline content of the item" }),
      })
    ).annotateKey({ description: "List items in order" }),
  },
  $I.annote("ListBlock", {
    description: "A flat list of items.",
  })
) {}

/**
 * A fenced code block.
 *
 * @example
 * ```ts
 * import { CodeBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(CodeBlock)({
 *   type: "code",
 *   language: "typescript",
 *   code: "console.log('beep')",
 * })
 * console.log(block.code)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class CodeBlock extends S.Class<CodeBlock>($I`CodeBlock`)(
  {
    type: S.tag("code"),
    language: S.optionalKey(S.String.annotate({ description: "Language identifier, e.g. typescript" })).annotateKey({
      description: "Language identifier, e.g. typescript",
    }),
    code: S.String.annotateKey({ description: "Raw source code without fences" }),
  },
  $I.annote("CodeBlock", {
    description: "A fenced code block.",
  })
) {}

/**
 * A single block of an assistant turn.
 *
 * @example
 * ```ts
 * import { AssistantBlock } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const block = S.decodeUnknownSync(AssistantBlock)({
 *   type: "paragraph",
 *   children: [{ type: "text", text: "Hello" }],
 * })
 * console.log(block.type)
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AssistantBlock = S.Union([ParagraphBlock, HeadingBlock, QuoteBlock, ListBlock, CodeBlock]).pipe(
  S.toTaggedUnion("type"),
  $I.annoteSchema("AssistantBlock", {
    description: "A single block of an assistant turn.",
  })
);

/**
 * Runtime type for {@link AssistantBlock}.
 *
 * @category models
 * @since 0.0.0
 */
export type AssistantBlock = typeof AssistantBlock.Type;

/**
 * A complete assistant turn as structured rich text. This is the forced-tool
 * structured-output envelope the model fills in.
 *
 * @example
 * ```ts
 * import { AssistantContent } from "@beep/agents-domain/turn"
 * import * as S from "effect/Schema"
 *
 * const content = S.decodeUnknownSync(AssistantContent)({
 *   blocks: [{ type: "paragraph", children: [{ type: "text", text: "Hello" }] }],
 * })
 * console.log(content.blocks.length)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class AssistantContent extends S.Class<AssistantContent>($I`AssistantContent`)(
  {
    blocks: S.Array(AssistantBlock).annotateKey({
      description: "The assistant response as an ordered list of rich-text blocks",
    }),
  },
  $I.annote("AssistantContent", {
    description: "A complete assistant turn as structured rich text.",
  })
) {}
