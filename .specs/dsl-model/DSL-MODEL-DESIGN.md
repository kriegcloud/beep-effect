# DSL.Model Design Document

## Executive Summary

This document presents a complete type system and API design for `DSL.Model` - an Effect Schema factory that:
1. **IS a valid Effect Schema** - works with `S.decode()`, `.pipe()`, `.annotations()`
2. **Extends VariantSchema.Class** - inherits 6 variants automatically
3. **Exposes driver-agnostic SQL metadata** as static properties
4. **Enables adapter functions** to generate driver-specific outputs

### Key Codebase Patterns

**Namespace Export Pattern**: Domain entities are exported as namespaces (e.g., `User.Model`, not `UserModel`). This is done in `packages/shared/domain/src/entities/index.ts`:
```typescript
export * as User from "./User";  // Creates User namespace
export * as Organization from "./Organization";
// Access: User.Model, Organization.Model
```

**Primary Key Pattern (CRITICAL)**:
- `id` is **NOT** the primary key - it's a public UUID identifier with a default generator
- `_rowId` **IS** the PRIMARY KEY - it's a `pg.serial` (auto-increment integer) marked as `M.Generated`

See `packages/shared/domain/src/common.ts` for the canonical implementation.

---

## 1. Core Type Definitions

### 1.1 ColumnType - Abstract SQL Column Types

```typescript
/**
 * Driver-agnostic column types.
 * Adapters translate these to driver-specific types (e.g., "uuid" → pg.uuid()).
 */
export type ColumnType =
  | "string"    // Text/varchar - Drizzle: text/varchar, BetterAuth: "string"
  | "number"    // Integer/float - Drizzle: integer/real, BetterAuth: "number"
  | "integer"   // Integer/serial - Drizzle: integer/serial, BetterAuth: "number"
  | "boolean"   // Boolean - Drizzle: boolean, BetterAuth: "boolean"
  | "date"      // Date only - Drizzle: date, BetterAuth: "date"
  | "datetime"  // Timestamp - Drizzle: timestamp, BetterAuth: "date"
  | "json"      // JSON object - Drizzle: jsonb, BetterAuth: "json"
  | "uuid"      // UUID - Drizzle: uuid, BetterAuth: "string"
  | "blob";     // Binary - Drizzle: bytea, BetterAuth: N/A
```

### 1.2 ColumnDef - Driver-Agnostic Column Definition

```typescript
/**
 * Complete column definition containing all SQL metadata.
 * Stored as an annotation on each DSL.Field schema.
 */
export interface ColumnDef {
  /** Abstract column type - adapters map to driver-specific types */
  readonly type: ColumnType;

  /** Column is the primary key (or part of composite primary key) */
  readonly primaryKey?: boolean;

  /** Column has a unique constraint */
  readonly unique?: boolean;

  /** Column allows NULL values (default: false, meaning NOT NULL) */
  readonly nullable?: boolean;

  /** Default value expression (e.g., "gen_random_uuid()", "now()") */
  readonly defaultValue?: string | (() => string);

  /** Maximum length for string columns (maps to varchar(N)) */
  readonly maxLength?: number;

  /** Foreign key reference */
  readonly references?: {
    readonly table: string;
    readonly column: string;
    readonly onDelete?: "cascade" | "restrict" | "set null" | "set default" | "no action";
  };

  /** Column participates in an index */
  readonly index?: boolean | string;

  /** Custom column name in SQL (for snake_case mapping) */
  readonly columnName?: string;

  /** Auto-increment column (for serial primary keys like _rowId) */
  readonly autoIncrement?: boolean;
}
```

### 1.3 IndexDef - Index Configuration

```typescript
/**
 * Index definition for compound or named indexes.
 */
export interface IndexDef {
  /** Index name (auto-generated if not provided) */
  readonly name?: string;

  /** Columns participating in the index */
  readonly columns: readonly string[];

  /** Index type */
  readonly type?: "btree" | "hash" | "gin" | "gist";

  /** Unique index */
  readonly unique?: boolean;

  /** Partial index condition */
  readonly where?: string;
}
```

### 1.4 VariantConfig - Field Variant Behavior

```typescript
/**
 * Controls which VariantSchema variants include this field.
 *
 * Variants:
 * - "select": Database SELECT queries (all columns)
 * - "insert": INSERT statements
 * - "update": UPDATE statements
 * - "json": JSON serialization
 * - "jsonCreate": JSON for creation endpoints
 * - "jsonUpdate": JSON for update endpoints
 */
export type VariantBehavior = "required" | "optional" | "omit";

export interface VariantConfig {
  readonly select?: VariantBehavior;
  readonly insert?: VariantBehavior;
  readonly update?: VariantBehavior;
  readonly json?: VariantBehavior;
  readonly jsonCreate?: VariantBehavior;
  readonly jsonUpdate?: VariantBehavior;
}
```

### 1.5 FieldConfig - Complete DSL.Field Configuration

```typescript
// From @beep/schema/integrations/sql/dsl/types

/**
 * Configuration object passed to DSL.Field().
 */
export interface FieldConfig {
  /** Column metadata - driver-agnostic SQL definition */
  readonly column?: Partial<ColumnDef>;

  /** Variant behavior - controls field presence in each variant */
  readonly variants?: VariantConfig;
}
```

### 1.6 Annotation Symbols

```typescript
import { $SchemaId } from "@beep/identity/packages";

// Use $SchemaId for schema internals (column metadata, variant config)
// Use $SharedDomainId for domain entity identifiers in Model definitions
const $I = $SchemaId.create("integrations/sql/dsl/<path-to-module>")

/**
 * Symbol-keyed annotations for storing DSL metadata on Effect Schemas.
 * These Symbol keys work with Effect Schema's annotation system via
 * schema.annotations({ [Symbol]: value }).
 */
export const ColumnMetaSymbol: unique symbol = Symbol.for($I`column-meta`);
export const VariantConfigSymbol: unique symbol = Symbol.for($I`variant-config`);

/**
 * Column and variant metadata are stored as annotations on the schema AST.
 * Access them using:
 *   - AST.getAnnotation<ColumnDef>(ColumnMetaSymbol)(schema.ast)
 *   - AST.getAnnotation<VariantConfig>(VariantConfigSymbol)(schema.ast)
 *
 * These symbols are used as annotation keys, not interface properties.
 * Type safety is maintained through the DSLField interface methods:
 *   - getColumnDef(): O.Option<ColumnDef>
 *   - getVariantConfig(): O.Option<VariantConfig>
 */
```

