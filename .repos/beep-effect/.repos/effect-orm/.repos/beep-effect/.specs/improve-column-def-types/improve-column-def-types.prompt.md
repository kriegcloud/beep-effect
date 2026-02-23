---
name: improve-column-def-types
version: 1
created: 2024-12-28T00:00:00Z
iterations: 3
status: ready
---

# Improve Column Definition Types: ColumnDef → ColumnDefSchema.Generic

## Context

### Codebase
`beep-effect` monorepo — an Effect-first TypeScript application with strict coding standards enforced via AGENTS.md guidelines.

### Target Module
`packages/common/schema/src/integrations/sql/dsl/` (13 source files, ~3,800 lines)

### Test Suite
`packages/common/schema/test/integrations/sql/dsl/` (8 test files)

### Current State
The DSL module contains a legacy `ColumnDef` interface with generic type parameters:

```typescript
export interface ColumnDef<
  ColType extends ColumnType.Type = ColumnType.Type,
  PrimaryKey extends boolean = boolean,
  Unique extends boolean = boolean,
  AutoIncrement extends boolean = boolean,
> {
  readonly type: ColType;
  readonly primaryKey?: PrimaryKey;
  readonly unique?: Unique;
  readonly defaultValue?: undefined | string | (() => string);
  readonly autoIncrement?: AutoIncrement;
}
```

This interface has been superseded by `ColumnDefSchema`, a discriminated union of 8 type-specific schemas:
- **Without autoIncrement** (phantom type parameter): `StringColumnDefSchema`, `NumberColumnDefSchema`, `BooleanColumnDefSchema`, `DatetimeColumnDefSchema`, `UuidColumnDefSchema`, `JsonColumnDefSchema`
- **With autoIncrement**: `IntegerColumnDefSchema`, `BigintColumnDefSchema`

Each member schema has a `Generic` interface in its namespace that:
1. Uses `Type["property"]` references to stay in sync with schema changes
2. Includes `| undefined` suffix for `exactOptionalPropertyTypes` compatibility
3. Correctly models which properties are available per column type

### Target Pattern Example

The replacement `ColumnDefSchema.Generic` uses a **mapped type pattern** that provides precise types based on column type:

```typescript
// Example: StringColumnDefSchema.Generic (NO autoIncrement - natural arity)
export declare namespace StringColumnDefSchema {
  export interface Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
  > {
    readonly type: Type["type"];                    // Uses Type["..."] for sync
    readonly primaryKey?: PrimaryKey | undefined;  // | undefined for exactOptionalPropertyTypes
    readonly unique?: Unique | undefined;
    readonly defaultValue?: Type["defaultValue"];
  }
}

// Example: IntegerColumnDefSchema.Generic (WITH autoIncrement - natural arity)
export declare namespace IntegerColumnDefSchema {
  export interface Generic<
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    AutoIncrement extends boolean = boolean,  // Only integer/bigint have this param
  > {
    readonly type: Type["type"];
    readonly primaryKey?: PrimaryKey | undefined;
    readonly unique?: Unique | undefined;
    readonly autoIncrement?: AutoIncrement | undefined;  // Present on integer/bigint only
    readonly defaultValue?: Type["defaultValue"];
  }
}

// Mapped type using GenericMap for indexed access
export declare namespace ColumnDefSchema {
  // Lookup table mapping ColumnType.Type to member Generic interfaces
  export type GenericMap<
    PrimaryKey extends boolean,
    Unique extends boolean,
    AutoIncrement extends boolean,
  > = {
    readonly string: StringColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly number: NumberColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly integer: IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>;
    readonly boolean: BooleanColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly datetime: DatetimeColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly uuid: UuidColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly json: JsonColumnDefSchema.Generic<PrimaryKey, Unique>;
    readonly bigint: BigintColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>;
  };

  // Mapped type with T as first param for precise type selection
  export type Generic<
    T extends ColumnType.Type = ColumnType.Type,  // Column type selector
    PrimaryKey extends boolean = boolean,
    Unique extends boolean = boolean,
    AutoIncrement extends boolean = boolean,
  > = GenericMap<PrimaryKey, Unique, AutoIncrement>[T];
}
```

**Key patterns to follow**:
- Use `Type["property"]` instead of literal types to prevent drift
- Add `| undefined` to optional properties for `exactOptionalPropertyTypes`
- **No phantom type parameters** — each member has its natural arity
- **Mapped type pattern** — `T extends ColumnType.Type` as first param enables:
  - `Generic<"integer">` → precise `IntegerColumnDefSchema.Generic` type
  - `Generic` (no T) → union of all member types via indexed access distribution

