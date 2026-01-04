---
name: type-analysis-handoff
version: 2
created: 2025-12-26T00:00:00Z
iterations: 1
---

# DSL.Model Type Analysis Orchestration - Refined Prompt

## Context

The beep-effect monorepo implements DSL.Model, a domain schema layer that bridges Effect Schema with Drizzle ORM and BetterAuth. The current design documents in `.specs/dsl-model/` have **critically flawed generic signatures** that erase type information at compile time.

### Codebase Structure
```
packages/common/schema/src/BSL/
├── Model.ts       # ModelSchemaInstance, Field, ColumnMetaSymbol
├── SqlMetadata.ts # ColumnDef discriminated unions
└── index.ts       # Exports

tmp/drizzle-orm/drizzle-orm/src/
├── column-builder.ts    # ColumnBuilderBase, constraint markers
├── pg-core/
│   ├── table.ts         # pgTable factory
│   ├── columns/common.ts # Base column types
│   └── primary-keys.ts  # PK type handling
└── table.ts             # Base table types

.specs/dsl-model/
├── DSL-MODEL-DESIGN.md      # Main design document (~15 type signatures to fix)
├── dsl-model-poc.prompt.md  # POC implementation guide (~8 code examples)
└── dsl-model.prompt.md      # Original specification (~5 type signatures)
```

### The Core Problem

**Current broken signature in design documents:**
```typescript
export const Field: <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig  // ❌ NOT GENERIC - type info lost at compile time!
) => DSLField<A, I, R>;
```

**Why this fails:**
- `FieldConfig` is not generic, so specific `ColumnDef` and `VariantConfig` types are erased
- Cannot derive `primaryKey: ["_rowId"]` from the `Fields` struct type when individual fields have `primaryKey: true`
- Cannot generate typed Drizzle columns preserving `maxLength`, `unique`, etc.
- Cannot infer which fields appear in `insert` vs `select` variants

### Drizzle's Working Pattern

**Key concepts explained:**
- **Intersection type accumulation**: TypeScript pattern where each builder method returns `this & NewType`, stacking type information without runtime overhead
- **Branded marker**: A phantom type property (like `_`) that exists only at compile time to carry constraint metadata
- **Mapped type extraction**: Conditional types that read constraint markers to generate different output types

Drizzle preserves metadata through intersection type accumulation:
```typescript
import * as S from "effect/Schema";

// Each method returns intersection with branded marker
notNull(): NotNull<this> { return this as NotNull<this>; }

type NotNull<T> = T & { _: { notNull: true } };
type HasDefault<T> = T & { _: { hasDefault: true } };

// Final type carries all constraints via intersection
type Column = Builder & NotNull & HasDefault & IsPrimaryKey;

// Mapped types extract constraint markers at compile time
type MakeColumnConfig<T> = {
  notNull: T extends { notNull: true } ? true : false;
  hasDefault: T extends { hasDefault: true } ? true : false;
};
```

### User's Corrected BSL Implementation

The user has started a corrected implementation in `packages/common/schema/src/BSL/`:

```typescript
import * as S from "effect/Schema";

// From Model.ts - ColumnMetaSymbol as type-level marker
export const ColumnMetaSymbol: unique symbol = Symbol.for($I`column-meta`);

export declare namespace Field {
  export type Any = {
    readonly [VariantSchema.FieldTypeId]: VariantSchema.FieldTypeId,
    readonly [ColumnMetaSymbol]: S.Schema.Type<FieldConfig>  // Should be generic
  };
}

// From SqlMetadata.ts - Discriminated unions for ColumnDef
export class StringColumnDef extends S.Class<StringColumnDef>($I`StringColumnDef`)(
  columnTypeFactory(ColumnTypeTag.Enum.string, columnTypeFields({
    maxLength: S.optionalWith(S.Number, {exact: true})
  }))
) {}

export class ColumnDef extends S.Union(
  StringColumnDef, NumberColumnDef, IntegerColumnDef,
  BooleanColumnDef, DatetimeColumnDef, JsonColumnDef,
  UuidColumnDef, BlobColumnDef
) {}
```