---

## 2. Interface Specifications

### 2.1 DSLField<A, I, R> - Effect Schema with Column Metadata

```typescript
/**
 * A DSL.Field is an Effect Schema that carries column metadata.
 *
 * Type Parameters:
 * - A: Decoded/runtime type
 * - I: Encoded/wire type
 * - R: Effect context requirements
 */
export interface DSLField<A, I = A, R = never> extends S.Schema<A, I, R> {
  /**
   * Retrieve the column definition from this field's annotations.
   * Returns Option.none() if no column metadata is attached.
   */
  readonly getColumnDef: () => O.Option<ColumnDef>;

  /**
   * Retrieve the variant configuration from this field's annotations.
   * Returns Option.none() if no variant config is attached.
   */
  readonly getVariantConfig: () => O.Option<VariantConfig>;
}
```

### 2.2 ModelSchemaInstance<Self, Fields> - Full Model Interface

```typescript
/**
 * The complete DSL.Model interface combining:
 * - Effect Schema functionality (S.decode, .pipe, .annotations)
 * - VariantSchema.Class variants (.insert, .update, .json, etc.)
 * - Driver-agnostic SQL metadata (static properties)
 *
 * Type Parameters:
 * - Self: The model class type itself (for self-referencing)
 * - Fields: Record of DSLField definitions
 */
// Note: `any` in the generic constraint is intentional here.
// DSLField<any, any, any> allows Fields to contain any DSLField specialization.
// This is a standard Effect Schema pattern for polymorphic containers.
export interface ModelSchemaInstance<
  Self,
  Fields extends Record<string, DSLField<any, any, any>>
> extends S.AnnotableClass<
    ModelSchemaInstance<Self, Fields>,
    ModelType<Fields>,
    ModelEncoded<Fields>,
    ModelContext<Fields>
  > {
  // ============ Static Properties (Driver-Agnostic) ============

  /** Snake_case table name derived from identifier */
  readonly tableName: string;

  /** Record of column definitions per field */
  readonly columns: { readonly [K in keyof Fields]: ColumnDef };

  /** Primary key column names (supports composite keys) */
  readonly primaryKey: readonly string[];

  /** Index definitions for the table */
  readonly indexes: readonly IndexDef[];

  /** Original PascalCase identifier */
  readonly identifier: string;

  /** Raw field definitions for introspection */
  readonly fields: Fields;

  // ============ VariantSchema Variants (Inherited) ============

  /** SELECT variant - all columns */
  readonly select: S.Schema<ModelType<Fields>, ModelEncoded<Fields>, ModelContext<Fields>>;

  /** INSERT variant - excludes generated columns */
  readonly insert: S.Schema<InsertType<Fields>, InsertEncoded<Fields>, InsertContext<Fields>>;

  /** UPDATE variant - excludes generated columns, all optional */
  readonly update: S.Schema<UpdateType<Fields>, UpdateEncoded<Fields>, UpdateContext<Fields>>;

  /** JSON variant - all fields for JSON serialization */
  readonly json: S.Schema<JsonType<Fields>, JsonEncoded<Fields>, JsonContext<Fields>>;

  /** JSON Create variant - for creation endpoints */
  readonly jsonCreate: S.Schema<JsonCreateType<Fields>, JsonCreateEncoded<Fields>, JsonCreateContext<Fields>>;

  /** JSON Update variant - for update endpoints */
  readonly jsonUpdate: S.Schema<JsonUpdateType<Fields>, JsonUpdateEncoded<Fields>, JsonUpdateContext<Fields>>;

  // ============ Schema.Class Methods ============

  /** Create new instance */
  new (props: ConstructorProps<Fields>): ModelType<Fields>;

  /** Factory method */
  make(props: ConstructorProps<Fields>): ModelType<Fields>;

  /** Override annotations (returns new factory instance preserving statics) */
  annotations(annotations: S.Annotations.Schema<Self>): ModelSchemaInstance<Self, Fields>;

  /** AST representation */
  readonly ast: AST.Transformation;
}

// ============ Type Inference Helpers ============

/** Extract runtime type from fields */
type ModelType<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields]: S.Schema.Type<Fields[K]>;
};

/** Extract encoded type from fields */
type ModelEncoded<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields]: S.Schema.Encoded<Fields[K]>;
};

/** Extract context from fields */
type ModelContext<Fields extends Record<string, DSLField<any, any, any>>> =
  S.Schema.Context<Fields[keyof Fields]>;

/** Extract insert variant type from fields */
type InsertType<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields as GetVariantBehavior<Fields[K], "insert"> extends "omit" ? never : K]:
    GetVariantBehavior<Fields[K], "insert"> extends "optional"
      ? S.Schema.Type<Fields[K]> | undefined
      : S.Schema.Type<Fields[K]>;
};

/** Extract insert encoded type from fields */
type InsertEncoded<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields as GetVariantBehavior<Fields[K], "insert"> extends "omit" ? never : K]:
    GetVariantBehavior<Fields[K], "insert"> extends "optional"
      ? S.Schema.Encoded<Fields[K]> | undefined
      : S.Schema.Encoded<Fields[K]>;
};

/** Extract insert context from fields */
type InsertContext<Fields extends Record<string, DSLField<any, any, any>>> =
  S.Schema.Context<Fields[keyof Fields]>;

/** Extract update variant type (all optional) */
type UpdateType<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields as GetVariantBehavior<Fields[K], "update"> extends "omit" ? never : K]?:
    S.Schema.Type<Fields[K]>;
};

/** Extract update encoded type (all optional) */
type UpdateEncoded<Fields extends Record<string, DSLField<any, any, any>>> = {
  readonly [K in keyof Fields as GetVariantBehavior<Fields[K], "update"> extends "omit" ? never : K]?:
    S.Schema.Encoded<Fields[K]>;
};

/** Extract update context from fields */
type UpdateContext<Fields extends Record<string, DSLField<any, any, any>>> =
  S.Schema.Context<Fields[keyof Fields]>;

/** JSON variant types follow similar pattern */
type JsonType<Fields extends Record<string, DSLField<any, any, any>>> = ModelType<Fields>;
type JsonEncoded<Fields extends Record<string, DSLField<any, any, any>>> = ModelEncoded<Fields>;
type JsonContext<Fields extends Record<string, DSLField<any, any, any>>> = ModelContext<Fields>;

type JsonCreateType<Fields extends Record<string, DSLField<any, any, any>>> = InsertType<Fields>;
type JsonCreateEncoded<Fields extends Record<string, DSLField<any, any, any>>> = InsertEncoded<Fields>;
type JsonCreateContext<Fields extends Record<string, DSLField<any, any, any>>> = InsertContext<Fields>;

type JsonUpdateType<Fields extends Record<string, DSLField<any, any, any>>> = UpdateType<Fields>;
type JsonUpdateEncoded<Fields extends Record<string, DSLField<any, any, any>>> = UpdateEncoded<Fields>;
type JsonUpdateContext<Fields extends Record<string, DSLField<any, any, any>>> = UpdateContext<Fields>;

/** Helper to extract variant behavior from a DSLField */
type GetVariantBehavior<F extends DSLField<any, any, any>, V extends keyof VariantConfig> =
  F extends { getVariantConfig: () => O.Option<infer C> }
    ? C extends VariantConfig
      ? C[V] extends VariantBehavior
        ? C[V]
        : "required"
      : "required"
    : "required";

/**
 * Constructor props for model instantiation.
 * Derives from the insert variant - fields present in insert are constructor props.
 * Fields with insert: "omit" are excluded, fields with insert: "optional" are optional.
 */
type ConstructorProps<Fields extends Record<string, DSLField<any, any, any>>> = InsertType<Fields>;
```

