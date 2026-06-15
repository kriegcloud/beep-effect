---
title: BaseEntity.ts
nav_order: 15
parent: "@beep/shared-domain"
---

## BaseEntity.ts overview

Product-facing persisted entity base constructor.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [BaseEntity](#baseentity)
- [models](#models)
  - [BaseEntity (type alias)](#baseentity-type-alias)
  - [persisted](#persisted)
- [schemas](#schemas)
  - [fields](#fields)
---

# constructors

## BaseEntity

Product-facing persisted entity base.

**Example**

```ts
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"

console.log(BaseEntity.definition.tableName)
```

**Signature**

```ts
declare const BaseEntity: Omit<EntitySchema.ClassFactory<EntitySchema.TypeShape<{ readonly createdAt: S.DateTimeUtcFromMillis; readonly createdByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; readonly orgId: EntityId<"shared", "organization", "shared_organization", "shared.organization", "SharedOrganization", "SharedOrganizationId">; readonly rowVersion: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "PosInt">>; readonly schemaVersion: AnnotatedSchema<S.TemplateLiteral<readonly [S.String, ".", S.String, ".", S.String]> & { decodeUnknownOption: (u: unknown) => Option<`${string}.${string}.${string}`>; }>; readonly source: AnnotatedSchema<LiteralKit<readonly ["User", "Agent", "Admin", "Application", "System", "Sync", "Connector"], undefined>>; readonly updatedAt: S.DateTimeUtcFromMillis; readonly updatedByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; }>, { readonly createdAt: S.DateTimeUtcFromMillis; readonly createdByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; readonly orgId: EntityId<"shared", "organization", "shared_organization", "shared.organization", "SharedOrganization", "SharedOrganizationId">; readonly rowVersion: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "PosInt">>; readonly schemaVersion: AnnotatedSchema<S.TemplateLiteral<readonly [S.String, ".", S.String, ".", S.String]> & { decodeUnknownOption: (u: unknown) => Option<`${string}.${string}.${string}`>; }>; readonly source: AnnotatedSchema<LiteralKit<readonly ["User", "Agent", "Admin", "Application", "System", "Sync", "Connector"], undefined>>; readonly updatedAt: S.DateTimeUtcFromMillis; readonly updatedByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; }, { readonly createdAt: PersistDescriptorShape<"timestampMillis", "defaultedOnInsert", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly createdByPrincipal: PersistDescriptorShape<"jsonb", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly orgId: PersistDescriptorShape<"entityId", "providedByContext", string | undefined, readonly [{ readonly kind: "btree"; }, { readonly kind: "lookup"; }]>; readonly rowVersion: PersistDescriptorShape<"int", "incrementedOnWrite", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly schemaVersion: PersistDescriptorShape<"text", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly source: PersistDescriptorShape<"literal", "derived", string | undefined, readonly [{ readonly kind: "btree"; }, { readonly kind: "lookup"; }]>; readonly updatedAt: PersistDescriptorShape<"timestampMillis", "updatedOnWrite", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly updatedByPrincipal: PersistDescriptorShape<"jsonb", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; }, string, undefined>, "Class"> & { readonly Class: typeof Class; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/BaseEntity.ts#L230)

Since v0.0.0

# models

## BaseEntity (type alias)

Runtime type for `BaseEntity`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import { BaseEntity } from "@beep/shared-domain/entity/BaseEntity"
import type { BaseEntity as BaseEntityValue } from "@beep/shared-domain/entity/BaseEntity"

const systemPrincipal = {
  component: "Runtime",
  kind: "System"
}

const program = Effect.gen(function* () {
  const entity: BaseEntityValue = yield* S.decodeUnknownEffect(BaseEntity)({
    createdAt: 1,
    createdByPrincipal: systemPrincipal,
    orgId: 1,
    rowVersion: 1,
    schemaVersion: "0.0.0",
    source: "System",
    updatedAt: 2,
    updatedByPrincipal: systemPrincipal
  })
  return entity.rowVersion
})

Effect.runPromise(program)
```

**Signature**

```ts
type BaseEntity = typeof BaseEntity.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/BaseEntity.ts#L267)

Since v0.0.0

## persisted

Physical persistence metadata for BaseEntity invariant fields.

**Example**

```ts
import { persisted } from "@beep/shared-domain/entity/BaseEntity"

console.log(persisted.orgId.storageKind)
```

**Signature**

```ts
declare const persisted: { readonly createdAt: PersistDescriptorShape<"timestampMillis", "defaultedOnInsert", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly createdByPrincipal: PersistDescriptorShape<"jsonb", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly orgId: PersistDescriptorShape<"entityId", "providedByContext", string | undefined, readonly [{ readonly kind: "btree"; }, { readonly kind: "lookup"; }]>; readonly rowVersion: PersistDescriptorShape<"int", "incrementedOnWrite", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly schemaVersion: PersistDescriptorShape<"text", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly source: PersistDescriptorShape<"literal", "derived", string | undefined, readonly [{ readonly kind: "btree"; }, { readonly kind: "lookup"; }]>; readonly updatedAt: PersistDescriptorShape<"timestampMillis", "updatedOnWrite", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; readonly updatedByPrincipal: PersistDescriptorShape<"jsonb", "providedByContext", string | undefined, ReadonlyArray<({ readonly kind: "btree"; } & { readonly kind: "btree"; }) | ({ readonly kind: "gin"; } & { readonly kind: "gin"; }) | ({ readonly kind: "hash"; } & { readonly kind: "hash"; }) | ({ readonly kind: "lookup"; } & { readonly kind: "lookup"; }) | ({ readonly kind: "unique"; } & { readonly kind: "unique"; })> | undefined>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/BaseEntity.ts#L95)

Since v0.0.0

# schemas

## fields

BaseEntity fields shared by every persisted product entity except the
entity-specific `id` and `entityType` fields.

**Example**

```ts
import { fields } from "@beep/shared-domain/entity/BaseEntity"

console.log(fields.createdAt)
```

**Signature**

```ts
declare const fields: { readonly createdAt: S.DateTimeUtcFromMillis; readonly createdByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; readonly orgId: EntityId<"shared", "organization", "shared_organization", "shared.organization", "SharedOrganization", "SharedOrganizationId">; readonly rowVersion: AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "PosInt">>; readonly schemaVersion: AnnotatedSchema<S.TemplateLiteral<readonly [S.String, ".", S.String, ".", S.String]> & { decodeUnknownOption: (u: unknown) => Option<`${string}.${string}.${string}`>; }>; readonly source: AnnotatedSchema<LiteralKit<readonly ["User", "Agent", "Admin", "Application", "System", "Sync", "Connector"], undefined>>; readonly updatedAt: S.DateTimeUtcFromMillis; readonly updatedByPrincipal: S.toTaggedUnion<"kind", readonly [typeof UserPrincipal, typeof ServiceAccountPrincipal, typeof AgentPrincipal, typeof ConnectorAccountPrincipal, typeof SystemPrincipal]>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/BaseEntity.ts#L71)

Since v0.0.0