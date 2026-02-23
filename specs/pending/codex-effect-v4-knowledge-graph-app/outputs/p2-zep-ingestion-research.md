# P2 Research: Zep Ingestion Pipeline

Date: 2026-02-22

## Phase objective

Load the existing Effect v4 graph corpus into Zep with deterministic ordering, reproducible verification, and rollout-safe cutover.

## Source corpus inventory (current v1 target)

These are the current v1 ingestion artifacts from `specs/completed/effect-v4-knowledge-graph/outputs`.

| Artifact | Episodes | Episode bytes |
|----------|----------|---------------|
| `p2-doc-extraction/module-episodes.json` | 125 | 141,686 |
| `p2-doc-extraction/migration-episodes.json` | 45 | 32,956 |
| `p2-doc-extraction/pattern-episodes.json` | 7 | 14,485 |
| `p2-doc-extraction/doc-episodes.json` | 21 | 35,689 |
| `p4-enrichment/enrichment-episodes.json` | 51 | 35,428 |
| `p3-ast-extraction/function-episodes-top20.json` | 1,906 | 1,249,546 |
| seed episode (`dry-run-episodes.json` first record) | 1 | 1,335 |
| **Total (v1 target)** | **2,156** | **1,511,125** |

Approximate Zep ingestion credits for v1 target (350-byte credit unit):
- about `4,318` credits one-time.

Expansion context (not in v1 default):
- Full corpus observed locally is `8,864` episodes, about `4,965,809` bytes.

## Existing completed-spec ingest order to preserve

From prior ingestion evidence:
- seed
- modules
- migrations
- patterns
- docs
- enrichment
- functions-top20

Evidence files:
- `specs/completed/effect-v4-knowledge-graph/outputs/p5-graph-pipeline/ingestion-log.json`
- `specs/completed/effect-v4-knowledge-graph/outputs/p6-verification/report.md`

## High-impact design decisions for P2

1. Preserve deterministic phase ordering; do not parallelize cross-phase batches.
2. Use replayable ingest manifest in script code, not ad-hoc shell ordering.
3. Keep v1 ingestion scope at 2,156 episodes for predictable rollout time/cost.
4. Emit structured ingest report JSON with per-batch counts and failures.
5. Build verification script that checks both count and semantic retrieval quality.

## Script architecture recommendation

Create two scripts:
- `apps/web/scripts/zep-ingest-effect-v4.ts`
- `apps/web/scripts/zep-verify-effect-v4.ts`

Ingestion script should:
1. Load a hard-coded manifest array of source files in order.
2. Map each record to Zep `graph.add`/`graph.addBatch` payload.
3. Use one `graphId` (`effect-v4`).
4. Write run summary (`total`, `succeeded`, `failed`, `duration_s`, errors by record index/name).

Verification script should:
1. Run sample `graph.search` checks for module, migration, and API grounding queries.
2. Assert non-empty node/edge results.
3. Write verification report with pass/fail per query class.

## Ingestion mapping contract (v1)

Source record fields include:
- `name`
- `episode_body`
- `source`
- `source_description`
- `group_id`

Recommended mapping:
- `type`: `"text"`
- `data`: `episode_body`
- `graphId`: `effect-v4`
- `sourceDescription`: include `name` and original `source_description`

## Rollout and cutover strategy

1. Ingest to a staging graph first (`effect-v4-staging`) and run verification.
2. Promote by re-running deterministic ingest to production graph (`effect-v4`) once staging passes.
3. Keep ingestion manifest under source control so reruns are exact.

## Rollback strategy

- If production ingest quality regresses, revert app config to previous known-good graph ID.
- Keep last successful ingest/verification artifacts for rollback evidence.
- Avoid destructive graph mutation in v1 rollout scripts.

## Verification pack

```bash
bun run check
bun run test
bun run lint
bun run build
bun run apps/web/scripts/zep-ingest-effect-v4.ts
bun run apps/web/scripts/zep-verify-effect-v4.ts
```

## P2 phase risk gates

| Risk | Mitigation |
|------|------------|
| Batch order changes semantic quality | Use explicit ordered manifest and sequential phase execution |
| Silent partial ingest failures | Persist per-record error report with names and indexes |
| Cost/volume surprise | Keep v1 scope pinned to 2,156 episodes and document expansion separately |

## References

- `specs/completed/effect-v4-knowledge-graph/outputs/p5-graph-pipeline/ingestion-log.json`
- `specs/completed/effect-v4-knowledge-graph/outputs/p6-verification/report.md`
- `specs/completed/effect-v4-knowledge-graph/outputs/p2-doc-extraction/*.json`
- `specs/completed/effect-v4-knowledge-graph/outputs/p3-ast-extraction/function-episodes-top20.json`
- `specs/pending/codex-effect-v4-knowledge-graph-app/outputs/research.md`
