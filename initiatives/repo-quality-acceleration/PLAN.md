# Repo Quality Acceleration Plan

## Phase 0 - Baseline And Parallel Exploration

- Capture recent GitHub Actions Check workflow timing with `gh run list` and
  `gh run view --json jobs`.
- Run focused local timing probes only for suspected lanes where the result
  materially changes recommendations.
- Launch five read-only explorer tracks using
  [ops/prompts/parallel-explorer.md](./ops/prompts/parallel-explorer.md).
- Record each explorer report under `research/` or `history/outputs/` with
  stable filenames.
- Produce a synthesis report ranking interventions by impact, risk, cost, and
  verification burden.

## Phase 1 - Low-Risk Orchestration Wins

Candidate work must be chosen from Phase 0 evidence. Expected categories:

- reduce repeated GitHub Actions setup cost;
- improve Turbo cache hit visibility and cache correctness;
- tune affected/scoped PR behavior where full gates remain intact;
- add better timing summaries for slow lanes.

Phase 1 should favor small workflow or repo-cli changes with clear before/after
timing proof and low semantic risk.

## Phase 2 - Repo-Cli Quality Orchestration

Use Phase 0 evidence to decide whether `@beep/repo-cli` should add bounded
parallel execution for independent quality steps.

Implementation must preserve readable logs, typed failures, and clear exit
codes. The default should be lane-aware concurrency with hybrid failure
aggregation rather than unbounded subprocess fan-out.

## Phase 3 - Docgen And Metadata-Aware Selectivity

Treat symbol-map-backed selective docgen/example typechecking as a separate
design gate.

Do not implement symbol-level selectivity until the feasibility report defines a
correctness model, stale-index behavior, Turbo artifact contract, and full
fallback proof.

## Verification Posture

Every implementation phase must include:

- focused tests for changed repo-cli behavior, when applicable;
- workflow or Turbo dry-run evidence for CI changes;
- at least one before/after timing comparison;
- the fallback full quality command or workflow proving the canonical gate still
  exists.
