# Effect Schema & SchemaAST Patterns Research

## Alignment Notes

> **Status**: PARTIALLY ALIGNED - Core research is valid but framing needs adjustment for DSL.Model

### How This Research Aligns with DSL.Model Goals

This document provides **foundational knowledge** for DSL.Model implementation, specifically:

1. **AST Introspection Utilities** - `AST.getPropertySignatures()` and `AST.getAnnotation()` are ESSENTIAL for extracting field metadata. DSL.Model uses these internally but exposes a **higher-level API** via static properties.

2. **Annotation Patterns** - Custom symbol annotations (Section 3.3) align perfectly with DSL.Model's approach to storing column metadata in field schemas.

3. **Match-based Pattern Matching** - The `Match` module patterns are RECOMMENDED for implementing type inference in `DSL.toDrizzle()` and `DSL.toBetterAuth()` adapters.

### Caveats - Outdated Assumptions to Ignore

| Section | Issue | DSL.Model Correction |
|---------|-------|---------------------|
| Section 4 "Model.Class Structure" | Assumes direct use of `@effect/sql/Model.Class` | DSL.Model extends `VariantSchema.Class` from `@beep/schema`, NOT `@effect/sql/Model` |
| Section 6.1 "Complete Model-to-Drizzle Transformer" | Shows transformation inside the model | DSL.Model uses SEPARATE adapter functions: `DSL.toDrizzle(Model)` - NOT methods on the model |
| Section 7.3 "Annotation-Driven Configuration" | Uses `@effect/sql/Model` types | Use `DSL.Field()` with `column: ColumnDef` instead of raw annotations |
| Section 8.1 Example | Drizzle generation inline | Driver-specific code belongs in `adapters/drizzle.ts`, NOT in the model factory |

### Pattern Status

| Pattern | Status | Notes |
|---------|--------|-------|
| `AST.getPropertySignatures()` | RECOMMENDED | Core utility for field extraction |
| `AST.getAnnotation<T>(symbolId)` | RECOMMENDED | For extracting DSL.Field metadata |
| `Match.value(ast).pipe(...)` | RECOMMENDED | For type inference in adapters |
| `resolveFinalType(ast)` traversal | RECOMMENDED | Handles Transformation/Refinement wrappers |
| Module augmentation for annotations | DEPRECATED | Use `DSL.Field({ column: {...} })` instead |
| Inline Drizzle generation | DEPRECATED | Use `DSL.toDrizzle(Model)` adapter pattern |
| `Model.Generated`, `M.Class` | DEPRECATED | These are `@effect/sql` types; use `DSL.Field` with variant configs |

### Key Takeaways for DSL.Model Implementation

1. **AST utilities work on `.ast` property** - `DSL.Model.ast` is a `TypeLiteral` containing `PropertySignature` nodes
2. **Annotations are per-field** - Each `DSL.Field` schema has column metadata in its annotations
3. **Adapters should use these patterns** - `toDrizzle()`, `toBetterAuth()` leverage AST introspection internally
4. **Static properties are NOT annotations** - `.tableName`, `.columns` are class statics, not AST annotations

---

## Executive Summary

