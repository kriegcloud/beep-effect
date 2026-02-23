---
name: dsl-invariants-research-orchestration
version: 3
created: 2025-12-28T00:00:00Z
iterations: 2
---

# DSL Metadata Invariant Validation - Research Orchestration Prompt

## Context

You are operating within the `beep-effect` monorepo, an Effect-first full-stack application. The codebase contains a DSL for defining SQL-backed Effect Schema models located at:

- **Source**: `packages/common/schema/src/integrations/sql/dsl/`
- **Tests**: `packages/common/schema/test/integrations/sql/dsl/`

### Current DSL Architecture

The DSL comprises these core components:

**ColumnDef** (`types.ts:17-30`) - Runtime column metadata:
```typescript
interface ColumnDef<T, PK, U, AI> {
  readonly type: ColumnType.Type;     // "string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json" | "bigint"
  readonly primaryKey?: PK;           // boolean
  readonly unique?: U;                // boolean
  readonly autoIncrement?: AI;        // boolean
  readonly defaultValue?: string | (() => string);
}
```

**ColumnType Literals** (`literals.ts`): `"string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json" | "bigint"`

**DSLField / DSLVariantField** (`types.ts:490-496`) - Schema wrappers with column metadata attached via `[ColumnMetaSymbol]`

**Model Factory** (`Model.ts:117-236`) - Creates classes with:
- `tableName` - snake_case identifier (auto-generated, no validation)
- `identifier` - original PascalCase name
- `columns` - `Record<fieldName, ColumnDef>`
- `primaryKey` - `readonly string[]` of PK field names (derived, not validated)
- `_fields` - original DSL.Fields definition
- Variant accessors: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`

**Nullability** (`nullability.ts:32-74`) - Derived from Effect Schema AST at runtime (not stored in ColumnDef)

**Drizzle Adapter** (`adapters/drizzle.ts`) - Converts DSL Models to Drizzle table definitions

### Existing Validation (Gaps to Address)

| Component | Current State | Gap |
|-----------|---------------|-----|
| Schema/Column compatibility | Type-level only (`types.ts:78-146`) | No runtime enforcement |
| Invalid column types | Runtime throws (`derive-column-type.ts:74-90`) | Limited coverage |
| Primary key cardinality | Derived but unchecked (`Model.ts:129-135`) | No single/composite validation |
| Nullable primary key | AST-derived, unchecked | No constraint enforcement |
| Table name validity | `toSnakeCase()` only (`Model.ts:236`) | No SQL identifier validation |
| AutoIncrement constraints | Not validated | Must be integer type |
| Unique + nullable | Not validated | Semantic warning needed |
| Reserved SQL keywords | Not checked | Should warn on collision |

### Repository Conventions (Mandatory for All Code Examples)

From `AGENTS.md` and package-specific guidelines. **All sub-agents MUST follow these conventions.**

**Effect-First Requirements:**
- No `async/await` or bare Promises
- Use `Effect.gen`, `Effect.fn`, `Effect.tryPromise` with tagged errors
- Errors via `Schema.TaggedError` from `effect/Schema`
- Collections via Effect utilities only

**Import Conventions (Required in all code examples):**
```typescript
import * as Effect from "effect/Effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Match from "effect/Match";
import * as P from "effect/Predicate";
import * as F from "effect/Function";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as Struct from "effect/Struct";
```

**Forbidden Patterns (NEVER use in examples):**
```typescript
// FORBIDDEN → REQUIRED
items.map(fn)           → F.pipe(items, A.map(fn))
items.filter(pred)      → F.pipe(items, A.filter(pred))
str.split(",")          → F.pipe(str, Str.split(","))
Object.keys(obj)        → F.pipe(obj, Struct.keys)
switch (x._tag) { }     → Match.value(x).pipe(Match.tag(...), Match.exhaustive)
typeof x === "string"   → P.isString(x)
new Date()              → DateTime.unsafeNow()
```

**Error Handling:**
- `S.TaggedError` for validation failures (from `@beep/errors` patterns)
- `InvariantViolation` for programmer-guard assertions (from `@beep/invariant`)
- Metadata must be PII-free and JSON-serializable

---

## Objective

Orchestrate a comprehensive research phase to discover **all possible invariants** that must be enforced when compiling DSL Model metadata. The research must:

1. **Catalog all SQL standard invariants** applicable to the DSL's column/table metadata
2. **Identify Effect Schema ↔ SQL type compatibility rules** and edge cases
3. **Document model composition invariants** (field interactions, naming, cardinality)
4. **Specify Drizzle adapter constraints** that must be validated before conversion
5. **Research error presentation strategies** using Effect's TaggedError, Cause, Pretty, and Logger for beautiful, meaningful error messages
6. **Synthesize findings** into a prioritized, categorized master list
7. **Produce an implementation prompt** for building the validation system

**Success Criteria:**
- 5 research reports: 4 invariant reports + 1 error presentation strategy report
- Each invariant has: ID, description, rationale, validation method, error message pattern
- Error presentation report provides concrete patterns for beautiful, developer-friendly error output
- Synthesized `research-results.md` with categorization by timing (compile/runtime) and severity
- `implementation-prompt.original.md` ready for refinement
- Zero overlooked invariant categories
- Edge cases explicitly documented

---

## Role

You are a **Research Orchestrator** responsible for:
- Deploying specialized sub-agents to investigate invariant categories
- Collecting and synthesizing research outputs
- Ensuring comprehensive coverage without gaps
- Producing actionable implementation guidance

You have access to the **Task tool** (with `subagent_type` parameter) for spawning sub-agents and all file manipulation tools.

---

## Constraints

### Pre-Execution Setup
Before writing any research outputs, ensure the directory structure exists:
```bash
mkdir -p .specs/dsl-invariants/research
```

### Sub-Agent Deployment Rules
1. Deploy all 5 research agents **in parallel** using the Task tool with `subagent_type="general-purpose"` (Agent 5 uses `subagent_type="effect-researcher"`)
2. Each agent must write its report to the specified file path
3. Wait for all agents to complete before synthesis
4. If an agent fails, retry once with refined instructions
5. If a listed source file does not exist, note its absence in the report and proceed with available files

### Research Quality Standards
1. Each invariant must have a unique ID following pattern: `INV-{CATEGORY}-{SUBCATEGORY}-{NUMBER}`
2. Rationale must cite SQL standard, PostgreSQL docs, or Effect patterns
3. Validation method must specify compile-time vs runtime approach
4. Error messages must follow this format:
   ```
   [INV-{ID}] {Entity} '{name}' {violation}. Expected: {expected}. Received: {actual}. Fix: {suggestion}.
   ```
   Example: `[INV-SQL-PK-001] Field 'userId' cannot be nullable when marked as primaryKey. Expected: non-nullable schema. Received: S.NullOr(S.String). Fix: Remove S.NullOr wrapper or remove primaryKey constraint.`

### Cross-Reference Strategy
Before finalizing each report, cross-reference against other categories. If an invariant spans multiple categories (e.g., "autoIncrement must be integer" is both SQL and Type Compatibility), place it in the most specific category and add a cross-reference note.

### File Organization
```
.specs/dsl-invariants/
├── research/
│   ├── 01-sql-standard-invariants.md
│   ├── 02-type-compatibility-invariants.md
│   ├── 03-model-composition-invariants.md
│   ├── 04-drizzle-adapter-invariants.md
│   └── 05-error-presentation-strategies.md
├── research-results.md
├── implementation-prompt.original.md
└── implementation-prompt.prompt.md  (after refinement)
```

### Forbidden in Research Outputs
- Vague descriptions ("should be valid" → specify exact validation)
- Missing error messages
- Uncategorized invariants
- Invariants without implementation complexity notes
- Code examples using forbidden patterns (native methods, switch, etc.)

---

## Resources

### DSL Source Files (Must Read)
| File | Purpose |
|------|---------|
| `packages/common/schema/src/integrations/sql/dsl/types.ts` | Core types, ColumnDef, type-level validation |
| `packages/common/schema/src/integrations/sql/dsl/Field.ts` | Field factory, AST extraction |
| `packages/common/schema/src/integrations/sql/dsl/Model.ts` | Model factory, column extraction, PK derivation |
| `packages/common/schema/src/integrations/sql/dsl/literals.ts` | ColumnType, ModelVariant enums |
| `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts` | Runtime type derivation with error throwing |
| `packages/common/schema/src/integrations/sql/dsl/nullability.ts` | AST-based nullability analysis |
| `packages/common/schema/src/integrations/sql/dsl/combinators.ts` | Pipe-friendly field modifiers |
| `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts` | Drizzle conversion with constraint application |
| `packages/common/schema/src/integrations/sql/dsl/todos.md` | Pending features indicating gaps |

### Test Files (Analyze for Coverage Gaps)
| File | Focus |
|------|-------|
| `packages/common/schema/test/integrations/sql/dsl/poc.test.ts` | Core Field/Model/toDrizzle |
| `packages/common/schema/test/integrations/sql/dsl/derive-column-type.test.ts` | Type derivation |
| `packages/common/schema/test/integrations/sql/dsl/field-model-comprehensive.test.ts` | Comprehensive edge cases |
| `packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts` | M.Generated/Sensitive/etc. |
| `packages/common/schema/test/integrations/sql/dsl/combinators.test.ts` | Combinator pipelines |
| `packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts` | Drizzle builder typing |

### Documentation Tools
- `mcp__effect_docs__effect_docs_search` - Search Effect documentation
- `mcp__effect_docs__get_effect_doc` - Retrieve specific Effect docs
- `WebSearch` - Research targets: "PostgreSQL 16 column constraints", "SQL:2016 PRIMARY KEY semantics", "Drizzle ORM pgTable API"

### Related Package Guidelines
- `packages/common/schema/AGENTS.md` - Schema patterns
- `packages/common/invariant/AGENTS.md` - Assertion contracts, InvariantViolation
- `packages/common/errors/AGENTS.md` - Error handling patterns, TaggedError conventions

### Error Handling Reference Files (for Agent 5)
- `packages/common/errors/src/` - Existing error patterns and TaggedError examples
- `packages/common/invariant/src/` - InvariantViolation implementation
- `packages/common/errors/src/Logger/` - Logger layer implementations (if exists)

---

## Output Specification

### Phase 1: Deploy Sub-Agents

Deploy 5 agents **in parallel** using the Task tool. Agents 1-4 use `subagent_type="general-purpose"`, Agent 5 uses `subagent_type="effect-researcher"`. Each prompt includes mandatory conventions.

#### Agent 1: SQL Standard Invariants
```
You are researching SQL standard invariants for a DSL that generates PostgreSQL schemas.

