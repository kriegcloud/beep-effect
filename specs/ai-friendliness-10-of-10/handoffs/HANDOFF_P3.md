# Handoff: P2 → P3 (Onboarding System)

**From**: P2 Error Catalog Orchestrator
**To**: P3 Onboarding Orchestrator
**Date**: 2026-02-04

---

## Executive Summary

Phase 2 (Error Catalog Population) is complete:

| Metric | Value | Notes |
|--------|-------|-------|
| Error patterns created | 63 | Exceeds 50+ target by 26% |
| Categories covered | 10/10 | 100% coverage |
| YAML validation | Passed | After fixing @-character quoting |
| Quality | High | All patterns have diagnosis, fix_steps, examples |

---

## P2 Outputs

### Error Catalog Structure

Location: `specs/ai-friendliness-10-of-10/outputs/error-catalog.yaml`

**Category Distribution**:

| Category | Count | Top Patterns |
|----------|-------|--------------|
| Schema | 10 | S.Date vs S.DateFromString, optional variants |
| EntityId | 6 | Missing branded types, type casting forbidden |
| Service | 7 | Missing service provision, circular deps |
| Effect | 7 | Generator vs flatMap, improper error handling |
| Database | 6 | RLS context, PostgreSQL quirks, SqlSchema |
| Build | 5 | Turborepo cascading, tsconfig references |
| Testing | 6 | @beep/testkit usage, TestClock advancement |
| Runtime | 5 | Stream errors, Chunk vs Array, MutableHashSet |
| Import | 6 | Namespace imports, path aliases, circular deps |
| API | 5 | HttpClient provision, RPC contract naming |

### Partial Files (kept for reference)

- `outputs/error-catalog-schema-entityid.yaml` - 16 patterns
- `outputs/error-catalog-service-effect.yaml` - 14 patterns
- `outputs/error-catalog-database-build.yaml` - 11 patterns
- `outputs/error-catalog-testing-runtime.yaml` - 11 patterns
- `outputs/error-catalog-import-api.yaml` - 11 patterns

---

## P3 Mission: Onboarding System

### Goal

Create interactive onboarding documentation and skill for new agent instances:
- Ensure agents understand Effect fundamentals before contributing
- Provide clear verification steps for readiness
- Reduce friction for first contributions

### Deliverables

| # | Task | Output |
|---|------|--------|
| 3.1 | Create onboarding entry point | `.claude/onboarding/README.md` |
| 3.2 | Create Effect primer (essentials, not tutorial) | `.claude/onboarding/effect-primer.md` |
| 3.3 | Create first-contribution checklist | `.claude/onboarding/first-contribution.md` |
| 3.4 | Create common-tasks reference | `.claude/onboarding/common-tasks.md` |
| 3.5 | Create verification checklist | `.claude/onboarding/verification-checklist.md` |
| 3.6 | Create onboarding skill | `.claude/skills/onboarding/SKILL.md` |

### Onboarding Structure

```
.claude/onboarding/
├── README.md                 # Entry point, overview of process
├── effect-primer.md          # Effect essentials (generators, Layers, errors)
├── first-contribution.md     # Step-by-step first task walkthrough
├── common-tasks.md           # Task patterns with examples
└── verification-checklist.md # Quality gates before contributing
```

### Content Focus Areas

**Effect Primer** should cover:
- `Effect<A, E, R>` type parameters meaning
- `Effect.gen(function* () { })` usage
- `yield*` semantics
- Layer-based dependency injection
- Tagged errors with catchTag

**First Contribution** should include:
- Environment verification
- Simple task selection criteria
- Step-by-step implementation flow
- Verification commands
- Common gotchas

**Common Tasks** should cover:
- Adding a field to a domain model
- Creating a new service
- Writing tests with @beep/testkit
- Fixing type errors
- Running specific package tests

### Reference Material

| Source | Purpose |
|--------|---------|
| `outputs/onboarding-gaps.md` | P0's 47 friction points, 8 critical blockers |
| `outputs/error-patterns.md` | Common mistakes to warn about |
| `outputs/error-catalog.yaml` | Structured error reference |
| `.claude/rules/effect-patterns.md` | Required patterns to teach |
| `.claude/rules/code-standards.md` | Standards to communicate |

### Key Gaps to Address (from P0)

From `outputs/onboarding-gaps.md`, critical blockers:

1. **No Effect basics anywhere** - Agents assumed to know Effect already
2. **CLAUDE.md jumps to advanced** - Missing progressive disclosure
3. **Rules are abstract** - No worked examples for formal notation
4. **No verification flow** - No way for agent to confirm understanding
5. **Implicit assumptions** - EntityId requirement not emphasized enough

### Execution Approach

**Recommended**: 3-4 parallel agents:

1. **Agent 1**: README.md + effect-primer.md (foundational docs)
2. **Agent 2**: first-contribution.md + verification-checklist.md (action-oriented)
3. **Agent 3**: common-tasks.md (patterns reference)
4. **Agent 4**: onboarding skill (interactive checklist)

Alternatively, single `documentation-expert` agent can handle all if context allows.

---

## Quality Gates

1. **Completeness** - All 5 markdown files + skill created
2. **Effect primer accuracy** - Examples compile and follow Effect patterns
3. **Actionability** - First-contribution is follow-able by new agent
4. **Skill interactivity** - /onboarding command provides useful checklist

### Verification Commands

```bash
# Verify all files exist
ls .claude/onboarding/
# Expected: README.md, effect-primer.md, first-contribution.md, common-tasks.md, verification-checklist.md

# Verify skill exists
ls .claude/skills/onboarding/
# Expected: SKILL.md

# Test skill invocation
# /onboarding in Claude session
```

---

## Success Criteria

- [ ] 5 onboarding markdown files created
- [ ] Effect primer covers essential patterns with examples
- [ ] First-contribution guide is actionable
- [ ] Onboarding skill validates agent readiness
- [ ] REFLECTION_LOG.md updated with P3 entry

---

## Next Handoff

After P3 completion, create:
- `handoffs/HANDOFF_P4.md` - For self-healing hooks phase
- `handoffs/P4_ORCHESTRATOR_PROMPT.md` - For next orchestrator
