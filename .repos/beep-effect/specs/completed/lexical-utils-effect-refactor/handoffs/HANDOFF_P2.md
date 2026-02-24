# Phase 2 Handoff: Evaluation

> Context document for Phase 2 execution. Read this completely before starting.

---

## Previous Phase Summary

**Phase 1 (Discovery)** completed successfully on 2026-01-27.

### Outputs Generated

| File | Location | Purpose |
|------|----------|---------|
| `codebase-analysis.md` | `outputs/` | File-by-file analysis of 10 utility files |
| `effect-api-research.md` | `outputs/` | Effect API documentation for refactoring |

### Key Findings from Phase 1

#### File Statistics
- **Total LOC**: 499 across 10 files
- **Tier 1 (High Priority)**: `docSerialization.ts` (86 LOC), `swipe.ts` (127 LOC)
- **Tier 2 (Medium Priority)**: `getThemeSelector.ts` (25 LOC), `joinClasses.ts` (13 LOC)
- **Tier 3 (Low Priority)**: 6 DOM-centric files

#### Pattern Counts
- **Native String Methods**: 6 occurrences
- **Native Array Methods**: 8 occurrences
- **Collection Operations**: 8 occurrences (Set, WeakMap)
- **Async Patterns**: 9 occurrences
- **Null/Undefined Checks**: 13 occurrences

#### Effect API Gaps Identified

| Pattern | Status | Mitigation |
|---------|--------|------------|
| `Str.replace()` | NOT AVAILABLE | Use native `.replace()` |
| `Str.split(/regex/)` | NO REGEX SUPPORT | Use native `.split()` + `A.fromIterable()` |
| `WeakMap` | NO EQUIVALENT | Consider Ref/FiberRef or restructure |
| `.charCodeAt()` | USE NATIVE | Acceptable for low-level binary |

---

## Phase 2 Mission

Validate the refactoring approach and identify potential risks before implementation.

### Sub-Agent Tasks

#### 1. Architecture Review (architecture-pattern-enforcer)

**Input**: Phase 1 outputs + `.claude/rules/effect-patterns.md`

**Validate**:
1. Effect import conventions match project rules (namespace imports, single-letter aliases)
2. Schema placement in `apps/todox/src/app/lexical/schema/` follows existing patterns
3. No cross-boundary imports will be created
4. Dependency order: `domain -> tables -> server -> client -> ui`

**Output**: `outputs/architecture-review.md`

#### 2. Code Quality Review (code-reviewer)

**Input**: Phase 1 outputs + transformation patterns from `AGENT_PROMPTS.md`

**Validate**:
1. Effect.gen usage patterns are correct
2. Stream patterns for async code follow best practices
3. Option/Predicate usage for null checks is idiomatic
4. No native methods slip through in proposed transformations

**Output**: `outputs/code-quality-review.md`

---

## Decisions Already Made

From Phase 1 reflection:

1. **Keep native `.replace()`** for regex string operations
2. **Use native `.split()` + `A.fromIterable()`** for regex delimiter splits
3. **Prioritize Tier 1 files** (`docSerialization.ts`, `swipe.ts`)
4. **DOM-centric files may keep minimal Effect usage** where cost/benefit is unfavorable

---

## Success Criteria

- [ ] `outputs/architecture-review.md` generated with all checks
- [ ] `outputs/code-quality-review.md` generated with all checks
- [ ] No blocking architectural issues identified
- [ ] Transformation patterns approved or modifications documented
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `HANDOFF_P3.md` created
- [ ] `P3_ORCHESTRATOR_PROMPT.md` created

---

## Risk Areas

### High Risk
- **docSerialization.ts**: Complex streaming logic with compression APIs
- **swipe.ts**: WeakMap for element state tracking has no direct Effect equivalent

### Medium Risk
- **url.ts**: try/catch wrapping URL parsing

### Low Risk
- DOM-centric files with minimal logic

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/lexical-utils-effect-refactor/outputs/codebase-analysis.md` | Detailed file analysis |
| `specs/lexical-utils-effect-refactor/outputs/effect-api-research.md` | Effect API patterns |
| `specs/lexical-utils-effect-refactor/AGENT_PROMPTS.md` | Full sub-agent prompts |
| `.claude/rules/effect-patterns.md` | Project Effect conventions |
| `apps/todox/src/app/lexical/schema/` | Existing schema patterns |

---

## Context Budget

- Direct tool calls: Max 5
- Large file reads: Max 2
- Sub-agent delegations: Max 2

Stay in Green Zone by delegating all analysis to sub-agents.
