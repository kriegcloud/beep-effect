# JSDoc Documentation Compliance Inventory

Generated: 2026-06-02T16:57:05.284Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 89 |
| cleanPackages | 27 |
| packagesWithoutPublicSrcSurface | 1 |
| packagesNeedingRemediation | 57 |
| publicModules | 1181 |
| publicExports | 7641 |
| openModules | 112 |
| openExports | 1519 |
| missingExportExamples | 1172 |
| missingExportCategories | 63 |
| missingExportSince | 63 |
| forbiddenTagFindings | 7 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 25 |
| unsafeExampleFindings | 185 |
| schemaAnnotationFindings | 157 |
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
| 5 | `@beep/hubspot` | `packages/drivers/hubspot` | needs-remediation | 4 | 19 | 0 | 3 |
| 6 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | needs-remediation | 3 | 7 | 0 | 3 |
| 7 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 8 | `@beep/canvas-domain` | `packages/canvas/domain` | needs-remediation | 8 | 38 | 0 | 17 |
| 9 | `@beep/workspace-tables` | `packages/workspace/tables` | needs-remediation | 7 | 10 | 0 | 2 |
| 10 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 4 | 6 | 0 | 2 |
| 11 | `@beep/repo-codegraph` | `packages/tooling/library/repo-codegraph` | clean | 5 | 40 | 0 | 0 |
| 12 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 36 | 192 | 0 | 11 |
| 13 | `@beep/discord` | `packages/drivers/discord` | needs-remediation | 4 | 12 | 0 | 4 |
| 14 | `@beep/face-detection` | `packages/drivers/face-detection` | needs-remediation | 4 | 27 | 0 | 9 |
| 15 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | needs-remediation | 3 | 7 | 0 | 4 |
| 16 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 80 | 440 | 0 | 110 |
| 17 | `@beep/ai-sync` | `packages/tooling/library/ai-sync` | clean | 10 | 70 | 0 | 0 |
| 18 | `@beep/shared-server` | `packages/shared/server` | clean | 1 | 1 | 0 | 0 |
| 19 | `@beep/nlp-mcp` | `packages/drivers/nlp-mcp` | needs-remediation | 5 | 22 | 0 | 9 |
| 20 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 14 | 25 | 0 | 0 |
| 21 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 8 | 66 | 0 | 21 |
| 22 | `@beep/canvas-server` | `packages/canvas/server` | needs-remediation | 9 | 23 | 0 | 10 |
| 23 | `@beep/file-processing` | `packages/foundation/capability/file-processing` | needs-remediation | 7 | 84 | 0 | 24 |
| 24 | `@beep/agent-capability-use-cases` | `packages/agent-capability/use-cases` | needs-remediation | 12 | 41 | 0 | 9 |
| 25 | `@beep/ai-provider-cli` | `packages/drivers/ai-provider-cli` | needs-remediation | 4 | 12 | 0 | 6 |
| 26 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 27 | `@beep/shared-config` | `packages/shared/config` | clean | 1 | 1 | 0 | 0 |
| 28 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 29 | `@beep/sandbox` | `packages/foundation/capability/sandbox` | needs-remediation | 29 | 290 | 0 | 75 |
| 30 | `@beep/phoenix` | `packages/drivers/phoenix` | needs-remediation | 5 | 50 | 0 | 10 |
| 31 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 1 | 1 | 0 | 0 |
| 32 | `@beep/canvas-use-cases` | `packages/canvas/use-cases` | needs-remediation | 10 | 35 | 0 | 15 |
| 33 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 3 | 22 | 0 | 7 |
| 34 | `@beep/types` | `packages/foundation/primitive/types` | clean | 5 | 10 | 0 | 0 |
| 35 | `@beep/oip-web` | `apps/oip-web` | needs-remediation | 28 | 66 | 0 | 7 |
| 36 | `@beep/agent-capability-domain` | `packages/agent-capability/domain` | clean | 7 | 11 | 0 | 0 |
| 37 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 11 | 14 | 0 | 10 |
| 38 | `@beep/md` | `packages/foundation/capability/md` | clean | 5 | 131 | 0 | 0 |
| 39 | `@beep/canvas` | `apps/canvas` | needs-remediation | 3 | 25 | 0 | 2 |
| 40 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 21 | 40 | 0 | 0 |
| 41 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 29 | 256 | 0 | 9 |
| 42 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 23 | 177 | 0 | 17 |
| 43 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | needs-remediation | 17 | 250 | 0 | 4 |
| 44 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | needs-remediation | 7 | 21 | 0 | 11 |
| 45 | `@beep/tika` | `packages/drivers/tika` | needs-remediation | 3 | 10 | 0 | 2 |
| 46 | `@beep/libpff` | `packages/drivers/libpff` | needs-remediation | 3 | 11 | 0 | 2 |
| 47 | `@beep/venice-ai` | `packages/drivers/venice-ai` | clean | 3 | 35 | 0 | 0 |
| 48 | `@beep/form` | `packages/foundation/ui-system/form` | needs-remediation | 15 | 84 | 0 | 14 |
| 49 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 115 | 0 | 4 |
| 50 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 3 |
| 51 | `@beep/box` | `packages/drivers/box` | needs-remediation | 4 | 8 | 0 | 8 |
| 52 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 50 | 0 | 0 |
| 53 | `@beep/stack-installer` | `apps/stack-installer` | needs-remediation | 2 | 3 | 0 | 2 |
| 54 | `@beep/professional-desktop` | `apps/professional-desktop` | needs-remediation | 2 | 2 | 0 | 1 |
| 55 | `@beep/epistemic-domain` | `packages/epistemic/domain` | clean | 13 | 18 | 0 | 0 |
| 56 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | needs-remediation | 18 | 62 | 0 | 28 |
| 57 | `@beep/professional-runtime-proof` | `apps/professional-runtime-proof` | clean | 1 | 4 | 0 | 0 |
| 58 | `@beep/acp` | `packages/drivers/acp` | needs-remediation | 10 | 406 | 0 | 1 |
| 59 | `@beep/nlp` | `packages/foundation/capability/nlp` | needs-remediation | 67 | 598 | 0 | 38 |
| 60 | `@beep/infra` | `infra` | clean | 3 | 21 | 0 | 0 |
| 61 | `@beep/installer-use-cases` | `packages/installer/use-cases` | needs-remediation | 3 | 30 | 0 | 1 |
| 62 | `@beep/runpod` | `packages/drivers/runpod` | needs-remediation | 6 | 174 | 0 | 10 |
| 63 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 65 | 661 | 2 | 82 |
| 64 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 223 | 1469 | 0 | 704 |
| 65 | `@beep/codedank-web` | `apps/codedank-web` | clean | 1 | 1 | 0 | 0 |
| 66 | `@beep/onepassword-cli` | `packages/drivers/onepassword-cli` | needs-remediation | 4 | 12 | 0 | 5 |
| 67 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | needs-remediation | 9 | 21 | 0 | 8 |
| 68 | `@beep/data` | `packages/foundation/primitive/data` | clean | 7 | 39 | 0 | 0 |
| 69 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 62 | 0 | 0 |
| 70 | `@beep/wealth-management-domain` | `packages/wealth-management/domain` | clean | 14 | 25 | 0 | 0 |
| 71 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | needs-remediation | 13 | 34 | 0 | 13 |
| 72 | `@beep/duckdb` | `packages/drivers/duckdb` | needs-remediation | 4 | 15 | 0 | 3 |
| 73 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 74 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | clean | 1 | 3 | 0 | 0 |
| 75 | `@beep/installer-server` | `packages/installer/server` | needs-remediation | 3 | 19 | 0 | 3 |
| 76 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 23 | 134 | 3 | 24 |
| 77 | `@beep/konva` | `packages/drivers/konva` | needs-remediation | 1 | 1 | 0 | 1 |
| 78 | `@beep/shared-client` | `packages/shared/client` | clean | 1 | 1 | 0 | 0 |
| 79 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 118 | 502 | 107 | 64 |
| 80 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 24 | 130 | 0 | 5 |
| 81 | `@beep/canvas-client` | `packages/canvas/client` | clean | 1 | 1 | 0 | 0 |
| 82 | `@beep/wink` | `packages/drivers/wink` | needs-remediation | 14 | 71 | 0 | 13 |
| 83 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 36 | 0 | 6 |
| 84 | `@beep/installer-domain` | `packages/installer/domain` | needs-remediation | 12 | 52 | 0 | 27 |
| 85 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | needs-remediation | 15 | 52 | 0 | 27 |
| 86 | `@beep/canvas-ui` | `packages/canvas/ui` | clean | 1 | 1 | 0 | 0 |
| 87 | `@beep/messages` | `packages/foundation/modeling/messages` | clean | 2 | 6 | 0 | 0 |
| 88 | `@beep/sanity` | `packages/drivers/sanity` | needs-remediation | 4 | 16 | 0 | 3 |
| 89 | `@beep/shared-ui` | `packages/shared/ui` | clean | 4 | 7 | 0 | 0 |

