---
title: Md.utils.ts
nav_order: 5
parent: "@beep/md"
---

## Md.utils.ts overview

Shared Markdown and HTML rendering utilities.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isStringArray](#isstringarray)
- [utilities](#utilities)
  - [escapeHtmlUrlAttribute](#escapehtmlurlattribute)
  - [escapeMarkdownDestination](#escapemarkdowndestination)
  - [escapeMarkdownText](#escapemarkdowntext)
  - [joinBlocks](#joinblocks)
  - [maxBackticks](#maxbackticks)
  - [prefixLines](#prefixlines)
  - [renderFencedCode](#renderfencedcode)
  - [renderInlineCode](#renderinlinecode)
  - [sanitizeCodeFenceLanguage](#sanitizecodefencelanguage)
  - [sanitizeUrlDestination](#sanitizeurldestination)
---

# guards

## isStringArray

Type guard for rendered string arrays accepted by `joinBlocks`.

**Example**

```ts
import { isStringArray } from "@beep/md/Md.utils"

console.log(isStringArray(["a", "b"])) // true
```

**Signature**

```ts
declare const isStringArray: <I>(input: I) => input is I & ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L395)

Since v0.0.0

# utilities

## escapeHtmlUrlAttribute

Escapes a URL-like destination for use inside an HTML attribute.

**Example**

```ts
import { escapeHtmlUrlAttribute } from "@beep/md/Md.utils"

console.log(escapeHtmlUrlAttribute("a b")) // "a%20b"
```

**Signature**

```ts
declare const escapeHtmlUrlAttribute: (destination: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L269)

Since v0.0.0

## escapeMarkdownDestination

Escapes Markdown link or image destination delimiters.

**Example**

```ts
import { escapeMarkdownDestination } from "@beep/md/Md.utils"

const escaped = escapeMarkdownDestination("https://example.com/a)b")
console.log(escaped) // "https://example.com/a\\)b"
```

**Signature**

```ts
declare const escapeMarkdownDestination: (destination: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L250)

Since v0.0.0

## escapeMarkdownText

Escapes Markdown control characters in plain text.

**Example**

```ts
import { escapeMarkdownText } from "@beep/md/Md.utils"

const escaped = escapeMarkdownText("# title")
console.log(escaped) // "\\# title"
```

**Signature**

```ts
declare const escapeMarkdownText: (self: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L207)

Since v0.0.0

## joinBlocks

Joins rendered Markdown blocks with one blank line between blocks.

**Example**

```ts
import { joinBlocks } from "@beep/md/Md.utils"

const markdown = joinBlocks(["# Title", "Body text"])
console.log(markdown) // "# Title\n\nBody text"
```

**Signature**

```ts
declare const joinBlocks: (blocks: string | ReadonlyArray<string>) => Markdown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L166)

Since v0.0.0

## maxBackticks

Returns the length of the longest contiguous backtick run in text.

**Example**

```ts
import { Str } from "@beep/utils"
import { maxBackticks } from "@beep/md/Md.utils"

const triple = Str.repeat("`", 3)
const count = maxBackticks(`\`one\` and ${triple}three${triple}`)
console.log(count) // 3
```

**Signature**

```ts
declare const maxBackticks: (text: string) => number
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L309)

Since v0.0.0

## prefixLines

Prefixes every line of text with the provided marker.

**Example**

```ts
import { prefixLines } from "@beep/md/Md.utils"

const quoted = prefixLines("alpha\nbeta", "> ")
console.log(quoted) // "> alpha\n> beta"
```

**Signature**

```ts
declare const prefixLines: { (text: string, prefix: string): string; (prefix: string): (text: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L186)

Since v0.0.0

## renderFencedCode

Builds a Markdown fenced code block with an adaptive backtick fence.

**Example**

```ts
import { Str } from "@beep/utils"
import { renderFencedCode } from "@beep/md/Md.utils"

const block = renderFencedCode("console.log('beep')", "ts")
const fence = Str.repeat("`", 3)
console.log(Str.includes(`${fence}ts`)(block)) // true
```

**Signature**

```ts
declare const renderFencedCode: { (text: string, language: string): string; (language: string): (text: string) => string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L372)

Since v0.0.0

## renderInlineCode

Builds a Markdown inline code span with an adaptive backtick fence.

**Example**

```ts
import { renderInlineCode } from "@beep/md/Md.utils"

const code = renderInlineCode("`single`")
console.log(code) // "`` `single` ``"
```

Empty and multiline payloads fall back to raw `<code>` HTML because Markdown
code spans normalize whitespace and cannot preserve those payloads exactly.

**Signature**

```ts
declare const renderInlineCode: (text: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L342)

Since v0.0.0

## sanitizeCodeFenceLanguage

Sanitizes Markdown fenced-code info strings to a single language token.

Invalid language values are omitted instead of being rendered into the fence.

**Example**

```ts
import { sanitizeCodeFenceLanguage } from "@beep/md/Md.utils"

console.log(sanitizeCodeFenceLanguage("ts")) // "ts"
console.log(sanitizeCodeFenceLanguage("ts bad")) // ""
```

**Signature**

```ts
declare const sanitizeCodeFenceLanguage: (language: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L287)

Since v0.0.0

## sanitizeUrlDestination

Normalizes URL-like destinations before rendering Markdown or HTML output.

Unsafe active protocols are replaced with a harmless fragment destination.

**Example**

```ts
import { sanitizeUrlDestination } from "@beep/md/Md.utils"

console.log(sanitizeUrlDestination("javascript:alert(1)")) // "#"
```

**Signature**

```ts
declare const sanitizeUrlDestination: (destination: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/md/src/Md.utils.ts#L224)

Since v0.0.0