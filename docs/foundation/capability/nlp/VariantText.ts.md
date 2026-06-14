---
title: VariantText.ts
nav_order: 73
parent: "@beep/nlp"
---

## VariantText.ts overview

Ordered string-variant helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [normalization](#normalization)
  - [orderedDedupe](#ordereddedupe)
---

# normalization

## orderedDedupe

Remove blank variants and keep the first spelling of each unique string.

**Example**

```ts
```typescript
import * as VariantText from "@beep/nlp/VariantText"

const deduped = VariantText.orderedDedupe(["foo", "bar", "foo", "", "baz"])
console.log(deduped) // ["foo", "bar", "baz"]
```
```

**Signature**

```ts
declare const orderedDedupe: (values: ReadonlyArray<string>) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/nlp/src/VariantText.ts#L35)

Since v0.0.0