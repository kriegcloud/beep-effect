---
title: EntityRef.ts
nav_order: 17
parent: "@beep/shared-domain"
---

## EntityRef.ts overview

Storage-neutral polymorphic entity reference.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
  - [makeResult](#makeresult)
- [models](#models)
  - [EntityRef (class)](#entityref-class)
  - [EntityRefFor (type alias)](#entityreffor-type-alias)
  - [EntityType (type alias)](#entitytype-type-alias)
- [schemas](#schemas)
  - [EntityType](#entitytype)
---

# constructors

## make

Build a polymorphic reference for a known entity id schema.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { make } from "@beep/shared-domain/entity/EntityRef"
import { OrganizationId } from "@beep/shared-domain/identity/Shared"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(OrganizationId)(1)
  const ref = make(OrganizationId, id)
  return ref.entityType
})
console.log(program)
```

**Signature**

```ts
declare const make: { <const Entity extends EntityId.Any>(entityId: Entity, id: Entity["Type"]): EntityRefFor<Entity>; <const Entity extends EntityId.Any>(id: Entity["Type"]): (entityId: Entity) => EntityRefFor<Entity>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L215)

Since v0.0.0

## makeResult

Build a polymorphic reference result for a known entity id schema.

**Example**

```ts
import { Effect } from "effect"
import * as Result from "effect/Result"
import * as S from "effect/Schema"
import { makeResult } from "@beep/shared-domain/entity/EntityRef"
import { OrganizationId } from "@beep/shared-domain/identity/Shared"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(OrganizationId)(1)
  const ref = makeResult(OrganizationId, id)
  return Result.isSuccess(ref)
})
console.log(program)
```

**Signature**

```ts
declare const makeResult: { <const Entity extends EntityId.Any>(entityId: Entity, id: Entity["Type"]): Result.Result<EntityRefFor<Entity>, S.SchemaError>; <const Entity extends EntityId.Any>(id: Entity["Type"]): (entityId: Entity) => Result.Result<EntityRefFor<Entity>, S.SchemaError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L167)

Since v0.0.0

# models

## EntityRef (class)

Persisted polymorphic reference encoded as entity type plus numeric id.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId"
import { EntityRef, EntityType } from "@beep/shared-domain/entity/EntityRef"

const program = Effect.gen(function* () {
  const ref = EntityRef.make({
    entityType: yield* S.decodeUnknownEffect(EntityType)("SharedOrganization"),
    id: yield* S.decodeUnknownEffect(EntityIdValue)(1),
  })
  return ref.entityType
})
console.log(program)
```

**Signature**

```ts
declare class EntityRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L94)

Since v0.0.0

## EntityRefFor (type alias)

Entity reference narrowed to a known entity-id schema.

**Example**

```ts
import type { EntityRefFor } from "@beep/shared-domain/entity/EntityRef"
import { OrganizationId } from "@beep/shared-domain/identity/Shared"

type OrganizationRef = EntityRefFor<typeof OrganizationId>
```

**Signature**

```ts
type EntityRefFor<Entity> = Omit<EntityRef, "entityType" | "id"> & {
  readonly entityType: Entity["entityType"] & EntityType;
  readonly id: Entity["Type"];
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L118)

Since v0.0.0

## EntityType (type alias)

Runtime type for `EntityType`.

**Example**

```ts
import type { EntityType } from "@beep/shared-domain/entity/EntityRef"

const printEntityType = (entityType: EntityType) => console.log(entityType)
console.log(printEntityType)
```

**Signature**

```ts
type EntityType = typeof EntityType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L69)

Since v0.0.0

# schemas

## EntityType

Entity type grammar used by polymorphic references.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { EntityType } from "@beep/shared-domain/entity/EntityRef"

const program = Effect.gen(function* () {
  const entityType = yield* S.decodeUnknownEffect(EntityType)("SharedOrganization")
  return entityType
})
console.log(program)
```

**Signature**

```ts
declare const EntityType: AnnotatedSchema<S.brand<S.NonEmptyString, "EntityType">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityRef.ts#L48)

Since v0.0.0