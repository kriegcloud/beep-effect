# P7 KG Excellence Tickets

## Purpose
Resolve all known P6 gaps and raise AST KG reliability/performance to production excellence.

## Ticket Backlog

| Ticket | Priority | Owner | Issue | Status | Problem | Acceptance Criteria | Target Output | Evidence |
|---|---|---|---|---|---|---|---|---|
| P7-T1 Falkor Batch Writer | P0 | KG Platform Engineer | [#61](https://github.com/kriegcloud/beep-effect/issues/61) | Resolved | Full-repo Falkor publish is too slow with per-query process calls. | Full-repo `kg publish --target both --mode full` p95 runtime reduced by >=70% from 2026-02-25 baseline (~22.4m) while preserving zero failed writes. | `outputs/p7-kg-excellence/falkor-batching-report.md` | `outputs/p7-kg-excellence/evidence/20260228T105611Z-fullrepo-publish-both.json` |
| P7-T2 Replay Dedupe Receipts | P1 | CLI Engineer | [#62](https://github.com/kriegcloud/beep-effect/issues/62) | Resolved | `kg replay` receipts do not expose dedupe/replay semantics. | Receipt schema includes replay/dedupe counters per sink and tests cover deterministic repeat replay behavior. | `outputs/p7-kg-excellence/replay-receipt-contract.md` | `outputs/p7-kg-excellence/evidence/20260228T105739Z-replay-pass1.json`, `outputs/p7-kg-excellence/evidence/20260228T105739Z-replay-pass2.json` |
| P7-T3 Isolated Validation Groups | P1 | Operations Engineer | [#63](https://github.com/kriegcloud/beep-effect/issues/63) | Resolved | Shared group `beep-ast-kg` mixes fixture and full-repo runs. | Publish/verify/parity support explicit isolated group wiring for CI and runbook includes rotation policy. | `outputs/p7-kg-excellence/group-isolation-runbook.md` | `outputs/p7-kg-excellence/evidence/20260228T105920Z-verify-both-isolated-group.json` |
| P7-T4 Strict Path Parity Profile | P1 | Query API Engineer | [#64](https://github.com/kriegcloud/beep-effect/issues/64) | Resolved | Path parity only validates query execution, not usefulness. | New strict profile with minimum non-zero path threshold + documented fallback behavior when graph has no eligible path data. | `outputs/p7-kg-excellence/strict-parity-profile.md` | `outputs/p7-kg-excellence/evidence/20260228T105920Z-parity-strict-isolated-group.json` |
| P7-T5 Graphiti Recovery Automation | P1 | Reliability Engineer | [#65](https://github.com/kriegcloud/beep-effect/issues/65) | Resolved | Recovery requires manual restart + hydration steps. | `scripts/graphiti-recover.sh` is integrated into operations docs with smoke verification and CI/local dry-run check. | `outputs/p7-kg-excellence/recovery-automation-report.md` | `outputs/p7-kg-excellence/evidence/20260228T105936Z-graphiti-recover-dry-run.txt` |
| P7-T6 Dual-Write Resilience Drills | P1 | Rollout Engineer | [#66](https://github.com/kriegcloud/beep-effect/issues/66) | Resolved | Need repeatable outage drills for both sinks after P6. | Documented + executed drill matrix for Falkor outage, Graphiti outage, and partial write recovery with evidence packet. | `outputs/p7-kg-excellence/resilience-drill-report.md` | `outputs/p7-kg-excellence/evidence/20260228T110010Z-drill-recovery-replay-both.json` |

## Exit Gate
1. All six tickets statused with evidence links. **PASS**
2. No P0/P1 tickets remain open in this backlog. **PASS**
3. Updated quality scorecard shows improved runtime and parity confidence. **PASS**
4. Final gate packet: `outputs/p7-kg-excellence/final-excellence-scorecard.md`.
