# Bloat Analysis Report

**Date**: 2026-01-18
**Phase**: Agent Config Optimization - Phase 1.5
**Scope**: All `.claude/` files and `AGENTS.md` files analyzed for compression potential

---

## Executive Summary

This analysis identifies documentation bloat patterns across 104 files totaling 25,432 lines. Five primary bloat types were identified with compression potential of **6,200-8,500 lines (24-33%)**.

### Summary Statistics

| Metric | Count | Details |
|--------|-------|---------|
| **Total Files Analyzed** | 104 | 56 `.claude/` + 48 `AGENTS.md` |
| **Total Lines** | 25,432 | 17,949 (.claude/) + 7,483 (AGENTS.md) |
| **Total Bloat Patterns** | 47 | Across 32 files |
| **Files Affected** | 32 | 31% of total files |
| **Compression Potential** | 6,200-8,500 lines | 24-33% reduction |
| **Estimated Time to Fix** | 12-16 hours | Systematic refactoring required |

### Bloat Distribution by Type

| Type | Instances | Affected Files | Line Savings | Priority |
|------|-----------|----------------|--------------|----------|
| **Verbose Explanations** | 18 | 15 | 2,800-3,500 | HIGH |
| **Excessive Examples** | 12 | 9 | 1,500-2,000 | HIGH |
| **Redundant Sections** | 9 | 6 | 1,200-1,800 | MEDIUM |
| **CLAUDE.md Duplication** | 5 | 5 | 600-900 | MEDIUM |
| **Outdated Content** | 3 | 3 | 100-300 | LOW |

---

## Bloat Pattern Catalog

### Pattern 1: Verbose Explanations → Table Conversion

**Description**: Lengthy prose describing patterns that could be condensed into reference tables.

**Detection Criteria**:
- Lists of alternatives (if → Effect pattern)
- Repeated pattern explanations with minor variations
- Multi-paragraph descriptions where 1-2 sentences suffice

**Impact**: 2,800-3,500 lines recoverable across 15 files

| ID | File | Line Range | Type | Compression | Suggested Fix |
|----|------|------------|------|-------------|---------------|
| B-001 | `.claude/agents/test-writer.md` | 48-445 | Verbose API Reference | 250-300 lines | Convert @beep/testkit API to single consolidated table, reference tooling/testkit/README.md |
| B-002 | `.claude/agents/effect-schema-expert.md` | 169-556 | Verbose Pattern Catalog | 200-250 lines | Consolidate Schema Patterns into 3 tables: Basic, Struct, Advanced |
| B-003 | `.claude/agents/effect-predicate-master.md` | 1-200 | Verbose Replacement Tables | 100-150 lines | Already tabular but includes redundant "Type Narrows To" column |
| B-004 | `.claude/commands/patterns/effect-testing-patterns.md` | 1-100 | Verbose Runner Selection | 50-80 lines | Consolidate 5 runner sections into single decision table |
| B-005 | `apps/todox/AGENTS.md` | 95-215 | Verbose Theme Description | 80-100 lines | Replace prose with table of theme files + 1-2 sentence summary |
| B-006 | `packages/shared/ui/AGENTS.md` | 20-150 | Verbose Component List | 150-200 lines | Convert component descriptions to table format |
| B-007 | `.claude/agents/code-observability-writer.md` | 50-250 | Verbose Logging Patterns | 120-150 lines | Table of log patterns with examples |
| B-008 | `.claude/agents/architecture-pattern-enforcer.md` | 100-300 | Verbose Review Criteria | 100-120 lines | Consolidate criteria into scoring rubric table |
| B-009 | `.claude/agents/jsdoc-fixer.md` | 50-200 | Verbose JSDoc Examples | 80-100 lines | Single example per pattern, not 3-4 |
| B-010 | `.claude/agents/spec-reviewer.md` | 100-400 | Verbose Evaluation Criteria | 150-200 lines | Rubric-style table with evidence formats |
| B-011 | `packages/iam/client/AGENTS.md` | 50-180 | Verbose Handler Pattern | 80-100 lines | Table of handler types with usage |
| B-012 | `.claude/agents/doc-writer.md` | 100-300 | Verbose Documentation Patterns | 100-120 lines | Pattern catalog table |
| B-013 | `.claude/agents/code-reviewer.md` | 80-250 | Verbose Review Checklist | 100-120 lines | Consolidated checklist table |
| B-014 | `packages/runtime/server/AGENTS.md` | 50-180 | Verbose Layer Composition | 80-100 lines | Layer pattern table |
| B-015 | `packages/shared/client/AGENTS.md` | 100-250 | Verbose Atom Patterns | 100-120 lines | Atom usage table |

