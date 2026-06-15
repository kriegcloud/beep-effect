---
title: FormBuilder.ts
nav_order: 5
parent: "@beep/form"
---

## FormBuilder.ts overview

Form builder composition and state models.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [empty](#empty)
  - [makeFieldRef](#makefieldref)
- [guards](#guards)
  - [isFormBuilder](#isformbuilder)
- [models](#models)
  - [FieldRef (interface)](#fieldref-interface)
  - [FormBuilder (interface)](#formbuilder-interface)
  - [FormFilterIssue (type alias)](#formfilterissue-type-alias)
  - [FormFilterOutput (type alias)](#formfilteroutput-type-alias)
  - [FormState (interface)](#formstate-interface)
  - [LegacyFilterIssue (class)](#legacyfilterissue-class)
  - [SubmittedValues (interface)](#submittedvalues-interface)
- [schemas](#schemas)
  - [buildSchema](#buildschema)
- [symbols](#symbols)
  - [FieldTypeId](#fieldtypeid)
  - [FieldTypeId (type alias)](#fieldtypeid-type-alias)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
---

# constructors

## empty

Empty form builder.

**Example**

```ts
import { empty } from "@beep/form/core/FormBuilder"

console.log(empty.refinements.length) // 0
```

**Signature**

```ts
declare const empty: FormBuilder<{}, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L426)

Since v0.0.0

## makeFieldRef

Creates a typed field reference from a field key.

**Example**

```ts
import { makeFieldRef } from "@beep/form/core/FormBuilder"

const ref = makeFieldRef<string>("email")
console.log(ref.key) // "email"
```

**Signature**

```ts
declare const makeFieldRef: <SchemaOrValue>(key: string) => FieldRef<SchemaOrValue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L109)

Since v0.0.0

# guards

## isFormBuilder

Detects form builder values.

**Example**

```ts
import { empty, isFormBuilder } from "@beep/form/core/FormBuilder"

console.log(isFormBuilder(empty)) // true
```

**Signature**

```ts
declare const isFormBuilder: (u: unknown) => u is FormBuilder<FieldsRecord, unknown>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L411)

Since v0.0.0

# models

## FieldRef (interface)

Stable reference to a field by key and encoded value type.

**Example**

```ts
import { makeFieldRef, type FieldRef } from "@beep/form/core/FormBuilder"

const ref: FieldRef<string> = makeFieldRef("name")
console.log(ref.key) // "name"
```

**Signature**

```ts
export interface FieldRef<SchemaOrValue> {
  readonly _S?: SchemaOrValue;
  readonly key: string;
  readonly [FieldTypeId]: FieldTypeId;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L89)

Since v0.0.0

## FormBuilder (interface)

Immutable builder used to collect fields and form-level refinements.

**Example**

```ts
import { empty, type FormBuilder } from "@beep/form/core/FormBuilder"
import { makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const builder: FormBuilder<{ readonly name: ReturnType<typeof makeField<"name", typeof S.String>> }, never> =
  empty.addField(makeField("name", S.String))
console.log(builder.fields.name.key) // "name"
```

**Signature**

```ts
export interface FormBuilder<TFields extends FieldsRecord, R> {
  readonly _R?: R;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    field: FieldDef<K, Schema>
  ): FormBuilder<TFields & { readonly [key in K]: FieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    field: ArrayFieldDef<K, Schema>
  ): FormBuilder<TFields & { readonly [key in K]: ArrayFieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;

  addField<K extends string, Schema extends S.Top>(
    this: FormBuilder<TFields, R>,
    key: K,
    schema: Schema
  ): FormBuilder<TFields & { readonly [key in K]: FieldDef<K, Schema> }, R | S.Codec.DecodingServices<Schema>>;
  readonly fields: TFields;

  merge<TFields2 extends FieldsRecord, R2>(
    this: FormBuilder<TFields, R>,
    other: FormBuilder<TFields2, R2>
  ): FormBuilder<TFields & TFields2, R | R2>;

  refine(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => FormFilterOutput
  ): FormBuilder<TFields, R>;

  refineEffect<RD>(
    this: FormBuilder<TFields, R>,
    predicate: (values: DecodedFromFields<TFields>) => Effect.Effect<FormFilterOutput, never, RD>
  ): FormBuilder<TFields, R | Exclude<RD, AtomRegistry.AtomRegistry>>;
  readonly refinements: ReadonlyArray<Refinement<R>>;
  readonly [TypeId]: TypeId;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L256)

Since v0.0.0

## FormFilterIssue (type alias)

Issue shape accepted from synchronous and Effect-based form refinements.

**Example**

```ts
import { LegacyFilterIssue, type FormFilterIssue } from "@beep/form/core/FormBuilder"

const issue: FormFilterIssue = LegacyFilterIssue.make({ path: ["name"], message: "Required" })
console.log(issue.message) // "Required"
```

**Signature**

```ts
type FormFilterIssue = S.FilterIssue | LegacyFilterIssue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L209)

Since v0.0.0

## FormFilterOutput (type alias)

Return shape accepted from form-level refinement callbacks.

**Example**

```ts
import type { FormFilterOutput } from "@beep/form/core/FormBuilder"

const output: FormFilterOutput = true
console.log(output) // true
```

**Signature**

```ts
type FormFilterOutput = undefined | boolean | FormFilterIssue | ReadonlyArray<FormFilterIssue>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L225)

Since v0.0.0

## FormState (interface)

Runtime state held by a form atom graph.

**Example**

```ts
import type { FormState } from "@beep/form/core/FormBuilder"
import type { FieldsRecord } from "@beep/form/core/Field"
import * as O from "effect/Option"

const lastSubmittedValues: FormState<FieldsRecord>["lastSubmittedValues"] = O.none()
console.log(O.isNone(lastSubmittedValues)) // true
```

**Signature**

```ts
export interface FormState<TFields extends FieldsRecord> {
  readonly dirtyFields: HashSet.HashSet<string>;
  readonly initialValues: EncodedFromFields<TFields>;
  readonly lastSubmittedValues: O.Option<SubmittedValues<TFields>>;
  readonly submitCount: number;
  readonly touched: { readonly [K in keyof TFields]: boolean };
  readonly validationCount: number;
  readonly values: EncodedFromFields<TFields>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L161)

Since v0.0.0

## LegacyFilterIssue (class)

Legacy refinement issue object accepted by builder refinements.

**Example**

```ts
import { LegacyFilterIssue } from "@beep/form/core/FormBuilder"

const issue = LegacyFilterIssue.make({ path: ["confirm"], message: "Must match" })
console.log(issue.message) // "Must match"
```

**Signature**

```ts
declare class LegacyFilterIssue
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L185)

Since v0.0.0

## SubmittedValues (interface)

Encoded and decoded value snapshot captured after successful submission.

**Example**

```ts
import type { SubmittedValues } from "@beep/form/core/FormBuilder"
import type { FieldsRecord } from "@beep/form/core/Field"
import * as O from "effect/Option"

const submitted: O.Option<SubmittedValues<FieldsRecord>> = O.none()
console.log(O.isNone(submitted)) // true
```

**Signature**

```ts
export interface SubmittedValues<TFields extends FieldsRecord> {
  readonly decoded: DecodedFromFields<TFields>;
  readonly encoded: EncodedFromFields<TFields>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L39)

Since v0.0.0

# schemas

## buildSchema

Builds the combined schema for a form builder.

**Example**

```ts
import { buildSchema, empty } from "@beep/form/core/FormBuilder"
import { makeField } from "@beep/form/core/Field"
import * as S from "effect/Schema"

const schema = buildSchema(empty.addField(makeField("name", S.String)))
console.log(S.isSchema(schema)) // true
```

**Signature**

```ts
declare const buildSchema: <TFields extends FieldsRecord, R>(self: FormBuilder<TFields, R>) => S.Codec<DecodedFromFields<TFields>, EncodedFromFields<TFields>, R>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L444)

Since v0.0.0

# symbols

## FieldTypeId

Runtime marker for field references.

**Example**

```ts
import { FieldTypeId } from "@beep/form/core/FormBuilder"

console.log(typeof FieldTypeId) // "symbol"
```

**Signature**

```ts
declare const FieldTypeId: unique symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L57)

Since v0.0.0

## FieldTypeId (type alias)

Type of the field reference runtime marker.

**Example**

```ts
import { FieldTypeId, type FieldTypeId as FieldRefTypeId } from "@beep/form/core/FormBuilder"

const id: FieldRefTypeId = FieldTypeId
console.log(typeof id) // "symbol"
```

**Signature**

```ts
type FieldTypeId = typeof FieldTypeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L73)

Since v0.0.0

## TypeId

Runtime marker for form builders.

**Example**

```ts
import { TypeId } from "@beep/form/core/FormBuilder"

console.log(typeof TypeId) // "symbol"
```

**Signature**

```ts
declare const TypeId: unique symbol
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L127)

Since v0.0.0

## TypeId (type alias)

Type of the form builder runtime marker.

**Example**

```ts
import { TypeId, type TypeId as BuilderTypeId } from "@beep/form/core/FormBuilder"

const id: BuilderTypeId = TypeId
console.log(typeof id) // "symbol"
```

**Signature**

```ts
type TypeId = typeof TypeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/ui-system/form/src/core/FormBuilder.ts#L143)

Since v0.0.0