---

## 3. Factory Function Signatures

### 3.1 DSL.Field - Create Field with Column Metadata

```typescript
/**
 * Create a DSL.Field by wrapping an Effect Schema with column metadata.
 *
 * The returned schema:
 * - IS a valid Effect Schema (can be used with S.decode, etc.)
 * - Carries column metadata in annotations
 * - Carries variant configuration in annotations
 *
 * @example
 * ```typescript
 * const emailField = DSL.Field(S.String, {
 *   column: { type: "string", unique: true, maxLength: 255 },
 *   variants: { insert: "required", update: "optional" }
 * });
 *
 * // Type inference preserved
 * type Email = S.Schema.Type<typeof emailField>; // string
 * ```
 */
export const Field: <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig
) => DSLField<A, I, R>;
```

### 3.2 DSL.Model - Create Model Class

```typescript
/**
 * Create a DSL.Model class with driver-agnostic SQL metadata.
 *
 * The returned class:
 * - IS a valid Effect Schema (S.decode(Model), .pipe(), .annotations())
 * - Extends VariantSchema.Class (has .insert, .update, .json, etc.)
 * - Exposes driver-agnostic metadata as static properties
 *
 * Usage follows the curried pattern matching VariantSchema.Class:
 *   DSL.Model<Self>()(identifier)(fields, options)
 *
 * IMPORTANT - Primary Key Pattern:
 * - `id` is NOT the primary key - it's a public UUID identifier with default generator
 * - `_rowId` IS the PRIMARY KEY - it's a pg.serial (auto-increment integer) marked as Generated
 *
 * Domain entities are exported as namespaces (e.g., `User.Model`, not `UserModel`).
 * This is done via: `export * as User from "./User";` in the entities index.
 *
 * @example
 * ```typescript
 * import { DSL } from "@beep/schema/integrations/sql/dsl";
 * import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
 * import * as S from "effect/Schema";
 * import { $SharedDomainId } from "@beep/identity/packages";
 * import { BS } from "@beep/schema";
 *
 * const $I = $SharedDomainId.create("entities/User/User.model");
 *
 * // Exported as namespace: User.Model (via `export * as User from "./User"`)
 * export class Model extends DSL.Model<Model>()($I`UserModel`)({
 *   // Public UUID identifier (NOT primary key) - has default generator
 *   id: DSL.Field(SharedEntityIds.UserId, {
 *     column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() },
 *     variants: { insert: "omit", select: "required" },
 *   }),
 *   // Internal primary key (pg.serial - auto-increment integer)
 *   // Note: modelRowIdSchema and privateSchema are aliases for the internal ID schema
 *   _rowId: DSL.Field(SharedEntityIds.UserId.modelRowIdSchema, {
 *     column: { type: "integer", primaryKey: true, autoIncrement: true },
 *     variants: { insert: "omit", select: "required" },
 *   }),
 *   email: DSL.Field(BS.Email, {
 *     column: { type: "string", unique: true, maxLength: 255 },
 *     variants: { insert: "required", update: "optional" },
 *   }),
 *   name: DSL.Field(S.String, {
 *     column: { type: "string", maxLength: 100 },
 *   }),
 *   createdAt: DSL.Field(BS.DateTimeUtcFromAllAcceptable, {
 *     column: { type: "datetime", defaultValue: "now()" },
 *     variants: { insert: "omit", select: "required" },
 *   }),
 *   updatedAt: DSL.Field(BS.DateTimeUtcFromAllAcceptable, {
 *     column: { type: "datetime", defaultValue: "now()" },
 *     variants: { insert: "omit" },
 *   }),
 * }, {
 *   indexes: [
 *     { name: "idx_users_email", columns: ["email"], unique: true },
 *   ],
 * }) {}
 *
 * // Works as Effect Schema
 * const decode = S.decode(User.Model);
 *
 * // Variant schemas (inherited from VariantSchema.Class)
 * User.Model.insert; // Insert variant - no id, no _rowId, no createdAt
 * User.Model.update; // Update variant
 *
 * // Driver-agnostic static properties
 * User.Model.tableName;    // "user"
 * User.Model.columns;      // { id: ColumnDef, _rowId: ColumnDef, email: ColumnDef, ... }
 * User.Model.primaryKey;   // ["_rowId"]  // NOT ["id"]!
 * ```
 */
export const Model: <Self>() => (identifier: string) => <
  const Fields extends Record<string, DSLField<any, any, any>>
>(
  fields: Fields,
  options?: { readonly indexes?: readonly IndexDef[] }
) => ModelSchemaInstance<Self, Fields>;
```

---

## 4. Adapter Function Signatures

### 4.1 toDrizzle - Generate Drizzle PgTable

