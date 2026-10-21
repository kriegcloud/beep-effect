# #1882 dependency review

Lane: `residue-dependency-review`. Base: main `d1f3330135`. Route: S39/S41 Claude
chain, a `claude-opus-5-5` Claude child (first step, no fallback taken). Owning
package: `@beep/repo-cli`.

## Problem

The `Security` job's `Dependency review` step ran pinned
`actions/dependency-review-action@a1d282b… # v5.0.0` with `fail-on-severity: high`,
`deny-licenses: AGPL-3.0, GPL-3.0` and `comment-summary-in-pr: on-failure`. The action
has no manifest-path exclusion, so synthetic test-fixture manifests fail the required
check. RSC-BD-REVIEW-01 (burn-down item 12) left this open.

Recorded trip: PR #1592's `Security` job (job `114060894889`, run `38001655074`,
2026-10-09) failed with `Dependency review detected vulnerable packages.` on
`scratchpad/test/lockfiles/fixtures/npm/v1/package-lock.json » lodash@4.17.23`
(GHSA-r5fr-rjxr-66jc, high).

## Manifest inventory and fixture policy

Source: GraphQL `repository.dependencyGraphManifests` on the default branch
(226 manifests), plus the 19 tracked manifests the graph did not list, captured
2026-10-21 at `d1f3330135`. The classified list is
`packages/tooling/tool/cli/test/fixtures/dependency-review/manifest-inventory.json`;
a test pins the policy to it.

| Class | In graph | Tracked, not in graph | Paths |
| --- | ---: | ---: | --- |
| Synthetic fixture | 35 | 9 | `scratchpad/test/workspaces/fixtures/**` (33 `pnpm-lock.yaml`, 2 `package-lock.json`, 1 `bun.lock`); `packages/tooling/library/repo-utils/test/fixtures/mock-monorepo/**`; `packages/tooling/tool/cli/test/fixtures/{doctest-lane,proof-epoch}/**`; `packages/tooling/tool/docgen/test/fixtures/section-example/package.json` |
| Production | 191 | 10 | Workspace `package.json` files (including `scratchpad/`, `apps/labs/*`, `architecture-lab`, `test-kit`), 13 workflows, the two `src-tauri` `Cargo.toml`/`Cargo.lock` pairs, photo-face `pyproject.toml`/`uv.lock`; not listed: root and turbo-cache `bun.lock`, the setup action, five packages newer than the graph snapshot, vendored `glib` `Cargo.toml` |

Policy (`dependencyReviewFixturePolicy`, `DependencyReviewSchemas.ts`): one rule,
`**/test/**/fixtures/**`, matched on whole path segments. A `fixtures` segment must
follow a `test` segment. Look-alikes stay production: `tests/fixtures/`,
`test-fixtures/`, `fixtures/test/`, `test/fixtures-loader/`. Every production path
with a fixture-like word (`labs`, `architecture-lab`, `test-kit`, `scratchpad`,
`vendor`) was reviewed by hand and is a real, installed workspace.

Which fixtures trip the current action: replaying PR #1592's compare today gives
713 fixture rows over 60 fixture manifests and 25 failing rows (runtime, added,
high or critical). All 25 are under `scratchpad/test/lockfiles/fixtures/**`, which
#1930 has since renamed to `*.fixture` so the graph no longer lists them. None of
the fixtures still in the graph (`scratchpad/test/workspaces/fixtures/**`) has a
failing row or a GPL/AGPL license today. They can start failing whenever a new
advisory lands on a historical version, or a new fixture is captured. That is the
risk the policy removes.

## Design

**Schema** (`commands/Ci/DependencyReviewSchemas.ts`):

- `DependencyChange` is one compare row. `DependencyChangeType`, `DependencyScope`
  and `AdvisorySeverity` are `LiteralKit`s; `DependencyVulnerability` defaults a
  missing severity to `low`, as the action's zod schema does.
  `DependencyGraphComparePages` is the `gh api --paginate --slurp` shape.
- `FixturePathPattern` (literal segments and `**` only), `FixturePathRule` and
  `FixturePathPolicy`.
