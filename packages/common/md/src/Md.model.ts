/**
 * Schema-first Markdown document AST models.
 *
 * @module @beep/md/Md.model
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $MdId.create("Md.model");

const InlineChildren: S.$Array<S.suspend<S.Codec<Inline>>> = S.Array(S.suspend((): S.Codec<Inline> => Inline)).pipe(
  $I.annoteSchema("InlineChildren", {
    description: "Recursive inline children used by Markdown inline container nodes.",
  })
);
const BlockChildren: S.$Array<S.suspend<S.Codec<Block>>> = S.Array(S.suspend((): S.Codec<Block> => Block)).pipe(
  $I.annoteSchema("BlockChildren", {
    description: "Recursive block children used by Markdown block container nodes.",
  })
);

/**
 * Plain escaped inline text.
 *
 * @example
 * ```ts
 * import { Text } from "@beep/md/Md.model"
 *
 * const node = Text.make({ value: "Hello" })
 * console.log(node._tag) // "text"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Text = S.TaggedStruct("text", {
  value: S.String,
}).pipe(
  $I.annoteSchema("Text", {
    description: "Plain escaped inline text.",
  })
);

/**
 * Type for {@link Text}. {@inheritDoc Text}
 *
 * @example
 * ```ts
 * import type { Text } from "@beep/md/Md.model"
 *
 * const accept = (node: Text) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Text = typeof Text.Type;

/**
 * Trusted raw Markdown inline content.
 *
 * @example
 * ```ts
 * import { RawMarkdown } from "@beep/md/Md.model"
 *
 * const node = RawMarkdown.make({ value: "**trusted**" })
 * console.log(node._tag) // "rawMarkdown"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RawMarkdown = S.TaggedStruct("rawMarkdown", {
  value: S.String,
}).pipe(
  $I.annoteSchema("RawMarkdown", {
    description: "Trusted raw Markdown inline content.",
  })
);

/**
 * Type for {@link RawMarkdown}. {@inheritDoc RawMarkdown}
 *
 * @example
 * ```ts
 * import type { RawMarkdown } from "@beep/md/Md.model"
 *
 * const accept = (node: RawMarkdown) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RawMarkdown = typeof RawMarkdown.Type;

/**
 * Raw HTML inline content for adapters that opt into trusted HTML rendering.
 *
 * @example
 * ```ts
 * import { RawHtml } from "@beep/md/Md.model"
 *
 * const node = RawHtml.make({ value: "<span>trusted</span>" })
 * console.log(node._tag) // "rawHtml"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const RawHtml = S.TaggedStruct("rawHtml", {
  value: S.String,
}).pipe(
  $I.annoteSchema("RawHtml", {
    description: "Raw HTML inline content for adapters that opt into trusted HTML rendering.",
  })
);

/**
 * Type for {@link RawHtml}. {@inheritDoc RawHtml}
 *
 * @example
 * ```ts
 * import type { RawHtml } from "@beep/md/Md.model"
 *
 * const accept = (node: RawHtml) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type RawHtml = typeof RawHtml.Type;

/**
 * Strong inline content.
 *
 * @example
 * ```ts
 * import { Strong, Text } from "@beep/md/Md.model"
 *
 * const node = Strong.make({ children: [Text.make({ value: "important" })] })
 * console.log(node._tag) // "strong"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Strong: S.Codec<Strong> = S.TaggedStruct("strong", {
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("Strong", {
    description: "Strong inline content.",
  })
);

/**
 * Type for {@link Strong}. {@inheritDoc Strong}
 *
 * @example
 * ```ts
 * import type { Strong } from "@beep/md/Md.model"
 *
 * const accept = (node: Strong) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Strong = {
  readonly _tag: "strong";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Emphasized inline content.
 *
 * @example
 * ```ts
 * import { Em, Text } from "@beep/md/Md.model"
 *
 * const node = Em.make({ children: [Text.make({ value: "note" })] })
 * console.log(node._tag) // "em"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Em: S.Codec<Em> = S.TaggedStruct("em", {
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("Em", {
    description: "Emphasized inline content.",
  })
);

/**
 * Type for {@link Em}. {@inheritDoc Em}
 *
 * @example
 * ```ts
 * import type { Em } from "@beep/md/Md.model"
 *
 * const accept = (node: Em) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Em = {
  readonly _tag: "em";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Deleted inline content.
 *
 * @example
 * ```ts
 * import { Del, Text } from "@beep/md/Md.model"
 *
 * const node = Del.make({ children: [Text.make({ value: "removed" })] })
 * console.log(node._tag) // "del"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Del: S.Codec<Del> = S.TaggedStruct("del", {
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("Del", {
    description: "Deleted inline content.",
  })
);

/**
 * Type for {@link Del}. {@inheritDoc Del}
 *
 * @example
 * ```ts
 * import type { Del } from "@beep/md/Md.model"
 *
 * const accept = (node: Del) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Del = {
  readonly _tag: "del";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Inline code span.
 *
 * @example
 * ```ts
 * import { Code } from "@beep/md/Md.model"
 *
 * const node = Code.make({ value: "console.log()" })
 * console.log(node._tag) // "code"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Code = S.TaggedStruct("code", {
  value: S.String,
}).pipe(
  $I.annoteSchema("Code", {
    description: "Inline code span.",
  })
);

/**
 * Type for {@link Code}. {@inheritDoc Code}
 *
 * @example
 * ```ts
 * import type { Code } from "@beep/md/Md.model"
 *
 * const accept = (node: Code) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Code = typeof Code.Type;

/**
 * Inline hyperlink.
 *
 * @example
 * ```ts
 * import { A, Text } from "@beep/md/Md.model"
 *
 * const node = A.make({ href: "https://example.com", children: [Text.make({ value: "Example" })] })
 * console.log(node._tag) // "a"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const A: S.Codec<A> = S.TaggedStruct("a", {
  href: S.String,
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("A", {
    description: "Inline hyperlink.",
  })
);

/**
 * Type for {@link A}. {@inheritDoc A}
 *
 * @example
 * ```ts
 * import type { A } from "@beep/md/Md.model"
 *
 * const accept = (node: A) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type A = {
  readonly _tag: "a";
  readonly href: string;
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Inline image.
 *
 * @example
 * ```ts
 * import { Img } from "@beep/md/Md.model"
 *
 * const node = Img.make({ src: "/logo.png", alt: "Logo" })
 * console.log(node._tag) // "img"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Img = S.TaggedStruct("img", {
  src: S.String,
  alt: S.String,
}).pipe(
  $I.annoteSchema("Img", {
    description: "Inline image.",
  })
);

/**
 * Type for {@link Img}. {@inheritDoc Img}
 *
 * @example
 * ```ts
 * import type { Img } from "@beep/md/Md.model"
 *
 * const accept = (node: Img) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Img = typeof Img.Type;

/**
 * Inline line break.
 *
 * @example
 * ```ts
 * import { Br } from "@beep/md/Md.model"
 *
 * const node = Br.make({})
 * console.log(node._tag) // "br"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Br = S.TaggedStruct("br", {}).pipe(
  $I.annoteSchema("Br", {
    description: "Inline line break.",
  })
);

/**
 * Type for {@link Br}. {@inheritDoc Br}
 *
 * @example
 * ```ts
 * import type { Br } from "@beep/md/Md.model"
 *
 * const accept = (node: Br) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Br = typeof Br.Type;

/**
 * Discriminated union of inline Markdown AST nodes.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Inline, Text } from "@beep/md/Md.model"
 *
 * const decode = S.decodeUnknownSync(Inline)
 * const node = decode(Text.make({ value: "Hello" }))
 * console.log(node._tag) // "text"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Inline: S.Codec<Inline> = S.TaggedUnion({
  text: {
    value: S.String,
  },
  rawMarkdown: {
    value: S.String,
  },
  rawHtml: {
    value: S.String,
  },
  strong: {
    children: InlineChildren,
  },
  em: {
    children: InlineChildren,
  },
  del: {
    children: InlineChildren,
  },
  code: {
    value: S.String,
  },
  a: {
    href: S.String,
    children: InlineChildren,
  },
  img: {
    src: S.String,
    alt: S.String,
  },
  br: {},
}).pipe(
  $I.annoteSchema("Inline", {
    description: "Discriminated union of inline Markdown AST nodes.",
  })
);

/**
 * Type for {@link Inline}. {@inheritDoc Inline}
 *
 * @example
 * ```ts
 * import type { Inline } from "@beep/md/Md.model"
 *
 * const accept = (node: Inline) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Inline = Text | RawMarkdown | RawHtml | Strong | Em | Del | Code | A | Img | Br;

/**
 * Paragraph block.
 *
 * @example
 * ```ts
 * import { P, Text } from "@beep/md/Md.model"
 *
 * const node = P.make({ children: [Text.make({ value: "Hello" })] })
 * console.log(node._tag) // "p"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const P: S.Codec<P> = S.TaggedStruct("p", {
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("P", {
    description: "Paragraph block.",
  })
);

/**
 * Type for {@link P}. {@inheritDoc P}
 *
 * @example
 * ```ts
 * import type { P } from "@beep/md/Md.model"
 *
 * const accept = (node: P) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type P = {
  readonly _tag: "p";
  readonly children: ReadonlyArray<Inline>;
};

const makeHeadingSchema = <const Tag extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6">(tag: Tag) =>
  S.TaggedStruct(tag, {
    children: InlineChildren,
  }).pipe(
    $I.annoteSchema("HeadingSchema", {
      description: "Reusable heading block schema building block.",
    })
  );

/**
 * Level-one heading block.
 *
 * @example
 * ```ts
 * import { H1, Text } from "@beep/md/Md.model"
 *
 * const node = H1.make({ children: [Text.make({ value: "Title" })] })
 * console.log(node._tag) // "h1"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H1: S.Codec<H1> = makeHeadingSchema("h1").pipe(
  $I.annoteSchema("H1", {
    description: "Level-one heading block.",
  })
);

/**
 * Type for {@link H1}. {@inheritDoc H1}
 *
 * @example
 * ```ts
 * import type { H1 } from "@beep/md/Md.model"
 *
 * const accept = (node: H1) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H1 = {
  readonly _tag: "h1";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Level-two heading block.
 *
 * @example
 * ```ts
 * import { H2, Text } from "@beep/md/Md.model"
 *
 * const node = H2.make({ children: [Text.make({ value: "Install" })] })
 * console.log(node._tag) // "h2"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H2: S.Codec<H2> = makeHeadingSchema("h2").pipe(
  $I.annoteSchema("H2", {
    description: "Level-two heading block.",
  })
);

/**
 * Type for {@link H2}. {@inheritDoc H2}
 *
 * @example
 * ```ts
 * import type { H2 } from "@beep/md/Md.model"
 *
 * const accept = (node: H2) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H2 = {
  readonly _tag: "h2";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Level-three heading block.
 *
 * @example
 * ```ts
 * import { H3, Text } from "@beep/md/Md.model"
 *
 * const node = H3.make({ children: [Text.make({ value: "Config" })] })
 * console.log(node._tag) // "h3"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H3: S.Codec<H3> = makeHeadingSchema("h3").pipe(
  $I.annoteSchema("H3", {
    description: "Level-three heading block.",
  })
);

/**
 * Type for {@link H3}. {@inheritDoc H3}
 *
 * @example
 * ```ts
 * import type { H3 } from "@beep/md/Md.model"
 *
 * const accept = (node: H3) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H3 = {
  readonly _tag: "h3";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Level-four heading block.
 *
 * @example
 * ```ts
 * import { H4, Text } from "@beep/md/Md.model"
 *
 * const node = H4.make({ children: [Text.make({ value: "Details" })] })
 * console.log(node._tag) // "h4"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H4: S.Codec<H4> = makeHeadingSchema("h4").pipe(
  $I.annoteSchema("H4", {
    description: "Level-four heading block.",
  })
);

/**
 * Type for {@link H4}. {@inheritDoc H4}
 *
 * @example
 * ```ts
 * import type { H4 } from "@beep/md/Md.model"
 *
 * const accept = (node: H4) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H4 = {
  readonly _tag: "h4";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Level-five heading block.
 *
 * @example
 * ```ts
 * import { H5, Text } from "@beep/md/Md.model"
 *
 * const node = H5.make({ children: [Text.make({ value: "Notes" })] })
 * console.log(node._tag) // "h5"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H5: S.Codec<H5> = makeHeadingSchema("h5").pipe(
  $I.annoteSchema("H5", {
    description: "Level-five heading block.",
  })
);

/**
 * Type for {@link H5}. {@inheritDoc H5}
 *
 * @example
 * ```ts
 * import type { H5 } from "@beep/md/Md.model"
 *
 * const accept = (node: H5) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H5 = {
  readonly _tag: "h5";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * Level-six heading block.
 *
 * @example
 * ```ts
 * import { H6, Text } from "@beep/md/Md.model"
 *
 * const node = H6.make({ children: [Text.make({ value: "Footnote" })] })
 * console.log(node._tag) // "h6"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const H6: S.Codec<H6> = makeHeadingSchema("h6").pipe(
  $I.annoteSchema("H6", {
    description: "Level-six heading block.",
  })
);

/**
 * Type for {@link H6}. {@inheritDoc H6}
 *
 * @example
 * ```ts
 * import type { H6 } from "@beep/md/Md.model"
 *
 * const accept = (node: H6) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type H6 = {
  readonly _tag: "h6";
  readonly children: ReadonlyArray<Inline>;
};

/**
 * List item block.
 *
 * @example
 * ```ts
 * import { Li, Text } from "@beep/md/Md.model"
 *
 * const node = Li.make({ children: [Text.make({ value: "Item" })] })
 * console.log(node._tag) // "li"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Li: S.Codec<Li> = S.TaggedStruct("li", {
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("Li", {
    description: "List item block.",
  })
);

/**
 * Type for {@link Li}. {@inheritDoc Li}
 *
 * @example
 * ```ts
 * import type { Li } from "@beep/md/Md.model"
 *
 * const accept = (node: Li) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Li = {
  readonly _tag: "li";
  readonly children: ReadonlyArray<Inline>;
};

const ListItemChildren = S.Array(Li).pipe(
  $I.annoteSchema("ListItemChildren", {
    description: "List item children used by ordered and unordered list blocks.",
  })
);

/**
 * Unordered list block.
 *
 * @example
 * ```ts
 * import { Li, Text, Ul } from "@beep/md/Md.model"
 *
 * const node = Ul.make({ children: [Li.make({ children: [Text.make({ value: "Item" })] })] })
 * console.log(node._tag) // "ul"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Ul: S.Codec<Ul> = S.TaggedStruct("ul", {
  children: ListItemChildren,
}).pipe(
  $I.annoteSchema("Ul", {
    description: "Unordered list block.",
  })
);

/**
 * Type for {@link Ul}. {@inheritDoc Ul}
 *
 * @example
 * ```ts
 * import type { Ul } from "@beep/md/Md.model"
 *
 * const accept = (node: Ul) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Ul = {
  readonly _tag: "ul";
  readonly children: ReadonlyArray<Li>;
};

/**
 * Ordered list block.
 *
 * @example
 * ```ts
 * import { Li, Ol, Text } from "@beep/md/Md.model"
 *
 * const node = Ol.make({ children: [Li.make({ children: [Text.make({ value: "First" })] })] })
 * console.log(node._tag) // "ol"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Ol: S.Codec<Ol> = S.TaggedStruct("ol", {
  children: ListItemChildren,
}).pipe(
  $I.annoteSchema("Ol", {
    description: "Ordered list block.",
  })
);

/**
 * Type for {@link Ol}. {@inheritDoc Ol}
 *
 * @example
 * ```ts
 * import type { Ol } from "@beep/md/Md.model"
 *
 * const accept = (node: Ol) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Ol = {
  readonly _tag: "ol";
  readonly children: ReadonlyArray<Li>;
};

/**
 * GFM task list item.
 *
 * @example
 * ```ts
 * import { TaskItem, Text } from "@beep/md/Md.model"
 *
 * const node = TaskItem.make({ checked: true, children: [Text.make({ value: "Done" })] })
 * console.log(node._tag) // "taskItem"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TaskItem: S.Codec<TaskItem> = S.TaggedStruct("taskItem", {
  checked: S.Boolean,
  children: InlineChildren,
}).pipe(
  $I.annoteSchema("TaskItem", {
    description: "GFM task list item.",
  })
);

/**
 * Type for {@link TaskItem}. {@inheritDoc TaskItem}
 *
 * @example
 * ```ts
 * import type { TaskItem } from "@beep/md/Md.model"
 *
 * const accept = (node: TaskItem) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TaskItem = {
  readonly _tag: "taskItem";
  readonly checked: boolean;
  readonly children: ReadonlyArray<Inline>;
};

/**
 * GFM task list block.
 *
 * @example
 * ```ts
 * import { TaskItem, TaskList, Text } from "@beep/md/Md.model"
 *
 * const node = TaskList.make({ children: [TaskItem.make({ checked: false, children: [Text.make({ value: "Todo" })] })] })
 * console.log(node._tag) // "taskList"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const TaskList: S.Codec<TaskList> = S.TaggedStruct("taskList", {
  children: S.Array(TaskItem),
}).pipe(
  $I.annoteSchema("TaskList", {
    description: "GFM task list block.",
  })
);

/**
 * Type for {@link TaskList}. {@inheritDoc TaskList}
 *
 * @example
 * ```ts
 * import type { TaskList } from "@beep/md/Md.model"
 *
 * const accept = (node: TaskList) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type TaskList = {
  readonly _tag: "taskList";
  readonly children: ReadonlyArray<TaskItem>;
};

/**
 * Block quote container.
 *
 * @example
 * ```ts
 * import { BlockQuote, P, Text } from "@beep/md/Md.model"
 *
 * const node = BlockQuote.make({ children: [P.make({ children: [Text.make({ value: "Quote" })] })] })
 * console.log(node._tag) // "blockquote"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const BlockQuote: S.Codec<BlockQuote> = S.TaggedStruct("blockquote", {
  children: BlockChildren,
}).pipe(
  $I.annoteSchema("BlockQuote", {
    description: "Block quote container.",
  })
);

/**
 * Type for {@link BlockQuote}. {@inheritDoc BlockQuote}
 *
 * @example
 * ```ts
 * import type { BlockQuote } from "@beep/md/Md.model"
 *
 * const accept = (node: BlockQuote) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type BlockQuote = {
  readonly _tag: "blockquote";
  readonly children: ReadonlyArray<Block>;
};

/**
 * Fenced code block.
 *
 * @example
 * ```ts
 * import * as O from "effect/Option"
 * import { Pre } from "@beep/md/Md.model"
 *
 * const node = Pre.make({ language: O.some("ts"), value: "console.log('beep')" })
 * console.log(node._tag) // "pre"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Pre = S.TaggedStruct("pre", {
  value: S.String,
  language: S.Option(S.String),
}).pipe(
  $I.annoteSchema("Pre", {
    description: "Fenced code block.",
  })
);

/**
 * Type for {@link Pre}. {@inheritDoc Pre}
 *
 * @example
 * ```ts
 * import type { Pre } from "@beep/md/Md.model"
 *
 * const accept = (node: Pre) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Pre = typeof Pre.Type;

/**
 * Horizontal rule block.
 *
 * @example
 * ```ts
 * import { Hr } from "@beep/md/Md.model"
 *
 * const node = Hr.make({})
 * console.log(node._tag) // "hr"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Hr = S.TaggedStruct("hr", {}).pipe(
  $I.annoteSchema("Hr", {
    description: "Horizontal rule block.",
  })
);

/**
 * Type for {@link Hr}. {@inheritDoc Hr}
 *
 * @example
 * ```ts
 * import type { Hr } from "@beep/md/Md.model"
 *
 * const accept = (node: Hr) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Hr = typeof Hr.Type;

/**
 * Discriminated union of block Markdown AST nodes.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { Block, P, Text } from "@beep/md/Md.model"
 *
 * const decode = S.decodeUnknownSync(Block)
 * const node = decode(P.make({ children: [Text.make({ value: "Hello" })] }))
 * console.log(node._tag) // "p"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Block: S.Codec<Block> = S.TaggedUnion({
  h1: {
    children: InlineChildren,
  },
  h2: {
    children: InlineChildren,
  },
  h3: {
    children: InlineChildren,
  },
  h4: {
    children: InlineChildren,
  },
  h5: {
    children: InlineChildren,
  },
  h6: {
    children: InlineChildren,
  },
  p: {
    children: InlineChildren,
  },
  blockquote: {
    children: BlockChildren,
  },
  pre: {
    value: S.String,
    language: S.Option(S.String),
  },
  ul: {
    children: ListItemChildren,
  },
  ol: {
    children: ListItemChildren,
  },
  li: {
    children: InlineChildren,
  },
  taskList: {
    children: S.Array(TaskItem),
  },
  hr: {},
}).pipe(
  $I.annoteSchema("Block", {
    description: "Discriminated union of block Markdown AST nodes.",
  })
);

/**
 * Type for {@link Block}. {@inheritDoc Block}
 *
 * @example
 * ```ts
 * import type { Block } from "@beep/md/Md.model"
 *
 * const accept = (node: Block) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Block = H1 | H2 | H3 | H4 | H5 | H6 | P | BlockQuote | Pre | Ul | Ol | Li | TaskList | Hr;

/**
 * Root Markdown document AST.
 *
 * @example
 * ```ts
 * import { Document, P, Text } from "@beep/md/Md.model"
 *
 * const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
 * console.log(document._tag) // "document"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Document: S.Codec<Document> = S.TaggedStruct("document", {
  children: BlockChildren,
}).pipe(
  $I.annoteSchema("Document", {
    description: "Root Markdown document AST.",
  })
);

/**
 * Type for {@link Document}. {@inheritDoc Document}
 *
 * @example
 * ```ts
 * import type { Document } from "@beep/md/Md.model"
 *
 * const accept = (node: Document) => node
 * void accept
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type Document = {
  readonly _tag: "document";
  readonly children: ReadonlyArray<Block>;
};
