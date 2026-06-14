---
title: Field.ts
nav_order: 2
parent: "@beep/form"
---

## Field.ts overview

Field definition schemas, constructors, and type derivation helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [createTouchedRecord](#createtouchedrecord)
  - [getDefaultEncodedValues](#getdefaultencodedvalues)
  - [getDefaultFromSchema](#getdefaultfromschema)
  - [makeArrayField](#makearrayfield)
  - [makeField](#makefield)
- [destructors](#destructors)
  - [extractStructFieldDefs](#extractstructfielddefs)
- [guards](#guards)
  - [isArrayFieldDef](#isarrayfielddef)
  - [isFieldDef](#isfielddef)
- [models](#models)
  - [AnyFieldDef (type alias)](#anyfielddef-type-alias)
  - [ArrayFieldDef (interface)](#arrayfielddef-interface)
  - [FieldDef (interface)](#fielddef-interface)
  - [FieldsRecord (type alias)](#fieldsrecord-type-alias)
- [symbols](#symbols)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [type-level](#type-level)
  - [DecodedFromFields (type alias)](#decodedfromfields-type-alias)
  - [EncodedFromFields (type alias)](#encodedfromfields-type-alias)
---

# constructors

## createTouchedRecord

Creates a touched-state record for every field.

**Example**

```ts
import { createTouchedRecord, makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const touched = createTouchedRecord({ name: makeField("name", S.String) }, false)
console.log(touched.name) // false
```

**Signature**

```ts
declare const createTouchedRecord: (fields: FieldsRecord, value: boolean) => Record<string, boolean>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L358)

Since v0.0.0

## getDefaultEncodedValues

Builds encoded defaults for every field in a field record.

**Example**

```ts
import { getDefaultEncodedValues, makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const defaults = getDefaultEncodedValues({ name: makeField("name", S.String) })
console.log(defaults.name) // ""
```

**Signature**

```ts
declare const getDefaultEncodedValues: (fields: FieldsRecord) => Record<string, unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L338)

Since v0.0.0

## getDefaultFromSchema

Produces a best-effort encoded default value for a schema.

**Example**

```ts
import { getDefaultFromSchema } from "@beep/form/core/Field"
import * as S from "effect/Schema"

console.log(getDefaultFromSchema(S.String)) // ""
```

**Signature**

```ts
declare const getDefaultFromSchema: (schema: S.Top) => unknown
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L320)

Since v0.0.0

## makeArrayField

Creates an array field definition.

**Example**

```ts
import { makeArrayField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const field = makeArrayField("tags", S.String)
console.log(field.itemSchema === S.String) // true
```

**Signature**

```ts
declare const makeArrayField: <K extends string, Schema extends S.Top>(key: K, itemSchema: Schema) => ArrayFieldDef<K, Schema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L197)

Since v0.0.0

## makeField

Creates a scalar field definition.

**Example**

```ts
import { makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const field = makeField("email", S.String)
console.log(field.key) // "email"
```

**Signature**

```ts
declare const makeField: <K extends string, Schema extends S.Top>(key: K, schema: Schema) => FieldDef<K, Schema>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L176)

Since v0.0.0

# destructors

## extractStructFieldDefs

Extracts field definitions from a struct-like schema.

**Example**

```ts
import { extractStructFieldDefs } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const fields = extractStructFieldDefs(S.Struct({ name: S.String }))
console.log(fields?.[0]?.key) // "name"
```

**Signature**

```ts
declare const extractStructFieldDefs: (schema: S.Top) => ReadonlyArray<FieldDef<string, S.Top>> | undefined
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L376)

Since v0.0.0

# guards

## isArrayFieldDef

Detects array field definitions.

**Example**

```ts
import { isArrayFieldDef, makeArrayField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

console.log(isArrayFieldDef(makeArrayField("items", S.String))) // true
```

**Signature**

```ts
declare const isArrayFieldDef: (def: AnyFieldDef) => def is ArrayFieldDef<string, S.Top>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L143)

Since v0.0.0

## isFieldDef

Detects scalar field definitions.

**Example**

```ts
import { isFieldDef, makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

console.log(isFieldDef(makeField("name", S.String))) // true
```

**Signature**

```ts
declare const isFieldDef: (def: AnyFieldDef) => def is FieldDef<string, S.Top>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L159)

Since v0.0.0

# models

## AnyFieldDef (type alias)

Union of scalar and array field definitions accepted by a form builder.

**Example**

```ts
import { makeField, type AnyFieldDef } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const field: AnyFieldDef = makeField("name", S.String)
console.log(field.key) // "name"
```

**Signature**

```ts
type AnyFieldDef = FieldDef<string, S.Top> | ArrayFieldDef<string, S.Top>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L110)

Since v0.0.0

## ArrayFieldDef (interface)

Array field definition pairing a stable form key with an item schema.

**Example**

```ts
import { makeArrayField, type ArrayFieldDef } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const field: ArrayFieldDef<"items", typeof S.String> = makeArrayField("items", S.String)
console.log(field._tag) // "array"
```

**Signature**

```ts
export interface ArrayFieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "array";
  readonly itemSchema: Schema;
  readonly key: K;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L89)

Since v0.0.0

## FieldDef (interface)

Scalar field definition pairing a stable form key with an Effect schema.

**Example**

```ts
import { makeField, type FieldDef } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const field: FieldDef<"name", typeof S.String> = makeField("name", S.String)
console.log(field.key) // "name"
```

**Signature**

```ts
export interface FieldDef<K extends string, Schema extends S.Top> {
  readonly _tag: "field";
  readonly key: K;
  readonly schema: Schema;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L68)

Since v0.0.0

## FieldsRecord (type alias)

Record of form field definitions keyed by form path segment.

**Example**

```ts
import { makeField, type FieldsRecord } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const fields: FieldsRecord = { name: makeField("name", S.String) }
console.log(fields.name.key) // "name"
```

**Signature**

```ts
type FieldsRecord = Record<string, AnyFieldDef>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L127)

Since v0.0.0

# symbols

## TypeId

Runtime marker for field definition values.

**Example**

```ts
import { TypeId } from "@beep/form/core/Field"

console.log(typeof TypeId) // "symbol"
```

**Signature**

```ts
declare const TypeId: unique symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L35)

Since v0.0.0

## TypeId (type alias)

Type of the field definition runtime marker.

**Example**

```ts
import { TypeId, type TypeId as FieldTypeId } from "@beep/form/core/Field"

const id: FieldTypeId = TypeId
console.log(typeof id) // "symbol"
```

**Signature**

```ts
type TypeId = typeof TypeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L51)

Since v0.0.0

# type-level

## DecodedFromFields (type alias)

Decoded form value shape derived from field definitions.

**Example**

```ts
import { makeField, type DecodedFromFields } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const fields = { age: makeField("age", S.Finite) }
const value: DecodedFromFields<typeof fields> = { age: 42 }
console.log(value.age) // 42
```

**Signature**

```ts
type DecodedFromFields<T> = {
  readonly [K in keyof T]: T[K] extends FieldDef<string, infer Schema>
    ? S.Schema.Type<Schema>
    : T[K] extends ArrayFieldDef<string, infer Schema>
      ? ReadonlyArray<S.Schema.Type<Schema>>
      : never;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L246)

Since v0.0.0

## EncodedFromFields (type alias)

Encoded form value shape derived from field definitions.

**Example**

```ts
import { makeField, type EncodedFromFields } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const fields = { name: makeField("name", S.String) }
const value: EncodedFromFields<typeof fields> = { name: "Ada" }
console.log(value.name) // "Ada"
```

**Signature**

```ts
type EncodedFromFields<T> = {
  readonly [K in keyof T]: T[K] extends FieldDef<string, infer Schema>
    ? S.Codec.Encoded<Schema>
    : T[K] extends ArrayFieldDef<string, infer Schema>
      ? ReadonlyArray<S.Codec.Encoded<Schema>>
      : never;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/Field.ts#L222)

Since v0.0.0