## Open Findings

### @beep/hubspot

Path: `packages/drivers/hubspot`

Export findings:
- `src/index.ts:14` `export * from "./HubSpot.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./HubSpot.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./HubSpot.service.ts";` (re-export) - missing @example

### @beep/architecture-lab-ui

Path: `packages/architecture-lab/ui`

Export findings:
- `src/aggregates/WorkItem/WorkItem.view-model.ts:47` `WorkItemVisibleAction` (type) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.view-model.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/canvas-domain

Path: `packages/canvas/domain`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:152` `CanvasProjectDomainError` (type) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.model.ts:111` `CanvasProject` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:43` `CanvasProjectId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:72` `CanvasProjectTitle` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:100` `CanvasProjectStatus` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:130` `CanvasNodeId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:158` `CanvasNodeKind` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:187` `CanvasNodeLabel` (type) - missing @example
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.errors.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.model.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.values.js";` (re-export) - missing @example
- `src/aggregates/index.ts:13` `export * as CanvasProject from "./CanvasProject/index.js";` (re-export) - missing @example
- `src/identity/Canvas.ts:38` `CanvasOperatorId` (type) - missing @example
- `src/identity/index.ts:15` `export * as Canvas from "./Canvas.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Identity from "./identity/index.js";` (re-export) - missing @example

### @beep/workspace-tables

Path: `packages/workspace/tables`

Export findings:
- `src/Schema.ts:47` `DbSchema` (type) - 1 unsafe example violation(s)
- `src/index.ts:28` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example

### @beep/db-admin

Path: `packages/_internal/db-admin`

Export findings:
- `src/index.ts:14` `export * from "./targets.js";` (re-export) - missing @example
- `src/schema.ts:9` `export * from "@beep/architecture-lab-tables/tables";` (re-export) - missing @example

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
- `src/commands/CreatePackage/index.ts:14` `export * from "./CreatePackage.command.js";` (re-export) - missing @example
- `src/commands/Docgen/index.ts:14` `export * from "./Docgen.command.js";` (re-export) - missing @example
- `src/commands/Docs/index.ts:14` `export * from "./Docs.command.js";` (re-export) - missing @example
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
- `src/commands/Files/Files.service.ts:335` `FilesCommandServiceShape` (interface) - 1 unsafe example violation(s)
- `src/commands/Files/index.ts:15` `export * from "./Files.command.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:22` `export * from "./Files.errors.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:29` `export * from "./Files.media.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:36` `export * from "./Files.progress.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:43` `export * from "./Files.schemas.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:50` `export * from "./Files.service.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:13` `export * from "./Graphiti.command.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:20` `export * from "./Graphiti.errors.js";` (re-export) - missing @example
- `src/commands/Image/Image.schemas.ts:217` `ExtractFramesDirOutcome` (type) - missing @example
- `src/commands/Image/Image.service.ts:54` `ImageCommandServiceShape` (interface) - 1 unsafe example violation(s)
- `src/commands/Image/index.ts:14` `export * from "./Image.command.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:21` `export * from "./Image.errors.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:28` `export * from "./Image.schemas.js";` (re-export) - missing @example
- `src/commands/Image/index.ts:35` `export * from "./Image.service.js";` (re-export) - missing @example
- `src/commands/Laws/index.ts:13` `export * from "./Laws.command.js";` (re-export) - missing @example
- `src/commands/Laws/index.ts:20` `export * from "./Laws.errors.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:13` `export * from "./Lint.command.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:20` `export * from "./Lint.errors.js";` (re-export) - missing @example
- `src/commands/Lint/index.ts:27` `export * from "./SchemaTopology.ts";` (re-export) - missing @example
- `src/commands/Purge/index.ts:14` `export * from "./Purge.command.js";` (re-export) - missing @example
- `src/commands/Quality/ChangesetGraph.ts:27` `export { ChangesetGraphError } from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/Quality.command.ts:39` `export { QualityScriptCommandError } from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:13` `export { qualityCommand } from "./Quality.command.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:20` `export * from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Reuse/Reuse.errors.ts:43` `CodexRunnerStage` (type) - missing @example
- `src/commands/Reuse/index.ts:13` `export {
  buildCloneDocument,
  CloneBaselineDocument,
  CloneBaselineEntry,
  diffCloneBaseline,
} from "./internal/CloneBaseline.js";` (re-export) - missing @example
- `src/commands/Reuse/index.ts:25` `export * from "./Reuse.command.js";` (re-export) - missing @example
- `src/commands/Reuse/index.ts:32` `export * from "./Reuse.errors.js";` (re-export) - missing @example
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
- `src/commands/TsconfigSync/TsconfigSync.command.ts:301` `TsconfigSyncSection` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:415` `TsconfigSyncChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:544` `PlannedFileChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:606` `TsconfigSyncResult` (type) - missing @example
- `src/commands/TsconfigSync/index.ts:13` `export * from "./TsconfigSync.command.js";` (re-export) - missing @example
- `src/commands/TsconfigSync/index.ts:20` `export * from "./TsconfigSync.errors.js";` (re-export) - missing @example
- `src/commands/VersionSync/index.ts:13` `export * from "./VersionSync.command.js";` (re-export) - missing @example
- `src/commands/VersionSync/index.ts:20` `export * from "./VersionSync.errors.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:14` `export { YeetRunOptions, YeetRunResult } from "./internal/Handler.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:21` `export {
  PackageQualityReport,
  QualityIssue,
  QualityIssueCategory,
  QualityIssueConfidence,
  QualityIssueIndex,
  QualityIssueRouting,
  QualityIssueSeverity,
} from "./internal/QualityIssueIndex.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:36` `export { yeetCommand } from "./Yeet.command.js";` (re-export) - missing @example
- `src/commands/Yeet/index.ts:43` `export * from "./Yeet.errors.js";` (re-export) - missing @example
- `src/index.ts:75` `export {
  /**
   * Code generation command for workspace barrels and exports.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  codegenCommand,
} from "./commands/Codegen/index.js";` (re-export) - missing @example
- `src/index.ts:117` `export {
  /**
   * Package scaffolding command for creating new workspace packages.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  createPackageCommand,
} from "./commands/CreatePackage/index.js";` (re-export) - missing @example
- `src/index.ts:132` `export {
  /**
   * Human-first docgen command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docgenCommand,
} from "./commands/Docgen/index.js";` (re-export) - missing @example
- `src/index.ts:147` `export {
  /**
   * Command-first docs discovery command tree.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  docsCommand,
} from "./commands/Docs/index.js";` (re-export) - missing @example
- `src/index.ts:162` `export {
  /**
   * Dataset file curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  filesCommand,
} from "./commands/Files/index.js";` (re-export) - missing @example
- `src/index.ts:177` `export {
  /**
   * Graphiti operational command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  graphitiCommand,
} from "./commands/Graphiti/index.js";` (re-export) - missing @example
- `src/index.ts:192` `export {
  /**
   * Image and video curation command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  imageCommand,
} from "./commands/Image/index.js";` (re-export) - missing @example
- `src/index.ts:207` `export {
  /**
   * Effect laws command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lawsCommand,
} from "./commands/Laws/index.js";` (re-export) - missing @example
- `src/index.ts:222` `export {
  /**
   * Lint policy command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  lintCommand,
} from "./commands/Lint/index.js";` (re-export) - missing @example
- `src/index.ts:237` `export {
  /**
   * Purge command for removing root/workspace build artifacts.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  purgeCommand,
} from "./commands/Purge/index.js";` (re-export) - missing @example
- `src/index.ts:279` `export {
  /**
   * Reuse-discovery command group.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  reuseCommand,
} from "./commands/Reuse/index.js";` (re-export) - missing @example
- `src/index.ts:294` `export {
  /**
   * Root CLI command that composes subcommands.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  rootCommand,
} from "./commands/Root.js";` (re-export) - missing @example
- `src/index.ts:309` `export {
  /**
   * Official data sync command for checked-in generated TypeScript modules.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  syncDataToTsCommand,
} from "./commands/SyncDataToTs/index.js";` (re-export) - missing @example
- `src/index.ts:324` `export {
  /**
   * Dependency topological sort command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  topoSortCommand,
} from "./commands/TopoSort/index.js";` (re-export) - missing @example
- `src/index.ts:339` `export {
  /**
   * Tsconfig sync command for workspace tsconfig references and root aliases.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  tsconfigSyncCommand,
} from "./commands/TsconfigSync/index.js";` (re-export) - missing @example
- `src/index.ts:354` `export {
  /**
   * Version sync command for detecting and fixing version drift.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  versionSyncCommand,
} from "./commands/VersionSync/index.js";` (re-export) - missing @example
- `src/index.ts:369` `export {
  /**
   * Yeet quality feedback and publish command.
   *
   * @category cli-commands
   * @since 0.0.0
   */
  yeetCommand,
} from "./commands/Yeet/index.js";` (re-export) - missing @example

