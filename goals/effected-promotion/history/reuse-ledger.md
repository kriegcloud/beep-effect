# Reuse ledger

Reuse sites from `research/promotion-map-2026-10-20.md` ("Reuse sites") and
the wave plans, with their adoption status. `#n` is the map's site id. A site
leaves the open list in the PR that migrates it, or carries its reason here.

## `@beep/xdg` (wave 4, PR 4-X, SPEC W4-c)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| m365-mcp `OutboxConfig.ts` `stateRoot` (staging root and audit directory) | #180 | adopted in 4-X | `XdgBase.dir("data")` / `XdgBase.dir("state")`. Parity: the env matrix in `test/OutboxConfig.xdg.test.ts`, committed against the old body first; its divergent rows are inverted on purpose (relative or space-padded values ignored, HOME normalized, the missing-root message names an absolute path). |
| repo-cli `internal/state/WorkstationState.ts` `resolveWorkstationStateDir` | #167 | adopted in 4-X | `XdgBase.require("state")`; the override variable and the five callers are unchanged. Parity: `test/workstation-state-xdg.test.ts`, committed against the old body first, with the same inverted rows. |
| ai-metrics `forwarder.ts` and `data-root.ts` `aiMetricsStateHome` | #176, #288 | queued for 4-X-A | Exception Ledger "Duplicate XDG base-directory resolution". |
| repo-cli `internal/repo-run/BeepCacheRoot.ts` | #168 | queued for 4-X-A | Keeps its override and TMPDIR rungs; only the XDG rung moves. |
| repo-cli `Worktree/Fleet.service.ts` cache root | #179 | queued for 4-X-A | |
| repo-cli `HarnessLedger/HarnessLedger.command.ts` | #177 | queued for 4-X-A | |
| repo-cli `AIMetrics/internal/Programs.ts` | - | queued for 4-X-A | |
| repo-cli `Files/internal/MatchPerson.ts` `resolveCacheRoot` | #178 | queued for 4-X-A | |
| apps `docket-intake` `Config.ts` and `practice-m365-contacts` `Contacts.state.ts` | #181, #182 | queued for 4-X-A | |
| apps `practice-mail-tagging` `PracticeMailTagging.config.ts` | #183 | excluded | It would start honouring XDG on a deployed practice service (W4-c correction 6). |

## `@beep/config-file` (wave 3, sub-wave 3-3, SPEC W3-e)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| docgen `Configuration.ts` `readJsoncFile` (package.json and docgen.json) | #166 | adopted in 3-3 | `ConfigFile.read` + `JsoncCodec`; docgen drops `jsonc-parser`. Parity: the 364 tracked package.json and docgen*.json files decode the same through the old reader (`ops/config-file-codec-differential.ts`, docgen-inputs lane). A malformed `docgen.json` now fails typed (test). |
| repo-cli `Models/Models.manifest.service.ts` `load` | #165 | adopted in 3-3 | `ConfigFile.read` + `YamlCodec`; the writers keep the npm `yaml` stringifier and the atomic rename. Parity with the old reader for the five manifest fixtures, a writer round trip for them and the seed, and a typed syntax-error case (`test/models-manifest-config-file.test.ts`). |
| lab `xdg` `XdgConfig` | - | adopted in 3-3; promoted in 4-X | Imports `@beep/config-file` (`ConfigResolver` type); now the `@beep/xdg/XdgConfig` subpath (W4-c). |
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
| repo-cli DeletePackage `stripPackageFromFrontmatter` | #276 | 2d-later | Split, `YamlFormat.modifyToString`, join. The substring bug was fixed independently in #2020. |
| ReflectionArtifact and SkillFrontmatterCheck typed frontmatter | #37 | 2d-later | `MarkdownFrontmatter.schema` with `YamlFrontmatter`; verdict parity over 302 reflections and 44 skills. |
| docgen `@effect/markdown-toc` | #292 | 2d-later | Needs a GitHub slugger and a TOC renderer; drops the npm dependency. |
| effect-drizzle `scripts/assemble-readme.ts` | - | 2d-later | After the TOC helper; `@beep/markdown` as a devDependency only (ecosystem polarity). |
| docgen `fencePattern` and its consumers, EffectImports, SchemaTagIdioms | #282 | 2d-later | Needs code-node spans and an unterminated-fence diagnostic; zero JSDoc-ratchet drift. |
| repo-cli Knowledge.refs, KnowledgeDoctor, RoadmapRefs | #232 | 2d-later | Behind a perf budget: a full parse costs about 400 times the line split. Prefilter fence-bearing files and re-benchmark. |
| repo-cli KnowledgeDoctor `beep-historical` frontmatter | - | 2d-later | `FrontmatterSource`. |
| runpod `RunpodDocs.service.ts` | #301 | 2d-later, optional | Needs a fixture first. |
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
| observability `catalog/Catalog.names.ts` `PackageName` | #137 | 3-A9 (optional) | `ScopedPackageName`. |
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

