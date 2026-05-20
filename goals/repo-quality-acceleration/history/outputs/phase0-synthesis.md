# Phase 0 Synthesis

## Baseline

Phase 0 stayed evidence-only. It launched five read-only explorer tracks and
used live GitHub Actions timing, targeted source inspection, and metadata-only
local probes. No quality command behavior, CI behavior, Turbo config, docgen
implementation, or repo-cli implementation was changed.

Recent timing baseline:

| Run | Event | Wall-Clock Baseline | Slowest Job | Slowest Verification |
|---|---|---:|---|---:|
| `25906168342` | PR | 381s | Lint 377s | Lint 253s |
| `25905842432` | PR | 392s | Lint 389s | Lint 255s class |
| `25949443588` | push | 800s | Docgen 796s | Docgen 680s |
| `25906621282` | push | 569s job span | Build 566s | Build class |

Focused local probes:

```sh
bunx turbo run check --affected --summarize --dry-run=json --ui=stream
bunx turbo run docgen --affected --summarize --dry-run=json --ui=stream
bun --silent run beep docgen status --json | jq '.summary'
rg --files -g 'docgen.json' apps packages infra | wc -l
```

Results:

- Current checkout selected zero affected Turbo package tasks for `check` and
  `docgen`.
- Docgen status reported 60 total packages, 60 configured and generated.
- Local Turbo dry-runs used Turbo 2.9.14; one docgen dry-run reported remote
  caching unavailable locally because authentication failed.
- Graphiti MCP status was healthy, but fact search timed out twice; Phase 0
  artifacts therefore cite repo source and live command evidence instead of
  memory facts.

## Ranked Recommendations

| Rank | Recommendation | Expected Wall-Clock Impact | Cost | Correctness Risk | Verification Burden |
|---:|---|---:|---|---|---|
| 1 | A/B lean PR dependency setup for `~/.bun/install/cache`: exact-key-only or no broad restore fallback on PR matrix jobs. | High: possible 60-100s off the critical PR lane if 5 GB restore is slower than cold install. | M | Medium: network variance can erase gains. | Compare before/after PR runs with unchanged lanes; inspect setup logs and `gh run view --json jobs`. |
| 2 | Remove `TURBO_TOKEN`/`TURBO_TEAM` from Turbo task hashes or move them to pass-through-only handling if credentials still reach Turbo. | High: can improve cache reuse across local/CI/secret contexts. | S | Low-medium: must prove Turbo auth still works. | `turbo --dry-run=json` no longer lists them in global hash inputs; compare CI Turbo summaries. |
| 3 | Treat Docgen as a Turbo lane in workflow metadata and add summary/timing visibility for both affected and full docgen. | High diagnostic, medium direct. | S | Low: docgen already runs Turbo. | Docgen jobs emit Turbo summaries on PR and push; no command semantics change. |
| 4 | Add bounded grouped execution for repo-wide lint policy checks after Turbo lint. | High: PR Lint verification is the current critical path. | M | Medium: log readability and subprocess contention. | Unit tests for grouped failures; before/after `bun run lint -- --affected --summarize`; GH Lint timing. |
| 5 | Investigate combining unit/type Turbo invocations while keeping integration exclusive. | Medium-high for push, medium for PR. | S-M | Medium: must preserve selected task graph. | Compare `turbo run test type-test --dry=json` against current two-command graph; time `bun run test -- --unit --types --affected --summarize`. |
| 6 | Make PR docgen aggregation explicit: affected aggregate, skipped aggregate, or full fallback only. | Medium-high for docgen PRs. | M | Medium: stale root docs risk. | Compare selected docgen packages to aggregate targets; keep full `bun run docgen` on push/main or schedule. |
| 7 | Add a tooling-owned quality safety map before relaxing warnings or repo-wide sidecars. | Medium, safety-enabling. | M | Medium: overfitting current CI semantics. | Repo-cli classification tests; every relaxation names fallback full proof and missed-failure mode. |
| 8 | Add changed-surface docs/JSDoc warning enforcement in shadow/advisory mode first. | Medium quality value. | M-L | Medium-high: changed-file to symbol mapping must be precise. | Fixture warnings on changed vs untouched surfaces; full proof remains unchanged. |
| 9 | Add setup substep timing to the composite action. | Low direct, high evidence quality. | S | Low | One PR and one push show restore/install/save timings without command behavior changes. |

## Required Answers Before Implementation

- Cache/setup: is the 5 GB Bun cache expected, and does a cold
  `bun install --frozen-lockfile` beat restore plus install on GitHub-hosted
  runners?
- Turbo cache: do `TURBO_TOKEN` and `TURBO_TEAM` need to participate in task
  hashes, or are they runtime-only credentials?
- PR scope: which repo-wide lint/check sidecars are mandatory on every PR, and
  which can move to full push/scheduled proof?
- Full proof: what is the named canonical fallback proof for every PR
  relaxation: split push workflow, `bun run audit:github quality`,
  `bun run audit:github pre-push`, or a scheduled/workflow_dispatch equivalent?
- Docgen: is PR docgen time dominated by package docgen, example typechecking,
  setup/cache restore, or unscoped aggregation?
- Docgen selectivity: which artifact owns future symbol impact, and how are
  changed lines mapped to exported symbols, re-exports, examples, and deleted
  symbols?
- Safety: should docs/JSDoc warnings hard-fail only on changed files in PRs,
  while full gates handle the whole repo?
- SAST/security: can any PR SAST reduction be accepted only if full SAST remains
  on push/main or schedule?

## Do Not Do Before Phase 1

- Do not change `.github/workflows/check.yml`, `turbo.json`,
  `packages/tooling/tool/cli`, or `packages/tooling/tool/docgen` without a
  before/after timing proof and fallback proof.
- Do not route quality semantics through `shared`, `foundation`, drivers, or
  product slices.
- Do not remove full push/main or scheduled proof and rely only on PR affected
  lanes.
- Do not treat Turbo `--affected` as symbol-level selectivity.
- Do not make worker/model judgment a required quality gate.
- Do not turn all historical docs/JSDoc warnings into blockers in one step.

## Verification

Phase 0 artifact verification:

```sh
test -s goals/repo-quality-acceleration/research/ci-timing-and-setup.md
test -s goals/repo-quality-acceleration/research/turbo-cache-and-scope.md
test -s goals/repo-quality-acceleration/research/repo-cli-orchestration.md
test -s goals/repo-quality-acceleration/research/docgen-selective-checking.md
test -s goals/repo-quality-acceleration/research/quality-safety-semantics.md
test -s goals/repo-quality-acceleration/history/outputs/phase0-synthesis.md
```

```sh
rg -n "^(# |## Current-State Findings|## Evidence|## Candidate Interventions|## Do Not Do|## Open Questions)" goals/repo-quality-acceleration/research
rg -n "impact|risk|cost|verification|fallback|full proof|Do not" goals/repo-quality-acceleration/history/outputs/phase0-synthesis.md
git diff --exit-code -- .github/workflows/check.yml turbo.json packages/tooling/tool/cli packages/tooling/tool/docgen
```
