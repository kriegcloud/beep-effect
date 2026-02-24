# Better-Auth Database Abstraction System - Research Report

## Alignment Notes

> **This section documents how this research aligns with the DSL.Model design spec (`.specs/dsl-model/dsl-model.original.md`).**

### How This Research Supports the Adapter Pattern

This research informs the `DSL.toBetterAuth(Model)` adapter:

1. **`toBetterAuth()` is a pure transformation function** - The adapter receives a `DSL.Model` with generic `ColumnDef` metadata and produces `Record<string, DBFieldAttribute>` for better-auth's `additionalFields` config.

2. **Better-auth's 6 types map from our 8 `ColumnType` values** - The adapter must perform this narrowing:
   - `ColumnType.string` → `DBFieldType: "string"`
   - `ColumnType.uuid` → `DBFieldType: "string"` (better-auth has no UUID type)
   - `ColumnType.number` → `DBFieldType: "number"`
   - `ColumnType.boolean` → `DBFieldType: "boolean"`
   - `ColumnType.date` → `DBFieldType: "date"`
   - `ColumnType.datetime` → `DBFieldType: "date"`
   - `ColumnType.json` → `DBFieldType: "json"`
   - `ColumnType.blob` → Not supported (error or fallback to "string")

3. **Variant mapping informs better-auth's `input`/`returned` flags** - The adapter should derive:
   - `input: true/false` from whether the field is in the `insert` variant
   - `returned: true/false` from whether the field is in the `select` variant (or a custom `output` annotation)

### What Belongs in Adapters vs Core Model

| Concern | Location | Example |
|---------|----------|---------|
| Generic column type | **Core Model** (`ColumnDef`) | `type: "datetime"`, `type: "uuid"` |
| Nullability, uniqueness | **Core Model** (`ColumnDef`) | `nullable: false`, `unique: true` |
| Variant membership | **Core Model** (VariantSchema) | `variants: { insert: "omit" }` |
| `DBFieldType` narrowing | **Adapter** (`toBetterAuth`) | `"datetime"` → `"date"` |
| `input`/`returned` derivation | **Adapter** (`toBetterAuth`) | From variant config |
| `references` transformation | **Adapter** (`toBetterAuth`) | `{ model: "user", field: "id", onDelete: "cascade" }` |
| Transform functions | **Adapter** (`toBetterAuth`) | `transform: { input, output }` |

### Type Mappings from ColumnType to Better-Auth

Based on section 4 research, the `toBetterAuth()` adapter should implement:

```typescript
// packages/common/schema/src/integrations/sql/dsl/adapters/better-auth.ts

import type { DBFieldType, DBFieldAttribute } from "better-auth";

const columnTypeToBetterAuth: Record<ColumnType, DBFieldType> = {
  string:   "string",
  uuid:     "string",      // No UUID type in better-auth
  number:   "number",
  boolean:  "boolean",
  date:     "date",
  datetime: "date",        // No datetime distinction
  json:     "json",
  blob:     "string",      // Fallback - consider erroring instead
};

// Derive better-auth field config from DSL.Model column metadata
const toDBFieldAttribute = (
  fieldName: string,
  def: ColumnDef,
  variants: VariantConfig
): DBFieldAttribute => ({
  type: columnTypeToBetterAuth[def.type],
  required: !def.nullable && variants.insert !== "omit",
  returned: variants.select !== "omit",
  input: variants.insert !== "omit",
  unique: def.unique ?? false,
  fieldName: toSnakeCase(fieldName),  // Column name mapping
  references: def.references ? {
    model: def.references.table,
    field: def.references.column,
    onDelete: def.references.onDelete ?? "no action",
  } : undefined,
});
```

### Key Research Insights for DSL.Model

1. **Section 2.3 (Plugin Schemas)**: Better-auth plugins can add fields to existing tables. This confirms that `toBetterAuth(Model)` output is composable with better-auth's schema merging.

2. **Section 6 (Field Visibility)**: The `input`/`returned` flags map directly to our variant system:
   - `variants: { insert: "omit" }` → `input: false`
   - `variants: { select: "omit" }` → `returned: false`

3. **Section 3 (additionalFields Pattern)**: This is the primary integration point. `DSL.toBetterAuth(Model)` should produce output that can be passed directly to `betterAuth({ user: { additionalFields: ... } })`.

4. **Section 7 (Limitations)**: Better-auth's limited type system (6 types) means our richer `ColumnType` (8 types) must be narrowed. The adapter handles this loss of fidelity.