This document presents research findings on Effect Schema and SchemaAST patterns relevant to building a type-safe transformation layer from `Model.Class` to external schema systems (like Drizzle's query builder DSL).

**Key Findings:**
- Schema AST provides a rich, pattern-matchable tree structure for introspection
- `PropertySignature` and `TypeLiteral` are the core AST nodes for struct fields
- Annotations enable metadata attachment at any AST node
- Model.Class leverages VariantSchema for multi-variant field definitions
- AST traversal utilities (`getPropertySignatures`, `getPropertyKeys`) enable systematic extraction

---

## Research Sources

### Effect Documentation
- Schema AST Type Union (documentId: 9479)
- Schema Annotations Guide (documentId: 10933)
- Model.Class API Reference (documentId: 4332)
- PropertySignature Class (documentId: 9368)
- TypeLiteral Class (documentId: 9370)

### Source Code Analysis
- `effect/src/SchemaAST.ts` - AST structure definitions
- `effect/src/Schema.ts` - High-level schema API
- `@effect/sql/src/Model.ts` - Model.Class implementation
- `@effect/experimental/src/VariantSchema.ts` - Variant field system

---

## 1. Schema AST Structure

### 1.1 AST Type Union

The `SchemaAST.AST` type is a discriminated union representing all possible schema nodes:

```typescript
type AST =
  // Primitives
  | Declaration
  | Literal
  | UniqueSymbol
  | UndefinedKeyword
  | VoidKeyword
  | NeverKeyword
  | UnknownKeyword
  | AnyKeyword
  | StringKeyword
  | NumberKeyword
  | BooleanKeyword
  | BigIntKeyword
  | SymbolKeyword
  | ObjectKeyword
  | Enums
  | TemplateLiteral

  // Structural types (possible transformations)
  | Refinement
  | TupleType
  | TypeLiteral
  | Union
  | Suspend

  // Transformations
  | Transformation
```

**Key Insight:** Every AST node has a `_tag` discriminator enabling pattern matching with `effect/Match`.

### 1.2 TypeLiteral Node (Struct Representation)

`TypeLiteral` represents object/struct schemas:

```typescript
class TypeLiteral {
  readonly _tag = "TypeLiteral"
  constructor(
    readonly propertySignatures: ReadonlyArray<PropertySignature>,
    readonly indexSignatures: ReadonlyArray<IndexSignature>,
    readonly annotations: Annotations = {}
  )
}
```

**Structure:**
- **propertySignatures**: Array of named fields with their schemas
- **indexSignatures**: Dynamic key types (e.g., `Record<string, number>`)
- **annotations**: Custom metadata attached to the struct

### 1.3 PropertySignature Node (Field Representation)

`PropertySignature` represents individual struct fields:

```typescript
class PropertySignature {
  constructor(
    readonly name: PropertyKey,           // Field name
    readonly type: AST,                   // Field's schema AST
    readonly isOptional: boolean,         // Field optionality
    readonly isReadonly: boolean,         // Readonly flag
    readonly annotations: Annotations = {}  // Field-level metadata
  )
}
```

**Field Properties:**
- **name**: Field identifier (string, number, or symbol)
- **type**: Nested AST representing the field's schema
- **isOptional**: Whether field can be absent
- **isReadonly**: TypeScript readonly flag
- **annotations**: Field-specific metadata

---

## 2. Schema Introspection Utilities

### 2.1 Extracting Property Signatures

The `getPropertySignatures` function extracts all fields from a schema:

```typescript
export const getPropertySignatures = (ast: AST): Array<PropertySignature>
```

**Implementation Pattern:**
```typescript
const getPropertySignatures = (ast: AST): Array<PropertySignature> => {
  // Check for surrogate annotation (indirection)
  const annotation = getSurrogateAnnotation(ast)
  if (Option.isSome(annotation)) {
    return getPropertySignatures(annotation.value)
  }

  // Pattern match on AST type
  switch (ast._tag) {
    case "TypeLiteral":
      return ast.propertySignatures.slice()
    case "Suspend":
      return getPropertySignatures(ast.f())
    case "Refinement":
      return getPropertySignatures(ast.from)
  }

  // Fallback: derive from property keys
  return getPropertyKeys(ast).map((name) =>
    getPropertyKeyIndexedAccess(ast, name)
  )
}
```

**Usage for Model.Class:**
```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

class User extends Model.Class<User>("User")({
  id: Model.Generated(Schema.Number),
  email: Schema.String,
  createdAt: Model.DateTimeInsertFromDate
}) {}

const fields = AST.getPropertySignatures(User.ast)
// Returns: PropertySignature[] with 3 elements
```

### 2.2 Extracting Property Keys

The `getPropertyKeys` function returns field names only:

```typescript
const getPropertyKeys = (ast: AST): Array<PropertyKey>
```

**Implementation:**
```typescript
const getPropertyKeys = (ast: AST): Array<PropertyKey> => {
  const annotation = getSurrogateAnnotation(ast)
  if (Option.isSome(annotation)) {
    return getPropertyKeys(annotation.value)
  }

  switch (ast._tag) {
    case "TypeLiteral":
      return ast.propertySignatures.map((ps) => ps.name)
    case "Union":
      // Intersection of keys across union variants
      return ast.types.slice(1).reduce(
        (out: Array<PropertyKey>, ast) =>
          Arr.intersection(out, getPropertyKeys(ast)),
        getPropertyKeys(ast.types[0])
      )
    case "Suspend":
      return getPropertyKeys(ast.f())
    case "Refinement":
      return getPropertyKeys(ast.from)
    case "Transformation":
      return getPropertyKeys(ast.to)
  }
  return []
}
```

### 2.3 Accessing Individual Fields

The `getPropertyKeyIndexedAccess` function retrieves a field by name:

```typescript
export const getPropertyKeyIndexedAccess = (
  ast: AST,
  name: PropertyKey
): PropertySignature
```

**Pattern:**
```typescript
const getPropertyKeyIndexedAccess = (
  ast: AST,
  name: PropertyKey
): PropertySignature => {
  const annotation = getSurrogateAnnotation(ast)
  if (Option.isSome(annotation)) {
    return getPropertyKeyIndexedAccess(annotation.value, name)
  }

  switch (ast._tag) {
    case "TypeLiteral": {
      const ps = getTypeLiteralPropertySignature(ast, name)
      if (ps) return ps
      break
    }
    case "Union":
      // Create union of field types across variants
      return new PropertySignature(
        name,
        Union.make(
          ast.types.map((ast) =>
            getPropertyKeyIndexedAccess(ast, name).type
          )
        ),
        false,
        true
      )
    case "Suspend":
      return getPropertyKeyIndexedAccess(ast.f(), name)
    case "Refinement":
      return getPropertyKeyIndexedAccess(ast.from, name)
  }
  throw new Error(errors_.getASTUnsupportedSchemaErrorMessage(ast))
}
```

---

## 3. Annotation System

### 3.1 Annotations Interface

Every AST node has an `annotations` field of type `Record<string | symbol, unknown>`:

```typescript
type Annotations = Record<string | symbol, unknown>
```

**Built-in Annotation IDs:**
```typescript
// Identification
export const IdentifierAnnotationId: unique symbol
export const TitleAnnotationId: unique symbol
export const DescriptionAnnotationId: unique symbol

// Documentation
export const ExamplesAnnotationId: unique symbol
export const DocumentationAnnotationId: unique symbol

// Validation
export const MessageAnnotationId: unique symbol
export const MissingMessageAnnotationId: unique symbol

// JSON Schema interop
export const JSONSchemaAnnotationId: unique symbol

// Behavior control
export const ConcurrencyAnnotationId: unique symbol
export const BatchingAnnotationId: unique symbol
export const DecodingFallbackAnnotationId: unique symbol

// Type metadata
export const BrandAnnotationId: unique symbol
export const DefaultAnnotationId: unique symbol
```

### 3.2 Annotation Retrieval

The `getAnnotation` helper safely extracts annotations:

```typescript
export const getAnnotation: {
  <A>(
    key: symbol | string
  ): (annotated: Annotated) => Option.Option<A>

  <A>(
    annotated: Annotated,
    key: symbol | string
  ): Option.Option<A>
}
```

**Usage:**
```typescript
import * as AST from "effect/SchemaAST"
import * as Option from "effect/Option"

const identifier = F.pipe(
  schema.ast,
  AST.getIdentifierAnnotation,
  Option.getOrElse(() => "UnknownSchema")
)

const title = AST.getTitleAnnotation(schema.ast)
// Returns: Option<string>
```

### 3.3 Custom Annotations

Custom annotations can be defined and type-safe via module augmentation:

```typescript
// Define annotation ID
const DeprecatedId = Symbol.for("myapp/annotation/Deprecated")

// Module augmentation for type safety
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [DeprecatedId]?: boolean
    }
  }
}

// Apply annotation
const MyString = Schema.String.annotations({
  [DeprecatedId]: true
})

// Retrieve annotation
const isDeprecated = <A, I, R>(
  schema: Schema.Schema<A, I, R>
): boolean =>
  F.pipe(
    schema.ast,
    AST.getAnnotation<boolean>(DeprecatedId),
    Option.getOrElse(() => false)
  )
```

**Application to DSL Mapping:**
Custom annotations can encode SQL-specific metadata:

```typescript
const SqlColumnNameId = Symbol.for("beep/sql/columnName")
const SqlDefaultId = Symbol.for("beep/sql/default")
const SqlIndexId = Symbol.for("beep/sql/index")

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [SqlColumnNameId]?: string
      [SqlDefaultId]?: string | (() => unknown)
      [SqlIndexId]?: boolean | string
    }
  }
}

// Usage in Model.Class
class User extends Model.Class<User>("User")({
  id: Model.Generated(Schema.Number).annotations({
    [SqlColumnNameId]: "user_id",
    [SqlIndexId]: "primary"
  }),
  email: Schema.String.annotations({
    [SqlColumnNameId]: "email_address",
    [SqlIndexId]: "unique"
  })
}) {}
```

---

## 4. Model.Class Structure

### 4.1 VariantSchema Foundation

`Model.Class` is built on `@effect/experimental/VariantSchema`, which enables field-level variant configuration:

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
  variants: [
    "select",      // SELECT queries (all columns)
    "insert",      // INSERT statements (exclude generated)
    "update",      // UPDATE statements (exclude generated)
    "json",        // JSON serialization (all fields)
    "jsonCreate",  // JSON for creation (exclude generated)
    "jsonUpdate"   // JSON for updates (exclude generated)
  ],
  defaultVariant: "select"
})
```

### 4.2 Field Variants

The `Field` type enables per-variant schema configuration:

```typescript
export interface Field<A extends Field.Config> {
  readonly [FieldTypeId]: FieldTypeId
  readonly schemas: A  // Variant → Schema mapping
}

