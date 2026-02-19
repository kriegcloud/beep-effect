# HANDOFF_P1: Knowledge Server Test Shared Fixtures Dedup

## Phase Context

This handoff starts **Phase 1 (Discovery)** for deduplicating shared test mocks/layers in `@beep/knowledge-server` tests.

## Current Status

| Item | Status |
|---|---|
| Spec scaffold | Complete |
| Problem framing | Complete |
| Duplication inventory | Not started |
| Migration plan | Not started |
| Code edits | Not started |

## Objective for This Phase

Produce a concrete, file-referenced duplication inventory and propose shared-module extraction targets under `packages/knowledge/server/test/_shared`.

## Known Hotspots (Seed List)

- `packages/knowledge/server/test/GraphRAG/CitationValidator.test.ts`
- `packages/knowledge/server/test/GraphRAG/ContextFormatter.test.ts`
- `packages/knowledge/server/test/GraphRAG/PromptTemplates.test.ts`
- `packages/knowledge/server/test/GraphRAG/GroundedAnswerGenerator.test.ts`
- `packages/knowledge/server/test/Rdf/benchmark.test.ts`
- `packages/knowledge/server/test/Rdf/integration.test.ts`
- `packages/knowledge/server/test/Sparql/SparqlGenerator.test.ts`
- `packages/knowledge/server/test/Workflow/ExtractionWorkflow.test.ts`
- `packages/knowledge/server/test/adapters/GmailExtractionAdapter.test.ts`

## Required Output

Create:

- `specs/completed/knowledge-server-test-shared-fixtures-dedup/outputs/codebase-context.md`

Required sections in output:

1. Duplication families
2. Candidate shared module map
3. Migration difficulty ranking
4. Intentional non-dedup exceptions
5. Risk notes

## Constraints

- Discovery phase is read-only (no code edits).
- Keep scope to `packages/knowledge/server/test/**`.
- Prefer specific file references over generic claims.

## Completion Checklist

- [ ] `outputs/codebase-context.md` exists
- [ ] At least 3 duplication families identified
- [ ] Every family includes source files and target `_shared` module
- [ ] Risks and non-goals are documented
- [ ] `REFLECTION_LOG.md` updated with Phase 1 learnings

## Next Handoff Artifacts

When Phase 1 ends, generate both:

- `handoffs/HANDOFF_P2.md`
- `handoffs/P2_ORCHESTRATOR_PROMPT.md`