### What NOT to Build into DSL.Model

The following better-auth concerns are adapter-only:

- `DBFieldType` union - better-auth specific, not part of `ColumnType`
- `transform.input`/`transform.output` - async functions for better-auth runtime
- `validator` (StandardSchemaV1) - better-auth's validation, we use Effect Schema
- `sortable` flag - Drizzle-specific (varchar vs text for indexes)
- `bigint` flag - Can be inferred from schema or explicit in adapter

---

## Overview

This report analyzes the better-auth repository's database abstraction and schema configuration system, focusing on how it maps schemas to different ORMs and the limitations relevant to beep-effect's DSL goals.

---

## 1. Core Type System

**Location**: `/packages/core/src/db/type.ts`

### DBFieldType

Better-auth supports a limited set of field types:

```typescript
export type DBFieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "json"
  | `${"string" | "number"}[]`
  | Array<LiteralString>;  // Enum types as string literals
```

**Limitation**: This union is intentionally narrow. It cannot express:
- Specific string subtypes (email, URL, UUID without explicit validation)
- Integer vs float distinctions
- Custom scalar types
- Union types or complex discriminated unions
- Branded/opaque types

### DBFieldAttributeConfig

The core field metadata structure provides:

```typescript
{
  required?: boolean;           // defaults to true
  returned?: boolean;           // defaults to true (output visibility)
  input?: boolean;              // defaults to true (input acceptance)
  defaultValue?: DBPrimitive | (() => DBPrimitive);
  onUpdate?: () => DBPrimitive; // DB-level trigger
  transform?: {
    input?: (value) => Awaitable<DBPrimitive>;
    output?: (value) => Awaitable<DBPrimitive>;
  };
  references?: {
    model: string;
    field: string;
    onDelete: "no action" | "restrict" | "cascade" | "set null" | "set default";
  };
  unique?: boolean;
  bigint?: boolean;
  validator?: {
    input?: StandardSchemaV1;
    output?: StandardSchemaV1;
  };
  fieldName?: string;           // database column name mapping
  sortable?: boolean;           // marks varchar instead of text
  index?: boolean;
}
```

**Strengths**:
- Separates DB-level metadata (fieldName, unique, index) from business logic
- Supports transforms and validators
- Handles foreign key relationships
- Distinguishes input/output visibility (marked as `returned`)

**Limitations**:
- Cannot express nullable vs optional distinction at schema level
- `fieldName` mapping is string-only (no query builder primitives)
- No support for computed/derived fields
- Validators use StandardSchemaV1 (not type-safe in TypeScript)
- Cannot express field dependencies or conditional requirements

---

## 2. Schema Composition Architecture

**Location**: `/packages/core/src/db/get-tables.ts`

Better-auth builds composite schemas from three sources:

### 2.1 Base Tables (hardcoded in getAuthTables)

- `user` table with standard fields (email, name, emailVerified, image, createdAt, updatedAt)
- `session` table with auth fields (token, expiresAt, userAgent, ipAddress, userId)
- `account` table for OAuth providers
- `verification` table for email verification
- `rateLimit` table (optional, if storage="database")

### 2.2 Additional Fields (from BetterAuthOptions)

```typescript
options.user?.additionalFields?: Record<string, DBFieldAttribute>
options.session?.additionalFields?: Record<string, DBFieldAttribute>
options.account?.additionalFields?: Record<string, DBFieldAttribute>
options.verification?.additionalFields?: Record<string, DBFieldAttribute>
```

These merge into the base table fields using object spread:
```typescript
fields: {
  ...baseFields,
  ...options.user?.additionalFields,
}
```

### 2.3 Plugin Schemas (from BetterAuthOptions.plugins)

```typescript
BetterAuthPluginDBSchema = {
  [table: string]: {
    fields: Record<string, DBFieldAttribute>;
    modelName?: string;
    disableMigration?: boolean;
  };
}
```

Plugins can:
- Add fields to existing tables (merges into `user`, `session`, `account`, `verification`)
- Create entirely new tables (stored as `pluginTables`)
- Override model names

**Schema Merging Algorithm**:
```typescript
// For each plugin:
schema[table].fields = {
  ...schema[table].fields,
  ...plugin.schema[table].fields,  // Plugin fields override base
}
```

**Limitation**: This is a shallow merge. No conflict detection or composition hooks.

---

## 3. The "additionalFields" Pattern

### Usage Context

