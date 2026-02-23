# DSL.Model Type Analysis - Orchestration Handoff

## Mission

Orchestrate a comprehensive type analysis of DSL.Model design documents using parallel sub-agents. Examine Drizzle ORM's type system, critique existing design document types, and refactor all examples with correct generic signatures.

---

## Problem Statement

The current DSL.Model design documents have **critically flawed generic signatures** that would prevent type-safe transformations to Drizzle/BetterAuth schemas.

### Core Issue: Lost Type Information

**Current broken signature:**
```typescript
export const Field: <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig  // ❌ NOT GENERIC - type info lost at compile time!
) => DSLField<A, I, R>;
```

**Problem:** Since `config` is not generic, the specific `ColumnDef` and `VariantConfig` types are erased at compile time. This makes it impossible to:
1. Derive `primaryKey: ["_rowId"]` from fields with `primaryKey: true` at the type level
2. Generate typed Drizzle column definitions preserving `maxLength`, `unique`, etc.
3. Infer which fields appear in `insert` vs `select` variants

### What Drizzle Does Right

Drizzle preserves all column metadata through generics:
```typescript
// Drizzle's approach - metadata flows through generics
const id = uuid("id").primaryKey().defaultRandom();
//     ^-- Type carries: { isPrimaryKey: true, hasDefault: true, ... }

// Full table type preserves all column metadata
const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
});
// typeof users.id includes all constraint information!
```

### Required Fix: Generic Config

```typescript
// Corrected signature - config IS generic
export const Field: <
  A, I, R,
  Config extends FieldConfig  // ✅ Generic - preserved at compile time
>(
  schema: S.Schema<A, I, R>,
  config: Config
) => DSLField<A, I, R, Config>;

// DSLField now carries Config type
export interface DSLField<A, I, R, Config extends FieldConfig>
  extends S.Schema<A, I, R> {
  readonly config: Config;  // Type-level access to config
}
```

---

## Reference Implementation

The user has started a corrected implementation in `packages/common/schema/src/BSL/`:

### Key Files
- `packages/common/schema/src/BSL/Model.ts` - Corrected ModelSchemaInstance with generic SqlConfig
- `packages/common/schema/src/BSL/SqlMetadata.ts` - ColumnDef, IndexDef schemas
- `packages/common/schema/src/BSL/index.ts` - Exports

### Critical Insight from User's Code

```typescript
export interface ModelSchemaInstance<
  Self,
  Fields extends Struct.Fields,
  SchemaFields extends S.Struct.Fields,
  A, I, R, C,
  SqlConfig extends S.Schema.Type<typeof ModelSqlConfig>  // ✅ Generic!
> extends S.Schema<Self, S.Simplify<I>, R> {
  readonly tableName: SqlConfig["tableName"];       // Type-level access
  readonly primaryKey: SqlConfig["primaryKey"];     // Type-level access
  readonly indexes: SqlConfig["indexes"];           // Type-level access
}
```

---

## Drizzle Repository Location

**Path:** `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm`

### Key Areas to Examine

```
tmp/drizzle-orm/
├── drizzle-orm/
│   └── src/
│       ├── pg-core/
│       │   ├── columns/          # Column type definitions
│       │   │   ├── common.ts     # Base column types
│       │   │   ├── uuid.ts       # UUID column
│       │   │   ├── varchar.ts    # Varchar column
│       │   │   └── integer.ts    # Integer/serial
│       │   ├── table.ts          # pgTable factory
│       │   └── primary-keys.ts   # PK type handling
│       ├── column-builder.ts     # Generic column builder
│       └── table.ts              # Base table types
```

### Specific Questions to Answer

1. **How does Drizzle's `ColumnBuilderBase` preserve generic config through chained methods?**
   - Look at: `drizzle-orm/src/column-builder.ts`
   - Focus on: Generic parameters that carry constraint info

2. **How does `pgTable` aggregate column types into a unified table type?**
   - Look at: `drizzle-orm/src/pg-core/table.ts`
   - Focus on: How `columns` parameter type flows to table static properties

