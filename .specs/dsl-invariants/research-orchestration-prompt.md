# DSL Metadata Invariant Validation - Research Orchestration Prompt

## Objective

You are orchestrating a research phase to discover **all possible invariants** that must be enforced when compiling a DSL Model's Fields and ColumnDef metadata for SQL database schemas. The goal is to produce a comprehensive catalog of validation rules that will be implemented as a compile-time and runtime validation system.

## Context

The `beep-effect` monorepo contains a DSL for defining SQL-backed Effect Schema models. The DSL lives in:
- `packages/common/schema/src/integrations/sql/dsl/` - Source code
- `packages/common/schema/test/integrations/sql/dsl/` - Tests

### Architecture Summary

The DSL has these core components:

1. **ColumnDef** - Runtime column metadata:
   ```typescript
   interface ColumnDef<T, PK, U, AI> {
     readonly type: ColumnType.Type;     // "string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json" | "bigint"
     readonly primaryKey?: PK;           // boolean
     readonly unique?: U;                // boolean
     readonly autoIncrement?: AI;        // boolean
     readonly defaultValue?: string | (() => string);
   }
   ```

2. **DSLField / DSLVariantField** - Schema wrappers with column metadata attached via `[ColumnMetaSymbol]`

3. **Model** - Factory that creates classes with:
   - `tableName` - snake_case identifier
   - `identifier` - original name
   - `columns` - Record<fieldName, ColumnDef>
   - `primaryKey` - readonly string[] of PK field names
   - `_fields` - original DSL.Fields definition
   - Variant accessors: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`

4. **ColumnType Literals**: `"string" | "number" | "integer" | "boolean" | "datetime" | "uuid" | "json" | "bigint"`

5. **Nullability**: Derived from Effect Schema AST (not stored in ColumnDef)

6. **Drizzle Adapter**: Converts DSL Models to Drizzle table definitions

---

## Research Scope

Deploy **4 specialized sub-agents** to research invariant categories. Each agent produces a report saved to `.specs/dsl-invariants/research/`.

### Sub-Agent 1: SQL Standard Invariants

**Task**: Research SQL standard (ANSI SQL, PostgreSQL) constraints and how they map to DSL invariants.

**Research Areas**:
- Primary key constraints (cardinality, nullability, types)
- Unique constraints (multiple uniques, nullable uniques)
- Auto-increment/SERIAL semantics
- Default value validity
- Column type constraints and limits
- Identifier naming rules (length, characters, reserved words)
- Data type compatibility rules
- NOT NULL vs nullable semantics

**Output File**: `.specs/dsl-invariants/research/01-sql-standard-invariants.md`

**Report Format**:
```markdown
# SQL Standard Invariants Report

## Summary
[Brief overview of findings]

## Invariant Categories

### Primary Key Invariants
- INV-SQL-PK-001: [Description]
  - Rationale: [Why this matters]
  - Validation: [How to check]
  - Error: [Error message pattern]

### [Category N]
...

## PostgreSQL-Specific Considerations
[Any Postgres-specific rules]

## Edge Cases
[Non-obvious cases]
```

---

### Sub-Agent 2: Schema-Column Type Compatibility Invariants

**Task**: Research type compatibility between Effect Schema types and SQL column types.

**Research Areas**:
- Schema encoded type → SQL type mappings
- Invalid type combinations
- Precision/range mismatches (e.g., Number vs Integer vs BigInt)
- JSON serialization edge cases
- UUID format requirements
- DateTime/timestamp precision
- String length considerations
- Null handling in type conversions
- Union type to SQL mapping rules
- Literal type handling

**Output File**: `.specs/dsl-invariants/research/02-type-compatibility-invariants.md`

**Report Format**:
```markdown
# Schema-Column Type Compatibility Invariants Report

## Summary
[Brief overview]

## Type Mapping Invariants

### Numeric Types
- INV-TYPE-NUM-001: [Description]
  ...

### String Types
- INV-TYPE-STR-001: [Description]
  ...

### Complex Types (JSON, Arrays)
...

## Encoding/Decoding Considerations
[Transformations that affect compatibility]

## Edge Cases
[Non-obvious type scenarios]
```

---

### Sub-Agent 3: Model Composition Invariants

**Task**: Research invariants arising from how fields compose into models.

**Research Areas**:
- Field name uniqueness
- Reserved field names (if any)
- Minimum field requirements
- Primary key field existence and configuration
- Identifier/tableName validity
- Cross-field constraint interactions
- Variant field filtering implications
- Generated/Sensitive field requirements
- Field ordering considerations
- Circular reference handling

**Output File**: `.specs/dsl-invariants/research/03-model-composition-invariants.md`

**Report Format**:
```markdown
# Model Composition Invariants Report