The `additionalFields` pattern is the primary extension mechanism for end-users. It allows adding custom fields to built-in tables without forking the library.

```typescript
const auth = betterAuth({
  user: {
    additionalFields: {
      department: {
        type: "string",
        required: true,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
      },
      metadata: {
        type: "json",
        defaultValue: () => ({}),
      },
    },
  },
});
```

### Type Inference

**Location**: `/packages/better-auth/src/db/field.ts`

```typescript
export type InferAdditionalFieldsFromPluginOptions<
  SchemaName extends string,
  Options extends { schema?: { [key]: { additionalFields?: Record<string, DBFieldAttribute> } } },
  isClientSide extends boolean = true
> = Options["schema"] extends { [key]: { additionalFields: infer Field } }
  ? isClientSide extends true
    ? FieldAttributeToObject<RemoveFieldsWithInputFalse<Field>>
    : FieldAttributeToObject<Field>
  : {};
```

This enables TypeScript inference of the extended type without casting.

### Limitations

- No validation at configuration time (only at runtime during parse)
- Cannot reference other fields (e.g., "department must exist if role='manager'")
- No cross-table constraints
- Default values only - no computed fields
- Field ordering is non-deterministic (object spread)

---

## 4. Database Type Mapping & Code Generation

### ORM Adapters Supported

- Drizzle ORM (pg, mysql, sqlite)
- Prisma (sqlite, postgresql, mysql, mongodb)
- Kysely (postgresql, mysql, sqlite, mssql)
- Custom adapters via factory pattern

### Drizzle Code Generation

**Location**: `/packages/cli/src/generators/drizzle.ts`

The CLI generates TypeScript Drizzle schemas by mapping DBFieldType to ORM calls:

```typescript
const typeMap = {
  string: {
    sqlite: `text('${name}')`,
    pg: `text('${name}')`,
    mysql: `varchar('${name}', { length: 255 })`,  // if unique/index
  },
  number: {
    sqlite: `integer('${name}')`,
    pg: field.bigint ? `bigint('${name}', { mode: 'number' })` : `integer('${name}')`,
    mysql: field.bigint ? `bigint('${name}', { mode: 'number' })` : `int('${name}')`,
  },
  boolean: {
    sqlite: `integer('${name}', { mode: 'boolean' })`,
    pg: `boolean('${name}')`,
    mysql: `boolean('${name}')`,
  },
  date: {
    sqlite: `integer('${name}', { mode: 'timestamp_ms' })`,
    pg: `timestamp('${name}')`,
    mysql: `timestamp('${name}', { fsp: 3 })`,
  },
  "string[]": {
    sqlite: `text('${name}', { mode: "json" })`,
    pg: `text('${name}').array()`,  // native arrays
    mysql: `text('${name}', { mode: 'json' })`,
  },
  json: {
    sqlite: `text('${name}', { mode: "json" })`,
    pg: `jsonb('${name}')`,
    mysql: `text('${name}', { mode: 'json' })`,
  },
};
```

### Prisma Code Generation

**Location**: `/packages/cli/src/generators/prisma.ts`

Similar mapping but to Prisma types:
```typescript
string → String (mapped to varchar for MySQL with length 255)
number → Int or BigInt (if bigint=true)
boolean → Boolean
date → DateTime
json → Json (or String for sqlite/mysql)
string[] → String[] (or String for sqlite/mysql)
```

---

## 5. Adapter Factory Pattern

**Location**: `/packages/core/src/db/adapter/factory.ts`

The `createAdapterFactory` function provides helpers that all adapters use:

```typescript
{
  getModelName(model: string): string;
  getFieldName(model, field): string;
  getDefaultModelName(model: string): string;
  getDefaultFieldName(model, field): string;
  getFieldAttributes(model, field): DBFieldAttribute;
  transformInput(data, model, action): Promise<Record<string, any>>;
  transformOutput(data, model, select, join): Promise<Record<string, any>>;
}
```

### Transform Input Flow (lines 200-290)

1. Apply defaultValue if field is missing
2. Apply custom field transform.input if present
3. Convert types based on adapter capabilities:
   - JSON → string if adapter.supportsJSON === false
   - Arrays → JSON string if adapter.supportsArrays === false
   - Dates → ISO string if adapter.supportsDates === false
   - Booleans → 1/0 if adapter.supportsBooleans === false
4. Apply custom adapter.customTransformInput hook
5. Map field names using fieldName metadata

### Transform Output Flow (lines 294+)

