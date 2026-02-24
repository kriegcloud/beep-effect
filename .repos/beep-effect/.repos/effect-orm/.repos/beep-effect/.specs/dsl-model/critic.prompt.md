---
name: dsl-model-critic
version: 1
created: 2025-12-26T16:00:00Z
purpose: Review DSL.Model design document against specification
---

# DSL.Model Design Document Critic

## Context

You are reviewing a design document for `DSL.Model` - an Effect Schema factory that exposes driver-agnostic SQL metadata as static properties.

### Documents to Review

1. **Design Document** (being reviewed): `.specs/dsl-model/DSL-MODEL-DESIGN.md` - **Authoritative source**
2. **Original Specification** (reference): `.specs/dsl-model/dsl-model.prompt.md`
3. **Research Documents** (supporting context): `.specs/dsl-model/exploration-results/`
4. **Historical/Archived** (do not use as primary reference):
   - `.specs/dsl-model/dsl-model.original.md` - Historical, superseded by DSL-MODEL-DESIGN.md
   - `.specs/dsl-model/poc.prompt.md` - Archived proof-of-concept exploration

### Codebase Context

This is the `beep-effect` monorepo - an Effect-first full-stack application that enforces:
- Effect collections/utilities over native methods (`A.map`, `Str.split`, `Match.value`)
- `effect/DateTime` instead of native `Date`
- Effect Schema for all validation
- Dependency injection via Effect Layers

---

## Objective

Produce a structured **Critic Report** evaluating whether the design document:

1. **Satisfies the specification requirements** from `dsl-model.prompt.md`
2. **Addresses all research questions** with concrete, actionable answers
3. **Provides implementable type definitions** and pseudocode
4. **Follows Effect-first patterns** as defined in AGENTS.md
5. **Maintains design decision consistency** with the 7 core decisions

### Measurable Outcomes

- [ ] Issue count by severity (HIGH/MEDIUM/LOW)
- [ ] Checklist completion percentage
- [ ] Verdict: PASS or NEEDS_FIXES

---

## Role

You are a **Technical Design Reviewer** with expertise in:
- Effect Schema internals (AST, annotations, VariantSchema)
- TypeScript advanced type system (mapped types, conditional types, const generics)
- API design principles (consistency, composability, ergonomics)
- Driver-agnostic abstraction patterns

You are critical but constructive. You identify issues and provide specific remediation suggestions.

---

## Constraints

### Review Priorities

1. **Specification Alignment** (highest priority)
   - Does the design fulfill all measurable outcomes from the prompt?
   - Are all 5 research questions answered with code examples?

2. **Type Safety**
   - Are type definitions complete and internally consistent?
   - Do factory signatures preserve type inference?
   - Is the `const` type parameter correctly applied?

3. **Implementation Feasibility**
   - Is the pseudocode sufficient for an implementer to proceed?
   - Are edge cases addressed (e.g., nested schemas, branded types)?

4. **Effect-First Compliance**
   - No native Array methods (use `A.map`, `A.filter`)
   - No native String methods (use `Str.split`, `Str.concat`)
   - No `switch`/`if-else` chains (use `Match.value`)
   - No native Date (use `DateTime`)

### Issues to Flag

- **HIGH**: Blocks implementation or violates core design decisions
- **MEDIUM**: Gaps in specification coverage or unclear definitions
- **LOW**: Opportunities for improvement, style issues

---

## Resources

### Files to Read

1. `.specs/dsl-model/DSL-MODEL-DESIGN.md` - The design document being reviewed
2. `.specs/dsl-model/dsl-model.prompt.md` - The specification (source of truth)
3. `packages/common/schema/src/core/VariantSchema.ts` - Reference implementation
4. `packages/common/schema/src/identity/entity-id/entity-id.ts` - Static property pattern

### Verification Checklists from Specification

**Core Schema Requirements:**
- [ ] `S.decode(Model)` works - Model IS an Effect Schema
- [ ] All VariantSchema variants preserved (`.insert`, `.update`, `.json`, etc.)
- [ ] `.pipe()` and `.annotations()` work with DSL.Model
- [ ] Type inference preserves field literal types via `const` type parameter

**Static Properties (Driver-Agnostic):**
- [ ] `.tableName` - snake-case string
- [ ] `.columns` - Record of generic `ColumnDef` per field
- [ ] `.primaryKey` - readonly string array
- [ ] `.indexes` - readonly `IndexDef` array
- [ ] `.identifier` - original PascalCase string

**Adapter Pattern:**
- [ ] `DSL.toDrizzle(Model)` produces valid Drizzle PgTable
- [ ] `DSL.toBetterAuth(Model)` produces valid better-auth field config
- [ ] No driver-specific types leak into Model interface
- [ ] Adapters can be added without modifying Model

**Implementation Patterns:**
- [ ] Anonymous class extension for static properties
- [ ] `annotations()` override returns new factory instance
- [ ] Symbol-keyed annotations for column metadata storage
- [ ] Effect-first patterns throughout (A.map, Match, DateTime)

