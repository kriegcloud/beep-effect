---
name: dsl-variant-schema-feature
version: 1
created: 2025-12-26T00:00:00Z
iterations: 2
---

# DSL.Model VariantSchema Integration - Refined Prompt

## Context

You are working in the `beep-effect` monorepo, an Effect-first TypeScript codebase. The `@beep/schema` package contains a DSL (Domain-Specific Language) for SQL model definitions that integrates Effect Schema with Drizzle ORM.

**Current State:**
- `packages/common/schema/src/integrations/sql/dsl/` contains a working POC with:
  - `Field.ts` - Wraps Effect Schema with column metadata via `ColumnMetaSymbol` annotation
  - `Model.ts` - Creates S.Class with static SQL properties (tableName, columns, primaryKey)
  - `adapters/drizzle.ts` - Converts Model to Drizzle pgTable with type-safe column inference
  - All 12 POC tests passing

- `packages/common/schema/src/core/VariantSchema.ts` contains a full VariantSchema implementation (mirrors `@effect/experimental/VariantSchema`)

- `@effect/sql/Model` provides variant-aware field helpers (Generated, Sensitive, FieldOption) built on VariantSchema with 6 variants: `["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"]`

**Gap:** The current DSL.Model does not leverage VariantSchema variants. Fields have column metadata but no variant-aware behavior (e.g., Generated fields should be excluded from insert variant).

**Key Architectural Insight:** VariantSchema.Field is a **container** holding multiple variant schemas, not a schema wrapper. Metadata must attach to the Field wrapper level using Symbol-keyed properties.

## Objective

Extend the DSL.Model system to support `@effect/sql/Model` VariantSchema patterns with these measurable outcomes:

1. `DSL.Field` accepts both plain Schema AND VariantSchema.Field inputs
2. `DSL.Model` exposes 6 variant schemas as static properties (select, insert, update, json, jsonCreate, jsonUpdate)
3. Column metadata (ColumnDef) survives variant extraction and is accessible on the Model class
4. `toDrizzle()` continues to work with variant-enabled Models
5. All existing POC tests continue to pass (backward compatibility)
6. New test suite validates variant behavior with M.Generated, M.Sensitive patterns

## Role

You are an **Effect TypeScript Expert** specializing in:
- Effect Schema (`effect/Schema`) advanced patterns including annotations, AST manipulation, and class factories
- VariantSchema (`@effect/experimental/VariantSchema`) multi-variant schema systems
- Type-level TypeScript programming with conditional types, mapped types, and distributive inference
- Drizzle ORM schema generation and type mapping

You follow Effect-first development strictly and never use imperative JavaScript patterns.

## Constraints

### Effect-First Patterns (MANDATORY - No Exceptions)

```typescript
// REQUIRED imports
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as P from "effect/Predicate";
import * as Match from "effect/Match";
import * as Struct from "effect/Struct";
import * as AST from "effect/SchemaAST";
import * as M from "@effect/sql/Model";
```

**FORBIDDEN - Never use:**
- Native Array methods: `array.map()`, `array.filter()`, `Array.from()`
- Native String methods: `str.split()`, `str.trim()`, `str.toUpperCase()`
- Native Object methods: `Object.keys()`, `Object.values()`, `Object.entries()`
- Switch statements or long if-else chains
- `typeof` or `instanceof` checks directly
- `async/await` or bare Promises
- `any`, `@ts-ignore`, or unchecked type casts

**REQUIRED - Always use:**
- `F.pipe(items, A.map(...))` instead of `items.map(...)`
- `F.pipe(str, Str.split(" "))` instead of `str.split(" ")`
- `F.pipe(obj, Struct.keys)` instead of `Object.keys(obj)`
- `Match.value(x).pipe(Match.when(...), Match.exhaustive)` for branching
- `P.hasProperty(u, Symbol)` for type guards
- Symbol-keyed annotations for metadata attachment

### Schema Layer Purity

- No I/O, logging, network, or filesystem operations
- No platform-specific APIs
- Pure runtime values only
- Exports should flow through the package's main index.ts

### Type Safety

- Preserve type-level information through all transformations
- Use `readonly` for all interface properties
- Provide rich annotations: `identifier`, `title`, `description`
- No runtime type assertions that lose type information

## Resources

### Files to Read (in order)

1. **VariantSchema Implementation:**
   - `packages/common/schema/src/core/VariantSchema.ts` - Internal VariantSchema (full file)
   - `node_modules/@effect/experimental/src/VariantSchema.ts` - Reference implementation

