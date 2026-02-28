# P0 Constraints and Gaps

## Non-Negotiable Constraints

| Constraint | Source / Proof | Enforcement Point |
|---|---|---|
| Command-first discovery required (`laws`, `skills`, `policies`) | Repo law process + P0 prompt contract | Session start and final report |
| Effect-first repo laws and quality gates | `bun run beep docs laws` output + repo law text | P1-P4 implementation and verification |
| Shared memory protocol (`beep-dev`) at start/during/end | AGENTS shared memory protocol | Orchestrator runtime behavior |
| Pathless compliance check included | `bun run agents:pathless:check` policy gate | Verification checklist |
| Locked defaults must not drift | P0 default lock in README/HANDOFF/MASTER | P1 ADR gate |
| Index scope include/exclude must remain fixed | P0 locked default | Extractor config contract |
| Hook latency budget from R2 onward (`p95 <= 1.5s`) | P0 default lock + benchmark framework reuse | P3/P4 rollout gates |

## Gap Register

| Gap | Impact | Default in P0 | Target Phase | Mitigation |
|---|---|---|---|---|
| Deterministic symbol/node ID field set is not yet frozen | Medium | `workspace+path+symbol+kind+signature` | P1 | Freeze exact canonical hash contract and test fixtures |
| Local cache file format and retention policy not finalized | Medium | JSONL snapshots keyed by commit SHA | P1 | Define retention/invalidation and recovery behavior |
| Graphiti upsert/idempotency envelope for AST KG not implemented | High | Stable group `beep-ast-kg` + commit metadata | P1/P2 | Specify serializer contract + replay-safe write policy |
| Delta scope widening heuristic not finalized | Medium | changed-file first, optional dependency expansion | P1 | Adopt explicit affected-scope policy and tests |
| Hook KG packet compression/ranking policy not finalized | Medium | top-k bounded packet with timeout fallback | P3 | Define ranking/token budget and benchmark relevance |
| SCIP bridge depth undecided | Low | optional secondary index, non-blocking | P1 | Keep as additive adapter, not required for P2 success |

## Risks and Mitigations by Phase

| Phase | Risk | Mitigation |
|---|---|---|
| P1 | Contract churn from unresolved schema details | Freeze schema and hash policy before coding begins |
| P2 | Duplicate/unstable graph writes | Deterministic IDs + idempotent upsert + replay tests |
| P3 | Hook latency regression | timeout budget, cache-first read, hard fallback to no context block |
| P4 | Benchmark gains ambiguous | fixed baseline/control matrix and repeated trials |

## Open Questions Moved to P1 (With Defaults)
1. Should symbol IDs include package version tags in addition to commit metadata?
- Default: no version tag in ID; commit metadata kept as provenance fields.

2. Should Graphiti writes occur per file event or per batch window?
- Default: per-file delta events with short debounce window.

3. Should SCIP references be merged into deterministic cache or queried separately?
- Default: queried separately as optional overlay.
