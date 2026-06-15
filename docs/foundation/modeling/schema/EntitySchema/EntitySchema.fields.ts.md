---
title: EntitySchema.fields.ts
nav_order: 70
parent: "@beep/schema"
---

## EntitySchema.fields.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EntityFieldInput (type alias)](#entityfieldinput-type-alias)
  - [EntityFieldInputs (type alias)](#entityfieldinputs-type-alias)
  - [EntityVariantFieldInput (type alias)](#entityvariantfieldinput-type-alias)
  - [Fields (type alias)](#fields-type-alias)
  - [SelectedFieldOf (type alias)](#selectedfieldof-type-alias)
  - [SelectedFieldsOf (type alias)](#selectedfieldsof-type-alias)
---

# models

## EntityFieldInput (type alias)

Field input accepted by `ClassFactory`.

**Example**

```ts
import type { EntityFieldInput } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const field = S.String satisfies EntityFieldInput
console.log(field.ast._tag)
```

**Signature**

```ts
type EntityFieldInput = S.Top | EntityVariantFieldInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L62)

Since v0.0.0

## EntityFieldInputs (type alias)

Entity field input map accepted by `ClassFactory`.

**Example**

```ts
import type { EntityFieldInputs } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const fields = { name: S.String } satisfies EntityFieldInputs
console.log(fields.name.ast._tag)
```

**Signature**

```ts
type EntityFieldInputs = Readonly<Record<string, EntityFieldInput>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L79)

Since v0.0.0

## EntityVariantFieldInput (type alias)

Explicit variant field accepted by `ClassFactory`.

**Example**

```ts
import type { EntityVariantFieldInput } from "@beep/schema/EntitySchema"

declare const field: EntityVariantFieldInput
console.log(field.schemas.select.ast._tag)
```

**Signature**

```ts
type EntityVariantFieldInput = VariantSchema.Field.Any & {
  readonly schemas: VariantSchema.Field.ConfigWithKeys<Model.Variant> & {
    readonly select: S.Top;
  };
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L41)

Since v0.0.0

## Fields (type alias)

Selected-row schema field map attached to entity definitions.

**Example**

```ts
import type { Fields } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const fields: Fields = { id: S.String }
console.log(Object.keys(fields))
```

**Signature**

```ts
type Fields = Readonly<Record<string, S.Top>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L25)

Since v0.0.0

## SelectedFieldOf (type alias)

Extract the selected-row schema from one entity field input.

**Example**

```ts
import type { SelectedFieldOf } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

type Selected = SelectedFieldOf<typeof S.String>
const selected = S.String satisfies Selected
console.log(selected.ast._tag)
```

**Signature**

```ts
type SelectedFieldOf<Field> = Field extends {
  readonly schemas: {
    readonly select: infer Select extends S.Top;
  };
}
  ? Select
  : Field extends S.Top
    ? Field
    : never
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L97)

Since v0.0.0

## SelectedFieldsOf (type alias)

Extract selected-row schemas from an entity field input map.

**Example**

```ts
import type { SelectedFieldsOf } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

type Selected = SelectedFieldsOf<{ readonly name: typeof S.String }>
const fields = { name: S.String } satisfies Selected
console.log(fields.name.ast._tag)
```

**Signature**

```ts
type SelectedFieldsOf<FieldMap> = {
  readonly [K in keyof FieldMap]: SelectedFieldOf<FieldMap[K]>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.fields.ts#L123)

Since v0.0.0