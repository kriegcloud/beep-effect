/**
 * Schema-first Markdown document AST models.
 *
 * @packageDocumentation \@beep/md/Md.model
 * @since 0.0.0
 */

import { $MdId } from "@beep/identity";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import type * as O from "effect/Option";

const $I = $MdId.create("Md.model");

const youtubeVideoIdPattern = /^[A-Za-z0-9_-]{11}$/u;

/**
 * Bare 11-character YouTube video id used by {@link YouTube} embeds.
 *
 * Constraining the id to the safe character class rejects malformed UTF-16
 * (e.g. lone surrogates) at the schema boundary, so downstream consumers that
 * percent-encode the id cannot be crashed by a `URIError`.
 *
 * @category models
 * @since 0.0.0
 */
export const YouTubeVideoId = S.String.check(
  S.isPattern(youtubeVideoIdPattern, {
    identifier: $I`YouTubeVideoIdPatternCheck`,
    title: "YouTube Video ID",
    description: "Checks that a YouTube embed references only the bare 11-character video id.",
    message: "YouTube video id must be the bare 11-character id, not a URL or arbitrary string.",
  })
).pipe(
  $I.annoteSchema("YouTubeVideoId", {
    description: "Bare 11-character YouTube video id accepted by Md YouTube embeds.",
  })
);

/**
 * Recursive inline child list used by inline containers and text-bearing block
 * nodes.
 *
 * @category models
 * @since 0.0.0
 */
export const InlineChildren = S.Array(S.suspend((): S.Codec<Inline.Type, Inline.Encoded> => Inline)).pipe(
  $I.annoteSchema("InlineChildren", {
    description: "Recursive inline children used by Markdown inline container nodes.",
  })
);

/**
 * Companion namespace for {@link InlineChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace InlineChildren {
  /**
   * @since 0.0.0
   */
  export type Type = ReadonlyArray<Inline.Type>;

  /**
   * @since 0.0.0
   */
  export type Encoded = ReadonlyArray<Inline.Encoded>;
}

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
export class Text extends S.TaggedClass<Text>($I`Text`)(
  "text",
  {
    value: S.String.annotateKey({
      description: "Escaped plain text payload.",
    }),
  },
  $I.annote("Text", {
    description: "Plain escaped inline text.",
  })
) {
  static readonly fromValue = (value: string): Text => Text.make({ value });
}

