# JSDoc Documentation Compliance Inventory

Generated: 2026-06-29T19:35:30.399Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 100 |
| cleanPackages | 11 |
| packagesWithoutPublicSrcSurface | 3 |
| packagesNeedingRemediation | 82 |
| publicModules | 1509 |
| publicExports | 13644 |
| openModules | 134 |
| openExports | 2287 |
| missingExportExamples | 2003 |
| missingExportCategories | 143 |
| missingExportSince | 93 |
| forbiddenTagFindings | 7 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 24 |
| unsafeExampleFindings | 115 |
| schemaAnnotationFindings | 199 |
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
| 1 | `devDependencies` | `<unresolved>` | missing-workspace-metadata | 0 | 0 | 0 | 0 |
| 2 | `peerDependencies` | `<unresolved>` | missing-workspace-metadata | 0 | 0 | 0 | 0 |
| 3 | `dependencies` | `<unresolved>` | missing-workspace-metadata | 0 | 0 | 0 | 0 |
| 4 | `optionalDependencies` | `<unresolved>` | missing-workspace-metadata | 0 | 0 | 0 | 0 |
| 5 | `@beep/dol` | `packages/drivers/dol` | needs-remediation | 1 | 1 | 1 | 1 |
| 6 | `@beep/hubspot` | `packages/drivers/hubspot` | needs-remediation | 4 | 19 | 0 | 3 |
| 7 | `@beep/agents-domain` | `packages/agents/domain` | needs-remediation | 12 | 39 | 0 | 3 |
| 8 | `@beep/ontology` | `packages/foundation/modeling/ontology` | needs-remediation | 1 | 1 | 1 | 1 |
| 9 | `@beep/rdf-canonize` | `packages/drivers/rdf-canonize` | needs-remediation | 2 | 2 | 0 | 1 |
| 10 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | needs-remediation | 3 | 7 | 0 | 3 |
| 11 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 12 | `@beep/workspace-tables` | `packages/workspace/tables` | needs-remediation | 16 | 34 | 0 | 8 |
| 13 | `@beep/law-practice-server` | `packages/law-practice/server` | needs-remediation | 2 | 3 | 0 | 1 |
| 14 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 7 | 13 | 0 | 4 |
| 15 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 39 | 219 | 0 | 16 |
| 16 | `@beep/discord` | `packages/drivers/discord` | needs-remediation | 4 | 12 | 0 | 4 |
| 17 | `@beep/face-detection` | `packages/drivers/face-detection` | needs-remediation | 4 | 27 | 0 | 9 |
| 18 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | needs-remediation | 3 | 7 | 0 | 4 |
| 19 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 88 | 525 | 0 | 123 |
| 20 | `@beep/pglite` | `packages/drivers/pglite` | needs-remediation | 4 | 11 | 0 | 3 |
| 21 | `@beep/ai-sync` | `packages/tooling/library/ai-sync` | clean | 10 | 66 | 0 | 0 |
| 22 | `@beep/agents-server` | `packages/agents/server` | needs-remediation | 7 | 17 | 0 | 3 |
| 23 | `@beep/courtlistener` | `packages/drivers/courtlistener` | needs-remediation | 1 | 1 | 1 | 1 |
| 24 | `@beep/workspace-use-cases` | `packages/workspace/use-cases` | needs-remediation | 8 | 24 | 0 | 15 |
| 25 | `@beep/editor` | `packages/foundation/ui-system/editor` | needs-remediation | 21 | 82 | 0 | 21 |
| 26 | `@beep/nlp-mcp` | `packages/drivers/nlp-mcp` | needs-remediation | 9 | 86 | 0 | 12 |
| 27 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 26 | 46 | 0 | 0 |
| 28 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 9 | 81 | 0 | 30 |
| 29 | `@beep/file-processing` | `packages/foundation/capability/file-processing` | needs-remediation | 8 | 94 | 0 | 26 |
| 30 | `@beep/ai-provider-cli` | `packages/drivers/ai-provider-cli` | needs-remediation | 4 | 12 | 0 | 6 |
| 31 | `@beep/lint-rules` | `packages/tooling/policy-pack/lint-rules` | needs-remediation | 8 | 27 | 7 | 22 |
| 32 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 33 | `@beep/agents-use-cases` | `packages/agents/use-cases` | needs-remediation | 23 | 70 | 0 | 13 |
| 34 | `@beep/m365-mcp` | `packages/drivers/m365-mcp` | needs-remediation | 4 | 21 | 0 | 20 |
| 35 | `@beep/workspace-server` | `packages/workspace/server` | needs-remediation | 6 | 14 | 0 | 4 |
| 36 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 37 | `@beep/uspto` | `packages/drivers/uspto` | needs-remediation | 5 | 22 | 0 | 7 |
| 38 | `@beep/phoenix` | `packages/drivers/phoenix` | needs-remediation | 5 | 50 | 0 | 10 |
| 39 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 5 | 29 | 0 | 9 |
| 40 | `@beep/types` | `packages/foundation/primitive/types` | clean | 5 | 10 | 0 | 0 |
| 41 | `@beep/oip-web` | `apps/oip-web` | needs-remediation | 30 | 78 | 0 | 10 |
| 42 | `@beep/storybook` | `apps/storybook` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 43 | `@beep/lexical-schema` | `packages/foundation/modeling/lexical` | needs-remediation | 3 | 94 | 0 | 51 |
| 44 | `@beep/langextract` | `packages/foundation/capability/langextract` | needs-remediation | 6 | 30 | 0 | 8 |
| 45 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 11 | 14 | 0 | 10 |
| 46 | `@beep/scratchpad` | `scratchpad` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 47 | `@beep/md` | `packages/foundation/modeling/md` | needs-remediation | 5 | 176 | 0 | 51 |
| 48 | `@beep/law-practice-use-cases` | `packages/law-practice/use-cases` | needs-remediation | 11 | 26 | 0 | 3 |
| 49 | `@beep/workspace-domain` | `packages/workspace/domain` | needs-remediation | 27 | 60 | 0 | 8 |
| 50 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 28 | 103 | 0 | 23 |
| 51 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 25 | 207 | 1 | 20 |
| 52 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | needs-remediation | 17 | 257 | 0 | 4 |
| 53 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | needs-remediation | 7 | 21 | 0 | 11 |
| 54 | `@beep/tika` | `packages/drivers/tika` | needs-remediation | 4 | 13 | 0 | 3 |
| 55 | `@beep/libpff` | `packages/drivers/libpff` | needs-remediation | 4 | 18 | 0 | 5 |
| 56 | `@beep/venice-ai` | `packages/drivers/venice-ai` | clean | 3 | 35 | 0 | 0 |
| 57 | `@beep/form` | `packages/foundation/ui-system/form` | needs-remediation | 42 | 113 | 0 | 3 |
| 58 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 113 | 0 | 4 |
| 59 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 3 |
| 60 | `@beep/box` | `packages/drivers/box` | needs-remediation | 103 | 4495 | 0 | 54 |
| 61 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 50 | 0 | 0 |
| 62 | `@beep/nlp-processing` | `packages/foundation/capability/nlp-processing` | needs-remediation | 48 | 309 | 0 | 19 |
| 63 | `@beep/anthropic` | `packages/drivers/anthropic` | clean | 5 | 26 | 0 | 0 |
| 64 | `@beep/professional-desktop` | `apps/professional-desktop` | needs-remediation | 23 | 42 | 2 | 23 |
| 65 | `@beep/epistemic-domain` | `packages/epistemic/domain` | needs-remediation | 20 | 39 | 0 | 1 |
| 66 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | needs-remediation | 18 | 62 | 0 | 28 |
| 67 | `@beep/firecrawl` | `packages/drivers/firecrawl` | needs-remediation | 5 | 263 | 0 | 3 |
| 68 | `@beep/ecfr` | `packages/drivers/ecfr` | needs-remediation | 1 | 1 | 1 | 1 |
| 69 | `@beep/acp` | `packages/drivers/acp` | needs-remediation | 10 | 406 | 0 | 1 |
| 70 | `@beep/nlp` | `packages/foundation/modeling/nlp` | needs-remediation | 28 | 310 | 0 | 36 |
| 71 | `@beep/infra` | `infra` | clean | 4 | 31 | 0 | 0 |
| 72 | `@beep/runpod` | `packages/drivers/runpod` | needs-remediation | 6 | 174 | 0 | 10 |
| 73 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 63 | 635 | 2 | 82 |
| 74 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 233 | 1532 | 0 | 653 |
| 75 | `@beep/epistemic-server` | `packages/epistemic/server` | needs-remediation | 2 | 3 | 0 | 1 |
| 76 | `@beep/rdf` | `packages/foundation/modeling/rdf` | needs-remediation | 16 | 196 | 0 | 29 |
| 77 | `@beep/onepassword-cli` | `packages/drivers/onepassword-cli` | needs-remediation | 4 | 12 | 0 | 5 |
| 78 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | needs-remediation | 9 | 21 | 0 | 8 |
| 79 | `@beep/govinfo` | `packages/drivers/govinfo` | needs-remediation | 27 | 61 | 5 | 34 |
| 80 | `@beep/data` | `packages/foundation/primitive/data` | needs-remediation | 12 | 144 | 0 | 80 |
| 81 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 62 | 0 | 0 |
| 82 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | needs-remediation | 13 | 34 | 0 | 13 |
| 83 | `@beep/duckdb` | `packages/drivers/duckdb` | needs-remediation | 4 | 15 | 0 | 3 |
| 84 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 85 | `@beep/agents-client` | `packages/agents/client` | needs-remediation | 3 | 22 | 0 | 4 |
| 86 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | clean | 1 | 2 | 0 | 0 |
| 87 | `@beep/epistemic-use-cases` | `packages/epistemic/use-cases` | needs-remediation | 10 | 18 | 0 | 1 |
| 88 | `@beep/m365` | `packages/drivers/m365` | needs-remediation | 6 | 74 | 0 | 6 |
| 89 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 24 | 149 | 3 | 25 |
| 90 | `@beep/html` | `packages/foundation/modeling/html` | needs-remediation | 5 | 337 | 0 | 333 |
| 91 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 126 | 545 | 109 | 74 |
| 92 | `@beep/pandoc-ast` | `packages/foundation/modeling/pandoc-ast` | needs-remediation | 5 | 119 | 0 | 92 |
| 93 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 25 | 135 | 0 | 5 |
| 94 | `@beep/wink` | `packages/drivers/wink` | needs-remediation | 14 | 71 | 0 | 13 |
| 95 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 36 | 0 | 6 |
| 96 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | needs-remediation | 15 | 52 | 0 | 27 |
| 97 | `@beep/provenance` | `packages/foundation/modeling/provenance` | needs-remediation | 2 | 5 | 0 | 3 |
| 98 | `@beep/epistemic-tables` | `packages/epistemic/tables` | needs-remediation | 6 | 12 | 0 | 4 |
| 99 | `@beep/federal-register` | `packages/drivers/federal-register` | needs-remediation | 1 | 1 | 1 | 1 |
| 100 | `@beep/sanity` | `packages/drivers/sanity` | needs-remediation | 4 | 16 | 0 | 3 |

## Open Findings

### @beep/dol

Path: `packages/drivers/dol`

Module findings:
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example; 1 category casing violation(s)

### @beep/hubspot

Path: `packages/drivers/hubspot`

Export findings:
- `src/index.ts:14` `export * from "./HubSpot.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./HubSpot.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./HubSpot.service.ts";` (re-export) - missing @example

### @beep/agents-domain

Path: `packages/agents/domain`

Export findings:
- `src/values/AssistantContent/AssistantContent.behavior.ts:78` `blockToMd` (const) - 2 schema annotation/type-alias gap(s)
- `src/values/AssistantContent/AssistantContent.model.ts:118` `InlineNode` (type) - missing @example
- `src/values/AssistantContent/AssistantContent.model.ts:469` `AssistantBlock` (type) - missing @example

### @beep/ontology

Path: `packages/foundation/modeling/ontology`

Module findings:
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example; 1 category casing violation(s)

### @beep/rdf-canonize

Path: `packages/drivers/rdf-canonize`

Export findings:
- `src/index.ts:14` `export * as canonicalization from "./adapters/canonicalization.ts";` (re-export) - missing @example

### @beep/architecture-lab-ui

Path: `packages/architecture-lab/ui`

Export findings:
- `src/aggregates/WorkItem/WorkItem.view-model.ts:47` `WorkItemVisibleAction` (type) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.view-model.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/workspace-tables

Path: `packages/workspace/tables`

Export findings:
- `src/Schema.ts:53` `DbSchema` (type) - 1 unsafe example violation(s)
- `src/entities/Message/Message.converters.ts:27` `MessageRow` (type) - 1 unsafe example violation(s)
- `src/entities/Message/Message.converters.ts:43` `MessageInsert` (type) - 1 unsafe example violation(s)
- `src/entities/Thread/Thread.converters.ts:27` `ThreadRow` (type) - 1 unsafe example violation(s)
- `src/entities/Thread/Thread.converters.ts:43` `ThreadInsert` (type) - 1 unsafe example violation(s)
- `src/entities/Turn/Turn.converters.ts:27` `TurnRow` (type) - 1 unsafe example violation(s)
- `src/entities/Turn/Turn.converters.ts:43` `TurnInsert` (type) - 1 unsafe example violation(s)
- `src/index.ts:28` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example

### @beep/law-practice-server

Path: `packages/law-practice/server`

Export findings:
- `src/index.ts:30` `export * from "./Layer.ts";` (re-export) - missing @example

### @beep/db-admin

Path: `packages/_internal/db-admin`

Export findings:
- `src/index.ts:14` `export * from "./migrate.js";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./targets.js";` (re-export) - missing @example
- `src/schema.ts:15` `export { DbSchema as ArchitectureLabDbSchema } from "@beep/architecture-lab-tables/tables";` (re-export) - missing @example
- `src/schema.ts:22` `export { DbSchema as WorkspaceDbSchema } from "@beep/workspace-tables";` (re-export) - missing @example

### @beep/shared-domain

Path: `packages/shared/domain`

Export findings:
- `src/entity/EntityId.ts:71` `EntityIdValue` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:87` `EntityIdValueFor` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:242` `Definition` (class) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:304` `EntityId` (type) - 1 unsafe example violation(s)
- `src/entity/EntityId.ts:349` `Any` (type) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:64` `UserPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:88` `ServiceAccountPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:113` `AgentPrincipal` (class) - 1 unsafe example violation(s)
- `src/entity/Principal.ts:140` `ConnectorAccountPrincipal` (class) - 1 unsafe example violation(s)
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:57` `OnePasswordReference` (type) - missing @example
- `src/values/OnePasswordReference/index.ts:9` `export * from "./OnePasswordReference.model.ts";` (re-export) - missing @example
- `src/values/Rule/Rule.model.ts:25` `Effect` (const) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/values/Rule/Rule.model.ts:46` `Effect` (namespace) - missing @example, @category
- `src/values/Rule/Rule.model.ts:181` `Rule` (type) - missing @example
- `src/values/Rule/Rule.model.ts:192` `Ruleset` (const) - missing summary
- `src/values/Rule/Rule.model.ts:199` `Ruleset` (type) - missing summary; missing @example, @category, @since

### @beep/discord

Path: `packages/drivers/discord`

Export findings:
- `src/Discord.errors.ts:39` `DiscordErrorReason` (type) - missing @example
- `src/index.ts:14` `export * from "./Discord.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Discord.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Discord.service.ts";` (re-export) - missing @example

### @beep/face-detection

Path: `packages/drivers/face-detection`

Export findings:
- `src/FaceDetection.models.ts:46` `PositivePixelDimension` (type) - missing @example
- `src/FaceDetection.models.ts:95` `FaceDetectionConfidence` (type) - missing @example
- `src/FaceDetection.models.ts:144` `FaceDetectionPercentage` (type) - missing @example
- `src/FaceDetection.models.ts:178` `FaceDetectionTopK` (type) - missing @example
- `src/FaceDetection.service.ts:93` `LoadedFaceDetector` (interface) - 1 unsafe example violation(s)
- `src/FaceDetection.service.ts:111` `FaceDetectionServiceShape` (interface) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./FaceDetection.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./FaceDetection.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./FaceDetection.service.ts";` (re-export) - missing @example

### @beep/architecture-lab-client

Path: `packages/architecture-lab/client`

Export findings:
- `src/aggregates/WorkItem/WorkItem.client.ts:31` `WorkItemClientTransport` (interface) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.client.ts:69` `WorkItemClientShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.client.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Export findings:
- `src/commands/AIMetrics/index.ts:13` `export * from "./AIMetrics.command.js";` (re-export) - missing @example
- `src/commands/AIMetrics/index.ts:20` `export * from "./AIMetrics.errors.js";` (re-export) - missing @example
- `src/commands/AgentEffectiveness/index.ts:14` `export * from "./AgentEffectiveness.command.js";` (re-export) - missing @example
- `src/commands/Architecture/OperationPlan.ts:44` `ArchitectureDomainKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:69` `ArchitecturePlanStage` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:104` `ArchitectureSliceRole` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:210` `ArchitectureWriterKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:586` `ArchitectureOperation` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Architecture/OperationPlan.ts:599` `ArchitectureOperation` (type) - missing @example
- `src/commands/Architecture/OperationPlanPackageJson.ts:64` `renderPackageJsonOperation` (const) - missing @example
- `src/commands/Architecture/index.ts:7` `export * from "./Architecture.command.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:14` `export * from "./OperationPlan.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:21` `export * from "./OperationPlanExecution.js";` (re-export) - missing @example
- `src/commands/Ci/index.ts:13` `export * from "./Ci.command.js";` (re-export) - missing @example
- `src/commands/Ci/index.ts:20` `export * from "./Ci.errors.js";` (re-export) - missing @example
- `src/commands/Codegen/index.ts:14` `export * from "./Codegen.command.js";` (re-export) - missing @example
- `src/commands/Codex/index.ts:13` `export * from "./Codex.command.js";` (re-export) - missing @example
- `src/commands/Codex/index.ts:20` `export * from "./Codex.errors.js";` (re-export) - missing @example
- `src/commands/Corpus/Corpus.schemas.ts:92` `RecycleBinFormatVersion` (type) - missing @example
- `src/commands/Corpus/Corpus.schemas.ts:223` `CorpusRestorationRecord` (type) - missing @example
- `src/commands/Corpus/Corpus.schemas.ts:290` `encodeCorpusDuplicateSetReportJson` (const) - 2 schema annotation/type-alias gap(s)
- `src/commands/Corpus/Corpus.schemas.ts:317` `RecycleBinEntryKind` (type) - missing @example
- `src/commands/Corpus/Corpus.schemas.ts:569` `CorpusOrganizeCategory` (type) - missing @example
- `src/commands/Corpus/Corpus.service.ts:119` `CorpusCommandServiceShape` (interface) - 1 unsafe example violation(s)
- `src/commands/Corpus/index.ts:15` `export * from "./Corpus.command.js";` (re-export) - missing @example
- `src/commands/Corpus/index.ts:22` `export * from "./Corpus.errors.js";` (re-export) - missing @example
- `src/commands/Corpus/index.ts:29` `export * from "./Corpus.recyclebin.js";` (re-export) - missing @example
- `src/commands/Corpus/index.ts:36` `export * from "./Corpus.schemas.js";` (re-export) - missing @example
- `src/commands/Corpus/index.ts:43` `export * from "./Corpus.service.js";` (re-export) - missing @example
- `src/commands/CreatePackage/index.ts:14` `export * from "./CreatePackage.command.js";` (re-export) - missing @example
- `src/commands/Docgen/index.ts:14` `export * from "./Docgen.command.js";` (re-export) - missing @example
- `src/commands/Docs/index.ts:14` `export * from "./Docs.command.js";` (re-export) - missing @example
- `src/commands/Fallow/index.ts:14` `export * from "./Fallow.command.js";` (re-export) - missing @example
- `src/commands/Files/Files.schemas.ts:59` `PositiveMediaDimension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:91` `FileSha256Hash` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:132` `NonNegativePixelOffset` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:157` `MediaKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:182` `SupportedMetadataImageExtension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:207` `NormalizeImageFormatInput` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:232` `NormalizeImageFormat` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:265` `NormalizeSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:299` `CreateCaptionFilesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:324` `BorderSide` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:349` `BorderDetectionKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:382` `DetectBordersSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:416` `DetectFacesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:447` `DetectFacesFlag` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:472` `CandidateAssessmentProfile` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:497` `CandidateAssessmentDecision` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:526` `CandidateAssessmentReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:559` `ArchivePoorCandidatesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:591` `CandidateRatioThreshold` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:638` `BorderDetectionPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:685` `BorderDetectionMaxScanPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:732` `BorderDetectionTolerance` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:779` `RgbChannel` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:923` `SafeFilePrefix` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:2256` `ProcessFilesFailurePolicy` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:2345` `decodeRotationNumber` (const) - 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.service.ts:345` `FilesCommandServiceShape` (interface) - 1 unsafe example violation(s)
- `src/commands/Files/index.ts:15` `export * from "./Files.command.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:22` `export * from "./Files.errors.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:29` `export * from "./Files.media.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:36` `export * from "./Files.progress.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:43` `export * from "./Files.schemas.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:50` `export * from "./Files.service.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:13` `export * from "./Graphiti.command.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:20` `export * from "./Graphiti.errors.js";` (re-export) - missing @example
- `src/commands/Image/Image.schemas.ts:217` `ExtractFramesDirOutcome` (type) - missing @example
- `src/commands/Image/Image.service.ts:55` `ImageCommandServiceShape` (interface) - 1 unsafe example violation(s)
- `src/commands/Image/index.ts:14` `export * from "./Image.command.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:21` `export * from "./Image.errors.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:28` `export * from "./Image.schemas.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:35` `export * from "./Image.service.js";` (re-export) - missing @example
- `src/commands/Laws/index.ts:13` `export * from "./Laws.command.js";` (re-export) - missing @example
- `src/commands/Laws/index.ts:20` `export * from "./Laws.errors.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:13` `export * from "./Lint.command.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:20` `export * from "./Lint.errors.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:27` `export { sourceTextHasSchemaArbitraryPropertyCoverage } from "./SchemaFirst.ts";` (re-export) - missing @example
- `src/commands/Lint/index.ts:34` `export * from "./SchemaTopology.ts";` (re-export) - missing @example
- `src/commands/Purge/index.ts:14` `export * from "./Purge.command.js";` (re-export) - missing @example
- `src/commands/Quality/ChangesetGraph.ts:27` `export { ChangesetGraphError } from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/Quality.command.ts:49` `export { QualityScriptCommandError } from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:14` `export { qualityFallowCommand } from "./FallowQuality.command.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:21` `export * from "./internal/TurboConfigProof.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:28` `export {
  QualityHardwareProfile,
  QualityProfileConfig,
  QualityProfileDetection,
  qualityCommand,
} from "./Quality.command.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:40` `export * from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/SyncDataToTs/index.ts:13` `export * from "./SyncDataToTs.command.js";` (re-export) - missing @example
- `src/commands/SyncDataToTs/index.ts:20` `export * from "./SyncDataToTs.errors.js";` (re-export) - missing @example
- `src/commands/TopoSort/index.ts:14` `export * from "./TopoSort.command.js";` (re-export) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:50` `export {
  /**
   * Build canonical tsconfig alias targets from a package root export.
   *
   * @category models
   * @since 0.0.0
   */
  buildCanonicalAliasTargets,
  /**
   * Resolve the canonical root export target from a package `exports` field.
   *
   * @category models
   * @since 0.0.0
   */
  resolveRootExportTarget,
} from "@beep/repo-utils/schemas/TsconfigAliasTargets";` (re-export) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:268` `TsconfigSyncRunOptions` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:300` `TsconfigSyncSection` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:402` `TsconfigSyncChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:516` `PlannedFileChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:578` `TsconfigSyncResult` (type) - missing @example
- `src/commands/TsconfigSync/index.ts:13` `export * from "./TsconfigSync.command.js";` (re-export) - missing @example
- `src/commands/TsconfigSync/index.ts:20` `export * from "./TsconfigSync.errors.js";` (re-export) - missing @example
- `src/commands/VersionSync/index.ts:13` `export * from "./VersionSync.command.js";` (re-export) - missing @example
- `src/commands/VersionSync/index.ts:20` `export * from "./VersionSync.errors.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:14` `export { YeetRunOptions, YeetRunResult } from "./internal/Handler.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:21` `export { YeetRunMode } from "./internal/Planner.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:28` `export {
  PackageQualityReport,
  QualityIssue,
  QualityIssueAttribution,
  QualityIssueCategory,
  QualityIssueConfidence,
  QualityIssueIndex,
  QualityIssueRouting,
  QualityIssueSeverity,
} from "./internal/QualityIssueIndex.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:44` `export {
  collectYeetStatus,
  renderYeetStatusSummary,
  writeYeetStatusSnapshot,
  YeetStatusArtifact,
  YeetStatusArtifactState,
  YeetStatusRemote,
  YeetStatusSnapshot,
  YeetStatusWorktree,
  yeetStatusNextCommandForTesting,
  yeetStatusPathForTesting,
} from "./internal/Status.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:62` `export { yeetCommand } from "./Yeet.command.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:69` `export * from "./Yeet.errors.js";` (re-export) - missing @example
- `src/index.ts:75` `export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen/index.js";` (re-export) - missing @example
- `src/index.ts:138` `export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";` (re-export) - missing @example
- `src/index.ts:153` `export {
  /**
   * Human-first docgen command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docgenCommand,
} from "./commands/Docgen/index.js";` (re-export) - missing @example
- `src/index.ts:168` `export {
  /**
   * Command-first docs discovery command tree.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs/index.js";` (re-export) - missing @example
