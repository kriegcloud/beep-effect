/**
 * GENERATED FILE — do not edit by hand. Run `bun run generate`.
 *
 * Exhaustive, schema-first AST of the WHATWG HTML specification (conforming +
 * obsolete elements). Each element is an `S.TaggedClass` whose `_tag` is its tag
 * name; all are combined into the {@link HtmlNode} discriminated union via
 * `S.toTaggedUnion("_tag")`. Generated from the vendored datasets in `data/`
 * (see `data/SOURCES.md`); attribute field bodies/types are emitted by effect's
 * `SchemaRepresentation.toCodeDocument`.
 *
 * @packageDocumentation \@beep/html/Html.model
 * @since 0.0.0
 */
import { $HtmlId } from "@beep/identity";
import { LiteralKit, OptionalStr } from "@beep/schema";
import * as S from "effect/Schema";
import { GlobalAttributes } from "./Html.attributes.ts";
import { Comment, Doctype, Text } from "./Html.nodes.ts";
import type { GlobalAttributesEncoded, GlobalAttributesType } from "./Html.attributes.ts";

const $I = $HtmlId.create("Html.model");

/** Union members carrying a literal `_tag` (the shape `toTaggedUnion` requires). */
type Tagged = S.Top & { readonly Type: { readonly _tag: PropertyKey } };

/**
 * Build a `_tag`-discriminated union at runtime via `S.toTaggedUnion`, typed
 * explicitly. `toTaggedUnion`'s type-level discriminant map does not scale to the
 * ~150 HTML node kinds (TS2589), so members are erased to a `ReadonlyArray` and
 * the result is cast to its declared codec type — the runtime is the real tagged
 * union.
 *
 * @category models
 * @since 0.0.0
 */
const taggedUnion = <A, E>(id: string, description: string, members: ReadonlyArray<S.Top>): S.Codec<A, E> =>
  S.Union(members as ReadonlyArray<Tagged>).pipe(
    S.toTaggedUnion("_tag"),
    $I.annoteSchema(id, { description })
  ) as unknown as S.Codec<A, E>;

/**
 * Recursive list of HTML AST child nodes (any {@link HtmlNode}).
 *
 * @category models
 * @since 0.0.0
 */
export const HtmlChildren = S.Array(S.suspend((): S.Codec<HtmlNode.Type, HtmlNode.Encoded> => HtmlNode)).pipe(
  $I.annoteSchema("HtmlChildren", { description: "Recursive list of HTML AST child nodes." })
);
/**
 * Companion namespace for {@link HtmlChildren}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace HtmlChildren {
  /** @since 0.0.0 */
  export type Type = ReadonlyArray<HtmlNode.Type>;
  /** @since 0.0.0 */
  export type Encoded = ReadonlyArray<HtmlNode.Encoded>;
}

/**
 * A document fragment node (a detached group of children).
 *
 * @category models
 * @since 0.0.0
 */
export class Fragment extends S.TaggedClass<Fragment>($I`Fragment`)(
  "#fragment",
  { children: HtmlChildren },
  $I.annote("Fragment", { description: "A document fragment node (a detached group of children)." })
) {}
/**
 * Companion namespace for {@link Fragment}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Fragment {
  /** @since 0.0.0 */
  export type Type = { readonly _tag: "#fragment"; readonly children: HtmlChildren.Type };
  /** @since 0.0.0 */
  export type Encoded = { readonly _tag: "#fragment"; readonly children: HtmlChildren.Encoded };
}

/**
 * A document root node.
 *
 * @category models
 * @since 0.0.0
 */
export class Document extends S.TaggedClass<Document>($I`Document`)(
  "#document",
  { children: HtmlChildren },
  $I.annote("Document", { description: "A document root node." })
) {}
/**
 * Companion namespace for {@link Document}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace Document {
  /** @since 0.0.0 */
  export type Type = { readonly _tag: "#document"; readonly children: HtmlChildren.Type };
  /** @since 0.0.0 */
  export type Encoded = { readonly _tag: "#document"; readonly children: HtmlChildren.Encoded };
}

