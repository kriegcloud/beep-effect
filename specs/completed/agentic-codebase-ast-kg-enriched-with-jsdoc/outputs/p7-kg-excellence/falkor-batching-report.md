# P7-T1 Falkor Batching Report

## Objective
Reduce full-repo Falkor publish runtime by at least 70% from the P6 baseline while preserving zero failed writes.

## Implementation
Falkor publish now uses batched Redis query submission via `runFalkorQueries(...)` instead of per-query process calls.

- Code path: `tooling/cli/src/commands/kg.ts`
- Batching function: `runFalkorQueries`
- Publish path: `publishToFalkor`

## Evidence Runs

| Run | Source | Attempted | Written | Failed | Falkor Duration |
|---|---|---:|---:|---:|---:|
| P6 baseline | `outputs/p6-dual-write-parity/evidence/20260225T214750Z-fullrepo-publish-full.json` | 1437 | 1437 | 0 | 1,346,707 ms (~22.4m) |
| P7 batched | `outputs/p7-kg-excellence/evidence/20260228T105611Z-fullrepo-publish-both.json` | 509 | 509 | 0 | 71,151 ms (~74s) |

Supporting metadata:
- `outputs/p7-kg-excellence/evidence/20260228T105611Z-fullrepo-publish-both.meta.txt`

## Result
- Absolute runtime reduction vs baseline: **94.72%**
- Per-envelope runtime reduction (normalized for run size): **85.08%**
- Failed writes: **0**

## Acceptance Check
- Runtime reduction `>=70%`: **PASS**
- Zero failed writes preserved: **PASS**
