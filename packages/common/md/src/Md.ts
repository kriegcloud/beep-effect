/**
 * Public Markdown AST builder DSL.
 *
 * @module @beep/md/Md
 * @since 0.0.0
 */

import { thunkFalse } from "@beep/utils";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  A as ANode,
  type Block,
  BlockQuote,
  Block as BlockSchema,
  Br,
  Code,
  Del,
  Document,
  Em,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Hr,
  Img,
  type Inline,
  Li,
  Ol,
  P as PNode,
  Pre,
  RawHtml,
  RawMarkdown,
  Strong,
  TaskItem,
  TaskList,
  Text,
  Ul,
} from "./Md.model.ts";
import {
  HtmlFragmentAdapter,
  MarkdownAdapter,
  render,
  renderEffectWith,
  renderEffectWithUnsafe,
  renderHtml,
  renderHtmlUnsafe,
  renderUnsafe,
  renderWith,
  renderWithUnsafe,
} from "./Md.render.ts";

/**
 * Inline constructor input accepted by text-oriented builders.
 *
 * @example
 * ```ts
 * import type { InlineInput } from "@beep/md/Md"
 *
 * const accept = (input: InlineInput) => input
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type InlineInput = string | Inline;

/**
 * Inline child content accepted by inline and text block builders.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import type { InlineContent } from "@beep/md/Md"
 *
 * const content: InlineContent = [Md.strong("Hello"), " world"]
 * void content
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type InlineContent = InlineInput | ReadonlyArray<InlineInput>;

/**
 * Overloaded builder shape for inline-content constructors.
 *
 * @example
 * ```ts
 * import type { InlineContentBuilder } from "@beep/md/Md"
 * import type { Strong } from "@beep/md/Md.model"
 *
 * const accept = (builder: InlineContentBuilder<Strong>) => builder
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type InlineContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<InlineContent>): Node;
  (children: InlineContent): Node;
};

/**
 * Block constructor input accepted by block containers.
 *
 * @example
 * ```ts
 * import type { BlockInput } from "@beep/md/Md"
 *
 * const accept = (input: BlockInput) => input
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BlockInput = string | Block;

/**
 * Block child content accepted by block container call forms.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import type { BlockContent } from "@beep/md/Md"
 *
 * const content: BlockContent = [Md.h2("Nested"), "plain"]
 * void content
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BlockContent = BlockInput | ReadonlyArray<BlockInput>;

/**
 * Tagged-template interpolation accepted by block containers.
 *
 * Arrays in templates are inline content arrays; use the call form for block
 * arrays.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import type { BlockTemplateValue } from "@beep/md/Md"
 *
 * const value: BlockTemplateValue = Md.h2("Nested")
 * void value
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BlockTemplateValue = InlineContent | Block;

/**
 * Overloaded builder shape for block-content constructors.
 *
 * @example
 * ```ts
 * import type { BlockContentBuilder } from "@beep/md/Md"
 * import type { BlockQuote } from "@beep/md/Md.model"
 *
 * const accept = (builder: BlockContentBuilder<BlockQuote>) => builder
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BlockContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<BlockTemplateValue>): Node;
  (children: BlockContent): Node;
};

/**
 * Input accepted by ordered and unordered list constructors.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import type { ListItemInput } from "@beep/md/Md"
 *
 * const item: ListItemInput = [Md.strong("Item")]
 * void item
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type ListItemInput = string | Inline | Li | ReadonlyArray<InlineInput>;

/**
 * Input accepted by task list constructors.
 *
 * @example
 * ```ts
 * import type { TaskListItemInput } from "@beep/md/Md"
 *
 * const item: TaskListItemInput = { text: "Done", checked: true }
 * void item
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TaskListItemInput =
  | string
  | TaskItem
  | {
      readonly text: string;
      readonly checked?: boolean;
    };

const blockTemplateFormattingLinePattern = /[\r\n]/;
const isTemplateStringsArray = (input: unknown): input is TemplateStringsArray =>
  A.isArray(input) && P.hasProperty(input, "raw");

const isInlineInputArray = (input: InlineContent): input is ReadonlyArray<InlineInput> => A.isArray(input);

const isBlockInputArray = (input: BlockContent): input is ReadonlyArray<BlockInput> => A.isArray(input);

const isBlock = S.is(BlockSchema);
const isLi = S.is(Li);
const isTaskItem = S.is(TaskItem);

const isBlockTemplateBlockValue = (input: BlockTemplateValue): input is Block => isBlock(input);

const isBlockTemplateFormattingChunk = (chunk: string): boolean =>
  Str.trim(chunk) === "" && blockTemplateFormattingLinePattern.test(chunk);

const asInline = (input: InlineInput): Inline => (P.isString(input) ? text(input) : input);

const asInlineArray = (input: InlineContent): ReadonlyArray<Inline> =>
  isInlineInputArray(input) ? A.map(input, asInline) : [asInline(input)];

const templateToInlineArray = (
  strings: TemplateStringsArray,
  values: ReadonlyArray<InlineContent>
): ReadonlyArray<Inline> => {
  const out: Array<Inline> = [];

  for (let index = 0; index < strings.length; index++) {
    const chunk = strings[index];
    if (chunk !== "") {
      out.push(text(chunk));
    }

    const value = values[index];
    if (value !== undefined) {
      out.push(...asInlineArray(value));
    }
  }

  return out;
};

const makeInlineContentBuilder = <Node>(
  makeNode: (children: ReadonlyArray<Inline>) => Node
): InlineContentBuilder<Node> => {
  function build(strings: TemplateStringsArray, ...values: ReadonlyArray<InlineContent>): Node;
  function build(children: InlineContent): Node;
  function build(input: TemplateStringsArray | InlineContent, ...values: ReadonlyArray<InlineContent>): Node {
    return isTemplateStringsArray(input)
      ? makeNode(templateToInlineArray(input, values))
      : makeNode(asInlineArray(input));
  }

  return build;
};

const asBlock = (input: BlockInput): Block => (P.isString(input) ? p(input) : input);

const asBlockArray = (input: BlockContent): ReadonlyArray<Block> =>
  isBlockInputArray(input) ? A.map(input, asBlock) : [asBlock(input)];

const templateToBlockArray = (
  strings: TemplateStringsArray,
  values: ReadonlyArray<BlockTemplateValue>
): ReadonlyArray<Block> => {
  const out: Array<Block> = [];
  let pendingInline: Array<Inline> = [];
  const flushInline = (): void => {
    if (pendingInline.length > 0) {
      out.push(p(pendingInline));
      pendingInline = [];
    }
  };

  for (let index = 0; index < strings.length; index++) {
    const chunk = strings[index];
    const value = values[index];
    const previousValue = values[index - 1];
    const nextIsBlock = value !== undefined && isBlockTemplateBlockValue(value);
    const previousIsBlock = previousValue !== undefined && isBlockTemplateBlockValue(previousValue);
    if (chunk !== "" && !(isBlockTemplateFormattingChunk(chunk) && (nextIsBlock || previousIsBlock))) {
      pendingInline.push(text(chunk));
    }

    if (value !== undefined) {
      if (nextIsBlock) {
        flushInline();
        out.push(...asBlockArray(value));
      } else {
        pendingInline.push(...asInlineArray(value));
      }
    }
  }

  flushInline();

  return out;
};

const makeBlockContentBuilder = <Node>(
  makeNode: (children: ReadonlyArray<Block>) => Node
): BlockContentBuilder<Node> => {
  function build(strings: TemplateStringsArray, ...values: ReadonlyArray<BlockTemplateValue>): Node;
  function build(children: BlockContent): Node;
  function build(input: TemplateStringsArray | BlockContent, ...values: ReadonlyArray<BlockTemplateValue>): Node {
    return isTemplateStringsArray(input)
      ? makeNode(templateToBlockArray(input, values))
      : makeNode(asBlockArray(input));
  }

  return build;
};

const asListItem = (input: ListItemInput): Li => (isLi(input) ? input : li(input));

const asTaskItem = (input: TaskListItemInput): TaskItem => {
  if (isTaskItem(input)) {
    return input;
  }

  if (P.isString(input)) {
    return taskItem(input);
  }

  return P.isBoolean(input.checked) ? taskItem(input.text, { checked: input.checked }) : taskItem(input.text);
};

/**
 * Creates plain escaped inline text.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.text("Hello")
 * console.log(node._tag) // "text"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const text = (value: string): Text => Text.make({ value });

/**
 * Creates trusted raw Markdown inline content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.rawMarkdown("**trusted**")
 * console.log(node._tag) // "rawMarkdown"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const rawMarkdown = (value: string): RawMarkdown => RawMarkdown.make({ value });

/**
 * Creates raw HTML inline content for adapters that opt into trusted HTML rendering.
 *
 * The built-in {@link HtmlFragmentAdapter} escapes this value by default.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.rawHtml("<span>trusted</span>")
 * console.log(node._tag) // "rawHtml"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const rawHtml = (value: string): RawHtml => RawHtml.make({ value });

/**
 * Creates strong inline content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.strong`Hello ${Md.code("beep")}`
 * console.log(node._tag) // "strong"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const strong = makeInlineContentBuilder((children): Strong => Strong.make({ children }));

/**
 * Creates emphasized inline content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.em("quiet")
 * console.log(node._tag) // "em"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const em = makeInlineContentBuilder((children): Em => Em.make({ children }));

/**
 * Creates deleted inline content.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.del("removed")
 * console.log(node._tag) // "del"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const del = makeInlineContentBuilder((children): Del => Del.make({ children }));

/**
 * Creates an inline code span.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.code("console.log()")
 * console.log(node._tag) // "code"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const code = (value: string): Code => Code.make({ value });

/**
 * Creates an inline hyperlink.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.a("https://example.com", "Example")
 * console.log(node._tag) // "a"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const a = (href: string, children: InlineContent): ANode =>
  ANode.make({ href, children: asInlineArray(children) });

/**
 * Creates an inline image.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.img("/logo.png", "Logo")
 * console.log(node._tag) // "img"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const img = (src: string, alt = ""): Img => Img.make({ src, alt });

/**
 * Creates an inline line break.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * console.log(Md.br._tag) // "br"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const br: Br = Br.make({});

/**
 * Creates a level-one heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h1`Hello ${Md.em("world")}`
 * console.log(node._tag) // "h1"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h1 = makeInlineContentBuilder((children): H1 => H1.make({ children }));

/**
 * Creates a level-two heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h2`Install`
 * console.log(node._tag) // "h2"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h2 = makeInlineContentBuilder((children): H2 => H2.make({ children }));

/**
 * Creates a level-three heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h3`Config`
 * console.log(node._tag) // "h3"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h3 = makeInlineContentBuilder((children): H3 => H3.make({ children }));

/**
 * Creates a level-four heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h4`Details`
 * console.log(node._tag) // "h4"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h4 = makeInlineContentBuilder((children): H4 => H4.make({ children }));

/**
 * Creates a level-five heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h5`Notes`
 * console.log(node._tag) // "h5"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h5 = makeInlineContentBuilder((children): H5 => H5.make({ children }));

/**
 * Creates a level-six heading block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.h6`Footnote`
 * console.log(node._tag) // "h6"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const h6 = makeInlineContentBuilder((children): H6 => H6.make({ children }));

/**
 * Creates a paragraph block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.p`Hello ${Md.strong("world")}`
 * console.log(node._tag) // "p"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const p = makeInlineContentBuilder((children): PNode => PNode.make({ children }));

/**
 * Creates a list item block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.li`Item`
 * console.log(node._tag) // "li"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const li = makeInlineContentBuilder((children): Li => Li.make({ children }));

/**
 * Creates an unordered list block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.ul(["One", Md.li("Two")])
 * console.log(node._tag) // "ul"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const ul = (children: ReadonlyArray<ListItemInput>): Ul => Ul.make({ children: A.map(children, asListItem) });

/**
 * Creates an ordered list block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.ol(["One", "Two"])
 * console.log(node._tag) // "ol"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const ol = (children: ReadonlyArray<ListItemInput>): Ol => Ol.make({ children: A.map(children, asListItem) });

/**
 * Creates a GFM task list item.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.taskItem("Done", { checked: true })
 * console.log(node.checked) // true
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const taskItem = (children: InlineContent, options: { readonly checked?: boolean } = {}): TaskItem =>
  TaskItem.make({
    checked: O.getOrElse(O.fromUndefinedOr(options.checked), thunkFalse),
    children: asInlineArray(children),
  });

/**
 * Creates a GFM task list block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.taskList(["Todo", Md.taskItem("Done", { checked: true })])
 * console.log(node._tag) // "taskList"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const taskList = (children: ReadonlyArray<TaskListItemInput>): TaskList =>
  TaskList.make({ children: A.map(children, asTaskItem) });

/**
 * Creates a block quote container.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.blockquote`Hello ${Md.strong("world")}`
 * console.log(node._tag) // "blockquote"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const blockquote = makeBlockContentBuilder((children): BlockQuote => BlockQuote.make({ children }));

/**
 * Creates a fenced code block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.pre("console.log('beep')", { language: "ts" })
 * console.log(node._tag) // "pre"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const pre = (value: string, options: { readonly language?: string } = {}): Pre =>
  Pre.make({ value, language: O.fromUndefinedOr(options.language) });

/**
 * Creates a horizontal rule block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * console.log(Md.hr._tag) // "hr"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const hr: Hr = Hr.make({});

/**
 * Creates a Markdown document from block children.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const document = Md.make([Md.h1`Hello`, Md.p`World`])
 * console.log(document._tag) // "document"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const make = (children: ReadonlyArray<Block>): Document => Document.make({ children });

/**
 * Namespace-style public Markdown DSL.
 *
 * Simple text-oriented block builders such as {@link h1}, {@link h2}, and
 * {@link p} are intended to read naturally as tagged template literals while
 * keeping function-call overloads for dynamic strings and structured inline
 * children.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 * import { Result } from "effect"
 *
 * const document = Md.make([Md.h1`Hello`, Md.p`World`])
 * console.log(Result.getOrThrow(Md.render(document))) // "# Hello\n\nWorld"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const Md = {
  MarkdownAdapter,
  HtmlFragmentAdapter,
  a,
  blockquote,
  br,
  code,
  del,
  em,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  img,
  li,
  make,
  ol,
  p,
  pre,
  rawHtml,
  rawMarkdown,
  render,
  renderEffectWith,
  renderEffectWithUnsafe,
  renderHtml,
  renderHtmlUnsafe,
  renderUnsafe,
  renderWith,
  renderWithUnsafe,
  strong,
  taskItem,
  taskList,
  text,
  ul,
} as const;
