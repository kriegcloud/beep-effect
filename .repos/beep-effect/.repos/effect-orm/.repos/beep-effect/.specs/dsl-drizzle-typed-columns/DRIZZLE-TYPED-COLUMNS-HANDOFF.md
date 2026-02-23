# DSL Drizzle Typed Columns - Handoff Document

## Status: Research & Implementation Required

This document describes a feature enhancement to the DSL.Model → Drizzle adapter that adds proper TypeScript types to generated columns and validates schema/column type compatibility.

---

## Objective

### 1. Add `.$type<T>()` to Drizzle Columns

When converting a DSL Model to a Drizzle table via `toDrizzle()`, the generated columns should include `.$type<T>()` calls that match the `S.Schema.Encoded` type of each field.

**Current behavior:**
```typescript
class Document extends Model<Document>("Document")({
  id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid", primaryKey: true } }),
  content: Field(S.String, { column: { type: "string" } }),
}) {}

const table = toDrizzle(Document);
// Produces: pg.uuid("id").primaryKey() - no type annotation
// Produces: pg.text("content").notNull() - no type annotation
```

**Desired behavior:**
```typescript
const table = toDrizzle(Document);
// Should produce equivalent to:
// pg.uuid("id").primaryKey().$type<string>()
// pg.text("content").notNull().$type<string>()
```

The generic passed to `.$type<T>()` should be `S.Schema.Encoded<typeof field>` so that the Drizzle table types match the Effect Schema encoded types.

### 2. Type-Level Schema/Column Compatibility Validation

Add compile-time validation that ensures column config types are compatible with schema types.

**Example of what should error:**
```typescript
class Document extends Model<Document>("Document")({
  content: Field(
    S.String,  // Schema encodes to string
    {
      column: { type: "number" } // ERROR: "number" column incompatible with string schema
    }
  ),
}) {}
```

**Example of valid usage:**
```typescript
class Document extends Model<Document>("Document")({
  content: Field(S.String, { column: { type: "string" } }),     // OK: string → text
  count: Field(S.Int, { column: { type: "integer" } }),         // OK: number → integer
  active: Field(S.Boolean, { column: { type: "boolean" } }),    // OK: boolean → boolean
  data: Field(S.Struct({ x: S.Number }), { column: { type: "json" } }), // OK: object → jsonb
}) {}
```

---

## Current Codebase Context

### Key Files

1. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`**
   - Contains `toDrizzle()` function that converts Model to Drizzle table
   - Currently generates columns without `.$type<T>()` annotations

2. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Defines `ColumnDef`, `ColumnType`, `DSLField`, `DSLVariantField`
   - Contains `DSL.Fields` namespace and variant extraction types

3. **`packages/common/schema/src/integrations/sql/dsl/Field.ts`**
   - `Field()` factory function that wraps schemas with column metadata

4. **`packages/common/schema/src/integrations/sql/dsl/Model.ts`**
   - `Model()` factory that creates typed model classes
   - `ExtractColumnsType` extracts column definitions from fields

### Current Type Definitions

```typescript
// From types.ts
export type ColumnType = "string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json";

export interface ColumnDef<
  T extends ColumnType = ColumnType,
  PK extends boolean = boolean,
  U extends boolean = boolean,
  N extends boolean = boolean,
  AI extends boolean = boolean,
> {
  readonly type: T;
  readonly primaryKey?: PK;
  readonly unique?: U;
  readonly nullable?: N;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AI;
}
```

### Current Drizzle Adapter

```typescript
// From adapters/drizzle.ts
const columnBuilder = <ColumnName extends string>(name: ColumnName, def: ColumnDef) => {
  // Creates pg.text, pg.integer, etc. based on def.type
  // Does NOT call .$type<T>()
};

export const toDrizzle = <...>(model: M): PgTableWithColumns<...> =>
  pg.pgTable(model.tableName, /* columns */);
