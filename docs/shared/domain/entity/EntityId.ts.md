---
title: EntityId.ts
nav_order: 16
parent: "@beep/shared-domain"
---

## EntityId.ts overview

Shared-kernel entity identifier constructor.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [factory](#factory)
- [models](#models)
  - [Any (type alias)](#any-type-alias)
  - [Brand (type alias)](#brand-type-alias)
  - [Definition (class)](#definition-class)
  - [DefinitionFor (type alias)](#definitionfor-type-alias)
  - [EntityId (type alias)](#entityid-type-alias)
  - [EntityIdValue (type alias)](#entityidvalue-type-alias)
  - [EntityIdValueFor (type alias)](#entityidvaluefor-type-alias)
  - [EntityType (type alias)](#entitytype-type-alias)
  - [Options (class)](#options-class)
  - [OptionsInput (type alias)](#optionsinput-type-alias)
  - [Resource (type alias)](#resource-type-alias)
  - [TableName (type alias)](#tablename-type-alias)
- [schemas](#schemas)
  - [EntityIdValue](#entityidvalue)
---

# constructors

## factory

Build a slice-scoped entity id maker.

**Example**

```ts
import { $SharedDomainId } from "@beep/identity/packages"
import * as EntityId from "@beep/shared-domain/entity/EntityId"

const $I = $SharedDomainId.create("identity/Shared")
const make = EntityId.factory("shared", $I)
const OrganizationId = make("organization")

console.log(OrganizationId.tableName)
```

**Signature**

```ts
declare const factory: Factory
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L473)

Since v0.0.0

# models

## Any (type alias)

Any entity id schema produced by `factory`.

**Example**

```ts
import type { Any } from "@beep/shared-domain/entity/EntityId"

declare const entityId: Any
console.log(entityId.resource)
```

**Signature**

```ts
type Any = EntityId<string, string, string, string, string, string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L349)

Since v0.0.0

## Brand (type alias)

Default schema brand derived from a slice and entity segment.

**Example**

```ts
import type { Brand } from "@beep/shared-domain/entity/EntityId"

const brand: Brand<"shared", "organization"> = "SharedOrganizationId"
console.log(brand)
```

**Signature**

```ts
type `${_PascalCase<DelimiterCase<Slice, "_", { splitOnPunctuation: false; splitOnNumbers: false; }>, { splitOnNumbers: true; splitOnPunctuation: false; preserveConsecutiveUppercase: false; preserveLeadingUnderscores: false; }>}${_PascalCase<DelimiterCase<Name, "_", { splitOnPunctuation: false; splitOnNumbers: false; }>, { splitOnNumbers: true; splitOnPunctuation: false; preserveConsecutiveUppercase: false; preserveLeadingUnderscores: false; }>}Id` = `${EntityType<Slice, Name>}Id`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L181)

Since v0.0.0

## Definition (class)

Materialized entity-id definition metadata.

**Example**

```ts
import { Definition } from "@beep/shared-domain/entity/EntityId"

declare const definition: Definition
console.log(definition.tableName)
```

**Signature**

```ts
declare class Definition
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L242)

Since v0.0.0

## DefinitionFor (type alias)

Literal-preserving entity-id definition metadata.

**Example**

```ts
import type { DefinitionFor } from "@beep/shared-domain/entity/EntityId"

type OrganizationDefinition = DefinitionFor<"shared", "organization">

const tableName: OrganizationDefinition["tableName"] = "shared_organization"
console.log(tableName)
```

**Signature**

```ts
type DefinitionFor<Slice, Name, TTableName, TResource, TEntityType, TBrand> = Omit<Definition, "brand" | "entityType" | "name" | "resource" | "slice" | "tableName"> & {
  readonly brand: TBrand;
  readonly entityType: TEntityType;
  readonly name: Name;
  readonly resource: TResource;
  readonly slice: Slice;
  readonly tableName: TTableName;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L274)

Since v0.0.0

## EntityId (type alias)

Branded schema with deterministic entity metadata statics.

**Example**

```ts
import type { EntityId } from "@beep/shared-domain/entity/EntityId"

declare const entityId: EntityId<"shared", "organization">
console.log(entityId.tableName)
```

**Signature**

```ts
type EntityId<Slice, Name, TTableName, TResource, TEntityType, TBrand> = S.Codec<EntityIdValueFor<TBrand>, number> &
  EntityIdStatics<Slice, Name, TTableName, TResource, TEntityType, TBrand>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L304)

Since v0.0.0

## EntityIdValue (type alias)

Runtime type for `EntityIdValue`.

**Example**

```ts
import type { EntityIdValue } from "@beep/shared-domain/entity/EntityId"

declare const id: EntityIdValue
console.log(id)
```

**Signature**

```ts
type EntityIdValue = typeof EntityIdValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L71)

Since v0.0.0

## EntityIdValueFor (type alias)

Entity id value branded with the concrete entity-id brand.

**Example**

```ts
import type { EntityIdValueFor } from "@beep/shared-domain/entity/EntityId"

declare const id: EntityIdValueFor<"SharedOrganizationId">
console.log(id)
```

**Signature**

```ts
type EntityIdValueFor<TBrand> = BrandNS.Branded<EntityIdValue, TBrand>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L87)

Since v0.0.0

## EntityType (type alias)

Default entity type derived from a slice and entity segment.

**Example**

```ts
import type { EntityType } from "@beep/shared-domain/entity/EntityId"

const entityType: EntityType<"shared", "organization"> = "SharedOrganization"
console.log(entityType)
```

**Signature**

```ts
type `${_PascalCase<DelimiterCase<Slice, "_", { splitOnPunctuation: false; splitOnNumbers: false; }>, { splitOnNumbers: true; splitOnPunctuation: false; preserveConsecutiveUppercase: false; preserveLeadingUnderscores: false; }>}${_PascalCase<DelimiterCase<Name, "_", { splitOnPunctuation: false; splitOnNumbers: false; }>, { splitOnNumbers: true; splitOnPunctuation: false; preserveConsecutiveUppercase: false; preserveLeadingUnderscores: false; }>}` = `${SnakeToPascal<Slice>}${SnakeToPascal<Name>}`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L165)

Since v0.0.0

## Options (class)

Constrained metadata overrides accepted by `factory`.

**Example**

```ts
import { Options } from "@beep/shared-domain/entity/EntityId"

const options = Options.make({ tableName: "shared_organization" })
console.log(options.tableName)
```

**Signature**

```ts
declare class Options
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L103)

Since v0.0.0

## OptionsInput (type alias)

Constructor input for `Options`.

**Example**

```ts
import type { OptionsInput } from "@beep/shared-domain/entity/EntityId"

const input: OptionsInput = { tableName: "shared_organization" }
console.log(input.tableName)
```

**Signature**

```ts
type OptionsInput = typeof Options.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L197)

Since v0.0.0

## Resource (type alias)

Default permission resource derived from a slice and entity segment.

**Example**

```ts
import type { Resource } from "@beep/shared-domain/entity/EntityId"

const resource: Resource<"shared", "organization"> = "shared.organization"
console.log(resource)
```

**Signature**

```ts
type `${Slice}.${Name}` = `${Slice}.${Name}`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L146)

Since v0.0.0

## TableName (type alias)

Default SQL table name derived from a slice and entity segment.

**Example**

```ts
import type { TableName } from "@beep/shared-domain/entity/EntityId"

const tableName: TableName<"shared", "organization"> = "shared_organization"
console.log(tableName)
```

**Signature**

```ts
type `${Slice}_${Name}` = `${Slice}_${Name}`
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L130)

Since v0.0.0

# schemas

## EntityIdValue

Storage-neutral positive integer used by every v1 persisted entity id.

**Example**

```ts
import { Effect } from "effect"
import { EntityIdValue } from "@beep/shared-domain/entity/EntityId"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(EntityIdValue)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
declare const EntityIdValue: AnnotatedSchema<S.brand<S.brand<S.brand<S.Int, "Int">, "PosInt">, "EntityIdValue">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/EntityId.ts#L39)

Since v0.0.0