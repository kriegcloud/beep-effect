# Agent Effectiveness Loop Plan

## Phase 0 - Research Bootstrap

Status: complete

- Create the initiative packet and research lane index.
- Run the Phoenix capability map, live Phoenix state audit, repo eval/metrics
  audit, and opportunity map as separate artifact-producing lanes.
- Synthesize the artifacts into a ranked execution plan.
- Keep all production code, infra, timers, deployment files, and agent configs
  unchanged during this phase.

## Phase 1 - Agent-Effectiveness Doctor And Annotation Plan

Status: selected

Implement only local, no-mutation outputs:

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations plan --json`
- `beep agent-effectiveness annotations check --json`

This phase should combine Phoenix health, project inventory, AI-metrics
forwarder/report state, source coverage, scorecard gaps, labels, benchmarks,
worker-eval report status, mirror/retention status, and explicit unavailable
provider/tool/cost metrics into one trust gate.

The annotation plan should render proposed Phoenix annotations from repo-owned
labels, benchmarks, scorecards, worker-eval status, source coverage, and loop
health without applying them to Phoenix.

## Phase 2 - Phoenix-Native Enrichment

Status: deferred until Phase 1 proof

Candidate areas:

- datasets and experiments for repo-specific agent tasks;
- evals on traces and deterministic code evaluators;
- prompt/config experiment comparison;
- annotations and failure-mode labels in Phoenix;
- Phoenix CLI/MCP usage if it improves operator workflows.

## Phase 3 - Repo Workflow Integration

Status: pending Phase 1 proof

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
