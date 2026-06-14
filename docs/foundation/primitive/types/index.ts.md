---
title: index.ts
nav_order: 1
parent: "@beep/types"
---

## index.ts overview

Array utility types.

**Example**

```ts
import type { TArray } from "@beep/types"

type Element = TArray.Elem<readonly ["id", "name"]>

const element: Element = "id"
console.log(element)
```

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [TArray (namespace export)](#tarray-namespace-export)
  - [TString (namespace export)](#tstring-namespace-export)
  - [TUnsafe (namespace export)](#tunsafe-namespace-export)
  - [TUtils (namespace export)](#tutils-namespace-export)
---

# utilities

## TArray (namespace export)

Re-exports all named exports from the "./TArray.types.js" module as `TArray`.

**Example**

```ts
import type { TArray } from "@beep/types"

type Element = TArray.Elem<readonly ["id", "name"]>

const element: Element = "id"
console.log(element)
```

**Signature**

```ts
export * as TArray from "./TArray.types.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/index.ts#L39)

Since v0.0.0

## TString (namespace export)

Re-exports all named exports from the "./TString.types.js" module as `TString`.

**Example**

```ts
import type { TString } from "@beep/types"

type Name = TString.NonEmpty<"Entity">

const name: Name = "Entity"
console.log(name)
```

**Signature**

```ts
export * as TString from "./TString.types.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/index.ts#L56)

Since v0.0.0

## TUnsafe (namespace export)

Re-exports all named exports from the "./TUnsafe.types.js" module as `TUnsafe`.

**Example**

```ts
import type { TUnsafe } from "@beep/types"

const log = (value: TUnsafe.Any) => console.log(value)
log("hello")
```

**Signature**

```ts
export * as TUnsafe from "./TUnsafe.types.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/index.ts#L71)

Since v0.0.0

## TUtils (namespace export)

Re-exports all named exports from the "./TUtils.types.js" module as `TUtils`.

**Example**

```ts
import type { TUtils } from "@beep/types"

type EntityShape = TUtils.Simplify<{ readonly id: string } & { readonly name: string }>

const entity: EntityShape = { id: "entity", name: "Mixin" }
console.log(entity)
```

**Signature**

```ts
export * as TUtils from "./TUtils.types.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/primitive/types/src/index.ts#L88)

Since v0.0.0