## Summary
[Brief overview]

## Field-Level Invariants
- INV-FIELD-001: [Description]
  ...

## Model-Level Invariants
- INV-MODEL-001: [Description]
  ...

## Cross-Field Invariants
- INV-CROSS-001: [Description]
  ...

## Variant Schema Invariants
[Invariants specific to variant filtering]

## Edge Cases
[Non-obvious composition scenarios]
```

---

### Sub-Agent 4: Drizzle Adapter Invariants

**Task**: Research invariants specific to the Drizzle ORM conversion.

**Research Areas**:
- Drizzle builder type requirements
- Constraint ordering in Drizzle
- Serial/auto-increment type restrictions
- Primary key types Drizzle supports
- Index creation requirements
- Foreign key preparation
- Default value expression validity in Postgres
- Column modifier ordering
- Type assertion requirements
- Nullable + default interactions

**Output File**: `.specs/dsl-invariants/research/04-drizzle-adapter-invariants.md`

**Report Format**:
```markdown
# Drizzle Adapter Invariants Report

## Summary
[Brief overview]

## Builder Invariants
- INV-DRZ-BUILD-001: [Description]
  ...

## Constraint Invariants
- INV-DRZ-CONST-001: [Description]
  ...

## Type Mapping Invariants
- INV-DRZ-TYPE-001: [Description]
  ...

## Edge Cases
[Non-obvious Drizzle scenarios]
```

---

## Orchestration Instructions

### Phase 1: Deploy Sub-Agents

Deploy all 4 sub-agents in parallel using the Task tool:

```
Task(subagent_type="Explore", prompt="[Research prompt for agent N]")
```

Each agent should:
1. Read all relevant DSL source files
2. Research SQL and Drizzle documentation
3. Analyze existing tests for implicit invariants
4. Look for TODO comments indicating missing validations
5. Consider edge cases and failure modes
6. Produce a structured report

### Phase 2: Collect Reports

Wait for all agents to complete and ensure reports are written to:
- `.specs/dsl-invariants/research/01-sql-standard-invariants.md`
- `.specs/dsl-invariants/research/02-type-compatibility-invariants.md`
- `.specs/dsl-invariants/research/03-model-composition-invariants.md`
- `.specs/dsl-invariants/research/04-drizzle-adapter-invariants.md`

### Phase 3: Synthesize Results

Create `.specs/dsl-invariants/research-results.md` that:

1. **Consolidates all invariants** into a master list with unique IDs
2. **Categorizes by validation timing**:
   - Compile-time (type-level) invariants
   - Runtime (effect/validation) invariants
   - Adapter-specific invariants
3. **Prioritizes by severity**:
   - Critical (must prevent compilation/execution)
   - Warning (should emit warning but allow)
   - Info (developer hint)
4. **Identifies dependencies** between invariants
5. **Notes implementation complexity** for each
6. **Proposes validation architecture**

### Phase 4: Create Implementation Prompt

After synthesis, create `.specs/dsl-invariants/implementation-prompt.original.md` containing:

1. Full context from research
2. The consolidated invariant list
3. Architecture decisions
4. Implementation steps
5. Testing requirements
6. Error message patterns

### Phase 5: Refine Implementation Prompt

Run the `/refine-prompt` skill on the implementation prompt:

```
/refine-prompt .specs/dsl-invariants/implementation-prompt.original.md
```

This will produce the final refined prompt.

---

## Success Criteria

1. All 4 research reports exist with substantive content
2. `research-results.md` synthesizes findings coherently
3. `implementation-prompt.original.md` provides complete implementation guidance
4. Prompt refinement produces actionable implementation instructions
5. No invariant category is overlooked
6. Edge cases are explicitly addressed

---

## File References

Read these files for context:
- `packages/common/schema/src/integrations/sql/dsl/types.ts`
- `packages/common/schema/src/integrations/sql/dsl/Field.ts`
- `packages/common/schema/src/integrations/sql/dsl/Model.ts`
- `packages/common/schema/src/integrations/sql/dsl/literals.ts`
- `packages/common/schema/src/integrations/sql/dsl/derive-column-type.ts`
- `packages/common/schema/src/integrations/sql/dsl/nullability.ts`
- `packages/common/schema/src/integrations/sql/dsl/adapters/drizzle.ts`
- `packages/common/schema/src/integrations/sql/dsl/todos.md`
- All test files in `packages/common/schema/test/integrations/sql/dsl/`
