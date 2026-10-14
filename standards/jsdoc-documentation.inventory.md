# JSDoc Documentation Compliance Inventory

Generated: 2026-10-14T11:40:42.629Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: kind-aware Example presence, summaries, section grammar, described links, retired tags, TSDoc grammar, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 147 |
| cleanPackages | 64 |
| packagesWithoutPublicSrcSurface | 2 |
| packagesNeedingRemediation | 81 |
| publicModules | 3464 |
| publicExports | 23464 |
| openModules | 912 |
| openExports | 1388 |
| missingExportExamples | 8 |
| missingExportCategories | 0 |
| missingExportSince | 0 |
| forbiddenTagFindings | 0 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 1363 |
| unsafeExampleFindings | 0 |
| schemaAnnotationFindings | 0 |
| undescribed-see | 11 |
| multiple-description-paragraphs | 425 |
| leading-blank | 0 |
| trailing-blank | 0 |
| invalid-heading | 1 |
| section-out-of-order | 0 |
| duplicate-section | 0 |
| empty-section | 0 |
| section-after-example | 0 |
| invalid-when-to-use-prefix | 4 |
| malformed-example | 0 |
| duplicate-example | 0 |
| loose-ts-fence | 0 |
| forbidden-remarks | 0 |
| no-root-package-import | 1342 |
| rootPolicyOpen | 0 |

## Root Policy

| File | Tag | Status | Missing |
|---|---|---|---|
| tsdoc.json | `@effects` | resolved | none |
| tsdoc.json | `@precondition` | resolved | none |
| tsdoc.json | `@postcondition` | resolved | none |
| tsdoc.json | `@invariant` | resolved | none |

## Package Summary

| Order | Package | Path | Status | Modules | Exports | Open Modules | Open Exports |
|---:|---|---|---|---:|---:|---:|---:|
| 1 | `@beep/fc-runs` | `packages/tooling/test-kit/fc-runs` | needs-remediation | 2 | 6 | 1 | 0 |
| 2 | `@beep/test-runner` | `packages/tooling/test-kit/test-runner` | clean | 4 | 6 | 0 | 0 |
| 3 | `@beep/types` | `packages/foundation/primitive/types` | needs-remediation | 5 | 12 | 1 | 12 |
| 4 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 8 | 242 | 2 | 200 |
| 5 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 29 | 216 | 6 | 101 |
| 6 | `@beep/data` | `packages/foundation/primitive/data` | needs-remediation | 12 | 162 | 10 | 16 |
| 7 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 170 | 957 | 13 | 33 |
| 8 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 17 | 51 | 1 | 0 |
| 9 | `@beep/pglite` | `packages/drivers/pglite` | needs-remediation | 4 | 11 | 3 | 0 |
| 10 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 66 | 689 | 18 | 0 |
| 11 | `@beep/html` | `packages/foundation/modeling/html` | needs-remediation | 16 | 546 | 9 | 28 |
| 12 | `@beep/md` | `packages/foundation/modeling/md` | needs-remediation | 10 | 263 | 4 | 87 |
| 13 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 105 | 371 | 3 | 5 |
| 14 | `@beep/rdf` | `packages/foundation/modeling/rdf` | needs-remediation | 39 | 305 | 1 | 5 |
| 15 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 30 | 58 | 0 | 0 |
| 16 | `@beep/provenance` | `packages/foundation/modeling/provenance` | needs-remediation | 4 | 28 | 1 | 0 |
| 17 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 8 | 56 | 0 | 11 |
| 18 | `@beep/agents-domain` | `packages/agents/domain` | clean | 16 | 75 | 0 | 0 |
| 19 | `@beep/workspace-use-cases` | `packages/workspace/use-cases` | needs-remediation | 12 | 46 | 1 | 0 |
| 20 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 6 | 15 | 0 | 0 |
| 21 | `@beep/colors` | `packages/foundation/capability/colors` | needs-remediation | 1 | 9 | 1 | 9 |
| 22 | `@beep/nlp` | `packages/foundation/modeling/nlp` | needs-remediation | 28 | 313 | 9 | 9 |
| 23 | `@beep/file-processing` | `packages/foundation/capability/file-processing` | needs-remediation | 34 | 182 | 0 | 19 |
| 24 | `@beep/epistemic-domain` | `packages/epistemic/domain` | needs-remediation | 60 | 269 | 8 | 2 |
| 25 | `@beep/mcp-kit` | `packages/foundation/capability/mcp-kit` | needs-remediation | 12 | 113 | 8 | 53 |
| 26 | `@beep/ontology-domain` | `packages/ontology/domain` | clean | 6 | 41 | 0 | 0 |
| 27 | `@beep/shacl` | `packages/drivers/shacl` | clean | 3 | 6 | 0 | 0 |
| 28 | `@beep/agents-use-cases` | `packages/agents/use-cases` | needs-remediation | 31 | 128 | 2 | 2 |
| 29 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 25 | 166 | 8 | 97 |
| 30 | `@beep/law-practice-domain` | `packages/law-practice/domain` | needs-remediation | 227 | 799 | 9 | 5 |
| 31 | `@beep/langextract` | `packages/foundation/capability/langextract` | clean | 26 | 126 | 0 | 0 |
| 32 | `@beep/epistemic-use-cases` | `packages/epistemic/use-cases` | needs-remediation | 38 | 149 | 11 | 0 |
| 33 | `@beep/api-transport` | `packages/foundation/capability/api-transport` | needs-remediation | 4 | 11 | 2 | 7 |
| 34 | `@beep/epistemic-config` | `packages/epistemic/config` | needs-remediation | 7 | 21 | 3 | 0 |
| 35 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 43 | 0 | 1 |
| 36 | `@beep/epistemic-tables` | `packages/epistemic/tables` | needs-remediation | 34 | 99 | 4 | 0 |
| 37 | `@beep/chalk` | `packages/foundation/capability/chalk` | needs-remediation | 1 | 35 | 1 | 35 |
| 38 | `@beep/phoenix` | `packages/drivers/phoenix` | clean | 5 | 50 | 0 | 0 |
| 39 | `@beep/duckdb` | `packages/drivers/duckdb` | clean | 6 | 28 | 0 | 0 |
| 40 | `@beep/codegen-kit` | `packages/tooling/library/codegen-kit` | clean | 5 | 37 | 0 | 0 |
| 41 | `@beep/technical-drawing` | `packages/foundation/capability/technical-drawing` | needs-remediation | 18 | 186 | 0 | 122 |
| 42 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | clean | 5 | 111 | 0 | 0 |
| 43 | `@beep/pretext` | `packages/drivers/pretext` | needs-remediation | 6 | 36 | 6 | 0 |
| 44 | `@beep/ontology-use-cases` | `packages/ontology/use-cases` | needs-remediation | 23 | 214 | 1 | 3 |
| 45 | `@beep/cosmos` | `packages/drivers/cosmos` | clean | 6 | 22 | 0 | 0 |
| 46 | `@beep/agents-client` | `packages/agents/client` | needs-remediation | 6 | 39 | 2 | 5 |
| 47 | `@beep/documents-domain` | `packages/documents/domain` | clean | 26 | 82 | 0 | 0 |
| 48 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | clean | 15 | 48 | 0 | 0 |
| 49 | `@beep/uspto` | `packages/drivers/uspto` | clean | 5 | 26 | 0 | 0 |
| 50 | `@beep/law-practice-tables` | `packages/law-practice/tables` | needs-remediation | 34 | 89 | 1 | 0 |
| 51 | `@beep/law-practice-use-cases` | `packages/law-practice/use-cases` | needs-remediation | 60 | 452 | 4 | 1 |
| 52 | `@beep/tika` | `packages/drivers/tika` | needs-remediation | 8 | 34 | 3 | 4 |
| 53 | `@beep/libpff` | `packages/drivers/libpff` | needs-remediation | 7 | 43 | 4 | 2 |
| 54 | `@beep/box` | `packages/drivers/box` | needs-remediation | 7 | 877 | 0 | 2 |
| 55 | `@beep/epistemic-server` | `packages/epistemic/server` | needs-remediation | 24 | 53 | 8 | 4 |
| 56 | `@beep/m365` | `packages/drivers/m365` | needs-remediation | 8 | 165 | 2 | 0 |
| 57 | `@beep/nlp-processing` | `packages/foundation/capability/nlp-processing` | needs-remediation | 48 | 312 | 13 | 0 |
| 58 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 54 | 0 | 0 |
| 59 | `@beep/epistemic-client` | `packages/epistemic/client` | clean | 4 | 25 | 0 | 0 |
| 60 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 134 | 557 | 1 | 1 |
| 61 | `@beep/poppler` | `packages/drivers/poppler` | clean | 3 | 10 | 0 | 0 |
| 62 | `@beep/face-detection` | `packages/drivers/face-detection` | clean | 4 | 34 | 0 | 0 |
| 63 | `@beep/ai-sync` | `packages/tooling/library/ai-sync` | clean | 10 | 104 | 0 | 0 |
| 64 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 10 | 86 | 0 | 3 |
| 65 | `@beep/skill-contract` | `packages/foundation/modeling/skill-contract` | needs-remediation | 9 | 113 | 0 | 79 |
| 66 | `@beep/exiftool` | `packages/drivers/exiftool` | needs-remediation | 5 | 55 | 1 | 0 |
| 67 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | needs-remediation | 30 | 521 | 0 | 2 |
| 68 | `@beep/pdf-tools` | `packages/drivers/pdf-tools` | clean | 4 | 35 | 0 | 0 |
| 69 | `@beep/firecrawl` | `packages/drivers/firecrawl` | clean | 5 | 267 | 0 | 0 |
| 70 | `@beep/runpod` | `packages/drivers/runpod` | clean | 7 | 203 | 0 | 0 |
| 71 | `@beep/tesseract` | `packages/drivers/tesseract` | clean | 3 | 16 | 0 | 0 |
| 72 | `@beep/obs` | `packages/drivers/obs` | needs-remediation | 6 | 73 | 3 | 0 |
| 73 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 28 | 188 | 0 | 1 |
| 74 | `@beep/occt` | `packages/drivers/occt` | clean | 4 | 13 | 0 | 0 |
| 75 | `@beep/qa-capture` | `packages/tooling/library/qa-capture` | needs-remediation | 11 | 155 | 10 | 0 |
| 76 | `@beep/dock` | `packages/foundation/ui-system/dock` | needs-remediation | 20 | 212 | 0 | 189 |
| 77 | `@beep/ai-provider-cli` | `packages/drivers/ai-provider-cli` | needs-remediation | 7 | 44 | 3 | 0 |
| 78 | `@beep/agents-tables` | `packages/agents/tables` | clean | 7 | 16 | 0 | 0 |
| 79 | `@beep/anthropic` | `packages/drivers/anthropic` | clean | 6 | 32 | 0 | 0 |
| 80 | `@beep/lexical-schema` | `packages/foundation/modeling/lexical` | needs-remediation | 7 | 126 | 4 | 7 |
| 81 | `@beep/rdf-canonize` | `packages/drivers/rdf-canonize` | clean | 2 | 2 | 0 | 0 |
| 82 | `@beep/ontology-config` | `packages/ontology/config` | needs-remediation | 7 | 19 | 1 | 0 |
| 83 | `@beep/oxigraph` | `packages/drivers/oxigraph` | clean | 3 | 6 | 0 | 0 |
| 84 | `@beep/n3` | `packages/drivers/n3` | clean | 3 | 11 | 0 | 0 |
| 85 | `@beep/workspace-tables` | `packages/workspace/tables` | clean | 23 | 56 | 0 | 0 |
| 86 | `@beep/doc-text` | `packages/drivers/doc-text` | clean | 3 | 11 | 0 | 0 |
| 87 | `@beep/ontology-client` | `packages/ontology/client` | clean | 3 | 93 | 0 | 0 |
| 88 | `@beep/documents-tables` | `packages/documents/tables` | clean | 19 | 48 | 0 | 0 |
| 89 | `@beep/documents-use-cases` | `packages/documents/use-cases` | clean | 23 | 120 | 0 | 0 |
| 90 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | clean | 9 | 21 | 0 | 0 |
| 91 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | clean | 7 | 21 | 0 | 0 |
| 92 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | clean | 18 | 64 | 0 | 0 |
| 93 | `@beep/law-practice-server` | `packages/law-practice/server` | needs-remediation | 60 | 317 | 1 | 1 |
| 94 | `@beep/ecfr` | `packages/drivers/ecfr` | needs-remediation | 6 | 138 | 2 | 0 |
| 95 | `@beep/govinfo` | `packages/drivers/govinfo` | needs-remediation | 32 | 86 | 2 | 2 |
| 96 | `@beep/wink` | `packages/drivers/wink` | needs-remediation | 14 | 73 | 1 | 0 |
| 97 | `@beep/pacer` | `packages/drivers/pacer` | needs-remediation | 13 | 89 | 12 | 0 |
| 98 | `@beep/venice-ai` | `packages/drivers/venice-ai` | needs-remediation | 3 | 35 | 0 | 1 |
| 99 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 70 | 0 | 0 |
| 100 | `@beep/openai` | `packages/drivers/openai` | clean | 4 | 17 | 0 | 0 |
| 101 | `@beep/hubspot` | `packages/drivers/hubspot` | clean | 4 | 23 | 0 | 0 |
| 102 | `@beep/sanity` | `packages/drivers/sanity` | clean | 4 | 16 | 0 | 0 |
| 103 | `@beep/epistemic-ui` | `packages/epistemic/ui` | clean | 6 | 15 | 0 | 0 |
| 104 | `@beep/graph-3d` | `packages/drivers/graph-3d` | needs-remediation | 7 | 17 | 2 | 0 |
| 105 | `@beep/ontology` | `packages/foundation/modeling/ontology` | needs-remediation | 15 | 157 | 5 | 54 |
| 106 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 383 | 3392 | 47 | 38 |
| 107 | `@beep/dock-react` | `packages/foundation/ui-system/dock-react` | needs-remediation | 3 | 12 | 0 | 10 |
| 108 | `@beep/drizzle` | `packages/drivers/drizzle` | clean | 3 | 11 | 0 | 0 |
| 109 | `@beep/brand` | `packages/foundation/ui-system/brand` | needs-remediation | 7 | 50 | 0 | 43 |
| 110 | `@beep/agents-server` | `packages/agents/server` | needs-remediation | 11 | 39 | 2 | 0 |
| 111 | `@beep/editor` | `packages/foundation/ui-system/editor` | needs-remediation | 36 | 212 | 13 | 3 |
| 112 | `@beep/ontology-server` | `packages/ontology/server` | clean | 8 | 24 | 0 | 0 |
| 113 | `@beep/xstate` | `packages/drivers/xstate` | clean | 6 | 26 | 0 | 0 |
| 114 | `@beep/workspace-server` | `packages/workspace/server` | clean | 12 | 32 | 0 | 0 |
| 115 | `@beep/ontology-ui` | `packages/ontology/ui` | clean | 15 | 28 | 0 | 0 |
| 116 | `@beep/documents-server` | `packages/documents/server` | needs-remediation | 28 | 103 | 2 | 0 |
| 117 | `@beep/openclaw` | `packages/drivers/openclaw` | needs-remediation | 9 | 130 | 7 | 15 |
| 118 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | clean | 3 | 7 | 0 | 0 |
| 119 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | clean | 13 | 34 | 0 | 0 |
| 120 | `@beep/practice-mail-tagging` | `apps/practice-mail-tagging` | clean | 8 | 44 | 0 | 0 |
| 121 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 13 | 46 | 2 | 0 |
| 122 | `@beep/discord` | `packages/drivers/discord` | clean | 4 | 15 | 0 | 0 |
| 123 | `@beep/docket-intake` | `apps/docket-intake` | clean | 10 | 27 | 0 | 0 |
| 124 | `@beep/gov-legal-mcp` | `packages/drivers/gov-legal-mcp` | needs-remediation | 8 | 40 | 6 | 0 |
| 125 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | clean | 3 | 7 | 0 | 0 |
| 126 | `@beep/nlp-mcp` | `packages/drivers/nlp-mcp` | needs-remediation | 9 | 123 | 8 | 1 |
| 127 | `@beep/lint-rules` | `packages/tooling/policy-pack/lint-rules` | needs-remediation | 9 | 32 | 1 | 0 |
| 128 | `@beep/m365-mcp` | `packages/drivers/m365-mcp` | needs-remediation | 13 | 109 | 0 | 3 |
| 129 | `@beep/oip-web` | `apps/oip-web` | clean | 31 | 86 | 0 | 0 |
| 130 | `@beep/storybook` | `apps/storybook` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 131 | `@beep/shared-tables` | `packages/shared/tables` | clean | 9 | 12 | 0 | 0 |
| 132 | `@beep/scratchpad` | `scratchpad` | needs-remediation | 590 | 3443 | 552 | 0 |
| 133 | `@beep/practice-kg-mcp` | `apps/practice-kg-mcp` | clean | 10 | 23 | 0 | 0 |
| 134 | `@beep/tailscale` | `packages/drivers/tailscale` | clean | 5 | 29 | 0 | 0 |
| 135 | `@beep/todox` | `apps/todox` | clean | 16 | 57 | 0 | 0 |
| 136 | `@beep/practice-m365-contacts` | `apps/practice-m365-contacts` | clean | 8 | 27 | 0 | 0 |
| 137 | `@beep/professional-desktop` | `apps/professional-desktop` | needs-remediation | 64 | 232 | 25 | 0 |
| 138 | `@beep/acp` | `packages/drivers/acp` | clean | 11 | 417 | 0 | 0 |
| 139 | `@beep/practice-identify` | `apps/practice-identify` | clean | 3 | 10 | 0 | 0 |
| 140 | `@beep/infra` | `infra` | needs-remediation | 11 | 105 | 3 | 23 |
| 141 | `@beep/box-provisioning` | `packages/drivers/box-provisioning` | needs-remediation | 15 | 184 | 0 | 21 |
| 142 | `@beep/freshbooks` | `packages/drivers/freshbooks` | needs-remediation | 6 | 49 | 5 | 3 |
| 143 | `@beep/onepassword-cli` | `packages/drivers/onepassword-cli` | clean | 4 | 16 | 0 | 0 |
| 144 | `@beep/uspto-mcp` | `packages/drivers/uspto-mcp` | needs-remediation | 7 | 32 | 7 | 3 |
| 145 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | clean | 1 | 2 | 0 | 0 |
| 146 | `@beep/tsgo-shim` | `tools/tsgo-shim` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 147 | `@beep/pandoc-ast` | `packages/foundation/modeling/pandoc-ast` | needs-remediation | 7 | 204 | 0 | 5 |

## Open Findings

### @beep/fc-runs

Path: `packages/tooling/test-kit/fc-runs`

Module findings:
- `src/FastCheckRuns.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/types

Path: `packages/foundation/primitive/types`

Module findings:
- `src/index.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/TArray.types.ts:30` `Elem` (type) - 1 example import violation(s)
- `src/TString.types.ts:33` `NonEmpty` (type) - 1 example import violation(s)
- `src/TString.types.ts:67` `NonEmptyTrimmed` (type) - 1 example import violation(s)
- `src/TString.types.ts:89` `Chars` (type) - 1 example import violation(s)
- `src/TString.types.ts:132` `DotPropertyName` (type) - 1 example import violation(s)
- `src/TUnsafe.types.ts:29` `Any` (type) - 1 example import violation(s)
- `src/TUtils.types.ts:28` `UnionToIntersection` (type) - 1 example import violation(s)
- `src/TUtils.types.ts:54` `Simplify` (type) - 1 example import violation(s)
- `src/index.ts:43` `export type * as TArray from "./TArray.types.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:61` `export type * as TString from "./TString.types.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:77` `export type * as TUnsafe from "./TUnsafe.types.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:95` `export type * as TUtils from "./TUtils.types.ts";` (re-export) - 1 example import violation(s)

### @beep/identity

Path: `packages/foundation/modeling/identity`

