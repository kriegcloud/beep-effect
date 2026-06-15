---
title: EntitySchema.factory.ts
nav_order: 69
parent: "@beep/schema"
---

## EntitySchema.factory.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [ClassFactory](#classfactory)
  - [ClassFactory (type alias)](#classfactory-type-alias)
- [getters](#getters)
  - [getDefinition](#getdefinition)
---

# constructors

## ClassFactory

Build an entity schema class factory with invariant fields.

**Example**

```ts
import { ClassFactory, persist } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const Account = ClassFactory("Account")({
  fields: { name: S.String },
  persisted: { name: persist.text() }
})

console.log(Account.definition.tableName)
```

**Signature**

```ts
declare const ClassFactory: (identifier: string) => <const FieldMap extends EntityFieldInputs, const Persisted extends PersistedFor<FieldMap>, const TableName extends string = string, const EntityId extends EntityIdLike | undefined = undefined>(input: ClassInput<FieldMap, Persisted, TableName, EntityId>, annotations?: SchemaAnnotations) => ClassFactory<TypeShape<FieldMap>, FieldMap, Persisted, TableName, EntityId>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.factory.ts#L561)

Since v0.0.0

## ClassFactory (type alias)

Class factory with inherited invariant fields.

**Example**

```ts
import type { ClassFactory } from "@beep/schema/EntitySchema"

declare const factory: ClassFactory<unknown, {}, {}, string, undefined>
console.log(factory.ast._tag)
```

**Signature**

```ts
type ClassFactory<Self, FieldMap, Persisted, TableName, EntityId> = EntityClass<Self, FieldMap, Persisted, {}, TableName, EntityId> & {
  readonly Class: <Child = never>(
    identifier: string
  ) => <
    const ChildFields extends EntityFieldInputs,
    const ChildPersisted extends PersistedFor<ChildFields>,
    const ChildTableName extends string = string,
    const ChildEntityId extends EntityIdLike | undefined = undefined,
  >(
    input: ClassInput<ChildFields, ChildPersisted, ChildTableName, ChildEntityId>,
    annotations?: SchemaAnnotations
  ) => [Child] extends [never]
    ? "Missing `Child` generic - use `BaseEntity.Class<Child>(...)`"
    : EntityClass<
        Child,
        Assign<FieldMap, ChildFields>,
        AssignedPersisted<FieldMap, Persisted, ChildFields, ChildPersisted>,
        Self,
        ChildTableName,
        ChildEntityId
      >;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.factory.ts#L58)

Since v0.0.0

# getters

## getDefinition

Retrieve entity metadata from schema annotations or class statics.

**Example**

```ts
import { ClassFactory, getDefinition, persist } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const Account = ClassFactory("Account")({
  fields: { name: S.String },
  persisted: { name: persist.text() }
})

console.log(getDefinition(Account).tableName)
```

**Signature**

```ts
declare const getDefinition: <Entity extends EntityClass.Any>(entity: Entity) => EntityClass.DefinitionOf<Entity>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.factory.ts#L595)

Since v0.0.0