- `src/index.ts:183` `export {
  /**
   * Fallow quality-tooling command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  fallowCommand,
} from "./commands/Fallow/index.js";` (re-export) - missing @example
- `src/index.ts:198` `export {
  /**
   * Dataset file curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  filesCommand,
} from "./commands/Files/index.js";` (re-export) - missing @example
- `src/index.ts:213` `export {
  /**
   * Graphiti operational command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";` (re-export) - missing @example
- `src/index.ts:228` `export {
  /**
   * Image and video curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  imageCommand,
} from "./commands/Image/index.js";` (re-export) - missing @example
- `src/index.ts:243` `export {
  /**
   * Effect laws command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";` (re-export) - missing @example
- `src/index.ts:258` `export {
  /**
   * Lint policy command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";` (re-export) - missing @example
- `src/index.ts:273` `export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge/index.js";` (re-export) - missing @example
- `src/index.ts:315` `export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";` (re-export) - missing @example
- `src/index.ts:330` `export {
  /**
   * Official data sync command for checked-in generated TypeScript modules.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  syncDataToTsCommand,
} from "./commands/SyncDataToTs/index.js";` (re-export) - missing @example
- `src/index.ts:345` `export {
  /**
   * Dependency topological sort command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort/index.js";` (re-export) - missing @example
- `src/index.ts:360` `export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync/index.js";` (re-export) - missing @example
- `src/index.ts:375` `export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";` (re-export) - missing @example
- `src/index.ts:390` `export {
  /**
   * Yeet quality feedback and publish command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  yeetCommand,
} from "./commands/Yeet/index.js";` (re-export) - missing @example

### @beep/pglite

Path: `packages/drivers/pglite`

Export findings:
- `src/index.ts:33` `export * from "./Pglite.errors.ts";` (re-export) - missing @example
- `src/index.ts:40` `export * from "./Pglite.test-layer.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./PgliteClient.service.ts";` (re-export) - missing @example

### @beep/agents-server

Path: `packages/agents/server`

Export findings:
- `src/AssistantTurn/BlockRepair.ts:110` `BlockRepairCall` (type) - missing @example
- `src/AssistantTurn/BlockRepair.ts:121` `RepairInvalidBlocks` (type) - missing @example
- `src/index.ts:15` `export * as AssistantTurn from "./AssistantTurn/index.js";` (re-export) - missing @example

### @beep/courtlistener

Path: `packages/drivers/courtlistener`

Module findings:
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example; 1 category casing violation(s)

### @beep/workspace-use-cases

Path: `packages/workspace/use-cases`

Export findings:
- `src/aggregates/Thread/Thread.errors.ts:103` `ThreadStoreError` (type) - 1 unsafe example violation(s)
- `src/aggregates/Thread/ThreadStore.ts:42` `CreateThreadInput` (interface) - 1 unsafe example violation(s)
- `src/aggregates/Thread/ThreadStore.ts:61` `AppendTurnInput` (interface) - 1 unsafe example violation(s)
- `src/aggregates/Thread/ThreadStore.ts:82` `AppendTurnResult` (interface) - 1 unsafe example violation(s)
- `src/aggregates/Thread/ThreadStore.ts:136` `ThreadStoreShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/Thread/ThreadTimeline.ts:24` `TimelineMessageItem` (class) - missing @example
- `src/aggregates/Thread/ThreadTimeline.ts:41` `TimelineToolCallItem` (class) - missing @example
- `src/aggregates/Thread/ThreadTimeline.ts:77` `TimelineItem` (type) - missing @example
- `src/aggregates/Thread/index.ts:7` `export * from "./ThreadTimeline.ts";` (re-export) - missing @example
- `src/aggregates/Thread/server.ts:7` `export * from "./index.ts";` (re-export) - missing @example
- `src/aggregates/Thread/server.ts:14` `export * from "./Thread.errors.ts";` (re-export) - missing @example
- `src/aggregates/Thread/server.ts:21` `export * from "./ThreadStore.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./public.ts";` (re-export) - missing @example
- `src/public.ts:7` `export * as Thread from "./aggregates/Thread/index.ts";` (re-export) - missing @example
- `src/server.ts:7` `export * as Thread from "./aggregates/Thread/server.ts";` (re-export) - missing @example

### @beep/editor

Path: `packages/foundation/ui-system/editor`

Export findings:
- `src/artifact-ref-node.tsx:23` `SerializedArtifactRefNode` (type) - missing @example
- `src/chat/atoms.ts:47` `featuresAtom` (const) - missing @example
- `src/chat/atoms.ts:59` `menusOpenAtom` (const) - missing @example
- `src/chat/atoms.ts:70` `anyMenuOpenAtom` (const) - missing @example
- `src/chat/atoms.ts:84` `attachmentsAtom` (const) - missing @example
- `src/chat/atoms.ts:97` `maxAttachmentBytesAtom` (const) - missing @example
- `src/chat/atoms.ts:110` `onAttachAtom` (const) - missing @example
- `src/chat/atoms.ts:124` `composerRuntime` (const) - missing @example
- `src/chat/atoms.ts:139` `captureAttachmentsFn` (const) - missing @example
- `src/chat/atoms.ts:170` `removeAttachmentFn` (const) - missing @example
- `src/chat/atoms.ts:197` `logEditorErrorFn` (const) - missing @example
- `src/chat/atoms.ts:209` `characterCountAtom` (const) - missing @example
- `src/chat/atoms.ts:236` `sendKeyBindingAtom` (const) - missing @example
- `src/chat/atoms.ts:271` `SendHandlerBox` (interface) - missing @example
- `src/chat/atoms.ts:285` `onSendAtom` (const) - missing @example
- `src/chat/atoms.ts:299` `sendCommandBindingAtom` (const) - missing @example
- `src/chat/attachment-model.ts:152` `AttachmentRejection` (type) - missing @example
- `src/chat/config.ts:55` `SendOn` (type) - missing @example
- `src/chat/config.ts:102` `EditorEffect` (type) - missing @example
- `src/chat/config.ts:207` `MentionSource` (const) - missing @example
- `src/youtube-node.tsx:32` `SerializedYouTubeNode` (type) - missing @example

### @beep/nlp-mcp

Path: `packages/drivers/nlp-mcp`

Export findings:
- `src/Streaming/TextStream.ts:106` `resolveLocalPath` (const) - missing @example
- `src/StreamingTools.ts:86` `LinesOutput` (type) - missing @example
- `src/StreamingTools.ts:136` `FileInfoOutput` (type) - missing @example
- `src/StreamingTools.ts:172` `TextStatsOutput` (type) - missing @example
- `src/StreamingTools.ts:226` `JsonlOutput` (type) - missing @example
- `src/StreamingTools.ts:260` `JsonlStatsOutput` (type) - missing @example
- `src/StreamingTools.ts:294` `DatasetMetaOutput` (type) - missing @example
- `src/StreamingTools.ts:343` `DataOutput` (type) - missing @example
- `src/StreamingTools.ts:382` `PipelineOutput` (type) - missing @example
- `src/index.ts:12` `export * from "./Server.ts";` (re-export) - missing @example
- `src/index.ts:17` `export { StreamingToolkitHandlersLive } from "./StreamingHandlers.ts";` (re-export) - missing @example
- `src/index.ts:22` `export { StreamingToolkit } from "./StreamingTools.ts";` (re-export) - missing @example

### @beep/repo-docgen

Path: `packages/tooling/tool/docgen`

Export findings:
- `src/Configuration.ts:54` `ConfigurationSchema` (class) - 1 schema annotation/type-alias gap(s)
- `src/Configuration.ts:97` `ConfigurationShape` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:78` `Position` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:122` `Doc` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:200` `DocEntry` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:256` `Class` (class) - 1 unsafe example violation(s)
- `src/Domain.ts:368` `Function` (class) - 1 unsafe example violation(s)
- `src/Domain.ts:474` `Constant` (class) - 1 unsafe example violation(s)
- `src/Domain.ts:639` `Module` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:716` `File` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:780` `DocgenError` (class) - 1 schema annotation/type-alias gap(s)
- `src/ProofManifest.ts:29` `DocgenProofManifestStandard` (const) - missing @example
- `src/ProofManifest.ts:41` `DocgenProofManifestStandard` (type) - missing @example
- `src/ProofManifest.ts:49` `DocgenProofManifestSchemaVersion` (const) - missing @example
- `src/ProofManifest.ts:61` `DocgenProofManifestSchemaVersion` (type) - missing @example
- `src/ProofManifest.ts:69` `DocgenProofManifestStatus` (const) - missing @example
- `src/ProofManifest.ts:81` `DocgenProofManifestStatus` (type) - missing @example
- `src/ProofManifest.ts:89` `DocgenProofManifestFile` (class) - missing @example
- `src/ProofManifest.ts:106` `DocgenProofManifestFingerprint` (class) - missing @example
- `src/ProofManifest.ts:128` `DocgenProofManifest` (class) - missing @example
- `src/ProofManifest.ts:151` `DocgenProofManifestVerification` (class) - missing @example
- `src/ProofManifest.ts:296` `writeDocgenProofManifest` (const) - missing @example
- `src/ProofManifest.ts:350` `verifyDocgenProofManifest` (const) - missing @example
- `src/index.ts:12` `export * as Checker from "./Checker.js";` (re-export) - missing @example
- `src/index.ts:17` `export * as Configuration from "./Configuration.js";` (re-export) - missing @example
- `src/index.ts:22` `export * as Core from "./Core.js";` (re-export) - missing @example
- `src/index.ts:27` `export * as Domain from "./Domain.js";` (re-export) - missing @example
- `src/index.ts:32` `export * as Parser from "./Parser.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Printer from "./Printer.js";` (re-export) - missing @example
- `src/index.ts:42` `export * as ProofManifest from "./ProofManifest.js";` (re-export) - missing @example

### @beep/file-processing

Path: `packages/foundation/capability/file-processing`

Export findings:
- `src/Artifact/index.ts:96` `ArtifactId` (type) - missing @example
- `src/Artifact/index.ts:128` `OperationId` (type) - missing @example
- `src/Artifact/index.ts:160` `ContentDigest` (type) - missing @example
- `src/Artifact/index.ts:218` `ArtifactLocatorKind` (type) - missing @example
- `src/Extraction/index.ts:43` `SourceProcessingStatus` (type) - missing @example
- `src/Extraction/index.ts:352` `ProcessFileResult` (type) - missing @example
- `src/Extraction/index.ts:569` `SourceProcessingRecord` (type) - missing @example
- `src/Extraction/index.ts:600` `FileProcessingFailureReason` (type) - missing @example
- `src/Extraction/index.ts:713` `FileProcessingFailureRecord` (type) - missing @example
- `src/Operation/index.ts:51` `FileProcessingOperationErrorReason` (type) - missing @example
- `src/PathSafety/index.ts:69` `PathSafetyViolationReason` (type) - missing @example
- `src/Service/index.ts:58` `FileProcessingEngineShape` (type) - 1 unsafe example violation(s)
- `src/Service/index.ts:81` `FileProcessingServiceShape` (type) - 1 unsafe example violation(s)
- `src/Strategy/index.ts:40` `FileProcessingOperationKind` (type) - missing @example
- `src/Strategy/index.ts:67` `FileProcessingEngineFamily` (type) - missing @example
- `src/Strategy/index.ts:109` `FileFormatFamily` (type) - missing @example
- `src/Strategy/index.ts:141` `FileProcessingCapability` (type) - missing @example
- `src/Strategy/index.ts:168` `FileProcessingSupportDisposition` (type) - missing @example
- `src/Strategy/index.ts:204` `FileProcessingSkipReason` (type) - missing @example
- `src/Strategy/index.ts:359` `SelectedStrategy` (type) - missing @example
- `src/index.ts:14` `export * as Artifact from "./Artifact/index.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * as Extraction from "./Extraction/index.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as Operation from "./Operation/index.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * as PathSafety from "./PathSafety/index.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * as Service from "./Service/index.ts";` (re-export) - missing @example
- `src/index.ts:49` `export * as Strategy from "./Strategy/index.ts";` (re-export) - missing @example

### @beep/ai-provider-cli

Path: `packages/drivers/ai-provider-cli`

Export findings:
- `src/AiProviderCli.models.ts:39` `AiProviderCliProvider` (type) - missing @example
- `src/AiProviderCli.models.ts:66` `AiProviderCliAuthStatus` (type) - missing @example
- `src/AiProviderCli.service.ts:39` `AiProviderCliRunner` (type) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./AiProviderCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./AiProviderCli.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./AiProviderCli.service.ts";` (re-export) - missing @example

### @beep/lint-rules

Path: `packages/tooling/policy-pack/lint-rules`

Module findings:
- `src/rules/index.ts:1` (none) - missing summary; missing @since
- `src/rules/namespace-node-imports.ts:1` (none) - missing summary; missing @since
- `src/rules/no-global-process-runtime.ts:1` (none) - missing summary; missing @since
- `src/rules/no-inline-schema-compile.ts:1` (none) - missing summary; missing @since
- `src/rules/no-manual-effect-runtime-in-tests.ts:1` (none) - missing summary; missing @since
- `src/rules/no-opaque-instance-fields.ts:1` (none) - missing summary; missing @since
- `src/rules/utils.ts:1` (none) - missing summary; missing @since

Export findings:
- `src/index.ts:55` `RuleName` (type) - missing @example
- `src/index.ts:65` `RuleSeverity` (type) - missing @example
- `src/rules/index.ts:8` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/namespace-node-imports.ts:43` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/no-global-process-runtime.ts:37` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/no-inline-schema-compile.ts:63` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/no-manual-effect-runtime-in-tests.ts:134` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/no-opaque-instance-fields.ts:16` `default` (CallExpression) - missing summary; missing @example, @category, @since
- `src/rules/utils.ts:15` `AstNode` (type) - missing @example
- `src/rules/utils.ts:29` `MaybeNode` (type) - missing @example
- `src/rules/utils.ts:41` `asExpression` (const) - missing @example
- `src/rules/utils.ts:72` `unwrapExpression` (const) - missing @example
- `src/rules/utils.ts:89` `MemberAccess` (type) - missing @example
- `src/rules/utils.ts:104` `unwrapMemberExpression` (const) - missing @example
- `src/rules/utils.ts:130` `getPropertyName` (const) - missing @example
- `src/rules/utils.ts:142` `isIdentifier` (const) - missing @example
- `src/rules/utils.ts:159` `literalStringValue` (const) - missing @example
- `src/rules/utils.ts:172` `identifierName` (const) - missing @example
- `src/rules/utils.ts:184` `ImportBinding` (type) - missing @example
- `src/rules/utils.ts:214` `classifyImportSpecifier` (const) - missing @example
- `src/rules/utils.ts:242` `toRepoPath` (const) - missing @example
- `src/rules/utils.ts:262` `pathMatchesSuffix` (const) - missing @example

### @beep/agents-use-cases

Path: `packages/agents/use-cases`

Export findings:
- `src/processes/AssistantTurn/AssistantTurn.contracts.ts:91` `TurnHistoryItem` (type) - missing @example
- `src/processes/AssistantTurn/AssistantTurn.kernel.ts:35` `AgentTurnKernelShape` (interface) - 1 unsafe example violation(s)
- `src/processes/Chat/Chat.rpc.ts:35` `ListThreadsRpc` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/Chat/Chat.rpc.ts:54` `CreateThreadRpc` (const) - 2 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.service.ts:27` `ProfessionalRuntimeSdk` (interface) - 1 unsafe example violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:25` `RuntimeCandidateLifecycle` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:44` `RuntimeClaimConfidence` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:63` `RuntimeApprovalDecision` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:82` `RuntimeRequestKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:101` `RuntimeSourceKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:120` `RuntimeActivityType` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:139` `RuntimeUsageMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/public.ts:121` `export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)

### @beep/m365-mcp

Path: `packages/drivers/m365-mcp`

Export findings:
- `src/M365Handlers.ts:88` `M365ToolkitHandlersLive` (const) - missing @example
- `src/M365Tools.ts:93` `M365ListDrivesTool` (const) - missing @example
- `src/M365Tools.ts:111` `M365ListSitesTool` (const) - missing @example
- `src/M365Tools.ts:129` `M365GetSiteTool` (const) - missing @example
- `src/M365Tools.ts:147` `M365DeltaDriveItemsTool` (const) - missing @example
- `src/M365Tools.ts:165` `M365DownloadDriveItemContentTool` (const) - missing @example
- `src/M365Tools.ts:183` `M365GetListItemTool` (const) - missing @example
- `src/M365Tools.ts:201` `M365ListDriveItemVersionsTool` (const) - missing @example
- `src/M365Tools.ts:219` `M365ListMessagesTool` (const) - missing @example
- `src/M365Tools.ts:237` `M365GetMessageTool` (const) - missing @example
- `src/M365Tools.ts:255` `M365ListEventsTool` (const) - missing @example
- `src/M365Tools.ts:273` `M365GetEventTool` (const) - missing @example
- `src/M365Tools.ts:291` `M365Toolkit` (const) - missing @example
- `src/M365Tools.ts:311` `M365Toolkit` (type) - missing @example
- `src/Server.ts:25` `M365McpServerConfig` (class) - missing @example
- `src/Server.ts:45` `makeServerLayer` (const) - missing @example
- `src/index.ts:32` `export * from "./M365Handlers.ts";` (re-export) - missing @example
- `src/index.ts:39` `export * from "./M365Tools.ts";` (re-export) - missing @example
- `src/index.ts:46` `export * from "./Server.ts";` (re-export) - missing @example
- `src/index.ts:54` `VERSION` (const) - missing @example

### @beep/workspace-server

Path: `packages/workspace/server`

Export findings:
- `src/aggregates/Thread/index.ts:7` `export * from "./Thread.layer.ts";` (re-export) - missing @example
- `src/aggregates/Thread/index.ts:14` `export * from "./ThreadStore.repo.ts";` (re-export) - missing @example
- `src/index.ts:30` `export * as Thread from "./aggregates/Thread/index.ts";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./Layer.ts";` (re-export) - missing @example

### @beep/uspto

Path: `packages/drivers/uspto`

Export findings:
- `src/Uspto.models.ts:52` `UsptoApplicationNumber` (type) - missing @example
- `src/Uspto.models.ts:87` `UsptoPatentNumber` (type) - missing @example
- `src/Uspto.service.ts:41` `UsptoShape` (interface) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./Uspto.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Uspto.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Uspto.models.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./Uspto.service.ts";` (re-export) - missing @example

### @beep/phoenix

Path: `packages/drivers/phoenix`

Export findings:
- `src/Phoenix.errors.ts:57` `PhoenixOperation` (type) - missing @example
- `src/Phoenix.errors.ts:85` `PhoenixErrorReason` (type) - missing @example
- `src/Phoenix.models.ts:41` `PhoenixDoctorStatus` (type) - missing @example
- `src/Phoenix.models.ts:68` `PhoenixDatasetSelectorKind` (type) - missing @example
- `src/Phoenix.models.ts:95` `PhoenixAnnotationTargetKind` (type) - missing @example
- `src/Phoenix.models.ts:122` `PhoenixAnnotatorKind` (type) - missing @example
- `src/Phoenix.models.ts:149` `PhoenixAnnotationValue` (type) - missing @example
- `src/Phoenix.models.ts:184` `PhoenixPromptChatRole` (type) - missing @example
- `src/Phoenix.models.ts:211` `PhoenixPromptTemplateFormat` (type) - missing @example
- `src/Phoenix.models.ts:246` `PhoenixPromptModelProvider` (type) - missing @example

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Export findings:
- `src/SqlTest.ts:203` `PgliteTestcontainersTestDriverConfigInput` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:261` `PgExternalTestDriverConfigInput` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:276` `PgliteSqlTestLayerMode` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:290` `PgliteSqlTestLayerOptions` (interface) - 1 unsafe example violation(s)
- `src/SqlTest.ts:484` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)
- `src/index.ts:16` `export * from "./Entity.js";` (re-export) - missing @example
- `src/index.ts:23` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./Schema.js";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./SqlTest.js";` (re-export) - missing @example

### @beep/oip-web

Path: `apps/oip-web`

Export findings:
- `src/app/api/contact/ContactRouteResponse.ts:87` `contactRequestResponseWithSubmit` (const) - 1 unsafe example violation(s)
- `src/app/layout.tsx:146` `instant` (const) - missing @example
- `src/app/page.tsx:37` `instant` (const) - missing @example
- `src/contact/index.ts:14` `export * from "./ContactSubmission.http.ts";` (re-export) - missing @example
- `src/contact/index.ts:21` `export * from "./ContactSubmission.model.ts";` (re-export) - missing @example
- `src/contact/index.ts:28` `export * from "./ContactSubmission.service.ts";` (re-export) - missing @example
- `src/content/index.ts:14` `export * from "./OipContent.data.ts";` (re-export) - missing @example
- `src/content/index.ts:21` `export * from "./OipContent.model.ts";` (re-export) - missing @example
- `src/content/index.ts:28` `export * from "./OipContent.runtime.ts";` (re-export) - missing @example
- `src/content/index.ts:35` `export * from "./OipSeo.ts";` (re-export) - missing @example

### @beep/lexical-schema

Path: `packages/foundation/modeling/lexical`

Export findings:
- `src/Lexical.codec.ts:718` `nodeToBlocks` (const) - 2 schema annotation/type-alias gap(s)
- `src/Lexical.model.ts:109` `LexicalNodeVersion` (const) - missing @example
- `src/Lexical.model.ts:121` `LexicalNodeVersion` (type) - missing @example
- `src/Lexical.model.ts:129` `TextFormatBits` (const) - missing @example
- `src/Lexical.model.ts:149` `TextFormatBit` (const) - missing @example
- `src/Lexical.model.ts:173` `TextFormatBit` (type) - missing @example
- `src/Lexical.model.ts:181` `TEXT_FORMAT_MASK_ALL` (const) - missing @example
- `src/Lexical.model.ts:214` `TextFormatMask` (const) - missing @example
- `src/Lexical.model.ts:222` `TextFormatMask` (type) - missing @example
- `src/Lexical.model.ts:230` `hasTextFormat` (const) - missing @example
- `src/Lexical.model.ts:241` `withTextFormat` (const) - missing @example
- `src/Lexical.model.ts:252` `TextDetailBits` (const) - missing @example
- `src/Lexical.model.ts:263` `TextDetailBit` (const) - missing @example
- `src/Lexical.model.ts:275` `TextDetailBit` (type) - missing @example
- `src/Lexical.model.ts:283` `TEXT_DETAIL_MASK_ALL` (const) - missing @example
- `src/Lexical.model.ts:305` `TextDetailMask` (const) - missing @example
- `src/Lexical.model.ts:313` `TextDetailMask` (type) - missing @example
- `src/Lexical.model.ts:321` `LexicalIndentDepth` (const) - missing @example
- `src/Lexical.model.ts:334` `LexicalIndentDepth` (type) - missing @example
- `src/Lexical.model.ts:342` `TableCellHeaderState` (const) - missing @example
- `src/Lexical.model.ts:354` `TableCellHeaderState` (type) - missing @example
- `src/Lexical.model.ts:362` `TableCellSpan` (const) - missing @example
- `src/Lexical.model.ts:375` `TableCellSpan` (type) - missing @example
- `src/Lexical.model.ts:383` `TableDimension` (const) - missing @example
- `src/Lexical.model.ts:396` `TableDimension` (type) - missing @example
- `src/Lexical.model.ts:404` `ArtifactRefId` (const) - missing @example
- `src/Lexical.model.ts:424` `ArtifactRefId` (type) - missing @example
- `src/Lexical.model.ts:704` `SafeInlineStyle` (const) - 1 schema annotation/type-alias gap(s)
- `src/Lexical.model.ts:749` `SafeStyleValue` (const) - 1 schema annotation/type-alias gap(s)
- `src/Lexical.model.ts:801` `BaseNode` (namespace) - missing @example
- `src/Lexical.model.ts:890` `ElementNode` (namespace) - missing @example
- `src/Lexical.model.ts:959` `TextBase` (namespace) - missing @example
- `src/Lexical.model.ts:1027` `TextNode` (namespace) - missing @example
- `src/Lexical.model.ts:1087` `TabNode` (namespace) - missing @example
- `src/Lexical.model.ts:1145` `LineBreakNode` (namespace) - missing @example
- `src/Lexical.model.ts:1201` `RootNode` (namespace) - missing @example
- `src/Lexical.model.ts:1257` `ParagraphNode` (namespace) - missing @example
- `src/Lexical.model.ts:1314` `HeadingNode` (namespace) - missing @example
- `src/Lexical.model.ts:1372` `QuoteNode` (namespace) - missing @example
- `src/Lexical.model.ts:1431` `ListNode` (namespace) - missing @example
- `src/Lexical.model.ts:1498` `ListItemNode` (namespace) - missing @example
- `src/Lexical.model.ts:1562` `LinkNode` (namespace) - missing @example
- `src/Lexical.model.ts:1631` `CodeNode` (namespace) - missing @example
- `src/Lexical.model.ts:1701` `ArtifactRefNode` (namespace) - missing @example
- `src/Lexical.model.ts:1772` `YouTubeNode` (namespace) - missing @example
- `src/Lexical.model.ts:1859` `TableCellNode` (namespace) - missing @example
- `src/Lexical.model.ts:1931` `TableRowNode` (namespace) - missing @example
- `src/Lexical.model.ts:2005` `TableNode` (namespace) - missing @example
- `src/Lexical.model.ts:2051` `LexicalNode` (const) - 1 schema annotation/type-alias gap(s)
- `src/Lexical.model.ts:2094` `LexicalNode` (namespace) - missing @example
- `src/Lexical.model.ts:2176` `SerializedEditorState` (namespace) - missing @example

