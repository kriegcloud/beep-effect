# P4 Coverage and Correctness Report

## Scope
Validate P4 coverage/correctness thresholds against frozen P0/P2/P3 contracts without reopening architecture.

## Inputs Reviewed
- `README.md`
- `MASTER_ORCHESTRATION.md`
- `handoffs/HANDOFF_P3.md`
- `outputs/p2-design/evaluation-design.md`
- `outputs/p3-execution/*`

## Evidence Runs (2026-02-25)
1. `bun run --cwd tooling/cli test -- kg.test.ts` (pass; includes replay idempotency + outage fallback assertions)
2. Fixture replay drill:
   - `BEEP_KG_ROOT_OVERRIDE=<fixture> bun run beep kg index --mode full` (writes=2)
   - rerun same command (writes=0, replayHits=2)
   - snapshot file hash unchanged across rerun

## Threshold Status

| Metric | Target | Measured | Status | Evidence |
|---|---:|---:|---|---|
| Exported symbol coverage | >= 98% | Not measured | BLOCKED | No repo-scale coverage ledger in P3 artifacts |
| Import edge precision (manual sample) | >= 95% | Not measured | BLOCKED | No 200-edge manual adjudication set produced |
| Call edge precision (manual sample) | >= 90% | Not measured | BLOCKED | No 200-edge manual adjudication set produced |
| Determinism (same commit => same IDs/hashes) | 100% | 100% (fixture replay) | PROVISIONAL PASS | Replay run returned `replayHits=2`, `writes=0`; snapshot hash stable on rerun |

## Lock/Interface Drift Check
No contradictions found to locked defaults/interfaces:
- CLI command surface unchanged
- ID shape unchanged
- Provenance enum unchanged
- Envelope and no-throw policy unchanged

## Conclusion
Coverage/correctness gate is not met for rollout promotion because 3/4 required metrics are unmeasured at required validation depth. Determinism signal is positive but currently fixture-scoped.
