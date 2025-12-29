# Improve Column Definition Types: ColumnDef → ColumnDefSchema.Generic

## COSTAR+CRISPE Hybrid Prompt

---

### Capacity/Role

You are an **Orchestrator Agent** responsible for coordinating a multi-phase refactoring effort. Your primary function is to delegate research and implementation tasks to sub-agents while preserving your own context window for synthesis, decision-making, and quality assurance.

**Critical Directive**: You MUST use sub-agents (via the `Task` tool) for all exploratory, research, and implementation work. Your role is to:
- Define clear task boundaries for sub-agents
- Provide sub-agents with relevant context from prior phases
- Synthesize sub-agent outputs into cohesive documentation
- Make architectural decisions based on aggregated findings
- Validate that refactoring maintains type safety and passes all checks

---

### Context

**Codebase**: `beep-effect` monorepo (Effect-first TypeScript)

**Target Module**: `packages/common/schema/src/integrations/sql/dsl/`

**Test Suite**: `packages/common/schema/test/integrations/sql/dsl/`

**Background**:
The DSL module was originally built with a generic `ColumnDef` interface that accepts type parameters for column configuration:

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

This interface has been superseded by a discriminated union schema system (`ColumnDefSchema`) with type-specific member schemas that enforce invariants at the type level:

- `StringColumnDefSchema`, `NumberColumnDefSchema`, `BooleanColumnDefSchema`, `DatetimeColumnDefSchema`, `UuidColumnDefSchema`, `JsonColumnDefSchema` — **NO autoIncrement** (phantom type parameter)
- `IntegerColumnDefSchema`, `BigintColumnDefSchema` — **WITH autoIncrement**

Each member schema has a `Generic` interface in its namespace that:
1. Uses `Type["..."]` references to stay in sync with schema changes
2. Includes `| undefined` for `exactOptionalPropertyTypes` compatibility
3. Correctly models which properties are available per column type

The union type `ColumnDefSchema.Generic<PrimaryKey, Unique, AutoIncrement>` combines all members.

**Invariants Enforced**:
- `INV-SQL-AI-001`: autoIncrement requires integer or bigint type (enforced by type structure, not just runtime validation)

---

### Objective

**Primary Goal**: Remove the legacy `ColumnDef` interface and all derived types (`ExactColumnDef`, `DerivedColumnDefFromSchema`, etc.) from the DSL module, replacing all usages with `ColumnDefSchema.Generic` or appropriate member-specific Generic interfaces.

**Measurable Outcomes**:
1. Zero references to `ColumnDef` interface remain in the DSL module
2. Zero references to `ExactColumnDef` type remain
3. Zero references to `DerivedColumnDefFromSchema` type remain (or refactored to use schema-based derivation)
4. All existing tests pass (`bun run test --filter=@beep/schema`)
5. Type checking passes (`bunx turbo run check --filter=@beep/schema`)
6. No regression in type safety—discriminated union benefits are preserved

---

### Style

**Documentation Structure**:
- All reports use Markdown with clear headings
- Code references include file paths and line numbers
- Changes are documented with before/after examples
- Decisions include rationale

**Report Naming Conventions**:
- Module exploration: `.specs/improve-column-def-types/module-reports/<component>.report.md`
- Usage analysis: `.specs/improve-column-def-types/column-def-usages/<component>-col-def-usage.report.md`
- Synthesis documents at spec root: `.specs/improve-column-def-types/<name>.md`

---

### Tone

**Systematic and Methodical**: Follow the phased approach precisely. Do not skip phases or combine steps that should be separate.

**Exploratory in Research**: Sub-agents should thoroughly explore before concluding. Unknown edge cases are expected.

**Conservative in Refactoring**: Prefer minimal changes that preserve behavior. Flag any changes that alter semantics for review.

---

### Audience

**Executor**: Claude Opus 4.5 instance with access to the full `beep-effect` codebase via Claude Code tooling.

**Sub-agents**: Spawned via `Task` tool with specific, bounded prompts. Each sub-agent operates independently and produces a deliverable.

---

### Response/Deliverables

