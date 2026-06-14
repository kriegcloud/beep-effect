---
title: Md.render.ts
nav_order: 3
parent: "@beep/md"
---

## Md.render.ts overview

Markdown AST render adapters.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [RenderError (class)](#rendererror-class)
- [models](#models)
  - [DocumentToHtmlFragment (type alias)](#documenttohtmlfragment-type-alias)
  - [DocumentToMarkdown (type alias)](#documenttomarkdown-type-alias)
  - [EffectRenderAdapter (interface)](#effectrenderadapter-interface)
  - [PureRenderAdapter (interface)](#purerenderadapter-interface)
- [utilities](#utilities)
  - [HtmlFragmentAdapter](#htmlfragmentadapter)
  - [MarkdownAdapter](#markdownadapter)
  - [render](#render)
  - [renderEffectWith](#rendereffectwith)
  - [renderEffectWithUnsafe](#rendereffectwithunsafe)
  - [renderHtml](#renderhtml)
  - [renderHtmlBlock](#renderhtmlblock)
  - [renderHtmlBlocks](#renderhtmlblocks)
  - [renderHtmlInline](#renderhtmlinline)
  - [renderHtmlUnsafe](#renderhtmlunsafe)
  - [renderMarkdownBlock](#rendermarkdownblock)
  - [renderMarkdownBlocks](#rendermarkdownblocks)
  - [renderMarkdownInline](#rendermarkdowninline)
  - [renderUnsafe](#renderunsafe)
  - [renderWith](#renderwith)
  - [renderWithUnsafe](#renderwithunsafe)
- [validation](#validation)
  - [DocumentToHtmlFragment](#documenttohtmlfragment)
  - [DocumentToMarkdown](#documenttomarkdown)
---

# error-handling

## RenderError (class)

Error raised when a render adapter fails while producing output.

**Example**

```ts
import { RenderError } from "@beep/md/Md.render"

const error = RenderError.make({
  adapter: "markdown",
  message: "Render adapter markdown failed.",
  cause: "boom"
})
console.log(error._tag) // "RenderError"
```

**Signature**

```ts
declare class RenderError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L61)

Since v0.0.0

# models

## DocumentToHtmlFragment (type alias)

Type for `DocumentToHtmlFragment`.

**Example**

```ts
import type { DocumentToHtmlFragment } from "@beep/md/Md.render"

const acceptHtml = (value: DocumentToHtmlFragment) => value
console.log(acceptHtml)
```

**Signature**

```ts
type DocumentToHtmlFragment = typeof DocumentToHtmlFragment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L798)

Since v0.0.0

## DocumentToMarkdown (type alias)

Type for `DocumentToMarkdown`.

**Example**

```ts
import type { DocumentToMarkdown } from "@beep/md/Md.render"

const acceptMarkdown = (value: DocumentToMarkdown) => value
console.log(acceptMarkdown)
```

**Signature**

```ts
type DocumentToMarkdown = typeof DocumentToMarkdown.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L756)

Since v0.0.0

## EffectRenderAdapter (interface)

Effectful render adapter contract for resourceful output formats.

Future PDF and DOCX adapters can use this shape when rendering needs fonts,
files, streams, or other services.

**Example**

```ts
import { Effect } from "effect"
import type { EffectRenderAdapter } from "@beep/md/Md.render"

const adapter: EffectRenderAdapter<Uint8Array> = {
  name: "bytes",
  render: () => Effect.succeed(new Uint8Array())
}
console.log(adapter)
```

**Signature**

```ts
export interface EffectRenderAdapter<Output, Error = never, Requirements = never> {
  readonly name: string;
  readonly render: (document: Document) => Effect.Effect<Output, Error, Requirements>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L116)

Since v0.0.0

## PureRenderAdapter (interface)

Pure render adapter contract for synchronous output formats.

**Example**

```ts
import type { PureRenderAdapter } from "@beep/md/Md.render"

const adapter: PureRenderAdapter<string> = {
  name: "noop",
  render: (document) => document._tag
}
console.log(adapter)
```

**Signature**

```ts
export interface PureRenderAdapter<Output> {
  readonly name: string;
  readonly render: (document: Document) => Output;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L90)

Since v0.0.0

# utilities

## HtmlFragmentAdapter

Built-in HTML fragment render adapter.

Note: this adapter escapes `rawHtml` inline nodes by default. Treat trusted
HTML pass-through as an explicit custom-adapter boundary.

**Example**

```ts
import { Md } from "@beep/md"
import { HtmlFragmentAdapter } from "@beep/md/Md.render"

console.log(HtmlFragmentAdapter.render(Md.make([Md.p("Hello")]))) // "<p>Hello</p>"
```

**Signature**

```ts
declare const HtmlFragmentAdapter: PureRenderAdapter<string & Brand<"HtmlFragment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L627)

Since v0.0.0

## MarkdownAdapter

Built-in Markdown render adapter.

**Example**

```ts
import { Md } from "@beep/md"
import { MarkdownAdapter } from "@beep/md/Md.render"

console.log(MarkdownAdapter.render(Md.make([Md.h1("Hello")]))) // "# Hello"
```

**Signature**

```ts
declare const MarkdownAdapter: PureRenderAdapter<string & Brand<"Markdown">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L605)

Since v0.0.0

## render

Renders a document through the Markdown adapter.

Adapter failures are captured as `RenderError`. Use
`renderUnsafe` only at boundaries that intentionally throw.

**Example**

```ts
import { Result } from "effect"
import { Md } from "@beep/md"
import { render } from "@beep/md/Md.render"

const output = render(Md.make([Md.h1("Hello")]))
console.log(Result.getOrThrow(output)) // "# Hello"
```

**Signature**

```ts
declare const render: (document: Document) => Result.Result<Markdown, RenderError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L682)

Since v0.0.0

## renderEffectWith

Starts an effectful render adapter with synchronous adapter failures captured.

Adapter effects keep their original error and requirement channels. Only
failures thrown while starting the adapter are wrapped as `RenderError`.

**Example**

```ts
import { Effect } from "effect"
import { Md } from "@beep/md"
import { renderEffectWith } from "@beep/md/Md.render"

const adapter = {
  name: "bytes",
  render: () => Effect.succeed(new Uint8Array())
}
const program = renderEffectWith(adapter, Md.make([]))
console.log(program)
```

**Signature**

```ts
declare const renderEffectWith: { <Output, Error, Requirements>(adapter: EffectRenderAdapter<Output, Error, Requirements>, document: Document): Effect.Effect<Output, Error | RenderError, Requirements>; <Output, Error, Requirements>(document: Document): (adapter: EffectRenderAdapter<Output, Error, Requirements>) => Effect.Effect<Output, Error | RenderError, Requirements>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L567)

Since v0.0.0

## renderEffectWithUnsafe

Starts an effectful render adapter and returns its effect directly.

Prefer `renderEffectWith` when adapter construction failures should be
reported as `RenderError`.

**Example**

```ts
import { Effect } from "effect"
import { Md } from "@beep/md"
import { renderEffectWithUnsafe } from "@beep/md/Md.render"

const adapter = {
  name: "bytes",
  render: () => Effect.succeed(new Uint8Array())
}
const program = renderEffectWithUnsafe(adapter, Md.make([]))
console.log(program)
```

**Signature**

```ts
declare const renderEffectWithUnsafe: { <Output, Error, Requirements>(adapter: EffectRenderAdapter<Output, Error, Requirements>, document: Document): Effect.Effect<Output, Error, Requirements>; <Output, Error, Requirements>(document: Document): (adapter: EffectRenderAdapter<Output, Error, Requirements>) => Effect.Effect<Output, Error, Requirements>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L528)

Since v0.0.0

## renderHtml

Renders a document through the HTML fragment adapter.

Adapter failures are captured as `RenderError`. Use
`renderHtmlUnsafe` only at boundaries that intentionally throw.

**Example**

```ts
import { Result } from "effect"
import { Md } from "@beep/md"
import { renderHtml } from "@beep/md/Md.render"

const output = renderHtml(Md.make([Md.p("Hello")]))
console.log(Result.getOrThrow(output)) // "<p>Hello</p>"
```

**Signature**

```ts
declare const renderHtml: (document: Document) => Result.Result<HtmlFragment, RenderError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L704)

Since v0.0.0

## renderHtmlBlock

Renders a block node as an HTML fragment.

**Example**

```ts
import { Md } from "@beep/md"
import { renderHtmlBlock } from "@beep/md/Md.render"

console.log(renderHtmlBlock(Md.p("Hello"))) // "<p>Hello</p>"
```

**Signature**

```ts
declare const renderHtmlBlock: (block: Block) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L388)

Since v0.0.0

## renderHtmlBlocks

Renders block nodes as an HTML fragment body.

**Example**

```ts
import { Md } from "@beep/md"
import { renderHtmlBlocks } from "@beep/md/Md.render"

console.log(renderHtmlBlocks([Md.p("Hello")])) // "<p>Hello</p>"
```

**Signature**

```ts
declare const renderHtmlBlocks: (blocks: ReadonlyArray<Block>) => HtmlFragment
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L441)

Since v0.0.0

## renderHtmlInline

Renders an inline node as an HTML fragment.

**Example**

```ts
import { Md } from "@beep/md"
import { renderHtmlInline } from "@beep/md/Md.render"

console.log(renderHtmlInline(Md.em("beep"))) // "<em>beep</em>"
```

**Signature**

```ts
declare const renderHtmlInline: (inline: Inline) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L316)

Since v0.0.0

## renderHtmlUnsafe

Renders a document through the HTML fragment adapter and returns the output directly.

Prefer `renderHtml` when callers should handle adapter failure explicitly.

**Example**

```ts
import { Md } from "@beep/md"
import { renderHtmlUnsafe } from "@beep/md/Md.render"

console.log(renderHtmlUnsafe(Md.make([Md.p("Hello")]))) // "<p>Hello</p>"
```

**Signature**

```ts
declare const renderHtmlUnsafe: (document: Document) => HtmlFragment
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L481)

Since v0.0.0

## renderMarkdownBlock

Renders a block node as Markdown.

**Example**

```ts
import { Md } from "@beep/md"
import { renderMarkdownBlock } from "@beep/md/Md.render"

console.log(renderMarkdownBlock(Md.h1("Hello"))) // "# Hello"
```

**Signature**

```ts
declare const renderMarkdownBlock: (block: Block) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L334)

Since v0.0.0

## renderMarkdownBlocks

Renders block nodes as a Markdown document body.

**Example**

```ts
import { Md } from "@beep/md"
import { renderMarkdownBlocks } from "@beep/md/Md.render"

console.log(renderMarkdownBlocks([Md.h1("Hello"), Md.p("World")]))
```

**Signature**

```ts
declare const renderMarkdownBlocks: (blocks: ReadonlyArray<Block>) => Markdown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L422)

Since v0.0.0

## renderMarkdownInline

Renders an inline node as Markdown.

**Example**

```ts
import { Md } from "@beep/md"
import { renderMarkdownInline } from "@beep/md/Md.render"

console.log(renderMarkdownInline(Md.strong("beep"))) // "**beep**"
```

**Signature**

```ts
declare const renderMarkdownInline: (inline: Inline) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L269)

Since v0.0.0

## renderUnsafe

Renders a document through the Markdown adapter and returns the output directly.

Prefer `render` when callers should handle adapter failure explicitly.

**Example**

```ts
import { Md } from "@beep/md"
import { renderUnsafe } from "@beep/md/Md.render"

console.log(renderUnsafe(Md.make([Md.h1("Hello")]))) // "# Hello"
```

**Signature**

```ts
declare const renderUnsafe: (document: Document) => Markdown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L463)

Since v0.0.0

## renderWith

Renders a document with a custom pure adapter.

Adapter failures are captured as `RenderError`. Use
`renderWithUnsafe` only at boundaries that intentionally throw.

**Example**

```ts
import { Result } from "effect"
import { Md } from "@beep/md"
import { MarkdownAdapter, renderWith } from "@beep/md/Md.render"

const output = renderWith(MarkdownAdapter, Md.make([Md.p("Hello")]))
console.log(Result.getOrThrow(output)) // "Hello"
```

**Signature**

```ts
declare const renderWith: { <Output>(adapter: PureRenderAdapter<Output>, document: Document): Result.Result<Output, RenderError>; <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Result.Result<Output, RenderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L651)

Since v0.0.0

## renderWithUnsafe

Renders a document with a custom pure adapter and returns the output directly.

Prefer `renderWith` when callers should handle adapter failure explicitly.

**Example**

```ts
import { Md } from "@beep/md"
import { MarkdownAdapter, renderWithUnsafe } from "@beep/md/Md.render"

const output = renderWithUnsafe(MarkdownAdapter, Md.make([Md.p("Hello")]))
console.log(output) // "Hello"
```

**Signature**

```ts
declare const renderWithUnsafe: { <Output>(adapter: PureRenderAdapter<Output>, document: Document): Output; <Output>(document: Document): (adapter: PureRenderAdapter<Output>) => Output; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L500)

Since v0.0.0

# validation

## DocumentToHtmlFragment

Schema transformation from a document AST to a branded HTML fragment.

**Example**

```ts
import * as S from "effect/Schema"
import { Md } from "@beep/md"
import { DocumentToHtmlFragment } from "@beep/md/Md.render"

const html = S.decodeUnknownSync(DocumentToHtmlFragment)(Md.make([Md.p("Hello")]))
console.log(html) // "<p>Hello</p>"
```

**Signature**

```ts
declare const DocumentToHtmlFragment: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.brand<S.String, "HtmlFragment">>, S.Codec<DocumentSchema, DocumentSchema, never, never>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L774)

Since v0.0.0

## DocumentToMarkdown

Schema transformation from a document AST to branded Markdown text.

**Example**

```ts
import * as S from "effect/Schema"
import { Md } from "@beep/md"
import { DocumentToMarkdown } from "@beep/md/Md.render"

const markdown = S.decodeUnknownSync(DocumentToMarkdown)(Md.make([Md.h1("Hello")]))
console.log(markdown) // "# Hello"
```

**Signature**

```ts
declare const DocumentToMarkdown: AnnotatedSchema<S.decodeTo<AnnotatedSchema<S.decodeTo<S.brand<S.String, "Markdown">, S.String, never, never>>, S.Codec<DocumentSchema, DocumentSchema, never, never>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.render.ts#L732)

Since v0.0.0