### @beep/nlp-mcp

Path: `packages/drivers/nlp-mcp`

Export findings:
- `src/Schemas.ts:70` `POSEntry` (class) - missing @example
- `src/Schemas.ts:85` `LemmaEntry` (class) - missing @example
- `src/Schemas.ts:100` `EntityEntry` (class) - missing @example
- `src/Schemas.ts:139` `POSOutput` (class) - missing @example
- `src/Schemas.ts:153` `LemmaOutput` (class) - missing @example
- `src/Schemas.ts:167` `EntityOutput` (class) - missing @example
- `src/Server.ts:139` `NlpMcpServerConfig` (interface) - missing @example
- `src/bin.ts:24` `SERVER_CONFIG` (const) - missing @example
- `src/index.ts:12` `VERSION` (const) - missing summary; missing @example

### @beep/repo-docgen

Path: `packages/tooling/tool/docgen`

Export findings:
- `src/Configuration.ts:54` `ConfigurationSchema` (class) - 1 schema annotation/type-alias gap(s)
- `src/Configuration.ts:96` `ConfigurationShape` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:78` `Position` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:115` `Doc` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:193` `DocEntry` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:244` `Class` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:304` `Interface` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:353` `Function` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:402` `TypeAlias` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:451` `Constant` (class) - 1 unsafe example violation(s); 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:509` `Export` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:567` `Namespace` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:614` `Module` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:691` `File` (class) - 1 schema annotation/type-alias gap(s)
- `src/Domain.ts:751` `DocgenError` (class) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:12` `export * as Checker from "./Checker.js";` (re-export) - missing @example
- `src/index.ts:17` `export * as Configuration from "./Configuration.js";` (re-export) - missing @example
- `src/index.ts:22` `export * as Core from "./Core.js";` (re-export) - missing @example
- `src/index.ts:27` `export * as Domain from "./Domain.js";` (re-export) - missing @example
- `src/index.ts:32` `export * as Parser from "./Parser.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Printer from "./Printer.js";` (re-export) - missing @example

### @beep/canvas-server

Path: `packages/canvas/server`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.http.ts:151` `makeCanvasProjectHttpHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.rpc.ts:27` `makeCanvasProjectRpcHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.tools.ts:50` `makeCanvasProjectToolHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.http.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.layer.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.repo.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:28` `export * from "./CanvasProject.rpc.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:35` `export * from "./CanvasProject.tools.js";` (re-export) - missing @example
- `src/index.ts:15` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Layer.js";` (re-export) - missing @example

### @beep/file-processing

Path: `packages/foundation/capability/file-processing`

Export findings:
- `src/Artifact/index.ts:81` `ArtifactId` (type) - missing @example
- `src/Artifact/index.ts:109` `OperationId` (type) - missing @example
- `src/Artifact/index.ts:137` `ContentDigest` (type) - missing @example
- `src/Artifact/index.ts:164` `ArtifactLocatorKind` (type) - missing @example
- `src/Extraction/index.ts:42` `SourceProcessingStatus` (type) - missing @example
- `src/Extraction/index.ts:351` `ProcessFileResult` (type) - missing @example
- `src/Extraction/index.ts:558` `SourceProcessingRecord` (type) - missing @example
- `src/Extraction/index.ts:589` `FileProcessingFailureReason` (type) - missing @example
- `src/Extraction/index.ts:700` `FileProcessingFailureRecord` (type) - missing @example
- `src/Operation/index.ts:51` `FileProcessingOperationErrorReason` (type) - missing @example
- `src/Service/index.ts:51` `FileProcessingEngineShape` (type) - 1 unsafe example violation(s)
- `src/Service/index.ts:74` `FileProcessingServiceShape` (type) - 1 unsafe example violation(s)
- `src/Strategy/index.ts:39` `FileProcessingOperationKind` (type) - missing @example
- `src/Strategy/index.ts:66` `FileProcessingEngineFamily` (type) - missing @example
- `src/Strategy/index.ts:108` `FileFormatFamily` (type) - missing @example
- `src/Strategy/index.ts:140` `FileProcessingCapability` (type) - missing @example
- `src/Strategy/index.ts:167` `FileProcessingSupportDisposition` (type) - missing @example
- `src/Strategy/index.ts:203` `FileProcessingSkipReason` (type) - missing @example
- `src/Strategy/index.ts:358` `SelectedStrategy` (type) - missing @example
- `src/index.ts:14` `export * as Artifact from "./Artifact/index.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * as Extraction from "./Extraction/index.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as Operation from "./Operation/index.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * as Service from "./Service/index.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * as Strategy from "./Strategy/index.ts";` (re-export) - missing @example

### @beep/agent-capability-use-cases

Path: `packages/agent-capability/use-cases`

Export findings:
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.service.ts:27` `ProfessionalRuntimeSdk` (interface) - 1 unsafe example violation(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:25` `RuntimeCandidateLifecycle` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:44` `RuntimeClaimConfidence` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:63` `RuntimeApprovalDecision` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:82` `RuntimeRequestKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:101` `RuntimeSourceKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:120` `RuntimeActivityType` (const) - 1 schema annotation/type-alias gap(s)
- `src/processes/ProfessionalRuntime/ProfessionalRuntime.values.ts:139` `RuntimeUsageMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/public.ts:92` `export type { ProfessionalRuntimeSdk } from "./processes/ProfessionalRuntime/ProfessionalRuntime.service.js";` (re-export) - 1 unsafe example violation(s)

### @beep/ai-provider-cli

Path: `packages/drivers/ai-provider-cli`

Export findings:
- `src/AiProviderCli.models.ts:39` `AiProviderCliProvider` (type) - missing @example
- `src/AiProviderCli.models.ts:66` `AiProviderCliAuthStatus` (type) - missing @example
- `src/AiProviderCli.service.ts:39` `AiProviderCliRunner` (type) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./AiProviderCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./AiProviderCli.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./AiProviderCli.service.ts";` (re-export) - missing @example

