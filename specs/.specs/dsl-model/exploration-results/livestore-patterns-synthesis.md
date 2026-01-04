# Livestore DSL Patterns - Synthesis for DSL.Model

---

## Alignment Notes (Design Specification Review)

**Reference**: `.specs/dsl-model/dsl-model.original.md`

### How This Research Aligns with DSL.Model Goals

This document correctly identifies key patterns that **DO** apply to our design:
1. **Two-Layer Architecture** - Effect Schema AST as the internal representation (no separate AST layer)
2. **Symbol-keyed annotations** - Using Effect's built-in annotation system for metadata
3. **Driver-agnostic architecture** - Generic `ColumnDef` types, adapters as separate functions
4. **`const` type parameters** - For preserving literal types in field definitions

### Patterns to ADOPT from Livestore

| Pattern | Why Adopt |
|---------|-----------|
| Column factories returning annotated schemas | Clean DSL API, metadata stays with schema |
| Type inference via mapped types | Required for `const` field preservation |
| Derived schemas (insert/update) | VariantSchema already handles this |
| Cached schema extraction | Performance optimization for variant access |

### Patterns to IGNORE from Livestore

| Pattern | Why Ignore |
|---------|------------|
| Object spreading + property patching | We use **anonymous class extension** instead (line 215+) |
| Separate internal AST layer | Effect Schema AST IS our AST |
| Manual schema construction for variants | VariantSchema.Class handles this automatically |
| SQLite-specific column types | We use **driver-agnostic `ColumnType`** |

### Corrections Needed in This Document

1. **Section 4** previously showed object spreading for static properties. This has been updated to show the **class extension pattern** consistent with beep-effect patterns (EntityId, LiteralKit).

2. **Section 7** ("Recommended Architecture") is **correctly aligned** with the design spec:
   - Shows generic `ColumnType` and `ColumnDef` types
   - Shows `toDrizzle()` and `toBetterAuth()` as separate adapter functions
   - Shows `ModelSchemaInstance` interface with correct static properties

3. **Section 8** ("Key Differences from Livestore") correctly identifies our divergences.

### Outdated Assumptions (Fixed)

- ~~Driver-specific outputs as class static properties~~ → Adapters are **separate functions**
- ~~Drizzle table generation in Model factory~~ → `DSL.toDrizzle(Model)` generates at call site

---

## Overview

This document synthesizes findings from 4 research agents exploring `tmp/livestore/packages/@livestore/common/src/schema`. The goal: extract applicable patterns for `DSL.Model` while maintaining the **critical constraint** that DSL.Model MUST BE a proper Effect Schema.

---

## 1. Two-Layer Architecture (DSL + AST)

### Livestore's Approach

```
┌─────────────────────────────────────────────────────────────────┐
│  DSL Layer (User-facing API)                                    │
│  - State.SQLite.table("todos", { ... })                         │
│  - Columns.text("name"), Columns.integer("count")               │
│  - Fluent, type-safe, minimal boilerplate                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  AST Layer (Internal Representation)                            │
│  - ColumnDefinition<TEncoded, TDecoded>                         │
│  - TableDefinition with sqliteDef, rowSchema, insertSchema      │
│  - Symbol-keyed annotations for metadata                        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Code Generators                                                │
│  - SQLite DDL generation                                        │
│  - Query builders (insert, update, where)                       │
│  - Schema derivation (insert/update variants)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Application to DSL.Model (Driver-Agnostic Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│  DSL Layer                                                      │
│  - DSL.Model<Self>("TableName")({ ...fields })                  │
│  - DSL.Field(S.String, { sql: {...}, variants: {...} })         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  AST Layer (Effect Schema IS the AST)                           │
│  - VariantSchema.Class with SQL metadata in annotations         │
│  - Symbol-keyed SQL config attached to field ASTs               │
│  - DSL.Model IS a Schema<Self, Encoded, R>                      │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Static Properties (Generic, Driver-Agnostic)                   │
│  - .tableName → Snake-case table identifier                     │
│  - .columns → Generic column definitions with SQL metadata      │
│  - .primaryKey → Primary key column name(s)                     │
│  - .indexes → Index definitions                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Driver Adapters (Separate Utility Functions)                   │
│  - DSL.toDrizzle(Model) → Drizzle PgTable                       │
│  - DSL.toBetterAuth(Model) → better-auth field config           │
│  - DSL.toKysely(Model) → Future: Kysely table                   │
│  - DSL.toSqlite(Model) → Future: SQLite DDL                     │
└─────────────────────────────────────────────────────────────────┘
```

