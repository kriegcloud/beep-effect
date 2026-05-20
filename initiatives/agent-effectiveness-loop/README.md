# Agent Effectiveness Loop

## Status

Phase 1 complete

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

Use the implemented agent-effectiveness doctor, annotation-plan loop, and
guarded Phoenix sync plumbing as the trust gate for repo-owned agent feedback.
The Phase 1 live proof is recorded in
[history/outputs/phase1-live-proof.md](./history/outputs/phase1-live-proof.md),
and the post-merge closeout is recorded in
[history/outputs/phase1-closeout.md](./history/outputs/phase1-closeout.md).

The merged Phoenix sync path remains confirmation-gated. The Phase 1 closeout
does not use live Phoenix mutation as proof, and Phase 2/3 enrichment work
remains deferred.

## Implemented Phase 1 Commands

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`
- `beep agent-effectiveness datasets bundle --json`
- `beep agent-effectiveness prompts bundle --json`
- `beep agent-effectiveness experiments bundle --json`
- `beep agent-effectiveness phoenix sync --json`

The doctor and annotation commands are report-only. They inspect Phoenix
reachability/project inventory, local AI metrics evidence, and the JSDoc
worker-eval report, then produce sanitized metadata-only annotation proposals.
The bundle commands produce deterministic Phoenix-ready payloads. The sync
command defaults to dry-run and requires an explicit confirmation token before
any Phoenix write.

## Reading Order

- [SPEC.md](./SPEC.md) - authoritative research and privacy contract
- [PLAN.md](./PLAN.md) - phased execution plan
- [ops/manifest.json](./ops/manifest.json) - machine-readable routing metadata
- [research/README.md](./research/README.md) - research lane index