**Phase 1 Deliverables**:
- `module-reports/types.report.md` — Analysis of `types.ts`
- `module-reports/field.report.md` — Analysis of `Field.ts` (CRITICAL: heavy ColumnDef usage)
- `module-reports/model.report.md` — Analysis of `Model.ts` (CRITICAL: heavy ColumnDef usage)
- `module-reports/combinators.report.md` — Analysis of `combinators.ts`
- `module-reports/derive-column-type.report.md` — Analysis of `derive-column-type.ts`
- `module-reports/nullability.report.md` — Analysis of `nullability.ts`
- `module-reports/validate.report.md` — Analysis of `validate.ts`
- `module-reports/errors-literals.report.md` — Analysis of `errors.ts` and `literals.ts`
- `module-reports/adapters.report.md` — Analysis of `adapters/drizzle.ts` and `drizzle-to-effect-schema.ts`
- `module-reports/index.report.md` — Analysis of `index.ts` exports
- `module-reports/tests.report.md` — Analysis of test files (8 test files + invariants subdirectory)
- **Synthesis**: `dsl-module.report.md` — Consolidated module understanding

**Phase 2 Deliverables**:
- `column-def-usages/types-col-def-usage.report.md`
- `column-def-usages/field-col-def-usage.report.md` (CRITICAL: contains ExactColumnDef, DerivedColumnDefFromSchema)
- `column-def-usages/model-col-def-usage.report.md` (CRITICAL: contains ExtractColumnsType, ExtractPrimaryKeys)
- `column-def-usages/combinators-col-def-usage.report.md`
- `column-def-usages/adapters-col-def-usage.report.md` (CRITICAL: Drizzle conversion uses ColumnDef)
- `column-def-usages/validate-col-def-usage.report.md`
- `column-def-usages/tests-col-def-usage.report.md`
- **Synthesis**: `col-def-usages.md` — Consolidated usage analysis with migration plan

**Phase 3 Deliverables**:
- Refactored source files
- Updated test files
- Passing type checks and tests
- `refactoring-summary.md` — Changes made and decisions taken

---

### Insight (Domain Knowledge)

**Effect Schema Patterns**:
- Schemas define both runtime validation and static types
- `typeof Schema.Type` extracts the TypeScript type
- `typeof Schema.Encoded` extracts the encoded/serialized type
- Discriminated unions use `_tag` or a discriminator field (here: `type`)

**DSL Module Architecture** (14 source files):

*Core Type Definitions*:
- `literals.ts` — `ColumnType` and `ModelVariant` string literal kits
- `types.ts` — Type definitions, `ColumnDef`, `ColumnDefSchema`, `DSLField`, `DSLVariantField`, `ExactColumnDef`, `DerivedColumnDefFromSchema`

*Factory Functions*:
- `Field.ts` — `Field()` factory (curried API for creating DSLField/DSLVariantField)
- `Model.ts` — `Model()` factory (creates Model class with variant schemas)
- `combinators.ts` — Re-exports and additional combinator utilities

*Utilities*:
- `derive-column-type.ts` — AST-based column type derivation (`deriveColumnType`)
- `nullability.ts` — AST-based nullability analysis (`isNullable`)
- `validate.ts` — Runtime invariant validators
- `errors.ts` — Tagged error schemas for validation failures
- `relations.ts` — Relation definitions (currently minimal)

*Adapters*:
- `adapters/drizzle.ts` — DSL Model to Drizzle `PgTable` conversion (`toDrizzle`)
- `adapters/drizzle-to-effect-schema.ts` — Drizzle table to Effect Schema conversion

*Exports*:
- `index.ts` — Public API exports

**Key Types to Understand**:
- `DSLField<A, I, R, C extends ColumnDef>` — Schema with column metadata
- `DSLVariantField<A, C extends ColumnDef>` — Variant field with column metadata
- `FieldResult<Input, C extends ColumnDef>` — Conditional return type for Field factory
- `ModelClass`, `ModelClassWithVariants` — Model class interfaces with column records

---

### Experiment (Iteration Approach)

**Incremental Validation**:
After each sub-agent completes refactoring work, run:
```bash
bunx turbo run check --filter=@beep/schema
bun run test --filter=@beep/schema
```

