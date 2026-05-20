# Phase 1 Live Proof

## Status

Phase 1 local doctor and annotation-plan loop is live-proofed for PR readiness.

## Scope

This proof covers the read-only Phase 1 closure surface:

- `beep agent-effectiveness doctor --json`
- `beep agent-effectiveness annotations check --json`

The commands used a temporary data root. No Phoenix projects, datasets, prompts,
experiments, annotations, traces, server configuration, or agent configuration
were mutated.

## Live Read-Only Evidence

The live doctor reached Phoenix and decoded the project inventory successfully.
The sanitized result was:

```json
{
  "summary": "warning",
  "phoenix": "passed",
  "phoenixMessage": "Phoenix is reachable and has trace-bearing projects.",
  "projectCount": 2,
  "traceBearingProjects": 2,
  "datasetCount": 0,
  "promptCount": 0,
  "evaluatorCount": 0,
  "aiMetrics": "unavailable",
  "workerEval": "warning",
  "workerCompleted": 10
}
```

The overall doctor status remains `warning` because this checkout does not have
local derived AI-metrics DuckDB evidence, and the checked-in worker-eval packet
contains policy-warning evidence. That is expected for Phase 1 closure; the
acceptance gate is section-level Phoenix proof plus annotation privacy proof.

## Annotation Privacy Evidence

The live annotation check produced a local-only plan and passed privacy/schema
checks:

```json
{
  "status": "passed",
  "annotationCount": 6,
  "findings": 0
}
```

## Automated Regression Evidence

The Phoenix inventory decoder is covered by a stubbed HTTP-client test that
uses the current Phoenix GraphQL wire shape. Focused tests passed:

```txt
Test Files  2 passed (2)
Tests       6 passed (6)
```