- Reverse field name mapping (DBField → model field)
- Apply field transform.output
- Filter by `returned: false` fields (don't include in response)
- Support joined relations

### Adapter Configuration

```typescript
interface AdapterFactoryConfig {
  adapterId: string;
  supportsBooleans?: boolean;       // defaults true
  supportsDates?: boolean;          // defaults true
  supportsJSON?: boolean;           // defaults false
  supportsUUIDs?: boolean;          // defaults false
  supportsNumericIds?: boolean;     // defaults true
  supportsArrays?: boolean;         // defaults false
  transaction?: false | TransactionFn;
  disableTransformInput?: boolean;
  disableTransformOutput?: boolean;
  disableTransformJoin?: boolean;
}
```

---

## 6. Field Visibility & Permission System

### Returned vs Input Flags

```typescript
{
  input: false,      // User cannot provide this field
  returned: false,   // Field not included in API responses
  required: true,    // Must exist on create
}
```

### Use Cases

- `input: false, returned: true, defaultValue: "value"` → System-generated, visible (e.g., emailVerified)
- `input: false, returned: false, defaultValue: fn` → Internal only (e.g., password hash)
- `input: true, returned: false` → Accept input but don't return (rare)

---

## 7. Limitations & Design Constraints

### Type Expressiveness Issues

1. **No union types**: Cannot express discriminated unions at field level
2. **No references to field types**: "If X then Y must be..." patterns impossible
3. **No computed fields**: derived values must be done in application code
4. **Array limitations**: Only string[] and number[], not custom types
5. **Enum handling**: Enums stored as string literals in type union (not enum-like)

### Schema Composition Issues

1. **Shallow merging**: No conflict detection between base + additional + plugin fields
2. **Field ordering**: Spread operator makes ordering non-deterministic
3. **No hooks**: Plugins have no way to intercept schema composition
4. **No schema inheritance**: Each plugin must define its own complete tables

### Runtime Limitations

1. **Validation only at parse time**: No schema-time validation
2. **No cascading defaults**: Default values can't reference other fields
3. **Transform is async but one-way**: No bidirectional serialization for complex types
4. **FieldName mapping is string-only**: No programmatic column mapping

---

## 8. Comparison with beep-effect Needs

### Feature Comparison

| Feature | Better-auth | beep-effect needed? |
|---------|-------------|-------------------|
| Field type variability | Limited (6 types) | Yes - more granularity |
| Cross-field constraints | None | Yes - linked data validation |
| Computed fields | None | Yes - derived properties |
| Union types | None | Yes - discriminated unions |
| Branded types | None | Yes - Entity IDs, UUIDs |
| Schema composition hooks | None | Yes - plugin coordination |
| Type-safe validators | StandardSchemaV1 | Yes - Effect Schema |
| Conditional fields | None | Yes - feature flags |
| Audit fields | Manual spread | Yes - automated |
| Multi-tenant support | None | Yes - per-schema tenant keys |

### Code Generation Gaps

Better-auth's CLI generates raw SQL/ORM. Beep-effect could generate:
- Effect-based validators
- Type-safe query builders (not just model names)
- Audit logging wrappers
- Tenant isolation layers
- Migration helpers with rollback semantics

---

## 9. Key Files Reference

| File | Purpose |
|------|---------|
| `packages/core/src/db/type.ts` | Core type definitions |
| `packages/core/src/db/get-tables.ts` | Schema composition |
| `packages/core/src/db/adapter/factory.ts` | Adapter factory helpers |
| `packages/cli/src/generators/drizzle.ts` | Drizzle code generation |
| `packages/cli/src/generators/prisma.ts` | Prisma code generation |
| `packages/better-auth/src/db/field.ts` | Field type inference |

---

## Summary

Better-auth provides a pragmatic, type-light database abstraction:

**Strengths**:
- Simple to extend via additionalFields
- Broad ORM support (Drizzle, Prisma, Kysely)
- Field-level metadata (required, returned, input, transform)
- Working code generation for multiple databases

**Weaknesses**:
- Limited type expressiveness (6 basic types)
- No schema composition hooks
- Weak validation (StandardSchemaV1 not type-safe)
- No support for branded types, unions, or computed fields

**Key Insight for beep-effect**: Better-auth succeeds because it accepts field types as simple unions and delegates ORM-specific handling to code generators. A DSL should do likewise but leverage **Effect's type system** to gain more expressiveness without ORM-specific coupling.
