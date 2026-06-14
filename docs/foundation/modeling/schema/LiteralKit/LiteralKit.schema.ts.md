---
title: LiteralKit.schema.ts
nav_order: 142
parent: "@beep/schema"
---

## LiteralKit.schema.ts overview

Schema-backed literal toolkit helpers for mixed literal types.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LiteralKit](#literalkit)
  - [LiteralKitEnumMappingCoverageError (class)](#literalkitenummappingcoverageerror-class)
  - [LiteralKitEnumMappingDuplicateLiteralError (class)](#literalkitenummappingduplicateliteralerror-class)
  - [LiteralKitKeyCollisionError (class)](#literalkitkeycollisionerror-class)
  - [LiteralKitTaggedUnionLiteralError (class)](#literalkittaggedunionliteralerror-class)
  - [LiteralNotInSetError (class)](#literalnotinseterror-class)
  - [LiteralToKey (type alias)](#literaltokey-type-alias)
- [schemas](#schemas)
  - [LiteralKit (interface)](#literalkit-interface)
- [utilities](#utilities)
  - [matchLiteral](#matchliteral)
---

# models

## LiteralKit

Builds a literal schema kit from a non-empty tuple of mixed literals.

**Example**

```ts
```typescript
import { LiteralKit } from "@beep/schema";
import * as S from "effect/Schema";

const Status = LiteralKit([1, 20n, true, false, "hello"]);

Status.Enum.number1;       // 1
Status.Enum.bigint20n;     // 20n
Status.Enum.true;          // true
Status.is.number1(42);     // false
Status.is.hello("hello");  // true

const result = Status.$match(Status.Enum.number1, {
  number1: () => "one",
  bigint20n: () => "twenty",
  true: () => "yes",
  false: () => "no",
  hello: () => "greeting",
});
console.log(result)

const EventKind = LiteralKit(["created", "deleted"]);

const Event = EventKind.toTaggedUnion("kind")({
  created: {
    id: S.String
  },
  deleted: {
    id: S.String
  }
});
console.log(Event)

const StatusKeys = LiteralKit(
  ["one", "two"],
  [["one", "ONE"], ["two", "TWO"]]
);

StatusKeys.Enum.ONE; // "one"
```
```

**Signature**

```ts
declare const LiteralKit: { <const L extends Literals>(literals: L): LiteralKit<L>; <const L extends Literals, const M extends EnumMappings<L>>(literals: L, enumMapping: M & ValidEnumMapping<L, M>): LiteralKit<L, M>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L726)

Since v0.0.0

## LiteralKitEnumMappingCoverageError (class)

Error thrown when a manual enum mapping does not exactly cover the provided
literal set (has missing or unexpected entries).

**Example**

```ts
import { LiteralKitEnumMappingCoverageError } from "@beep/schema/LiteralKit"

console.log(LiteralKitEnumMappingCoverageError)
```

**Signature**

```ts
declare class LiteralKitEnumMappingCoverageError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L437)

Since v0.0.0

## LiteralKitEnumMappingDuplicateLiteralError (class)

Error thrown when the same source literal appears more than once in a manual
enum mapping provided to `LiteralKit`.

**Example**

```ts
import { LiteralKitEnumMappingDuplicateLiteralError } from "@beep/schema/LiteralKit"

console.log(LiteralKitEnumMappingDuplicateLiteralError)
```

**Signature**

```ts
declare class LiteralKitEnumMappingDuplicateLiteralError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L421)

Since v0.0.0

## LiteralKitKeyCollisionError (class)

Error thrown when different literals encode to the same helper key via
`LiteralToKey` mapping.

**Example**

```ts
import { LiteralKitKeyCollisionError } from "@beep/schema/LiteralKit"

console.log(LiteralKitKeyCollisionError)
```

**Signature**

```ts
declare class LiteralKitKeyCollisionError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L403)

Since v0.0.0

## LiteralKitTaggedUnionLiteralError (class)

Error thrown when `LiteralKit.toTaggedUnion` receives a literal that cannot
act as an object property key.

**Example**

```ts
import { LiteralKitTaggedUnionLiteralError } from "@beep/schema/LiteralKit"

console.log(LiteralKitTaggedUnionLiteralError)
```

**Signature**

```ts
declare class LiteralKitTaggedUnionLiteralError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L453)

Since v0.0.0

## LiteralNotInSetError (class)

Error thrown when an input value is not found in the provided literals
array, typically when `omitOptions` removes every literal and cannot return
a non-empty result.

**Example**

```ts
import { LiteralNotInSetError } from "@beep/schema/LiteralKit"

console.log(LiteralNotInSetError)
```

**Signature**

```ts
declare class LiteralNotInSetError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L387)

Since v0.0.0

## LiteralToKey (type alias)

Maps a literal value to its string key representation used in `Enum`, `is`,
`$match`, and `thunk` objects.

Key format by type:
- boolean: `"true"` or `"false"`
- bigint: `"bigint${value}n"` (e.g., `1n` becomes `"bigint1n"`)
- number: `"number${value}"` (e.g., `200` becomes `"number200"`)
- string: as-is (e.g., `"pending"` stays `"pending"`)

**Example**

```ts
import type { LiteralToKey } from "@beep/schema/LiteralKit"

const key = "number200" satisfies LiteralToKey<200>
console.log(key)
```

**Signature**

```ts
type LiteralToKey<L> = L extends boolean
  ? L extends true
    ? "true"
    : "false"
  : L extends bigint
    ? `bigint${L}n`
    : L extends number
      ? `number${L}`
      : L & string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L46)

Since v0.0.0

# schemas

## LiteralKit (interface)

Runtime literal kit returned by `LiteralKit`.

**Example**

```ts
import { LiteralKit, type LiteralKit as LiteralKitType } from "@beep/schema/LiteralKit"

const Status = LiteralKit(["ready", "blocked"])
console.log(Status.Enum.ready satisfies LiteralKitType<readonly ["ready", "blocked"]>["Enum"]["ready"])
```

**Signature**

```ts
export interface LiteralKit<L extends Literals, M extends EnumMappings<L> | undefined = undefined>
  extends LiteralKitBase<L, M> {
  readonly Rebuild: LiteralKit<L, M>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L668)

Since v0.0.0

# utilities

## matchLiteral

Converts a literal value to its string key at runtime using the
`LiteralToKey` mapping rules.

**Example**

```ts
import { matchLiteral } from "@beep/schema/LiteralKit"

matchLiteral("pending")  // "pending"
matchLiteral(200)        // "number200"
matchLiteral(true)       // "true"
matchLiteral(1n)         // "bigint1n"
```

**Signature**

```ts
declare const matchLiteral: <L extends SchemaAST.LiteralValue>(literal: L) => LiteralToKey<L>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/LiteralKit/LiteralKit.schema.ts#L225)

Since v0.0.0