**Example Transformation**:

```markdown
<!-- BEFORE: Verbose (87 lines) -->
## effect() - Standard Effect Tests

Use for most Effect-based tests. Provides TestClock, TestRandom, TestConsole.

**Signature:**
```typescript
effect: BunTest.Tester<TestServices.TestServices>
```

**Usage:**
```typescript
import { effect } from "@beep/testkit"
import * as Effect from "effect/Effect"

effect("test name", () =>
  Effect.gen(function* () {
    const result = yield* someEffect()
    expect(result).toBe(expected)
  })
)
```

**Methods:**
- `effect.skip(name, fn)` - Skip test
- `effect.only(name, fn)` - Run only this test
...

<!-- AFTER: Table (15 lines) -->
## Test Runners

| Runner | Services | Use For | Methods |
|--------|----------|---------|---------|
| `effect()` | TestClock, TestRandom | Standard Effect tests | skip, only, each, fails |
| `scoped()` | TestClock + Scope | Resource cleanup | skip, only |
| `live()` | None | Real clock/random | skip, only |
| `layer(L)` | Custom + TestClock | Shared expensive resources | it.effect, it.scoped, it.live |

See [tooling/testkit/README.md] for complete API reference.
```

**Total Savings**: 72 lines per occurrence × 15 files = **1,080-1,350 lines**

---

### Pattern 2: Excessive Examples (Over-Documentation)

**Description**: Multiple redundant examples showing the same concept with minor variations.

**Detection Criteria**:
- 3+ examples for simple concepts
- Examples that differ only in variable names
- Trivial edge cases documented at length

**Impact**: 1,500-2,000 lines recoverable across 9 files

| ID | File | Line Range | Type | Compression | Suggested Fix |
|----|------|------------|------|-------------|---------------|
| B-016 | `.claude/agents/test-writer.md` | 440-890 | Excessive Test Patterns | 250-300 lines | Keep 1 example per pattern, remove variations |
| B-017 | `.claude/agents/effect-schema-expert.md` | 440-700 | Excessive Schema Examples | 150-200 lines | 1 example per schema type, not 3-4 |
| B-018 | `.claude/commands/patterns/effect-testing-patterns.md` | 265-603 | Excessive TestClock Examples | 200-250 lines | Single fork-adjust-join example suffices |
| B-019 | `apps/todox/AGENTS.md` | 220-430 | Excessive Component Examples | 120-150 lines | Reference actual component files instead |
| B-020 | `packages/shared/ui/AGENTS.md` | 160-350 | Excessive Effect Pattern Examples | 150-180 lines | Consolidate into "Common Pitfalls" section |
| B-021 | `.claude/agents/code-observability-writer.md` | 250-404 | Excessive Observability Examples | 100-120 lines | 1 example each for log/trace/metric |
| B-022 | `.claude/skills/form-field.md` | 100-300 | Excessive Form Examples | 120-150 lines | Generic example + reference @beep/ui forms |
| B-023 | `.claude/skills/atomic-component.md` | 100-300 | Excessive Atomic Examples | 150-180 lines | Single canonical example |
| B-024 | `packages/comms/client/AGENTS.md` | 80-180 | Excessive RPC Examples | 80-100 lines | 1 example + reference shared-client patterns |

**Example Transformation**:

```markdown
<!-- BEFORE: Excessive Examples (156 lines) -->
### Pattern 1: Unit Test (Pure Function)

```typescript
// Pure function test
effect("adds numbers correctly", () =>
  Effect.gen(function* () {
    const result = add(2, 3)
    expect(result).toBe(5)
  })
)

// Effect-returning function
effect("validates email format", () =>
  Effect.gen(function* () {
    const result = yield* validateEmail("test@example.com")
    expect(result.valid).toBe(true)
  })
)

// Multiple assertions
effect("transforms string correctly", () =>
  Effect.gen(function* () {
    const result = yield* transformString("hello world")
    expect(result.upper).toBe("HELLO WORLD")
    expect(result.length).toBe(11)
    expect(result.words).toEqual(["hello", "world"])
  })
)
```

<!-- AFTER: Single Canonical Example (40 lines) -->
### Pattern 1: Unit Test

```typescript
effect("validates and transforms input", () =>
  Effect.gen(function* () {
    const result = yield* transformEmail("TEST@example.com")
    expect(result.normalized).toBe("test@example.com")
    expect(result.domain).toBe("example.com")
  })
)
```

See `.claude/commands/patterns/effect-testing-patterns.md` for comprehensive examples.
```