**Key Insight**: DSL.Model exposes **generic SQL metadata** as static properties. Driver-specific transformations happen via separate adapter functions. This keeps the domain clean and enables future driver support without modifying the Model.

---

## 2. Column Definition Pattern

### Livestore's ColDefFn

```typescript
// Overloaded function signature for type inference
export interface ColDefFn<TColumnType extends ColumnType> {
  // No schema provided - infer from column type
  <TName extends string>(name: TName): ColumnDefinition<
    InferEncodedFromColumnType<TColumnType>,
    InferEncodedFromColumnType<TColumnType>
  >;

  // Custom schema with decoder
  <TName extends string, TDecoded>(
    name: TName,
    options: { schema: Schema.Schema<TDecoded, InferEncodedFromColumnType<TColumnType>> }
  ): ColumnDefinition<InferEncodedFromColumnType<TColumnType>, TDecoded>;
}
```

### Application to DSL.Field

```typescript
// DSL.Field wraps an Effect Schema with SQL metadata
export const Field = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config: FieldConfig
): DSLField<A, I, R> => {
  // Annotate the schema with SQL metadata
  const annotated = schema.annotations({
    [SqlMetadataSymbol]: config.sql,
    [VariantMetadataSymbol]: config.variants,
  });

  return annotated as DSLField<A, I, R>;
};

// Usage
DSL.Field(S.String, {
  sql: { type: "varchar", unique: true },
  variants: { insert: "required" },
})
```

**Key Insight**: DSL.Field should return an annotated Effect Schema, not a separate type. The schema itself carries SQL metadata via annotations.

---

## 3. Type Inference Mechanisms

### Livestore's Patterns

1. **Const Type Parameters**: Preserve literal types
   ```typescript
   table<const TColumns extends Record<string, ColumnDefinition<any, any>>>(
     name: string,
     columns: TColumns
   ): TableDefinition<TColumns>
   ```

2. **Mapped Types for Row Schema**:
   ```typescript
   type RowFromColumns<T> = {
     [K in keyof T]: T[K] extends ColumnDefinition<any, infer TDecoded>
       ? TDecoded
       : never
   }
   ```

3. **NoInfer<T> for Controlled Inference**:
   ```typescript
   schema: Schema.Schema<TDecoded, NoInfer<TEncoded>>
   ```

### Application to DSL.Model

```typescript
// DSL.Model factory with const type parameter
export const Model = <Self>() =>
  <const Fields extends Record<string, DSLField<any, any, any>>>(
    identifier: string,
    fields: Fields
  ): ModelSchemaInstance<Self, Fields> => {
    // Extract schema fields (strip DSL wrapper)
    type SchemaFields = {
      [K in keyof Fields]: Fields[K] extends DSLField<infer A, infer I, infer R>
        ? S.Schema<A, I, R>
        : never
    };

    // 1. Extract column definitions from fields
    const columns = extractColumns(fields);
    const primaryKey = derivePrimaryKey(columns);

    // 2. Create base class via VariantSchema.Class
    const BaseClass = VariantSchema.Class<Self>(identifier)(
      extractSchemaFields(fields)
    );

    // 3. Return extended class with GENERIC static properties (NOT driver-specific)
    return class extends BaseClass {
      static readonly tableName = toSnakeCase(identifier);
      static readonly columns = columns;         // Generic ColumnDef, NOT Drizzle
      static readonly primaryKey = primaryKey;
      static readonly indexes = [] as readonly IndexDef[];
      static readonly identifier = identifier;

      static override annotations(annotations: S.Annotations.Schema<Self>) {
        return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations));
      }
    } as unknown as ModelSchemaInstance<Self, Fields>;
  };

// ============ Driver adapters are SEPARATE functions ============
// DSL.toDrizzle(Model)     → Drizzle PgTable
// DSL.toBetterAuth(Model)  → better-auth field config
// See Section 7 for adapter implementations
```

**Key Insight**: Use `const` type parameters to preserve field literal types. Static properties expose **generic column definitions** (not driver-specific). Driver-specific outputs come from adapter functions.