```typescript
/**
 * Transform a DSL.Model into a Drizzle PgTable.
 *
 * This is a SEPARATE adapter function (not a method on Model).
 * It reads the driver-agnostic metadata and produces Drizzle-specific output.
 *
 * Type Mapping:
 * - "string" + maxLength → pg.varchar(name, { length })
 * - "string" (no length) → pg.text(name)
 * - "number" → pg.integer(name) or pg.real(name) for floats
 * - "integer" → pg.integer(name) or pg.serial(name) if autoIncrement
 * - "boolean" → pg.boolean(name)
 * - "date" → pg.date(name)
 * - "datetime" → pg.timestamp(name)
 * - "json" → pg.jsonb(name)
 * - "uuid" → pg.uuid(name)
 * - "blob" → pg.bytea(name)
 *
 * Constraint Mapping:
 * - primaryKey: true → .primaryKey()
 * - nullable: false → .notNull() (default)
 * - unique: true → .unique()
 * - defaultValue: "gen_random_uuid()" → .defaultRandom()
 * - defaultValue: "now()" → .defaultNow()
 * - defaultValue: string → .default(sql`${value}`)
 *
 * @example
 * ```typescript
 * import { DSL } from "@beep/schema/integrations/sql/dsl";
 *
 * const userTable = DSL.toDrizzle(User.Model);
 * // Produces: pgTable("user", {
 * //   id: uuid("id").unique().notNull().$defaultFn(() => SharedEntityIds.UserId.create()),
 * //   _row_id: serial("_row_id").primaryKey(),
 * //   email: varchar("email", { length: 255 }).unique().notNull(),
 * //   name: varchar("name", { length: 100 }).notNull(),
 * //   created_at: timestamp("created_at").defaultNow().notNull(),
 * //   updated_at: timestamp("updated_at").defaultNow().notNull(),
 * // })
 * ```
 */
export const toDrizzle: <M extends ModelSchemaInstance<any, any>>(
  model: M
) => PgTable;
```

### 4.2 toBetterAuth - Generate better-auth Field Config

```typescript
/**
 * Transform a DSL.Model into better-auth additionalFields config.
 *
 * This is a SEPARATE adapter function (not a method on Model).
 * It reads the driver-agnostic metadata and produces better-auth-specific output.
 *
 * Type Mapping (ColumnType → DBFieldType):
 * - "string" → "string"
 * - "uuid" → "string" (better-auth has no UUID type)
 * - "number" → "number"
 * - "boolean" → "boolean"
 * - "date" → "date"
 * - "datetime" → "date" (better-auth has no datetime distinction)
 * - "json" → "json"
 * - "blob" → "string" (fallback)
 *
 * Field Visibility Mapping (Variants → input/returned):
 * - variants.insert !== "omit" → input: true
 * - variants.insert === "omit" → input: false
 * - variants.select !== "omit" → returned: true
 * - variants.select === "omit" → returned: false
 *
 * @example
 * ```typescript
 * const betterAuthFields = DSL.toBetterAuth(User.Model);
 * // Produces: {
 * //   email: { type: "string", required: true, unique: true, returned: true, input: true },
 * //   name: { type: "string", required: true, returned: true, input: true },
 * //   createdAt: { type: "date", required: false, returned: true, input: false },
 * //   updatedAt: { type: "date", required: false, returned: true, input: false },
 * // }
 * // Note: primary key fields (_rowId) and id fields are typically excluded from additionalFields
 * ```
 */
export const toBetterAuth: <M extends ModelSchemaInstance<any, any>>(
  model: M,
  options?: {
    /** Exclude primary key fields from output (default: true) */
    excludePrimaryKey?: boolean;
    /** Exclude fields that are auto-generated (default: false) */
    excludeGenerated?: boolean;
  }
) => Record<string, DBFieldAttribute>;
```

---

## 5. Research Question Answers

### Q1: AST Introspection - How to extract type information from wrapped schemas?

**Answer:**

For schemas wrapped in `M.Generated()`, `M.Sensitive()`, or branded types, use recursive AST traversal to find the "final" type:

```typescript
import * as AST from "effect/SchemaAST";
import * as Match from "effect/Match";
import * as O from "effect/Option";

/**
 * Resolve through Transformation and Refinement wrappers to find the final type.
 */
// Note: Match.tag works with Effect SchemaAST nodes because they have a `_tag` field
// for discriminated union identification (e.g., "Transformation", "Refinement", etc.)
const resolveFinalType = (ast: AST.AST): AST.AST =>
  Match.value(ast).pipe(
    Match.tag("Transformation", (trans) => resolveFinalType(trans.to)),
    Match.tag("Refinement", (ref) => resolveFinalType(ref.from)),
    Match.tag("Suspend", (suspend) => resolveFinalType(suspend.f())),
    Match.orElse(() => ast)
  );

/**
 * Infer SQL column type from final AST node.
 */
const inferFromAST = (ast: AST.AST): ColumnType => {
  const final = resolveFinalType(ast);

  return Match.value(final).pipe(
    Match.tag("StringKeyword", () => "string" as const),
    Match.tag("NumberKeyword", () => "number" as const),
    Match.tag("BooleanKeyword", () => "boolean" as const),
    Match.tag("BigIntKeyword", () => "number" as const),
    // Check for UUID via identifier annotation
    Match.when(
      (n) => F.pipe(n, AST.getIdentifierAnnotation, O.contains("UUID")),
      () => "uuid" as const
    ),
    // Check for DateTime via identifier annotation
    Match.when(
      (n) => F.pipe(n, AST.getIdentifierAnnotation, O.exists(Str.startsWith("DateTime"))),
      () => "datetime" as const
    ),
    // Default to JSON for complex types
    Match.orElse(() => "json" as const)
  );
};
```

**For extracting column metadata from DSL.Field:**

```typescript
const getColumnDef = (schema: S.Schema.Any): O.Option<ColumnDef> =>
  F.pipe(
    schema.ast,
    AST.getAnnotation<ColumnDef>(ColumnMetaSymbol)
  );

const getVariantConfig = (schema: S.Schema.Any): O.Option<VariantConfig> =>
  F.pipe(
    schema.ast,
    AST.getAnnotation<VariantConfig>(VariantConfigSymbol)
  );
```

---

### Q2: Default Value Handling - How does `defaultValue` translate to Drizzle methods?

**Answer:**

The adapter uses pattern matching on common SQL expressions:

