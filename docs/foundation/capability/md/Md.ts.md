---
title: Md.ts
nav_order: 4
parent: "@beep/md"
---

## Md.ts overview

Public Markdown AST builder DSL.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Md](#md)
  - [a](#a)
  - [blockquote](#blockquote)
  - [br](#br)
  - [code](#code)
  - [del](#del)
  - [em](#em)
  - [h1](#h1)
  - [h2](#h2)
  - [h3](#h3)
  - [h4](#h4)
  - [h5](#h5)
  - [h6](#h6)
  - [hr](#hr)
  - [img](#img)
  - [li](#li)
  - [make](#make)
  - [ol](#ol)
  - [p](#p)
  - [pre](#pre)
  - [rawHtml](#rawhtml)
  - [rawMarkdown](#rawmarkdown)
  - [strong](#strong)
  - [taskItem](#taskitem)
  - [taskList](#tasklist)
  - [text](#text)
  - [ul](#ul)
- [models](#models)
  - [BlockContent (type alias)](#blockcontent-type-alias)
  - [BlockContentBuilder (type alias)](#blockcontentbuilder-type-alias)
  - [BlockInput (type alias)](#blockinput-type-alias)
  - [BlockTemplateValue (type alias)](#blocktemplatevalue-type-alias)
  - [InlineContent (type alias)](#inlinecontent-type-alias)
  - [InlineContentBuilder (type alias)](#inlinecontentbuilder-type-alias)
  - [InlineInput (type alias)](#inlineinput-type-alias)
  - [ListItemInput (type alias)](#listiteminput-type-alias)
  - [TaskListItemInput (type alias)](#tasklistiteminput-type-alias)
---

# constructors

## Md

Namespace-style public Markdown DSL.

Simple text-oriented block builders such as `h1`, `h2`, and
`p` are intended to read naturally as tagged template literals while
keeping function-call overloads for dynamic strings and structured inline
children.

**Example**

```ts
import { Md } from "@beep/md"
import { Result } from "effect"

const document = Md.make([Md.h1`Hello`, Md.p`World`])
console.log(Result.getOrThrow(Md.render(document))) // "# Hello\n\nWorld"
```

**Signature**

```ts
declare const Md: { readonly MarkdownAdapter: PureRenderAdapter<string & Brand<"Markdown">>; readonly HtmlFragmentAdapter: PureRenderAdapter<string & Brand<"HtmlFragment">>; readonly a: (href: string, children: InlineContent) => ANode; readonly blockquote: BlockContentBuilder<BlockQuote>; readonly br: { readonly _tag: "br"; }; readonly code: (value: string) => Code; readonly del: InlineContentBuilder<Del>; readonly em: InlineContentBuilder<Em>; readonly h1: InlineContentBuilder<H1>; readonly h2: InlineContentBuilder<H2>; readonly h3: InlineContentBuilder<H3>; readonly h4: InlineContentBuilder<H4>; readonly h5: InlineContentBuilder<H5>; readonly h6: InlineContentBuilder<H6>; readonly hr: { readonly _tag: "hr"; }; readonly img: (src: string, alt?: string) => Img; readonly li: InlineContentBuilder<Li>; readonly make: (children: ReadonlyArray<Block>) => Document; readonly ol: (children: ReadonlyArray<ListItemInput>) => Ol; readonly p: InlineContentBuilder<PNode>; readonly pre: (value: string, options?: { readonly language?: string; }) => Pre; readonly rawHtml: (value: string) => RawHtml; readonly rawMarkdown: (value: string) => RawMarkdown; readonly render: (document: Document) => Result<Markdown, RenderError>; readonly renderEffectWith: { <Output, Error, Requirements>(adapter: EffectRenderAdapter<Output, Error, Requirements>, document: Document): Effect<Output, Error | RenderError, Requirements>; <Output, Error, Requirements>(document: Document): (adapter: EffectRenderAdapter<Output, Error, Requirements>) => Effect<Output, Error | RenderError, Requirements>; }; readonly renderEffectWithUnsafe: { <Output, Error, Requirements>(adapter: EffectRenderAdapter<Output, Error, Requirements>, document: Document): Effect<Output, Error, Requirements>; <Output, Error, Requirements>(document: Document): (adapter: EffectRenderAdapter<Output, Error, Requirements>) => Effect<Output, Error, Requirements>; }; readonly renderHtml: (document: Document) => Result<HtmlFragment, RenderError>; readonly renderHtmlUnsafe: (document: Document) => HtmlFragment; readonly renderUnsafe: (document: Document) => Markdown; readonly renderWith: { <Output>(adapter: PureRenderAdapter<Output>, document: Document): Result<Output, RenderError>; <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Result<Output, RenderError>; }; readonly renderWithUnsafe: { <Output>(adapter: PureRenderAdapter<Output>, document: Document): Output; <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Output; }; readonly strong: InlineContentBuilder<Strong>; readonly taskItem: (children: InlineContent, options?: { readonly checked?: boolean; }) => TaskItem; readonly taskList: (children: ReadonlyArray<TaskListItemInput>) => TaskList; readonly text: (value: string) => Text; readonly ul: (children: ReadonlyArray<ListItemInput>) => Ul; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L791)

Since v0.0.0

## a

Creates an inline hyperlink.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.a("https://example.com", "Example")
console.log(node._tag) // "a"
```

**Signature**

```ts
declare const a: (href: string, children: InlineContent) => ANode
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L476)

Since v0.0.0

## blockquote

Creates a block quote container.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.blockquote`Hello ${Md.strong("world")}`
console.log(node._tag) // "blockquote"
```

**Signature**

```ts
declare const blockquote: BlockContentBuilder<BlockQuote>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L721)

Since v0.0.0

## br

Creates an inline line break.

**Example**

```ts
import { Md } from "@beep/md"

console.log(Md.br._tag) // "br"
```

**Signature**

```ts
declare const br: { readonly _tag: "br"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L508)

Since v0.0.0

## code

Creates an inline code span.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.code("console.log()")
console.log(node._tag) // "code"
```

**Signature**

```ts
declare const code: (value: string) => Code
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L460)

Since v0.0.0

## del

Creates deleted inline content.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.del("removed")
console.log(node._tag) // "del"
```

**Signature**

```ts
declare const del: InlineContentBuilder<Del>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L444)

Since v0.0.0

## em

Creates emphasized inline content.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.em("quiet")
console.log(node._tag) // "em"
```

**Signature**

```ts
declare const em: InlineContentBuilder<Em>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L428)

Since v0.0.0

## h1

Creates a level-one heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h1`Hello ${Md.em("world")}`
console.log(node._tag) // "h1"
```

**Signature**

```ts
declare const h1: InlineContentBuilder<H1>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L524)

Since v0.0.0

## h2

Creates a level-two heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h2`Install`
console.log(node._tag) // "h2"
```

**Signature**

```ts
declare const h2: InlineContentBuilder<H2>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L540)

Since v0.0.0

## h3

Creates a level-three heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h3`Config`
console.log(node._tag) // "h3"
```

**Signature**

```ts
declare const h3: InlineContentBuilder<H3>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L556)

Since v0.0.0

## h4

Creates a level-four heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h4`Details`
console.log(node._tag) // "h4"
```

**Signature**

```ts
declare const h4: InlineContentBuilder<H4>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L572)

Since v0.0.0

## h5

Creates a level-five heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h5`Notes`
console.log(node._tag) // "h5"
```

**Signature**

```ts
declare const h5: InlineContentBuilder<H5>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L588)

Since v0.0.0

## h6

Creates a level-six heading block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.h6`Footnote`
console.log(node._tag) // "h6"
```

**Signature**

```ts
declare const h6: InlineContentBuilder<H6>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L604)

Since v0.0.0

## hr

Creates a horizontal rule block.

**Example**

```ts
import { Md } from "@beep/md"

console.log(Md.hr._tag) // "hr"
```

**Signature**

```ts
declare const hr: { readonly _tag: "hr"; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L753)

Since v0.0.0

## img

Creates an inline image.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.img("/logo.png", "Logo")
console.log(node._tag) // "img"
```

**Signature**

```ts
declare const img: (src: string, alt?: string) => Img
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L493)

Since v0.0.0

## li

Creates a list item block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.li`Item`
console.log(node._tag) // "li"
```

**Signature**

```ts
declare const li: InlineContentBuilder<Li>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L636)

Since v0.0.0

## make

Creates a Markdown document from block children.

**Example**

```ts
import { Md } from "@beep/md"

const document = Md.make([Md.h1`Hello`, Md.p`World`])
console.log(document._tag) // "document"
```

**Signature**

```ts
declare const make: (children: ReadonlyArray<Block>) => Document
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L769)

Since v0.0.0

## ol

Creates an ordered list block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.ol(["One", "Two"])
console.log(node._tag) // "ol"
```

**Signature**

```ts
declare const ol: (children: ReadonlyArray<ListItemInput>) => Ol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L668)

Since v0.0.0

## p

Creates a paragraph block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.p`Hello ${Md.strong("world")}`
console.log(node._tag) // "p"
```

**Signature**

```ts
declare const p: InlineContentBuilder<PNode>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L620)

Since v0.0.0

## pre

Creates a fenced code block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.pre("console.log('beep')", { language: "ts" })
console.log(node._tag) // "pre"
```

**Signature**

```ts
declare const pre: (value: string, options?: { readonly language?: string; }) => Pre
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L737)

Since v0.0.0

## rawHtml

Creates raw HTML inline content for adapters that opt into trusted HTML rendering.

The built-in `HtmlFragmentAdapter` escapes this value by default.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.rawHtml("<span>trusted</span>")
console.log(node._tag) // "rawHtml"
```

**Signature**

```ts
declare const rawHtml: (value: string) => RawHtml
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L396)

Since v0.0.0

## rawMarkdown

Creates trusted raw Markdown inline content.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.rawMarkdown("**trusted**")
console.log(node._tag) // "rawMarkdown"
```

**Signature**

```ts
declare const rawMarkdown: (value: string) => RawMarkdown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L378)

Since v0.0.0

## strong

Creates strong inline content.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.strong`Hello ${Md.code("beep")}`
console.log(node._tag) // "strong"
```

**Signature**

```ts
declare const strong: InlineContentBuilder<Strong>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L412)

Since v0.0.0

## taskItem

Creates a GFM task list item.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.taskItem("Done", { checked: true })
console.log(node.checked) // true
```

**Signature**

```ts
declare const taskItem: (children: InlineContent, options?: { readonly checked?: boolean; }) => TaskItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L684)

Since v0.0.0

## taskList

Creates a GFM task list block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.taskList(["Todo", Md.taskItem("Done", { checked: true })])
console.log(node._tag) // "taskList"
```

**Signature**

```ts
declare const taskList: (children: ReadonlyArray<TaskListItemInput>) => TaskList
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L704)

Since v0.0.0

## text

Creates plain escaped inline text.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.text("Hello")
console.log(node._tag) // "text"
```

**Signature**

```ts
declare const text: (value: string) => Text
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L362)

Since v0.0.0

## ul

Creates an unordered list block.

**Example**

```ts
import { Md } from "@beep/md"

const node = Md.ul(["One", Md.li("Two")])
console.log(node._tag) // "ul"
```

**Signature**

```ts
declare const ul: (children: ReadonlyArray<ListItemInput>) => Ul
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L652)

Since v0.0.0

# models

## BlockContent (type alias)

Block child content accepted by block container call forms.

**Example**

```ts
import { Md } from "@beep/md"
import type { BlockContent } from "@beep/md/Md"

const content: BlockContent = [Md.h2("Nested"), "plain"]
console.log(content)
```

**Signature**

```ts
type BlockContent = BlockInput | ReadonlyArray<BlockInput>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L139)

Since v0.0.0

## BlockContentBuilder (type alias)

Overloaded builder shape for block-content constructors.

**Example**

```ts
import type { BlockContentBuilder } from "@beep/md/Md"
import type { BlockQuote } from "@beep/md/Md.model"

const accept = (builder: BlockContentBuilder<BlockQuote>) => builder
console.log(accept)
```

**Signature**

```ts
type BlockContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<BlockTemplateValue>): Node;
  (children: BlockContent): Node;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L176)

Since v0.0.0

## BlockInput (type alias)

Block constructor input accepted by block containers.

**Example**

```ts
import type { BlockInput } from "@beep/md/Md"

const accept = (input: BlockInput) => input
console.log(accept)
```

**Signature**

```ts
type BlockInput = string | Block
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L122)

Since v0.0.0

## BlockTemplateValue (type alias)

Tagged-template interpolation accepted by block containers.

Arrays in templates are inline content arrays; use the call form for block
arrays.

**Example**

```ts
import { Md } from "@beep/md"
import type { BlockTemplateValue } from "@beep/md/Md"

const value: BlockTemplateValue = Md.h2("Nested")
console.log(value)
```

**Signature**

```ts
type BlockTemplateValue = InlineContent | Block
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L159)

Since v0.0.0

## InlineContent (type alias)

Inline child content accepted by inline and text block builders.

**Example**

```ts
import { Md } from "@beep/md"
import type { InlineContent } from "@beep/md/Md"

const content: InlineContent = [Md.strong("Hello"), " world"]
console.log(content)
```

**Signature**

```ts
type InlineContent = InlineInput | ReadonlyArray<InlineInput>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L86)

Since v0.0.0

## InlineContentBuilder (type alias)

Overloaded builder shape for inline-content constructors.

**Example**

```ts
import type { InlineContentBuilder } from "@beep/md/Md"
import type { Strong } from "@beep/md/Md.model"

const accept = (builder: InlineContentBuilder<Strong>) => builder
console.log(accept)
```

**Signature**

```ts
type InlineContentBuilder<Node> = {
  (strings: TemplateStringsArray, ...values: ReadonlyArray<InlineContent>): Node;
  (children: InlineContent): Node;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L103)

Since v0.0.0

## InlineInput (type alias)

Inline constructor input accepted by text-oriented builders.

**Example**

```ts
import type { InlineInput } from "@beep/md/Md"

const accept = (input: InlineInput) => input
console.log(accept)
```

**Signature**

```ts
type InlineInput = string | Inline
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L69)

Since v0.0.0

## ListItemInput (type alias)

Input accepted by ordered and unordered list constructors.

**Example**

```ts
import { Md } from "@beep/md"
import type { ListItemInput } from "@beep/md/Md"

const item: ListItemInput = [Md.strong("Item")]
console.log(item)
```

**Signature**

```ts
type ListItemInput = string | Inline | Li | ReadonlyArray<InlineInput>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L196)

Since v0.0.0

## TaskListItemInput (type alias)

Input accepted by task list constructors.

**Example**

```ts
import type { TaskListItemInput } from "@beep/md/Md"

const item: TaskListItemInput = { text: "Done", checked: true }
console.log(item)
```

**Signature**

```ts
type TaskListItemInput = | string
  | TaskItem
  | {
      readonly text: string;
      readonly checked?: boolean;
    }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.ts#L212)

Since v0.0.0