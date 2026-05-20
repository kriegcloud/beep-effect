# Agent Effectiveness Loop

## Status

Phase 1 local doctor and annotation-plan loop live-proofed for PR readiness

## Mission

Create a repo-specific feedback loop that uses Phoenix, the existing AI metrics
stack, and read-only worker-eval evidence to improve how coding agents operate
in this repo.

Phoenix is the primary observability and evaluation surface, but the initiative
goal is agent effectiveness: better repo guidance, better evals, better
diagnostics, and better operator workflows for understanding where agents
struggle.

## Starting Point

This initiative depends on two existing packets:

- `initiatives/ai-metrics-stack` - privacy-safe transcript ingestion, config
  snapshots, labels, benchmarks, scorecards, OTLP export, and the live Phoenix
  deployment on dankserver.
- `initiatives/jsdoc-worker-eval` - read-only JSDoc worker-eval orchestration,
  hosted/Runpod model evidence, and sanitized Phoenix spans for the
  `beep-jsdoc-worker-eval` project.

The live Phoenix UI is available on the tailnet at
`https://dankserver.tailc7c348.ts.net:8447/projects`. Research may inspect it
read-only and must not mutate projects, datasets, prompts, experiments, traces,
or server configuration.

## Research Artifacts

- [Phoenix capability map](./research/phoenix-capability-map.md)
- [Live Phoenix state audit](./research/live-phoenix-state-audit.md)
- [Repo eval and metrics surface audit](./research/repo-eval-metrics-surface-audit.md)
- [Agent-effectiveness opportunity map](./research/agent-effectiveness-opportunity-map.md)
- [Synthesis and ranked execution plan](./research/synthesis-ranked-execution-plan.md)

## Current Recommendation

Use the implemented no-mutation agent-effectiveness doctor and annotation-plan
loop as the trust gate before any Phoenix write path. The Phase 1 live proof is
recorded in [history/outputs/phase1-live-proof.md](./history/outputs/phase1-live-proof.md).
The synthesis still defers Phoenix writes, datasets, experiments, prompt
management, and backend drivers until the repo-owned local trust gate and
privacy-checked annotation schema prove useful.

## Implemented Phase 1 Commands

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`

The commands are report-only. They inspect Phoenix reachability/project
inventory, local AI metrics evidence, and the JSDoc worker-eval report, then
produce sanitized metadata-only annotation proposals. They do not write to
Phoenix or mutate agent configuration.

## Reading Order

- [SPEC.md](./SPEC.md) - authoritative research and privacy contract
- [PLAN.md](./PLAN.md) - phased execution plan
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata
- [research/README.md](./research/README.md) - research lane index
