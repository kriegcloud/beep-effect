> **ARCHIVED**: This document is superseded by `FINAL-REVIEW-HANDOFF.md` and `DSL-MODEL-DESIGN.md`. Kept for historical context only.

# DSL.Model Prompt Refinement - Orchestrator Handoff

## Mission

Resume orchestration of the **Prompt Refinement Pipeline** for `DSL.Model` - an Effect Schema factory exposing driver-agnostic SQL metadata as static properties.

**CRITICAL**: This is for **RESEARCH ORCHESTRATION ONLY** - NO IMPLEMENTATION CODE.

---

## Current State Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Initialization | ✅ Complete | Original prompt saved, spec directory created |
| Phase 2: Exploration | ✅ Complete | 3 sub-agents gathered codebase, AGENTS.md, Effect patterns |
| Phase 2.5: Research Alignment | ✅ Complete | 4 sub-agents audited & aligned all 10 research files |
| Phase 3: Initial Refinement | 🔄 **YOUR TASK** | Create refined prompt from aligned research |
| Phase 4: Review Loop | ⏳ Pending | Critic/fixer iterations (max 3) |
| Phase 5: Finalization | ⏳ Pending | Present final prompt |

---

## File Structure

```
.specs/dsl-model/
├── dsl-model.original.md           # ← SOURCE OF TRUTH - design decisions
├── dsl-model.prompt.md             # ← Previous session's prompt (REFERENCE ONLY)
├── HANDOFF.md                      # ← This file
└── exploration-results/            # ← ALL ALIGNED with original prompt
    ├── schema-internals-dsl-model-research.md
    ├── effect-schema-ast-patterns.md
    ├── schema-static-properties-pattern.md
    ├── variant-schema-extension-pattern.md
    ├── entity-id-kit-patterns.md
    ├── effect-exposed-values-pattern.md
    ├── drizzle-effect-research.md
    ├── better-auth-db-system.md
    ├── livestore-patterns-synthesis.md
    └── beep-effect-codebase.md
```

**Each exploration-results file now has "## Alignment Notes" at the TOP** documenting:
- How the research aligns with DSL.Model goals
- Patterns marked as RECOMMENDED, DEPRECATED, or ALTERNATIVE
- Corrected code examples where originals showed wrong patterns

---

## Core Design Decisions (NON-NEGOTIABLE)

These 7 decisions from `dsl-model.original.md` are final:

1. **DSL.Model IS an Effect Schema** - usable with `S.decode()`, `.pipe()`, `.annotations()`
2. **Driver-agnostic column metadata** - Generic `ColumnType` and `ColumnDef`, NOT Drizzle/better-auth types
3. **Adapter pattern** - `DSL.toDrizzle(Model)`, `DSL.toBetterAuth(Model)` as SEPARATE FUNCTIONS
4. **Extends VariantSchema.Class** - 6 variants: `select`, `insert`, `update`, `json`, `jsonCreate`, `jsonUpdate`
5. **Static properties** - `.tableName`, `.columns`, `.primaryKey`, `.indexes`, `.identifier`
6. **Anonymous class extension** - Type intersection pattern for static members
7. **`annotations()` override** - Must return NEW factory instance to preserve statics

---

## Key Research Synthesis

### Pattern: Anonymous Class Extension (from entity-id-kit-patterns.md, schema-static-properties-pattern.md)

```typescript
class ModelClass extends S.make<Self>(ast) {
  static override annotations(annotations: S.Annotations.Schema<Self>) {
    return makeModelClass(identifier, fields, mergeAnnotations(this.ast, annotations));
  }
  static readonly tableName = toSnakeCase(identifier);
  static readonly columns = columns;
  static readonly primaryKey = primaryKey;
  static readonly indexes = [] as readonly IndexDef[];
  static readonly identifier = identifier;
}
```

### Pattern: VariantSchema Integration (from variant-schema-extension-pattern.md)

```typescript
// Use VariantSchema.make() for 6-variant support
const { Class, Field, Struct, extract } = VariantSchema.make({
  variants: ["select", "insert", "update", "json", "jsonCreate", "jsonUpdate"],
  defaultVariant: "select"
});
```

### Pattern: Adapter Separation (from drizzle-effect-research.md, better-auth-db-system.md)

