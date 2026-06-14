---
title: index.ts
nav_order: 30
parent: "@beep/shared-domain"
---

## index.ts overview

Shared domain package version.

**Example**

```ts
import { VERSION } from "@beep/shared-domain"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [Aggregates (namespace export)](#aggregates-namespace-export)
- [configuration](#configuration)
  - [VERSION](#version)
- [constructors](#constructors)
  - [BaseEntity (namespace export)](#baseentity-namespace-export)
  - [EntityId (namespace export)](#entityid-namespace-export)
- [entities](#entities)
  - [Entities (namespace export)](#entities-namespace-export)
- [entity-ids](#entity-ids)
  - [Identity (namespace export)](#identity-namespace-export)
- [identifiers](#identifiers)
  - [EntityRef (namespace export)](#entityref-namespace-export)
  - [Principal (namespace export)](#principal-namespace-export)
- [schemas](#schemas)
  - [SourceKind (namespace export)](#sourcekind-namespace-export)
- [value-objects](#value-objects)
  - [Values (namespace export)](#values-namespace-export)
---

# aggregates

## Aggregates (namespace export)

Re-exports all named exports from the "./aggregates/index.ts" module as `Aggregates`.

**Example**

```ts
import { Aggregates } from "@beep/shared-domain"

console.log(Aggregates)
```

**Signature**

```ts
export * as Aggregates from "./aggregates/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L36)

Since v0.0.0

# configuration

## VERSION

Shared domain package version.

**Example**

```ts
import { VERSION } from "@beep/shared-domain"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L21)

Since v0.0.0

# constructors

## BaseEntity (namespace export)

Re-exports all named exports from the "./entity/BaseEntity.ts" module as `BaseEntity`.

**Example**

```ts
import { BaseEntity } from "@beep/shared-domain"

console.log(BaseEntity.BaseEntity.definition.persisted.createdAt.columnName)
```

**Signature**

```ts
export * as BaseEntity from "./entity/BaseEntity.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L64)

Since v0.0.0

## EntityId (namespace export)

Re-exports all named exports from the "./entity/EntityId.ts" module as `EntityId`.

**Example**

```ts
import { EntityId } from "@beep/shared-domain"

console.log(EntityId.EntityIdValue)
```

**Signature**

```ts
export * as EntityId from "./entity/EntityId.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L78)

Since v0.0.0

# entities

## Entities (namespace export)

Re-exports all named exports from the "./entities/index.ts" module as `Entities`.

**Example**

```ts
import { Entities } from "@beep/shared-domain"

console.log(Entities.Organization.Model.definition.tableName)
```

**Signature**

```ts
export * as Entities from "./entities/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L50)

Since v0.0.0

# entity-ids

## Identity (namespace export)

Re-exports all named exports from the "./identity/index.ts" module as `Identity`.

**Example**

```ts
import { Identity } from "@beep/shared-domain"

console.log(Identity.Shared.OrganizationId.resource)
```

**Signature**

```ts
export * as Identity from "./identity/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L134)

Since v0.0.0

# identifiers

## EntityRef (namespace export)

Re-exports all named exports from the "./entity/EntityRef.ts" module as `EntityRef`.

**Example**

```ts
import { EntityRef } from "@beep/shared-domain"

console.log(EntityRef.EntityRef)
```

**Signature**

```ts
export * as EntityRef from "./entity/EntityRef.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L92)

Since v0.0.0

## Principal (namespace export)

Re-exports all named exports from the "./entity/Principal.ts" module as `Principal`.

**Example**

```ts
import { Principal } from "@beep/shared-domain"

console.log(Principal.Principal)
```

**Signature**

```ts
export * as Principal from "./entity/Principal.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L106)

Since v0.0.0

# schemas

## SourceKind (namespace export)

Re-exports all named exports from the "./entity/SourceKind.ts" module as `SourceKind`.

**Example**

```ts
import { SourceKind } from "@beep/shared-domain"

console.log(SourceKind.SourceKind)
```

**Signature**

```ts
export * as SourceKind from "./entity/SourceKind.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L120)

Since v0.0.0

# value-objects

## Values (namespace export)

Re-exports all named exports from the "./values/index.ts" module as `Values`.

**Example**

```ts
import { Values } from "@beep/shared-domain"

console.log(Values.LocalDate.today().toISOString())
```

**Signature**

```ts
export * as Values from "./values/index.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/index.ts#L148)

Since v0.0.0