type Field.Config = {
  readonly [variantName: string]:
    | Schema.Schema.All
    | Schema.PropertySignature.All
    | undefined
}
```

**Example - Generated Field:**
```typescript
const Generated = <S extends Schema.Schema.All>(
  schema: S
): Generated<S> =>
  Field({
    select: schema,   // Include in SELECT
    update: schema,   // Include in UPDATE
    json: schema      // Include in JSON
    // Absent from: insert, jsonCreate, jsonUpdate
  })
```

### 4.3 Model.Class Schema Structure

`Model.Class` produces a schema with variant sub-schemas:

```typescript
class User extends Model.Class<User>("User")({
  id: Model.Generated(Schema.Number),
  email: Schema.String,
  createdAt: Model.DateTimeInsertFromDate
}) {}

// User.ast → TypeLiteral with all fields
// User.insert → Struct excluding Generated fields
// User.update → Struct excluding Generated fields
// User.json → Struct with all fields transformed for JSON
```

**AST Inspection:**
```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

// Extract all field definitions
const fields = AST.getPropertySignatures(User.ast)

// Field names
const fieldNames = F.pipe(
  fields,
  A.map((ps) => ps.name)
)
// ["id", "email", "createdAt"]

// Field types
const fieldTypes = F.pipe(
  fields,
  A.map((ps) => ps.type._tag)
)
// ["NumberKeyword", "StringKeyword", "Transformation"]