3. **How are primary keys typed at compile time?**
   - Look at: `drizzle-orm/src/pg-core/primary-keys.ts`
   - Focus on: Type-level extraction of PK columns

4. **How does `.notNull()`, `.unique()`, `.default()` chain while preserving types?**
   - Look at: Individual column files and `column-builder.ts`
   - Focus on: Return type generics on builder methods

---

## Documents to Refactor

### Primary Documents (Type-Critical)

| Document | Issues Expected |
|----------|-----------------|
| `DSL-MODEL-DESIGN.md` | All Field/Model signatures need generic config |
| `dsl-model-poc.prompt.md` | Implementation examples need corrected types |
| `dsl-model.prompt.md` | Original spec has same issues |

### Files to Reference

| File | Purpose |
|------|---------|
| `packages/common/schema/src/BSL/Model.ts` | User's corrected implementation |
| `packages/common/schema/src/BSL/SqlMetadata.ts` | Schema definitions for SqlConfig |
| `packages/common/schema/src/core/VariantSchema.ts` | Current variant infrastructure |
| `packages/shared/domain/src/common.ts` | makeFields pattern |

---

## Execution Plan

### Phase 1: Drizzle Type System Analysis (3 parallel agents)

**Agent 1: Column Builder Analysis**
```
Examine Drizzle's column builder type system:

Files to analyze:
- tmp/drizzle-orm/drizzle-orm/src/column-builder.ts
- tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts
- tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/uuid.ts
- tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/varchar.ts
- tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/integer.ts

Questions to answer:
1. What generic parameters does ColumnBuilderBase use?
2. How does .notNull() modify the generic signature?
3. How does .primaryKey() add type information?
4. How does .unique() add type information?
5. How are default values typed?

Output: Markdown summary with code examples showing generic patterns.
```

**Agent 2: Table Factory Analysis**
```
Examine Drizzle's table factory type system:

Files to analyze:
- tmp/drizzle-orm/drizzle-orm/src/pg-core/table.ts
- tmp/drizzle-orm/drizzle-orm/src/table.ts
- tmp/drizzle-orm/drizzle-orm/src/pg-core/primary-keys.ts

Questions to answer:
1. How does pgTable aggregate column types?
2. How are primary keys extracted at the type level?
3. What type helpers extract specific column properties?
4. How is the table name typed (literal vs string)?
5. How are table relations typed?

Output: Markdown summary with code examples showing generic patterns.
```

**Agent 3: Type Utility Analysis**
```
Examine Drizzle's type utilities:

Files to analyze:
- tmp/drizzle-orm/drizzle-orm/src/utils.ts
- tmp/drizzle-orm/drizzle-orm/src/operations.ts
- tmp/drizzle-orm/drizzle-orm/src/sql/expressions/select.ts (if exists)

Questions to answer:
1. What mapped types does Drizzle use for column extraction?
2. How does Drizzle handle optional vs required columns in insert?
3. What conditional types are used for type narrowing?
4. How are infer patterns used for type extraction?

Output: Markdown summary with reusable type patterns for BSL.Model.
```

### Phase 2: Design Document Type Critique (3 parallel agents)

**Agent 4: DSL-MODEL-DESIGN.md Type Critique**
```
Critique all type signatures in DSL-MODEL-DESIGN.md:

Focus areas:
1. Section 3.1 DSL.Field signature - config must be generic
2. Section 3.2 DSL.Model signature - SqlConfig must be generic
3. Section 2.2 ModelSchemaInstance - all config properties need generics
4. Section 2.1 DSLField interface - must carry Config generic
5. Section 6.1/6.2 implementation - types must flow correctly

For each issue:
- Quote the problematic code
- Explain why it fails type preservation
- Provide corrected signature with generics
- Show type-level test that would fail/pass

Output: Structured critique with HIGH/MEDIUM/LOW severity per issue.
```

