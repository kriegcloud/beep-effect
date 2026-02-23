# DSL.Model - Effect Schema with SQL Metadata

## Goal

Design and research a `DSL.Model` factory that creates **Effect Schemas** exposing **driver-agnostic SQL metadata** as static properties. The Model must BE a proper Effect Schema (usable with `S.decode()`) while providing generic column definitions that can be transformed to various database drivers via separate adapter functions.

---

## The Pattern

`DSL.Model` extends `VariantSchema.Class` from `packages/common/schema/src/core/VariantSchema.ts` and exposes metadata as static properties - following the same pattern as `S.Literal.literals`, `S.Union.members`, and `S.Struct.fields`.

### Desired API

```typescript
import { DSL } from "@beep/schema";
import * as S from "effect/Schema";

// Define a model with generic column metadata
export class AccountModel extends DSL.Model<AccountModel>("Account")({
  id: DSL.Field(EntityId.AccountId, {
    column: { type: "uuid", primaryKey: true, defaultValue: "gen_random_uuid()" },
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

// ============ MUST work as a normal Effect Schema ============
const decodeAccount = S.decode(AccountModel);
const account = S.decodeSync(AccountModel)({ id: "...", email: "...", createdAt: "..." });

// Variant schemas (inherited from VariantSchema.Class)
AccountModel.insert   // Insert variant schema
AccountModel.update   // Update variant schema
AccountModel.json     // JSON variant schema

// ============ Generic static properties (driver-agnostic) ============
AccountModel.tableName    // "account" (snake-case)
AccountModel.columns      // { id: ColumnDef, email: ColumnDef, createdAt: ColumnDef }
AccountModel.primaryKey   // ["id"]
AccountModel.indexes      // []
AccountModel.identifier   // "Account" (original PascalCase)

// ============ Driver adapters (separate functions) ============
const drizzleTable = DSL.toDrizzle(AccountModel);       // Drizzle PgTable
const betterAuthFields = DSL.toBetterAuth(AccountModel); // better-auth config
const kyselyTable = DSL.toKysely(AccountModel);         // Future: Kysely
```

---

## Core Design Principles

### 1. DSL.Model IS an Effect Schema

The returned class must satisfy `S.Schema<Self, Encoded, R>`. All Schema methods work: `.pipe()`, `.annotations()`, `S.decode()`, etc.

### 2. Driver-Agnostic Column Metadata

Static properties expose **abstract types**, not driver-specific ones:

```typescript
type ColumnType =
  | "string"      // maps to: varchar, text, char
  | "number"      // maps to: integer, bigint, decimal
  | "boolean"
  | "date"        // date only
  | "datetime"    // timestamp with/without tz
  | "json"
  | "uuid"
  | "blob";

interface ColumnDef {
  readonly type: ColumnType;
  readonly primaryKey?: boolean;
  readonly unique?: boolean;
  readonly nullable?: boolean;
  readonly defaultValue?: string | (() => string);
  readonly maxLength?: number;
  readonly precision?: number;
  readonly scale?: number;
  readonly references?: {
    readonly table: string;
    readonly column: string;
    readonly onDelete?: "cascade" | "restrict" | "set null" | "no action";
  };
}
```

### 3. Adapter Pattern for Drivers

Driver-specific outputs are generated via separate utility functions:

```typescript
// packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts
export const toDrizzle = <M extends ModelSchemaInstance<any, any>>(model: M): PgTable;

// packages/common/schema/src/integrations/sql/dsl/adapters/better-auth.ts
export const toBetterAuth = <M extends ModelSchemaInstance<any, any>>(
  model: M
): Record<string, DBFieldAttribute>;
```

This keeps the domain clean and enables future drivers without modifying the Model.

### 4. Extends VariantSchema.Class

Reuse the existing 6-variant infrastructure: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`.

---

## Implementation Pattern

Based on exploration of EntityId, LiteralKit, and livestore patterns:

```typescript
export const Model = <Self>() =>
  <const Fields extends Record<string, DSLField<any, any, any>>>(
    identifier: string,
    fields: Fields
  ): ModelSchemaInstance<Self, Fields> => {
    // 1. Extract generic column definitions
    const columns = extractColumns(fields);
    const primaryKey = derivePrimaryKey(columns);

    // 2. Extract schema-only fields for VariantSchema
    const schemaFields = extractSchemaFields(fields);

    // 3. Create base class via VariantSchema.Class
    const BaseClass = VariantSchema.Class<Self>(identifier)(schemaFields);

    // 4. Return extended class with static properties
    return class ModelClass extends BaseClass {
      static readonly tableName = toSnakeCase(identifier);
      static readonly columns = columns;
      static readonly primaryKey = primaryKey;
      static readonly indexes = [] as readonly IndexDef[];
      static readonly identifier = identifier;

      static override annotations(annotations: S.Annotations.Schema<Self>) {
        return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations));
      }
    } as typeof BaseClass & {
      readonly tableName: string;
      readonly columns: typeof columns;
      readonly primaryKey: readonly string[];
      readonly indexes: readonly IndexDef[];
      readonly identifier: string;
    };
  };
