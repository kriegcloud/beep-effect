---
name: dsl-review-1
version: 4
created: 2024-12-28T12:00:00Z
iterations: 3
status: validated
---

# DSL Module Issue Resolution Orchestrator - Refined Prompt

## Context

You are orchestrating the systematic resolution of validated issues identified in a comprehensive code review of the SQL DSL module in the beep-effect monorepo.

**Note**: Issue validation (iteration 3) reduced the issue count from 35+ to 11 actionable items. Many P2 "type safety" issues were found to be **NECESSARY** patterns for TypeScript's type system to work correctly. See `.specs/dsl-review-1/issue-reports/` for detailed analysis.

### Module Location
```
packages/common/schema/src/integrations/sql/dsl/
```

### Module Architecture (11 source files, ~3,370 lines)

| File                                   | Lines | Purpose                                                      | Validated Issues                              |
|----------------------------------------|-------|--------------------------------------------------------------|-----------------------------------------------|
| `types.ts`                             | 787   | Core type system, ColumnDef, DSLField, type-level derivation | P3-1 (typeof)                                 |
| `Model.ts`                             | 493   | Model class, field extraction, schema variants               | P0-2, P1-1, P1-3, P1-6                        |
| `validate.ts`                          | 486   | Runtime validation, invariant checking                       | —                                             |
| `derive-column-type.ts`                | 432   | AST → SQL column type derivation                             | P0-1 (union bug)                              |
| `combinators.ts`                       | 411   | Pipe-friendly column modifiers                               | — (all `any` patterns validated as NECESSARY) |
| `Field.ts`                             | 315   | Field factory, AST extraction                                | P1-2, P1-7, P3-2                              |
| `adapters/drizzle.ts`                  | 311   | DSL → Drizzle conversion                                     | —                                             |
| `adapters/drizzle-to-effect-schema.ts` | 269   | Drizzle → Effect Schema                                      | **DELETE FILE** (unused, research artifact)   |
| `errors.ts`                            | 247   | TaggedError definitions                                      | —                                             |
| `nullability.ts`                       | 115   | Nullable detection via AST                                   | —                                             |
| `literals.ts`                          | 67    | ColumnType, ModelVariant enums                               | —                                             |

*Note: `index.ts` (16 lines) and `relations.ts` (1 line) are trivial re-export/stub files.*

### Validated Out (Acceptable `any` patterns - no action required)

The following issues were analyzed and found to fall under **Acceptable `any` Usage** (see Constraints section):

| Issue                                    | Exception Category                    | Report                             |
|------------------------------------------|---------------------------------------|------------------------------------|
| P2-1: DSL.Fields index signature         | Structural typing in index signatures | `P2-1-dsl-fields-any.md`           |
| P2-2, P2-3: Extract types with UnsafeAny | Conditional type wildcards            | `P2-2-P2-3-extract-types-any.md`   |
| P2-4 to P2-12: Combinator `as any`       | Return type assertions                | `P2-4-to-P2-12-combinators-any.md` |

All validated `any` usages meet the requirements:
- **Contained**: None leak into user-facing types
- **Documented**: Reports explain the necessity
- **Centralized**: Uses `UnsafeTypes.UnsafeAny` where applicable
- **Type-safe results**: Final inferred types are correct

See `.specs/dsl-review-1/issue-reports/` for detailed analysis.

### Test Infrastructure
```
packages/common/schema/test/integrations/sql/dsl/
├── combinators.test.ts (621 lines)
├── derive-column-type.test.ts (431 lines)
├── drizzle-typed-columns.test.ts (454 lines)
├── field-model-comprehensive.test.ts (1,024 lines)
├── poc.test.ts (321 lines)
├── variant-integration.test.ts (760 lines)
└── invariants/
    ├── model-composition.test.ts (217 lines)
    └── sql-standard.test.ts (273 lines)
```

---

## Objective

Systematically fix all 35+ issues through a **research → fix → verify** pipeline, ensuring:

1. **Zero regressions** - All existing tests pass after each fix
2. **Type safety** - `bun run check --filter @beep/schema` passes
3. **Documentation** - Each fix is researched and documented before implementation
4. **Sequential execution** - One issue at a time, never parallel
5. **Traceability** - Research reports capture rationale for future maintainers

### Success Criteria
- [ ] All P0 issues resolved (2 critical bugs)
- [ ] All P1 issues resolved (5 high-priority refactors)
- [ ] File cleanup completed (1 deletion: drizzle-to-effect-schema.ts)
- [ ] All P3 issues resolved (2 Effect pattern violations)
- [ ] Type check passes: `bun run check --filter @beep/schema`
- [ ] Tests pass: `bun test packages/common/schema/test/integrations/sql/dsl/`
- [ ] Progress tracked in `.specs/dsl-review-1/progress.md`

**Total Validated Issues: 11** (down from 35+ after issue validation)

---

## Role

You are a **Senior Effect-TS Engineer** with expertise in:
- Effect Schema and AST manipulation
- Type-level programming in TypeScript
- Functional programming patterns (Match, Array utilities, Option)
- Code review and systematic refactoring

Your approach is methodical: **research deeply, fix precisely, verify thoroughly**.

---

## Subagent Type Reference

| Type                   | Purpose                  | Capabilities                                            |
|------------------------|--------------------------|---------------------------------------------------------|
| `"Explore"`            | Read-only research agent | Read files, search codebase, write reports to `.specs/` |
| `"effect-code-writer"` | Code modification agent  | All Explore capabilities + Edit/Write to source files   |

**Model**: Use `"sonnet"` for all subagents (Claude Sonnet for balanced speed/quality).

---

## Constraints

### Absolute Requirements (from CLAUDE.md/AGENTS.md)

**Effect-First Patterns:**
```typescript
// REQUIRED imports
import * as Effect from "effect/Effect"
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
import * as P from "effect/Predicate"
import * as S from "effect/Schema"
import * as Match from "effect/Match"
import * as Struct from "effect/Struct"
import * as R from "effect/Record"
import * as Str from "effect/String"
import * as AST from "effect/SchemaAST"
```

**Forbidden Patterns:**

| Pattern                  | Violation      | Replacement                                              |
|--------------------------|----------------|----------------------------------------------------------|
| `for (const x of arr)`   | Native loop    | `F.pipe(arr, A.forEach(...))` or `A.reduce(...)`         |
| `arr.map(fn)`            | Native method  | `F.pipe(arr, A.map(fn))`                                 |
| `arr.filter(fn)`         | Native method  | `F.pipe(arr, A.filter(fn))`                              |
| `arr.push(x)`            | Mutation       | `F.pipe(arr, A.append(x))`                               |
| `str.split(",")`         | Native method  | `F.pipe(str, Str.split(","))`                            |
| `str.join(",")`          | Native method  | `F.pipe(arr, A.join(","))`                               |
| `typeof x === "string"`  | Native check   | `P.isString(x)`                                          |
| `arr.length > 0`         | Native check   | `A.isNonEmptyArray(arr)`                                 |
| `if/else if/else` chains | Non-exhaustive | `Match.value(x).pipe(Match.when(...), Match.exhaustive)` |
| `switch (x._tag)`        | Non-exhaustive | `Match.value(x).pipe(Match.tag(...), Match.exhaustive)`  |
| `throw new Error(...)`   | Untyped error  | `S.TaggedError` class                                    |
| `any` type               | Type erasure   | `unknown` + type guards or proper generics               |
| `() => null`             | Bare no-op     | `nullOp` from `@beep/utils`                              |

### Acceptable `any` Usage (Exceptions)

The following scenarios are **ACCEPTABLE** uses of `any` or type assertions:

| Scenario                                  | Why It's Acceptable                                                                        | Best Practice                                      |
|-------------------------------------------|--------------------------------------------------------------------------------------------|----------------------------------------------------|
| **Structural typing in index signatures** | TypeScript requires `any` for variance in index signatures that accept heterogeneous types | Use `DSLField<any, any, any>` in `DSL.Fields`      |
| **Conditional type wildcards**            | `infer` patterns need unconstrained type parameters to match all possible types            | Use `UnsafeTypes.UnsafeAny` and document           |
| **Type-level pattern matching**           | Extracting type parameters from generic types requires `any` as a wildcard                 | Ensure `any` is contained, doesn't leak to results |
| **Return type assertions**                | When type-level computation is correct but TypeScript can't verify it                      | Add `as any` with comment explaining safety        |
| **Bridging type systems**                 | Integrating external libraries (Drizzle, etc.) may require type erasure at boundaries      | Localize to adapter modules                        |

**Requirements for acceptable `any`:**
1. **Contained** - The `any` must not leak into user-facing types
2. **Documented** - Complex cases should have comments explaining why
3. **Centralized** - Prefer `UnsafeTypes.UnsafeAny` over bare `any` for auditing
4. **Type-safe results** - The final inferred types for users must be correct