```typescript
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

type DrizzleColumn = pg.PgColumn<any>;

const applyDefaultValue = (
  column: DrizzleColumn,
  defaultValue: string | (() => string) | undefined
): DrizzleColumn => {
  if (defaultValue === undefined) return column;

  const value = typeof defaultValue === "function" ? defaultValue() : defaultValue;

  return Match.value(value).pipe(
    // UUID generation
    Match.when(
      (v) => v === "gen_random_uuid()" || v === "uuid_generate_v4()",
      () => column.defaultRandom()
    ),
    // Timestamp now()
    Match.when(
      (v) => v === "now()" || v === "CURRENT_TIMESTAMP",
      () => column.defaultNow()
    ),
    // Literal true/false for boolean columns
    Match.when(
      (v) => v === "true",
      () => column.default(true)
    ),
    Match.when(
      (v) => v === "false",
      () => column.default(false)
    ),
    // Numeric literals
    Match.when(
      (v) => /^-?\d+(\.\d+)?$/.test(v),
      (v) => column.default(parseFloat(v))
    ),
    // SQL expression fallback
    Match.orElse((v) => column.default(sql.raw(v)))
  );
};
```

**Common mappings:**

| `defaultValue`         | Drizzle Method                |
|------------------------|-------------------------------|
| `"gen_random_uuid()"`  | `.defaultRandom()`            |
| `"uuid_generate_v4()"` | `.defaultRandom()`            |
| `"now()"`              | `.defaultNow()`               |
| `"CURRENT_TIMESTAMP"`  | `.defaultNow()`               |
| `"true"` / `"false"`   | `.default(true/false)`        |
| `"0"`, `"42"`          | `.default(0)`, `.default(42)` |
| Any other string       | `.default(sql.raw(value))`    |

---

### Q3: Type Inference - How to infer ColumnType when no explicit `column.type` is provided?

**Answer:**

DSL.Field uses a two-step process:

1. **Check explicit config** - If `config.column.type` is provided, use it.
2. **Infer from schema AST** - Use the `inferFromAST` function above.

```typescript
const inferColumnType = <A, I, R>(
  schema: S.Schema<A, I, R>,
  explicitType?: ColumnType
): ColumnType => {
  // Prefer explicit type if provided
  if (explicitType !== undefined) return explicitType;

  // Check for existing column annotation (e.g., from EntityId)
  const existing = getColumnDef(schema);
  if (O.isSome(existing) && existing.value.type !== undefined) {
    return existing.value.type;
  }

  // Infer from AST
  return inferFromAST(schema.ast);
};

/**
 * Complete inference table based on Effect Schema types:
 */
const astToColumnType: Record<string, ColumnType> = {
  // Primitives
  "StringKeyword": "string",
  "NumberKeyword": "number",
  "BooleanKeyword": "boolean",
  "BigIntKeyword": "number",  // Could also support "bigint" column type

  // Via identifier annotation
  "UUID": "uuid",
  "DateTime": "datetime",
  "DateTimeUtc": "datetime",
  "Date": "date",

  // Fallbacks
  "TypeLiteral": "json",     // Nested struct → JSONB
  "TupleType": "json",       // Array → JSONB (or use .array() for PG)
  "Union": "string",         // Enum-like → TEXT with check constraint
};
```

**Schema → ColumnType inference:**

| Effect Schema                     | AST Node                          | Inferred ColumnType |
|-----------------------------------|-----------------------------------|---------------------|
| `S.String`                        | `StringKeyword`                   | `"string"`          |
| `S.Number`                        | `NumberKeyword`                   | `"number"`          |
| `S.Boolean`                       | `BooleanKeyword`                  | `"boolean"`         |
| `S.BigInt`                        | `BigIntKeyword`                   | `"number"`          |
| `S.UUID`                          | `Refinement(String)` + identifier | `"uuid"`            |
| `BS.DateTimeUtcFromAllAcceptable` | `Transformation` + identifier     | `"datetime"`        |
| `S.Date`                          | `Transformation` + identifier     | `"date"`            |
| `S.Struct({...})`                 | `TypeLiteral`                     | `"json"`            |
| `S.Array(...)`                    | `TupleType`                       | `"json"`            |
| `EntityId.XxxId`                  | Custom via annotation             | `"uuid"`            |

---

### Q4: Variant Mapping - How do VariantSchema variants map to better-auth's flags?

**Answer:**

The `VariantConfig` maps directly to better-auth's `input` and `returned` flags:

```typescript
const variantToBetterAuth = (
  variantConfig: VariantConfig | undefined
): { input: boolean; returned: boolean; required: boolean } => {
  const insertBehavior = variantConfig?.insert ?? "required";
  const selectBehavior = variantConfig?.select ?? "required";

  return {
    // Can this field be provided in API input?
    input: insertBehavior !== "omit",

    // Is this field returned in API responses?
    returned: selectBehavior !== "omit",

    // Is this field required when provided?
    required: insertBehavior === "required",
  };
};
```

**Complete mapping table:**

| VariantConfig                        | insert   | select   | input   | returned | required |
|--------------------------------------|----------|----------|---------|----------|----------|
| `{}` (default)                       | required | required | `true`  | `true`   | `true`   |
| `{ insert: "omit" }`                 | omit     | required | `false` | `true`   | `false`  |
| `{ select: "omit" }`                 | required | omit     | `true`  | `false`  | `true`   |
| `{ insert: "optional" }`             | optional | required | `true`  | `true`   | `false`  |
| `{ insert: "omit", select: "omit" }` | omit     | omit     | `false` | `false`  | `false`  |

**Semantic mappings for common patterns:**

| Pattern              | DSL.Field Config                                   | Better-Auth Result                 |
|----------------------|----------------------------------------------------|------------------------------------|
| Generated ID         | `{ variants: { insert: "omit" } }`                 | `{ input: false, returned: true }` |
| Sensitive (password) | `{ variants: { select: "omit" } }`                 | `{ input: true, returned: false }` |
| Optional field       | `{ variants: { insert: "optional" } }`             | `{ input: true, required: false }` |
| Internal only        | `{ variants: { insert: "omit", select: "omit" } }` | Excluded from output               |
| Audit timestamp      | `{ variants: { insert: "omit" } }`                 | `{ input: false, returned: true }` |

---

### Q5: Index Definition - How should compound indexes and named indexes be specified?

**Answer:**

Indexes are specified at two levels:

**1. Field-Level Indexes (single column):**

```typescript
const emailField = DSL.Field(BS.Email, {
  column: {
    type: "string",
    unique: true,     // Creates unique index on this column
    index: true,      // Creates non-unique index
    // OR:
    index: "idx_users_email",  // Named index
  }
});
```

**2. Model-Level Indexes (compound, named):**