Module findings:
- `src/Id.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/Curie.ts:112` `expandOption` (const) - 1 example import violation(s)
- `src/Curie.ts:165` `contractOption` (const) - 1 example import violation(s)
- `src/Curie.ts:264` `expand` (const) - 1 example import violation(s)
- `src/Curie.ts:312` `contract` (const) - 1 example import violation(s)
- `src/Curie.ts:368` `expandPredicate` (const) - 1 example import violation(s)
- `src/Curie.ts:388` `makeCurieCodec` (const) - 1 example import violation(s)
- `src/Curie.ts:408` `CoreCurieCodec` (const) - 1 example import violation(s)
- `src/Curie.ts:426` `makeCurieFromIri` (const) - 1 example import violation(s)
- `src/Curie.ts:450` `CurieFromIri` (const) - 1 example import violation(s)
- `src/Fibered.ts:220` `Fibered` (const) - 1 example import violation(s)
- `src/Id.ts:144` `IdentityInterpolationError` (class) - 1 example import violation(s)
- `src/Id.ts:177` `IdentitySegmentCountError` (class) - 1 example import violation(s)
- `src/Id.ts:211` `VERSION` (const) - 1 example import violation(s)
- `src/Id.ts:233` `SegmentValue` (type) - 1 example import violation(s)
- `src/Id.ts:369` `TitleFromIdentifier` (type) - 1 example import violation(s)
- `src/Id.ts:394` `IriFromIdentity` (type) - 1 example import violation(s)
- `src/Id.ts:423` `CurieFromIdentity` (type) - 1 example import violation(s)
- `src/Id.ts:453` `SlugFromIdentifier` (type) - 1 example import violation(s)
- `src/Id.ts:496` `ModuleSegmentValue` (type) - 1 example import violation(s)
- `src/Id.ts:517` `ModuleAccessor` (type) - 1 example import violation(s)
- `src/Id.ts:538` `TaggedAccessor` (type) - 1 example import violation(s)
- `src/Id.ts:557` `IdentityString` (type) - 2 example import violation(s)
- `src/Id.ts:578` `IdentitySymbol` (type) - 2 example import violation(s)
- `src/Id.ts:601` `SchemaAnnotationExtras` (type) - 1 example import violation(s)
- `src/Id.ts:627` `DeclarationAnnotationExtras` (type) - 1 example import violation(s)
- `src/Id.ts:662` `ErrorAnnotationRecord` (interface) - 1 example import violation(s)
- `src/Id.ts:684` `KeyAnnotationExtras` (type) - 1 example import violation(s)
- `src/Id.ts:707` `SkosClassification` (type) - 1 example import violation(s)
- `src/Id.ts:730` `OntologyKeyOptions` (type) - 1 example import violation(s)
- `src/Id.ts:761` `OntologyClassExtras` (type) - 1 example import violation(s)
- `src/Id.ts:795` `HttpAnnotationExtras` (type) - 1 example import violation(s)
- `src/Id.ts:821` `IdentityAnyAnnotationExtras` (type) - 1 example import violation(s)
- `src/Id.ts:847` `IdentityAnnotation` (type) - 1 example import violation(s)
- `src/Id.ts:902` `IdentityAnnotationResult` (type) - 1 example import violation(s)
- `src/Id.ts:936` `AnnotatedSchema` (type) - 1 example import violation(s)
- `src/Id.ts:953` `TaggedModuleRecord` (type) - 1 example import violation(s)
- `src/Id.ts:1016` `IdentityComposer` (interface) - 1 example import violation(s)
- `src/Id.ts:1625` `BaseIdentityInput` (const) - 1 example import violation(s)
- `src/Id.ts:1654` `BaseIdentityInput` (type) - 1 example import violation(s)
- `src/Id.ts:2167` `make` (const) - 2 example import violation(s)
- `src/IdentityRegistry.ts:34` `IdentityEncoding` (const) - 1 example import violation(s)
- `src/IdentityRegistry.ts:66` `IdentityRef` (const) - 1 example import violation(s)
- `src/IdentityRegistry.ts:104` `IdentityEntry` (class) - 1 example import violation(s)
- `src/IdentityRegistry.ts:181` `IdentityNotFoundError` (class) - 1 example import violation(s)
- `src/IdentityRegistry.ts:209` `IdentityRegistryConflictError` (class) - 1 example import violation(s)
- `src/IdentityRegistry.ts:250` `IdentityRegistry` (class) - 1 example import violation(s)
- `src/PnLocal.ts:161` `SafePnLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:190` `SafePnLocal` (type) - 1 example import violation(s)
- `src/PnLocal.ts:209` `SafePnPrefix` (const) - 1 example import violation(s)
- `src/PnLocal.ts:238` `SafePnPrefix` (type) - 1 example import violation(s)
- `src/PnLocal.ts:257` `isSafeLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:274` `isSafePrefix` (const) - 1 example import violation(s)
- `src/PnLocal.ts:367` `EscapedPnLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:396` `EscapedPnLocal` (type) - 1 example import violation(s)
- `src/PnLocal.ts:414` `acceptsEscapedLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:430` `unescapeLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:452` `escapeLocal` (const) - 1 example import violation(s)
- `src/PnLocal.ts:472` `prefixedNameOrIri` (const) - 1 example import violation(s)
- `src/Vocab.ts:37` `VocabShape` (type) - 1 example import violation(s)
- `src/Vocab.ts:63` `VocabEntry` (class) - 1 example import violation(s)
- `src/Vocab.ts:89` `VocabRegistry` (const) - 1 example import violation(s)
- `src/Vocab.ts:110` `VocabRegistry` (type) - 1 example import violation(s)
- `src/Vocab.ts:129` `CoreVocab` (const) - 1 example import violation(s)
- `src/Vocab.ts:377` `CoreVocab` (type) - 1 example import violation(s)
- `src/Vocab.ts:394` `Curie` (type) - 1 example import violation(s)
- `src/Vocab.ts:413` `Predicate` (type) - 1 example import violation(s)
- `src/Vocab.ts:430` `Expand` (type) - 1 example import violation(s)
- `src/Vocab.ts:472` `mergeVocab` (const) - 1 example import violation(s)
- `src/Vocab.ts:497` `SemanticFoundationVocab` (const) - 1 example import violation(s)
- `src/Vocab.ts:524` `SemanticFoundationVocab` (type) - 1 example import violation(s)
- `src/Vocab.ts:539` `SparVocab` (const) - 1 example import violation(s)
- `src/index.ts:31` `export * from "./Curie.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:56` `export * from "./Fibered.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:72` `export * from "./Id.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:87` `export * from "./IdentityRegistry.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:105` `export * from "./PnLocal.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:120` `export * from "./packages.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:135` `export * from "./Vocab.ts";` (re-export) - 1 example import violation(s)
- `src/packages.ts:334` `$DataId` (const) - 1 example import violation(s)
- `src/packages.ts:350` `$IdentityId` (const) - 1 example import violation(s)
- `src/packages.ts:366` `$SchemaId` (const) - 1 example import violation(s)
- `src/packages.ts:382` `$ProvenanceId` (const) - 1 example import violation(s)
- `src/packages.ts:398` `$RdfId` (const) - 1 example import violation(s)
- `src/packages.ts:446` `$TypesId` (const) - 1 example import violation(s)
- `src/packages.ts:462` `$UtilsId` (const) - 1 example import violation(s)
- `src/packages.ts:480` `$UiId` (const) - 1 example import violation(s)
- `src/packages.ts:498` `$RepoAiMetricsId` (const) - 1 example import violation(s)
- `src/packages.ts:514` `$RepoCliId` (const) - 1 example import violation(s)
- `src/packages.ts:530` `$RepoConfigsId` (const) - 1 example import violation(s)
- `src/packages.ts:546` `$RepoUtilsId` (const) - 1 example import violation(s)
- `src/packages.ts:562` `$TestUtilsId` (const) - 1 example import violation(s)
- `src/packages.ts:580` `$SharedDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:613` `$SharedTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:629` `$SemanticWebId` (const) - 1 example import violation(s)
- `src/packages.ts:645` `$NlpId` (const) - 1 example import violation(s)
- `src/packages.ts:677` `$LangExtractId` (const) - 1 example import violation(s)
- `src/packages.ts:693` `$ObservabilityId` (const) - 1 example import violation(s)
- `src/packages.ts:709` `$ColorsId` (const) - 1 example import violation(s)
- `src/packages.ts:725` `$ChalkId` (const) - 1 example import violation(s)
- `src/packages.ts:741` `$RepoDocgenId` (const) - 1 example import violation(s)
- `src/packages.ts:757` `$InfraId` (const) - 1 example import violation(s)
- `src/packages.ts:775` `$WorkspaceDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:791` `$EpistemicDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:808` `$EpistemicUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:825` `$AgentsDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:841` `$AgentsServerId` (const) - 1 example import violation(s)
- `src/packages.ts:857` `$AgentsUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:873` `$AgentsClientId` (const) - 1 example import violation(s)
- `src/packages.ts:889` `$LawPracticeDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:907` `$LawPracticeUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:925` `$LawPracticeServerId` (const) - 1 example import violation(s)
- `src/packages.ts:942` `$ProfessionalDesktopId` (const) - 1 example import violation(s)
- `src/packages.ts:1088` `$AnthropicId` (const) - 1 example import violation(s)
- `src/packages.ts:1137` `$AcpId` (const) - 1 example import violation(s)
- `src/packages.ts:1154` `$OpenaiCompatId` (const) - 1 example import violation(s)
- `src/packages.ts:1171` `$WorkspaceTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:1188` `$WorkspaceUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:1206` `$WorkspaceServerId` (const) - 1 example import violation(s)
- `src/packages.ts:1223` `$DocumentsDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:1240` `$DocumentsUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:1258` `$DocumentsServerId` (const) - 1 example import violation(s)
- `src/packages.ts:1275` `$ArchitectureLabDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:1293` `$ArchitectureLabUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:1311` `$ArchitectureLabConfigId` (const) - 1 example import violation(s)
- `src/packages.ts:1329` `$ArchitectureLabServerId` (const) - 1 example import violation(s)
- `src/packages.ts:1347` `$ArchitectureLabTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:1365` `$ArchitectureLabClientId` (const) - 1 example import violation(s)
- `src/packages.ts:1383` `$ArchitectureLabUiId` (const) - 1 example import violation(s)
- `src/packages.ts:1401` `$ArchitectureLabProofId` (const) - 1 example import violation(s)
- `src/packages.ts:1419` `$RunpodId` (const) - 1 example import violation(s)
- `src/packages.ts:1436` `$OnepasswordCliId` (const) - 1 example import violation(s)
- `src/packages.ts:1453` `$DiscordId` (const) - 1 example import violation(s)
- `src/packages.ts:1470` `$AiProviderCliId` (const) - 1 example import violation(s)
- `src/packages.ts:1487` `$SanityId` (const) - 1 example import violation(s)
- `src/packages.ts:1504` `$HubspotId` (const) - 1 example import violation(s)
- `src/packages.ts:1521` `$PhoenixId` (const) - 1 example import violation(s)
- `src/packages.ts:1538` `$AiSyncId` (const) - 1 example import violation(s)
- `src/packages.ts:1555` `$BoxId` (const) - 1 example import violation(s)
- `src/packages.ts:1572` `$NlpMcpId` (const) - 1 example import violation(s)
- `src/packages.ts:1606` `$WinkId` (const) - 1 example import violation(s)
- `src/packages.ts:1623` `$FileProcessingId` (const) - 1 example import violation(s)
- `src/packages.ts:1640` `$TikaId` (const) - 1 example import violation(s)
- `src/packages.ts:1657` `$LibpffId` (const) - 1 example import violation(s)
- `src/packages.ts:1674` `$FirecrawlId` (const) - 1 example import violation(s)
- `src/packages.ts:1691` `$UsptoId` (const) - 1 example import violation(s)
- `src/packages.ts:1708` `$LexicalSchemaId` (const) - 1 example import violation(s)
- `src/packages.ts:1725` `$EditorId` (const) - 1 example import violation(s)
- `src/packages.ts:1742` `$ScratchpadId` (const) - 1 example import violation(s)
- `src/packages.ts:1759` `$HtmlId` (const) - 1 example import violation(s)
- `src/packages.ts:1776` `$PandocAstId` (const) - 1 example import violation(s)
- `src/packages.ts:1793` `$PgliteId` (const) - 1 example import violation(s)
- `src/packages.ts:1810` `$M365Id` (const) - 1 example import violation(s)
- `src/packages.ts:1827` `$M365McpId` (const) - 1 example import violation(s)
- `src/packages.ts:1844` `$GovinfoId` (const) - 1 example import violation(s)
- `src/packages.ts:1861` `$EcfrId` (const) - 1 example import violation(s)
- `src/packages.ts:1878` `$ApiTransportId` (const) - 1 example import violation(s)
- `src/packages.ts:1895` `$McpKitId` (const) - 1 example import violation(s)
- `src/packages.ts:1912` `$UsptoMcpId` (const) - 1 example import violation(s)
- `src/packages.ts:1929` `$PacerId` (const) - 1 example import violation(s)
- `src/packages.ts:1946` `$FcRunsId` (const) - 1 example import violation(s)
- `src/packages.ts:1963` `$CosmosId` (const) - 1 example import violation(s)
- `src/packages.ts:1980` `$DbAdminId` (const) - 1 example import violation(s)
- `src/packages.ts:1997` `$EpistemicServerId` (const) - 1 example import violation(s)
- `src/packages.ts:2014` `$EpistemicTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:2031` `$LintRulesId` (const) - 1 example import violation(s)
- `src/packages.ts:2048` `$N3Id` (const) - 1 example import violation(s)
- `src/packages.ts:2065` `$PretextId` (const) - 1 example import violation(s)
- `src/packages.ts:2082` `$Graph3dId` (const) - 1 example import violation(s)
- `src/packages.ts:2099` `$DockId` (const) - 1 example import violation(s)
- `src/packages.ts:2116` `$DockReactId` (const) - 1 example import violation(s)
- `src/packages.ts:2133` `$OntologyClientId` (const) - 1 example import violation(s)
- `src/packages.ts:2150` `$OntologyConfigId` (const) - 1 example import violation(s)
- `src/packages.ts:2167` `$OntologyDomainId` (const) - 1 example import violation(s)
- `src/packages.ts:2184` `$OntologyServerId` (const) - 1 example import violation(s)
- `src/packages.ts:2201` `$OntologyUiId` (const) - 1 example import violation(s)
- `src/packages.ts:2218` `$OntologyUseCasesId` (const) - 1 example import violation(s)
- `src/packages.ts:2235` `$OxigraphId` (const) - 1 example import violation(s)
- `src/packages.ts:2252` `$ShaclId` (const) - 1 example import violation(s)
- `src/packages.ts:2269` `$StorybookId` (const) - 1 example import violation(s)
- `src/packages.ts:2286` `$TsgoShimId` (const) - 1 example import violation(s)
- `src/packages.ts:2303` `$DocTextId` (const) - 1 example import violation(s)
- `src/packages.ts:2320` `$DocumentsTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:2337` `$TailscaleId` (const) - 1 example import violation(s)
- `src/packages.ts:2354` `$AgentsTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:2371` `$EpistemicConfigId` (const) - 1 example import violation(s)
- `src/packages.ts:2388` `$LawPracticeTablesId` (const) - 1 example import violation(s)
- `src/packages.ts:2406` `$PracticeKgMcpId` (const) - 1 example import violation(s)
- `src/packages.ts:2423` `$OpenclawId` (const) - 1 example import violation(s)
- `src/packages.ts:2440` `$ObsId` (const) - 1 example import violation(s)
- `src/packages.ts:2457` `$ExiftoolId` (const) - 1 example import violation(s)
- `src/packages.ts:2474` `$QaCaptureId` (const) - 1 example import violation(s)
- `src/packages.ts:2491` `$GovLegalMcpId` (const) - 1 example import violation(s)
- `src/packages.ts:2507` `$EpistemicClientId` (const) - 1 example import violation(s)
- `src/packages.ts:2523` `$EpistemicUiId` (const) - 1 example import violation(s)
- `src/packages.ts:2556` `$SkillContractId` (const) - 1 example import violation(s)
- `src/packages.ts:2573` `$CodegenKitId` (const) - 1 example import violation(s)
- `src/packages.ts:2590` `$BrandId` (const) - 1 example import violation(s)
- `src/packages.ts:2607` `$OpenaiId` (const) - 1 example import violation(s)
- `src/packages.ts:2624` `$TodoxId` (const) - 1 example import violation(s)
- `src/packages.ts:2641` `$BoxProvisioningId` (const) - 1 example import violation(s)

### @beep/utils

Path: `packages/foundation/modeling/utils`

Module findings:
- `src/Bool.ts:1` (jsdoc) - 1 example import violation(s)
- `src/Data.ts:1` (jsdoc) - 1 documentation section/link violation(s)
- `src/FileSystem.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/GlobalValue.ts:1` (jsdoc) - 1 documentation section/link violation(s)
- `src/NodeUrl.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Path.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Array.ts:614` `export * from "effect/Array";` (re-export) - 1 example import violation(s)
- `src/Array.ts:43` `matchToBoolean` (const) - 1 example import violation(s)
- `src/Array.ts:73` `assertNonEmptyArray` (const) - 1 example import violation(s)
- `src/Array.ts:96` `assertNonEmptyReadonlyArray` (const) - 1 example import violation(s)
- `src/Array.ts:138` `mapNonEmpty` (const) - 1 example import violation(s)
- `src/Array.ts:177` `flatMapNonEmpty` (const) - 1 example import violation(s)
- `src/Array.ts:218` `mapNonEmptyReadonly` (const) - 1 example import violation(s)
- `src/Array.ts:263` `flatMapNonEmptyReadonly` (const) - 1 example import violation(s)
- `src/Array.ts:324` `indexOf` (const) - 1 example import violation(s)
- `src/Array.ts:356` `lastIndexOf` (const) - 1 example import violation(s)
- `src/Array.ts:386` `slice` (const) - 1 example import violation(s)
- `src/Array.ts:412` `entries` (const) - 1 example import violation(s)
- `src/Array.ts:430` `keys` (const) - 1 example import violation(s)
- `src/Array.ts:450` `values` (const) - 1 example import violation(s)
- `src/Array.ts:476` `appendInPlace` (const) - 1 example import violation(s)
- `src/Array.ts:506` `appendAllInPlace` (const) - 1 example import violation(s)
- `src/Array.ts:540` `sortInPlace` (const) - 1 example import violation(s)
- `src/Array.ts:575` `spliceInPlace` (const) - 1 example import violation(s)
- `src/Array.ts:642` `makeReadonly` (const) - 1 example import violation(s)
- `src/Array.ts:665` `fromIterableNonEmpty` (const) - 1 example import violation(s)
- `src/Array.ts:689` `emptyReadonly` (const) - 1 example import violation(s)
- `src/Bool.ts:18` `export * from "effect/Boolean";` (re-export) - 1 example import violation(s)
- `src/Equal.ts:22` `export * from "effect/Equal";` (re-export) - 1 example import violation(s)
- `src/Errors.ts:166` `mapToError` (function) - 1 example import violation(s)
- `src/Errors.ts:45` `ErrorMapper` (type) - 1 example import violation(s)
- `src/Errors.ts:99` `mapCauseError` (const) - 1 example import violation(s)
- `src/GlobalValue.ts:73` `globalValue` (const) - 1 example import violation(s)
- `src/Number.ts:43` `isPositive` (const) - 1 documentation section/link violation(s)
- `src/Number.ts:87` `isInteger` (const) - 1 example import violation(s)
- `src/Option.ts:63` `propFromNullishOr` (const) - 1 example import violation(s)
- `src/Option.ts:112` `getSomesStruct` (const) - 1 example import violation(s)
- `src/Predicate.ts:207` `chainRefinements` (function) - 1 example import violation(s)
- `src/Predicate.ts:156` `hasInspectableObjectShape` (const) - 1 example import violation(s)
- `src/Str.ts:824` `export * from "effect/String";` (re-export) - 1 example import violation(s)
- `src/Str.ts:294` `mapPrefix` (function) - 1 example import violation(s)
- `src/Str.ts:339` `mapPostfix` (function) - 1 example import violation(s)
- `src/Str.ts:41` `equivalence` (const) - 1 example import violation(s)
- `src/Str.ts:71` `orderAsc` (const) - 1 example import violation(s)
- `src/Str.ts:118` `prefix` (const) - 1 example import violation(s)
- `src/Str.ts:159` `prefixThunk` (const) - 1 example import violation(s)
- `src/Str.ts:212` `postfix` (const) - 1 example import violation(s)
- `src/Str.ts:253` `postfixThunk` (const) - 1 example import violation(s)
- `src/Str.ts:370` `camelCase` (const) - 1 example import violation(s)
- `src/Str.ts:388` `snakeCase` (const) - 1 example import violation(s)
- `src/Str.ts:406` `kebabCase` (const) - 1 example import violation(s)
- `src/Str.ts:425` `screamingSnake` (const) - 1 example import violation(s)
- `src/Str.ts:444` `pascalCase` (const) - 1 example import violation(s)
- `src/Str.ts:462` `pascalToSnake` (const) - 1 example import violation(s)
- `src/Str.ts:481` `snakeToCamel` (const) - 1 example import violation(s)
- `src/Str.ts:500` `snakeToKebab` (const) - 1 example import violation(s)
- `src/Str.ts:519` `camelToSnake` (const) - 1 example import violation(s)
- `src/Str.ts:538` `snakeToPascal` (const) - 1 example import violation(s)
- `src/Str.ts:557` `kebabToSnake` (const) - 1 example import violation(s)
- `src/Str.ts:584` `startsWith` (const) - 1 example import violation(s)
- `src/Str.ts:624` `endsWith` (const) - 1 example import violation(s)
- `src/Str.ts:669` `contains` (const) - 1 example import violation(s)
- `src/Str.ts:713` `repeat` (const) - 1 example import violation(s)
- `src/Str.ts:748` `replaceWith` (const) - 1 example import violation(s)
- `src/Str.ts:791` `replaceAllWith` (const) - 1 example import violation(s)
- `src/Str.ts:844` `trimThunk` (const) - 1 example import violation(s)
- `src/Str.ts:864` `fromNumber` (const) - 1 example import violation(s)
- `src/Str.ts:881` `toSlug` (const) - 1 example import violation(s)
- `src/Str.ts:919` `truncate` (const) - 1 example import violation(s)
- `src/Str.ts:945` `orEmpty` (const) - 1 example import violation(s)
- `src/Str.ts:993` `matchEmpty` (const) - 1 example import violation(s)
- `src/Struct.ts:173` `dotGet` (const) - 1 example import violation(s)
- `src/Struct.ts:220` `dotGetOption` (const) - 1 example import violation(s)
- `src/Struct.ts:287` `mapPath` (const) - 1 example import violation(s)
- `src/Struct.ts:365` `mapPathLazy` (const) - 1 example import violation(s)
- `src/Struct.ts:447` `getLazy` (const) - 1 example import violation(s)
- `src/Struct.ts:482` `pathsOf` (const) - 1 example import violation(s)
- `src/Struct.ts:602` `entriesNonEmpty` (const) - 1 example import violation(s)
- `src/Struct.ts:633` `keys` (const) - 1 example import violation(s)
- `src/Struct.ts:659` `keysNonEmpty` (const) - 1 example import violation(s)
- `src/Struct.ts:694` `fromEntries` (const) - 1 example import violation(s)
- `src/Struct.ts:802` `reverse` (const) - 1 example import violation(s)
- `src/Struct.ts:924` `deepMerge` (const) - 1 example import violation(s)
- `src/Text.ts:33` `splitCommaSeparatedTrimmed` (const) - 1 example import violation(s)
- `src/Text.ts:61` `formatNameWithAliases` (const) - 1 example import violation(s)
- `src/Text.ts:93` `joinLines` (const) - 1 example import violation(s)
- `src/index.ts:30` `export * as A from "./Array.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:45` `export * as Bool from "./Bool.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:63` `export * as Data from "./Data.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:78` `export * as DateTime from "./DateTime.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:106` `export * as Eq from "./Equal.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:133` `export * as Err from "./Errors.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:151` `export * as FileSystem from "./FileSystem.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:173` `export * from "./HostProcess.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:189` `export * as Html from "./Html.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:205` `export * as N from "./Number.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:221` `export * as O from "./Option.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:236` `export * as Path from "./Path.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:252` `export * as P from "./Predicate.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:267` `export * from "./Random.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:283` `export * as R from "./Record.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:299` `export * as Str from "./Str.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:314` `export * as Stream from "./Stream.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:330` `export * as Struct from "./Struct.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:346` `export * as Text from "./Text.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:362` `export * from "./thunk.ts";` (re-export) - 1 example import violation(s)
- `src/thunk.ts:367` `thunkEmptyReadonlyRecord` (const) - 1 example import violation(s)

