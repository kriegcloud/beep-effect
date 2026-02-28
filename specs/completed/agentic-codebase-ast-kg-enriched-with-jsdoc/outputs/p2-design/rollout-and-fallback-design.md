# Rollout and Fallback Design

## Purpose
Freeze rollout stages, promotion gates, rollback controls, and operational response paths for KG-assisted hook behavior.

## Lock Alignment (Normative)

| Decision Surface | Frozen Value |
|---|---|
| Rollout stages | `R0 Shadow`, `R1 Advisory`, `R2 Limited On`, `R3 Default On` |
| Hook latency budget | Enforce `p95 <= 1.5s` from `R2 Limited On` onward |
| Hook fail behavior | Hard timeout + no-throw; emit no KG block on failure |
| Read policy under Graphiti outage | Use local deterministic cache only |
| Fallback controls | Must remain exactly as locked fallback trigger/action table |

## Stage Plan (Locked)

| Stage | Behavior | Promotion Gate |
|---|---|---|
| `R0 Shadow` | Build/index/ingest only; no hook injection | Coverage/correctness targets met |
| `R1 Advisory` | Hook computes KG hints but logs only | Query usefulness targets met |
| `R2 Limited On` | Hook injects KG hints for selected contributors | Early benchmark lift + `p95<=1.5s` |
| `R3 Default On` | Hook enabled by default | Full performance thresholds met |

## Fallback Trigger Matrix (Locked)

| Trigger | Fallback Action |
|---|---|
| Hook latency breach/timeout storm | Auto-disable KG injection; preserve current hook output |
| Graphiti unavailable | Use local deterministic cache only; skip Graphiti read path |
| Incremental drift detected | Force full rebuild and temporarily freeze delta mode |
| Performance regression in A/B | Roll back rollout stage and disable default KG condition |

## Operational Controls

### Runtime Flags
- `BEEP_KG_ROLLOUT_STAGE=R0|R1|R2|R3`
- `BEEP_KG_HOOK_ENABLED=true|false`
- `BEEP_KG_GRAPHITI_READ_ENABLED=true|false`
- `BEEP_KG_DELTA_ENABLED=true|false`

### Stage Transition Requirements
1. Promotion requires all current-stage gate evidence published.
2. Promotion is one stage at a time.
3. Any triggered fallback freezes promotion until post-incident review completes.

## Incident Response Contract
1. Latency breach:
set `BEEP_KG_HOOK_ENABLED=false`, keep baseline hook path active.
2. Graphiti outage:
set `BEEP_KG_GRAPHITI_READ_ENABLED=false`, keep local deterministic retrieval path.
3. Incremental drift:
set `BEEP_KG_DELTA_ENABLED=false`, run full rebuild, re-enable only after deterministic parity check.
4. A/B regression:
decrease stage by one level and disable default-on behavior.

## Rollback Verification Checklist
1. Baseline hook output still valid when KG injection disabled.
2. No-throw behavior confirmed during forced timeout tests.
3. Local-only mode produces bounded output without Graphiti.
4. Full rebuild after drift recreates deterministic snapshot parity.

## Ownership Freeze
- Orchestrator:
stage progression decision and enforcement of gate criteria.
- Hook Engineer:
feature-flag wiring and no-throw fallback behavior.
- Graphiti Engineer:
Graphiti health signal and local-only fallback integration.
- Eval Engineer:
A/B detection and latency regression signals.
- Rollout Engineer (P4):
operational drill execution and rollback sign-off.

## P3 Task Graph Assumptions
1. Feature flags are implemented before any `R1` promotion.
2. Hook timeout/no-throw path is delivered before `R2` trials.
3. Graphiti outage fallback path is integration-tested before `R2`.
4. Stage promotion automation uses published evaluation outputs from `evaluation-design.md`.

## Freeze Statement
Rollout staging, incident triggers, rollback actions, and ownership responsibilities are fixed and ready for execution.
