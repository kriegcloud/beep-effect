# Batch 2: Metadata Release Sidecars

Status: `complete`

Read-only agent lane. The agent returned this report; the orchestrator persisted
it.

## Hotspots

1. `repo-exports:catalog:check` is the largest metadata-sidecar hotspot and is
   currently red. Read-only probe:
   `time -p bun run repo-exports:catalog:check` failed with stale
   `standards/repo-exports.catalog.jsonc` and `.md`; `real 100.70`,
   `user 130.06`. The check did not edit files. Current dirty Yeet source
   changes likely contribute to drift, so full quality is not green until the
   catalog is refreshed.
2. CI `Repo Sanity` spends about 45s on duplicate `origin/main` refresh before
   sidecars. `check.yml` already fetches PR base, then
   `runGithubChecks("repo-sanity")` unconditionally calls `ensureOriginMain`.
   Recent runs: `27058047302` refreshed at `09:02:47`, first sidecar at
   `09:03:31` (about 44s). `27054768998` refreshed at `06:21:00`, first sidecar
   at `06:21:46` (about 46s).
3. Actual repo-sanity substeps are much smaller after fetch:
   `changeset-graph` 2.22s local, near-zero in CI once repo-cli is loaded;
   `config-sync:check` 7.32s local, about 8.4s CI;
   `version-sync --skip-network` 2.17s local, about 2.6s CI;
   `syncpack lint` 0.09s local, about 0.2s CI;
   `changeset status --since=origin/main` 0.50s local.
4. Repo-export catalog implementation is sequential and large. The committed
   JSONC catalog is 377,073 lines; Markdown is 15,637 lines; totals include
   15,094 public export entries. `buildRepoExportsCatalog` analyzes topo-sorted
   packages with `concurrency: 1`, creates a fresh `ts-morph` `Project` per
   package, and renders both JSONC and Markdown even in check mode.
5. `topo-sort` leaks dependency-section pseudo nodes. `bun run topo-sort` emits
   `devDependencies`, `peerDependencies`, `dependencies`, and
   `optionalDependencies`, which the catalog records as
   `missing-workspace-metadata`. Low performance impact, but noisy generated
   metadata.

## Source Evidence

- `packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts`:
  `ensureOriginMain` always fetches `origin/main`.
- `Quality.command.ts`: repo-sanity runs changeset graph, tsconfig sync,
  version sync, syncpack, sherif, then Bun audit serially.
- `Quality.command.ts`: full quality always runs repo-export catalog check
  before tests/repo sanity.
- `RepoExportsCatalog.ts`: per-package source scan and `ts-morph` project
  creation.
- `RepoExportsCatalog.ts`: catalog build uses topo-sort and `concurrency: 1`.
- `RepoExportsCatalog.ts`: check mode builds both generated outputs and compares
  files.
- `.github/workflows/check.yml`: workflow fetches PR base before verification.
- `.github/workflows/check.yml`: CI repo-sanity then runs
  `audit:github repo-sanity` plus changeset status.
- `lefthook.yml`: pre-push repo-export catalog guard is already path-gated.
- `.github/workflows/release.yml`: release PR validates changeset graph before
  versioning.
- `package.json`: root scripts expose config/version sync, knip, changesets,
  repo-export catalog, and release.

## Duplicate Or Stale Findings Avoided

- Did not re-file Turbo credential hashing or initial lint sidecar grouping.
- Do not tune `syncpack`/`sherif` first; they are tiny compared with duplicate
  fetch and repo-export catalog check.
- `knip` exists as a root script but is not in current `audit:github quality` or
  Check workflow; classify before adding it to End-to-End Green.
- Hooks are fast guards; keep pre-push repo-export gating distinct from full
  quality proof.

## Candidate Implementation Tasks

| Rank | Task | Write Scope | Expected Impact | Risk | Proof | Rollback |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Refresh stale repo-export catalog, then record current check timing. | `standards/repo-exports.catalog.*` | Unblocks current full quality; establishes 100s baseline. | Low-medium generated churn. | `bun run repo-exports:catalog`; `bun run repo-exports:catalog:check`; `bun run audit:github quality`. | Revert generated catalog commit; rerun check. |
| 2 | Add repo-export catalog timing/progress and JSON status. | `RepoExportsCatalog.ts`, quality tests | Makes 100s sidecar actionable without weakening proof. | Low | `time -p bun run repo-exports:catalog:check`; repo-cli tests. | Revert instrumentation; rerun check. |
| 3 | Avoid duplicate `origin/main` fetch in CI when base was already fetched. | `Quality.command.ts`, `check.yml` | About 44-46s off Repo Sanity CI lane. | Medium freshness risk. | Before/after `gh run view <id> --json jobs`; repo-sanity logs; `bun run audit:github repo-sanity`. | Restore unconditional fetch. |
| 4 | Add timed repo-sanity substep summary; only then consider safe parallel grouping. | `Quality.command.ts`, tests | Measurement unlock; possible 8-12s if independent checks group safely. | Medium failure aggregation. | `bun run audit:github repo-sanity`; compare substep timings. | Restore serial runner. |
| 5 | Filter topo-sort pseudo nodes or use workspace package order in catalog. | `TopoSort`, `QualityArtifactSupport`, catalog tests | Low speed; cleaner generated metadata. | Low-medium catalog churn. | `bun run topo-sort`; `bun run repo-exports:catalog:check`. | Revert filter/order change. |

## Resource Risks

- Do not run repo-export catalog check in parallel with docgen or large ts-morph
  work; the probe used 130s CPU.
- `sherif@1.10.0` is invoked via versioned `bunx`; keep an eye on surprise
  cache/network behavior before relying on it as free.
- Release publish path runs `bun run release`, which repeats
  build/test/lint/audit before `changeset publish`; do not optimize it
  casually.
- CI logs show Node.js 20 action deprecation warnings with enforcement starting
  June 16, 2026; forward to the CI setup lane.

## Do Not Do

- Do not hand-edit generated repo-export catalog files.
- Do not skip repo-export catalog in full proof without a named full fallback.
- Do not add `knip` to the common green lane without timing and policy
  classification.
- Do not relax release, changeset, or publish checks as a throughput shortcut.
