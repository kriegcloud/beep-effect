# DSL.Model Final Review - Orchestration Handoff

## Mission

Orchestrate a comprehensive final review of all DSL.Model specification documents using parallel sub-agents. Identify all issues and areas for improvement, then fix everything systematically.

---

## Context

### What is DSL.Model?

DSL.Model is an Effect Schema factory that:
1. **IS a valid Effect Schema** - works with `S.decode()`, `.pipe()`, `.annotations()`
2. **Extends VariantSchema.Class** - inherits 6 variants (select/insert/update/json/jsonCreate/jsonUpdate)
3. **Exposes driver-agnostic SQL metadata** as static properties
4. **Enables adapter functions** (`toDrizzle`, `toBetterAuth`) for driver-specific outputs

### Critical Domain Patterns (MUST be consistent across all documents)

**1. Namespace Export Pattern**
```typescript
// Domain entities are exported as namespaces
export * as User from "./User";  // Creates User namespace
// Access: User.Model, NOT UserModel
```

**2. Primary Key Pattern (CRITICAL)**
- `id` is **NOT** the primary key - it's a public UUID with default generator
- `_rowId` **IS** the PRIMARY KEY - it's a `pg.serial` (auto-increment integer)

```typescript
const idFields = {
  id: S.optionalWith(entityId, { default: () => entityId.create() }),  // UUID, unique
  _rowId: M.Generated(entityId.modelRowIdSchema),  // PRIMARY KEY, serial
};
```

**3. Effect-First Patterns**
- `A.map`, `A.filter` instead of native array methods
- `Str.split`, `Str.toLowerCase` instead of native string methods
- `Match.value(...).pipe(Match.tag(...))` instead of switch statements
- `DateTime.unsafeNow()` instead of `new Date()`

**4. Import Conventions**
```typescript
import { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { BS } from "@beep/schema";
import { $SharedDomainId } from "@beep/identity/packages";
```

---

## Documents to Review

### Primary Documents (HIGH priority)

| Document | Purpose | Review Focus |
|----------|---------|--------------|
| `DSL-MODEL-DESIGN.md` | Authoritative design specification | Consistency, completeness, correctness |
| `dsl-model-poc.prompt.md` | POC implementation guide | Alignment with design, code examples |
| `dsl-model.prompt.md` | Original specification | May be outdated - check alignment |

### Supporting Documents (MEDIUM priority)

| Document | Purpose | Review Focus |
|----------|---------|--------------|
| `critic.prompt.md` | Review instructions | Still valid? |
| `poc.prompt.md` | Alternative POC prompt? | Redundancy check |
| `HANDOFF.md` | Previous handoff | Historical context |

### Exploration Results (LOW priority - reference only)

Located in `exploration-results/`:
- `effect-schema-ast-patterns.md`
- `drizzle-effect-research.md`
- `schema-static-properties-pattern.md`
- `better-auth-db-system.md`
- `livestore-patterns-synthesis.md`
- `entity-id-kit-patterns.md`
- `variant-schema-extension-pattern.md`
- `beep-effect-codebase.md`
- `effect-exposed-values-pattern.md`
- `schema-internals-dsl-model-research.md`

---

## Review Criteria

### Consistency Checks

1. **Primary Key Pattern**: All examples must show `_rowId` as PRIMARY KEY, not `id`
2. **Namespace Pattern**: All examples must use `User.Model` not `UserModel`
3. **ColumnType**: Must include `"integer"` type
4. **ColumnDef**: Must include `autoIncrement?: boolean`
5. **Imports**: Must use `SharedEntityIds`, `BS`, `$SharedDomainId` correctly
6. **Effect-First**: No native array/string methods, no switch statements

### Completeness Checks

1. All 5 research questions answered in design doc
2. All type definitions complete (ColumnType, ColumnDef, IndexDef, VariantConfig, FieldConfig)
3. All interface specifications complete (DSLField, ModelSchemaInstance)
4. All factory signatures complete (Field, Model)
5. All adapter signatures complete (toDrizzle, toBetterAuth)
6. Variant type helpers defined (InsertType, UpdateType, etc.)