### @beep/sandbox

Path: `packages/foundation/capability/sandbox`

Export findings:
- `src/Agent.provider.ts:365` `ParsedStreamEvent` (type) - missing @example
- `src/Agent.provider.ts:392` `CodexEffort` (type) - missing @example
- `src/Agent.provider.ts:419` `ClaudeEffort` (type) - missing @example
- `src/Agent.provider.ts:598` `AgentProvider` (interface) - 1 unsafe example violation(s)
- `src/AgentStreamEmitter.ts:58` `AgentStreamEvent` (type) - missing @example
- `src/AgentStreamEmitter.ts:66` `AgentStreamEvent` (namespace) - missing @example
- `src/AgentStreamEmitter.ts:90` `AgentStreamEmitterShape` (interface) - 1 unsafe example violation(s)
- `src/Display.ts:44` `Severity` (type) - missing @example
- `src/Display.ts:245` `DisplayEntry` (type) - missing @example
- `src/Display.ts:261` `DisplayServiceShape` (interface) - 1 unsafe example violation(s)
- `src/Image.ts:46` `ContainerImageRuntime` (type) - missing @example
- `src/Init.ts:64` `SandboxAgentName` (type) - missing @example
- `src/Init.ts:91` `SandboxInitProviderName` (type) - missing @example
- `src/Orchestrator.ts:114` `OrchestrateOptions` (interface) - 1 unsafe example violation(s)
- `src/Prompt.ts:98` `BuiltInPromptArgKey` (type) - missing @example
- `src/Prompt.ts:125` `PromptArgValue` (type) - missing @example
- `src/Prompt.ts:152` `PromptArgs` (type) - missing @example
- `src/Prompt.ts:181` `PromptSource` (type) - missing @example
- `src/RecoveryMessage.ts:41` `FailedStep` (type) - missing @example
- `src/Run.ts:110` `LoggingOptionKind` (type) - missing @example
- `src/Run.ts:251` `LoggingOption` (type) - missing @example
- `src/Run.ts:374` `RunOptions` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.errors.ts:672` `SandboxError` (type) - missing @example
- `src/Sandbox.errors.ts:680` `SandboxError` (namespace) - missing @example
- `src/Sandbox.observability.ts:157` `SandboxPhaseAttributes` (type) - missing @example
- `src/Sandbox.process.ts:147` `SandboxProcessShape` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:43` `SandboxProviderKind` (type) - missing @example
- `src/Sandbox.provider.ts:130` `InteractiveExecOptions` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:299` `BranchStrategy` (type) - missing @example
- `src/Sandbox.provider.ts:315` `SandboxHandle` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:340` `BindMountSandboxHandle` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:358` `IsolatedSandboxHandle` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:376` `NoSandboxHandle` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:392` `BindMountSandboxProvider` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:414` `IsolatedSandboxProvider` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:435` `NoSandboxProvider` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:459` `SandboxProvider` (type) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:478` `BindMountSandboxProviderConfig` (interface) - 1 unsafe example violation(s)
- `src/Sandbox.provider.ts:499` `IsolatedSandboxProviderConfig` (interface) - 1 unsafe example violation(s)
- `src/Session.ts:73` `SessionId` (type) - missing @example
- `src/Session.ts:104` `SessionStore` (interface) - 1 unsafe example violation(s)
- `src/Template.ts:44` `SandboxTemplateName` (type) - missing @example
- `src/TextDeltaBuffer.ts:63` `TextDeltaFlush` (type) - 1 unsafe example violation(s)
- `src/createSandbox.ts:34` `CreateSandboxOptions` (interface) - 1 unsafe example violation(s)
- `src/createWorktree.ts:66` `Worktree` (interface) - 1 unsafe example violation(s)
- `src/index.ts:14` `export * from "./Agent.provider.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./AgentStreamEmitter.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./createSandbox.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./createWorktree.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./Display.ts";` (re-export) - missing @example
- `src/index.ts:49` `export * from "./Env.ts";` (re-export) - missing @example
- `src/index.ts:56` `export * from "./Image.ts";` (re-export) - missing @example
- `src/index.ts:63` `export * from "./Init.ts";` (re-export) - missing @example
- `src/index.ts:70` `export * from "./interactive.ts";` (re-export) - missing @example
- `src/index.ts:77` `export * from "./Lifecycle.ts";` (re-export) - missing @example
- `src/index.ts:84` `export * from "./Orchestrator.ts";` (re-export) - missing @example
- `src/index.ts:91` `export * from "./Prompt.ts";` (re-export) - missing @example
- `src/index.ts:98` `export * from "./RecoveryMessage.ts";` (re-export) - missing @example
- `src/index.ts:105` `export * from "./Run.ts";` (re-export) - missing @example
- `src/index.ts:112` `export * from "./resolveCwd.ts";` (re-export) - missing @example
- `src/index.ts:119` `export * from "./Sandbox.error-handler.ts";` (re-export) - missing @example
- `src/index.ts:126` `export * from "./Sandbox.errors.ts";` (re-export) - missing @example
- `src/index.ts:133` `export * from "./Sandbox.observability.ts";` (re-export) - missing @example
- `src/index.ts:140` `export * from "./Sandbox.process.ts";` (re-export) - missing @example
- `src/index.ts:147` `export * from "./Sandbox.provider.ts";` (re-export) - missing @example
- `src/index.ts:154` `export * from "./Sandbox.providers.ts";` (re-export) - missing @example
- `src/index.ts:161` `export * from "./Session.ts";` (re-export) - missing @example
- `src/index.ts:168` `export * from "./SyncIn.ts";` (re-export) - missing @example
- `src/index.ts:175` `export * from "./SyncOut.ts";` (re-export) - missing @example
- `src/index.ts:182` `export * from "./Template.ts";` (re-export) - missing @example
- `src/index.ts:189` `export * from "./TextDeltaBuffer.ts";` (re-export) - missing @example
- `src/index.ts:196` `export * from "./terminalCleanup.ts";` (re-export) - missing @example
- `src/index.ts:203` `export * from "./Worktree.ts";` (re-export) - missing @example
- `src/terminalCleanup.ts:37` `TerminalCleanupStdin` (interface) - 1 unsafe example violation(s)
- `src/terminalCleanup.ts:56` `TerminalCleanupStdout` (interface) - 1 unsafe example violation(s)

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

### @beep/canvas-use-cases

Path: `packages/canvas/use-cases`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:221` `CanvasProjectActionError` (type) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:111` `CanvasProjectRepositoryError` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:128` `CanvasProjectRepositoryError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:144` `CanvasProjectRepositoryShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.service.ts:107` `makeCanvasProjectUseCases` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.use-cases.ts:41` `CanvasProjectUseCasesShape` (interface) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.commands.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.errors.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.use-cases.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:14` `export * from "./CanvasProject.repository.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:21` `export { makeCanvasProjectUseCases, toCanvasProjectActionError } from "./CanvasProject.service.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/server.ts:28` `export * from "./index.js";` (re-export) - missing @example
- `src/index.ts:15` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as CanvasProject from "./aggregates/CanvasProject/server.js";` (re-export) - missing @example

### @beep/test-utils

Path: `packages/tooling/test-kit/test-utils`

Export findings:
- `src/SqlTest.ts:197` `PgliteTestcontainersTestDriverConfigInput` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:255` `PgExternalTestDriverConfigInput` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:270` `PgliteSqlTestLayerMode` (type) - 1 unsafe example violation(s)
- `src/SqlTest.ts:284` `PgliteSqlTestLayerOptions` (interface) - 1 unsafe example violation(s)
- `src/SqlTest.ts:465` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)
- `src/index.ts:16` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:23` `export * from "./SqlTest.js";` (re-export) - missing @example

