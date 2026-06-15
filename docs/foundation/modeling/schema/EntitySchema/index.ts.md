---
title: index.ts
nav_order: 74
parent: "@beep/schema"
---

## index.ts overview

Public schema module export.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - ["./EntitySchema.factory.ts" (namespace export)](#entityschemafactoryts-namespace-export)
- [models](#models)
  - ["./EntitySchema.definition.ts" (namespace export)](#entityschemadefinitionts-namespace-export)
  - ["./EntitySchema.fields.ts" (namespace export)](#entityschemafieldsts-namespace-export)
  - ["./EntitySchema.persist.ts" (namespace export)](#entityschemapersistts-namespace-export)
  - [EncodedFieldShape](#encodedfieldshape)
  - [encodedAstFor](#encodedastfor)
  - [encodedFieldShape](#encodedfieldshape-1)
  - [isEncodedNullable](#isencodednullable)
  - [isEncodedOptional](#isencodedoptional)
  - [selectedRowFieldShape](#selectedrowfieldshape)
- [schemas](#schemas)
  - ["./EntitySchema.constructors.ts" (namespace export)](#entityschemaconstructorsts-namespace-export)
---

# constructors

## "./EntitySchema.factory.ts" (namespace export)

Re-exports all named exports from the "./EntitySchema.factory.ts" module.

**Signature**

```ts
export * from "./EntitySchema.factory.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L24)

Since v0.0.0

# models

## "./EntitySchema.definition.ts" (namespace export)

Re-exports all named exports from the "./EntitySchema.definition.ts" module.

**Signature**

```ts
export * from "./EntitySchema.definition.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L19)

Since v0.0.0

## "./EntitySchema.fields.ts" (namespace export)

Re-exports all named exports from the "./EntitySchema.fields.ts" module.

**Signature**

```ts
export * from "./EntitySchema.fields.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L29)

Since v0.0.0

## "./EntitySchema.persist.ts" (namespace export)

Re-exports all named exports from the "./EntitySchema.persist.ts" module.

**Signature**

```ts
export * from "./EntitySchema.persist.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L34)

Since v0.0.0

## EncodedFieldShape

**Signature**

```ts
declare const EncodedFieldShape: toTaggedUnion<"absenceKind", readonly [Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>, Class<EncodedFieldShapeMember<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">, Struct<{ readonly absenceKind: tag<"undefined" | "required" | "nullable" | "nullish" | "optionalKey" | "optionalNullable" | "optionalUndefined" | "optionalNullish" | "ambiguous">; readonly allowsNull: Boolean; readonly allowsUndefined: Boolean; readonly isAmbiguous: Boolean; readonly isOptional: Boolean; }>, {}>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L40)

Since v0.0.0

## encodedAstFor

**Signature**

```ts
declare const encodedAstFor: (field: Top) => AST
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L41)

Since v0.0.0

## encodedFieldShape

**Signature**

```ts
declare const encodedFieldShape: (field: Top) => EncodedFieldShape
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L42)

Since v0.0.0

## isEncodedNullable

**Signature**

```ts
declare const isEncodedNullable: (field: Top) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L43)

Since v0.0.0

## isEncodedOptional

**Signature**

```ts
declare const isEncodedOptional: (field: Top) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L44)

Since v0.0.0

## selectedRowFieldShape

**Signature**

```ts
declare const selectedRowFieldShape: { (key: string, field: Top): EncodedFieldShape; (field: Top): (key: string) => EncodedFieldShape; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L45)

Since v0.0.0

# schemas

## "./EntitySchema.constructors.ts" (namespace export)

Re-exports all named exports from the "./EntitySchema.constructors.ts" module.

**Signature**

```ts
export * from "./EntitySchema.constructors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EntitySchema/index.ts#L14)

Since v0.0.0