```typescript
// Domain entities are exported as namespaces: User.Model
// via `export * as User from "./User"` in packages/shared/domain/src/entities/index.ts

export class Model extends DSL.Model<Model>($I`UserModel`)({
  // Public UUID identifier (NOT primary key)
  id: DSL.Field(SharedEntityIds.UserId, {
    column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() },
    variants: { insert: "omit", select: "required" },
  }),
  // Internal primary key (pg.serial)
  _rowId: DSL.Field(SharedEntityIds.UserId.privateSchema, {
    column: { type: "integer", primaryKey: true, autoIncrement: true },
    variants: { insert: "omit", select: "required" },
  }),
  orgId: DSL.Field(SharedEntityIds.OrganizationId, { column: { type: "uuid" } }),
  email: DSL.Field(BS.Email, { column: { type: "string" } }),
  status: DSL.Field(S.String, { column: { type: "string" } }),
}, {
  // Model-level index configuration
  indexes: [
    {
      name: "idx_users_org_email",
      columns: ["orgId", "email"],
      unique: true,
    },
    {
      name: "idx_users_status",
      columns: ["status"],
      type: "btree",
    },
    {
      name: "idx_users_active",
      columns: ["status"],
      where: "status = 'active'",  // Partial index
    },
  ],
}) {}
```

**Alternative: Fluent API (future enhancement):**

```typescript
export class Model extends DSL.Model<Model>($I`UserModel`)({
  // fields...
}).index("idx_users_org_email", ["organizationId", "email"], { unique: true })
  .index("idx_users_status", ["status"]) {}
```

**Drizzle adapter output for indexes:**

```typescript
// Field-level unique constraint
email: varchar("email", { length: 255 }).unique()

// Model-level compound index
export const userOrgEmailIndex = uniqueIndex("idx_users_org_email")
  .on(userTable.orgId, userTable.email);

export const userStatusIndex = index("idx_users_status")
  .on(userTable.status);
```

---

## 6. Implementation Pseudocode

### 6.1 DSL.Field Implementation

```typescript
import * as S from "effect/Schema";
import * as O from "effect/Option";
import * as AST from "effect/SchemaAST";
import * as F from "effect/Function";

export const Field = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig
): DSLField<A, I, R> => {
  // 1. Infer column type if not provided
  const inferredType = inferColumnType(schema, config?.column?.type);

  // 2. Build complete ColumnDef
  const columnDef: ColumnDef = {
    type: inferredType,
    nullable: false,  // Default: NOT NULL
    ...config?.column,
  };

  // 3. Annotate schema with column and variant metadata
  // Symbol-keyed annotations work with Effect Schema's annotation system
  const annotatedSchema = schema.annotations({
    [ColumnMetaSymbol]: columnDef,
    [VariantConfigSymbol]: config?.variants ?? {},
  });

  // 4. Add helper methods via Object.assign
  // Note: This mutation is intentional - we're extending the annotated schema
  // with additional methods. This is safe because annotatedSchema is a new
  // instance created by .annotations(). An alternative immutable pattern would
  // be to create a wrapper class, but that adds complexity without benefit here.
  const dslField = Object.assign(annotatedSchema, {
    getColumnDef: () => O.some(columnDef),
    getVariantConfig: () => O.fromNullable(config?.variants),
  });

  return dslField as DSLField<A, I, R>;
};
```

### 6.2 DSL.Model Factory Implementation

```typescript
import * as VariantSchema from "@beep/schema/core/VariantSchema";
import * as Str from "effect/String";
import * as A from "effect/Array";
import * as R from "effect/Record";
// Import Struct with underscore prefix to avoid conflict with VariantStruct local binding
import * as _Struct from "effect/Struct";

// Note: _Struct is used for object key/entry operations (_Struct.keys, _Struct.entries)
// This pattern is established in VariantSchema.ts (see line 11)
// R (Record) is used for functional record transformations (R.fromEntries, R.map)

// Create VariantSchema with 6 variants
const {
  Class: BaseClass,
  Field: VariantField,
  Struct: VariantStruct,
  extract,
} = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select",
});

// Variant keys for iteration
const VARIANT_KEYS = ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"] as const;

export const Model = <Self>() => (identifier: string) => <
  const Fields extends Record<string, DSLField<any, any, any>>
>(
  fields: Fields,
  options?: { indexes?: readonly IndexDef[] }
): ModelSchemaInstance<Self, Fields> => {

  // 1. Extract column definitions from field annotations
  const columns = F.pipe(
    _Struct.keys(fields),
    A.map((key) => {
      const field = fields[key];
      const columnDef = getColumnDefOrInfer(field);
      return [key, columnDef] as const;
    }),
    R.fromEntries
  ) as { readonly [K in keyof Fields]: ColumnDef };

  // 2. Derive primary key columns
  // Note: _Struct.entries is available in VariantSchema.ts (line 557)
  // It returns [key, value] pairs for object iteration
  const primaryKey = F.pipe(
    _Struct.keys(columns),
    A.map((key) => [key, columns[key]] as const),
    A.filter(([_, def]) => def.primaryKey === true),
    A.map(([key, _]) => key)
  );

  // 3. Convert DSL.Fields to VariantSchema.Fields
  const variantFields = F.pipe(
    _Struct.keys(fields),
    A.map((key) => [key, fields[key]] as const),
    A.map(([key, field]) => {
      const variantConfig = getVariantConfig(field);
      return [key, toVariantField(field, variantConfig)] as const;
    }),
    R.fromEntries
  );

  // 4. Create base class via VariantSchema.Class
  const SchemaClass = BaseClass<Self>(identifier)(variantFields);

  // 5. Snake_case table name
  const tableName = toSnakeCase(identifier);

  // 6. Store fields reference for annotations() override
  const fieldsRef = fields;

  // 7. Return extended class with static properties
  return class ModelClass extends SchemaClass {
    // Driver-agnostic static properties
    static readonly tableName = tableName;
    static readonly columns = columns;
    static readonly primaryKey = primaryKey;
    static readonly indexes = options?.indexes ?? ([] as readonly IndexDef[]);
    static readonly identifier = identifier;
    static readonly fields = fieldsRef;

    // Override annotations to preserve statics
    static override annotations(
      annotations: S.Annotations.Schema<Self>
    ): ModelSchemaInstance<Self, Fields> {
      // See section 6.4 for implementation details
      return makeModelClass<Self, Fields>(
        identifier,
        fieldsRef,
        { indexes: options?.indexes },
        annotations
      );
    }
  } as typeof SchemaClass & {
    readonly tableName: string;
    readonly columns: typeof columns;
    readonly primaryKey: readonly string[];
    readonly indexes: readonly IndexDef[];
    readonly identifier: string;
    readonly fields: Fields;
  };
};

// Helper: Convert DSL.Field variant config to VariantSchema.Field
// Note: S.optional(schema) returns a PropertySignature, which is compatible
// with VariantSchema's Field.Config type (S.Schema.All | S.PropertySignature.All | undefined)
const toVariantField = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config: VariantConfig | undefined
): VariantSchema.Field<any> | S.Schema<A, I, R> => {
  if (!config) return schema;

  // Build variants record using Effect Array utilities instead of for...of
  const variants = F.pipe(
    VARIANT_KEYS,
    A.reduce({} as Record<string, S.Schema<A, I, R> | S.PropertySignature.All | undefined>, (acc, variant) => {
      const behavior = config[variant as keyof VariantConfig];

      if (behavior === "omit") {
        // Field not present in this variant
        acc[variant] = undefined;
      } else if (behavior === "optional") {
        // Field is optional in this variant
        acc[variant] = S.optional(schema);
      } else {
        // Default: required
        acc[variant] = schema;
      }
      return acc;
    })
  );

  return VariantField(variants);
};

// Helper: Snake_case conversion
// Note: Effect's Str.replace uses JavaScript's String.prototype.replace semantics,
// so the /g flag works for global replacement as expected
const toSnakeCase = (str: string): string =>
  F.pipe(
    str,
    Str.replace(/([A-Z])/g, "_$1"),
    Str.toLowerCase,
    Str.replace(/^_/, "")
  );
```

