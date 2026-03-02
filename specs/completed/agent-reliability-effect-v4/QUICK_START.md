# Quick Start

## What This Spec Does

Reliability-first implementation plan for agent execution in this monorepo, grounded on local Effect v4 truth and benchmark-gated policy promotion.

## Current Status

| Phase | Status | Summary |
|---|---|---|
| P0 | Complete | Canonical scaffold + source contract + protocol freeze completed |
| P1 | Complete | Harness refactors and typed tooling enforcement completed |
| P2 | Complete (No-Go) | Live confidence evidence captured; broader live matrix remained blocked by runtime timeout patterns |
| P3 | Complete (No-Go) | Adaptive A/B decision recorded with no promotable delta |
| P4 | Complete (Partial-Go) | Detector wiring validated in live runs; efficacy blocked by runtime instability |
| P5 | Complete (No-Go) | KG loop artifacts and ingestion are present; adaptive vs adaptive_kg lift not established |
| P6 | Complete (No-Go) | Final scorecard + playbook delivered; promotion lock remains in effect |
| P7 | Active | Weekly operations and reliability triage cadence in progress |

## How To Continue

1. Read the current handoff: `handoffs/HANDOFF_P7.md`.
2. Use the paired prompt: `handoffs/P7_ORCHESTRATOR_PROMPT.md`.
3. Run weekly operations from `docs/agent-reliability-playbook.md` and keep promotion lock enforcement active.

## Canonical Constraints

1. Effect API truth is local-only (`.repos/effect-v4` + Graphiti `effect-v4`).
2. Repo memory truth uses Graphiti `beep-dev`.
3. All benchmark/policy promotion decisions require A/B evidence.
4. Harness file/path operations use `effect/FileSystem` and `effect/Path`.