- `DependencyReviewThresholds` (`failOnSeverity`, `failOnScopes`, `denyLicenses`
  over `DeniedLicense`) and `DependencyReviewSettings`, with the constants
  `dependencyReviewThresholds` (high, `runtime`, AGPL-3.0/GPL-3.0) and
  `dependencyReviewSettings`.
- `DependencyReviewRequest` (two full SHAs, `CommitSha`).
- `DependencyReviewFinding`, a `TaggedUnion`: `vulnerability` (manifest, package,
  advisories), `denied-license`, `unresolved-license`.
- `DependencyReviewVerdict`, a `TaggedUnion`: `pass` and `fail` carry
  `DependencyReviewCounts`, and `fail` also carries a non-empty list of findings.
  `unknown` carries a `DependencyReviewUnknownReason` (`permission-denied`,
  `not-found`, `rate-limited`, `request-failed`, `malformed-response`) and
  a detail string. `DependencyReviewUnavailableError` is the internal typed failure
  that becomes `unknown`.

**Contract** (`commands/Ci/DependencyReview.ts`): `DependencyReview` is a
`Context.Service` with `settings` and `review(request)`, which never fails.
`makeDependencyReviewLayer(settings)` builds it over `GithubPolicyClient`.
`GithubPolicyClient` is the existing `gh api` adapter from `CiGovernance.ts`, now
exported. It gains `request`, which returns the raw `GithubApiReply` (exit code,
merged output, truncation), plus `GithubPolicyClientLive`. `read` and `write` keep
their behavior and messages.

**Implementation**:

1. Resolve both commits with `repos/{owner}/{repo}/commits/<sha> --jq .sha`. The
   compare API answers `200 []` for a commit it does not know (probed with two
   invented SHAs), so without this an unknown range would pass. The action has this
   fail-open too.
2. `--paginate --slurp repos/{owner}/{repo}/dependency-graph/compare/<base>...<head>?per_page=100`,
   decoded with `DependencyGraphComparePages`.
3. Drop rows whose manifest matches the fixture policy. Keep rows in
   `failOnScopes`, treating a missing scope as `runtime`, and keep `added` rows.
4. A vulnerability finding is any advisory at or above `high`.
5. License: `null` or `NOASSERTION` counts as unlicensed, which is reported and
   does not fail. A null license with a github.com source, or a truncated
   255-character invalid string, is resolved through `repos/<o>/<r>/license`. A 404
   there means no license; any other failure is `unknown`. The license string is
   then parsed with `@beep/spdx` (bare `OTHER` becomes
   `LicenseRef-clearlydefined-OTHER`). An invalid expression is `unresolved`, which
   fails. A valid one is `denied` when one of its OR-ed alternatives is a single
   denied license, after `-only`/`-or-later` normalization and the GPL/AGPL version
   ranges. This is the pinned action's `@onebeyond/spdx-license-satisfies`
   `satisfiesAny` check: `GPL-2.0-or-later` and `MIT OR GPL-3.0` are denied;
   `MIT AND GPL-3.0`, `LGPL-3.0-only` and `GPL-3.0 WITH Classpath-exception-2.0` are not.
6. Any GitHub read failure, truncated reply or decode failure is `unknown`:
   `classifyGithubFailure` maps 429 or "rate limit" to `rate-limited`, 401/403 to
   `permission-denied`, and 404 or "No commit found" to `not-found`.

**Command** (`commands/Ci/DependencyReviewCommand.ts`):
`bun run beep ci dependency-review --base <sha> --head <sha>` runs
`runDependencyReview`. It prints the range, the active fixture rules (so a policy
change shows in every log), the counts, each finding and the verdict. Exit codes:
0 on `pass`, 1 on `fail` or `unknown` (after an `::error::` annotation), 64 on a
malformed SHA.

## Token and fork boundary

`.github/workflows/check.yml`, job `security` (check name `Security`, unchanged,
still required):

- The `Dependency review` step keeps `if: github.event_name == 'pull_request'` and
  now runs `bun run beep ci dependency-review --base "$BASE_SHA" --head "$HEAD_SHA"`.
  Its env holds only `GH_TOKEN: ${{ github.token }}`, `GH_REPO`, and the event's
  base and head SHAs, passed as env and never interpolated into the script. No
  secret is added.
