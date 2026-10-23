# Effected kit promotion Plan

## Status

Status: `active` — P1: wave 1a merged (#1956, eight packages); wave 1b merged (#1981, six packages, D-07 retirement, D-23 shared helpers); wave 2a merged (#1988, `@beep/npm-spec`, `@beep/tsconfig`); wave 2b merged (#1992 `@beep/walker`, #1994 `@beep/github`, #2002 `@beep/runtime-env`); wave 2c merged (#2016, glob adoption, D-37); wave 2d-1 merged (#2102, `@beep/markdown`, D-38..D-46); 2d-A merged (#2114, D-47); wave 2d-2 merged (#2121, `@beep/md` syntax bridge, D-48..D-51); 2d-3 merged (#2141, `Md.render` escaping, math on, D-52); wave 3 (`research/wave-3-plan-2026-10-23.md`, W3-a..W3-p): 3-Y merged (#2116, W3-d), 3-1 merged (#2122, W3-b), 3-2 merged (#2129, W3-c), 3-3 merged (#2134, W3-e), 3-4 merged (#2126, W3-f), 3-5 (`@beep/lockfiles`, W3-g) in review in this PR, 3-A1..3-A9 queued; wave 4 plan: `research/wave-4-plan-2026-10-23.md`.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Map every module to a package home, sweep the repo for reuse sites, design the `@beep/md` merge. | `research/promotion-map-2026-10-20.md`; decisions D-01..D-18 in `SPEC.md`. |
| P1 Implement | in-progress | Promote the waves, then run the adoption PRs (D-04). | Acceptance criteria in `SPEC.md`. |
| P2 Verify | pending | `package-verify` per package, scratchpad check, identity registry, typos. | Verification matrix green. |
| P3 Yeet: PR to mergeable | pending | One PR per wave and per adoption step, each driven to mergeable. | Each PR merge-ready; zero unresolved threads. |
| P4 Close | pending | Closeout reflection and packet flip. | Reflection exists; `proposedCloseout` in the final PR. |

## Waves

The binding plan for wave 3 is `research/wave-3-plan-2026-10-23.md`: its "PR sequence" table sets
the sub-wave order, dependencies and parallel lanes, and its decisions are recorded as W3-a onward
(numbered after merging main).

| Wave | Packages | Notes |
| --- | --- | --- |
| 1a (merged, #1956) | `@beep/spdx`, `@beep/schema-org`, `@beep/github-references`, `@beep/github-commands`, `@beep/commands`, `@beep/jsonl`, `@beep/jsonc`, `@beep/semver` | Low-finding packages first (D-19, D-20, D-21); every gate at zero findings, no inventory growth. |
| 1b (merged, #1981) | `@beep/memfs` (+ D-07 retirement of `@beep/test-utils/MemoryFileSystem`), `@beep/managed-section`, `@beep/toml`, `@beep/git`, `@beep/glob`, `@beep/yaml` | Complexity and duplication refactored to zero against the conformance oracles (yaml-test-suite, toml-test, minimatch, node:fs differential suites); shared helpers in `@beep/utils` (D-23); memfs replaces the test-utils copy in 17 packages (D-25). |
| 2a (merged, #1988) | `@beep/npm-spec`, `@beep/tsconfig` | The pure halves of `npm` and `tsconfig-json` (D-26..D-28); `DEFAULT_REGISTRY` moves into `@beep/npm-spec`. The registry/publish half and the tsconfig loaders stay in the lab. |
| 2b-1 (merged, #1992) | `@beep/walker` | D-31, D-32. Adopters: repo-utils `Root` `findRepoRoot`, `TSMorph` `resolveFileEntrypointTsConfig`, `FsUtils` `findNearestPackageDir`; repo-cli `Drawings.review`, `TestTsgoPrograms` (segment-aware containment). Lab importers retargeted to `@beep/walker` leaves. |
| 2b-2 (merged, #1994) | `@beep/github` | Replaces `@effected/github` in repo-cli (one atomic swap, D-34); closes the `@effected/github` Exception Ledger row. Merges after 2b-1 (shared identity, catalog, `bun.lock` and `PROMOTED`-map files). |
| 2b-3 (merged, #2002) | `@beep/runtime-env` | Lands with the `@beep/chalk` and `@beep/colors` delegation (D-14 as amended by D-33, colour precedence; D-36 conformance shifts). repo-cli EnvConfig is not adopted: its exact `CI === "true"` differs from `RuntimeEnv.ci` (Exception Ledger "Duplicate CI detection", removal with cli-kit in wave 4). Last in 2b: the only PR with intended CI-visible behaviour changes (plain `@beep/colors` output in Actions logs, D-33 option (a)). |
| 2c (merged, #2016) | glob adoption (no new package) | D-37. Needs 2b-1. Retires `@beep/utils/Glob`, `@beep/schema/Glob` and `FsUtils.walkFiles`/`globFiles` onto `@beep/glob` + `@beep/walker`, and repo-cli `Lint/internal/WorkspaceWalk.ts`; records the Bun `node:fs` glob census. Closes the "Duplicate directory traversal" ledger row and narrows "Duplicate glob matching" to repo-cli `internal/GlobPattern.ts` and the `EffectImports` tinyglobby scan (glob reuse phase). |
| 2d-1 (merged, #2102) | `@beep/markdown` | D-38..D-45. Scaffold, rename-only move with the benchmark baseline (D-40), branded `S.Opaque` nodes admitted once per entry point (D-39), conformance lanes to zero findings with string-clean hot loops (D-41, D-42), the core-only codec-free root barrel and M3 MDX leaf (D-43), and the bridge prerequisites `MarkdownNodeKind`, `FrontmatterCodec.decodeResult`, `./conformance/*` and `MarkdownDocument.headingSource` (D-44). Lab importers (github-actions `GitHubMarkdown`, cli tests, reachability and layering maps) retargeted to `@beep/markdown` leaves; the five canon exceptions are cleared (D-45). |
| 2d-2 (merged, #2121) | `@beep/md` `Md.syntax`/`Md.parse` | D-48..D-51 (closes D-44). Subpath-only bridge from the `@beep/markdown` tree to `Md.Document`: losses as data (20 reasons, `frontmatterFormatChanged` included), HTML escaped as text and `math` off by default, one `MdFromSyntax.make` per call, a pre-order source map that returns `None` after a transform, no `Context.Service`. Import-boundary and export-set test, bridge-corpus ledger with the writer differential (measure only), round-trip and safe-profile properties. `cache-baseline-request-w2d2` records the `@beep/md` manifest edge; the turbo coupling is 52 dependents gaining four upstream packages, with the D-02 amendment threshold in D-50. Resolves map sites #237 and #290 (`history/reuse-ledger.md`). |
| 2d-A (merged, #2114) | adoption (no new package) | D-46, D-47. After 2d-1, in parallel with 2d-2: repo-cli `extractFrontmatter` (file deleted), the `ChangesetGraph` fence, skill-contract `SkillProjection` (import-closure pins keep the block parser out), `Goals/Inventory` through `MarkdownDocument` and `headingSource`. Parity over the committed corpus with every intended shift pinned (D-47). Closes the "Duplicate frontmatter splitting and README heading parsing" ledger row. |
| 2d-3 (merged, #2141) | `@beep/md` `Md.render` writer fixes | D-52. The gate held: of the 141 divergent writer-differential rows, 62 were writer gaps (`research/writer-differential-w2d3.md`). `&` and `$` escaping plus loose lists, adjacent-list markers, `***` breaks, task-item indent, block-edge whitespace, title line breaks, table pipes, emphasis delimiters, all-space code spans, `!` before links, bare URLs and the admonition body line; an escape-aware inline-math recognizer. Ledger writer column 1 / 651 / 79 (was 1 / 589 / 141), none newly divergent. `math` is on by default in `Md.parse` (no consumer outside `@beep/md`; ledger byte-identical either way). No changeset: `@beep/md` is private and changesets do not version private packages. |
| 2d-later | adoption, one PR each | D-46 deferred sites, tracked in `history/reuse-ledger.md`. |
| 3-1 (merged, #2122) | `@beep/github-reporting` | W3-b, W3-h, W3-i. The `github-actions` reporting suite (`CheckState`, `ManagedDocument`, `CheckDocument` on the root; `GitHubMarkdown` subpath-only) with branded `S.Opaque` records admitted once per read, managed-section leaf imports, the #1928 optionals restored, `markerLine`, the micromark GFM differential (in package and `ops/github-reporting-gfm-differential.ts`) and the growth guard. Lab retargets only: github-actions `index.ts`, `package.json`, `Exports.test.ts`, `reachability.test.ts`, both PROMOTED maps, README/KNOWLEDGE prose. |
| 3-2 (merged, #2129) | `@beep/repo-tsconfig` | W3-c, W3-h, W3-k..W3-n. The lab `tsconfig-json` folder is fully promoted and gone. Realpathed package targets, `.json` siblings of `.ts`/`.js` export targets, tsc's `exports` fall-through (W3-n), and the three-way differential (`ops/repo-tsconfig-differential.ts`; corpus A 0 adopter-field diffs on 668 configs, corpus B loader == tsc on 714, 45 of them synthetic `exports` cases). Adopters: EffectDiagnostics (2 sites, the check-program test) and TestTypecheckCoverage; get-tsconfig leaves repo-cli and the root catalog. The `TsconfigValidator` and docgen move is 3-A6. |
| 3-Y (merged, #2116) | `@beep/yaml` continuation fix | W3-d. No adopters. From main; parallel with all. Repro tests, an oracle property, yaml-test-suite at zero failures, the lockfiles suite re-run. |
| 3-3 (merged, #2134) | `@beep/config-file` | W3-e, W3-h (3-3). Adopters: docgen `Configuration.ts` `readJsoncFile` (docgen drops `jsonc-parser`), repo-cli `Models.manifest.service.ts` `load`; lab xdg and cli (the lab cli renderer no longer imports the package). Codec-corpus conformance suite and `ops/config-file-codec-differential.ts`; coverage 100/100/100/100. Cut after 3-Y merged; serializes with 3-2 on the repo-cli manifest. |
| 3-4 (merged, #2126) | `@beep/package-json` | W3-f, W3-h (3-4). Lab importers only: the sbom re-export is dropped (type-only `SbomMetadataSource`), workspaces imports the package, both PROMOTED maps list it. `PackageName` follows `validForOldPackages` with a `validate-npm-package-name@7.0.2` differential; live census `ops/package-json-corpus.ts`. Adopters follow in 3-A2 (field growth), 3-A3 (repo-utils re-base) and 3-A4 (repo-cli and docgen readers); Exception Ledger row "Duplicate package.json field models". |
| 3-5 (in review, this PR) | `@beep/lockfiles` | W3-g, W3-h, W3-i. The four lockfile parsers, the `Lockfile` model and integrity checks with branded `S.Opaque` records and one `Lockfile.make` per `parse`/`withImporterNames`; `ResolvedPackage`, `WorkspaceDependency` and `LockfileImporter` stay `S.Class` on the bench fallback (W3-g). The bench (`ops/lockfiles-bench.ts`) and the live oracle (`ops/lockfiles-oracle.ts`, root `bun.lock` against `bun pm ls --all` plus 76 captures) are recorded under `research/`. Lab retargets only: workspaces imports `@beep/lockfiles`, both PROMOTED maps, README/KNOWLEDGE prose, the stale `DIAGNOSTIC_EXCEPTIONS.md` row. 3-4 takes main first on `WorkspacePackage.ts`. |
| 3-A1 (queued) | lockfiles adoption + `ResolvedPackage.installName` | repo-cli `CatalogUsage.ts`, `RootCatalog.ts` (bun.lock half). After 3-5. |
| 3-A2 (queued) | package-json field growth | `DevEngine.onFail` gains `download`. After 3-4. |
| 3-A3 (queued) | repo-utils re-base | repo-utils `schemas/PackageJson.ts`, Workspaces/Dependencies/DependencyIndex/UniqueDeps to `HashMap`, `DocgenConfig.ts`, `WorkspaceDeps.ts`. After 3-A2. |
| 3-A4 (queued) | package.json readers | repo-cli readers, `RootCatalog.ts` (package.json half), docgen `Version.ts` and `Configuration.ts`. After 3-A2, 3-A1, 3-3 and 2d-A. |
| 3-A5 (queued) | CheckCensus onto `TsconfigLoader.compilerOptions` | repo-cli `Quality/CheckCensus.ts`. After 3-2. |
| 3-A6 (queued) | `TsconfigValidator` + docgen `readTSConfig` | Deletes repo-utils `schemas/TSConfig.ts`; the `@beep/tsconfig` closed-view export. After 3-2, 3-3, 3-A3, 3-A4. |
| 3-A7 (queued) | `TsconfigSync.schemas` onto `@beep/tsconfig` | repo-cli `TsconfigSync.schemas.ts`, with byte parity of tsconfig-sync output. After 3-2. |
| 3-A8 (queued, optional) | `GitHubMarkdown.table` adoption | repo-cli `Ci/RunnerLossRerun.ts`, `Ci/CiOperational.service.ts`. After 3-1. |
| 3-A9 (queued, optional) | `ScopedPackageName` | observability `catalog/Catalog.names.ts`. After 3-4. |
| 4 | `@beep/sbom`, `@beep/xdg`, `@beep/cli-kit`, `@beep/repo-workspaces` | `repo-workspaces` declares `@beep/commands` and `@beep/git` as operational-adapter driver deps. |
| 5 | `@beep/github-actions` | Leaf driver. |
| Deferred | npm registry/publish driver, `@beep/sigstore`, `@beep/ink`, `engine` -> `@beep/mcp-kit` | D-05: each with its first consumer (mcpb-kit tarball, a release attestation step, the Accounts TUI, an MCP server ProcessGuard). |

## Adoption steps (after the wave that provides the package)

Ordered by verified removable lines (`research/promotion-map-2026-10-20.md`,
"Reuse sites"): `@beep/memfs` replaces `@beep/test-utils/MemoryFileSystem`;
the tsconfig and package.json models replace repo-utils' schemas;
`@beep/glob` + `@beep/walker` replace `@beep/utils/Glob` and
`@beep/schema/Glob`; `@beep/semver` replaces `@beep/schema/Semver` and the
VersionSync resolvers; `@beep/commands` moves drivers and repo-cli tests off
hand-rolled spawners; `@beep/github` and `@beep/git` take over repo-cli's
GitHub and git helpers; `jsonc-parser`, `yaml`, `toml`, `picomatch` and
`get-tsconfig` drop. Each step records its sites in `history/reuse-ledger.md`.

Ledger changes in wave 2d: the `@effected/github` and "Duplicate directory
traversal" Exception Ledger rows are removed (retired by #1994 and #2016);
the "Duplicate frontmatter splitting and README heading parsing" row is added
for the 2d-A sites and removed again by 2d-A (D-47); `history/reuse-ledger.md` starts with the `@beep/markdown`
sites; and `history/canon-exceptions/README.md` records that all five
markdown canon exceptions are resolved (D-45). In 2d-2 the reuse ledger gains a `@beep/md`
bridge section that closes map sites #237 and #290 and the placement half of
#259; the Exception Ledger is unchanged.

## Inherited failures to fix at promotion

PR #1928 changed `S.optional` to `S.optionalKey` across the lab, and the
scratchpad tests are not part of hosted CI, so these failed on `main` before
wave 1 (attributed on a pristine `426d494b34` checkout, 2026-10-21). Each
promotion restores the upstream optional semantics its tests assert, as
`@beep/commands` did in wave 1.

| Module | Failing on main | Wave |
| --- | --- | --- |
| `github` | `CodeScanning.test.ts` explicit-undefined keys | fixed in 2b-2: `CodeScanningSetup`'s five optional keys are `S.optional` again; the Bun `blakejs` interop failure in `crypto.test.ts` went with the dependency (D-34) |
| `engine` | `ProcessGuard.test.ts` explicit-undefined `onRejection` | deferred |
| `github-actions` | Artifact, BlobStore, DetachedProcess, GitHubToken, twirp, PackageManagerInstaller, sigv4, ToolInstaller option schemas (GitHubMarkdown and ManagedDocument fixed in 3-1, W3-b) | 5 |
| `cli` | CliLog/CliTest property tests, round-3 config and key-input schemas, CliMessage and Status hostile-glyph suites | 4 |

## Execution Notes

- Promotion script: moves `scratchpad/effected/<m>` to `src/` and
  `scratchpad/test/<m>` to `test/`, rewrites sibling imports to package
  names, re-keys `$ScratchpadId` to the package identity, derives manifest
  dependencies from real import statements, and repoints the modules still in
  scratchpad. Run `tsconfig-sync` and `bun install` after it, and build the
  dependency closure before `check` (`identity` dist goes stale when
  `create-package` registers composers).
- Preserve unrelated worktree changes.
- Keep `SPEC.md` normative and update it only when the contract changes.

## Verification Commands

```sh
test "$(wc -m < goals/effected-promotion/GOAL.md)" -le 4000
jq . goals/effected-promotion/ops/manifest.json
git diff --check -- goals/effected-promotion
bun run beep quality package-verify @beep/<package>
bun run beep lint identity-registry
```
