---
title: EntitySchema.shape.ts
nav_order: 72
parent: "@beep/schema"
---

## EntitySchema.shape.ts overview

Internal schema module support.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [EntityFieldInputError (class)](#entityfieldinputerror-class)
  - [EntitySchemaAttachmentError (class)](#entityschemaattachmenterror-class)
- [getters](#getters)
  - [encodedAstFor](#encodedastfor)
  - [encodedFieldShape](#encodedfieldshape)
- [models](#models)
  - [EncodedFieldShape](#encodedfieldshape-1)
  - [EncodedFieldShape (type alias)](#encodedfieldshape-type-alias)
- [predicates](#predicates)
  - [isEncodedNullable](#isencodednullable)
  - [isEncodedOptional](#isencodedoptional)
- [validation](#validation)
  - [selectedRowFieldShape](#selectedrowfieldshape)
---

# errors

## EntityFieldInputError (class)

Public schema module export.

**Signature**

```ts
declare class EntityFieldInputError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L54)

Since v0.0.0

## EntitySchemaAttachmentError (class)

Public schema module export.

**Signature**

```ts
declare class EntitySchemaAttachmentError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L72)

Since v0.0.0

# getters

## encodedAstFor

Return the encoded AST for a schema field.

**Example**

```ts
import { encodedAstFor } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const ast = encodedAstFor(S.NullOr(S.String))
console.log(ast._tag)
```

**Signature**

```ts
declare const encodedAstFor: (field: S.Top) => AST.AST
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L206)

Since v0.0.0

## encodedFieldShape

Derive encoded nullability and optionality from the encoded schema AST.

**Example**

```ts
import { encodedFieldShape } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const shape = encodedFieldShape(S.NullOr(S.String))
console.log(shape.allowsNull)
```

**Signature**

```ts
declare const encodedFieldShape: (field: S.Top) => EncodedFieldShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L251)

Since v0.0.0

# models

## EncodedFieldShape

Encoded absence shape for one schema field.

**Example**

```ts
import { EncodedFieldShape } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const shape = S.decodeUnknownSync(EncodedFieldShape)({
  absenceKind: "required",
  allowsNull: false,
  allowsUndefined: false,
  isAmbiguous: false,
  isOptional: false
})

console.log(shape.absenceKind)
```

**Signature**

```ts
declare const EncodedFieldShape: S.toTaggedUnion<"absenceKind", readonly [S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>, S.Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, S.Struct<{ readonly absenceKind: S.tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: S.Boolean; readonly allowsUndefined: S.Boolean; readonly isAmbiguous: S.Boolean; readonly isOptional: S.Boolean; }>, {}>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L160)

Since v0.0.0

## EncodedFieldShape (type alias)

Runtime type for encoded field shape metadata.

**Signature**

```ts
type EncodedFieldShape = typeof EncodedFieldShape.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L189)

Since v0.0.0

# predicates

## isEncodedNullable

True when a field's encoded side allows null.

**Example**

```ts
import { isEncodedNullable } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

console.log(isEncodedNullable(S.NullOr(S.String)))
```

**Signature**

```ts
declare const isEncodedNullable: (field: S.Top) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L308)

Since v0.0.0

## isEncodedOptional

True when a field's encoded side is optional.

**Example**

```ts
import { isEncodedOptional } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

console.log(isEncodedOptional(S.optionalKey(S.String)))
```

**Signature**

```ts
declare const isEncodedOptional: (field: S.Top) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L324)

Since v0.0.0

# validation

## selectedRowFieldShape

Derive and validate selected-row absence semantics for one field.

**Example**

```ts
import { selectedRowFieldShape } from "@beep/schema/EntitySchema"
import * as S from "effect/Schema"

const shape = selectedRowFieldShape("name", S.String)
console.log(shape.absenceKind)
```

**Signature**

```ts
declare const selectedRowFieldShape: { (key: string, field: S.Top): EncodedFieldShape; (field: S.Top): (key: string) => EncodedFieldShape; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/EntitySchema.shape.ts#L280)

Since v0.0.0