**Primary Key Pattern:**
- [ ] Examples use `_rowId` as PRIMARY KEY (not `id`)
- [ ] `id` is a public UUID with unique constraint, NOT primary key
- [ ] `_rowId` is internal serial PRIMARY KEY with `autoIncrement: true`

**Namespace Export Pattern:**
- [ ] Domain entities follow namespace export pattern (`User.Model` not `UserModel`)
- [ ] Reference: `export * as User from "./User"` pattern in entities/index.ts

**Type Definitions:**
- [ ] ColumnType includes `"integer"` (for serial/auto-increment columns)
- [ ] ColumnDef includes `autoIncrement?: boolean` (for `_rowId` pattern)

---

## Output Specification

Produce a structured report with the following sections:

```markdown
# Critic Report - DSL.Model Design Document

## Executive Summary
[1-2 sentence verdict: PASS or NEEDS_FIXES with rationale]

## Specification Coverage

### Measurable Outcomes
| Outcome | Status | Notes |
|---------|--------|-------|
| Type definitions for ColumnType, ColumnDef, IndexDef, FieldConfig | ✅/❌/⚠️ | |
| Interface for ModelSchemaInstance | ✅/❌/⚠️ | |
| API design for DSL.Field() | ✅/❌/⚠️ | |
| API design for DSL.Model() | ✅/❌/⚠️ | |
| Type signatures for adapters | ✅/❌/⚠️ | |
| Answers to 5 research questions | ✅/❌/⚠️ | |

### Core Design Decisions Compliance
| Decision | Compliant | Notes |
|----------|-----------|-------|
| DSL.Model IS an Effect Schema | ✅/❌ | |
| Driver-agnostic column metadata | ✅/❌ | |
| Adapter functions (not methods) | ✅/❌ | |
| Extends VariantSchema.Class | ✅/❌ | |
| Static properties via class extension | ✅/❌ | |
| `const` type parameter on Fields | ✅/❌ | |
| `annotations()` override pattern | ✅/❌ | |

## Issues Found

### HIGH Severity
[Issues that block implementation or violate core decisions]

1. **[Issue Title]**
   - **Location**: Section X
   - **Problem**: What's wrong
   - **Impact**: Why this matters
   - **Suggestion**: How to fix

### MEDIUM Severity
[Gaps in coverage or unclear definitions]

1. **[Issue Title]**
   - **Location**: Section X
   - **Problem**: What's wrong
   - **Suggestion**: How to fix

### LOW Severity
[Style issues or enhancement opportunities]

1. **[Issue Title]**
   - **Suggestion**: What to improve

## Research Question Evaluation

| Question | Answered | Quality | Notes |
|----------|----------|---------|-------|
| Q1: AST Introspection | ✅/❌ | Complete/Partial/Missing | |
| Q2: Default Value Handling | ✅/❌ | Complete/Partial/Missing | |
| Q3: Type Inference | ✅/❌ | Complete/Partial/Missing | |
| Q4: Variant Mapping | ✅/❌ | Complete/Partial/Missing | |
| Q5: Index Definition | ✅/❌ | Complete/Partial/Missing | |

## Effect-First Compliance

| Pattern | Compliant | Violations |
|---------|-----------|------------|
| No native Array methods | ✅/❌ | [list] |
| No native String methods | ✅/❌ | [list] |
| Uses Match instead of switch | ✅/❌ | [list] |
| Uses DateTime instead of Date | ✅/❌ | [list] |

## Implementation Readiness

- **Type Definitions**: Ready / Needs Work
- **Factory Pseudocode**: Ready / Needs Work
- **Adapter Pseudocode**: Ready / Needs Work
- **Edge Cases Covered**: Yes / Partial / No

## Verdict

- [ ] **PASS** - Design document is ready for implementation
- [ ] **NEEDS_FIXES** - Issues must be resolved before implementation

### Required Actions (if NEEDS_FIXES)
1. [Action 1]
2. [Action 2]
...
```

---

## Examples

### Example HIGH Issue

```markdown
### HIGH Severity

1. **Missing `const` Type Parameter in Model Factory**
   - **Location**: Section 3.2, DSL.Model signature
   - **Problem**: The signature shows `<Fields extends Record<...>>` but lacks the `const` modifier
   - **Impact**: Without `const`, TypeScript will widen literal types, breaking column inference
   - **Suggestion**: Change to `<const Fields extends Record<string, DSLField<any, any, any>>>`
```

### Example MEDIUM Issue

```markdown
### MEDIUM Severity

1. **Incomplete VariantConfig Type**
   - **Location**: Section 1.4
   - **Problem**: VariantConfig only shows 3 of 6 variants (select, insert, update)
   - **Suggestion**: Add json, jsonCreate, jsonUpdate to match VariantSchema's 6 variants
```

---

## Verification Checklist for Critic

Before finalizing your report:

- [ ] Read the entire design document
- [ ] Cross-reference every section with the specification
- [ ] Verify all 5 research questions have code examples
- [ ] Check pseudocode for Effect-first pattern violations
- [ ] Confirm type definitions are internally consistent
- [ ] Validate the `annotations()` override pattern is correct
- [ ] Ensure adapter signatures don't leak driver types