---

## Objective

Orchestrate a comprehensive type analysis using 9 parallel sub-agents to:

1. **Analyze Drizzle ORM's type system** (3 agents) - Extract patterns for generic type preservation
2. **Critique existing design documents** (3 agents) - Identify all type signature flaws
3. **Consolidate findings** - Create unified correction plan
4. **Apply type corrections** (3 agents) - Fix all design documents
5. **Verify consistency** - Ensure all documents align with BSL implementation

### Success Criteria (Concrete Metrics)

- [ ] All 15+ `Field` signatures in DSL-MODEL-DESIGN.md have generic `Config extends FieldConfig` parameter
- [ ] All 8+ `Model` signatures across documents have generic `SqlConfig` parameter
- [ ] All 3 occurrences of `ModelSchemaInstance` expose typed `tableName`, `primaryKey`, `columns`
- [ ] 2 mapped types added: `PrimaryKeyColumns<Fields>` and `InsertFields<Fields>`
- [ ] All 25+ code examples compile without type errors (verified via `bun run check`)
- [ ] Design docs align with BSL implementation (diff shows only intentional differences)
- [ ] Drizzle patterns documented with Effect-first translations

### Iteration Budget

- **Maximum 2 iterations** of Phase 1-5 cycle
- If Drizzle patterns are insufficient for Effect Schema, document BSL-specific approach
- If more than 50 type signature corrections needed, batch into priority tiers (HIGH first)

---

## Role

You are a TypeScript type system architect specializing in:
- Generic type preservation through transformations
- Effect Schema composition patterns
- Drizzle ORM internals
- Compile-time type derivation via mapped/conditional types

You will orchestrate parallel sub-agents to systematically analyze, critique, and correct the DSL.Model design documents.

---

## Constraints

### Repository Standards (from CLAUDE.md/AGENTS.md)

**Effect Namespace Imports (REQUIRED):**
```typescript
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as AST from "effect/SchemaAST";
```

**FORBIDDEN Patterns:**
- ❌ Native array methods: `items.map()`, `items.filter()`
- ❌ Native string methods: `str.charAt()`, `str.split()`
- ❌ Native object methods: `Object.keys()`, `Object.values()`
- ❌ Switch statements or long if-else chains
- ❌ `any`, `@ts-ignore`, unchecked casts
- ❌ `async/await` or bare Promises

**REQUIRED Patterns:**
- ✅ `F.pipe(items, A.map(fn))` for array operations
- ✅ `Match.value(x).pipe(Match.tag("name", fn), Match.exhaustive)` for unions
- ✅ `S.TaggedError` for error types
- ✅ Symbol-keyed annotations for metadata storage

### Type Preservation Requirements

**Design Decision:** The `config` parameter is **REQUIRED** (not optional) to ensure type preservation. If optional behavior is needed, use function overloads:

```typescript
import * as S from "effect/Schema";

// Overload 1: No config → uses DefaultFieldConfig
function Field<A, I, R>(
  schema: S.Schema<A, I, R>
): DSLField<A, I, R, DefaultFieldConfig>;

// Overload 2: With config → preserves config type
function Field<A, I, R, C extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config: C
): DSLField<A, I, R, C>;

// Implementation
function Field<A, I, R, C extends FieldConfig = DefaultFieldConfig>(
  schema: S.Schema<A, I, R>,
  config?: C
): DSLField<A, I, R, C> {
  const resolvedConfig = config ?? DefaultFieldConfig.make({}) as C;
  // ...
}
```

1. **Generic Config Preservation:**
```typescript
import * as S from "effect/Schema";

// ❌ WRONG - config type lost
const Field = <A, I, R>(schema: S.Schema<A, I, R>, config?: FieldConfig) => ...

// ✅ CORRECT - config type preserved (required parameter)
const Field = <A, I, R, C extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config: C
): DSLField<A, I, R, C> => ...
```

