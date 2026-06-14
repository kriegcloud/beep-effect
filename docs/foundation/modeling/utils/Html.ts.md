---
title: Html.ts
nav_order: 11
parent: "@beep/utils"
---

## Html.ts overview

A module containing utilities for escaping HTML text.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [escapeHtml](#escapehtml)
  - [escapeHtmlMultiline](#escapehtmlmultiline)
---

# utilities

## escapeHtml

Escapes the HTML-sensitive characters in `text`.

Replaces `&`, `<`, `>`, `"`, and `'` with their corresponding HTML
entities.

**Example**

```ts
```typescript
import { escapeHtml } from "@beep/utils/Html"

const value = escapeHtml(`<div class="note">it's fine</div>`)
console.log(value)
```
```

**Signature**

```ts
declare const escapeHtml: (self: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Html.ts#L27)

Since v0.0.0

## escapeHtmlMultiline

Escapes HTML-sensitive characters and converts newlines to `<br />`.

Useful when rendering plain multi-line text into HTML while preserving line
breaks.

**Example**

```ts
```typescript
import { escapeHtmlMultiline } from "@beep/utils/Html"

const value = escapeHtmlMultiline("hello\n<script>alert('x')</script>")
console.log(value)
```
```

**Signature**

```ts
declare const escapeHtmlMultiline: (self: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Html.ts#L51)

Since v0.0.0