### @beep/data

Path: `packages/foundation/primitive/data`

Module findings:
- `src/Calendar.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/CurrencyCodes.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/KeyboardShortcuts.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Timezones.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/generated/cldr-territories.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/generated/iana-media-types.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/generated/iana-timezones.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/generated/iso4217.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Blockchain.ts:26` `Networks` (const) - 1 example import violation(s)
- `src/MimeTypes.ts:36` `MimeType` (type) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:192` `FileExtension` (type) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:326` `mimes` (const) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:604` `getTypes` (const) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:625` `getExtensions` (const) - 1 documentation section/link violation(s)
- `src/MimeTypes.ts:650` `lookup` (const) - 1 documentation section/link violation(s)
- `src/Timezones.ts:35` `TimezoneName` (type) - 1 documentation section/link violation(s)
- `src/Timezones.ts:75` `TimezoneNameValues` (const) - 1 documentation section/link violation(s)
- `src/index.ts:26` `export * as Blockchain from "./Blockchain.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:41` `export * as Calendar from "./Calendar.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:56` `export * as CurrencyCodes from "./CurrencyCodes.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:75` `export * as KeyboardShortcuts from "./KeyboardShortcuts.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:90` `export * as MimeTypesData from "./MimeTypes.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:105` `export * as Territories from "./Territories.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:120` `export * as Timezones from "./Timezones.ts";` (re-export) - 1 example import violation(s)

### @beep/schema

Path: `packages/foundation/modeling/schema`

Module findings:
- `src/Color/Color.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/EthAmount/EthAmount.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/EvmAddress/EvmAddress.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Float16Array.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Float32Array.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Float64Array.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Fn/Fn.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/LocalDate/LocalDate.schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Percentage.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UnitInterval.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:37` `credentialRules` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:160` `detectCredentials` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:190` `countCredentialCategory` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:242` `replaceCredentialCategory` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:276` `replaceCredentialAssignmentsOutsideHeaders` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:306` `maskCredentialMatches` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.policy.ts:351` `maskCredentialCategory` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.schema.ts:26` `credentialPatternBankVersion` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.schema.ts:39` `CredentialCategory` (const) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.schema.ts:63` `CredentialCategory` (type) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.schema.ts:75` `CredentialRule` (class) - 1 example import violation(s)
- `src/CredentialPatternBank/CredentialPatternBank.schema.ts:99` `CredentialMatch` (class) - 1 example import violation(s)
- `src/Email.ts:33` `EmailString` (const) - 1 example import violation(s)
- `src/Email.ts:52` `EmailString` (type) - 2 example import violation(s)
- `src/Email.ts:76` `Email` (const) - 1 example import violation(s)
- `src/Email.ts:96` `Email` (type) - 1 example import violation(s)
- `src/FileDiff.schema.ts:67` `Added` (class) - 1 example import violation(s)
- `src/FileDiff.schema.ts:101` `Deleted` (class) - 1 example import violation(s)
- `src/FileDiff.schema.ts:136` `Modified` (class) - 1 example import violation(s)
- `src/FileDiff.schema.ts:170` `Info` (const) - 1 example import violation(s)
- `src/FileDiff.schema.ts:192` `Info` (type) - 1 example import violation(s)
- `src/FileDiff.schema.ts:210` `Info` (namespace) - 1 example import violation(s)
- `src/Fn/Fn.schema.ts:528` `ThunkOf` (function) - 3 example import violation(s)
- `src/Fn/Fn.schema.ts:598` `Fn` (function) - 5 example import violation(s)
- `src/Fn/Fn.schema.ts:481` `AnyFn` (const) - 1 example import violation(s)
- `src/Fn/Fn.schema.ts:503` `AnyFn` (type) - 1 example import violation(s)
- `src/SafeRemoteHost.ts:93` `BlockedHostError` (class) - 1 example import violation(s)
- `src/SafeRemoteHost.ts:281` `isBlockedRemoteHost` (const) - 1 example import violation(s)
- `src/SafeRemoteHost.ts:326` `assertAllowedRemoteHost` (const) - 1 example import violation(s)
- `src/SafeRemoteHost.ts:391` `assertAllowedRemoteUrl` (const) - 1 example import violation(s)
- `src/SemanticVersion.ts:53` `SemanticVersionSchema` (interface) - 1 documentation section/link violation(s)
- `src/Slug.ts:52` `SlugChecks` (const) - 1 example import violation(s)
- `src/index.ts:200` `export * from "./Port.ts";` (re-export) - 1 example import violation(s)

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Module findings:
- `src/FastCheckRuns.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/pglite

Path: `packages/drivers/pglite`

Module findings:
- `src/Pglite.test-layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PgliteClient.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/Dependencies.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/DependencyIndex.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/FsUtils.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/JSDoc/models/TagValue.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/JsonUtils.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ProcessArgs.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Root.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/TsConfig.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UniqueDeps.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Workspaces.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/errors/CyclicDependencyError.ts:1` (jsdoc) - 1 documentation section/link violation(s)
- `src/errors/DomainError.ts:1` (jsdoc) - 1 documentation section/link violation(s)
- `src/errors/NoSuchFileError.ts:1` (jsdoc) - 1 documentation section/link violation(s)
- `src/errors/OptionInjectionError.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/schemas/PackageJson.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/schemas/TSConfig.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/schemas/WorkspaceDeps.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/html

Path: `packages/foundation/modeling/html`

Module findings:
- `src/Html.attributes.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.conformance.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.contract.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.meta.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.nodes.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.policy.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Html.serialize.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/Html.conformance.ts:220` `ConformantHtmlNode` (const) - 1 example import violation(s)
- `src/Html.form-control.ts:43` `InputState` (const) - 1 example import violation(s)
- `src/Html.form-control.ts:128` `resolveInputState` (const) - 1 example import violation(s)
- `src/Html.form-control.ts:157` `inputStateAllowedAttributes` (const) - 1 example import violation(s)
- `src/Html.form-control.ts:231` `ButtonState` (const) - 1 example import violation(s)
- `src/Html.form-control.ts:303` `resolveButtonState` (const) - 1 example import violation(s)
- `src/Html.meta.ts:604` `HTML_GLOBAL_ATTRIBUTE_NAMES` (const) - 1 documentation section/link violation(s)
- `src/Html.policy.ts:502` `SafeHtmlAst` (const) - 1 example import violation(s)
- `src/Html.policy.ts:527` `SafeHtmlAst` (type) - 1 example import violation(s)
- `src/Html.policy.ts:549` `SafeHtmlNode` (const) - 1 example import violation(s)
- `src/Html.policy.ts:804` `inspectSafeHtml` (const) - 1 example import violation(s)
- `src/Html.policy.ts:833` `enforceSafeHtml` (const) - 1 example import violation(s)
- `src/Html.policy.ts:859` `safeHtmlAstConformant` (const) - 1 example import violation(s)
- `src/Html.policy.ts:887` `safeHtmlAstRoot` (const) - 1 example import violation(s)
- `src/Html.script.ts:44` `HtmlMimeType` (const) - 1 example import violation(s)
- `src/Html.script.ts:84` `JavaScriptMimeTypeEssence` (const) - 1 example import violation(s)
- `src/Html.script.ts:138` `ScriptDataBlockMimeType` (const) - 1 example import violation(s)
- `src/Html.script.ts:191` `ScriptState` (const) - 1 example import violation(s)
- `src/Html.script.ts:232` `InvalidScriptType` (class) - 1 example import violation(s)
- `src/Html.script.ts:287` `resolveScriptState` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:147` `SafeHtml` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:180` `SafeHtml` (type) - 1 example import violation(s)
- `src/Html.serialize.ts:611` `serialize` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:636` `serializeConformant` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:685` `serializeSafe` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:706` `untrustedHtmlValue` (const) - 1 example import violation(s)
- `src/Html.serialize.ts:739` `safeHtmlValue` (const) - 1 example import violation(s)
- `src/Html.source-size.ts:829` `inspectSourceSizeList` (const) - 1 documentation section/link violation(s)

### @beep/md

Path: `packages/foundation/modeling/md`

Module findings:
- `src/Md.behavior.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Md.escape.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Md.html.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Md.safe.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Md.behavior.ts:97` `segmentInlineRuns` (const) - 1 example import violation(s)
- `src/Md.behavior.ts:133` `renderPlainTextInline` (const) - 1 example import violation(s)
- `src/Md.behavior.ts:150` `renderPlainTextBlock` (const) - 1 example import violation(s)
- `src/Md.behavior.ts:167` `renderPlainTextBlocks` (const) - 1 example import violation(s)
- `src/Md.conformance.ts:381` `refineStrictMarkdownDocument` (const) - 1 example import violation(s)
- `src/Md.conformance.ts:465` `inspectMarkdownSpecificationConformance` (const) - 1 example import violation(s)
- `src/Md.escape.ts:712` `maxBackticks` (const) - 1 example import violation(s)
- `src/Md.escape.ts:777` `renderFencedCode` (const) - 1 example import violation(s)
- `src/Md.html.ts:42` `renderSafeHtml` (const) - 1 example import violation(s)
- `src/Md.render.ts:599` `renderMarkdownInline` (function) - 1 example import violation(s)
- `src/Md.render.ts:658` `renderHtmlInline` (function) - 1 example import violation(s)
- `src/Md.render.ts:677` `renderMarkdownBlock` (const) - 1 example import violation(s)
- `src/Md.render.ts:730` `renderHtmlBlock` (const) - 1 example import violation(s)
- `src/Md.render.ts:765` `renderMarkdownBlocks` (const) - 1 example import violation(s)
- `src/Md.render.ts:785` `renderHtmlBlocks` (const) - 1 example import violation(s)
- `src/Md.render.ts:810` `renderUnsafe` (const) - 1 example import violation(s)
- `src/Md.render.ts:831` `renderHtmlUnsafe` (const) - 1 example import violation(s)
- `src/Md.render.ts:852` `renderPlainTextUnsafe` (const) - 1 example import violation(s)
- `src/Md.render.ts:897` `renderWithUnsafe` (const) - 1 example import violation(s)
- `src/Md.render.ts:932` `renderEffectWithUnsafe` (const) - 1 example import violation(s)
- `src/Md.render.ts:974` `renderEffectWith` (const) - 1 example import violation(s)
- `src/Md.render.ts:1378` `makeMarkdownAdapter` (const) - 1 example import violation(s)
- `src/Md.render.ts:1404` `makeHtmlFragmentAdapter` (const) - 1 example import violation(s)
- `src/Md.render.ts:1428` `MarkdownAdapter` (const) - 1 example import violation(s)
- `src/Md.render.ts:1452` `HtmlFragmentAdapter` (const) - 1 example import violation(s)
- `src/Md.render.ts:1471` `PlainTextAdapter` (const) - 1 example import violation(s)
- `src/Md.render.ts:1498` `renderWith` (const) - 1 example import violation(s)
- `src/Md.render.ts:1532` `render` (const) - 1 example import violation(s)
- `src/Md.render.ts:1557` `renderHtml` (const) - 1 example import violation(s)
- `src/Md.render.ts:1582` `renderPlainText` (const) - 1 example import violation(s)
- `src/Md.safe.ts:745` `documentSafetyIssues` (const) - 1 example import violation(s)
- `src/Md.safe.ts:771` `inlineSafetyIssuesAtRoot` (const) - 1 example import violation(s)
- `src/Md.safe.ts:962` `refineSafeDocument` (const) - 1 example import violation(s)
- `src/Md.ts:124` `InlineContent` (type) - 1 example import violation(s)
- `src/Md.ts:180` `BlockContent` (type) - 1 example import violation(s)
- `src/Md.ts:203` `BlockTemplateValue` (type) - 1 example import violation(s)
- `src/Md.ts:242` `ListItemChildInput` (type) - 1 example import violation(s)
- `src/Md.ts:260` `ListItemContent` (type) - 1 example import violation(s)
- `src/Md.ts:299` `ListItemInput` (type) - 1 example import violation(s)
- `src/Md.ts:334` `TableRowInput` (type) - 1 example import violation(s)
- `src/Md.ts:544` `text` (const) - 1 example import violation(s)
- `src/Md.ts:561` `rawMarkdown` (const) - 1 example import violation(s)
- `src/Md.ts:582` `rawHtml` (const) - 1 example import violation(s)
- `src/Md.ts:599` `strong` (const) - 1 example import violation(s)
- `src/Md.ts:616` `em` (const) - 1 example import violation(s)
- `src/Md.ts:633` `del` (const) - 1 example import violation(s)
- `src/Md.ts:650` `code` (const) - 1 example import violation(s)
- `src/Md.ts:667` `a` (const) - 1 example import violation(s)
- `src/Md.ts:696` `img` (const) - 1 example import violation(s)
- `src/Md.ts:719` `br` (const) - 1 example import violation(s)
- `src/Md.ts:736` `inlineMath` (const) - 1 example import violation(s)
- `src/Md.ts:753` `footnoteRef` (const) - 1 example import violation(s)
- `src/Md.ts:771` `h1` (const) - 1 example import violation(s)
- `src/Md.ts:788` `h2` (const) - 1 example import violation(s)
- `src/Md.ts:805` `h3` (const) - 1 example import violation(s)
- `src/Md.ts:822` `h4` (const) - 1 example import violation(s)
- `src/Md.ts:839` `h5` (const) - 1 example import violation(s)
- `src/Md.ts:856` `h6` (const) - 1 example import violation(s)
- `src/Md.ts:873` `p` (const) - 1 example import violation(s)
- `src/Md.ts:890` `li` (const) - 1 example import violation(s)
- `src/Md.ts:907` `ul` (const) - 1 example import violation(s)
- `src/Md.ts:924` `ol` (const) - 1 example import violation(s)
- `src/Md.ts:953` `taskItem` (const) - 1 example import violation(s)
- `src/Md.ts:983` `taskListFromItems` (const) - 1 example import violation(s)
- `src/Md.ts:1000` `blockquote` (const) - 1 example import violation(s)
- `src/Md.ts:1017` `pre` (const) - 1 example import violation(s)
- `src/Md.ts:1041` `tableCell` (const) - 1 example import violation(s)
- `src/Md.ts:1058` `tableRow` (const) - 1 example import violation(s)
- `src/Md.ts:1076` `table` (const) - 1 example import violation(s)
- `src/Md.ts:1113` `mathBlock` (const) - 1 example import violation(s)
- `src/Md.ts:1130` `footnoteDef` (const) - 1 example import violation(s)
- `src/Md.ts:1154` `admonition` (const) - 1 example import violation(s)
- `src/Md.ts:1178` `embed` (const) - 1 example import violation(s)
- `src/Md.ts:1225` `youtube` (const) - 1 example import violation(s)
- `src/Md.ts:1244` `youtubeEffect` (const) - 1 example import violation(s)
- `src/Md.ts:1267` `youtubeUnsafe` (const) - 1 example import violation(s)
- `src/Md.ts:1283` `hr` (const) - 1 example import violation(s)
- `src/Md.ts:1300` `make` (const) - 1 example import violation(s)
- `src/Md.ts:1333` `Md` (const) - 1 example import violation(s)
- `src/index.ts:23` `export * from "./Md.behavior.ts";` (re-export) - 2 example import violation(s)
- `src/index.ts:39` `export * from "./Md.conformance.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:54` `export * from "./Md.escape.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:70` `export * from "./Md.html.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:85` `export * from "./Md.model.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:100` `export * from "./Md.render.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:115` `export * from "./Md.safe.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:131` `export * from "./Md.ts";` (re-export) - 1 example import violation(s)

### @beep/shared-domain

Path: `packages/shared/domain`

Module findings:
- `src/values/ClaimLifecycle/ClaimLifecycle.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/LocalDate/LocalDate.behavior.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/LocalDate/LocalDate.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/entity/Principal.ts:253` `PrincipalSchema` (interface) - 1 documentation section/link violation(s)
- `src/entity/SourceKind.ts:32` `SourceKindSchema` (interface) - 1 documentation section/link violation(s)
- `src/entity/primitives.ts:64` `Sha256` (const) - 1 example import violation(s)
- `src/identity/index.ts:84` `isIdentityComposer` (const) - 1 example import violation(s)
- `src/identity/index.ts:119` `AnyIdentityComposer` (const) - 1 example import violation(s)

### @beep/rdf

Path: `packages/foundation/modeling/rdf`

Module findings:
- `src/Vocab/Dcterms.ts:1` (jsdoc) - 1 documentation section/link violation(s)

Export findings:
- `src/Iri.ts:870` `IRIReference` (const) - 1 example import violation(s)
- `src/Iri.ts:911` `RelativeIRIReference` (const) - 1 example import violation(s)
- `src/Iri.ts:951` `AbsoluteIRI` (const) - 1 example import violation(s)
- `src/Iri.ts:992` `IRI` (const) - 1 example import violation(s)
- `src/Vocab/Xsd.ts:27` `XSD_NAMESPACE` (const) - 1 documentation section/link violation(s)

### @beep/provenance

Path: `packages/foundation/modeling/provenance`

Module findings:
- `src/TextAnchor.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/semantic-web

Path: `packages/foundation/capability/semantic-web`

Export findings:
- `src/identity/IdentityRdfBinding.ts:99` `IdentityRdfBinding` (class) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:142` `DefaultIdentityRdfBinding` (const) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:163` `IdentityFiberPathError` (class) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:189` `IdentityEntryIriError` (class) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:215` `IdentityDatasetDecodeError` (class) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:256` `decodeEntrySubject` (const) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:440` `entriesToDataset` (const) - 1 example import violation(s)
- `src/identity/IdentityRdfBinding.ts:494` `datasetToEntries` (const) - 1 example import violation(s)
- `src/identity/IdentityRegistryDataset.ts:43` `layerDataset` (const) - 1 example import violation(s)
- `src/identity/IdentityShaclProjection.ts:90` `IdentityShapePolicy` (class) - 1 example import violation(s)
- `src/identity/IdentityShaclProjection.ts:127` `projectShapes` (const) - 1 example import violation(s)

### @beep/workspace-use-cases

Path: `packages/workspace/use-cases`

Module findings:
- `src/aggregates/Thread/ThreadStore.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/colors

Path: `packages/foundation/capability/colors`

Module findings:
- `src/Colors.ts:1` (packageDocumentation) - 2 example import violation(s)

Export findings:
- `src/Colors.ts:62` `ProcessLikeStdout` (class) - 1 example import violation(s)
- `src/Colors.ts:90` `ProcessLike` (class) - 1 example import violation(s)
- `src/Colors.ts:196` `Formatter` (const) - 1 example import violation(s)
- `src/Colors.ts:213` `Formatter` (type) - 1 example import violation(s)
- `src/Colors.ts:252` `supportsColor` (const) - 1 example import violation(s)
- `src/Colors.ts:268` `isColorSupported` (const) - 1 example import violation(s)
- `src/Colors.ts:292` `Colors` (class) - 1 example import violation(s)
- `src/Colors.ts:341` `createColors` (const) - 1 example import violation(s)
- `src/Colors.ts:409` `default` (const) - 1 example import violation(s)

### @beep/nlp

Path: `packages/foundation/modeling/nlp`

Module findings:
- `src/Algebra/NLPMonoid.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOps.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/Schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Handoff/Contract.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Handoff/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Ontology/Kind.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Operations/Composable.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Operations/Definition.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Operations/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/index.ts:23` `export * as Algebra from "./Algebra/index.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:38` `export * as Core from "./Core/index.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:53` `export * as Graph from "./Graph/index.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:69` `export * as Handoff from "./Handoff/index.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:85` `export * as IdentifierText from "./IdentifierText.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:100` `export * as Ontology from "./Ontology/index.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:116` `export * as PathText from "./PathText.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:132` `export * as QueryText from "./QueryText.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:148` `export * as VariantText from "./VariantText.ts";` (re-export) - 1 example import violation(s)

### @beep/file-processing

Path: `packages/foundation/capability/file-processing`

Export findings:
- `src/SecretScrub/SecretScrub.policy.ts:36` `PromptAdmissibleText` (type) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.policy.ts:50` `promptTextFromScrub` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.policy.ts:69` `secretRetentionDeadline` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.policy.ts:87` `isSecretPurgeEligible` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:26` `SecretCoverage` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:42` `SecretCoverage` (type) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:53` `SecretResidue` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:69` `SecretResidue` (type) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:80` `SecretRetentionClass` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:96` `SecretRetentionClass` (type) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:110` `SecretRetentionRecord` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:132` `SecretCategoryCount` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:153` `SecretEvidence` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:181` `SecretScrubProof` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:205` `SecretScrubInput` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.schema.ts:228` `SecretScrubResult` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.service.ts:38` `SecretScrubService` (class) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.service.ts:57` `scrubSecretText` (const) - 1 example import violation(s)
- `src/SecretScrub/SecretScrub.service.ts:128` `SecretScrubLive` (const) - 1 example import violation(s)