**Note on VariantSchema Sources:**
- `packages/common/schema/src/core/VariantSchema.ts` is a **local copy** of `@effect/experimental/VariantSchema` with identical API
- For DSL implementation, use the **local copy** (`import * as VariantSchema from "../core/VariantSchema"`) to avoid external dependency in the schema package
- The detection strategy uses `VariantSchema.FieldTypeId` which is the same symbol (`Symbol.for("@effect/experimental/VariantSchema/Field")`) in both implementations, ensuring compatibility with `@effect/sql/Model` fields

2. **@effect/sql/Model Patterns:**
   - `node_modules/@effect/sql/src/Model.ts` - Generated, Sensitive, FieldOption implementations

3. **Current DSL Implementation:**
   - `packages/common/schema/src/integrations/sql/dsl/Field.ts`
   - `packages/common/schema/src/integrations/sql/dsl/Model.ts`
   - `packages/common/schema/src/integrations/sql/dsl/types.ts`
   - `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`

4. **Existing Tests:**
   - `packages/common/schema/test/integrations/sql/dsl/poc.test.ts`

5. **BSL Scaffold (reference only):**
   - `packages/common/schema/src/BSL/Model.ts`
   - `packages/common/schema/src/BSL/SqlMetadata.ts`
   - Note: BSL is a parallel experimental implementation. DSL work should remain independent. BSL patterns may inform design but files should not be modified.

### Documentation to Consult

- Effect Schema documentation via `mcp__effect_docs__get_effect_doc`
- VariantSchema patterns via effect-researcher agent

## Output Specification

### Deliverables

1. **Updated `Field.ts`:**
   - Export `VariantFieldSymbol` for variant field detection
   - `Field()` function accepts `S.Schema.All | S.PropertySignature.All | VariantSchema.Field<any>`
   - When input is VariantSchema.Field, preserve its `.schemas` property
   - Attach ColumnMetaSymbol to the Field wrapper (not individual variant schemas)
   - Return type preserves both column metadata AND variant information
   - Use `getFieldAST()` helper when input is PropertySignature to extract the underlying schema AST

   **VariantSchema.Field Detection Strategy:**
   ```typescript
   // Runtime detection using FieldTypeId symbol
   import * as VariantSchema from "@effect/experimental/VariantSchema";
   const isVariantField = (u: unknown): u is VariantSchema.Field<any> =>
     P.hasProperty(u, VariantSchema.FieldTypeId);

   // Type-level: use conditional return type for proper inference
   type FieldResult<Input, C> =
     Input extends VariantSchema.Field<infer Config>
       ? DSLVariantField<Config, ExactColumnDef<C>>
       : DSLField<ExtractSchemaType<Input>, ExactColumnDef<C>>;
   ```

2. **Updated `Model.ts`:**
   - Create internal VariantSchema instance with 6 variants
   - `toVariantFields()` helper converts DSL fields to VariantSchema-compatible format
   - Plain Schema fields wrapped with `FieldOnly` for all variants
   - VariantSchema.Field inputs passed through with column metadata preserved
   - Extract and attach all 6 variant schemas as static properties
   - Preserve existing statics: tableName, columns, primaryKey, identifier
   - Consider caching variant extractions for performance (VariantSchema.extract is memoized internally)

**Metadata Architecture:**
Column metadata is stored at TWO levels:
1. **Model.columns** - Single source of truth for SQL column definitions. Extracted from DSL Field wrappers at Model construction time. Used by `toDrizzle()`.
2. **DSLField/DSLVariantField wrapper** - Carries `ColumnMetaSymbol` for runtime detection. NOT attached to individual variant schemas inside VariantSchema.Field.

Variant extraction (`Model.insert`, `Model.json`, etc.) filters WHICH fields appear, but does NOT carry column metadata. To get column info for a variant field:
```typescript
// Correct pattern
const insertColumns = F.pipe(
  Struct.keys(User.insert.fields),
  A.map((key) => [key, User.columns[key]] as const),
  R.fromEntries
);
```

3. **Updated `types.ts`:**
   - Export `VariantFieldSymbol`
   - Add `ModelVariants` type union
   - Update `ModelClass` interface to include variant accessors

4. **New test file `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts`:**
   - Tests for Field with M.Generated, M.Sensitive, M.GeneratedByApp
   - Tests for all 6 variant accessors on Model
   - Tests for column metadata preservation through variants
   - Tests for toDrizzle with variant-enabled models
   - Tests for S.decodeSync with different variants
   - Type-level tests using `expectTypeOf` or `Expect<Equal<...>>` patterns

