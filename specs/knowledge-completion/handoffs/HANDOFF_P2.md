# Handoff: Phase 2 - Architecture Review

> Context document for Phase 2 of the knowledge completion spec.

---

## Prerequisites

Phase 1 (Discovery & Research) must be complete with:
- [ ] `outputs/current-impl-analysis.md` populated
- [ ] `outputs/effect-ai-research.md` populated
- [ ] `outputs/reference-patterns.md` populated
- [ ] `outputs/gap-analysis.md` populated
- [ ] Quality gate: ≥3.5 average score

---

## Phase 2 Objective

**Architecture review** of `packages/knowledge/*` to verify:
1. Effect patterns compliance
2. Slice structure validation
3. Identification of remediation needs

---

## Context Budget Estimate

| Item | Tokens |
|------|--------|
| HANDOFF_P2.md | ~800 |
| P1 outputs (summaries) | ~2,000 |
| Files to review | ~5,000 |
| Agent context | ~2,000 |
| **Total** | ~10,000 |

---

## Agent Assignments

| Agent | Task | Output |
|-------|------|--------|
| `code-reviewer` | Effect patterns compliance | `outputs/architecture-review.md` |
| `architecture-pattern-enforcer` | Slice structure validation | `outputs/slice-structure-review.md` |

### Parallelization

Both agents can run in **parallel** (no dependencies):

```
┌─────────────────────────┬─────────────────────────────────┐
│     code-reviewer       │ architecture-pattern-enforcer   │
│ (Effect patterns)       │ (slice structure)               │
└─────────────────────────┴─────────────────────────────────┘
```

---

## Review Scope

### Files to Check

```
packages/knowledge/
├── domain/src/           # Should have NO Effect services
├── tables/src/           # Drizzle tables only
├── server/src/
│   ├── Ai/               # AiService (to be deleted in P4)
│   ├── Extraction/       # EntityExtractor, etc.
│   ├── Embedding/        # EmbeddingService
│   ├── Grounding/        # GroundingService
│   ├── EntityResolution/ # Clustering services
│   ├── Ontology/         # OntologyService
│   └── Nlp/              # NlpService
└── client/src/           # API wrappers
```

### Checklist Items

#### Effect Patterns

- [ ] All services use `Effect.Service<T>()(\"ServiceName\", { ... })`
- [ ] All services have `accessors: true`
- [ ] Dependencies declared in `dependencies: []`
- [ ] No manual `Context.Tag` usage (except AiService - known issue)
- [ ] Namespace imports: `import * as Effect from \"effect/Effect\"`
- [ ] Single-letter aliases: `import * as S from \"effect/Schema\"`
- [ ] @beep/* path aliases used
- [ ] No relative `../../../` imports
- [ ] TaggedError for all errors
- [ ] No `throw` statements
- [ ] Effect.fail for failures
- [ ] PascalCase Schema constructors (S.String, S.Struct)

#### Slice Structure

- [ ] Domain package: No I/O, no Effect services
- [ ] Tables package: Drizzle definitions only
- [ ] Server package: Effect services, business logic
- [ ] Client package: API wrappers only
- [ ] No circular dependencies between packages

---

## Expected Outputs

| File | Content |
|------|---------|
| `outputs/architecture-review.md` | Effect patterns compliance report |
| `outputs/slice-structure-review.md` | Slice structure validation |
| `outputs/remediation-plan.md` | Prioritized fix list (if needed) |

---

## Exit Criteria

Phase 2 is complete when:

- [ ] `outputs/architecture-review.md` created
- [ ] `outputs/slice-structure-review.md` created
- [ ] All P0 violations documented
- [ ] Remediation plan created (if violations found)
- [ ] `REFLECTION_LOG.md` updated
- [ ] `handoffs/HANDOFF_P3.md` created
- [ ] Quality gate: ≥3.5 average score

---

## Known Issues from P1

Document any issues discovered in Phase 1 that affect architecture review:

1. **AiService uses `Context.GenericTag`** - This is a known legacy pattern, will be deleted in P4
2. **EntityExtractor uses `generateObjectWithSystem`** - Migration strategy needed

---

## Notes

- Focus on identifying issues, not fixing them yet
- P0 violations must be fixed before P4 (refactoring)
- P1/P2 violations can be addressed during refactoring
- The AiService legacy patterns are expected; document but don't block on them