**Fallback Strategy**:
If a refactoring introduces type errors that are difficult to resolve:
1. Document the issue in the refactoring report
2. Consider whether the issue reveals a gap in `ColumnDefSchema.Generic`
3. If needed, extend the Generic interfaces before continuing

**Edge Cases to Watch**:
- Generic type parameters that flow through multiple levels
- Conditional types that branch on `ColumnDef` properties
- Places where `ColumnDef` is used as a constraint vs. a concrete type

---

## Execution Plan

### Phase 1: Module Exploration

**Objective**: Build comprehensive understanding of the DSL module structure.

**Sub-Agent Tasks** (spawn each as a separate Task):

#### Task 1.0: File Discovery (Safety Net)
```
List all files in the DSL module directory and test directory:
- `packages/common/schema/src/integrations/sql/dsl/`
- `packages/common/schema/test/integrations/sql/dsl/`

Produce a complete file inventory to ensure no files are missed during exploration.
This is a quick sanity check before detailed exploration begins.

Output: List of all files found (no separate report needed, include in orchestrator notes)
```

#### Task 1.1: Explore types.ts (CORE)
```
Explore the file `packages/common/schema/src/integrations/sql/dsl/types.ts`.

Document:
1. All type definitions and their purposes
2. The relationship between ColumnDef interface and ColumnDefSchema discriminated union
3. How DSLField and DSLVariantField are parameterized by ColumnDef
4. The ExactColumnDef and DerivedColumnDefFromSchema utility types
5. The ColumnDefSchema.Generic union and all member Generic interfaces
6. Type-level validation utilities (ValidateSchemaColumn, SchemaColumnError)

Output: Create `.specs/improve-column-def-types/module-reports/types.report.md`
```

#### Task 1.2: Explore Field.ts (CRITICAL)
```
Explore the file `packages/common/schema/src/integrations/sql/dsl/Field.ts`.

This is a CRITICAL file for the refactoring as it contains the Field() factory.

Document:
1. All Field() function overload signatures (Schema, VariantSchema.Field, etc.)
2. The configurator types: SchemaConfiguratorWithSchema, LocalVariantConfiguratorWithSchema, ExperimentalVariantConfiguratorWithSchema
3. How ColumnDef, ExactColumnDef, and DerivedColumnDefFromSchema are used
4. The FieldConfig type and how column configuration flows through
5. Runtime implementation details (ColumnMetaSymbol attachment)
6. ExtractColumnType and ExtractVariantSelectEncoded helper types

Output: Create `.specs/improve-column-def-types/module-reports/field.report.md`
```

#### Task 1.3: Explore Model.ts (CRITICAL)
```
Explore the file `packages/common/schema/src/integrations/sql/dsl/Model.ts`.

This is a CRITICAL file for the refactoring as it contains the Model() factory.

Document:
1. The Model() factory function signature and implementation
2. ExtractColumnsType<Fields> type - how it extracts ColumnDef from fields
3. ExtractPrimaryKeys<Fields> type - how it identifies primary key fields
4. The defaultColumnDef constant and getColumnDef() function
5. How column metadata flows from Field to Model
6. VariantSchema integration (toVariantFields, variant extraction)
7. Model validation logic that uses ColumnDef

Output: Create `.specs/improve-column-def-types/module-reports/model.report.md`
```

#### Task 1.4: Explore combinators.ts
```
Explore the file `packages/common/schema/src/integrations/sql/dsl/combinators.ts`.

Document:
1. What is re-exported from Field.ts and Model.ts
2. Any additional combinator utilities
3. Public API surface exposed by this file

Note: Field() and Model() are now in separate files, so this file may primarily be re-exports.

Output: Create `.specs/improve-column-def-types/module-reports/combinators.report.md`
```

#### Task 1.5: Explore derive-column-type.ts and nullability.ts
```
Explore the files:
- `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`
- `packages/common/schema/src/integrations/sql/dsl/nullability.ts`

Document:
1. deriveColumnType() function - AST-based column type derivation
2. isNullable() function - AST-based nullability analysis
3. How these utilities interact with ColumnType (but likely not ColumnDef directly)
4. DateSchemaId and BigIntSchemaId string literal kits

Output: Create `.specs/improve-column-def-types/module-reports/derive-column-type.report.md`
```