### 6.3 Column Metadata Extraction

```typescript
/**
 * Get ColumnDef from a field, with fallback inference.
 */
const getColumnDefOrInfer = <A, I, R>(field: DSLField<A, I, R>): ColumnDef => {
  // Try to get from annotations
  const existing = F.pipe(
    field.ast,
    AST.getAnnotation<ColumnDef>(ColumnMetaSymbol),
    O.getOrNull
  );

  if (existing !== null) return existing;

  // Fallback: infer from AST
  return {
    type: inferFromAST(field.ast),
    nullable: false,
  };
};

/**
 * Get VariantConfig from a field.
 */
const getVariantConfig = <A, I, R>(field: DSLField<A, I, R>): VariantConfig | undefined =>
  F.pipe(
    field.ast,
    AST.getAnnotation<VariantConfig>(VariantConfigSymbol),
    O.getOrUndefined
  );
```

### 6.4 annotations() Override Pattern

```typescript
import { mergeSchemaAnnotations } from "@beep/schema/core/annotations/built-in-annotations";

/**
 * The annotations() override is CRITICAL for preserving static properties.
 * It must return a new factory instance with the merged annotations.
 *
 * Uses the shared `mergeSchemaAnnotations` utility (same pattern as EntityId)
 * to merge new annotations into the existing AST.
 */

/**
 * Factory function for creating model classes with annotations.
 * This is called by the annotations() override to create a new class
 * with merged annotations while preserving all static properties.
 */
const makeModelClass = <Self, Fields extends Record<string, DSLField<any, any, any>>>(
  identifier: string,
  fields: Fields,
  options?: { readonly indexes?: readonly IndexDef[] },
  annotations?: S.Annotations.Schema<Self>
): ModelSchemaInstance<Self, Fields> => {
  // 1. Create base model using the Model factory
  const BaseModel = Model<Self>()(identifier)(fields, options);

  // 2. If no annotations, return as-is
  if (!annotations) return BaseModel;

  // 3. Apply annotations to the base model's schema
  // The parent class's annotations() method handles AST merging
  const AnnotatedBase = class extends BaseModel {
    // Preserve all static properties from BaseModel
    static override readonly tableName = BaseModel.tableName;
    static override readonly columns = BaseModel.columns;
    static override readonly primaryKey = BaseModel.primaryKey;
    static override readonly indexes = BaseModel.indexes;
    static override readonly identifier = BaseModel.identifier;
    static override readonly fields = BaseModel.fields;
  };

  // 4. Apply annotations using Effect Schema's built-in mechanism
  // This properly merges with the AST
  return Object.assign(
    AnnotatedBase,
    { ast: mergeSchemaAnnotations(BaseModel.ast, annotations) }
  ) as ModelSchemaInstance<Self, Fields>;
};

// In ModelClass:
static override annotations(
  annotations: S.Annotations.Schema<Self>
): ModelSchemaInstance<Self, Fields> {
  return makeModelClass<Self, Fields>(
    this.identifier,
    this.fields,
    { indexes: this.indexes },
    annotations
  );
}
```

---

## 7. Verification Checklist

### Core Schema Requirements
- [x] `S.decode(Model)` works - Model IS an Effect Schema
- [x] All VariantSchema variants preserved (`.insert`, `.update`, `.json`, etc.)
- [x] `.pipe()` and `.annotations()` work with DSL.Model
- [x] Type inference preserves field literal types via `const` type parameter

### Static Properties (Driver-Agnostic)
- [x] `.tableName` - snake-case string
- [x] `.columns` - Record of generic `ColumnDef` per field
- [x] `.primaryKey` - readonly string array
- [x] `.indexes` - readonly `IndexDef` array
- [x] `.identifier` - original PascalCase string

### Adapter Pattern
- [x] `DSL.toDrizzle(Model)` produces valid Drizzle PgTable
- [x] `DSL.toBetterAuth(Model)` produces valid better-auth field config
- [x] No driver-specific types leak into Model interface
- [x] Adapters can be added without modifying Model

### Implementation Patterns
- [x] Anonymous class extension for static properties
- [x] `annotations()` override returns new factory instance
- [x] Symbol-keyed annotations for column metadata storage
- [x] Effect-first patterns throughout (A.map, Match, DateTime)

---

## 8. Module Structure