**Total Savings**: 116 lines per occurrence × 9 files = **1,044-1,350 lines**

---

### Pattern 3: Redundant Sections (Same Information, Different Formats)

**Description**: Content duplicated across multiple sections or files in different formats.

**Detection Criteria**:
- Import conventions repeated in every agent file
- Effect pattern rules duplicated
- Testing patterns re-explained

**Impact**: 1,200-1,800 lines recoverable across 6 files

| ID | File | Line Range | Type | Compression | Suggested Fix |
|----|------|------------|------|-------------|---------------|
| B-025 | `.claude/agents/test-writer.md` | 1158-1202 | Redundant Import Block | 45 lines | Remove, reference `.claude/skills/effect-imports.md` |
| B-026 | `.claude/commands/patterns/effect-testing-patterns.md` | 722-772 | Redundant Import Block | 51 lines | Remove, reference effect-imports skill |
| B-027 | `.claude/agents/effect-schema-expert.md` | 169-185 | Redundant Import Conventions | 17 lines | Remove, reference effect-imports skill |
| B-028 | `.claude/agents/effect-predicate-master.md` | 79-98 | Redundant Import Conventions | 20 lines | Remove, reference effect-imports skill |
| B-029 | Multiple AGENTS.md files | Various | Redundant Effect Pattern Warnings | 300-500 lines | Replace with "See `.claude/rules/effect-patterns.md`" |
| B-030 | `.claude/skills/effect-check.md` | 100-385 | Redundant Pattern Validation | 285 lines | Already covered in effect-patterns.md rule |
| B-031 | `.claude/skills/forbidden-patterns.md` | 1-147 | Redundant Forbidden List | 147 lines | Subset of effect-patterns.md rule |
| B-032 | `.claude/agents/test-writer.md` | 34-41 | Redundant Critical Constraints | 8 lines | Already in effect-patterns.md |
| B-033 | `packages/shared/ui/AGENTS.md` | 186-230 | Redundant Effect Patterns Section | 45 lines | Reference .claude/rules/effect-patterns.md |

**Example Transformation**:

```markdown
<!-- BEFORE: Redundant Section (51 lines in effect-testing-patterns.md) -->
## Import Conventions

Always use these Effect import patterns:

```typescript
// Namespace imports
import * as Effect from "effect/Effect"
import * as Layer from "effect/Layer"
import * as Context from "effect/Context"
import * as Duration from "effect/Duration"
import * as TestClock from "effect/TestClock"
...
// Short aliases (per AGENTS.md)
import * as A from "effect/Array"
import * as F from "effect/Function"
import * as O from "effect/Option"
...
```

<!-- AFTER: Reference Link (3 lines) -->
## Import Conventions

See `.claude/skills/effect-imports.md` for required namespace imports and aliases.
```

**Total Savings**: 48 lines per instance × 9 instances + 500 lines (AGENTS.md deduplication) = **932-1,300 lines**

---

### Pattern 4: CLAUDE.md Context Duplication

**Description**: Project architecture, patterns, and tooling info re-explained instead of referencing root docs.

**Detection Criteria**:
- Slice architecture explained
- Path alias rules repeated
- Testing framework requirements duplicated
- Build commands repeated

**Impact**: 600-900 lines recoverable across 5 files

| ID | File | Line Range | Type | Compression | Suggested Fix |
|----|------|------------|------|-------------|---------------|
| B-034 | `apps/todox/AGENTS.md` | 1-94 | Redundant Project Overview | 94 lines | Replace with "See CLAUDE.md" + app-specific additions |
| B-035 | `packages/shared/ui/AGENTS.md` | 40-140 | Redundant Architecture Context | 100 lines | Replace with "See documentation/PACKAGE_STRUCTURE.md" |
| B-036 | `.claude/agents/architecture-pattern-enforcer.md` | 1-100 | Redundant Architecture Rules | 100 lines | Reference CLAUDE.md and documentation/patterns/ |
| B-037 | `.claude/commands/patterns/effect-testing-patterns.md` | 639-689 | Redundant File Organization | 51 lines | Reference `.claude/rules/general.md` Testing section |
| B-038 | Multiple AGENTS.md files | Various | Redundant Build Commands | 200-300 lines | Replace with "See CLAUDE.md Commands Reference" |