## Mandatory Conventions
All code examples MUST use Effect patterns:
- Use `F.pipe(items, A.map(fn))` not `items.map(fn)`
- Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` not `switch`
- Use `P.isString(x)` not `typeof x === "string"`
- Use `S.TaggedError` for errors

## Files to Read
- packages/common/schema/src/integrations/sql/dsl/types.ts
- packages/common/schema/src/integrations/sql/dsl/Model.ts
- packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts

If any file is missing, note its absence and continue with available files.

## Research Areas
1. Primary key constraints (cardinality, nullability, allowed types)
2. Unique constraints (nullable uniques, multiple uniques per table)
3. Auto-increment/SERIAL semantics (type restrictions, nullability)
4. Default value validity (SQL expression syntax, type compatibility)
5. Column type constraints (precision, length limits)
6. Identifier naming (length limits: 63 chars in PostgreSQL, allowed characters, reserved words)
7. NOT NULL semantics (when required, interactions with defaults)

## Output Format (for each invariant)
### INV-SQL-{SUBCATEGORY}-{NUMBER}: {Title}

**Description**: What must be true

**Rationale**: Why this matters (cite PostgreSQL docs or SQL standard)

**Validation**:
- Compile-time: [Type-level check if applicable]
- Runtime: [Effect-based check if applicable]

**Error**:
```
[INV-SQL-{SUBCATEGORY}-{NUMBER}] {Entity} '{name}' {violation}. Expected: {expected}. Received: {actual}. Fix: {suggestion}.
```

**Complexity**: Low/Medium/High
**Severity**: Critical/Warning/Info

Write output to: .specs/dsl-invariants/research/01-sql-standard-invariants.md
```

