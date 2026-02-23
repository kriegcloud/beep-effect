# Drizzle-Effect & Schema Transformation Research Report

## Alignment Notes

> **This section documents how this research aligns with the DSL.Model design spec (`.specs/dsl-model/dsl-model.original.md`).**

### How This Research Supports the Adapter Pattern

This research demonstrates that:

1. **`toDrizzle()` is a pure transformation function** - The drizzle-effect library shows that Drizzle columns contain rich metadata (`dataType`, `notNull`, `hasDefault`, `enumValues`, `length`). Our `DSL.toDrizzle(Model)` adapter will need to generate these column constructors from the generic `ColumnDef` metadata stored on the Model.

2. **Type mapping is the adapter's responsibility** - The `drizzleToEffectMapping` table in section 1.3 shows the reverse direction (Drizzle → Effect). Our adapter must implement the forward direction:
   - `ColumnType.uuid` → `pg.uuid(name).primaryKey().defaultRandom()`
   - `ColumnType.string` + `maxLength` → `pg.varchar(name, { length })`
   - `ColumnType.datetime` → `pg.timestamp(name)`

3. **No Drizzle types leak into DSL.Model** - The Model exposes only `ColumnDef` with abstract types. The adapter imports `drizzle-orm/pg-core` and produces `PgTable` - these types never appear in the core Model interface.

### What Belongs in Adapters vs Core Model

| Concern | Location | Example |
|---------|----------|---------|
| Abstract column types | **Core Model** (`ColumnDef`) | `type: "uuid"`, `type: "string"` |
| Column constraints | **Core Model** (`ColumnDef`) | `primaryKey: true`, `unique: true`, `maxLength: 255` |
| Default value expressions | **Core Model** (`ColumnDef`) | `defaultValue: "gen_random_uuid()"` |
| Driver column constructors | **Adapter** (`toDrizzle`) | `pg.uuid()`, `pg.varchar()`, `pg.timestamp()` |
| Driver-specific modes | **Adapter** (`toDrizzle`) | `{ mode: 'timestamp_ms' }`, `.array()` |
| Driver method chaining | **Adapter** (`toDrizzle`) | `.notNull().unique().default(sql\`...\`)` |

### Type Mappings from ColumnType to Drizzle

Based on the research in section 1.3, the `toDrizzle()` adapter should implement:

```typescript
// packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts

const columnTypeToDrizzle: Record<ColumnType, (name: string, def: ColumnDef) => PgColumn> = {
  uuid:     (name, def) => pg.uuid(name),
  string:   (name, def) => def.maxLength ? pg.varchar(name, { length: def.maxLength }) : pg.text(name),
  number:   (name, def) => pg.integer(name),  // Could check for bigint annotation
  boolean:  (name, def) => pg.boolean(name),
  date:     (name, def) => pg.date(name),
  datetime: (name, def) => pg.timestamp(name),
  json:     (name, def) => pg.jsonb(name),
  blob:     (name, def) => pg.bytea(name),
};

// Constraint application is adapter logic, not Model logic
const applyConstraints = (col: PgColumn, def: ColumnDef): PgColumn => {
  if (def.primaryKey) col = col.primaryKey();
  if (!def.nullable) col = col.notNull();
  if (def.unique) col = col.unique();
  if (def.defaultValue) col = col.default(sql`${def.defaultValue}`);
  return col;
};
```

### Recommendations Section Alignment

**Note**: The recommendations in section 5 predate the finalized DSL.Model spec. The chosen approach is:

- **NOT "Annotation-Based Enhancement"** (5.1) - The spec uses `DSL.Field()` with explicit column metadata, not annotations on existing schemas
- **NOT "Code Generation Pipeline"** (5.3) - The spec produces Drizzle tables at runtime via `toDrizzle()`, not at build time
- **YES, similar to "DSL Layer"** (5.2) - But simplified: `DSL.Model` IS the schema AND has metadata; no separate `DSL.define()` producing both model and table