```

---

## Research Tasks

### Task 1: Understand Drizzle's `.$type<T>()` API

Research how Drizzle's `.$type<T>()` works:
- What types does it accept?
- How does it affect the resulting table type?
- Does it work with all column types (text, integer, uuid, jsonb, etc.)?
- Are there any runtime implications or is it purely type-level?

**Resources:**
- Drizzle ORM documentation
- `drizzle-orm/pg-core` type definitions

### Task 2: Map Schema Encoded Types to Drizzle Column Types

Create a type-level mapping from Effect Schema encoded types to appropriate Drizzle column types:

| Schema Encoded Type | Compatible ColumnType(s) |
|---------------------|-------------------------|
| `string`            | `"string"`, `"uuid"`, `"datetime"` |
| `number`            | `"number"`, `"integer"` |
| `boolean`           | `"boolean"` |
| `object` / `array`  | `"json"` |
| `Date`              | `"datetime"` |

### Task 3: Design Type Compatibility Validation

Design a type-level validation system that:
1. Infers the `Encoded` type from a schema
2. Checks if the specified `ColumnType` is compatible
3. Produces a clear error message if incompatible

**Approaches to consider:**
- Conditional type that returns `never` or an error message type
- Branded type approach
- Using template literal types for error messages

---

## Implementation Tasks

### Task 1: Update `toDrizzle` to Include `.$type<T>()`

Modify the Drizzle adapter to:
1. Extract the encoded type from each field's schema
2. Call `.$type<EncodedType>()` on each column builder
3. Ensure the resulting table type reflects the proper field types

**Challenge:** The `.$type<T>()` method requires a type parameter at compile time. You'll need to:
- Either use type assertions with the correct types
- Or restructure the adapter to be more type-aware

### Task 2: Create Schema/Column Compatibility Types

Create types that validate compatibility:

```typescript
// Example approach
type SchemaEncodedToColumnTypes<Encoded> =
  Encoded extends string ? "string" | "uuid" | "datetime" :
  Encoded extends number ? "number" | "integer" :
  Encoded extends boolean ? "boolean" :
  Encoded extends object ? "json" :
  never;

type ValidateColumnType<Schema, CT extends ColumnType> =
  CT extends SchemaEncodedToColumnTypes<S.Schema.Encoded<Schema>>
    ? CT
    : `Error: Column type "${CT}" is incompatible with schema encoded type`;
```

### Task 3: Update Field Factory Signature

Update `Field()` to enforce type compatibility:

```typescript
export function Field<A, I, R, const C extends Partial<ColumnDef>>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig<C> & ValidateColumnConfig<I, C>  // Add validation
): DSLField<A, I, R, ExactColumnDef<C>>;
```

### Task 4: Update Tests

Add tests for:
1. `.$type<T>()` is correctly applied in `toDrizzle()`
2. Type errors for incompatible schema/column combinations
3. All valid schema/column combinations work

---

## Expected Outcomes

### 1. Typed Drizzle Tables

```typescript
class User extends Model<User>("User")({
  id: Field(S.String, { column: { type: "uuid", primaryKey: true } }),
  age: Field(S.Int, { column: { type: "integer" } }),
  metadata: Field(S.Struct({ level: S.Number }), { column: { type: "json" } }),
}) {}

const table = toDrizzle(User);
// table.id should have type PgUUID<{ data: string, ... }>
// table.age should have type PgInteger<{ data: number, ... }>
// table.metadata should have type PgJsonb<{ data: { level: number }, ... }>
```

### 2. Compile-Time Validation

```typescript
// Should error at compile time
class Invalid extends Model<Invalid>("Invalid")({
  count: Field(S.String, { column: { type: "integer" } }), // ERROR!
}) {}
```

---

## Commands

```bash
# Type check
bun run check --filter=@beep/schema

# Run DSL tests
cd packages/common/schema && bun test test/integrations/sql/dsl/

# Run specific test file
cd packages/common/schema && bun test test/integrations/sql/dsl/poc.test.ts
```

---

## Files to Modify

1. **`packages/common/schema/src/integrations/sql/dsl/types.ts`**
   - Add schema/column compatibility types
   - Add `SchemaEncodedToColumnTypes` mapping

2. **`packages/common/schema/src/integrations/sql/dsl/Field.ts`**
   - Update `Field()` to validate column type compatibility

3. **`packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`**
   - Update `toDrizzle()` to apply `.$type<T>()` with proper types
   - Update return types to reflect typed columns

4. **`packages/common/schema/test/integrations/sql/dsl/drizzle-typed.test.ts`** (new)
   - Tests for typed column generation
   - Tests for compatibility validation

---

## Notes

- The current implementation uses `UnsafeTypes.UnsafeAny` in several places for type flexibility. The new implementation should try to maintain type safety while avoiding excessive complexity.
- Consider whether runtime validation is also needed (in addition to compile-time).
- The `.$type<T>()` enhancement is primarily for TypeScript DX - it doesn't affect runtime behavior but greatly improves type inference when using the Drizzle table.
- For variant fields (`M.Generated`, `M.Sensitive`, etc.), the encoded type should be extracted from the "select" variant's schema since that represents the database representation.

---

## References

- Drizzle ORM: https://orm.drizzle.team/docs/column-types/pg
- Effect Schema: https://effect.website/docs/schema/introduction
- Current DSL implementation: `packages/common/schema/src/integrations/sql/dsl/`