/**
 * Companion namespace for {@link Text}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Text {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "text";
    readonly value: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

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
export class RawMarkdown extends S.TaggedClass<RawMarkdown>($I`RawMarkdown`)(
  "rawMarkdown",
  {
    value: S.String.annotateKey({
      description: "Trusted Markdown source preserved without escaping.",
    }),
  },
  $I.annote("RawMarkdown", {
    description: "Trusted raw Markdown inline content.",
  })
) {
  static readonly fromValue = (value: string): RawMarkdown => RawMarkdown.make({ value });
}

/**
 * Companion namespace for {@link RawMarkdown}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace RawMarkdown {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "rawMarkdown";
    readonly value: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

/**
 * Raw HTML inline content for adapters that opt into trusted HTML rendering.
 *
 * The built-in HTML adapter escapes this value by default.
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
export class RawHtml extends S.TaggedClass<RawHtml>($I`RawHtml`)(
  "rawHtml",
  {
    value: S.String.annotateKey({
      description: "Trusted HTML source preserved for adapters that opt into raw HTML.",
    }),
  },
  $I.annote("RawHtml", {
    description:
      "Raw HTML inline content for adapters that opt into trusted HTML rendering. The built-in HTML adapter escapes this value by default.",
  })
) {
  static readonly fromValue = (value: string): RawHtml => RawHtml.make({ value });
}

/**
 * Companion namespace for {@link RawHtml}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace RawHtml {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "rawHtml";
    readonly value: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

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
export class Strong extends S.TaggedClass<Strong>($I`Strong`)(
  "strong",
  {
    children: InlineChildren.annotateKey({
      description: "Inline nodes rendered with strong emphasis.",
    }),
  },
  $I.annote("Strong", {
    description: "Strong inline content.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type): Strong => Strong.make({ children });
}

/**
 * Companion namespace for {@link Strong}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Strong {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "strong";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "strong";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class Em extends S.TaggedClass<Em>($I`Em`)(
  "em",
  {
    children: InlineChildren.annotateKey({
      description: "Inline nodes rendered with emphasis.",
    }),
  },
  $I.annote("Em", {
    description: "Emphasized inline content.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type): Em => Em.make({ children });
}

/**
 * Companion namespace for {@link Em}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Em {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "em";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "em";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class Del extends S.TaggedClass<Del>($I`Del`)(
  "del",
  {
    children: InlineChildren.annotateKey({
      description: "Inline nodes rendered as deleted content.",
    }),
  },
  $I.annote("Del", {
    description: "Deleted inline content.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type): Del => Del.make({ children });
}

/**
 * Companion namespace for {@link Del}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Del {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "del";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "del";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class Code extends S.TaggedClass<Code>($I`Code`)(
  "code",
  {
    value: S.String.annotateKey({
      description: "Code span text rendered between inline code delimiters.",
    }),
  },
  $I.annote("Code", {
    description: "Inline code span.",
  })
) {
  static readonly fromValue = (value: string): Code => Code.make({ value });
}

/**
 * Companion namespace for {@link Code}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Code {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "code";
    readonly value: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

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
export class A extends S.TaggedClass<A>($I`A`)(
  "a",
  {
    children: InlineChildren.annotateKey({
      description: "Inline nodes rendered as the link label.",
    }),
    href: S.String.annotateKey({
      description: "Markdown link destination or URL.",
    }),
  },
  $I.annote("A", {
    description: "Inline hyperlink.",
  })
) {
  static readonly fromProps: {
    (children: InlineChildren.Type, href: string): A;
    (href: string): (children: InlineChildren.Type) => A;
  } = dual(2, (children: InlineChildren.Type, href: string): A => A.make({ children, href }));
}

/**
 * Companion namespace for {@link A}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace A {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "a";
    readonly children: InlineChildren.Type;
    readonly href: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "a";
    readonly children: InlineChildren.Encoded;
    readonly href: string;
  }
}

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
export class Img extends S.TaggedClass<Img>($I`Img`)(
  "img",
  {
    alt: S.String.annotateKey({
      description: "Image alternate text.",
    }),
    src: S.String.annotateKey({
      description: "Image source URL or path.",
    }),
  },
  $I.annote("Img", {
    description: "Inline image.",
  })
) {
  static readonly fromProps: {
    (src: string, alt: string): Img;
    (alt: string): (src: string) => Img;
  } = dual(2, (src: string, alt: string): Img => Img.make({ src, alt }));
}

/**
 * Companion namespace for {@link Img}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Img {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "img";
    readonly alt: string;
    readonly src: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

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
export class Br extends S.TaggedClass<Br>($I`Br`)(
  "br",
  {},
  $I.annote("Br", {
    description: "Inline line break.",
  })
) {}

/**
 * Companion namespace for {@link Br}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Br {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "br";
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

/**
 * Discriminated union of inline Markdown AST nodes.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import * as S from "effect/Schema"
 * import { Inline, Text } from "@beep/md/Md.model"
 *
 * const decode = S.decodeUnknownResult(Inline)
 * const node = Result.getOrThrow(decode(Text.make({ value: "Hello" })))
 * console.log(node._tag) // "text"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Inline = S.Union([Text, RawMarkdown, RawHtml, Strong, Em, Del, Code, A, Img, Br]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Inline", {
    description: "Discriminated union of inline Markdown AST nodes.",
  })
);

/**
 * Runtime type for {@link Inline}.
 *
 * @category models
 * @since 0.0.0
 */
export type Inline = typeof Inline.Type;

/**
 * Companion namespace for {@link Inline}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Inline {
  /**
   * @since 0.0.0
   */
  export type Type =
    | Text.Type
    | RawMarkdown.Type
    | RawHtml.Type
    | Strong.Type
    | Em.Type
    | Del.Type
    | Code.Type
    | A.Type
    | Img.Type
    | Br.Type;

  /**
   * @since 0.0.0
   */
  export type Encoded =
    | Text.Encoded
    | RawMarkdown.Encoded
    | RawHtml.Encoded
    | Strong.Encoded
    | Em.Encoded
    | Del.Encoded
    | Code.Encoded
    | A.Encoded
    | Img.Encoded
    | Br.Encoded;
}