2. **Literal Table Names:**
```typescript
interface ModelSchemaInstance<
  TableName extends string,  // ✅ Literal, not just string
  // ...
> {
  readonly tableName: TableName;  // Preserves "user" not string
}
```

3. **Symbol-Keyed Type Access:**
```typescript
export interface Field<A, I, R, ColDef extends ColumnDef.Type> {
  readonly [ColumnMetaSymbol]: ColDef;  // Type-level access
}
```

### Error Handling Strategy

- If a file path in Resources doesn't exist, report as `FileNotFound: <path>` and continue with available files
- If a type signature cannot be extracted, document as "Analysis inconclusive: <reason>"
- All agents should use Effect patterns for error handling (not try/catch)

---

## Resources

### Files to Read (Drizzle Analysis) - Absolute Paths

| File | Purpose |
|------|---------|
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/column-builder.ts` | ColumnBuilderBase, constraint markers, MakeColumnConfig |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts` | Base column types, PgColumnBuilder |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/uuid.ts` | UUID column builder example |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/varchar.ts` | Varchar with length preservation |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/table.ts` | pgTable factory, BuildColumns |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/primary-keys.ts` | PK type handling |
| `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/table.ts` | Base table types, InferModelFromColumns |

### Files to Read (BSL Implementation) - Absolute Paths

| File | Purpose |
|------|---------|
| `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/Model.ts` | User's corrected Field/Model types |
| `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/SqlMetadata.ts` | ColumnDef discriminated unions |
| `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/core/VariantSchema.ts` | 6-variant infrastructure |
| `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/common.ts` | makeFields pattern |

### Documents to Fix - Absolute Paths

| Document | Issues Expected |
|----------|-----------------|
| `/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/DSL-MODEL-DESIGN.md` | ~15 Field/Model signatures need generic config |
| `/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/dsl-model-poc.prompt.md` | ~8 implementation examples need corrected types |
| `/home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/dsl-model.prompt.md` | ~5 type signatures need updates |

---

## Output Specification

### Phase 1: Drizzle Type System Analysis (3 parallel agents)

**Agent 1: Column Builder Analysis**
```
Prompt: Analyze Drizzle's column builder type system.

Files to read:
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/column-builder.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/common.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/uuid.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/varchar.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/integer.ts

Answer ALL questions with concrete code examples:
1. What generic parameters does ColumnBuilderBase use?
2. How does .notNull() modify the generic signature?
3. How does .primaryKey() add type information?
4. How does .unique() add type information?
5. How are default values typed?

IMPORTANT: Translate Drizzle patterns to Effect-first equivalents:
- Replace class builders with S.Class or S.Struct composition
- Replace method chaining with F.pipe composition
- Show how to achieve same type preservation using S.annotations

Output: Markdown with code examples showing:
1. Original Drizzle pattern
2. Effect-first equivalent pattern
```

**Agent 2: Table Factory Analysis**
```
Prompt: Analyze Drizzle's table factory type system.

Files to read:
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/table.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/table.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/primary-keys.ts

Answer ALL questions with concrete code examples:
1. How does pgTable aggregate column types?
2. How are primary keys extracted at type level?
3. What type helpers extract specific column properties?
4. How is table name typed (literal vs string)?
5. How are table relations typed?

IMPORTANT: Translate Drizzle patterns to Effect-first equivalents:
- Use S.Struct.Fields for column aggregation
- Use mapped types compatible with Effect Schema
- Show literal type preservation with Effect patterns

Output: Markdown with code examples showing:
1. Original Drizzle pattern
2. Effect-first equivalent pattern
```