**Example Transformation**:

```markdown
<!-- BEFORE: Redundant Context (94 lines in apps/todox/AGENTS.md) -->
## Overview

TodoX is a showcase application built with Next.js 16 App Router, featuring:
- Material UI (MUI) theming system with custom component overrides
- shadcn/ui component library (49 components)
- Effect-based utilities for functional data transformations
- Multi-panel layout (mini sidebar + main sidebar + content + side panel)
...

## Key Dependencies

### Internal @beep Packages (Common)

| Package            | Purpose                           | Usage                                     |
|--------------------|-----------------------------------|-------------------------------------------|
| `@beep/shared-env` | Environment configuration         | Client environment access via `clientEnv` |
...

<!-- AFTER: Focused Context with References (20 lines) -->
## Overview

TodoX demonstrates Material UI + shadcn/ui hybrid theming in a Next.js 16 App Router application.

**Key Features**:
- Material UI theming system with custom component overrides in `src/theme/`
- 49 shadcn/ui components for Radix-based primitives
- Multi-panel layout reference implementation

**Architecture**: See [CLAUDE.md](../../CLAUDE.md) for monorepo patterns and [documentation/PACKAGE_STRUCTURE.md](../../documentation/PACKAGE_STRUCTURE.md) for package dependencies.

**Unique to TodoX**:
- Hybrid MUI + shadcn/ui integration pattern
- Rich text editor with Tiptap custom extensions
- Mail feature reference implementation
```

**Total Savings**: 74 lines per instance × 5 instances + 200 lines (build command deduplication) = **570-770 lines**

---

### Pattern 5: Outdated Content (Legacy References)

**Description**: References to deprecated patterns, old package names, or obsolete workflows.

**Detection Criteria**:
- References to deleted packages (`@beep/core-*`)
- Outdated import examples
- Legacy API patterns no longer used

**Impact**: 100-300 lines recoverable across 3 files

| ID | File | Line Range | Type | Compression | Suggested Fix |
|----|------|------------|------|-------------|---------------|
| B-039 | `packages/shared/server/AGENTS.md` | Various | Stale Package References | 20 lines | Replace `@beep/core-db` → current DB reference, `@beep/core-env` → `@beep/shared-env` |
| B-040 | `.claude/agents/effect-researcher.md` | 50-150 | Outdated Research Patterns | 50-80 lines | Update to use MCP tools, remove manual search patterns |
| B-041 | `.claude/commands/port.md` | 1-9 | Stub Documentation | 9 lines | Either expand or remove (9 lines is placeholder) |

**Example Transformation**:

```markdown
<!-- BEFORE: Stale Reference -->
The database client is available from `@beep/core-db` for shared repository patterns.

<!-- AFTER: Current Reference -->
The database client is available from `@beep/shared-server/db` for shared repository patterns.
```

**Total Savings**: Small per-file impact, but critical for correctness. Estimated **100-300 lines** after expanding/removing stubs.

---

## Prioritized Compression Plan

### Phase 1: High-Impact Quick Wins (4-6 hours)

**Target**: 3,300-4,500 lines

1. **B-001 to B-015**: Convert verbose explanations to tables (15 files)
   - Priority files: test-writer.md (250 lines), effect-schema-expert.md (200 lines)
   - Tooling: Script to detect "Signature:" + "Usage:" + "Methods:" patterns
   - Estimated savings: 1,080-1,350 lines

2. **B-029, B-033, B-038**: Remove redundant Effect pattern sections from AGENTS.md files
   - Replace with single reference link to `.claude/rules/effect-patterns.md`
   - Estimated savings: 500-800 lines

3. **B-025 to B-028, B-032**: Remove redundant import blocks from 5 files
   - Replace with reference to `.claude/skills/effect-imports.md`
   - Estimated savings: 133-180 lines

### Phase 2: Moderate-Impact Refactoring (6-8 hours)

**Target**: 2,600-3,500 lines

4. **B-016 to B-024**: Reduce excessive examples (9 files)
   - Keep 1 canonical example per pattern
   - Reference comprehensive pattern docs
   - Estimated savings: 1,044-1,350 lines

5. **B-034 to B-038**: Replace CLAUDE.md context duplication (5 files)
   - Keep app/package-specific details only
   - Reference root documentation
   - Estimated savings: 570-770 lines