### @beep/epistemic-domain

Path: `packages/epistemic/domain`

Module findings:
- `src/entities/EdgeVersion/EdgeVersion.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ClaimLifecycle/ClaimLifecycle.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/EvidenceSpan/EvidenceSpan.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ExecutionGrant/ExecutionGrant.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ExecutionRecord/ExecutionRecord.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ExecutionVerdict/ExecutionVerdict.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/GrantSet/GrantSet.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/LogicalEdgeIdentity/LogicalEdgeIdentity.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/values/GrantSet/GrantSet.model.ts:282` `addGrant` (const) - 1 documentation section/link violation(s)
- `src/values/GrantSet/GrantSet.model.ts:510` `evaluateExecutionRequest` (const) - 1 documentation section/link violation(s)

### @beep/mcp-kit

Path: `packages/foundation/capability/mcp-kit`

Module findings:
- `src/ApiKeyRequired.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/FieldTier.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/SanitizedSpan.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/SourceAuth.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/TierGate.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ToolAnnotations.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ToolkitComposition.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/ApiKeyRequired.ts:75` `ApiKeyRequiredFailure` (class) - 1 example import violation(s)
- `src/ApiKeyRequired.ts:131` `apiKeyRequiredFailure` (const) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/FieldTier.ts:50` `FieldTierName` (const) - 1 example import violation(s)
- `src/FieldTier.ts:71` `FieldTierName` (type) - 1 example import violation(s)
- `src/FieldTier.ts:96` `FieldTierSet` (interface) - 1 example import violation(s)
- `src/FieldTier.ts:130` `defineFieldTiers` (const) - 1 example import violation(s)
- `src/FieldTier.ts:157` `stripNulls` (const) - 1 example import violation(s)
- `src/FieldTier.ts:189` `projectFieldTier` (const) - 1 example import violation(s)
- `src/FieldTier.ts:232` `estimateJsonSize` (const) - 1 example import violation(s)
- `src/FieldTier.ts:260` `OversizedFieldProjection` (class) - 1 example import violation(s)
- `src/FieldTier.ts:298` `FetchableHandle` (class) - 1 example import violation(s)
- `src/FieldTier.ts:343` `FieldProjectionOutcome` (const) - 1 example import violation(s)
- `src/FieldTier.ts:380` `FieldProjectionOutcome` (type) - 2 example import violation(s)
- `src/FieldTier.ts:433` `projectWithinBudget` (const) - 1 example import violation(s)
- `src/FieldTier.ts:470` `ColumnarEnvelope` (class) - 1 example import violation(s)
- `src/FieldTier.ts:517` `toColumnarEnvelope` (const) - 1 example import violation(s)
- `src/McpCaller.ts:44` `McpCallerIdentity` (class) - 1 example import violation(s)
- `src/McpCaller.ts:76` `CurrentMcpCaller` (const) - 1 example import violation(s)
- `src/SanitizedSpan.ts:74` `defaultSanitizedSpanKeys` (const) - 1 example import violation(s)
- `src/SanitizedSpan.ts:99` `sanitizeTracerAttributes` (const) - 1 example import violation(s)
- `src/SanitizedSpan.ts:188` `withSanitizedToolSpan` (const) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/SanitizedSpan.ts:604` `sanitizedToolkit` (const) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/SourceAuth.ts:55` `SourceAuthGate` (const) - 1 example import violation(s)
- `src/SourceAuth.ts:77` `SourceAuthGate` (type) - 1 example import violation(s)
- `src/SourceAuth.ts:100` `SourceAuthRegistration` (class) - 1 example import violation(s)
- `src/SourceAuth.ts:149` `resolveSourceCredential` (const) - 1 example import violation(s)
- `src/SourceAuth.ts:178` `SourceAuthDecision` (type) - 2 example import violation(s)
- `src/SourceAuth.ts:199` `SourceAuthDecision` (const) - 1 example import violation(s)
- `src/SourceAuth.ts:228` `decideSourceAuthMount` (const) - 1 example import violation(s)
- `src/TierGate.ts:65` `TierGateSettlement` (const) - 1 example import violation(s)
- `src/TierGate.ts:87` `TierGateSettlement` (type) - 1 example import violation(s)
- `src/TierGate.ts:107` `TierGateOutcome` (const) - 1 example import violation(s)
- `src/TierGate.ts:130` `TierGateOutcome` (type) - 2 example import violation(s)
- `src/TierGate.ts:160` `TierGateAuditRecord` (class) - 1 example import violation(s)
- `src/TierGate.ts:220` `TierGateVerdict` (const) - 1 example import violation(s)
- `src/TierGate.ts:255` `TierGateVerdict` (type) - 1 example import violation(s)
- `src/TierGate.ts:280` `ToolCallRequest` (interface) - 1 example import violation(s)
- `src/TierGate.ts:330` `TierGateShape` (interface) - 2 example import violation(s)
- `src/TierGate.ts:376` `TierGate` (class) - 1 example import violation(s)
- `src/TierGate.ts:396` `TierGatePolicy` (class) - 1 example import violation(s)
- `src/TierGate.ts:466` `fromApprovedToolsPolicy` (const) - 1 example import violation(s)
- `src/TierGate.ts:518` `TierGateDispatchResult` (type) - 1 example import violation(s)
- `src/TierGate.ts:553` `TierGateDispatchResult` (const) - 1 example import violation(s)
- `src/TierGate.ts:602` `dispatchWithTierGate` (const) - 1 example import violation(s)
- `src/TierGate.ts:640` `withEnabledWhenApprovedTool` (const) - 1 example import violation(s)
- `src/ToolAnnotations.ts:42` `FourHintAnnotations` (class) - 1 example import violation(s)
- `src/ToolAnnotations.ts:101` `AnnotatedTool` (type) - 1 example import violation(s)
- `src/ToolAnnotations.ts:120` `annotateFourHints` (const) - 1 example import violation(s)
- `src/ToolAnnotations.ts:153` `readOnlyToolHints` (const) - 1 example import violation(s)
- `src/ToolAnnotations.ts:171` `destructiveWriteToolHints` (const) - 1 example import violation(s)
- `src/ToolkitComposition.ts:54` `GatedLayer` (interface) - 2 example import violation(s)
- `src/ToolkitComposition.ts:90` `gatedLayer` (const) - 1 example import violation(s)
- `src/ToolkitComposition.ts:136` `composeGatedLayers` (const) - 1 example import violation(s); 1 documentation section/link violation(s)

### @beep/agents-use-cases

Path: `packages/agents/use-cases`

Module findings:
- `src/processes/AssistantTurn/AssistantTurn.fixture.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/processes/AssistantTurn/AssistantTurn.kernel.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts:397` `RuntimeDraftRecipient` (class) - 1 example import violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.contracts.ts:446` `RuntimeCandidateDraft` (class) - 1 example import violation(s)

### @beep/observability

Path: `packages/foundation/capability/observability`

Module findings:
- `src/CauseDiagnostics.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/CauseRedaction.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/HttpError.ts:1` (packageDocumentation) - 2 example import violation(s)
- `src/Logging.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/Metric.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/Observed.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/PhaseProfiler.ts:1` (packageDocumentation) - 1 example import violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/CauseDiagnostics.ts:63` `CauseClassification` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:84` `CauseClassification` (type) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:102` `ExitOutcome` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:123` `ExitOutcome` (type) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:140` `CauseFingerprint` (class) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:207` `CauseSummary` (type) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:278` `ObservedExitSummary` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:299` `ObservedExitSummary` (type) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:428` `classifyCause` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:451` `fingerprintCause` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:476` `summarizeCause` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:527` `summarizeExit` (const) - 1 example import violation(s)
- `src/CauseDiagnostics.ts:586` `renderObservedCause` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:74` `REDACTION_PLACEHOLDER` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:94` `DEFAULT_MESSAGE_LIMIT` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:114` `DEFAULT_DETAIL_LIMIT` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:133` `RedactionChannel` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:154` `RedactionChannel` (type) - 1 example import violation(s)
- `src/CauseRedaction.ts:193` `sanitizeSensitiveText` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:218` `redactString` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:248` `RedactedCause` (class) - 1 example import violation(s)
- `src/CauseRedaction.ts:286` `RedactCauseOptions` (class) - 1 example import violation(s)
- `src/CauseRedaction.ts:380` `redactCauseSummary` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:416` `redactCause` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:446` `redactCauseForClient` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:470` `RedactedCauseError` (class) - 1 example import violation(s)
- `src/CauseRedaction.ts:506` `redactCauseEffect` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:535` `RedactedCauseLogLevel` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:556` `RedactedCauseLogLevel` (type) - 1 example import violation(s)
- `src/CauseRedaction.ts:573` `LogRedactedCauseOptions` (class) - 1 example import violation(s)
- `src/CauseRedaction.ts:618` `logRedactedCause` (const) - 1 example import violation(s)
- `src/CauseRedaction.ts:659` `tapRedactedCause` (const) - 1 example import violation(s)
- `src/CoreConfig.ts:45` `ObservabilityCoreConfig` (const) - 1 example import violation(s)
- `src/CoreConfig.ts:69` `ObservabilityCoreConfig` (type) - 1 example import violation(s)
- `src/HttpError.ts:166` `ClientHttpError` (class) - 2 example import violation(s)
- `src/HttpError.ts:205` `ServerHttpError` (class) - 2 example import violation(s)
- `src/HttpError.ts:239` `BadRequestError` (class) - 2 example import violation(s)
- `src/HttpError.ts:267` `UnauthorizedError` (class) - 2 example import violation(s)
- `src/HttpError.ts:295` `ForbiddenError` (class) - 2 example import violation(s)
- `src/HttpError.ts:323` `NotFoundError` (class) - 2 example import violation(s)
- `src/HttpError.ts:351` `ConflictError` (class) - 2 example import violation(s)
- `src/HttpError.ts:379` `UnprocessableEntityError` (class) - 2 example import violation(s)
- `src/HttpError.ts:407` `TooManyRequestsError` (class) - 2 example import violation(s)
- `src/HttpError.ts:435` `InternalServerErrorError` (class) - 2 example import violation(s)
- `src/HttpError.ts:463` `BadGatewayError` (class) - 2 example import violation(s)
- `src/HttpError.ts:491` `ServiceUnavailableError` (class) - 2 example import violation(s)
- `src/HttpError.ts:519` `GatewayTimeoutError` (class) - 2 example import violation(s)
- `src/HttpError.ts:545` `makeBadRequestError` (const) - 1 example import violation(s)
- `src/HttpError.ts:565` `makeUnauthorizedError` (const) - 1 example import violation(s)
- `src/HttpError.ts:585` `makeForbiddenError` (const) - 1 example import violation(s)
- `src/HttpError.ts:605` `makeNotFoundError` (const) - 1 example import violation(s)
- `src/HttpError.ts:625` `makeConflictError` (const) - 1 example import violation(s)
- `src/HttpError.ts:645` `makeUnprocessableEntityError` (const) - 1 example import violation(s)
- `src/HttpError.ts:665` `makeTooManyRequestsError` (const) - 1 example import violation(s)
- `src/HttpError.ts:685` `makeInternalServerError` (const) - 1 example import violation(s)
- `src/HttpError.ts:705` `makeBadGatewayError` (const) - 1 example import violation(s)
- `src/HttpError.ts:725` `makeServiceUnavailableError` (const) - 1 example import violation(s)
- `src/HttpError.ts:745` `makeGatewayTimeoutError` (const) - 1 example import violation(s)
- `src/Logging.ts:62` `LogFormat` (const) - 1 example import violation(s)
- `src/Logging.ts:83` `LogFormat` (type) - 1 example import violation(s)
- `src/Logging.ts:100` `PrettyLogTheme` (const) - 1 example import violation(s)
- `src/Logging.ts:121` `PrettyLogTheme` (type) - 1 example import violation(s)
- `src/Logging.ts:138` `BannerMode` (const) - 1 example import violation(s)
- `src/Logging.ts:159` `BannerMode` (type) - 1 example import violation(s)
- `src/Logging.ts:180` `PrettyLoggerConfig` (class) - 1 example import violation(s)
- `src/Logging.ts:209` `LoggingConfig` (class) - 1 example import violation(s)
- `src/Logging.ts:242` `layerMinimumLogLevel` (const) - 1 example import violation(s)
- `src/Logging.ts:261` `RenderLogBannerOptions` (class) - 1 example import violation(s)
- `src/Logging.ts:371` `renderLogBanner` (const) - 1 example import violation(s)
- `src/Logging.ts:461` `layerConsoleLogger` (const) - 1 example import violation(s)
- `src/Metric.ts:59` `TrackDurationOptions` (class) - 1 example import violation(s)
- `src/Metric.ts:86` `TrackDurationOptionsInput` (type) - 1 example import violation(s)
- `src/Metric.ts:160` `statusClass` (const) - 1 example import violation(s)
- `src/Metric.ts:195` `measureElapsedMillis` (const) - 1 example import violation(s)
- `src/Metric.ts:281` `trackDuration` (const) - 1 example import violation(s)
- `src/Metric.ts:409` `observeWorkflow` (const) - 1 example import violation(s)
- `src/Metric.ts:562` `observeHttpRequest` (const) - 1 example import violation(s)
- `src/Observed.ts:46` `ObservedError` (const) - 1 example import violation(s)
- `src/Observed.ts:67` `ObservedError` (type) - 1 example import violation(s)
- `src/Observed.ts:86` `ObservedErrorWithStack` (const) - 1 example import violation(s)
- `src/Observed.ts:107` `ObservedErrorWithStack` (type) - 1 example import violation(s)
- `src/Observed.ts:126` `ObservedDefect` (const) - 1 example import violation(s)
- `src/Observed.ts:147` `ObservedDefect` (type) - 1 example import violation(s)
- `src/Observed.ts:166` `ObservedDefectWithStack` (const) - 1 example import violation(s)
- `src/Observed.ts:187` `ObservedDefectWithStack` (type) - 1 example import violation(s)
- `src/Observed.ts:208` `ObservedCauseReason` (const) - 1 example import violation(s)
- `src/Observed.ts:229` `ObservedCauseReason` (type) - 1 example import violation(s)
- `src/Observed.ts:248` `ObservedCause` (const) - 1 example import violation(s)
- `src/Observed.ts:269` `ObservedCause` (type) - 1 example import violation(s)
- `src/Observed.ts:288` `ObservedExit` (const) - 1 example import violation(s)
- `src/Observed.ts:309` `ObservedExit` (type) - 1 example import violation(s)
- `src/PhaseProfiler.ts:75` `PhaseOutcome` (const) - 1 example import violation(s)
- `src/PhaseProfiler.ts:96` `PhaseOutcome` (type) - 1 example import violation(s)
- `src/PhaseProfiler.ts:122` `PhaseProfile` (class) - 1 example import violation(s)
- `src/PhaseProfiler.ts:307` `profilePhase` (const) - 1 example import violation(s)
- `src/server/DevTools.ts:37` `DevToolsSpanFilter` (const) - 1 example import violation(s)
- `src/server/DevTools.ts:63` `DevToolsSpanFilter` (type) - 1 example import violation(s)

### @beep/law-practice-domain

Path: `packages/law-practice/domain`

Module findings:
- `src/values/Citation/Citation.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/CitationBase/CitationBase.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/CitationType/CitationType.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/CitationWarning/CitationWarning.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ComponentSpan/ComponentSpan.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/CourtInference/CourtInference.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/DurableLocator/DurableLocator.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/FullCitationType/FullCitationType.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ShortFormCitationType/ShortFormCitationType.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/values/KindCode/KindCode.model.ts:37` `KindCode` (const) - 1 documentation section/link violation(s)
- `src/values/OfficeCode/OfficeCode.model.ts:38` `OfficeCode` (const) - 1 documentation section/link violation(s)
- `src/values/PatentDocument/PatentDocument.normalizer.ts:501` `normalizePatentApplicationDocument` (const) - 1 example import violation(s)
- `src/values/PatentDocumentTriplet/PatentDocumentTriplet.model.ts:61` `PatentDocumentTriplet` (const) - 4 documentation section/link violation(s)
- `src/values/PatentNumber/PatentNumber.model.ts:38` `PatentNumber` (const) - 1 documentation section/link violation(s)

### @beep/epistemic-use-cases

Path: `packages/epistemic/use-cases`

Module findings:
- `src/ClaimDisposition/ClaimDisposition.commands.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClaimDisposition/ClaimDisposition.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClaimGate/ClaimGate.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClaimLifecycle/ClaimLifecycle.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClaimProjection/ClaimProjection.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ContradictionTriage/ContradictionTriage.commands.ts:1` (none) - missing summary; missing @since
- `src/ContradictionTriage/ContradictionTriage.rpc.ts:1` (none) - missing summary; missing @since
- `src/EdgeAuthority/EdgeAuthority.commands.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/EdgeAuthority/EdgeAuthority.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ExecutionLedger/ExecutionLedger.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ExecutionLedger/ExecutionLedger.ports.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/api-transport

Path: `packages/foundation/capability/api-transport`

Module findings:
- `src/EgressDenied.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Transport.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/EgressDenied.ts:46` `EgressDenied` (class) - 1 example import violation(s)
- `src/Transport.ts:67` `ApiAuth` (const) - 1 example import violation(s)
- `src/Transport.ts:114` `ApiAuth` (type) - 1 example import violation(s)
- `src/Transport.ts:177` `RateLimitSnapshot` (class) - 1 example import violation(s)
- `src/Transport.ts:277` `ApiTransportOptions` (class) - 1 example import violation(s)
- `src/Transport.ts:351` `ApiTransport` (interface) - 1 example import violation(s)
- `src/Transport.ts:390` `makeApiTransport` (const) - 1 example import violation(s)

### @beep/epistemic-config

Path: `packages/epistemic/config`

Module findings:
- `src/Audience.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ServerConfig.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/TestLayer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/postgres

Path: `packages/drivers/postgres`

Export findings:
- `src/PostgresDiagnostics.service.ts:367` `formatPostgresErrorWith` (const) - 1 example import violation(s)

### @beep/epistemic-tables

Path: `packages/epistemic/tables`

