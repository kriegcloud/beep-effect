---
title: MappedLiteralKit.schema.ts
nav_order: 147
parent: "@beep/schema"
---

## MappedLiteralKit.schema.ts overview

Schema-backed mapped literal toolkit helpers for reversible literal pairs.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [MappedLiteralDuplicateError (class)](#mappedliteralduplicateerror-class)
  - [MappedLiteralKit](#mappedliteralkit)
- [schemas](#schemas)
  - [MappedLiteralKit (interface)](#mappedliteralkit-interface)
---

# models

## MappedLiteralDuplicateError (class)

Error thrown when `MappedLiteralKit` receives duplicate literals on the
`from` or `to` side of the mapping.

**Example**

```ts
import { MappedLiteralDuplicateError } from "@beep/schema/MappedLiteralKit"

console.log(MappedLiteralDuplicateError)
```

**Signature**

```ts
declare class MappedLiteralDuplicateError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts#L97)

Since v0.0.0

## MappedLiteralKit

Builds a mapped literal schema kit from a non-empty tuple of literal pairs.

Requires one-to-one mappings. Exact duplicate literals on either side throw
`MappedLiteralDuplicateError`. Helper-key collisions on either side
throw `LiteralKitKeyCollisionError`.

**Example**

```ts
import * as S from "effect/Schema"
import { MappedLiteralKit } from "@beep/schema/MappedLiteralKit"

const HttpStatus = MappedLiteralKit([
  ["OK", "200"],
  ["NOT_FOUND", "404"]
] as const)

S.decodeSync(HttpStatus)("OK")       // "200"
S.encodeSync(HttpStatus)("200")      // "OK"
HttpStatus.From.Enum.OK              // "200"
HttpStatus.To.Enum["200"]            // "OK"
```

**Signature**

```ts
declare const MappedLiteralKit: <const M extends MappedPairs>(mappings: M) => MappedLiteralKit<M>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts#L342)

Since v0.0.0

# schemas

## MappedLiteralKit (interface)

Runtime mapped literal kit returned by `MappedLiteralKit`.

**Example**

```ts
import { MappedLiteralKit, type MappedLiteralKit as MappedLiteralKitType } from "@beep/schema/MappedLiteralKit"

const Status = MappedLiteralKit([["OK", 200], ["NOT_FOUND", 404]] as const)
console.log(Status.Pairs.length satisfies MappedLiteralKitType<typeof Status.Pairs>["Pairs"]["length"])
```

**Signature**

```ts
export interface MappedLiteralKit<M extends MappedPairs> extends MappedLiteralKitBase<M> {
  annotate(annotations: S.Annotations.Bottom<this["Type"], this["~type.parameters"]>): MappedLiteralKit<M>;
  readonly Rebuild: MappedLiteralKit<M>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MappedLiteralKit/MappedLiteralKit.schema.ts#L311)

Since v0.0.0