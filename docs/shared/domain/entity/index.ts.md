---
title: index.ts
nav_order: 18
parent: "@beep/shared-domain"
---

## index.ts overview

Product-facing persisted entity base constructor.

**Example**

```ts
import { BaseEntity } from "@beep/shared-domain/entity"

console.log(BaseEntity.BaseEntity.definition.persisted.createdAt.columnName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [BaseEntity (namespace export)](#baseentity-namespace-export)
  - [EntityId (namespace export)](#entityid-namespace-export)
- [identifiers](#identifiers)
  - [EntityRef (namespace export)](#entityref-namespace-export)
  - [Principal (namespace export)](#principal-namespace-export)
- [schemas](#schemas)
  - [SourceKind (namespace export)](#sourcekind-namespace-export)
  - [primitives (namespace export)](#primitives-namespace-export)
---

# constructors

## BaseEntity (namespace export)

Re-exports all named exports from the "./BaseEntity.ts" module as `BaseEntity`.

**Example**

```ts
import { BaseEntity } from "@beep/shared-domain/entity"

console.log(BaseEntity.BaseEntity.definition.persisted.createdAt.columnName)
```

**Signature**

```ts
export * as BaseEntity from "./BaseEntity.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L21)

Since v0.0.0

## EntityId (namespace export)

Re-exports all named exports from the "./EntityId.ts" module as `EntityId`.

**Example**

```ts
import { EntityId } from "@beep/shared-domain/entity"

console.log(EntityId.EntityIdValue)
```

**Signature**

```ts
export * as EntityId from "./EntityId.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L35)

Since v0.0.0

# identifiers

## EntityRef (namespace export)

Re-exports all named exports from the "./EntityRef.ts" module as `EntityRef`.

**Example**

```ts
import { EntityRef } from "@beep/shared-domain/entity"

console.log(EntityRef.EntityRef)
```

**Signature**

```ts
export * as EntityRef from "./EntityRef.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L49)

Since v0.0.0

## Principal (namespace export)

Re-exports all named exports from the "./Principal.ts" module as `Principal`.

**Example**

```ts
import { Principal } from "@beep/shared-domain/entity"

console.log(Principal.Principal)
```

**Signature**

```ts
export * as Principal from "./Principal.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L63)

Since v0.0.0

# schemas

## SourceKind (namespace export)

Re-exports all named exports from the "./SourceKind.ts" module as `SourceKind`.

**Example**

```ts
import { SourceKind } from "@beep/shared-domain/entity"

console.log(SourceKind.SourceKind)
```

**Signature**

```ts
export * as SourceKind from "./SourceKind.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L91)

Since v0.0.0

## primitives (namespace export)

Re-exports all named exports from the "./primitives.ts" module as `primitives`.

**Example**

```ts
import { primitives } from "@beep/shared-domain/entity"

console.log(primitives.VectorClock)
```

**Signature**

```ts
export * as primitives from "./primitives.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/index.ts#L77)

Since v0.0.0