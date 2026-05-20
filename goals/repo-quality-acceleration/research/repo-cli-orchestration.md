# Repo-Cli Orchestration

## Current-State Findings

- Root quality scripts route through `beep-cli` for `build`, `check`, `test`,
  `lint`, and `audit`; root scripts are intentionally compact:
  `package.json:75-83`.
- The root quality task runner is serial and fail-fast today:
  `runSteps` uses `Effect.forEach(steps, runStep, { discard: true })`, and
  `runStep` inherits stdout/stderr and returns the first `QualityTaskFailed`:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:531-567`.
- The biggest repo-cli orchestration target is `lint`: after Turbo lint, it
  runs sixteen repo-wide policy/tool checks serially:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:792-821`.
- `test --unit --types` currently runs two separate Turbo subprocesses serially
  before optional integration. Integration is isolated and should stay
  exclusive because it acquires a SQL resource and forces
  `test:integration --concurrency=1`:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:623-626` and
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:914-928`.
- `check` runs Turbo check, then repo-wide dtslint/test/smoke `tsgo` sidecars
  when no explicit `--filter` or `--since` is present. PR `--affected` does not
  suppress these repo-wide add-ons:
  `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:749-763`.
- `repo-sanity` is serial but mostly independent: tsconfig sync check, version
  sync check, syncpack, sherif, and Bun audit can likely be grouped with bounded
  concurrency and aggregated failures:
  `packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts:311-327`.
- Any parallel runner needs a new failure model and log model. Current behavior
  reports one failed label, sets `process.exitCode` to that child exit code, and
  inherits stdio.

## Evidence

GitHub timing baseline:

- PR run `25906168342`: Lint 377s total / 253s verification, Docgen 312s /
  186s, Check 268s / 118s, Test Integration 247s / 124s, Test Unit 239s / 96s,
  Repo Sanity 182s / 55s.
- Push run `25949443588`: Docgen 796s / 680s, Test Unit 523s / 414s, Build
  504s / 166s, Lint 391s / 246s, Test Integration 378s / 263s.

Source paths inspected:

- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts`
- `packages/tooling/tool/cli/src/commands/Quality/ScriptCommands.ts`
- `.github/workflows/check.yml`
- `package.json`
- `turbo.json`

Commands used:

```sh
gh run view 25906168342 --json jobs
gh run view 25949443588 --json jobs
rg -n "runSteps|rootLintSteps|rootCheckSteps|runRootTestTask|runRepoSanity" packages/tooling/tool/cli/src/commands/Quality
```

External primary docs:

- Turborepo `run` reference documents bounded `--concurrency`, `--continue`,
  and the warning that `--parallel` ignores the dependency graph:
  <https://turborepo.dev/docs/reference/run>

## Candidate Interventions

| Rank | Intervention | Expected Impact | Risk | Cost | Verification |
|---|---|---:|---|---|---|
| 1 | Add a bounded grouped runner for repo-wide lint policy checks after Turbo lint. Use lane-aware groups, not `steps.length`; start with concurrency 2-4 for cheap policy/scanner steps. | High: targets PR Lint's 253s verification path. | Medium: subprocess contention and log readability. | Medium | Unit-test aggregate success/failure ordering; compare `bun run lint -- --affected --summarize` before/after; confirm GH Lint timing and failure output. |
| 2 | Replace serial unit/type test Turbo invocations with one Turbo run for `test` plus `type-test`, or a bounded two-step group, while keeping integration separate. | Medium-high: push Test Unit verification was 414s. | Medium: shared Turbo args must select identical task sets. | Low-medium | Compare `turbo run test type-test --dry=json` with current two invocations; then time `bun run test -- --unit --types --affected --summarize`. |
| 3 | Parallelize independent `repo-sanity` checks with aggregation after any required git/base setup, keeping each check's output grouped. | Medium local, low PR wall-clock. | Low | Low-medium | Inject failing fake steps in tests; time `bun run audit:github repo-sanity`; preserve changeset status sequencing in workflow. |
| 4 | Introduce an explicit `QualityTaskGroup`/aggregate error type for `serial`, `parallel-aggregate`, and `exclusive` groups; use a deterministic exit-code rule. | Medium enabler | Medium: changes command boundary semantics. | Medium | Focused tests for one failure, multiple failures, spawn failure, and exit-code selection; snapshot grouped error text. |
| 5 | Add per-step timing output behind a CI/env flag for repo-cli quality steps. | Low direct, high diagnostic value. | Low | Low | Verify logs include durations without changing exit codes; compare against GH step timings. |
| 6 | Consider CI-only defaults for bounded policy concurrency while keeping local commands serial or user-overridable until logs prove readable. | Medium for PR feedback. | Low-medium: behavior divergence must be documented. | Low | Run same branch with local serial and CI bounded modes; ensure the full local proof remains obvious. |

## Do Not Do

- Do not use unbounded `Effect.forEach` or `concurrency: steps.length` for
  subprocess fan-out.
- Do not parallelize long Turbo/vitest/docgen subprocesses with inherited
  stdout/stderr.
- Do not parallelize SQL integration with unit/type lanes by default.
- Do not skip repo-wide lint/check add-ons merely because PR lanes use
  `--affected`; that is a safety semantics decision.
- Do not use Turbo `--parallel`.
- Do not change `lint:fix`, docgen generation, codegen, or other write-mode
  commands in Phase 0.

## Open Questions

- What concurrency cap is safe on GitHub `ubuntu-latest` for lint policy
  subprocesses: 2, 3, or 4?
- Should aggregate failures use highest exit code, first exit code, or always
  `1` for repo-cli policy groups?
- Should local `bun run lint` stay serial by default, with bounded aggregation
  enabled only under CI?
- Which lint policy checks share mutable temp/cache state, if any?
- Can `turbo run test type-test` exactly preserve the current two-command task
  graph when `--affected`, `--summarize`, and filters are passed?
- Should parallel logs be buffered per step or streamed with `[label]` prefixes
  to avoid no-output timeouts on slower CI lanes?