```typescript
// Core Model exposes GENERIC metadata
AccountModel.columns  // { id: ColumnDef, email: ColumnDef, ... }

// Adapters transform to driver-specific output
const drizzleTable = DSL.toDrizzle(AccountModel);      // PgTable
const betterAuthFields = DSL.toBetterAuth(AccountModel); // Record<string, DBFieldAttribute>
```

### Type Mappings (adapter responsibility)

| ColumnType | Drizzle | better-auth |
|------------|---------|-------------|
| `"string"` | `varchar`/`text` | `"string"` |
| `"number"` | `integer`/`bigint` | `"number"` |
| `"boolean"` | `boolean` | `"boolean"` |
| `"datetime"` | `timestamp` | `"date"` |
| `"date"` | `date` | `"date"` |
| `"json"` | `jsonb` | `"json"` |
| `"uuid"` | `uuid` | `"string"` |
| `"blob"` | `bytea` | N/A |

---

## Your Task: Execute Remaining Phases

### Phase 3: Initial Refinement

1. **Read** `dsl-model.original.md` (authoritative spec)
2. **Synthesize** the 10 aligned exploration-results files (focus on Alignment Notes sections)
3. **Create** a NEW refined prompt at `.specs/dsl-model/dsl-model.prompt.md`

Use the **COSTAR+CRISPE** structure:

```markdown
---
name: dsl-model
version: 1
created: <ISO timestamp>
iterations: 0
---

# DSL.Model - Refined Prompt

## Context
[Situational details: codebase structure, existing patterns like EntityId/VariantSchema, reference implementations]

## Objective
[Clear research/design task: answer Research Questions from original, produce type definitions, API design]

## Role
[Effect Schema architect with expertise in AST introspection, annotation mechanisms, VariantSchema extension]

## Constraints
[From AGENTS.md: Effect-first patterns, namespace imports, A.map/Str.split, Match.exhaustive, no native Date, etc.]

## Resources
[Specific files: VariantSchema.ts, entity-id.ts, string-literal-kit.ts, Model.ts, Table.ts]

## Output Specification
[Design document with: ColumnType/ColumnDef types, DSL.Model factory signature, DSL.Field combinator, adapter function signatures]

## Examples
[Usage examples from dsl-model.original.md showing Model definition, S.decode usage, static property access, adapter calls]

## Verification Checklist
[Success criteria from original prompt - 8 checkboxes]

---
## Metadata

### Research Sources
- Files: [list all 10 exploration-results]
- Reference implementations: [EntityId, StringLiteralKit, VariantSchema.Class]

### Refinement History
| Iteration | Issues Found | Fixes Applied |
|-----------|--------------|---------------|
| 0         | Initial      | N/A           |
```

### Phase 4: Review Loop

After creating the refined prompt, execute up to 3 iterations:

1. **Spawn Critic Agent**: Evaluate against checklists:
   - Prompt Engineering (specific context, clear objective, explicit constraints)
   - Repository Alignment (Effect-first, forbidden patterns listed)
   - Clarity (no ambiguous pronouns, no assumed knowledge)

2. **If NEEDS_FIXES**: Spawn Fixer Agent to apply corrections

3. **Update** iteration count and Refinement History table

### Phase 5: Finalization

Present to user:
- Path to final refined prompt
- Total iterations performed
- Key improvements made
- Verification checklist status

---

## Research Questions to Address (from original)

The refined prompt should guide research into:

1. **AST Introspection**: How to extract type info from `M.Generated(S.String)` or branded types?
2. **Default Value Handling**: How does `defaultValue: "gen_random_uuid()"` map to Drizzle's `.defaultRandom()`?
3. **Type Inference**: How to infer `ColumnType` from Effect Schema when no explicit `column.type` provided?
4. **Variant Mapping**: How do VariantSchema variants map to better-auth's `input`/`returned` flags?
5. **Index Definition**: How should compound/named indexes be specified in the DSL?

---

## Commands

To proceed, you can either:

1. **Run the skill**: `/refine-prompt` (will need to adapt since original already exists)
2. **Manual execution**: Read files, synthesize, write refined prompt, run review loop

---

## Critical Reminders

- **NO IMPLEMENTATION CODE** - This is research orchestration only
- **Preserve design decisions** - The 7 core decisions are final
- **Use aligned research** - Each file has Alignment Notes marking what to use vs ignore
- **Adapter separation** - Driver-specific logic NEVER leaks into core Model
- **Effect-first** - All code examples must use Effect patterns (A.map, Match, DateTime, etc.)
