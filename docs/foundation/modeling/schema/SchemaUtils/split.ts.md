---
title: split.ts
nav_order: 185
parent: "@beep/schema"
---

## split.ts overview

Manual Effect v4 replacement for the removed v3 `Schema.split` helper.

The returned helper keeps the encoded surface as a string, then transforms
that string into a decoded `ReadonlyArray<string>` by splitting on the
provided separator.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [split](#split)
---

# utilities

## split

Build a schema that decodes delimited text into a readonly string array.

This helper follows the manual v4 migration pattern described in the Effect
Schema migration guide. It is not the old v3 `Schema.split` API. Instead, it
is a local utility that:

1. Accepts a string boundary on the encoded side.
2. Decodes that string into `ReadonlyArray<string>` with `effect/String`.
3. Encodes the readonly array back into a string with `effect/Array`.

The transformation preserves ordinary split and join semantics. It does not
trim entries, drop empty segments, or normalize whitespace.

**Example**

```ts
import * as S from "effect/Schema";
import { split } from "@beep/schema/SchemaUtils/split";

const CsvCells = split(",");
const decodeCsvCells = S.decodeSync(CsvCells);
const encodeCsvCells = S.encodeSync(CsvCells);

console.log(decodeCsvCells("red,green,blue")); // ["red", "green", "blue"]
console.log(encodeCsvCells(["red", "green", "blue"])); // "red,green,blue"
```

**Signature**

```ts
declare const split: (separator: string) => S.decodeTo<S.$Array<S.String>, S.String, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/split.ts#L48)

Since v0.0.0