#### Agent 2: Type Compatibility Invariants
```
You are researching Effect Schema to SQL column type compatibility.

## Mandatory Conventions
All code examples MUST use Effect patterns:
- Use `F.pipe(items, A.map(fn))` not `items.map(fn)`
- Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` not `switch`
- Use `P.isString(x)` not `typeof x === "string"`
- Use `S.TaggedError` for errors

## Files to Read
- packages/common/schema/src/integrations/sql/dsl/types.ts (see IsSchemaColumnCompatible)
- packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts
- packages/common/schema/test/integrations/sql/dsl/field-model-comprehensive.test.ts

If any file is missing, note its absence and continue with available files.

## Research Areas
1. Schema encoded type → SQL column type mappings
2. Invalid type combinations (e.g., S.Boolean with column type "integer")
3. Precision mismatches (Number vs Integer vs BigInt ranges)
4. JSON serialization requirements (what types map to "json")
5. UUID format validation
6. DateTime/timestamp encoding
7. Null handling in transformations
8. Union type mapping rules
9. Literal type handling (string literals, numeric literals)
10. Branded type unwrapping

## Output Format (for each invariant)
### INV-TYPE-{SUBCATEGORY}-{NUMBER}: {Title}

**Description**: What must be true

**Rationale**: Why this matters