### @beep/langextract

Path: `packages/foundation/capability/langextract`

Export findings:
- `src/Extraction/index.ts:64` `LangExtractErrorReason` (type) - missing @example
- `src/Extraction/index.ts:130` `AlignmentStatus` (type) - missing @example
- `src/Target/index.ts:39` `ExtractionTargetKind` (type) - missing @example
- `src/index.ts:14` `export * as Alignment from "./Alignment/index.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * as Extraction from "./Extraction/index.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as Handoff from "./Handoff/index.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * as Service from "./Service/index.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * as Target from "./Target/index.ts";` (re-export) - missing @example

### @beep/shared-tables

Path: `packages/shared/tables`

Export findings:
- `src/Schema.ts:49` `DbSchema` (type) - 1 unsafe example violation(s)
- `src/entities/Membership/index.ts:7` `export * from "./Membership.table.ts";` (re-export) - missing @example
- `src/entities/Organization/index.ts:7` `export * from "./Organization.table.js";` (re-export) - missing @example
- `src/entities/User/index.ts:7` `export * from "./User.table.ts";` (re-export) - missing @example
- `src/entities/index.ts:7` `export * as Membership from "./Membership/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:14` `export * as Organization from "./Organization/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:21` `export * as User from "./User/index.ts";` (re-export) - missing @example
- `src/index.ts:14` `export * as Entities from "./entities/index.ts";` (re-export) - missing @example
- `src/table/Table.ts:14` `export { EntityTable } from "@beep/drizzle";` (re-export) - missing @example
- `src/table/index.ts:14` `export * as Table from "./Table.ts";` (re-export) - missing @example

### @beep/md

Path: `packages/foundation/modeling/md`

Export findings:
- `src/Md.model.ts:24` `CodeFenceLanguage` (const) - missing @example
- `src/Md.model.ts:43` `CodeFenceLanguage` (type) - missing @example
- `src/Md.model.ts:55` `YouTubeVideoId` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:75` `InlineChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:87` `InlineChildren` (namespace) - missing @example
- `src/Md.model.ts:133` `Text` (namespace) - missing @example
- `src/Md.model.ts:182` `RawMarkdown` (namespace) - missing @example
- `src/Md.model.ts:234` `RawHtml` (namespace) - missing @example
- `src/Md.model.ts:283` `Strong` (namespace) - missing @example
- `src/Md.model.ts:335` `Em` (namespace) - missing @example
- `src/Md.model.ts:387` `Del` (namespace) - missing @example
- `src/Md.model.ts:439` `Code` (namespace) - missing @example
- `src/Md.model.ts:494` `A` (namespace) - missing @example
- `src/Md.model.ts:554` `Img` (namespace) - missing @example
- `src/Md.model.ts:598` `Br` (namespace) - missing @example
- `src/Md.model.ts:642` `Inline` (type) - missing @example
- `src/Md.model.ts:650` `Inline` (namespace) - missing @example
- `src/Md.model.ts:688` `BlockChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:700` `BlockChildren` (namespace) - missing @example
- `src/Md.model.ts:720` `ListItemChild` (const) - missing @example
- `src/Md.model.ts:734` `ListItemChild` (type) - missing @example
- `src/Md.model.ts:742` `ListItemChild` (namespace) - missing @example
- `src/Md.model.ts:760` `ListItemChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:772` `ListItemChildren` (namespace) - missing @example
- `src/Md.model.ts:818` `P` (namespace) - missing @example
- `src/Md.model.ts:870` `H1` (namespace) - missing @example
- `src/Md.model.ts:922` `H2` (namespace) - missing @example
- `src/Md.model.ts:974` `H3` (namespace) - missing @example
- `src/Md.model.ts:1026` `H4` (namespace) - missing @example
- `src/Md.model.ts:1078` `H5` (namespace) - missing @example
- `src/Md.model.ts:1130` `H6` (namespace) - missing @example
- `src/Md.model.ts:1182` `Li` (namespace) - missing @example
- `src/Md.model.ts:1206` `ListChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:1218` `ListChildren` (namespace) - missing @example
- `src/Md.model.ts:1264` `Ul` (namespace) - missing @example
- `src/Md.model.ts:1316` `Ol` (namespace) - missing @example
- `src/Md.model.ts:1369` `TaskItem` (namespace) - missing @example
- `src/Md.model.ts:1395` `TaskItemChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Md.model.ts:1407` `TaskItemChildren` (namespace) - missing @example
- `src/Md.model.ts:1451` `TaskList` (namespace) - missing @example
- `src/Md.model.ts:1501` `BlockQuote` (namespace) - missing @example
- `src/Md.model.ts:1560` `Pre` (namespace) - missing @example
- `src/Md.model.ts:1616` `TableCell` (namespace) - missing @example
- `src/Md.model.ts:1666` `TableRow` (namespace) - missing @example
- `src/Md.model.ts:1722` `Table` (namespace) - missing @example
- `src/Md.model.ts:1774` `YouTube` (namespace) - missing @example
- `src/Md.model.ts:1817` `Hr` (namespace) - missing @example
- `src/Md.model.ts:1861` `Block` (type) - missing @example
- `src/Md.model.ts:1869` `Block` (namespace) - missing @example
- `src/Md.model.ts:1943` `Document` (namespace) - missing @example
- `src/Md.ts:976` `table` (const) - 2 schema annotation/type-alias gap(s)

### @beep/law-practice-use-cases

Path: `packages/law-practice/use-cases`

Export findings:
- `src/IrToLaw/IrToLaw.errors.ts:44` `IrToLawExtractionErrorReason` (type) - missing @example
- `src/OfficeActionReview/OfficeActionReview.ports.ts:82` `OfficeActionReviewError` (type) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example

### @beep/workspace-domain

Path: `packages/workspace/domain`

Export findings:
- `src/entities/Turn/Turn.model.ts:25` `MessageItem` (class) - missing @example
- `src/entities/Turn/Turn.model.ts:41` `ToolCallItem` (class) - missing @example
- `src/entities/Turn/Turn.model.ts:59` `ToolResultItem` (class) - missing @example
- `src/entities/Turn/Turn.model.ts:76` `ArtifactRefItem` (class) - missing @example
- `src/entities/Turn/Turn.model.ts:92` `ActivityItem` (class) - missing @example
- `src/entities/Turn/Turn.model.ts:140` `TurnItem` (type) - missing @example
- `src/entities/Turn/Turn.model.ts:148` `TurnItems` (const) - missing @example
- `src/entities/Turn/Turn.model.ts:160` `TurnItems` (type) - missing @example

### @beep/semantic-web

Path: `packages/foundation/capability/semantic-web`

Export findings:
- `src/adapters/web-annotation.ts:8` `export * from "@beep/rdf/Adapters/WebAnnotation";` (re-export) - missing @example, @category
- `src/evidence.ts:8` `export * from "@beep/rdf/Evidence";` (re-export) - missing @example, @category
- `src/index.ts:14` `export * from "./iri.ts";` (re-export) - missing @example
- `src/iri.ts:9` `export * from "@beep/rdf/Iri";` (re-export) - missing @example
- `src/jsonld.ts:9` `export * from "@beep/rdf/JsonLd";` (re-export) - missing @example
- `src/prov.ts:8` `export * from "@beep/rdf/Prov";` (re-export) - missing @example, @category
- `src/rdf.ts:9` `export * from "@beep/rdf/Rdf";` (re-export) - missing @example
- `src/semantic-schema-metadata.ts:9` `export * from "@beep/rdf/SemanticSchemaMetadata";` (re-export) - missing @example
- `src/services/canonicalization.ts:48` `CanonicalizationAlgorithm` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-context.ts:44` `JsonLdContextErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-document.ts:46` `JsonLdDocumentErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-parse.ts:231` `JsonLdStreamParseErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-serialize.ts:108` `JsonLdStreamSerializeErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/provenance.ts:64` `ProvenanceExportProfile` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/shacl-validation.ts:47` `ShaclSeverity` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/sparql-query.ts:42` `SparqlQueryProfile` (const) - 1 schema annotation/type-alias gap(s)
- `src/uri.ts:9` `export * from "@beep/rdf/Uri";` (re-export) - missing @example
- `src/vocab/oa.ts:9` `export * from "@beep/rdf/Vocab/Oa";` (re-export) - missing @example
- `src/vocab/owl.ts:9` `export * from "@beep/rdf/Vocab/Owl";` (re-export) - missing @example
- `src/vocab/prov.ts:9` `export * from "@beep/rdf/Vocab/Prov";` (re-export) - missing @example
- `src/vocab/rdf.ts:9` `export * from "@beep/rdf/Vocab/Rdf";` (re-export) - missing @example
- `src/vocab/rdfs.ts:9` `export * from "@beep/rdf/Vocab/Rdfs";` (re-export) - missing @example
- `src/vocab/xsd.ts:9` `export * from "@beep/rdf/Vocab/Xsd";` (re-export) - missing @example

### @beep/utils

Path: `packages/foundation/modeling/utils`

Module findings:
- `src/DrainableWorker.ts:1` (none) - missing summary; missing @since

Export findings:
- `src/Errors.ts:163` `mapToError` (function) - missing summary; missing @example, @category, @since
- `src/Errors.ts:166` `mapToError` (function) - missing summary; missing @example, @category, @since
- `src/FileSystem.ts:353` `readdirSync` (function) - missing summary; missing @example, @category, @since
- `src/FileSystem.ts:357` `readdirSync` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:206` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:209` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:212` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:215` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:224` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:242` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:262` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:284` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:308` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:334` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:335` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Utils.ts:64` `export * from "effect/Utils";` (re-export) - missing @example
- `src/index.ts:14` `export { dual, flow, identity, pipe } from "effect/Function";` (re-export) - missing @example
- `src/index.ts:69` `export * from "./DrainableWorker.ts";` (re-export) - missing @example
- `src/index.ts:134` `export * from "./GlobalValue.ts";` (re-export) - missing @example
- `src/index.ts:303` `export * as Utils from "./Utils.ts";` (re-export) - missing @example

### @beep/repo-ai-metrics

Path: `packages/tooling/library/ai-metrics`

Export findings:
- `src/agent-effectiveness.ts:102` `AgentEffectivenessStatus` (type) - missing @example
- `src/agent-effectiveness.ts:127` `AgentEffectivenessAnnotationValue` (type) - missing @example
- `src/agent-effectiveness.ts:655` `AgentEffectivenessDatasetKind` (type) - missing @example
- `src/agent-effectiveness.ts:782` `AgentEffectivenessPromptRole` (type) - missing @example

### @beep/architecture-lab-tables

Path: `packages/architecture-lab/tables`

Export findings:
- `src/aggregates/WorkItem/WorkItem.table.ts:68` `WorkItemRow` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.table.ts:84` `WorkItemInsert` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.table.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.table.ts:58` `WorkerRow` (type) - 1 unsafe example violation(s)
- `src/entities/Worker/Worker.table.ts:74` `WorkerInsert` (type) - 1 unsafe example violation(s)
- `src/entities/Worker/index.ts:7` `export * from "./Worker.table.js";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./tables.js";` (re-export) - missing @example
- `src/tables.ts:49` `DbSchema` (type) - 1 unsafe example violation(s)

### @beep/tika

Path: `packages/drivers/tika`

Export findings:
- `src/index.ts:14` `export * from "./Tika.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Tika.service.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Tika.tikaapp.ts";` (re-export) - missing @example

### @beep/libpff

Path: `packages/drivers/libpff`

Export findings:
- `src/Libpff.pffexport.ts:56` `PffexportMode` (type) - missing @example
- `src/Libpff.pffexport.ts:82` `PffexportFormat` (type) - missing @example
- `src/index.ts:14` `export * from "./Libpff.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Libpff.pffexport.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Libpff.service.ts";` (re-export) - missing @example

### @beep/form

Path: `packages/foundation/ui-system/form`

Export findings:
- `src/components/Form.tsx:21` `FormProps` (interface) - missing @example
- `src/components/SubmitButton.tsx:23` `SubmitButtonProps` (interface) - missing @example
- `src/fields/TimeField.tsx:35` `TimeFieldProps` (interface) - 1 unsafe example violation(s)

### @beep/identity

Path: `packages/foundation/modeling/identity`

Export findings:
- `src/Id.ts:116` `IdentityInterpolationError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:147` `IdentitySegmentCountError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:378` `IdentityString` (type) - 1 unsafe example violation(s)
- `src/Id.ts:395` `IdentitySymbol` (type) - 1 unsafe example violation(s)

### @beep/drizzle

Path: `packages/drivers/drizzle`

Export findings:
- `src/index.ts:14` `export * from "./Drizzle.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Drizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as EntityTable from "./EntityTable.models.ts";` (re-export) - missing @example

### @beep/box

Path: `packages/drivers/box`

Export findings:
- `src/experimental/Box.schemas.ts:84` `SerializedData` (type) - missing @example
- `src/experimental/Box.schemas.ts:138` `SerializedDataList` (type) - missing @example
- `src/experimental/Box.schemas.ts:197` `SerializedDataMap` (type) - missing @example
- `src/experimental/Box.schemas.ts:290` `BoxSdkError` (type) - missing @example
- `src/experimental/Box.schemas.ts:319` `BoxApiError` (type) - missing @example
- `src/experimental/domain/entities/AiTaxonomy/AiTaxonomy.model.ts:38` `AiTaxonomy` (namespace) - missing @example, @category
- `src/experimental/domain/entities/AiTextGen/AiTextGen.model.ts:38` `AiTextGen` (namespace) - missing @example, @category
- `src/experimental/domain/entities/AppItem/AppItem.model.ts:38` `AppItem` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Collaboration/Collaboration.model.ts:38` `Collaboration` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Comment/Comment.model.ts:38` `Comment` (namespace) - missing @example, @category
- `src/experimental/domain/entities/DevicePinner/DevicePinner.ts:38` `DevicePinner` (namespace) - missing @example, @category
- `src/experimental/domain/entities/EmailAlias/EmailAlias.model.ts:38` `EmailAlias` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Event/Event.model.ts:38` `Event` (namespace) - missing @example, @category
- `src/experimental/domain/entities/File/File.model.ts:38` `File` (namespace) - missing @example, @category
- `src/experimental/domain/entities/FileVersion/FileVersion.model.ts:38` `FileVersion` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Folder/Folder.model.ts:38` `Folder` (namespace) - missing @example, @category
- `src/experimental/domain/entities/FolderReference/FolderReference.model.ts:38` `FolderReference` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Group/Group.model.ts:38` `Group` (namespace) - missing @example, @category
- `src/experimental/domain/entities/GroupMembership/GroupMembership.model.ts:38` `GroupMembership` (namespace) - missing @example, @category
- `src/experimental/domain/entities/IntegrationMapping/IntegrationMapping.model.ts:38` `IntegrationMapping` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Invite/Invite.model.ts:38` `Invite` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Item/Item.model.ts:38` `Item` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Outcome/Outcome.model.ts:38` `Outcome` (namespace) - missing @example, @category
- `src/experimental/domain/entities/PLACEHOLDER/PLACEHOLDER.model.ts:38` `PLACEHOLDER` (namespace) - missing @example, @category
- `src/experimental/domain/entities/RetentionPolicy/RetentionPolicy.model.ts:38` `RetentionPolicy` (namespace) - missing @example, @category
- `src/experimental/domain/entities/RetentionPolicyAssignment/RetentionPolicyAssignment.model.ts:38` `RetentionPolicyAssignment` (namespace) - missing @example, @category
- `src/experimental/domain/entities/SignRequest/SignRequest.model.ts:38` `SignRequest` (namespace) - missing @example, @category
- `src/experimental/domain/entities/SignTemplate/SignTemplate.model.ts:38` `SignTemplate` (namespace) - missing @example, @category
- `src/experimental/domain/entities/StoragePolicy/StoragePolicy.model.ts:38` `StoragePolicy` (namespace) - missing @example, @category
- `src/experimental/domain/entities/StoragePolicyAssignment/StoragePolicyAssignment.model.ts:38` `StoragePolicyAssignment` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Task/Task.model.ts:38` `Task` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TaskAssignment/TaskAssignment.model.ts:38` `TaskAssignment` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashFile/TrashFile.model.ts:38` `TrashFile` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashFileRestored/TrashFileRestored.model.ts:38` `TrashFileRestored` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashFolder/TrashFolder.model.ts:38` `TrashFolder` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashFolderRestored/TrashFolderRestored.model.ts:38` `TrashFolderRestored` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashWebLink/TrashWebLink.model.ts:38` `TrashWebLink` (namespace) - missing @example, @category
- `src/experimental/domain/entities/TrashWebLinkRestored/TrashWebLinkRestored.model.ts:38` `TrashWebLinkRestored` (namespace) - missing @example, @category
- `src/experimental/domain/entities/UploadSession/UploadSession.model.ts:38` `UploadSession` (namespace) - missing @example, @category
- `src/experimental/domain/entities/User/User.model.ts:38` `User` (namespace) - missing @example, @category
- `src/experimental/domain/entities/WebLink/WebLink.model.ts:38` `WebLink` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Webhook/Webhook.model.ts:38` `Webhook` (namespace) - missing @example, @category
- `src/experimental/domain/entities/Workflow/Workflow.model.ts:38` `Workflow` (namespace) - missing @example, @category
- `src/experimental/domain/entities/ZipDownload/ZipDownload.model.ts:38` `ZipDownload` (namespace) - missing @example, @category
- `src/experimental/domain/errors/ClientError.errors.ts:38` `PLACEHOLDER` (namespace) - missing @example, @category
- `src/experimental/domain/values/Classification/Classification.model.ts:38` `Classification` (namespace) - missing @example, @category
- `src/experimental/domain/values/Metadata/Metadata.model.ts:39` `Metadata` (namespace) - missing @example, @category
- `src/experimental/domain/values/PLACEHOLDER/PLACEHOLDER.model.ts:38` `PLACEHOLDER` (namespace) - missing @example, @category
- `src/experimental/domain/values/Resource/Resource.model.ts:38` `Resource` (namespace) - missing @example, @category
- `src/experimental/domain/values/SearchResult/PLACEHOLDER.model.ts:41` `PLACEHOLDER` (namespace) - missing @example, @category
- `src/experimental/domain/values/SerializedData/SerializedData.model.ts:80` `SerializedData` (type) - missing @example
- `src/experimental/domain/values/SerializedData/SerializedData.model.ts:134` `SerializedDataList` (type) - missing @example
- `src/experimental/domain/values/SerializedData/SerializedData.model.ts:193` `SerializedDataMap` (type) - missing @example
- `src/experimental/domain/values/UploadPart/UploadPart.model.ts:38` `UploadPart` (namespace) - missing @example, @category

### @beep/nlp-processing

Path: `packages/foundation/capability/nlp-processing`

Export findings:
- `src/Core/index.ts:13` `export * from "./Tokenization.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/Types.ts:150` `ExecutionMetrics` (class) - 1 schema annotation/type-alias gap(s)
- `src/Graph/GraphOperations/Types.ts:549` `OperationCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/Graph/GraphOperations/index.ts:14` `export * as Catalog from "./Catalog.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/index.ts:21` `export * as Executor from "./Executor.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/index.ts:28` `export * as ResultStore from "./ResultStore.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/index.ts:35` `export * as Errors from "./Errors.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/index.ts:42` `export * as Operation from "./Operation.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/index.ts:49` `export * as Types from "./Types.ts";` (re-export) - missing @example
- `src/Graph/index.ts:14` `export * as AnnotatedTextGraph from "./AnnotatedTextGraph.ts";` (re-export) - missing @example
- `src/Graph/index.ts:21` `export * as EffectGraph from "./EffectGraph.ts";` (re-export) - missing @example
- `src/Graph/index.ts:28` `export * as GraphOperations from "./GraphOperations/index.ts";` (re-export) - missing @example
- `src/Graph/index.ts:35` `export * as TextGraph from "./TextGraph.ts";` (re-export) - missing @example
- `src/Graph/index.ts:42` `export * as TypeClass from "./TypeClass.ts";` (re-export) - missing @example
- `src/index.ts:14` `export * as Backend from "./Backend/index.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * as Core from "./Core/index.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as Graph from "./Graph/index.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * as NLPService from "./NLPService.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * as Tools from "./Tools/index.ts";` (re-export) - missing @example

### @beep/professional-desktop

Path: `apps/professional-desktop`

Module findings:
- `src/runtime/Pglite.ts:1` (none) - missing summary; missing @since
- `src/transport/TauriIpcSocket.ts:1` (none) - missing summary; missing @since

Export findings:
- `src/chat/ChatFixtures.ts:15` `decodeWorkspaceId` (const) - missing summary; missing @example, @category, @since
- `src/chat/ChatFixtures.ts:17` `userDocument` (const) - missing summary; missing @example, @category, @since
- `src/chat/ChatFixtures.ts:20` `userParagraphDocument` (const) - missing summary; missing @example, @category, @since
- `src/chat/ChatOrchestrator.ts:50` `documentToPlainText` (const) - missing @example
- `src/chat/ChatOrchestrator.ts:359` `makeChatOperations` (const) - missing @example
- `src/chat/UsageRecordSink.ts:27` `UsageRecordSinkShape` (interface) - missing @example
- `src/chat/UsageRecordSink.ts:38` `UsageRecordSink` (class) - missing @example
- `src/chat/UsageRecordSink.ts:51` `makeInMemoryUsageRecordSink` (const) - missing @example
- `src/chat/UsageRecordSink.ts:72` `UsageRecordSinkInMemory` (const) - missing @example
- `src/chat/UsageRecordSink.ts:125` `UsageRecordSinkDrizzle` (const) - missing @example
- `src/chat/ui/StreamingBlocks.tsx:40` `boundedKey` (const) - missing @example, @category, @since
- `src/chat/ui/StreamingBlocks.tsx:51` `stableOccurrenceKeys` (const) - missing @example, @category, @since
- `src/chat/ui/StreamingBlocks.tsx:79` `blockRenderKey` (const) - missing summary; missing @example, @category, @since
- `src/runtime/Layer.ts:50` `ChatHandlersLayer` (type) - missing @example
- `src/runtime/Layer.ts:82` `RuntimeLive` (const) - missing @example
- `src/runtime/Layer.ts:97` `RuntimeTest` (const) - missing @example
- `src/runtime/Migrations.ts:254` `SidecarReadyMarker` (const) - missing @example
- `src/runtime/Observability.ts:97` `ObservabilityLive` (const) - missing @example
- `src/runtime/Pglite.ts:72` `ChatDbCompatibilityMarker` (const) - missing @example
- `src/runtime/Pglite.ts:112` `markCompatibleChatDbDataDir` (const) - missing @example
- `src/runtime/Pglite.ts:172` `ensureCompatibleChatDbDataDir` (const) - missing @example
- `src/runtime/Pglite.ts:252` `makeBundledPgliteLayer` (const) - missing @example
- `src/runtime/Pglite.ts:266` `PgliteDrizzleLive` (const) - missing @example

### @beep/epistemic-domain

Path: `packages/epistemic/domain`

Export findings:
- `src/values/EvidenceSpan/EvidenceSpan.model.ts:50` `Confidence` (type) - 1 unsafe example violation(s)

### @beep/architecture-lab-use-cases

Path: `packages/architecture-lab/use-cases`

Export findings:
- `src/aggregates/WorkItem/WorkItem.errors.ts:143` `WorkItemActionError` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.errors.ts:158` `WorkItemActionError` (const) - 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.repository.ts:111` `WorkItemRepositoryError` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.repository.ts:130` `WorkItemRepositoryShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:40` `WorkItemUseCasesShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.commands.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.use-cases.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:14` `export * from "./WorkItem.repository.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:21` `export { makeWorkItemUseCases, toWorkItemActionError } from "./WorkItem.service.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.errors.ts:118` `WorkerActionError` (type) - 1 unsafe example violation(s)
- `src/entities/Worker/Worker.errors.ts:133` `WorkerActionError` (const) - 1 schema annotation/type-alias gap(s)
- `src/entities/Worker/Worker.repository.ts:107` `WorkerRepositoryError` (type) - 1 unsafe example violation(s)
- `src/entities/Worker/Worker.repository.ts:123` `WorkerRepositoryShape` (interface) - 1 unsafe example violation(s)
- `src/entities/Worker/Worker.use-cases.ts:32` `WorkerUseCasesShape` (interface) - 1 unsafe example violation(s)
- `src/entities/Worker/index.ts:7` `export * from "./Worker.commands.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.errors.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:21` `export * from "./Worker.use-cases.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:14` `export * from "./Worker.repository.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:21` `export { makeWorkerUseCases, toWorkerActionError } from "./Worker.service.js";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/public.ts:14` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as WorkItem from "./aggregates/WorkItem/server.js";` (re-export) - missing @example
- `src/server.ts:14` `export * as Worker from "./entities/Worker/server.js";` (re-export) - missing @example