---

## 4. Static Property Exposure

### Livestore's Object Spreading + Property Patching (NOT ADOPTED)

```typescript
// Livestore pattern - object-based, NOT class-based
const tableDef = {
  sqliteDef,
  rowSchema,      // Effect Schema preserved!
  insertSchema,
  columns,
};

// Dynamically merge query methods
for (const key of Object.keys(query)) {
  (tableDef as any)[key] = query[key];
}

return tableDef as TableDefinition<TColumns> & QueryMethods;
```

> **NOT ADOPTED**: DSL.Model uses **class extension** instead of object spreading.

### DSL.Model Approach: Anonymous Class Extension

DSL.Model extends VariantSchema.Class and adds **generic** static properties:

```typescript
// Pattern from EntityId and LiteralKit in beep-effect
return class ModelClass extends BaseClass {
  // GENERIC static properties (driver-agnostic)
  static readonly tableName = toSnakeCase(identifier);
  static readonly columns = columns;        // ColumnDef records, NOT Drizzle columns
  static readonly primaryKey = primaryKey;  // string[], NOT Drizzle constraint
  static readonly indexes = [] as readonly IndexDef[];
  static readonly identifier = identifier;

  // Preserve static properties through chaining
  static override annotations(
    annotations: S.Annotations.Schema<Self>
  ): ModelSchemaInstance<Self, Fields> {
    return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations));
  }
} as unknown as ModelSchemaInstance<Self, Fields>;

// Driver-specific outputs via separate adapters:
// const drizzleTable = DSL.toDrizzle(Model);
// const betterAuthFields = DSL.toBetterAuth(Model);
```

**Key Insight**: Use anonymous class extension for DSL.Model (consistent with beep-effect patterns). Type assertion with intersection ensures TypeScript sees both Schema methods and static properties. **Driver-specific outputs are NOT static properties** - they come from adapter functions.

---

## 5. Symbol-Keyed Annotations

### Livestore's Approach

```typescript
// packages/@livestore/common/src/schema/state/sqlite/column-annotations.ts
export const SqlColumnTypeSymbol = Symbol.for("@livestore/sql-column-type");
export const DefaultValueSymbol = Symbol.for("@livestore/default-value");

// Attached to column definitions
columnDef[SqlColumnTypeSymbol] = "TEXT";
columnDef[DefaultValueSymbol] = () => "gen_random_uuid()";
```

### Application to DSL.Model

```typescript
// Symbol keys for SQL metadata
export const SqlMetadataSymbol = Symbol.for("@beep/dsl-model/sql-metadata");
export const VariantConfigSymbol = Symbol.for("@beep/dsl-model/variant-config");
export const DrizzleColumnSymbol = Symbol.for("@beep/dsl-model/drizzle-column");

// Retrieve from Schema AST annotations
const getSqlMetadata = (field: S.Schema<any, any, any>) => {
  return AST.getAnnotation(field.ast, SqlMetadataSymbol);
};
```

**Key Insight**: Use Effect Schema's built-in annotation system rather than separate Symbol properties. This keeps metadata attached to the Schema AST itself.

---

## 6. Derived Schemas (Insert/Update Variants)

### Livestore's Pattern

```typescript
// Insert schema derived from row schema with optional fields
const insertSchema = Schema.Struct({
  ...rowSchemaFields,
  // Fields with defaults become optional
  id: Schema.optional(rowSchemaFields.id),
});
```

### Application to DSL.Model

VariantSchema already handles this! The 6 variants (`select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`) are derived automatically:

```typescript
// VariantSchema.Class creates variants via Field configurations
const UserModel = DSL.Model<UserModel>("User")({
  id: DSL.Field(EntityId.UserId, {
    sql: { primaryKey: true },
    variants: { insert: "omit", select: "required" },
  }),
  email: DSL.Field(S.String, {
    sql: { type: "varchar", unique: true },
    variants: { insert: "required", update: "optional" },
  }),
});

// Variants automatically available
UserModel           // select variant (default)
UserModel.insert    // insert variant
UserModel.update    // update variant
```

**Key Insight**: DSL.Model inherits variant derivation from VariantSchema. The `DSL.Field` just needs to pass variant config through to the underlying Field constructor.

---