/**
 * The <a> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class A extends S.TaggedClass<A>($I`A`)(
  "a",
  {
    ...GlobalAttributes,
    charset: OptionalStr,
    coords: OptionalStr,
    download: OptionalStr,
    href: OptionalStr,
    hreflang: OptionalStr,
    methods: OptionalStr,
    name: OptionalStr,
    ping: OptionalStr,
    referrerpolicy: OptionalStr,
    rel: S.optionalKey(
      LiteralKit([
        "alternate",
        "author",
        "bookmark",
        "external",
        "help",
        "license",
        "nofollow",
        "noopener",
        "noreferrer",
        "opener",
        "privacy-policy",
        "search",
        "tag",
        "terms-of-service",
        "next",
        "prev",
      ])
    ),
    rev: OptionalStr,
    shape: OptionalStr,
    target: OptionalStr,
    type: OptionalStr,
    urn: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("A", { description: "The <a> element." })
) {}
/**
 * Companion namespace for {@link A}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace A {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "a";
    readonly charset?: string;
    readonly coords?: string;
    readonly download?: string;
    readonly href?: string;
    readonly hreflang?: string;
    readonly methods?: string;
    readonly name?: string;
    readonly ping?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "bookmark"
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "privacy-policy"
      | "search"
      | "tag"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly rev?: string;
    readonly shape?: string;
    readonly target?: string;
    readonly type?: string;
    readonly urn?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "a";
    readonly charset?: string;
    readonly coords?: string;
    readonly download?: string;
    readonly href?: string;
    readonly hreflang?: string;
    readonly methods?: string;
    readonly name?: string;
    readonly ping?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "bookmark"
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "privacy-policy"
      | "search"
      | "tag"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly rev?: string;
    readonly shape?: string;
    readonly target?: string;
    readonly type?: string;
    readonly urn?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <abbr> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Abbr extends S.TaggedClass<Abbr>($I`Abbr`)(
  "abbr",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Abbr", { description: "The <abbr> element." })
) {}
/**
 * Companion namespace for {@link Abbr}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Abbr {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "abbr";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "abbr";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <acronym> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Acronym extends S.TaggedClass<Acronym>($I`Acronym`)(
  "acronym",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Acronym", { description: "The <acronym> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Acronym}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Acronym {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "acronym";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "acronym";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <address> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Address extends S.TaggedClass<Address>($I`Address`)(
  "address",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Address", { description: "The <address> element." })
) {}
/**
 * Companion namespace for {@link Address}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Address {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "address";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "address";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <applet> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Applet extends S.TaggedClass<Applet>($I`Applet`)(
  "applet",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Applet", { description: "The <applet> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Applet}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Applet {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "applet";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "applet";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <area> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Area extends S.TaggedClass<Area>($I`Area`)(
  "area",
  {
    ...GlobalAttributes,
    alt: OptionalStr,
    coords: OptionalStr,
    download: OptionalStr,
    href: OptionalStr,
    hreflang: OptionalStr,
    nohref: OptionalStr,
    ping: OptionalStr,
    referrerpolicy: OptionalStr,
    rel: S.optionalKey(
      LiteralKit([
        "alternate",
        "author",
        "bookmark",
        "external",
        "help",
        "license",
        "nofollow",
        "noopener",
        "noreferrer",
        "opener",
        "privacy-policy",
        "search",
        "tag",
        "terms-of-service",
        "next",
        "prev",
      ])
    ),
    shape: S.optionalKey(LiteralKit(["circle state", "default state", "polygon state", "rectangle state"])),
    target: OptionalStr,
    type: OptionalStr,
  },
  $I.annote("Area", { description: "The <area> element." })
) {}
/**
 * Companion namespace for {@link Area}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Area {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "area";
    readonly alt?: string;
    readonly coords?: string;
    readonly download?: string;
    readonly href?: string;
    readonly hreflang?: string;
    readonly nohref?: string;
    readonly ping?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "bookmark"
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "privacy-policy"
      | "search"
      | "tag"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly shape?: "circle state" | "default state" | "polygon state" | "rectangle state";
    readonly target?: string;
    readonly type?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "area";
    readonly alt?: string;
    readonly coords?: string;
    readonly download?: string;
    readonly href?: string;
    readonly hreflang?: string;
    readonly nohref?: string;
    readonly ping?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "bookmark"
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "privacy-policy"
      | "search"
      | "tag"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly shape?: "circle state" | "default state" | "polygon state" | "rectangle state";
    readonly target?: string;
    readonly type?: string;
  };
}

/**
 * The <article> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Article extends S.TaggedClass<Article>($I`Article`)(
  "article",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Article", { description: "The <article> element." })
) {}
/**
 * Companion namespace for {@link Article}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Article {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "article";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "article";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <aside> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Aside extends S.TaggedClass<Aside>($I`Aside`)(
  "aside",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Aside", { description: "The <aside> element." })
) {}
/**
 * Companion namespace for {@link Aside}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Aside {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "aside";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "aside";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <audio> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Audio extends S.TaggedClass<Audio>($I`Audio`)(
  "audio",
  {
    ...GlobalAttributes,
    autoplay: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    controls: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    crossorigin: S.optionalKey(LiteralKit(["anonymous", "use-credentials"])),
    loading: S.optionalKey(LiteralKit(["lazy", "eager"])),
    loop: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    muted: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    preload: S.optionalKey(LiteralKit(["auto", "none", "metadata"])),
    src: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Audio", { description: "The <audio> element." })
) {}
/**
 * Companion namespace for {@link Audio}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Audio {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "audio";
    readonly autoplay?: boolean | "";
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly loading?: "lazy" | "eager";
    readonly loop?: boolean | "";
    readonly muted?: boolean | "";
    readonly preload?: "auto" | "none" | "metadata";
    readonly src?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "audio";
    readonly autoplay?: boolean | "";
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly loading?: "lazy" | "eager";
    readonly loop?: boolean | "";
    readonly muted?: boolean | "";
    readonly preload?: "auto" | "none" | "metadata";
    readonly src?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <b> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class B extends S.TaggedClass<B>($I`B`)(
  "b",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("B", { description: "The <b> element." })
) {}
/**
 * Companion namespace for {@link B}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace B {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "b";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "b";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <base> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Base extends S.TaggedClass<Base>($I`Base`)(
  "base",
  {
    ...GlobalAttributes,
    href: OptionalStr,
    target: OptionalStr,
  },
  $I.annote("Base", { description: "The <base> element." })
) {}
/**
 * Companion namespace for {@link Base}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Base {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "base";
    readonly href?: string;
    readonly target?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "base";
    readonly href?: string;
    readonly target?: string;
  };
}

/**
 * The <basefont> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Basefont extends S.TaggedClass<Basefont>($I`Basefont`)(
  "basefont",
  {
    ...GlobalAttributes,
  },
  $I.annote("Basefont", { description: "The <basefont> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Basefont}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Basefont {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "basefont";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "basefont";
  };
}

/**
 * The <bdi> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Bdi extends S.TaggedClass<Bdi>($I`Bdi`)(
  "bdi",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Bdi", { description: "The <bdi> element." })
) {}
/**
 * Companion namespace for {@link Bdi}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Bdi {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "bdi";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "bdi";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <bdo> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Bdo extends S.TaggedClass<Bdo>($I`Bdo`)(
  "bdo",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Bdo", { description: "The <bdo> element." })
) {}
/**
 * Companion namespace for {@link Bdo}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Bdo {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "bdo";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "bdo";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <bgsound> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Bgsound extends S.TaggedClass<Bgsound>($I`Bgsound`)(
  "bgsound",
  {
    ...GlobalAttributes,
  },
  $I.annote("Bgsound", { description: "The <bgsound> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Bgsound}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Bgsound {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "bgsound";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "bgsound";
  };
}

/**
 * The <big> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Big extends S.TaggedClass<Big>($I`Big`)(
  "big",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Big", { description: "The <big> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Big}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Big {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "big";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "big";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <blink> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Blink extends S.TaggedClass<Blink>($I`Blink`)(
  "blink",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Blink", { description: "The <blink> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Blink}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Blink {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "blink";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "blink";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <blockquote> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Blockquote extends S.TaggedClass<Blockquote>($I`Blockquote`)(
  "blockquote",
  {
    ...GlobalAttributes,
    cite: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Blockquote", { description: "The <blockquote> element." })
) {}
/**
 * Companion namespace for {@link Blockquote}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Blockquote {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "blockquote";
    readonly cite?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "blockquote";
    readonly cite?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <body> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Body extends S.TaggedClass<Body>($I`Body`)(
  "body",
  {
    ...GlobalAttributes,
    alink: OptionalStr,
    bgcolor: OptionalStr,
    bottommargin: OptionalStr,
    leftmargin: OptionalStr,
    link: OptionalStr,
    marginheight: OptionalStr,
    marginwidth: OptionalStr,
    rightmargin: OptionalStr,
    text: OptionalStr,
    topmargin: OptionalStr,
    vlink: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Body", { description: "The <body> element." })
) {}
/**
 * Companion namespace for {@link Body}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Body {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "body";
    readonly alink?: string;
    readonly bgcolor?: string;
    readonly bottommargin?: string;
    readonly leftmargin?: string;
    readonly link?: string;
    readonly marginheight?: string;
    readonly marginwidth?: string;
    readonly rightmargin?: string;
    readonly text?: string;
    readonly topmargin?: string;
    readonly vlink?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "body";
    readonly alink?: string;
    readonly bgcolor?: string;
    readonly bottommargin?: string;
    readonly leftmargin?: string;
    readonly link?: string;
    readonly marginheight?: string;
    readonly marginwidth?: string;
    readonly rightmargin?: string;
    readonly text?: string;
    readonly topmargin?: string;
    readonly vlink?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <br> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Br extends S.TaggedClass<Br>($I`Br`)(
  "br",
  {
    ...GlobalAttributes,
    clear: OptionalStr,
  },
  $I.annote("Br", { description: "The <br> element." })
) {}
/**
 * Companion namespace for {@link Br}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Br {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "br";
    readonly clear?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "br";
    readonly clear?: string;
  };
}

/**
 * The <button> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Button extends S.TaggedClass<Button>($I`Button`)(
  "button",
  {
    ...GlobalAttributes,
    action: OptionalStr,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    command: OptionalStr,
    commandfor: OptionalStr,
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    enctype: S.optionalKey(LiteralKit(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"])),
    form: OptionalStr,
    formaction: OptionalStr,
    formenctype: OptionalStr,
    formmethod: S.optionalKey(LiteralKit(["get", "post", "dialog"])),
    formnovalidate: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    formtarget: OptionalStr,
    method: OptionalStr,
    name: OptionalStr,
    novalidate: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    target: OptionalStr,
    type: S.optionalKey(LiteralKit(["submit", "reset", "button"])),
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Button", { description: "The <button> element." })
) {}
/**
 * Companion namespace for {@link Button}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Button {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "button";
    readonly action?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly command?: string;
    readonly commandfor?: string;
    readonly disabled?: boolean | "";
    readonly enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
    readonly form?: string;
    readonly formaction?: string;
    readonly formenctype?: string;
    readonly formmethod?: "get" | "post" | "dialog";
    readonly formnovalidate?: boolean | "";
    readonly formtarget?: string;
    readonly method?: string;
    readonly name?: string;
    readonly novalidate?: boolean | "";
    readonly target?: string;
    readonly type?: "submit" | "reset" | "button";
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "button";
    readonly action?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly command?: string;
    readonly commandfor?: string;
    readonly disabled?: boolean | "";
    readonly enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
    readonly form?: string;
    readonly formaction?: string;
    readonly formenctype?: string;
    readonly formmethod?: "get" | "post" | "dialog";
    readonly formnovalidate?: boolean | "";
    readonly formtarget?: string;
    readonly method?: string;
    readonly name?: string;
    readonly novalidate?: boolean | "";
    readonly target?: string;
    readonly type?: "submit" | "reset" | "button";
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <canvas> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Canvas extends S.TaggedClass<Canvas>($I`Canvas`)(
  "canvas",
  {
    ...GlobalAttributes,
    height: S.optionalKey(S.Int),
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Canvas", { description: "The <canvas> element." })
) {}
/**
 * Companion namespace for {@link Canvas}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Canvas {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "canvas";
    readonly height?: number;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "canvas";
    readonly height?: number;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <caption> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Caption extends S.TaggedClass<Caption>($I`Caption`)(
  "caption",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Caption", { description: "The <caption> element." })
) {}
/**
 * Companion namespace for {@link Caption}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Caption {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "caption";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "caption";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <center> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Center extends S.TaggedClass<Center>($I`Center`)(
  "center",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Center", { description: "The <center> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Center}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Center {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "center";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "center";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <cite> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Cite extends S.TaggedClass<Cite>($I`Cite`)(
  "cite",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Cite", { description: "The <cite> element." })
) {}
/**
 * Companion namespace for {@link Cite}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Cite {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "cite";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "cite";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <code> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Code extends S.TaggedClass<Code>($I`Code`)(
  "code",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Code", { description: "The <code> element." })
) {}
/**
 * Companion namespace for {@link Code}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Code {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "code";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "code";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <col> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Col extends S.TaggedClass<Col>($I`Col`)(
  "col",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    char: OptionalStr,
    charoff: OptionalStr,
    span: S.optionalKey(S.Int),
    valign: OptionalStr,
    width: S.optionalKey(S.Int),
  },
  $I.annote("Col", { description: "The <col> element." })
) {}
/**
 * Companion namespace for {@link Col}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Col {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "col";
    readonly align?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly span?: number;
    readonly valign?: string;
    readonly width?: number;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "col";
    readonly align?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly span?: number;
    readonly valign?: string;
    readonly width?: number;
  };
}

/**
 * The <colgroup> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Colgroup extends S.TaggedClass<Colgroup>($I`Colgroup`)(
  "colgroup",
  {
    ...GlobalAttributes,
    span: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Colgroup", { description: "The <colgroup> element." })
) {}
/**
 * Companion namespace for {@link Colgroup}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Colgroup {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "colgroup";
    readonly span?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "colgroup";
    readonly span?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <data> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Data extends S.TaggedClass<Data>($I`Data`)(
  "data",
  {
    ...GlobalAttributes,
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Data", { description: "The <data> element." })
) {}
/**
 * Companion namespace for {@link Data}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Data {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "data";
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "data";
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <datalist> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Datalist extends S.TaggedClass<Datalist>($I`Datalist`)(
  "datalist",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Datalist", { description: "The <datalist> element." })
) {}
/**
 * Companion namespace for {@link Datalist}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Datalist {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "datalist";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "datalist";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dd> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Dd extends S.TaggedClass<Dd>($I`Dd`)(
  "dd",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Dd", { description: "The <dd> element." })
) {}
/**
 * Companion namespace for {@link Dd}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Dd {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dd";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dd";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <del> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Del extends S.TaggedClass<Del>($I`Del`)(
  "del",
  {
    ...GlobalAttributes,
    cite: OptionalStr,
    datetime: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Del", { description: "The <del> element." })
) {}
/**
 * Companion namespace for {@link Del}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Del {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "del";
    readonly cite?: string;
    readonly datetime?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "del";
    readonly cite?: string;
    readonly datetime?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <details> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Details extends S.TaggedClass<Details>($I`Details`)(
  "details",
  {
    ...GlobalAttributes,
    name: OptionalStr,
    open: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    children: HtmlChildren,
  },
  $I.annote("Details", { description: "The <details> element." })
) {}
/**
 * Companion namespace for {@link Details}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Details {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "details";
    readonly name?: string;
    readonly open?: boolean | "";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "details";
    readonly name?: string;
    readonly open?: boolean | "";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dfn> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Dfn extends S.TaggedClass<Dfn>($I`Dfn`)(
  "dfn",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Dfn", { description: "The <dfn> element." })
) {}
/**
 * Companion namespace for {@link Dfn}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Dfn {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dfn";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dfn";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dialog> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Dialog extends S.TaggedClass<Dialog>($I`Dialog`)(
  "dialog",
  {
    ...GlobalAttributes,
    closedby: S.optionalKey(LiteralKit(["any", "closerequest", "none"])),
    open: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    children: HtmlChildren,
  },
  $I.annote("Dialog", { description: "The <dialog> element." })
) {}
/**
 * Companion namespace for {@link Dialog}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Dialog {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dialog";
    readonly closedby?: "any" | "closerequest" | "none";
    readonly open?: boolean | "";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dialog";
    readonly closedby?: "any" | "closerequest" | "none";
    readonly open?: boolean | "";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dir> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class DirElement extends S.TaggedClass<DirElement>($I`DirElement`)(
  "dir",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("DirElement", { description: "The <dir> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link DirElement}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace DirElement {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dir";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dir";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <div> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Div extends S.TaggedClass<Div>($I`Div`)(
  "div",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Div", { description: "The <div> element." })
) {}
/**
 * Companion namespace for {@link Div}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Div {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "div";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "div";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dl> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Dl extends S.TaggedClass<Dl>($I`Dl`)(
  "dl",
  {
    ...GlobalAttributes,
    compact: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    children: HtmlChildren,
  },
  $I.annote("Dl", { description: "The <dl> element." })
) {}
/**
 * Companion namespace for {@link Dl}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Dl {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dl";
    readonly compact?: boolean | "";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dl";
    readonly compact?: boolean | "";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <dt> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Dt extends S.TaggedClass<Dt>($I`Dt`)(
  "dt",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Dt", { description: "The <dt> element." })
) {}
/**
 * Companion namespace for {@link Dt}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Dt {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "dt";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "dt";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <em> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Em extends S.TaggedClass<Em>($I`Em`)(
  "em",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Em", { description: "The <em> element." })
) {}
/**
 * Companion namespace for {@link Em}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Em {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "em";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "em";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <embed> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Embed extends S.TaggedClass<Embed>($I`Embed`)(
  "embed",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    height: S.optionalKey(S.Int),
    hspace: OptionalStr,
    name: OptionalStr,
    src: OptionalStr,
    type: OptionalStr,
    vspace: OptionalStr,
    width: S.optionalKey(S.Int),
  },
  $I.annote("Embed", { description: "The <embed> element." })
) {}
/**
 * Companion namespace for {@link Embed}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Embed {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "embed";
    readonly align?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly name?: string;
    readonly src?: string;
    readonly type?: string;
    readonly vspace?: string;
    readonly width?: number;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "embed";
    readonly align?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly name?: string;
    readonly src?: string;
    readonly type?: string;
    readonly vspace?: string;
    readonly width?: number;
  };
}

/**
 * The <fieldset> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Fieldset extends S.TaggedClass<Fieldset>($I`Fieldset`)(
  "fieldset",
  {
    ...GlobalAttributes,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    form: OptionalStr,
    name: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Fieldset", { description: "The <fieldset> element." })
) {}
/**
 * Companion namespace for {@link Fieldset}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Fieldset {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "fieldset";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly name?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "fieldset";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly name?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <figcaption> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Figcaption extends S.TaggedClass<Figcaption>($I`Figcaption`)(
  "figcaption",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Figcaption", { description: "The <figcaption> element." })
) {}
/**
 * Companion namespace for {@link Figcaption}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Figcaption {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "figcaption";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "figcaption";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <figure> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Figure extends S.TaggedClass<Figure>($I`Figure`)(
  "figure",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Figure", { description: "The <figure> element." })
) {}
/**
 * Companion namespace for {@link Figure}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Figure {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "figure";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "figure";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <font> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Font extends S.TaggedClass<Font>($I`Font`)(
  "font",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Font", { description: "The <font> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Font}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Font {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "font";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "font";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <footer> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Footer extends S.TaggedClass<Footer>($I`Footer`)(
  "footer",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Footer", { description: "The <footer> element." })
) {}
/**
 * Companion namespace for {@link Footer}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Footer {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "footer";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "footer";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <form> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Form extends S.TaggedClass<Form>($I`Form`)(
  "form",
  {
    ...GlobalAttributes,
    accept: OptionalStr,
    "accept-charset": OptionalStr,
    action: OptionalStr,
    autocomplete: S.optionalKey(LiteralKit(["on", "off"])),
    enctype: S.optionalKey(LiteralKit(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"])),
    formaction: OptionalStr,
    formenctype: OptionalStr,
    formmethod: OptionalStr,
    formnovalidate: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    formtarget: OptionalStr,
    method: S.optionalKey(LiteralKit(["get", "post", "dialog"])),
    name: OptionalStr,
    novalidate: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    rel: S.optionalKey(
      LiteralKit([
        "external",
        "help",
        "license",
        "nofollow",
        "noopener",
        "noreferrer",
        "opener",
        "search",
        "next",
        "prev",
      ])
    ),
    target: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Form", { description: "The <form> element." })
) {}
/**
 * Companion namespace for {@link Form}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Form {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "form";
    readonly accept?: string;
    readonly "accept-charset"?: string;
    readonly action?: string;
    readonly autocomplete?: "on" | "off";
    readonly enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
    readonly formaction?: string;
    readonly formenctype?: string;
    readonly formmethod?: string;
    readonly formnovalidate?: boolean | "";
    readonly formtarget?: string;
    readonly method?: "get" | "post" | "dialog";
    readonly name?: string;
    readonly novalidate?: boolean | "";
    readonly rel?:
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "search"
      | "next"
      | "prev";
    readonly target?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "form";
    readonly accept?: string;
    readonly "accept-charset"?: string;
    readonly action?: string;
    readonly autocomplete?: "on" | "off";
    readonly enctype?: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain";
    readonly formaction?: string;
    readonly formenctype?: string;
    readonly formmethod?: string;
    readonly formnovalidate?: boolean | "";
    readonly formtarget?: string;
    readonly method?: "get" | "post" | "dialog";
    readonly name?: string;
    readonly novalidate?: boolean | "";
    readonly rel?:
      | "external"
      | "help"
      | "license"
      | "nofollow"
      | "noopener"
      | "noreferrer"
      | "opener"
      | "search"
      | "next"
      | "prev";
    readonly target?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <frame> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Frame extends S.TaggedClass<Frame>($I`Frame`)(
  "frame",
  {
    ...GlobalAttributes,
  },
  $I.annote("Frame", { description: "The <frame> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Frame}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Frame {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "frame";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "frame";
  };
}

/**
 * The <frameset> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Frameset extends S.TaggedClass<Frameset>($I`Frameset`)(
  "frameset",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Frameset", { description: "The <frameset> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Frameset}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Frameset {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "frameset";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "frameset";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h1> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H1 extends S.TaggedClass<H1>($I`H1`)(
  "h1",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H1", { description: "The <h1> element." })
) {}
/**
 * Companion namespace for {@link H1}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H1 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h1";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h1";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h2> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H2 extends S.TaggedClass<H2>($I`H2`)(
  "h2",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H2", { description: "The <h2> element." })
) {}
/**
 * Companion namespace for {@link H2}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H2 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h2";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h2";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h3> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H3 extends S.TaggedClass<H3>($I`H3`)(
  "h3",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H3", { description: "The <h3> element." })
) {}
/**
 * Companion namespace for {@link H3}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H3 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h3";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h3";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h4> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H4 extends S.TaggedClass<H4>($I`H4`)(
  "h4",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H4", { description: "The <h4> element." })
) {}
/**
 * Companion namespace for {@link H4}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H4 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h4";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h4";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h5> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H5 extends S.TaggedClass<H5>($I`H5`)(
  "h5",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H5", { description: "The <h5> element." })
) {}
/**
 * Companion namespace for {@link H5}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H5 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h5";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h5";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <h6> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class H6 extends S.TaggedClass<H6>($I`H6`)(
  "h6",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("H6", { description: "The <h6> element." })
) {}
/**
 * Companion namespace for {@link H6}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace H6 {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "h6";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "h6";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <head> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Head extends S.TaggedClass<Head>($I`Head`)(
  "head",
  {
    ...GlobalAttributes,
    profile: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Head", { description: "The <head> element." })
) {}
/**
 * Companion namespace for {@link Head}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Head {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "head";
    readonly profile?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "head";
    readonly profile?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <header> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Header extends S.TaggedClass<Header>($I`Header`)(
  "header",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Header", { description: "The <header> element." })
) {}
/**
 * Companion namespace for {@link Header}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Header {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "header";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "header";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <hgroup> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Hgroup extends S.TaggedClass<Hgroup>($I`Hgroup`)(
  "hgroup",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Hgroup", { description: "The <hgroup> element." })
) {}
/**
 * Companion namespace for {@link Hgroup}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Hgroup {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "hgroup";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "hgroup";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <hr> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Hr extends S.TaggedClass<Hr>($I`Hr`)(
  "hr",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    color: OptionalStr,
    noshade: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    size: S.optionalKey(S.Int),
    width: S.optionalKey(S.Int),
  },
  $I.annote("Hr", { description: "The <hr> element." })
) {}
/**
 * Companion namespace for {@link Hr}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Hr {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "hr";
    readonly align?: string;
    readonly color?: string;
    readonly noshade?: boolean | "";
    readonly size?: number;
    readonly width?: number;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "hr";
    readonly align?: string;
    readonly color?: string;
    readonly noshade?: boolean | "";
    readonly size?: number;
    readonly width?: number;
  };
}

/**
 * The <html> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Html extends S.TaggedClass<Html>($I`Html`)(
  "html",
  {
    ...GlobalAttributes,
    manifest: OptionalStr,
    version: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Html", { description: "The <html> element." })
) {}
/**
 * Companion namespace for {@link Html}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Html {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "html";
    readonly manifest?: string;
    readonly version?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "html";
    readonly manifest?: string;
    readonly version?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <i> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class I extends S.TaggedClass<I>($I`I`)(
  "i",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("I", { description: "The <i> element." })
) {}
/**
 * Companion namespace for {@link I}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace I {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "i";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "i";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <iframe> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Iframe extends S.TaggedClass<Iframe>($I`Iframe`)(
  "iframe",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    allow: OptionalStr,
    allowfullscreen: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    allowtransparency: OptionalStr,
    frameborder: OptionalStr,
    framespacing: OptionalStr,
    height: S.optionalKey(S.Int),
    hspace: OptionalStr,
    loading: S.optionalKey(LiteralKit(["lazy", "eager"])),
    longdesc: OptionalStr,
    marginheight: OptionalStr,
    marginwidth: OptionalStr,
    name: OptionalStr,
    referrerpolicy: OptionalStr,
    sandbox: S.optionalKey(
      LiteralKit([
        "allow-popups",
        "allow-top-navigation",
        "allow-top-navigation-by-user-activation",
        "allow-same-origin",
        "allow-forms",
        "allow-pointer-lock",
        "allow-scripts",
        "allow-popups-to-escape-sandbox",
        "allow-modals",
        "allow-orientation-lock",
        "allow-presentation",
        "allow-downloads",
        "allow-top-navigation-to-custom-protocols",
      ])
    ),
    scrolling: OptionalStr,
    src: OptionalStr,
    srcdoc: OptionalStr,
    vspace: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Iframe", { description: "The <iframe> element." })
) {}
/**
 * Companion namespace for {@link Iframe}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Iframe {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "iframe";
    readonly align?: string;
    readonly allow?: string;
    readonly allowfullscreen?: boolean | "";
    readonly allowtransparency?: string;
    readonly frameborder?: string;
    readonly framespacing?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly loading?: "lazy" | "eager";
    readonly longdesc?: string;
    readonly marginheight?: string;
    readonly marginwidth?: string;
    readonly name?: string;
    readonly referrerpolicy?: string;
    readonly sandbox?:
      | "allow-popups"
      | "allow-top-navigation"
      | "allow-top-navigation-by-user-activation"
      | "allow-same-origin"
      | "allow-forms"
      | "allow-pointer-lock"
      | "allow-scripts"
      | "allow-popups-to-escape-sandbox"
      | "allow-modals"
      | "allow-orientation-lock"
      | "allow-presentation"
      | "allow-downloads"
      | "allow-top-navigation-to-custom-protocols";
    readonly scrolling?: string;
    readonly src?: string;
    readonly srcdoc?: string;
    readonly vspace?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "iframe";
    readonly align?: string;
    readonly allow?: string;
    readonly allowfullscreen?: boolean | "";
    readonly allowtransparency?: string;
    readonly frameborder?: string;
    readonly framespacing?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly loading?: "lazy" | "eager";
    readonly longdesc?: string;
    readonly marginheight?: string;
    readonly marginwidth?: string;
    readonly name?: string;
    readonly referrerpolicy?: string;
    readonly sandbox?:
      | "allow-popups"
      | "allow-top-navigation"
      | "allow-top-navigation-by-user-activation"
      | "allow-same-origin"
      | "allow-forms"
      | "allow-pointer-lock"
      | "allow-scripts"
      | "allow-popups-to-escape-sandbox"
      | "allow-modals"
      | "allow-orientation-lock"
      | "allow-presentation"
      | "allow-downloads"
      | "allow-top-navigation-to-custom-protocols";
    readonly scrolling?: string;
    readonly src?: string;
    readonly srcdoc?: string;
    readonly vspace?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <img> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Img extends S.TaggedClass<Img>($I`Img`)(
  "img",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    alt: OptionalStr,
    border: OptionalStr,
    controls: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    crossorigin: S.optionalKey(LiteralKit(["anonymous", "use-credentials"])),
    decoding: S.optionalKey(LiteralKit(["sync", "async", "auto"])),
    fetchpriority: S.optionalKey(LiteralKit(["high", "low", "auto"])),
    height: S.optionalKey(S.Int),
    hspace: OptionalStr,
    ismap: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    loading: S.optionalKey(LiteralKit(["lazy", "eager"])),
    longdesc: OptionalStr,
    lowsrc: OptionalStr,
    name: OptionalStr,
    referrerpolicy: OptionalStr,
    sizes: OptionalStr,
    src: OptionalStr,
    srcset: OptionalStr,
    usemap: OptionalStr,
    vspace: OptionalStr,
    width: S.optionalKey(S.Int),
  },
  $I.annote("Img", { description: "The <img> element." })
) {}
/**
 * Companion namespace for {@link Img}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Img {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "img";
    readonly align?: string;
    readonly alt?: string;
    readonly border?: string;
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly decoding?: "sync" | "async" | "auto";
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly height?: number;
    readonly hspace?: string;
    readonly ismap?: boolean | "";
    readonly loading?: "lazy" | "eager";
    readonly longdesc?: string;
    readonly lowsrc?: string;
    readonly name?: string;
    readonly referrerpolicy?: string;
    readonly sizes?: string;
    readonly src?: string;
    readonly srcset?: string;
    readonly usemap?: string;
    readonly vspace?: string;
    readonly width?: number;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "img";
    readonly align?: string;
    readonly alt?: string;
    readonly border?: string;
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly decoding?: "sync" | "async" | "auto";
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly height?: number;
    readonly hspace?: string;
    readonly ismap?: boolean | "";
    readonly loading?: "lazy" | "eager";
    readonly longdesc?: string;
    readonly lowsrc?: string;
    readonly name?: string;
    readonly referrerpolicy?: string;
    readonly sizes?: string;
    readonly src?: string;
    readonly srcset?: string;
    readonly usemap?: string;
    readonly vspace?: string;
    readonly width?: number;
  };
}

/**
 * The <input> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Input extends S.TaggedClass<Input>($I`Input`)(
  "input",
  {
    ...GlobalAttributes,
    accept: OptionalStr,
    align: OptionalStr,
    alpha: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    alt: OptionalStr,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    border: OptionalStr,
    checked: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    colorspace: S.optionalKey(LiteralKit(["limited-srgb", "display-p3"])),
    dirname: OptionalStr,
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    form: OptionalStr,
    hspace: OptionalStr,
    ismap: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    list: OptionalStr,
    max: OptionalStr,
    maxlength: S.optionalKey(S.Int),
    min: OptionalStr,
    minlength: S.optionalKey(S.Int),
    multiple: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    name: OptionalStr,
    pattern: OptionalStr,
    placeholder: OptionalStr,
    readonly: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    required: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    size: S.optionalKey(S.Int),
    src: OptionalStr,
    step: OptionalStr,
    type: S.optionalKey(
      LiteralKit([
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button",
      ])
    ),
    usemap: OptionalStr,
    value: OptionalStr,
    vspace: OptionalStr,
  },
  $I.annote("Input", { description: "The <input> element." })
) {}
/**
 * Companion namespace for {@link Input}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Input {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "input";
    readonly accept?: string;
    readonly align?: string;
    readonly alpha?: boolean | "";
    readonly alt?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly border?: string;
    readonly checked?: boolean | "";
    readonly colorspace?: "limited-srgb" | "display-p3";
    readonly dirname?: string;
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly hspace?: string;
    readonly ismap?: boolean | "";
    readonly list?: string;
    readonly max?: string;
    readonly maxlength?: number;
    readonly min?: string;
    readonly minlength?: number;
    readonly multiple?: boolean | "";
    readonly name?: string;
    readonly pattern?: string;
    readonly placeholder?: string;
    readonly readonly?: boolean | "";
    readonly required?: boolean | "";
    readonly size?: number;
    readonly src?: string;
    readonly step?: string;
    readonly type?:
      | "hidden"
      | "text"
      | "search"
      | "tel"
      | "url"
      | "email"
      | "password"
      | "date"
      | "month"
      | "week"
      | "time"
      | "datetime-local"
      | "number"
      | "range"
      | "color"
      | "checkbox"
      | "radio"
      | "file"
      | "submit"
      | "image"
      | "reset"
      | "button";
    readonly usemap?: string;
    readonly value?: string;
    readonly vspace?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "input";
    readonly accept?: string;
    readonly align?: string;
    readonly alpha?: boolean | "";
    readonly alt?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly border?: string;
    readonly checked?: boolean | "";
    readonly colorspace?: "limited-srgb" | "display-p3";
    readonly dirname?: string;
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly hspace?: string;
    readonly ismap?: boolean | "";
    readonly list?: string;
    readonly max?: string;
    readonly maxlength?: number;
    readonly min?: string;
    readonly minlength?: number;
    readonly multiple?: boolean | "";
    readonly name?: string;
    readonly pattern?: string;
    readonly placeholder?: string;
    readonly readonly?: boolean | "";
    readonly required?: boolean | "";
    readonly size?: number;
    readonly src?: string;
    readonly step?: string;
    readonly type?:
      | "hidden"
      | "text"
      | "search"
      | "tel"
      | "url"
      | "email"
      | "password"
      | "date"
      | "month"
      | "week"
      | "time"
      | "datetime-local"
      | "number"
      | "range"
      | "color"
      | "checkbox"
      | "radio"
      | "file"
      | "submit"
      | "image"
      | "reset"
      | "button";
    readonly usemap?: string;
    readonly value?: string;
    readonly vspace?: string;
  };
}

/**
 * The <ins> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Ins extends S.TaggedClass<Ins>($I`Ins`)(
  "ins",
  {
    ...GlobalAttributes,
    cite: OptionalStr,
    datetime: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Ins", { description: "The <ins> element." })
) {}
/**
 * Companion namespace for {@link Ins}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Ins {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "ins";
    readonly cite?: string;
    readonly datetime?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "ins";
    readonly cite?: string;
    readonly datetime?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <isindex> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Isindex extends S.TaggedClass<Isindex>($I`Isindex`)(
  "isindex",
  {
    ...GlobalAttributes,
  },
  $I.annote("Isindex", { description: "The <isindex> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Isindex}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Isindex {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "isindex";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "isindex";
  };
}

/**
 * The <kbd> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Kbd extends S.TaggedClass<Kbd>($I`Kbd`)(
  "kbd",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Kbd", { description: "The <kbd> element." })
) {}
/**
 * Companion namespace for {@link Kbd}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Kbd {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "kbd";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "kbd";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <keygen> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Keygen extends S.TaggedClass<Keygen>($I`Keygen`)(
  "keygen",
  {
    ...GlobalAttributes,
  },
  $I.annote("Keygen", { description: "The <keygen> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Keygen}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Keygen {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "keygen";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "keygen";
  };
}

/**
 * The <label> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Label extends S.TaggedClass<Label>($I`Label`)(
  "label",
  {
    ...GlobalAttributes,
    for: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Label", { description: "The <label> element." })
) {}
/**
 * Companion namespace for {@link Label}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Label {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "label";
    readonly for?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "label";
    readonly for?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <legend> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Legend extends S.TaggedClass<Legend>($I`Legend`)(
  "legend",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Legend", { description: "The <legend> element." })
) {}
/**
 * Companion namespace for {@link Legend}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Legend {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "legend";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "legend";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <li> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Li extends S.TaggedClass<Li>($I`Li`)(
  "li",
  {
    ...GlobalAttributes,
    type: OptionalStr,
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Li", { description: "The <li> element." })
) {}
/**
 * Companion namespace for {@link Li}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Li {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "li";
    readonly type?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "li";
    readonly type?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <link> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Link extends S.TaggedClass<Link>($I`Link`)(
  "link",
  {
    ...GlobalAttributes,
    as: OptionalStr,
    blocking: OptionalStr,
    charset: OptionalStr,
    color: OptionalStr,
    crossorigin: S.optionalKey(LiteralKit(["anonymous", "use-credentials"])),
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    fetchpriority: S.optionalKey(LiteralKit(["high", "low", "auto"])),
    href: OptionalStr,
    hreflang: OptionalStr,
    imagesizes: OptionalStr,
    imagesrcset: OptionalStr,
    integrity: OptionalStr,
    media: OptionalStr,
    methods: OptionalStr,
    referrerpolicy: OptionalStr,
    rel: S.optionalKey(
      LiteralKit([
        "alternate",
        "author",
        "canonical",
        "dns-prefetch",
        "expect",
        "help",
        "icon",
        "license",
        "manifest",
        "modulepreload",
        "pingback",
        "preconnect",
        "prefetch",
        "preload",
        "privacy-policy",
        "search",
        "stylesheet",
        "terms-of-service",
        "next",
        "prev",
      ])
    ),
    rev: OptionalStr,
    sizes: OptionalStr,
    target: OptionalStr,
    type: OptionalStr,
    urn: OptionalStr,
  },
  $I.annote("Link", { description: "The <link> element." })
) {}
/**
 * Companion namespace for {@link Link}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Link {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "link";
    readonly as?: string;
    readonly blocking?: string;
    readonly charset?: string;
    readonly color?: string;
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly disabled?: boolean | "";
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly href?: string;
    readonly hreflang?: string;
    readonly imagesizes?: string;
    readonly imagesrcset?: string;
    readonly integrity?: string;
    readonly media?: string;
    readonly methods?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "canonical"
      | "dns-prefetch"
      | "expect"
      | "help"
      | "icon"
      | "license"
      | "manifest"
      | "modulepreload"
      | "pingback"
      | "preconnect"
      | "prefetch"
      | "preload"
      | "privacy-policy"
      | "search"
      | "stylesheet"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly rev?: string;
    readonly sizes?: string;
    readonly target?: string;
    readonly type?: string;
    readonly urn?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "link";
    readonly as?: string;
    readonly blocking?: string;
    readonly charset?: string;
    readonly color?: string;
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly disabled?: boolean | "";
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly href?: string;
    readonly hreflang?: string;
    readonly imagesizes?: string;
    readonly imagesrcset?: string;
    readonly integrity?: string;
    readonly media?: string;
    readonly methods?: string;
    readonly referrerpolicy?: string;
    readonly rel?:
      | "alternate"
      | "author"
      | "canonical"
      | "dns-prefetch"
      | "expect"
      | "help"
      | "icon"
      | "license"
      | "manifest"
      | "modulepreload"
      | "pingback"
      | "preconnect"
      | "prefetch"
      | "preload"
      | "privacy-policy"
      | "search"
      | "stylesheet"
      | "terms-of-service"
      | "next"
      | "prev";
    readonly rev?: string;
    readonly sizes?: string;
    readonly target?: string;
    readonly type?: string;
    readonly urn?: string;
  };
}

/**
 * The <listing> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Listing extends S.TaggedClass<Listing>($I`Listing`)(
  "listing",
  {
    ...GlobalAttributes,
    content: S.String,
  },
  $I.annote("Listing", { description: "The <listing> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Listing}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Listing {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "listing";
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "listing";
    readonly content: string;
  };
}

/**
 * The <main> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Main extends S.TaggedClass<Main>($I`Main`)(
  "main",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Main", { description: "The <main> element." })
) {}
/**
 * Companion namespace for {@link Main}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Main {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "main";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "main";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <map> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class MapElement extends S.TaggedClass<MapElement>($I`MapElement`)(
  "map",
  {
    ...GlobalAttributes,
    name: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("MapElement", { description: "The <map> element." })
) {}
/**
 * Companion namespace for {@link MapElement}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace MapElement {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "map";
    readonly name?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "map";
    readonly name?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <mark> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Mark extends S.TaggedClass<Mark>($I`Mark`)(
  "mark",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Mark", { description: "The <mark> element." })
) {}
/**
 * Companion namespace for {@link Mark}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Mark {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "mark";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "mark";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <marquee> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Marquee extends S.TaggedClass<Marquee>($I`Marquee`)(
  "marquee",
  {
    ...GlobalAttributes,
    behavior: OptionalStr,
    direction: OptionalStr,
    loop: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    truespeed: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    children: HtmlChildren,
  },
  $I.annote("Marquee", { description: "The <marquee> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Marquee}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Marquee {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "marquee";
    readonly behavior?: string;
    readonly direction?: string;
    readonly loop?: boolean | "";
    readonly truespeed?: boolean | "";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "marquee";
    readonly behavior?: string;
    readonly direction?: string;
    readonly loop?: boolean | "";
    readonly truespeed?: boolean | "";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <menu> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Menu extends S.TaggedClass<Menu>($I`Menu`)(
  "menu",
  {
    ...GlobalAttributes,
    compact: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    label: OptionalStr,
    type: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Menu", { description: "The <menu> element." })
) {}
/**
 * Companion namespace for {@link Menu}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Menu {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "menu";
    readonly compact?: boolean | "";
    readonly label?: string;
    readonly type?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "menu";
    readonly compact?: boolean | "";
    readonly label?: string;
    readonly type?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <menuitem> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Menuitem extends S.TaggedClass<Menuitem>($I`Menuitem`)(
  "menuitem",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Menuitem", { description: "The <menuitem> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Menuitem}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Menuitem {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "menuitem";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "menuitem";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <meta> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Meta extends S.TaggedClass<Meta>($I`Meta`)(
  "meta",
  {
    ...GlobalAttributes,
    charset: OptionalStr,
    content: OptionalStr,
    "http-equiv": S.optionalKey(
      LiteralKit([
        "content-language",
        "content-type",
        "default-style",
        "refresh",
        "set-cookie",
        "x-ua-compatible",
        "content-security-policy",
      ])
    ),
    media: OptionalStr,
    name: S.optionalKey(
      LiteralKit([
        "application-name",
        "author",
        "description",
        "generator",
        "keywords",
        "referrer",
        "theme-color",
        "color-scheme",
      ])
    ),
    scheme: OptionalStr,
  },
  $I.annote("Meta", { description: "The <meta> element." })
) {}
/**
 * Companion namespace for {@link Meta}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Meta {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "meta";
    readonly charset?: string;
    readonly content?: string;
    readonly "http-equiv"?:
      | "content-language"
      | "content-type"
      | "default-style"
      | "refresh"
      | "set-cookie"
      | "x-ua-compatible"
      | "content-security-policy";
    readonly media?: string;
    readonly name?:
      | "application-name"
      | "author"
      | "description"
      | "generator"
      | "keywords"
      | "referrer"
      | "theme-color"
      | "color-scheme";
    readonly scheme?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "meta";
    readonly charset?: string;
    readonly content?: string;
    readonly "http-equiv"?:
      | "content-language"
      | "content-type"
      | "default-style"
      | "refresh"
      | "set-cookie"
      | "x-ua-compatible"
      | "content-security-policy";
    readonly media?: string;
    readonly name?:
      | "application-name"
      | "author"
      | "description"
      | "generator"
      | "keywords"
      | "referrer"
      | "theme-color"
      | "color-scheme";
    readonly scheme?: string;
  };
}

/**
 * The <meter> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Meter extends S.TaggedClass<Meter>($I`Meter`)(
  "meter",
  {
    ...GlobalAttributes,
    high: OptionalStr,
    low: OptionalStr,
    max: OptionalStr,
    min: OptionalStr,
    optimum: OptionalStr,
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Meter", { description: "The <meter> element." })
) {}
/**
 * Companion namespace for {@link Meter}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Meter {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "meter";
    readonly high?: string;
    readonly low?: string;
    readonly max?: string;
    readonly min?: string;
    readonly optimum?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "meter";
    readonly high?: string;
    readonly low?: string;
    readonly max?: string;
    readonly min?: string;
    readonly optimum?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <multicol> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Multicol extends S.TaggedClass<Multicol>($I`Multicol`)(
  "multicol",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Multicol", { description: "The <multicol> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Multicol}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Multicol {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "multicol";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "multicol";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <nav> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Nav extends S.TaggedClass<Nav>($I`Nav`)(
  "nav",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Nav", { description: "The <nav> element." })
) {}
/**
 * Companion namespace for {@link Nav}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Nav {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "nav";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "nav";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <nextid> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Nextid extends S.TaggedClass<Nextid>($I`Nextid`)(
  "nextid",
  {
    ...GlobalAttributes,
  },
  $I.annote("Nextid", { description: "The <nextid> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Nextid}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Nextid {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "nextid";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "nextid";
  };
}

/**
 * The <nobr> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Nobr extends S.TaggedClass<Nobr>($I`Nobr`)(
  "nobr",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Nobr", { description: "The <nobr> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Nobr}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Nobr {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "nobr";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "nobr";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <noembed> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Noembed extends S.TaggedClass<Noembed>($I`Noembed`)(
  "noembed",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Noembed", { description: "The <noembed> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Noembed}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Noembed {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "noembed";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "noembed";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <noframes> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Noframes extends S.TaggedClass<Noframes>($I`Noframes`)(
  "noframes",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Noframes", { description: "The <noframes> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Noframes}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Noframes {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "noframes";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "noframes";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <noscript> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Noscript extends S.TaggedClass<Noscript>($I`Noscript`)(
  "noscript",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Noscript", { description: "The <noscript> element." })
) {}
/**
 * Companion namespace for {@link Noscript}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Noscript {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "noscript";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "noscript";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <object> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class ObjectElement extends S.TaggedClass<ObjectElement>($I`ObjectElement`)(
  "object",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    archive: OptionalStr,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    border: OptionalStr,
    classid: OptionalStr,
    code: OptionalStr,
    codebase: OptionalStr,
    codetype: OptionalStr,
    data: OptionalStr,
    declare: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    form: OptionalStr,
    height: S.optionalKey(S.Int),
    hspace: OptionalStr,
    name: OptionalStr,
    standby: OptionalStr,
    type: OptionalStr,
    typemustmatch: OptionalStr,
    usemap: OptionalStr,
    vspace: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("ObjectElement", { description: "The <object> element." })
) {}
/**
 * Companion namespace for {@link ObjectElement}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace ObjectElement {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "object";
    readonly align?: string;
    readonly archive?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly border?: string;
    readonly classid?: string;
    readonly code?: string;
    readonly codebase?: string;
    readonly codetype?: string;
    readonly data?: string;
    readonly declare?: boolean | "";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly name?: string;
    readonly standby?: string;
    readonly type?: string;
    readonly typemustmatch?: string;
    readonly usemap?: string;
    readonly vspace?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "object";
    readonly align?: string;
    readonly archive?: string;
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly border?: string;
    readonly classid?: string;
    readonly code?: string;
    readonly codebase?: string;
    readonly codetype?: string;
    readonly data?: string;
    readonly declare?: boolean | "";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly height?: number;
    readonly hspace?: string;
    readonly name?: string;
    readonly standby?: string;
    readonly type?: string;
    readonly typemustmatch?: string;
    readonly usemap?: string;
    readonly vspace?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <ol> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Ol extends S.TaggedClass<Ol>($I`Ol`)(
  "ol",
  {
    ...GlobalAttributes,
    compact: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    reversed: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    start: S.optionalKey(S.Int),
    type: S.optionalKey(LiteralKit(["1", "a", "A", "i", "I"])),
    children: HtmlChildren,
  },
  $I.annote("Ol", { description: "The <ol> element." })
) {}
/**
 * Companion namespace for {@link Ol}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Ol {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "ol";
    readonly compact?: boolean | "";
    readonly reversed?: boolean | "";
    readonly start?: number;
    readonly type?: "1" | "a" | "A" | "i" | "I";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "ol";
    readonly compact?: boolean | "";
    readonly reversed?: boolean | "";
    readonly start?: number;
    readonly type?: "1" | "a" | "A" | "i" | "I";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <optgroup> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Optgroup extends S.TaggedClass<Optgroup>($I`Optgroup`)(
  "optgroup",
  {
    ...GlobalAttributes,
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    label: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Optgroup", { description: "The <optgroup> element." })
) {}
/**
 * Companion namespace for {@link Optgroup}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Optgroup {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "optgroup";
    readonly disabled?: boolean | "";
    readonly label?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "optgroup";
    readonly disabled?: boolean | "";
    readonly label?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <option> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Option extends S.TaggedClass<Option>($I`Option`)(
  "option",
  {
    ...GlobalAttributes,
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    label: OptionalStr,
    name: OptionalStr,
    selected: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Option", { description: "The <option> element." })
) {}
/**
 * Companion namespace for {@link Option}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Option {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "option";
    readonly disabled?: boolean | "";
    readonly label?: string;
    readonly name?: string;
    readonly selected?: boolean | "";
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "option";
    readonly disabled?: boolean | "";
    readonly label?: string;
    readonly name?: string;
    readonly selected?: boolean | "";
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <output> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Output extends S.TaggedClass<Output>($I`Output`)(
  "output",
  {
    ...GlobalAttributes,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    for: OptionalStr,
    form: OptionalStr,
    name: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Output", { description: "The <output> element." })
) {}
/**
 * Companion namespace for {@link Output}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Output {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "output";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly for?: string;
    readonly form?: string;
    readonly name?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "output";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly for?: string;
    readonly form?: string;
    readonly name?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <p> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class P extends S.TaggedClass<P>($I`P`)(
  "p",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("P", { description: "The <p> element." })
) {}
/**
 * Companion namespace for {@link P}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace P {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "p";
    readonly align?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "p";
    readonly align?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <param> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Param extends S.TaggedClass<Param>($I`Param`)(
  "param",
  {
    ...GlobalAttributes,
  },
  $I.annote("Param", { description: "The <param> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Param}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Param {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "param";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "param";
  };
}

/**
 * The <picture> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Picture extends S.TaggedClass<Picture>($I`Picture`)(
  "picture",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Picture", { description: "The <picture> element." })
) {}
/**
 * Companion namespace for {@link Picture}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Picture {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "picture";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "picture";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <plaintext> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Plaintext extends S.TaggedClass<Plaintext>($I`Plaintext`)(
  "plaintext",
  {
    ...GlobalAttributes,
    content: S.String,
  },
  $I.annote("Plaintext", { description: "The <plaintext> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Plaintext}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Plaintext {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "plaintext";
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "plaintext";
    readonly content: string;
  };
}

/**
 * The <pre> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Pre extends S.TaggedClass<Pre>($I`Pre`)(
  "pre",
  {
    ...GlobalAttributes,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Pre", { description: "The <pre> element." })
) {}
/**
 * Companion namespace for {@link Pre}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Pre {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "pre";
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "pre";
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <progress> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Progress extends S.TaggedClass<Progress>($I`Progress`)(
  "progress",
  {
    ...GlobalAttributes,
    max: OptionalStr,
    value: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Progress", { description: "The <progress> element." })
) {}
/**
 * Companion namespace for {@link Progress}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Progress {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "progress";
    readonly max?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "progress";
    readonly max?: string;
    readonly value?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <q> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Q extends S.TaggedClass<Q>($I`Q`)(
  "q",
  {
    ...GlobalAttributes,
    cite: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Q", { description: "The <q> element." })
) {}
/**
 * Companion namespace for {@link Q}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Q {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "q";
    readonly cite?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "q";
    readonly cite?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <rb> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Rb extends S.TaggedClass<Rb>($I`Rb`)(
  "rb",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Rb", { description: "The <rb> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Rb}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Rb {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "rb";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "rb";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <rp> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Rp extends S.TaggedClass<Rp>($I`Rp`)(
  "rp",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Rp", { description: "The <rp> element." })
) {}
/**
 * Companion namespace for {@link Rp}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Rp {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "rp";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "rp";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <rt> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Rt extends S.TaggedClass<Rt>($I`Rt`)(
  "rt",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Rt", { description: "The <rt> element." })
) {}
/**
 * Companion namespace for {@link Rt}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Rt {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "rt";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "rt";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <rtc> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Rtc extends S.TaggedClass<Rtc>($I`Rtc`)(
  "rtc",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Rtc", { description: "The <rtc> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Rtc}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Rtc {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "rtc";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "rtc";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <ruby> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Ruby extends S.TaggedClass<Ruby>($I`Ruby`)(
  "ruby",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Ruby", { description: "The <ruby> element." })
) {}
/**
 * Companion namespace for {@link Ruby}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Ruby {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "ruby";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "ruby";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <s> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class SElement extends S.TaggedClass<SElement>($I`SElement`)(
  "s",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("SElement", { description: "The <s> element." })
) {}
/**
 * Companion namespace for {@link SElement}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace SElement {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "s";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "s";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <samp> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Samp extends S.TaggedClass<Samp>($I`Samp`)(
  "samp",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Samp", { description: "The <samp> element." })
) {}
/**
 * Companion namespace for {@link Samp}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Samp {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "samp";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "samp";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <script> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Script extends S.TaggedClass<Script>($I`Script`)(
  "script",
  {
    ...GlobalAttributes,
    async: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    blocking: OptionalStr,
    charset: OptionalStr,
    crossorigin: S.optionalKey(LiteralKit(["anonymous", "use-credentials"])),
    defer: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    event: OptionalStr,
    fetchpriority: S.optionalKey(LiteralKit(["high", "low", "auto"])),
    for: OptionalStr,
    integrity: OptionalStr,
    language: OptionalStr,
    nomodule: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    referrerpolicy: OptionalStr,
    src: OptionalStr,
    type: OptionalStr,
    content: S.String,
  },
  $I.annote("Script", { description: "The <script> element." })
) {}
/**
 * Companion namespace for {@link Script}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Script {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "script";
    readonly async?: boolean | "";
    readonly blocking?: string;
    readonly charset?: string;
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly defer?: boolean | "";
    readonly event?: string;
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly for?: string;
    readonly integrity?: string;
    readonly language?: string;
    readonly nomodule?: boolean | "";
    readonly referrerpolicy?: string;
    readonly src?: string;
    readonly type?: string;
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "script";
    readonly async?: boolean | "";
    readonly blocking?: string;
    readonly charset?: string;
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly defer?: boolean | "";
    readonly event?: string;
    readonly fetchpriority?: "high" | "low" | "auto";
    readonly for?: string;
    readonly integrity?: string;
    readonly language?: string;
    readonly nomodule?: boolean | "";
    readonly referrerpolicy?: string;
    readonly src?: string;
    readonly type?: string;
    readonly content: string;
  };
}

/**
 * The <search> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Search extends S.TaggedClass<Search>($I`Search`)(
  "search",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Search", { description: "The <search> element." })
) {}
/**
 * Companion namespace for {@link Search}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Search {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "search";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "search";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <section> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Section extends S.TaggedClass<Section>($I`Section`)(
  "section",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Section", { description: "The <section> element." })
) {}
/**
 * Companion namespace for {@link Section}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Section {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "section";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "section";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <select> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Select extends S.TaggedClass<Select>($I`Select`)(
  "select",
  {
    ...GlobalAttributes,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    form: OptionalStr,
    multiple: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    name: OptionalStr,
    required: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    size: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Select", { description: "The <select> element." })
) {}
/**
 * Companion namespace for {@link Select}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Select {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "select";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly multiple?: boolean | "";
    readonly name?: string;
    readonly required?: boolean | "";
    readonly size?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "select";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly multiple?: boolean | "";
    readonly name?: string;
    readonly required?: boolean | "";
    readonly size?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <selectedcontent> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Selectedcontent extends S.TaggedClass<Selectedcontent>($I`Selectedcontent`)(
  "selectedcontent",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Selectedcontent", { description: "The <selectedcontent> element." })
) {}
/**
 * Companion namespace for {@link Selectedcontent}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Selectedcontent {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "selectedcontent";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "selectedcontent";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <slot> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Slot extends S.TaggedClass<Slot>($I`Slot`)(
  "slot",
  {
    ...GlobalAttributes,
    name: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Slot", { description: "The <slot> element." })
) {}
/**
 * Companion namespace for {@link Slot}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Slot {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "slot";
    readonly name?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "slot";
    readonly name?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <small> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Small extends S.TaggedClass<Small>($I`Small`)(
  "small",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Small", { description: "The <small> element." })
) {}
/**
 * Companion namespace for {@link Small}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Small {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "small";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "small";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <source> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Source extends S.TaggedClass<Source>($I`Source`)(
  "source",
  {
    ...GlobalAttributes,
    height: S.optionalKey(S.Int),
    media: OptionalStr,
    sizes: OptionalStr,
    src: OptionalStr,
    srcset: OptionalStr,
    type: OptionalStr,
    width: S.optionalKey(S.Int),
  },
  $I.annote("Source", { description: "The <source> element." })
) {}
/**
 * Companion namespace for {@link Source}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Source {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "source";
    readonly height?: number;
    readonly media?: string;
    readonly sizes?: string;
    readonly src?: string;
    readonly srcset?: string;
    readonly type?: string;
    readonly width?: number;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "source";
    readonly height?: number;
    readonly media?: string;
    readonly sizes?: string;
    readonly src?: string;
    readonly srcset?: string;
    readonly type?: string;
    readonly width?: number;
  };
}

/**
 * The <spacer> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Spacer extends S.TaggedClass<Spacer>($I`Spacer`)(
  "spacer",
  {
    ...GlobalAttributes,
  },
  $I.annote("Spacer", { description: "The <spacer> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Spacer}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Spacer {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "spacer";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "spacer";
  };
}

/**
 * The <span> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Span extends S.TaggedClass<Span>($I`Span`)(
  "span",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Span", { description: "The <span> element." })
) {}
/**
 * Companion namespace for {@link Span}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Span {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "span";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "span";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <strike> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Strike extends S.TaggedClass<Strike>($I`Strike`)(
  "strike",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Strike", { description: "The <strike> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Strike}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Strike {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "strike";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "strike";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <strong> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Strong extends S.TaggedClass<Strong>($I`Strong`)(
  "strong",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Strong", { description: "The <strong> element." })
) {}
/**
 * Companion namespace for {@link Strong}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Strong {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "strong";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "strong";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <style> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Style extends S.TaggedClass<Style>($I`Style`)(
  "style",
  {
    ...GlobalAttributes,
    blocking: OptionalStr,
    media: OptionalStr,
    type: OptionalStr,
    content: S.String,
  },
  $I.annote("Style", { description: "The <style> element." })
) {}
/**
 * Companion namespace for {@link Style}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Style {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "style";
    readonly blocking?: string;
    readonly media?: string;
    readonly type?: string;
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "style";
    readonly blocking?: string;
    readonly media?: string;
    readonly type?: string;
    readonly content: string;
  };
}

/**
 * The <sub> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Sub extends S.TaggedClass<Sub>($I`Sub`)(
  "sub",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Sub", { description: "The <sub> element." })
) {}
/**
 * Companion namespace for {@link Sub}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Sub {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "sub";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "sub";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <summary> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Summary extends S.TaggedClass<Summary>($I`Summary`)(
  "summary",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Summary", { description: "The <summary> element." })
) {}
/**
 * Companion namespace for {@link Summary}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Summary {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "summary";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "summary";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <sup> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Sup extends S.TaggedClass<Sup>($I`Sup`)(
  "sup",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Sup", { description: "The <sup> element." })
) {}
/**
 * Companion namespace for {@link Sup}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Sup {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "sup";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "sup";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <table> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Table extends S.TaggedClass<Table>($I`Table`)(
  "table",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    bgcolor: OptionalStr,
    border: OptionalStr,
    bordercolor: OptionalStr,
    cellpadding: OptionalStr,
    cellspacing: OptionalStr,
    datapagesize: OptionalStr,
    frame: OptionalStr,
    height: S.optionalKey(S.Int),
    rules: OptionalStr,
    summary: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Table", { description: "The <table> element." })
) {}
/**
 * Companion namespace for {@link Table}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Table {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "table";
    readonly align?: string;
    readonly bgcolor?: string;
    readonly border?: string;
    readonly bordercolor?: string;
    readonly cellpadding?: string;
    readonly cellspacing?: string;
    readonly datapagesize?: string;
    readonly frame?: string;
    readonly height?: number;
    readonly rules?: string;
    readonly summary?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "table";
    readonly align?: string;
    readonly bgcolor?: string;
    readonly border?: string;
    readonly bordercolor?: string;
    readonly cellpadding?: string;
    readonly cellspacing?: string;
    readonly datapagesize?: string;
    readonly frame?: string;
    readonly height?: number;
    readonly rules?: string;
    readonly summary?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <tbody> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Tbody extends S.TaggedClass<Tbody>($I`Tbody`)(
  "tbody",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    char: OptionalStr,
    charoff: OptionalStr,
    height: S.optionalKey(S.Int),
    valign: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Tbody", { description: "The <tbody> element." })
) {}
/**
 * Companion namespace for {@link Tbody}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Tbody {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "tbody";
    readonly align?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly height?: number;
    readonly valign?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "tbody";
    readonly align?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly height?: number;
    readonly valign?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <td> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Td extends S.TaggedClass<Td>($I`Td`)(
  "td",
  {
    ...GlobalAttributes,
    abbr: OptionalStr,
    align: OptionalStr,
    axis: OptionalStr,
    bgcolor: OptionalStr,
    char: OptionalStr,
    charoff: OptionalStr,
    colspan: S.optionalKey(S.Int),
    headers: OptionalStr,
    height: S.optionalKey(S.Int),
    nowrap: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    rowspan: S.optionalKey(S.Int),
    scope: OptionalStr,
    valign: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Td", { description: "The <td> element." })
) {}
/**
 * Companion namespace for {@link Td}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Td {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "td";
    readonly abbr?: string;
    readonly align?: string;
    readonly axis?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly colspan?: number;
    readonly headers?: string;
    readonly height?: number;
    readonly nowrap?: boolean | "";
    readonly rowspan?: number;
    readonly scope?: string;
    readonly valign?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "td";
    readonly abbr?: string;
    readonly align?: string;
    readonly axis?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly colspan?: number;
    readonly headers?: string;
    readonly height?: number;
    readonly nowrap?: boolean | "";
    readonly rowspan?: number;
    readonly scope?: string;
    readonly valign?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <template> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Template extends S.TaggedClass<Template>($I`Template`)(
  "template",
  {
    ...GlobalAttributes,
    shadowrootclonable: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    shadowrootcustomelementregistry: OptionalStr,
    shadowrootdelegatesfocus: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    shadowrootmode: S.optionalKey(LiteralKit(["open", "closed"])),
    shadowrootserializable: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    shadowrootslotassignment: S.optionalKey(LiteralKit(["named", "manual"])),
    children: HtmlChildren,
  },
  $I.annote("Template", { description: "The <template> element." })
) {}
/**
 * Companion namespace for {@link Template}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Template {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "template";
    readonly shadowrootclonable?: boolean | "";
    readonly shadowrootcustomelementregistry?: string;
    readonly shadowrootdelegatesfocus?: boolean | "";
    readonly shadowrootmode?: "open" | "closed";
    readonly shadowrootserializable?: boolean | "";
    readonly shadowrootslotassignment?: "named" | "manual";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "template";
    readonly shadowrootclonable?: boolean | "";
    readonly shadowrootcustomelementregistry?: string;
    readonly shadowrootdelegatesfocus?: boolean | "";
    readonly shadowrootmode?: "open" | "closed";
    readonly shadowrootserializable?: boolean | "";
    readonly shadowrootslotassignment?: "named" | "manual";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <textarea> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Textarea extends S.TaggedClass<Textarea>($I`Textarea`)(
  "textarea",
  {
    ...GlobalAttributes,
    autocomplete: S.optionalKey(
      LiteralKit([
        "section-",
        "shipping",
        "billing",
        "home",
        "work",
        "mobile",
        "fax",
        "pager",
        "off",
        "on",
        "name",
        "honorific-prefix",
        "given-name",
        "additional-name",
        "family-name",
        "honorific-suffix",
        "nickname",
        "organization-title",
        "username",
        "new-password",
        "current-password",
        "one-time-code",
        "organization",
        "street-address",
        "address-line1",
        "address-line2",
        "address-line3",
        "address-level4",
        "address-level3",
        "address-level2",
        "address-level1",
        "country",
        "country-name",
        "postal-code",
        "cc-name",
        "cc-given-name",
        "cc-additional-name",
        "cc-family-name",
        "cc-number",
        "cc-exp",
        "cc-exp-month",
        "cc-exp-year",
        "cc-csc",
        "cc-type",
        "transaction-currency",
        "transaction-amount",
        "language",
        "bday",
        "bday-day",
        "bday-month",
        "bday-year",
        "sex",
        "url",
        "photo",
        "tel",
        "tel-country-code",
        "tel-national",
        "tel-area-code",
        "tel-local",
        "tel-local-prefix",
        "tel-local-suffix",
        "tel-extension",
        "email",
        "impp",
      ])
    ),
    cols: S.optionalKey(S.Int),
    dirname: OptionalStr,
    disabled: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    form: OptionalStr,
    maxlength: S.optionalKey(S.Int),
    minlength: S.optionalKey(S.Int),
    name: OptionalStr,
    placeholder: OptionalStr,
    readonly: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    required: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    rows: S.optionalKey(S.Int),
    wrap: S.optionalKey(LiteralKit(["soft", "hard"])),
    content: S.String,
  },
  $I.annote("Textarea", { description: "The <textarea> element." })
) {}
/**
 * Companion namespace for {@link Textarea}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Textarea {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "textarea";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly cols?: number;
    readonly dirname?: string;
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly maxlength?: number;
    readonly minlength?: number;
    readonly name?: string;
    readonly placeholder?: string;
    readonly readonly?: boolean | "";
    readonly required?: boolean | "";
    readonly rows?: number;
    readonly wrap?: "soft" | "hard";
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "textarea";
    readonly autocomplete?:
      | "section-"
      | "shipping"
      | "billing"
      | "home"
      | "work"
      | "mobile"
      | "fax"
      | "pager"
      | "off"
      | "on"
      | "name"
      | "honorific-prefix"
      | "given-name"
      | "additional-name"
      | "family-name"
      | "honorific-suffix"
      | "nickname"
      | "organization-title"
      | "username"
      | "new-password"
      | "current-password"
      | "one-time-code"
      | "organization"
      | "street-address"
      | "address-line1"
      | "address-line2"
      | "address-line3"
      | "address-level4"
      | "address-level3"
      | "address-level2"
      | "address-level1"
      | "country"
      | "country-name"
      | "postal-code"
      | "cc-name"
      | "cc-given-name"
      | "cc-additional-name"
      | "cc-family-name"
      | "cc-number"
      | "cc-exp"
      | "cc-exp-month"
      | "cc-exp-year"
      | "cc-csc"
      | "cc-type"
      | "transaction-currency"
      | "transaction-amount"
      | "language"
      | "bday"
      | "bday-day"
      | "bday-month"
      | "bday-year"
      | "sex"
      | "url"
      | "photo"
      | "tel"
      | "tel-country-code"
      | "tel-national"
      | "tel-area-code"
      | "tel-local"
      | "tel-local-prefix"
      | "tel-local-suffix"
      | "tel-extension"
      | "email"
      | "impp";
    readonly cols?: number;
    readonly dirname?: string;
    readonly disabled?: boolean | "";
    readonly form?: string;
    readonly maxlength?: number;
    readonly minlength?: number;
    readonly name?: string;
    readonly placeholder?: string;
    readonly readonly?: boolean | "";
    readonly required?: boolean | "";
    readonly rows?: number;
    readonly wrap?: "soft" | "hard";
    readonly content: string;
  };
}

/**
 * The <tfoot> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Tfoot extends S.TaggedClass<Tfoot>($I`Tfoot`)(
  "tfoot",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Tfoot", { description: "The <tfoot> element." })
) {}
/**
 * Companion namespace for {@link Tfoot}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Tfoot {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "tfoot";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "tfoot";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <th> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Th extends S.TaggedClass<Th>($I`Th`)(
  "th",
  {
    ...GlobalAttributes,
    abbr: OptionalStr,
    align: OptionalStr,
    axis: OptionalStr,
    bgcolor: OptionalStr,
    char: OptionalStr,
    charoff: OptionalStr,
    colspan: S.optionalKey(S.Int),
    headers: OptionalStr,
    height: S.optionalKey(S.Int),
    nowrap: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    rowspan: S.optionalKey(S.Int),
    scope: S.optionalKey(LiteralKit(["row", "col", "rowgroup", "colgroup"])),
    valign: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Th", { description: "The <th> element." })
) {}
/**
 * Companion namespace for {@link Th}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Th {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "th";
    readonly abbr?: string;
    readonly align?: string;
    readonly axis?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly colspan?: number;
    readonly headers?: string;
    readonly height?: number;
    readonly nowrap?: boolean | "";
    readonly rowspan?: number;
    readonly scope?: "row" | "col" | "rowgroup" | "colgroup";
    readonly valign?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "th";
    readonly abbr?: string;
    readonly align?: string;
    readonly axis?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly colspan?: number;
    readonly headers?: string;
    readonly height?: number;
    readonly nowrap?: boolean | "";
    readonly rowspan?: number;
    readonly scope?: "row" | "col" | "rowgroup" | "colgroup";
    readonly valign?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <thead> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Thead extends S.TaggedClass<Thead>($I`Thead`)(
  "thead",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Thead", { description: "The <thead> element." })
) {}
/**
 * Companion namespace for {@link Thead}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Thead {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "thead";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "thead";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <time> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Time extends S.TaggedClass<Time>($I`Time`)(
  "time",
  {
    ...GlobalAttributes,
    datetime: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Time", { description: "The <time> element." })
) {}
/**
 * Companion namespace for {@link Time}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Time {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "time";
    readonly datetime?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "time";
    readonly datetime?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <title> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Title extends S.TaggedClass<Title>($I`Title`)(
  "title",
  {
    ...GlobalAttributes,
    content: S.String,
  },
  $I.annote("Title", { description: "The <title> element." })
) {}
/**
 * Companion namespace for {@link Title}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Title {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "title";
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "title";
    readonly content: string;
  };
}

/**
 * The <tr> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Tr extends S.TaggedClass<Tr>($I`Tr`)(
  "tr",
  {
    ...GlobalAttributes,
    align: OptionalStr,
    bgcolor: OptionalStr,
    char: OptionalStr,
    charoff: OptionalStr,
    height: S.optionalKey(S.Int),
    valign: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Tr", { description: "The <tr> element." })
) {}
/**
 * Companion namespace for {@link Tr}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Tr {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "tr";
    readonly align?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly height?: number;
    readonly valign?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "tr";
    readonly align?: string;
    readonly bgcolor?: string;
    readonly char?: string;
    readonly charoff?: string;
    readonly height?: number;
    readonly valign?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <track> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Track extends S.TaggedClass<Track>($I`Track`)(
  "track",
  {
    ...GlobalAttributes,
    default: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    kind: S.optionalKey(LiteralKit(["subtitles", "captions", "descriptions", "chapters", "metadata"])),
    label: OptionalStr,
    src: OptionalStr,
    srclang: OptionalStr,
  },
  $I.annote("Track", { description: "The <track> element." })
) {}
/**
 * Companion namespace for {@link Track}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Track {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "track";
    readonly default?: boolean | "";
    readonly kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    readonly label?: string;
    readonly src?: string;
    readonly srclang?: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "track";
    readonly default?: boolean | "";
    readonly kind?: "subtitles" | "captions" | "descriptions" | "chapters" | "metadata";
    readonly label?: string;
    readonly src?: string;
    readonly srclang?: string;
  };
}

/**
 * The <tt> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Tt extends S.TaggedClass<Tt>($I`Tt`)(
  "tt",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Tt", { description: "The <tt> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Tt}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Tt {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "tt";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "tt";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <u> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class U extends S.TaggedClass<U>($I`U`)(
  "u",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("U", { description: "The <u> element." })
) {}
/**
 * Companion namespace for {@link U}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace U {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "u";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "u";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <ul> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Ul extends S.TaggedClass<Ul>($I`Ul`)(
  "ul",
  {
    ...GlobalAttributes,
    compact: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    type: OptionalStr,
    children: HtmlChildren,
  },
  $I.annote("Ul", { description: "The <ul> element." })
) {}
/**
 * Companion namespace for {@link Ul}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Ul {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "ul";
    readonly compact?: boolean | "";
    readonly type?: string;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "ul";
    readonly compact?: boolean | "";
    readonly type?: string;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <var> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Var extends S.TaggedClass<Var>($I`Var`)(
  "var",
  {
    ...GlobalAttributes,
    children: HtmlChildren,
  },
  $I.annote("Var", { description: "The <var> element." })
) {}
/**
 * Companion namespace for {@link Var}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Var {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "var";
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "var";
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <video> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Video extends S.TaggedClass<Video>($I`Video`)(
  "video",
  {
    ...GlobalAttributes,
    autoplay: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    controls: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    crossorigin: S.optionalKey(LiteralKit(["anonymous", "use-credentials"])),
    height: S.optionalKey(S.Int),
    loading: S.optionalKey(LiteralKit(["lazy", "eager"])),
    loop: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    muted: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    playsinline: S.optionalKey(S.Union([S.Boolean, S.Literal("")])),
    poster: OptionalStr,
    preload: S.optionalKey(LiteralKit(["auto", "none", "metadata"])),
    src: OptionalStr,
    width: S.optionalKey(S.Int),
    children: HtmlChildren,
  },
  $I.annote("Video", { description: "The <video> element." })
) {}
/**
 * Companion namespace for {@link Video}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Video {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "video";
    readonly autoplay?: boolean | "";
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly height?: number;
    readonly loading?: "lazy" | "eager";
    readonly loop?: boolean | "";
    readonly muted?: boolean | "";
    readonly playsinline?: boolean | "";
    readonly poster?: string;
    readonly preload?: "auto" | "none" | "metadata";
    readonly src?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Type;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "video";
    readonly autoplay?: boolean | "";
    readonly controls?: boolean | "";
    readonly crossorigin?: "anonymous" | "use-credentials";
    readonly height?: number;
    readonly loading?: "lazy" | "eager";
    readonly loop?: boolean | "";
    readonly muted?: boolean | "";
    readonly playsinline?: boolean | "";
    readonly poster?: string;
    readonly preload?: "auto" | "none" | "metadata";
    readonly src?: string;
    readonly width?: number;
    readonly children: HtmlChildren.Encoded;
  };
}

/**
 * The <wbr> element.
 *
 * @category elements
 * @since 0.0.0
 */
export class Wbr extends S.TaggedClass<Wbr>($I`Wbr`)(
  "wbr",
  {
    ...GlobalAttributes,
  },
  $I.annote("Wbr", { description: "The <wbr> element." })
) {}
/**
 * Companion namespace for {@link Wbr}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Wbr {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "wbr";
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "wbr";
  };
}

/**
 * The <xmp> element. Obsolete / non-conforming (WHATWG §16.2).
 *
 * @category elements
 * @since 0.0.0
 */
export class Xmp extends S.TaggedClass<Xmp>($I`Xmp`)(
  "xmp",
  {
    ...GlobalAttributes,
    content: S.String,
  },
  $I.annote("Xmp", { description: "The <xmp> element. Obsolete / non-conforming (WHATWG §16.2)." })
) {}
/**
 * Companion namespace for {@link Xmp}.
 *
 * @category elements
 * @since 0.0.0
 */
export declare namespace Xmp {
  /** @since 0.0.0 */
  export type Type = GlobalAttributesType & {
    readonly _tag: "xmp";
    readonly content: string;
  };
  /** @since 0.0.0 */
  export type Encoded = GlobalAttributesEncoded & {
    readonly _tag: "xmp";
    readonly content: string;
  };
}

/**
 * Discriminated union of every HTML AST node — all 142 elements plus the
 * text, comment, doctype, document, and fragment node kinds — keyed on `_tag`.
 *
 * @category models
 * @since 0.0.0
 */
export const HtmlNode = taggedUnion<HtmlNode.Type, HtmlNode.Encoded>(
  "HtmlNode",
  "Discriminated union of all HTML AST nodes.",
  [
    A,
    Abbr,
    Acronym,
    Address,
    Applet,
    Area,
    Article,
    Aside,
    Audio,
    B,
    Base,
    Basefont,
    Bdi,
    Bdo,
    Bgsound,
    Big,
    Blink,
    Blockquote,
    Body,
    Br,
    Button,
    Canvas,
    Caption,
    Center,
    Cite,
    Code,
    Col,
    Colgroup,
    Data,
    Datalist,
    Dd,
    Del,
    Details,
    Dfn,
    Dialog,
    DirElement,
    Div,
    Dl,
    Dt,
    Em,
    Embed,
    Fieldset,
    Figcaption,
    Figure,
    Font,
    Footer,
    Form,
    Frame,
    Frameset,
    H1,
    H2,
    H3,
    H4,
    H5,
    H6,
    Head,
    Header,
    Hgroup,
    Hr,
    Html,
    I,
    Iframe,
    Img,
    Input,
    Ins,
    Isindex,
    Kbd,
    Keygen,
    Label,
    Legend,
    Li,
    Link,
    Listing,
    Main,
    MapElement,
    Mark,
    Marquee,
    Menu,
    Menuitem,
    Meta,
    Meter,
    Multicol,
    Nav,
    Nextid,
    Nobr,
    Noembed,
    Noframes,
    Noscript,
    ObjectElement,
    Ol,
    Optgroup,
    Option,
    Output,
    P,
    Param,
    Picture,
    Plaintext,
    Pre,
    Progress,
    Q,
    Rb,
    Rp,
    Rt,
    Rtc,
    Ruby,
    SElement,
    Samp,
    Script,
    Search,
    Section,
    Select,
    Selectedcontent,
    Slot,
    Small,
    Source,
    Spacer,
    Span,
    Strike,
    Strong,
    Style,
    Sub,
    Summary,
    Sup,
    Table,
    Tbody,
    Td,
    Template,
    Textarea,
    Tfoot,
    Th,
    Thead,
    Time,
    Title,
    Tr,
    Track,
    Tt,
    U,
    Ul,
    Var,
    Video,
    Wbr,
    Xmp,
    Text,
    Comment,
    Doctype,
    Document,
    Fragment,
  ]
);
/**
 * Companion namespace for {@link HtmlNode}.
 *
 * @category models
 * @since 0.0.0
 */
export declare namespace HtmlNode {
  /** @since 0.0.0 */
  export type Type =
    | A.Type
    | Abbr.Type
    | Acronym.Type
    | Address.Type
    | Applet.Type
    | Area.Type
    | Article.Type
    | Aside.Type
    | Audio.Type
    | B.Type
    | Base.Type
    | Basefont.Type
    | Bdi.Type
    | Bdo.Type
    | Bgsound.Type
    | Big.Type
    | Blink.Type
    | Blockquote.Type
    | Body.Type
    | Br.Type
    | Button.Type
    | Canvas.Type
    | Caption.Type
    | Center.Type
    | Cite.Type
    | Code.Type
    | Col.Type
    | Colgroup.Type
    | Data.Type
    | Datalist.Type
    | Dd.Type
    | Del.Type
    | Details.Type
    | Dfn.Type
    | Dialog.Type
    | DirElement.Type
    | Div.Type
    | Dl.Type
    | Dt.Type
    | Em.Type
    | Embed.Type
    | Fieldset.Type
    | Figcaption.Type
    | Figure.Type
    | Font.Type
    | Footer.Type
    | Form.Type
    | Frame.Type
    | Frameset.Type
    | H1.Type
    | H2.Type
    | H3.Type
    | H4.Type
    | H5.Type
    | H6.Type
    | Head.Type
    | Header.Type
    | Hgroup.Type
    | Hr.Type
    | Html.Type
    | I.Type
    | Iframe.Type
    | Img.Type
    | Input.Type
    | Ins.Type
    | Isindex.Type
    | Kbd.Type
    | Keygen.Type
    | Label.Type
    | Legend.Type
    | Li.Type
    | Link.Type
    | Listing.Type
    | Main.Type
    | MapElement.Type
    | Mark.Type
    | Marquee.Type
    | Menu.Type
    | Menuitem.Type
    | Meta.Type
    | Meter.Type
    | Multicol.Type
    | Nav.Type
    | Nextid.Type
    | Nobr.Type
    | Noembed.Type
    | Noframes.Type
    | Noscript.Type
    | ObjectElement.Type
    | Ol.Type
    | Optgroup.Type
    | Option.Type
    | Output.Type
    | P.Type
    | Param.Type
    | Picture.Type
    | Plaintext.Type
    | Pre.Type
    | Progress.Type
    | Q.Type
    | Rb.Type
    | Rp.Type
    | Rt.Type
    | Rtc.Type
    | Ruby.Type
    | SElement.Type
    | Samp.Type
    | Script.Type
    | Search.Type
    | Section.Type
    | Select.Type
    | Selectedcontent.Type
    | Slot.Type
    | Small.Type
    | Source.Type
    | Spacer.Type
    | Span.Type
    | Strike.Type
    | Strong.Type
    | Style.Type
    | Sub.Type
    | Summary.Type
    | Sup.Type
    | Table.Type
    | Tbody.Type
    | Td.Type
    | Template.Type
    | Textarea.Type
    | Tfoot.Type
    | Th.Type
    | Thead.Type
    | Time.Type
    | Title.Type
    | Tr.Type
    | Track.Type
    | Tt.Type
    | U.Type
    | Ul.Type
    | Var.Type
    | Video.Type
    | Wbr.Type
    | Xmp.Type
    | Text.Type
    | Comment.Type
    | Doctype.Type
    | Document.Type
    | Fragment.Type;
  /** @since 0.0.0 */
  export type Encoded =
    | A.Encoded
    | Abbr.Encoded
    | Acronym.Encoded
    | Address.Encoded
    | Applet.Encoded
    | Area.Encoded
    | Article.Encoded
    | Aside.Encoded
    | Audio.Encoded
    | B.Encoded
    | Base.Encoded
    | Basefont.Encoded
    | Bdi.Encoded
    | Bdo.Encoded
    | Bgsound.Encoded
    | Big.Encoded
    | Blink.Encoded
    | Blockquote.Encoded
    | Body.Encoded
    | Br.Encoded
    | Button.Encoded
    | Canvas.Encoded
    | Caption.Encoded
    | Center.Encoded
    | Cite.Encoded
    | Code.Encoded
    | Col.Encoded
    | Colgroup.Encoded
    | Data.Encoded
    | Datalist.Encoded
    | Dd.Encoded
    | Del.Encoded
    | Details.Encoded
    | Dfn.Encoded
    | Dialog.Encoded
    | DirElement.Encoded
    | Div.Encoded
    | Dl.Encoded
    | Dt.Encoded
    | Em.Encoded
    | Embed.Encoded
    | Fieldset.Encoded
    | Figcaption.Encoded
    | Figure.Encoded
    | Font.Encoded
    | Footer.Encoded
    | Form.Encoded
    | Frame.Encoded
    | Frameset.Encoded
    | H1.Encoded
    | H2.Encoded
    | H3.Encoded
    | H4.Encoded
    | H5.Encoded
    | H6.Encoded
    | Head.Encoded
    | Header.Encoded
    | Hgroup.Encoded
    | Hr.Encoded
    | Html.Encoded
    | I.Encoded
    | Iframe.Encoded
    | Img.Encoded
    | Input.Encoded
    | Ins.Encoded
    | Isindex.Encoded
    | Kbd.Encoded
    | Keygen.Encoded
    | Label.Encoded
    | Legend.Encoded
    | Li.Encoded
    | Link.Encoded
    | Listing.Encoded
    | Main.Encoded
    | MapElement.Encoded
    | Mark.Encoded
    | Marquee.Encoded
    | Menu.Encoded
    | Menuitem.Encoded
    | Meta.Encoded
    | Meter.Encoded
    | Multicol.Encoded
    | Nav.Encoded
    | Nextid.Encoded
    | Nobr.Encoded
    | Noembed.Encoded
    | Noframes.Encoded
    | Noscript.Encoded
    | ObjectElement.Encoded
    | Ol.Encoded
    | Optgroup.Encoded
    | Option.Encoded
    | Output.Encoded
    | P.Encoded
    | Param.Encoded
    | Picture.Encoded
    | Plaintext.Encoded
    | Pre.Encoded
    | Progress.Encoded
    | Q.Encoded
    | Rb.Encoded
    | Rp.Encoded
    | Rt.Encoded
    | Rtc.Encoded
    | Ruby.Encoded
    | SElement.Encoded
    | Samp.Encoded
    | Script.Encoded
    | Search.Encoded
    | Section.Encoded
    | Select.Encoded
    | Selectedcontent.Encoded
    | Slot.Encoded
    | Small.Encoded
    | Source.Encoded
    | Spacer.Encoded
    | Span.Encoded
    | Strike.Encoded
    | Strong.Encoded
    | Style.Encoded
    | Sub.Encoded
    | Summary.Encoded
    | Sup.Encoded
    | Table.Encoded
    | Tbody.Encoded
    | Td.Encoded
    | Template.Encoded
    | Textarea.Encoded
    | Tfoot.Encoded
    | Th.Encoded
    | Thead.Encoded
    | Time.Encoded
    | Title.Encoded
    | Tr.Encoded
    | Track.Encoded
    | Tt.Encoded
    | U.Encoded
    | Ul.Encoded
    | Var.Encoded
    | Video.Encoded
    | Wbr.Encoded
    | Xmp.Encoded
    | Text.Encoded
    | Comment.Encoded
    | Doctype.Encoded
    | Document.Encoded
    | Fragment.Encoded;
}

