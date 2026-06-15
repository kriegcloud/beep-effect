---
title: Md.model.ts
nav_order: 2
parent: "@beep/md"
---

## Md.model.ts overview

Schema-first Markdown document AST models.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [A](#a)
  - [A (type alias)](#a-type-alias)
  - [Block](#block)
  - [Block (type alias)](#block-type-alias)
  - [BlockQuote](#blockquote)
  - [BlockQuote (type alias)](#blockquote-type-alias)
  - [Br](#br)
  - [Br (type alias)](#br-type-alias)
  - [Code](#code)
  - [Code (type alias)](#code-type-alias)
  - [Del](#del)
  - [Del (type alias)](#del-type-alias)
  - [Document](#document)
  - [Document (type alias)](#document-type-alias)
  - [Em](#em)
  - [Em (type alias)](#em-type-alias)
  - [H1](#h1)
  - [H1 (type alias)](#h1-type-alias)
  - [H2](#h2)
  - [H2 (type alias)](#h2-type-alias)
  - [H3](#h3)
  - [H3 (type alias)](#h3-type-alias)
  - [H4](#h4)
  - [H4 (type alias)](#h4-type-alias)
  - [H5](#h5)
  - [H5 (type alias)](#h5-type-alias)
  - [H6](#h6)
  - [H6 (type alias)](#h6-type-alias)
  - [Hr](#hr)
  - [Hr (type alias)](#hr-type-alias)
  - [Img](#img)
  - [Img (type alias)](#img-type-alias)
  - [Inline](#inline)
  - [Inline (type alias)](#inline-type-alias)
  - [Li](#li)
  - [Li (type alias)](#li-type-alias)
  - [Ol](#ol)
  - [Ol (type alias)](#ol-type-alias)
  - [P](#p)
  - [P (type alias)](#p-type-alias)
  - [Pre](#pre)
  - [Pre (type alias)](#pre-type-alias)
  - [RawHtml](#rawhtml)
  - [RawHtml (type alias)](#rawhtml-type-alias)
  - [RawMarkdown](#rawmarkdown)
  - [RawMarkdown (type alias)](#rawmarkdown-type-alias)
  - [Strong](#strong)
  - [Strong (type alias)](#strong-type-alias)
  - [TaskItem](#taskitem)
  - [TaskItem (type alias)](#taskitem-type-alias)
  - [TaskList](#tasklist)
  - [TaskList (type alias)](#tasklist-type-alias)
  - [Text](#text)
  - [Text (type alias)](#text-type-alias)
  - [Ul](#ul)
  - [Ul (type alias)](#ul-type-alias)
---

# models

## A

Inline hyperlink.

**Example**

```ts
import { A, Text } from "@beep/md/Md.model"

const node = A.make({ href: "https://example.com", children: [Text.make({ value: "Example" })] })
console.log(node._tag) // "a"
```

**Signature**

```ts
declare const A: S.Codec<A, A, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L316)

Since v0.0.0

## A (type alias)

Type for `A`.

**Example**

```ts
import type { A } from "@beep/md/Md.model"

const accept = (node: A) => node
console.log(accept)
```

**Signature**

```ts
type A = {
  readonly _tag: "a";
  readonly href: string;
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L339)

Since v0.0.0

## Block

Discriminated union of block Markdown AST nodes.

**Example**

```ts
import * as S from "effect/Schema"
import { Block, P, Text } from "@beep/md/Md.model"

const decode = S.decodeUnknownSync(Block)
const node = decode(P.make({ children: [Text.make({ value: "Hello" })] }))
console.log(node._tag) // "p"
```

**Signature**

```ts
declare const Block: S.Codec<Block, Block, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1084)

Since v0.0.0

## Block (type alias)

Type for `Block`.

**Example**

```ts
import type { Block } from "@beep/md/Md.model"

const accept = (node: Block) => node
console.log(accept)
```

**Signature**

```ts
type Block = H1 | H2 | H3 | H4 | H5 | H6 | P | BlockQuote | Pre | Ul | Ol | Li | TaskList | Hr
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1119)

Since v0.0.0

## BlockQuote

Block quote container.

**Example**

```ts
import { BlockQuote, P, Text } from "@beep/md/Md.model"

const node = BlockQuote.make({ children: [P.make({ children: [Text.make({ value: "Quote" })] })] })
console.log(node._tag) // "blockquote"
```

**Signature**

```ts
declare const BlockQuote: S.Codec<BlockQuote, BlockQuote, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L965)

Since v0.0.0

## BlockQuote (type alias)

Type for `BlockQuote`.

**Example**

```ts
import type { BlockQuote } from "@beep/md/Md.model"

const accept = (node: BlockQuote) => node
console.log(accept)
```

**Signature**

```ts
type BlockQuote = {
  readonly _tag: "blockquote";
  readonly children: ReadonlyArray<Block>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L987)

Since v0.0.0

## Br

Inline line break.

**Example**

```ts
import { Br } from "@beep/md/Md.model"

const node = Br.make({})
console.log(node._tag) // "br"
```

**Signature**

```ts
declare const Br: AnnotatedSchema<S.TaggedStruct<"br", {}>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L398)

Since v0.0.0

## Br (type alias)

Type for `Br`.

**Example**

```ts
import type { Br } from "@beep/md/Md.model"

const accept = (node: Br) => node
console.log(accept)
```

**Signature**

```ts
type Br = typeof Br.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L418)

Since v0.0.0

## Code

Inline code span.

**Example**

```ts
import { Code } from "@beep/md/Md.model"

const node = Code.make({ value: "console.log()" })
console.log(node._tag) // "code"
```

**Signature**

```ts
declare const Code: AnnotatedSchema<S.TaggedStruct<"code", { readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L278)

Since v0.0.0

## Code (type alias)

Type for `Code`.

**Example**

```ts
import type { Code } from "@beep/md/Md.model"

const accept = (node: Code) => node
console.log(accept)
```

**Signature**

```ts
type Code = typeof Code.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L300)

Since v0.0.0

## Del

Deleted inline content.

**Example**

```ts
import { Del, Text } from "@beep/md/Md.model"

const node = Del.make({ children: [Text.make({ value: "removed" })] })
console.log(node._tag) // "del"
```

**Signature**

```ts
declare const Del: S.Codec<Del, Del, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L237)

Since v0.0.0

## Del (type alias)

Type for `Del`.

**Example**

```ts
import type { Del } from "@beep/md/Md.model"

const accept = (node: Del) => node
console.log(accept)
```

**Signature**

```ts
type Del = {
  readonly _tag: "del";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L259)

Since v0.0.0

## Document

Root Markdown document AST.

**Example**

```ts
import { Document, P, Text } from "@beep/md/Md.model"

const document = Document.make({ children: [P.make({ children: [Text.make({ value: "Hello" })] })] })
console.log(document._tag) // "document"
```

**Signature**

```ts
declare const Document: S.Codec<Document, Document, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1135)

Since v0.0.0

## Document (type alias)

Type for `Document`.

**Example**

```ts
import type { Document } from "@beep/md/Md.model"

const accept = (node: Document) => node
console.log(accept)
```

**Signature**

```ts
type Document = {
  readonly _tag: "document";
  readonly children: ReadonlyArray<Block>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1157)

Since v0.0.0

## Em

Emphasized inline content.

**Example**

```ts
import { Em, Text } from "@beep/md/Md.model"

const node = Em.make({ children: [Text.make({ value: "note" })] })
console.log(node._tag) // "em"
```

**Signature**

```ts
declare const Em: S.Codec<Em, Em, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L196)

Since v0.0.0

## Em (type alias)

Type for `Em`.

**Example**

```ts
import type { Em } from "@beep/md/Md.model"

const accept = (node: Em) => node
console.log(accept)
```

**Signature**

```ts
type Em = {
  readonly _tag: "em";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L218)

Since v0.0.0

## H1

Level-one heading block.

**Example**

```ts
import { H1, Text } from "@beep/md/Md.model"

const node = H1.make({ children: [Text.make({ value: "Title" })] })
console.log(node._tag) // "h1"
```

**Signature**

```ts
declare const H1: S.Codec<H1, H1, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L518)

Since v0.0.0

## H1 (type alias)

Type for `H1`.

**Example**

```ts
import type { H1 } from "@beep/md/Md.model"

const accept = (node: H1) => node
console.log(accept)
```

**Signature**

```ts
type H1 = {
  readonly _tag: "h1";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L538)

Since v0.0.0

## H2

Level-two heading block.

**Example**

```ts
import { H2, Text } from "@beep/md/Md.model"

const node = H2.make({ children: [Text.make({ value: "Install" })] })
console.log(node._tag) // "h2"
```

**Signature**

```ts
declare const H2: S.Codec<H2, H2, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L557)

Since v0.0.0

## H2 (type alias)

Type for `H2`.

**Example**

```ts
import type { H2 } from "@beep/md/Md.model"

const accept = (node: H2) => node
console.log(accept)
```

**Signature**

```ts
type H2 = {
  readonly _tag: "h2";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L577)

Since v0.0.0

## H3

Level-three heading block.

**Example**

```ts
import { H3, Text } from "@beep/md/Md.model"

const node = H3.make({ children: [Text.make({ value: "Config" })] })
console.log(node._tag) // "h3"
```

**Signature**

```ts
declare const H3: S.Codec<H3, H3, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L596)

Since v0.0.0

## H3 (type alias)

Type for `H3`.

**Example**

```ts
import type { H3 } from "@beep/md/Md.model"

const accept = (node: H3) => node
console.log(accept)
```

**Signature**

```ts
type H3 = {
  readonly _tag: "h3";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L616)

Since v0.0.0

## H4

Level-four heading block.

**Example**

```ts
import { H4, Text } from "@beep/md/Md.model"

const node = H4.make({ children: [Text.make({ value: "Details" })] })
console.log(node._tag) // "h4"
```

**Signature**

```ts
declare const H4: S.Codec<H4, H4, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L635)

Since v0.0.0

## H4 (type alias)

Type for `H4`.

**Example**

```ts
import type { H4 } from "@beep/md/Md.model"

const accept = (node: H4) => node
console.log(accept)
```

**Signature**

```ts
type H4 = {
  readonly _tag: "h4";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L655)

Since v0.0.0

## H5

Level-five heading block.

**Example**

```ts
import { H5, Text } from "@beep/md/Md.model"

const node = H5.make({ children: [Text.make({ value: "Notes" })] })
console.log(node._tag) // "h5"
```

**Signature**

```ts
declare const H5: S.Codec<H5, H5, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L674)

Since v0.0.0

## H5 (type alias)

Type for `H5`.

**Example**

```ts
import type { H5 } from "@beep/md/Md.model"

const accept = (node: H5) => node
console.log(accept)
```

**Signature**

```ts
type H5 = {
  readonly _tag: "h5";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L694)

Since v0.0.0

## H6

Level-six heading block.

**Example**

```ts
import { H6, Text } from "@beep/md/Md.model"

const node = H6.make({ children: [Text.make({ value: "Footnote" })] })
console.log(node._tag) // "h6"
```

**Signature**

```ts
declare const H6: S.Codec<H6, H6, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L713)

Since v0.0.0

## H6 (type alias)

Type for `H6`.

**Example**

```ts
import type { H6 } from "@beep/md/Md.model"

const accept = (node: H6) => node
console.log(accept)
```

**Signature**

```ts
type H6 = {
  readonly _tag: "h6";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L733)

Since v0.0.0

## Hr

Horizontal rule block.

**Example**

```ts
import { Hr } from "@beep/md/Md.model"

const node = Hr.make({})
console.log(node._tag) // "hr"
```

**Signature**

```ts
declare const Hr: AnnotatedSchema<S.TaggedStruct<"hr", {}>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1046)

Since v0.0.0

## Hr (type alias)

Type for `Hr`.

**Example**

```ts
import type { Hr } from "@beep/md/Md.model"

const accept = (node: Hr) => node
console.log(accept)
```

**Signature**

```ts
type Hr = typeof Hr.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1066)

Since v0.0.0

## Img

Inline image.

**Example**

```ts
import { Img } from "@beep/md/Md.model"

const node = Img.make({ src: "/logo.png", alt: "Logo" })
console.log(node._tag) // "img"
```

**Signature**

```ts
declare const Img: AnnotatedSchema<S.TaggedStruct<"img", { readonly src: S.String; readonly alt: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L359)

Since v0.0.0

## Img (type alias)

Type for `Img`.

**Example**

```ts
import type { Img } from "@beep/md/Md.model"

const accept = (node: Img) => node
console.log(accept)
```

**Signature**

```ts
type Img = typeof Img.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L382)

Since v0.0.0

## Inline

Discriminated union of inline Markdown AST nodes.

**Example**

```ts
import * as S from "effect/Schema"
import { Inline, Text } from "@beep/md/Md.model"

const decode = S.decodeUnknownSync(Inline)
const node = decode(Text.make({ value: "Hello" }))
console.log(node._tag) // "text"
```

**Signature**

```ts
declare const Inline: S.Codec<Inline, Inline, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L436)

Since v0.0.0

## Inline (type alias)

Type for `Inline`.

**Example**

```ts
import type { Inline } from "@beep/md/Md.model"

const accept = (node: Inline) => node
console.log(accept)
```

**Signature**

```ts
type Inline = Text | RawMarkdown | RawHtml | Strong | Em | Del | Code | A | Img | Br
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L456)

Since v0.0.0

## Li

List item block.

**Example**

```ts
import { Li, Text } from "@beep/md/Md.model"

const node = Li.make({ children: [Text.make({ value: "Item" })] })
console.log(node._tag) // "li"
```

**Signature**

```ts
declare const Li: S.Codec<Li, Li, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L752)

Since v0.0.0

## Li (type alias)

Type for `Li`.

**Example**

```ts
import type { Li } from "@beep/md/Md.model"

const accept = (node: Li) => node
console.log(accept)
```

**Signature**

```ts
type Li = {
  readonly _tag: "li";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L774)

Since v0.0.0

## Ol

Ordered list block.

**Example**

```ts
import { Li, Ol, Text } from "@beep/md/Md.model"

const node = Ol.make({ children: [Li.make({ children: [Text.make({ value: "First" })] })] })
console.log(node._tag) // "ol"
```

**Signature**

```ts
declare const Ol: S.Codec<Ol, Ol, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L840)

Since v0.0.0

## Ol (type alias)

Type for `Ol`.

**Example**

```ts
import type { Ol } from "@beep/md/Md.model"

const accept = (node: Ol) => node
console.log(accept)
```

**Signature**

```ts
type Ol = {
  readonly _tag: "ol";
  readonly children: ReadonlyArray<Li>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L862)

Since v0.0.0

## P

Paragraph block.

**Example**

```ts
import { P, Text } from "@beep/md/Md.model"

const node = P.make({ children: [Text.make({ value: "Hello" })] })
console.log(node._tag) // "p"
```

**Signature**

```ts
declare const P: S.Codec<P, P, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L472)

Since v0.0.0

## P (type alias)

Type for `P`.

**Example**

```ts
import type { P } from "@beep/md/Md.model"

const accept = (node: P) => node
console.log(accept)
```

**Signature**

```ts
type P = {
  readonly _tag: "p";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L494)

Since v0.0.0

## Pre

Fenced code block.

**Example**

```ts
import * as O from "effect/Option"
import { Pre } from "@beep/md/Md.model"

const node = Pre.make({ language: O.some("ts"), value: "console.log('beep')" })
console.log(node._tag) // "pre"
```

**Signature**

```ts
declare const Pre: AnnotatedSchema<S.TaggedStruct<"pre", { readonly value: S.String; readonly language: S.Option<S.String>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1007)

Since v0.0.0

## Pre (type alias)

Type for `Pre`.

**Example**

```ts
import type { Pre } from "@beep/md/Md.model"

const accept = (node: Pre) => node
console.log(accept)
```

**Signature**

```ts
type Pre = typeof Pre.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L1030)

Since v0.0.0

## RawHtml

Raw HTML inline content for adapters that opt into trusted HTML rendering.

The built-in HTML adapter escapes this value by default.

**Example**

```ts
import { RawHtml } from "@beep/md/Md.model"

const node = RawHtml.make({ value: "<span>trusted</span>" })
console.log(node._tag) // "rawHtml"
```

**Signature**

```ts
declare const RawHtml: AnnotatedSchema<S.TaggedStruct<"rawHtml", { readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L116)

Since v0.0.0

## RawHtml (type alias)

Type for `RawHtml`.

**Example**

```ts
import type { RawHtml } from "@beep/md/Md.model"

const accept = (node: RawHtml) => node
console.log(accept)
```

**Signature**

```ts
type RawHtml = typeof RawHtml.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L139)

Since v0.0.0

## RawMarkdown

Trusted raw Markdown inline content.

**Example**

```ts
import { RawMarkdown } from "@beep/md/Md.model"

const node = RawMarkdown.make({ value: "**trusted**" })
console.log(node._tag) // "rawMarkdown"
```

**Signature**

```ts
declare const RawMarkdown: AnnotatedSchema<S.TaggedStruct<"rawMarkdown", { readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L76)

Since v0.0.0

## RawMarkdown (type alias)

Type for `RawMarkdown`.

**Example**

```ts
import type { RawMarkdown } from "@beep/md/Md.model"

const accept = (node: RawMarkdown) => node
console.log(accept)
```

**Signature**

```ts
type RawMarkdown = typeof RawMarkdown.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L98)

Since v0.0.0

## Strong

Strong inline content.

**Example**

```ts
import { Strong, Text } from "@beep/md/Md.model"

const node = Strong.make({ children: [Text.make({ value: "important" })] })
console.log(node._tag) // "strong"
```

**Signature**

```ts
declare const Strong: S.Codec<Strong, Strong, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L155)

Since v0.0.0

## Strong (type alias)

Type for `Strong`.

**Example**

```ts
import type { Strong } from "@beep/md/Md.model"

const accept = (node: Strong) => node
console.log(accept)
```

**Signature**

```ts
type Strong = {
  readonly _tag: "strong";
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L177)

Since v0.0.0

## TaskItem

GFM task list item.

**Example**

```ts
import { TaskItem, Text } from "@beep/md/Md.model"

const node = TaskItem.make({ checked: true, children: [Text.make({ value: "Done" })] })
console.log(node._tag) // "taskItem"
```

**Signature**

```ts
declare const TaskItem: S.Codec<TaskItem, TaskItem, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L881)

Since v0.0.0

## TaskItem (type alias)

Type for `TaskItem`.

**Example**

```ts
import type { TaskItem } from "@beep/md/Md.model"

const accept = (node: TaskItem) => node
console.log(accept)
```

**Signature**

```ts
type TaskItem = {
  readonly _tag: "taskItem";
  readonly checked: boolean;
  readonly children: ReadonlyArray<Inline>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L904)

Since v0.0.0

## TaskList

GFM task list block.

**Example**

```ts
import { TaskItem, TaskList, Text } from "@beep/md/Md.model"

const node = TaskList.make({ children: [TaskItem.make({ checked: false, children: [Text.make({ value: "Todo" })] })] })
console.log(node._tag) // "taskList"
```

**Signature**

```ts
declare const TaskList: S.Codec<TaskList, TaskList, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L924)

Since v0.0.0

## TaskList (type alias)

Type for `TaskList`.

**Example**

```ts
import type { TaskList } from "@beep/md/Md.model"

const accept = (node: TaskList) => node
console.log(accept)
```

**Signature**

```ts
type TaskList = {
  readonly _tag: "taskList";
  readonly children: ReadonlyArray<TaskItem>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L946)

Since v0.0.0

## Text

Plain escaped inline text.

**Example**

```ts
import { Text } from "@beep/md/Md.model"

const node = Text.make({ value: "Hello" })
console.log(node._tag) // "text"
```

**Signature**

```ts
declare const Text: AnnotatedSchema<S.TaggedStruct<"text", { readonly value: S.String; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L38)

Since v0.0.0

## Text (type alias)

Type for `Text`.

**Example**

```ts
import type { Text } from "@beep/md/Md.model"

const accept = (node: Text) => node
console.log(accept)
```

**Signature**

```ts
type Text = typeof Text.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L60)

Since v0.0.0

## Ul

Unordered list block.

**Example**

```ts
import { Li, Text, Ul } from "@beep/md/Md.model"

const node = Ul.make({ children: [Li.make({ children: [Text.make({ value: "Item" })] })] })
console.log(node._tag) // "ul"
```

**Signature**

```ts
declare const Ul: S.Codec<Ul, Ul, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L799)

Since v0.0.0

## Ul (type alias)

Type for `Ul`.

**Example**

```ts
import type { Ul } from "@beep/md/Md.model"

const accept = (node: Ul) => node
console.log(accept)
```

**Signature**

```ts
type Ul = {
  readonly _tag: "ul";
  readonly children: ReadonlyArray<Li>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.model.ts#L821)

Since v0.0.0