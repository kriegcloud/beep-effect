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

## `@beep/md` syntax bridge (wave 2d-2, SPEC D-48 to D-51)

| Site | Map id | Status | Notes |
| --- | --- | --- | --- |
| `@beep/md` `Md.model.ts`: no Markdown source parser | #237 | resolved in 2d-2 | `@beep/md/Md.syntax` `fromMarkdownDocument` folds the `@beep/markdown` tree into `Md.Document`; the unsupported-node policy is the `MdLossReason` taxonomy (D-48). `@beep/markdown` has no `@beep/md` import. |
| `@beep/md` `Md.ts`: write-side DSL with no parser | #290 | resolved in 2d-2 | Merged into #237: `@beep/md/Md.parse` parses text. `@beep/schema`'s Markdown-to-HTML path stays (excluded with #227 and #258, MQ7 cycle). |
| `@beep/md` merge design and hand-rolled frontmatter splitting | #259 | partly resolved in 2d-2 | Placement decided (D-02: parser in `@beep/markdown`, bridge in `@beep/md`) and the unsupported-node policy written (D-48). The frontmatter splitters are the 2d-A sites #37, #27, #276 and #231 above. |

