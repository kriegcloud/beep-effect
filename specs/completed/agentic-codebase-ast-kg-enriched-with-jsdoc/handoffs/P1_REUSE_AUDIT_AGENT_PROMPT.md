# P1 Reuse Audit Agent Prompt — Revalidation

## Mission
Revalidate reuse/build boundaries before P2 design freeze.

## Inputs
1. `outputs/initial_plan.md`
2. `outputs/p0-research/reuse-vs-build-matrix.md`
3. Required reuse anchors listed in `README.md`

## Required Output
1. `outputs/p1-research/agents/reuse-audit-agent.md`

## Required Checks
1. Every reuse row still points to existing repo files.
2. Every build row still has a clear insufficiency rationale.
3. Any changed boundaries are marked as ADR-required before P2.