**Validation**:
- Compile-time: [Type-level check if applicable]
- Runtime: [Effect-based check if applicable]

**Error**:
```
[INV-TYPE-{SUBCATEGORY}-{NUMBER}] {Entity} '{name}' {violation}. Expected: {expected}. Received: {actual}. Fix: {suggestion}.
```

**Complexity**: Low/Medium/High
**Severity**: Critical/Warning/Info

Write output to: .specs/dsl-invariants/research/02-type-compatibility-invariants.md
```

#### Agent 3: Model Composition Invariants
```
You are researching invariants for how fields compose into DSL Models.

## Mandatory Conventions
All code examples MUST use Effect patterns:
- Use `F.pipe(items, A.map(fn))` not `items.map(fn)`
- Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` not `switch`
- Use `P.isString(x)` not `typeof x === "string"`
- Use `S.TaggedError` for errors

## Files to Read
- packages/common/schema/src/integrations/sql/dsl/Model.ts
- packages/common/schema/src/integrations/sql/dsl/Field.ts
- packages/common/schema/test/integrations/sql/dsl/variant-integration.test.ts

If any file is missing, note its absence and continue with available files.

## Research Areas
1. Field name constraints (uniqueness, valid identifiers, reserved names)
2. Minimum field requirements (can a model have zero fields?)
3. Primary key requirements (must exist? single vs composite?)
4. Identifier/tableName validity (non-empty, valid SQL, no reserved words)
5. Cross-field constraint interactions (multiple autoIncrements? conflicting uniques?)
6. Variant field filtering (Generated fields excluded from insert, etc.)
7. Generated/Sensitive field placement requirements
8. Circular reference handling (self-referential schemas)
9. Field ordering significance (if any)

## Output Format (for each invariant)
### INV-MODEL-{SUBCATEGORY}-{NUMBER}: {Title}

**Description**: What must be true

**Rationale**: Why this matters

**Validation**:
- Compile-time: [Type-level check if applicable]
- Runtime: [Effect-based check if applicable]

**Error**:
```
[INV-MODEL-{SUBCATEGORY}-{NUMBER}] {Entity} '{name}' {violation}. Expected: {expected}. Received: {actual}. Fix: {suggestion}.
```

**Complexity**: Low/Medium/High
**Severity**: Critical/Warning/Info

Write output to: .specs/dsl-invariants/research/03-model-composition-invariants.md
```