## 7. Recommended DSL.Model Architecture (Driver-Agnostic)

```typescript
// ==================== Symbols ====================

export const ColumnMetaSymbol = Symbol.for("@beep/dsl-model/column-meta");
export const VariantConfigSymbol = Symbol.for("@beep/dsl-model/variant-config");

// ==================== Generic Types ====================

/** Abstract SQL column types (driver-agnostic) */
export type ColumnType =
  | "string"      // varchar, text, char
  | "number"      // integer, bigint, decimal, float
  | "boolean"
  | "date"        // date only
  | "datetime"    // timestamp with/without tz
  | "json"
  | "uuid"
  | "blob";

/** Generic column definition (no driver specifics) */
export interface ColumnDef {
  readonly type: ColumnType;
  readonly primaryKey?: boolean;
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly defaultValue?: string | (() => string);
  readonly references?: {
    readonly table: string;
    readonly column: string;
    readonly onDelete?: "cascade" | "restrict" | "set null" | "no action";
  };
  readonly maxLength?: number;
  readonly precision?: number;
  readonly scale?: number;
}

/** Variant behavior configuration */
export interface VariantConfig {
  insert?: "required" | "optional" | "omit";
  update?: "required" | "optional" | "omit";
  select?: "required" | "optional" | "omit";
}

/** Index definition */
export interface IndexDef {
  readonly columns: readonly string[];
  readonly unique?: boolean;
  readonly name?: string;
}

// ==================== DSL Field ====================

/** DSL Field - an Effect Schema with column metadata */
export interface DSLField<A, I, R> extends S.Schema<A, I, R> {
  readonly [ColumnMetaSymbol]: ColumnDef;
  readonly [VariantConfigSymbol]: VariantConfig;
}

// ==================== Model Schema Instance ====================

/**
 * Model schema instance with generic static properties.
 * Driver-specific outputs are derived via adapter functions.
 */
export interface ModelSchemaInstance<Self, Fields>
  extends S.AnnotableClass<ModelSchemaInstance<Self, Fields>, Self> {
  /** Snake-case table name */
  readonly tableName: string;

  /** Per-field column definitions (generic, driver-agnostic) */
  readonly columns: { readonly [K in keyof Fields]: ColumnDef };

  /** Primary key column name(s) */
  readonly primaryKey: readonly string[];

  /** Index definitions */
  readonly indexes: readonly IndexDef[];

  /** Original identifier (PascalCase) */
  readonly identifier: string;
}

// ==================== DSL.Field Implementation ====================

/** Create a DSL Field wrapping an Effect Schema with column metadata */
export const Field = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: { column?: Partial<ColumnDef>; variants?: VariantConfig }
): DSLField<A, I, R> => {
  const columnDef: ColumnDef = {
    type: inferColumnType(schema),
    ...config?.column,
  };
  const variantConfig = config?.variants ?? { insert: "required", select: "required" };

  return schema.annotations({
    [ColumnMetaSymbol]: columnDef,
    [VariantConfigSymbol]: variantConfig,
  }) as DSLField<A, I, R>;
};

// ==================== DSL.Model Implementation ====================

/** Create a Model class extending VariantSchema.Class */
export const Model = <Self>() =>
  <const Fields extends Record<string, DSLField<any, any, any>>>(
    identifier: string,
    fields: Fields
  ): ModelSchemaInstance<Self, Fields> => {
    // 1. Extract column definitions from all fields
    const columns = extractColumns(fields);

    // 2. Derive primary key from columns
    const primaryKey = derivePrimaryKey(columns);

    // 3. Extract pure schema fields for VariantSchema
    const schemaFields = extractSchemaFields(fields);

    // 4. Create base class via VariantSchema.Class
    const BaseClass = VariantSchema.Class<Self>(identifier)(schemaFields);

    // 5. Return extended class with generic static properties
    return class ModelClass extends BaseClass {
      static readonly tableName = toSnakeCase(identifier);
      static readonly columns = columns;
      static readonly primaryKey = primaryKey;
      static readonly indexes = [] as readonly IndexDef[];
      static readonly identifier = identifier;

      static override annotations(annotations: S.Annotations.Schema<Self>) {
        return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations));
      }
    } as unknown as ModelSchemaInstance<Self, Fields>;
  };

// ==================== Driver Adapters (Separate Module) ====================

/**
 * Transform DSL.Model to Drizzle PgTable.
 * Lives in a separate adapter module, not on the Model itself.
 */
export const toDrizzle = <M extends ModelSchemaInstance<any, any>>(
  model: M
): PgTable => {
  return generateDrizzleTable(model.tableName, model.columns);
};

/**
 * Transform DSL.Model to better-auth field configuration.
 * Lives in a separate adapter module, not on the Model itself.
 */
export const toBetterAuth = <M extends ModelSchemaInstance<any, any>>(
  model: M
): Record<string, DBFieldAttribute> => {
  return generateBetterAuthFields(model.columns);
};

/**
 * Future: Transform DSL.Model to Kysely table definition.
 */
export const toKysely = <M extends ModelSchemaInstance<any, any>>(
  model: M
): KyselyTable => {
  return generateKyselyTable(model.tableName, model.columns);
};
```