/**
 * Advisory sub-union of elements in the "metadata" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Metadata = taggedUnion<
  Base.Type | Link.Type | Meta.Type | Noscript.Type | Script.Type | Style.Type | Template.Type | Title.Type,
  | Base.Encoded
  | Link.Encoded
  | Meta.Encoded
  | Noscript.Encoded
  | Script.Encoded
  | Style.Encoded
  | Template.Encoded
  | Title.Encoded
>("Metadata", "Advisory metadata-content element union.", [Base, Link, Meta, Noscript, Script, Style, Template, Title]);

/**
 * Advisory sub-union of elements in the "flow" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Flow = taggedUnion<
  | A.Type
  | Abbr.Type
  | Address.Type
  | Area.Type
  | Article.Type
  | Aside.Type
  | Audio.Type
  | B.Type
  | Bdi.Type
  | Bdo.Type
  | Blockquote.Type
  | Br.Type
  | Button.Type
  | Canvas.Type
  | Cite.Type
  | Code.Type
  | Data.Type
  | Datalist.Type
  | Del.Type
  | Details.Type
  | Dfn.Type
  | Dialog.Type
  | Div.Type
  | Dl.Type
  | Em.Type
  | Embed.Type
  | Fieldset.Type
  | Figure.Type
  | Footer.Type
  | Form.Type
  | H1.Type
  | H2.Type
  | H3.Type
  | H4.Type
  | H5.Type
  | H6.Type
  | Header.Type
  | Hgroup.Type
  | Hr.Type
  | I.Type
  | Iframe.Type
  | Img.Type
  | Input.Type
  | Ins.Type
  | Kbd.Type
  | Label.Type
  | Link.Type
  | Main.Type
  | MapElement.Type
  | Mark.Type
  | Menu.Type
  | Meta.Type
  | Meter.Type
  | Nav.Type
  | Noscript.Type
  | ObjectElement.Type
  | Ol.Type
  | Output.Type
  | P.Type
  | Picture.Type
  | Pre.Type
  | Progress.Type
  | Q.Type
  | Ruby.Type
  | SElement.Type
  | Samp.Type
  | Script.Type
  | Search.Type
  | Section.Type
  | Select.Type
  | Slot.Type
  | Small.Type
  | Span.Type
  | Strong.Type
  | Sub.Type
  | Sup.Type
  | Table.Type
  | Template.Type
  | Textarea.Type
  | Time.Type
  | U.Type
  | Ul.Type
  | Var.Type
  | Video.Type
  | Wbr.Type,
  | A.Encoded
  | Abbr.Encoded
  | Address.Encoded
  | Area.Encoded
  | Article.Encoded
  | Aside.Encoded
  | Audio.Encoded
  | B.Encoded
  | Bdi.Encoded
  | Bdo.Encoded
  | Blockquote.Encoded
  | Br.Encoded
  | Button.Encoded
  | Canvas.Encoded
  | Cite.Encoded
  | Code.Encoded
  | Data.Encoded
  | Datalist.Encoded
  | Del.Encoded
  | Details.Encoded
  | Dfn.Encoded
  | Dialog.Encoded
  | Div.Encoded
  | Dl.Encoded
  | Em.Encoded
  | Embed.Encoded
  | Fieldset.Encoded
  | Figure.Encoded
  | Footer.Encoded
  | Form.Encoded
  | H1.Encoded
  | H2.Encoded
  | H3.Encoded
  | H4.Encoded
  | H5.Encoded
  | H6.Encoded
  | Header.Encoded
  | Hgroup.Encoded
  | Hr.Encoded
  | I.Encoded
  | Iframe.Encoded
  | Img.Encoded
  | Input.Encoded
  | Ins.Encoded
  | Kbd.Encoded
  | Label.Encoded
  | Link.Encoded
  | Main.Encoded
  | MapElement.Encoded
  | Mark.Encoded
  | Menu.Encoded
  | Meta.Encoded
  | Meter.Encoded
  | Nav.Encoded
  | Noscript.Encoded
  | ObjectElement.Encoded
  | Ol.Encoded
  | Output.Encoded
  | P.Encoded
  | Picture.Encoded
  | Pre.Encoded
  | Progress.Encoded
  | Q.Encoded
  | Ruby.Encoded
  | SElement.Encoded
  | Samp.Encoded
  | Script.Encoded
  | Search.Encoded
  | Section.Encoded
  | Select.Encoded
  | Slot.Encoded
  | Small.Encoded
  | Span.Encoded
  | Strong.Encoded
  | Sub.Encoded
  | Sup.Encoded
  | Table.Encoded
  | Template.Encoded
  | Textarea.Encoded
  | Time.Encoded
  | U.Encoded
  | Ul.Encoded
  | Var.Encoded
  | Video.Encoded
  | Wbr.Encoded
>("Flow", "Advisory flow-content element union.", [
  A,
  Abbr,
  Address,
  Area,
  Article,
  Aside,
  Audio,
  B,
  Bdi,
  Bdo,
  Blockquote,
  Br,
  Button,
  Canvas,
  Cite,
  Code,
  Data,
  Datalist,
  Del,
  Details,
  Dfn,
  Dialog,
  Div,
  Dl,
  Em,
  Embed,
  Fieldset,
  Figure,
  Footer,
  Form,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Header,
  Hgroup,
  Hr,
  I,
  Iframe,
  Img,
  Input,
  Ins,
  Kbd,
  Label,
  Link,
  Main,
  MapElement,
  Mark,
  Menu,
  Meta,
  Meter,
  Nav,
  Noscript,
  ObjectElement,
  Ol,
  Output,
  P,
  Picture,
  Pre,
  Progress,
  Q,
  Ruby,
  SElement,
  Samp,
  Script,
  Search,
  Section,
  Select,
  Slot,
  Small,
  Span,
  Strong,
  Sub,
  Sup,
  Table,
  Template,
  Textarea,
  Time,
  U,
  Ul,
  Var,
  Video,
  Wbr,
]);

/**
 * Advisory sub-union of elements in the "sectioning" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Sectioning = taggedUnion<
  Article.Type | Aside.Type | Nav.Type | Section.Type,
  Article.Encoded | Aside.Encoded | Nav.Encoded | Section.Encoded
>("Sectioning", "Advisory sectioning-content element union.", [Article, Aside, Nav, Section]);

/**
 * Advisory sub-union of elements in the "heading" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Heading = taggedUnion<
  H1.Type | H2.Type | H3.Type | H4.Type | H5.Type | H6.Type,
  H1.Encoded | H2.Encoded | H3.Encoded | H4.Encoded | H5.Encoded | H6.Encoded
>("Heading", "Advisory heading-content element union.", [H1, H2, H3, H4, H5, H6]);

/**
 * Advisory sub-union of elements in the "phrasing" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Phrasing = taggedUnion<
  | A.Type
  | Abbr.Type
  | Area.Type
  | Audio.Type
  | B.Type
  | Bdi.Type
  | Bdo.Type
  | Br.Type
  | Button.Type
  | Canvas.Type
  | Cite.Type
  | Code.Type
  | Data.Type
  | Datalist.Type
  | Del.Type
  | Dfn.Type
  | Em.Type
  | Embed.Type
  | I.Type
  | Iframe.Type
  | Img.Type
  | Input.Type
  | Ins.Type
  | Kbd.Type
  | Label.Type
  | Link.Type
  | MapElement.Type
  | Mark.Type
  | Meta.Type
  | Meter.Type
  | Noscript.Type
  | ObjectElement.Type
  | Output.Type
  | Picture.Type
  | Progress.Type
  | Q.Type
  | Ruby.Type
  | SElement.Type
  | Samp.Type
  | Script.Type
  | Select.Type
  | Slot.Type
  | Small.Type
  | Span.Type
  | Strong.Type
  | Sub.Type
  | Sup.Type
  | Template.Type
  | Textarea.Type
  | Time.Type
  | U.Type
  | Var.Type
  | Video.Type
  | Wbr.Type,
  | A.Encoded
  | Abbr.Encoded
  | Area.Encoded
  | Audio.Encoded
  | B.Encoded
  | Bdi.Encoded
  | Bdo.Encoded
  | Br.Encoded
  | Button.Encoded
  | Canvas.Encoded
  | Cite.Encoded
  | Code.Encoded
  | Data.Encoded
  | Datalist.Encoded
  | Del.Encoded
  | Dfn.Encoded
  | Em.Encoded
  | Embed.Encoded
  | I.Encoded
  | Iframe.Encoded
  | Img.Encoded
  | Input.Encoded
  | Ins.Encoded
  | Kbd.Encoded
  | Label.Encoded
  | Link.Encoded
  | MapElement.Encoded
  | Mark.Encoded
  | Meta.Encoded
  | Meter.Encoded
  | Noscript.Encoded
  | ObjectElement.Encoded
  | Output.Encoded
  | Picture.Encoded
  | Progress.Encoded
  | Q.Encoded
  | Ruby.Encoded
  | SElement.Encoded
  | Samp.Encoded
  | Script.Encoded
  | Select.Encoded
  | Slot.Encoded
  | Small.Encoded
  | Span.Encoded
  | Strong.Encoded
  | Sub.Encoded
  | Sup.Encoded
  | Template.Encoded
  | Textarea.Encoded
  | Time.Encoded
  | U.Encoded
  | Var.Encoded
  | Video.Encoded
  | Wbr.Encoded
>("Phrasing", "Advisory phrasing-content element union.", [
  A,
  Abbr,
  Area,
  Audio,
  B,
  Bdi,
  Bdo,
  Br,
  Button,
  Canvas,
  Cite,
  Code,
  Data,
  Datalist,
  Del,
  Dfn,
  Em,
  Embed,
  I,
  Iframe,
  Img,
  Input,
  Ins,
  Kbd,
  Label,
  Link,
  MapElement,
  Mark,
  Meta,
  Meter,
  Noscript,
  ObjectElement,
  Output,
  Picture,
  Progress,
  Q,
  Ruby,
  SElement,
  Samp,
  Script,
  Select,
  Slot,
  Small,
  Span,
  Strong,
  Sub,
  Sup,
  Template,
  Textarea,
  Time,
  U,
  Var,
  Video,
  Wbr,
]);

/**
 * Advisory sub-union of elements in the "embedded" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Embedded = taggedUnion<
  Audio.Type | Canvas.Type | Embed.Type | Iframe.Type | Img.Type | ObjectElement.Type | Picture.Type | Video.Type,
  | Audio.Encoded
  | Canvas.Encoded
  | Embed.Encoded
  | Iframe.Encoded
  | Img.Encoded
  | ObjectElement.Encoded
  | Picture.Encoded
  | Video.Encoded
>("Embedded", "Advisory embedded-content element union.", [
  Audio,
  Canvas,
  Embed,
  Iframe,
  Img,
  ObjectElement,
  Picture,
  Video,
]);

/**
 * Advisory sub-union of elements in the "interactive" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Interactive = taggedUnion<
  | A.Type
  | Audio.Type
  | Button.Type
  | Details.Type
  | Embed.Type
  | Iframe.Type
  | Img.Type
  | Input.Type
  | Label.Type
  | ObjectElement.Type
  | Select.Type
  | Textarea.Type
  | Th.Type
  | Video.Type,
  | A.Encoded
  | Audio.Encoded
  | Button.Encoded
  | Details.Encoded
  | Embed.Encoded
  | Iframe.Encoded
  | Img.Encoded
  | Input.Encoded
  | Label.Encoded
  | ObjectElement.Encoded
  | Select.Encoded
  | Textarea.Encoded
  | Th.Encoded
  | Video.Encoded
>("Interactive", "Advisory interactive-content element union.", [
  A,
  Audio,
  Button,
  Details,
  Embed,
  Iframe,
  Img,
  Input,
  Label,
  ObjectElement,
  Select,
  Textarea,
  Th,
  Video,
]);

/**
 * Advisory sub-union of elements in the "palpable" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const Palpable = taggedUnion<
  | A.Type
  | Abbr.Type
  | Address.Type
  | Article.Type
  | Aside.Type
  | Audio.Type
  | B.Type
  | Bdi.Type
  | Bdo.Type
  | Blockquote.Type
  | Button.Type
  | Canvas.Type
  | Cite.Type
  | Code.Type
  | Data.Type
  | Del.Type
  | Details.Type
  | Dfn.Type
  | Div.Type
  | Dl.Type
  | Em.Type
  | Embed.Type
  | Fieldset.Type
  | Figure.Type
  | Footer.Type
  | Form.Type
  | H1.Type
  | H2.Type
  | H3.Type
  | H4.Type
  | H5.Type
  | H6.Type
  | Header.Type
  | Hgroup.Type
  | I.Type
  | Iframe.Type
  | Img.Type
  | Input.Type
  | Ins.Type
  | Kbd.Type
  | Label.Type
  | Main.Type
  | MapElement.Type
  | Mark.Type
  | Menu.Type
  | Meter.Type
  | Nav.Type
  | ObjectElement.Type
  | Ol.Type
  | Output.Type
  | P.Type
  | Picture.Type
  | Pre.Type
  | Progress.Type
  | Q.Type
  | Ruby.Type
  | SElement.Type
  | Samp.Type
  | Search.Type
  | Section.Type
  | Select.Type
  | Small.Type
  | Span.Type
  | Strong.Type
  | Sub.Type
  | Sup.Type
  | Table.Type
  | Textarea.Type
  | Time.Type
  | U.Type
  | Ul.Type
  | Var.Type
  | Video.Type,
  | A.Encoded
  | Abbr.Encoded
  | Address.Encoded
  | Article.Encoded
  | Aside.Encoded
  | Audio.Encoded
  | B.Encoded
  | Bdi.Encoded
  | Bdo.Encoded
  | Blockquote.Encoded
  | Button.Encoded
  | Canvas.Encoded
  | Cite.Encoded
  | Code.Encoded
  | Data.Encoded
  | Del.Encoded
  | Details.Encoded
  | Dfn.Encoded
  | Div.Encoded
  | Dl.Encoded
  | Em.Encoded
  | Embed.Encoded
  | Fieldset.Encoded
  | Figure.Encoded
  | Footer.Encoded
  | Form.Encoded
  | H1.Encoded
  | H2.Encoded
  | H3.Encoded
  | H4.Encoded
  | H5.Encoded
  | H6.Encoded
  | Header.Encoded
  | Hgroup.Encoded
  | I.Encoded
  | Iframe.Encoded
  | Img.Encoded
  | Input.Encoded
  | Ins.Encoded
  | Kbd.Encoded
  | Label.Encoded
  | Main.Encoded
  | MapElement.Encoded
  | Mark.Encoded
  | Menu.Encoded
  | Meter.Encoded
  | Nav.Encoded
  | ObjectElement.Encoded
  | Ol.Encoded
  | Output.Encoded
  | P.Encoded
  | Picture.Encoded
  | Pre.Encoded
  | Progress.Encoded
  | Q.Encoded
  | Ruby.Encoded
  | SElement.Encoded
  | Samp.Encoded
  | Search.Encoded
  | Section.Encoded
  | Select.Encoded
  | Small.Encoded
  | Span.Encoded
  | Strong.Encoded
  | Sub.Encoded
  | Sup.Encoded
  | Table.Encoded
  | Textarea.Encoded
  | Time.Encoded
  | U.Encoded
  | Ul.Encoded
  | Var.Encoded
  | Video.Encoded
>("Palpable", "Advisory palpable-content element union.", [
  A,
  Abbr,
  Address,
  Article,
  Aside,
  Audio,
  B,
  Bdi,
  Bdo,
  Blockquote,
  Button,
  Canvas,
  Cite,
  Code,
  Data,
  Del,
  Details,
  Dfn,
  Div,
  Dl,
  Em,
  Embed,
  Fieldset,
  Figure,
  Footer,
  Form,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Header,
  Hgroup,
  I,
  Iframe,
  Img,
  Input,
  Ins,
  Kbd,
  Label,
  Main,
  MapElement,
  Mark,
  Menu,
  Meter,
  Nav,
  ObjectElement,
  Ol,
  Output,
  P,
  Picture,
  Pre,
  Progress,
  Q,
  Ruby,
  SElement,
  Samp,
  Search,
  Section,
  Select,
  Small,
  Span,
  Strong,
  Sub,
  Sup,
  Table,
  Textarea,
  Time,
  U,
  Ul,
  Var,
  Video,
]);

/**
 * Advisory sub-union of elements in the "script-supporting" content category. Non-normative
 * (derived from the WHATWG element index); see `data/SOURCES.md`.
 *
 * @category schemas
 * @since 0.0.0
 */
export const ScriptSupporting = taggedUnion<Script.Type | Template.Type, Script.Encoded | Template.Encoded>(
  "ScriptSupporting",
  "Advisory script-supporting-content element union.",
  [Script, Template]
);