// Optional fields
const optionalFields = F.pipe(
  fields,
  A.filter((ps) => ps.isOptional),
  A.map((ps) => ps.name)
)
```

---

## 5. AST Pattern Matching

### 5.1 Using Match Module

Effect's `Match` module provides type-safe pattern matching on AST nodes:

```typescript
import * as Match from "effect/Match"
import * as AST from "effect/SchemaAST"

const extractPrimitiveType = (ast: AST.AST): string =>
  Match.value(ast).pipe(
    Match.tag("StringKeyword", () => "string"),
    Match.tag("NumberKeyword", () => "number"),
    Match.tag("BooleanKeyword", () => "boolean"),
    Match.tag("BigIntKeyword", () => "bigint"),
    Match.tag("DateTimeFromSelf", () => "datetime"),
    Match.tag("Literal", (lit) => `literal(${lit.literal})`),
    Match.orElse(() => "unknown")
  )
```

### 5.2 Recursive AST Traversal

Handling nested structures requires recursive traversal:

```typescript
const traverseAST = (
  ast: AST.AST,
  visitor: (node: AST.AST, path: string[]) => void,
  path: string[] = []
): void => {
  visitor(ast, path)

  Match.value(ast).pipe(
    Match.tag("TypeLiteral", (tl) => {
      F.pipe(
        tl.propertySignatures,
        A.forEach((ps) => {
          traverseAST(
            ps.type,
            visitor,
            [...path, String(ps.name)]
          )
        })
      )
    }),
    Match.tag("Refinement", (ref) => {
      traverseAST(ref.from, visitor, path)
    }),
    Match.tag("Transformation", (trans) => {
      traverseAST(trans.to, visitor, [...path, "→"])
    }),
    Match.tag("Union", (union) => {
      F.pipe(
        union.types,
        A.forEachWithIndex((type, idx) => {
          traverseAST(type, visitor, [...path, `[${idx}]`])
        })
      )
    }),
    Match.orElse(() => {})
  )
}

// Usage
traverseAST(User.ast, (node, path) => {
  console.log(`${path.join(".")} → ${node._tag}`)
})
// Output:
// id → NumberKeyword
// email → StringKeyword
// createdAt → Transformation
// createdAt.→ → DateTimeKeyword
```

---

## 6. Programmatic Schema Transformation

### 6.1 AST to External Format

Transforming AST to external DSL (e.g., Drizzle column definitions):

```typescript
import * as AST from "effect/SchemaAST"
import * as Match from "effect/Match"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as R from "effect/Record"

type ColumnDef = {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
  unique: boolean
  defaultValue?: unknown
}

const astToColumnDef = (
  fieldName: string,
  ps: AST.PropertySignature
): ColumnDef => {
  const baseType = extractSqlType(ps.type)
  const annotations = ps.annotations

  return {
    name: fieldName,
    type: baseType,
    nullable: ps.isOptional,
    primaryKey: checkAnnotation(annotations, PrimaryKeyId),
    unique: checkAnnotation(annotations, UniqueId),
    defaultValue: F.pipe(
      AST.getDefaultAnnotation(ps),
      Option.toUndefined
    )
  }
}

const extractSqlType = (ast: AST.AST): string =>
  Match.value(ast).pipe(
    Match.tag("StringKeyword", () => "text"),
    Match.tag("NumberKeyword", () => "integer"),
    Match.tag("BooleanKeyword", () => "boolean"),
    Match.tag("BigIntKeyword", () => "bigint"),
    Match.tag("Transformation", (trans) => {
      // Handle DateTimeFromDate
      const identifier = F.pipe(
        trans.to,
        AST.getIdentifierAnnotation,
        Option.getOrElse(() => "")
      )
      if (identifier === "DateTime") return "timestamp"
      return extractSqlType(trans.to)
    }),
    Match.orElse(() => "jsonb")
  )

