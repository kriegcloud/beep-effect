# P6 Quality Scorecard

## Status
READY FOR MANUAL SIGNOFF

## Gate Scorecard

| Gate | Status | Evidence |
|---|---|---|
| `beep kg publish|verify|parity|replay` implemented and documented | PASS | `tooling/cli/src/commands/kg.ts`, `tooling/cli/README.md`, `dual-write-execution-log.md` |
| Dual-write full+delta+replay evidence present (`target=both`) | PASS | `evidence/20260225T210659Z-fixture-publish-full.json`, `evidence/20260225T210659Z-fixture-publish-delta.json`, `evidence/20260225T210659Z-fixture-replay-both.json`, `evidence/20260225T214750Z-fullrepo-publish-full.json` |
| Functional parity matrix complete and statused | PASS | `query-parity-report.md`, `evidence/20260225T210659Z-fixture-parity.json`, `evidence/20260225T221039Z-fullrepo-parity.json` |
| Manual signoff packet includes known gaps + owner/mitigation mapping | PASS | section "Known Gaps and Mitigations" below |

## Determinism and Replay Checks

| Metric | Target | Observed | Status | Evidence |
|---|---:|---:|---|---|
| Determinism (same commit repeatability) | 100% | second full index: `writes=0`, `replayHits=2` | PASS | `evidence/20260225T210750Z-fixture-index-full-2.json` |
| Replay idempotency (index ledger semantics) | no duplicate writes | `writes=0`, `replayHits=2` on repeat full and delta | PASS | `evidence/20260225T210750Z-fixture-index-full-2.json`, `evidence/20260225T210750Z-fixture-index-delta.json` |
| Functional parity checks | all required checks pass | 4/4 PASS | PASS | `evidence/20260225T210659Z-fixture-parity.json` |
| Full-repo dual-write | successful full publish to both sinks | `attempted=1437`, `written=1437`, `failed=0` for Falkor and Graphiti | PASS | `evidence/20260225T214750Z-fullrepo-publish-full.json` |

## Known Gaps and Mitigations

| Gap | Severity | Owner | Mitigation | Status |
|---|---|---|---|---|
| Full-repo dual-write is slow due per-query `docker exec redis-cli` calls (full publish took ~22.4 minutes). | Medium | KG Platform Owner | Implement batched Falkor ingestion (per-file transaction query batches or direct Redis client pipeline) before `R2` expansion. | OPEN |
| `kg replay` receipts do not surface sink-level dedupe counts (`replayed` remains `0`). | Low | CLI Owner | Extend receipt schema with sink dedupe/read-before-write counters for Falkor and Graphiti. | OPEN |
| Shared group `beep-ast-kg` mixes fixture and full-repo data, inflating parity counts for isolated validations. | Low | Operations Owner | Add isolated group support for publish path (or environment override) and use dedicated validation groups in CI. | OPEN |
| Path query parity validates execution only; no non-zero semantic path threshold. | Low | Query API Owner | Add optional strict mode profile requiring minimum non-zero path observations for selected edge types. | OPEN |

## Manual Signoff Record
- Reviewer: TBD
- Date: TBD
- Decision: PENDING
- Preconditions for APPROVE: verify gap owners accept mitigation backlog and schedule the medium-severity throughput fix.