**Agent 3: Type Utility Analysis**
```
Prompt: Analyze Drizzle's type utilities.

Files to read:
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/utils.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/operations.ts
- /home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/sql/expressions/ (if exists)

Answer ALL questions with concrete code examples:
1. What mapped types does Drizzle use for column extraction?
2. How does Drizzle handle optional vs required columns in insert?
3. What conditional types are used for type narrowing?
4. How are infer patterns used for type extraction?

IMPORTANT: Translate Drizzle patterns to Effect-first equivalents:
- Use A.map, A.filter instead of native array methods in examples
- Use Match.exhaustive for discriminated union handling
- Ensure all patterns work with Effect Schema types

Output: Markdown with reusable type patterns for BSL.Model, each showing:
1. Pattern name and purpose
2. Drizzle implementation
3. Effect-first implementation
```

### Phase 2: Design Document Type Critique (3 parallel agents)

**Agent 4: DSL-MODEL-DESIGN.md Critique**
```
Prompt: Critique all type signatures in DSL-MODEL-DESIGN.md.

File: /home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/DSL-MODEL-DESIGN.md

Focus areas:
1. Section 3.1 DSL.Field signature - config must be generic
2. Section 3.2 DSL.Model signature - SqlConfig must be generic
3. Section 2.2 ModelSchemaInstance - all config properties need generics
4. Section 2.1 DSLField interface - must carry Config generic
5. Section 6.1/6.2 implementation - types must flow correctly

For each issue:
- Quote the problematic code with line numbers
- Explain why it fails type preservation
- Provide corrected signature with generics
- Show type-level test that would fail/pass

Output: Structured critique with HIGH/MEDIUM/LOW severity per issue.
```

**Agent 5: dsl-model-poc.prompt.md Critique**
```
Prompt: Critique all type signatures in dsl-model-poc.prompt.md.

File: /home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/dsl-model-poc.prompt.md

Focus areas:
1. Field factory signature
2. Model factory signature
3. extractColumns implementation - type preservation
4. toDrizzle implementation - type mapping
5. Test assertions for type correctness

For each issue:
- Quote the problematic code with line numbers
- Explain why it fails type preservation
- Provide corrected implementation
- Show how Drizzle patterns should be applied

Output: Structured critique with HIGH/MEDIUM/LOW severity per issue.
```

**Agent 6: BSL Implementation Review**
```
Prompt: Review the user's BSL implementation for correctness.

Files to read:
- /home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/Model.ts
- /home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/SqlMetadata.ts

Questions to answer:
1. Does ModelSchemaInstance correctly preserve SqlConfig generics?
2. Are Field types properly constrained?
3. Does the Struct type correctly aggregate field types?
4. Are variant types correctly derived from field configs?
5. What's missing compared to Drizzle's completeness?

Verify package boundaries:
- BSL/Model.ts should only import from effect/* and @beep/common/*
- No imports from @beep/shared/domain or feature slices

Output: Review with recommendations for alignment with Drizzle patterns.
```

### Phase 3: Consolidate Findings

Collect all agent outputs and create unified correction plan.

**Output Format:**
```markdown
## Consolidation Report

### Section 1: Drizzle Patterns to Adopt
| Pattern | Source File | Line Numbers | Effect-First Translation |
|---------|-------------|--------------|--------------------------|
| NotNull intersection | column-builder.ts | 124-130 | S.annotations + symbol key |
| ... | ... | ... | ... |

### Section 2: BSL Implementation Gaps
Priority-ordered list:
1. [HIGH] Field.Any uses S.Schema.Type<FieldConfig> instead of generic - Model.ts:117
2. [MEDIUM] Missing mapped type for PrimaryKeyColumns extraction
3. ...

### Section 3: Design Document Corrections
| Document | Section | Current Signature | Corrected Signature | Priority |
|----------|---------|-------------------|---------------------|----------|
| DSL-MODEL-DESIGN.md | 3.1 | Field<A,I,R> | Field<A,I,R,C> | HIGH |
| ... | ... | ... | ... | ... |

### Section 4: Correction Priority Order
1. Fix DSL-MODEL-DESIGN.md Section 3.1 (Field signature) - blocks all other fixes
2. Fix DSL-MODEL-DESIGN.md Section 2.1 (DSLField interface)
3. ...
```

### Phase 4: Apply Type Corrections (3 parallel agents)