### @beep/schema Package Rules

From `packages/common/schema/AGENTS.md`:
- **Keep schemas pure**: No network/DB/filesystem/timers/logging
- **Maintain BS namespace**: Add exports through `src/schema.ts`
- **No cross-slice imports**: Never import from `@beep/iam-*`, `@beep/documents-*`
- **Rich annotations**: Include `identifier`, `title`, `description`, `jsonSchema` where applicable

### Verification Commands

After EVERY fix:
```bash
# Type check
bun run check --filter @beep/schema

# Run tests
bun test packages/common/schema/test/integrations/sql/dsl/
```

Both must pass before proceeding to next issue.

---

## Resources

### Effect Pattern Reference
```
docs/research/dsl-effect-patterns-reference.md
```

Contains copy-paste patterns for:
1. `Match.exhaustive` - Replacing if-else chains
2. `A.reduce` / `A.forEach` - Replacing for-of loops
3. `S.TaggedError` - Custom error types
4. `P.isObject` / `P.hasProperty` - Type guards
5. `A.append` / `A.empty` - Immutable arrays

**Usage**: Include relevant sections from this reference in Researcher and Fixer agent prompts when the issue requires those patterns.

### Issue Reports Directory
```
.specs/dsl-review-1/issue-reports/
```

Each issue gets a research report: `[ID].md` (e.g., `P0-1.md`, `P1-2.md`)

### Progress Tracking
```
.specs/dsl-review-1/progress.md
```

---

## Output Specification

### Research Report Format (`issue-reports/[ID].md`)

```markdown
# Issue [ID]: [Title]

## Status (Updated by Orchestrator after each phase)
- [ ] Researched (after Researcher agent completes)
- [ ] Fixed (after Fixer agent completes)
- [ ] Verified (after verification commands pass)

## Current Code

**File**: `[path]:[line-range]`

```typescript
// Exact code with line numbers
```

## Problem Analysis

[Why this violates standards, what can break]

## Affected Files

| File      | Relationship                 |
|-----------|------------------------------|
| `file.ts` | Imports/depends on this code |

## Proposed Fix

### Before
```typescript
// Current problematic code
```

### After
```typescript
// Fixed code following Effect patterns
```

## Alternative Approaches (if applicable)

[Other valid solutions the Researcher considered, with trade-offs]

## Test Requirements

- [ ] Existing test: `[test file]` covers this path
- [ ] New test needed: [description]

## Risks & Considerations

[Edge cases, potential side effects, migration concerns]

## Implementation Notes (Filled by Fixer agent)

[Any deviations from proposed fix, discoveries during implementation]

## Verification Failures (Filled if verification fails)

[Error messages, diagnostics, attempted fixes]
```

### Progress File Format (`progress.md`)

```markdown
# DSL Review Progress

## Summary
- Total Issues: 35
- Completed: X
- In Progress: Y
- Blocked: Z

## Completed
- [x] P0-1: Union Type Derivation Bug (2024-12-28)
- [x] P0-2: AggregateError → TaggedError (2024-12-28)
...

## Current
- Issue: [ID]
- Phase: Research | Fixing | Verifying
- Started: [timestamp]

## Blocked
- [ID]: [reason]

## Discoveries
(New issues found during implementation - add to issue backlog if significant)
```

---

## Issue Catalog (Validated)

> **Validation completed 2024-12-28**: 35+ issues reduced to 11 actionable items.
> See `.specs/dsl-review-1/issue-reports/` for detailed analysis of all validated-out issues.

### P0 - Critical (Fix First)

#### P0-2: Native AggregateError
- **File**: `Model.ts:337`
- **Issue**: `throw new AggregateError(...)` instead of TaggedError
- **Impact**: Breaks Effect error handling, no Match.tag support

### P1 - High Priority

#### P1-1: Mutable Array in validateModelInvariants
- **File**: `Model.ts:165`
- **Issue**: `const errors = []; errors.push(...)` mutation pattern

#### P1-2: Native for...of in Field.ts
- **File**: `Field.ts:51-56`
- **Issue**: `for (const key of schemaKeys)` loop

#### P1-3: Native for...of in Model.ts
- **File**: `Model.ts:476-490`
- **Issue**: `for (const variant of ModelVariant.Options)` loop

#### ~~P1-4, P1-5~~ (Superseded by FILE-1)

#### P1-6: Non-Exhaustive Match Pattern
- **File**: `Model.ts:301-310`
- **Issue**: if-else chain for field type checking

#### P1-7: Prototype Chain Shallow Copy
- **File**: `Field.ts:283-299`
- **Issue**: `Object.assign()` creates shared references

### FILE - Cleanup Tasks

#### FILE-1: Delete Unused Adapter
- **File**: `adapters/drizzle-to-effect-schema.ts`
- **Action**: DELETE the entire file
- **Reason**: Unused, not exported, research artifact for wrong direction (Drizzle → Effect). The actual implementation (`adapters/drizzle.ts`) goes Effect → Drizzle with zero `any` usage.
- **Replaces**: P1-4, P1-5, P2-13, P2-14, P2-15, P3-3, P3-4 (all issues in this file)
- **Report**: `.specs/dsl-review-1/issue-reports/P2-13-to-P2-15-drizzle-any.md`

### P2 - Medium Priority (Type Safety) — ALL VALIDATED OUT

> **All P2 issues validated as NECESSARY TypeScript patterns.** No action required.

| Issue                                    | Verdict     | Report                             |
|------------------------------------------|-------------|------------------------------------|
| P2-1: DSL.Fields Index Signature         | NECESSARY   | `P2-1-dsl-fields-any.md`           |
| P2-2, P2-3: Extract Types UnsafeAny      | NECESSARY   | `P2-2-P2-3-extract-types-any.md`   |
| P2-4 to P2-12: Combinator `as any`       | NECESSARY   | `P2-4-to-P2-12-combinators-any.md` |
| P2-13 to P2-15: drizzle-to-effect-schema | DELETE FILE | `P2-13-to-P2-15-drizzle-any.md`    |

### P3 - Low Priority (Effect Patterns)

#### P3-1: Native typeof Check
- **File**: `types.ts:548`
- **Issue**: Uses `typeof u === "object"` instead of `P.isObject(u)`
- **Fix**: Replace with `P.isNotNull(u) && P.isObject(u)`
- **Report**: `.specs/dsl-review-1/issue-reports/P3-1-native-typeof.md`

#### P3-2: Native .join() Method
- **File**: `Field.ts:63`
- **Issue**: Uses `schemaKeys.join(", ")` instead of Effect Array utilities

#### ~~P3-3, P3-4~~ (Superseded by FILE-1)

---

## Pre-Flight Setup

Before starting the first issue, the orchestrator MUST:

### 1. Create Required Directories
```bash
mkdir -p .specs/dsl-review-1/issue-reports
```

### 2. Initialize Progress File

Create `.specs/dsl-review-1/progress.md` with:

```markdown
# DSL Review Progress

## Summary
- Total Issues: 35
- Completed: 0
- In Progress: 0
- Blocked: 0

## Completed
(none yet)

## Current
- Issue: P0-1
- Phase: Not Started
- Started: —

## Blocked
(none)

## Discoveries
(none yet)
```

### 3. Verify Pattern Reference Exists
```bash
test -f docs/research/dsl-effect-patterns-reference.md && echo "OK" || echo "MISSING"
```

If missing, halt and report to user.

---

## Execution Protocol

### For Each Issue

#### Step 1: Deploy Researcher Agent

```yaml
subagent_type: "Explore"
model: "sonnet"
prompt: |
  Research issue [ID] in the DSL module.

  ## Context
  Read the Effect pattern reference for applicable patterns:
  `docs/research/dsl-effect-patterns-reference.md`

  ## Files to Read
  - [primary file with issue]
  - Related files that import/use this code
  - Existing tests covering this code path

  ## Deliverable
  Write research report to: .specs/dsl-review-1/issue-reports/[ID].md

  Follow the report format exactly. Include:
  1. Exact current code with line numbers
  2. Why it violates standards
  3. All files that depend on this code
  4. Precise before/after fix (copy patterns from reference)
  5. Test coverage assessment
  6. Risk analysis
  7. Alternative approaches if the primary fix seems risky
```

**Wait for completion. Verify report exists at `.specs/dsl-review-1/issue-reports/[ID].md`.**

#### Step 2: Deploy Fixer Agent

```yaml
subagent_type: "effect-code-writer"
model: "sonnet"
prompt: |
  Fix issue [ID] following the research report at:
  .specs/dsl-review-1/issue-reports/[ID].md

  ## Instructions
  1. Read the report thoroughly
  2. Apply the proposed fix exactly
  3. Run: bun run check --filter @beep/schema
  4. Run: bun test packages/common/schema/test/integrations/sql/dsl/
  5. If either fails, diagnose and fix (document in "Verification Failures" section)
  6. Update the report's "Implementation Notes" section
  7. Do NOT update Status checkboxes (Orchestrator does this)
```