#### Task 1.6: Explore validate.ts
```
Explore the file `packages/common/schema/src/integrations/sql/dsl/validate.ts`.

Document:
1. All validation functions and their signatures
2. How ColumnDef is used in validation logic
3. The relationship between runtime validation and type-level invariants
4. Invariant codes referenced (INV-SQL-AI-001, INV-SQL-PK-001, etc.)

Output: Create `.specs/improve-column-def-types/module-reports/validate.report.md`
```

#### Task 1.7: Explore errors.ts and literals.ts
```
Explore the files:
- `packages/common/schema/src/integrations/sql/dsl/errors.ts`
- `packages/common/schema/src/integrations/sql/dsl/literals.ts`

Document:
1. All error schemas (AutoIncrementTypeError, NullablePrimaryKeyError, etc.)
2. ColumnType and ModelVariant string literal kits (how they're constructed)
3. Any references to ColumnDef in error types

Output: Create `.specs/improve-column-def-types/module-reports/errors-literals.report.md`
```

#### Task 1.8: Explore adapters (CRITICAL)
```
Explore the files:
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle-to-effect-schema.ts`

The drizzle.ts adapter is CRITICAL as it uses ColumnDef extensively.

Document:
1. toDrizzle() function - converts DSL Model to Drizzle PgTable
2. DrizzleBaseBuilderFor, DrizzleTypedBuilderFor type mappings
3. ApplyNotNull, ApplyPrimaryKey, ApplyHasDefault, ApplyAutoincrement modifiers
4. How ColumnDef properties map to Drizzle column modifiers
5. columnBuilder() function and its ColumnDef parameter
6. drizzle-to-effect-schema.ts - reverse conversion (may not use ColumnDef)

Output: Create `.specs/improve-column-def-types/module-reports/adapters.report.md`
```

#### Task 1.9: Explore test files
```
Explore the test directory `packages/common/schema/test/integrations/sql/dsl/`.

Test files to analyze:
- poc.test.ts
- combinators.test.ts
- derive-column-type.test.ts
- drizzle-typed-columns.test.ts
- field-model-comprehensive.test.ts
- variant-integration.test.ts
- invariants/model-composition.test.ts
- invariants/sql-standard.test.ts

Document:
1. Each test file's purpose and coverage
2. How tests create and use ColumnDef values
3. Type-level tests (if any) vs runtime tests
4. Test coverage of the ColumnDefSchema system
5. Tests that will need updating after ColumnDef removal

Output: Create `.specs/improve-column-def-types/module-reports/tests.report.md`
```

#### Task 1.10: Explore index.ts exports
```
Explore `packages/common/schema/src/integrations/sql/dsl/index.ts`.

Document:
1. All public exports (types and values)
2. Which ColumnDef-related types are part of the public API
3. Import graph - what gets imported from where
4. Downstream consumers that may be affected (search for usages outside DSL module)

Output: Create `.specs/improve-column-def-types/module-reports/index.report.md`
```

**Synthesis** (Orchestrator):
After all Phase 1 sub-agents complete, read all reports and create:
`.specs/improve-column-def-types/dsl-module.report.md`

This synthesis should:
- Provide a unified view of the module architecture with accurate file structure
- Identify ALL ColumnDef touchpoints across all files
- Map dependencies between components (import graph)
- Highlight the three CRITICAL files: Field.ts, Model.ts, adapters/drizzle.ts
- Prioritize refactoring order based on dependencies
- Note any unexpected findings from file discovery

---

### Phase 2: Usage Analysis

**Objective**: Catalog every ColumnDef usage and plan the migration.

**Sub-Agent Tasks** (provide `dsl-module.report.md` as context):

#### Task 2.1: Analyze types.ts ColumnDef usages
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

Analyze `packages/common/schema/src/integrations/sql/dsl/types.ts` for all usages of:
- ColumnDef interface (definition and all references)
- ExactColumnDef type
- DerivedColumnDefFromSchema type
- DSLField<..., C extends ColumnDef> type parameter
- DSLVariantField<..., C extends ColumnDef> type parameter
- Any other type that extends or references ColumnDef

For each usage, document:
1. Location (file:line)
2. Current usage pattern (show code snippet)
3. Proposed replacement using ColumnDefSchema.Generic
4. Any challenges or considerations

Output: Create `.specs/improve-column-def-types/column-def-usages/types-col-def-usage.report.md`
```