Module findings:
- `src/entities/EdgeVersion/EdgeVersion.converters.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/entities/EdgeVersion/EdgeVersion.table.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ExecutionRecord/ExecutionRecord.converters.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/values/ExecutionRecord/ExecutionRecord.table.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/chalk

Path: `packages/foundation/capability/chalk`

Module findings:
- `src/Chalk.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/Chalk.ts:93` `ChalkInstance` (interface) - 1 example import violation(s)
- `src/Chalk.ts:127` `Chalk` (type) - 1 example import violation(s)
- `src/Chalk.ts:158` `Chalk` (const) - 1 example import violation(s)
- `src/Chalk.ts:181` `BackgroundColorName` (const) - 1 example import violation(s)
- `src/Chalk.ts:198` `BackgroundColorName` (type) - 1 example import violation(s)
- `src/Chalk.ts:221` `ChalkConstructorOptions` (const) - 1 example import violation(s)
- `src/Chalk.ts:243` `ChalkConstructorOptions` (type) - 1 example import violation(s)
- `src/Chalk.ts:266` `ChalkOptions` (const) - 1 example import violation(s)
- `src/Chalk.ts:283` `ChalkOptions` (type) - 1 example import violation(s)
- `src/Chalk.ts:306` `ColorInfo` (const) - 1 example import violation(s)
- `src/Chalk.ts:323` `ColorInfo` (type) - 1 example import violation(s)
- `src/Chalk.ts:346` `ColorName` (const) - 1 example import violation(s)
- `src/Chalk.ts:363` `ColorName` (type) - 1 example import violation(s)
- `src/Chalk.ts:391` `ColorSupport` (const) - 1 example import violation(s)
- `src/Chalk.ts:408` `ColorSupport` (type) - 1 example import violation(s)
- `src/Chalk.ts:430` `ColorSupportLevel` (const) - 1 example import violation(s)
- `src/Chalk.ts:447` `ColorSupportLevel` (type) - 1 example import violation(s)
- `src/Chalk.ts:470` `ColorSupportLevelInput` (const) - 1 example import violation(s)
- `src/Chalk.ts:487` `ColorSupportLevelInput` (type) - 1 example import violation(s)
- `src/Chalk.ts:510` `ForegroundColorName` (const) - 1 example import violation(s)
- `src/Chalk.ts:527` `ForegroundColorName` (type) - 1 example import violation(s)
- `src/Chalk.ts:550` `ModifierName` (const) - 1 example import violation(s)
- `src/Chalk.ts:567` `ModifierName` (type) - 1 example import violation(s)
- `src/Chalk.ts:584` `modifierNames` (const) - 1 example import violation(s)
- `src/Chalk.ts:601` `foregroundColorNames` (const) - 1 example import violation(s)
- `src/Chalk.ts:618` `backgroundColorNames` (const) - 1 example import violation(s)
- `src/Chalk.ts:635` `colorNames` (const) - 1 example import violation(s)
- `src/Chalk.ts:652` `modifiers` (const) - 1 example import violation(s)
- `src/Chalk.ts:669` `foregroundColors` (const) - 1 example import violation(s)
- `src/Chalk.ts:686` `backgroundColors` (const) - 1 example import violation(s)
- `src/Chalk.ts:703` `colors` (const) - 1 example import violation(s)
- `src/Chalk.ts:725` `supportsColor` (const) - 1 example import violation(s)
- `src/Chalk.ts:747` `supportsColorStderr` (const) - 1 example import violation(s)
- `src/Chalk.ts:774` `chalkStderr` (const) - 1 example import violation(s)
- `src/Chalk.ts:806` `default` (const) - 1 example import violation(s)

### @beep/technical-drawing

Path: `packages/foundation/capability/technical-drawing`

Export findings:
- `src/Approval.rules.ts:50` `textLines` (const) - 1 example import violation(s)
- `src/Approval.rules.ts:67` `authoredLines` (const) - 1 example import violation(s)
- `src/Approval.rules.ts:118` `verifyConfirmation` (const) - 1 example import violation(s)
- `src/Approval.schemas.ts:38` `approvalStatement` (const) - 1 example import violation(s)
- `src/Approval.schemas.ts:56` `EmailAddress` (const) - 1 example import violation(s)
- `src/Approval.schemas.ts:74` `EmailAddress` (type) - 1 example import violation(s)
- `src/Approval.schemas.ts:102` `EmailConfirmation` (class) - 1 example import violation(s)
- `src/Approval.schemas.ts:137` `PdfConfirmation` (class) - 1 example import violation(s)
- `src/Approval.schemas.ts:174` `Confirmation` (const) - 1 example import violation(s)
- `src/Approval.schemas.ts:197` `Confirmation` (type) - 2 example import violation(s)
- `src/Approval.schemas.ts:220` `ApprovalRefusalReason` (const) - 1 example import violation(s)
- `src/Approval.schemas.ts:243` `ApprovalRefusalReason` (type) - 1 example import violation(s)
- `src/Approval.schemas.ts:277` `ApprovalRecord` (class) - 1 example import violation(s)
- `src/Approval.service.ts:45` `ConfirmationSource` (const) - 1 example import violation(s)
- `src/Approval.service.ts:81` `ConfirmationSource` (type) - 2 example import violation(s)
- `src/Approval.service.ts:102` `SignRequest` (class) - 1 example import violation(s)
- `src/Approval.service.ts:131` `SheetSetApprovalShape` (interface) - 1 example import violation(s)
- `src/Approval.service.ts:257` `SheetSetApproval` (class) - 1 example import violation(s)
- `src/FigureSet.service.ts:91` `RenderRequest` (class) - 1 example import violation(s)
- `src/FigureSet.service.ts:142` `FigureSetShape` (interface) - 1 example import violation(s)
- `src/FigureSet.service.ts:620` `FigureSet` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:37` `Vec3` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:58` `Vec3` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:74` `PositiveLength` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:102` `PositiveLength` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:119` `Rotation` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:162` `Box` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:192` `Prism` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:228` `Cylinder` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:258` `Primitive` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:281` `Primitive` (type) - 2 example import violation(s)
- `src/Geometry.schemas.ts:310` `PartLineStyle` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:332` `PartLineStyle` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:368` `Part` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:416` `LengthUnit` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:438` `LengthUnit` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:457` `ModelSpec` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:503` `Camera` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:536` `Segment2` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:557` `Segment2` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:594` `ShadingSkipReason` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:617` `ShadingSkipReason` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:633` `ShadingSkip` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:667` `ShadingCoverage` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:710` `EdgeSet` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:761` `ShadingStyle` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:783` `ShadingStyle` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:811` `HatchAxis` (const) - 1 example import violation(s)
- `src/Geometry.schemas.ts:833` `HatchAxis` (type) - 1 example import violation(s)
- `src/Geometry.schemas.ts:879` `ShadingPlan` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:959` `BoundingBox` (class) - 1 example import violation(s)
- `src/Geometry.schemas.ts:995` `ModelSummary` (class) - 1 example import violation(s)
- `src/Geometry.segments.ts:47` `canonicalSegments` (const) - 1 example import violation(s)
- `src/Geometry.segments.ts:69` `mirrorSegments` (const) - 1 example import violation(s)
- `src/Geometry.segments.ts:97` `sameSegments` (const) - 1 example import violation(s)
- `src/Manifest.digest.ts:34` `sha256Hex` (const) - 1 example import violation(s)
- `src/Manifest.schemas.ts:33` `Sha256Hex` (const) - 1 example import violation(s)
- `src/Manifest.schemas.ts:61` `Sha256Hex` (type) - 1 example import violation(s)
- `src/Manifest.schemas.ts:77` `EngineInfo` (class) - 1 example import violation(s)
- `src/Manifest.schemas.ts:106` `FigureRecord` (class) - 1 example import violation(s)
- `src/Manifest.schemas.ts:159` `OmissionProof` (class) - 1 example import violation(s)
- `src/Manifest.schemas.ts:255` `RenderManifest` (class) - 1 example import violation(s)
- `src/Shading.rules.ts:86` `viewFactsOf` (const) - 1 example import violation(s)
- `src/Shading.rules.ts:167` `aspectOf` (const) - 2 example import violation(s)
- `src/Shading.rules.ts:468` `legibleShading` (const) - 1 example import violation(s)
- `src/Shading.rules.ts:613` `hatchDirectionOf` (const) - 1 example import violation(s)
- `src/Shading.rules.ts:693` `anchorOf` (const) - 1 example import violation(s)
- `src/Shading.rules.ts:875` `treatmentFor` (const) - 1 example import violation(s)
- `src/Shading.schemas.ts:215` `FaceFacts` (class) - 1 example import violation(s)
- `src/Sheet.compose.ts:219` `labelWidthPt` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:242` `strokeLabel` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:282` `viewExtents` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:422` `sheetGeometry` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:439` `commonScale` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:599` `drawnBrokenGapMm` (const) - 1 example import violation(s)
- `src/Sheet.compose.ts:650` `composeSheet` (const) - 2 example import violation(s)
- `src/Sheet.schemas.ts:35` `SheetFormat` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:57` `SheetFormat` (type) - 1 example import violation(s)
- `src/Sheet.schemas.ts:82` `PT_PER_CM` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:98` `PT_PER_MM` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:114` `PagePoints` (class) - 1 example import violation(s)
- `src/Sheet.schemas.ts:144` `pageSizePt` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:165` `MARGINS_CM` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:181` `MIN_LETTER_HEIGHT_CM` (const) - 1 example import violation(s)
- `src/Sheet.schemas.ts:690` `SheetOptions` (class) - 1 example import violation(s)
- `src/TechnicalDrawing.errors.ts:40` `DrawingErrorReason` (const) - 1 example import violation(s)
- `src/TechnicalDrawing.errors.ts:63` `DrawingErrorReason` (type) - 1 example import violation(s)
- `src/TechnicalDrawing.errors.ts:87` `DrawingError` (class) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:41` `GeometryEngineShape` (interface) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:67` `GeometryEngine` (class) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:89` `PdfBackendShape` (interface) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:127` `PdfBackend` (class) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:144` `MailReaderShape` (interface) - 1 example import violation(s)
- `src/TechnicalDrawing.ports.ts:163` `MailReader` (class) - 1 example import violation(s)
- `src/Validation.rules.ts:73` `structuralFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:180` `labelTextFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:218` `marginFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:272` `purityFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:325` `shadingSpacingFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:372` `shadingCoverageFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:408` `shadingOutlineClearanceFindings` (const) - 1 example import violation(s)
- `src/Validation.rules.ts:468` `shadingLoneLineFindings` (const) - 1 example import violation(s)
- `src/Validation.schemas.ts:31` `PdfPageSize` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:55` `PdfFontFact` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:105` `PdfFacts` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:133` `InkBounds` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:164` `PageMetrics` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:218` `FindingCode` (const) - 1 example import violation(s)
- `src/Validation.schemas.ts:240` `FindingCode` (type) - 1 example import violation(s)
- `src/Validation.schemas.ts:258` `SheetFinding` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:326` `ValidationOptions` (class) - 1 example import violation(s)
- `src/Validation.schemas.ts:393` `ValidationReport` (class) - 1 example import violation(s)
- `src/View.schemas.ts:51` `ViewName` (const) - 1 example import violation(s)
- `src/View.schemas.ts:73` `ViewName` (type) - 1 example import violation(s)
- `src/View.schemas.ts:204` `isPerspectiveView` (const) - 1 example import violation(s)
- `src/View.schemas.ts:226` `CameraForViewInput` (class) - 1 example import violation(s)
- `src/View.schemas.ts:290` `cameraForView` (const) - 1 example import violation(s)
- `src/View.schemas.ts:354` `FigureSpec` (class) - 1 example import violation(s)
- `src/View.schemas.ts:395` `OmissionRelation` (const) - 1 example import violation(s)
- `src/View.schemas.ts:417` `OmissionRelation` (type) - 1 example import violation(s)
- `src/View.schemas.ts:434` `OmissionClaim` (class) - 1 example import violation(s)
- `src/View.schemas.ts:477` `FigureSetSpec` (class) - 1 example import violation(s)

### @beep/pretext

Path: `packages/drivers/pretext`

Module findings:
- `src/Pretext.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pretext.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PretextCapture.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PretextCapture.test-layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/browser.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/ontology-use-cases

Path: `packages/ontology/use-cases`

Module findings:
- `src/aggregates/Session/worker.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/aggregates/Session/Session.worker-protocol.ts:285` `encodeWorkerCommand` (const) - 1 documentation section/link violation(s)
- `src/aggregates/Session/Session.worker-protocol.ts:326` `encodeWorkerResult` (const) - 1 documentation section/link violation(s)
- `src/aggregates/Session/Session.worker-protocol.ts:367` `OntologyWorkerUndecodableCommand` (class) - 1 documentation section/link violation(s)

### @beep/agents-client

Path: `packages/agents/client`

Module findings:
- `src/Chat.atoms.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClientObservability.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Chat.atoms.ts:718` `SendTurnRequest` (class) - 1 example import violation(s)
- `src/Chat.atoms.ts:750` `EditTurnRequest` (class) - 1 example import violation(s)
- `src/Chat.atoms.ts:788` `TurnRequest` (const) - 1 example import violation(s)
- `src/Chat.atoms.ts:816` `TurnRequest` (type) - 1 example import violation(s)
- `src/Chat.atoms.ts:890` `runTurnAtom` (const) - 1 example import violation(s)

### @beep/law-practice-tables

Path: `packages/law-practice/tables`

Module findings:
- `src/Tables.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/law-practice-use-cases

Path: `packages/law-practice/use-cases`

Module findings:
- `src/IrToLaw/IrToLaw.ports.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/IrToLaw/IrToLaw.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OfficeActionReview/OfficeActionReview.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PracticeKg.tools.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/PracticeKg.tools.ts:265` `PracticeKgToolResult` (class) - 1 example import violation(s)

### @beep/tika

Path: `packages/drivers/tika`

Module findings:
- `src/Tika.error-translation.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Tika.response.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Tika.server.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Tika.response.ts:151` `readTikaContentText` (const) - 1 example import violation(s)
- `src/Tika.server.ts:171` `makeTikaServerFileProcessingEngine` (const) - 1 documentation section/link violation(s)
- `src/Tika.server.ts:316` `makeTikaServerFileProcessingEngineFromEnv` (const) - 1 documentation section/link violation(s)
- `src/Tika.tikaapp.ts:98` `makeTikaAppFileProcessingEngine` (const) - 1 documentation section/link violation(s)

### @beep/libpff

Path: `packages/drivers/libpff`

Module findings:
- `src/Libpff.eml.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Libpff.error-translation.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Libpff.messages.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Libpff.pffexport.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Libpff.eml.ts:186` `rfc5322DateFromOutlookTimestamp` (const) - 1 example import violation(s)
- `src/Libpff.eml.ts:432` `assembleEml` (const) - 1 example import violation(s)

### @beep/box

Path: `packages/drivers/box`

Export findings:
- `src/Box.streaming.ts:437` `BoxUploadFilePartByUrlPayload` (class) - 1 example import violation(s)
- `src/Box.streaming.ts:597` `BoxGetZipDownloadContentPayload` (class) - 1 example import violation(s)

### @beep/epistemic-server

Path: `packages/epistemic/server`

Module findings:
- `src/ClaimDisposition/ClaimDisposition.repo.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/EdgeAuthority/EdgeAuthority.repo.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ExecutionLedger/ExecutionLedger.repo.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/GovernedEgress/GovernedEgress.fetch.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/GovernedEgress/GovernedEgress.layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/GovernedTierGate/GovernedTierGate.gate.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/GovernedTierGate/GovernedTierGate.layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/GovernedEgress/GovernedEgress.fetch.ts:214` `makeGovernedEgressFetch` (const) - 1 documentation section/link violation(s)
- `src/GovernedTierGate/GovernedTierGate.gate.ts:129` `GovernedTierGateOptions` (class) - 1 documentation section/link violation(s)
- `src/GovernedTierGate/GovernedTierGate.gate.ts:186` `refusalGuidance` (const) - 1 documentation section/link violation(s)
- `src/GovernedTierGate/GovernedTierGate.gate.ts:243` `makeGovernedTierGate` (const) - 1 documentation section/link violation(s)

### @beep/m365

Path: `packages/drivers/m365`

Module findings:
- `src/M365.auth.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/M365.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/nlp-processing

Path: `packages/foundation/capability/nlp-processing`

Module findings:
- `src/Backend/Composition.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Backend/NLPBackend.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/AnnotatedTextGraph.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/EffectGraph.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/Catalog.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/Errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/Executor.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/Operation.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/ResultStore.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/GraphOperations/Types.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/TextGraph.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph/TypeClass.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/NLPService.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/ui

Path: `packages/foundation/ui-system/ui`

Module findings:
- `src/index.ts:1` (packageDocumentation) - 1 example import violation(s)

Export findings:
- `src/index.ts:29` `export { VERSION } from "./Version.ts";` (re-export) - 1 example import violation(s)

### @beep/repo-docgen

Path: `packages/tooling/tool/docgen`

Export findings:
- `src/ProofManifest.ts:162` `DocgenProofManifestFile` (class) - 1 example import violation(s)
- `src/ProofManifest.ts:198` `DocgenProofManifestFingerprint` (class) - 1 example import violation(s)
- `src/ProofManifest.ts:263` `DocgenProofManifest` (class) - 1 example import violation(s)

### @beep/skill-contract

Path: `packages/foundation/modeling/skill-contract`

Export findings:
- `src/EvidenceLadder.ts:34` `EvidenceReceiptReference` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:59` `EvidenceLadderReceiptTypes` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:85` `Accepted` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:111` `Persisted` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:138` `Delivered` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:166` `SemanticallyApplied` (class) - 1 example import violation(s)
- `src/EvidenceLadder.ts:195` `EvidenceLadderState` (const) - 1 example import violation(s)
- `src/EvidenceLadder.ts:254` `evidenceLadderFor` (const) - 1 example import violation(s)
- `src/EvidenceLadder.ts:289` `transportCompleted` (const) - 1 example import violation(s)
- `src/EvidenceLadder.ts:309` `advanceToPersisted` (const) - 1 example import violation(s)
- `src/EvidenceLadder.ts:335` `advanceToDelivered` (const) - 1 example import violation(s)
- `src/EvidenceLadder.ts:361` `advanceToSemanticallyApplied` (const) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:42` `EvidenceDigest` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:74` `EvidenceSubject` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:131` `EvidenceReceipt` (const) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:157` `AttestationResource` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:181` `GateSummaryVerifier` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:205` `GateVerificationResult` (const) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:233` `GateVerifiedLevel` (const) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:281` `GateResultSummary` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:358` `GateSummary` (class) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:379` `GateSummaryPredicateType` (const) - 1 example import violation(s)
- `src/EvidenceReceipt.ts:397` `GateSummaryReceipt` (const) - 1 example import violation(s)
- `src/Gate.ts:41` `GateId` (const) - 1 example import violation(s)
- `src/Gate.ts:80` `makeGateId` (const) - 1 example import violation(s)
- `src/Gate.ts:103` `GateSeverity` (const) - 1 example import violation(s)
- `src/Gate.ts:131` `GateApplicabilityKind` (const) - 1 example import violation(s)
- `src/Gate.ts:159` `AlwaysGateApplicability` (class) - 1 example import violation(s)
- `src/Gate.ts:190` `ConditionalGateApplicability` (class) - 1 example import violation(s)
- `src/Gate.ts:222` `GateApplicability` (const) - 1 example import violation(s)
- `src/Gate.ts:254` `EvidencePredicateType` (const) - 1 example import violation(s)
- `src/Gate.ts:286` `GateEvidenceRequirement` (class) - 1 example import violation(s)
- `src/Gate.ts:326` `GateDeclaration` (class) - 1 example import violation(s)
- `src/Gate.ts:379` `GateRegistry` (class) - 1 example import violation(s)
- `src/Gate.ts:400` `GateOutcome` (const) - 1 example import violation(s)
- `src/Gate.ts:520` `GateAuditRecord` (const) - 1 example import violation(s)
- `src/Gate.ts:586` `GateVerdict` (const) - 1 example import violation(s)
- `src/Recovery.ts:66` `BudgetDuration` (const) - 1 example import violation(s)
- `src/Recovery.ts:94` `RecoveryBudget` (class) - 1 example import violation(s)
- `src/Recovery.ts:120` `RecoveryBudgetConsumed` (class) - 1 example import violation(s)
- `src/Recovery.ts:145` `RecoveryAttemptOutcome` (const) - 1 example import violation(s)
- `src/Recovery.ts:173` `RecoveryAttemptReceipt` (class) - 1 example import violation(s)
- `src/Recovery.ts:202` `FailureTerminalReason` (const) - 1 example import violation(s)
- `src/Recovery.ts:314` `FailureReceiptPredicate` (class) - 1 example import violation(s)
- `src/Recovery.ts:335` `FailurePredicateType` (const) - 1 example import violation(s)
- `src/Recovery.ts:353` `FailureReceipt` (const) - 1 example import violation(s)
- `src/Recovery.ts:377` `NoRecoveryPolicy` (class) - 1 example import violation(s)
- `src/Recovery.ts:400` `BoundedRecoveryPolicy` (class) - 1 example import violation(s)
- `src/Recovery.ts:431` `RecoveryPolicy` (const) - 1 example import violation(s)
- `src/SchemaReference.ts:27` `SchemaReferenceId` (const) - 1 example import violation(s)
- `src/SchemaReference.ts:64` `SchemaReference` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:61` `SkillCompletionReceipt` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:117` `SkillCompletion` (const) - 1 example import violation(s)
- `src/SkillCompletion.ts:144` `toSkillCompletionReceipt` (const) - 1 example import violation(s)
- `src/SkillCompletion.ts:167` `EvaluateSkillCompletionInput` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:195` `CompletionInvariantReason` (const) - 1 example import violation(s)
- `src/SkillCompletion.ts:234` `CompletionInvariantError` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:260` `CompletionAllowed` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:286` `CompletionDenied` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:312` `CompletionEvaluation` (const) - 1 example import violation(s)
- `src/SkillCompletion.ts:395` `evaluateSkillCompletion` (const) - 1 example import violation(s)
- `src/SkillCompletion.ts:462` `LiveVerified` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:488` `DeployableBlocked` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:516` `FailedWithPartialEffects` (class) - 1 example import violation(s)
- `src/SkillCompletion.ts:543` `SkillTerminal` (const) - 1 example import violation(s)
- `src/SkillContract.ts:33` `SkillContractId` (const) - 1 example import violation(s)
- `src/SkillContract.ts:62` `ReceiptTypeBindings` (class) - 1 example import violation(s)
- `src/SkillContract.ts:94` `SkillContract` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:66` `SkillMarkdownProjection` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:92` `SkillArtifactDenialReason` (const) - 1 example import violation(s)
- `src/SkillProjection.ts:130` `SkillArtifactCheck` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:181` `SkillArtifactAllowed` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:207` `SkillArtifactDenied` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:234` `SkillArtifactVerdict` (const) - 1 example import violation(s)
- `src/SkillProjection.ts:265` `VerifySkillArtifactInput` (class) - 1 example import violation(s)
- `src/SkillProjection.ts:371` `projectSkillDocument` (const) - 1 example import violation(s)
- `src/SkillProjection.ts:403` `renderSkillMarkdown` (const) - 1 example import violation(s)
- `src/SkillProjection.ts:444` `decodeSkillFrontmatter` (const) - 1 example import violation(s)
- `src/SkillProjection.ts:553` `verifySkillArtifact` (const) - 1 example import violation(s)

### @beep/exiftool

Path: `packages/drivers/exiftool`

Module findings:
- `src/ExiftoolConfig.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/repo-ai-metrics