**Wait for completion. Verify both commands pass.**

#### Step 3: Update Progress (Orchestrator Action)

Update `.specs/dsl-review-1/progress.md`:
- Move issue to Completed section with date
- Clear Current section or set to next issue
- Note any discoveries

Update the issue report `.specs/dsl-review-1/issue-reports/[ID].md`:
- Check all Status checkboxes

#### Step 4: Proceed or Halt

- **If success**: Proceed to next issue in priority order
- **If failure**: Follow Verification Failure Protocol below

---

## Verification Failure Protocol

If verification commands fail after Fixer agent completes:

### Retry Once
1. Fixer agent documents failure in report's "Verification Failures" section
2. Fixer agent attempts alternative approach (if documented in research)
3. Re-run verification commands

### If Retry Fails
1. Mark issue as "Blocked" in `progress.md` with detailed reason
2. Move "Blocked" count in Summary section
3. **Halt pipeline** - Do not proceed to next issue
4. Report to user with:
   - Issue ID and title
   - Verification command that failed
   - Error output
   - Attempts made
   - Link to issue report

### User Decision Required
- User may: provide guidance, skip issue, or abort pipeline

---

## Orchestration Rules

1. **One agent at a time** - Never run research and fix in parallel
2. **Research first, always** - Never skip the research phase
3. **Verify before proceeding** - Type check AND tests must pass
4. **Document everything** - Reports capture institutional knowledge
5. **Stop on failure** - Critical failures halt the pipeline (see Failure Protocol)
6. **Priority order** - P0 → P1 → P2 → P3, within priority by issue number

---

## Verification Checklist

Before marking ANY issue complete (Orchestrator checks these):

- [ ] Research report exists at `.specs/dsl-review-1/issue-reports/[ID].md`
- [ ] Report has all required sections filled
- [ ] Fix matches proposed solution (or deviations documented in Implementation Notes)
- [ ] `bun run check --filter @beep/schema` passes
- [ ] `bun test packages/common/schema/test/integrations/sql/dsl/` passes
- [ ] Progress file updated (issue moved to Completed)
- [ ] Issue report Status checkboxes updated
- [ ] No new TypeScript errors introduced
- [ ] No test regressions

---

## Start Command

**Pre-flight complete?** Run Pre-Flight Setup section first.

Then begin with **P0-1: Union Type Derivation Bug** - it's the most critical issue with the clearest fix path. This validates the research → fix → verify pipeline before tackling complex type safety issues.

Deploy the Researcher Agent for P0-1 now.

---

## Metadata

### Research Sources

**Files Explored:**
- `packages/common/schema/src/integrations/sql/dsl/*.ts` (11 source files)
- `packages/common/schema/test/integrations/sql/dsl/*.test.ts` (8 files)
- `packages/common/schema/AGENTS.md`
- `CLAUDE.md` (root)

**Documentation Consulted:**
- Effect Pattern Matching docs
- Effect Array/Predicate API docs
- Effect Schema TaggedError docs

**Packages Reviewed:**
- `@beep/schema` AGENTS.md
- `@beep/utils` AGENTS.md
- `@beep/contract` AGENTS.md
- `@beep/invariant` AGENTS.md
- `@beep/errors` AGENTS.md

### Refinement History

| Iteration | Issues Found                             | Fixes Applied                                                                                                                                                                                                                                    |
|-----------|------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 0         | Initial                                  | N/A                                                                                                                                                                                                                                              |
| 1         | 10 issues (3 HIGH, 4 MEDIUM, 3 LOW)      | Added: Pre-Flight Setup, Subagent Glossary, Failure Protocol, Checkbox ownership, Str import, @beep/schema rules, Line count corrections                                                                                                         |
| 2         | 5 minor issues (0 HIGH, 1 MEDIUM, 4 LOW) | **PASS** - No blocking issues. Minor enhancements noted: DateTime import, Discoveries clarification                                                                                                                                              |
| 3         | Issue validation (Type Safety audit)     | **35+ issues reduced to 11 actionable items.** All P2 type safety issues validated as NECESSARY TypeScript patterns. drizzle-to-effect-schema.ts identified as unused file for deletion. Reports created in `.specs/dsl-review-1/issue-reports/` |