**Agent 5: dsl-model-poc.prompt.md Type Critique**
```
Critique all type signatures in dsl-model-poc.prompt.md:

Focus areas:
1. Field factory signature
2. Model factory signature
3. extractColumns implementation - type preservation
4. toDrizzle implementation - type mapping
5. Test assertions for type correctness

For each issue:
- Quote the problematic code
- Explain why it fails type preservation
- Provide corrected implementation
- Show how Drizzle patterns should be applied

Output: Structured critique with HIGH/MEDIUM/LOW severity per issue.
```

**Agent 6: BSL Implementation Review**
```
Review the user's BSL implementation for correctness:

Files to analyze:
- packages/common/schema/src/BSL/Model.ts
- packages/common/schema/src/BSL/SqlMetadata.ts

Questions to answer:
1. Does ModelSchemaInstance correctly preserve SqlConfig generics?
2. Are Field types properly constrained?
3. Does the Struct type correctly aggregate field types?
4. Are variant types correctly derived from field configs?
5. What's missing compared to Drizzle's completeness?

Output: Review with recommendations for alignment with Drizzle patterns.
```

### Phase 3: Consolidate Findings

Collect all agent outputs and create a unified type correction plan:
1. Drizzle patterns to adopt
2. BSL implementation gaps
3. Design document corrections needed
4. Priority order for fixes

### Phase 4: Apply Type Corrections (3 parallel agents)

**Agent 7: Fix DSL-MODEL-DESIGN.md**
```
Apply all type corrections to DSL-MODEL-DESIGN.md:

Corrections list from Phase 2/3 critique.

Key changes:
1. Make FieldConfig generic in Field signature
2. Make SqlConfig generic in Model signature
3. Update ModelSchemaInstance with full generic chain
4. Update all code examples with correct types
5. Add type-level tests as documentation

Verify each fix preserves type information.
```

**Agent 8: Fix dsl-model-poc.prompt.md**
```
Apply all type corrections to dsl-model-poc.prompt.md:

Corrections list from Phase 2/3 critique.

Key changes:
1. Update Field factory with generic config
2. Update Model factory with generic sql config
3. Fix extractColumns to preserve types
4. Fix toDrizzle to use correct type mappings
5. Add type assertion tests

Verify each fix preserves type information.
```

**Agent 9: Fix dsl-model.prompt.md**
```
Apply all type corrections to dsl-model.prompt.md:

Key changes:
1. Update all generic signatures
2. Update examples with correct types
3. Align with corrected DSL-MODEL-DESIGN.md

Keep this document concise but type-correct.
```

### Phase 5: Final Verification

Run a final verification pass to ensure:
1. All generic signatures preserve config types
2. Type-level tests would pass
3. BSL implementation aligns with design docs
4. Drizzle patterns are correctly applied

---

## Type Patterns to Establish

### Pattern 1: Generic Config Preservation

```typescript
// ❌ WRONG - config type lost
const Field = <A, I, R>(schema: S.Schema<A, I, R>, config?: FieldConfig) => ...

// ✅ CORRECT - config type preserved
const Field = <A, I, R, C extends FieldConfig>(schema: S.Schema<A, I, R>, config: C): DSLField<A, I, R, C> => ...
```

### Pattern 2: Mapped Type for Column Extraction

```typescript
// Extract primaryKey columns at type level
type PrimaryKeyColumns<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  [K in keyof Fields]: Fields[K]["config"]["column"]["primaryKey"] extends true ? K : never
}[keyof Fields];

// Usage: PrimaryKeyColumns<UserFields> = "_rowId"
```

### Pattern 3: Conditional Type for Variant Behavior

```typescript
// Exclude omitted fields from insert variant
type InsertFields<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  [K in keyof Fields as Fields[K]["config"]["variants"]["insert"] extends "omit" ? never : K]:
    Fields[K]["config"]["variants"]["insert"] extends "optional"
      ? S.Schema.Type<Fields[K]> | undefined
      : S.Schema.Type<Fields[K]>
};
```

### Pattern 4: Literal Table Name

```typescript
// Table name should be a literal type, not string
interface ModelSchemaInstance<
  Self,
  Fields extends Struct.Fields,
  TableName extends string,  // ✅ Literal
  // ...
> {
  readonly tableName: TableName;  // Preserves "user" not string
}
```

---

## Success Criteria

