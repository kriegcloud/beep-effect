# Effect Schema Internals Research - DSL.Model Design Patterns

---

## Alignment Notes (Design Specification Review)

**Reference**: `.specs/dsl-model/dsl-model.original.md`

### How This Research Aligns with DSL.Model Goals

This document provides deep research into Effect Schema internals that **directly supports** DSL.Model implementation:

1. **AST Annotation System** (Pattern 1) - Used for storing generic `ColumnDef` metadata on field schemas
2. **Schema.Class Architecture** (Pattern 2) - Foundation understanding for class extension
3. **VariantSchema.Class** (Pattern 3) - DSL.Model extends this for 6-variant support
4. **@effect/sql/Model** (Pattern 4) - Reference implementation we build upon

### Patterns to ADOPT from This Research

| Pattern | Section | DSL.Model Application |
|---------|---------|----------------------|
| Symbol-keyed annotations | Pattern 1 | `ColumnMetaSymbol`, `VariantConfigSymbol` for field metadata |
| Anonymous class extension | Pattern 2 | Return `class extends BaseClass { static readonly ... }` |
| VariantSchema.make() foundation | Pattern 3 | DSL.Model IS a VariantSchema.Class |
| Field wrappers (Generated, Sensitive) | Pattern 4 | DSL.Field wraps schemas with column annotations |
| Module augmentation for type safety | Pattern 6 | Extend `Schema.Annotations.GenericSchema` |

### Patterns to REVISE for Driver-Agnostic Design

| Original Pattern | Why Revise | Correct Approach |
|-----------------|------------|------------------|
| Static `.insert`, `.update` properties | Already handled by VariantSchema | No additional work needed |
| Drizzle-specific annotations | Driver-specific | Use **generic ColumnDef** annotations instead |
| Pattern 6 shows `PrimaryKeyAnnotationId` | Annotation is correct, but should store **generic** metadata | Store `ColumnDef` object, not driver-specific flags |

### Critical Corrections Needed

1. **"Synthesis" Section** (end of doc) shows code with **incorrect pattern**:
   ```typescript
   // ❌ INCORRECT - driver-specific static properties
   static readonly drizzleTable = drizzleTable;
   static readonly betterAuthFields = betterAuthFields;
   ```

   Should be:
   ```typescript
   // ✅ CORRECT - generic static properties
   static readonly tableName = toSnakeCase(identifier);
   static readonly columns = columns;  // Generic ColumnDef
   static readonly primaryKey = primaryKey;
   static readonly indexes = indexes;
   ```

2. **"Complete Example"** at end shows correct annotation usage but wrong static properties. The annotation pattern IS correct; the class static properties need revision.

### Outdated Assumptions (from Earlier Exploration)

- ~~DSL.Model adds `.insert`, `.update`, `.json` static properties~~ → VariantSchema.Class **already provides these**
- ~~Driver-specific column metadata in annotations~~ → Annotations store **generic ColumnDef**
- ~~Static properties include driver outputs~~ → Adapters (`toDrizzle()`, `toBetterAuth()`) are **separate functions**

### What This Research Got Right

1. **AST annotation retrieval** - Correct patterns for `SchemaAST.getAnnotation()`
2. **VariantSchema.make() as foundation** - Confirmed as the right base
3. **Field wrapper semantics** - `M.Generated`, `M.Sensitive` patterns are valid
4. **Type inference patterns** - Mapped types for field extraction
5. **Module augmentation** - For type-safe custom annotations

### Implementation Checklist Status

The checklist at the end of this document should be updated:
- [x] Research Schema annotation system - **VALID**
- [x] Understand Schema.Class internals - **VALID**
- [x] Study VariantSchema multi-variant pattern - **VALID**
- [x] Analyze @effect/sql/Model production usage - **VALID**
- [x] Document type inference patterns - **VALID**
- [x] Design annotation retrieval API - **NEEDS REVISION** (use generic ColumnDef)
- [ ] Implement DSL.Model.Class factory - with generic static properties
- [ ] Implement DSL.Field with ColumnDef annotations
- [ ] Implement `toDrizzle()` adapter function
- [ ] Implement `toBetterAuth()` adapter function

