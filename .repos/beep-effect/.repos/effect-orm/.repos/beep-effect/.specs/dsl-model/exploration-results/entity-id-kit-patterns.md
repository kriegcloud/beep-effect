# Entity ID and Kit Patterns - Research Summary

## Alignment Notes

> **Status**: ALIGNED with DSL.Model design goals
>
> This research document is **RECOMMENDED** for DSL.Model implementation. The patterns documented here directly inform the core design.

### How This Research Aligns with DSL.Model Goals

1. **Anonymous class extension pattern** - RECOMMENDED
   - The EntityId and LiteralKit patterns use the same `class extends S.make<Type>(ast)` approach specified for DSL.Model
   - This is the exact pattern DSL.Model will use, but extending `VariantSchema.Class` instead of `S.make`

2. **Static property exposure** - RECOMMENDED
   - EntityId exposes `.tableName`, `.brand`, `.create`, `.is`, `.publicId()`, `.privateId()`
   - LiteralKit exposes `.Options`, `.Enum`, `.is`, `.derive()`, `.toTagged()`
   - DSL.Model will expose `.tableName`, `.columns`, `.primaryKey`, `.indexes`, `.identifier`

3. **`annotations()` override pattern** - CRITICAL / RECOMMENDED
   - Both patterns override `annotations()` to call the factory function with merged annotations
   - This preserves static properties through chaining - essential for DSL.Model

4. **Interface + Factory architecture** - RECOMMENDED
   - `SchemaInstance<>` interface declares the public API with static properties
   - `makeXxxSchemaInstance()` factory returns anonymous class implementing the interface
   - DSL.Model follows this same architecture

### Caveats and Outdated Assumptions

1. **DEPRECATED: Direct Drizzle integration on EntityId**
   - EntityId exposes `.publicId()` and `.privateId()` which return Drizzle column builders
   - This is **driver-specific** coupling that DSL.Model intentionally avoids
   - DSL.Model uses **adapter functions** (`DSL.toDrizzle()`, `DSL.toBetterAuth()`) instead of methods on the model
   - **Do not copy this pattern** - use the adapter approach instead

2. **Note on `.tableName` location**
   - EntityId exposes `.tableName` as a static property (correct pattern)
   - DSL.Model will also expose `.tableName` but it is derived from the identifier (snake_case conversion)

### Patterns Summary

| Pattern | Recommendation | Notes |
|---------|----------------|-------|
| Anonymous class extending base | RECOMMENDED | Use `VariantSchema.Class` as base |
| Static property assignment | RECOMMENDED | Assign in class body |
| Interface declaring statics | RECOMMENDED | Type intersection for statics |
| `annotations()` override | CRITICAL | Must call factory with merged annotations |
| Drizzle methods on schema | DEPRECATED | Use adapter functions instead |
| TypeId variance marker | OPTIONAL | Helpful for type safety |

---

## Overview

This document analyzes existing patterns in beep-effect for creating rich schema types that expose metadata via static properties, providing templates for DSL.Model implementation.

---

## 1. EntityId Pattern

**Source**: `packages/common/schema/src/identity/entity-id/entity-id.ts`

### Type Structure

```typescript
// Runtime type: only the template literal string
export type Type<TableName extends string> =
  S.Schema.Type<DataTypeSchema<TableName>>;

// Schema instance interface: Type + static properties
export interface SchemaInstance<TableName extends string, Brand extends string>
  extends S.AnnotableClass<
    SchemaInstance<TableName, Brand>,
    Type<TableName>,  // ← ONLY runtime type
    Type<TableName>,
    never
  > {
  readonly [TypeId]: typeof variance;
  readonly create: () => Type<TableName>;
  readonly tableName: SnakeTag.Literal<TableName>;
  readonly brand: Brand;
  readonly is: (u: unknown) => u is Type<TableName>;
  readonly publicId: () => PublicId<TableName>;
  readonly privateId: () => PrivateId<Brand>;
  readonly privateSchema: S.brand<S.refine<number>, Brand>;
  readonly modelIdSchema: S.optionalWith<DataTypeSchema<TableName>, {...}>;
  readonly modelRowIdSchema: S.brand<S.refine<number>, Brand>;
}
```

### Implementation via Class Extension