const schemaToColumnDefs = <A extends Model.Any>(
  model: A
): Record<string, ColumnDef> => {
  const fields = AST.getPropertySignatures(model.ast)

  return F.pipe(
    fields,
    A.map((ps) => [String(ps.name), astToColumnDef(String(ps.name), ps)] as const),
    R.fromEntries
  )
}

// Usage
const userColumns = schemaToColumnDefs(User)
/*
{
  id: { name: "id", type: "integer", nullable: false, primaryKey: true, ... },
  email: { name: "email", type: "text", nullable: false, unique: true, ... },
  createdAt: { name: "createdAt", type: "timestamp", nullable: false, ... }
}
*/
```

### 6.2 Handling Transformations

Transformations (like `DateTimeFromDate`) have `from` and `to` AST nodes:

```typescript
class Transformation {
  readonly _tag = "Transformation"
  constructor(
    readonly from: AST,          // Input schema
    readonly to: AST,            // Output schema
    readonly transformation: TransformationKind,
    readonly annotations: Annotations = {}
  )
}

type TransformationKind =
  | ComposeTransformation
  | FinalTransformation
  | TypeLiteralTransformation
  | PropertySignatureTransformation
```

**Pattern for SQL schema extraction:**
```typescript
const resolveTransformation = (ast: AST.AST): AST.AST =>
  Match.value(ast).pipe(
    Match.tag("Transformation", (trans) => trans.to),
    Match.tag("Refinement", (ref) => resolveTransformation(ref.from)),
    Match.orElse(() => ast)
  )

const extractSqlType = (ast: AST.AST): string => {
  const resolved = resolveTransformation(ast)
  return Match.value(resolved).pipe(
    Match.tag("StringKeyword", () => "text"),
    Match.tag("NumberKeyword", () => "integer"),
    // ... other cases
    Match.orElse(() => "jsonb")
  )
}
```

---

## 7. Key Patterns for DSL Transformation

### 7.1 Field Extraction Pattern

```typescript
import * as AST from "effect/SchemaAST"
import * as A from "effect/Array"
import * as F from "effect/Function"

const extractFields = <A extends Model.Any>(model: A) =>
  F.pipe(
    model.ast,
    AST.getPropertySignatures,
    A.map((ps) => ({
      name: String(ps.name),
      type: ps.type,
      optional: ps.isOptional,
      readonly: ps.isReadonly,
      annotations: ps.annotations
    }))
  )
```

### 7.2 Type Mapping Pattern

```typescript
import * as Match from "effect/Match"
import * as O from "effect/Option"

type TypeMapper<T> = (ast: AST.AST) => O.Option<T>

const mapToSqlType: TypeMapper<string> = (ast) =>
  Match.value(ast).pipe(
    Match.tag("StringKeyword", () => O.some("text")),
    Match.tag("NumberKeyword", () => O.some("integer")),
    Match.tag("BooleanKeyword", () => O.some("boolean")),
    Match.tag("Transformation", (trans) => mapToSqlType(trans.to)),
    Match.orElse(() => O.none())
  )
```

### 7.3 Annotation-Driven Configuration

```typescript
const SqlConfigId = Symbol.for("beep/sql/config")

type SqlConfig = {
  columnName?: string
  index?: boolean | string
  unique?: boolean
  foreignKey?: { table: string; column: string }
}

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [SqlConfigId]?: SqlConfig
    }
  }
}

const extractSqlConfig = (
  ps: AST.PropertySignature
): SqlConfig =>
  F.pipe(
    ps,
    AST.getAnnotation<SqlConfig>(SqlConfigId),
    Option.getOrElse(() => ({}))
  )

class User extends Model.Class<User>("User")({
  id: Model.Generated(Schema.Number).annotations({
    [SqlConfigId]: { columnName: "user_id", index: "primary" }
  }),
  orgId: Schema.Number.annotations({
    [SqlConfigId]: {
      columnName: "organization_id",
      foreignKey: { table: "organizations", column: "id" }
    }
  })
}) {}
```

---

## 8. Practical Transformation Example

### 8.1 Complete Model-to-Drizzle Transformer

```typescript
import * as AST from "effect/SchemaAST"
import * as Match from "effect/Match"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as R from "effect/Record"
import * as S from "effect/Schema"
import * as M from "@effect/sql/Model"
import { pgTable, integer, text, timestamp, boolean } from "drizzle-orm/pg-core"

// Type mapping registry
const sqlTypeMap: Record<string, (ast: AST.AST) => unknown> = {
  StringKeyword: () => text("col"),
  NumberKeyword: () => integer("col"),
  BooleanKeyword: () => boolean("col"),
  BigIntKeyword: () => integer("col"),  // or bigint
  DateTimeKeyword: () => timestamp("col")
}

// Resolve through transformations
const resolveFinalType = (ast: AST.AST): AST.AST =>
  Match.value(ast).pipe(
    Match.tag("Transformation", (trans) => resolveFinalType(trans.to)),
    Match.tag("Refinement", (ref) => resolveFinalType(ref.from)),
    Match.orElse(() => ast)
  )