---

## Executive Summary

This research explores Effect Schema's internal mechanisms for creating extensible class-based schemas with custom static properties. The findings directly inform the design of `DSL.Model`, which needs to extend Schema.Class while adding domain-specific properties (`.insert`, `.update`, `.json` variants).

**Key Discovery**: Effect uses a combination of AST annotations, symbol-keyed metadata, and class factory functions to enable sophisticated schema extension patterns. The `@effect/sql/Model` and `@effect/experimental/VariantSchema` packages demonstrate production-ready patterns for this exact use case.

## Problem Statement

We need to design `DSL.Model` to:
1. Extend `Schema.Class` while preserving all its functionality
2. Add custom static properties for schema variants (`.insert`, `.update`, `.json`)
3. Attach column-level metadata via custom annotations (primary key, defaults, etc.)
4. Enable type-safe inference across all variants
5. Support wrapping schemas with `M.Generated`, `M.Sensitive`, etc.

## Research Sources

### Effect Documentation
- **Schema Annotations** (doc #10932) - Annotation system, custom metadata patterns
- **Class APIs** (doc #10944) - Schema.Class internals, extension patterns
- **SchemaAST.Annotations** (doc #9484, #9336) - Annotation interfaces and retrieval

### Source Code Analysis
- `node_modules/effect/src/Schema.ts` - Schema.Class implementation (lines 8985-9450)
- `node_modules/effect/src/SchemaAST.ts` - AST annotation system (lines 1-500)
- `node_modules/@effect/sql/src/Model.ts` - Production DSL.Model pattern
- `node_modules/@effect/experimental/src/VariantSchema.ts` - Multi-variant schema system

## Pattern 1: Schema AST & Annotations

### Core Concepts

**AST Structure**: Every Schema has an `ast` property of type `AST.AST`, which is a discriminated union representing the schema's internal structure:

```typescript
// From SchemaAST.ts
type AST =
  | Declaration       // Opaque types (classes, branded types)
  | Literal           // String/number/boolean literals
  | Refinement        // Filters and constraints
  | Transformation    // Schema transformations (e.g., struct -> class)
  | TypeLiteral       // Struct types
  | Union             // Union types
  | ... (14 more variants)
```

**Annotations Storage**: Each AST node has an `annotations: Record<string | symbol, unknown>` field that stores metadata:

```typescript
// From SchemaAST.ts (lines 332-352)
export const getAnnotation: {
  <A>(key: symbol): (annotated: Annotated) => Option.Option<A>
  <A>(annotated: Annotated, key: symbol): Option.Option<A>
} = dual(
  2,
  <A>(annotated: Annotated, key: symbol): Option.Option<A> =>
    Object.prototype.hasOwnProperty.call(annotated.annotations, key) ?
      Option.some(annotated.annotations[key] as any) :
      Option.none()
)
```

### Built-in Annotation Symbols

Effect provides standardized annotation IDs (lines 70-250 of SchemaAST.ts):

```typescript
export const TypeConstructorAnnotationId: unique symbol = Symbol.for("effect/annotation/TypeConstructor")
export const BrandAnnotationId: unique symbol = Symbol.for("effect/annotation/Brand")
export const SchemaIdAnnotationId: unique symbol = Symbol.for("effect/annotation/SchemaId")
export const MessageAnnotationId: unique symbol = Symbol.for("effect/annotation/Message")
export const IdentifierAnnotationId: unique symbol = Symbol.for("effect/annotation/Identifier")
export const TitleAnnotationId: unique symbol = Symbol.for("effect/annotation/Title")
export const DescriptionAnnotationId: unique symbol = Symbol.for("effect/annotation/Description")
export const ExamplesAnnotationId: unique symbol = Symbol.for("effect/annotation/Examples")
export const DefaultAnnotationId: unique symbol = Symbol.for("effect/annotation/Default")
export const JSONSchemaAnnotationId: unique symbol = Symbol.for("effect/annotation/JSONSchema")
export const ConcurrencyAnnotationId: unique symbol = Symbol.for("effect/annotation/Concurrency")
// ... and more
```

### Custom Annotations Pattern

**Defining Custom Annotations** (from Schema Annotations docs):

```typescript
// Step 1: Define a unique symbol
const DeprecatedId = Symbol.for("some/unique/identifier/for/your/custom/annotation")

// Step 2: Apply annotation
const MyString = Schema.String.annotations({ [DeprecatedId]: true })

// Step 3: Module augmentation for type safety
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [DeprecatedId]?: boolean
    }
  }
}

// Step 4: Retrieve annotation
const isDeprecated = <A, I, R>(schema: Schema.Schema<A, I, R>): boolean =>
  SchemaAST.getAnnotation<boolean>(DeprecatedId)(schema.ast).pipe(
    Option.getOrElse(() => false)
  )
```

**Key Insight**: Annotations can store ANY data type - primitives, objects, functions, schemas. This enables rich metadata attachment.

## Pattern 2: Schema.Class Architecture

### Class Schema is a Transformation

From the Class APIs documentation:

> Classes defined with `Schema.Class` act as transformations. They transform a struct schema into a declaration schema that represents a class type.

**Three-Schema Architecture**:

```typescript
class Person extends Schema.Class<Person>("Person")({
  id: Schema.Number,
  name: Schema.NonEmptyString
}) {}

// Under the hood, this creates:
// 1. "from" schema: Schema.Struct({ id: Schema.Number, name: Schema.NonEmptyString })
// 2. "to" schema: Schema.declare((input) => input instanceof Person)
// 3. "transformation" schema: from -> to with encoding/decoding logic
```

### Schema.Class Implementation (lines 9194-9450)

**Class Factory Function**:

```typescript
// From Schema.ts (line 9194)
export const Class = <Self = never>(identifier: string) =>
  <Fields extends Struct.Fields>(
    fieldsOr: Fields | HasFields<Fields>,
    annotations?: ClassAnnotations<Self, Simplify<Struct.Type<Fields>>>
  ): Class<Self, Fields, ...> =>
    makeClass({
      kind: "Class",
      identifier,
      schema: getSchemaFromFieldsOr(fieldsOr),
      fields: getFieldsFromFieldsOr(fieldsOr),
      Base: data_.Class,
      annotations
    })
```

**makeClass Internal** (line 9400):

```typescript
const makeClass = <Fields extends Struct.Fields>({
  Base,
  annotations,
  fields,
  identifier,
  kind,
  schema
}: {
  kind: "Class" | "TaggedClass" | "TaggedError" | "TaggedRequest"
  identifier: string
  schema: Schema.Any
  fields: Fields
  Base: new(...args: ReadonlyArray<any>) => any
  annotations?: ClassAnnotations<any, any> | undefined
}): any => {
  const classSymbol = Symbol.for(`effect/Schema/${kind}/${identifier}`)

  const [typeAnnotations, transformationAnnotations, encodedAnnotations] =
    getClassAnnotations(annotations)

  // Creates three annotated schemas:
  const declarationSurrogate = typeSchema(schema).annotations({
    identifier,
    ...typeAnnotations
  })

  const typeSide = typeSchema(schema).annotations({
    [AST.AutoTitleAnnotationId]: `${identifier} (Type side)`,
    ...typeAnnotations
  })

  const constructorSchema = schema.annotations({
    [AST.AutoTitleAnnotationId]: `${identifier} (Constructor)`,
    ...typeAnnotations
  })

  // ... creates actual class with static properties
  const klass = class extends Base {
    // constructor implementation
  }

  Object.assign(klass, {
    ast: /* transformation AST */,
    fields,
    identifier,
    annotations: /* method */,
    extend: /* method */,
    transformOrFail: /* method */,
    // ... etc
  })

  return klass
}
```

**Critical Insights**:

1. **Static Properties via Object.assign**: Schema.Class adds static properties by assigning them to the class constructor after creation
2. **Fields Preservation**: The `fields` object is stored as a static property for introspection
3. **Identifier Tracking**: A unique symbol identifies the class globally
4. **Three-Way Annotations**: Annotations can target the type side, transformation, or encoded side separately

### Class Extension Pattern

Schema.Class provides `.extend()` for class inheritance (lines 9026-9038):

```typescript
class MyClass extends Schema.Class<MyClass>("MyClass")({
  myField: Schema.String
}) {
  myMethod() {
    return this.myField + "my"
  }
}

class NextClass extends MyClass.extend<NextClass>("NextClass")({
  nextField: Schema.Number
}) {
  nextMethod() {
    return this.myMethod() + this.myField + this.nextField
  }
}
```

**Implementation**: `.extend()` merges field definitions and creates a new transformation that inherits from the parent class.

## Pattern 3: Multi-Variant Schemas (@effect/experimental/VariantSchema)

### Variant Schema System

`VariantSchema.make` creates a DSL for defining schemas with multiple "variants" - different shapes for different contexts:

```typescript
// From @effect/experimental/VariantSchema.ts (lines 364-370)
export const make = <
  const Variants extends ReadonlyArray<string>,
  const Default extends Variants[number]
>(options: {
  readonly variants: Variants
  readonly defaultVariant: Default
}): {
  readonly Struct: /* ... */
  readonly Field: /* ... */
  readonly FieldOnly: /* ... */
  readonly FieldExcept: /* ... */
  readonly fieldEvolve: /* ... */
  readonly extract: /* ... */
  readonly Class: /* ... */
}
```

### Field Abstraction

A `Field` represents a column that can have different schemas per variant:

```typescript
// From VariantSchema.ts (lines 98-101)
export interface Field<in out A extends Field.Config> extends Pipeable {
  readonly [FieldTypeId]: FieldTypeId
  readonly schemas: A  // Maps variant name -> schema
}

// Example:
const Generated = <S>(schema: S): Field<{
  readonly select: S
  readonly update: S
  readonly json: S
}> => Field({
  select: schema,
  update: schema,
  json: schema
  // "insert" variant omitted - field not present in inserts
})
```

### Schema Extraction

The `extract` function materializes a specific variant as a concrete `Schema.Struct`:

```typescript
// From VariantSchema.ts (lines 185-228)
const extract = <V extends string, A extends Struct<any>>(
  self: A,
  variant: V
): Extract<V, A> => {
  const fields: Record<string, any> = {}
  for (const key of Object.keys(self[TypeId])) {
    const value = self[TypeId][key]
    if (FieldTypeId in value) {
      // Extract schema for this variant from the field
      if (variant in value.schemas) {
        fields[key] = value.schemas[variant]
      }
    } else {
      // Regular schema - use as-is
      fields[key] = value
    }
  }
  return Schema.Struct(fields)
}
```

**Caching**: Variant extraction results are cached to avoid repeated computation.

### VariantSchema.Class

Creates a class that IS ALSO a VariantSchema.Struct:

```typescript
// From VariantSchema.ts (lines 244-274)
export interface Class<
  Self,
  Fields extends Struct.Fields,
  SchemaFields extends Schema.Struct.Fields,
  A, I, R, C
> extends
  Schema.Schema<Self, Schema.Simplify<I>, R>,
  Struct<Schema.Simplify<Fields>>  // ← Also a Struct!
{
  new(props: ...): A

  readonly ast: AST.Transformation
  readonly identifier: string
  readonly fields: Schema.Simplify<SchemaFields>

  make<Args extends Array<any>, X>(this: { new(...args: Args): X }, ...args: Args): X
  annotations(annotations: Schema.Annotations.Schema<Self>): Schema.SchemaClass<Self, I, R>
}
```

**Key Insight**: A VariantSchema.Class implements BOTH `Schema.Schema` AND `Struct<Fields>`, meaning it has:
- The `[TypeId]` symbol containing the raw fields (with Field objects)
- All Schema.Class static properties
- Variant extraction via the Struct interface

## Pattern 4: @effect/sql/Model Production Pattern

### Model.Class Architecture

From `@effect/sql/Model.ts` (lines 19-157):

```typescript
const {
  Class,
  Field,
  FieldExcept,
  FieldOnly,
  Struct,
  Union,
  extract,
  fieldEvolve,
  fieldFromKey
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
})

// Model.Class IS VariantSchema.Class with 6 variants
export { Class }
```

### Type Definition with Variants

```typescript
// From Model.ts (lines 38-58)
export type Any = Schema.Schema.Any & {
  readonly fields: Schema.Struct.Fields
  readonly insert: Schema.Schema.Any
  readonly update: Schema.Schema.Any
  readonly json: Schema.Schema.Any
  readonly jsonCreate: Schema.Schema.Any
  readonly jsonUpdate: Schema.Schema.Any
}

export type AnyNoContext = Schema.Schema.AnyNoContext & {
  readonly fields: Schema.Struct.Fields
  readonly insert: Schema.Schema.AnyNoContext
  readonly update: Schema.Schema.AnyNoContext
  readonly json: Schema.Schema.AnyNoContext
  readonly jsonCreate: Schema.Schema.AnyNoContext
  readonly jsonUpdate: Schema.Schema.AnyNoContext
}
```

**Pattern**: Use intersection types to augment `Schema.Schema.Any` with variant properties.

### Field Wrappers

Model provides semantic wrappers around `VariantSchema.Field`:

```typescript
// Generated - present in select/update/json, absent from insert
export const Generated = <S>(schema: S): Generated<S> =>
  Field({
    select: schema,
    update: schema,
    json: schema
  })

// Sensitive - present in select/insert/update, absent from json variants
export const Sensitive = <S>(schema: S): Sensitive<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema
  })

// GeneratedByApp - required by DB, optional in JSON
export const GeneratedByApp = <S>(schema: S): GeneratedByApp<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema,
    json: schema
  })
```

### Practical Usage Example

```typescript
// From Model.ts documentation (lines 80-114)
export const GroupId = Schema.Number.pipe(Schema.brand("GroupId"))

export class Group extends Model.Class<Group>("Group")({
  id: Model.Generated(GroupId),
  name: Schema.NonEmptyTrimmedString,
  createdAt: Model.DateTimeInsertFromDate,
  updatedAt: Model.DateTimeUpdateFromDate
}) {}

// Usage:
Group              // Schema for selects
Group.insert       // Schema for inserts (no id, no createdAt, no updatedAt)
Group.update       // Schema for updates
Group.json         // Schema for JSON API
Group.jsonCreate   // Schema for JSON create endpoint
Group.jsonUpdate   // Schema for JSON update endpoint

// Can also wrap in Schema.Class for methods:
class GroupJson extends Schema.Class<GroupJson>("GroupJson")(Group.json) {
  get upperName() {
    return this.name.toUpperCase()
  }
}
```

## Pattern 5: Type-Level Inference Through Schemas

### Schema.Schema Type Parameters

Every Schema has three type parameters:

```typescript
interface Schema<in out A, in out I = A, out R = never> {
  readonly Type: A          // Decoded/runtime type
  readonly Encoded: I       // Encoded/wire type
  readonly Context: R       // Effect context requirements
  readonly ast: AST.AST
}
```

### Extracting Types from Schemas

```typescript
// Type extraction utilities (built into effect/Schema)
type Schema.Type<S> = S extends Schema<infer A, any, any> ? A : never
type Schema.Encoded<S> = S extends Schema<any, infer I, any> ? I : never
type Schema.Context<S> = S extends Schema<any, any, infer R> ? R : never

// For Struct fields:
type Struct.Type<Fields> = {
  readonly [K in keyof Fields]: Schema.Type<Fields[K]>
}
type Struct.Encoded<Fields> = {
  readonly [K in keyof Fields]: Schema.Encoded<Fields[K]>
}
```

### Wrapping and Unwrapping

When a field is wrapped (e.g., `M.Generated(schema)`), the type inference must:

1. **Detect the wrapper** - Check if the field is a `Field` object
2. **Extract the variant schema** - Get `field.schemas[variant]`
3. **Infer from inner schema** - Apply `Schema.Type<extracted>`

```typescript
// Example from VariantSchema.ts (lines 160-171)
type ExtractFields<V extends string, Fields extends Struct.Fields> = {
  readonly [K in keyof Fields as /* field presence logic */]:
    [Fields[K]] extends [Field<infer Config>] ?
      [Config[V]] extends [Schema.Schema.All] ? Config[V] : never
    : [Fields[K]] extends [Schema.Schema.All] ? Fields[K]
    : never
}

type Extract<V extends string, A extends Struct<any>> =
  Schema.Struct<Schema.Simplify<ExtractFields<V, A[TypeId]>>>
```

**Critical Pattern**: Complex conditional types drill through wrapper layers to find the actual schema for type inference.

## Pattern 6: Custom Annotation Retrieval for Column Metadata

### Annotation-Based Column Flags

For DSL.Model, we can attach column metadata via annotations:

```typescript
// Define column annotation symbols
const PrimaryKeyAnnotationId = Symbol.for("@beep/schema/sql/PrimaryKey")
const DefaultAnnotationId = Symbol.for("@beep/schema/sql/Default")
const GeneratedAnnotationId = Symbol.for("@beep/schema/sql/Generated")

// Attach to schemas
const UserId = S.String.pipe(
  S.brand("UserId"),
  S.annotations({ [PrimaryKeyAnnotationId]: true })
)

// Retrieve during introspection
const isPrimaryKey = (schema: Schema.Schema.Any): boolean =>
  SchemaAST.getAnnotation<boolean>(PrimaryKeyAnnotationId)(schema.ast).pipe(
    Option.getOrElse(() => false)
  )
```

### Field-Level vs Schema-Level Annotations

Two places to store metadata:

1. **Schema annotations** - Attached to the schema itself (e.g., `S.String.annotations(...)`)
2. **PropertySignature annotations** - Attached to the field in a Struct

```typescript
// Schema-level
const EmailSchema = S.String.annotations({
  [UniqueAnnotationId]: true
})

// PropertySignature-level
const UserSchema = S.Struct({
  email: S.propertySignature(EmailSchema).annotations({
    [IndexAnnotationId]: { type: "btree" }
  })
})
```

**Best Practice**: Use schema-level annotations for intrinsic properties (primary key, branding) and PropertySignature annotations for relational properties (indexes, foreign keys).

## Synthesis: Optimal DSL.Model Design

### Architecture Recommendation

**Use VariantSchema.make as the foundation**:

```typescript
// packages/common/schema/src/integrations/sql/dsl/Model.ts
import * as VariantSchema from "@effect/experimental/VariantSchema"

const {
  Class,
  Field,
  Struct,
  extract
} = VariantSchema.make({
  variants: ["select", "insert", "update"],
  defaultVariant: "select"
})

// Export as Model.Class
export { Class }
```

### Field Wrapper Pattern

```typescript
// M.Generated wraps a schema with variant-specific behavior
export interface Generated<S extends Schema.Schema.All> extends
  VariantSchema.Field<{
    readonly select: S
    readonly update: S
  }>
{}

export const Generated = <S extends Schema.Schema.All>(
  schema: S
): Generated<S> =>
  Field({
    select: schema,
    update: schema
    // Omit "insert" - not present in insert operations
  })

// M.Sensitive excludes from certain operations
export const Sensitive = <S extends Schema.Schema.All>(
  schema: S
): Sensitive<S> =>
  Field({
    select: schema,
    insert: schema,
    update: schema
    // Could add: .annotations({ [SensitiveAnnotationId]: true })
  })
```

### Column Annotation Pattern

> **REVISED**: Instead of separate boolean annotations, DSL.Model uses a **single `ColumnDef` annotation** containing all generic column metadata. This simplifies retrieval and ensures consistency.

```typescript
// Single symbol for all column metadata
export const ColumnMetaSymbol = Symbol.for("@beep/dsl-model/column-meta")

// Generic, driver-agnostic column definition
interface ColumnDef {
  readonly type: ColumnType;  // "string" | "number" | "boolean" | "date" | "datetime" | "json" | "uuid" | "blob"
  readonly primaryKey?: boolean;
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly defaultValue?: string | (() => string);
  readonly maxLength?: number;
  readonly references?: { table: string; column: string; onDelete?: string };
}

// DSL.Field attaches ColumnDef to schema
export const Field = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: { column?: Partial<ColumnDef>; variants?: VariantConfig }
): DSLField<A, I, R> => {
  const columnDef: ColumnDef = {
    type: inferColumnType(schema),  // Infer from schema if not provided
    ...config?.column,
  };
  return schema.annotations({ [ColumnMetaSymbol]: columnDef }) as DSLField<A, I, R>;
};

// Retrieval helper
export const getColumnDef = (schema: Schema.Schema.Any): Option.Option<ColumnDef> =>
  SchemaAST.getAnnotation<ColumnDef>(ColumnMetaSymbol)(schema.ast)

// Convenience helpers (derive from ColumnDef)
export const isPrimaryKey = (schema: Schema.Schema.Any): boolean =>
  getColumnDef(schema).pipe(
    Option.map(def => def.primaryKey ?? false),
    Option.getOrElse(() => false)
  )
```

**Key Change**: One annotation symbol (`ColumnMetaSymbol`) stores the complete `ColumnDef` object. This is cleaner than multiple boolean annotations and matches the design spec's driver-agnostic approach.

### Type Augmentation Pattern

```typescript
// Augment Schema.Annotations for type safety
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> {
      // Single annotation containing all column metadata
      [ColumnMetaSymbol]?: ColumnDef
      // Optional: variant configuration for Field wrappers
      [VariantConfigSymbol]?: VariantConfig
    }
  }
}
```

> **REVISED**: Uses single `ColumnDef` annotation instead of multiple boolean flags.

### Static Property Access Pattern

Since `VariantSchema.Class` already implements the `Struct` interface, variants are accessible via:

```typescript
class User extends Model.Class<User>("User")({
  id: M.Generated(UserId),
  email: S.String
}) {}

// Access variants:
User                    // Default variant ("select")
extract(User, "insert") // Extract "insert" variant
extract(User, "update") // Extract "update" variant

// Or with cached getters (add to makeClass):
Object.defineProperty(User, "insert", {
  get() {
    return extract(this, "insert")
  }
})

// Then:
User.insert  // Cached, type-safe variant access
```

### Complete Example

```typescript
import * as S from "effect/Schema"
import * as M from "@beep/schema/integrations/sql/dsl"

const UserId = S.String.pipe(
  S.brand("UserId"),
  M.primaryKey
)

class User extends M.Class<User>("User")({
  id: M.Generated(UserId),
  email: S.String.pipe(M.unique),
  passwordHash: M.Sensitive(S.String),
  createdAt: M.DateTimeInsert,
  updatedAt: M.DateTimeUpdate
}) {}

// Type inference:
type UserSelect = S.Schema.Type<typeof User>
// { id: UserId, email: string, passwordHash: string, createdAt: DateTime.Utc, updatedAt: DateTime.Utc }

type UserInsert = S.Schema.Type<typeof User.insert>
// { email: string, passwordHash: string }

type UserUpdate = S.Schema.Type<typeof User.update>
// { id: UserId, email: string, passwordHash: string, createdAt: DateTime.Utc, updatedAt: DateTime.Utc }

// Annotation retrieval:
M.isPrimaryKey(User.fields.id)  // true
M.isGenerated(User.fields.id)   // true
M.isSensitive(User.fields.passwordHash)  // true

// ============ STATIC PROPERTIES (driver-agnostic) ============
User.tableName      // "user"
User.columns        // { id: ColumnDef, email: ColumnDef, ... }
User.primaryKey     // ["id"]
User.indexes        // []
User.identifier     // "User"

// ============ DRIVER ADAPTERS (separate functions) ============
const drizzleTable = DSL.toDrizzle(User);       // Drizzle PgTable
const betterAuthFields = DSL.toBetterAuth(User); // better-auth config
```

> **IMPORTANT**: Static properties expose **generic metadata** (`ColumnDef`), not driver-specific outputs. Driver outputs are generated via **adapter functions** (`toDrizzle`, `toBetterAuth`).

## Key Takeaways for DSL.Model Implementation

### 1. Use VariantSchema.make as Foundation
Don't reinvent multi-variant schemas. `@effect/experimental/VariantSchema` provides a battle-tested, type-safe system.

### 2. Store Metadata in Annotations
Use Symbol-keyed annotations for column metadata (primary keys, defaults, indexes). This keeps data close to the schema and enables introspection.

### 3. Field Wrappers for Semantic Clarity
`M.Generated`, `M.Sensitive`, etc. are just thin wrappers around `VariantSchema.Field` with pre-configured variant presence/absence.

### 4. Static Property Caching
Variant extraction is expensive. Cache extracted schemas as static properties with getters.

### 5. Type Safety via Module Augmentation
Extend `Schema.Annotations.GenericSchema` to make custom annotations type-safe.

### 6. Follow @effect/sql/Model Patterns
It's production-ready and widely used. Our DSL should feel similar to users familiar with that library.

## Implementation Checklist

- [x] Research Schema annotation system
- [x] Understand Schema.Class internals
- [x] Study VariantSchema multi-variant pattern
- [x] Analyze @effect/sql/Model production usage
- [x] Document type inference patterns
- [x] Design annotation retrieval API
- [ ] Implement DSL.Model.Class factory
- [ ] Implement field wrappers (M.Generated, M.Sensitive, etc.)
- [ ] Implement column annotation symbols and helpers
- [ ] Add static property caching for variants
- [ ] Write comprehensive tests
- [ ] Document usage patterns

## References

### Effect Documentation
- Schema Annotations: https://effect.website/docs/schema/annotations
- Class APIs: https://effect.website/docs/schema/class-apis
- Schema Transformations: https://effect.website/docs/schema/transformations

### Source Files
- `/node_modules/effect/src/Schema.ts` - Schema.Class implementation
- `/node_modules/effect/src/SchemaAST.ts` - AST and annotation system
- `/node_modules/@effect/sql/src/Model.ts` - Production DSL.Model pattern
- `/node_modules/@effect/experimental/src/VariantSchema.ts` - Multi-variant schema system

### Beep-Effect Integration
- Current implementation: `/packages/common/schema/src/integrations/sql/dsl/`
- Annotation definitions: `/packages/common/schema/src/integrations/sql/dsl/annotations.ts`
- Model factory: `/packages/common/schema/src/integrations/sql/dsl/Model.ts` (to be created)