#### Task 2.2: Analyze Field.ts ColumnDef usages (CRITICAL)
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

This file has HEAVY ColumnDef usage. Analyze `packages/common/schema/src/integrations/sql/dsl/Field.ts` for:
- Import of ColumnDef, ExactColumnDef, DerivedColumnDefFromSchema from types.ts
- SchemaConfiguratorWithSchema<Schema> return type using ExactColumnDef<C>
- LocalVariantConfiguratorWithSchema<VC> and ExperimentalVariantConfiguratorWithSchema<VC>
- Field() function overloads and implementation with Partial<ColumnDef>
- ExtractColumnType<C extends Partial<ColumnDef>> helper type
- Runtime columnDef construction: `as ExactColumnDef<C>`

For each usage, document:
1. Location (file:line)
2. Current usage pattern (show code snippet)
3. Proposed replacement using ColumnDefSchema.Generic or member-specific Generic
4. Impact on Field() public API signatures
5. Any type inference challenges

Output: Create `.specs/improve-column-def-types/column-def-usages/field-col-def-usage.report.md`
```

#### Task 2.3: Analyze Model.ts ColumnDef usages (CRITICAL)
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

This file has HEAVY ColumnDef usage. Analyze `packages/common/schema/src/integrations/sql/dsl/Model.ts` for:
- Import of ColumnDef from types.ts
- ExtractColumnsType<Fields> type - extracts ColumnDef from DSLField/DSLVariantField
- ExtractPrimaryKeys<Fields> type - checks for { primaryKey: true }
- defaultColumnDef constant: `ColumnDef<"string", false, false, false>`
- getColumnDef() function return type
- derivePrimaryKey<Columns extends Record<string, ColumnDef>>() parameter
- validateModelInvariants() columns parameter: `Record<string, ColumnDef>`

For each usage, document:
1. Location (file:line)
2. Current usage pattern (show code snippet)
3. Proposed replacement using ColumnDefSchema.Generic
4. Whether the usage is internal-only or part of public API
5. Any type inference challenges

Output: Create `.specs/improve-column-def-types/column-def-usages/model-col-def-usage.report.md`
```

#### Task 2.4: Analyze adapters/drizzle.ts ColumnDef usages (CRITICAL)
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

This file has HEAVY ColumnDef usage for Drizzle integration. Analyze for:
- Import of ColumnDef from types.ts
- DrizzleBaseBuilderFor<Name, T extends ColumnType.Type, AI extends boolean>
- ApplyNotNull<T, Col extends ColumnDef, EncodedType>
- ApplyPrimaryKey<T, Col extends ColumnDef>
- ApplyHasDefault<T, Col extends ColumnDef>
- ApplyAutoincrement<T, Col extends ColumnDef>
- DrizzleTypedBuilderFor<Name, Col extends ColumnDef, EncodedType>
- DrizzleTypedBuildersFor<Columns extends Record<string, ColumnDef>, Fields>
- columnBuilder(name, def: ColumnDef, field) function parameter
- toDrizzle() function accessing model.columns

For each usage, document:
1. Location (file:line)
2. Current usage pattern (show code snippet)
3. Proposed replacement using ColumnDefSchema.Generic
4. Special considerations for Drizzle type modifiers
5. Whether change affects toDrizzle() public API

Output: Create `.specs/improve-column-def-types/column-def-usages/adapters-col-def-usage.report.md`
```

#### Task 2.5: Analyze combinators.ts ColumnDef usages
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

Analyze `packages/common/schema/src/integrations/sql/dsl/combinators.ts` for any remaining usages of:
- ColumnDef in re-exports
- ColumnDef in function signatures (if any remain after Field.ts/Model.ts extraction)
- ColumnDef in type constraints

For each usage, document:
1. Location (file:line)
2. Current usage pattern
3. Proposed replacement using ColumnDefSchema.Generic
4. Impact on public API

Output: Create `.specs/improve-column-def-types/column-def-usages/combinators-col-def-usage.report.md`
```

#### Task 2.6: Analyze validate.ts ColumnDef usages
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

Analyze `packages/common/schema/src/integrations/sql/dsl/validate.ts` for all usages of ColumnDef.

For each usage, document:
1. Location (file:line)
2. Current usage pattern
3. Proposed replacement
4. Whether runtime validation logic needs adjustment

Output: Create `.specs/improve-column-def-types/column-def-usages/validate-col-def-usage.report.md`
```

#### Task 2.7: Analyze test files ColumnDef usages
```
Context: Read `.specs/improve-column-def-types/dsl-module.report.md` first.

Analyze `packages/common/schema/test/integrations/sql/dsl/` for all usages of ColumnDef.

Focus on:
- Direct ColumnDef type annotations in tests
- Test fixtures that construct ColumnDef values
- Type-level assertions using ColumnDef
- Tests that exercise ExactColumnDef or DerivedColumnDefFromSchema behavior

For each usage, document:
1. Location (file:line)
2. Current test pattern
3. Proposed test update
4. Whether new tests are needed for ColumnDefSchema.Generic

Output: Create `.specs/improve-column-def-types/column-def-usages/tests-col-def-usage.report.md`
```

**Synthesis** (Orchestrator):
After all Phase 2 sub-agents complete, read all usage reports and create:
`.specs/improve-column-def-types/col-def-usages.md`

This synthesis should:
- Consolidate ALL usages into a single reference table
- Group usages by migration complexity:
  - **Simple**: Direct replacement with ColumnDefSchema.Generic
  - **Moderate**: Requires type parameter adjustments
  - **Complex**: Involves conditional types or deep type inference
- Define the migration order (dependencies first):
  1. types.ts (defines the interface, must be done first)
  2. Field.ts (uses ExactColumnDef, DerivedColumnDefFromSchema)
  3. Model.ts (uses ColumnDef in ExtractColumnsType, ExtractPrimaryKeys)
  4. adapters/drizzle.ts (uses ColumnDef for Drizzle type mapping)
  5. combinators.ts (re-exports, update after source files)
  6. validate.ts (uses ColumnDef at runtime)
  7. Tests (update last, after all source changes)
- Identify any blockers or required preparatory work
- Note any gaps in ColumnDefSchema.Generic that may need to be addressed

---

### Phase 3: Refactoring Execution

**Objective**: Execute the migration with sub-agents, validating incrementally.

**Approach**: Based on `col-def-usages.md`, spawn sub-agents to handle logical groupings of changes. Each sub-agent receives:
1. Relevant sections from `dsl-module.report.md`
2. Relevant sections from `col-def-usages.md`
3. Clear scope of files/types to modify
4. Validation commands to run after changes

**Recommended Refactoring Order** (based on dependency analysis):

#### Task 3.1: Refactor types.ts (Foundation)
```
Context:
- Module overview: [paste relevant section from dsl-module.report.md]
- Usages to migrate: [paste relevant section from col-def-usages.md]

Task: Refactor `types.ts` to remove the ColumnDef interface.

Steps:
1. Update DSLField<A, I, R, C extends ColumnDef> to DSLField<A, I, R, C extends ColumnDefSchema.Generic>
2. Update DSLVariantField<A, C extends ColumnDef> to DSLVariantField<A, C extends ColumnDefSchema.Generic>
3. Update ValidateSchemaColumn and SchemaColumnError if they reference ColumnDef
4. Update FieldResult<Input, C extends ColumnDef> to use ColumnDefSchema.Generic
5. Remove the ColumnDef interface definition
6. Remove ExactColumnDef type alias
7. Remove or refactor DerivedColumnDefFromSchema (may need schema-based derivation instead)
8. Keep ColumnDefSchema and all member Generic interfaces intact

After changes, run:
bunx turbo run check --filter=@beep/schema

