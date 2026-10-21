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
2. Read `repos/{owner}/{repo}/dependency-graph/compare/<base>...<head>?per_page=1&page=N`
   one page per `gh api -i` call, following the `Link` header's `rel="next"`, and
   decode each page with `DependencyGraphComparePage` (see "Review round 1").
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

## Hosted proof

The required `Security` check ran the new step on PR #1991:

- run [39669268621](https://github.com/beep-effect/beep-effect/actions/runs/39669268621),
  job [119462481075](https://github.com/beep-effect/beep-effect/actions/runs/39669268621/job/119462481075),
  conclusion `success`;
- reviewed range: base `18558794acc884b3637a2f943f70c85802159eb6`, head
  `2fc2babaacb49c1ac34e67d9612c9e609853789c`;
- `GITHUB_TOKEN` permissions in the job log: `Contents: read`;
- step output: `fixture policy: **/test/**/fixtures/** (…)`,
  `rows: 2; reviewed: 2; excluded as fixtures: 0; added without a license: 1`,
  `verdict: pass`.

The check name and required status are unchanged (`ci ruleset --check` passes in
the same job). No fork PR has run it yet; fork runs get the same read-only token.

## Review round 1 (#1991)

Thread `PRRT_kwDOPbO_N86u6gwA` (beep-reviewer, P2): the compare read went through one
`gh api --paginate --slurp` capture, which `runRepoCommandCapture` bounds at
512 KiB. A larger range came back truncated, became `unknown (request-failed)` and
failed the required job with no override. The #1592 range alone was about 278 KB.

Probe (read-only `gh api -i` on the #1592 range, 2026-10-21):

| Request | Rows | Manifests | `Link` |
| --- | ---: | ---: | --- |
| no `per_page`, or `per_page=99`/`100`/`200`/`1000` | 792 | 64 | none |
| `per_page=50`, pages 1 to 2 | 820 | | `next`, `last=2` |
| `per_page=5`, pages 1 to 16 | 821 | 69 | `next`, `last=16` |
| `per_page=1`, pages 1 to 77 | 822 | 69 | `next`, `last=77`; 7 pages empty mid-sequence |
| a page past `last` | 0 | | `prev`, `first`, `last` only |

The endpoint does paginate. Three facts shaped the fix:

- `per_page` counts manifests, not rows.
- A large page silently drops data. The unpaged reply the lane used lost 5 of 69
  manifests (30 rows), so the first version under-reported, which is a fail-open.
  The pinned action's `per_page: 5` also dropped one row.
- An empty page does not mean the end, because empty pages occur mid-sequence.
  The only end marker is the absence of `rel="next"`.

Fix (`DependencyReview.ts`):

- Read each page with `-i` and `per_page=1`, one bounded capture per page. Each page
  is split at the header/body blank line and must have a `200` status. Its body is
  decoded with the new `DependencyGraphComparePage` schema, and the rows are
  combined.
- Follow `rel="next"`. A `next` that is not `page + 1` is `malformed-response`,
  because a skipped page could hide rows.
- Ceiling: `DEPENDENCY_REVIEW_COMPARE_PAGE_LIMIT = 500` pages. Past it, the verdict
  is the new `unknown` reason `page-limit-exceeded`. The dependency graph lists 226
  manifests, and one page holds one manifest's rows, so 500 leaves room for empty
  pages and growth. A full 500-page read would use half of the job token's
  1,000-requests-per-hour budget; a typical PR reads a handful of pages.
- A truncated, malformed, non-`200` or failed page, a missing separator and the
  ceiling are all fail-closed `unknown`, never a partial pass. Only one manifest
  with more than about 1,490 rows (512 KiB at roughly 352 bytes per row) can
  truncate a page now.
- Live: the #1592 range now reads 822 rows (743 excluded, 79 reviewed) and passes.
  The #911 range reads 41 rows instead of 37 and fails on the same three
  transitive packages.

Tests written failing first: the suite failed to load before the fix, because the
page schema and ceiling did not exist yet. The recorded client now serves
`gh api -i` pages with `Link` headers, one manifest per page:

- #1592's recorded rows over six pages (one per manifest plus an empty page after the third): fixtures still
  excluded, same counts;
- a high advisory alone on page 2: `fail`;
- a later page truncated, malformed or failed (502), a skipped `next`, a missing
  separator, a non-`200` status: `unknown`;
- an endless `next` chain: `unknown (page-limit-exceeded)`, with the ceiling in the
  detail.

The live-client test in `ci-rerun-runner-loss.test.ts` now asserts the `-i
...?per_page=1&page=1` argument list.

Round-1 verification, each command alone through `beep-heavy`:

| Command | Result |
| --- | --- |
| repo-cli `check` | exit 0 |
| Bun and Node runs of the seven CI test files | 184 tests pass on each |
| effect-vitest / schema-first | `introduced=0` / parity ok, `introduced=0` |
| effect-diagnostics `--filter repo-cli` | 0 in changed files (4 inherited in `laws-schema-tag-idioms.test.ts`) |
| oxlint on changed files; biome | 0 |
| fallow audit `--base origin/main --check` | exit 0, `introduced=0` |
| jsdoc-ratchet | `increased=0` |
| observability catalog | current after `--write` (adds `DependencyReview.comparePage`) |
| schema-catalog, policy-fingerprint | current |
| `quality cache-policy` | 0 blocking |
| scoped Node coverage | `DependencyReview.ts` 96.3% lines, 95.2% branches; the other two files 100% |

## Review round 2 (#1991)

Three threads on head `2fc2babaac`.

- `PRRT_kwDOPbO_N86u8Lu8` (beep-reviewer, P2), a fail-open in `nextPage`. It
  returned none both for a missing `rel="next"` and for a `rel="next"` whose page
  number its regex could not read: `page` not the last parameter, or a cursor
  (`after=`) link. `compare` then stopped and evaluated a partial row set. The
  `Link` header is now parsed as RFC 8288 entries, split only at a comma that
  opens the next `<`. The parser finds the entry whose `rel` tokens include `next`
  and reads the `page` query parameter by name, in any position, as a positive
  integer. Only a missing `rel="next"` ends the sequence. A `rel="next"` without
  `<url>` or without a readable `page` is `unknown (malformed-response)`. Tests,
  failing first: `page` before `per_page` (followed; page 2's advisory fails), a
  cursor-only next link (`unknown`), and a next entry without angle brackets
  (`unknown`).
- `PRRT_kwDOPbO_N86u8J49` (CodeRabbit), `package_url` nullability. Checked
  against `components.schemas["dependency-graph-diff"]` in
  `github/rest-api-description` (`descriptions/api.github.com/api.github.com.json`,
  `main`, fetched 2026-10-21):

  | Field | Spec | Ours | Disposition |
  | --- | --- | --- | --- |
  | `change_type` | required, enum `added`/`removed` | same | aligned |
  | `manifest`, `ecosystem`, `name`, `version` | required string | same | aligned |
  | `package_url` | required, nullable | was `S.String` | now `S.NullOr(S.String)`; it feeds no decision |
  | `license`, `source_repository_url` | required, nullable | `S.NullOr(S.String)` | aligned |
  | `scope` | required, enum | optional, same enum | looser, kept: the action reads a missing scope as `runtime` |
  | `vulnerabilities` | required array | defaults to `[]` | looser, kept for parity with the action |
  | `severity` | required free-form string | `LiteralKit` `critical`/`high`/`moderate`/`low`, defaults to `low` when missing | stricter on purpose: the threshold ranks known severities, so an unrecognized value fails closed as `malformed-response` rather than being ranked, possibly as below `high`. The action's zod enum is equally strict. |
  | advisory id, summary, url | required string | same | aligned |

  A test decodes a row with `package_url: null`; before the change it failed.
- `PRRT_kwDOPbO_N86u8J4w` (CodeRabbit), hosted proof still listed as a to-do. The
  hosted `Security` run on `2fc2babaac` is recorded under "Hosted proof" above, and
  the manifest statusNote now names the same run. #1882 stays `complete`.

The schema-first gate then flagged the test file as schema-heavy with no
schema-derived property, so `ci-dependency-review.test.ts` gained an
`Arbitrary.schema(DependencyGraphComparePage)` property (25 runs). It checks that a
page survives the wire codec, and that any of its manifests under a fixture root is
excluded.

Round-2 verification, each command alone through `beep-heavy`. After main was
merged, the dependency dists were rebuilt first
(`turbo run build --filter=@beep/repo-cli^...`, 47 tasks).

| Command | Result |
| --- | --- |
| repo-cli `check` | exit 0 |
| Bun and Node runs of the seven CI test files | 187 tests pass on each |
| effect-vitest / schema-first | `introduced=0` / exit 0, no advisory |
| effect-diagnostics `--filter repo-cli` | 0 in changed files (4 inherited in `laws-schema-tag-idioms.test.ts`) |
| oxlint on changed files | 0 |
| fallow audit `--base origin/main --check` | exit 0, `introduced=0` |
| jsdoc-ratchet | `increased=0` |
| observability catalog, schema-catalog, policy-fingerprint | current |
| `quality cache-policy` | 0 blocking |
| goals doctor | 0 blocking |

## Reversal

Revert the PR. That restores the `actions/dependency-review-action@a1d282b… # v5.0.0`
step with its three inputs, and `pull-requests: write` on `security`. The fixture
trip then returns for any range that adds failing fixture rows.
