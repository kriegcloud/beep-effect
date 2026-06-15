---
title: toEquivalence.ts
nav_order: 186
parent: "@beep/schema"
---

## toEquivalence.ts overview

Derive a dual-call equivalence function from an Effect schema.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DualEquivalence (type alias)](#dualequivalence-type-alias)
- [utilities](#utilities)
  - [toEquivalence](#toequivalence)
---

# models

## DualEquivalence (type alias)

Dual-call equivalence function produced by `toEquivalence`.

A dual equivalence compares two schema-decoded values directly, or accepts
the right-hand value first and returns a pipe-friendly comparator for the
left-hand value.

**Example**

```ts
import * as S from "effect/Schema"
import { toEquivalence, type DualEquivalence } from "@beep/schema/SchemaUtils/toEquivalence"

const sameString: DualEquivalence<string> = toEquivalence(S.String)

console.log(sameString("docs", "docs")) // true
console.log(sameString("tests")("docs")) // false
```

**Signature**

```ts
type DualEquivalence<A> = {
  (self: A, that: A): boolean;
  (that: A): (self: A) => boolean;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/toEquivalence.ts#L32)

Since v0.0.0

# utilities

## toEquivalence

Create a schema-backed equivalence function with data-first and data-last
call signatures.

The returned function delegates value comparison to `S.toEquivalence(schema)`
while adding a pipe-friendly unary form. Use this when a schema-modeled
value should be compared according to the schema rather than ad-hoc
equality checks.

**Example**

```ts
import { pipe } from "effect"
import * as S from "effect/Schema"
import { toEquivalence } from "@beep/schema/SchemaUtils/toEquivalence"

const sameTags = toEquivalence(S.Array(S.String))

console.log(sameTags(["docs", "tests"], ["docs", "tests"])) // true
console.log(pipe(["docs", "tests"], sameTags(["docs", "lint"]))) // false
```

**Signature**

```ts
declare const toEquivalence: <A>(schema: S.Schema<A>) => DualEquivalence<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/toEquivalence.ts#L64)

Since v0.0.0