/**
 * Recursive block child list used by document and block quote containers.
 *
 * @category models
 * @since 0.0.0
 */
export const BlockChildren = S.Array(S.suspend((): S.Codec<Block.Type, Block.Encoded> => Block)).pipe(
  $I.annoteSchema("BlockChildren", {
    description: "Recursive block children used by Markdown block container nodes.",
  })
);

/**
 * Companion namespace for {@link BlockChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace BlockChildren {
  /**
   * @since 0.0.0
   */
  export type Type = ReadonlyArray<Block.Type>;

  /**
   * @since 0.0.0
   */
  export type Encoded = ReadonlyArray<Block.Encoded>;
}

/**
 * List item child content. Inline children render directly after the list marker;
 * block children preserve nested document structure such as paragraphs, code
 * blocks, and nested lists.
 *
 * @category models
 * @since 0.0.0
 */
export const ListItemChild = S.suspend(
  (): S.Codec<Inline.Type | Block.Type, Inline.Encoded | Block.Encoded> => S.Union([Inline, Block])
).pipe(
  $I.annoteSchema("ListItemChild", {
    description: "Inline or block Markdown AST node rendered inside a list item.",
  })
);

/**
 * Runtime type for {@link ListItemChild}.
 *
 * @category models
 * @since 0.0.0
 */
export type ListItemChild = typeof ListItemChild.Type;

/**
 * Companion namespace for {@link ListItemChild}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ListItemChild {
  /**
   * @since 0.0.0
   */
  export type Type = Inline.Type | Block.Type;

  /**
   * @since 0.0.0
   */
  export type Encoded = Inline.Encoded | Block.Encoded;
}

/**
 * List item children used by ordered, unordered, and task list items.
 *
 * @category models
 * @since 0.0.0
 */
export const ListItemChildren = S.Array(ListItemChild).pipe(
  $I.annoteSchema("ListItemChildren", {
    description: "Inline and block children rendered inside a Markdown list item.",
  })
);

/**
 * Companion namespace for {@link ListItemChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ListItemChildren {
  /**
   * @since 0.0.0
   */
  export type Type = ReadonlyArray<ListItemChild.Type>;

  /**
   * @since 0.0.0
   */
  export type Encoded = ReadonlyArray<ListItemChild.Encoded>;
}

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
export class P extends S.TaggedClass<P>($I`P`)(
  "p",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as paragraph content.",
    }),
  },
  $I.annote("P", {
    description: "Paragraph block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => P.make({ children });
}

/**
 * Companion namespace for {@link P}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace P {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "p";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "p";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H1 extends S.TaggedClass<H1>($I`H1`)(
  "h1",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-one heading content.",
    }),
  },
  $I.annote("H1", {
    description: "Level-one heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H1.make({ children });
}

/**
 * Companion namespace for {@link H1}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H1 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h1";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h1";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H2 extends S.TaggedClass<H2>($I`H2`)(
  "h2",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-two heading content.",
    }),
  },
  $I.annote("H2", {
    description: "Level-two heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H2.make({ children });
}

/**
 * Companion namespace for {@link H2}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H2 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h2";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h2";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H3 extends S.TaggedClass<H3>($I`H3`)(
  "h3",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-three heading content.",
    }),
  },
  $I.annote("H3", {
    description: "Level-three heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H3.make({ children });
}

/**
 * Companion namespace for {@link H3}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H3 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h3";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h3";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H4 extends S.TaggedClass<H4>($I`H4`)(
  "h4",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-four heading content.",
    }),
  },
  $I.annote("H4", {
    description: "Level-four heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H4.make({ children });
}

/**
 * Companion namespace for {@link H4}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H4 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h4";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h4";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H5 extends S.TaggedClass<H5>($I`H5`)(
  "h5",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-five heading content.",
    }),
  },
  $I.annote("H5", {
    description: "Level-five heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H5.make({ children });
}

/**
 * Companion namespace for {@link H5}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H5 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h5";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h5";
    readonly children: InlineChildren.Encoded;
  }
}

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
export class H6 extends S.TaggedClass<H6>($I`H6`)(
  "h6",
  {
    children: InlineChildren.annotateKey({
      description: "Inline children rendered as level-six heading content.",
    }),
  },
  $I.annote("H6", {
    description: "Level-six heading block.",
  })
) {
  static readonly fromChildren = (children: InlineChildren.Type) => H6.make({ children });
}

/**
 * Companion namespace for {@link H6}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace H6 {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "h6";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "h6";
    readonly children: InlineChildren.Encoded;
  }
}

/**
 * List item node used by ordered, unordered, and task lists.
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
export class Li extends S.TaggedClass<Li>($I`Li`)(
  "li",
  {
    children: ListItemChildren.annotateKey({
      description: "Inline and block children rendered inside the list item.",
    }),
  },
  $I.annote("Li", {
    description: "List item node used by ordered, unordered, and task lists.",
  })
) {
  static readonly fromChildren = (children: ListItemChildren.Type) => Li.make({ children });
}

/**
 * Companion namespace for {@link Li}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Li {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "li";
    readonly children: ListItemChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "li";
    readonly children: ListItemChildren.Encoded;
  }
}

/**
 * List children used by ordered and unordered list blocks.
 *
 * @category models
 * @since 0.0.0
 */
export const ListChildren = S.Array(Li).pipe(
  $I.annoteSchema("ListChildren", {
    description: "List item nodes used by ordered and unordered list blocks.",
  })
);

/**
 * Companion namespace for {@link ListChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace ListChildren {
  /**
   * @since 0.0.0
   */
  export type Type = ReadonlyArray<Li.Type>;

  /**
   * @since 0.0.0
   */
  export type Encoded = ReadonlyArray<Li.Encoded>;
}

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
export class Ul extends S.TaggedClass<Ul>($I`Ul`)(
  "ul",
  {
    children: ListChildren.annotateKey({
      description: "List items rendered as an unordered list.",
    }),
  },
  $I.annote("Ul", {
    description: "Unordered list block.",
  })
) {
  static readonly fromChildren = (children: ListChildren.Type) => Ul.make({ children });
}