### @beep/oip-web

Path: `apps/oip-web`

Export findings:
- `src/app/api/contact/ContactRouteResponse.ts:83` `contactRequestResponseWithSubmit` (const) - 1 unsafe example violation(s)
- `src/contact/index.ts:14` `export * from "./ContactSubmission.model.ts";` (re-export) - missing @example
- `src/contact/index.ts:21` `export * from "./ContactSubmission.service.ts";` (re-export) - missing @example
- `src/content/index.ts:14` `export * from "./OipContent.data.ts";` (re-export) - missing @example
- `src/content/index.ts:21` `export * from "./OipContent.model.ts";` (re-export) - missing @example
- `src/content/index.ts:28` `export * from "./OipContent.runtime.ts";` (re-export) - missing @example
- `src/content/index.ts:35` `export * from "./OipSeo.ts";` (re-export) - missing @example

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

### @beep/canvas

Path: `apps/canvas`

Export findings:
- `src/index.ts:30` `export * from "./App.js";` (re-export) - missing @example
- `src/index.ts:37` `export * from "./commandBridge.js";` (re-export) - missing @example

### @beep/semantic-web

Path: `packages/foundation/capability/semantic-web`

Export findings:
- `src/index.ts:29` `export * from "./iri.ts";` (re-export) - missing @example
- `src/services/canonicalization.ts:48` `CanonicalizationAlgorithm` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-context.ts:44` `JsonLdContextErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-document.ts:46` `JsonLdDocumentErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-parse.ts:231` `JsonLdStreamParseErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/jsonld-stream-serialize.ts:108` `JsonLdStreamSerializeErrorReason` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/provenance.ts:64` `ProvenanceExportProfile` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/shacl-validation.ts:47` `ShaclSeverity` (const) - 1 schema annotation/type-alias gap(s)
- `src/services/sparql-query.ts:42` `SparqlQueryProfile` (const) - 1 schema annotation/type-alias gap(s)

### @beep/utils

Path: `packages/foundation/modeling/utils`

Export findings:
- `src/Errors.ts:163` `mapToError` (function) - missing summary; missing @example, @category, @since
- `src/Errors.ts:166` `mapToError` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:173` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:176` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:179` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:182` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:191` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:209` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:229` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:251` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:275` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:301` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Predicate.ts:302` `chainRefinements` (function) - missing summary; missing @example, @category, @since
- `src/Utils.ts:64` `export * from "effect/Utils";` (re-export) - missing @example
- `src/index.ts:14` `export { dual } from "effect/Function";` (re-export) - missing @example
- `src/index.ts:119` `export * from "./GlobalValue.ts";` (re-export) - missing @example
- `src/index.ts:274` `export * as Utils from "./Utils.ts";` (re-export) - missing @example

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

### @beep/libpff

Path: `packages/drivers/libpff`

Export findings:
- `src/index.ts:14` `export * from "./Libpff.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Libpff.service.ts";` (re-export) - missing @example

### @beep/form

Path: `packages/foundation/ui-system/form`

Export findings:
- `src/core.ts:13` `export * from "./core/index.ts";` (re-export) - missing @example
- `src/core/FormAtoms.ts:305` `make` (const) - 2 schema annotation/type-alias gap(s)
- `src/core/FormBuilder.ts:444` `buildSchema` (const) - 2 schema annotation/type-alias gap(s)
- `src/core/index.ts:7` `export * as Field from "./Field.ts";` (re-export) - missing @example
- `src/core/index.ts:14` `export * as FieldState from "./FieldState.ts";` (re-export) - missing @example
- `src/core/index.ts:21` `export * as FormAtoms from "./FormAtoms.ts";` (re-export) - missing @example
- `src/core/index.ts:28` `export * as FormBuilder from "./FormBuilder.ts";` (re-export) - missing @example
- `src/core/index.ts:35` `export * as Mode from "./Mode.ts";` (re-export) - missing @example
- `src/core/index.ts:42` `export * as Path from "./Path.ts";` (re-export) - missing @example
- `src/core/index.ts:49` `export * as Validation from "./Validation.ts";` (re-export) - missing @example
- `src/index.ts:15` `export * from "./core.ts";` (re-export) - missing @example
- `src/react.ts:13` `export * from "./react/index.ts";` (re-export) - missing @example
- `src/react/index.ts:7` `export * from "../core.ts";` (re-export) - missing @example
- `src/react/index.ts:14` `export * as FormReact from "./FormReact.tsx";` (re-export) - missing @example

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
- `src/Box.config.ts:20` `BoxConfigShape` (class) - missing @example
- `src/Box.config.ts:35` `BoxConfig` (class) - missing @example
- `src/Box.config.ts:43` `layer` (const) - missing @example
- `src/Box.config.ts:62` `layerConfig` (const) - missing @example
- `src/Box.errors.ts:20` `BoxErrorContextInfo` (class) - missing @example
- `src/Box.errors.ts:35` `BoxError` (class) - missing @example
- `src/Box.service.ts:18` `BOX_SERVICE_IMPLEMENTATION_STATUS` (const) - missing @example
- `src/index.ts:14` `VERSION` (const) - missing @example

### @beep/stack-installer

Path: `apps/stack-installer`

Export findings:
- `src/index.ts:30` `export * from "./proof/P1ManualProof.js";` (re-export) - missing @example
- `src/proof/P1ManualProof.ts:9` `export {
  InstallerServerLive as P1ManualProofSliceLayer,
  previewP1ManualProof,
  runP1ManualProof,
} from "@beep/installer-server";` (re-export) - missing @example

### @beep/professional-desktop

Path: `apps/professional-desktop`

Export findings:
- `src/App.tsx:94` `App` (function) - missing summary; missing @example, @category, @since

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

### @beep/acp

Path: `packages/drivers/acp`