### @beep/firecrawl

Path: `packages/drivers/firecrawl`

Export findings:
- `src/Firecrawl.models.ts:412` `FirecrawlScrapeOptions` (const) - missing @example
- `src/Firecrawl.models.ts:438` `FirecrawlParseFile` (const) - missing @example
- `src/Firecrawl.models.ts:464` `FirecrawlParseOptions` (const) - missing @example

### @beep/ecfr

Path: `packages/drivers/ecfr`

Module findings:
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example; 1 category casing violation(s)

### @beep/acp

Path: `packages/drivers/acp`

Export findings:
- `src/Acp.errors.ts:405` `AcpError` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/modeling/nlp`

Export findings:
- `src/Core/PatternBuilders.ts:93` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:94` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:118` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:119` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:143` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:144` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:165` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:166` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:190` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:191` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:215` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:216` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternParsers.ts:104` `BracketStringToPOSPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:133` `BracketStringToEntityPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:164` `BracketStringToLiteralPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/Similarity.ts:48` `SimilarityMethod` (type) - missing @example
- `src/Core/Vectorization.ts:16` `export { PositiveNumber } from "../internal/numbers.ts";` (re-export) - missing @example, @category, @since
- `src/Core/Vectorization.ts:52` `BM25Norm` (type) - missing @example
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Similarity.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:51` `export * from "./Vectorization.ts";` (re-export) - missing @example
- `src/Graph/Schema.ts:41` `TextNodeType` (const) - 1 schema annotation/type-alias gap(s)
- `src/Graph/Schema.ts:60` `TextEdgeRelation` (const) - 1 schema annotation/type-alias gap(s)
- `src/Handoff/Contract.ts:54` `ChunkId` (type) - missing @example
- `src/Handoff/Contract.ts:80` `MentionId` (type) - missing @example
- `src/Handoff/Contract.ts:106` `EntityId` (type) - missing @example
- `src/Handoff/Contract.ts:132` `RelationId` (type) - missing @example
- `src/Handoff/Contract.ts:147` `ChunkKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/Handoff/Contract.ts:206` `Span` (type) - missing @example
- `src/Ontology/Kind.ts:151` `TypedTextSchema` (const) - 1 schema annotation/type-alias gap(s)

### @beep/runpod

Path: `packages/drivers/runpod`

Export findings:
- `src/Runpod.service.ts:176` `RunpodShape` (interface) - 1 unsafe example violation(s)
- `src/_generated/Runpod.generated.ts:2483` `RunpodHttpMethod` (const) - 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:2513` `RunpodOperationId` (const) - 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:2577` `RunpodRequestBodyKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:2607` `RunpodResponseBodyKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:14` `export * from "./_generated/Runpod.generated.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Runpod.config.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Runpod.errors.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./Runpod.service.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./RunpodDocs.service.ts";` (re-export) - missing @example

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/TypeScript/index.ts:1` (jsdoc) - missing summary
- `src/TypeScript/models/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/JSDoc/JSDoc.ts:510` `StructuralJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1136` `AccessModifierJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1533` `DocumentationContentJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:1957` `TSDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2082` `InlineJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2366` `OrganizationalJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:2553` `EventDependencyJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3277` `RemainingJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:3838` `ClosureSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4229` `TypeDocSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4319` `TypeScriptSpecificJSDoc` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/JSDoc.ts:4365` `JSDocTag` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/index.ts:8` `export * as Models from "./models/index.js";` (re-export) - missing @example
- `src/JSDoc/models/TSCategory.model.ts:276` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/TagValue.model.ts:11` `export * from "./tag-values/index.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:14` `export * from "./ApplicableTo.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:19` `export * from "./ASTDerivability.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:24` `export * as CanonicalJSDocSourceMetadata from "./CanonicalJSDocSourceMetadata.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:29` `export * from "./HasJSDocApplicableToMapEntry.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:34` `export * from "./JSDocTagAnnotation.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:39` `export * as JSDocTagDefinition from "./JSDocTagDefinition.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:44` `export * from "./Specification.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:49` `export * from "./TagKind.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:54` `export * from "./TagParameters.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:59` `export * from "./TagValue.model.js";` (re-export) - missing @example
- `src/JSDoc/models/index.ts:64` `export * from "./TSCategory.model.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/_fields.ts:22` `typeField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:35` `optionalType` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:48` `nameField` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:61` `optionalName` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/_fields.ts:74` `optionalDesc` (const) - 2 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:16` `export * from "./AccessModifierTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:21` `export * from "./ClosureTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:26` `export * from "./DocumentationTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:31` `export * from "./EventDependencyTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:36` `export * from "./InlineTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:41` `export * from "./OrganizationalTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:46` `export * from "./RemainingTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:52` `export * from "./StructuralTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:57` `export * from "./TSDocTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:62` `export * from "./TypeDocTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:67` `export * from "./TypeScriptTagValues.js";` (re-export) - missing @example
- `src/JSDoc/models/tag-values/index.ts:356` `TagValue` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/tag-values/index.ts:532` `TagName` (const) - 1 schema annotation/type-alias gap(s)
- `src/ProcessArgs.ts:46` `export { OptionInjectionError } from "./errors/OptionInjectionError.js";` (re-export) - missing @example
- `src/ProcessArgs.ts:238` `LiteralArg` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:400` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:426` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:697` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:723` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1728` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:272` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/index.ts:7` `export * from "./TSMorph.model.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:14` `export * from "./TSMorph.service.js";` (re-export) - missing @example
- `src/TypeScript/index.ts:5` `export * from "./models/index.js";` (re-export) - missing @example
- `src/TypeScript/models/index.ts:5` `export * from "./TSSyntaxKind.model.js";` (re-export) - missing @example
- `src/errors/index.ts:12` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  CyclicDependencyError,
} from "./CyclicDependencyError.js";` (re-export) - missing @example
- `src/errors/index.ts:23` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  DomainError,
} from "./DomainError.js";` (re-export) - missing @example
- `src/errors/index.ts:34` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./NoSuchFileError.js";` (re-export) - missing @example
- `src/errors/index.ts:45` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  OptionInjectionError,
} from "./OptionInjectionError.js";` (re-export) - missing @example
- `src/index.ts:15` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  extractWorkspaceDependencies,
} from "./Dependencies.js";` (re-export) - missing @example
- `src/index.ts:26` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  buildRepoDependencyIndex,
} from "./DependencyIndex.js";` (re-export) - missing @example
- `src/index.ts:37` `export {
  /**
   * @category errors
   * @since 0.0.0
   */
  CyclicDependencyError,
  /**
   * @category errors
   * @since 0.0.0
   */
  DomainError,
  /**
   * @category errors
   * @since 0.0.0
   */
  NoSuchFileError,
} from "./errors/index.js";` (re-export) - missing @example
- `src/index.ts:108` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  computeTransitiveClosure,
  /**
   * @category utilities
   * @since 0.0.0
   */
  detectCycles,
  /**
   * @category utilities
   * @since 0.0.0
   */
  topologicalSort,
} from "./Graph.js";` (re-export) - missing @example
- `src/index.ts:129` `export {
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonParse,
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonStringifyCompact,
  /**
   * @category serialization
   * @since 0.0.0
   */
  jsonStringifyPretty,
} from "./JsonUtils.js";` (re-export) - missing @example
- `src/index.ts:150` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";` (re-export) - missing @example
- `src/index.ts:161` `export {
  /**
   * @category constants
   * @since 0.0.0
   */
  END_OF_OPTIONS,
  /**
   * @category guards
   * @since 0.0.0
   */
  guardLiteralArg,
  /**
   * @category guards
   * @since 0.0.0
   */
  guardLiteralArgs,
  /**
   * @category combinators
   * @since 0.0.0
   */
  insertEndOfOptions,
  /**
   * @category predicates
   * @since 0.0.0
   */
  isOptionLike,
  /**
   * @category schemas
   * @since 0.0.0
   */
  LiteralArg,
  /**
   * @category combinators
   * @since 0.0.0
   */
  toLiteralArgs,
} from "./ProcessArgs.js";` (re-export) - missing @example
- `src/index.ts:202` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJson,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodePackageJsonExit,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonToJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  NpmPackageJson,
  /**
   * @category schemas
   * @since 0.0.0
   */
  PackageJson,
} from "./schemas/PackageJson.js";` (re-export) - missing @example
- `src/index.ts:248` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  applyPackageJsonPatchEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  diffPackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodePackageJsonCanonicalPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  getPackageJsonSchemaIssues,
  /**
   * @category schemas
   * @since 0.0.0
   */
  normalizePackageJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  npmPackageJsonJsonSchema,
  /**
   * @category schemas
   * @since 0.0.0
   */
  PackageJsonValidationIssue,
  /**
   * @category schemas
   * @since 0.0.0
   */
  packageJsonJsonSchema,
} from "./schemas/PackageJsonTools.js";` (re-export) - missing @example
- `src/index.ts:294` `export {
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfig,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigExit,
  /**
   * @category schemas
   * @since 0.0.0
   */
  decodeTSConfigFromJsoncTextEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigPrettyEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  encodeTSConfigToJsonEffect,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfig,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigBuildOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigCompilerOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigReference,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigTypeAcquisition,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSConfigWatchOptions,
  /**
   * @category schemas
   * @since 0.0.0
   */
  TSNodeConfig,
} from "./schemas/TSConfig.js";` (re-export) - missing @example
- `src/index.ts:370` `export {
  /**
   * @category models
   * @since 0.0.0
   */
  type DependencyRecord,
  /**
   * @category models
   * @since 0.0.0
   */
  emptyWorkspaceDeps,
  /**
   * @category models
   * @since 0.0.0
   */
  WorkspaceDeps,
} from "./schemas/WorkspaceDeps.js";` (re-export) - missing @example
- `src/index.ts:391` `export * from "./TSMorph/index.js";` (re-export) - missing @example
- `src/index.ts:396` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";` (re-export) - missing @example
- `src/index.ts:407` `export * from "./TypeScript/index.js";` (re-export) - missing @example
- `src/index.ts:440` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  getWorkspaceDir,
  /**
   * @category utilities
   * @since 0.0.0
   */
  resolveWorkspaceDirs,
} from "./Workspaces.js";` (re-export) - missing @example
- `src/schemas/index.ts:14` `export * from "./DocgenConfig.ts";` (re-export) - missing @example
- `src/schemas/index.ts:21` `export * from "./JSDocCategories.ts";` (re-export) - missing @example
- `src/schemas/index.ts:28` `export * from "./PackageJson.ts";` (re-export) - missing @example
- `src/schemas/index.ts:35` `export * from "./PackageJsonTools.ts";` (re-export) - missing @example
- `src/schemas/index.ts:42` `export * from "./TSConfig.ts";` (re-export) - missing @example
- `src/schemas/index.ts:49` `export * from "./TypeScriptSourceExclusions.ts";` (re-export) - missing @example
- `src/schemas/index.ts:56` `export * from "./WorkspaceDeps.ts";` (re-export) - missing @example

### @beep/schema

Path: `packages/foundation/modeling/schema`

Export findings:
- `src/Age/Age.schema.ts:45` `Age` (type) - missing @example
- `src/Age/Age.schema.ts:45` `Schema` (type) - missing @example
- `src/Age/index.ts:22` `export * from "./Age.schema.ts";` (re-export) - missing @example
- `src/ArrayOf.ts:40` `ArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:69` `NonEmptyArrayOfStrings` (type) - missing @example
- `src/ArrayOf.ts:98` `ArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:127` `NonEmptyArrayOfNonEmptyStrings` (type) - missing @example
- `src/ArrayOf.ts:156` `ArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:185` `NonEmptyArrayOfNumbers` (type) - missing @example
- `src/ArrayOf.ts:214` `ArrayOfInts` (type) - missing @example
- `src/ArrayOf.ts:243` `NonEmptyArrayOfInts` (type) - missing @example
- `src/BufferEncoding.ts:27` `BuffEncoding` (const) - 1 schema annotation/type-alias gap(s)
- `src/CardinalDirection/CardinalDirection.schema.ts:38` `CardinalDirection` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:65` `CardinalDirectionAbbrev` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:27` `Schema` (const) - 1 schema annotation/type-alias gap(s)
- `src/CardinalDirection/CardinalDirection.schema.ts:38` `Schema` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:53` `Abbrev` (const) - 1 schema annotation/type-alias gap(s)
- `src/CardinalDirection/CardinalDirection.schema.ts:65` `Abbrev` (type) - missing @example
- `src/CardinalDirection/index.ts:22` `export * from "./CardinalDirection.schema.ts";` (re-export) - missing @example
- `src/CauseTaggedError/index.ts:12` `export * from "./CauseTaggedError.errors.ts";` (re-export) - missing @example
- `src/Color/Color.adjust.ts:104` `RgbaColorString` (type) - missing @example
- `src/Color/Color.adjust.ts:133` `ColorAmount` (type) - missing @example
- `src/Color/Color.adjust.ts:192` `MixColors` (type) - missing @example
- `src/Color/Color.adjust.ts:250` `Lighten` (type) - missing @example
- `src/Color/Color.adjust.ts:308` `Darken` (type) - missing @example
- `src/Color/Color.adjust.ts:366` `WithAlpha` (type) - missing @example
- `src/Color/Color.hex.ts:64` `hexToRgbValue` (const) - missing @example
- `src/Color/Color.hex.ts:93` `rgbToHexValue` (const) - missing @example
- `src/Color/Color.hex.ts:126` `HexColorInput` (type) - missing @example
- `src/Color/Color.hex.ts:156` `HexColor` (type) - missing @example
- `src/Color/Color.hex.ts:192` `NormalizeHexColor` (type) - missing @example
- `src/Color/Color.oklch.ts:68` `rgbToOklchValue` (const) - missing @example
- `src/Color/Color.oklch.ts:102` `oklchToRgbValue` (const) - missing @example
- `src/Color/Color.oklch.ts:153` `OklchCoordinate` (type) - missing @example
- `src/Color/Color.oklch.ts:184` `OklchLightness` (type) - missing @example
- `src/Color/Color.oklch.ts:215` `OklchChroma` (type) - missing @example
- `src/Color/Color.oklch.ts:246` `OklchHue` (type) - missing @example
- `src/Color/Color.rgb.ts:52` `RgbInputChannel` (type) - missing @example
- `src/Color/Color.rgb.ts:83` `RgbChannel` (type) - missing @example
- `src/Color/Color.scale.ts:153` `HexColorScale12` (type) - missing @example
- `src/Color/Color.scale.ts:221` `GenerateScale` (type) - missing @example
- `src/Color/Color.scale.ts:281` `GenerateNeutralScale` (type) - missing @example
- `src/Color/Color.scale.ts:357` `GenerateAlphaScale` (type) - missing @example
- `src/Color/Color.shared.ts:18` `$I` (const) - missing @example
- `src/Color/Color.shared.ts:27` `schemaIssueToError` (const) - missing @example
- `src/Color/Color.shared.ts:37` `RgbEncoded` (class) - missing @example
- `src/Color/Color.shared.ts:55` `OklchEncoded` (class) - missing @example
- `src/Color/Color.transforms.ts:22` `oklchToHexValue` (const) - missing @example
- `src/Color/Color.transforms.ts:30` `hexToOklchValue` (const) - missing @example
- `src/Color/Color.transforms.ts:66` `HexToRgb` (type) - missing @example
- `src/Color/Color.transforms.ts:99` `RgbToHex` (type) - missing @example
- `src/Color/Color.transforms.ts:132` `RgbToOklch` (type) - missing @example
- `src/Color/Color.transforms.ts:165` `OklchToRgb` (type) - missing @example
- `src/Color/Color.transforms.ts:201` `HexToOklch` (type) - missing @example
- `src/Color/Color.transforms.ts:234` `OklchToHex` (type) - missing @example
- `src/Color/Color.ts:16` `export {
  ColorAmount,
  Darken,
  DarkenInput,
  Lighten,
  LightenInput,
  MixColors,
  MixColorsInput,
  RgbaColorString,
  WithAlpha,
  WithAlphaInput,
} from "./Color.adjust.ts";` (re-export) - missing @example
- `src/Color/Color.ts:34` `export { HexColor, HexColorInput, NormalizeHexColor } from "./Color.hex.ts";` (re-export) - missing @example
- `src/Color/Color.ts:41` `export { OklchChroma, OklchColor, OklchCoordinate, OklchHue, OklchInput, OklchLightness } from "./Color.oklch.ts";` (re-export) - missing @example
- `src/Color/Color.ts:48` `export { Rgb, RgbChannel, RgbInput, RgbInputChannel } from "./Color.rgb.ts";` (re-export) - missing @example
- `src/Color/Color.ts:55` `export {
  GenerateAlphaScale,
  GenerateAlphaScaleInput,
  GenerateNeutralScale,
  GenerateNeutralScaleInput,
  GenerateScale,
  GenerateScaleInput,
  HexColorScale12,
} from "./Color.scale.ts";` (re-export) - missing @example
- `src/Color/Color.ts:70` `export { HexToOklch, HexToRgb, OklchToHex, OklchToRgb, RgbToHex, RgbToOklch } from "./Color.transforms.ts";` (re-export) - missing @example
- `src/Color/index.ts:7` `export * from "./Color.ts";` (re-export) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:53` `CoepValue` (type) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:84` `CrossOriginEmbedderPolicyOption` (type) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:212` `CrossOriginEmbedderPolicyHeader` (type) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:133` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:212` `Header` (type) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:84` `Option` (type) - missing @example
- `src/CrossOriginEmbedderPolicy/index.ts:20` `export * from "./CrossOriginEmbedderPolicy.schema.ts";` (re-export) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:52` `CoopValue` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:84` `CrossOriginOpenerPolicyOption` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:104` `CrossOriginOpenerPolicyResponseHeader` (class) - 1 example import violation(s)
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:194` `CrossOriginOpenerPolicyHeader` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:134` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:194` `Header` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:84` `Option` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:104` `ResponseHeader` (class) - 1 example import violation(s)
- `src/CrossOriginOpenerPolicy/index.ts:20` `export * from "./CrossOriginOpenerPolicy.schema.ts";` (re-export) - missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:51` `CorpValue` (type) - missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:82` `CrossOriginResourcePolicyOption` (type) - missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:191` `CrossOriginResourcePolicyHeader` (type) - missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:131` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:191` `Header` (type) - missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:82` `Option` (type) - missing @example
- `src/CrossOriginResourcePolicy/index.ts:20` `export * from "./CrossOriginResourcePolicy.schema.ts";` (re-export) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:84` `CryptoTxnHash` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:118` `CryptoTxnHashRedacted` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:84` `Schema` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:118` `Redacted` (type) - missing @example
- `src/CryptoTxnHash/index.ts:22` `export * from "./CryptoTxnHash.schema.ts";` (re-export) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:203` `CryptoWalletAddress` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:235` `CryptoWalletAddressRedacted` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:203` `Schema` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:235` `Redacted` (type) - missing @example
- `src/CryptoWalletAddress/index.ts:22` `export * from "./CryptoWalletAddress.schema.ts";` (re-export) - missing @example
- `src/Csp/Csp.schema.ts:523` `ReportURI` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:590` `CspDirectives` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:810` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:661` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/index.ts:20` `export * from "./Csp.schema.ts";` (re-export) - missing @example
- `src/Csv/Csv.schema.ts:339` `CsvText` (type) - missing @example
- `src/Csv/index.ts:12` `export * from "./Csv.schema.ts";` (re-export) - missing @example
- `src/CsvCodecOptions/index.ts:21` `export * from "./CsvCodecOptions.schema.ts";` (re-export) - missing @example
- `src/CsvError/index.ts:21` `export * from "./CsvError.errors.ts";` (re-export) - missing @example
- `src/CsvFormatter/index.ts:20` `export * from "./CsvFormatter.formatter.ts";` (re-export) - missing @example
- `src/CsvParser/index.ts:20` `export * from "./CsvParser.parser.ts";` (re-export) - missing @example
- `src/Cuid.ts:59` `Cuid` (const) - 1 schema annotation/type-alias gap(s)
- `src/DateTimeUtcFromValid/index.ts:12` `export * from "./DateTimeUtcFromValid.adapter.ts";` (re-export) - missing @example
- `src/DateTimeUtcFromValid/index.ts:17` `export * from "./DateTimeUtcFromValid.schema.ts";` (re-export) - missing @example
- `src/DomCssProperties/index.ts:20` `export * from "./DomCssProperties.schema.ts";` (re-export) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:54` `DOMDragEvent` (type) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:54` `DomDragEvent` (type) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:54` `Schema` (type) - missing @example
- `src/DomDragEvent/index.ts:20` `export * from "./DomDragEvent.schema.ts";` (re-export) - missing @example
- `src/DomEvent/DomEvent.schema.ts:54` `DOMEvent` (type) - missing @example
- `src/DomEvent/DomEvent.schema.ts:54` `DomEvent` (type) - missing @example
- `src/DomEvent/DomEvent.schema.ts:54` `Schema` (type) - missing @example
- `src/DomEvent/index.ts:20` `export * from "./DomEvent.schema.ts";` (re-export) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:54` `DOMHtmlElement` (type) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:54` `DomHtmlElement` (type) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:54` `Schema` (type) - missing @example
- `src/DomHtmlElement/index.ts:20` `export * from "./DomHtmlElement.schema.ts";` (re-export) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:54` `DOMMouseEvent` (type) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:54` `DomMouseEvent` (type) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:54` `Schema` (type) - missing @example
- `src/DomMouseEvent/index.ts:20` `export * from "./DomMouseEvent.schema.ts";` (re-export) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:68` `DOMReactNode` (type) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:68` `DomReactNode` (type) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:68` `Schema` (type) - missing @example
- `src/DomReactNode/index.ts:20` `export * from "./DomReactNode.schema.ts";` (re-export) - missing @example
- `src/DomainModel.ts:33` `defaultFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/Duration/Duration.input.ts:94` `DurationUnit` (type) - missing @example
- `src/Duration/Duration.input.ts:193` `DurationInput` (type) - missing @example
- `src/Duration/Duration.input.ts:250` `DurationFromInput` (type) - missing @example
- `src/Duration/Duration.input.ts:173` `Input` (const) - 1 schema annotation/type-alias gap(s)
- `src/Duration/Duration.input.ts:193` `Input` (type) - missing @example
- `src/Duration/Duration.transforms.ts:12` `export { DurationFromInput, DurationFromInput as FromInput } from "./Duration.input.ts";` (re-export) - missing @example
- `src/Duration/index.ts:20` `export * from "./Duration.input.ts";` (re-export) - missing @example
- `src/Duration/index.ts:25` `export * from "./Duration.schema.ts";` (re-export) - missing @example
- `src/Duration/index.ts:30` `export * from "./Duration.transforms.ts";` (re-export) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:113` `literal` (const) - 2 schema annotation/type-alias gap(s)
- `src/EntitySchema/EntitySchema.persist.ts:452` `PersistDescriptorByValueStrategy` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:477` `EntityIdLike` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:529` `PersistDescriptorFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:551` `PersistDescriptorForInput` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:567` `PersistedFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:612` `CheckedPersistedFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.shape.ts:54` `EntityFieldInputError` (class) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:72` `EntitySchemaAttachmentError` (class) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:189` `EncodedFieldShape` (type) - missing @example
- `src/EntitySchema/EntitySchema.shared.ts:17` `$I` (const) - missing @example
- `src/EntitySchema/EntitySchema.shared.ts:26` `DefinitionAnnotationKey` (const) - missing @example
- `src/EntitySchema/index.ts:14` `export * from "./EntitySchema.constructors.ts";` (re-export) - missing @example
- `src/EntitySchema/index.ts:19` `export * from "./EntitySchema.definition.ts";` (re-export) - missing @example
- `src/EntitySchema/index.ts:24` `export * from "./EntitySchema.factory.ts";` (re-export) - missing @example
- `src/EntitySchema/index.ts:29` `export * from "./EntitySchema.fields.ts";` (re-export) - missing @example
- `src/EntitySchema/index.ts:34` `export * from "./EntitySchema.persist.ts";` (re-export) - missing @example
- `src/EntitySchema/index.ts:39` `export {
  EncodedFieldShape,
  encodedAstFor,
  encodedFieldShape,
  isEncodedNullable,
  isEncodedOptional,
  selectedRowFieldShape,
} from "./EntitySchema.shape.ts";` (re-export) - missing @example
- `src/EthAmount/EthAmount.schema.ts:71` `EthAmount` (type) - missing @example
- `src/EthAmount/EthAmount.schema.ts:71` `Schema` (type) - missing @example
- `src/EthAmount/index.ts:22` `export * from "./EthAmount.schema.ts";` (re-export) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:69` `EthereumValidatorPublicKey` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:103` `EthereumValidatorPublicKeyRedacted` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:52` `Schema` (const) - 1 schema annotation/type-alias gap(s)
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:69` `Schema` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:103` `Redacted` (type) - missing @example
- `src/EthereumValidatorPublicKey/index.ts:22` `export * from "./EthereumValidatorPublicKey.schema.ts";` (re-export) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:100` `EvmAddress` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:132` `EvmAddressRedacted` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:100` `Schema` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:132` `Redacted` (type) - missing @example
- `src/EvmAddress/index.ts:22` `export * from "./EvmAddress.schema.ts";` (re-export) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:76` `ExpectCTEnabled` (type) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:104` `ExpectCTOption` (type) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:267` `ExpectCTHeader` (type) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:208` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/ExpectCt/ExpectCt.schema.ts:267` `Header` (type) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:92` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/ExpectCt/ExpectCt.schema.ts:104` `Option` (type) - missing @example
- `src/ExpectCt/index.ts:20` `export * from "./ExpectCt.schema.ts";` (re-export) - missing @example
- `src/FilePath/FilePath.guards.ts:49` `HasNullByte` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:87` `SupportedWindowsNamespace` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:124` `UsesPosixSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:161` `UsesWindowsSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:198` `EndsWithSeparator` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:52` `WindowsDriveRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:89` `WindowsUncRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:157` `HasLeafSegment` (type) - missing @example
- `src/FilePath/FilePath.schema.ts:50` `SupportedPathFamily` (type) - missing @example
- `src/FilePath/FilePath.schema.ts:159` `FilePath` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:46` `WindowsDotSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:105` `ValidWindowsPlainPathSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:144` `ValidWindowsRootSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:175` `ValidWindowsPathSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:205` `WindowsSegments` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:236` `ValidWindowsUncRest` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:269` `ValidWindowsUncSegments` (type) - missing @example
- `src/FilePath/FilePath.shared.ts:20` `$I` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:29` `windowsDrivePrefixRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:37` `windowsDriveRootRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:45` `windowsUncPrefixRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:53` `windowsUncRootRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:61` `windowsSegmentWithoutSeparatorsRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:69` `windowsInvalidSegmentCharacterRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:77` `windowsInvalidTrailingSegmentRegExp` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:98` `splitNonEmpty` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:107` `usesUnsupportedWindowsNamespacePrefix` (const) - missing @example
- `src/FilePath/FilePath.shared.ts:119` `isWindowsDrivePrefix` (const) - missing @example
- `src/FilePath/FilePath.windows.ts:91` `WindowsDrivePath` (type) - missing @example
- `src/FilePath/FilePath.windows.ts:162` `WindowsUncPath` (type) - missing @example
- `src/FilePath/FilePath.windows.ts:245` `WindowsRelativePath` (type) - missing @example
- `src/FilePath/index.ts:14` `export * from "./FilePath.guards.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:19` `export * from "./FilePath.roots.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:24` `export * from "./FilePath.schema.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:29` `export * from "./FilePath.segments.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:34` `export * from "./FilePath.windows.ts";` (re-export) - missing @example
- `src/Float16Array.ts:105` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:156` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:164` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:59` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:107` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:115` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:59` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:107` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:115` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Fn/Fn.schema.ts:473` `AnyFn` (type) - missing @example
- `src/Fn/index.ts:12` `export * from "./Fn.schema.ts";` (re-export) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:79` `ForceHttpsRedirectEnabled` (type) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:107` `ForceHttpsRedirectOption` (type) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:238` `ForceHttpsRedirectHeader` (type) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:167` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:238` `Header` (type) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:95` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:107` `Option` (type) - missing @example
- `src/ForceHttpsRedirect/index.ts:20` `export * from "./ForceHttpsRedirect.schema.ts";` (re-export) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:54` `FrameGuardMode` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:109` `FrameGuardAllowFrom` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:137` `FrameGuardOption` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:286` `FrameGuardHeader` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:210` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/FrameGuard/FrameGuard.schema.ts:286` `Header` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:54` `Mode` (type) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:125` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/FrameGuard/FrameGuard.schema.ts:137` `Option` (type) - missing @example
- `src/FrameGuard/index.ts:20` `export * from "./FrameGuard.schema.ts";` (re-export) - missing @example
- `src/Glob/Glob.schema.ts:130` `Glob` (type) - missing @example
- `src/Glob/index.ts:12` `export * from "./Glob.schema.ts";` (re-export) - missing @example
- `src/Graph/Graph.edge.ts:67` `Edge` (interface) - missing @example
- `src/Graph/Graph.encoded.ts:78` `EdgeIso` (type) - missing @example
- `src/Graph/Graph.encoded.ts:91` `GraphIso` (type) - missing @example
- `src/Graph/Graph.encoded.ts:109` `EdgeEncodedSchema` (interface) - missing @example
- `src/Graph/Graph.encoded.ts:126` `GraphEncodedSchema` (interface) - missing @example
- `src/Graph/Graph.primitives.ts:43` `NodeIndex` (type) - missing @example
- `src/Graph/Graph.primitives.ts:97` `EdgeIndex` (type) - missing @example
- `src/Graph/Graph.primitives.ts:148` `GraphKind` (type) - missing @example
- `src/Graph/Graph.rebuild.ts:59` `rebuildImmutableGraph` (const) - missing @example
- `src/Graph/Graph.rebuild.ts:88` `rebuildMutableGraph` (const) - missing @example
- `src/Graph/Graph.shared.ts:20` `$I` (const) - missing @example
- `src/Graph/Graph.shared.ts:29` `GraphKindValue` (type) - missing @example
- `src/Graph/Graph.shared.ts:38` `RawEdgeEncoded` (type) - missing @example
- `src/Graph/Graph.shared.ts:51` `RawGraphEncoded` (type) - missing @example
- `src/Graph/Graph.shared.ts:74` `makeInvalidGraphIssue` (const) - missing @example
- `src/Graph/Graph.shared.ts:84` `makeGraphConstructionIssue` (const) - missing @example
- `src/Graph/Graph.shared.ts:98` `sortRawNodeEntries` (const) - missing @example
- `src/Graph/Graph.shared.ts:113` `sortRawEdgeEntries` (const) - missing @example
- `src/Graph/Graph.shared.ts:124` `toRawEdgeEncoded` (const) - missing @example
- `src/Graph/Graph.shared.ts:137` `toRawGraphEncoded` (const) - missing @example
- `src/Graph/Graph.shared.ts:172` `formatGraph` (const) - missing @example
- `src/Graph/Graph.shared.ts:199` `makeGraphEquivalence` (const) - missing @example
- `src/Graph/Graph.shared.ts:258` `isImmutableGraphValue` (const) - missing @example
- `src/Graph/Graph.shared.ts:268` `isMutableGraphValue` (const) - missing @example
- `src/Graph/Graph.shared.ts:280` `trimGraphDescription` (const) - missing @example
- `src/Graph/Graph.transforms.ts:27` `DirectedGraph` (interface) - missing @example
- `src/Graph/Graph.transforms.ts:40` `UndirectedGraph` (interface) - missing @example
- `src/Graph/Graph.transforms.ts:53` `MutableDirectedGraph` (interface) - missing @example
- `src/Graph/Graph.transforms.ts:66` `MutableUndirectedGraph` (interface) - missing @example
- `src/Graph/index.ts:14` `export * from "./Graph.edge.ts";` (re-export) - missing @example
- `src/Graph/index.ts:19` `export * from "./Graph.encoded.ts";` (re-export) - missing @example
- `src/Graph/index.ts:24` `export * from "./Graph.from-self.ts";` (re-export) - missing @example
- `src/Graph/index.ts:29` `export * from "./Graph.guards.ts";` (re-export) - missing @example
- `src/Graph/index.ts:34` `export * from "./Graph.primitives.ts";` (re-export) - missing @example
- `src/Graph/index.ts:39` `export * from "./Graph.transforms.ts";` (re-export) - missing @example
- `src/Http/Http.headers.shared.ts:44` `ArrayOfStrOrStr` (type) - missing @example
- `src/Http/Http.headers.shared.ts:72` `StringOrUrl` (type) - missing @example
- `src/Http/Http.headers.shared.ts:115` `EncodedStrictURIFromStrOrURL` (type) - missing @example
- `src/Http/Http.headers.shared.ts:168` `ResponseHeader` (class) - 1 example import violation(s)
- `src/Http/Http.headers.shared.ts:233` `makeResponseHeaderOption` (const) - 1 example import violation(s)
- `src/HttpHeaders/HttpHeaders.schema.ts:14` `export * as CrossOriginEmbedderPolicy from "../CrossOriginEmbedderPolicy/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:21` `export * as CrossOriginOpenerPolicy from "../CrossOriginOpenerPolicy/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:28` `export * as CrossOriginResourcePolicy from "../CrossOriginResourcePolicy/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:35` `export * as Csp from "../Csp/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:42` `export * as ExpectCt from "../ExpectCt/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:49` `export * as ForceHttpsRedirect from "../ForceHttpsRedirect/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:56` `export * as FrameGuard from "../FrameGuard/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:63` `export * as NoOpen from "../NoOpen/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:70` `export * as NoSniff from "../NoSniff/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:77` `export * as PermissionsPolicy from "../PermissionsPolicy/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:84` `export * as PermittedCrossDomainPolicies from "../PermittedCrossDomainPolicies/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:91` `export * as ReferrerPolicy from "../ReferrerPolicy/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:98` `export * as SecureHeader from "../SecureHeader/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:105` `export * as SecureHeaderError from "../SecureHeaderError/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:112` `export * as SecureHeaderOptions from "../SecureHeaderOptions/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/HttpHeaders.schema.ts:119` `export * as XssProtection from "../XssProtection/index.ts";` (re-export) - missing @example
- `src/HttpHeaders/index.ts:20` `export * from "./HttpHeaders.schema.ts";` (re-export) - missing @example
- `src/HttpMethod/HttpMethod.schema.ts:28` `HttpMethod_` (const) - 2 schema annotation/type-alias gap(s)
- `src/HttpMethod/HttpMethod.schema.ts:99` `HttpMethod` (type) - missing @example
- `src/HttpMethod/HttpMethod.schema.ts:99` `Schema` (type) - missing @example
- `src/HttpMethod/HttpMethod.schema.ts:28` `Literal` (const) - 2 schema annotation/type-alias gap(s)
- `src/HttpMethod/index.ts:22` `export * from "./HttpMethod.schema.ts";` (re-export) - missing @example
- `src/HttpProtocol/HttpProtocol.schema.ts:37` `HttpProtocol` (type) - missing @example
- `src/HttpProtocol/HttpProtocol.schema.ts:25` `Schema` (const) - 1 schema annotation/type-alias gap(s)
- `src/HttpProtocol/HttpProtocol.schema.ts:37` `Schema` (type) - missing @example
- `src/HttpProtocol/index.ts:22` `export * from "./HttpProtocol.schema.ts";` (re-export) - missing @example
- `src/HttpStatus/HttpStatus.category.ts:54` `HttpStatusCategory` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:44` `BadRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:86` `Unauthorized` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:117` `PaymentRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:153` `Forbidden` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:186` `NotFound` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:216` `MethodNotAllowed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:246` `NotAcceptable` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:277` `ProxyAuthenticationRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:311` `RequestTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:343` `Conflict` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:38` `MisdirectedRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:70` `UnprocessableEntity` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:98` `Locked` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:128` `FailedDependency` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:158` `TooEarly` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:189` `UpgradeRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:222` `PreconditionRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:261` `TooManyRequests` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:292` `RequestHeaderFieldsTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:323` `UnavailableForLegalReasons` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:42` `Gone` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:72` `LengthRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:102` `PreconditionFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:136` `PayloadTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:167` `UriTooLong` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:198` `UnsupportedMediaType` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:229` `RangeNotSatisfiable` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:259` `ExpectationFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:289` `ImATeapot` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.ts:110` `HttpStatus4XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.client-error.ts:126` `HttpStatus4XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:44` `Continue` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:74` `SwitchingProtocols` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:105` `Processing` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:135` `EarlyHints` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:170` `HttpStatus1XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:186` `HttpStatus1XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:50` `MultipleChoices` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:80` `MovedPermanently` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:113` `Found` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:143` `SeeOther` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:175` `NotModified` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:205` `UseProxy` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:235` `SwitchProxy` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:268` `TemporaryRedirect` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:300` `PermanentRedirect` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:341` `HttpStatus3XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:349` `HttpStatus3XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:53` `HttpStatus` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:69` `HttpStatus` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.aggregate.ts:64` `HttpStatus5XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.server-error.aggregate.ts:80` `HttpStatus5XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:47` `InternalServerError` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:77` `NotImplemented` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:109` `BadGateway` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:141` `ServiceUnavailable` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:175` `GatewayTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:205` `HttpVersionNotSupported` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:238` `VariantAlsoNegotiates` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:268` `InsufficientStorage` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:297` `LoopDetected` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:327` `NotExtended` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:359` `NetworkAuthenticationRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.shared.ts:17` `$I` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:43` `Ok` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:71` `Created` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:102` `Accepted` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:134` `NonAuthoritativeInformation` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:163` `NoContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:193` `ResetContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:225` `PartialContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:256` `MultiStatus` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:287` `AlreadyReported` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:318` `ImUsed` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:358` `HttpStatus2XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:374` `HttpStatus2XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.aggregate.ts:63` `HttpStatusUnofficial` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.aggregate.ts:79` `HttpStatusUnofficial` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:44` `RequestHeaderFieldsTooLargeShopify` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:75` `LoginTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:105` `RequestHeaderTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:135` `SslCertificateError` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:165` `SslCertificateRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:195` `ClientClosedRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:226` `WebServerReturnedAnUnknownError` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:257` `WebServerIsDown` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:287` `SslHandshakeFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:319` `InvalidSslCertificate` (type) - missing @example
- `src/HttpStatus/index.ts:21` `export * from "./HttpStatus.category.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:26` `export * from "./HttpStatus.client-error.core.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:31` `export * from "./HttpStatus.client-error.extended.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:36` `export * from "./HttpStatus.client-error.resource.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:41` `export * from "./HttpStatus.client-error.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:46` `export * from "./HttpStatus.informational.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:51` `export * from "./HttpStatus.redirection.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:56` `export * from "./HttpStatus.schema.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:61` `export * from "./HttpStatus.server-error.aggregate.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:66` `export * from "./HttpStatus.server-error.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:71` `export * from "./HttpStatus.success.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:76` `export * from "./HttpStatus.unofficial.aggregate.ts";` (re-export) - missing @example
- `src/HttpStatus/index.ts:81` `export * from "./HttpStatus.unofficial.ts";` (re-export) - missing @example
- `src/Json.ts:39` `JsonObject` (type) - missing @example
- `src/Json.ts:68` `JsonArray` (type) - missing @example
- `src/Jsonc.ts:91` `JsoncTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonl.ts:103` `JsonlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/LiteralKit/LiteralKit.schema.ts:721` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/LiteralKit.schema.ts:725` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/index.ts:12` `export * from "./LiteralKit.schema.ts";` (re-export) - missing @example
- `src/LocalDate/LocalDate.schema.ts:677` `LocalDateFromString` (type) - 1 unsafe example violation(s)
- `src/LocalDate/LocalDate.schema.ts:693` `LocalDateFromString` (namespace) - 1 unsafe example violation(s)
- `src/LocalDate/index.ts:12` `export * from "./LocalDate.schema.ts";` (re-export) - missing @example
- `src/Logs.ts:43` `LogLevel` (type) - missing @example
- `src/Logs.ts:74` `LogSeverity` (type) - missing @example
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:342` `MappedLiteralKit` (function) - 1 unsafe example violation(s)
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:311` `MappedLiteralKit` (interface) - 1 unsafe example violation(s)
- `src/MappedLiteralKit/index.ts:12` `export * from "./MappedLiteralKit.schema.ts";` (re-export) - missing @example
- `src/Markdown.ts:140` `Markdown` (type) - missing @example
- `src/Markdown.ts:165` `MarkdownTextToHtml` (const) - 1 schema annotation/type-alias gap(s)
- `src/Model/Model.codecs.ts:28` `JsonFromString` (interface) - 1 example import violation(s)
- `src/Model/Model.codecs.ts:56` `JsonFromString` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:44` `Date` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model/Model.datetime.ts:159` `DateTimeInsert` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:205` `DateTimeInsertFromDate` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:251` `DateTimeInsertFromNumber` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:299` `DateTimeUpdate` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:348` `DateTimeUpdateFromDate` (const) - 1 example import violation(s)
- `src/Model/Model.datetime.ts:397` `DateTimeUpdateFromNumber` (const) - 1 example import violation(s)
- `src/Model/Model.fields.ts:22` `Generated` (interface) - missing @example
- `src/Model/Model.fields.ts:62` `GeneratedByApp` (interface) - missing @example
- `src/Model/Model.fields.ts:102` `Sensitive` (interface) - missing @example
- `src/Model/Model.fields.ts:151` `optionalOption` (interface) - 1 example import violation(s)
- `src/Model/Model.fields.ts:169` `optionalOption` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model/Model.fields.ts:201` `FieldOption` (interface) - 1 example import violation(s)
- `src/Model/Model.fields.ts:229` `FieldOption` (const) - 1 example import violation(s)
- `src/Model/Model.sqlite.ts:51` `BooleanSqlite` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model/Model.uuid.ts:29` `UuidV4Insert` (interface) - 1 example import violation(s)
- `src/Model/Model.uuid.ts:96` `UuidV4Insert` (const) - 1 example import violation(s)
- `src/Model/Model.uuid.ts:71` `UuidV4WithGenerate` (const) - 1 example import violation(s)
- `src/Model/Model.variants.ts:15` `Class` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `extract` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Field` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldExcept` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldOnly` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `fieldEvolve` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Struct` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Union` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:331` `fields` (const) - 1 example import violation(s)
- `src/Model/index.ts:14` `export * from "./Model.codecs.ts";` (re-export) - missing @example
- `src/Model/index.ts:19` `export * from "./Model.datetime.ts";` (re-export) - missing @example
- `src/Model/index.ts:24` `export * from "./Model.fields.ts";` (re-export) - missing @example
- `src/Model/index.ts:29` `export * from "./Model.sqlite.ts";` (re-export) - missing @example
- `src/Model/index.ts:34` `export * from "./Model.uuid.ts";` (re-export) - missing @example
- `src/Model/index.ts:39` `export * from "./Model.variants.ts";` (re-export) - missing @example
- `src/MutableHashMap.ts:101` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:171` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:119` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:289` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:71` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:136` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:88` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:244` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
- `src/NoOpen/NoOpen.schema.ts:52` `NoOpenValue` (type) - missing @example
- `src/NoOpen/NoOpen.schema.ts:83` `NoOpenOption` (type) - missing @example
- `src/NoOpen/NoOpen.schema.ts:192` `NoOpenHeader` (type) - missing @example
- `src/NoOpen/NoOpen.schema.ts:192` `Header` (type) - missing @example
- `src/NoOpen/NoOpen.schema.ts:83` `Option` (type) - missing @example
- `src/NoOpen/NoOpen.schema.ts:52` `Value` (type) - missing @example
- `src/NoOpen/index.ts:20` `export * from "./NoOpen.schema.ts";` (re-export) - missing @example
- `src/NoSniff/NoSniff.schema.ts:53` `NoSniffValue` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:85` `NoSniffOption` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:102` `NoSniffResponseHeader` (class) - 1 example import violation(s)
- `src/NoSniff/NoSniff.schema.ts:195` `NoSniffHeader` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:130` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/NoSniff/NoSniff.schema.ts:195` `Header` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:85` `Option` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:102` `ResponseHeader` (class) - 1 example import violation(s)
- `src/NoSniff/NoSniff.schema.ts:53` `Value` (type) - missing @example
- `src/NoSniff/index.ts:20` `export * from "./NoSniff.schema.ts";` (re-export) - missing @example
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/ParserOptions/ParserOptions.schema.ts:82` `HeaderValueInput` (type) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:44` `HeaderArray` (type) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:76` `HeaderTransformFunction` (type) - missing @example
- `src/ParserOptions/index.ts:21` `export * from "./ParserOptions.schema.ts";` (re-export) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:81` `PermissionsPolicyDirective` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:116` `PermissionsPolicyDirectiveKey` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:150` `QuotedOrigin` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:181` `PermissionsPolicyDirectiveValueSingle` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:209` `PermissionsPolicyAllowlistedOrigin` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:241` `PermissionsPolicyDirectiveValue` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:273` `PermissionsPolicyDirectives` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:326` `PermissionsPolicyOption` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:465` `PermissionsPolicyHeader` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:402` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:465` `Header` (type) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:314` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:326` `Option` (type) - missing @example
- `src/PermissionsPolicy/index.ts:20` `export * from "./PermissionsPolicy.schema.ts";` (re-export) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:58` `PermittedCrossDomainPoliciesValue` (type) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:89` `PermittedCrossDomainPoliciesOption` (type) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:206` `PermittedCrossDomainPoliciesHeader` (type) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:138` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:206` `Header` (type) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:89` `Option` (type) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:58` `Value` (type) - missing @example
- `src/PermittedCrossDomainPolicies/index.ts:20` `export * from "./PermittedCrossDomainPolicies.schema.ts";` (re-export) - missing @example
- `src/PosixPath.ts:70` `NativePathToPosixPath` (const) - 1 schema annotation/type-alias gap(s)
- `src/Record/index.ts:12` `export * from "./Record.schema.ts";` (re-export) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:61` `ReferrerPolicyValue` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:90` `ReferrerPolicyValueList` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:118` `ReferrerPolicyOption` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:254` `ReferrerPolicyHeader` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:186` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:254` `Header` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:106` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:118` `Option` (type) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:61` `Value` (type) - missing @example
- `src/ReferrerPolicy/index.ts:20` `export * from "./ReferrerPolicy.schema.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:12` `export * from "./optionalKeyWithDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:17` `export * from "./pluck.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:22` `export * from "./split.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:27` `export * from "./toEquivalence.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:32` `export * from "./withEncodeDefault.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:37` `export * from "./withKeyDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:42` `export * from "./withLiteralKitStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:47` `export * from "./withStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/pluck.ts:58` `pluck` (function) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:32` `DualEquivalence` (type) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:64` `toEquivalence` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:40` `withEncodeDefault` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:83` `boolWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withKeyDefaults.ts:114` `withEmptyArrayDefaults` (function) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:50` `withKeyDefaults` (const) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:188` `boolKeyWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SecureHeader/SecureHeader.schema.ts:55` `SecureHeader` (type) - missing @example
- `src/SecureHeader/SecureHeader.schema.ts:55` `Schema` (type) - missing @example
- `src/SecureHeader/index.ts:22` `export * from "./SecureHeader.schema.ts";` (re-export) - missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:390` `SecureHeaderError` (type) - missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:390` `Error` (type) - missing @example
- `src/SecureHeaderError/index.ts:20` `export * from "./SecureHeaderError.errors.ts";` (re-export) - missing @example
- `src/SecureHeaderOptions/index.ts:20` `export * from "./SecureHeaderOptions.schema.ts";` (re-export) - missing @example
- `src/Sex/Sex.schema.ts:36` `Sex` (type) - missing @example
- `src/Sex/Sex.schema.ts:25` `Schema` (const) - 1 schema annotation/type-alias gap(s)
- `src/Sex/Sex.schema.ts:36` `Schema` (type) - missing @example
- `src/Sex/index.ts:22` `export * from "./Sex.schema.ts";` (re-export) - missing @example
- `src/Slug.ts:96` `Slug` (type) - missing @example
- `src/StatusCauseError.ts:39` `StatusCauseFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/StatusCauseTaggedErrorClass/index.ts:12` `export * from "./StatusCauseTaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/TaggedErrorClass/index.ts:12` `export * from "./TaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/Timestamp/Timestamp.schema.ts:130` `ToIsoStr` (const) - 1 schema annotation/type-alias gap(s)
- `src/Timestamp/Timestamp.schema.ts:176` `ToIsoStr` (namespace) - 1 unsafe example violation(s)
- `src/Timestamp/index.ts:12` `export * from "./Timestamp.schema.ts";` (re-export) - missing @example
- `src/Timezone.ts:41` `Timezone` (type) - missing @example
- `src/Toml.ts:95` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
- `src/VariantSchema/VariantSchema.core.ts:609` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/VariantSchema/index.ts:14` `export * from "./VariantSchema.core.ts";` (re-export) - missing @example
- `src/VariantSchema/index.ts:19` `export * from "./VariantSchema.overridable.ts";` (re-export) - missing @example
- `src/Xml.ts:85` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/XssProtection/XssProtection.schema.ts:53` `XSSProtectionMode` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:108` `XSSProtectionReport` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:136` `XSSProtectionOption` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:270` `XSSProtectionHeader` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:217` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/XssProtection/XssProtection.schema.ts:270` `Header` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:53` `Mode` (type) - missing @example
- `src/XssProtection/XssProtection.schema.ts:124` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/XssProtection/XssProtection.schema.ts:136` `Option` (type) - missing @example
- `src/XssProtection/index.ts:20` `export * from "./XssProtection.schema.ts";` (re-export) - missing @example
- `src/Yaml.ts:94` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:8` `export * from "./Number.ts";` (re-export) - missing @example
- `src/index.ts:29` `export * from "./AbortSignal.ts";` (re-export) - missing @example
- `src/index.ts:34` `export * from "./ArrayOf.ts";` (re-export) - missing @example
- `src/index.ts:39` `export * from "./BigDecimal.ts";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./BufferEncoding.ts";` (re-export) - missing @example
- `src/index.ts:49` `export * from "./CauseTaggedError/index.ts";` (re-export) - missing @example
- `src/index.ts:54` `export * from "./Color/index.ts";` (re-export) - missing @example
- `src/index.ts:59` `export * from "./CommonTextSchemas.ts";` (re-export) - missing @example
- `src/index.ts:64` `export * from "./ContinentCode.ts";` (re-export) - missing @example
- `src/index.ts:69` `export * from "./CountryCode.ts";` (re-export) - missing @example
- `src/index.ts:74` `export * from "./CountryName.ts";` (re-export) - missing @example
- `src/index.ts:79` `export { CSV, Csv, type CsvDocument, type CsvText, type RowSchemaWithFields } from "./Csv/index.ts";` (re-export) - missing @example
- `src/index.ts:84` `export * from "./CurrencyCode.ts";` (re-export) - missing @example
- `src/index.ts:89` `export * from "./DateTimeUtcFromValid/index.ts";` (re-export) - missing @example
- `src/index.ts:94` `export * as DomainModel from "./DomainModel.ts";` (re-export) - missing @example
- `src/index.ts:99` `export {
  Duration,
  type Duration as DurationValue,
  DurationFromInput,
  type DurationFromInput as DurationFromInputValue,
  DurationInput,
  type DurationInput as DurationInputValue,
  DurationObject,
  DurationUnit,
  type DurationUnit as DurationUnitValue,
  FromInput,
  type Unit as DurationUnitAlias,
} from "./Duration/index.ts";` (re-export) - missing @example
- `src/index.ts:116` `export * from "./EffectSchema.ts";` (re-export) - missing @example
- `src/index.ts:121` `export * from "./Email.ts";` (re-export) - missing @example
- `src/index.ts:126` `export * as EntitySchema from "./EntitySchema/index.ts";` (re-export) - missing @example
- `src/index.ts:131` `export * from "./FileExtension.ts";` (re-export) - missing @example
- `src/index.ts:136` `export * from "./FileName.ts";` (re-export) - missing @example
- `src/index.ts:141` `export * from "./FilePath/index.ts";` (re-export) - missing @example
- `src/index.ts:146` `export * from "./Float16Array.ts";` (re-export) - missing @example
- `src/index.ts:151` `export * from "./Float32Array.ts";` (re-export) - missing @example
- `src/index.ts:156` `export * from "./Float64Array.ts";` (re-export) - missing @example
- `src/index.ts:161` `export * from "./Fn/index.ts";` (re-export) - missing @example
- `src/index.ts:166` `export * from "./Glob/index.ts";` (re-export) - missing @example
- `src/index.ts:171` `export * from "./Graph/index.ts";` (re-export) - missing @example
- `src/index.ts:176` `export * from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:181` `export * from "./Int.ts";` (re-export) - missing @example
- `src/index.ts:186` `export * from "./Json.ts";` (re-export) - missing @example
- `src/index.ts:191` `export * from "./Jsonc.ts";` (re-export) - missing @example
- `src/index.ts:196` `export * from "./Jsonl.ts";` (re-export) - missing @example
- `src/index.ts:201` `export * from "./KebabStr.ts";` (re-export) - missing @example
- `src/index.ts:206` `export * from "./LiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:211` `export * from "./LocalDate/index.ts";` (re-export) - missing @example
- `src/index.ts:216` `export * from "./Logs.ts";` (re-export) - missing @example
- `src/index.ts:221` `export * from "./MappedLiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:226` `export * from "./Markdown.ts";` (re-export) - missing @example
- `src/index.ts:231` `export * from "./MimeType.ts";` (re-export) - missing @example
- `src/index.ts:236` `export * as Model from "./Model/index.ts";` (re-export) - missing @example
- `src/index.ts:241` `export * from "./MutableHashMap.ts";` (re-export) - missing @example
- `src/index.ts:246` `export * from "./MutableHashSet.ts";` (re-export) - missing @example
- `src/index.ts:251` `export * from "./Options.ts";` (re-export) - missing @example
- `src/index.ts:256` `export * from "./PascalStr.ts";` (re-export) - missing @example
- `src/index.ts:261` `export * from "./PosixPath.ts";` (re-export) - missing @example
- `src/index.ts:266` `export * from "./Primitive.ts";` (re-export) - missing @example
- `src/index.ts:271` `export * from "./PromiseSchema.ts";` (re-export) - missing @example
- `src/index.ts:276` `export * from "./Record/index.ts";` (re-export) - missing @example
- `src/index.ts:281` `export * from "./RegExp.ts";` (re-export) - missing @example
- `src/index.ts:286` `export * from "./SafeRemoteHost.ts";` (re-export) - missing @example
- `src/index.ts:291` `export * as SchemaUtils from "./SchemaUtils/index.ts";` (re-export) - missing @example
- `src/index.ts:296` `export * from "./SemanticVersion.ts";` (re-export) - missing @example
- `src/index.ts:301` `export * from "./Semver.ts";` (re-export) - missing @example
- `src/index.ts:306` `export * from "./SeverityLevel.ts";` (re-export) - missing @example
- `src/index.ts:311` `export * from "./Sha256.ts";` (re-export) - missing @example
- `src/index.ts:316` `export * from "./Slug.ts";` (re-export) - missing @example
- `src/index.ts:321` `export * from "./SnakeStr.ts";` (re-export) - missing @example
- `src/index.ts:326` `export * from "./StatusCauseError.ts";` (re-export) - missing @example
- `src/index.ts:331` `export * from "./StatusCauseTaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:336` `export * from "./String.ts";` (re-export) - missing @example
- `src/index.ts:341` `export * from "./TaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:346` `export * from "./TerritoryCode.ts";` (re-export) - missing @example
- `src/index.ts:351` `export * from "./Timezone.ts";` (re-export) - missing @example
- `src/index.ts:356` `export * from "./Toml.ts";` (re-export) - missing @example
- `src/index.ts:361` `export * from "./Transformations.ts";` (re-export) - missing @example
- `src/index.ts:366` `export * from "./URL.ts";` (re-export) - missing @example
- `src/index.ts:371` `export * as VariantSchema from "./VariantSchema/index.ts";` (re-export) - missing @example
- `src/index.ts:376` `export * from "./Xml.ts";` (re-export) - missing @example
- `src/index.ts:381` `export * from "./Yaml.ts";` (re-export) - missing @example

### @beep/epistemic-server

Path: `packages/epistemic/server`

Export findings:
- `src/index.ts:30` `export * from "./Layer.js";` (re-export) - missing @example

### @beep/rdf

Path: `packages/foundation/modeling/rdf`

Export findings:
- `src/Vocab/Skos.ts:32` `SKOS_CONCEPT` (const) - missing @example
- `src/Vocab/Skos.ts:40` `SKOS_CONCEPT_SCHEME` (const) - missing @example
- `src/Vocab/Skos.ts:48` `SKOS_PREF_LABEL` (const) - missing @example
- `src/Vocab/Skos.ts:56` `SKOS_ALT_LABEL` (const) - missing @example
- `src/Vocab/Skos.ts:64` `SKOS_HIDDEN_LABEL` (const) - missing @example
- `src/Vocab/Skos.ts:72` `SKOS_DEFINITION` (const) - missing @example
- `src/Vocab/Skos.ts:80` `SKOS_SCOPE_NOTE` (const) - missing @example
- `src/Vocab/Skos.ts:88` `SKOS_EDITORIAL_NOTE` (const) - missing @example
- `src/Vocab/Skos.ts:96` `SKOS_HISTORY_NOTE` (const) - missing @example
- `src/Vocab/Skos.ts:104` `SKOS_BROADER` (const) - missing @example
- `src/Vocab/Skos.ts:112` `SKOS_NARROWER` (const) - missing @example
- `src/Vocab/Skos.ts:120` `SKOS_RELATED` (const) - missing @example
- `src/Vocab/Skos.ts:128` `SKOS_EXACT_MATCH` (const) - missing @example
- `src/Vocab/Skos.ts:136` `SKOS_CLOSE_MATCH` (const) - missing @example
- `src/Vocab/Skos.ts:144` `SKOS_BROAD_MATCH` (const) - missing @example
- `src/Vocab/Skos.ts:152` `SKOS_NARROW_MATCH` (const) - missing @example
- `src/Vocab/Skos.ts:160` `SKOS_RELATED_MATCH` (const) - missing @example
- `src/Vocab/Skos.ts:168` `SKOS_IN_SCHEME` (const) - missing @example
- `src/Vocab/Skos.ts:176` `SKOS_HAS_TOP_CONCEPT` (const) - missing @example
- `src/Vocab/Skos.ts:184` `SKOS_TOP_CONCEPT_OF` (const) - missing @example
- `src/index.ts:22` `export * from "./Evidence.ts";` (re-export) - missing @example
- `src/index.ts:29` `export * from "./Iri.ts";` (re-export) - missing @example
- `src/index.ts:36` `export * from "./JsonLd.ts";` (re-export) - missing @example
- `src/index.ts:43` `export * from "./Prov.ts";` (re-export) - missing @example
- `src/index.ts:50` `export * from "./Rdf.ts";` (re-export) - missing @example
- `src/index.ts:57` `export * from "./SemanticSchemaMetadata.ts";` (re-export) - missing @example
- `src/index.ts:64` `export * from "./Uri.ts";` (re-export) - missing @example
- `src/index.ts:71` `export * as WebAnnotation from "./Adapters/WebAnnotation.ts";` (re-export) - missing @example
- `src/index.ts:14` `VERSION` (const) - missing @example

### @beep/onepassword-cli

Path: `packages/drivers/onepassword-cli`

Export findings:
- `src/OnePasswordCli.models.ts:39` `OnePasswordReferenceProbeStatus` (type) - missing @example
- `src/OnePasswordCli.service.ts:43` `OnePasswordCliRunner` (type) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./OnePasswordCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./OnePasswordCli.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./OnePasswordCli.service.ts";` (re-export) - missing @example

### @beep/architecture-lab-config

Path: `packages/architecture-lab/config`

