# Handoff P1

## Spec

- Name: `knowledge-slice-conventions-review`
- Location: `specs/pending/knowledge-slice-conventions-review`

## Execution Rule

- Apply fixes while stepping through modules (domain/tables/server/client/ui).

## Progress

- Modules completed: `packages/knowledge/domain`, `packages/knowledge/tables`, `packages/knowledge/server`, `packages/knowledge/client`, `packages/knowledge/ui`
- Modules in progress: none
- Deferred cross-cut items:
  - Phase 2 candidate conversions tracked in `outputs/SCHEMA_CLASS_REFACTOR_PLAN.md`:
    - `packages/knowledge/server/src/Workflow/WorkflowPersistence.ts` (`WorkflowExecutionRecord` -> `S.Class`)
    - `packages/knowledge/server/src/adapters/GmailExtractionAdapter.ts` (`ExtractedEmailDocument` -> `S.Class`)

## Latest Verification

- Commands run:
  - `bunx turbo run check lint test --filter='@beep/knowledge-*' --ui=stream`
  - Module-scoped commands are recorded in `outputs/VERIFICATION_REPORT.md`
- Results:
  - PASS (2026-02-07) (see `outputs/VERIFICATION_REPORT.md`)

## Notes / Decisions

- Domain:
  - Normalized a `.ts` extension import and aligned one internal import to `@beep/knowledge-domain/...`.
- Server:
  - Fixed a real concurrency bug in `EmbeddingRateLimiter.acquire` (atomic RPM check/increment) and added `test/EmbeddingRateLimiter.test.ts`.
  - Removed an unnecessary cast in `SparqlParser.parse`.
  - Fixed a Biome lint finding (`useTemplate`) in `ContentEnrichmentAgent`.
- Grep-based audits:
  - `rg '\\bany\\b|@ts-ignore|as unknown as|\\bas any\\b'` matches in knowledge slice were docstrings/prompt/test text and were allowlisted in `outputs/AUDIT_ALLOWLIST.md`.