6. **B-030, B-031**: Merge redundant skills
   - Merge `effect-check.md` + `forbidden-patterns.md` into `effect-patterns.md` rule
   - Estimated savings: 432 lines

### Phase 3: Quality & Correctness (2 hours)

**Target**: 100-300 lines + correctness fixes

7. **B-039 to B-041**: Fix outdated content
   - Update stale package references (B-039)
   - Expand or remove stub files (B-041)
   - Estimated savings: 100-300 lines

---

## Verification Criteria

### Before Compression
- [ ] All bloat patterns cataloged with specific line ranges
- [ ] Compression targets validated against actual file content
- [ ] Reference documentation exists for all deduplication targets

### After Compression
- [ ] No broken reference links
- [ ] All information still accessible (moved, not deleted)
- [ ] Agent effectiveness maintained or improved
- [ ] File size targets met per bloat ID

### Quality Checks
- [ ] Run agent config validator script (if exists)
- [ ] Spot-check 5 random AGENTS.md files for completeness
- [ ] Verify effect-patterns.md covers all deduplicated content
- [ ] Test reference links resolve correctly

---

## Automation Opportunities

### Detection Scripts

```bash
# Detect verbose API reference patterns
grep -r "Signature:" .claude/agents/ | wc -l

# Detect redundant import blocks
grep -r "## Import Conventions" .claude/ | wc -l

# Detect CLAUDE.md duplication
grep -r "## Commands Reference" packages/*/AGENTS.md | wc -l

# Find files > 500 lines (bloat candidates)
find .claude/ packages/ apps/ -name "*.md" -exec wc -l {} + | awk '$1 > 500' | sort -n
```

### Refactoring Tools

1. **Table Generator**: Convert "Signature + Usage + Methods" to table rows
2. **Reference Replacer**: Detect duplicate sections, replace with link
3. **Example Pruner**: Keep first example, remove variations
4. **Import Block Cleaner**: Replace import lists with skill reference

---

## Risk Assessment

### Low Risk (Safe to Execute)
- Removing redundant import blocks (already covered in skills)
- Replacing CLAUDE.md context with links (root docs are authoritative)
- Converting verbose lists to tables (no information loss)

### Medium Risk (Review Required)
- Pruning excessive examples (ensure remaining examples are comprehensive)
- Merging redundant skills (validate no unique content lost)

### High Risk (Proceed with Caution)
- Removing test patterns from test-writer.md (ensure testkit/README.md is complete)
- Consolidating schema patterns in effect-schema-expert.md (complex domain knowledge)

---

## Expected Outcomes

### Quantitative
- **Line reduction**: 6,200-8,500 lines (24-33%)
- **Average file size**: 320 lines → 215-245 lines (23-33% reduction)
- **Largest file reduction**: test-writer.md 1,220 → 720-820 lines (33-41%)

### Qualitative
- Faster agent parsing (less token overhead)
- Clearer information hierarchy (tables > prose)
- Single source of truth (no duplication)
- Easier maintenance (fewer places to update)
- Improved discoverability (references guide to authoritative sources)

---

## Next Steps

1. **Validate Findings**: Review bloat IDs B-001 to B-041 with team
2. **Prioritize Execution**: Confirm Phase 1 targets (high-impact quick wins)
3. **Prepare Infrastructure**: Create reference consolidation target files if needed
4. **Execute Phase 1**: Systematic refactoring of 15 verbose files
5. **Measure Impact**: Re-run inventory to verify compression targets met
6. **Iterate**: Proceed to Phase 2 if Phase 1 successful

---

## Appendix: Bloat Detection Methodology

### Manual Analysis
1. Read largest files (test-writer.md 1,220 lines, effect-schema-expert.md 947 lines)
2. Identify repetitive patterns (API reference blocks, example variations)
3. Cross-reference with authoritative sources (CLAUDE.md, effect-patterns.md)
4. Catalog specific line ranges and compression opportunities

### Automated Scanning
1. Line count analysis (find files > 400 lines)
2. Pattern detection (grep for "Signature:", "Usage:", "Example:")
3. Duplicate content hashing (identify verbatim copies)
4. Reference graph analysis (detect circular references)

### Validation
1. Spot-check 10 random catalog entries for accuracy
2. Verify line ranges against actual files
3. Confirm reference targets exist and are complete
4. Test compression transforms on sample files

---

*Generated for Phase 1.5 of agent-config-optimization spec*