```

Key patterns:
- **Anonymous class extension** with type intersection for static properties
- **`const` type parameter** on Fields to preserve literal types
- **Override `annotations()`** to preserve static properties through chaining
- **Symbol-keyed annotations** on field schemas for metadata storage

---

## Reference Patterns in Codebase

| Pattern | Location | What to Study |
|---------|----------|---------------|
| EntityId static exposure | `packages/common/schema/src/identity/entity-id/entity-id.ts` | `.tableName`, `.publicId()`, `.privateId()` statics |
| LiteralKit pattern | `packages/common/schema/src/derived/kits/string-literal-kit.ts` | `.Options`, `.Enum`, `.is` statics, `annotations()` override |
| VariantSchema.Class | `packages/common/schema/src/core/VariantSchema.ts` | Base class factory, 6 variants, Field handling |
| Model.Class | `packages/common/schema/src/integrations/sql/Model.ts` | SQL extensions, `M.Generated`, `M.Sensitive` |
| Table factories | `packages/shared/tables/src/Table/Table.ts` | Drizzle table creation patterns |
| better-auth types | `tmp/better-auth/packages/better-auth/src/db/core/types.ts` | DBFieldAttribute, 6 field types |
| Livestore DSL | `tmp/livestore/packages/@livestore/common/src/schema/state/sqlite/` | Two-layer DSL+AST, column factories |

---

## Target Outputs

### Drizzle (via `DSL.toDrizzle()`)

```typescript
// Input: AccountModel with columns
// Output: Drizzle PgTable
pgTable("account", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Better-Auth (via `DSL.toBetterAuth()`)

```typescript
// Input: AccountModel with columns
// Output: Record<string, DBFieldAttribute>
{
  email: { type: "string", required: true, unique: true, returned: true },
  createdAt: { type: "date", required: false, returned: true },
}
```

Type mapping (better-auth supports only 6 types):
- `"string"` → `"string"`
- `"number"` → `"number"`
- `"boolean"` → `"boolean"`
- `"datetime"` / `"date"` → `"date"`
- `"json"` → `"json"` or `"array"`
- `"uuid"` → `"string"`

---

## Research Questions

1. **AST Introspection**: How to extract type information from wrapped schemas like `M.Generated(S.String)` or branded types?

2. **Default Value Handling**: How should `defaultValue: "gen_random_uuid()"` translate to Drizzle's `.defaultRandom()` vs `.default(sql\`...\`)`?

3. **Type Inference**: How to infer `ColumnType` from an Effect Schema when no explicit `column.type` is provided?

4. **Variant Mapping**: How do VariantSchema variants map to better-auth's `input: true/false`, `returned: true/false`?

5. **Index Definition**: How should compound indexes and named indexes be specified in the DSL?

---

## Module Structure

```
packages/common/schema/src/integrations/sql/dsl/
├── Model.ts           # DSL.Model factory
├── Field.ts           # DSL.Field combinator
├── types.ts           # ColumnDef, ColumnType, IndexDef, FieldConfig
├── inference.ts       # Schema → ColumnType inference
├── adapters/
│   ├── drizzle.ts     # toDrizzle(Model) → PgTable
│   ├── better-auth.ts # toBetterAuth(Model) → DBFieldAttribute
│   └── index.ts
└── index.ts           # Public exports
```

---

## Success Criteria

- [ ] `S.decode(Model)` works - Model IS an Effect Schema
- [ ] All VariantSchema variants preserved (`.insert`, `.update`, `.json`, etc.)
- [ ] Generic static properties: `.tableName`, `.columns`, `.primaryKey`, `.indexes`
- [ ] `DSL.toDrizzle(Model)` produces valid Drizzle PgTable
- [ ] `DSL.toBetterAuth(Model)` produces valid better-auth field config
- [ ] Type inference preserves field literal types via `const` type parameter
- [ ] `.annotations()` chaining preserves static properties
- [ ] No driver-specific types leak into the core Model interface
