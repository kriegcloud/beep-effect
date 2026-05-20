# Turbo Cache And Scope

## Current-State Findings

Measured facts:

- PR lanes pass `--affected --summarize` to lint/check/test lanes, and docgen
  uses either `bunx turbo run docgen --affected --summarize` or
  `bun run docgen`: `.github/workflows/check.yml:153-190`.
- The docgen matrix row sets `uses_turbo: "false"` even though both docgen paths
  run Turbo: `.github/workflows/check.yml:79-82` and `package.json:91-92`.
- `turbo.json` includes `TURBO_TOKEN` and `TURBO_TEAM` in `globalEnv`, so those
  variables participate in the global task hash: `turbo.json:14`.
- Direct `--affected` dry-runs on the current main checkout selected zero
  package tasks for `check` and `docgen`, and reported only the root package.
- Local dry-runs reported Turbo 2.9.14. A `docgen --affected` dry-run also
  reported remote caching unavailable locally because authentication failed.
- Turbo config has cache enabled for `build`, `lint`, `check`, `type-test`, and
  `docgen`, while `test:integration`, `coverage`, `codegen`, and `audit` are
  explicitly uncached or operational: `turbo.json:21-112`.

Inference:

- `TURBO_TOKEN` and `TURBO_TEAM` in `globalEnv` likely fragment task hashes
  across local, PR, push, fork/no-secret, and rotated-secret environments
  without representing task outputs.
- Turbo `--affected` scope is only partial for root commands: repo-cli still
  appends repo-wide check/lint steps because `--affected` is not treated as an
  explicit scope in `shouldRunRepoWideSteps`.
- Docgen is under-instrumented and under-restored as a Turbo lane because the
  workflow marks it non-Turbo except for the affected summary append special
  case.

## Evidence

Source evidence:

- `turbo.json:14-20` defines global env and pass-through env.
- `turbo.json:67-88` defines `check`, `test`, and `type-test`.
- `turbo.json:107-111` defines cacheable `docgen` outputs.
- `.github/workflows/check.yml:53-83` defines the verify matrix.
- `.github/workflows/check.yml:136-201` wires setup cache flags, PR `--affected`,
  docgen Turbo invocations, and summary append conditions.
- `.github/actions/setup-monorepo-ci/action.yml:41-71` restores/saves local Turbo
  cache only when `cache-turbo == true` and remote cache credentials are absent.
- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:420-426` detects
  explicit scope only from `--filter` and `--since`, not `--affected`.
- `packages/tooling/tool/cli/src/commands/Quality/Tasks.ts:749-821` appends
  repo-wide check/lint policy steps after Turbo.

Commands used:

```sh
bunx turbo run check --affected --summarize --dry-run=json --ui=stream
bunx turbo run docgen --affected --summarize --dry-run=json --ui=stream
gh run list --workflow check.yml --limit 20 --json databaseId,status,conclusion,createdAt,updatedAt,displayTitle,event,headBranch,headSha
gh run view 25906168342 --json jobs
gh run view 25949443588 --json jobs
```

External primary docs:

- Turborepo `run` reference documents `--affected`, `--cache`,
  `--concurrency`, `--continue`, and `--dry-run=json`:
  <https://turborepo.dev/docs/reference/run>
- Turborepo caching docs describe task cache fingerprints and remote caching:
  <https://turborepo.dev/docs/crafting-your-repository/caching>
- Turborepo configuration docs state that `globalEnv` affects hashes while
  pass-through env does not, and that task `cache` defaults to `true`:
  <https://turborepo.dev/docs/reference/configuration>

## Candidate Interventions

| Rank | Intervention | Expected Impact | Risk | Cost | Verification |
|---|---|---:|---|---|---|
| 1 | Remove `TURBO_TOKEN` and `TURBO_TEAM` from `globalEnv`; omit them from task hashes or move only where runtime passthrough is truly needed. | High | Low-medium: must confirm Turbo still receives credentials from process env in CI. | Low | `bunx turbo run check --dry-run=json` no longer lists them under global hash inputs; compare PR/push cache hit rates in `--summarize`. |
| 2 | Mark docgen as `uses_turbo: "true"` and append Turbo summaries for full docgen, not only affected docgen. | High | Low: docgen already runs Turbo. | Low | PR and push docgen jobs restore local fallback when remote credentials are absent and always emit summary stats. |
| 3 | Introduce an explicit PR scoped mode for repo-cli check/lint, or treat `--affected` as scope after safety review. | High | Medium-high: repo-wide policy checks may catch non-package failures. | Medium | Dry-run/package-change matrix plus a full push/scheduled proof; prove which repo-wide checks move to separate full/tiered lanes. |
| 4 | Make PR `--affected` history robust with `fetch-depth: 0` or adaptive unshallow when base/head history is incomplete. | Medium | Low: deeper checkout can add setup time. | Low | Long-lived PR branch dry-run does not degrade to all packages; compare checkout/setup timing. |
| 5 | Add timing/summary visibility around `docs:aggregate`, or promote aggregate into a clearly named cache-aware repo tooling lane if it is a repeated bottleneck. | Medium | Medium: root docs aggregation writes outside per-package Turbo outputs. | Medium | Separate docgen Turbo time from aggregate time; verify root docs proof still exists on full gate. |

## Do Not Do

- Do not cache `test:integration` by default; it is explicitly `cache: false`
  and uses database/testcontainer state.
- Do not add secrets or volatile CI variables to `globalEnv` unless they truly
  change task outputs.
- Do not replace the full quality proof with `--affected`.
- Do not use Turbo `--parallel`; official docs mark it deprecated and warn that
  it discards graph/dependency behavior.
- Do not add broad file outputs to lint/test/type-test just to make caching
  work; Turborepo already caches logs, and only real generated artifacts belong
  in `outputs`.
- Do not interpret this workstation's local cache misses as CI truth; remote
  auth was unavailable locally.

## Open Questions

- Are `TURBO_TOKEN` and `TURBO_TEAM` available on all PR events, including forks
  and automation branches?
- What do recent Turbo summaries show for remote hit/miss rates per CI lane?
- Which repo-wide lint/check steps are mandatory on every PR versus acceptable
  in full proof lanes?
- Should docs-only or initiative-only Markdown changes trigger docgen? Current
  docgen gate matches `*.md`.
- Is `fetch-depth: 100` enough for normal PR lifetime, or has it caused
  all-package `--affected` fallbacks?