**Note**: These Generic interfaces already exist in `types.ts` and should be used as direct replacements for the legacy `ColumnDef` interface. The refactoring task is to update all usages of `ColumnDef` to reference `ColumnDefSchema.Generic` (or member-specific Generic interfaces where appropriate).

### Invariants Enforced
- `INV-SQL-AI-001`: autoIncrement requires integer or bigint type (enforced at type level, not just runtime)

### Module Architecture

```
types.ts (1,170 lines) ← Foundation: ColumnDef, ColumnDefSchema, DSLField, DSLVariantField
    ↓
Field.ts (315 lines) ← Field() factory with 3 overloads
Model.ts (493 lines) ← Model() factory, ExtractColumnsType, ExtractPrimaryKeys
    ↓
combinators.ts (445 lines) ← Pipe-friendly combinators (uuid(), primaryKey(), etc.)
validate.ts (486 lines) ← Runtime invariant validators
    ↓
adapters/drizzle.ts (~350 lines) ← toDrizzle() conversion with type mappers
```

### Critical Files for Refactoring
1. **types.ts**: Defines ColumnDef interface (must be removed first)
2. **Field.ts**: Uses ExactColumnDef, DerivedColumnDefFromSchema extensively
3. **Model.ts**: Uses ColumnDef in ExtractColumnsType, ExtractPrimaryKeys, defaultColumnDef
4. **adapters/drizzle.ts**: Uses ColumnDef for ApplyNotNull, ApplyPrimaryKey, etc.

---

## Objective

### Primary Goal
Remove the legacy `ColumnDef` interface and all derived types (`ExactColumnDef`, `DerivedColumnDefFromSchema`) from the DSL module, replacing all usages with `ColumnDefSchema.Generic` or appropriate member-specific Generic interfaces.

### Measurable Outcomes
1. Zero references to `ColumnDef` interface remain (excluding `ColumnDefSchema` references)
2. Zero references to `ExactColumnDef` type remain
3. Zero references to `DerivedColumnDefFromSchema` type remain
4. All existing tests pass: `bun run test --filter=@beep/schema`
5. Type checking passes: `bunx turbo run check --filter=@beep/schema`
6. No regression in type safety — discriminated union benefits preserved
7. INV-SQL-AI-001 still enforced at type level

### Success Verification Command
```bash
grep -r "ColumnDef" packages/common/schema/src/integrations/sql/dsl/ | grep -v "ColumnDefSchema"
# Expected: zero matches
```

---

## Role

You are an **Orchestrator Agent** responsible for coordinating a multi-phase refactoring effort.

### Primary Functions
- Delegate research and implementation tasks to sub-agents (via `Task` tool)
- Preserve your own context window for synthesis and decision-making
- Synthesize sub-agent outputs into cohesive documentation
- Make architectural decisions based on aggregated findings
- Validate that refactoring maintains type safety and passes all checks

### Critical Directive
You MUST use sub-agents for ALL exploratory, research, and implementation work. Your role is to:
- Define clear task boundaries with explicit deliverables
- Provide sub-agents with relevant context from prior phases
- Run validation commands after each sub-agent completes
- Document decisions and rationale

---

## Constraints

### Effect-First Patterns (MANDATORY)

**Import Conventions**:
```typescript
import * as A from "effect/Array";
import * as F from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Struct from "effect/Struct";
import * as R from "effect/Record";
import * as P from "effect/Predicate";
import * as Match from "effect/Match";
import * as AST from "effect/SchemaAST";
```

### FORBIDDEN Patterns

Sub-agents MUST NOT use these patterns. If found in existing code, they should be flagged but NOT refactored unless directly related to ColumnDef removal:

| Forbidden | Required Replacement |
|-----------|---------------------|
| `items.map(fn)` | `F.pipe(items, A.map(fn))` |
| `items.filter(fn)` | `F.pipe(items, A.filter(fn))` |
| `str.split(x)` | `F.pipe(str, Str.split(x))` |
| `str.includes(x)` | `F.pipe(str, Str.includes(x))` |
| `Object.keys(obj)` | `F.pipe(obj, Struct.keys)` |
| `switch (x) { ... }` | `Match.value(x).pipe(Match.when(...))` |
| `typeof x === "string"` | `P.isString(x)` |
| `x instanceof Date` | `P.isDate(x)` |
| `async/await` | `Effect.gen` or `Effect.tryPromise` |
| `any` type | Proper type annotation |
| `@ts-ignore` | Fix the type error |