Export findings:
- `src/aggregates/WorkItem/WorkItem.layer.ts:62` `WorkItemConfigShape` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.config.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/layer.ts:7` `export {
  ArchitectureLabConfigLive,
  WorkItemConfig,
  type WorkItemConfigShape,
} from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/public.ts:7` `export { defaultWorkItemPublicConfig, WorkItemPublicConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/secrets.ts:7` `export { defaultWorkItemSecretConfig, WorkItemSecretConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export { defaultWorkItemServerConfig, WorkItemConfig, WorkItemServerConfig } from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/test.ts:7` `export {
  ArchitectureLabConfigTest,
  testWorkItemConfig,
  WorkItemConfig,
  type WorkItemConfigShape,
} from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/govinfo

Path: `packages/drivers/govinfo`

Module findings:
- `src/domain/contracts/Search/Search.http.ts:1` (none) - missing summary; missing @since
- `src/domain/contracts/index.ts:1` (jsdoc) - missing summary
- `src/domain/index.ts:1` (jsdoc) - missing summary
- `src/domain/values/index.ts:1` (jsdoc) - missing summary
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/domain/contracts/Search/Search.contract.ts:52` `FailureBadRequest` (class) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.contract.ts:63` `FailureNotFound` (class) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.contract.ts:74` `FailureInternalServerError` (class) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.contract.ts:87` `Failure` (const) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.contract.ts:98` `Failure` (type) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.contract.ts:100` `Failure` (namespace) - missing summary; missing @example, @category, @since
- `src/domain/contracts/Search/Search.http.ts:4` `Http` (const) - missing summary; missing @example, @category, @since
- `src/domain/contracts/index.ts:11` `export * as Search from "./Search/Search.contract.ts";` (re-export) - missing @example; 1 category casing violation(s)
- `src/domain/index.ts:11` `export * from "./values/index.ts";` (re-export) - missing @example
- `src/domain/index.ts:17` `export * from "./contracts/index.ts";` (re-export) - missing @example; 1 category casing violation(s)
- `src/domain/values/CollectionContainer/CollectionContainer.model.ts:73` `CollectionContainer` (namespace) - missing @example
- `src/domain/values/CollectionSummary/CollectionSummary.model.ts:51` `CollectionSummary` (namespace) - missing @example
- `src/domain/values/GranuleContainer/GranuleContainer.model.ts:84` `GranuleContainer` (namespace) - missing @example
- `src/domain/values/GranuleMetadata/GranuleMetadata.model.ts:64` `GranuleMetadata` (namespace) - missing @example
- `src/domain/values/PackageInfo/PackageInfo.model.ts:69` `PackageInfo` (namespace) - missing @example
- `src/domain/values/SearchBody/SearchBody.model.ts:59` `SearchBody` (namespace) - missing @example
- `src/domain/values/SearchResponse/SearchResponse.model.ts:59` `SearchResponse` (namespace) - missing @example
- `src/domain/values/SearchResult/SearchResult.model.ts:83` `SearchResult` (namespace) - missing @example
- `src/domain/values/Sort/Sort.model.ts:43` `SortBase` (namespace) - missing @example
- `src/domain/values/Sort/Sort.model.ts:93` `SortASC` (namespace) - missing @example
- `src/domain/values/Sort/Sort.model.ts:145` `SortDESC` (namespace) - missing @example
- `src/domain/values/Sort/Sort.model.ts:179` `Sort` (const) - 1 schema annotation/type-alias gap(s)
- `src/domain/values/Sort/Sort.model.ts:198` `Sort` (namespace) - missing @example
- `src/domain/values/SummaryItem/SummaryItem.model.ts:61` `SummaryItem` (namespace) - missing @example
- `src/domain/values/index.ts:12` `export * from "./SummaryItem/index.ts";` (re-export) - missing @example; 1 category casing violation(s)
- `src/domain/values/index.ts:13` `export * from "./Sort/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:14` `export * from "./SearchResult/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:15` `export * from "./SearchBody/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:16` `export * from "./PackageInfo/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:17` `export * from "./GranuleMetadata/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:18` `export * from "./GranuleContainer/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:19` `export * from "./CollectionSummary/index.ts";` (re-export) - missing @example, @category, @since
- `src/domain/values/index.ts:20` `export * from "./CollectionContainer/index.ts";` (re-export) - missing @example, @category, @since
- `src/index.ts:11` `export * from "./domain/index.ts"` (re-export) - missing @example; 1 category casing violation(s)

### @beep/data

Path: `packages/foundation/primitive/data`

Export findings:
- `src/CurrencyCodes.ts:58` `CurrencyCodeDataMetadata` (type) - missing @example
- `src/CurrencyCodes.ts:91` `CurrencyCodeDataMetadata` (const) - missing @example
- `src/CurrencyCodes.ts:99` `CurrencyCodeDataPublished` (const) - missing @example
- `src/CurrencyCodes.ts:107` `CurrencyCodeDataSourceUrl` (const) - missing @example
- `src/CurrencyCodes.ts:115` `CurrencyCodeDataSourceSha256` (const) - missing @example
- `src/CurrencyCodes.ts:124` `CurrencyCodeDataByCode` (const) - missing @example
- `src/CurrencyCodes.ts:132` `CurrencyCodeDataCodeValues` (const) - missing @example
- `src/CurrencyCodes.ts:141` `CurrencyCodeDataNameByCode` (const) - missing @example
- `src/CurrencyCodes.ts:150` `CurrencyCodeDataCodeNamePairs` (const) - missing @example
- `src/MimeTypes.ts:42` `OfficialMimeType` (type) - missing @example
- `src/MimeTypes.ts:50` `OfficialMimeTypeData` (type) - missing @example
- `src/MimeTypes.ts:216` `OfficialMimeTypeDataMetadata` (const) - missing @example
- `src/MimeTypes.ts:225` `OfficialMimeTypeDataUpdated` (const) - missing @example
- `src/MimeTypes.ts:234` `OfficialMimeTypeDataSourceUrl` (const) - missing @example
- `src/MimeTypes.ts:243` `OfficialMimeTypeDataSourceSha256` (const) - missing @example
- `src/MimeTypes.ts:252` `OfficialMimeTypeDataValues` (const) - missing @example
- `src/MimeTypes.ts:261` `OfficialMimeTypeDataByType` (const) - missing @example
- `src/MimeTypes.ts:270` `OfficialMimeTypeDataTypeValues` (const) - missing @example
- `src/MimeTypes.ts:279` `OfficialMimeTypeDataByTopLevel` (const) - missing @example
- `src/Territories.ts:16` `TerritoryData` (type) - missing @example
- `src/Territories.ts:24` `TerritoryCode` (type) - missing @example
- `src/Territories.ts:32` `TerritoryName` (type) - missing @example
- `src/Territories.ts:40` `ContinentData` (type) - missing @example
- `src/Territories.ts:48` `ContinentCode` (type) - missing @example
- `src/Territories.ts:56` `ContinentName` (type) - missing @example
- `src/Territories.ts:64` `TerritoryDataMetadata` (const) - missing @example
- `src/Territories.ts:72` `TerritoryDataReleaseTag` (const) - missing @example
- `src/Territories.ts:80` `TerritoryDataValues` (const) - missing @example
- `src/Territories.ts:88` `TerritoryDataByCode` (const) - missing @example
- `src/Territories.ts:96` `TerritoryCodeValues` (const) - missing @example
- `src/Territories.ts:104` `TerritoryDataNameByCode` (const) - missing @example
- `src/Territories.ts:112` `TerritoryDataCodeNamePairs` (const) - missing @example
- `src/Territories.ts:121` `ContinentDataValues` (const) - missing @example
- `src/Territories.ts:129` `ContinentDataByCode` (const) - missing @example
- `src/Territories.ts:137` `ContinentCodeValues` (const) - missing @example
- `src/Territories.ts:145` `ContinentDataNameByCode` (const) - missing @example
- `src/Territories.ts:153` `ContinentDataCodeNamePairs` (const) - missing @example
- `src/Timezones.ts:41` `TimezoneData` (type) - missing @example
- `src/Timezones.ts:70` `TimezoneDataMetadata` (const) - missing @example
- `src/Timezones.ts:78` `TimezoneDataVersion` (const) - missing @example
- `src/Timezones.ts:86` `TimezoneDataSourceUrl` (const) - missing @example
- `src/Timezones.ts:94` `TimezoneDataSourceSha256` (const) - missing @example
- `src/Timezones.ts:102` `TimezoneDataValues` (const) - missing @example
- `src/Timezones.ts:110` `TimezoneDataByName` (const) - missing @example
- `src/generated/cldr-territories.ts:17` `TerritoryDataMetadata` (const) - missing @example
- `src/generated/cldr-territories.ts:56` `TerritoryDataReleaseTag` (const) - missing @example
- `src/generated/cldr-territories.ts:64` `TerritoryDataValues` (const) - missing @example
- `src/generated/cldr-territories.ts:1621` `TerritoryDataByCode` (const) - missing @example
- `src/generated/cldr-territories.ts:3178` `TerritoryCodeValues` (const) - missing @example
- `src/generated/cldr-territories.ts:3445` `TerritoryDataNameByCode` (const) - missing @example
- `src/generated/cldr-territories.ts:3712` `TerritoryDataCodeNamePairs` (const) - missing @example
- `src/generated/cldr-territories.ts:4753` `ContinentDataValues` (const) - missing @example
- `src/generated/cldr-territories.ts:4782` `ContinentDataByCode` (const) - missing @example
- `src/generated/cldr-territories.ts:4811` `ContinentCodeValues` (const) - missing @example
- `src/generated/cldr-territories.ts:4825` `ContinentDataNameByCode` (const) - missing @example
- `src/generated/cldr-territories.ts:4839` `ContinentDataCodeNamePairs` (const) - missing @example
- `src/generated/iana-media-types.ts:18` `OfficialMimeTypeDataMetadata` (const) - missing @example
- `src/generated/iana-media-types.ts:30` `OfficialMimeTypeDataUpdated` (const) - missing @example
- `src/generated/iana-media-types.ts:38` `OfficialMimeTypeDataSourceUrl` (const) - missing @example
- `src/generated/iana-media-types.ts:46` `OfficialMimeTypeDataSourceSha256` (const) - missing @example
- `src/generated/iana-media-types.ts:54` `OfficialMimeTypeDataValues` (const) - missing @example
- `src/generated/iana-media-types.ts:14740` `OfficialMimeTypeDataByType` (const) - missing @example
- `src/generated/iana-media-types.ts:29426` `OfficialMimeTypeDataTypeValues` (const) - missing @example
- `src/generated/iana-media-types.ts:31737` `OfficialMimeTypeDataByTopLevel` (const) - missing @example
- `src/generated/iana-timezones.ts:18` `TimezoneDataMetadata` (const) - missing @example
- `src/generated/iana-timezones.ts:30` `TimezoneDataVersion` (const) - missing @example
- `src/generated/iana-timezones.ts:38` `TimezoneDataSourceUrl` (const) - missing @example
- `src/generated/iana-timezones.ts:46` `TimezoneDataSourceSha256` (const) - missing @example
- `src/generated/iana-timezones.ts:54` `TimezoneDataValues` (const) - missing @example
- `src/generated/iana-timezones.ts:1857` `TimezoneDataByName` (const) - missing @example
- `src/generated/iana-timezones.ts:3660` `TimezoneNameValues` (const) - missing @example
- `src/generated/iso4217.ts:18` `CurrencyCodeDataMetadata` (const) - missing @example
- `src/generated/iso4217.ts:30` `CurrencyCodeDataPublished` (const) - missing @example
- `src/generated/iso4217.ts:38` `CurrencyCodeDataSourceUrl` (const) - missing @example
- `src/generated/iso4217.ts:46` `CurrencyCodeDataSourceSha256` (const) - missing @example
- `src/generated/iso4217.ts:54` `CurrencyCodeDataValues` (const) - missing @example
- `src/generated/iso4217.ts:1764` `CurrencyCodeDataByCode` (const) - missing @example
- `src/generated/iso4217.ts:3474` `CurrencyCodeDataCodeValues` (const) - missing @example
- `src/generated/iso4217.ts:3661` `CurrencyCodeDataNameByCode` (const) - missing @example
- `src/generated/iso4217.ts:3848` `CurrencyCodeDataCodeNamePairs` (const) - missing @example

### @beep/architecture-lab-server

Path: `packages/architecture-lab/server`

Export findings:
- `src/aggregates/WorkItem/WorkItem.http.ts:50` `WorkItemHttpStatus` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:65` `WorkItemHttpResponse` (class) - 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.http.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.repo.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:28` `export * from "./WorkItem.rpc.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:35` `export * from "./WorkItem.tools.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.layer.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.repo.js";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./Layer.js";` (re-export) - missing @example

### @beep/duckdb

Path: `packages/drivers/duckdb`

Export findings:
- `src/index.ts:14` `export * from "./DuckDb.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./DuckDb.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./DuckDb.service.ts";` (re-export) - missing @example

### @beep/ffmpeg

Path: `packages/drivers/ffmpeg`

Export findings:
- `src/FFmpeg.models.ts:72` `PositiveFrameRate` (type) - 1 unsafe example violation(s)
- `src/FFmpeg.models.ts:131` `PositiveMilliseconds` (type) - 1 unsafe example violation(s)
- `src/FFmpeg.models.ts:190` `SafeFramePrefix` (type) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./FFmpeg.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./FFmpeg.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./FFmpeg.service.ts";` (re-export) - missing @example

### @beep/agents-client

Path: `packages/agents/client`

Export findings:
- `src/Chat.atoms.ts:256` `StreamingTurn` (class) - 1 schema annotation/type-alias gap(s)
- `src/Chat.atoms.ts:325` `EditTarget` (class) - 1 schema annotation/type-alias gap(s)
- `src/Chat.atoms.ts:430` `TurnRequest` (const) - 1 schema annotation/type-alias gap(s)
- `src/Chat.atoms.ts:438` `TurnRequest` (type) - missing @example

### @beep/epistemic-use-cases

Path: `packages/epistemic/use-cases`

Export findings:
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example

### @beep/m365

Path: `packages/drivers/m365`

Export findings:
- `src/M365.schemas.ts:365` `GraphCollection` (const) - 2 schema annotation/type-alias gap(s)
- `src/index.ts:14` `export * from "./M365.auth.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./M365.config.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./M365.errors.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./M365.schemas.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./M365.service.ts";` (re-export) - missing @example

### @beep/observability

Path: `packages/foundation/capability/observability`

Module findings:
- `src/experimental/server/index.ts:1` (jsdoc) - missing summary
- `src/server/index.ts:1` (jsdoc) - missing summary
- `src/web/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/experimental/server/index.ts:5` `export * from "./DevToolsRelay.ts";` (re-export) - missing @example
- `src/experimental/server/index.ts:10` `export * from "./OtlpPacketLab.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./CauseDiagnostics.ts";` (re-export) - missing @example
- `src/index.ts:54` `export * from "./CauseRedaction.ts";` (re-export) - missing @example
- `src/index.ts:61` `export * from "./CoreConfig.ts";` (re-export) - missing @example
- `src/index.ts:68` `export * from "./HttpError.ts";` (re-export) - missing @example
- `src/index.ts:75` `export * from "./Logging.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./Metric.ts";` (re-export) - missing @example
- `src/index.ts:89` `export * from "./Observed.ts";` (re-export) - missing @example
- `src/index.ts:96` `export * from "./PhaseProfiler.ts";` (re-export) - missing @example
- `src/server/Config.ts:71` `toOtlpResource` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:271` `makeHttpApiTelemetryDescriptor` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:309` `httpApiFailureStatus` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:462` `observeHttpApiEffect` (const) - 1 unsafe example violation(s)
- `src/server/Layer.ts:32` `layerLocalLgtmServer` (const) - 1 unsafe example violation(s)
- `src/server/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/server/index.ts:10` `export * from "./DevTools.ts";` (re-export) - missing @example
- `src/server/index.ts:15` `export * from "./ErrorReporting.ts";` (re-export) - missing @example
- `src/server/index.ts:20` `export * from "./HttpApiTelemetry.ts";` (re-export) - missing @example
- `src/server/index.ts:25` `export * from "./Layer.ts";` (re-export) - missing @example
- `src/server/index.ts:30` `export * from "./NodeSdk.ts";` (re-export) - missing @example
- `src/server/index.ts:35` `export * from "./Prometheus.ts";` (re-export) - missing @example
- `src/server/index.ts:40` `export * from "./TraceContext.ts";` (re-export) - missing @example
- `src/web/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/web/index.ts:10` `export * from "./Layer.ts";` (re-export) - missing @example

### @beep/html

Path: `packages/foundation/modeling/html`

Export findings:
- `src/Html.attributes.ts:37` `Dir` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:46` `Translate` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:55` `ContentEditable` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:64` `Draggable` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:73` `SpellCheck` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:82` `WritingSuggestions` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:91` `AutoCapitalize` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:100` `AutoCorrect` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:109` `InputMode` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:118` `EnterKeyHint` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:127` `Hidden` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:136` `Popover` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:145` `PopoverTargetAction` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:156` `BooleanAttribute` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:173` `StandardGlobalAttributes` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:218` `DatasetAttribute` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:285` `AriaAttributes` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:374` `EventHandlerAttributes` (const) - missing @example
- `src/Html.attributes.ts:385` `GlobalAttributes` (const) - missing @example
- `src/Html.attributes.ts:400` `GlobalAttributesStruct` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Html.attributes.ts:408` `GlobalAttributesType` (type) - missing @example
- `src/Html.attributes.ts:416` `GlobalAttributesEncoded` (type) - missing @example
- `src/Html.meta.ts:18` `HtmlElementMeta` (const) - missing @example
- `src/Html.meta.ts:33` `HtmlElementMeta` (type) - missing @example
- `src/Html.meta.ts:41` `ELEMENT_META` (const) - missing @example
- `src/Html.model.ts:47` `HtmlChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Html.model.ts:56` `HtmlChildren` (namespace) - missing @example
- `src/Html.model.ts:69` `Fragment` (class) - missing @example
- `src/Html.model.ts:80` `Fragment` (namespace) - missing @example
- `src/Html.model.ts:93` `Document` (class) - missing @example
- `src/Html.model.ts:104` `Document` (namespace) - missing @example
- `src/Html.model.ts:117` `A` (class) - missing @example
- `src/Html.model.ts:165` `A` (namespace) - missing @example
- `src/Html.model.ts:246` `Abbr` (class) - missing @example
- `src/Html.model.ts:260` `Abbr` (namespace) - missing @example
- `src/Html.model.ts:279` `Acronym` (class) - missing @example
- `src/Html.model.ts:293` `Acronym` (namespace) - missing @example
- `src/Html.model.ts:312` `Address` (class) - missing @example
- `src/Html.model.ts:326` `Address` (namespace) - missing @example
- `src/Html.model.ts:345` `Applet` (class) - missing @example
- `src/Html.model.ts:359` `Applet` (namespace) - missing @example
- `src/Html.model.ts:378` `Area` (class) - missing @example
- `src/Html.model.ts:422` `Area` (namespace) - missing @example
- `src/Html.model.ts:495` `Article` (class) - missing @example
- `src/Html.model.ts:509` `Article` (namespace) - missing @example
- `src/Html.model.ts:528` `Aside` (class) - missing @example
- `src/Html.model.ts:542` `Aside` (namespace) - missing @example
- `src/Html.model.ts:561` `Audio` (class) - missing @example
- `src/Html.model.ts:583` `Audio` (namespace) - missing @example
- `src/Html.model.ts:618` `B` (class) - missing @example
- `src/Html.model.ts:632` `B` (namespace) - missing @example
- `src/Html.model.ts:651` `Base` (class) - missing @example
- `src/Html.model.ts:666` `Base` (namespace) - missing @example
- `src/Html.model.ts:687` `Basefont` (class) - missing @example
- `src/Html.model.ts:700` `Basefont` (namespace) - missing @example
- `src/Html.model.ts:717` `Bdi` (class) - missing @example
- `src/Html.model.ts:731` `Bdi` (namespace) - missing @example
- `src/Html.model.ts:750` `Bdo` (class) - missing @example
- `src/Html.model.ts:764` `Bdo` (namespace) - missing @example
- `src/Html.model.ts:783` `Bgsound` (class) - missing @example
- `src/Html.model.ts:796` `Bgsound` (namespace) - missing @example
- `src/Html.model.ts:813` `Big` (class) - missing @example
- `src/Html.model.ts:827` `Big` (namespace) - missing @example
- `src/Html.model.ts:846` `Blink` (class) - missing @example
- `src/Html.model.ts:860` `Blink` (namespace) - missing @example
- `src/Html.model.ts:879` `Blockquote` (class) - missing @example
- `src/Html.model.ts:894` `Blockquote` (namespace) - missing @example
- `src/Html.model.ts:915` `Body` (class) - missing @example
- `src/Html.model.ts:940` `Body` (namespace) - missing @example
- `src/Html.model.ts:981` `Br` (class) - missing @example
- `src/Html.model.ts:995` `Br` (namespace) - missing @example
- `src/Html.model.ts:1014` `Button` (class) - missing @example
- `src/Html.model.ts:1113` `Button` (namespace) - missing @example
- `src/Html.model.ts:1296` `Canvas` (class) - missing @example
- `src/Html.model.ts:1312` `Canvas` (namespace) - missing @example
- `src/Html.model.ts:1335` `Caption` (class) - missing @example
- `src/Html.model.ts:1350` `Caption` (namespace) - missing @example
- `src/Html.model.ts:1371` `Center` (class) - missing @example
- `src/Html.model.ts:1385` `Center` (namespace) - missing @example
- `src/Html.model.ts:1404` `Cite` (class) - missing @example
- `src/Html.model.ts:1418` `Cite` (namespace) - missing @example
- `src/Html.model.ts:1437` `Code` (class) - missing @example
- `src/Html.model.ts:1451` `Code` (namespace) - missing @example
- `src/Html.model.ts:1470` `Col` (class) - missing @example
- `src/Html.model.ts:1489` `Col` (namespace) - missing @example
- `src/Html.model.ts:1518` `Colgroup` (class) - missing @example
- `src/Html.model.ts:1533` `Colgroup` (namespace) - missing @example
- `src/Html.model.ts:1554` `Data` (class) - missing @example
- `src/Html.model.ts:1569` `Data` (namespace) - missing @example
- `src/Html.model.ts:1590` `Datalist` (class) - missing @example
- `src/Html.model.ts:1604` `Datalist` (namespace) - missing @example
- `src/Html.model.ts:1623` `Dd` (class) - missing @example
- `src/Html.model.ts:1637` `Dd` (namespace) - missing @example
- `src/Html.model.ts:1656` `Del` (class) - missing @example
- `src/Html.model.ts:1672` `Del` (namespace) - missing @example
- `src/Html.model.ts:1695` `Details` (class) - missing @example
- `src/Html.model.ts:1711` `Details` (namespace) - missing @example
- `src/Html.model.ts:1734` `Dfn` (class) - missing @example
- `src/Html.model.ts:1748` `Dfn` (namespace) - missing @example
- `src/Html.model.ts:1767` `Dialog` (class) - missing @example
- `src/Html.model.ts:1783` `Dialog` (namespace) - missing @example
- `src/Html.model.ts:1806` `DirElement` (class) - missing @example
- `src/Html.model.ts:1820` `DirElement` (namespace) - missing @example
- `src/Html.model.ts:1839` `Div` (class) - missing @example
- `src/Html.model.ts:1854` `Div` (namespace) - missing @example
- `src/Html.model.ts:1875` `Dl` (class) - missing @example
- `src/Html.model.ts:1890` `Dl` (namespace) - missing @example
- `src/Html.model.ts:1911` `Dt` (class) - missing @example
- `src/Html.model.ts:1925` `Dt` (namespace) - missing @example
- `src/Html.model.ts:1944` `Em` (class) - missing @example
- `src/Html.model.ts:1958` `Em` (namespace) - missing @example
- `src/Html.model.ts:1977` `Embed` (class) - missing @example
- `src/Html.model.ts:1998` `Embed` (namespace) - missing @example
- `src/Html.model.ts:2031` `Fieldset` (class) - missing @example
- `src/Html.model.ts:2116` `Fieldset` (namespace) - missing @example
- `src/Html.model.ts:2271` `Figcaption` (class) - missing @example
- `src/Html.model.ts:2285` `Figcaption` (namespace) - missing @example
- `src/Html.model.ts:2304` `Figure` (class) - missing @example
- `src/Html.model.ts:2318` `Figure` (namespace) - missing @example
- `src/Html.model.ts:2337` `Font` (class) - missing @example
- `src/Html.model.ts:2351` `Font` (namespace) - missing @example
- `src/Html.model.ts:2370` `Footer` (class) - missing @example
- `src/Html.model.ts:2384` `Footer` (namespace) - missing @example
- `src/Html.model.ts:2403` `Form` (class) - missing @example
- `src/Html.model.ts:2445` `Form` (namespace) - missing @example
- `src/Html.model.ts:2514` `Frame` (class) - missing @example
- `src/Html.model.ts:2527` `Frame` (namespace) - missing @example
- `src/Html.model.ts:2544` `Frameset` (class) - missing @example
- `src/Html.model.ts:2558` `Frameset` (namespace) - missing @example
- `src/Html.model.ts:2577` `H1` (class) - missing @example
- `src/Html.model.ts:2592` `H1` (namespace) - missing @example
- `src/Html.model.ts:2613` `H2` (class) - missing @example
- `src/Html.model.ts:2628` `H2` (namespace) - missing @example
- `src/Html.model.ts:2649` `H3` (class) - missing @example
- `src/Html.model.ts:2664` `H3` (namespace) - missing @example
- `src/Html.model.ts:2685` `H4` (class) - missing @example
- `src/Html.model.ts:2700` `H4` (namespace) - missing @example
- `src/Html.model.ts:2721` `H5` (class) - missing @example
- `src/Html.model.ts:2736` `H5` (namespace) - missing @example
- `src/Html.model.ts:2757` `H6` (class) - missing @example
- `src/Html.model.ts:2772` `H6` (namespace) - missing @example
- `src/Html.model.ts:2793` `Head` (class) - missing @example
- `src/Html.model.ts:2808` `Head` (namespace) - missing @example
- `src/Html.model.ts:2829` `Header` (class) - missing @example
- `src/Html.model.ts:2843` `Header` (namespace) - missing @example
- `src/Html.model.ts:2862` `Hgroup` (class) - missing @example
- `src/Html.model.ts:2876` `Hgroup` (namespace) - missing @example
- `src/Html.model.ts:2895` `Hr` (class) - missing @example
- `src/Html.model.ts:2913` `Hr` (namespace) - missing @example
- `src/Html.model.ts:2940` `Html` (class) - missing @example
- `src/Html.model.ts:2956` `Html` (namespace) - missing @example
- `src/Html.model.ts:2979` `I` (class) - missing @example
- `src/Html.model.ts:2993` `I` (namespace) - missing @example
- `src/Html.model.ts:3012` `Iframe` (class) - missing @example
- `src/Html.model.ts:3062` `Iframe` (namespace) - missing @example
- `src/Html.model.ts:3147` `Img` (class) - missing @example
- `src/Html.model.ts:3181` `Img` (namespace) - missing @example
- `src/Html.model.ts:3240` `Input` (class) - missing @example
- `src/Html.model.ts:3376` `Input` (namespace) - missing @example
- `src/Html.model.ts:3627` `Ins` (class) - missing @example
- `src/Html.model.ts:3643` `Ins` (namespace) - missing @example
- `src/Html.model.ts:3666` `Isindex` (class) - missing @example
- `src/Html.model.ts:3679` `Isindex` (namespace) - missing @example
- `src/Html.model.ts:3696` `Kbd` (class) - missing @example
- `src/Html.model.ts:3710` `Kbd` (namespace) - missing @example
- `src/Html.model.ts:3729` `Keygen` (class) - missing @example
- `src/Html.model.ts:3742` `Keygen` (namespace) - missing @example
- `src/Html.model.ts:3759` `Label` (class) - missing @example
- `src/Html.model.ts:3774` `Label` (namespace) - missing @example
- `src/Html.model.ts:3795` `Legend` (class) - missing @example
- `src/Html.model.ts:3810` `Legend` (namespace) - missing @example
- `src/Html.model.ts:3831` `Li` (class) - missing @example
- `src/Html.model.ts:3847` `Li` (namespace) - missing @example
- `src/Html.model.ts:3870` `Link` (class) - missing @example
- `src/Html.model.ts:3927` `Link` (namespace) - missing @example
- `src/Html.model.ts:4026` `Listing` (class) - missing @example
- `src/Html.model.ts:4040` `Listing` (namespace) - missing @example
- `src/Html.model.ts:4059` `Main` (class) - missing @example
- `src/Html.model.ts:4073` `Main` (namespace) - missing @example
- `src/Html.model.ts:4092` `MapElement` (class) - missing @example
- `src/Html.model.ts:4107` `MapElement` (namespace) - missing @example
- `src/Html.model.ts:4128` `Mark` (class) - missing @example
- `src/Html.model.ts:4142` `Mark` (namespace) - missing @example
- `src/Html.model.ts:4161` `Marquee` (class) - missing @example
- `src/Html.model.ts:4179` `Marquee` (namespace) - missing @example
- `src/Html.model.ts:4206` `Menu` (class) - missing @example
- `src/Html.model.ts:4223` `Menu` (namespace) - missing @example
- `src/Html.model.ts:4248` `Menuitem` (class) - missing @example
- `src/Html.model.ts:4262` `Menuitem` (namespace) - missing @example
- `src/Html.model.ts:4281` `Meta` (class) - missing @example
- `src/Html.model.ts:4321` `Meta` (namespace) - missing @example
- `src/Html.model.ts:4380` `Meter` (class) - missing @example
- `src/Html.model.ts:4400` `Meter` (namespace) - missing @example
- `src/Html.model.ts:4431` `Multicol` (class) - missing @example
- `src/Html.model.ts:4445` `Multicol` (namespace) - missing @example
- `src/Html.model.ts:4464` `Nav` (class) - missing @example
- `src/Html.model.ts:4478` `Nav` (namespace) - missing @example
- `src/Html.model.ts:4497` `Nextid` (class) - missing @example
- `src/Html.model.ts:4510` `Nextid` (namespace) - missing @example
- `src/Html.model.ts:4527` `Nobr` (class) - missing @example
- `src/Html.model.ts:4541` `Nobr` (namespace) - missing @example
- `src/Html.model.ts:4560` `Noembed` (class) - missing @example
- `src/Html.model.ts:4574` `Noembed` (namespace) - missing @example
- `src/Html.model.ts:4593` `Noframes` (class) - missing @example
- `src/Html.model.ts:4607` `Noframes` (namespace) - missing @example
- `src/Html.model.ts:4626` `Noscript` (class) - missing @example
- `src/Html.model.ts:4640` `Noscript` (namespace) - missing @example
- `src/Html.model.ts:4659` `ObjectElement` (class) - missing @example
- `src/Html.model.ts:4761` `ObjectElement` (namespace) - missing @example
- `src/Html.model.ts:4950` `Ol` (class) - missing @example
- `src/Html.model.ts:4968` `Ol` (namespace) - missing @example
- `src/Html.model.ts:4995` `Optgroup` (class) - missing @example
- `src/Html.model.ts:5011` `Optgroup` (namespace) - missing @example
- `src/Html.model.ts:5034` `Option` (class) - missing @example
- `src/Html.model.ts:5053` `Option` (namespace) - missing @example
- `src/Html.model.ts:5082` `Output` (class) - missing @example
- `src/Html.model.ts:5168` `Output` (namespace) - missing @example
- `src/Html.model.ts:5325` `P` (class) - missing @example
- `src/Html.model.ts:5340` `P` (namespace) - missing @example
- `src/Html.model.ts:5361` `Param` (class) - missing @example
- `src/Html.model.ts:5374` `Param` (namespace) - missing @example
- `src/Html.model.ts:5391` `Picture` (class) - missing @example
- `src/Html.model.ts:5405` `Picture` (namespace) - missing @example
- `src/Html.model.ts:5424` `Plaintext` (class) - missing @example
- `src/Html.model.ts:5438` `Plaintext` (namespace) - missing @example
- `src/Html.model.ts:5457` `Pre` (class) - missing @example
- `src/Html.model.ts:5472` `Pre` (namespace) - missing @example
- `src/Html.model.ts:5493` `Progress` (class) - missing @example
- `src/Html.model.ts:5509` `Progress` (namespace) - missing @example
- `src/Html.model.ts:5532` `Q` (class) - missing @example
- `src/Html.model.ts:5547` `Q` (namespace) - missing @example
- `src/Html.model.ts:5568` `Rb` (class) - missing @example
- `src/Html.model.ts:5582` `Rb` (namespace) - missing @example
- `src/Html.model.ts:5601` `Rp` (class) - missing @example
- `src/Html.model.ts:5615` `Rp` (namespace) - missing @example
- `src/Html.model.ts:5634` `Rt` (class) - missing @example
- `src/Html.model.ts:5648` `Rt` (namespace) - missing @example
- `src/Html.model.ts:5667` `Rtc` (class) - missing @example
- `src/Html.model.ts:5681` `Rtc` (namespace) - missing @example
- `src/Html.model.ts:5700` `Ruby` (class) - missing @example
- `src/Html.model.ts:5714` `Ruby` (namespace) - missing @example
- `src/Html.model.ts:5733` `SElement` (class) - missing @example
- `src/Html.model.ts:5747` `SElement` (namespace) - missing @example
- `src/Html.model.ts:5766` `Samp` (class) - missing @example
- `src/Html.model.ts:5780` `Samp` (namespace) - missing @example
- `src/Html.model.ts:5799` `Script` (class) - missing @example
- `src/Html.model.ts:5827` `Script` (namespace) - missing @example
- `src/Html.model.ts:5874` `Search` (class) - missing @example
- `src/Html.model.ts:5888` `Search` (namespace) - missing @example
- `src/Html.model.ts:5907` `Section` (class) - missing @example
- `src/Html.model.ts:5921` `Section` (namespace) - missing @example
- `src/Html.model.ts:5940` `Select` (class) - missing @example
- `src/Html.model.ts:6028` `Select` (namespace) - missing @example
- `src/Html.model.ts:6189` `Selectedcontent` (class) - missing @example
- `src/Html.model.ts:6203` `Selectedcontent` (namespace) - missing @example
- `src/Html.model.ts:6222` `Slot` (class) - missing @example
- `src/Html.model.ts:6237` `Slot` (namespace) - missing @example
- `src/Html.model.ts:6258` `Small` (class) - missing @example
- `src/Html.model.ts:6272` `Small` (namespace) - missing @example
- `src/Html.model.ts:6291` `Source` (class) - missing @example
- `src/Html.model.ts:6311` `Source` (namespace) - missing @example
- `src/Html.model.ts:6342` `Spacer` (class) - missing @example
- `src/Html.model.ts:6355` `Spacer` (namespace) - missing @example
- `src/Html.model.ts:6372` `Span` (class) - missing @example
- `src/Html.model.ts:6386` `Span` (namespace) - missing @example
- `src/Html.model.ts:6405` `Strike` (class) - missing @example
- `src/Html.model.ts:6419` `Strike` (namespace) - missing @example
- `src/Html.model.ts:6438` `Strong` (class) - missing @example
- `src/Html.model.ts:6452` `Strong` (namespace) - missing @example
- `src/Html.model.ts:6471` `Style` (class) - missing @example
- `src/Html.model.ts:6488` `Style` (namespace) - missing @example
- `src/Html.model.ts:6513` `Sub` (class) - missing @example
- `src/Html.model.ts:6527` `Sub` (namespace) - missing @example
- `src/Html.model.ts:6546` `Summary` (class) - missing @example
- `src/Html.model.ts:6560` `Summary` (namespace) - missing @example
- `src/Html.model.ts:6579` `Sup` (class) - missing @example
- `src/Html.model.ts:6593` `Sup` (namespace) - missing @example
- `src/Html.model.ts:6612` `Table` (class) - missing @example
- `src/Html.model.ts:6638` `Table` (namespace) - missing @example
- `src/Html.model.ts:6681` `Tbody` (class) - missing @example
- `src/Html.model.ts:6700` `Tbody` (namespace) - missing @example
- `src/Html.model.ts:6729` `Td` (class) - missing @example
- `src/Html.model.ts:6757` `Td` (namespace) - missing @example
- `src/Html.model.ts:6804` `Template` (class) - missing @example
- `src/Html.model.ts:6824` `Template` (namespace) - missing @example
- `src/Html.model.ts:6855` `Textarea` (class) - missing @example
- `src/Html.model.ts:6949` `Textarea` (namespace) - missing @example
- `src/Html.model.ts:7122` `Tfoot` (class) - missing @example
- `src/Html.model.ts:7136` `Tfoot` (namespace) - missing @example
- `src/Html.model.ts:7155` `Th` (class) - missing @example
- `src/Html.model.ts:7183` `Th` (namespace) - missing @example
- `src/Html.model.ts:7230` `Thead` (class) - missing @example
- `src/Html.model.ts:7244` `Thead` (namespace) - missing @example
- `src/Html.model.ts:7263` `Time` (class) - missing @example
- `src/Html.model.ts:7278` `Time` (namespace) - missing @example
- `src/Html.model.ts:7299` `Title` (class) - missing @example
- `src/Html.model.ts:7313` `Title` (namespace) - missing @example
- `src/Html.model.ts:7332` `Tr` (class) - missing @example
- `src/Html.model.ts:7352` `Tr` (namespace) - missing @example
- `src/Html.model.ts:7383` `Track` (class) - missing @example
- `src/Html.model.ts:7401` `Track` (namespace) - missing @example
- `src/Html.model.ts:7428` `Tt` (class) - missing @example
- `src/Html.model.ts:7442` `Tt` (namespace) - missing @example
- `src/Html.model.ts:7461` `U` (class) - missing @example
- `src/Html.model.ts:7475` `U` (namespace) - missing @example
- `src/Html.model.ts:7494` `Ul` (class) - missing @example
- `src/Html.model.ts:7510` `Ul` (namespace) - missing @example
- `src/Html.model.ts:7533` `Var` (class) - missing @example
- `src/Html.model.ts:7547` `Var` (namespace) - missing @example
- `src/Html.model.ts:7566` `Video` (class) - missing @example
- `src/Html.model.ts:7592` `Video` (namespace) - missing @example
- `src/Html.model.ts:7635` `Wbr` (class) - missing @example
- `src/Html.model.ts:7648` `Wbr` (namespace) - missing @example
- `src/Html.model.ts:7665` `Xmp` (class) - missing @example
- `src/Html.model.ts:7679` `Xmp` (namespace) - missing @example
- `src/Html.model.ts:7699` `HtmlNode` (const) - missing @example
- `src/Html.model.ts:7858` `HtmlNode` (namespace) - missing @example
- `src/Html.model.ts:8166` `Metadata` (const) - missing @example
- `src/Html.model.ts:8185` `Flow` (const) - missing @example
- `src/Html.model.ts:8451` `Sectioning` (const) - missing @example
- `src/Html.model.ts:8463` `Heading` (const) - missing @example
- `src/Html.model.ts:8475` `Phrasing` (const) - missing @example
- `src/Html.model.ts:8648` `Embedded` (const) - missing @example
- `src/Html.model.ts:8676` `Interactive` (const) - missing @example
- `src/Html.model.ts:8729` `Palpable` (const) - missing @example
- `src/Html.model.ts:8959` `ScriptSupporting` (const) - missing @example
- `src/Html.nodes.ts:48` `Text` (namespace) - missing @example
- `src/Html.nodes.ts:64` `Comment` (class) - missing @example
- `src/Html.nodes.ts:80` `Comment` (namespace) - missing @example
- `src/Html.nodes.ts:96` `Doctype` (class) - missing @example
- `src/Html.nodes.ts:114` `Doctype` (namespace) - missing @example
- `src/index.ts:34` `export * from "./Html.attributes.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./Html.meta.ts";` (re-export) - missing @example

### @beep/ui

Path: `packages/foundation/ui-system/ui`

Module findings:
- `src/components/accordion.tsx:1` (none) - missing summary; missing @since
- `src/components/alert-dialog.tsx:1` (none) - missing summary; missing @since
- `src/components/alert.tsx:1` (none) - missing summary; missing @since
- `src/components/aspect-ratio.tsx:1` (none) - missing summary; missing @since
- `src/components/avatar.tsx:1` (none) - missing summary; missing @since
- `src/components/badge.tsx:1` (none) - missing summary; missing @since
- `src/components/banner.tsx:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/editor.tsx:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/nodes.ts:1` (none) - missing summary; missing @since
- `src/components/blocks/editor-00/plugins.tsx:1` (none) - missing summary; missing @since
- `src/components/breadcrumb.tsx:1` (none) - missing summary; missing @since
- `src/components/button-group.tsx:1` (none) - missing summary; missing @since
- `src/components/button.tsx:1` (none) - missing summary; missing @since
- `src/components/calendar-event-card.tsx:1` (none) - missing summary; missing @since
- `src/components/calendar.tsx:1` (none) - missing summary; missing @since
- `src/components/card.tsx:1` (none) - missing summary; missing @since
- `src/components/carousel.tsx:1` (none) - missing summary; missing @since
- `src/components/chart.tsx:1` (none) - missing summary; missing @since
- `src/components/checkbox.tsx:1` (none) - missing summary; missing @since
- `src/components/collapsible.tsx:1` (none) - missing summary; missing @since
- `src/components/combobox.tsx:1` (none) - missing summary; missing @since
- `src/components/command.tsx:1` (none) - missing summary; missing @since
- `src/components/context-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/conversation.tsx:1` (none) - missing summary; missing @since
- `src/components/date-picker.tsx:1` (none) - missing summary; missing @since
- `src/components/dialog.tsx:1` (none) - missing summary; missing @since
- `src/components/direction.tsx:1` (none) - missing summary; missing @since
- `src/components/drawer.tsx:1` (none) - missing summary; missing @since
- `src/components/dropdown-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/editor/editor-ui/content-editable.tsx:1` (none) - missing summary; missing @since
- `src/components/editor/themes/editor-theme.ts:1` (none) - missing summary; missing @since
- `src/components/effect-date-time-picker.tsx:1` (none) - missing summary; missing @since
- `src/components/empty.tsx:1` (none) - missing summary; missing @since
- `src/components/field.tsx:1` (none) - missing summary; missing @since
- `src/components/hover-card.tsx:1` (none) - missing summary; missing @since
- `src/components/input-group.tsx:1` (none) - missing summary; missing @since
- `src/components/input-otp.tsx:1` (none) - missing summary; missing @since
- `src/components/input.tsx:1` (none) - missing summary; missing @since
- `src/components/item.tsx:1` (none) - missing summary; missing @since
- `src/components/kbd.tsx:1` (none) - missing summary; missing @since
- `src/components/knowledge-graph.tsx:1` (none) - missing summary; missing @since
- `src/components/label.tsx:1` (none) - missing summary; missing @since
- `src/components/link-preview.tsx:1` (none) - missing summary; missing @since
- `src/components/live-waveform.tsx:1` (none) - missing summary; missing @since
- `src/components/menubar.tsx:1` (none) - missing summary; missing @since
- `src/components/native-select.tsx:1` (none) - missing summary; missing @since
- `src/components/navigation-menu.tsx:1` (none) - missing summary; missing @since
- `src/components/notification-card.tsx:1` (none) - missing summary; missing @since
- `src/components/orb-background.tsx:1` (none) - missing summary; missing @since
- `src/components/orb.tsx:1` (none) - missing summary; missing @since
- `src/components/pagination.tsx:1` (none) - missing summary; missing @since
- `src/components/popover.tsx:1` (none) - missing summary; missing @since
- `src/components/progress.tsx:1` (none) - missing summary; missing @since
- `src/components/radio-group.tsx:1` (none) - missing summary; missing @since
- `src/components/resizable.tsx:1` (none) - missing summary; missing @since
- `src/components/scroll-area.tsx:1` (none) - missing summary; missing @since
- `src/components/select.tsx:1` (none) - missing summary; missing @since
- `src/components/separator.tsx:1` (none) - missing summary; missing @since
- `src/components/sheet.tsx:1` (none) - missing summary; missing @since
- `src/components/sidebar.tsx:1` (none) - missing summary; missing @since
- `src/components/skeleton.tsx:1` (none) - missing summary; missing @since
- `src/components/slider.tsx:1` (none) - missing summary; missing @since
- `src/components/sonner.tsx:1` (none) - missing summary; missing @since
- `src/components/speech-input.tsx:1` (none) - missing summary; missing @since
- `src/components/spinner.tsx:1` (none) - missing summary; missing @since
- `src/components/switch.tsx:1` (none) - missing summary; missing @since
- `src/components/table-icons.tsx:1` (none) - missing summary; missing @since
- `src/components/table.tsx:1` (none) - missing summary; missing @since
- `src/components/tabs.tsx:1` (none) - missing summary; missing @since
- `src/components/textarea.tsx:1` (none) - missing summary; missing @since
- `src/components/toast.tsx:1` (none) - missing summary; missing @since
- `src/components/toaster.tsx:1` (none) - missing summary; missing @since
- `src/components/todo-item.tsx:1` (none) - missing summary; missing @since
- `src/components/toggle-group.tsx:1` (none) - missing summary; missing @since
- `src/components/toggle.tsx:1` (none) - missing summary; missing @since
- `src/components/toolbar.tsx:1` (none) - missing summary; missing @since
- `src/components/tooltip.tsx:1` (none) - missing summary; missing @since
- `src/components/tour.tsx:1` (none) - missing summary; missing @since
- `src/components/ui/tooltip.tsx:1` (none) - missing summary; missing @since
- `src/hooks/use-scribe.ts:1` (none) - missing summary; missing @since
- `src/hooks/useNumberInput.ts:1` (none) - missing summary; missing @since
- `src/hooks/useSpinner.ts:1` (none) - missing summary; missing @since
- `src/lib/index.ts:1` (jsdoc) - missing summary
- `src/themes/colors.ts:1` (none) - missing summary; missing @since
- `src/themes/components/alert.ts:1` (none) - missing summary; missing @since
- `src/themes/components/autocomplete.ts:1` (none) - missing summary; missing @since
- `src/themes/components/avatar.ts:1` (none) - missing summary; missing @since
- `src/themes/components/button.ts:1` (none) - missing summary; missing @since
- `src/themes/components/card.ts:1` (none) - missing summary; missing @since
- `src/themes/components/chip.ts:1` (none) - missing summary; missing @since
- `src/themes/components/controls.ts:1` (none) - missing summary; missing @since
- `src/themes/components/data-grid.ts:1` (none) - missing summary; missing @since
- `src/themes/components/date-picker.ts:1` (none) - missing summary; missing @since
- `src/themes/components/dialog.ts:1` (none) - missing summary; missing @since
- `src/themes/components/layout.ts:1` (none) - missing summary; missing @since
- `src/themes/components/link.ts:1` (none) - missing summary; missing @since
- `src/themes/components/list.ts:1` (none) - missing summary; missing @since
- `src/themes/components/menu.ts:1` (none) - missing summary; missing @since
- `src/themes/components/progress.ts:1` (none) - missing summary; missing @since
- `src/themes/components/select.ts:1` (none) - missing summary; missing @since
- `src/themes/components/svg-icon.ts:1` (none) - missing summary; missing @since
- `src/themes/components/table.ts:1` (none) - missing summary; missing @since
- `src/themes/components/text-field.ts:1` (none) - missing summary; missing @since
- `src/themes/components/tree-view.ts:1` (none) - missing summary; missing @since
- `src/themes/shadows.ts:1` (none) - missing summary; missing @since
- `src/themes/theme-init-script.tsx:1` (none) - missing summary; missing @since
- `src/themes/theme.ts:1` (none) - missing summary; missing @since
- `src/themes/types.ts:1` (none) - missing summary; missing @since
- `src/themes/typography.ts:1` (none) - missing summary; missing @since

Export findings:
- `src/components/banner.tsx:163` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:164` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:165` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:166` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/calendar-event-card.tsx:22` `EventStatus` (type) - 1 unsafe example violation(s)
- `src/components/calendar-event-card.tsx:37` `EventVariant` (type) - 1 unsafe example violation(s)
- `src/components/carousel.tsx:27` `CarouselApi` (type) - 1 unsafe example violation(s)
- `src/components/color-picker.tsx:52` `ColorPickerProps` (interface) - missing @example
- `src/components/conversation.tsx:24` `ConversationProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:63` `ConversationContentProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:96` `ConversationEmptyStateProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:153` `ConversationScrollButtonProps` (type) - 1 unsafe example violation(s)
- `src/components/country-select.tsx:37` `CountryCode` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/components/country-select.tsx:297` `CountryCode` (type) - missing @example
- `src/components/country-select.tsx:418` `CountryFlagProps` (type) - missing @example
- `src/components/country-select.tsx:448` `CountryOptionContentProps` (interface) - missing @example
- `src/components/country-select.tsx:487` `CountrySelectProps` (interface) - missing @example
- `src/components/dialog.tsx:253` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:254` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:255` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:256` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:257` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:258` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:259` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:260` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:261` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/direction.tsx:9` `export { DirectionProvider, useDirection } from "@base-ui/react/direction-provider";` (re-export) - missing @example
- `src/components/dropdown-menu.tsx:415` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:416` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:417` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:418` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:419` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:420` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:421` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:422` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:423` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:424` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:425` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:426` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:427` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:428` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/emoji-picker.tsx:27` `EmojiPickerProps` (interface) - missing @example
- `src/components/knowledge-graph.tsx:30` `GraphNode` (interface) - 1 unsafe example violation(s)
- `src/components/knowledge-graph.tsx:59` `GraphLink` (interface) - 1 unsafe example violation(s)
- `src/components/knowledge-graph.tsx:103` `KnowledgeGraphHandle` (interface) - 1 unsafe example violation(s)
- `src/components/live-waveform.tsx:23` `LiveWaveformProps` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:34` `NotificationStatus` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:69` `ActionType` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:103` `ActionStyle` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:165` `NotificationAction` (type) - 1 unsafe example violation(s)
- `src/components/orb.tsx:27` `AgentState` (type) - 1 unsafe example violation(s)
- `src/components/phone-input.tsx:77` `PhoneNumberE164` (type) - missing @example
- `src/components/phone-input.tsx:145` `PhoneInputProps` (interface) - missing @example
- `src/components/rating.tsx:22` `RatingProps` (interface) - missing @example
- `src/components/toast.tsx:120` `ToastVariant` (type) - 1 unsafe example violation(s)
- `src/components/toast.tsx:297` `ToastActionElement` (type) - 1 unsafe example violation(s)
- `src/components/toast.tsx:281` `ToastProps` (type) - 1 unsafe example violation(s)
- `src/components/tour.tsx:187` `Step` (interface) - 1 unsafe example violation(s)
- `src/components/tour.tsx:216` `Tour` (interface) - 1 unsafe example violation(s)
- `src/hooks/index.ts:13` `export * from "./use-scribe.ts";` (re-export) - missing @example
- `src/hooks/index.ts:18` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/use-scribe.ts:66` `ScribeStatus` (type) - 1 unsafe example violation(s)
- `src/hooks/useNumberInput.ts:405` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:432` `NumberInputError` (type) - missing @example
- `src/lib/index.ts:5` `export * from "./url.ts";` (re-export) - missing @example
- `src/lib/index.ts:10` `export * from "./utils.ts";` (re-export) - missing @example
- `src/themes/index.ts:12` `export * from "./theme.ts";` (re-export) - missing @example
- `src/themes/index.ts:17` `export * from "./theme-init-script.tsx";` (re-export) - missing @example
- `src/themes/index.ts:22` `export * from "./theme-provider.tsx";` (re-export) - missing @example
- `src/themes/index.ts:27` `export type * from "./types.ts";` (re-export) - missing @example
- `src/themes/theme-provider.tsx:81` `ThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:108` `ResolvedThemeMode` (type) - missing @example
- `src/themes/types.ts:17` `ThemeOptions` (type) - 1 unsafe example violation(s)
- `src/themes/types.ts:33` `ThemeComponents` (type) - 1 unsafe example violation(s)

### @beep/pandoc-ast

Path: `packages/foundation/modeling/pandoc-ast`

Export findings:
- `src/Pandoc.codec.ts:57` `PandocConstructorWire` (class) - missing @example
- `src/Pandoc.codec.ts:77` `PandocConstructorWire` (namespace) - missing @example
- `src/Pandoc.codec.ts:130` `PandocJsonWire` (namespace) - missing @example
- `src/Pandoc.codec.ts:152` `PandocJsonFromString` (const) - missing @example
- `src/Pandoc.codec.ts:164` `PandocJsonFromString` (type) - missing @example
- `src/Pandoc.mapping.ts:913` `PandocToDocumentResult` (class) - missing @example
- `src/Pandoc.mapping.ts:933` `PandocToDocumentResult` (namespace) - missing @example
- `src/Pandoc.mapping.ts:957` `DocumentToPandocResult` (class) - missing @example
- `src/Pandoc.mapping.ts:977` `DocumentToPandocResult` (namespace) - missing @example
- `src/Pandoc.model.ts:39` `PandocApiVersion` (type) - missing @example
- `src/Pandoc.model.ts:47` `PandocKeyValue` (const) - missing @example
- `src/Pandoc.model.ts:59` `PandocKeyValue` (type) - missing @example
- `src/Pandoc.model.ts:100` `PandocAttr` (namespace) - missing @example
- `src/Pandoc.model.ts:150` `PandocTarget` (namespace) - missing @example
- `src/Pandoc.model.ts:190` `PandocMathType` (type) - missing @example
- `src/Pandoc.model.ts:225` `PandocListNumberStyle` (type) - missing @example
- `src/Pandoc.model.ts:252` `PandocListNumberDelimiter` (type) - missing @example
- `src/Pandoc.model.ts:260` `PandocInlineChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Pandoc.model.ts:274` `PandocInlineChildren` (namespace) - missing @example
- `src/Pandoc.model.ts:292` `PandocBlockChildren` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Pandoc.model.ts:306` `PandocBlockChildren` (namespace) - missing @example
- `src/Pandoc.model.ts:324` `PandocListItem` (const) - missing @example
- `src/Pandoc.model.ts:338` `PandocListItem` (type) - missing @example
- `src/Pandoc.model.ts:346` `PandocListItems` (const) - missing @example
- `src/Pandoc.model.ts:358` `PandocListItems` (type) - missing @example
- `src/Pandoc.model.ts:366` `Str` (class) - missing @example
- `src/Pandoc.model.ts:384` `Str` (namespace) - missing @example
- `src/Pandoc.model.ts:405` `Space` (class) - missing @example
- `src/Pandoc.model.ts:419` `Space` (namespace) - missing @example
- `src/Pandoc.model.ts:439` `SoftBreak` (class) - missing @example
- `src/Pandoc.model.ts:453` `SoftBreak` (namespace) - missing @example
- `src/Pandoc.model.ts:473` `LineBreak` (class) - missing @example
- `src/Pandoc.model.ts:487` `LineBreak` (namespace) - missing @example
- `src/Pandoc.model.ts:507` `Emph` (class) - missing @example
- `src/Pandoc.model.ts:525` `Emph` (namespace) - missing @example
- `src/Pandoc.model.ts:549` `Strong` (class) - missing @example
- `src/Pandoc.model.ts:567` `Strong` (namespace) - missing @example
- `src/Pandoc.model.ts:591` `Strikeout` (class) - missing @example
- `src/Pandoc.model.ts:609` `Strikeout` (namespace) - missing @example
- `src/Pandoc.model.ts:633` `Code` (class) - missing @example
- `src/Pandoc.model.ts:654` `Code` (namespace) - missing @example
- `src/Pandoc.model.ts:680` `Link` (class) - missing @example
- `src/Pandoc.model.ts:704` `Link` (namespace) - missing @example
- `src/Pandoc.model.ts:732` `Image` (class) - missing @example
- `src/Pandoc.model.ts:756` `Image` (namespace) - missing @example
- `src/Pandoc.model.ts:784` `Span` (class) - missing @example
- `src/Pandoc.model.ts:805` `Span` (namespace) - missing @example
- `src/Pandoc.model.ts:831` `Note` (class) - missing @example
- `src/Pandoc.model.ts:849` `Note` (namespace) - missing @example
- `src/Pandoc.model.ts:873` `Math` (class) - missing @example
- `src/Pandoc.model.ts:894` `Math` (namespace) - missing @example
- `src/Pandoc.model.ts:916` `UnknownInline` (class) - missing @example
- `src/Pandoc.model.ts:937` `UnknownInline` (namespace) - missing @example
- `src/Pandoc.model.ts:959` `PandocInline` (const) - missing @example
- `src/Pandoc.model.ts:987` `PandocInline` (type) - missing @example
- `src/Pandoc.model.ts:995` `PandocInline` (namespace) - missing @example
- `src/Pandoc.model.ts:1041` `Plain` (class) - missing @example
- `src/Pandoc.model.ts:1059` `Plain` (namespace) - missing @example
- `src/Pandoc.model.ts:1083` `Para` (class) - missing @example
- `src/Pandoc.model.ts:1101` `Para` (namespace) - missing @example
- `src/Pandoc.model.ts:1125` `Header` (class) - missing @example
- `src/Pandoc.model.ts:1149` `Header` (namespace) - missing @example
- `src/Pandoc.model.ts:1177` `BlockQuote` (class) - missing @example
- `src/Pandoc.model.ts:1195` `BlockQuote` (namespace) - missing @example
- `src/Pandoc.model.ts:1219` `CodeBlock` (class) - missing @example
- `src/Pandoc.model.ts:1240` `CodeBlock` (namespace) - missing @example
- `src/Pandoc.model.ts:1266` `BulletList` (class) - missing @example
- `src/Pandoc.model.ts:1284` `BulletList` (namespace) - missing @example
- `src/Pandoc.model.ts:1305` `OrderedList` (class) - missing @example
- `src/Pandoc.model.ts:1332` `OrderedList` (namespace) - missing @example
- `src/Pandoc.model.ts:1356` `HorizontalRule` (class) - missing @example
- `src/Pandoc.model.ts:1370` `HorizontalRule` (namespace) - missing @example
- `src/Pandoc.model.ts:1390` `Div` (class) - missing @example
- `src/Pandoc.model.ts:1411` `Div` (namespace) - missing @example
- `src/Pandoc.model.ts:1437` `Table` (class) - missing @example
- `src/Pandoc.model.ts:1461` `Table` (namespace) - missing @example
- `src/Pandoc.model.ts:1489` `UnknownBlock` (class) - missing @example
- `src/Pandoc.model.ts:1510` `UnknownBlock` (namespace) - missing @example
- `src/Pandoc.model.ts:1532` `PandocBlock` (const) - missing @example
- `src/Pandoc.model.ts:1557` `PandocBlock` (type) - missing @example
- `src/Pandoc.model.ts:1565` `PandocBlock` (namespace) - missing @example
- `src/Pandoc.model.ts:1605` `PandocMeta` (const) - missing @example
- `src/Pandoc.model.ts:1617` `PandocMeta` (type) - missing @example
- `src/Pandoc.model.ts:1657` `PandocDocument` (namespace) - missing @example
- `src/Pandoc.report.ts:41` `PandocMappingDirection` (type) - missing @example
- `src/Pandoc.report.ts:68` `PandocMappingSeverity` (type) - missing @example
- `src/Pandoc.report.ts:95` `PandocMappingProfile` (type) - missing @example
- `src/Pandoc.report.ts:122` `JsonPathSegment` (type) - missing @example
- `src/Pandoc.report.ts:130` `JsonPath` (const) - missing @example
- `src/Pandoc.report.ts:142` `JsonPath` (type) - missing @example
- `src/Pandoc.report.ts:218` `PandocMappingIssue` (namespace) - missing @example
- `src/Pandoc.report.ts:290` `PandocCompatibilityReport` (namespace) - missing @example

### @beep/repo-configs

Path: `packages/tooling/policy-pack/repo-configs`

Export findings:
- `src/next.ts:14` `export * from "./next/index.ts";` (re-export) - missing @example
- `src/next/internal.ts:19` `schemaIssueToError` (const) - missing @example
- `src/next/internal.ts:31` `isFunctionValue` (const) - missing @example
- `src/next/models/AllowedDevOrigin.schema.ts:57` `AllowedDevOrigin` (type) - 1 unsafe example violation(s)
- `src/next/models/ImageConfig.schema.ts:29` `LoaderValue` (const) - 1 schema annotation/type-alias gap(s)

### @beep/wink

Path: `packages/drivers/wink`

Export findings:
- `src/index.ts:27` `export * from "./Wink.errors.ts";` (re-export) - missing @example
- `src/index.ts:32` `export { WinkLayerAllLive, WinkLayerLive } from "./Wink.layer.ts";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./Wink.models.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./Wink.service.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./WinkBackend.service.ts";` (re-export) - missing @example
- `src/index.ts:52` `export * from "./WinkCorpus.service.ts";` (re-export) - missing @example
- `src/index.ts:57` `export { WinkEngineRef, WinkEngineRefLive } from "./WinkEngineRef.service.ts";` (re-export) - missing @example
- `src/index.ts:62` `export * from "./WinkObservability.ts";` (re-export) - missing @example
- `src/index.ts:67` `export * from "./WinkSimilarity.service.ts";` (re-export) - missing @example
- `src/index.ts:72` `export * from "./WinkTokenization.service.ts";` (re-export) - missing @example
- `src/index.ts:77` `export * from "./WinkTools.service.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./WinkUtils.service.ts";` (re-export) - missing @example
- `src/index.ts:87` `export * from "./WinkVectorizer.service.ts";` (re-export) - missing @example

### @beep/postgres

Path: `packages/drivers/postgres`

Export findings:
- `src/index.ts:14` `export * from "./Postgres.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./PostgresClient.service.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./PostgresDiagnostics.service.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./PostgresDrizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./PostgresInterop.models.ts";` (re-export) - missing @example
- `src/index.ts:49` `export * from "./PostgresSqlState.models.ts";` (re-export) - missing @example

### @beep/architecture-lab-domain

Path: `packages/architecture-lab/domain`

Export findings:
- `src/aggregates/WorkItem/WorkItem.errors.ts:124` `WorkItemDomainError` (type) - 1 unsafe example violation(s)
- `src/aggregates/WorkItem/WorkItem.errors.ts:139` `WorkItemDomainError` (const) - 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.values.ts:43` `WorkItemId` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:72` `WorkItemTitle` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:100` `WorkItemStatus` (type) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.values.js";` (re-export) - missing @example
- `src/aggregates/index.ts:7` `export * as WorkItem from "./WorkItem/index.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.model.ts:41` `WorkerId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:64` `WorkerOrganizationId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:92` `WorkerStatus` (type) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.model.js";` (re-export) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/identity/ArchitectureLab.ts:38` `WorkerId` (type) - missing @example
- `src/identity/index.ts:15` `export * as ArchitectureLab from "./ArchitectureLab.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:51` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:58` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:65` `export * as Values from "./values/index.js";` (re-export) - missing @example
- `src/index.ts:72` `export * as WorkPriority from "./values/WorkPriority/index.js";` (re-export) - missing @example
- `src/values/WorkPriority/WorkPriority.model.ts:40` `WorkPriority` (type) - missing @example
- `src/values/WorkPriority/index.ts:7` `export * from "./WorkPriority.behavior.js";` (re-export) - missing @example
- `src/values/WorkPriority/index.ts:14` `export * from "./WorkPriority.model.js";` (re-export) - missing @example
- `src/values/index.ts:15` `export * as WorkPriority from "./WorkPriority/index.js";` (re-export) - missing @example

### @beep/provenance

Path: `packages/foundation/modeling/provenance`

Export findings:
- `src/TextAnchor.ts:37` `TextAnchorFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/index.ts:23` `export * from "./TextAnchor.ts";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example

### @beep/epistemic-tables

Path: `packages/epistemic/tables`

Export findings:
- `src/Schema.ts:45` `DbSchema` (type) - 1 unsafe example violation(s)
- `src/entities/UsageRecord/UsageRecord.converters.ts:27` `UsageRecordRow` (type) - 1 unsafe example violation(s)
- `src/entities/UsageRecord/UsageRecord.converters.ts:43` `UsageRecordInsert` (type) - 1 unsafe example violation(s)
- `src/index.ts:28` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example

### @beep/federal-register

Path: `packages/drivers/federal-register`

Module findings:
- `src/index.ts:1` (jsdoc) - missing summary

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example; 1 category casing violation(s)

### @beep/sanity

Path: `packages/drivers/sanity`

Export findings:
- `src/index.ts:14` `export * from "./Sanity.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Sanity.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Sanity.service.ts";` (re-export) - missing @example