#### Agent 4: Drizzle Adapter Invariants
```
You are researching invariants specific to Drizzle ORM conversion.

## Mandatory Conventions
All code examples MUST use Effect patterns:
- Use `F.pipe(items, A.map(fn))` not `items.map(fn)`
- Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` not `switch`
- Use `P.isString(x)` not `typeof x === "string"`
- Use `S.TaggedError` for errors

## Files to Read
- packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts
- packages/common/schema/test/integrations/sql/dsl/drizzle-typed-columns.test.ts

If any file is missing, note its absence and continue with available files.

## Research Areas
1. Drizzle builder type requirements per column type
2. Constraint application ordering (.primaryKey() before .notNull()?)
3. Serial/autoIncrement restrictions (integer types only, not nullable)
4. Primary key types Drizzle supports
5. Default value expression validity for PostgreSQL
6. Column modifier conflicts (e.g., serial + explicit default)
7. Nullable + autoIncrement interactions
8. Type assertion requirements (.$type<T>() usage)
9. Index/unique constraint preparation
10. Foreign key field requirements (for future relation support)

## Output Format (for each invariant)
### INV-DRZ-{SUBCATEGORY}-{NUMBER}: {Title}

**Description**: What must be true

**Rationale**: Why this matters

**Validation**:
- Compile-time: [Type-level check if applicable]
- Runtime: [Effect-based check if applicable]

**Error**:
```
[INV-DRZ-{SUBCATEGORY}-{NUMBER}] {Entity} '{name}' {violation}. Expected: {expected}. Received: {actual}. Fix: {suggestion}.
```

**Complexity**: Low/Medium/High
**Severity**: Critical/Warning/Info

Write output to: .specs/dsl-invariants/research/04-drizzle-adapter-invariants.md
```

#### Agent 5: Error Presentation Strategies (Effect Researcher)
```
You are researching best practices for presenting beautiful, meaningful, and developer-friendly error messages when DSL invariants are violated. Focus on Effect's error handling ecosystem.

## Mandatory Conventions
All code examples MUST use Effect patterns:
- Use `F.pipe(items, A.map(fn))` not `items.map(fn)`
- Use `Match.value(x).pipe(Match.tag(...), Match.exhaustive)` not `switch`
- Use `P.isString(x)` not `typeof x === "string"`
- Use `S.TaggedError` for errors

## Research Tools
Use the Effect documentation MCP tools:
- `mcp__effect_docs__effect_docs_search` to search for relevant patterns
- `mcp__effect_docs__get_effect_doc` to retrieve detailed documentation

Also read these codebase files for existing patterns:
- packages/common/errors/AGENTS.md
- packages/common/errors/src/ (explore for existing error patterns)
- packages/common/invariant/AGENTS.md
- packages/common/invariant/src/ (explore for InvariantViolation patterns)

## Research Areas

### 1. Schema.TaggedError Design Patterns
- How to structure TaggedError classes for DSL validation errors
- Inheritance hierarchies (base DSLValidationError with specific subtypes)
- Required fields for each error type (fieldName, modelName, expected, received, suggestion)
- Annotations for JSON serialization and pretty printing
- Error composition for multi-field/multi-model validation failures

### 2. Cause and Error Accumulation
- Using `Cause.parallel` vs `Cause.sequential` for multiple errors
- `Effect.validateAll` error accumulation patterns
- `Effect.partition` for preserving successes alongside failures
- Cause tree structure for nested validation contexts (Model → Field → Schema)
- Extracting all errors from a Cause for comprehensive reporting

### 3. Pretty Printing and Formatting
- Effect's Pretty module for structured error output
- ANSI color codes for terminal output (field names, types, suggestions)
- Multi-line error formatting with proper indentation
- Code snippets in error messages (showing the problematic DSL definition)
- Diff-style output for expected vs received values

### 4. Logger Integration
- Using Effect Logger for validation error reporting
- Log levels for different severities (Error for critical, Warn for warnings, Debug for info)
- Structured logging with error metadata
- Integration with existing @beep/errors logging infrastructure
- Context annotations (model name, field path, validation phase)

### 5. Developer Experience Patterns
- Actionable error messages with specific fix suggestions
- Error codes for documentation lookup (e.g., "See: https://beep.dev/errors/INV-SQL-PK-001")
- Source location hints (file, line number if available)
- Related errors grouping (e.g., all errors for a single Model)
- Progressive disclosure (summary first, details on demand)

### 6. Terminal and IDE-Friendly Output
- Box-drawing characters for visual structure
- Syntax highlighting for code snippets in errors
- Clickable file paths (file:///path/to/file.ts:42:10 format)
- Truncation strategies for very long values
- ASCII art alternatives for non-color terminals

### 7. Error Message Templates
- Consistent structure across all invariant types
- Variable interpolation patterns
- Pluralization for multiple issues
- Localization considerations (if applicable)

## Output Format

### ERR-{CATEGORY}-{NUMBER}: {Pattern Name}

**Purpose**: What this pattern achieves for developer experience

**Implementation**:
```typescript
// Complete, runnable code example using Effect patterns
```

**Example Output**:
```
[Formatted error message as it would appear in terminal]
```

**When to Use**: Specific scenarios where this pattern applies

**Integration Notes**: How this integrates with other patterns

---

## Deliverables

Produce a comprehensive report including:

1. **TaggedError Base Classes** - Hierarchy design for DSL validation errors
2. **Error Accumulation Strategy** - How to collect and present multiple errors
3. **Pretty Printer Implementation** - Code for beautiful terminal output
4. **Logger Configuration** - Setup for validation error logging
5. **Error Message Templates** - Reusable templates for each invariant category
6. **Example Error Outputs** - Visual examples of formatted errors for:
   - Single field validation failure
   - Multiple field failures in one Model
   - Type compatibility errors with diffs
   - Cross-model validation issues
   - Warning-level issues with suggestions

Write output to: .specs/dsl-invariants/research/05-error-presentation-strategies.md
```

---

### Complete Invariant Example

For reference, here is a fully worked invariant entry:

```markdown
### INV-SQL-PK-001: Primary Key Non-Nullability

**Description**: A field marked as `primaryKey: true` must not be nullable. The schema AST must not include `null`, `undefined`, or optional wrappers.

**Rationale**: SQL:2016 §10.6 specifies that primary key columns implicitly have NOT NULL constraint. PostgreSQL enforces this at DDL time and will reject `CREATE TABLE` statements with nullable primary keys. See: https://www.postgresql.org/docs/16/ddl-constraints.html#DDL-CONSTRAINTS-PRIMARY-KEYS

**Validation**:
- Compile-time: Type-level assertion that `PK extends true` implies `StripNullable<Encoded> extends Encoded`
- Runtime: Check `isNullable(field.ast)` returns `false` when `columnDef.primaryKey === true`

```typescript
// Runtime validation using Effect patterns
const validatePrimaryKeyNonNullable = (
  fieldName: string,
  columnDef: ColumnDef,
  fieldAst: AST.AST
): Effect.Effect<void, PrimaryKeyNullableError> =>
  F.pipe(
    columnDef.primaryKey === true && isNullable(fieldAst),
    Match.value,
    Match.when(true, () => Effect.fail(new PrimaryKeyNullableError({ fieldName }))),
    Match.when(false, () => Effect.void),
    Match.exhaustive
  );
```

**Error**:
```
[INV-SQL-PK-001] Field 'userId' cannot be nullable when marked as primaryKey. Expected: non-nullable schema (S.String, S.Int, etc.). Received: S.NullOr(S.String). Fix: Remove S.NullOr wrapper or remove primaryKey: true from column config.
```

**Complexity**: Low (single field check against existing `isNullable` function)
**Severity**: Critical (database will reject the schema)

**Cross-Reference**: Related to INV-TYPE-NULL-001 (nullability derivation rules)
```

---

### Phase 2: Synthesize Results

After all agents complete, create `.specs/dsl-invariants/research-results.md`:

```markdown
# DSL Invariant Research Results

## Executive Summary
[Key findings, total invariant count, critical gaps identified]

## Master Invariant Catalog

### Compile-Time Invariants (Type-Level)
| ID | Description | Severity | Complexity |
|----|-------------|----------|------------|
| INV-TYPE-... | ... | Critical/Warning/Info | Low/Medium/High |

### Runtime Invariants (Effect Validation)
| ID | Description | Severity | Complexity |
|----|-------------|----------|------------|

### Adapter-Specific Invariants
| ID | Description | Severity | Complexity |
|----|-------------|----------|------------|

## Invariant Dependencies

Document which invariants must be checked before others:

```
INV-SQL-PK-001 (PK non-nullable) depends on:
└── INV-TYPE-NULL-001 (nullability derivation)

INV-DRZ-SERIAL-001 (serial integer only) depends on:
├── INV-TYPE-INT-001 (integer type detection)
└── INV-SQL-AI-001 (autoIncrement general rules)
```

## Proposed Validation Architecture

Recommended two-phase approach:

**Phase 1: Schema Validation** (at Field/Model creation)
- Use `Schema.filter` with `FilterIssue[]` for field-level validation
- Accumulate multiple errors before failing

**Phase 2: Model Compilation** (at Model() call)
- Use `Effect.validateAll` to collect all field errors
- Note: `Effect.validateAll` loses successes on any failure
- For partial success scenarios, use `Effect.partition` instead

## Implementation Priority
1. **Critical** (must block): INV-SQL-PK-001, INV-TYPE-COMPAT-001, ...
2. **Warning** (emit warning): INV-SQL-UNIQUE-NULLABLE-001, ...
3. **Info** (developer hints): ...

## Error Presentation Architecture

Incorporate findings from `05-error-presentation-strategies.md`:

### TaggedError Hierarchy
[Summary of recommended error class hierarchy]

### Pretty Printing Strategy
[Summary of terminal output formatting approach]

### Example Error Output
```
╭─ DSL Validation Error ─────────────────────────────────────────╮
│                                                                 │
│  Model: UserAccount                                             │
│  Field: userId                                                  │
│                                                                 │
│  [INV-SQL-PK-001] Primary key cannot be nullable                │
│                                                                 │
│    Expected: non-nullable schema (S.String, S.Int, etc.)        │
│    Received: S.NullOr(S.String)                                 │
│                                                                 │
│  ┌─ Your code ──────────────────────────────────────────────┐   │
│  │ const User = Model("User")({                             │   │
│  │   userId: Field(S.NullOr(S.String))({ primaryKey: true })│   │
│  │          ^^^^^^^^^^^^^^^^                                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Fix: Remove S.NullOr wrapper or remove primaryKey constraint   │
│                                                                 │
│  See: https://beep.dev/errors/INV-SQL-PK-001                    │
│                                                                 │
╰─────────────────────────────────────────────────────────────────╯
```
```

### Phase 3: Create Implementation Prompt

Create `.specs/dsl-invariants/implementation-prompt.original.md` containing:

1. Full context from research (embed key invariants inline)
2. The consolidated invariant list with priorities
3. Architecture decisions (compile-time vs runtime split)
4. **Error presentation architecture** (TaggedError hierarchy, Pretty printer, Logger integration)
5. Implementation steps with specific file paths to modify
6. Testing requirements (one test per invariant, with valid/invalid fixtures)
7. Error message patterns (the format defined above)
8. Effect patterns to use (`S.TaggedError`, `Effect.validateAll`, `Cause`, `Match.exhaustive`)
9. **Beautiful error output examples** for each severity level (Critical, Warning, Info)

### Phase 4: Refine Implementation Prompt

Invoke the `refine-prompt` skill using the Skill tool:

```typescript
Skill({ skill: "refine-prompt", args: ".specs/dsl-invariants/implementation-prompt.original.md" })
```

This will produce the final refined implementation prompt at `.specs/dsl-invariants/implementation-prompt.prompt.md`.

---

## Verification Checklist

### Invariant Research (Agents 1-4)
- [ ] All 4 invariant reports exist with 5+ substantive invariants each
- [ ] Each invariant has ID, description, rationale, validation method, error pattern
- [ ] All code examples use Effect patterns (no forbidden native methods)
- [ ] No duplicate invariants across reports (cross-references used instead)
- [ ] Edge cases documented (nullable PKs, circular refs, reserved words)

### Error Presentation Research (Agent 5)
- [ ] Error presentation report exists with comprehensive patterns
- [ ] TaggedError hierarchy design documented
- [ ] Cause accumulation patterns explained with examples
- [ ] Pretty printer implementation provided
- [ ] Logger integration patterns documented
- [ ] Visual error output examples included (box-drawing, colors, code snippets)

### Synthesis & Implementation
- [ ] `research-results.md` categorizes by timing and severity
- [ ] Invariant dependency graph included
- [ ] Error Presentation Architecture section included in synthesis
- [ ] `implementation-prompt.original.md` references specific file paths
- [ ] Implementation prompt includes error presentation architecture
- [ ] Implementation prompt includes test fixtures for critical invariants
- [ ] Error messages follow format: `[INV-ID] Entity 'name' violation. Expected: X. Received: Y. Fix: Z.`
- [ ] Beautiful error output examples for each severity level
- [ ] Refinement skill invoked on implementation prompt

---

## Metadata

### Research Sources
- **DSL Source Files**: 9 files in `packages/common/schema/src/integrations/sql/dsl/`
- **Test Files**: 6 files in `packages/common/schema/test/integrations/sql/dsl/`
- **Package Guidelines**: `@beep/schema`, `@beep/invariant`, `@beep/errors` AGENTS.md

### Exploration Findings (Verify Line Numbers Before Citing)
- Existing type-level validation: `IsSchemaColumnCompatible`, `SchemaColumnError` (`types.ts:78-146`)
- Existing runtime throws: `deriveColumnType()` for Never, Void, Symbol (`derive-column-type.ts:74-90`)
- Validation gaps: PK cardinality, nullable PK, table name validity, autoIncrement types
- TODO items: relation support, model-level config, factory patterns

### Effect Patterns Recommended
- `S.TaggedError` for validation failures with `_tag` for matching
- `Effect.validateAll` for accumulating errors (caveat: loses successes on failure)
- `Effect.partition` for scenarios needing both successes and failures
- `Schema.filter` with `FilterIssue[]` for multi-field validation
- `Match.exhaustive` for error type handling
- `Brand.refined` for compile-time + runtime constraints
- `Cause.parallel` / `Cause.sequential` for error tree composition
- `Cause.failures` / `Cause.defects` for extracting errors from Cause trees
- `Effect.log*` with structured context for validation logging
- Pretty printing via custom formatters for beautiful terminal output

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0 | Initial | N/A |
| 1 | Sub-agent prompts lacked Effect conventions; Task tool reference unclear; skill syntax ambiguous; missing directory creation; incomplete error format; no failure handling; arbitrary verification threshold | Added mandatory conventions to all agent prompts; clarified Task tool usage; fixed Skill invocation syntax; added mkdir directive; defined full error message format; added file missing contingency; changed to 5+ with justification; added complete invariant example; added cross-reference strategy; added Effect.partition note; added dependency graph format |
| 2 | Missing error presentation research; no guidance on beautiful error messages using Effect's Cause, Pretty, Logger | Added Agent 5 (effect-researcher) for error presentation strategies; added comprehensive research areas for TaggedError design, Cause accumulation, Pretty printing, Logger integration; added Error Presentation Architecture section to synthesis; added visual error output example with box-drawing; updated verification checklist with error presentation items; updated implementation prompt requirements |