---

## Overview

This report analyzes the drizzle-effect library and related schema transformation approaches, focusing on how they can inform the design of a Model.Class → Drizzle/better-auth transformation layer.

---

## 1. Drizzle-Effect Library Analysis

### 1.1 Purpose & Direction

The [@handfish/drizzle-effect](https://www.npmjs.com/package/@handfish/drizzle-effect) package derives Effect Schemas **FROM** Drizzle tables. This is the **opposite direction** of what beep-effect needs (Model.Class → Drizzle).

**GitHub**: https://github.com/Handfish/drizzle-effect

### 1.2 Type Information Extracted

drizzle-effect uses `getTableColumns()` to extract these properties from Drizzle columns:

```typescript
interface DrizzleColumnInfo {
  dataType: string;      // "string" | "number" | "bigint" | "boolean" | "date" | "json" | "custom"
  notNull: boolean;      // Whether column allows NULL
  hasDefault: boolean;   // Whether column has default value
  enumValues?: string[]; // For enum types
  length?: number;       // For string columns (varchar)
  columnType: string;    // PostgreSQL-specific (e.g., "PgUUID", "PgArray")
  mode?: string;         // For date columns
}
```

### 1.3 Column Type Mapping (Drizzle → Effect)

```typescript
// From drizzle-effect/src/index.ts

const drizzleToEffectMapping = {
  // UUID
  "PgUUID": () => S.UUID,

  // Arrays
  "PgArray": (innerType) => S.Array(mapType(innerType)),

  // BigInt
  "bigint": () => S.BigIntFromSelf,

  // String with length constraint
  "string": (length) => length
    ? S.String.pipe(S.maxLength(length))
    : S.String,

  // JSON (recursive union type)
  "json": () => JsonValue, // Union of primitives, arrays, objects

  // Enums
  "enum": (values) => S.Literal(...values),

  // Boolean
  "boolean": () => S.Boolean,

  // Number
  "number": () => S.Number,

  // Date
  "date": () => S.Date,
};
```

### 1.4 Schema Generation Pattern

```typescript
// Simplified from drizzle-effect

export const createSelectSchema = <T extends Table>(table: T) => {
  const columns = getTableColumns(table);

  const fields = Object.entries(columns).reduce((acc, [name, column]) => {
    let schema = mapColumnToSchema(column);

    // Handle nullability
    if (!column.notNull) {
      schema = S.NullOr(schema);
    }

    // Handle optionality (columns with defaults in select are optional)
    if (column.hasDefault) {
      schema = S.optional(schema);
    }

    return { ...acc, [name]: schema };
  }, {});

  return S.Struct(fields);
};

export const createInsertSchema = <T extends Table>(table: T) => {
  const columns = getTableColumns(table);

  const fields = Object.entries(columns).reduce((acc, [name, column]) => {
    let schema = mapColumnToSchema(column);

    if (!column.notNull) {
      schema = S.NullOr(schema);
    }

    // Columns with defaults are optional on insert
    if (column.hasDefault || !column.notNull) {
      schema = S.optional(schema);
    }

    return { ...acc, [name]: schema };
  }, {});

  return S.Struct(fields);
};
```

---

## 2. Reversing the Transformation

### 2.1 Challenges

Reversing the transformation (Effect → Drizzle) faces significant obstacles:

1. **SQL Metadata Loss**: Effect schemas don't naturally capture:
   - varchar lengths
   - Database indexes
   - Foreign key constraints
   - Check constraints
   - Default SQL expressions

2. **Brand Disambiguation**:
   ```typescript
   // How do we know UserId should be varchar vs uuid vs integer?
   S.String.pipe(S.brand("UserId"))
   ```

3. **Refinement Semantics**:
   ```typescript
   // No DDL equivalent for runtime validation
   S.String.pipe(S.pattern(/@/))
   ```

4. **Type-Level Complexity**: Drizzle's type system expects specific column constructor returns; building from Effect AST requires complex type inference

### 2.2 Viable Approaches

#### Approach 1: Annotation-Based

Add SQL metadata as Schema annotations:

```typescript
const SqlColumn = Symbol.for("@beep/schema/SqlColumn");

const EmailField = S.String.pipe(
  S.pattern(/@/),
  S.annotations({
    [SqlColumn]: {
      type: "varchar",
      length: 255,
      unique: true,
      index: true,
    }
  })
);

// Transformation reads annotations
const toDrizzleColumn = (schema: S.Schema.Any, name: string) => {
  const config = getAnnotation(schema.ast, SqlColumn);

  if (config?.type === "varchar") {
    return pg.varchar(name, { length: config.length ?? 255 });
  }
  // ... etc
};
```

**Pros**:
- Type-safe at definition time
- Collocated with schema definition
- Extensible

**Cons**:
- Verbose
- Easy to forget annotations
- Doesn't compose with existing schemas

#### Approach 2: Code Generation

Parse Effect Schema source at build time → Generate Drizzle TypeScript:

```typescript
// Input: packages/shared/domain/src/entities/User.model.ts
export class Model extends M.Class<Model>("User")({
  id: M.Generated(S.String),
  email: S.String.pipe(S.pattern(/@/)),
  name: S.String,
});

// Generated: packages/shared/tables/src/tables/user.generated.ts
export const user = pgTable("user", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name").notNull(),
});
```

**Pros**:
- No runtime overhead
- Can use heuristics for type mapping
- Avoids type-level complexity

**Cons**:
- Build step required
- Source parsing is fragile
- Generated code diverges from source

#### Approach 3: DSL Intermediate Layer

Define a DSL that captures both Effect Schema and SQL concerns:

```typescript
const UserFields = DSL.define({
  id: DSL.field(S.String, {
    sql: { type: "uuid", primaryKey: true, default: "gen_random_uuid()" },
    variants: { insert: "omit", select: "required" },
  }),
  email: DSL.field(S.String.pipe(S.pattern(/@/)), {
    sql: { type: "varchar", length: 255, unique: true },
    variants: { insert: "required", select: "required" },
  }),
});``

// Generate both
const UserModel = DSL.toModel(UserFields);
const userTable = DSL.toDrizzle(UserFields);
const betterAuthFields = DSL.toBetterAuth(UserFields);
```

**Pros**:
- Single source of truth
- Full control over both sides
- Can validate consistency

**Cons**:
- New abstraction to learn
- Doesn't reuse existing Model.Class definitions
- Migration effort for existing code

---

## 3. Related Ecosystem

### 3.1 Similar Libraries

| Library | Direction | Schema System |
|---------|-----------|---------------|
| drizzle-effect | Drizzle → Effect | Effect Schema |
| drizzle-zod | Drizzle → Zod | Zod |
| drizzle-valibot | Drizzle → Valibot | Valibot |
| prisma-zod-generator | Prisma → Zod | Zod |
| zod-prisma | Prisma → Zod | Zod |

**Pattern**: All ecosystem libraries derive validators FROM ORMs, not the reverse.

### 3.2 Effect Team Position

From [Effect-TS/effect#3208](https://github.com/Effect-TS/effect/issues/3208):

> "We're interested in an official drizzle-schema package but waiting for Drizzle team's decision on [PR #2665](https://github.com/drizzle-team/drizzle-orm/pull/2665)"

The PR by arekmaz has been stalled since July 2024 with no Drizzle team response.

---

## 4. Type Safety Considerations

### 4.1 Preserving Type Information

The core challenge is preserving type information through transformation:

```typescript
// Effect Schema type
type User = {
  id: string;
  email: string & Brand<"Email">;
  age: number;
}

// Drizzle table type
type UserTable = {
  id: PgColumn<{ data: string; ... }>;
  email: PgColumn<{ data: string; ... }>; // Brand lost!
  age: PgColumn<{ data: number; ... }>;
}

// Insert type derived from table
type UserInsert = typeof userTable.$inferInsert;
// { id?: string; email: string; age: number }
// No brand, no runtime validation!
```

### 4.2 Type-Safe Round-Trip

To maintain type safety through transformation:

```typescript
// 1. Define canonical type with Model.Class
class UserModel extends M.Class<UserModel>("User")({
  id: M.Generated(UserId),
  email: Email,
  age: S.Int,
}) {}

// 2. Generate table with type link
const userTable = generateTable(UserModel);

// 3. Insert schema uses Model.Class insert variant
type UserInsert = typeof UserModel.insert.Type;
// Preserves: UserId brand, Email brand, Int refinement

// 4. Query results validated through Model.Class select variant
const users = await db.select().from(userTable);
const validated = users.map((row) => S.decodeSync(UserModel)(row));
```

---

## 5. Recommendations for beep-effect

### 5.1 Short-Term: Annotation-Based Enhancement

Enhance existing Model.Class with SQL annotations:

```typescript
// packages/common/schema/src/annotations/sql.ts
export const SqlColumn = Symbol.for("@beep/schema/SqlColumn");

export interface SqlColumnConfig {
  columnName?: string;
  columnType?: "text" | "varchar" | "integer" | "bigint" | "boolean" | "timestamp" | "jsonb" | "uuid";
  length?: number;
  nullable?: boolean;
  unique?: boolean;
  primaryKey?: boolean;
  index?: boolean;
  default?: string | (() => string);
  references?: {
    table: string;
    column: string;
    onDelete?: "cascade" | "restrict" | "set null" | "no action";
  };
}

// Usage in field helpers
export const EmailField = S.String.pipe(
  S.pattern(/@/),
  S.annotations({
    [SqlColumn]: {
      columnType: "varchar",
      length: 255,
      unique: true,
    } satisfies SqlColumnConfig,
  })
);
```

### 5.2 Medium-Term: DSL Layer

Build a DSL that wraps Model.Class and adds SQL semantics:

```typescript
// packages/common/schema/src/integrations/sql/dsl/define.ts

export const defineEntity = <Fields extends Record<string, FieldDefinition>>(
  config: {
    name: string;
    entityId: EntityId.SchemaInstance<any, any>;
    fields: Fields;
  }
) => {
  // Returns:
  // - model: Model.Class with all variants
  // - table: Drizzle table definition
  // - betterAuth: additionalFields config
  // - repository: Type-safe CRUD operations
};
```

### 5.3 Long-Term: Code Generation Pipeline

Build tooling to:
1. Parse Model.Class definitions
2. Extract field metadata and annotations
3. Generate Drizzle table definitions
4. Generate better-auth field configs
5. Validate consistency at build time

---

## 6. Key Files Reference

| Resource | Location |
|----------|----------|
| drizzle-effect source | https://github.com/Handfish/drizzle-effect/blob/main/drizzle-effect/src/index.ts |
| Effect Schema docs | https://effect.website/docs/schema |
| Drizzle ORM docs | https://orm.drizzle.team/docs |
| better-auth schema | tmp/better-auth/packages/core/src/db/type.ts |
| beep-effect DSL types | packages/common/schema/src/integrations/sql/dsl/dsl.ts |

---

## Summary

The drizzle-effect library demonstrates that Drizzle → Effect Schema transformation is straightforward because Drizzle columns contain all necessary metadata. The reverse (Effect → Drizzle) is harder because Effect schemas focus on runtime validation, not database semantics.

**Key Insight**: A successful DSL must capture SQL metadata at schema definition time, either through:
1. Annotations on Effect schemas
2. A parallel DSL structure
3. Code generation from source

The beep-effect codebase already has the foundations (Model.Class, VariantSchema, EntityId) to build any of these approaches.
