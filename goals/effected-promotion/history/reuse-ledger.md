# Reuse ledger

Reuse sites from `research/promotion-map-2026-10-20.md` ("Reuse sites") and
the wave plans, with their adoption status. `#n` is the map's site id. A site
leaves the open list in the PR that migrates it, or carries its reason here.

## `@beep/lockfiles` (wave 3-5, W3-g)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| lab `scratchpad/effected/workspaces` (`LockfileReader`, `PeerCheck`, `DuplicateCheck`, `WorkspaceCatalogs`, `WorkspaceSnapshots`, `WorkspacePackage`, internal roots and importer versions, their tests) and both PROMOTED maps | - | 3-5 | Retargeted in the promotion PR to `@beep/lockfiles` leaves; the module itself promotes as `@beep/repo-workspaces` in a later wave. |
| repo-cli `Quality/CatalogUsage.ts` `readLockfilePackages` (bun.lock key and specifier splitting) | #233, #129 (lockfile part), #156 | 3-A1 | `Lockfile.parse({ format: "bun" })` and `ResolvedPackage.installName`; the catalog-specifier half is npm-spec's `DependencySpecifier`. Exception Ledger "Duplicate lockfile readers". |
| repo-cli `VersionSync/internal/resolvers/RootCatalog.ts` `BunLockDocument` and `readLockfileResolvedVersion` | #131, #155, #269, #289 | 3-A1 (bun.lock half) | Filter `isWorkspace` to keep the legacy `None`; 2,403-name and 2,211-version live parity. The package.json half is 3-A4. |
| mcpb-kit `internal/steps.ts` `ensureWindowsBindings` | #136 | excluded | Needs the npm driver's tarball download and integrity check, deferred with it; the lockfile pin read alone does not justify the edge. |

