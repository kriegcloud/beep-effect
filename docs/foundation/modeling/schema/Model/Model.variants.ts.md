---
title: Model.variants.ts
nav_order: 156
parent: "@beep/schema"
---

## Model.variants.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Class](#class)
  - [Field](#field)
  - [FieldExcept](#fieldexcept)
  - [FieldOnly](#fieldonly)
  - [Overridable](#overridable)
  - [Override](#override)
  - [Overrideable](#overrideable)
  - [Struct](#struct)
  - [Union](#union)
- [getters](#getters)
  - [extract](#extract)
  - [fields](#fields)
- [mapping](#mapping)
  - [fieldEvolve](#fieldevolve)
- [models](#models)
  - [Any (type alias)](#any-type-alias)
  - [ClassShape (type alias)](#classshape-type-alias)
  - [DefaultVariant (type alias)](#defaultvariant-type-alias)
  - [Variant (type alias)](#variant-type-alias)
  - [VariantsDatabase (type alias)](#variantsdatabase-type-alias)
  - [VariantsJson (type alias)](#variantsjson-type-alias)
- [schemas](#schemas)
  - [Overridable (interface)](#overridable-interface)
  - [Overrideable (interface)](#overrideable-interface)
---

# constructors

## Class

A base class used for creating domain model schemas.

It supports common variants for database and JSON apis.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

export const GroupId = Schema.Finite.pipe(Schema.brand("GroupId"))

export class Group extends Model.Class<Group>("Group")({}) {}

// schema used for selects
Group

// schema used for inserts
Group.insert

// schema used for updates
Group.update

// schema used for json api
Group.json
Group.jsonCreate
Group.jsonUpdate

// you can also turn them into classes
class GroupJson extends Schema.Class<GroupJson>("GroupJson")(Group.json) {}
console.log(GroupJson)
```

**Signature**

```ts
declare const Class: <Self = never>(identifier: string) => <const Fields extends StructInput>(fields: StructArgument<Fields, "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">, annotations?: ClassAnnotations<Self, "select", StructInputFields<Fields>> | undefined) => ClassShape<Self, "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate", "select", StructInputFields<Fields>, {}, {}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L189)

Since v0.0.0

## Field

Define a variant-aware field by supplying a schema per variant key.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const status = Model.Field({})

console.log(status)
```

**Signature**

```ts
declare const Field: <const A extends VariantSchema.Field.ConfigWithKeys<"select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">>(config: A & { readonly [K in Exclude<keyof A, "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">]: never; }) => VariantSchema.Field<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L224)

Since v0.0.0

## FieldExcept

Create a field present on every variant except the listed ones.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const readOnly = Model.FieldExcept(["insert", "update"])(Schema.String)
console.log(readOnly)
```

**Signature**

```ts
declare const FieldExcept: <const Keys extends ReadonlyArray<"select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">>(keys: Keys) => <S extends S.Top>(schema: S) => VariantSchema.Field<{ readonly [K in Exclude<"select", Keys[number]> | Exclude<"insert", Keys[number]> | Exclude<"update", Keys[number]> | Exclude<"json", Keys[number]> | Exclude<"jsonCreate", Keys[number]> | Exclude<"jsonUpdate", Keys[number]>]: S; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L240)

Since v0.0.0

## FieldOnly

Create a field present only on the listed variants.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const jsonOnly = Model.FieldOnly(["json", "jsonCreate"])(Schema.String)
console.log(jsonOnly)
```

**Signature**

```ts
declare const FieldOnly: <const Keys extends ReadonlyArray<"select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">>(keys: Keys) => <S extends S.Top>(schema: S) => VariantSchema.Field<{ readonly [K in Keys[number]]: S; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L256)

Since v0.0.0

## Overridable

Build an `Overridable` schema that falls back to `defaultValue` during
constructor creation.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

const Name = Model.Overridable(S.String, { defaultValue: Effect.succeed("anonymous") })
console.log(S.isSchema(Name))
```

**Signature**

```ts
declare const Overridable: { <S extends S.Top & S.WithoutConstructorDefault>(options: { readonly defaultValue: Effect<S["~type.make.in"]>; }): (schema: S) => VariantSchema.Overridable<S>; <S extends S.Top & S.WithoutConstructorDefault>(schema: S, options: { readonly defaultValue: Effect<S["~type.make.in"]>; }): VariantSchema.Overridable<S>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L406)

Since v0.0.0

## Override

Wrap a value so it overrides the default generated by an `Overridable` field.

**Example**

```ts
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

const GroupId = S.Finite.pipe(S.brand("GroupId"))

class Group extends Model.Class<Group>("Group")({}) {}

console.log(Group)
```

**Signature**

```ts
declare const Override: <A>(value: A) => A & Brand<"Override">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L350)

Since v0.0.0

## Overrideable

Upstream-compatible spelling for `Overridable`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

const Name = Model.Overrideable(S.String, { defaultValue: Effect.succeed("anonymous") })
console.log(S.isSchema(Name))
```

**Signature**

```ts
declare const Overrideable: { <S extends S.Top & S.WithoutConstructorDefault>(options: { readonly defaultValue: Effect<S["~type.make.in"]>; }): (schema: S) => VariantSchema.Overridable<S>; <S extends S.Top & S.WithoutConstructorDefault>(schema: S, options: { readonly defaultValue: Effect<S["~type.make.in"]>; }): VariantSchema.Overridable<S>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L424)

Since v0.0.0

## Struct

Create a raw variant struct without producing a class.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const groupFields = Model.Struct({})

console.log(groupFields)
```

**Signature**

```ts
declare const Struct: <const A extends VariantSchema.Struct.Fields>(fields: A & VariantSchema.Struct.Validate<A, "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">) => VariantSchema.Struct<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L290)

Since v0.0.0

## Union

Create a discriminated union of variant structs with per-variant accessors.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const a = Model.Struct({ _tag: Schema.tag("A"), value: Schema.String })
const b = Model.Struct({ _tag: Schema.tag("B"), count: Schema.Finite })
const AB = Model.Union([a, b])

console.log(AB)
```

**Signature**

```ts
declare const Union: <const Members extends ReadonlyArray<AnyStruct>>(members: Members) => VariantSchema.Union<Members> & VariantSchema.Union.Variants<Members, "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L309)

Since v0.0.0

# getters

## extract

Extract the schema for a specific variant from a variant struct.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const fields = Model.Struct({})

const InsertSchema = Model.extract(fields, "insert")
console.log(InsertSchema)
```

**Signature**

```ts
declare const extract: { <V extends "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate">(variant: V): <A extends AnyStruct>(self: A) => VariantSchema.Extract<V, A, V extends "select" ? true : false>; <V extends "select" | "insert" | "update" | "json" | "jsonCreate" | "jsonUpdate", A extends AnyStruct>(self: A, variant: V): VariantSchema.Extract<V, A, V extends "select" ? true : false>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L207)

Since v0.0.0

## fields

Extract the raw variant field record from a variant struct.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const s = Model.Struct({})

const raw = Model.fields(s)
console.log(raw)
```

**Signature**

```ts
declare const fields: <A extends VariantSchema.Struct<TUnsafe.Any>>(self: A) => A[typeof VariantSchema.TypeId]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L329)

Since v0.0.0

# mapping

## fieldEvolve

Transform variant schemas inside an existing field using per-variant mappers.

**Example**

```ts
import * as Schema from "effect/Schema"
import * as Model from "@beep/schema/Model"

const makeOptional = Model.fieldEvolve({})

console.log(makeOptional)
```

**Signature**

```ts
declare const fieldEvolve: { <Self extends AnyField | S.Top, const Mapping extends Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]?: ((variant: S[K]) => S.Top) | undefined; } : { readonly select?: ((variant: Self) => S.Top) | undefined; readonly insert?: ((variant: Self) => S.Top) | undefined; readonly update?: ((variant: Self) => S.Top) | undefined; readonly json?: ((variant: Self) => S.Top) | undefined; readonly jsonCreate?: ((variant: Self) => S.Top) | undefined; readonly jsonUpdate?: ((variant: Self) => S.Top) | undefined; }>(f: Mapping): (self: Self) => VariantSchema.Field<Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]: K extends keyof Mapping ? Mapping[K] extends UnknownFunction ? ReturnType<Mapping[K]> : S[K] : S[K]; } : { readonly select: "select" extends keyof Mapping ? Mapping[keyof Mapping & "select"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "select"]> : Self : Self; readonly insert: "insert" extends keyof Mapping ? Mapping[keyof Mapping & "insert"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "insert"]> : Self : Self; readonly update: "update" extends keyof Mapping ? Mapping[keyof Mapping & "update"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "update"]> : Self : Self; readonly json: "json" extends keyof Mapping ? Mapping[keyof Mapping & "json"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "json"]> : Self : Self; readonly jsonCreate: "jsonCreate" extends keyof Mapping ? Mapping[keyof Mapping & "jsonCreate"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "jsonCreate"]> : Self : Self; readonly jsonUpdate: "jsonUpdate" extends keyof Mapping ? Mapping[keyof Mapping & "jsonUpdate"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "jsonUpdate"]> : Self : Self; }>; <Self extends AnyField | S.Top, const Mapping extends Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]?: ((variant: S[K]) => S.Top) | undefined; } : { readonly select?: ((variant: Self) => S.Top) | undefined; readonly insert?: ((variant: Self) => S.Top) | undefined; readonly update?: ((variant: Self) => S.Top) | undefined; readonly json?: ((variant: Self) => S.Top) | undefined; readonly jsonCreate?: ((variant: Self) => S.Top) | undefined; readonly jsonUpdate?: ((variant: Self) => S.Top) | undefined; }>(self: Self, f: Mapping): VariantSchema.Field<Self extends VariantSchema.Field<infer S extends VariantSchema.Field.Config> ? { readonly [K in keyof S]: K extends keyof Mapping ? Mapping[K] extends UnknownFunction ? ReturnType<Mapping[K]> : S[K] : S[K]; } : { readonly select: "select" extends keyof Mapping ? Mapping[keyof Mapping & "select"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "select"]> : Self : Self; readonly insert: "insert" extends keyof Mapping ? Mapping[keyof Mapping & "insert"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "insert"]> : Self : Self; readonly update: "update" extends keyof Mapping ? Mapping[keyof Mapping & "update"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "update"]> : Self : Self; readonly json: "json" extends keyof Mapping ? Mapping[keyof Mapping & "json"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "json"]> : Self : Self; readonly jsonCreate: "jsonCreate" extends keyof Mapping ? Mapping[keyof Mapping & "jsonCreate"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "jsonCreate"]> : Self : Self; readonly jsonUpdate: "jsonUpdate" extends keyof Mapping ? Mapping[keyof Mapping & "jsonUpdate"] extends UnknownFunction ? ReturnType<Mapping[keyof Mapping & "jsonUpdate"]> : Self : Self; }>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L273)

Since v0.0.0

# models

## Any (type alias)

Constraint type satisfied by any Model class produced by `Class`.

**Example**

```ts
import * as Model from "@beep/schema/Model"

declare const model: Model.Any
console.log(model.fields)
```

**Signature**

```ts
type Any = S.Top & {
  readonly fields: S.Struct.Fields;
  readonly insert: S.Top;
  readonly update: S.Top;
  readonly json: S.Top;
  readonly jsonCreate: S.Top;
  readonly jsonUpdate: S.Top;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L34)

Since v0.0.0

## ClassShape (type alias)

Materialized class constructor shape produced by `Class`.

**Example**

```ts
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

class Account extends Model.Class<Account>("Account")({ id: S.String }) {}
type AccountShape = Model.ClassShape<Account, { readonly id: typeof S.String }>
console.log(Account satisfies AccountShape)
```

**Signature**

```ts
type ClassShape<Self, Fields, Static, Inherited> = InheritStaticMembers<ModelClassCore<Self, Fields, Inherited>, Static>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L140)

Since v0.0.0

## DefaultVariant (type alias)

Default model variant used as the class schema.

**Example**

```ts
import type { DefaultVariant } from "@beep/schema/Model"

const variant = "select" satisfies DefaultVariant
console.log(variant)
```

**Signature**

```ts
type DefaultVariant = "select"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L105)

Since v0.0.0

## Variant (type alias)

Union of all model variant keys.

**Example**

```ts
import type { Variant } from "@beep/schema/Model"

const variant = "jsonUpdate" satisfies Variant
console.log(variant)
```

**Signature**

```ts
type Variant = (typeof modelVariants)[number]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L89)

Since v0.0.0

## VariantsDatabase (type alias)

Union of database variant keys: `"select"`, `"insert"`, `"update"`.

**Example**

```ts
import type { VariantsDatabase } from "@beep/schema/Model"

const variant = "insert" satisfies VariantsDatabase
console.log(variant)
```

**Signature**

```ts
type VariantsDatabase = "select" | "insert" | "update"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L57)

Since v0.0.0

## VariantsJson (type alias)

Union of JSON variant keys: `"json"`, `"jsonCreate"`, `"jsonUpdate"`.

**Example**

```ts
import type { VariantsJson } from "@beep/schema/Model"

const variant = "jsonCreate" satisfies VariantsJson
console.log(variant)
```

**Signature**

```ts
type VariantsJson = "json" | "jsonCreate" | "jsonUpdate"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L73)

Since v0.0.0

# schemas

## Overridable (interface)

Schema whose constructor can supply a generated default unless callers pass
`Override`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

const Name = Model.Overridable(S.String, { defaultValue: Effect.succeed("anonymous") })
console.log(S.isSchema(Name))
```

**Signature**

```ts
export interface Overridable<S extends S.Top & S.WithoutConstructorDefault> extends VariantSchema.Overridable<S> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L369)

Since v0.0.0

## Overrideable (interface)

Upstream-compatible spelling for `Overridable`.

**Example**

```ts
import { Effect } from "effect"
import * as S from "effect/Schema"
import * as Model from "@beep/schema/Model"

const Name = Model.Overrideable(S.String, { defaultValue: Effect.succeed("anonymous") })
console.log(S.isSchema(Name))
```

**Signature**

```ts
export interface Overrideable<S extends S.Top & S.WithoutConstructorDefault> extends Overridable<S> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Model/Model.variants.ts#L387)

Since v0.0.0