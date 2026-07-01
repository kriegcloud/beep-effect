# Agent Governance Control Plane

## Status

Pending

## Overview

This initiative defines the reusable governance layer for agent-driven work in
this repository. It is the place to look for the repo-law canon, phase gates,
packet contracts, and reusable prompt assets that other initiatives inherit.

## Read This First

- [SPEC.md](./SPEC.md) — authoritative contract
- [PLAN.md](./PLAN.md) — current rollout and maintenance posture
- [design/](./design) — durable design slices
- [ops/manifest.json](./ops/manifest.json) — machine-readable routing
- [ops/prompts/](./ops/prompts) and [ops/handoffs/](./ops/handoffs) — agent
  execution surfaces

## Source material

- [research/SOURCES.md](./research/SOURCES.md) — gold-intake provenance ledger: the
  mined nuggets, upstream repos + licenses, external citations, and `@beep/*`
  capabilities behind the governance research note. Source exploration dir:
  [explorations/_gold-intake/](../../explorations/_gold-intake).

## Notes

- Historical phase outputs and reflection material live under [history/](./history).
- This initiative remains active because it governs future initiative work, not
  because it is waiting on one final code change.
- 2026-06-29: gold-intake research note added at research/gold-intake-governance-controls.md (see for runtime governance primitives — previewable filter-gated bulk mutation + tamper-evident agent/tool-call audit trace).
