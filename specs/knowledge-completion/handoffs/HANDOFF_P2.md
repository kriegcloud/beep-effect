# Handoff: Phase 2 - Architecture Review

> Context document for Phase 2 of the knowledge completion spec.

---

## Prerequisites

Phase 1 (Discovery & Research) is **COMPLETE** with:
- [x] `outputs/current-impl-analysis.md` populated
- [x] `outputs/effect-ai-research.md` populated
- [x] `outputs/reference-patterns.md` populated
- [x] `outputs/gap-analysis.md` populated
- [x] Quality gate: ≥3.5 average score

---

## Phase 1 Summary

### Key Findings

1. **All 5 LLM calls use `generateObjectWithSystem`** - The other two methods (`generateObject`, `generateText`) are never called and can be removed.

2. **System prompts ARE supported in @effect/ai** via `Prompt.make([{role: "system", ...}, {role: "user", ...}])`.

3. **Mock Layer pattern confirmed**: `Layer.succeed(LanguageModel.LanguageModel, LanguageModel.LanguageModel.of({...}))`.

4. **No production provider exists** - Only mock implementation. New provider layers need to be created.

5. **Migration complexity is LOW** - 5 files to modify, 2 to delete, 3 to create.

### Critical Issues Found

- **3 instances of `Context.GenericTag`**: AiService.ts, EmbeddingProvider.ts, OpenAiProvider.ts
- **ExtractionPipeline missing AiService dependency** - Pre-existing bug
- **0% test coverage** - Only placeholder test exists

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

Issues discovered in Phase 1 that affect architecture review:

1. **AiService uses `Context.GenericTag`** (line 124) - Legacy pattern, will be deleted in P4
2. **EmbeddingProvider uses `Context.GenericTag`** (line 134) - Legacy pattern, needs modern migration
3. **OpenAiProvider uses `Context.GenericTag`** (line 127) - Legacy pattern, needs modern migration
4. **All 5 LLM calls use `generateObjectWithSystem`** - Migration to `Prompt.make()` + `generateObject` is straightforward
5. **ExtractionPipeline missing AiService in dependencies array** - Pre-existing bug, will fail at runtime
6. **0% test coverage** - Only placeholder test (Dummy.test.ts) exists
7. **No production LLM provider** - Only mock that fails with errors exists

---

## Notes

- Focus on identifying issues, not fixing them yet
- P0 violations must be fixed before P4 (refactoring)
- P1/P2 violations can be addressed during refactoring
- The AiService legacy patterns are expected; document but don't block on them