/**
 * Companion namespace for {@link Ul}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Ul {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "ul";
    readonly children: ListChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "ul";
    readonly children: ListChildren.Encoded;
  }
}

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
export class Ol extends S.TaggedClass<Ol>($I`Ol`)(
  "ol",
  {
    children: ListChildren.annotateKey({
      description: "List items rendered as an ordered list.",
    }),
  },
  $I.annote("Ol", {
    description: "Ordered list block.",
  })
) {
  static readonly fromChildren = (children: ListChildren.Type) => Ol.make({ children });
}

/**
 * Companion namespace for {@link Ol}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Ol {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "ol";
    readonly children: ListChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "ol";
    readonly children: ListChildren.Encoded;
  }
}

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
export class TaskItem extends S.TaggedClass<TaskItem>($I`TaskItem`)(
  "taskItem",
  {
    checked: S.Boolean.annotateKey({
      description: "Whether the task list item is checked.",
    }),
    children: ListItemChildren.annotateKey({
      description: "Inline and block children rendered as the task item label.",
    }),
  },
  $I.annote("TaskItem", {
    description: "GFM task list item.",
  })
) {}

/**
 * Companion namespace for {@link TaskItem}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TaskItem {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "taskItem";
    readonly checked: boolean;
    readonly children: ListItemChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "taskItem";
    readonly checked: boolean;
    readonly children: ListItemChildren.Encoded;
  }
}

/**
 * Task item children used by GFM task list blocks.
 *
 * @category models
 * @since 0.0.0
 */
export const TaskItemChildren = S.Array(TaskItem).pipe(
  $I.annoteSchema("TaskItemChildren", {
    description: "Task item children used by GFM task list blocks.",
  })
);

/**
 * Companion namespace for {@link TaskItemChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TaskItemChildren {
  /**
   * @since 0.0.0
   */
  export type Type = ReadonlyArray<TaskItem.Type>;

  /**
   * @since 0.0.0
   */
  export type Encoded = ReadonlyArray<TaskItem.Encoded>;
}

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
export class TaskList extends S.TaggedClass<TaskList>($I`TaskList`)(
  "taskList",
  {
    children: TaskItemChildren.annotateKey({
      description: "Task items rendered as a GitHub Flavored Markdown task list.",
    }),
  },
  $I.annote("TaskList", {
    description: "GFM task list block.",
  })
) {}