### @beep/schema Specific Rules

1. **Purity**: Schemas must be pure — no I/O, side effects, network calls, or platform-specific APIs
2. **Exports**: All public symbols export through `src/schema.ts` (BS namespace)
3. **SQL DSL**: Emits column builders/annotations only — NEVER executes queries
4. **Annotations**: Provide rich annotations (`identifier`, `title`, `description`, `jsonSchema`)
5. **Cross-slice imports**: FORBIDDEN from `@beep/iam-*`, `@beep/documents-*`

### Effect Schema Patterns for This Refactoring

1. **Generic Interfaces**: Use `Type["property"]` pattern to prevent type drift
2. **Optional Properties**: Add `| undefined` suffix for `exactOptionalPropertyTypes`
3. **Phantom Type Parameters**: Use `_AutoIncrement extends boolean = boolean` for types without the feature
4. **Discriminated Unions**: Member schemas use `S.tag` or literal `type` field as discriminator

### TypeScript Configuration: exactOptionalPropertyTypes

This codebase enables `exactOptionalPropertyTypes` in `tsconfig.json`. This setting changes how TypeScript handles optional properties:

```typescript
// With exactOptionalPropertyTypes: true
interface Example {
  name?: string;           // ❌ Cannot assign undefined explicitly
  name?: string | undefined; // ✅ Allows explicit undefined assignment
}

const obj: Example = { name: undefined }; // Only valid with | undefined
```

**Why this matters for ColumnDefSchema.Generic**:
- All optional properties (`primaryKey?`, `unique?`, `autoIncrement?`) MUST include `| undefined`
- Without it, TypeScript will error when explicitly passing `undefined` to these properties
- The `Type["property"]` pattern automatically handles this for properties derived from schemas

### Error Handling During Refactoring

**Cascading Type Errors**: When removing `ColumnDef`, expect cascading type errors. Handle them by:
1. **Don't panic**: Initial removal will cause 50+ errors — this is expected
2. **Work top-down**: Fix types.ts first, then files that import from it
3. **Use temporary `any`**: If stuck, temporarily use `any` with a `// TODO: Fix ColumnDef migration` comment, then return to fix
4. **Validate incrementally**: Run type check after each file, not just at the end

**If Type Check Fails**:
1. Read the full error message — TypeScript often suggests the fix
2. Check if the error is in a file you haven't migrated yet (expected)
3. Verify the Generic interface has correct type parameters
4. Ensure `| undefined` is present on optional properties

---

## Resources

### Files to Read (Phase 1)
| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Core type definitions |
| `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Field() factory |
| `packages/common/schema/src/integrations/sql/dsl/Model.ts` | Model() factory |
| `packages/common/schema/src/integrations/sql/dsl/combinators.ts` | Pipe-friendly combinators |
| `packages/common/schema/src/integrations/sql/dsl/validate.ts` | Runtime validators |
| `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` | AST column derivation |
| `packages/common/schema/src/integrations/sql/dsl/nullability.ts` | Nullability analysis |
| `packages/common/schema/src/integrations/sql/dsl/errors.ts` | Error schemas |
| `packages/common/schema/src/integrations/sql/dsl/literals.ts` | String literal kits |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Drizzle adapter |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle-to-effect-schema.ts` | Reverse adapter |
| `packages/common/schema/src/integrations/sql/dsl/index.ts` | Public exports |

### Test Files (Phase 1)
| File | Coverage |
|------|----------|
| `packages/common/schema/test/integrations/sql/dsl/poc.test.ts` | Proof of concept |
| `packages/common/schema/test/integrations/sql/dsl/combinators.test.ts` | Combinator functions |
| `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts` | Column type derivation |
| `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts` | Drizzle integration |
| `packages/common/schema/test/integrations/sql/dsl/field-model-comprehensive.test.ts` | Field/Model integration |
| `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts` | VariantSchema support |
| `packages/common/schema/test/integrations/sql/dsl/invariants/sql-standard.test.ts` | SQL standard invariants |
| `packages/common/schema/test/integrations/sql/dsl/invariants/model-composition.test.ts` | Model composition |

### Validation Commands
```bash
# Type checking
bunx turbo run check --filter=@beep/schema

# Run tests
bun run test --filter=@beep/schema

# Verify no ColumnDef references remain
grep -r "ColumnDef" packages/common/schema/src/integrations/sql/dsl/ | grep -v "ColumnDefSchema"
```