Export findings:
- `src/Acp.errors.ts:405` `AcpError` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/capability/nlp`

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
- `src/Core/Vectorization.ts:50` `BM25Norm` (type) - missing @example
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Similarity.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:51` `export * from "./Tokenization.ts";` (re-export) - missing @example
- `src/Core/index.ts:56` `export * from "./Vectorization.ts";` (re-export) - missing @example
- `src/Graph/GraphOperations/Types.ts:123` `ExecutionMetrics` (class) - 1 schema annotation/type-alias gap(s)
- `src/Graph/GraphOperations/Types.ts:522` `OperationCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/Graph/Schema.ts:41` `TextNodeType` (const) - 1 schema annotation/type-alias gap(s)
- `src/Graph/Schema.ts:60` `TextEdgeRelation` (const) - 1 schema annotation/type-alias gap(s)
- `src/Handoff/Contract.ts:54` `ChunkId` (type) - missing @example
- `src/Handoff/Contract.ts:80` `MentionId` (type) - missing @example
- `src/Handoff/Contract.ts:106` `EntityId` (type) - missing @example
- `src/Handoff/Contract.ts:132` `RelationId` (type) - missing @example
- `src/Handoff/Contract.ts:147` `ChunkKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/Ontology/Kind.ts:151` `TypedTextSchema` (const) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:102` `export * as NLPService from "./NLPService.ts";` (re-export) - missing @example

### @beep/installer-use-cases

Path: `packages/installer/use-cases`

Export findings:
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example

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
- `src/Reuse/index.ts:7` `export * from "./Reuse.model.js";` (re-export) - missing @example
- `src/Reuse/index.ts:14` `export * from "./Reuse.service.js";` (re-export) - missing @example
- `src/Reuse/index.ts:21` `export * from "./TokenSimilarity.js";` (re-export) - missing @example
- `src/TSMorph/TSMorph.model.ts:399` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:425` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:696` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:722` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1719` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:271` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/index.ts:150` `export * from "./Reuse/index.js";` (re-export) - missing @example
- `src/index.ts:155` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  findRepoRoot,
} from "./Root.js";` (re-export) - missing @example
- `src/index.ts:166` `export {
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
- `src/index.ts:212` `export {
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
- `src/index.ts:258` `export {
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
- `src/index.ts:334` `export {
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
- `src/index.ts:355` `export * from "./TSMorph/index.js";` (re-export) - missing @example
- `src/index.ts:360` `export {
  /**
   * @category utilities
   * @since 0.0.0
   */
  collectTsConfigPaths,
} from "./TsConfig.js";` (re-export) - missing @example
- `src/index.ts:371` `export * from "./TypeScript/index.js";` (re-export) - missing @example
- `src/index.ts:404` `export {
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
- `src/BigDecimal.ts:33` `BigDecimalFromNumber` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/Color/Color.shared.ts:37` `RgbEncoded` (type) - missing @example
- `src/Color/Color.shared.ts:50` `OklchEncoded` (type) - missing @example
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
- `src/CommonTextSchemas.ts:62` `TrimmedNonEmptyText` (type) - 1 unsafe example violation(s)
- `src/CommonTextSchemas.ts:105` `CommaSeparatedList` (type) - 1 unsafe example violation(s)
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
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:193` `CrossOriginOpenerPolicyHeader` (type) - missing @example
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:133` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts:193` `Header` (type) - missing @example
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
- `src/Csp/Csp.schema.ts:513` `ReportURI` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:578` `CspDirectives` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:857` `ContentSecurityPolicyHeader` (type) - 1 unsafe example violation(s)
- `src/Csp/Csp.schema.ts:783` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:857` `Header` (type) - 1 unsafe example violation(s)
- `src/Csp/Csp.schema.ts:643` `Option` (const) - 1 schema annotation/type-alias gap(s)
- `src/Csp/index.ts:20` `export * from "./Csp.schema.ts";` (re-export) - missing @example
- `src/Csv/Csv.schema.ts:67` `CsvDocument` (type) - 1 unsafe example violation(s)
- `src/Csv/Csv.schema.ts:336` `CsvText` (type) - missing @example
- `src/Csv/Csv.schema.ts:362` `CSV` (type) - 1 unsafe example violation(s)
- `src/Csv/Csv.schema.ts:380` `Schema` (type) - 1 unsafe example violation(s)
- `src/Csv/index.ts:12` `export * from "./Csv.schema.ts";` (re-export) - missing @example
- `src/CsvCodecOptions/index.ts:21` `export * from "./CsvCodecOptions.schema.ts";` (re-export) - missing @example
- `src/CsvError/index.ts:21` `export * from "./CsvError.errors.ts";` (re-export) - missing @example
- `src/CsvFormatter/index.ts:20` `export * from "./CsvFormatter.formatter.ts";` (re-export) - missing @example
- `src/CsvParser/index.ts:20` `export * from "./CsvParser.parser.ts";` (re-export) - missing @example
- `src/Cuid.ts:52` `Cuid` (const) - 1 example import violation(s)
- `src/Cuid.ts:71` `Cuid` (type) - 1 unsafe example violation(s)
- `src/CurrencyCode.ts:51` `CurrencyCode` (type) - 1 unsafe example violation(s)
- `src/DateTimeUtcFromValid/index.ts:12` `export * from "./DateTimeUtcFromValid.schema.ts";` (re-export) - missing @example
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
- `src/EntitySchema/EntitySchema.definition.ts:42` `Definition` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:180` `ColumnNameFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:251` `VariantFieldFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:289` `VariantFieldForInput` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:309` `VariantFieldsFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:329` `EntityClass` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:355` `EntityClass` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:428` `AssignedEntityParts` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.factory.ts:58` `ClassFactory` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.fields.ts:41` `EntityVariantFieldInput` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:358` `PersistDescriptor` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:440` `PersistDescriptorByValueStrategy` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:465` `EntityIdLike` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:517` `PersistDescriptorFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:539` `PersistDescriptorForInput` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:555` `PersistedFor` (type) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:600` `CheckedPersistedFor` (type) - 1 unsafe example violation(s)
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
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:65` `EthereumValidatorPublicKey` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:99` `EthereumValidatorPublicKeyRedacted` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:52` `Schema` (const) - 1 schema annotation/type-alias gap(s)
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:65` `Schema` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:99` `Redacted` (type) - missing @example
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
- `src/FileExtension.ts:117` `ApplicationFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:156` `VideoFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:195` `TextFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:234` `ImageFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:273` `AudioFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:311` `MiscFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:354` `FileExtension` (type) - 1 unsafe example violation(s)
- `src/FileName.ts:129` `FileName` (type) - 1 unsafe example violation(s)
- `src/FilePath/FilePath.guards.ts:49` `HasNullByte` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:87` `SupportedWindowsNamespace` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:124` `UsesPosixSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:161` `UsesWindowsSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:198` `EndsWithSeparator` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:48` `WindowsDriveRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:85` `WindowsUncRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:153` `HasLeafSegment` (type) - missing @example
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
- `src/Float16Array.ts:94` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:145` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:153` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:54` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:102` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:110` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:54` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:102` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:110` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Fn/Fn.schema.ts:185` `FnSchemaNoArg` (interface) - 1 unsafe example violation(s)
- `src/Fn/Fn.schema.ts:215` `FnSchemaUnary` (interface) - 1 unsafe example violation(s)
- `src/Fn/Fn.schema.ts:273` `FnSchemaStatics` (type) - 1 unsafe example violation(s)
- `src/Fn/Fn.schema.ts:470` `AnyFn` (type) - missing @example
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
- `src/Glob/Glob.schema.ts:118` `Glob` (type) - missing @example
- `src/Glob/Glob.schema.ts:149` `Schema` (type) - 1 unsafe example violation(s)
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
- `src/HttpStatus/HttpStatus.schema.ts:100` `Schema` (type) - 1 unsafe example violation(s)
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
- `src/Int.ts:98` `PosInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:137` `PostgresSerialInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:180` `NegInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:223` `NonPositiveInt` (type) - 1 unsafe example violation(s)
- `src/Json.ts:39` `JsonObject` (type) - missing @example
- `src/Json.ts:68` `JsonArray` (type) - missing @example
- `src/Jsonc.ts:91` `JsoncTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonl.ts:103` `JsonlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/KebabStr.ts:54` `KebabCaseStr` (type) - 1 unsafe example violation(s)
- `src/LiteralKit/LiteralKit.schema.ts:722` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/LiteralKit.schema.ts:726` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/index.ts:12` `export * from "./LiteralKit.schema.ts";` (re-export) - missing @example
- `src/LocalDate/LocalDate.schema.ts:679` `LocalDateFromString` (type) - 1 unsafe example violation(s)
- `src/LocalDate/LocalDate.schema.ts:695` `LocalDateFromString` (namespace) - 1 unsafe example violation(s)
- `src/LocalDate/index.ts:12` `export * from "./LocalDate.schema.ts";` (re-export) - missing @example
- `src/Logs.ts:43` `LogLevel` (type) - missing @example
- `src/Logs.ts:74` `LogSeverity` (type) - missing @example
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:342` `MappedLiteralKit` (function) - 1 unsafe example violation(s)
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:311` `MappedLiteralKit` (interface) - 1 unsafe example violation(s)
- `src/MappedLiteralKit/index.ts:12` `export * from "./MappedLiteralKit.schema.ts";` (re-export) - missing @example
- `src/Markdown.ts:139` `Markdown` (type) - missing @example
- `src/Markdown.ts:164` `MarkdownTextToHtml` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/Model/Model.variants.ts:34` `Any` (type) - 1 unsafe example violation(s)
- `src/Model/Model.variants.ts:15` `Class` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `extract` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Field` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldExcept` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldOnly` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `fieldEvolve` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Struct` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Union` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:329` `fields` (const) - 1 example import violation(s)
- `src/Model/index.ts:14` `export * from "./Model.codecs.ts";` (re-export) - missing @example
- `src/Model/index.ts:19` `export * from "./Model.datetime.ts";` (re-export) - missing @example
- `src/Model/index.ts:24` `export * from "./Model.fields.ts";` (re-export) - missing @example
- `src/Model/index.ts:29` `export * from "./Model.sqlite.ts";` (re-export) - missing @example
- `src/Model/index.ts:34` `export * from "./Model.uuid.ts";` (re-export) - missing @example
- `src/Model/index.ts:39` `export * from "./Model.variants.ts";` (re-export) - missing @example
- `src/MutableHashMap.ts:100` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:170` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:118` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:269` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:70` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:135` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:87` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:228` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/NoSniff/NoSniff.schema.ts:194` `NoSniffHeader` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:129` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/NoSniff/NoSniff.schema.ts:194` `Header` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:85` `Option` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:102` `ResponseHeader` (class) - 1 example import violation(s)
- `src/NoSniff/NoSniff.schema.ts:53` `Value` (type) - missing @example
- `src/NoSniff/index.ts:20` `export * from "./NoSniff.schema.ts";` (re-export) - missing @example
- `src/Number.ts:163` `NonNegNum` (type) - 1 unsafe example violation(s)
- `src/Number.ts:213` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/ParserOptions/ParserOptions.schema.ts:82` `HeaderValueInput` (type) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:44` `HeaderArray` (type) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:76` `HeaderTransformFunction` (type) - missing @example
- `src/ParserOptions/index.ts:21` `export * from "./ParserOptions.schema.ts";` (re-export) - missing @example
- `src/PascalStr.ts:54` `PascalCaseStr` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:55` `Percentage` (type) - 1 unsafe example violation(s)
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
- `src/PosixPath.ts:51` `PosixPath` (type) - 1 unsafe example violation(s)
- `src/PosixPath.ts:68` `NativePathToPosixPath` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/RegExp.ts:78` `RegExpStr` (type) - 1 unsafe example violation(s)
- `src/RegExp.ts:130` `RegExpFromStr` (type) - 1 unsafe example violation(s)
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
- `src/Sha256.ts:77` `Sha256Hex` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:120` `Sha256HexFromBytes` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:160` `Sha256HexFromHexBytes` (type) - 1 unsafe example violation(s)
- `src/Slug.ts:96` `Slug` (type) - missing @example
- `src/SnakeStr.ts:54` `SnakeCaseStr` (type) - 1 unsafe example violation(s)
- `src/StatusCauseError.ts:39` `StatusCauseFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/StatusCauseTaggedErrorClass/index.ts:12` `export * from "./StatusCauseTaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/String.ts:49` `NonEmptyTrimmedStr` (type) - 1 unsafe example violation(s)
- `src/String.ts:87` `UUID` (type) - 1 unsafe example violation(s)
- `src/String.ts:154` `OptionFromNullableStr` (type) - missing @example
- `src/TaggedErrorClass/index.ts:12` `export * from "./TaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/Timestamp/Timestamp.schema.ts:66` `ISOStr` (type) - 1 unsafe example violation(s)
- `src/Timestamp/Timestamp.schema.ts:107` `EpochMillis` (type) - 1 unsafe example violation(s)
- `src/Timestamp/Timestamp.schema.ts:126` `ToIsoStr` (const) - 1 schema annotation/type-alias gap(s)
- `src/Timestamp/Timestamp.schema.ts:170` `ToIsoStr` (namespace) - 1 unsafe example violation(s)
- `src/Timestamp/Timestamp.schema.ts:154` `ToIsoString` (type) - 1 unsafe example violation(s)
- `src/Timestamp/index.ts:12` `export * from "./Timestamp.schema.ts";` (re-export) - missing @example
- `src/Toml.ts:95` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
- `src/URL.ts:85` `URLStr` (type) - 1 unsafe example violation(s)
- `src/VariantSchema/VariantSchema.core.ts:609` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/VariantSchema/VariantSchema.overridable.ts:43` `Overridable` (interface) - 1 unsafe example violation(s)
- `src/VariantSchema/VariantSchema.overridable.ts:134` `Overrideable` (interface) - 1 unsafe example violation(s)
- `src/VariantSchema/index.ts:14` `export * from "./VariantSchema.core.ts";` (re-export) - missing @example
- `src/VariantSchema/index.ts:19` `export * from "./VariantSchema.overridable.ts";` (re-export) - missing @example
- `src/Xml.ts:75` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
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
- `src/Yaml.ts:92` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/index.ts:8` `export * from "./Number.ts";` (re-export) - missing @example
- `src/index.ts:29` `export * from "./LiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:34` `export * from "./MappedLiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./AbortSignal.ts";` (re-export) - missing @example
- `src/index.ts:47` `export * from "./ArrayOf.ts";` (re-export) - missing @example
- `src/index.ts:52` `export * from "./BigDecimal.ts";` (re-export) - missing @example
- `src/index.ts:57` `export * from "./BufferEncoding.ts";` (re-export) - missing @example
- `src/index.ts:62` `export * from "./CauseTaggedError/index.ts";` (re-export) - missing @example
- `src/index.ts:67` `export * from "./Color/index.ts";` (re-export) - missing @example
- `src/index.ts:72` `export * from "./CommonTextSchemas.ts";` (re-export) - missing @example
- `src/index.ts:77` `export { CSV, Csv, type CsvDocument, type CsvText, type RowSchemaWithFields } from "./Csv/index.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./DateTimeUtcFromValid/index.ts";` (re-export) - missing @example
- `src/index.ts:87` `export * as DomainModel from "./DomainModel.ts";` (re-export) - missing @example
- `src/index.ts:92` `export {
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
- `src/index.ts:109` `export * from "./EffectSchema.ts";` (re-export) - missing @example
- `src/index.ts:114` `export * from "./Email.ts";` (re-export) - missing @example
- `src/index.ts:119` `export * as EntitySchema from "./EntitySchema/index.ts";` (re-export) - missing @example
- `src/index.ts:124` `export * from "./FileExtension.ts";` (re-export) - missing @example
- `src/index.ts:129` `export * from "./FileName.ts";` (re-export) - missing @example
- `src/index.ts:134` `export * from "./FilePath/index.ts";` (re-export) - missing @example
- `src/index.ts:139` `export * from "./Float16Array.ts";` (re-export) - missing @example
- `src/index.ts:144` `export * from "./Float32Array.ts";` (re-export) - missing @example
- `src/index.ts:149` `export * from "./Float64Array.ts";` (re-export) - missing @example
- `src/index.ts:154` `export * from "./Fn/index.ts";` (re-export) - missing @example
- `src/index.ts:159` `export * from "./Glob/index.ts";` (re-export) - missing @example
- `src/index.ts:164` `export * from "./Graph/index.ts";` (re-export) - missing @example
- `src/index.ts:169` `export * from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:174` `export * from "./Int.ts";` (re-export) - missing @example
- `src/index.ts:179` `export * from "./Json.ts";` (re-export) - missing @example
- `src/index.ts:184` `export * from "./Jsonc.ts";` (re-export) - missing @example
- `src/index.ts:189` `export * from "./Jsonl.ts";` (re-export) - missing @example
- `src/index.ts:194` `export * from "./KebabStr.ts";` (re-export) - missing @example
- `src/index.ts:199` `export * from "./LocalDate/index.ts";` (re-export) - missing @example
- `src/index.ts:204` `export * from "./Logs.ts";` (re-export) - missing @example
- `src/index.ts:209` `export * from "./Markdown.ts";` (re-export) - missing @example
- `src/index.ts:214` `export * from "./MimeType.ts";` (re-export) - missing @example
- `src/index.ts:219` `export * as Model from "./Model/index.ts";` (re-export) - missing @example
- `src/index.ts:224` `export * from "./MutableHashMap.ts";` (re-export) - missing @example
- `src/index.ts:229` `export * from "./MutableHashSet.ts";` (re-export) - missing @example
- `src/index.ts:234` `export * from "./Options.ts";` (re-export) - missing @example
- `src/index.ts:239` `export * from "./PascalStr.ts";` (re-export) - missing @example
- `src/index.ts:244` `export * from "./PosixPath.ts";` (re-export) - missing @example
- `src/index.ts:249` `export * from "./Primitive.ts";` (re-export) - missing @example
- `src/index.ts:254` `export * from "./PromiseSchema.ts";` (re-export) - missing @example
- `src/index.ts:259` `export * from "./Record/index.ts";` (re-export) - missing @example
- `src/index.ts:264` `export * from "./RegExp.ts";` (re-export) - missing @example
- `src/index.ts:269` `export * as SchemaUtils from "./SchemaUtils/index.ts";` (re-export) - missing @example
- `src/index.ts:274` `export * from "./SemanticVersion.ts";` (re-export) - missing @example
- `src/index.ts:279` `export * from "./SeverityLevel.ts";` (re-export) - missing @example
- `src/index.ts:284` `export * from "./Sha256.ts";` (re-export) - missing @example
- `src/index.ts:289` `export * from "./Slug.ts";` (re-export) - missing @example
- `src/index.ts:294` `export * from "./SnakeStr.ts";` (re-export) - missing @example
- `src/index.ts:299` `export * from "./StatusCauseError.ts";` (re-export) - missing @example
- `src/index.ts:304` `export * from "./StatusCauseTaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:309` `export * from "./String.ts";` (re-export) - missing @example
- `src/index.ts:314` `export * from "./TaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:319` `export * from "./Timezone.ts";` (re-export) - missing @example
- `src/index.ts:324` `export * from "./Toml.ts";` (re-export) - missing @example
- `src/index.ts:329` `export * from "./Transformations.ts";` (re-export) - missing @example
- `src/index.ts:334` `export * from "./URL.ts";` (re-export) - missing @example
- `src/index.ts:339` `export * as VariantSchema from "./VariantSchema/index.ts";` (re-export) - missing @example
- `src/index.ts:344` `export * from "./Xml.ts";` (re-export) - missing @example
- `src/index.ts:349` `export * from "./Yaml.ts";` (re-export) - missing @example

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

### @beep/installer-server

Path: `packages/installer/server`

Export findings:
- `src/Layer.ts:368` `makeSecretReferenceServer` (const) - 2 schema annotation/type-alias gap(s)
- `src/Layer.ts:506` `makeDiscordChannelServer` (const) - 2 schema annotation/type-alias gap(s)
- `src/index.ts:30` `export * from "./Layer.js";` (re-export) - missing @example

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
- `src/index.ts:54` `export * from "./CoreConfig.ts";` (re-export) - missing @example
- `src/index.ts:61` `export * from "./HttpError.ts";` (re-export) - missing @example
- `src/index.ts:68` `export * from "./Logging.ts";` (re-export) - missing @example
- `src/index.ts:75` `export * from "./Metric.ts";` (re-export) - missing @example
- `src/index.ts:82` `export * from "./Observed.ts";` (re-export) - missing @example
- `src/index.ts:89` `export * from "./PhaseProfiler.ts";` (re-export) - missing @example
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

### @beep/konva

Path: `packages/drivers/konva`

Export findings:
- `src/index.ts:21` `VERSION` (const) - 1 category casing violation(s)

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
- `src/components/carousel.tsx:25` `CarouselApi` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:25` `ConversationProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:64` `ConversationContentProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:97` `ConversationEmptyStateProps` (type) - 1 unsafe example violation(s)
- `src/components/conversation.tsx:154` `ConversationScrollButtonProps` (type) - 1 unsafe example violation(s)
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
- `src/components/knowledge-graph.tsx:28` `GraphNode` (interface) - 1 unsafe example violation(s)
- `src/components/knowledge-graph.tsx:57` `GraphLink` (interface) - 1 unsafe example violation(s)
- `src/components/knowledge-graph.tsx:101` `KnowledgeGraphHandle` (interface) - 1 unsafe example violation(s)
- `src/components/live-waveform.tsx:23` `LiveWaveformProps` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:34` `NotificationStatus` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:69` `ActionType` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:103` `ActionStyle` (type) - 1 unsafe example violation(s)
- `src/components/notification-card.tsx:165` `NotificationAction` (type) - 1 unsafe example violation(s)
- `src/components/orb.tsx:27` `AgentState` (type) - 1 unsafe example violation(s)
- `src/components/toast.tsx:120` `ToastVariant` (type) - 1 unsafe example violation(s)
- `src/components/toast.tsx:297` `ToastActionElement` (type) - 1 unsafe example violation(s)
- `src/components/toast.tsx:281` `ToastProps` (type) - 1 unsafe example violation(s)
- `src/components/tour.tsx:62` `Step` (interface) - 1 unsafe example violation(s)
- `src/components/tour.tsx:91` `Tour` (interface) - 1 unsafe example violation(s)
- `src/hooks/index.ts:13` `export * from "./use-scribe.ts";` (re-export) - missing @example
- `src/hooks/index.ts:18` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/use-scribe.ts:64` `ScribeStatus` (type) - 1 unsafe example violation(s)
- `src/hooks/useNumberInput.ts:420` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:447` `NumberInputError` (type) - missing @example
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

### @beep/installer-domain

Path: `packages/installer/domain`

Export findings:
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:41` `DiscordChannelKind` (type) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:68` `DiscordChannelStatus` (type) - missing @example
- `src/aggregates/DiscordChannel/index.ts:7` `export * from "./DiscordChannel.model.js";` (re-export) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:40` `HostDependencyKind` (type) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:67` `HostDependencyStatus` (type) - missing @example
- `src/aggregates/HostDependency/index.ts:7` `export * from "./HostDependency.model.js";` (re-export) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:41` `ProviderKind` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:68` `ProviderAuthMode` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:95` `ProviderAccountStatus` (type) - missing @example
- `src/aggregates/ProviderAccount/index.ts:7` `export * from "./ProviderAccount.model.js";` (re-export) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:46` `SecretReferencePurpose` (type) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:73` `SecretReferenceStatus` (type) - missing @example
- `src/aggregates/SecretReference/index.ts:7` `export * from "./SecretReference.model.js";` (re-export) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:41` `StackInstallerPlatform` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:68` `StackInstallerProvider` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:95` `ValidationTier` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:122` `ValidationStatus` (type) - missing @example
- `src/aggregates/StackManifest/index.ts:7` `export * from "./StackManifest.model.js";` (re-export) - missing @example
- `src/aggregates/index.ts:15` `export * as DiscordChannel from "./DiscordChannel/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:22` `export * as HostDependency from "./HostDependency/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:29` `export * as ProviderAccount from "./ProviderAccount/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:36` `export * as SecretReference from "./SecretReference/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:43` `export * as StackManifest from "./StackManifest/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:51` `export * as Values from "./values/index.js";` (re-export) - missing @example

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

### @beep/sanity

Path: `packages/drivers/sanity`

Export findings:
- `src/index.ts:14` `export * from "./Sanity.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Sanity.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Sanity.service.ts";` (re-export) - missing @example