Path: `packages/tooling/library/ai-metrics`

Export findings:
- `src/forwarder.ts:139` `AiMetricsForwarderInput` (class) - 1 example import violation(s)
- `src/forwarder.ts:1023` `runAiMetricsForwarder` (const) - 1 example import violation(s)

### @beep/obs

Path: `packages/drivers/obs`

Module findings:
- `src/Obs.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ObsProtocol.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ObsProtocol.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/repo-configs

Path: `packages/tooling/policy-pack/repo-configs`

Export findings:
- `src/next/models/ImageConfig.schema.ts:238` `ImageConfigComplete` (class) - 1 documentation section/link violation(s)

### @beep/qa-capture

Path: `packages/tooling/library/qa-capture`

Module findings:
- `src/ActionEvent.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ClockCorrelator.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Collector.api.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Collector.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ExtractionPlan.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ExtractionPlanner.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/QaCapture.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/SessionStore.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Witness.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/dock

Path: `packages/foundation/ui-system/dock`

Export findings:
- `src/AnchoredBox.ts:27` `TopLeft` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:48` `TopRight` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:69` `BottomLeft` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:90` `BottomRight` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:111` `AnchoredSize` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:131` `TopLeftAnchoredBox` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:155` `TopRightAnchoredBox` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:179` `BottomRightAnchoredBox` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:203` `BottomLeftAnchoredBox` (class) - 1 example import violation(s)
- `src/AnchoredBox.ts:233` `AnchoredBox` (const) - 1 example import violation(s)
- `src/AnchoredBox.ts:262` `AnchoredBox` (type) - 1 example import violation(s)
- `src/AnchoredBox.ts:284` `AnchoredBox` (namespace) - 1 example import violation(s)
- `src/Dock.atoms.ts:53` `DockAtomObservabilityLive` (const) - 1 example import violation(s)
- `src/Dock.atoms.ts:211` `makeDockAtomsWith` (const) - 1 example import violation(s)
- `src/Dock.atoms.ts:244` `makeDockAtoms` (const) - 1 example import violation(s)
- `src/Dock.commands.ts:34` `UserCommandOrigin` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:59` `ApiCommandOrigin` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:86` `CommandOrigin` (const) - 1 example import violation(s)
- `src/Dock.commands.ts:110` `CommandOrigin` (type) - 1 example import violation(s)
- `src/Dock.commands.ts:127` `OpenPanelCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:153` `ActivatePanelCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:179` `UpdatePanelCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:199` `MovePanelCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:225` `MoveGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:246` `UpdateGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:266` `ClosePanelCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:291` `ResizeSplitCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:317` `ClearWorkspaceCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:341` `MaximizeGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:361` `RestoreMaximizedCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:381` `FloatGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:400` `DockFloatingGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:419` `MoveFloatingGroupCommand` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:456` `DockCommand` (const) - 1 example import violation(s)
- `src/Dock.commands.ts:495` `DockCommand` (type) - 1 example import violation(s)
- `src/Dock.commands.ts:512` `DockCommandEnvelope` (class) - 1 example import violation(s)
- `src/Dock.commands.ts:538` `AllowedRenderers` (const) - 1 example import violation(s)
- `src/Dock.commands.ts:561` `AllowedRenderers` (type) - 1 example import violation(s)
- `src/Dock.commands.ts:578` `RestoreSnapshotRequest` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:29` `DockRejectionReason` (const) - 1 example import violation(s)
- `src/Dock.errors.ts:64` `DockRejectionReason` (type) - 1 example import violation(s)
- `src/Dock.errors.ts:81` `DockCommandRejected` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:108` `DockInvariantReason` (const) - 1 example import violation(s)
- `src/Dock.errors.ts:135` `DockInvariantReason` (type) - 1 example import violation(s)
- `src/Dock.errors.ts:152` `DockInvariantViolation` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:178` `DockInputBoundary` (const) - 1 example import violation(s)
- `src/Dock.errors.ts:198` `DockInputBoundary` (type) - 1 example import violation(s)
- `src/Dock.errors.ts:215` `DockInputError` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:241` `DockPersistenceOperation` (const) - 1 example import violation(s)
- `src/Dock.errors.ts:261` `DockPersistenceOperation` (type) - 1 example import violation(s)
- `src/Dock.errors.ts:278` `DockPersistenceError` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:304` `DockSnapshotMissing` (class) - 1 example import violation(s)
- `src/Dock.errors.ts:329` `DockTransitionError` (const) - 1 example import violation(s)
- `src/Dock.errors.ts:351` `DockTransitionError` (type) - 1 example import violation(s)
- `src/Dock.events.ts:31` `PanelOpenedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:57` `PanelActivatedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:83` `PanelTitleChangedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:103` `PanelViewChangedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:123` `PanelRenderModeChangedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:144` `PanelTabComponentChangedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:173` `PanelConstraintsChangedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:202` `PanelMovedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:230` `PanelReorderedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:250` `GroupMergedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:272` `GroupMovedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:292` `GroupUpdatedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:312` `PanelClosedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:338` `SplitResizedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:364` `WorkspaceClearedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:389` `WorkspaceRestoredEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:415` `GroupMaximizedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:435` `GroupRestoredEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:454` `GroupFloatedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:473` `GroupDockedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:492` `FloatingGroupMovedEvent` (class) - 1 example import violation(s)
- `src/Dock.events.ts:536` `DockEvent` (const) - 1 example import violation(s)
- `src/Dock.events.ts:582` `DockEvent` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:30` `PanelId` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:51` `PanelId` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:69` `GroupId` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:90` `GroupId` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:108` `SplitId` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:129` `SplitId` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:147` `CommandId` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:168` `CommandId` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:186` `RendererKey` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:207` `RendererKey` (type) - 1 example import violation(s)
- `src/Dock.ids.ts:225` `SplitRatio` (const) - 1 example import violation(s)
- `src/Dock.ids.ts:254` `SplitRatio` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:49` `PanelRenderMode` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:69` `PanelRenderMode` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:86` `PanelParameterValue` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:106` `PanelParameterValue` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:123` `PanelParameters` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:143` `PanelParameters` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:160` `ComponentPanelView` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:186` `TextPanelView` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:211` `PanelView` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:233` `PanelView` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:262` `PanelConstraints` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:289` `Panel` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:340` `PanelPatch` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:372` `GroupLockedMode` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:390` `GroupLockedMode` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:407` `GroupHeaderPosition` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:425` `GroupHeaderPosition` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:442` `GroupMetadata` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:472` `GroupPatch` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:509` `TabsNode` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:675` `HorizontalSplitLayout` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:704` `VerticalSplitLayout` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:735` `SplitLayout` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:802` `SplitLayout` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:821` `SplitNode` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:915` `DockNode` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1060` `DockNode` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1103` `DockNode` (namespace) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1173` `FloatingMember` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1193` `EmptyWorkspace` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1221` `PopulatedWorkspace` (class) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1302` `DockWorkspace` (const) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1520` `DockWorkspace` (type) - 1 example import violation(s)
- `src/Dock.models-tree.ts:1537` `DockSnapshot` (class) - 1 example import violation(s)
- `src/Dock.outcomes.ts:32` `DockUnchangedReason` (const) - 1 example import violation(s)
- `src/Dock.outcomes.ts:63` `DockUnchangedReason` (type) - 1 example import violation(s)
- `src/Dock.outcomes.ts:81` `DockChanged` (class) - 1 example import violation(s)
- `src/Dock.outcomes.ts:109` `DockUnchanged` (class) - 1 example import violation(s)
- `src/Dock.outcomes.ts:136` `DockMutationResult` (const) - 1 example import violation(s)
- `src/Dock.outcomes.ts:158` `DockMutationResult` (type) - 1 example import violation(s)
- `src/Dock.outcomes.ts:176` `DockMutationOutcome` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:31` `RootPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:56` `TabPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:83` `DockSide` (const) - 1 example import violation(s)
- `src/Dock.placement.ts:103` `DockSide` (type) - 1 example import violation(s)
- `src/Dock.placement.ts:120` `SplitPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:154` `RootSplitPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:182` `GroupSplitPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:210` `GroupRootSplitPlacement` (class) - 1 example import violation(s)
- `src/Dock.placement.ts:239` `DockPlacement` (const) - 1 example import violation(s)
- `src/Dock.placement.ts:263` `DockPlacement` (type) - 1 example import violation(s)
- `src/Dock.placement.ts:280` `DockMoveTarget` (const) - 1 example import violation(s)
- `src/Dock.placement.ts:301` `DockMoveTarget` (type) - 1 example import violation(s)
- `src/Dock.placement.ts:318` `DockGroupMoveTarget` (const) - 1 example import violation(s)
- `src/Dock.placement.ts:339` `DockGroupMoveTarget` (type) - 1 example import violation(s)
- `src/Dock.protocol.ts:38` `DispatchDockCommand` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:63` `DispatchUnknownDockCommand` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:88` `SaveDockSnapshot` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:112` `RestoreDockSnapshot` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:137` `DockAtomOperationKind` (const) - 1 example import violation(s)
- `src/Dock.protocol.ts:162` `DockAtomOperationKind` (type) - 1 example import violation(s)
- `src/Dock.protocol.ts:179` `DockAtomOperation` (const) - 1 example import violation(s)
- `src/Dock.protocol.ts:208` `DockAtomOperation` (type) - 1 example import violation(s)
- `src/Dock.protocol.ts:226` `DockMutationCompleted` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:251` `DockSnapshotSaved` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:278` `DockAtomOperationOutcome` (const) - 1 example import violation(s)
- `src/Dock.protocol.ts:302` `DockAtomOperationOutcome` (type) - 1 example import violation(s)
- `src/Dock.protocol.ts:319` `DockAtomSessionError` (const) - 1 example import violation(s)
- `src/Dock.protocol.ts:346` `DockAtomSessionError` (type) - 1 example import violation(s)
- `src/Dock.protocol.ts:364` `DockAtomFeedSuccess` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:392` `DockAtomFeedFailure` (class) - 1 example import violation(s)
- `src/Dock.protocol.ts:420` `DockAtomFeedEntry` (const) - 1 example import violation(s)
- `src/Dock.protocol.ts:442` `DockAtomFeedEntry` (type) - 1 example import violation(s)
- `src/DockEngine.service.ts:93` `DockEngineShape` (interface) - 2 example import violation(s)
- `src/DockEngine.service.ts:134` `DockEngine` (class) - 1 example import violation(s)
- `src/DockEngine.service.ts:169` `DockEngineLive` (const) - 1 example import violation(s)
- `src/DockEngine.service.ts:192` `DockSnapshotStoreShape` (interface) - 1 example import violation(s)
- `src/DockEngine.service.ts:216` `DockSnapshotStore` (class) - 1 example import violation(s)
- `src/DockEngine.service.ts:242` `makeDockSnapshotStoreMemory` (const) - 2 example import violation(s)
- `src/DockEngine.service.ts:273` `requireSnapshot` (const) - 1 example import violation(s)
- `src/DockPolicy.ts:46` `DockCommandPolicy` (type) - 2 example import violation(s)
- `src/DockPolicy.ts:124` `lockedGroupsPolicy` (const) - 1 example import violation(s)
- `src/DockPolicy.ts:204` `makePolicyDockEngineLayer` (const) - 1 example import violation(s)
- `src/Geometry.models.ts:40` `Extent` (const) - 1 example import violation(s)
- `src/Geometry.models.ts:64` `DockBox` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:89` `GroupGeometry` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:109` `SashGeometry` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:129` `FloatingGeometry` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:149` `DockGeometry` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:189` `resolveAnchoredBox` (const) - 1 example import violation(s)
- `src/Geometry.models.ts:232` `GeometryOptions` (class) - 1 example import violation(s)
- `src/Geometry.models.ts:266` `GroupMinimumLookup` (type) - 2 example import violation(s)
- `src/Geometry.models.ts:283` `GroupMinimaRecord` (type) - 1 example import violation(s)
- `src/Minima.ts:65` `TabChrome` (class) - 1 example import violation(s)
- `src/Minima.ts:90` `titleWords` (const) - 1 example import violation(s)
- `src/Minima.ts:142` `titleMinima` (const) - 1 example import violation(s)
- `src/Minima.ts:201` `makeTitleMinimaAtom` (const) - 1 example import violation(s)
- `src/Recency.ts:42` `touchedGroupsInEvents` (const) - 1 example import violation(s)
- `src/Recency.ts:82` `touchedGroups` (const) - 1 example import violation(s)
- `src/Recency.ts:131` `makeMruGroupsAtom` (const) - 1 example import violation(s)

### @beep/ai-provider-cli

Path: `packages/drivers/ai-provider-cli`

Module findings:
- `src/AiProviderCliHome.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/AiProviderCliHome.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/AiProviderCliHome.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/lexical-schema

Path: `packages/foundation/modeling/lexical`

Module findings:
- `src/Lexical.behavior.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Lexical.codec.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Lexical.model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Lexical.normalize.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Lexical.model.ts:1135` `ElementNode` (class) - 1 documentation section/link violation(s)
- `src/Lexical.model.ts:2349` `YouTubeNode` (class) - 1 documentation section/link violation(s)
- `src/Lexical.model.ts:3316` `decodeEditorStateStrictResult` (const) - 1 documentation section/link violation(s)
- `src/Lexical.model.ts:3399` `analyzeEditorStateCompatibilityResult` (const) - 1 documentation section/link violation(s)
- `src/index.ts:26` `export { editorStateToPlainText, nodeToPlainText } from "./Lexical.behavior.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:41` `export {
  ARTIFACT_URI_PREFIX,
  ArtifactUri,
  blockToLexical,
  documentToEditorState,
  editorStateToDocument,
  nodeToBlocks,
} from "./Lexical.codec.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:73` `export {
  ArtifactRefId,
  ArtifactRefNode,
  analyzeEditorStateCompatibility,
  BaseNode,
  CodeNode,
  Direction,
  decodeEditorStateLossless,
  decodeEditorStateStrict,
  EditorStateFromJson,
  EditorStateWireFromJson,
  ElementFormat,
  ElementNode,
  HeadingNode,
  HeadingTag,
  hasTextFormat,
  LexicalCompatibilityIssue,
  LexicalCompatibilityResult,
  LexicalDecodeError,
  LexicalIndentDepth,
  LexicalNode,
  LexicalNodeVersion,
  LexicalNodeWire,
  LineBreakNode,
  LinkNode,
  ListItemNode,
  ListNode,
  ListNodeValue,
  ListTag,
  ListType,
  ParagraphNode,
  QuoteNode,
  RootNode,
  SafeInlineStyle,
  SafeStyleValue,
  SafeUrl,
  SerializedEditorState,
  SerializedEditorStateWire,
  TableCellHeaderState,
  TableCellNode,
  TableCellSpan,
  TableDimension,
  TableNode,
  TableRowNode,
  TabNode,
  TEXT_DETAIL_MASK_ALL,
  TEXT_FORMAT_MASK_ALL,
  TextBase,
  TextDetailBit,
  TextDetailBits,
  TextDetailMask,
  TextFormatBit,
  TextFormatBits,
  TextFormatMask,
  TextMode,
  TextNode,
  withTextFormat,
  YouTubeNode,
} from "./Lexical.model.ts";` (re-export) - 1 example import violation(s)

### @beep/ontology-config

Path: `packages/ontology/config`

Module findings:
- `src/McpConfig.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/law-practice-server

Path: `packages/law-practice/server`

Module findings:
- `src/Layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/DocumentIdentification/Identification.rdap.ts:68` `registrantFromRdap` (const) - 1 example import violation(s)

### @beep/ecfr

Path: `packages/drivers/ecfr`

Module findings:
- `src/Ecfr.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/_generated/Ecfr.gen.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/govinfo

Path: `packages/drivers/govinfo`

Module findings:
- `src/Govinfo.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/domain/contracts/Api.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Govinfo.config.ts:130` `GovinfoConfigInput` (class) - 1 example import violation(s)
- `src/Govinfo.service.ts:68` `GovinfoShape` (interface) - 1 example import violation(s)

### @beep/wink

Path: `packages/drivers/wink`

Module findings:
- `src/WinkBackend.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/pacer

Path: `packages/drivers/pacer`

Module findings:
- `src/CsoAuth.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.config.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.mock-data.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.mock.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pacer.tokens.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PacerAuth.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pcl.api.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Pcl.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/PclClient.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/venice-ai

Path: `packages/drivers/venice-ai`

Export findings:
- `src/VeniceAI.service.ts:1458` `VENICE_AI_OPERATION_DESCRIPTORS` (const) - 1 example import violation(s)

### @beep/graph-3d

Path: `packages/drivers/graph-3d`

Module findings:
- `src/Graph3D.react.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Graph3D.renderer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/ontology

Path: `packages/foundation/modeling/ontology`