/**
 * Companion namespace for {@link TaskList}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TaskList {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "taskList";
    readonly children: TaskItemChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "taskList";
    readonly children: TaskItemChildren.Encoded;
  }
}

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
export class BlockQuote extends S.TaggedClass<BlockQuote>($I`BlockQuote`)(
  "blockquote",
  {
    children: BlockChildren.annotateKey({
      description: "Block children rendered inside the block quote.",
    }),
  },
  $I.annote("BlockQuote", {
    description: "Block quote container.",
  })
) {}

/**
 * Companion namespace for {@link BlockQuote}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace BlockQuote {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "blockquote";
    readonly children: BlockChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "blockquote";
    readonly children: BlockChildren.Encoded;
  }
}

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
export class Pre extends S.TaggedClass<Pre>($I`Pre`)(
  "pre",
  {
    // Encoded form must survive a JSON boundary (jsonb columns, rpc/ndjson
    // wire): S.Option(S.String) encodes to a real Option instance that does not
    // round-trip through JSON, so persisted/transported documents fail to
    // decode. OptionFromNullOr keeps the Type as Option<string> while encoding
    // to JSON-safe `string | null`.
    language: S.OptionFromNullOr(S.String).annotateKey({
      description: "Optional language hint for fenced code rendering.",
    }),
    value: S.String.annotateKey({
      description: "Literal code block contents.",
    }),
  },
  $I.annote("Pre", {
    description: "Fenced code block.",
  })
) {}

/**
 * Companion namespace for {@link Pre}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Pre {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "pre";
    readonly language: O.Option<string>;
    readonly value: string;
  }

  /**
   * The encoded form keeps `language` JSON-safe (`string | null`) so a Pre
   * survives a JSON boundary (jsonb columns, rpc/ndjson wire); see the
   * `OptionFromNullOr` codec on {@link Pre}.
   *
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "pre";
    readonly language: string | null;
    readonly value: string;
  }
}

/**
 * Table cell containing inline Markdown content.
 *
 * @example
 * ```ts
 * import { TableCell, Text } from "@beep/md/Md.model"
 *
 * const node = TableCell.make({ children: [Text.make({ value: "Name" })] })
 * console.log(node._tag) // "tableCell"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TableCell extends S.TaggedClass<TableCell>($I`TableCell`)(
  "tableCell",
  {
    children: InlineChildren.annotateKey({
      description: "Inline nodes rendered inside this table cell.",
    }),
  },
  $I.annote("TableCell", {
    description: "Table cell containing inline Markdown content.",
  })
) {}

/**
 * Companion namespace for {@link TableCell}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TableCell {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "tableCell";
    readonly children: InlineChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "tableCell";
    readonly children: InlineChildren.Encoded;
  }
}

/**
 * Table row containing cells in column order.
 *
 * @example
 * ```ts
 * import { TableCell, TableRow, Text } from "@beep/md/Md.model"
 *
 * const node = TableRow.make({ children: [TableCell.make({ children: [Text.make({ value: "Name" })] })] })
 * console.log(node._tag) // "tableRow"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class TableRow extends S.TaggedClass<TableRow>($I`TableRow`)(
  "tableRow",
  {
    children: S.Array(TableCell).annotateKey({
      description: "Table cells in column order.",
    }),
  },
  $I.annote("TableRow", {
    description: "Table row containing cells in column order.",
  })
) {}

/**
 * Companion namespace for {@link TableRow}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace TableRow {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "tableRow";
    readonly children: ReadonlyArray<TableCell.Type>;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "tableRow";
    readonly children: ReadonlyArray<TableCell.Encoded>;
  }
}

/**
 * Markdown table block.
 *
 * @example
 * ```ts
 * import { Table, TableCell, TableRow, Text } from "@beep/md/Md.model"
 *
 * const node = Table.make({
 *   headerRow: true,
 *   children: [TableRow.make({ children: [TableCell.make({ children: [Text.make({ value: "Name" })] })] })]
 * })
 * console.log(node._tag) // "table"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class Table extends S.TaggedClass<Table>($I`Table`)(
  "table",
  {
    headerRow: S.Boolean.annotateKey({
      description: "Whether the first row renders as a table header.",
    }),
    children: S.Array(TableRow).annotateKey({
      description: "Table rows in display order.",
    }),
  },
  $I.annote("Table", {
    description: "Markdown table block with inline cell content.",
  })
) {}

/**
 * Companion namespace for {@link Table}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Table {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "table";
    readonly children: ReadonlyArray<TableRow.Type>;
    readonly headerRow: boolean;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "table";
    readonly children: ReadonlyArray<TableRow.Encoded>;
    readonly headerRow: boolean;
  }
}

/**
 * YouTube video embed block.
 *
 * @example
 * ```ts
 * import { YouTube } from "@beep/md/Md.model"
 *
 * const node = YouTube.make({ videoId: "dQw4w9WgXcQ" })
 * console.log(node._tag) // "youtube"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class YouTube extends S.TaggedClass<YouTube>($I`YouTube`)(
  "youtube",
  {
    videoId: YouTubeVideoId.annotateKey({
      description: "Bare YouTube video id rendered as an embedded video.",
    }),
  },
  $I.annote("YouTube", {
    description: "YouTube video embed block.",
  })
) {}

/**
 * Companion namespace for {@link YouTube}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace YouTube {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "youtube";
    readonly videoId: string;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

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
export class Hr extends S.TaggedClass<Hr>($I`Hr`)(
  "hr",
  {},
  $I.annote("Hr", {
    description: "Horizontal rule block.",
  })
) {}

/**
 * Companion namespace for {@link Hr}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Hr {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "hr";
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded extends Type {}
}

/**
 * Discriminated union of block Markdown AST nodes.
 *
 * @example
 * ```ts
 * import { Result } from "effect"
 * import * as S from "effect/Schema"
 * import { Block, P, Text } from "@beep/md/Md.model"
 *
 * const decode = S.decodeUnknownResult(Block)
 * const node = Result.getOrThrow(decode(P.make({ children: [Text.make({ value: "Hello" })] })))
 * console.log(node._tag) // "p"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const Block = S.Union([H1, H2, H3, H4, H5, H6, P, BlockQuote, Pre, Ul, Ol, TaskList, Table, YouTube, Hr]).pipe(
  S.toTaggedUnion("_tag"),
  $I.annoteSchema("Block", {
    description: "Discriminated union of block Markdown AST nodes.",
  })
);

/**
 * Runtime type for {@link Block}.
 *
 * @category models
 * @since 0.0.0
 */