### Code Structure

```typescript
// Field.ts - Target signature
export const Field = <
  Input extends S.Schema.All | S.PropertySignature.All | VariantSchema.Field<any>,
  const C extends Partial<ColumnDef> = {}
>(
  schema: Input,
  config?: FieldConfig<C>
): DSLField<...> => {
  // Implementation
};

// Model.ts - Internal helper (not exported)
const toVariantFields = <Fields extends Record<string, DSLField<any> | DSLVariantField<any> | S.Schema.All>>(
  fields: Fields,
  VS: ReturnType<typeof VariantSchema.make>
): VariantSchema.Struct.Fields => {
  return F.pipe(
    fields,
    R.map((field) => {
      if (isVariantField(field)) {
        // Pass through VariantSchema.Field as-is
        return field;
      }
      if (isDSLField(field)) {
        // Wrap plain DSLField in FieldOnly for all 6 variants
        return VS.FieldOnly("select", "insert", "update", "json", "jsonCreate", "jsonUpdate")(
          extractSchema(field)
        );
      }
      // Plain Schema - wrap for all variants
      return VS.FieldOnly("select", "insert", "update", "json", "jsonCreate", "jsonUpdate")(field);
    })
  );
};

// Model.ts - Target signature
export const Model = <Self = never>(identifier: string) =>
  <const Fields extends S.Struct.Fields>(
    fields: Fields,
    annotations?: S.Annotations.Schema<Self>
  ): ModelClassWithVariants<Self, Fields, ...> => {
    // Implementation
  };

// Usage
class User extends Model<User>("User")({
  id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
  name: Field(S.String, { column: { type: "string" } }),
}) {}

User.tableName      // "user"
User.columns.id     // { type: "uuid", unique: true, ... }
User.insert.fields  // { name: ... } - no 'id' field
User.json.fields    // { id: ..., name: ... }
```

## Examples

### Example 1: Generated Field (excluded from insert)

```typescript
import * as M from "@effect/sql/Model";

class Post extends Model<Post>("Post")({
  id: Field(M.Generated(S.String), { column: { type: "uuid" } }),
  title: Field(S.String, { column: { type: "string" } }),
}) {}

// Post (select variant) - has both fields
S.decodeSync(Post)({ id: "abc", title: "Hello" }); // OK

// Post.insert - excludes 'id'
S.decodeSync(Post.insert)({ title: "Hello" }); // OK
S.decodeSync(Post.insert)({ id: "abc", title: "Hello" }); // ERROR - 'id' not expected
```

### Example 2: Sensitive Field (excluded from JSON)

```typescript
class User extends Model<User>("User")({
  id: Field(S.String, { column: { type: "uuid" } }),
  passwordHash: Field(M.Sensitive(S.String), { column: { type: "string" } }),
}) {}

// User (select) - has passwordHash
expect(User.fields).toHaveProperty("passwordHash");

// User.json - excludes passwordHash
expect(User.json.fields).not.toHaveProperty("passwordHash");
```

### Example 3: Column Metadata Preservation

```typescript
class Entity extends Model<Entity>("Entity")({
  id: Field(M.Generated(S.String), { column: { type: "uuid", unique: true } }),
}) {}

// Column metadata accessible on Model class
expect(Entity.columns.id.type).toBe("uuid");
expect(Entity.columns.id.unique).toBe(true);

// toDrizzle still works
const table = toDrizzle(Entity);
expect(table.id.columnType).toBe("PgUUID");
```

### Example 4: GeneratedByApp (required on insert, optional on update)

```typescript
class Document extends Model<Document>("Document")({
  id: Field(M.GeneratedByApp(S.String), { column: { type: "uuid" } }),
  slug: Field(S.String, { column: { type: "string" } }),
  version: Field(S.Int, { column: { type: "integer" } }),
}) {}

// Document (select) - id is required
S.decodeSync(Document)({ id: "abc", slug: "hello", version: 1 }); // OK

// Document.insert - id is REQUIRED (app must provide)
S.decodeSync(Document.insert)({ id: "abc", slug: "hello", version: 1 }); // OK
S.decodeSync(Document.insert)({ slug: "hello", version: 1 }); // ERROR - 'id' is required

// Document.update - id is OPTIONAL
S.decodeSync(Document.update)({ slug: "updated" }); // OK - partial update
S.decodeSync(Document.update)({ id: "abc", slug: "updated" }); // OK - can include id
```

### Example 5: Variant Accessor Return Types

