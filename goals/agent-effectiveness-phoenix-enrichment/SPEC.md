# Agent Effectiveness Phoenix Enrichment Specification

## Status

Pending planning

## Mission

Create Phoenix-native feedback artifacts from repo-owned agent-effectiveness
evidence after Phase 1 has proven the local trust gate and privacy checks.

## Scope

Candidate enrichment work includes:

- applying reviewed annotations to Phoenix;
- creating sanitized datasets for recurring repo-agent tasks;
- running Phoenix experiments with deterministic evaluators;
- comparing prompt, config, model, or workflow variants;
- using Phoenix CLI or MCP only when it improves operator workflows.

## Inputs

- `goals/agent-effectiveness-loop`
- `goals/ai-metrics-stack`
- `goals/jsdoc-worker-eval`
- Phoenix docs and the live tailnet Phoenix instance named by the parent goal.

## Constraints

- No raw transcripts, prompt/output text, private paths, source snippets,
  secrets, or unreviewed human notes may be written to Phoenix.
- Live Phoenix mutation must remain confirmation-gated.
- Dry-run output must be reviewable before any write.
- Enrichment semantics stay in `@beep/repo-ai-metrics` and operator workflows
  stay in `@beep/repo-cli` unless a direct Phoenix API wrapper justifies a
  driver package.

## Completion Criteria

This goal closes only when a selected enrichment slice has:

- a narrow Phoenix artifact target;
- privacy checks covering the exact payload shape;
- a readback or rollback story for writes;
- repo quality evidence for touched packages;
- a history output recording proof and any remaining blocked lanes.