- Job permissions drop from `contents: read, actions: read, pull-requests: write`
  to `contents: read, actions: read`. `pull-requests: write` existed only for the
  action's on-failure PR comment, which the command does not post. `actions: read`
  is for the existing held-group step. The compare and commit reads need
  `contents: read`.
- The workflow triggers stay `pull_request` and `push`; there is no
  `pull_request_target`. GitHub gives fork `pull_request` runs a read-only token and
  no secrets, so a fork's code runs with read access only. The checkout keeps
  `persist-credentials: false`.
- Residual risk, unchanged from before: under `pull_request` a PR controls its own
  workflow and CLI code, so a PR could weaken its own review. It could already
  delete the action step. Changes to the policy constant are visible in the diff and
  in the printed `fixture policy:` line.
- The action is not kept as a second step. With no path filter, it would keep failing
  on the fixtures this change exists to exclude.

`test/ci-runner-security.test.ts` asserts this from the YAML: the triggers, the
workflow and job permissions, the step's exact env and command, no `uses`/`with`,
no `secrets.` in any Security step, and `persist-credentials: false`.

## What the compare API sees, compared with the action

Both read the same endpoint, so detection coverage is identical except for the
deliberate fixture exclusion.

- Transitive packages: the API reports them as ordinary rows of the lockfile
  manifest that resolves them. Recorded proof is PR #911, which added photo-face's
  `uv.lock`: `certifi@2026.7.22` (critical), `urllib3@2.7.0` (high) and
  `pillow@12.3.0` (critical/high) are not direct `pyproject.toml` dependencies at
  that head (those were `insightface`, `numpy`, `onnxruntime` and `opencv-python`),
  and the command fails on all three. #1930 shows the same for the two `Cargo.lock`
  files (`rustls-webpki`, `serde_with_macros`, `windows-*`).
- The dependency graph does not parse `bun.lock`. The root and the turbo-cache
  `bun.lock` are absent from the manifest list, and workspace `package.json` rows
  carry unresolved `workspace:`/`catalog:` versions. npm transitive advisories
  therefore reach neither the action nor this command. The preceding OSV step scans
  `bun.lock` and stays the npm transitive gate.
- Dropped informational parts: the OpenSSF scorecard section, the PR comment, the
  >1 MB summary artifact, and the `x-github-dependency-graph-snapshot-warnings`
  header (the repository submits no dependency snapshots).
- Stricter than the action: unknown commits fail (step 1), a failed license lookup
  other than 404 is `unknown` where the action treated it as no license, and there
  is no octokit retry, so a transient 5xx fails closed and needs a rerun.

## Tests

`packages/tooling/tool/cli/test/ci-dependency-review.test.ts` runs with `it.layer`
over a recorded `GithubPolicyClient` that answers only exact argument lists, so no
test touches the network. Fixtures are trimmed real replies
(`test/fixtures/dependency-review/`, with a README).

| Case | Input | Expected |
| --- | --- | --- |
| High transitive advisory in production | PR #911 recorded rows | `fail`: certifi, urllib3 (pytest is moderate) |
| Fixture-only advisories excluded | PR #1592 recorded rows (16 fixture, 2 production) | `pass`, 16 excluded, both lockfile fixtures named |
| Look-alike paths | the recorded lodash row moved to four look-alike paths | `fail` on all four, none excluded |
| Denied and unresolved licenses | `GPL-3.0-or-later`, `MIT OR AGPL-3.0-only`, an invalid string, plus allowed and unlicensed rows | 2 denied, 1 unresolved, 1 unlicensed |
| Scope and additions-only | a development-scope critical row, a removed vulnerable row, an empty compare | `pass` |
| Source-repository license | AGPL repo license, a 404 repo | denied, unlicensed |
| Unknown | 403, 404, rate-limit 403, 429, malformed shape, non-JSON, truncated reply, spawn failure, 403 license lookup, unknown commit with GitHub's `200 []` compare | `unknown` with the matching reason, and a failure message |
| Exit codes | `runDependencyReview` | 0 pass, 1 fail, 1 unknown, 64 malformed SHA |
| Live client | `DependencyReviewLive` over `GithubPolicyClientLive` with a scripted `gh` (`ci-rerun-runner-loss.test.ts`) | exact argument lists, the raw failed reply, spawn failure is `unknown (request-failed)` |
| Policy and SPDX tables | the 245-manifest inventory, segment edge cases, 17 license strings, 7 gh outputs | exact classification |