Report any type errors encountered and how they were resolved.
DO NOT proceed if type check fails - document blockers for orchestrator review.
```

#### Task 3.2: Refactor Field.ts (Heavy Lifting)
```
Context:
- Module overview: [paste relevant section from dsl-module.report.md]
- Usages to migrate: [paste relevant section from col-def-usages.md]

Task: Refactor `Field.ts` to use ColumnDefSchema.Generic instead of ColumnDef.

Steps:
1. Update imports: Replace ColumnDef, ExactColumnDef, DerivedColumnDefFromSchema
2. Update ExtractColumnType<C extends Partial<ColumnDef>> constraint
3. Update SchemaConfiguratorWithSchema return types
4. Update LocalVariantConfiguratorWithSchema and ExperimentalVariantConfiguratorWithSchema
5. Update Field() function overloads to use ColumnDefSchema.Generic
6. Update Field() implementation - runtime columnDef construction
7. Ensure autoIncrement validation still works (INV-SQL-AI-001)

After changes, run:
bunx turbo run check --filter=@beep/schema

Report any type errors encountered and how they were resolved.
```

#### Task 3.3: Refactor Model.ts (Heavy Lifting)
```
Context:
- Module overview: [paste relevant section from dsl-module.report.md]
- Usages to migrate: [paste relevant section from col-def-usages.md]

Task: Refactor `Model.ts` to use ColumnDefSchema.Generic instead of ColumnDef.

Steps:
1. Update imports: Replace ColumnDef from types.ts
2. Update ExtractColumnsType<Fields> to extract ColumnDefSchema.Generic
3. Update ExtractPrimaryKeys<Fields> to work with ColumnDefSchema.Generic members
4. Update defaultColumnDef constant type annotation
5. Update getColumnDef() function return type
6. Update derivePrimaryKey<Columns extends Record<string, ColumnDefSchema.Generic>>()
7. Update validateModelInvariants() columns parameter type

After changes, run:
bunx turbo run check --filter=@beep/schema

Report any type errors encountered and how they were resolved.
```

#### Task 3.4: Refactor adapters/drizzle.ts (Critical Integration)
```
Context:
- Module overview: [paste relevant section from dsl-module.report.md]
- Usages to migrate: [paste relevant section from col-def-usages.md]

Task: Refactor `adapters/drizzle.ts` to use ColumnDefSchema.Generic.

Steps:
1. Update imports: Replace ColumnDef from types.ts
2. Update ApplyNotNull<T, Col extends ColumnDefSchema.Generic, EncodedType>
3. Update ApplyPrimaryKey<T, Col extends ColumnDefSchema.Generic>
4. Update ApplyHasDefault<T, Col extends ColumnDefSchema.Generic>
5. Update ApplyAutoincrement<T, Col extends ColumnDefSchema.Generic>
6. Update DrizzleTypedBuilderFor to use ColumnDefSchema.Generic
7. Update DrizzleTypedBuildersFor to use Record<string, ColumnDefSchema.Generic>
8. Update columnBuilder() function parameter type
9. Verify toDrizzle() still produces correct Drizzle table types

After changes, run:
bunx turbo run check --filter=@beep/schema

Report any type errors encountered and how they were resolved.
```

#### Task 3.5: Update remaining files and re-exports
```
Task: Update combinators.ts, validate.ts, index.ts re-exports.

Steps:
1. Update combinators.ts re-exports (remove ColumnDef, ExactColumnDef if exported)
2. Update validate.ts if it references ColumnDef directly
3. Update index.ts public exports
4. Search for any remaining ColumnDef references

After changes, run:
bunx turbo run check --filter=@beep/schema

Verify zero references remain (excluding ColumnDefSchema):
grep -r "ColumnDef" packages/common/schema/src/integrations/sql/dsl/ | grep -v "ColumnDefSchema"
```

#### Task 3.6: Update test files
```
Task: Update all test files to use ColumnDefSchema.Generic.

Steps:
1. Update any direct ColumnDef type annotations
2. Update test fixtures that construct column definitions
3. Add new tests for ColumnDefSchema.Generic behavior if needed
4. Verify all existing tests still pass

After changes, run:
bun run test --filter=@beep/schema

Report any test failures and how they were resolved.
```

**Validation Gates**:
After each sub-agent completes:
1. Orchestrator verifies type check passes
2. Orchestrator verifies tests pass
3. If failures occur, orchestrator spawns diagnostic sub-agent
4. Do NOT proceed to next task until current task passes all checks

**Final Synthesis** (Orchestrator):
Create `.specs/improve-column-def-types/refactoring-summary.md` documenting:
- All changes made (with file:line references for significant changes)
- Decisions and rationale (especially any deviations from plan)
- Type inference challenges encountered and solutions
- Any remaining technical debt or future improvements
- Lessons learned for similar refactoring efforts

---

## Success Criteria

1. **Zero legacy ColumnDef references**:
   ```bash
   grep -r "ColumnDef" packages/common/schema/src/integrations/sql/dsl/ | grep -v "ColumnDefSchema"
   ```
   This command should return zero matches.

2. **Type checking passes**:
   ```bash
   bunx turbo run check --filter=@beep/schema
   ```

3. **All tests pass**:
   ```bash
   bun run test --filter=@beep/schema
   ```

4. **All synthesis documents complete**:
   - `.specs/improve-column-def-types/dsl-module.report.md` (Phase 1 synthesis)
   - `.specs/improve-column-def-types/col-def-usages.md` (Phase 2 synthesis)
   - `.specs/improve-column-def-types/refactoring-summary.md` (Phase 3 synthesis)
   - All 11 module reports in `module-reports/`
   - All 7 usage reports in `column-def-usages/`

5. **Discriminated union type safety preserved or improved**:
   - ColumnDefSchema.Generic correctly constrains DSLField, DSLVariantField
   - autoIncrement validation (INV-SQL-AI-001) still enforced at type level
   - All member-specific Generic interfaces (StringColumnDefSchema.Generic, etc.) work correctly

6. **No downstream breakages**:
   - Check for any usages of ColumnDef outside the DSL module
   - Ensure public API changes are documented

---

## Notes for Orchestrator

### Context Management
- **Delegate Reading**: Your context window is limited. Delegate all file reading and code analysis to sub-agents. Keep only synthesized insights.
- **Report Consumption**: Read sub-agent reports to understand findings, but don't store entire file contents.
- **Phase Isolation**: Complete each phase fully before moving to the next. Do not parallelize across phases.

### Sub-Agent Management
- **Explicit Deliverables**: Be explicit about deliverables. Sub-agents should know exactly what file to create and what structure to use.
- **Context Handoff**: When spawning Phase 2/3 agents, paste relevant sections from synthesis documents rather than asking agents to read files.
- **Parallel Within Phase**: Within a single phase, you MAY parallelize independent tasks (e.g., explore multiple files concurrently).

### Error Handling
If a sub-agent reports blockers, assess whether the issue requires:
1. A preparatory change to ColumnDefSchema.Generic (e.g., missing property, wrong type)
2. A different migration approach (e.g., intermediate compatibility type)
3. Accepting a temporary workaround (document for future cleanup)

If type errors cascade across multiple files, consider:
- Rolling back and addressing root cause first
- Spawning a diagnostic sub-agent to analyze the error chain
- Updating ColumnDefSchema.Generic interfaces before continuing

### Critical Files
The following files require extra care during refactoring:
- **types.ts**: Foundation - all other files depend on types defined here
- **Field.ts**: Complex configurator types with conditional return types
- **Model.ts**: Type extraction utilities (ExtractColumnsType, ExtractPrimaryKeys)
- **adapters/drizzle.ts**: Drizzle type modifiers require careful mapping

### Quality Gates
- **Quality over Speed**: This refactoring touches core type infrastructure. Ensure each change is correct before proceeding.
- **Incremental Validation**: Run type check after every file modification, not just at phase boundaries.
- **Test Early**: If tests fail after a change, investigate immediately rather than accumulating failures.

### Common Pitfalls
- Forgetting to update the `| undefined` suffix for `exactOptionalPropertyTypes`
- Not using `Type["property"]` pattern for drift prevention
- Losing autoIncrement phantom parameter in types that don't support it
- Breaking conditional type inference in FieldResult or configurator types
