---
title: Html.ts
nav_order: 112
parent: "@beep/schema"
---

## Html.ts overview

HTML text schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HtmlFragment (type alias)](#htmlfragment-type-alias)
- [validation](#validation)
  - [HtmlFragment](#htmlfragment)
---

# models

## HtmlFragment (type alias)

Type for `HtmlFragment`.

**Example**

```ts
import type { HtmlFragment } from "@beep/schema/Html"

const render = (value: HtmlFragment) => value
console.log(render)
```

**Signature**

```ts
type HtmlFragment = typeof HtmlFragment.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Html.ts#L55)

Since v0.0.0

# validation

## HtmlFragment

Branded schema for trusted HTML fragment strings.

Use this for rendered snippets such as Markdown or rich-text projections that
are valid to embed inside an existing HTML document body.

This is a nominal trust brand only. Decoding this schema does not sanitize or
validate HTML payload safety.

**Example**

```ts
import { HtmlFragment } from "@beep/schema/Html"

const fragment = HtmlFragment.make("<p>Hello</p>")
console.log(fragment) // "<p>Hello</p>"
```

**Signature**

```ts
declare const HtmlFragment: AnnotatedSchema<S.brand<S.String, "HtmlFragment">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Html.ts#L33)

Since v0.0.0