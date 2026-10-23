# Reuse ledger

Reuse sites from `research/promotion-map-2026-10-20.md` ("Reuse sites") and
the wave plans, with their adoption status. `#n` is the map's site id. A site
leaves the open list in the PR that migrates it, or carries its reason here.

## `@beep/markdown` (wave 2d, SPEC D-46)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| repo-cli `internal/schema/Frontmatter.ts` `extractFrontmatter` (callers `ReflectionArtifact.ts`, `SkillFrontmatterCheck.ts`) | #37 | 2d-A | `FrontmatterSource.split`; delete the file and the `SharedInternals.test-kit.ts` re-export. Parity 509 of 510 (the miss is a `---json` skill the old code read as YAML). |
| repo-cli `Quality/ChangesetGraph.ts` frontmatter fence | #27, #276 | 2d-A | `FrontmatterSource.split`; the YAML and schema block stays. Parity 912 of 1,044; the other 132 are empty blocks with no references either way. |
| skill-contract `SkillProjection.ts` `---json` splitter | #231 | 2d-A | `FrontmatterSource.split` with format `json`, plus an import-closure assertion that the block parser stays out. |
| repo-cli `Goals/Inventory.ts` README regexes | #287 | 2d-A | `MarkdownDocument.parseResult` with `headings`, `sectionByHeading` and `headingSource`; pin the `---json`, `<Goal Title>` and list-interrupt shifts. |
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
formatter rewrites 184 of the 185 repo manifests, while a same-value `modifyToString` is byte-identical for all 185.

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