## Verification

Commands ran in the lane worktree on the uncommitted tree, heavy ones through
`beep-heavy`. Live runs of the command used read-only `gh api` against the public
repository.

| Command | Result |
| --- | --- |
| `bun run --cwd packages/tooling/tool/cli check` | exit 0 |
| Bun `bunx --bun vitest run` on the CI test files | pass (`ci-dependency-review` 12, `ci-rerun-runner-loss` 27, `ci-runner-security`, `ci-governance`, `ci-command`) |
| Node `bunx vitest run`, same files | pass |
| `bun run beep quality package-verify @beep/repo-cli` | Final run: docgen ok; audit 7088/7089 Bun tests pass. The 1 failure is `knowledge-doctor-evaluators` checkout parity, which compares the committed tree with the uncommitted packet manifest: with the `HEAD` manifest swapped in, it and `policy-fingerprint-turbo-inputs` pass (19/19). The earlier run's `policy-fingerprint-turbo-inputs` failure came from the new `@beep/spdx` edge and was fixed by `bun run beep lint policy-fingerprint --write`. |
| `bun run coverage -- --filter=@beep/repo-cli` (Node, `HEAD` manifest swapped in) | 348 files, 7085 pass, 5 skipped. New files: `DependencyReview.ts` 96.2% lines, 94.3% branches; `DependencyReviewSchemas.ts` and `DependencyReviewCommand.ts` 100%. `CiGovernance.ts` is above its floors (58.42 lines against 55.49) after a live-client test in `ci-rerun-runner-loss.test.ts`. The ratchet still reports `Research/internal/UnknownRecord.ts` at 50% against a 100% floor. This lane does not touch that file, it measured 50% in both runs, and its only importer is `NotionPull.ts`, so the regression is not this lane's. |
| `bun run beep lint effect-vitest` | `introduced=0` (`resolved=14` predates this lane) |
| `bun run beep lint schema-first` | parity ratchet ok, `introduced=0` |
| `bun run beep quality effect-diagnostics --filter repo-cli` | 0 in changed files; 4 inherited errors in `test/laws-schema-tag-idioms.test.ts` (from #1969) |
| `bunx oxlint --disable-nested-config <changed files>` | exit 0 |
| `bun run beep quality fallow audit --base origin/main --check` | exit 0, `introduced=0` (one inherited-adjacent `renderTurboSummary` CRAP finding) |
| `bun run beep quality jsdoc-ratchet` | `increased=0` |
| `bun run beep observability catalog --check`, `bun run beep lint schema-catalog` | current after `--write` (nine new conforming spans, the new schemas) |
| `bun run beep laws retired-effect-paths` | 0 findings |
| `bun run beep goals doctor` | 0 blocking |
| `bun run beep ci workflow-lint` | clean |
| `bun run beep ci ruleset --check`, `ci settings --check`, `ci patterns` | match, present, in sync |
| Live: `ci dependency-review` on #1592's range | `pass`: 792 rows, 713 excluded, 79 reviewed |
| Live: #911's range | `fail`: certifi, pillow, urllib3; exit 1 |
| Live: #1975's range | `pass`, 52 rows |
| Live: invented SHAs | `unknown (not-found)`; exit 1 |

`docgen:local` asks for the full docgen proof because `bun.lock` and `turbo.json`
changed. package-verify runs `@beep/repo-cli`'s docgen. `tooling-schema-first`
(not a ratchet) gains no row: the new files use PascalCase names.

## Hosted CI the driver must check

- `Security` on this PR runs the new step: its log shows `dependency-review:
  <base>...<head>`, the `fixture policy:` line and `verdict: pass`.
- `Security` still runs with only `contents: read` and `actions: read`, and the
  ruleset still lists `Security` as required (`ci ruleset --check` passes in that
  job).
- On a fork PR, when one exists, the step passes with the fork's read-only token.

## Reversal

Revert the PR. That restores the `actions/dependency-review-action@a1d282b… # v5.0.0`
step with its three inputs, and `pull-requests: write` on `security`. The fixture
trip then returns for any range that adds failing fixture rows.
