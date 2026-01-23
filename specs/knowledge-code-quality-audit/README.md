# Knowledge Slice Code Quality Audit

> Agent-orchestrated audit and remediation of Effect pattern violations in `packages/knowledge/*`

---

## Overview

This specification orchestrates a comprehensive audit of the `packages/knowledge` vertical slice to identify and remediate violations of Effect-TS patterns, project conventions, and code quality standards discovered during the `knowledge-completion` spec implementation.

**Origin**: Issues identified during `specs/knowledge-completion` Phase 7-8 implementation.

**Scope**: `packages/knowledge/{domain,tables,server,client,ui}/*`

---

## Violation Categories

| ID | Category | Description | Severity |
|----|----------|-------------|----------|
| V01 | EntityId Table Typing | Missing `.$type<EntityId.Type>()` on table columns | High |
| V02 | Duplicate Code | `extractLocalName` duplicated across files | Medium |
| V03 | Native String Methods | Use of `.lastIndexOf`, `.slice` instead of `Str.*` | High |
| V04 | Error Construction | Object literals instead of `new ErrorClass({})` | High |
| V05 | Array Emptiness | `length === 0` instead of `A.isEmptyReadonlyArray` | Medium |
| V06 | Native Error | `new Error()` instead of `S.TaggedError` | High |
| V07 | Switch Statements | `switch` instead of `effect/Match` | Medium |
| V08 | Object.entries | Native instead of `Struct.entries` | Medium |
| V09 | Native Set | `Set` instead of `effect/MutableHashSet` | Medium |
| V10 | Native Array.map | `.map()` instead of `A.map()` | High |
| V11 | Non-null Assertions | `!` instead of `effect/Option` | High |
| V12 | Native Map | `Map` instead of `effect/MutableHashMap` | Medium |
| V13 | Native Array.sort | `.sort()` instead of `A.sort` with `effect/Order` | Medium |
| V14 | EntityId Creation | Not using branded type factories | High |
| V15 | String.toLowerCase | Native instead of `Str.toLowerCase` | Low |
| V16 | Native Date | `Date` instead of `effect/DateTime` | Medium |
| V17 | Array vs Chunk | Arrays where `effect/Chunk` is ideal | Low |
| V18 | Empty Array Init | `[]` instead of `A.empty<T>()` | Low |

---

## Success Criteria

- [ ] Complete inventory of ALL violations in `packages/knowledge/*`
- [ ] Master violations document with exact file:line references
- [ ] Phased remediation plan with verification gates
- [ ] All phases pass `bun run check --filter @beep/knowledge-*`
- [ ] All phases pass `bun run test --filter @beep/knowledge-*`
- [ ] Zero regressions in existing functionality

---

## Phase Overview

### Phase 1: Inventory (Parallel Sub-Agents)

Deploy 18 sub-agents in parallel, one per violation category. Each produces a structured violation report.

**Output**: `outputs/violations/V[XX]-[category].md` for each category

### Phase 2: Synthesis

Synthesize all 18 violation reports into a master document with:
- Total violation count per category
- Severity-weighted priority score
- Cross-file impact analysis
- Dependency ordering for remediation

**Output**: `outputs/MASTER_VIOLATIONS.md`

### Phase 3: Remediation Planning

Create phased remediation plan with:
- Violation categories grouped by risk/dependency
- Verification gates between phases
- Estimated complexity per phase
- Rollback strategies

**Output**: `outputs/REMEDIATION_PLAN.md`

### Phase 4-N: Remediation Execution

Execute remediation in phases with quality gates:

| Remediation Phase | Categories | Verification |
|-------------------|------------|--------------|
| R1: Critical Foundation | V01, V06, V04 | `check`, `test` |
| R2: Effect Collections | V09, V10, V12, V13 | `check`, `test` |
| R3: Control Flow | V07, V11 | `check`, `test` |
| R4: String/Date | V03, V15, V16 | `check`, `test` |
| R5: Initialization | V05, V17, V18 | `check`, `test` |
| R6: Cleanup | V02, V08, V14 | `check`, `test`, full build |

---

## Complexity Assessment

```
Phase Count:       6+ phases     × 2 = 12+
Agent Diversity:   6 agents      × 3 = 18
Cross-Package:     5 (knowledge) × 4 = 20
External Deps:     0             × 3 = 0
Uncertainty:       2 (low)       × 5 = 10
Research Required: 1 (minimal)   × 2 = 2
─────────────────────────────────────────
Total Score:                        62 → Critical Complexity
```

**Recommendation**: Full orchestration structure with per-task checkpoints.

---

## Quick Start

See [QUICK_START.md](QUICK_START.md) for 5-minute setup.

---

## Documentation Structure

```
specs/knowledge-code-quality-audit/
├── README.md                    # This file
├── QUICK_START.md               # 5-min getting started
├── MASTER_ORCHESTRATION.md      # Full workflow
├── AGENT_PROMPTS.md             # Sub-agent prompts
├── RUBRICS.md                   # Evaluation criteria
├── REFLECTION_LOG.md            # Cumulative learnings
├── templates/
│   └── violation-report.template.md
├── outputs/
│   ├── violations/              # Individual V[XX] reports
│   ├── MASTER_VIOLATIONS.md     # Synthesized violations
│   └── REMEDIATION_PLAN.md      # Phased remediation
└── handoffs/
    ├── HANDOFF_P[N].md          # Phase context docs
    └── P[N]_ORCHESTRATOR_PROMPT.md
```

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md) - Canonical patterns
- [Spec Guide](../_guide/README.md) - Spec creation workflow
- [Knowledge Completion](../knowledge-completion/) - Origin spec
