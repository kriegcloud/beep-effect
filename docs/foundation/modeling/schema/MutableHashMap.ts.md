---
title: MutableHashMap.ts
nav_order: 157
parent: "@beep/schema"
---

## MutableHashMap.ts overview

Schemas for Effect `MutableHashMap` values.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isMutableHashMap](#ismutablehashmap)
- [models](#models)
  - [MutableHashMapIso (type alias)](#mutablehashmapiso-type-alias)
- [validation](#validation)
  - [MutableHashMap](#mutablehashmap)
  - [MutableHashMap (interface)](#mutablehashmap-interface)
  - [MutableHashMapFromSelf](#mutablehashmapfromself)
  - [MutableHashMapFromSelf (interface)](#mutablehashmapfromself-interface)
---

# guards

## isMutableHashMap

Type guard for Effect `MutableHashMap` values.

**Example**

```ts
import { MutableHashMap } from "effect"
import { isMutableHashMap } from "@beep/schema/MutableHashMap"

isMutableHashMap(MutableHashMap.empty())  // true
isMutableHashMap({})                      // false
```

**Signature**

```ts
declare const isMutableHashMap: <Key, Value>(value: unknown) => value is MutableHashMap_.MutableHashMap<Key, Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L146)

Since v0.0.0

# models

## MutableHashMapIso (type alias)

Serializable entry-array iso type for `MutableHashMap` schemas.

**Example**

```ts
import type { MutableHashMapIso } from "@beep/schema/MutableHashMap"
import * as S from "effect/Schema"

const entries = [["key", 1]] satisfies MutableHashMapIso<typeof S.String, typeof S.Finite>
console.log(entries.length)
```

**Signature**

```ts
type MutableHashMapIso<Key, Value> = ReadonlyArray<
  readonly [Key["Iso"], Value["Iso"]]
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L91)

Since v0.0.0

# validation

## MutableHashMap

Schema for decoding entry arrays into `MutableHashMap` instances and encoding
maps back to arrays.

**Example**

```ts
import * as S from "effect/Schema"
import { MutableHashMap } from "@beep/schema/MutableHashMap"

const StringNumberMap = MutableHashMap({
  key: S.String,
  value: S.FiniteFromString
})

const decoded = S.decodeUnknownSync(StringNumberMap)([["a", "1"]])
const encoded = S.encodeSync(StringNumberMap)(decoded)
console.log(encoded)
```

**Signature**

```ts
declare const MutableHashMap: <Key extends S.Top, Value extends S.Top>(options: { readonly key: Key; readonly value: Value; }) => MutableHashMap<Key, Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L289)

Since v0.0.0

## MutableHashMap (interface)

Schema for transforming entry arrays into `MutableHashMap` instances.

**Signature**

```ts
export interface MutableHashMap<Key extends S.Top, Value extends S.Top>
  extends S.decodeTo<
    MutableHashMapFromSelf<S.toType<Key>, S.toType<Value>>,
    S.$Array<MutableHashMapEntry<Key, Value>>
  > {
  readonly key: Key;
  readonly Rebuild: this;
  readonly value: Value;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L119)

Since v0.0.0

## MutableHashMapFromSelf

Schema for validating existing `MutableHashMap` instances while applying the
provided key and value schemas to each entry.

**Example**

```ts
import { MutableHashMap } from "effect"
import * as S from "effect/Schema"
import { MutableHashMapFromSelf } from "@beep/schema/MutableHashMap"

const MapSchema = MutableHashMapFromSelf({ key: S.String, value: S.Finite })
const map = MutableHashMap.fromIterable([["a", 1]])
const decoded = S.decodeUnknownSync(MapSchema)(map)
console.log(decoded)
```

**Signature**

```ts
declare const MutableHashMapFromSelf: <Key extends S.Top, Value extends S.Top>(options: { readonly key: Key; readonly value: Value; }) => MutableHashMapFromSelf<Key, Value>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L171)

Since v0.0.0

## MutableHashMapFromSelf (interface)

Schema for validating an existing `MutableHashMap` instance.

**Signature**

```ts
export interface MutableHashMapFromSelf<Key extends S.Top, Value extends S.Top>
  extends S.declareConstructor<
    MutableHashMap_.MutableHashMap<Key["Type"], Value["Type"]>,
    MutableHashMap_.MutableHashMap<Key["Encoded"], Value["Encoded"]>,
    readonly [Key, Value],
    MutableHashMapIso<Key, Value>
  > {
  readonly key: Key;
  readonly Rebuild: this;
  readonly value: Value;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/MutableHashMap.ts#L101)

Since v0.0.0