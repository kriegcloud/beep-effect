---
title: VariantSchema.core.ts
nav_order: 218
parent: "@beep/schema"
---

## VariantSchema.core.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [make](#make)
- [getters](#getters)
  - [fields](#fields)
- [guards](#guards)
  - [isField](#isfield)
  - [isStruct](#isstruct)
- [models](#models)
  - [Class (interface)](#class-interface)
  - [Field (interface)](#field-interface)
  - [Field (namespace)](#field-namespace)
    - [Any (type alias)](#any-type-alias)
    - [Config (type alias)](#config-type-alias)
    - [ConfigWithKeys (type alias)](#configwithkeys-type-alias)
    - [Fields (type alias)](#fields-type-alias)
  - [Struct (interface)](#struct-interface)
  - [Struct (namespace)](#struct-namespace)
    - [Any (type alias)](#any-type-alias-1)
    - [Fields (type alias)](#fields-type-alias-1)
    - [Validate (type alias)](#validate-type-alias)
  - [Union (interface)](#union-interface)
  - [Union (namespace)](#union-namespace)
    - [Variants (type alias)](#variants-type-alias)
- [type-ids](#type-ids)
  - [TypeId](#typeid)
- [type-level](#type-level)
  - [Extract (type alias)](#extract-type-alias)
  - [ExtractFields (type alias)](#extractfields-type-alias)
---

# constructors

## make

Creates a variant schema API for a fixed set of variant names.

**Example**

```ts
import * as S from "effect/Schema"
import { make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const Account = Variant.Struct({ id: S.String, notes: Variant.FieldOnly(["write"])(S.String) })
console.log(Object.keys(Variant.extract(Account, "write").fields))
```

**Signature**

```ts
declare const make: <const Variants extends ReadonlyArray<string>, const Default extends Variants[number]>(options: { readonly variants: Variants; readonly defaultVariant: Default; }) => MakeApi<Variants[number], Default>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L609)

Since v0.0.0

# getters

## fields

Returns the raw field map stored on a variant-aware struct.

**Example**

```ts
import * as S from "effect/Schema"
import { fields, make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
console.log(Object.keys(fields(Variant.Struct({ id: S.String }))))
```

**Signature**

```ts
declare const fields: <A extends AnyStruct>(self: A) => A[typeof TypeId]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L342)

Since v0.0.0

# guards

## isField

Guard for variant-specific field descriptors.

**Example**

```ts
import * as S from "effect/Schema"
import { isField, make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
console.log(isField(Variant.Field({ write: S.String }))) // true
```

**Signature**

```ts
declare const isField: (u: unknown) => u is AnyField
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L155)

Since v0.0.0

## isStruct

Guard for variant-aware struct descriptors.

**Example**

```ts
import * as S from "effect/Schema"
import { isStruct, make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
console.log(isStruct(Variant.Struct({ id: S.String }))) // true
```

**Signature**

```ts
declare const isStruct: (u: unknown) => u is AnyStruct
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L70)

Since v0.0.0

# models

## Class (interface)

Variant-aware schema class shape produced by `make().Class`.

**Example**

```ts
import * as S from "effect/Schema"
import { make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
class Account extends Variant.Class<Account>("Account")({ id: S.String }) {}
console.log(S.isSchema(Account.read))
```

**Signature**

```ts
export interface Class<
  Self,
  Fields extends Struct.Fields,
  S extends S.Top & {
    readonly fields: S.Struct.Fields;
  },
  Variants extends string = string,
  Default extends Variants = Variants,
  Inherited = {},
> extends S.Bottom<
      Self,
      S["Encoded"],
      S["DecodingServices"],
      S["EncodingServices"],
      AST.Declaration,
      S.decodeTo<S.declareConstructor<Self, S["Encoded"], readonly [S], S["Iso"]>, S>,
      S["~type.make.in"],
      S["Iso"],
      readonly [S],
      Self,
      S["~type.mutability"],
      S["~type.optionality"],
      S["~type.constructor.default"],
      S["~encoded.mutability"],
      S["~encoded.optionality"]
    >,
    Struct<Struct_.Simplify<Fields>> {
  extend<Extended = never, Static = {}, InheritedBrand = {}>(
    identifier: string
  ): <const NewFields extends StructInput>(
    fields: StructArgument<NewFields, Variants>,
    annotations?: ClassAnnotations<Extended, Default, MergeFields<Fields, StructInputFields<NewFields>>> | undefined
  ) => ClassShape<
    Extended,
    Variants,
    Default,
    MergeFields<Fields, StructInputFields<NewFields>>,
    Static,
    Self & InheritedBrand
  >;

  readonly fields: S["fields"];

  make<Args extends Array<unknown>, X>(this: { new (...args: Args): X }, ...args: Args): X;

  mapFields<To extends Struct.Fields>(
    f: (fields: Struct_.Simplify<Fields>) => To,
    options?:
      | {
          readonly unsafePreserveChecks?: boolean | undefined;
        }
      | undefined
  ): Struct<Struct_.Simplify<Readonly<To>>>;
  new (
    props: S["~type.make.in"],
    options?:
      | {
          readonly disableChecks?: boolean;
        }
      | undefined
  ): S["Type"] & Inherited;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L360)

Since v0.0.0

## Field (interface)

Variant-specific field descriptor.

**Example**

```ts
import * as S from "effect/Schema"
import { isField, make, type Field } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const field: Field<{ readonly read: typeof S.String }> = Variant.Field({ read: S.String })
console.log(isField(field))
```

**Signature**

```ts
export interface Field<in out A extends Field.Config> extends Pipeable {
  readonly schemas: A;
  readonly [FieldTypeId]: typeof FieldTypeId;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L135)

Since v0.0.0

## Field (namespace)

Type helpers for variant-specific field descriptors.

**Example**

```ts
import * as S from "effect/Schema"
import type { Field } from "@beep/schema/VariantSchema"

type Config = Field.Config
console.log({ read: S.String } satisfies Config)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L171)

Since v0.0.0

### Any (type alias)

**Signature**

```ts
type Any = { readonly [FieldTypeId]: typeof FieldTypeId }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L176)

Since v0.0.0

### Config (type alias)

**Signature**

```ts
type Config = {
    readonly [key: string]: S.Top | undefined;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L182)

Since v0.0.0

### ConfigWithKeys (type alias)

**Signature**

```ts
type ConfigWithKeys<K> = {
    readonly [P in K]?: S.Top;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L190)

Since v0.0.0

### Fields (type alias)

**Signature**

```ts
type Fields = {
    readonly [key: string]: S.Top | Field.Any | Struct.Any | undefined;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L198)

Since v0.0.0

## Struct (interface)

Variant-aware struct descriptor used by `make`.

**Example**

```ts
import * as S from "effect/Schema"
import { fields, make, type Struct } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const struct: Struct<{ readonly id: typeof S.String }> = Variant.Struct({ id: S.String })
console.log(Object.keys(fields(struct)))
```

**Signature**

```ts
export interface Struct<in out A extends Field.Fields> extends Pipeable {
  readonly [TypeId]: A;
  /** @internal */
  [cacheSymbol]?: Record<string, S.Top>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L49)

Since v0.0.0

## Struct (namespace)

Type helpers for variant-aware struct descriptors.

**Example**

```ts
import * as S from "effect/Schema"
import type { Struct } from "@beep/schema/VariantSchema"

type Fields = Struct.Fields
console.log({ id: S.String } satisfies Fields)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L87)

Since v0.0.0

### Any (type alias)

**Signature**

```ts
type Any = { readonly [TypeId]: unknown }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L92)

Since v0.0.0

### Fields (type alias)

**Signature**

```ts
type Fields = {
    readonly [key: string]: S.Top | Field.Any | Struct.Any | undefined;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L98)

Since v0.0.0

### Validate (type alias)

**Signature**

```ts
type Validate<A, Variant> = {
    readonly [K in keyof A]: A[K] extends { readonly [TypeId]: infer _ }
      ? Validate<A[K], Variant>
      : A[K] extends Field<infer Config>
        ? [keyof Config] extends [Variant]
          ? {}
          : "field must have valid variants"
        : {};
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L106)

Since v0.0.0

## Union (interface)

Variant-aware union schema with per-variant schema projections.

**Example**

```ts
import * as S from "effect/Schema"
import { make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const Account = Variant.Struct({ id: S.String })
const union = Variant.Union([Account])
console.log(S.isSchema(union))
```

**Signature**

```ts
export interface Union<Members extends ReadonlyArray<AnyStruct>>
  extends S.Union<{
    readonly [K in keyof Members]: [Members[K]] extends [S.Top] ? Members[K] : never;
  }> {}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L482)

Since v0.0.0

## Union (namespace)

Type helpers for variant-aware union schemas.

**Example**

```ts
import { make } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const Account = Variant.Struct({})
console.log(Object.keys(Variant.Union([Account])))
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L502)

Since v0.0.0

### Variants (type alias)

**Signature**

```ts
type Union.Variants<Members, Variants> = {
    readonly [Variant in Variants]: S.Union<{
      [K in keyof Members]: Extract<Variant, Members[K]>;
    }>;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L507)

Since v0.0.0

# type-ids

## TypeId

Runtime marker used to identify variant-aware struct values.

**Example**

```ts
import { TypeId } from "@beep/schema/VariantSchema"

console.log(TypeId)
```

**Signature**

```ts
declare const TypeId: "~effect/schema/VariantSchema"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L29)

Since v0.0.0

# type-level

## Extract (type alias)

Extracts a schema for one variant from a variant-aware struct.

**Example**

```ts
import * as S from "effect/Schema"
import { make, type Extract } from "@beep/schema/VariantSchema"

const Variant = make({ variants: ["read", "write"], defaultVariant: "read" })
const struct = Variant.Struct({ id: S.String })
type ReadSchema = Extract<"read", typeof struct>
console.log(S.isSchema(Variant.extract(struct, "read") satisfies ReadSchema))
```

**Signature**

```ts
type Extract<V, A, IsDefault> = [A] extends [Struct<infer Fields>]
  ? IsDefault extends true
    ? [A] extends [S.Top]
      ? A
      : S.Struct<Struct_.Simplify<ExtractFields<V, Fields>>>
    : S.Struct<Struct_.Simplify<ExtractFields<V, Fields>>>
  : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L269)

Since v0.0.0

## ExtractFields (type alias)

Extracts the field map for a single variant from variant-aware fields.

**Example**

```ts
import * as S from "effect/Schema"
import type { ExtractFields } from "@beep/schema/VariantSchema"

type ReadFields = ExtractFields<"read", { readonly id: typeof S.String }>
console.log({ id: S.String } satisfies ReadFields)
```

**Signature**

```ts
type ExtractFields<V, Fields, IsDefault> = {
  readonly [K in keyof Fields as [Fields[K]] extends [Field<infer Config>]
    ? V extends keyof Config
      ? K
      : never
    : K]: [Fields[K]] extends [Struct<infer _>]
    ? Extract<V, Fields[K], IsDefault>
    : [Fields[K]] extends [Field<infer Config>]
      ? [Config[V]] extends [S.Top]
        ? Config[V]
        : never
      : [Fields[K]] extends [S.Top]
        ? Fields[K]
        : never;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/VariantSchema/VariantSchema.core.ts#L236)

Since v0.0.0