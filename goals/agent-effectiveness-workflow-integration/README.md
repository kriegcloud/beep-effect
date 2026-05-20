# Agent Effectiveness Workflow Integration

## Status

Pending planning

## Mission

Make proven agent-effectiveness loops routine in repo workflows after the
Phoenix-backed trust gate and enrichment lanes are useful.

This goal owns the workflow lane that was deferred after
`agent-effectiveness-loop` Phase 1: operator runbooks, CI/report integration,
agent handoff guidance, and recurring evidence collection.

## Starting Point

- Parent goal: `goals/agent-effectiveness-loop`
- Enrichment sibling goal: `goals/agent-effectiveness-phoenix-enrichment`

## Current Recommendation

Do not add automation until a concrete workflow has a verified evidence source
and a blocked-state story. Prefer operator-visible commands and runbooks before
CI enforcement.

## Reading Order

- [SPEC.md](./SPEC.md) - authoritative goal contract
- [PLAN.md](./PLAN.md) - deferred implementation lanes
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata
