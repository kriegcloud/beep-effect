---
title: EntitySchema.definition.ts
nav_order: 68
parent: "@beep/schema"
---

## EntitySchema.definition.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [assignEntityParts](#assignentityparts)
  - [defineClassInput](#defineclassinput)
- [models](#models)
  - [Assign (type alias)](#assign-type-alias)
  - [AssignPersisted (type alias)](#assignpersisted-type-alias)
  - [AssignedEntityParts (type alias)](#assignedentityparts-type-alias)
  - [AssignedPersisted (type alias)](#assignedpersisted-type-alias)
  - [ClassInput (type alias)](#classinput-type-alias)
  - [ColumnNameFor (type alias)](#columnnamefor-type-alias)
  - [Definition (type alias)](#definition-type-alias)
  - [EncodedShape (type alias)](#encodedshape-type-alias)
  - [EntityClass (type alias)](#entityclass-type-alias)
  - [EntityClass (namespace)](#entityclass-namespace)
    - [Any (type alias)](#any-type-alias)
    - [DefinitionOf (type alias)](#definitionof-type-alias)
  - [LastPathSegment (type alias)](#lastpathsegment-type-alias)
  - [SchemaAnnotations (type alias)](#schemaannotations-type-alias)
  - [SnakeCase (type alias)](#snakecase-type-alias)
  - [TableNameFromIdentifier (type alias)](#tablenamefromidentifier-type-alias)
  - [TypeShape (type alias)](#typeshape-type-alias)
  - [VariantFieldFor (type alias)](#variantfieldfor-type-alias)
  - [VariantFieldForInput (type alias)](#variantfieldforinput-type-alias)
  - [VariantFieldsFor (type alias)](#variantfieldsfor-type-alias)
---

# constructors

## assignEntityParts

Compose field and persistence maps together so their correlation is checked
at the call site and preserved for downstream class factories.

**Example**

```ts
import * as S from "effect/Schema"
import { assignEntityParts } from "@beep/schema/EntitySchema"

const parts = assignEntityParts({
  baseFields: {},
  basePersisted: {},
  extensionFields: { name: S.String },
  extensionPersisted: { name: { storageKind: "text", valueStrategy: "provided" } },
})
console.log(Object.keys(parts.fields))
```

**Signature**

```ts
declare const assignEntityParts: <const BaseFields extends EntityFieldInputs, const BasePersisted extends PersistedFor<BaseFields>, const ExtensionFields extends EntityFieldInputs, const ExtensionPersisted extends PersistedMap>(input: { readonly baseFields: BaseFields; readonly basePersisted: BasePersisted; readonly extensionFields: ExtensionFields; readonly extensionPersisted: ExtensionPersisted; }) => AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L483)

Since v0.0.0

## defineClassInput

Preserve a checked class input while letting callers keep `const` inference.

**Example**

```ts
import { defineClassInput } from "@beep/schema/EntitySchema"

const input = defineClassInput({ fields: {}, persisted: {} })
console.log(Object.keys(input.fields))
```

**Signature**

```ts
declare const defineClassInput: <const FieldMap extends EntityFieldInputs, const Persisted extends PersistedFor<FieldMap>, const TableName extends string = string, const EntityId extends EntityIdLike | undefined = undefined>(input: ClassInput<FieldMap, Persisted, TableName, EntityId>) => ClassInput<FieldMap, Persisted, TableName, EntityId>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L227)

Since v0.0.0

# models

## Assign (type alias)

Assign fields with right-hand override.

**Example**

```ts
import * as S from "effect/Schema"
import type { Assign } from "@beep/schema/EntitySchema"

type Fields = Assign<{ readonly id: typeof S.String }, { readonly name: typeof S.String }>
console.log({ id: S.String, name: S.String } satisfies Fields)
```

**Signature**

```ts
type { [K in keyof { [K in keyof (keyof Base & keyof Extension extends never ? Base & Extension : Omit<Base, keyof Base & keyof Extension> & Extension)]: (keyof Base & keyof Extension extends never ? Base & Extension : Omit<Base, keyof Base & keyof Extension> & Extension)[K]; }]: { [K in keyof (keyof Base & keyof Extension extends never ? Base & Extension : Omit<Base, keyof Base & keyof Extension> & Extension)]: (keyof Base & keyof Extension extends never ? Base & Extension : Omit<Base, keyof Base & keyof Extension> & Extension)[K]; }[K]; } = Simplify<
  StructAssign<Base, Extension>
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L390)

Since v0.0.0

## AssignPersisted (type alias)

Assign persisted maps with right-hand override.

**Example**

```ts
import type { AssignPersisted } from "@beep/schema/EntitySchema"

type Persisted = AssignPersisted<{}, {}>
console.log({} satisfies Persisted)
```

**Signature**

```ts
type { [K in keyof { [K in keyof (keyof BasePersisted & keyof ExtensionPersisted extends never ? BasePersisted & ExtensionPersisted : Omit<BasePersisted, keyof BasePersisted & keyof ExtensionPersisted> & ExtensionPersisted)]: (keyof BasePersisted & keyof ExtensionPersisted extends never ? BasePersisted & ExtensionPersisted : Omit<BasePersisted, keyof BasePersisted & keyof ExtensionPersisted> & ExtensionPersisted)[K]; }]: { [K in keyof (keyof BasePersisted & keyof ExtensionPersisted extends never ? BasePersisted & ExtensionPersisted : Omit<BasePersisted, keyof BasePersisted & keyof ExtensionPersisted> & ExtensionPersisted)]: (keyof BasePersisted & keyof ExtensionPersisted extends never ? BasePersisted & ExtensionPersisted : Omit<BasePersisted, keyof BasePersisted & keyof ExtensionPersisted> & ExtensionPersisted)[K]; }[K]; } = Simplify<
  StructAssign<BasePersisted, ExtensionPersisted>
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L408)

Since v0.0.0

## AssignedEntityParts (type alias)

Field and persistence maps produced by composing an inherited entity shape
with a child entity shape.

**Example**

```ts
import * as S from "effect/Schema"
import type { AssignedEntityParts } from "@beep/schema/EntitySchema"

type Parts = AssignedEntityParts<{ readonly id: typeof S.String }, {}, { readonly name: typeof S.String }, {}>
console.log({ fields: { id: S.String, name: S.String }, persisted: {} } as Parts)
```

**Signature**

```ts
type AssignedEntityParts<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted> = {
  readonly fields: Assign<BaseFields, ExtensionFields>;
  readonly persisted: AssignedPersisted<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L428)

Since v0.0.0

## AssignedPersisted (type alias)

Persisted map produced by composing inherited and child entity parts.

**Example**

```ts
import type { AssignedPersisted } from "@beep/schema/EntitySchema"

type Persisted = AssignedPersisted<{}, {}, {}, {}>
console.log({} satisfies Persisted)
```

**Signature**

```ts
type AssignedPersisted<BaseFields, BasePersisted, ExtensionFields, ExtensionPersisted> = CheckedPersistedFor<
  Assign<BaseFields, ExtensionFields>,
  AssignPersisted<BasePersisted, ExtensionPersisted> & PersistedFor<Assign<BaseFields, ExtensionFields>>
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L452)

Since v0.0.0

## ClassInput (type alias)

Input accepted by `ClassFactory`.

**Example**

```ts
import { defineClassInput } from "@beep/schema/EntitySchema"
import type { ClassInput } from "@beep/schema/EntitySchema"

const input = defineClassInput({ fields: {}, persisted: {} }) satisfies ClassInput<{}, {}>
console.log(Object.keys(input.fields))
```

**Signature**

```ts
type ClassInput<FieldMap, Persisted, TableName, EntityId> = {
  readonly entityId?: EntityId;
  readonly fields: FieldMap;
  readonly persisted: CheckedPersistedFor<FieldMap, Persisted>;
  readonly tableName?: TableName;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L201)

Since v0.0.0

## ColumnNameFor (type alias)

Column name for a field key and descriptor.

**Example**

```ts
import type { ColumnNameFor, PersistDescriptor } from "@beep/schema/EntitySchema"

type Column = ColumnNameFor<"createdAt", PersistDescriptor<"text", "provided">>
console.log("created_at" as Column)
```

**Signature**

```ts
type ColumnNameFor<Key, Descriptor> = Descriptor extends {
  readonly columnName: infer ColumnName extends string;
}
  ? ColumnName
  : SnakeCase<Key>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L180)

Since v0.0.0

## Definition (type alias)

Entity metadata attached to entity schema classes.

**Example**

```ts
import type { Definition } from "@beep/schema/EntitySchema"

const definition = { fields: {}, inputFields: {}, persisted: {}, tableName: "accounts", variantFields: {} } as Definition
console.log(definition.tableName)
```

**Signature**

```ts
type Definition<FieldMap, SelectedFieldMap, Persisted, TableName, EntityId> = {
  readonly fields: SelectedFieldMap;
  readonly inputFields: FieldMap;
  readonly persisted: Persisted;
  readonly tableName: TableName;
  readonly variantFields: VariantFieldsFor<FieldMap, Persisted>;
} & (EntityId extends EntityIdLike
  ? {
      readonly entityId: EntityId;
    }
  : {
      readonly entityId?: never;
    })
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L42)

Since v0.0.0

## EncodedShape (type alias)

Encoded persistence row shape for a field map.

**Example**

```ts
import * as S from "effect/Schema"
import type { EncodedShape } from "@beep/schema/EntitySchema"

type Row = EncodedShape<{ readonly id: typeof S.String }>
console.log({ id: "acct_123" } satisfies Row)
```

**Signature**

```ts
type EncodedShape<FieldMap> = {
  readonly [K in keyof FieldMap]: S.Codec.Encoded<SelectedFieldOf<FieldMap[K]>>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L77)

Since v0.0.0

## EntityClass (type alias)

Entity schema class produced by `ClassFactory`.

**Example**

```ts
import type { EntityClass } from "@beep/schema/EntitySchema"

declare const entity: EntityClass.Any
console.log(entity.definition.tableName)
```

**Signature**

```ts
type EntityClass<Self, FieldMap, Persisted, Inherited, TableName, EntityId> = S.Codec<Self, EncodedShape<FieldMap>, never, never> &
  Model.ClassShape<Self, VariantFieldsFor<FieldMap, Persisted>, {}, Inherited> & {
    readonly definition: Definition<FieldMap, SelectedFieldsOf<FieldMap>, Persisted, TableName, EntityId>;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L329)

Since v0.0.0

## EntityClass (namespace)

Companion types for `EntityClass`.

**Example**

```ts
import type { EntityClass } from "@beep/schema/EntitySchema"

declare const entity: EntityClass.Any
console.log(entity.definition.tableName)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L355)

Since v0.0.0

### Any (type alias)

Any entity schema class.

**Signature**

```ts
type Any = S.Top & {
    readonly definition: Definition;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L362)

Since v0.0.0

### DefinitionOf (type alias)

Definition attached to an entity schema class.

**Signature**

```ts
type DefinitionOf<Entity> = Entity["definition"]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L372)

Since v0.0.0

## LastPathSegment (type alias)

Last path segment of an identity string.

**Example**

```ts
import type { LastPathSegment } from "@beep/schema/EntitySchema"

const segment = "Account" satisfies LastPathSegment<"Domain/Account">
console.log(segment)
```

**Signature**

```ts
type LastPathSegment<Value> = Value extends `${string}/${infer Tail}`
  ? LastPathSegment<Tail>
  : Value
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L146)

Since v0.0.0

## SchemaAnnotations (type alias)

Schema annotation bag accepted by entity class factories.

**Example**

```ts
import type { SchemaAnnotations } from "@beep/schema/EntitySchema"

const annotations = { title: "Account" } satisfies SchemaAnnotations
console.log(annotations.title)
```

**Signature**

```ts
type SchemaAnnotations = S.Annotations.Annotations
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L114)

Since v0.0.0

## SnakeCase (type alias)

Type-level snake-case transform.

**Example**

```ts
import type { SnakeCase } from "@beep/schema/EntitySchema"

const table = "account_profile" satisfies SnakeCase<"AccountProfile">
console.log(table)
```

**Signature**

```ts
type DelimiterCase<Value, "_", { splitOnPunctuation: false; splitOnNumbers: false; }> = ReturnType<typeof Str.snakeCase<Value>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L130)

Since v0.0.0

## TableNameFromIdentifier (type alias)

Default table name derived from a schema identifier.

**Example**

```ts
import type { TableNameFromIdentifier } from "@beep/schema/EntitySchema"

const table = "account_profile" satisfies TableNameFromIdentifier<"Domain/AccountProfile">
console.log(table)
```

**Signature**

```ts
type TableNameFromIdentifier<Identifier> = SnakeCase<LastPathSegment<Identifier>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L164)

Since v0.0.0

## TypeShape (type alias)

Decoded domain type shape for a field map.

**Example**

```ts
import * as S from "effect/Schema"
import type { TypeShape } from "@beep/schema/EntitySchema"

type Domain = TypeShape<{ readonly id: typeof S.String }>
console.log({ id: "acct_123" } satisfies Domain)
```

**Signature**

```ts
type TypeShape<FieldMap> = {
  readonly [K in keyof FieldMap]: S.Schema.Type<SelectedFieldOf<FieldMap[K]>>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L96)

Since v0.0.0

## VariantFieldFor (type alias)

Variant field schema selected for a persisted field descriptor.

**Example**

```ts
import * as S from "effect/Schema"
import type { PersistDescriptor, VariantFieldFor } from "@beep/schema/EntitySchema"

type Field = VariantFieldFor<typeof S.String, PersistDescriptor.Any>
console.log(S.String as Field)
```

**Signature**

```ts
type VariantFieldFor<Field, Descriptor> = Descriptor["valueStrategy"] extends "generatedOnInsert"
  ? Model.Generated<Field>
  : Descriptor["valueStrategy"] extends "incrementedOnWrite"
    ? Model.Generated<Field>
    : Descriptor["valueStrategy"] extends "defaultedOnInsert"
      ? Descriptor["storageKind"] extends "timestampMillis"
        ? Model.DateTimeInsertFromNumber
        : Descriptor["storageKind"] extends "timestampDate"
          ? Model.DateTimeInsertFromDate
          : Model.GeneratedByApp<Field>
      : Descriptor["valueStrategy"] extends "updatedOnWrite"
        ? Descriptor["storageKind"] extends "timestampMillis"
          ? Model.DateTimeUpdateFromNumber
          : Descriptor["storageKind"] extends "timestampDate"
            ? Model.DateTimeUpdateFromDate
            : Model.GeneratedByApp<Field>
        : Descriptor["valueStrategy"] extends "providedByContext" | "derived" | "computedByService"
          ? Model.GeneratedByApp<Field>
          : Field
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L251)

Since v0.0.0

## VariantFieldForInput (type alias)

Variant field schema selected for a field input and persisted descriptor.

**Example**

```ts
import * as S from "effect/Schema"
import type { PersistDescriptor, VariantFieldForInput } from "@beep/schema/EntitySchema"

type Field = VariantFieldForInput<typeof S.String, PersistDescriptor.Any>
console.log(S.String as Field)
```

**Signature**

```ts
type VariantFieldForInput<Field, Descriptor> = Field extends EntityVariantFieldInput ? Field : VariantFieldFor<SelectedFieldOf<Field>, Descriptor>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L289)

Since v0.0.0

## VariantFieldsFor (type alias)

Variant field map derived from entity inputs and persistence descriptors.

**Example**

```ts
import * as S from "effect/Schema"
import type { VariantFieldsFor } from "@beep/schema/EntitySchema"

type Fields = VariantFieldsFor<{ readonly id: typeof S.String }, {}>
console.log({ id: S.String } as Fields)
```

**Signature**

```ts
type VariantFieldsFor<FieldMap, Persisted> = {
  readonly [K in keyof FieldMap]: K extends keyof Persisted
    ? VariantFieldForInput<FieldMap[K], Persisted[K]>
    : FieldMap[K];
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.definition.ts#L309)

Since v0.0.0