## `@beep/config-file` (wave 3, sub-wave 3-3, SPEC W3-e)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| docgen `Configuration.ts` `readJsoncFile` (package.json and docgen.json) | #166 | adopted in 3-3 | `ConfigFile.read` + `JsoncCodec`; docgen drops `jsonc-parser`. Parity: the 364 tracked package.json and docgen*.json files decode the same through the old reader (`ops/config-file-codec-differential.ts`, docgen-inputs lane). A malformed `docgen.json` now fails typed (test). |
| repo-cli `Models/Models.manifest.service.ts` `load` | #165 | adopted in 3-3 | `ConfigFile.read` + `YamlCodec`; the writers keep the npm `yaml` stringifier and the atomic rename. Parity with the old reader for the five manifest fixtures, a writer round trip for them and the seed, and a typed syntax-error case (`test/models-manifest-config-file.test.ts`). |
| lab `xdg` `XdgConfig` | - | adopted in 3-3 | Imports `@beep/config-file` (`ConfigResolver` type); promoted with xdg in wave 4. |
| lab `cli` `ConfigIssueRenderer` | - | adopted in 3-3 | Takes the structural `{ readonly issue }` and no longer imports the package (promotion map row "cli-kit -> config-file"). |
| `Struct.deepMerge` and jsonl `internal/merge.ts` | - | excluded | Different merge semantics from config-file's `deepMerge`, which stays in the package. |
| docgen `readTSConfig` and the `@beep/schema/Jsonc` consumers | - | excluded here | `readTSConfig` moves with the `TsconfigValidator` in 3-A6; the `@beep/schema/Jsonc` consumers belong to the jsonc adoption (Exception Ledger "Duplicate JSONC model"). |
## `@beep/github-reporting` (wave 3-1, W3-b)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| lab `scratchpad/effected/github-actions` (index re-exports, `Exports.test.ts`, reachability and layering maps) | - | 3-1 | Retargeted in the promotion PR; no lab module imports the suite any more. |
| repo-cli `Ci/RunnerLossRerun.ts` markdown table | - | 3-A8, optional | `GitHubMarkdown.table`; fixes its unescaped `\|` cells. |
| repo-cli `Ci/CiOperational.service.ts` markdown table | - | 3-A8, optional | `GitHubMarkdown.table`. |
| repo-cli `LaneTimings` and `Ci.command` tables | - | excluded | Need column alignment, which the writer does not offer. |
| repo-cli Reviewer and CI summary bodies | - | deferred | Named by D-10; adopt with the wave-5 GitHub Actions driver, which composes `CheckDocument` with a real sink. |
| Marker-splice family (Provenance, GhOps, Quality, Findings.refresh, Atlas, Observability, Models) | - | excluded | File-backed managed sections go to `@beep/managed-section` directly, not through `ManagedDocument`'s comment dialect. |
| `@beep/markdown` `YamlFrontmatter` and `JsonFrontmatter` key strictness | - | resolved (#2138, D-53) | The codecs reject complex and `!!set` yaml keys and duplicate json keys with `FrontmatterKeyError`. `@beep/jsonc` has no duplicate-key detection to reuse, so the codec walks `Jsonc.parseTreeResult`. |

## `@beep/markdown` (wave 2d, SPEC D-46)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| repo-cli `internal/schema/Frontmatter.ts` `extractFrontmatter` (callers `ReflectionArtifact.ts`, `SkillFrontmatterCheck.ts`) | #37 | adopted (2d-A, D-47) | `FrontmatterSource.split`; delete the file and the `SharedInternals.test-kit.ts` re-export. Parity 509 of 510 (the miss is a `---json` skill the old code read as YAML). |
| repo-cli `Quality/ChangesetGraph.ts` frontmatter fence | #27, #276 (fence part) | adopted (2d-A, D-47) | `FrontmatterSource.split`; the YAML and schema block stays. Parity 912 of 1,044; the other 132 are empty blocks with no references either way. |
| skill-contract `SkillProjection.ts` `---json` splitter | #231 | adopted (2d-A, D-47) | `FrontmatterSource.split` with format `json`, plus an import-closure assertion that the block parser stays out. |
| repo-cli `Goals/Inventory.ts` README regexes | #287 | adopted (2d-A, D-47) | `MarkdownDocument.parseResult` with `firstSection`, `sectionByHeading` and `headingSource` (root-level H1, D-47); pin the `---json`, `<Goal Title>` and list-interrupt shifts. |
| repo-cli DeletePackage `stripPackageFromFrontmatter` | #276 | queued: R5a | Split, `YamlFormat.modifyToString`, join. The substring bug was fixed independently in #2020. |
| ReflectionArtifact and SkillFrontmatterCheck typed frontmatter | #37 | queued: R5a | `MarkdownFrontmatter.schema` with `YamlFrontmatter`; verdict parity over 302 reflections and 44 skills. |
| docgen `@effect/markdown-toc` | #292 | queued: R5b | Needs a GitHub slugger and a TOC renderer; drops the npm dependency. |
| effect-drizzle `scripts/assemble-readme.ts` | - | queued: R5b | After the TOC helper; `@beep/markdown` as a devDependency only (ecosystem polarity). |
| docgen `fencePattern` and its consumers, EffectImports, SchemaTagIdioms | #282 | queued: R6 (or deferred per W4-q) | Needs code-node spans and an unterminated-fence diagnostic; zero JSDoc-ratchet drift. |
| repo-cli Knowledge.refs, KnowledgeDoctor, RoadmapRefs | #232 | excluded (W4-r) | Behind a perf budget: a full parse costs about 400 times the line split. Prefilter fence-bearing files and re-benchmark. |
| repo-cli KnowledgeDoctor `beep-historical` frontmatter | - | queued: R5a | `FrontmatterSource`. |
| runpod `RunpodDocs.service.ts` | #301 | excluded | Needs a fixture first. |
| micromark oracle | #236 | excluded | A circular check. |
| `@beep/schema` Markdown | #227, #258 | excluded | MQ7 cycle; deleting `MarkdownTextToHtml` is a separate cleanup. |
| OnboardingSkill | #286 | excluded | Four lines in an app; not worth the dependency. |
| Research Vault `renderCard` | #31 | excluded | Write-only. |
| LLM JSON-fence extractors, Lexical code fence, rdf MdSections | - | excluded | Excluded by the wave 2d adopter census. |
| Marker-splice family (Provenance, GhOps, Quality, Findings.refresh, Atlas, Observability, Models) | - | excluded | Goes to `@beep/managed-section`, not a second owner in `@beep/markdown`. |

## `@beep/package-json` (wave 3-4, plan decision W3-f)

3-4 moves only the lab importers (sbom, workspaces). Every repo adopter waits for its adoption PR, in the order of the
wave-3 file-contention table. Writes to repo manifests go only through `PackageJsonFile.modify` /
`PackageJsonFormat.modifyToString`: the census (`research/package-json-corpus-baseline-w3.json`) shows the sorted
formatter rewrites 185 of the 186 repo manifests, while a same-value `modifyToString` is byte-identical for all 186.

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| lab `sbom` `index.ts` re-export of `Package`, `Person`, `Repository` | - | 3-4 (done) | Dropped; `SbomMetadataSource` imports the types from `@beep/package-json`, and the sbom reachability test pins no runtime edge. |
| lab `workspaces` `WorkspacePackage.ts`, `PackageManagerName.ts` | - | 3-4 (done) | Import `@beep/package-json`. |
| `DevEngine.onFail` `download`, plus the generic npm/bun fields repo-utils models today | #243 | 3-A2 | Field growth in the kit, verified against the npm docs. |
| repo-utils `schemas/PackageJson.ts` (2,111 lines), `DocgenConfig.ts`, `WorkspaceDeps.ts` | #127, #243, #267, #47 | 3-A3 | Re-based on `PackageManifest.extend`; repo-utils keeps the beep metadata, the closed `rest` refinement and JSON Schema emission (D-08 by field ownership). 184-manifest verdict parity. |
| repo-utils `schemas/PackageJsonTools.ts` canonical order | #128 | 3-A3 | Keeps its own repo key order (beep after repository, publishConfig sub-order); the kit's `KEY_ORDER` has no override hook and is never the adopter path. |
| repo-cli Quality readers: ChangesetGraph, ChangesetStatus, PackageVerify, QualityArtifactSupport, Quality.schemas, Tasks, CatalogUsage.schemas, PackageTestTypecheck, EffectSchemaInventoryModules | #134, #135, #130, #143, #277 | 3-A4 | `LenientManifest` or `PackageManifest` per site tier; 184-manifest verdict parity. |
| repo-cli VersionSync `BunResolver`, `RootCatalog` (package.json half), `PackageJsonUpdater` | #132, #131, #133 | 3-A4 | `PackageManager.FromString`; the updaters become `PackageJsonFile.modify`. `RootCatalog`'s bun.lock half is 3-A1's. |
| docgen `Version.ts`, `Configuration.ts:393` `PackageJsonSchema` | #307 | 3-A4 | After 3-3 changes the same file. |
| observability `catalog/Catalog.names.ts` `PackageName` | #137 | adopted in 3-A9 | `ScopedPackageName`, re-annotated as the catalog owner name; the hand-rolled pattern and brand are gone. Parity: the old pattern and the new schema agree on all 2,407 distinct names in the tracked manifests and the root `bun.lock` (`ops/observability-package-name-parity.ts`, `research/observability-package-name-parity-3-a9.json`). npm-rule divergences (leading `-` in scope or name accepted, over 214 characters rejected) are pinned by inverted tests in `observability/test/Catalog.test.ts`. |
| mcpb-kit manifests and `ensureWindowsBindings` | #136 | excluded | Deferred to the npm driver. |
| m365-mcp and github test-only readers | - | excluded | Test fixtures; not worth the edge. |

## `@beep/repo-tsconfig` (wave 3-2, SPEC W3-c)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| repo-cli `Quality/EffectDiagnostics.ts` `buildProjects` and `effectDiagnosticsProjectConfig` (get-tsconfig `parseTsconfig`) | #158 | adopted (3-2) | `TsconfigLoader.resolve` / `.compilerOptions`; the local `EffectiveProjectConfig` schema is deleted. Inventory and every lspconfig string identical before and after. |
| repo-cli `test/test-tsgo-turbo-inputs.test.ts` build-reference walk | #158 | adopted (3-2) | `TsconfigLoader.resolve`. |
| repo-cli `internal/quality/TestTypecheckCoverage.ts` hand-rolled extends walk | #159 | adopted (3-2) | One tolerant `TsconfigLoader.resolve` per visited config (W3-m). Every package's uncovered set identical before and after. |
| repo-cli `Quality/CheckCensus.ts` `TsconfigReferences`, `TsconfigOutDir` | #162 | 3-A5 | `TsconfigLoader.compilerOptions(ref)` gives the inherited, absolutized `outDir`; prove census output parity. |
| docgen `Configuration.ts` `readTSConfig`, `CLI.ts`, `Core.ts` | #160 | 3-A6 | `TsconfigLoader.compilerOptions` plus `TsconfigValidator`; after 3-3 and 3-A4 (shared `Configuration.ts`). |
| repo-utils `src/schemas/TSConfig.ts` and its test | #161, #242, #266 | 3-A6 | Deleted once docgen uses the validator; needs the `@beep/tsconfig` closed view and its changeset. |
| repo-cli `TsconfigSync/TsconfigSync.schemas.ts` | #164 | 3-A7 | A pure-model site (`@beep/tsconfig`); needs byte parity of tsconfig-sync output. |
| repo-cli `Quality.command.ts` `resolveTsconfigInheritance` | #163 | excluded | A pure resolver over a pre-read map with branch semantics and exact diagnostics; the map ruled it partial. |
| repo-utils `src/TsConfig.ts` `collectTsConfigPaths` | #245 | excluded | Downward enumeration, a different capability. |
| repo-cli `KnowledgeDoctor.domain.ts` root `paths` projection | - | candidate | Re-check with 3-A5. |

## `@beep/md` syntax bridge (wave 2d-2, SPEC D-48 to D-51)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| `@beep/md` `Md.model.ts`: no Markdown source parser | #237 | resolved in 2d-2 | `@beep/md/Md.syntax` `fromMarkdownDocument` folds the `@beep/markdown` tree into `Md.Document`; the unsupported-node policy is the `MdLossReason` taxonomy (D-48). `@beep/markdown` has no `@beep/md` import. |
| `@beep/md` `Md.ts`: write-side DSL with no parser | #290 | resolved in 2d-2 | Merged into #237: `@beep/md/Md.parse` parses text. `@beep/schema`'s Markdown-to-HTML path stays (excluded with #227 and #258, MQ7 cycle). |
| `@beep/md` merge design and hand-rolled frontmatter splitting | #259 | partly resolved in 2d-2 | Placement decided (D-02: parser in `@beep/markdown`, bridge in `@beep/md`) and the unsupported-node policy written (D-48). The frontmatter splitters are the 2d-A sites #37, #27, #276 and #231 above. |

## Backfill of the remaining map sites (R0, W4-k)

Every confirmed and partial site of the map that had no row above (the earlier `2d-later` rows now carry their plan PR or exclusion too), so each one is migrated, queued under a
PR id of the wave-4 plan's PR sequence (`research/wave-4-plan-2026-10-23.md`), or excluded with a reason. Each
PR flips its own rows. Rows whose status the plan does not name were assigned from the map's prerequisite column.
200 rows: 25 migrated, 94 queued on a plan PR,
33 handed to the W4-l follow-up goal, 4 deferred with their module (W4-m) and 44 excluded.
A row naming two PRs is split between them; #143 also appears above for its package.json half.

### Migrated in waves 1b to 2c

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| test-utils `MemoryFileSystem` engine | #214 | partial | migrated (1b, D-07, D-25) | `@beep/test-utils/MemoryFileSystem` is retired; the engine is `@beep/memfs`. |
| test-utils test MemoryFileSystem | #215 | partial | migrated (1b, D-07, D-25) | The vendored engine suites left with the engine; memfs carries the conformance suites. |
| repo-cli test | #216 | partial | migrated (1b, D-25) | Imports `@beep/memfs` (one of the 17 packages D-25 moved). |
| repo-utils test | #217 | partial | migrated (1b, D-25) | Imports `@beep/memfs` (one of the 17 packages D-25 moved). |
| repo-utils | #309 | partial | migrated (2b-1); 4-A3 | Walker half done (`findRepoRoot`); the workspaces half is 4-A3's. |
| repo-utils FsUtils.ts | #54 | partial | migrated (2b-1, D-31) | `findNearestPackageDir` on `@beep/walker`; `walkFiles`/`globFiles` retired in 2c (D-37). |
| repo-utils Root.ts | #55 | confirmed | migrated (2b-1, D-31) | `findRepoRoot` on `Walker.ascend`/`findUpward`, signature and `NoSuchFileError` kept. |
| repo-utils TSMorph/TSMorph.service.ts | #56 | confirmed | migrated (2b-1, D-31) | `resolveFileEntrypointTsConfig` on `Walker.ascend`. |
| repo-cli Quality/internal/TestTsgoPrograms.ts | #63 | partial | migrated (2b-1, D-31) | Segment-aware containment on `Walker.findUpward`. |
| repo-cli Drawings/Drawings.review.ts | #64 | confirmed | migrated (2b-1, D-31) | `Drawings.review` on `@beep/walker`. |
| repo-utils Root.ts, FsUtils.ts (findNearestPackageDir) | #265 | partial | migrated (2b-1, D-31) | `findRepoRoot` on `Walker.ascend`/`findUpward`, signature and `NoSuchFileError` kept. |
| repo-cli package.json | #72 | partial | migrated (2b-2, D-34) | `@beep/github` replaced `@effected/github` in one atomic swap. |
| repo-cli internal/github | #73 | confirmed | migrated (2b-2, D-34) | `@beep/github` replaced `@effected/github` in one atomic swap. |
| root package.json | #225 | confirmed | migrated (2b-2, D-34) | `@effected/github` left the root catalog and `bun.lock`. |
| repo-cli internal/github/GithubRest.ts, GithubGraphql.ts and siblings | #246 | confirmed | migrated (2b-2, D-34) | `@beep/github` replaced `@effected/github` in one atomic swap. |
| chalk internal/SupportsColor.ts | #190 | partial | migrated (2b-3, D-33) | chalk `SupportsColor` reads `@beep/runtime-env/ColorLevel`; colour precedence per D-33. |
| chalk internal/SupportsColor.ts, colors support | #273 | partial | migrated (2b-3, D-33) | chalk `SupportsColor` reads `@beep/runtime-env/ColorLevel`; colour precedence per D-33. |
| utils Glob.ts | #52 | partial | migrated (2c, D-37) | `@beep/utils/Glob` retired onto `@beep/glob` + `@beep/walker`. |
| utils package.json | #53 | confirmed | migrated (2c, D-37) | The utils glob dependency left with `Glob.ts`. |
| schema Glob/Glob.schema.ts | #58 | partial | migrated (2c, D-37) | `@beep/schema/Glob` retired. |
| utils Glob.ts | #228 | partial | migrated (2c, D-37) | `@beep/utils/Glob` retired onto `@beep/glob` + `@beep/walker`. |
| utils Glob.ts | #241 | partial | migrated (2c, D-37) | `@beep/utils/Glob` retired onto `@beep/glob` + `@beep/walker`. |
| utils Glob.ts, schema Glob | #264 | partial | migrated (2c, D-37) | `@beep/utils/Glob` retired onto `@beep/glob` + `@beep/walker`. |
| utils Glob.ts | #280 | partial | migrated (2c, D-37) | `@beep/utils/Glob` retired onto `@beep/glob` + `@beep/walker`. |

### Wave 3 adoptions (3-3, 3-A1)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| docgen Configuration.ts | #11 | confirmed | migrated (3-3, W3-e) | docgen `readJsoncFile` onto `ConfigFile.read`. |
| repo-cli Quality/CatalogUsage.ts | #129 | partial | queued: 3-A1 | `CatalogUsage` onto `@beep/lockfiles` with `ResolvedPackage.installName`. |
| repo-cli VersionSync/internal/resolvers/RootCatalog.ts | #155 | partial | queued: 3-A1 | `RootCatalog` bun.lock half onto `Lockfile.parse`; no `CatalogSet` for one catalog. |
| repo-cli Quality/CatalogUsage.ts | #156 | partial | queued: 3-A1 | `CatalogUsage` onto `@beep/lockfiles` with `ResolvedPackage.installName`. |
| repo-cli Quality/CatalogUsage.ts | #233 | partial | queued: 3-A1 | `CatalogUsage` onto `@beep/lockfiles` with `ResolvedPackage.installName`. |
| repo-cli VersionSync/internal/resolvers/RootCatalog.ts | #289 | partial | queued: 3-A1 | `RootCatalog` bun.lock half onto `Lockfile.parse`; no `CatalogSet` for one catalog. |
| repo-cli VersionSync/internal/resolvers/RootCatalog.ts | #269 | partial | queued: 3-A1; R1 | Lockfile half with 3-A1, Docker semver half with R1 (#43); counted there. |

### Wave 4 promotions and adoptions (4-X, 4-X-A, 4-C, 4-C-A, 4-A1 to 4-A4)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| repo-cli Quality/internal/QualityArtifactSupport.ts | #143 | partial | queued: 4-A1 | Workspaces half: QAS discovery onto `WorkspaceDiscovery`, discovery only, `resolvePathWithinRoot` post-filter (the package.json half is 3-A4's row above). |
| repo-cli Quality/Tasks.ts | #146 | partial | queued: 4-A2 | Tasks pattern reader; `coverageGraphClosure` needs a name-keyed adjacency constructor. |
| repo-cli CreatePackage/CreatePackage.command.ts | #148 | partial | queued: 4-A2 | Pattern reader through the public `WorkspacePatterns` leaf. |
| repo-cli TsconfigSync/TsconfigSync.plan.ts | #149 | partial | queued: 4-A2 | Pattern reader through the public `WorkspacePatterns` leaf. |
| repo-cli Quality/ChangesetGraph.ts | #150 | partial | queued: 4-A2 | Pattern reader through the public `WorkspacePatterns` leaf. |
| repo-utils Workspaces.ts | #139 | partial | queued: 4-A3 | repo-utils Workspaces/Dependencies/DependencyIndex onto the kit. |
| repo-utils DependencyIndex.ts | #142 | partial | queued: 4-A3 | repo-utils Workspaces/Dependencies/DependencyIndex onto the kit. |
| repo-utils Workspaces.ts | #238 | partial | queued: 4-A3 | repo-utils Workspaces/Dependencies/DependencyIndex onto the kit. |
| repo-utils Dependencies.ts | #239 | partial | queued: 4-A3 | repo-utils Workspaces/Dependencies/DependencyIndex onto the kit. |
| repo-utils Workspaces.ts, Dependencies.ts, Graph.ts | #268 | partial | queued: 4-A3 | Umbrella of #238, #239 and #240; `Graph.ts` is not retargeted. Counted there. |
| repo-cli Lint/EcosystemPolarity.ts | #154 | partial | queued: 4-A4 | `EcosystemPolarity` onto `SourceBoundary.scan` from `@beep/repo-workspaces/testing`. |
| ai-metrics agent-effectiveness.ts | #197 | partial | queued: 4-C | `Fmt.stripControls` (W4-d) replaces the private sanitizer. |
| repo-cli Accounts/Accounts.view.ts | #205 | partial | queued: 4-C | `fit`/`fitRight` onto `Fmt.truncate`/`Fmt.width`, pinned by a CJK and emoji row (A4). |
| repo-cli bin-main.ts | #199 | partial | queued: 4-C-A | `CliRuntime.main` in `bin-main.ts`/`FailureRendering.ts`, EPIPE latching kept (L1). |
| repo-cli internal/cli/FailureRendering.ts | #200 | partial | queued: 4-C-A | `CliRuntime.main` in `bin-main.ts`/`FailureRendering.ts`, EPIPE latching kept (L1). |
| repo-cli Skills/SkillsReview.service.ts | #209 | partial | queued: 4-C-A | `CliPrompt.gateTerminal` in SkillsReview (L2). |
| repo-cli test session-continuity.test.ts | #210 | partial | queued: 4-C-A | One `TestTerminal` swap in `accounts-usage.test.ts`; the session-continuity stubs stay (they fail on unexpected input as an assertion). |
| repo-cli internal/state/WorkstationState.ts | #167 | partial | queued: 4-X | `resolveWorkstationStateDir` onto `@beep/xdg` (W4-c named importer). |
| m365-mcp OutboxConfig.ts | #180 | partial | queued: 4-X | `OutboxConfig` `stateRoot` onto `@beep/xdg` (W4-c named importer). |
| ai-metrics forwarder.ts | #176 | partial | queued: 4-X-A | ai-metrics `forwarder.ts`/`data-root.ts` onto `@beep/xdg`. |
| repo-cli Files/internal/MatchPerson.ts | #178 | partial | queued: 4-X-A | `MatchPerson` cache root after the `--cache-dir` branch; Windows branch kept. |
| apps | #310 | partial | queued: 4-X-A | apps docket-intake and practice-m365-contacts; practice-mail-tagging excluded (#183). |
| repo-cli internal/state/WorkstationState.ts, BeepCacheRoot | #261 | partial | queued: 4-X; 4-X-A | `WorkstationState` in 4-X; `BeepCacheRoot` and the Config-combinator sites in 4-X-A. |

### Roadmap PRs (R1 to R10)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| schema Semver.ts | #41 | confirmed | queued: R1 | Delete `@beep/schema/Semver` (closes the Duplicate semver model row). |
| repo-cli VersionSync/internal/resolvers/BunResolver.ts | #42 | confirmed | queued: R1 | BunResolver `BunSemver` onto `@beep/semver` (strip a leading `v` first). |
| repo-cli VersionSync/internal/resolvers/DockerResolver.ts | #43 | partial | queued: R1 | DockerResolver `semverCompare` onto `SemVer.Order`. |
| repo-configs cache/Cache.policy.ts | #46 | confirmed | queued: R1 | `Cache.policy.ts` version pin onto `SemVer.PinnableVersionString`. |
| repo-cli VersionSync/internal/resolvers | #308 | partial | queued: R1 | BunResolver `BunSemver` onto `@beep/semver` (strip a leading `v` first). |
| repo-cli Skills/internal/MergeBase.ts | #103 | partial | queued: R10 | `readAtMergeBase` over `Git.mergeBase` + `Git.show`. |
| repo-cli internal/repo-run/GitWorktree.ts | #104 | partial | queued: R10 | Worktree list and remove onto `@beep/git`; prune stays a single capture call. |
| repo-cli Yeet/internal/ProvenanceFooter.ts | #108 | partial | queued: R10 | Config reads onto `Git.configGet`/`Git.remoteUrl`. |
| repo-cli internal/repo-run/GitExec.ts | #100 | partial | queued: R10; follow-up goal (W4-l) | R10 deletes the dead `GitExec.ts` collectors; the parsers wait for kit gaps (follow-up goal). |
| vitest.setup.ts | #60 | partial | queued: R2a | `GlobShim` matches through `@beep/glob`; the shim class stays (W4-p). |
| root package.json | #234 | partial | queued: R2a | `toml` and its `Bun.TOML` shim leave the root. |
| root package.json | #235 | partial | queued: R2a | `picomatch` and `@types/picomatch` leave the root. |
| repo-cli internal/GlobPattern.ts | #57 | partial | queued: R2b | `internal/GlobPattern.ts` onto `@beep/glob`; TestTypecheckCoverage's tsc matcher stays. |
| repo-cli Laws/EffectImports.ts | #59 | partial | queued: R2b | `tinyglobby` out of `EffectImports.ts` (closes Duplicate glob matching). |
| repo-cli internal/GlobPattern.ts, internal/quality/TestTypecheckCoverage.ts | #263 | partial | queued: R2b | `internal/GlobPattern.ts` onto `@beep/glob`; TestTypecheckCoverage's tsc matcher stays. |
| repo-cli internal/GlobPattern.ts | #305 | partial | queued: R2b | `internal/GlobPattern.ts` onto `@beep/glob`; TestTypecheckCoverage's tsc matcher stays. |
| schema Jsonc.ts | #1 | confirmed | queued: R3a | Importers re-point to `@beep/jsonc`; `schema/src/Jsonc.ts` is deleted (W4-o). |
| schema Jsonc.ts and the repo-cli jsonc facade | #255 | partial | queued: R3a; R3b | Owner switch in R3a, `jsonc-parser` drop in R3b. |
| repo-cli internal/cli/Jsonc.ts | #2 | partial | queued: R3b | `internal/cli/Jsonc.ts` stays a sync facade without the `decodeJsoncTextAs` re-export (W4-o). |
| repo-cli internal/cli/Json.ts | #3 | partial | queued: R3b | The five Skills `format`+`applyEdits` copies collapse onto `JsoncFormatter` behind `Json.ts`. |
| repo-cli Skills/Skills.render.ts | #4 | partial | queued: R3b | The five Skills `format`+`applyEdits` copies collapse onto `JsoncFormatter` behind `Json.ts`. |
| repo-cli Models | #5 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli Knowledge/Knowledge.refs.ts | #6 | confirmed | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli Lint/Lint.command.ts | #7 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli Quality | #8 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli Laws/AllowlistCheck.ts | #9 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-configs internal/laws/EffectLawsAllowlist | #10 | confirmed | queued: R3b | repo-configs `EffectLawsAllowlist` onto `Jsonc.JsoncFromString`. |
| repo-cli test | #12 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| root package.json | #13 | partial | queued: R3b | Root catalog entry and devDependency removed last. |
| repo-cli | #226 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli | #274 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli Skills/ | #284 | partial | queued: R3b | The five Skills `format`+`applyEdits` copies collapse onto `JsoncFormatter` behind `Json.ts`. |
| repo-cli src | #306 | partial | queued: R3b | Part of the repo-cli-wide `jsonc-parser` removal. |
| repo-cli VersionSync/internal/updaters/YamlFileUpdater.ts | #24 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli Quality/FallowQuality.command.ts | #26 | confirmed | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli Models/Models.manifest.service.ts | #28 | partial | queued: R4 | Stringify half; `load` is 3-3's. |
| repo-cli Models/Models.locator.service.ts | #29 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli Runners/Runners.service.ts | #30 | confirmed | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| ai-metrics compose.ts | #32 | confirmed | queued: R4 | ai-metrics `compose.ts`, its only `yaml` importer. |
| repo-cli package.json | #33 | partial | queued: R4 | The repo-cli `yaml` dependency drops after every src and test site moves. |
| repo-cli test ci-runner-security.test.ts | #34 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli test ci-lane.test.ts | #35 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli test ci-rerun-runner-loss.test.ts | #36 | confirmed | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli | #229 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli Quality/FallowQuality.command.ts, Models and other yaml sites | #256 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| repo-cli | #285 | partial | queued: R4 | `yaml` out of repo-cli (Runners onto `effect/encoding/Yaml`; Models.locator kept with a reason if the kit lacks a visitor). |
| ai-metrics | #304 | partial | queued: R4; follow-up goal (W4-l) | The yaml half is R4's (#32); the git half goes with the gh/git follow-up goal. |
| effect-drizzle scripts/assemble-readme.ts | #92 | confirmed | queued: R5b | effect-drizzle README script after the TOC helper, `@beep/markdown` as a devDependency only. |
| repo-cli Explore/Atlas.ts | #89 | partial | queued: R8 | Explore Atlas onto `@beep/managed-section` with byte-identical round trips. |
| repo-cli Observability/Observability.render.ts | #90 | partial | queued: R8 | Observability render onto `@beep/managed-section`. |
| repo-cli Models/Models.render.ts, Observability/Observability.render.ts | #260 | partial | queued: R8 | Models.render and Observability splice sites. |
| repo-cli commands | #311 | partial | queued: R8 | Observability half; LabIdentitySegment is excluded (#88). |
| exiftool Exiftool.service.ts | #114 | confirmed | queued: R9 | Driver onto `@beep/commands` `Run.collect`; retires the D-03 Driver-local output folds row. |
| pdf-tools PdfTools.service.ts | #116 | confirmed | queued: R9 | Driver onto `@beep/commands` `Run.collect`; retires the D-03 Driver-local output folds row. |
| drivers tesseract, poppler, exiftool, pdf-tools, onepassword-cli, tailscale, ffmpeg, openclaw | #253 | partial | queued: R9 | Umbrella: R9 moves exiftool, pdf-tools, obs and tailscale; the other drivers are excluded below. |
| drivers | #278 | partial | queued: R9 | Umbrella: R9 moves exiftool, pdf-tools, obs and tailscale; the other drivers are excluded below. |
| tailscale Tailscale.service.ts | #298 | partial | queued: R9 | Driver onto `@beep/commands` `Run.collect`; retires the D-03 Driver-local output folds row. |
| obs Obs.service.ts | #299 | confirmed | queued: R9 | Driver onto `@beep/commands` `Run.collect`; retires the D-03 Driver-local output folds row. |

### Wave 5 (`@beep/github-actions`)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| repo-cli Ci/CiOperational.service.ts | #87 | confirmed | queued: W5 | `WorkflowCommand.warning` with the runner-file migration. |
| repo-cli Ci/CiOperational.service.ts | #93 | partial | queued: W5 | `CiOperational` runner-file writer; key=value outputs pinned by tests and check.yml stay. |
| repo-cli Ci/Ci.command.ts | #94 | partial | queued: W5 | `Ci.command` summary append with a local console fallback. |
| repo-cli Ci/CiAdmission.ts | #95 | partial | queued: W5 | `CiAdmission` 4-line append; the pure renderer stays. |
| repo-cli Ci/CiRerunRunnerLoss.ts | #96 | partial | queued: W5 | `CiRerunRunnerLoss` summary; tests move to a recording double. |
| repo-cli Ci/CiOperational.service.ts, Ci/HeavyAdmission (runner files) | #271 | partial | queued: W5 | `CiOperational` runner-file writer; key=value outputs pinned by tests and check.yml stay. |
| repo-cli Ci | #312 | partial | queued: W5 | `CiOperational` runner-file writer; key=value outputs pinned by tests and check.yml stay. |

### Follow-up goal: repo-cli gh/git consolidation (W4-l)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| repo-cli Reviewer/GitHubAppAuth.ts | #74 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Reviewer/ReviewerService.ts | #75 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Reviewer/ReviewerRuleset.ts | #76 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli internal/github/GithubGraphql.ts | #77 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/Status.ts | #78 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/WatchMode.ts | #79 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/MergeGate.ts | #80 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/closeout/GhCollect.ts | #81 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/Reply.ts | #82 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli internal/github/GhCommand.ts | #83 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli internal/github/GithubRest.ts | #84 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Skills/Skills.command.ts | #85 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet/internal/GitExec.ts | #101 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli internal/repo-run/ChangedFiles.ts | #102 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Worktree/Worktree.schemas.ts | #105 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Worktree/Fleet.service.ts | #106 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| ai-metrics config-snapshot.ts | #107 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Knowledge/KnowledgeDoctor.grouping.ts | #110 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Knowledge/KnowledgeDoctor.service.ts | #111 | partial | follow-up goal (W4-l) | Needs `Git.isAncestor` in the kit (W4-l; the plan's R10 deferral). |
| repo-cli commands (per-group git wrappers) | #112 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Reviewer/GitHubAppAuth.ts | #124 | partial | follow-up goal (W4-l) | Reviewer App-auth spawns; travels with #74 in the gh/git consolidation goal. |
| repo-cli test  (and driver/app tests) | #125 | partial | follow-up goal (W4-l) | The `ScriptedSpawner` test sweep (W4-l). |
| repo-cli Reviewer/ReviewerRuleset.ts, ReviewerService.ts | #247 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Ci/LaneTimings.ts | #248 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Ci/CiGovernance.ts, Ci/CiRerunRunnerLoss.ts (GitHub reads) | #249 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli Yeet gh-CLI surface (PullRequest, Planner, MergeGate and others) | #250 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli `GitExec.ts` and the Yeet git helper layer | #251 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli typed git wrappers (Codex Security, Session and others) | #252 | partial | follow-up goal (W4-l) | Git wrappers that need kit gaps (fail-closed parsers, rename score, pathspec, bounded output). Moves to the repo-cli gh/git consolidation goal (W4-l). |
| repo-cli test | #279 | partial | follow-up goal (W4-l) | The `ScriptedSpawner` test sweep (W4-l). |
| repo-cli Yeet/internal/GhOps.ts | #281 | partial | follow-up goal (W4-l) | GhOps splicer; R8 hands it to the follow-up goal. |
| test-utils | #291 | partial | follow-up goal (W4-l) | The `ScriptedSpawner` test sweep (W4-l). |
| tailscale test tailscale.test.ts | #300 | partial | follow-up goal (W4-l) | The `ScriptedSpawner` test sweep (W4-l). |
| repo-cli Reviewer | #303 | partial | follow-up goal (W4-l) | gh-CLI surface; needs kit features (review-thread resource, down-scoped App token, gh-token client). Moves to the repo-cli gh/git consolidation goal (W4-l). |

### Deferred modules (W4-m)

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| nlp-mcp bin.ts | #195 | partial | deferred (W4-m) | `engine` ProcessGuard; trigger consumer: an MCP server ProcessGuard. |
| repo-cli Accounts/Accounts.tui.ts | #206 | partial | deferred (W4-m) | `cli/ui*` stays in the lab until C; trigger consumer: the Accounts TUI. |
| repo-cli Files/Files.progress.ts | #208 | partial | deferred (W4-m) | `cli/ui*` stays in the lab until C; trigger consumer: the Accounts TUI. |
| mcpb-kit internal/steps.ts | #295 | partial | deferred (W4-m) | npm registry/publish half; trigger consumer: the mcpb-kit tarball. |

### Excluded, with reasons

| Site | Map id | Verdict | Status | Notes |
| --- | --- | --- | --- | --- |
| repo-cli internal/schema/TextCodec.ts | #14 | partial | excluded | Already on `effect/encoding/Toml` and `effect/encoding/Yaml` (D-12 upstream-first); no npm dependency to drop. |
| ai-sync validation.ts | #15 | confirmed | excluded | Already on `effect/encoding/Toml` (D-12); no npm dependency to drop. |
| repo-cli Skills/Skills.command.ts | #16 | partial | excluded | Parse is on `effect/encoding/Toml`; the edits need kit TOML ops (append array-of-tables, insert table, absent-path guard) that no wave plans. |
| law-practice-server internal/Jsonl.ts | #18 | partial | excluded | Needs a schema-typed JSONL row reader/appender in `@beep/jsonl` (kit gap). |
| repo-cli internal/repo-run/AttemptTerminationJournal.ts | #20 | partial | excluded | Needs a schema-typed JSONL row reader/appender in `@beep/jsonl` (kit gap). |
| repo-cli HarnessLedger/internal/LedgerFiles.ts | #21 | partial | excluded | Needs a schema-typed JSONL row reader/appender in `@beep/jsonl` (kit gap). |
| repo-cli internal/schema/TextCodec.ts | #25 | partial | excluded | Already on `effect/encoding/Toml` and `effect/encoding/Yaml` (D-12 upstream-first); no npm dependency to drop. |
| docgen Core.ts | #38 | partial | excluded | docgen writes two `_config.yml` scalars with no YAML dependency; outside R4's repo-cli and ai-metrics scope. |
| repo-cli Skills/Skills.schemas.ts | #48 | partial | excluded | Optional tightening; needs a string-preserving SPDX schema in `@beep/spdx` (kit gap). |
| mcpb-kit McpbKit.models.ts | #49 | partial | excluded | Optional tightening; needs a string-preserving SPDX schema in `@beep/spdx` (kit gap). |
| apps oip-web content/OipSeo.ts | #50 | partial | excluded | Needs LegalService, WebSite and Place node classes in `@beep/schema-org` (kit gap). |
| apps oip-web app/page.tsx | #51 | partial | excluded | Needs LegalService, WebSite and Place node classes in `@beep/schema-org` (kit gap). |
| repo-cli Quality/Tasks.ts | #62 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| ai-metrics config-snapshot.ts | #66 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| repo-cli Purge/Purge.command.ts | #67 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| box scripts/generate.ts | #68 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| apps practice-identify runtime/Layer.ts | #69 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| repo-cli Cache/Cache.command.ts | #71 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| repo-cli CreatePackage/internal/LabIdentitySegment.ts | #88 | partial | excluded | LabIdentitySegment (R8 excludes it): needs a one-time `packages.ts` marker migration and identity-registry changes. |
| ffmpeg FFmpeg.service.ts | #115 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| onepassword-cli OnePasswordCli.service.ts | #117 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| openclaw internal/spawn.ts | #118 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| ai-provider-cli AiProviderCli.service.ts | #119 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| tesseract Tesseract.service.ts | #120 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| poppler Poppler.service.ts | #121 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| tika Tika.tikaapp.ts | #122 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| repo-utils schemas/BiomeJson.ts | #123 | partial | excluded | repo-utils would take a `@beep/commands` driver edge for one Biome probe. |
| repo-cli Quality/internal/CoverageScope.ts | #145 | partial | excluded | Needs `DependencyGraph.fromAdjacency` and an origin-tracking reverse closure (kit gap); 4-A1 only changes its discovery input. |
| repo-cli internal/tsmorph/OwnerResolver.ts | #151 | partial | excluded | Needs a pure synchronous owner index from `@beep/repo-workspaces` (kit gap). |
| apps practice-mail-tagging PracticeMailTagging.config.ts | #183 | partial | excluded | Would make a deployed practice service start honouring XDG (4-X correction 6). |
| repo-cli internal/cli/Progress.ts | #192 | partial | excluded | The sync callers would have to become effectful first. |
| repo-cli Knowledge/Knowledge.service.ts | #198 | partial | excluded | Uses `@beep/observability` `sanitizeSensitiveText` plus local patterns; not a W4-d adopter. |
| docgen Core.ts | #202 | partial | excluded | cli-kit L3: a docgen output change and a changeset for a cosmetic swap. |
| law-practice-server test DocumentIdentification/Identification.adapters.test.ts | #222 | confirmed | excluded | Test-only hand-built FileSystem double; not in any wave plan (low value). |
| docgen test Configuration.test.ts | #224 | confirmed | excluded | Test-only hand-built FileSystem double; not in any wave plan (low value). |
| repo-cli Models/Models.spans.ts | #230 | partial | excluded | Parse is on `effect/encoding/Toml`; the edits need kit TOML ops (append array-of-tables, insert table, absent-path guard) that no wave plans. |
| repo-utils UniqueDeps.ts | #240 | confirmed | excluded | Dead public export with no consumer: deleted outright, not adopted (3-A3 touches the file for HashMap). |
| repo-cli Models/Models.spans.ts (+ Models.locator) | #257 | partial | excluded | Parse is on `effect/encoding/Toml`; the edits need kit TOML ops (append array-of-tables, insert table, absent-path guard) that no wave plans. |
| apps oip-web content/OipSeo.ts, apps/oip-web/src/app/page.tsx | #272 | partial | excluded | Needs LegalService, WebSite and Place node classes in `@beep/schema-org` (kit gap). |
| libpff Libpff.pffexport.ts | #283 | partial | excluded | One of the 8 partial R9 drivers; each waits for its named kit option (map prerequisite). |
| ai-metrics internal/jsonl-discovery.ts | #293 | partial | excluded | Optional walker shrink not in any wave plan; the walker gate (D-31) was met by the 2b-1 adopters. |
| mcpb-kit internal/steps.ts | #294 | partial | excluded | mcpb-kit is deferred with the npm driver (#136); the switch also needs a platform layer. |
| codegen-kit internal/format.ts | #296 | partial | excluded | Optional; needs a tooling/library to driver edge decision for codegen-kit. |
| ai-provider-cli AiProviderCliSession.profile.service.ts | #302 | partial | excluded | A fixed string template with no TOML dependency; low value. |
