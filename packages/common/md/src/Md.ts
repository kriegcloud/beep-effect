/**
 * Public Markdown AST builder DSL.
 *
 * @module @beep/md/Md
 * @since 0.0.0
 */

import * as A_ from "effect/Array";
import * as O from "effect/Option";
import * as P_ from "effect/Predicate";
import * as S from "effect/Schema";
import {
  A,
  type Block,
  BlockQuote,
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
  P,
  Pre,
  RawHtml,
  RawMarkdown,
  Strong,
  TaskItem,
  TaskList,
  Text,
  Ul,
} from "./Md.model.ts";
import { HtmlFragmentAdapter, MarkdownAdapter, render, renderHtml, renderWith } from "./Md.render.ts";

type InlineInput = string | Inline;
type InlineContent = InlineInput | ReadonlyArray<InlineInput>;
type InlineContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<InlineInput>): Node;
  (children: InlineContent): Node;
};
type BlockInput = string | Block;
type BlockContent = BlockInput | ReadonlyArray<BlockInput>;
type BlockContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<InlineInput>): Node;
  (children: BlockContent): Node;
};
type ListItemInput = string | Inline | Li | ReadonlyArray<InlineInput>;
type TaskListItemInput =
  | string
  | TaskItem
  | {
      readonly text: string;
      readonly checked?: boolean;
    };

const isTemplateStringsArray = (input: unknown): input is TemplateStringsArray =>
  A_.isArray(input) && P_.hasProperty(input, "raw");

const isInlineInputArray = (input: InlineContent): input is ReadonlyArray<InlineInput> => A_.isArray(input);

const isBlockInputArray = (input: BlockContent): input is ReadonlyArray<BlockInput> => A_.isArray(input);

const isLi = S.is(Li);
const isTaskItem = S.is(TaskItem);

const asInline = (input: InlineInput): Inline => (P_.isString(input) ? text(input) : input);

const asInlineArray = (input: InlineContent): ReadonlyArray<Inline> =>
  isInlineInputArray(input) ? A_.map(input, asInline) : [asInline(input)];

const templateToInlineArray = (
  strings: TemplateStringsArray,
  values: ReadonlyArray<InlineInput>
): ReadonlyArray<Inline> => {
  const out: Array<Inline> = [];

  for (let index = 0; index < strings.length; index++) {
    const chunk = strings[index];
    if (chunk !== "") {
      out.push(text(chunk));
    }

    const value = values[index];
    if (value !== undefined) {
      out.push(asInline(value));
    }
  }

  return out;
};

const makeInlineContentBuilder = <Node>(
  makeNode: (children: ReadonlyArray<Inline>) => Node
): InlineContentBuilder<Node> => {
  function build(strings: TemplateStringsArray, ...values: ReadonlyArray<InlineInput>): Node;
  function build(children: InlineContent): Node;
  function build(input: TemplateStringsArray | InlineContent, ...values: ReadonlyArray<InlineInput>): Node {
    return isTemplateStringsArray(input)
      ? makeNode(templateToInlineArray(input, values))
      : makeNode(asInlineArray(input));
  }

  return build;
};

const asBlock = (input: BlockInput): Block => (P_.isString(input) ? p(input) : input);

const asBlockArray = (input: BlockContent): ReadonlyArray<Block> =>
  isBlockInputArray(input) ? A_.map(input, asBlock) : [asBlock(input)];

const makeBlockContentBuilder = <Node>(
  makeNode: (children: ReadonlyArray<Block>) => Node
): BlockContentBuilder<Node> => {
  function build(strings: TemplateStringsArray, ...values: ReadonlyArray<InlineInput>): Node;
  function build(children: BlockContent): Node;
  function build(input: TemplateStringsArray | BlockContent, ...values: ReadonlyArray<InlineInput>): Node {
    return isTemplateStringsArray(input)
      ? makeNode([p(templateToInlineArray(input, values))])
      : makeNode(asBlockArray(input));
  }

  return build;
};

const asListItem = (input: ListItemInput): Li => (isLi(input) ? input : li(input));

const asTaskItem = (input: TaskListItemInput): TaskItem => {
  if (isTaskItem(input)) {
    return input;
  }

  if (P_.isString(input)) {
    return taskItem(input);
  }

  return P_.isBoolean(input.checked) ? taskItem(input.text, { checked: input.checked }) : taskItem(input.text);
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
 * Creates trusted raw HTML inline content.
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
export const a = (href: string, children: InlineContent): A => A.make({ href, children: asInlineArray(children) });

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
 * const node = Md.h2("Install")
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
 * const node = Md.h3("Config")
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
 * const node = Md.h4("Details")
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
 * const node = Md.h5("Notes")
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
 * const node = Md.h6("Footnote")
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
export const p = makeInlineContentBuilder((children): P => P.make({ children }));

/**
 * Creates a list item block.
 *
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const node = Md.li("Item")
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
export const ul = (children: ReadonlyArray<ListItemInput>): Ul => Ul.make({ children: A_.map(children, asListItem) });

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
export const ol = (children: ReadonlyArray<ListItemInput>): Ol => Ol.make({ children: A_.map(children, asListItem) });

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
    checked: O.getOrElse(O.fromUndefinedOr(options.checked), () => false),
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
  TaskList.make({ children: A_.map(children, asTaskItem) });

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
 * const document = Md.make([Md.h1("Hello"), Md.p("World")])
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
 * @example
 * ```ts
 * import { Md } from "@beep/md"
 *
 * const document = Md.make([Md.h1("Hello"), Md.p("World")])
 * console.log(Md.render(document)) // "# Hello\n\nWorld"
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
  renderHtml,
  renderWith,
  strong,
  taskItem,
  taskList,
  text,
  ul,
} as const;
