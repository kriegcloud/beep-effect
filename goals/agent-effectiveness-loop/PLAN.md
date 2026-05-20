# Agent Effectiveness Loop Plan

## Phase 0 - Research Bootstrap

Status: complete

- Create the goal packet and research lane index.
- Run the Phoenix capability map, live Phoenix state audit, repo eval/metrics
  audit, and opportunity map as separate artifact-producing lanes.
- Synthesize the artifacts into a ranked execution plan.
- Keep all production code, infra, timers, deployment files, and agent configs
  unchanged during this phase.

## Phase 1 - Agent-Effectiveness Doctor And Annotation Plan

Status: complete

Implemented local, no-mutation outputs:

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`

This phase combines Phoenix reachability/project inventory, local AI-metrics
DuckDB evidence, source coverage, scorecard gaps, labels, benchmarks, and
worker-eval report status into one report-only trust gate. Missing providers
are represented as `unavailable` evidence.

The annotation plan renders proposed Phoenix annotation metadata from repo-owned
labels, benchmarks, scorecards, worker-eval status, source coverage, and loop
health without applying them to Phoenix. The annotation check command validates
that plans stay metadata-only and do not include private paths, secret-shaped
values, draft JSDoc, or code examples.

Live proof is recorded in
[history/outputs/phase1-live-proof.md](./history/outputs/phase1-live-proof.md).

Implemented guarded Phoenix sync plumbing:

- `beep agent-effectiveness datasets bundle --json`
- `beep agent-effectiveness prompts bundle --json`
- `beep agent-effectiveness experiments bundle --json`
- `beep agent-effectiveness phoenix sync --json`

This closeout treats the Phoenix driver and sync loop as guarded Phase 1B
plumbing. Sync defaults to dry-run, requires explicit confirmation before live
writes, and is not used as live-mutation proof for Phase 1 completion. Closeout
evidence is recorded in
[history/outputs/phase1-closeout.md](./history/outputs/phase1-closeout.md).

## Phase 2 - Phoenix-Native Enrichment

Status: split into `goals/agent-effectiveness-phoenix-enrichment`

Candidate areas:

- datasets and experiments for repo-specific agent tasks;
- evals on traces and deterministic code evaluators;
- prompt/config experiment comparison;
- annotations and failure-mode labels in Phoenix;
- Phoenix CLI/MCP usage if it improves operator workflows.

## Phase 3 - Repo Workflow Integration

Status: split into `goals/agent-effectiveness-workflow-integration`

Future implementation may add Phoenix annotation writes, datasets, experiments,
prompt-management workflows, Phoenix API drivers, or additional AI metrics
projections only after Phase 1 proves the local trust gate and annotation schema
are useful and private.

## Verification Posture

Every implementation phase must name:

- the repo command or runbook that produces the evidence;
- the Phoenix project or derived report that receives sanitized output;
- privacy checks proving no raw transcript or private path leakage;
- the repo quality commands for any touched package;
- the rollback or no-op behavior when Phoenix is unavailable.