Module findings:
- `src/Fold.assembly.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Fold.markdown.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Fold.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Fold.projections.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Ontology.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Fold.assembly.ts:71` `BoundComposer` (type) - 2 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.assembly.ts:890` `fold` (const) - 2 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.markdown.ts:46` `MarkdownLinkMode` (const) - 1 example import violation(s)
- `src/Fold.markdown.ts:67` `MarkdownLinkMode` (type) - 1 example import violation(s)
- `src/Fold.markdown.ts:84` `MarkdownOptions` (class) - 1 example import violation(s)
- `src/Fold.markdown.ts:295` `toMarkdown` (const) - 2 example import violation(s)
- `src/Fold.models.ts:40` `AbsoluteIri` (type) - 1 example import violation(s)
- `src/Fold.models.ts:65` `SchemaHandle` (type) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:81` `Subject` (type) - 1 example import violation(s)
- `src/Fold.models.ts:97` `LiteralScalar` (type) - 1 example import violation(s)
- `src/Fold.models.ts:116` `TypedLiteral` (type) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:136` `TupleObject` (type) - 1 example import violation(s)
- `src/Fold.models.ts:155` `Triple` (type) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:171` `OntologyFoldInput` (type) - 1 example import violation(s)
- `src/Fold.models.ts:202` `isSchemaHandle` (const) - 1 example import violation(s)
- `src/Fold.models.ts:276` `TripleValue` (const) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:296` `TripleValue` (type) - 1 example import violation(s)
- `src/Fold.models.ts:312` `SkosClassification` (const) - 1 example import violation(s)
- `src/Fold.models.ts:332` `SkosClassification` (type) - 1 example import violation(s)
- `src/Fold.models.ts:351` `AssembledPredicateKind` (const) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:371` `AssembledPredicateKind` (type) - 1 example import violation(s)
- `src/Fold.models.ts:388` `FactLiteral` (class) - 1 example import violation(s)
- `src/Fold.models.ts:413` `FactObject` (const) - 1 example import violation(s)
- `src/Fold.models.ts:435` `FactObject` (type) - 2 example import violation(s)
- `src/Fold.models.ts:460` `AssembledFact` (class) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:493` `AssembledPredicate` (class) - 1 example import violation(s)
- `src/Fold.models.ts:528` `AssembledClass` (class) - 1 example import violation(s)
- `src/Fold.models.ts:556` `OntologyWarningCode` (const) - 1 example import violation(s)
- `src/Fold.models.ts:580` `OntologyWarningCode` (type) - 1 example import violation(s)
- `src/Fold.models.ts:603` `OntologyValidationWarning` (class) - 1 example import violation(s); 1 documentation section/link violation(s)
- `src/Fold.models.ts:636` `AssembledOntology` (class) - 1 example import violation(s)
- `src/Fold.models.ts:664` `OntologyAssemblyErrorReason` (const) - 1 example import violation(s)
- `src/Fold.models.ts:693` `OntologyAssemblyErrorReason` (type) - 1 example import violation(s)
- `src/Fold.models.ts:718` `OntologyAssemblyError` (class) - 1 example import violation(s)
- `src/Fold.models.ts:750` `isFactLiteral` (const) - 1 example import violation(s)
- `src/Fold.projections.ts:46` `JsonLdTerm` (type) - 1 example import violation(s)
- `src/Fold.projections.ts:70` `JsonLdContext` (type) - 1 example import violation(s)
- `src/Fold.projections.ts:87` `JsonLdNodeValue` (type) - 1 example import violation(s)
- `src/Fold.projections.ts:110` `JsonLdNode` (type) - 1 example import violation(s)
- `src/Fold.projections.ts:131` `JsonLdDocument` (type) - 1 example import violation(s)
- `src/Fold.projections.ts:237` `toContext` (const) - 2 example import violation(s)
- `src/Fold.projections.ts:390` `toJsonLd` (const) - 2 example import violation(s)
- `src/Fold.projections.ts:633` `toTurtle` (const) - 2 example import violation(s)
- `src/SemanticFoundation.models.ts:189` `ConceptAlignment` (class) - 1 example import violation(s)
- `src/SemanticFoundation.models.ts:220` `TaxonomyConcept` (class) - 1 example import violation(s)
- `src/SemanticFoundation.models.ts:287` `FilingRoot` (class) - 1 example import violation(s)
- `src/TaxonomyLoader.ts:215` `VendorAlignmentManifestEntry` (class) - 1 example import violation(s)
- `src/TaxonomyLoader.ts:274` `VendorConceptSlice` (class) - 1 example import violation(s)
- `src/TaxonomyLoader.ts:470` `VendorSliceConceptMismatch` (class) - 1 example import violation(s)
- `src/TaxonomyLoader.ts:504` `VendorAlignmentTargetNotFound` (class) - 1 example import violation(s)
- `src/TaxonomyRegistry.ts:36` `LibrarianInput` (class) - 1 example import violation(s)
- `src/TaxonomyRegistry.ts:105` `TaxonomyConceptNotFound` (class) - 1 example import violation(s)
- `src/TaxonomyRegistry.ts:127` `UnsupportedDocumentClass` (class) - 1 example import violation(s)
- `src/TaxonomyRegistry.ts:158` `runLibrarianLoop` (const) - 1 example import violation(s)

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Module findings:
- `src/commands/Ci/CiLane.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codegen/Codegen.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.capture.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.csv.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.normalize.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.packet.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.scan.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.triage.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Codex/Findings.write.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/CreatePackage/CreatePackage.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Docgen/Docgen.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Docs/Docs.aggregate.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/Doctor.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/Goals.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/Inventory.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/Migration.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/PortfolioIndex.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Goals/SetStatus.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Knowledge/Knowledge.refs.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Laws/FrozenGrantSet.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Lint/IdentityRegistry.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Lint/PackageTestTypecheck.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Lint/ReflectionArtifact.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Lint/RoadmapRefs.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Control.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Doctor.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Extract.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Inventory.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgeCheck.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgeIngest.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgeLint.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgePack.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Qa.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Qa.render.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Qa.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Qa.session.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Record.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Qa/Report.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Worktree/Fleet.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Worktree/Fleet.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Worktree/Worktree.command.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Worktree/Worktree.schemas.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/commands/Worktree/Worktree.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 2 documentation section/link violation(s)

Export findings:
- `src/commands/Cache/Cache.command.ts:271` `runCacheWarm` (const) - 1 example import violation(s)
- `src/commands/Cache/Cache.command.ts:468` `buildCacheDashboard` (const) - 1 example import violation(s)
- `src/commands/Cache/Cache.service.ts:111` `encodeCachePolicyBaselineText` (const) - 1 example import violation(s)
- `src/commands/Ci/CiLane.ts:387` `CI_LANE_DESCRIPTORS` (const) - 1 documentation section/link violation(s)
- `src/commands/Ci/CiLane.ts:1529` `ciLaneStepsForTesting` (const) - 1 documentation section/link violation(s)
- `src/commands/Corpus/Corpus.errors.ts:303` `CorpusArchiveMoveDigestMismatchError` (class) - 1 example import violation(s)
- `src/commands/Corpus/Corpus.service.ts:915` `indexMailExportTrees` (const) - missing @example
- `src/commands/Corpus/Corpus.service.ts:928` `repairAttachmentExtensions` (const) - missing @example
- `src/commands/Corpus/Corpus.service.ts:941` `runMetadataCensus` (const) - missing @example
- `src/commands/CreatePackage/CreatePackage.command.ts:114` `resolveCreatePackageTemplateDir` (const) - 1 documentation section/link violation(s)
- `src/commands/Drawings/Drawings.intake.schemas.ts:300` `MessageFacts` (class) - 1 example import violation(s)
- `src/commands/Drawings/Drawings.intake.schemas.ts:351` `IntakeRecord` (class) - 1 example import violation(s)
- `src/commands/Drawings/Drawings.intake.schemas.ts:401` `IntakeResult` (class) - 1 example import violation(s)
- `src/commands/Drawings/Drawings.intake.ts:631` `renderIntakeSummary` (const) - 1 example import violation(s)
- `src/commands/Explore/Atlas.ts:762` `explorationProjectionDriftPaths` (const) - 1 example import violation(s)
- `src/commands/Laws/FrozenGrantSet.ts:330` `runFrozenGrantSetRules` (const) - 1 documentation section/link violation(s)
- `src/commands/Laws/NoNativeRuntime.ts:620` `runNoNativeRuntimeRules` (const) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgeCheck.ts:511` `extractLastJsonBlock` (const) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgePack.ts:587` `renderTimeline` (const) - 1 documentation section/link violation(s)
- `src/commands/Qa/JudgePack.ts:688` `selectJudgeEvidence` (const) - 1 documentation section/link violation(s)
- `src/commands/Quality/Quality.command.ts:1028` `runBunAudit` (const) - 1 documentation section/link violation(s)
- `src/commands/Runners/Runners.schemas.ts:120` `BakeConfig` (class) - 1 example import violation(s)
- `src/commands/Runners/Runners.schemas.ts:166` `BakeReport` (class) - 1 example import violation(s)
- `src/commands/Runners/Runners.schemas.ts:275` `BakePlan` (class) - 1 example import violation(s)
- `src/commands/Runners/Runners.schemas.ts:334` `BakeCheckReport` (class) - 1 example import violation(s)
- `src/commands/Runners/Runners.service.ts:170` `BakeLocalInputs` (class) - 1 example import violation(s)
- `src/commands/Skills/Skills.render.ts:220` `renderSkillsLockMigrationPlanJson` (const) - 1 example import violation(s)
- `src/commands/Skills/Skills.render.ts:294` `renderSkillsLockMigrationPlanSummary` (const) - 1 example import violation(s)
- `src/commands/Skills/Skills.render.ts:347` `renderSkillsLockWriteReceiptJson` (const) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:96` `LocalSkillLockEntry` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:570` `LocalMigrationRow` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:734` `SkillsLockMigrationPlan` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:800` `SkillsLockMigrationArtifacts` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:871` `SkillsLockWrittenFile` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.schemas.ts:905` `SkillsLockWriteReceipt` (class) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.write.ts:89` `skillsLockWriteConflicts` (const) - 1 example import violation(s)
- `src/commands/Skills/SkillsLock.write.ts:123` `skillsLockDocumentOf` (const) - 1 example import violation(s)
- `src/commands/Worktree/Fleet.service.ts:327` `parseProcStatStartTime` (const) - 1 example import violation(s)

### @beep/dock-react

Path: `packages/foundation/ui-system/dock-react`

Export findings:
- `src/DockReact.types.ts:34` `DockAtomGraph` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:53` `DockPanelApi` (class) - 2 example import violation(s)
- `src/DockReact.types.ts:77` `DockPanelProps` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:98` `DockTabProps` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:115` `DockRenderer` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:132` `DockTabRenderer` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:149` `DockviewAdapterApi` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:185` `DockTitleMinimaOptions` (type) - 1 example import violation(s)
- `src/DockReact.types.ts:209` `DockviewReactProps` (type) - 1 example import violation(s)
- `src/DockviewReact.tsx:244` `DockviewReact` (const) - 2 example import violation(s)

### @beep/brand

Path: `packages/foundation/ui-system/brand`

Export findings:
- `src/Brand.assets.ts:31` `RenderedAsset` (class) - 1 example import violation(s)
- `src/Brand.assets.ts:84` `renderBrandAssets` (const) - 1 example import violation(s)
- `src/Brand.css.ts:28` `GENERATED_CSS_BANNER` (const) - 1 example import violation(s)
- `src/Brand.css.ts:76` `fontStack` (const) - 1 example import violation(s)
- `src/Brand.css.ts:147` `renderThemeCss` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:32` `PrintableText` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:60` `PrintableText` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:76` `ScaleStep` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:95` `ScaleStep` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:111` `SurfaceStep` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:130` `SurfaceStep` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:146` `ColorScale` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:176` `SurfaceScale` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:202` `Foreground` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:225` `Border` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:247` `Semantic` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:270` `Alpha` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:290` `Alpha` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:306` `GlowStop` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:328` `GlowLayer` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:350` `Glow` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:373` `ColorScheme` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:399` `SchemeName` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:418` `SchemeName` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:434` `FontStack` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:458` `Typography` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:480` `SvgPathData` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:513` `SvgPathData` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:529` `MarkPoint` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:551` `MarkRotation` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:573` `PixelGlasses` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:598` `BrandMark` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:627` `BrandIdentity` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:653` `SvgPaint` (const) - 1 example import violation(s)
- `src/Brand.schema.ts:672` `SvgPaint` (type) - 1 example import violation(s)
- `src/Brand.schema.ts:689` `MarkPaint` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:712` `MarkGround` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:741` `MarkSvgRequest` (class) - 1 example import violation(s)
- `src/Brand.schema.ts:774` `WordmarkSvgRequest` (class) - 1 example import violation(s)
- `src/Brand.svg.ts:52` `glassesTransform` (const) - 1 example import violation(s)
- `src/Brand.svg.ts:121` `renderMarkSvg` (const) - 1 example import violation(s)
- `src/Brand.svg.ts:159` `renderWordmarkSvg` (const) - 1 example import violation(s)
- `src/Brand.tokens.ts:134` `beep` (const) - 1 example import violation(s)

### @beep/agents-server

Path: `packages/agents/server`

Module findings:
- `src/AssistantTurn/AnthropicTurnCodec.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/AssistantTurn/AnthropicTurnKernel.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/editor

Path: `packages/foundation/ui-system/editor`

Module findings:
- `src/chat/atoms.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/attachment-model.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/attachments.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/chat-composer.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/code-fence.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/commands.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/config.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/send.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/toolbar.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/typeahead.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/code-block-node.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/mermaid-node.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/nodes.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/capability/projection.ts:38` `ShortcutHelpEntry` (class) - 1 example import violation(s)
- `src/chat/atoms.ts:901` `onSendAtom` (const) - 1 example import violation(s)
- `src/viewer.tsx:244` `EditorViewer` (function) - 1 example import violation(s)

### @beep/documents-server

Path: `packages/documents/server`

Module findings:
- `src/aggregates/Sync/DmsMirrorBox.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/aggregates/Sync/DmsMirrorFixture.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/openclaw

Path: `packages/drivers/openclaw`

Module findings:
- `src/Openclaw.errors.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenclawCli.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenclawIntent.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenclawProbe.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenclawRender.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenclawSystemd.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Openclaw.models.ts:123` `OpenclawDiagnosticText` (const) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:177` `OpenclawProcessRequest` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:351` `OpenclawConfigInvalid` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:424` `OpenclawDoctorReport` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:459` `OpenclawSecretsReloadOutput` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:524` `OpenclawSecretsReloadDegraded` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:1200` `OpenclawInvocationContext` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:1303` `OpenclawSystemdUnitState` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:1390` `OpenclawHttpProbe` (class) - 1 documentation section/link violation(s)
- `src/Openclaw.models.ts:1461` `OpenclawSchemaPlaceholderFinding` (class) - 1 documentation section/link violation(s)
- `src/OpenclawCli.service.ts:446` `OpenclawCliRunner` (type) - 1 documentation section/link violation(s)
- `src/OpenclawIntent.models.ts:54` `OpenclawSecretReference` (const) - 1 documentation section/link violation(s)
- `src/OpenclawIntent.models.ts:101` `OpenclawTargetVersion` (const) - 1 documentation section/link violation(s)
- `src/OpenclawIntent.models.ts:1080` `OpenclawSkillPin` (class) - 1 documentation section/link violation(s)
- `src/OpenclawIntent.models.ts:1183` `OpenclawDeploymentIntent` (class) - 1 documentation section/link violation(s)

### @beep/db-admin

Path: `packages/_internal/db-admin`

Module findings:
- `src/migrate.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/schema.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/gov-legal-mcp

Path: `packages/drivers/gov-legal-mcp`