```typescript
return class EntityIdClass extends S.make<EntityId.Type<TableName>>(defaultAST) {
  static override [TypeId] = variance;
  static readonly create = create;
  static readonly tableName = config.tableName;
  static readonly brand = config.brand;
  static readonly is = isGuard;
  static readonly publicId = () => publicId;
  static readonly privateId = () => privateId;
  static readonly privateSchema = privateSchema;

  static override annotations(
    annotations: S.Annotations.Schema<EntityId.Type<TableName>>
  ): EntityId.SchemaInstance<TableName, Brand> {
    return makeEntityIdSchemaInstance(config, mergeSchemaAnnotations(defaultAST, annotations));
  }
};
```

### Static Properties Exposed

| Property | Type | Purpose |
|----------|------|---------|
| `create` | `() => Type` | Generate new ID with UUID |
| `tableName` | `string` | Snake_case table name |
| `brand` | `string` | TypeScript brand/nominal type |
| `is` | Type guard | Validate ID format |
| `publicId` | Drizzle builder | SQL column definition |
| `privateId` | Drizzle builder | Primary key row ID |
| `modelIdSchema` | Schema | ID field with default |
| `modelRowIdSchema` | Schema | Private ID schema |

---

## 2. LiteralKit Pattern

**Source**: `packages/common/schema/src/derived/kits/string-literal-kit.ts`

### Type Structure

```typescript
export interface ILiteralKit<Literals extends LiteralsType, Mapping extends MappingType<Literals> | undefined>
  extends S.AnnotableClass<ILiteralKit<Literals, Mapping>, Literals[number]> {
  readonly Options: Literals;
  readonly Enum: LiteralKitEnum<Literals, Mapping>;
  readonly is: IsGuards<Literals>;
  readonly omitOptions: OmitOptions<Literals>;
  readonly pickOptions: PickOptions<Literals>;
  readonly derive: <Keys extends LiteralsSubset<Literals>>(...keys: Keys) => DerivedLiteralKit<Keys>;
  readonly toTagged: <const D extends string>(discriminator: D) => TaggedMembersResult<Literals, D>;
}
```

### Implementation

```typescript
return class WithStatics extends S.make<Literals[number]>(ast) {
  static override annotations(annotations: S.Annotations.Schema<Literals[number]>): ILiteralKit<Literals, Mapping> {
    return enumMapping
      ? makeLiteralKit(this.Options, enumMapping, mergeSchemaAnnotations(this.ast, annotations))
      : makeLiteralKit(this.Options, undefined, mergeSchemaAnnotations(this.ast, annotations));
  }

  static omitOptions = omitOptions;
  static pickOptions = pickOptions;
  static Options = literals;
  static Enum = Enum;
  static is = buildIsGuards(literals);
  static derive = <Keys extends A.NonEmptyReadonlyArray<Literals[number]>>(
    ...keys: Keys
  ): DerivedLiteralKitSchema<Keys> => { /* ... */ };
  static toTagged = toTagged;
};
```

### Static Properties Exposed

| Property | Type | Purpose |
|----------|------|---------|
| `Options` | Literals array | All literal values |
| `Enum` | Record | Literal key → value mapping |
| `is` | IsGuards | Per-literal type guards |
| `pickOptions` | Function | Create subset with selected literals |
| `omitOptions` | Function | Create subset excluding literals |
| `derive` | Function | Create new kit from subset |
| `toTagged` | Function | Convert to discriminated union |

---

## 3. Common Pattern Architecture

All patterns follow this structure:

```
┌─────────────────────────────────────────┐
│  makeXxxKit() Factory Function          │
│  - Takes configuration                  │
│  - Creates AST                          │
│  - Returns class extending S.make()     │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  class XxxClass extends S.make<Type>    │
│  - Inherits Schema methods              │
│  - Adds static metadata properties      │
│  - Overrides annotations() for chaining │
└─────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────┐
│  IXxxInterface extends AnnotableClass   │
│  - Type parameter = runtime type ONLY   │
│  - Declares all static properties       │
│  - Chaining returns interface type      │
└─────────────────────────────────────────┘
```

---

## 4. Type Safety Mechanisms

### Type Parameter Separation

The `AnnotableClass<This, Type>` pattern keeps metadata OUT of the Type parameter:

```typescript
// ❌ WRONG - Would pollute the Type parameter
extends S.AnnotableClass<SchemaInstance, Type & StaticProperties>

// ✅ RIGHT - Type parameter is ONLY the runtime type
extends S.AnnotableClass<SchemaInstance, Type>
```

Static properties are declared in the interface, NOT in the Type generic.

### Variance Marker

```typescript
readonly [TypeId]: typeof variance;
```

Prevents Type parameter from being inferred based on class properties.

### Annotation Chaining

```typescript
static override annotations(annotations: S.Annotations.Schema<Type>): IXxx {
  return makeXxxKit(config, mergeSchemaAnnotations(this.ast, annotations));
}
```

Returns the interface type, preserving static properties.

---

## 5. Key Design Principles

1. **Separation of Concerns**
   - Type parameter = runtime data type only
   - Interface = runtime type + static metadata
   - Implementation class = S.make() extension + static methods

2. **Factory + Class Extension Pattern**
   - Factory creates AST and configuration
   - Returns anonymous class extending S.make()
   - Allows per-instance AST customization

3. **Fluent/Chainable API**
   - Static methods return compatible types
   - `annotations()` preserves static properties
   - Nested kits for composition

4. **Drizzle Integration** (EntityId-specific)
   - SQL column builders (`.publicId()`, `.privateId()`) return Drizzle types
   - Column metadata exposed as static strings
   - Direct integration with ORM
   - **Note**: This pattern is DEPRECATED for DSL.Model - see Alignment Notes above

---

## 6. Application to DSL.Model

> **WARNING**: This example contains OUTDATED patterns that conflict with the DSL.Model design specification.
> See the corrected version below.

```typescript
// ❌ OUTDATED EXAMPLE - DO NOT FOLLOW
const UserModel = DSL.Model<UserModel>("User")({
  id: DSL.Field(EntityId.UserId, { sql: { primaryKey: true } }),
  email: DSL.Field(S.String, { sql: { type: "varchar", unique: true } }),
  createdAt: DSL.Field(S.DateTimeUtc, { sql: { type: "timestamp" } }),
});

// Works as schema - CORRECT
S.decode(UserModel)({ ... });

// ❌ WRONG - These should NOT be static properties on the model:
UserModel.drizzleTable        // ❌ Use DSL.toDrizzle(UserModel) instead
UserModel.betterAuthFields    // ❌ Use DSL.toBetterAuth(UserModel) instead
UserModel.sqlMetadata.id      // ❌ Use UserModel.columns.id instead
```

### Corrected Example (per DSL.Model Design Spec)

```typescript
// ✅ CORRECT - DSL.Model with driver-agnostic metadata
export class UserModel extends DSL.Model<UserModel>("User")({
  id: DSL.Field(EntityId.UserId, {
    column: { type: "uuid", primaryKey: true },
    variants: { insert: "omit", select: "required" },
  }),
  email: DSL.Field(S.String, {
    column: { type: "string", unique: true, maxLength: 255 },
    variants: { insert: "required", update: "optional" },
  }),
  createdAt: DSL.Field(S.DateTimeUtc, {
    column: { type: "datetime", defaultValue: "now()" },
    variants: { insert: "omit", select: "required" },
  }),
}) {}

// ✅ Works as schema
S.decode(UserModel)({ ... });

// ✅ Generic static properties (driver-agnostic)
UserModel.tableName           // "user"
UserModel.identifier          // "User"
UserModel.columns.id          // { type: "uuid", primaryKey: true }
UserModel.primaryKey          // ["id"]

// ✅ Driver adapters (SEPARATE functions, not methods on model)
const drizzleTable = DSL.toDrizzle(UserModel);       // PgTable
const betterAuthFields = DSL.toBetterAuth(UserModel); // Record<string, DBFieldAttribute>
```

---

## 7. Key Files

| File | Purpose |
|------|---------|
| `packages/common/schema/src/identity/entity-id/entity-id.ts` | EntityId implementation |
| `packages/common/schema/src/derived/kits/string-literal-kit.ts` | LiteralKit implementation |
| `packages/common/schema/src/derived/kits/mapped-literal-kit.ts` | MappedLiteralKit (advanced) |