### Usage Example

```typescript
// Define a model with generic column metadata
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

// ✅ Works as a normal Effect Schema
const decodeUser = S.decode(UserModel);

// ✅ Access generic metadata
UserModel.tableName      // "user"
UserModel.columns        // { id: ColumnDef, email: ColumnDef, createdAt: ColumnDef }
UserModel.primaryKey     // ["id"]

// ✅ Transform to specific drivers via adapter functions
const drizzleTable = DSL.toDrizzle(UserModel);
const betterAuthFields = DSL.toBetterAuth(UserModel);

// ✅ Future drivers without modifying Model
const kyselyTable = DSL.toKysely(UserModel);
```

---

## 8. Key Differences from Livestore

| Aspect | Livestore | DSL.Model |
|--------|-----------|-----------|
| AST Layer | Separate internal representation | Effect Schema AST IS the AST |
| Class vs Object | Object with merged properties | Class extending VariantSchema |
| Metadata Storage | Symbol properties on objects | Schema annotations on AST |
| Variant Derivation | Manual schema construction | VariantSchema built-in |
| Type Preservation | Mapped types on objects | Class type intersection |

---

## 9. Validation Checklist

### Core Schema Requirements

DSL.Model MUST satisfy:

- [ ] **BE an Effect Schema**: `S.decode(Model)` works
- [ ] **Inherit Schema methods**: `.pipe()`, `.annotations()`, etc.
- [ ] **Preserve variants**: `.select`, `.insert`, `.update`, `.json`, etc.
- [ ] **Support chaining**: `.annotations()` returns same interface with static properties
- [ ] **Type-safe field access**: `Model.fields.id` typed correctly

### Static Properties (Generic, Driver-Agnostic)

- [ ] **`.tableName`**: Snake-case table identifier string
- [ ] **`.columns`**: Record of generic `ColumnDef` per field
- [ ] **`.primaryKey`**: Array of primary key column names
- [ ] **`.indexes`**: Array of index definitions
- [ ] **`.identifier`**: Original PascalCase identifier

### Driver Adapters (Separate Functions)

- [ ] **`DSL.toDrizzle(Model)`**: Returns Drizzle `PgTable`
- [ ] **`DSL.toBetterAuth(Model)`**: Returns `Record<string, DBFieldAttribute>`
- [ ] **Future extensibility**: New adapters don't require Model changes

### Design Principles

- [ ] **No driver-specific properties on Model**: Domain stays clean
- [ ] **Column types are abstract**: `"string"` not `"varchar"` or `"text"`
- [ ] **Adapters handle mapping**: `"string" + maxLength:255` → Drizzle `varchar(255)`
- [ ] **Metadata via Schema annotations**: Uses Effect's built-in annotation system

---

## 10. Files to Reference

| File | Pattern |
|------|---------|
| `packages/common/schema/src/core/VariantSchema.ts` | Base class factory to extend |
| `packages/common/schema/src/identity/entity-id/entity-id.ts` | Static property exposure pattern |
| `packages/common/schema/src/derived/kits/string-literal-kit.ts` | Kit pattern with annotations override |
| `tmp/livestore/packages/@livestore/common/src/schema/state/sqlite/db-schema/dsl/mod.ts` | Table factory reference |
| `tmp/livestore/packages/@livestore/common/src/schema/state/sqlite/column-def.ts` | Column definition types |
