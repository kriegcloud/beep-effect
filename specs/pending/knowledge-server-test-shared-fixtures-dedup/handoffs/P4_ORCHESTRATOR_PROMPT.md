# P4 Orchestrator Prompt: Knowledge Server Test Shared Fixtures Dedup

You are implementing **Phase 4 (Stabilization + Anti-regression Guardrails)** of the `knowledge-server-test-shared-fixtures-dedup` spec in:

- `specs/pending/knowledge-server-test-shared-fixtures-dedup/`

Read first:
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/README.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/MASTER_ORCHESTRATION.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/handoffs/HANDOFF_P4.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/evaluation.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/remediation-plan.md`
- `specs/pending/knowledge-server-test-shared-fixtures-dedup/REFLECTION_LOG.md`

## Phase 4 Mission

1. Unblock verification gates (`bun run check`) while respecting the spec constraint: no production code changes unless strictly required.
2. Run verification and document it.
3. Produce `outputs/verification-report.md` mapping `_shared` helpers to migrated call sites and preserved non-dedup exceptions.
4. Add minimal anti-regression guardrails (documentation-level; avoid introducing new tooling or production changes).

## Hard Constraints

- Keep test-only code under `packages/knowledge/server/test/**`.
- Avoid new “grab-bag” helper modules; keep shared helper modules focused (already implemented in Phase 3).
- Preserve intentional non-dedup exceptions unless explicitly re-justified in writing.
- No production code changes unless required to compile/run the tests; if any are made, document them explicitly in the Phase 4 verification report and reflection.

## Known Blocker (Resolve First)

Repo currently has unexpected production-code drift unrelated to this spec:
- Modified tracked files:
  - `packages/knowledge/server/src/Service/index.ts`
  - `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`
  - `packages/knowledge/server/src/EntityResolution/IncrementalClustererLive.ts`
- Untracked files under `packages/knowledge/server/src/Service/`:
  - `ContentEnrichmentAgent.ts`
  - `DocumentClassifier.ts`
  - `WikidataClient.ts`
  - `CrossBatchEntityResolver.ts`
  - `ReconciliationService.ts`

Default action: revert tracked diffs and remove/move the untracked files out of compilation, because this spec is test-only.

If these production changes are intended, coordinate with the user and treat them as separate work; do not silently “fix” them as part of this spec without explicit intent.

## Required Outputs

- `specs/pending/knowledge-server-test-shared-fixtures-dedup/outputs/verification-report.md`
  - Include:
    - commands run (exact)
    - pass/fail status
    - mapping of helper exports to files that adopt them
    - list of preserved non-dedup exceptions and confirmation they remain local
    - any rollbacks applied (with rationale)
- Update `specs/pending/knowledge-server-test-shared-fixtures-dedup/REFLECTION_LOG.md`
  - Add a Phase 4 entry summarizing stabilization, what was blocked, and what remains.

## Verification Commands (Minimum)

Run from repo root:
- `bun run check`
- `bun run lint`
- tests:
  - Prefer targeted: `bun test` for the migrated knowledge-server test files (or package-scoped runs if supported)
  - Then broaden to `bun run test` if feasible

## Acceptance Criteria

- `bun run check` is green.
- `bun run lint` is green.
- Touched tests pass without assertion semantic drift.
- `outputs/verification-report.md` exists and is accurate.
- Phase 4 reflection entry exists.