```
packages/common/schema/src/integrations/sql/dsl/
├── index.ts              # Public exports: DSL.Model, DSL.Field, toDrizzle, toBetterAuth, annotation symbols
├── Model.ts              # DSL.Model factory implementation
├── Field.ts              # DSL.Field combinator implementation
├── types.ts              # ColumnType, ColumnDef, IndexDef, VariantConfig, FieldConfig
├── inference.ts          # Schema → ColumnType inference utilities
├── annotations.ts        # Symbol definitions (ColumnMetaSymbol, VariantConfigSymbol), annotation helpers
├── adapters/
│   ├── index.ts          # Re-export adapters
│   ├── drizzle.ts        # toDrizzle(Model) → PgTable
│   └── better-auth.ts    # toBetterAuth(Model) → Record<string, DBFieldAttribute>
└── __tests__/
    ├── Model.test.ts
    ├── Field.test.ts
    └── adapters/
        ├── drizzle.test.ts
        └── better-auth.test.ts

# Note: index.ts should export:
# - Model, Field (constructors)
# - toDrizzle, toBetterAuth (adapters)
# - ColumnMetaSymbol, VariantConfigSymbol (for external introspection)
# - Type definitions: ColumnType, ColumnDef, IndexDef, VariantConfig, FieldConfig, DSLField, ModelSchemaInstance
```

---

## 9. Usage Example

```typescript
import { DSL } from "@beep/schema/integrations/sql/dsl";
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import * as S from "effect/Schema";
import { $SharedDomainId } from "@beep/identity/packages";
import { BS } from "@beep/schema";

const $I = $SharedDomainId.create("entities/User/User.model");

// Define a model with driver-agnostic column metadata
// Domain entities are exported as namespaces: User.Model
// This is done via `export * as User from "./User"` in packages/shared/domain/src/entities/index.ts
export class Model extends DSL.Model<Model>($I`UserModel`)({
  // Public UUID identifier (NOT the primary key!)
  // Has default generator via EntityId.create()
  id: DSL.Field(SharedEntityIds.UserId, {
    column: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() },
    variants: { insert: "omit", select: "required" },
  }),
  // Internal primary key (pg.serial - auto-increment integer)
  // This IS the actual primary key, marked as M.Generated in the real codebase
  _rowId: DSL.Field(SharedEntityIds.UserId.privateSchema, {
    column: { type: "integer", primaryKey: true, autoIncrement: true },
    variants: { insert: "omit", select: "required" },
  }),
  email: DSL.Field(BS.Email, {
    column: { type: "string", unique: true, maxLength: 255 },
    variants: { insert: "required", update: "optional" },
  }),
  name: DSL.Field(S.String, {
    column: { type: "string", maxLength: 100 },
  }),
  createdAt: DSL.Field(BS.DateTimeUtcFromAllAcceptable, {
    column: { type: "datetime", defaultValue: "now()" },
    variants: { insert: "omit", select: "required" },
  }),
  updatedAt: DSL.Field(BS.DateTimeUtcFromAllAcceptable, {
    column: { type: "datetime", defaultValue: "now()" },
    variants: { insert: "omit" },
  }),
}) {}

// ============ Works as Effect Schema ============
// Access via namespace: User.Model (not UserModel)
const decodeUser = S.decode(User.Model);
const user = S.decodeSync(User.Model)({
  id: "user__a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  _rowId: 1, // pg serial - auto-increment integer
  email: "john@example.com",
  name: "John Doe",
  createdAt: "2025-01-15T10:30:00Z",
  updatedAt: "2025-01-15T10:30:00Z",
});

// ============ Variant Schemas (inherited from VariantSchema.Class) ============
User.Model.insert;   // { email: string, name: string } - no id, no _rowId, no createdAt
User.Model.update;   // { id?, email?, name?, createdAt?, updatedAt? }
User.Model.json;     // All fields for JSON serialization

// ============ Driver-Agnostic Static Properties ============
User.Model.tableName;    // "user"
User.Model.identifier;   // "@beep/shared-domain/entities/User/User.model/UserModel"
User.Model.primaryKey;   // ["_rowId"]  // NOT ["id"]!
User.Model.columns;
// {
//   id: { type: "uuid", unique: true, defaultValue: () => SharedEntityIds.UserId.create() },
//   _rowId: { type: "integer", primaryKey: true, autoIncrement: true },
//   email: { type: "string", unique: true, maxLength: 255 },
//   name: { type: "string", maxLength: 100 },
//   createdAt: { type: "datetime", defaultValue: "now()" },
//   updatedAt: { type: "datetime", defaultValue: "now()" },
// }

// ============ Driver Adapters (separate functions) ============
import { toDrizzle, toBetterAuth } from "@beep/schema/integrations/sql/dsl/adapters";

const userTable = toDrizzle(User.Model);
// pgTable("user", {
//   id: uuid("id").unique().notNull().$defaultFn(() => SharedEntityIds.UserId.create()),
//   _row_id: serial("_row_id").primaryKey(),
//   email: varchar("email", { length: 255 }).unique().notNull(),
//   name: varchar("name", { length: 100 }).notNull(),
//   created_at: timestamp("created_at").defaultNow().notNull(),
//   updated_at: timestamp("updated_at").defaultNow().notNull(),
// })

const betterAuthFields = toBetterAuth(User.Model);
// {
//   email: { type: "string", required: true, unique: true, returned: true, input: true },
//   name: { type: "string", required: true, returned: true, input: true },
//   createdAt: { type: "date", required: false, returned: true, input: false },
//   updatedAt: { type: "date", required: false, returned: true, input: false },
// }
```

---

## 10. Design Decisions Summary

| Decision                           | Rationale                                                                    |
|------------------------------------|------------------------------------------------------------------------------|
| DSL.Model IS an Effect Schema      | Enables `S.decode()`, composability, Effect ecosystem integration            |
| Driver-agnostic column metadata    | Domain stays clean, future drivers without Model changes                     |
| Adapter functions (not methods)    | Separation of concerns, tree-shakeable, no circular dependencies             |
| Extends VariantSchema.Class        | Reuse battle-tested 6-variant infrastructure                                 |
| Anonymous class extension          | Consistent with EntityId, LiteralKit patterns in codebase                    |
| `const` type parameter on Fields   | Preserve literal types for column inference                                  |
| Symbol-keyed annotations           | Type-safe metadata via module augmentation                                   |
| `annotations()` override           | Preserves static properties through chaining                                 |
| Namespace exports (`User.Model`)   | Domain entities exported as namespaces via `export * as User from "./User"`  |
| `_rowId` as PRIMARY KEY (not `id`) | `id` is public UUID with default; `_rowId` is internal serial auto-increment |
| `autoIncrement` in ColumnDef       | Supports pg.serial for `_rowId` primary keys                                 |
| `"integer"` ColumnType             | Maps to pg.integer or pg.serial (when autoIncrement: true)                   |

---

*Document created: 2025-12-26*
*Status: Ready for implementation*