// Map AST to Drizzle column builder
const astToDrizzleColumn = (
  name: string,
  ps: AST.PropertySignature
) => {
  const finalType = resolveFinalType(ps.type)
  const builder = sqlTypeMap[finalType._tag]?.(finalType)

  if (!builder) {
    throw new Error(`Unsupported type: ${finalType._tag}`)
  }

  let column = builder(name)

  if (!ps.isOptional) {
    column = column.notNull()
  }

  const sqlConfig = F.pipe(
    ps,
    AST.getAnnotation<SqlConfig>(SqlConfigId),
    O.getOrUndefined
  )

  if (sqlConfig?.index === "primary") {
    column = column.primaryKey()
  }
  if (sqlConfig?.unique) {
    column = column.unique()
  }
  if (sqlConfig?.defaultValue !== undefined) {
    column = column.default(sqlConfig.defaultValue)
  }

  return column
}

// Transform Model.Class to Drizzle table schema
const modelToDrizzle = <A extends M.Any>(model: A) => {
  const fields = AST.getPropertySignatures(model.ast)

  const columns = F.pipe(
    fields,
    A.map((ps) => [
      String(ps.name),
      astToDrizzleColumn(String(ps.name), ps)
    ] as const),
    R.fromEntries
  )

  return pgTable(
    F.pipe(
      model.ast,
      AST.getIdentifierAnnotation,
      O.getOrElse(() => "unknown_table")
    ),
    columns
  )
}

// Usage
class User extends M.Class<User>("User")({
  id: M.Generated(S.Number).annotations({
    [SqlConfigId]: { index: "primary" }
  }),
  email: S.String.annotations({
    [SqlConfigId]: { unique: true }
  }),
  createdAt: M.DateTimeInsertFromDate
}) {}

const usersTable = modelToDrizzle(User)
// Produces: pgTable("User", { ... })
```

---

## 9. Answers to Research Questions

### Q1: How can you introspect a Schema to extract field names, types, and metadata?

**Answer:**
Use `SchemaAST.getPropertySignatures(schema.ast)` to extract an array of `PropertySignature` nodes. Each node contains:
- `name: PropertyKey` - Field identifier
- `type: AST` - Field schema (recursively inspectable)
- `isOptional: boolean` - Optionality flag
- `isReadonly: boolean` - Mutability flag
- `annotations: Annotations` - Custom metadata

**Example:**
```typescript
const fields = AST.getPropertySignatures(User.ast)
const fieldInfo = F.pipe(
  fields,
  A.map((ps) => ({
    name: ps.name,
    type: ps.type._tag,
    optional: ps.isOptional,
    metadata: ps.annotations
  }))
)
```

### Q2: What AST nodes represent different field types?

**Answer:**
Field types are represented by AST discriminated union variants:

| Schema Type | AST Node | Example |
|-------------|----------|---------|
| `Schema.String` | `StringKeyword` | `{ _tag: "StringKeyword" }` |
| `Schema.Number` | `NumberKeyword` | `{ _tag: "NumberKeyword" }` |
| `Schema.Boolean` | `BooleanKeyword` | `{ _tag: "BooleanKeyword" }` |
| `Schema.BigInt` | `BigIntKeyword` | `{ _tag: "BigIntKeyword" }` |
| `Schema.Literal(...)` | `Literal` | `{ _tag: "Literal", literal: value }` |
| `Schema.optional(S.String)` | `PropertySignature` | `{ isOptional: true, type: StringKeyword }` |
| `Schema.DateTimeFromSelf` | `Transformation` | `{ _tag: "Transformation", to: DateTimeKeyword }` |
| Branded types | `Refinement` | `{ _tag: "Refinement", from: NumberKeyword }` |
| `Schema.Struct({ ... })` | `TypeLiteral` | `{ _tag: "TypeLiteral", propertySignatures: [...] }` |
| `Schema.Union(...)` | `Union` | `{ _tag: "Union", types: [...] }` |

### Q3: How does Model.Class encode its fields in the AST?

**Answer:**
`Model.Class` leverages `VariantSchema` to create a `TypeLiteral` AST where fields are `PropertySignature` nodes. The class itself is a schema with an `.ast` property containing the full struct definition.

**Variant extraction:**
```typescript
// Model.Class definition
class User extends M.Class<User>("User")({
  id: M.Generated(S.Number),
  email: S.String,
  createdAt: M.DateTimeInsertFromDate
}) {}

// AST structure
User.ast → {
  _tag: "TypeLiteral",
  propertySignatures: [
    { name: "id", type: NumberKeyword, ... },
    { name: "email", type: StringKeyword, ... },
    { name: "createdAt", type: Transformation, ... }
  ],
  annotations: { [IdentifierAnnotationId]: "User" }
}

