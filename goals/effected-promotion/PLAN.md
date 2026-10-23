# Effected kit promotion Plan

## Status

Status: `active` — P1: wave 1a merged (#1956, eight packages); wave 1b merged (#1981, six packages, D-07 retirement, D-23 shared helpers); wave 2a merged (#1988, `@beep/npm-spec`, `@beep/tsconfig`); wave 2b merged (#1992 `@beep/walker`, #1994 `@beep/github`, #2002 `@beep/runtime-env`); wave 2c merged (#2016, glob adoption, D-37); wave 2d-1 merged (#2102, `@beep/markdown`, D-38..D-46); 2d-A merged (#2114, D-47); 2d-2 in review, with 2d-3 queued behind it; wave 3 (`research/wave-3-plan-2026-10-23.md`, W3-a..W3-n): 3-Y merged (#2116, W3-d), 3-1 merged (#2122, `@beep/github-reporting`, W3-b), 3-3 (`@beep/config-file`, W3-e) in review in this PR, 3-2 (#2129), 3-4 (#2126) and 3-5 in parallel lanes, 3-A1..3-A9 queued.

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
| 2d-2 (queued) | `@beep/md` `Md.syntax`/`Md.parse` | D-02 bridge; contract decided there (D-44). After 2d-1, in parallel with 2d-A. Single `Document.make` per bridge call, import-boundary and export-set test, bridge-corpus ledger, writer differential (measure only), `cache-baseline-request-w2d2` with the turbo coupling measured. |
| 2d-A (merged, #2114) | adoption (no new package) | D-46, D-47. After 2d-1, in parallel with 2d-2: repo-cli `extractFrontmatter` (file deleted), the `ChangesetGraph` fence, skill-contract `SkillProjection` (import-closure pins keep the block parser out), `Goals/Inventory` through `MarkdownDocument` and `headingSource`. Parity over the committed corpus with every intended shift pinned (D-47). Closes the "Duplicate frontmatter splitting and README heading parsing" ledger row. |
| 2d-3 (queued, evidence-gated) | `@beep/md` `Md.render` writer fixes | `&` and `$` escaping, only if the 2d-2 ledger and writer differential show the need; its own changeset. `math` stays off by default in `Md.parse` until it lands. |
| 2d-later | adoption, one PR each | D-46 deferred sites, tracked in `history/reuse-ledger.md`. |
| 3-1 (merged, #2122) | `@beep/github-reporting` | W3-b, W3-h, W3-i. The `github-actions` reporting suite (`CheckState`, `ManagedDocument`, `CheckDocument` on the root; `GitHubMarkdown` subpath-only) with branded `S.Opaque` records admitted once per read, managed-section leaf imports, the #1928 optionals restored, `markerLine`, the micromark GFM differential (in package and `ops/github-reporting-gfm-differential.ts`) and the growth guard. Lab retargets only: github-actions `index.ts`, `package.json`, `Exports.test.ts`, `reachability.test.ts`, both PROMOTED maps, README/KNOWLEDGE prose. |
| 3-2 (queued) | `@beep/repo-tsconfig` + the `get-tsconfig` drop | W3-c. Adopters: repo-cli `EffectDiagnostics.ts` (2 sites), `test-tsgo-turbo-inputs.test.ts`, `TestTypecheckCoverage.ts`; the root catalog; the runbook line; plus the realpath fix. From main; serializes with 3-3 on the repo-cli manifest. |
| 3-Y (merged, #2116) | `@beep/yaml` continuation fix | W3-d. No adopters. From main; parallel with all. Repro tests, an oracle property, yaml-test-suite at zero failures, the lockfiles suite re-run. |
| 3-3 (in review, this PR) | `@beep/config-file` | W3-e, W3-h (3-3). Adopters: docgen `Configuration.ts` `readJsoncFile` (docgen drops `jsonc-parser`), repo-cli `Models.manifest.service.ts` `load`; lab xdg and cli (the lab cli renderer no longer imports the package). Codec-corpus conformance suite and `ops/config-file-codec-differential.ts`; coverage 100/100/100/100. Cut after 3-Y merged; serializes with 3-2 on the repo-cli manifest. |
| 3-4 (queued) | `@beep/package-json` | W3-f. Lab adopters only (sbom re-export dropped, workspaces, both PROMOTED maps). From main; 3-5 takes main first on `WorkspacePackage.ts`. |
| 3-5 (queued) | `@beep/lockfiles` | W3-g. Lab adopters only (workspaces, both PROMOTED maps). From main; 3-4 takes main first on `WorkspacePackage.ts`. |
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
markdown canon exceptions are resolved (D-45).

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
