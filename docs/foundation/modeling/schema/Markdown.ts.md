---
title: Markdown.ts
nav_order: 148
parent: "@beep/schema"
---

## Markdown.ts overview

Markdown rendering and schema transforms.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Markdown (type alias)](#markdown-type-alias)
- [utilities](#utilities)
  - [decodeMarkdownTextAs](#decodemarkdowntextas)
- [validation](#validation)
  - [Markdown](#markdown)
  - [MarkdownTextToHtml](#markdowntexttohtml)
---

# models

## Markdown (type alias)

Branded Markdown document string type extracted from `Markdown`.

**Signature**

```ts
type Markdown = typeof Markdown.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Markdown.ts#L139)

Since v0.0.0

# utilities

## decodeMarkdownTextAs

Builds a decoder that renders Markdown text to HTML and then decodes the
result through a target schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { decodeMarkdownTextAs } from "@beep/schema/Markdown"

const decodeHtml = decodeMarkdownTextAs(S.String)

const program = decodeHtml("# Hello")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const decodeMarkdownTextAs: <Schema extends S.Top>(schema: Schema, options?: MarkdownRenderOptions) => (input: unknown, options?: ParseOptions | undefined) => Effect.Effect<Schema["Type"], S.SchemaError, Schema["DecodingServices"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Markdown.ts#L201)

Since v0.0.0

# validation

## Markdown

Branded schema for Markdown document strings accepted by the active parser.

Validation uses `Bun.markdown.html` when Bun is available. In runtimes without
Bun, it falls back to the platform-agnostic `micromark` parser with GFM
extensions. Markdown is intentionally permissive, so plain text and empty
strings are valid when the active parser accepts them.

**Example**

```ts
import * as S from "effect/Schema"
import { Markdown } from "@beep/schema/Markdown"

const document = S.decodeUnknownSync(Markdown)("# Hello")
console.log(document)
```

**Signature**

```ts
declare const Markdown: AnnotatedSchema<S.decodeTo<S.brand<S.String, "Markdown">, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Markdown.ts#L122)

Since v0.0.0

## MarkdownTextToHtml

Schema factory that renders Markdown text into HTML using `Bun.markdown.html`.

Returns a schema transformation from Markdown source text to rendered HTML
text. Encoding back to Markdown is not supported.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { MarkdownTextToHtml } from "@beep/schema/Markdown"

const MarkdownToHtml = MarkdownTextToHtml()
const program = S.decodeUnknownEffect(MarkdownToHtml)("# Hello")
const result = Effect.runPromise(program)
console.log(result)
```

**Signature**

```ts
declare const MarkdownTextToHtml: (options?: MarkdownRenderOptions) => AnnotatedSchema<S.decodeTo<S.String, S.String, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Markdown.ts#L164)

Since v0.0.0