// Variant schemas (insert, update, etc.) are derived via VariantSchema.extract
User.insert.ast → TypeLiteral excluding Generated fields
User.update.ast → TypeLiteral excluding Generated fields
```

### Q4: What annotation patterns exist for adding metadata to schemas?

**Answer:**
Three annotation patterns are supported:

**1. Built-in Annotations:**
```typescript
const MySchema = S.String.annotations({
  identifier: "Email",
  title: "Email Address",
  description: "User's primary email",
  examples: ["user@example.com"],
  jsonSchema: { format: "email" }
})
```

**2. Custom Symbol Annotations:**
```typescript
const SqlColumnId = Symbol.for("app/sql/column")

const schema = S.String.annotations({
  [SqlColumnId]: { name: "email_address", index: true }
})

// Retrieval
const sqlMeta = F.pipe(
  schema.ast,
  AST.getAnnotation<SqlColumnMeta>(SqlColumnId),
  O.getOrUndefined
)
```

**3. Module Augmentation (Type-Safe Custom Annotations):**
```typescript
declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [SqlColumnId]?: SqlColumnMeta
    }
  }
}

// Now TypeScript validates annotation types
const schema = S.String.annotations({
  [SqlColumnId]: { name: "email" }  // ✓ Type-safe
  // [SqlColumnId]: 123  // ✗ Type error
})
```

### Q5: How can you programmatically transform one Schema's structure to another format?

**Answer:**
Use a combination of AST traversal, pattern matching, and mapping functions:

**Pattern:**
```typescript
// 1. Extract field metadata
const fields = AST.getPropertySignatures(schema.ast)

// 2. Transform each field
const transformed = F.pipe(
  fields,
  A.map((ps) => transformField(ps))
)

// 3. Compose into target format
const targetSchema = buildTargetSchema(transformed)
```

**Complete Example:**
```typescript
type DrizzleColumn = {
  name: string
  type: string
  modifiers: string[]
}

const transformSchemaToColumns = <A extends M.Any>(
  model: A
): DrizzleColumn[] =>
  F.pipe(
    model.ast,
    AST.getPropertySignatures,
    A.map((ps) => ({
      name: String(ps.name),
      type: mapAstToSqlType(ps.type),
      modifiers: [
        ps.isOptional ? "" : "notNull()",
        extractPrimaryKey(ps) ? "primaryKey()" : "",
        extractUnique(ps) ? "unique()" : ""
      ].filter(Boolean)
    }))
  )

const mapAstToSqlType = (ast: AST.AST): string =>
  Match.value(resolveFinalType(ast)).pipe(
    Match.tag("StringKeyword", () => "text"),
    Match.tag("NumberKeyword", () => "integer"),
    Match.tag("BooleanKeyword", () => "boolean"),
    Match.orElse(() => "jsonb")
  )
```

---

## 10. Integration with beep-effect Architecture

### 10.1 Alignment with Project Patterns

The research findings align with `beep-effect` idioms:

**✓ Effect-First:**
- All introspection uses Effect utilities (`A.map`, `F.pipe`, `O.getOrElse`)
- No native array methods or bare `throw` statements

**✓ Schema-Driven:**
- Model.Class already provides rich AST structure
- Annotations enable declarative SQL metadata

**✓ Type-Safe:**
- AST pattern matching with `Match.exhaustive`
- Module augmentation for custom annotation types

### 10.2 Recommended Implementation Path

**Phase 1: AST Extraction Utilities**
```typescript
// packages/shared/tables/src/ast-utils.ts
export const extractTableFields = <A extends M.Any>(
  model: A
): Array<FieldMetadata>

export const extractSqlType = (ast: AST.AST): string

export const extractConstraints = (
  ps: AST.PropertySignature
): Constraints
```

**Phase 2: Annotation Definitions**
```typescript
// packages/shared/tables/src/annotations.ts
export const SqlColumnNameId = Symbol.for("beep/sql/columnName")
export const SqlIndexId = Symbol.for("beep/sql/index")
export const SqlForeignKeyId = Symbol.for("beep/sql/foreignKey")

declare module "effect/Schema" {
  namespace Annotations {
    interface GenericSchema<A> extends Schema<A> {
      [SqlColumnNameId]?: string
      [SqlIndexId]?: boolean | "primary" | "unique"
      [SqlForeignKeyId]?: ForeignKeyDef
    }
  }
}
```

**Phase 3: Drizzle Schema Generator**
```typescript
// packages/shared/tables/src/drizzle-gen.ts
export const modelToDrizzleTable = <A extends M.Any>(
  model: A,
  tableName?: string
): PgTable