---

## Output Specification

### Phase 1 Deliverables (Module Exploration)
Create reports in `.specs/improve-column-def-types/module-reports/`:
- `types.report.md` — types.ts analysis
- `field.report.md` — Field.ts analysis (CRITICAL)
- `model.report.md` — Model.ts analysis (CRITICAL)
- `combinators.report.md` — combinators.ts analysis
- `derive-column-type.report.md` — derive-column-type.ts + nullability.ts
- `validate.report.md` — validate.ts analysis
- `errors-literals.report.md` — errors.ts + literals.ts
- `adapters.report.md` — adapters analysis (CRITICAL)
- `index.report.md` — index.ts exports
- `tests.report.md` — test files analysis
- **Synthesis**: `dsl-module.report.md` at spec root

### Phase 2 Deliverables (Usage Analysis)
Create reports in `.specs/improve-column-def-types/column-def-usages/`:
- `types-col-def-usage.report.md`
- `field-col-def-usage.report.md` (CRITICAL)
- `model-col-def-usage.report.md` (CRITICAL)
- `combinators-col-def-usage.report.md`
- `adapters-col-def-usage.report.md` (CRITICAL)
- `validate-col-def-usage.report.md`
- `tests-col-def-usage.report.md`
- **Synthesis**: `col-def-usages.md` at spec root

### Phase 3 Deliverables (Refactoring)
- Refactored source files (in-place modifications)
- Updated test files
- Passing type checks and tests
- **Synthesis**: `refactoring-summary.md` at spec root

### Report Structure Template
```markdown
# [Component] Analysis Report

## Overview
[Brief description of file purpose and scope]

## ColumnDef Usages
| Location | Usage Pattern | Proposed Replacement | Complexity |
|----------|---------------|---------------------|------------|
| file:line | `C extends ColumnDef` | `C extends ColumnDefSchema.Generic` | Simple |

## Dependencies
[Import/export relationships]

## Challenges
[Any difficulties or edge cases identified]

## Recommendations
[Specific refactoring steps]
```

---

## Execution Plan

### Phase 1: Module Exploration
**Objective**: Build comprehensive understanding of DSL module structure.

1. **Task 1.0**: File Discovery (safety net) — list all files in source and test directories
2. **Tasks 1.1-1.10**: Explore each file/group, create module reports
3. **Synthesis**: Read all reports, create `dsl-module.report.md`

### Phase 2: Usage Analysis
**Objective**: Catalog every ColumnDef usage and plan migration.

1. **Tasks 2.1-2.7**: Analyze each file for ColumnDef usages
2. **Synthesis**: Create `col-def-usages.md` with migration plan

### Phase 3: Refactoring Execution
**Objective**: Execute migration with incremental validation.

**Order** (based on dependencies):
1. `types.ts` — Foundation, remove ColumnDef interface
2. `Field.ts` — Update ExactColumnDef, DerivedColumnDefFromSchema
3. `Model.ts` — Update ExtractColumnsType, ExtractPrimaryKeys
4. `adapters/drizzle.ts` — Update type mappers
5. `combinators.ts`, `validate.ts`, `index.ts` — Re-exports and runtime
6. Test files — Update last

**Validation Gate**: After each file, run `bunx turbo run check --filter=@beep/schema`

### Rollback Strategy

If refactoring becomes intractable at any point:

1. **Git Reset**: Use `git checkout -- packages/common/schema/src/integrations/sql/dsl/` to reset all changes
2. **Preserve Reports**: Module and usage reports remain valid for future attempts
3. **Document Blockers**: Add findings to `refactoring-summary.md` explaining what blocked progress
4. **Partial Success**: If some files are migrated successfully, commit those and document remaining work

**Commit Strategy**:
- Commit after each successful file migration (not at the end)
- Use descriptive commit messages: `refactor(schema): migrate Field.ts from ColumnDef to ColumnDefSchema.Generic`
- If a file's migration is partial, don't commit — complete it first

---

## Edge Cases

### Known Complexity Areas

1. **Conditional Types in Field.ts**: `DerivedColumnDefFromSchema` uses complex conditional types that may need careful rewriting
2. **Mapped Types in Model.ts**: `ExtractColumnsType` and `ExtractPrimaryKeys` use mapped types over ColumnDef
3. **Type Inference in adapters/drizzle.ts**: Drizzle type mappers (`ApplyNotNull`, `ApplyPrimaryKey`) use ColumnDef constraints
4. **Circular Dependencies**: Check for circular imports between types.ts, Field.ts, and Model.ts

