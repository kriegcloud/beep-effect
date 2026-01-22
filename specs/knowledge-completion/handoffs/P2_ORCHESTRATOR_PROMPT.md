# Phase 2 Orchestrator Prompt

> Copy-paste this prompt to start Phase 2 of the knowledge completion spec.

---

## Prompt

```markdown
# Knowledge Completion Spec - Phase 2: Architecture Review

You are orchestrating Phase 2 of the knowledge completion spec located at `specs/knowledge-completion/`.

## Your Objective

Perform architecture review on `packages/knowledge/*` to verify:
1. Effect patterns compliance
2. Slice structure validation
3. Identification of remediation needs

## Prerequisites Check

Before starting, verify Phase 1 outputs exist:
```bash
ls specs/knowledge-completion/outputs/
# Should see: current-impl-analysis.md, effect-ai-research.md, reference-patterns.md, gap-analysis.md
```

## Required Reading

1. `specs/knowledge-completion/handoffs/HANDOFF_P2.md` - Phase context
2. `specs/knowledge-completion/RUBRICS.md` - Phase 2 scoring criteria
3. `specs/knowledge-completion/outputs/gap-analysis.md` - P1 findings

## Tasks

### Task 1: Effect Patterns Compliance

Use `code-reviewer` agent to check:
- Service patterns (Effect.Service, accessors)
- Import patterns (namespace imports)
- Error handling (TaggedError)
- Schema patterns (PascalCase)

Files to review:
- `packages/knowledge/server/src/Extraction/*.ts`
- `packages/knowledge/server/src/Embedding/*.ts`
- `packages/knowledge/server/src/Grounding/*.ts`
- `packages/knowledge/server/src/EntityResolution/*.ts`
- `packages/knowledge/server/src/Ontology/*.ts`
- `packages/knowledge/server/src/Nlp/*.ts`

Output: `specs/knowledge-completion/outputs/architecture-review.md`

### Task 2: Slice Structure Validation

Use `architecture-pattern-enforcer` agent to validate:
- Domain package (no I/O, no services)
- Tables package (Drizzle only)
- Server package (services, business logic)
- Client package (API wrappers)
- Dependency direction

Packages to validate:
- `packages/knowledge/domain/`
- `packages/knowledge/tables/`
- `packages/knowledge/server/`
- `packages/knowledge/client/`

Output: `specs/knowledge-completion/outputs/slice-structure-review.md`

### Task 3: Create Remediation Plan

If violations found, create prioritized remediation plan:
- P0: Must fix before P4 (refactoring)
- P1: Should fix during P4
- P2: Can fix in P8 (finalization)

Output: `specs/knowledge-completion/outputs/remediation-plan.md`

## Parallelization

Tasks 1 and 2 can run in **parallel**:
```
┌─────────────────────────┬─────────────────────────────────┐
│     code-reviewer       │ architecture-pattern-enforcer   │
│ (Effect patterns)       │ (slice structure)               │
└─────────────────────────┴─────────────────────────────────┘
```

Task 3 runs **after** Tasks 1-2 complete.

## Exit Criteria

Phase 2 is complete when:
- [ ] `outputs/architecture-review.md` created
- [ ] `outputs/slice-structure-review.md` created
- [ ] `outputs/remediation-plan.md` created (if needed)
- [ ] `REFLECTION_LOG.md` updated with Phase 2 learnings
- [ ] `handoffs/HANDOFF_P3.md` created

## Quality Gate

Must score ≥3.5 average per RUBRICS.md to proceed to Phase 3.

## Next Phase

After Phase 2 completion, proceed to Phase 3 (@effect/ai Design) using:
`specs/knowledge-completion/handoffs/HANDOFF_P3.md`
```
