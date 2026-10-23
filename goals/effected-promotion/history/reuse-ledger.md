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
