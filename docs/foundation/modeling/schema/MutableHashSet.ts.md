---
title: MutableHashSet.ts
nav_order: 158
parent: "@beep/schema"
---

## MutableHashSet.ts overview

Schemas for Effect `MutableHashSet` values.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isMutableHashSet](#ismutablehashset)
- [models](#models)
  - [MutableHashSetIso (type alias)](#mutablehashsetiso-type-alias)
- [validation](#validation)
  - [MutableHashSet](#mutablehashset)
  - [MutableHashSet (interface)](#mutablehashset-interface)
  - [MutableHashSetFromSelf](#mutablehashsetfromself)
  - [MutableHashSetFromSelf (interface)](#mutablehashsetfromself-interface)
---

# guards

## isMutableHashSet

Type guard for Effect `MutableHashSet` values.

**Example**

```ts
import { MutableHashSet } from "effect"
import { isMutableHashSet } from "@beep/schema/MutableHashSet"

isMutableHashSet(MutableHashSet.empty())  // true
isMutableHashSet(new Set())               // false
```

**Signature**

```ts
declare const isMutableHashSet: <Value>(value: unknown) => value is MutableHashSet_.MutableHashSet<Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L111)

Since v0.0.0

# models

## MutableHashSetIso (type alias)

Iso representation (serializable value array) used by
`MutableHashSetFromSelf` for round-tripping.

**Example**

```ts
import type { MutableHashSetIso } from "@beep/schema/MutableHashSet"
import * as S from "effect/Schema"

const values = ["a", "b"] satisfies MutableHashSetIso<typeof S.String>
console.log(values.length)
```

**Signature**

```ts
type MutableHashSetIso<Value> = ReadonlyArray<Value["Iso"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L63)

Since v0.0.0

# validation

## MutableHashSet

Schema for decoding arrays into `MutableHashSet` instances and encoding sets
back to arrays.

**Example**

```ts
import * as S from "effect/Schema"
import { MutableHashSet } from "@beep/schema/MutableHashSet"

const StringSet = MutableHashSet(S.String)

const decoded = S.decodeUnknownSync(StringSet)(["a", "b", "a"])
const encoded = S.encodeSync(StringSet)(decoded)
console.log(encoded)
```

**Signature**

```ts
declare const MutableHashSet: <Value extends S.Top>(value: Value) => MutableHashSet<Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L244)

Since v0.0.0

## MutableHashSet (interface)

Schema for transforming arrays into `MutableHashSet` instances.

**Signature**

```ts
export interface MutableHashSet<Value extends S.Top>
  extends S.decodeTo<MutableHashSetFromSelf<S.toType<Value>>, S.$Array<Value>> {
  readonly Rebuild: this;
  readonly value: Value;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L88)

Since v0.0.0

## MutableHashSetFromSelf

Schema for validating existing `MutableHashSet` instances while applying the
provided member schema to each element.

**Example**

```ts
import { MutableHashSet } from "effect"
import * as S from "effect/Schema"
import { MutableHashSetFromSelf } from "@beep/schema/MutableHashSet"

const SetSchema = MutableHashSetFromSelf(S.String)
const set = MutableHashSet.fromIterable(["a", "b"])
const decoded = S.decodeUnknownSync(SetSchema)(set)
console.log(decoded)
```

**Signature**

```ts
declare const MutableHashSetFromSelf: <Value extends S.Top>(value: Value) => MutableHashSetFromSelf<Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L136)

Since v0.0.0

## MutableHashSetFromSelf (interface)

Schema for validating an existing `MutableHashSet` instance.

**Signature**

```ts
export interface MutableHashSetFromSelf<Value extends S.Top>
  extends S.declareConstructor<
    MutableHashSet_.MutableHashSet<Value["Type"]>,
    MutableHashSet_.MutableHashSet<Value["Encoded"]>,
    readonly [Value],
    MutableHashSetIso<Value>
  > {
  readonly Rebuild: this;
  readonly value: Value;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashSet.ts#L71)

Since v0.0.0