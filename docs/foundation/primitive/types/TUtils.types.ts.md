---
title: TUtils.types.ts
nav_order: 5
parent: "@beep/types"
---

## TUtils.types.ts overview

Converts a union type into an intersection type.

**Example**

```ts
import type { TUtils } from "@beep/types"

type Combined = TUtils.UnionToIntersection<
  { readonly id: string } | { readonly name: string }
>

const combined: Combined = { id: "entity", name: "Mixin" }
console.log(combined)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [Simplify (type alias)](#simplify-type-alias)
  - [UnionToIntersection (type alias)](#uniontointersection-type-alias)
---

# utilities

## Simplify (type alias)

Expands an object type into a readable readonly property map.

**Example**

```ts
import type { TUtils } from "@beep/types"

type EntityShape = TUtils.Simplify<
  { readonly id: string } & { readonly name: string }
>

const entity: EntityShape = { id: "entity", name: "Mixin" }
console.log(entity)
```

**Signature**

```ts
type { readonly [K in keyof T]: T[K]; } = { readonly [K in keyof T]: T[K] } & {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TUtils.types.ts#L52)

Since v0.0.0

## UnionToIntersection (type alias)

Converts a union type into an intersection type.

**Example**

```ts
import type { TUtils } from "@beep/types"

type Combined = TUtils.UnionToIntersection<
  { readonly id: string } | { readonly name: string }
>

const combined: Combined = { id: "entity", name: "Mixin" }
console.log(combined)
```

**Signature**

```ts
type UnionToIntersection<Union> = (Union extends unknown ? (value: Union) => void : never) extends (
  value: infer Intersection
) => void
  ? Intersection
  : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/TUtils.types.ts#L27)

Since v0.0.0