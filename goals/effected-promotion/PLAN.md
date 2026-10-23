# Effected kit promotion Plan

## Status

Status: `active` — P1: wave 1a merged (#1956, eight packages); wave 1b merged (#1981, six packages, D-07 retirement, D-23 shared helpers); wave 2a merged (#1988, `@beep/npm-spec`, `@beep/tsconfig`); wave 2b merged (#1992 `@beep/walker`, #1994 `@beep/github`, #2002 `@beep/runtime-env`); wave 2c merged (#2016, glob adoption, D-37); wave 2d-1 (`@beep/markdown`, D-38..D-46) in review, with 2d-2, 2d-A and 2d-3 queued behind it; wave 3-2 (`@beep/repo-tsconfig`, W3-c, W3-h, W3-k..W3-m) in review, with get-tsconfig dropped from repo-cli and the root catalog.

## Phases

| Phase | Status | Goal | Exit criteria |
| --- | --- | --- | --- |
| P0 Research | complete | Map every module to a package home, sweep the repo for reuse sites, design the `@beep/md` merge. | `research/promotion-map-2026-10-20.md`; decisions D-01..D-18 in `SPEC.md`. |
| P1 Implement | in-progress | Promote the waves, then run the adoption PRs (D-04). | Acceptance criteria in `SPEC.md`. |
| P2 Verify | pending | `package-verify` per package, scratchpad check, identity registry, typos. | Verification matrix green. |
| P3 Yeet: PR to mergeable | pending | One PR per wave and per adoption step, each driven to mergeable. | Each PR merge-ready; zero unresolved threads. |
| P4 Close | pending | Closeout reflection and packet flip. | Reflection exists; `proposedCloseout` in the final PR. |

## Waves

| Wave | Packages | Notes |
| --- | --- | --- |
| 1a (merged, #1956) | `@beep/spdx`, `@beep/schema-org`, `@beep/github-references`, `@beep/github-commands`, `@beep/commands`, `@beep/jsonl`, `@beep/jsonc`, `@beep/semver` | Low-finding packages first (D-19, D-20, D-21); every gate at zero findings, no inventory growth. |
| 1b (merged, #1981) | `@beep/memfs` (+ D-07 retirement of `@beep/test-utils/MemoryFileSystem`), `@beep/managed-section`, `@beep/toml`, `@beep/git`, `@beep/glob`, `@beep/yaml` | Complexity and duplication refactored to zero against the conformance oracles (yaml-test-suite, toml-test, minimatch, node:fs differential suites); shared helpers in `@beep/utils` (D-23); memfs replaces the test-utils copy in 17 packages (D-25). |
| 2a (merged, #1988) | `@beep/npm-spec`, `@beep/tsconfig` | The pure halves of `npm` and `tsconfig-json` (D-26..D-28); `DEFAULT_REGISTRY` moves into `@beep/npm-spec`. The registry/publish half and the tsconfig loaders stay in the lab. |
| 2b-1 (merged, #1992) | `@beep/walker` | D-31, D-32. Adopters: repo-utils `Root` `findRepoRoot`, `TSMorph` `resolveFileEntrypointTsConfig`, `FsUtils` `findNearestPackageDir`; repo-cli `Drawings.review`, `TestTsgoPrograms` (segment-aware containment). Lab importers retargeted to `@beep/walker` leaves. |
| 2b-2 (merged, #1994) | `@beep/github` | Replaces `@effected/github` in repo-cli (one atomic swap, D-34); closes the `@effected/github` Exception Ledger row. Merges after 2b-1 (shared identity, catalog, `bun.lock` and `PROMOTED`-map files). |
| 2b-3 (merged, #2002) | `@beep/runtime-env` | Lands with the `@beep/chalk` and `@beep/colors` delegation (D-14 as amended by D-33, colour precedence; D-36 conformance shifts). repo-cli EnvConfig is not adopted: its exact `CI === "true"` differs from `RuntimeEnv.ci` (Exception Ledger "Duplicate CI detection", removal with cli-kit in wave 4). Last in 2b: the only PR with intended CI-visible behaviour changes (plain `@beep/colors` output in Actions logs, D-33 option (a)). |
| 2c (merged, #2016) | glob adoption (no new package) | D-37. Needs 2b-1. Retires `@beep/utils/Glob`, `@beep/schema/Glob` and `FsUtils.walkFiles`/`globFiles` onto `@beep/glob` + `@beep/walker`, and repo-cli `Lint/internal/WorkspaceWalk.ts`; records the Bun `node:fs` glob census. Closes the "Duplicate directory traversal" ledger row and narrows "Duplicate glob matching" to repo-cli `internal/GlobPattern.ts` and the `EffectImports` tinyglobby scan (glob reuse phase). |
| 2d-1 (in review) | `@beep/markdown` | D-38..D-45. Scaffold, rename-only move with the benchmark baseline (D-40), branded `S.Opaque` nodes admitted once per entry point (D-39), conformance lanes to zero findings with string-clean hot loops (D-41, D-42), the core-only codec-free root barrel and M3 MDX leaf (D-43), and the bridge prerequisites `MarkdownNodeKind`, `FrontmatterCodec.decodeResult`, `./conformance/*` and `MarkdownDocument.headingSource` (D-44). Lab importers (github-actions `GitHubMarkdown`, cli tests, reachability and layering maps) retargeted to `@beep/markdown` leaves; the five canon exceptions are cleared (D-45). |
| 2d-2 (queued) | `@beep/md` `Md.syntax`/`Md.parse` | D-02 bridge; contract decided there (D-44). After 2d-1, in parallel with 2d-A. Single `Document.make` per bridge call, import-boundary and export-set test, bridge-corpus ledger, writer differential (measure only), `cache-baseline-request-w2d2` with the turbo coupling measured. |
| 2d-A (queued) | adoption (no new package) | D-46. After 2d-1, in parallel with 2d-2: repo-cli `extractFrontmatter`, the `ChangesetGraph` fence, skill-contract `SkillProjection`, `Goals/Inventory`. Closes the "Duplicate frontmatter splitting and README heading parsing" ledger row. |
| 2d-3 (queued, evidence-gated) | `@beep/md` `Md.render` writer fixes | `&` and `$` escaping, only if the 2d-2 ledger and writer differential show the need; its own changeset. `math` stays off by default in `Md.parse` until it lands. |
| 2d-later | adoption, one PR each | D-46 deferred sites, tracked in `history/reuse-ledger.md`. |
| 3 | `@beep/package-json`, `@beep/lockfiles`, `@beep/github-reporting`, `@beep/config-file`, `@beep/repo-tsconfig` | `repo-tsconfig` replaces `get-tsconfig`; `config-file` lands with docgen and the repo-cli Models store as importers. |
| 3-2 (in review) | `@beep/repo-tsconfig` | W3-c, W3-h, W3-k..W3-m. The lab `tsconfig-json` folder is fully promoted and gone. Realpathed package targets, `.json` siblings of `.ts`/`.js` export targets, and the three-way differential (`ops/repo-tsconfig-differential.ts`; corpus A 0 adopter-field diffs on 667 configs, corpus B loader == tsc on 666). Adopters: EffectDiagnostics (2 sites, the check-program test) and TestTypecheckCoverage; get-tsconfig leaves repo-cli and the root catalog. The `TsconfigValidator` and docgen move is 3-A6. |
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
for the 2d-A sites; `history/reuse-ledger.md` starts with the `@beep/markdown`
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
| `github-actions` | Artifact, BlobStore, DetachedProcess, GitHubMarkdown, GitHubToken, twirp, ManagedDocument, PackageManagerInstaller, sigv4, ToolInstaller option schemas | 5 |
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