**Agent 7: Fix DSL-MODEL-DESIGN.md**
```
Prompt: Apply all type corrections from Phase 2/3 critique.

File: /home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/DSL-MODEL-DESIGN.md

Key changes:
1. Make FieldConfig generic in Field signature
2. Make SqlConfig generic in Model signature
3. Update ModelSchemaInstance with full generic chain
4. Update all code examples with correct types
5. Add type-level tests as documentation

Ensure all code examples include required imports:
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";

Verify each fix preserves type information.
```

**Agent 8: Fix dsl-model-poc.prompt.md**
```
Prompt: Apply all type corrections from Phase 2/3 critique.

File: /home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/dsl-model-poc.prompt.md

Key changes:
1. Update Field factory with generic config (REQUIRED parameter, not optional)
2. Update Model factory with generic sql config
3. Fix extractColumns to preserve types
4. Fix toDrizzle to use correct type mappings
5. Add type assertion tests

Ensure all code examples include required imports.
Verify each fix preserves type information.
```

**Agent 9: Fix dsl-model.prompt.md**
```
Prompt: Apply all type corrections.

File: /home/elpresidank/YeeBois/projects/beep-effect/.specs/dsl-model/dsl-model.prompt.md

Key changes:
1. Update all generic signatures
2. Update examples with correct types
3. Align with corrected DSL-MODEL-DESIGN.md

Ensure all code examples include required imports.
Keep this document concise but type-correct.
```

### Phase 5: Final Verification (Single Agent)

**Agent 10: Automated Verification**
```
Prompt: Run automated verification of all corrections.

Steps:
1. Execute `bun run check` in monorepo root
2. Grep all design documents for forbidden patterns:
   - Native array methods: grep -E '\.(map|filter|forEach|find|reduce)\('
   - Native object methods: grep -E 'Object\.(keys|values|entries)'
   - Switch statements: grep -E 'switch\s*\('
3. Verify all code examples have required imports (grep for 'import \* as S')
4. Compare BSL implementation signatures with design document signatures

Output: PASS/FAIL report with:
- bun run check result
- List of any forbidden patterns found (file:line)
- List of code examples missing imports
- Signature comparison diff
```

---

## Examples

### Type Pattern 1: Generic Config Preservation

```typescript
import * as S from "effect/Schema";

// ❌ WRONG - config type lost
const Field = <A, I, R>(
  schema: S.Schema<A, I, R>,
  config?: FieldConfig
) => ...

// ✅ CORRECT - config type preserved (required parameter)
const Field = <A, I, R, C extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config: C
): DSLField<A, I, R, C> => ...
```

### Type Pattern 2: Mapped Type for Column Extraction

```typescript
import * as S from "effect/Schema";

// Extract primaryKey columns at type level
type PrimaryKeyColumns<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  [K in keyof Fields]: Fields[K]["config"]["column"]["primaryKey"] extends true ? K : never
}[keyof Fields];

// Usage: PrimaryKeyColumns<UserFields> = "_rowId"
```

### Type Pattern 3: Conditional Type for Variant Behavior

```typescript
import * as S from "effect/Schema";

// Exclude omitted fields from insert variant
type InsertFields<Fields extends Record<string, DSLField<any, any, any, any>>> = {
  [K in keyof Fields as Fields[K]["config"]["variants"]["insert"] extends "omit" ? never : K]:
    Fields[K]["config"]["variants"]["insert"] extends "optional"
      ? S.Schema.Type<Fields[K]> | undefined
      : S.Schema.Type<Fields[K]>
};
```

### Type Pattern 4: Literal Table Name

```typescript
import * as S from "effect/Schema";

// Table name should be a literal type, not string
interface ModelSchemaInstance<
  Self,
  Fields extends S.Struct.Fields,
  TableName extends string,  // ✅ Literal
  // ...
> {
  readonly tableName: TableName;  // Preserves "user" not string
}
```

### Edge Case 1: Optional Config with Defaults (Overload Pattern)

