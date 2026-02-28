# P6 Dual-Write Execution Log

## Status
IMPLEMENTED with P6 hardening patch and evidence packet capture (2026-02-25).

## Command Surface (Implemented)
1. `bun run beep kg publish --target falkor|graphiti|both --mode full|delta --changed <paths>`
2. `bun run beep kg verify --target falkor|graphiti|both --group <id> --commit <sha>`
3. `bun run beep kg parity --profile code-graph-functional --group <id>`
4. `bun run beep kg replay --from-spool <file|dir> --target falkor|graphiti|both`

`kg` help confirms all four subcommands are active.

## Hardening Delta (P6)
- File: `tooling/cli/src/commands/kg.ts`
- Change set:
  1. Falkor query execution switched to `execFileSync` argument arrays.
  2. `verify` Falkor metrics changed to `fileCount`, `commitCount`, `commitContextCount`.
  3. `parity` matrix changed to include commit-context and observed counts.

## Evidence Timeline

| Time (UTC) | Run | Result | Evidence |
|---|---|---|---|
| 2026-02-25T20:59:38Z | `publish --target both --mode full` (pre-fix) | Falkor failed `474/474`, Graphiti succeeded `474/474` | `evidence/20260225T205938Z-publish-full.json` |
| 2026-02-25T20:59:38Z | `publish --target both --mode delta` (pre-fix) | Falkor failed `475/475`, Graphiti succeeded `475/475` | `evidence/20260225T205938Z-publish-delta.json` |
| 2026-02-25T20:59:38Z | `replay --target both` (pre-fix) | Falkor failed `475/475`, Graphiti succeeded `475/475` | `evidence/20260225T205938Z-replay-both.json` |
| 2026-02-25T21:06:59Z | `publish --target both --mode full` (post-fix fixture) | Falkor succeeded `2/2`, Graphiti succeeded `2/2` | `evidence/20260225T210659Z-fixture-publish-full.json` |
| 2026-02-25T21:06:59Z | `publish --target both --mode delta` (post-fix fixture) | Falkor succeeded `4/4`, Graphiti succeeded `4/4` | `evidence/20260225T210659Z-fixture-publish-delta.json` |
| 2026-02-25T21:06:59Z | `replay --target both` (post-fix fixture) | Falkor succeeded `4/4`, Graphiti succeeded `4/4` | `evidence/20260225T210659Z-fixture-replay-both.json` |
| 2026-02-25T21:47:50Z | `publish --target both --mode full` (post-fix full-repo) | Falkor succeeded `1437/1437`, Graphiti succeeded `1437/1437` | `evidence/20260225T214750Z-fullrepo-publish-full.json` |
| 2026-02-25T22:10:39Z | `verify` + `parity` (post-fix full-repo) | Verify 200 + parity 4/4 pass | `evidence/20260225T221039Z-fullrepo-verify-both.json`, `evidence/20260225T221039Z-fullrepo-parity.json` |

## Deterministic Replay Semantics Evidence

`kg index` (same commit, same fixture root):

| Run | writes | replayHits | Evidence |
|---|---:|---:|---|
| `index --mode full` first pass | 2 | 0 | `evidence/20260225T210750Z-fixture-index-full-1.json` |
| `index --mode full` second pass | 0 | 2 | `evidence/20260225T210750Z-fixture-index-full-2.json` |
| `index --mode delta --changed packages/fixture/src/dep.ts` | 0 | 2 | `evidence/20260225T210750Z-fixture-index-delta.json` |

Interpretation: deterministic episode UUID + artifact hash ledger semantics are preserved.

## Exit Gate Status
1. `publish|verify|parity|replay` implemented: PASS.
2. Dual-write full+delta+replay evidence for `target=both`: PASS (fixture packet + full-repo full publish pass).
3. Deterministic replay semantics evidenced: PASS (`index` replayHits packet).
4. Known gaps and mitigations captured: PASS (see quality scorecard and rollout runbook).