### Mapped Type Pattern for Generic

`ColumnDefSchema.Generic` uses a mapped type pattern with `T extends ColumnType.Type` as the first parameter:

```typescript
// Each member has its natural arity - NO phantom params needed
StringColumnDefSchema.Generic<PrimaryKey, Unique>           // 2 params
IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AI>      // 3 params

// GenericMap handles the arity differences via indexed access
ColumnDefSchema.Generic<T, PrimaryKey, Unique, AutoIncrement>
// When T = "string" → StringColumnDefSchema.Generic<PrimaryKey, Unique>
// When T = "integer" → IntegerColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>
```

**Benefits over union approach**:
1. No phantom type parameters cluttering member interfaces
2. Precise types when column type is known at compile time
3. Same union behavior when column type is unknown (defaults to full ColumnType.Type)

### Union Narrowing

When consuming `ColumnDefSchema.Generic`, use the `type` discriminator to narrow:
```typescript
const handleColumnDef = (def: ColumnDefSchema.Generic) => {
  if (def.type === "integer" || def.type === "bigint") {
    // def.autoIncrement is available here
  }
};
```

---

## Verification Checklist

### Pre-Refactoring
- [ ] All module reports complete (11 files)
- [ ] All usage reports complete (7 files)
- [ ] `dsl-module.report.md` synthesized
- [ ] `col-def-usages.md` synthesized with migration plan
- [ ] Migration order validated against dependency graph

### During Refactoring
- [ ] types.ts: ColumnDef interface removed
- [ ] types.ts: ExactColumnDef removed
- [ ] types.ts: DerivedColumnDefFromSchema removed or refactored
- [ ] Field.ts: All ColumnDef references updated to ColumnDefSchema.Generic
- [ ] Model.ts: ExtractColumnsType updated
- [ ] Model.ts: ExtractPrimaryKeys updated
- [ ] Model.ts: defaultColumnDef updated
- [ ] adapters/drizzle.ts: All type mappers updated
- [ ] Type check passes after each file

### Post-Refactoring
- [ ] `grep -r "ColumnDef" ... | grep -v "ColumnDefSchema"` returns zero matches
- [ ] `bunx turbo run check --filter=@beep/schema` passes
- [ ] `bun run test --filter=@beep/schema` passes
- [ ] INV-SQL-AI-001 still enforced (autoIncrement requires integer/bigint)
- [ ] ColumnDefSchema.Generic correctly constrains DSLField, DSLVariantField
- [ ] All member Generic interfaces work correctly
- [ ] `refactoring-summary.md` documents all changes

### Quality Assurance
- [ ] No `any` types introduced
- [ ] No `@ts-ignore` added
- [ ] No forbidden patterns introduced (native array/string methods, switch, etc.)
- [ ] All new code follows Effect-first patterns
- [ ] Type["property"] pattern used for drift prevention
- [ ] `| undefined` suffix added for exactOptionalPropertyTypes

---

## Metadata

### Research Sources
**Files Explored**:
- `packages/common/schema/src/integrations/sql/dsl/*` (13 source files)
- `packages/common/schema/test/integrations/sql/dsl/*` (8 test files)

**Documentation Consulted**:
- Effect Schema discriminated unions
- Effect `S.tag` pattern
- Generic interface extraction patterns
- Phantom type parameter patterns

**AGENTS.md Files**:
- `/AGENTS.md` — Repository-wide standards
- `packages/common/schema/AGENTS.md` — Package-specific guidelines

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial refinement | Added frontmatter, constraints section, verification checklist |
| 1 | Missing target pattern example, exactOptionalPropertyTypes unexplained, error handling unspecified, test paths incomplete | Added Target Pattern Example section with code, added exactOptionalPropertyTypes explanation, added Error Handling During Refactoring section, added full test file paths, added Edge Cases section, added Rollback Strategy |
| 2 | MEDIUM: Unclear if Generic interfaces exist, LOW: file count inconsistency, LOW: Phase 3 ordering | Added clarifying note that Generic interfaces already exist in types.ts; critic passed with PASS verdict |
| 3 | Design improvement: union type → mapped type | Replaced union-based ColumnDefSchema.Generic with mapped type pattern using GenericMap indexed by ColumnType.Type; removed phantom type parameters from member Generic interfaces; updated Target Pattern Example and Edge Cases sections |