```typescript
import * as S from "effect/Schema";

// Default config for fields without explicit config
const DefaultFieldConfig = FieldConfig.make({
  column: StringColumnDef.make({ type: "string" }),
  variants: {}
});

// Overload 1: No config → uses DefaultFieldConfig
function Field<A, I, R>(
  schema: S.Schema<A, I, R>
): DSLField<A, I, R, typeof DefaultFieldConfig>;

// Overload 2: With config → preserves config type
function Field<A, I, R, C extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config: C
): DSLField<A, I, R, C>;

// Implementation handles both cases
function Field<A, I, R, C extends FieldConfig>(
  schema: S.Schema<A, I, R>,
  config?: C
): DSLField<A, I, R, C | typeof DefaultFieldConfig> {
  const resolvedConfig = config ?? DefaultFieldConfig;
  return createField(schema, resolvedConfig);
}
```

### Edge Case 2: Composite Primary Keys

```typescript
import * as S from "effect/Schema";
import * as A from "effect/Array";
import * as F from "effect/Function";

// Fields with multiple primary keys
type CompositePrimaryKey<Fields extends Record<string, DSLField<any, any, any, any>>> =
  F.pipe(
    // Extract all keys where primaryKey is true
    PrimaryKeyColumns<Fields>,
    // Result is a union of literal keys: "_rowId" | "tenantId"
  );

// Model with composite PK
const TenantUserFields = {
  _rowId: Field(S.Int, { column: { primaryKey: true } }),
  tenantId: Field(TenantId, { column: { primaryKey: true } }),
  name: Field(S.String, { column: { type: "string" } }),
} as const;

// Type: ["_rowId", "tenantId"]
type TenantUserPK = CompositePrimaryKey<typeof TenantUserFields>;
```

---

## Verification Checklist

### Type Correctness
- [ ] All 15+ `Field` signatures include generic `Config extends FieldConfig` parameter
- [ ] All 8+ `Model` signatures include generic `SqlConfig` parameter
- [ ] `DSLField` interface carries `Config` generic: `DSLField<A, I, R, Config>`
- [ ] `ModelSchemaInstance` exposes typed properties: `tableName`, `primaryKey`, `columns`
- [ ] 2 mapped types added: `PrimaryKeyColumns<Fields>` and `InsertFields<Fields>`
- [ ] All 25+ code examples compile without type errors (verified via `bun run check`)

### Forbidden Pattern Checks
- [ ] No native array methods in code examples (grep for `.map(`, `.filter(`, `.forEach(`)
- [ ] No native object methods (grep for `Object.keys`, `Object.values`)
- [ ] No switch statements (grep for `switch (`)
- [ ] No `any` or `unknown` types that lose information
- [ ] All code examples include required Effect imports

### Alignment
- [ ] Symbol-keyed properties used for type-level access
- [ ] Design documents align with BSL implementation in `packages/common/schema/src/BSL/`
- [ ] Drizzle intersection type pattern documented with Effect-first translation
- [ ] Config parameter is REQUIRED (not optional) in all Field signatures

---

## Metadata

### Research Sources

**Files Explored:**
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/Model.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/BSL/SqlMetadata.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/src/core/VariantSchema.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/src/common.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/column-builder.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/table.ts`
- `/home/elpresidank/YeeBois/projects/beep-effect/tmp/drizzle-orm/drizzle-orm/src/pg-core/columns/*.ts`

**Documentation Referenced:**
- Effect Schema API (via effect-researcher agent)
- Drizzle ORM source code

**AGENTS.md Consulted:**
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/common/schema/AGENTS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/domain/AGENTS.md`
- `/home/elpresidank/YeeBois/projects/beep-effect/packages/shared/tables/AGENTS.md`
- Root `CLAUDE.md`

### Refinement History

| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
| 1         | 3 HIGH, 8 MEDIUM | Added concrete counts, Effect-first translations, config optionality clarification, absolute paths, Phase 3 format, edge cases, forbidden pattern checks, error handling, Phase 5 actions, iteration budget |
