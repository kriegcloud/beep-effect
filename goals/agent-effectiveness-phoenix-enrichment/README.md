# Agent Effectiveness Phoenix Enrichment

## Status

Pending planning

## Mission

Turn the completed `agent-effectiveness-loop` Phase 1 trust gate into
Phoenix-native feedback artifacts without weakening the privacy contract.

This goal owns the enrichment lane that was deferred after Phase 1: reviewed
annotation writes, datasets, experiments, evals, and prompt/config comparison.

## Starting Point

- Parent goal: `goals/agent-effectiveness-loop`
- Phase 1 proof: `goals/agent-effectiveness-loop/history/outputs/phase1-live-proof.md`
- Phase 1 closeout: `goals/agent-effectiveness-loop/history/outputs/phase1-closeout.md`

## Current Recommendation

Start with one narrow Phoenix enrichment slice after re-reading the Phase 1
doctor and annotation-plan outputs. The first implementation should preserve
dry-run-default behavior, require explicit confirmation for live writes, and
prove readback or rollback before broadening the surface.

## Reading Order

- [SPEC.md](./SPEC.md) - authoritative goal contract
- [PLAN.md](./PLAN.md) - deferred implementation lanes
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata
