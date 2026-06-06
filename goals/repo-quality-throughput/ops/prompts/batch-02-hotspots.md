# Batch 2 Prompt: Implementation Hotspots

You are one of six read-only agents for
`/home/elpresidank/YeeBois/projects/beep-effect`.

## Mission

Inspect implementation hotspots that could materially speed up End-to-End Green
without weakening proof. Do not edit files. Prefer source inspection, dry-runs,
and focused probes over slow all-up commands.

Read first:

- `AGENTS.md`
- `goals/repo-quality-throughput/SPEC.md`
- `goals/repo-quality-throughput/research/known-findings.md`
- `goals/repo-quality-throughput/tasks/tasks.jsonc`
- Batch 1 reports if they exist.

## Lanes

Assign one lane per agent:

1. `repo-cli-orchestration`: `Quality`, `Yeet`, `RepoRun`, concurrency,
   resource controls, failure aggregation, logging, and resumability.
2. `lint-fix-biome-eslint`: `lint`, `lint:fix`, Biome, ESLint, changed-file and
   staged-file paths, generated-file ignores, and fast clean-tree behavior.
3. `check-test-coverage`: `check`, `test`, `type-test`, `test:integration`,
   `coverage`, Vitest workspace config, tsgo, and redundant task graphs.
4. `security-audit-sast`: gitleaks, OSV, dependency review, Semgrep, `audit`,
   `audit:github`, and full-vs-PR proof semantics.
5. `metadata-release-sidecars`: repo-exports, config-sync, version-sync, knip,
   syncpack, changesets, release, generated catalogs, and sidecar drift checks.
6. `ci-nix-storybook-data-sync`: GitHub setup action, Nix/Cachix, Storybook,
   Vercel/external checks, data-sync workflow, release workflow, and skipped
   lane behavior.

Required subtopics:

- decide whether `coverage` is in End-to-End Green or a separate full/scheduled
  proof;
- isolate repo-sanity substep timings and duplicate proof work;
- isolate build cache/env/setup behavior;
- separate integration-test resource setup timing from test execution;
- map security/Nix/SAST/secrets parity across CI and repo-cli;
- classify Lefthook hooks as fast guards and record CI overlap;
- compare repeated `bunx turbo` launcher overhead with local Turbo binary
  resolution.

Do not repeat Batch 1 findings except to contradict them with current evidence
or convert them into implementation-ready tasks.

## Report Shape

Write a report under `research/batch-02-<lane>.md` with:

```md
# Batch 2: <Lane>

## Hotspots

## Source Evidence

## Duplicate Or Stale Findings Avoided

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |

## Resource Risks

## Do Not Do
```

Flag any task that can be implemented in a disjoint write set by a later
implementation agent.