export const modelToDrizzleRelations = <A extends M.Any>(
  model: A
): Relations
```

---

## 11. Trade-offs and Alternatives

### 11.1 AST Introspection vs Manual Schema Definition

**AST Introspection (Recommended):**
- ✓ Single source of truth (Model.Class)
- ✓ Type-safe transformations
- ✓ Automatic synchronization
- ✗ Complexity in AST traversal
- ✗ Requires Effect/Schema knowledge

**Manual Schema Definition:**
- ✓ Simple, explicit definitions
- ✓ Full control over SQL schema
- ✗ Duplicate definitions (Model + Drizzle)
- ✗ Manual synchronization required
- ✗ Error-prone

**Verdict:** AST introspection aligns with Effect-first philosophy and reduces duplication.

### 11.2 Annotation-Driven vs Convention-Based

**Annotation-Driven (Recommended):**
- ✓ Explicit, declarative configuration
- ✓ Type-safe via module augmentation
- ✓ Flexible for edge cases
- ✗ More verbose

**Convention-Based:**
- ✓ Less boilerplate
- ✓ Faster for simple cases
- ✗ Implicit behavior
- ✗ Limited flexibility

**Verdict:** Annotations provide clarity and type safety, critical for SQL schema correctness.

---

## 12. Next Steps

### 12.1 Proof of Concept

Build a minimal transformer demonstrating:
1. Model.Class → Drizzle table schema
2. Custom annotations for SQL metadata
3. Relation inference from foreign key annotations

### 12.2 Integration Points

- **packages/shared/tables**: AST utilities and annotations
- **packages/iam/tables**: Apply to IAM models
- **packages/documents/tables**: Apply to Documents models
- **packages/_internal/db-admin**: Drizzle schema generation

### 12.3 Testing Strategy

- **Unit tests**: AST extraction for each field type
- **Integration tests**: Full Model.Class → Drizzle transformation
- **Type tests**: Annotation type safety validation

---

## 13. References

### Documentation
- Effect Schema AST Guide: https://effect.website/docs/schema/ast
- Effect Schema Annotations: https://effect.website/docs/schema/annotations
- Effect Schema Classes: https://effect.website/docs/schema/classes
- @effect/sql Model.Class: https://effect.website/docs/sql/model

### Source Files
- `effect/src/SchemaAST.ts` - AST structure and utilities
- `effect/src/Schema.ts` - High-level schema API
- `@effect/sql/src/Model.ts` - Model.Class implementation
- `@effect/experimental/src/VariantSchema.ts` - Variant system

### Related Patterns
- `docs/patterns/schema-driven-development.md` (beep-effect)
- `packages/common/schema/AGENTS.md` - EntityId factories
- `packages/shared/tables/AGENTS.md` - Table factory patterns

---

## Appendix A: Complete Type Mapping Table

| Effect Schema Type | AST Node | SQL Type (PostgreSQL) | Drizzle Builder |
|--------------------|----------|----------------------|-----------------|
| `Schema.String` | `StringKeyword` | `TEXT` | `text(name)` |
| `Schema.Number` | `NumberKeyword` | `INTEGER` | `integer(name)` |
| `Schema.Boolean` | `BooleanKeyword` | `BOOLEAN` | `boolean(name)` |
| `Schema.BigInt` | `BigIntKeyword` | `BIGINT` | `bigint(name, { mode: "bigint" })` |
| `Schema.Literal("value")` | `Literal` | `TEXT CHECK (...)` | Custom constraint |
| `Schema.Uuid` | `Refinement(StringKeyword)` | `UUID` | `uuid(name)` |
| `DateTime` | `DateTimeKeyword` | `TIMESTAMP` | `timestamp(name)` |
| `Schema.Array(S.Number)` | `TupleType` | `INTEGER[]` | `integer(name).array()` |
| `Schema.Struct({ ... })` | `TypeLiteral` | `JSONB` | `jsonb(name)` |
| `Schema.optional(S.String)` | `PropertySignature{isOptional:true}` | `TEXT NULL` | `text(name)` (no `.notNull()`) |
| `Schema.brand("UserId")` | `Refinement` | Custom type | Custom brand check |

---

## Appendix B: Annotation Registry

| Annotation ID | Type | Purpose | Example |
|---------------|------|---------|---------|
| `IdentifierAnnotationId` | `string` | Schema identifier | `"User"` |
| `TitleAnnotationId` | `string` | Human-readable title | `"User Account"` |
| `DescriptionAnnotationId` | `string` | Schema documentation | `"Represents a user..."` |
| `ExamplesAnnotationId` | `Array<A>` | Valid examples | `["user@example.com"]` |
| `DefaultAnnotationId` | `A` | Default value | `new Date()` |
| `JSONSchemaAnnotationId` | `object` | JSON Schema metadata | `{ format: "email" }` |
| `MessageAnnotationId` | `(issue) => string` | Custom error message | `() => "Invalid email"` |
| `ConcurrencyAnnotationId` | `number \| "unbounded"` | Concurrency control | `"unbounded"` |

---

**Research completed:** 2025-12-26
**Researcher:** Effect-TS Research Agent
**Status:** Ready for implementation