- [ ] All `Field` signatures have generic `Config` parameter
- [ ] All `Model` signatures have generic `SqlConfig` parameter
- [ ] `ModelSchemaInstance` exposes typed `tableName`, `primaryKey`, `columns`
- [ ] Mapped types correctly extract primary key columns at compile time
- [ ] Variant types correctly filter fields based on config
- [ ] Design docs align with BSL implementation
- [ ] Drizzle patterns are documented and applied
- [ ] Type-level tests demonstrate correctness

---

## Commands

```bash
# To run sub-agents in parallel:
Task(subagent_type="general-purpose", prompt="Agent 1 prompt...")
Task(subagent_type="general-purpose", prompt="Agent 2 prompt...")
...
```

---

## Notes

- The `/tmp/drizzle-orm` repository is the official Drizzle ORM monorepo
- Focus on `drizzle-orm/src/pg-core/` for PostgreSQL-specific types
- The BSL implementation in `packages/common/schema/src/BSL/` is the user's starting point
- Prioritize type preservation over runtime simplicity
- All code examples in design docs must be compilable TypeScript

---

## BSL Implementation Architecture

The user has started a sophisticated implementation in `packages/common/schema/src/BSL/` that uses discriminated unions for type-safe column definitions.

### SqlMetadata.ts - Key Patterns

**Discriminated Union for ColumnDef:**
```typescript
// Each column type is its own schema class with specific fields
export class StringColumnDef extends S.Class<StringColumnDef>($I`StringColumnDef`)(
  columnTypeFactory(ColumnTypeTag.Enum.string, columnTypeFields({
    maxLength: S.optionalWith(S.Number, {exact: true})
  }))
) {}

export class IntegerColumnDef extends S.Class<IntegerColumnDef>($I`IntegerColumnDef`)(
  columnTypeFactory(ColumnTypeTag.Enum.integer, columnTypeFields({
    autoIncrement: BoolWithDefault(false)
  }))
) {}

// Union provides type-safe discrimination
export class ColumnDef extends S.Union(
  StringColumnDef,
  NumberColumnDef,
  IntegerColumnDef,
  BooleanColumnDef,
  DatetimeColumnDef,
  JsonColumnDef,
  UuidColumnDef,
  BlobColumnDef
) {}
```

**Column Type Factory Pattern:**
```typescript
const columnTypeFactory = DiscriminatedStruct.make("type");

const columnTypeFields = <Fields extends S.Struct.Fields>(fields: Fields) => ({
  primaryKey: BoolWithDefault(false),
  unique: BoolWithDefault(false),
  nullable: BoolWithDefault(false),
  defaultValue: DefaultValue(S.Any),
  // ... common fields
  ...fields  // Type-specific fields
} as const);
```

### Model.ts - Key Patterns

**StringLiteralKit for Variant Types:**
```typescript
export class ModelVariantType extends StringLiteralKit(
  "select", "insert", "update", "json", "jsonCreate", "jsonUpdate"
) {}

// Type-safe variant subsets
export class VariantsDatabase extends StringLiteralKit(
  ...ModelVariantType.pickOptions("select", "insert", "update")
) {}
```

**Field with ColumnMetaSymbol:**
```typescript
export declare namespace Field {
  export type Any = {
    readonly [VariantSchema.FieldTypeId]: VariantSchema.FieldTypeId,
    readonly [ColumnMetaSymbol]: S.Schema.Type<FieldConfig>  // Type-level config!
  };
}
```

### Critical Insight

The BSL implementation uses `ColumnMetaSymbol` as a **type-level marker** on the Field type, not just runtime storage. This is the correct approach for type preservation - the config must be accessible at the type level.

### Alignment Tasks for Agents

Agents must ensure design documents align with this architecture:
1. Use discriminated unions for ColumnDef (not flat interface)
2. Use StringLiteralKit for variant type enumeration
3. Ensure Field type carries ColumnMetaSymbol at type level
4. Use `DiscriminatedStruct.make("type")` pattern for column factories

---

*Document created: 2025-12-26*
*Status: Ready for orchestration*