Module findings:
- `src/Handlers.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Server.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/SourceAuth.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ToolNames.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Tools.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/nlp-mcp

Path: `packages/drivers/nlp-mcp`

Module findings:
- `src/Server.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Streaming/DatasetLoader.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Streaming/Jsonl.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Streaming/Pipeline.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Streaming/TextStream.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/StreamingHandlers.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/StreamingTools.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/bin.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Streaming/DatasetLoader.ts:671` `loadJsonl` (const) - 1 documentation section/link violation(s)

### @beep/lint-rules

Path: `packages/tooling/policy-pack/lint-rules`

Module findings:
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/m365-mcp

Path: `packages/drivers/m365-mcp`

Export findings:
- `src/OutboxAttachmentSource.ts:149` `OutboxAttachmentDigest` (class) - 1 example import violation(s)
- `src/OutboxAttachmentSource.ts:181` `OutboxAttachment` (class) - 1 example import violation(s)
- `src/OutboxSendGuard.ts:267` `sameAttachments` (const) - 1 example import violation(s)

### @beep/scratchpad

Path: `scratchpad`

Module findings:
- `effected/cli/Cancelled.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliAudience.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliColor.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliEnv.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliExit.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliFailure.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliInteractive.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliLinks.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliLog.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliLogger.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliMessage.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliPrompt.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliRuntime.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliTest.ts:1` (none) - missing summary; missing @since
- `effected/cli/CliTheme.ts:1` (none) - missing summary; missing @since
- `effected/cli/ConfigIssueRenderer.ts:1` (none) - missing summary; missing @since
- `effected/cli/Doc.ts:1` (none) - missing summary; missing @since
- `effected/cli/Fmt.ts:1` (none) - missing summary; missing @since
- `effected/cli/GithubAnnotation.ts:1` (none) - missing summary; missing @since
- `effected/cli/Glyphs.ts:1` (none) - missing summary; missing @since
- `effected/cli/NotInteractive.ts:1` (none) - missing summary; missing @since
- `effected/cli/Render.ts:1` (none) - missing summary; missing @since
- `effected/cli/SchemaIssueRenderer.ts:1` (none) - missing summary; missing @since
- `effected/cli/Status.ts:1` (none) - missing summary; missing @since
- `effected/cli/TestTerminal.ts:1` (none) - missing summary; missing @since
- `effected/cli/Token.ts:1` (none) - missing summary; missing @since
- `effected/cli/index.ts:1` (packageDocumentation) - missing @since
- `effected/cli/internal/ExitRequested.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/HelpRouting.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/ansi.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/autoFormat.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/canPrompt.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/counts.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/diagnostics.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/displayWidth.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/failureTarget.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/fallbackAnswer.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/fileSink.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/format.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/isExitCode.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/layout.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/linkScheme.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/linkTarget.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/logSafety.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/renderAnsi.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/renderDoc.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/renderGithubLog.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/renderMarkdown.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/renderPlain.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/scanAudience.ts:1` (none) - missing summary; missing @since
- `effected/cli/internal/splitFrame.ts:1` (jsdoc) - missing @since
- `effected/cli/internal/wizardGate.ts:1` (none) - missing summary; missing @since
- `effected/cli/testing.ts:1` (packageDocumentation) - missing @since
- `effected/cli/ui-testing.ts:1` (packageDocumentation) - missing @since
- `effected/cli/ui.ts:1` (packageDocumentation) - missing @since
- `effected/cli/ui/CliUi.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/CliUiLive.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/Confirm.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/DocView.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/KeyHelp.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/KeyTable.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/MultiSelect.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/Select.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/Tabs.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/TextInput.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/Toggle.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/UiKey.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/UiProvider.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/UiStreams.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/UiTheme.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/Viewport.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/ErrorBoundary.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/Holder.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/ScreenContext.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/UiProviders.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/ink.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/inkChalk.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/inkConsole.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/lazyView.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/lineText.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/mountPermit.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/perfDrain.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/internal/renderOptions.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/testing/CliUiTest.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/testing/fakeStreams.ts:1` (none) - missing summary; missing @since
- `effected/cli/ui/testing/terminalModel.ts:1` (none) - missing summary; missing @since
- `effected/commands/LocalExec.ts:1` (none) - missing summary; missing @since
- `effected/commands/Redaction.ts:1` (none) - missing summary; missing @since
- `effected/commands/Retry.ts:1` (none) - missing summary; missing @since
- `effected/commands/Run.ts:1` (none) - missing summary; missing @since
- `effected/commands/ScriptedSpawner.ts:1` (none) - missing summary; missing @since
- `effected/commands/Tool.ts:1` (none) - missing summary; missing @since
- `effected/commands/ToolDiscovery.ts:1` (none) - missing summary; missing @since
- `effected/commands/index.ts:1` (packageDocumentation) - missing @since
- `effected/commands/internal/capture.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigEvent.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigFile.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigMigration.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigProvider.ts:1` (none) - missing summary; missing @since
- `effected/config-file/ConfigResolver.ts:1` (none) - missing summary; missing @since
- `effected/config-file/EncryptedCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/JsonCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/JsoncCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/MergeStrategy.ts:1` (none) - missing summary; missing @since
- `effected/config-file/TomlCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/YamlCodec.ts:1` (none) - missing summary; missing @since
- `effected/config-file/internal/crypto.ts:1` (none) - missing summary; missing @since
- `effected/config-file/internal/deepMerge.ts:1` (none) - missing summary; missing @since
- `effected/engine/Distribution.ts:1` (none) - missing summary; missing @since
- `effected/engine/LaunchContext.ts:1` (none) - missing summary; missing @since
- `effected/engine/ProcessGuard.ts:1` (none) - missing summary; missing @since
- `effected/engine/Remediation.ts:1` (none) - missing summary; missing @since
- `effected/engine/guard.ts:1` (packageDocumentation) - missing @since
- `effected/engine/index.ts:1` (packageDocumentation) - missing @since
- `effected/env/Audience.ts:1` (none) - missing summary; missing @since
- `effected/env/ColorLevel.ts:1` (none) - missing summary; missing @since
- `effected/env/EnvOverride.ts:1` (none) - missing summary; missing @since
- `effected/env/RuntimeEnv.ts:1` (none) - missing summary; missing @since
- `effected/env/TerminalEnv.ts:1` (none) - missing summary; missing @since
- `effected/env/index.ts:1` (packageDocumentation) - missing @since
- `effected/env/internal/agentCi.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/colorDepth.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/envRecord.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/keys.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/osc8/detect.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/osc8/env.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/osc8/semver.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/osc8/terminals.ts:1` (none) - missing summary; missing @since
- `effected/env/internal/osc8/wrappers.ts:1` (none) - missing summary; missing @since
- `effected/git/Git.ts:1` (none) - missing summary; missing @since
- `effected/git/GitCommand.ts:1` (none) - missing summary; missing @since
- `effected/git/GitConfig.ts:1` (none) - missing summary; missing @since
- `effected/git/Gitmodules.ts:1` (none) - missing summary; missing @since
- `effected/git/internal/config.ts:1` (none) - missing summary; missing @since
- `effected/git/internal/run.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/Action.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionCache.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionEnvironment.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionInput.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionLogger.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionOutputs.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionState.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionsIdentityToken.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ActionsProvenance.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/Artifact.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/BlobEnvelope.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/BlobStore.githubCache.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/BlobStore.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/BlobTransfer.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/CacheKey.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/CheckDocument.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/CheckState.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ChildEnv.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/DetachedProcess.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/DryRun.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/GitHubMarkdown.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/GitHubToken.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/ManagedDocument.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/OidcTokenIssuer.ts:1` (packageDocumentation) - missing @since
- `effected/github-actions/PackageManagerInstaller.ts:1` (packageDocumentation) - missing @since
- `effected/github-actions/Secret.ts:1` (packageDocumentation) - missing @since
- `effected/github-actions/ToolInstaller.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/index.ts:1` (packageDocumentation) - missing @since
- `effected/github-actions/internal/actionsResults.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/archiveCommands.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/cacheService.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/digest.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/fsProbe.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/ieeeNumber.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/jwt.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/pnpmExe.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/runner.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/runnerFile.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/sigv4.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/spawn.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/twirp.ts:1` (none) - missing summary; missing @since
- `effected/github-actions/internal/unstubbed.ts:1` (none) - missing summary; missing @since
- `effected/github-commands/CommandNeutralizer.ts:1` (none) - missing summary; missing @since
- `effected/github-commands/WorkflowCommand.ts:1` (none) - missing summary; missing @since
- `effected/github-references/ClosingList.ts:1` (none) - missing summary; missing @since
- `effected/github-references/IssueReferences.ts:1` (none) - missing summary; missing @since
- `effected/github-references/KeywordFamily.ts:1` (none) - missing summary; missing @since
- `effected/github-references/index.ts:1` (packageDocumentation) - missing @since
- `effected/github/ArtifactMetadata.ts:1` (none) - missing summary; missing @since
- `effected/github/Attestation.ts:1` (none) - missing summary; missing @since
- `effected/github/CheckRun.ts:1` (none) - missing summary; missing @since
- `effected/github/CodeScanning.ts:1` (none) - missing summary; missing @since
- `effected/github/DeploymentEnvironment.ts:1` (none) - missing summary; missing @since
- `effected/github/GitBranch.ts:1` (none) - missing summary; missing @since
- `effected/github/GitCommit.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubApp.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubClient.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubCommit.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubContent.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubError.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubIssue.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubRelease.ts:1` (none) - missing summary; missing @since
- `effected/github/GitHubRepository.ts:1` (none) - missing summary; missing @since
- `effected/github/GitTag.ts:1` (none) - missing summary; missing @since
- `effected/github/GraphQL.ts:1` (none) - missing summary; missing @since
- `effected/github/PullRequest.ts:1` (none) - missing summary; missing @since
- `effected/github/PullRequestComment.ts:1` (none) - missing summary; missing @since
- `effected/github/Repo.ts:1` (none) - missing summary; missing @since
- `effected/github/RepositorySecret.ts:1` (none) - missing summary; missing @since
- `effected/github/RepositorySecurity.ts:1` (none) - missing summary; missing @since
- `effected/github/RepositoryVariable.ts:1` (none) - missing summary; missing @since
- `effected/github/Resilience.ts:1` (none) - missing summary; missing @since
- `effected/github/Rest.ts:1` (none) - missing summary; missing @since
- `effected/github/Ruleset.ts:1` (none) - missing summary; missing @since
- `effected/github/TokenPermissions.ts:1` (none) - missing summary; missing @since
- `effected/github/WorkflowDispatch.ts:1` (none) - missing summary; missing @since
- `effected/github/index.ts:1` (packageDocumentation) - missing @since
- `effected/github/internal/crypto.ts:1` (none) - missing summary; missing @since
- `effected/github/internal/headers.ts:1` (none) - missing summary; missing @since
- `effected/github/internal/octokit.ts:1` (none) - missing summary; missing @since
- `effected/github/internal/paginate.ts:1` (none) - missing summary; missing @since
- `effected/glob/GlobPattern.ts:1` (none) - missing summary; missing @since
- `effected/glob/GlobSet.ts:1` (none) - missing summary; missing @since
- `effected/glob/index.ts:1` (packageDocumentation) - missing @since
- `effected/glob/internal/assertValidPattern.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/ast.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/balancedMatch.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/braceExpansion.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/braceExpressions.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/escape.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/limits.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/minimatch.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/types.ts:1` (none) - missing summary; missing @since
- `effected/glob/internal/unescape.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/Jsonc.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncEdit.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncFingerprint.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncFormatter.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncModifier.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncNode.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/JsoncVisitor.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/index.ts:1` (packageDocumentation) - missing @since
- `effected/jsonc/internal/limits.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/internal/navigate.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/internal/parser.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/internal/scanner.ts:1` (none) - missing summary; missing @since
- `effected/jsonc/internal/skip.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/BunExtension.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/ConfigDependencyLock.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/ImporterDependency.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/Lockfile.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/LockfileFormat.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/LockfileImporter.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/LockfileIntegrity.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/PackageManagerLock.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/PnpmEnvLockfile.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/PnpmExtension.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/ResolvedPackage.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/UnsupportedLockfileVersion.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/WorkspaceDependency.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/index.ts:1` (packageDocumentation) - missing @since
- `effected/lockfiles/internal/bun.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/documents.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/npm.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/pnpm.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/pnpmEnv.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/shared.ts:1` (none) - missing summary; missing @since
- `effected/lockfiles/internal/yarn.ts:1` (none) - missing summary; missing @since
- `effected/markdown/Frontmatter.ts:1` (none) - missing summary; missing @since
- `effected/markdown/FrontmatterResolver.ts:1` (none) - missing summary; missing @since
- `effected/markdown/FrontmatterSource.ts:1` (none) - missing summary; missing @since
- `effected/markdown/JsonFrontmatter.ts:1` (none) - missing summary; missing @since
- `effected/markdown/Markdown.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownDiagnostic.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownDocument.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownEdit.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownFormat.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownNode.ts:1` (none) - missing summary; missing @since
- `effected/markdown/MarkdownVisitor.ts:1` (none) - missing summary; missing @since
- `effected/markdown/Mdast.ts:1` (none) - missing summary; missing @since
- `effected/markdown/TomlFrontmatter.ts:1` (none) - missing summary; missing @since
- `effected/markdown/YamlFrontmatter.ts:1` (none) - missing summary; missing @since
- `effected/markdown/index.ts:1` (packageDocumentation) - missing @since
- `effected/markdown/internal/blockParser.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blockRegistry.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blockTypes.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/atxHeading.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/blockquote.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/code.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/document.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/fencedCode.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/footnoteDefinition.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/frontmatter.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/htmlBlock.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/indentedCode.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/linkReferenceDefinition.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/list.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/paragraph.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/setextHeading.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/table.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/taskListItem.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/blocks/thematicBreak.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/carriers.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/entities.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/entityMap.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/htmlTags.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlineNode.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlineParser.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlineRegistry.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlineTypes.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/autolink.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/autolinkLiteral.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/codeSpan.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/emphasis.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/entity.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/escape.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/footnoteReference.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/lineBreak.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/link.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/rawHtml.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/strikethrough.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/inlines/text.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/limits.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/lineIndex.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/patterns.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/phrasing.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/preprocess.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/rawInline.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/references.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/segments.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/stringify.ts:1` (none) - missing summary; missing @since
- `effected/markdown/internal/unescape.ts:1` (none) - missing summary; missing @since
- `effected/memfs/MemoryFileSystem.ts:1` (none) - missing summary; missing @since
- `effected/memfs/NodeSyncFileSystem.ts:1` (packageDocumentation) - missing @since
- `effected/memfs/index.ts:1` (packageDocumentation) - missing @since
- `effected/memfs/internal/errno.ts:1` (none) - missing summary; missing @since
- `effected/memfs/internal/faults.ts:1` (none) - missing summary; missing @since
- `effected/memfs/internal/ports.ts:1` (none) - missing summary; missing @since
- `effected/memfs/internal/seed.ts:1` (none) - missing summary; missing @since
- `effected/memfs/internal/view.ts:1` (none) - missing summary; missing @since
- `effected/memfs/internal/volume.ts:1` (none) - missing summary; missing @since
- `effected/npm/CatalogAssemblyError.ts:1` (none) - missing summary; missing @since
- `effected/npm/CatalogResolver.ts:1` (none) - missing summary; missing @since
- `effected/npm/DependencySection.ts:1` (none) - missing summary; missing @since
- `effected/npm/DependencySpecifier.ts:1` (none) - missing summary; missing @since
- `effected/npm/IntegrityHash.ts:1` (none) - missing summary; missing @since
- `effected/npm/Manifest.ts:1` (none) - missing summary; missing @since
- `effected/npm/NpmExecutor.ts:1` (none) - missing summary; missing @since
- `effected/npm/NpmRegistry.ts:1` (none) - missing summary; missing @since
- `effected/npm/PackageManagerCache.ts:1` (none) - missing summary; missing @since
- `effected/npm/PackageManagerPin.ts:1` (none) - missing summary; missing @since
- `effected/npm/PackagePublish.ts:1` (none) - missing summary; missing @since
- `effected/npm/PackageTarball.ts:1` (none) - missing summary; missing @since
- `effected/npm/PublishError.ts:1` (none) - missing summary; missing @since
- `effected/npm/RegistryCredential.ts:1` (none) - missing summary; missing @since
- `effected/npm/RegistryKind.ts:1` (none) - missing summary; missing @since
- `effected/npm/ReleaseAgeGate.ts:1` (none) - missing summary; missing @since
- `effected/npm/WorkspaceResolver.ts:1` (none) - missing summary; missing @since
- `effected/package-json/Dependency.ts:1` (none) - missing summary; missing @since
- `effected/package-json/DevEngines.ts:1` (none) - missing summary; missing @since
- `effected/package-json/EntryPoint.ts:1` (none) - missing summary; missing @since
- `effected/package-json/Funding.ts:1` (none) - missing summary; missing @since
- `effected/package-json/LenientManifest.ts:1` (none) - missing summary; missing @since
- `effected/package-json/License.ts:1` (none) - missing summary; missing @since
- `effected/package-json/Package.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageJsonFile.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageJsonFormat.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageManager.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageManagerRange.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageManifest.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageName.ts:1` (none) - missing summary; missing @since
- `effected/package-json/PackageValidator.ts:1` (none) - missing summary; missing @since
- `effected/package-json/Person.ts:1` (none) - missing summary; missing @since
- `effected/package-json/Repository.ts:1` (none) - missing summary; missing @since
- `effected/package-json/index.ts:1` (packageDocumentation) - missing @since
- `effected/package-json/internal/format.ts:1` (none) - missing summary; missing @since
- `effected/package-json/internal/wire.ts:1` (none) - missing summary; missing @since
- `effected/sbom/IdentityToken.ts:1` (none) - missing summary; missing @since
- `effected/sbom/InTotoStatement.ts:1` (none) - missing summary; missing @since
- `effected/sbom/NtiaReport.ts:1` (none) - missing summary; missing @since
- `effected/sbom/Sbom.ts:1` (none) - missing summary; missing @since
- `effected/sbom/SbomDocument.ts:1` (none) - missing summary; missing @since
- `effected/sbom/SbomMetadataSource.ts:1` (none) - missing summary; missing @since
- `effected/sbom/SigstoreBundle.ts:1` (none) - missing summary; missing @since
- `effected/sbom/SigstoreSigner.ts:1` (none) - missing summary; missing @since
- `effected/sbom/SlsaProvenance.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/APIReference.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/Conformance.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/CreativeWork.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/JsonLdDocument.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/NodeRef.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/Organization.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/Person.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/SoftwareSourceCode.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/TechArticle.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/Thing.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/Vocabulary.ts:1` (none) - missing summary; missing @since
- `effected/schema-org/conformance-entry.ts:1` (packageDocumentation) - missing @since
- `effected/schema-org/index.ts:1` (packageDocumentation) - missing @since
- `effected/schema-org/internal/vocabulary.ts:1` (none) - missing summary; missing @since
- `effected/semver/Comparator.ts:1` (none) - missing summary; missing @since
- `effected/semver/Range.ts:1` (none) - missing summary; missing @since
- `effected/semver/SemVer.ts:1` (none) - missing summary; missing @since
- `effected/semver/VersionCache.ts:1` (none) - missing summary; missing @since
- `effected/semver/VersionDiff.ts:1` (none) - missing summary; missing @since
- `effected/semver/index.ts:1` (packageDocumentation) - missing @since
- `effected/semver/internal/desugar.ts:1` (none) - missing summary; missing @since
- `effected/semver/internal/grammar.ts:1` (none) - missing summary; missing @since
- `effected/semver/internal/normalize.ts:1` (none) - missing summary; missing @since
- `effected/semver/internal/order.ts:1` (none) - missing summary; missing @since
- `effected/spdx/License.ts:1` (none) - missing summary; missing @since
- `effected/spdx/LicenseException.ts:1` (none) - missing summary; missing @since
- `effected/spdx/SpdxExpression.ts:1` (none) - missing summary; missing @since
- `effected/spdx/index.ts:1` (packageDocumentation) - missing @since
- `effected/spdx/internal/exceptions.ts:1` (none) - missing summary; missing @since
- `effected/spdx/internal/licenseIds.ts:1` (none) - missing summary; missing @since
- `effected/spdx/internal/licenseMeta.ts:1` (none) - missing summary; missing @since
- `effected/spdx/internal/parser.ts:1` (none) - missing summary; missing @since
- `effected/templates/CommentStyle.ts:1` (none) - missing summary; missing @since
- `effected/templates/ManagedSection.ts:1` (none) - missing summary; missing @since
- `effected/templates/Section.ts:1` (none) - missing summary; missing @since
- `effected/templates/SectionDialect.ts:1` (none) - missing summary; missing @since
- `effected/templates/SectionDocument.ts:1` (none) - missing summary; missing @since
- `effected/templates/SectionOutcome.ts:1` (none) - missing summary; missing @since
- `effected/templates/index.ts:1` (packageDocumentation) - missing @since
- `effected/templates/internal/attributes.ts:1` (none) - missing summary; missing @since
- `effected/templates/internal/reconcile.ts:1` (none) - missing summary; missing @since
- `effected/templates/internal/scan.ts:1` (none) - missing summary; missing @since
- `effected/toml/Toml.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlDateTime.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlDiagnostic.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlDocument.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlEdit.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlFormat.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlNode.ts:1` (none) - missing summary; missing @since
- `effected/toml/TomlVisitor.ts:1` (none) - missing summary; missing @since
- `effected/toml/index.ts:1` (packageDocumentation) - missing @since
- `effected/toml/internal/diagnostics.ts:1` (none) - missing summary; missing @since
- `effected/toml/internal/limits.ts:1` (none) - missing summary; missing @since
- `effected/toml/internal/parser.ts:1` (none) - missing summary; missing @since
- `effected/toml/internal/scanner.ts:1` (none) - missing summary; missing @since
- `effected/toml/internal/semantic.ts:1` (none) - missing summary; missing @since
- `effected/toml/internal/stringifyValue.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/CompilerOptions.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/CompilerOptionsFromProgrammatic.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/JsxConfig.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/PortableTsconfig.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/ResolvedTsconfig.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/TsEnumCodec.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/TsconfigDiscovery.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/TsconfigJson.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/TsconfigLoader.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/TsconfigLoaderSync.ts:1` (none) - missing summary; missing @since
- `effected/tsconfig-json/index.ts:1` (packageDocumentation) - missing @since
- `effected/tsconfig-json/internal/extendsTarget.ts:1` (jsdoc) - missing @since
- `effected/walker/Descend.ts:1` (none) - missing summary; missing @since
- `effected/walker/Expand.ts:1` (none) - missing summary; missing @since
- `effected/walker/Walker.ts:1` (none) - missing summary; missing @since
- `effected/walker/index.ts:1` (packageDocumentation) - missing @since
- `effected/walker/internal/worklist.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/ChangeDetector.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/ConfigDependencyHooks.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/ConfigDependencySpec.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/DependencyGraph.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/DuplicateCheck.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/LayerPolicy.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/LockfileReader.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/PackageManagerName.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/PackedInstall.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/PeerCheck.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/Publishability.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/ReleaseTag.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/SourceBoundary.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/VersioningStrategy.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceCatalogs.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceDiscovery.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceLayering.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspacePackage.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceRoot.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceSnapshots.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspaceStateSnapshot.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/Workspaces.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/WorkspacesSync.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/index.ts:1` (packageDocumentation) - missing @since
- `effected/workspaces/internal/catalogs.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/configDependencyFetch.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/configDependencyResolution.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/configDependencyShared.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/configDependencySpecGrammar.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/dependencyFields.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/enumerate.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/importerVersions.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/layerRoot.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/limits.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/packedInstallPlan.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/patterns.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/peerPatterns.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/roots.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/sourceText.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/traverse.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/internal/workspaceYaml.ts:1` (none) - missing summary; missing @since
- `effected/workspaces/node-sync.ts:1` (packageDocumentation) - missing @since
- `effected/workspaces/testing.ts:1` (packageDocumentation) - missing @since
- `effected/xdg/AppDirs.ts:1` (none) - missing summary; missing @since
- `effected/xdg/NativeDirs.ts:1` (none) - missing summary; missing @since
- `effected/xdg/Xdg.ts:1` (none) - missing summary; missing @since
- `effected/xdg/XdgConfig.ts:1` (none) - missing summary; missing @since
- `effected/xdg/index.ts:1` (packageDocumentation) - missing @since
- `effected/yaml/Yaml.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlDiagnostic.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlDocument.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlEdit.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlFormat.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlLint.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlLintRule.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlNode.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlToken.ts:1` (none) - missing summary; missing @since
- `effected/yaml/YamlVisitor.ts:1` (none) - missing summary; missing @since
- `effected/yaml/index.ts:1` (packageDocumentation) - missing @since
- `effected/yaml/internal/composer/anchors.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/block.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/comments.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/document.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/flow.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/scalars.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/state.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/composer/tags.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/cst-parser.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/cst-visitor.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/cst.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/diagnostics.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/diff.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/equal.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/fold.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/lexer.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/options.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/raw-document.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/requote.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/catalog.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/colon-spacing.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/comments-spacing.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/document-end.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/document-start.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/empty-lines.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/eof-newline.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/hyphen-spacing.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/indentation.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/key-duplicates.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/line-length.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/parse-validity.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/quoted-strings.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/trailing-spaces.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/truthy.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/rules/util.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/stringifier.ts:1` (none) - missing summary; missing @since
- `effected/yaml/internal/token.ts:1` (none) - missing summary; missing @since

### @beep/professional-desktop

Path: `apps/professional-desktop`

Module findings:
- `src/App.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ChatOrchestrator.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/UsageRecordSink.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/ChatApp.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/Composer.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/MessageView.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/Sidebar.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/StreamingBlocks.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/ThemeToggle.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/Thread.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/editor-state.atoms.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/chat/ui/layout.atoms.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/contradiction/ContradictionQaSeed.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/intake/VaultDirectoryPickerOrchestrator.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/ontology/OntologyWorkspaceSeed.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/runtime/Layer.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/runtime/Migrations.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/runtime/Observability.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/runtime/Pglite.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/spikes/Graph3DSpike.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/sync/DmsMirrorDisconnected.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/transport/IpcChatClient.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/transport/IpcSpikePanel.tsx:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/transport/TauriIpcSocket.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/workspace/dock.atoms.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

### @beep/infra

Path: `infra`

Module findings:
- `src/CiFleetController.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/CiRunners.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/CiFleetController.ts:598` `CiFleetControllerPulumiConfigValues` (const) - missing @example
- `src/CiFleetController.ts:634` `CiFleetControllerConfig` (class) - missing @example
- `src/CiFleetController.ts:666` `makeCiFleetControllerConfig` (const) - missing @example
- `src/CiFleetController.ts:690` `loadCiFleetControllerConfig` (const) - missing @example
- `src/OpenClaw.ts:399` `OpenClawExpectedIdentity` (class) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:582` `OpenClawDeploymentConfig` (class) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:824` `OpenClawBackupConfig` (class) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:896` `OpenClawGeneration` (class) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1250` `makeOpenClawGeneration` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1332` `renderOpenClawUnit` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1406` `renderOpenClawRunScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1508` `renderOpenClawGenerationTree` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1574` `renderOpenClawPreflightScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1705` `renderOpenClawStageScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1837` `renderOpenClawApplyScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:1959` `renderOpenClawRollbackScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2110` `renderOpenClawDriftAuditScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2166` `renderOpenClawProbeScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2241` `renderOpenClawLiveAcceptanceScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2341` `renderOpenClawBackupShipScript` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2405` `OpenClawStackArgs` (class) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2491` `makeOpenClawStackArgsFromConfigValues` (const) - 1 documentation section/link violation(s)
- `src/OpenClaw.ts:2694` `OpenClawStack` (class) - 1 documentation section/link violation(s)

### @beep/box-provisioning

Path: `packages/drivers/box-provisioning`

Export findings:
- `src/BoxContentMigrationMap.ts:225` `BoxContentMigrationFile` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:70` `BoxContentFolderExists` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:102` `BoxContentFolderCreate` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:160` `BoxContentUpload` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:197` `BoxContentSkipIdentical` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:233` `BoxContentBlockedNameConflict` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:262` `BoxContentBlockedSourceMissing` (class) - 1 example import violation(s)
- `src/BoxContentMigrationPlan.ts:288` `BoxContentBlockedSourceChanged` (class) - 1 example import violation(s)
- `src/BoxContentMigrationReceipt.ts:181` `BoxContentActionApplied` (class) - 1 example import violation(s)
- `src/BoxContentMigrationReceipt.ts:210` `BoxContentActionSkipped` (class) - 1 example import violation(s)
- `src/BoxContentMigrationReceipt.ts:241` `BoxContentActionBlocked` (class) - 1 example import violation(s)
- `src/BoxContentMigrationReceipt.ts:277` `BoxContentActionFailed` (class) - 1 example import violation(s)
- `src/BoxContentMigrationReceipt.ts:310` `BoxContentActionNotAttempted` (class) - 1 example import violation(s)
- `src/BoxProvisioningErrors.ts:152` `BoxProvisioningDriftError` (class) - 1 example import violation(s)
- `src/BoxProvisioningIntent.ts:540` `BoxWebhookIntent` (class) - 1 example import violation(s)
- `src/BoxProvisioningObserved.ts:323` `BoxObservedWebhook` (class) - 1 example import violation(s)
- `src/BoxProvisioningPlan.ts:398` `BoxForeignResource` (class) - 1 example import violation(s)
- `src/BoxProvisioningReceipt.ts:339` `BoxActionApplied` (class) - 1 example import violation(s)
- `src/BoxProvisioningReceipt.ts:368` `BoxActionSkipped` (class) - 1 example import violation(s)
- `src/BoxProvisioningReceipt.ts:395` `BoxActionBlocked` (class) - 1 example import violation(s)
- `src/BoxProvisioningReceipt.ts:452` `BoxApplyReceipt` (class) - 1 example import violation(s)

### @beep/freshbooks

Path: `packages/drivers/freshbooks`

Module findings:
- `src/Freshbooks.config.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Freshbooks.models.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Freshbooks.service.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/Freshbooks.token.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/Freshbooks.config.ts:286` `FreshbooksConfigInput` (class) - 1 documentation section/link violation(s)
- `src/Freshbooks.errors.ts:73` `FreshbooksErrorReason` (const) - 1 documentation section/link violation(s)
- `src/Freshbooks.models.ts:566` `FreshbooksDecode` (const) - missing @example

### @beep/uspto-mcp

Path: `packages/drivers/uspto-mcp`

Module findings:
- `src/Server.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UsptoDocumentTiers.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UsptoHandlers.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UsptoSourceAuth.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/UsptoTools.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/bin.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)
- `src/index.ts:1` (packageDocumentation) - 1 documentation section/link violation(s)

Export findings:
- `src/UsptoDocumentTiers.ts:190` `MintFetchableHandle` (const) - 1 example import violation(s)
- `src/UsptoDocumentTiers.ts:251` `ProjectDocumentsWithinBudgetOptions` (class) - 1 example import violation(s)
- `src/UsptoDocumentTiers.ts:305` `projectDocumentsWithinBudget` (const) - 1 example import violation(s)

### @beep/pandoc-ast

Path: `packages/foundation/modeling/pandoc-ast`

Export findings:
- `src/index.ts:22` `export * from "./Pandoc.codec.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:43` `export * from "./Pandoc.conformance.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:58` `export * from "./Pandoc.mapping.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:73` `export * from "./Pandoc.model.ts";` (re-export) - 1 example import violation(s)
- `src/index.ts:88` `export * from "./Pandoc.report.ts";` (re-export) - 1 example import violation(s)
