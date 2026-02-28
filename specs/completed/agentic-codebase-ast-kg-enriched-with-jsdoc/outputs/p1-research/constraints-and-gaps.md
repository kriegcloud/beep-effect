# P1 Constraints and Gaps (Freeze for P2)

## Non-Negotiable Constraints

| Constraint | Enforcement in P2 |
|---|---|
| P0 locked defaults are immutable without ADR + proof | Every P2 contract file includes lock-alignment check section |
| P0 locked interface defaults are immutable without ADR + proof | CLI/ID/provenance/tag/envelope/hook contracts are copied unchanged |
| Source coverage must remain 16/16 | P2 docs reference S1-S16 without omissions |
| Hook reliability policy must stay hard-timeout + no-throw | Query/hook contract and rollout contract include explicit failure behavior |
| Index scope include/exclude list remains fixed | Extraction/incremental contracts must encode scope filter |
| Graphiti remains semantic layer; deterministic cache remains canonical local source | Persistence + query contracts must preserve hybrid read model |

## Open Items Moved to P2 (With Defaults)

| Item | Default Carried From P0/P1 | P2 Output Owner |
|---|---|---|
| Deterministic ID hash canonicalization details/fixtures | `workspace+path+symbol+kind+signature` | `kg-schema-v1.md` |
| Cache retention, invalidation, and recovery policy | JSONL snapshots keyed by commit SHA | `incremental-update-design.md` |
| Delta widening and invalidation heuristics | changed-file first, dependency-aware widening | `incremental-update-design.md` |
| Graphiti idempotent upsert/replay contract details | stable group `beep-ast-kg` + commit metadata + `AstKgEpisodeV1` envelope | `graphiti-persistence-contract.md` |
| Hook ranking/packet compression details | top-k bounded XML packet within timeout budget | `query-and-hook-contract.md` |
| SCIP integration depth | optional, non-blocking overlay | `extraction-contract.md` (appendix) |

## ADR Guardrail
Any proposal that changes one of the above defaults must provide:
1. Explicit contradiction statement against current lock.
2. Source proof and/or in-repo proof anchor.
3. Updated fallback and validation impact analysis.

## P2 Prompt Authoring Inputs
P2 prompt set must consume:
1. `outputs/p1-research/landscape-comparison.md`
2. `outputs/p1-research/reuse-vs-build-matrix.md`
3. `outputs/p1-research/constraints-and-gaps.md`
4. `README.md` lock tables and `handoffs/HANDOFF_P0.md`

## Freeze Statement
P1 exits with no lock contradictions. All remaining design ambiguity is constrained to P2 documents with defaults preselected.