export type Block = typeof Block.Type;

/**
 * Companion namespace for {@link Block}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Block {
  /**
   * @since 0.0.0
   */
  export type Type =
    | H1.Type
    | H2.Type
    | H3.Type
    | H4.Type
    | H5.Type
    | H6.Type
    | P.Type
    | BlockQuote.Type
    | Pre.Type
    | Ul.Type
    | Ol.Type
    | TaskList.Type
    | Table.Type
    | YouTube.Type
    | Hr.Type;

  /**
   * @since 0.0.0
   */
  export type Encoded =
    | H1.Encoded
    | H2.Encoded
    | H3.Encoded
    | H4.Encoded
    | H5.Encoded
    | H6.Encoded
    | P.Encoded
    | BlockQuote.Encoded
    | Pre.Encoded
    | Ul.Encoded
    | Ol.Encoded
    | TaskList.Encoded
    | Table.Encoded
    | YouTube.Encoded
    | Hr.Encoded;
}

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
export class Document extends S.TaggedClass<Document>($I`Document`)(
  "document",
  {
    children: BlockChildren.annotateKey({
      description: "Top-level block children in document order.",
    }),
  },
  $I.annote("Document", {
    description: "Root Markdown document AST.",
  })
) {}

/**
 * Companion namespace for {@link Document}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Document {
  /**
   * @since 0.0.0
   */
  export interface Type {
    readonly _tag: "document";
    readonly children: BlockChildren.Type;
  }

  /**
   * @since 0.0.0
   */
  export interface Encoded {
    readonly _tag: "document";
    readonly children: BlockChildren.Encoded;
  }
}