### Correctness Checks

1. `annotations()` override uses `mergeSchemaAnnotations` (not raw AST manipulation)
2. `DSL.Model` signature includes `options?: { indexes?: readonly IndexDef[] }`
3. Type inference helpers are correctly defined
4. Pseudocode matches established patterns in codebase

---

## Execution Plan

### Phase 1: Parallel Review (Deploy 3 sub-agents)

**Agent 1: Design Document Review**
```
Review `.specs/dsl-model/DSL-MODEL-DESIGN.md` against:
- Critical domain patterns (namespace, primary key, Effect-first)
- Consistency with packages/shared/domain/src/common.ts
- Completeness of all sections
- Correctness of pseudocode

Produce a list of issues with severity (HIGH/MEDIUM/LOW) and specific fixes.
```

**Agent 2: POC Prompt Review**
```
Review `.specs/dsl-model/dsl-model-poc.prompt.md` against:
- Alignment with DSL-MODEL-DESIGN.md
- Critical domain patterns
- Test case correctness
- Code example accuracy

Produce a list of issues with severity and specific fixes.
```

**Agent 3: Supporting Documents Review**
```
Review these files for relevance and consistency:
- `.specs/dsl-model/dsl-model.prompt.md` (original spec)
- `.specs/dsl-model/critic.prompt.md`
- `.specs/dsl-model/poc.prompt.md`
- `.specs/dsl-model/HANDOFF.md`

Identify:
- Outdated content that conflicts with current design
- Redundant documents that should be removed or consolidated
- Missing cross-references
```

### Phase 2: Consolidate Issues

Collect all issues from the 3 agents and create a unified fix list organized by:
1. Document
2. Severity (HIGH → MEDIUM → LOW)
3. Type (Consistency, Completeness, Correctness)

### Phase 3: Parallel Fixes (Deploy fix agents)

For each document with issues, deploy a sub-agent to apply all fixes.

**Fix Agent Instructions**:
```
Apply the following fixes to [DOCUMENT]:

[LIST OF FIXES]

Read the file first, then make all edits. Verify each fix is applied correctly.
```

### Phase 4: Verification

Run a final verification pass to ensure:
1. All HIGH severity issues resolved
2. Cross-document consistency maintained
3. No new issues introduced

---

## Reference Files (Read these for context)

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/common.ts` | Canonical `makeFields` pattern with `id` and `_rowId` |
| `packages/shared/domain/src/entities/User/User.model.ts` | Example domain model |
| `packages/shared/domain/src/entities/index.ts` | Namespace export pattern |
| `packages/shared/domain/src/entity-ids/shared.ts` | SharedEntityIds definitions |
| `packages/common/schema/src/core/VariantSchema.ts` | 6-variant infrastructure |
| `packages/common/schema/src/identity/entity-id/entity-id.ts` | Static property pattern |

---

## Success Criteria

- [ ] All documents use `_rowId` as PRIMARY KEY consistently
- [ ] All documents use namespace pattern (`User.Model`) consistently
- [ ] All documents include `"integer"` ColumnType and `autoIncrement` in ColumnDef
- [ ] All code examples use correct imports (`SharedEntityIds`, `BS`, etc.)
- [ ] All pseudocode follows Effect-first patterns
- [ ] No conflicting information across documents
- [ ] Redundant/outdated documents identified and handled
- [ ] Design document passes verification checklist (Section 7)

---

## Commands

```bash
# To run sub-agents in parallel, use multiple Task tool calls in a single message
# Example structure (do not execute, just reference):

Task(subagent_type="general-purpose", prompt="Review Agent 1 prompt...")
Task(subagent_type="general-purpose", prompt="Review Agent 2 prompt...")
Task(subagent_type="general-purpose", prompt="Review Agent 3 prompt...")
```

---

## Notes

- The exploration-results/ documents are research artifacts - review for accuracy but don't prioritize fixes
- If documents are redundant (e.g., `poc.prompt.md` vs `dsl-model-poc.prompt.md`), recommend consolidation
- Always read the actual codebase files to verify patterns before making changes