Each variant accessor returns an `S.Struct` schema with a `.fields` property containing the narrowed field set:

```typescript
// Type of variant accessors
type InsertSchema = typeof User.insert; // S.Struct<{ name: ... }> (no 'id')
type JsonSchema = typeof User.json;     // S.Struct<{ id: ..., name: ... }> (no passwordHash)

// Accessing fields on variants
const insertFields = User.insert.fields; // { name: PropertySignature<...> }
const jsonFields = User.json.fields;     // { id: ..., name: ... }
```

## Verification Checklist

### Backward Compatibility
- [ ] All 12 existing POC tests pass without modification
- [ ] `Field(S.String, { column: ... })` works unchanged
- [ ] `Model<Self>("Name")({ ... })` signature unchanged
- [ ] `toDrizzle(Model)` produces correct Drizzle table

### Variant Functionality
- [ ] `Model.select` returns select variant schema
- [ ] `Model.insert` returns insert variant schema (excludes Generated fields)
- [ ] `Model.update` returns update variant schema
- [ ] `Model.json` returns json variant schema (excludes Sensitive fields)
- [ ] `Model.jsonCreate` returns jsonCreate variant schema
- [ ] `Model.jsonUpdate` returns jsonUpdate variant schema

### Metadata Preservation
- [ ] `Model.columns` contains ColumnDef for all fields (including Generated)
- [ ] `Model.primaryKey` correctly derived from fields with `primaryKey: true`
- [ ] `Model.tableName` is snake_case of identifier
- [ ] Column metadata survives variant extraction

### Type Safety
- [ ] Full TypeScript inference for all variants
- [ ] No `any` types in public API
- [ ] Compile error if Self generic missing
- [ ] Variant field types correctly narrowed
- [ ] Type-level tests verify variant schema structure (e.g., `Expect<Equal<keyof typeof Model.insert.fields, "name">>`)
- [ ] DSLVariantField vs DSLField conditional type correctly resolves based on input

### Integration
- [ ] Works with `M.Generated`, `M.Sensitive`, `M.GeneratedByApp`
- [ ] Works with `M.FieldOption` for optional fields
- [ ] Works with DateTime field helpers
- [ ] `S.decodeSync` / `S.encodeSync` work for each variant

---

## Metadata

### Research Sources
- Files explored:
  - `packages/common/schema/src/integrations/sql/dsl/*`
  - `packages/common/schema/src/core/VariantSchema.ts`
  - `packages/common/schema/src/BSL/*`
  - `node_modules/@effect/experimental/src/VariantSchema.ts`
  - `node_modules/@effect/sql/src/Model.ts`
- AGENTS.md consulted:
  - Root `AGENTS.md`
  - `packages/common/schema/AGENTS.md`
  - `packages/common/types/AGENTS.md`
  - `packages/shared/tables/AGENTS.md`

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 9 issues (3 HIGH, 3 MEDIUM, 3 LOW) | Fixed test paths (src/ -> test/), added M import, added VariantSchema.Field detection strategy with runtime/type-level patterns, added PropertySignature handling note, clarified BSL relationship, added Example 4 (GeneratedByApp) and Example 5 (variant return types), added type-level test expectations to checklist, added caching note |
| 2         | 3 issues (2 MEDIUM, 1 LOW) | Added metadata architecture clarification, provided toVariantFields() signature, clarified VariantSchema source relationship |

---

## Agent Deployment Strategy

### Phase 1: Research (Parallel)
Deploy 4 researcher agents to deeply understand:
1. VariantSchema internals (make, Field, Struct, extract, caching)
2. @effect/sql/Model patterns (Generated, Sensitive, field helpers)
3. Current DSL implementation details
4. Type-level integration requirements

### Phase 2: Implementation (Sequential)
Deploy 3 implementation agents:
1. **Field Integration** - Extend Field.ts for VariantSchema.Field support
2. **Model Integration** - Integrate VariantSchema.make() into Model.ts
3. **Type Definitions** - Complete TypeScript types for ModelClassWithVariants

### Phase 3: Validation
Deploy 1 validation agent to:
1. Create comprehensive test suite
2. Run all tests (existing + new)
3. Verify type inference
4. Confirm backward compatibility

### Commands

```bash
# Build
bun run build --filter=@beep/schema

# Type check
bun run check --filter=@beep/schema

# Run all DSL tests
cd packages/common/schema && bun test test/integrations/sql/dsl/

# Run specific test file
cd packages/common/schema && bun test test/integrations/sql/dsl/variant-integration.test.ts
```
