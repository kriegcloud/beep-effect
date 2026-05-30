# JSDoc Documentation Compliance Inventory

Generated: 2026-05-29T20:28:09.011Z

## Scope

The package universe is the current `bun run topo-sort` output. This inventory checks repo JSDoc rules that package docgen does not fully validate yet: required export tags, summaries, TSDoc grammar, forbidden legacy tags, example import aliases, unsafe examples, root TSDoc custom tag registration, and schema annotation/type-alias gaps.

## Totals

| Metric | Count |
|---|---:|
| packages | 79 |
| cleanPackages | 20 |
| packagesWithoutPublicSrcSurface | 1 |
| packagesNeedingRemediation | 58 |
| publicModules | 1168 |
| publicExports | 7371 |
| openModules | 115 |
| openExports | 3391 |
| missingExportExamples | 3211 |
| missingExportCategories | 65 |
| missingExportSince | 65 |
| forbiddenTagFindings | 7 |
| malformedConditionalTagFindings | 0 |
| exampleImportFindings | 22 |
| unsafeExampleFindings | 66 |
| schemaAnnotationFindings | 153 |
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
| 1 | `@beep/hubspot` | `packages/drivers/hubspot` | needs-remediation | 4 | 19 | 0 | 3 |
| 2 | `@beep/architecture-lab-ui` | `packages/architecture-lab/ui` | needs-remediation | 3 | 7 | 0 | 6 |
| 3 | `@beep/root` | `.` | no-public-src-surface | 0 | 0 | 0 | 0 |
| 4 | `@beep/canvas-domain` | `packages/canvas/domain` | needs-remediation | 8 | 38 | 0 | 37 |
| 5 | `@beep/workspace-tables` | `packages/workspace/tables` | needs-remediation | 7 | 10 | 0 | 2 |
| 6 | `@beep/db-admin` | `packages/_internal/db-admin` | needs-remediation | 4 | 6 | 0 | 6 |
| 7 | `@beep/repo-codegraph` | `packages/tooling/library/repo-codegraph` | needs-remediation | 5 | 40 | 0 | 3 |
| 8 | `@beep/shared-domain` | `packages/shared/domain` | needs-remediation | 36 | 192 | 0 | 13 |
| 9 | `@beep/discord` | `packages/drivers/discord` | needs-remediation | 4 | 12 | 0 | 12 |
| 10 | `@beep/face-detection` | `packages/drivers/face-detection` | needs-remediation | 4 | 27 | 0 | 23 |
| 11 | `@beep/architecture-lab-client` | `packages/architecture-lab/client` | needs-remediation | 3 | 7 | 0 | 6 |
| 12 | `@beep/repo-cli` | `packages/tooling/tool/cli` | needs-remediation | 114 | 686 | 0 | 459 |
| 13 | `@beep/ai-sync` | `packages/tooling/library/ai-sync` | needs-remediation | 10 | 70 | 0 | 4 |
| 14 | `@beep/shared-server` | `packages/shared/server` | clean | 1 | 1 | 0 | 0 |
| 15 | `@beep/law-practice-domain` | `packages/law-practice/domain` | clean | 14 | 25 | 0 | 0 |
| 16 | `@beep/repo-docgen` | `packages/tooling/tool/docgen` | needs-remediation | 8 | 66 | 0 | 21 |
| 17 | `@beep/canvas-server` | `packages/canvas/server` | needs-remediation | 9 | 23 | 0 | 16 |
| 18 | `@beep/agent-capability-use-cases` | `packages/agent-capability/use-cases` | needs-remediation | 12 | 41 | 0 | 9 |
| 19 | `@beep/ai-provider-cli` | `packages/drivers/ai-provider-cli` | needs-remediation | 4 | 12 | 0 | 12 |
| 20 | `@beep/colors` | `packages/foundation/capability/colors` | clean | 1 | 9 | 0 | 0 |
| 21 | `@beep/shared-config` | `packages/shared/config` | clean | 1 | 1 | 0 | 0 |
| 22 | `@beep/chalk` | `packages/foundation/capability/chalk` | clean | 1 | 35 | 0 | 0 |
| 23 | `@beep/sandbox` | `packages/foundation/capability/sandbox` | needs-remediation | 29 | 290 | 0 | 248 |
| 24 | `@beep/phoenix` | `packages/drivers/phoenix` | needs-remediation | 5 | 50 | 0 | 10 |
| 25 | `@beep/shared-use-cases` | `packages/shared/use-cases` | clean | 1 | 1 | 0 | 0 |
| 26 | `@beep/canvas-use-cases` | `packages/canvas/use-cases` | needs-remediation | 10 | 35 | 0 | 26 |
| 27 | `@beep/test-utils` | `packages/tooling/test-kit/test-utils` | needs-remediation | 3 | 23 | 0 | 7 |
| 28 | `@beep/types` | `packages/foundation/primitive/types` | clean | 5 | 10 | 0 | 0 |
| 29 | `@beep/oip-web` | `apps/oip-web` | needs-remediation | 28 | 66 | 0 | 7 |
| 30 | `@beep/agent-capability-domain` | `packages/agent-capability/domain` | clean | 7 | 11 | 0 | 0 |
| 31 | `@beep/shared-tables` | `packages/shared/tables` | needs-remediation | 11 | 14 | 0 | 11 |
| 32 | `@beep/md` | `packages/foundation/capability/md` | clean | 5 | 131 | 0 | 0 |
| 33 | `@beep/canvas` | `apps/canvas` | needs-remediation | 3 | 25 | 0 | 2 |
| 34 | `@beep/workspace-domain` | `packages/workspace/domain` | clean | 21 | 40 | 0 | 0 |
| 35 | `@beep/semantic-web` | `packages/foundation/capability/semantic-web` | needs-remediation | 29 | 256 | 0 | 9 |
| 36 | `@beep/utils` | `packages/foundation/modeling/utils` | needs-remediation | 23 | 175 | 0 | 18 |
| 37 | `@beep/repo-ai-metrics` | `packages/tooling/library/ai-metrics` | needs-remediation | 17 | 250 | 0 | 4 |
| 38 | `@beep/architecture-lab-tables` | `packages/architecture-lab/tables` | needs-remediation | 7 | 21 | 0 | 20 |
| 39 | `@beep/venice-ai` | `packages/drivers/venice-ai` | clean | 3 | 35 | 0 | 0 |
| 40 | `@beep/form` | `packages/foundation/ui-system/form` | needs-remediation | 15 | 84 | 0 | 14 |
| 41 | `@beep/identity` | `packages/foundation/modeling/identity` | needs-remediation | 3 | 109 | 0 | 18 |
| 42 | `@beep/drizzle` | `packages/drivers/drizzle` | needs-remediation | 4 | 15 | 0 | 3 |
| 43 | `@beep/openai-compat` | `packages/drivers/openai-compat` | clean | 4 | 50 | 0 | 0 |
| 44 | `@beep/stack-installer` | `apps/stack-installer` | needs-remediation | 6 | 20 | 0 | 20 |
| 45 | `@beep/professional-desktop` | `apps/professional-desktop` | needs-remediation | 2 | 2 | 0 | 1 |
| 46 | `@beep/epistemic-domain` | `packages/epistemic/domain` | clean | 13 | 21 | 0 | 0 |
| 47 | `@beep/architecture-lab-use-cases` | `packages/architecture-lab/use-cases` | needs-remediation | 18 | 62 | 0 | 61 |
| 48 | `@beep/professional-runtime-proof` | `apps/professional-runtime-proof` | clean | 1 | 4 | 0 | 0 |
| 49 | `@beep/acp` | `packages/drivers/acp` | needs-remediation | 10 | 406 | 0 | 1 |
| 50 | `@beep/nlp` | `packages/foundation/capability/nlp` | needs-remediation | 49 | 278 | 0 | 31 |
| 51 | `@beep/infra` | `infra` | clean | 3 | 21 | 0 | 0 |
| 52 | `@beep/installer-use-cases` | `packages/installer/use-cases` | needs-remediation | 3 | 30 | 0 | 30 |
| 53 | `@beep/runpod` | `packages/drivers/runpod` | needs-remediation | 6 | 174 | 0 | 174 |
| 54 | `@beep/repo-utils` | `packages/tooling/library/repo-utils` | needs-remediation | 64 | 654 | 2 | 76 |
| 55 | `@beep/schema` | `packages/foundation/modeling/schema` | needs-remediation | 223 | 1469 | 3 | 1221 |
| 56 | `@beep/codedank-web` | `apps/codedank-web` | needs-remediation | 5 | 6 | 0 | 5 |
| 57 | `@beep/onepassword-cli` | `packages/drivers/onepassword-cli` | needs-remediation | 4 | 12 | 0 | 12 |
| 58 | `@beep/architecture-lab-config` | `packages/architecture-lab/config` | needs-remediation | 9 | 21 | 0 | 19 |
| 59 | `@beep/data` | `packages/foundation/primitive/data` | clean | 7 | 39 | 0 | 0 |
| 60 | `@beep/xai` | `packages/drivers/xai` | clean | 7 | 62 | 0 | 0 |
| 61 | `@beep/wealth-management-domain` | `packages/wealth-management/domain` | clean | 14 | 25 | 0 | 0 |
| 62 | `@beep/architecture-lab-server` | `packages/architecture-lab/server` | needs-remediation | 13 | 34 | 0 | 33 |
| 63 | `@beep/duckdb` | `packages/drivers/duckdb` | needs-remediation | 4 | 15 | 0 | 3 |
| 64 | `@beep/ffmpeg` | `packages/drivers/ffmpeg` | needs-remediation | 4 | 38 | 0 | 6 |
| 65 | `@beep/architecture-lab-proof` | `apps/architecture-lab-proof` | needs-remediation | 1 | 3 | 0 | 2 |
| 66 | `@beep/installer-server` | `packages/installer/server` | needs-remediation | 3 | 19 | 0 | 19 |
| 67 | `@beep/observability` | `packages/foundation/capability/observability` | needs-remediation | 23 | 134 | 3 | 30 |
| 68 | `@beep/konva` | `packages/drivers/konva` | needs-remediation | 1 | 1 | 0 | 1 |
| 69 | `@beep/shared-client` | `packages/shared/client` | clean | 1 | 1 | 0 | 0 |
| 70 | `@beep/ui` | `packages/foundation/ui-system/ui` | needs-remediation | 118 | 501 | 107 | 497 |
| 71 | `@beep/repo-configs` | `packages/tooling/policy-pack/repo-configs` | needs-remediation | 24 | 130 | 0 | 5 |
| 72 | `@beep/canvas-client` | `packages/canvas/client` | needs-remediation | 1 | 1 | 0 | 1 |
| 73 | `@beep/postgres` | `packages/drivers/postgres` | needs-remediation | 7 | 36 | 0 | 6 |
| 74 | `@beep/installer-domain` | `packages/installer/domain` | needs-remediation | 12 | 52 | 0 | 52 |
| 75 | `@beep/architecture-lab-domain` | `packages/architecture-lab/domain` | needs-remediation | 15 | 52 | 0 | 51 |
| 76 | `@beep/canvas-ui` | `packages/canvas/ui` | needs-remediation | 1 | 1 | 0 | 1 |
| 77 | `@beep/messages` | `packages/foundation/modeling/messages` | needs-remediation | 2 | 6 | 0 | 1 |
| 78 | `@beep/sanity` | `packages/drivers/sanity` | needs-remediation | 4 | 16 | 0 | 3 |
| 79 | `@beep/shared-ui` | `packages/shared/ui` | clean | 4 | 7 | 0 | 0 |

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
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.view-model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:27` `WorkItemVisibleAction` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:40` `WorkItemVisibleAction` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:48` `WorkItemSummaryViewModel` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.view-model.ts:87` `toWorkItemSummaryViewModel` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/canvas-domain

Path: `packages/canvas/domain`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:22` `CanvasProjectAlreadyArchived` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:41` `CanvasProjectInvalidTransition` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:80` `CanvasNodeAlreadyExists` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:98` `CanvasNodeNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:116` `CanvasProjectDomainError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:128` `CanvasProjectDomainError` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:37` `CanvasNode` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:56` `CanvasProject` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:79` `CanvasProject` (type) - missing summary; missing @example, @category, @since
- `src/aggregates/CanvasProject/CanvasProject.model.ts:87` `CreateCanvasProjectInput` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:110` `create` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:138` `addNode` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:161` `removeNode` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:184` `archive` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.model.ts:198` `reopen` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:21` `CanvasProjectId` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:36` `CanvasProjectId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:44` `CanvasProjectTitle` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:58` `CanvasProjectTitle` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:66` `CanvasProjectStatus` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:79` `CanvasProjectStatus` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:87` `CanvasNodeId` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:102` `CanvasNodeId` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:110` `CanvasNodeKind` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:123` `CanvasNodeKind` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:131` `CanvasNodeLabel` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.values.ts:145` `CanvasNodeLabel` (type) - missing @example
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.errors.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.model.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.values.js";` (re-export) - missing @example
- `src/aggregates/index.ts:13` `export * as CanvasProject from "./CanvasProject/index.js";` (re-export) - missing @example
- `src/identity/Canvas.ts:21` `CanvasOperatorId` (const) - missing @example
- `src/identity/Canvas.ts:31` `CanvasOperatorId` (type) - missing @example
- `src/identity/index.ts:15` `export * as Canvas from "./Canvas.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Identity from "./identity/index.js";` (re-export) - missing @example

### @beep/workspace-tables

Path: `packages/workspace/tables`

Export findings:
- `src/index.ts:28` `export { DbSchema } from "./Schema.ts";` (re-export) - missing @example
- `src/Schema.ts:39` `DbSchema` (type) - missing @example

### @beep/db-admin

Path: `packages/_internal/db-admin`

Export findings:
- `src/index.ts:14` `export * from "./targets.js";` (re-export) - missing @example
- `src/migrations/ArchitectureLab.ts:23` `DbAdminMigrationTarget` (class) - missing @example
- `src/migrations/ArchitectureLab.ts:42` `ArchitectureLabMigrationTarget` (const) - missing @example
- `src/schema.ts:9` `export * from "@beep/architecture-lab-tables/tables";` (re-export) - missing @example
- `src/targets.ts:27` `DbAdminMigrationTargets` (const) - missing @example
- `src/targets.ts:35` `listDbAdminMigrationTargets` (const) - missing @example

### @beep/repo-codegraph

Path: `packages/tooling/library/repo-codegraph`

Export findings:
- `src/RepoCodegraphLookup.ts:56` `FromPackageResolution` (class) - missing @example
- `src/RepoCodegraphLookup.ts:72` `LookupOptions` (class) - missing @example
- `src/RepoCodegraphLookup.ts:88` `NormalizedPathLikeSelector` (class) - missing @example

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
- `src/values/OnePasswordReference/index.ts:9` `export * from "./OnePasswordReference.model.ts";` (re-export) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:35` `OnePasswordReference` (const) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:50` `OnePasswordReference` (type) - missing @example
- `src/values/OnePasswordReference/OnePasswordReference.model.ts:58` `isOnePasswordReference` (const) - missing @example

### @beep/discord

Path: `packages/drivers/discord`

Export findings:
- `src/Discord.errors.ts:20` `DiscordErrorReason` (const) - missing @example
- `src/Discord.errors.ts:32` `DiscordErrorReason` (type) - missing @example
- `src/Discord.errors.ts:40` `DiscordError` (class) - missing @example
- `src/Discord.models.ts:19` `DiscordConfigInput` (class) - missing @example
- `src/Discord.models.ts:34` `DiscordChannelRequest` (class) - missing @example
- `src/Discord.models.ts:49` `DiscordCreateMessageRequest` (class) - missing @example
- `src/Discord.models.ts:65` `DiscordChannelProof` (class) - missing @example
- `src/Discord.models.ts:83` `DiscordMessageProof` (class) - missing @example
- `src/Discord.service.ts:196` `Discord` (class) - missing @example
- `src/index.ts:14` `export * from "./Discord.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Discord.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Discord.service.ts";` (re-export) - missing @example

### @beep/face-detection

Path: `packages/drivers/face-detection`

Export findings:
- `src/FaceDetection.models.ts:20` `PositivePixelDimension` (const) - missing @example
- `src/FaceDetection.models.ts:39` `PositivePixelDimension` (type) - missing @example
- `src/FaceDetection.models.ts:47` `FaceDetectionConfidence` (const) - missing @example
- `src/FaceDetection.models.ts:81` `FaceDetectionConfidence` (type) - missing @example
- `src/FaceDetection.models.ts:89` `FaceDetectionPercentage` (const) - missing @example
- `src/FaceDetection.models.ts:123` `FaceDetectionPercentage` (type) - missing @example
- `src/FaceDetection.models.ts:131` `FaceDetectionTopK` (const) - missing @example
- `src/FaceDetection.models.ts:150` `FaceDetectionTopK` (type) - missing @example
- `src/FaceDetection.models.ts:213` `FaceDetectionPoint` (class) - missing @example
- `src/FaceDetection.models.ts:229` `FaceDetectionBox` (class) - missing @example
- `src/FaceDetection.models.ts:247` `FaceDetectionLandmarks` (class) - missing @example
- `src/FaceDetection.models.ts:266` `FaceDetection` (class) - missing @example
- `src/FaceDetection.models.ts:283` `FaceDetectionResult` (class) - missing @example
- `src/FaceDetection.models.ts:301` `decodeFaceDetectionModelConfig` (const) - missing @example
- `src/FaceDetection.models.ts:309` `decodeFaceDetectionImageRequest` (const) - missing @example
- `src/FaceDetection.service.ts:85` `LoadedFaceDetector` (interface) - missing @example
- `src/FaceDetection.service.ts:95` `FaceDetectionServiceShape` (interface) - missing @example
- `src/FaceDetection.service.ts:108` `FaceDetectionService` (class) - missing @example
- `src/FaceDetection.service.ts:586` `makeFaceDetectionService` (const) - missing @example
- `src/FaceDetection.service.ts:615` `withDetector` (const) - missing @example
- `src/index.ts:14` `export * from "./FaceDetection.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./FaceDetection.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./FaceDetection.service.ts";` (re-export) - missing @example

### @beep/architecture-lab-client

Path: `packages/architecture-lab/client`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.client.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:23` `WorkItemClientTransport` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:53` `WorkItemClientShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:61` `WorkItemClient` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.client.ts:69` `makeWorkItemClient` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example

### @beep/repo-cli

Path: `packages/tooling/tool/cli`

Export findings:
- `src/commands/AgentEffectiveness/index.ts:14` `export * from "./AgentEffectiveness.command.js";` (re-export) - missing @example
- `src/commands/AIMetrics/index.ts:13` `export * from "./AIMetrics.command.js";` (re-export) - missing @example
- `src/commands/AIMetrics/index.ts:20` `export * from "./AIMetrics.errors.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:7` `export * from "./Architecture.command.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:14` `export * from "./OperationPlan.js";` (re-export) - missing @example
- `src/commands/Architecture/index.ts:21` `export * from "./OperationPlanExecution.js";` (re-export) - missing @example
- `src/commands/Architecture/OperationPlan.ts:27` `ArchitectureDomainKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:39` `ArchitectureDomainKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:47` `ArchitecturePlanStage` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:59` `ArchitecturePlanStage` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:67` `ArchitectureSliceRole` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:89` `ArchitectureSliceRole` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:178` `ArchitectureWriterKind` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:190` `ArchitectureWriterKind` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:386` `ArchitectureSliceRolePlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:404` `ArchitecturePlanTarget` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:423` `WriteFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:493` `EnsureFileOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:515` `EnsureAbsentPathOperation` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:536` `ArchitectureOperation` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/commands/Architecture/OperationPlan.ts:549` `ArchitectureOperation` (type) - missing @example
- `src/commands/Architecture/OperationPlan.ts:587` `CanonicalSliceOperationPlan` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:624` `OperationPlanCheckResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:645` `OperationPlanApplyResult` (class) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2364` `makeCanonicalSliceOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2409` `makeArchitectureOperationPlan` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2515` `encodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlan.ts:2523` `decodeCanonicalSliceOperationPlanJson` (const) - missing @example
- `src/commands/Architecture/OperationPlanPackageJson.ts:64` `renderPackageJsonOperation` (const) - missing @example
- `src/commands/Ci/index.ts:13` `export * from "./Ci.command.js";` (re-export) - missing @example
- `src/commands/Ci/index.ts:20` `export * from "./Ci.errors.js";` (re-export) - missing @example
- `src/commands/Codegen/index.ts:14` `export * from "./Codegen.command.js";` (re-export) - missing @example
- `src/commands/Codex/index.ts:13` `export * from "./Codex.command.js";` (re-export) - missing @example
- `src/commands/Codex/index.ts:20` `export * from "./Codex.errors.js";` (re-export) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:39` `ConfigUpdateResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:56` `ConfigUpdateTarget` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:74` `ConfigUpdateTargetResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:97` `ConfigUpdateBatchResult` (class) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:298` `updateTsconfigPackages` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:339` `updateTsconfigPaths` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:393` `updateTstycheConfig` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:503` `updateRootConfigsForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:543` `checkConfigNeedsUpdateForTargets` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:585` `updateRootConfigs` (const) - missing @example
- `src/commands/CreatePackage/ConfigUpdater.ts:613` `checkConfigNeedsUpdate` (const) - missing @example
- `src/commands/CreatePackage/CreatePackage.command.ts:16` `createPackageCommand` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:82` `PlannedFile` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:98` `PlannedSymlink` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:114` `FileGenerationPlanInput` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:132` `GenerationActionKind` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:143` `GenerationActionKind` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:184` `GenerationAction` (const) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:209` `GenerationAction` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:217` `FileGenerationPlan` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:233` `FileGenerationExecutionResult` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:254` `FileGenerationPlanServiceShape` (type) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:268` `FileGenerationPlanService` (class) - missing @example
- `src/commands/CreatePackage/FileGenerationPlanService.ts:466` `createFileGenerationPlanService` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:77` `resolveCreatePackageTemplateDir` (const) - missing @example
- `src/commands/CreatePackage/Handler.ts:278` `TemplateContext` (class) - missing @example
- `src/commands/CreatePackage/Handler.ts:561` `createPackageCommand` (const) - missing @example
- `src/commands/CreatePackage/index.ts:14` `export * from "./CreatePackage.command.js";` (re-export) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:24` `TemplateSpec` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:40` `RenderedTemplate` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:56` `TemplateRenderRequest` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:76` `TemplateServiceShape` (type) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:88` `TemplateService` (class) - missing @example
- `src/commands/CreatePackage/TemplateService.ts:124` `createTemplateService` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:23` `TsMorphMutationKind` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:39` `TsMorphMutationKind` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:114` `TsMorphMutation` (const) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:134` `TsMorphMutation` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:184` `TsMorphMutationOutcome` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:192` `TsMorphIntegrationResult` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:210` `TsMorphMutationAdapter` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:220` `TsMorphIntegrationServiceShape` (type) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:233` `TsMorphIntegrationService` (class) - missing @example
- `src/commands/CreatePackage/TsMorphIntegrationService.ts:257` `createTsMorphIntegrationService` (const) - missing @example
- `src/commands/Docgen/Docgen.command.ts:1088` `docgenCommand` (const) - missing @example
- `src/commands/Docgen/index.ts:14` `export * from "./Docgen.command.js";` (re-export) - missing @example
- `src/commands/Docgen/internal/Operations.ts:101` `DocgenPackageStatus` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:116` `DocgenPackageStatus` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:130` `DocgenConfigDocument` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:159` `DocgenWorkspacePackage` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:180` `DocgenIssuePriority` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:191` `DocgenIssuePriority` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:199` `DocgenExportKind` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:220` `DocgenExportKind` (type) - missing @example
- `src/commands/Docgen/internal/Operations.ts:228` `DocgenExportAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:254` `DocgenAnalysisSummary` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:275` `DocgenPackageAnalysis` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:294` `DocgenGenerationResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:314` `DocgenAggregateResult` (class) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1095` `normalizeDocsOutputPath` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1106` `loadDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1128` `createDocgenConfigDocument` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1171` `discoverDocgenWorkspacePackages` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1213` `resolveDocgenWorkspacePackage` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1265` `analyzePackageDocumentation` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1306` `generateAnalysisReport` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1427` `generateAnalysisJson` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1437` `aggregateGeneratedDocs` (const) - missing @example
- `src/commands/Docgen/internal/Operations.ts:1582` `runDocgenForPackage` (const) - missing @example
- `src/commands/Docs/index.ts:14` `export * from "./Docs.command.js";` (re-export) - missing @example
- `src/commands/Files/Files.command.ts:437` `filesCommand` (const) - missing @example
- `src/commands/Files/Files.errors.ts:72` `formatPlatformError` (const) - missing @example
- `src/commands/Files/Files.errors.ts:92` `failOnExtensionlessFile` (const) - missing @example
- `src/commands/Files/Files.media.ts:277` `isImageFileExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:285` `isVideoFileExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:293` `isSupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:301` `bySizeDescendingThenNameAscending` (const) - missing @example
- `src/commands/Files/Files.media.ts:312` `byNameAscending` (const) - missing @example
- `src/commands/Files/Files.media.ts:325` `normalizeBareExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:335` `mediaKindFromExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:358` `formatIndex` (const) - missing @example
- `src/commands/Files/Files.media.ts:371` `collectText` (const) - missing @example
- `src/commands/Files/Files.media.ts:389` `isExifOrientationRotated` (const) - missing @example
- `src/commands/Files/Files.media.ts:399` `isQuarterTurnRotation` (const) - missing @example
- `src/commands/Files/Files.media.ts:413` `maybeSwapDimensions` (const) - missing @example
- `src/commands/Files/Files.media.ts:435` `rotationFromStream` (const) - missing @example
- `src/commands/Files/Files.media.ts:456` `targetNameForEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:480` `hasSkippedFiles` (const) - missing @example
- `src/commands/Files/Files.media.ts:490` `selectedCanonicalPathSet` (const) - missing @example
- `src/commands/Files/Files.media.ts:506` `renderPlanEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:516` `renderStripMetadataPlanEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:527` `renderCreateCaptionFilesPlanEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:538` `renderCreateCaptionFilesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:549` `renderNormalizePlanEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:560` `renderNormalizeSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:571` `normalizeOutputExtension` (const) - missing @example
- `src/commands/Files/Files.media.ts:581` `sharpFormatForNormalize` (const) - missing @example
- `src/commands/Files/Files.media.ts:593` `normalizeOutputDimensions` (const) - missing @example
- `src/commands/Files/Files.media.ts:622` `mediaDimensionsChanged` (const) - missing @example
- `src/commands/Files/Files.media.ts:638` `roundCandidateMetric` (const) - missing @example
- `src/commands/Files/Files.media.ts:649` `assessImageCandidate` (const) - missing @example
- `src/commands/Files/Files.media.ts:694` `renderArchivePoorCandidatesEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:711` `renderArchivePoorCandidatesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:722` `rgbToHex` (const) - missing @example
- `src/commands/Files/Files.media.ts:733` `classifyBorderSides` (const) - missing @example
- `src/commands/Files/Files.media.ts:779` `analyzeSolidBorders` (const) - missing @example
- `src/commands/Files/Files.media.ts:799` `renderDetectBordersEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:818` `renderDetectBordersSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:829` `renderDetectFacesEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:852` `renderDetectFacesSkippedEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:872` `cropBordersPlanEntryFromDetection` (const) - missing @example
- `src/commands/Files/Files.media.ts:910` `renderCropBordersPlanEntry` (const) - missing @example
- `src/commands/Files/Files.media.ts:923` `makeStripMetadataTempEntries` (const) - missing @example
- `src/commands/Files/Files.media.ts:950` `isSupportedMetadataImageFile` (const) - missing @example
- `src/commands/Files/Files.progress.ts:23` `FilesConcurrency` (const) - missing @example
- `src/commands/Files/Files.progress.ts:73` `isFilesProgressEnabled` (const) - missing @example
- `src/commands/Files/Files.progress.ts:83` `renderFilesProgressBar` (const) - missing @example
- `src/commands/Files/Files.progress.ts:104` `runFilesProgressAll` (const) - missing @example
- `src/commands/Files/Files.progress.ts:172` `runFilesProgressForEach` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:25` `PositiveMediaDimension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:53` `PositiveMediaDimension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:61` `FileSha256Hash` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:80` `FileSha256Hash` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:88` `NonNegativePixelOffset` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:116` `NonNegativePixelOffset` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:124` `MediaKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:136` `MediaKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:144` `SupportedMetadataImageExtension` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:156` `SupportedMetadataImageExtension` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:164` `NormalizeImageFormatInput` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:176` `NormalizeImageFormatInput` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:184` `NormalizeImageFormat` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:196` `NormalizeImageFormat` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:204` `NormalizeSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:224` `NormalizeSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:232` `CreateCaptionFilesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:253` `CreateCaptionFilesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:261` `BorderSide` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:273` `BorderSide` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:281` `BorderDetectionKind` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:293` `BorderDetectionKind` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:301` `DetectBordersSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:321` `DetectBordersSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:329` `DetectFacesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:350` `DetectFacesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:358` `DetectFacesFlag` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:376` `DetectFacesFlag` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:384` `CandidateAssessmentProfile` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:396` `CandidateAssessmentProfile` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:404` `CandidateAssessmentDecision` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:416` `CandidateAssessmentDecision` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:424` `CandidateAssessmentReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:440` `CandidateAssessmentReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:448` `ArchivePoorCandidatesSkippedReason` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:468` `ArchivePoorCandidatesSkippedReason` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:476` `CandidateRatioThreshold` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:495` `CandidateRatioThreshold` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:503` `BorderDetectionPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:537` `BorderDetectionPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:545` `BorderDetectionMaxScanPercentage` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:579` `BorderDetectionMaxScanPercentage` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:587` `BorderDetectionTolerance` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:621` `BorderDetectionTolerance` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:629` `RgbChannel` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:663` `RgbChannel` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:671` `ImageSizeMetadata` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:688` `FfprobeSideData` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:703` `FfprobeStream` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:721` `FfprobeOutput` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:736` `SafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:782` `SafeFilePrefix` (type) - missing @example
- `src/commands/Files/Files.schemas.ts:823` `RenamePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:848` `SortAndRenameSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:900` `StripMetadataSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:944` `CreateCaptionFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:962` `CreateCaptionFilesPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:984` `CreateCaptionFilesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1006` `CreateCaptionFilesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1025` `CreateCaptionFilesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1045` `NormalizeFilesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1070` `NormalizeManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1089` `NormalizePlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1117` `NormalizeSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1141` `NormalizePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1162` `NormalizeSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1191` `NormalizeManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1211` `NormalizeManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1233` `ArchivePoorCandidatesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1260` `ArchivePoorCandidatesManifestOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1283` `CandidateAssessmentMetrics` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1301` `ArchivedSidecarEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1320` `ArchivePoorCandidatesEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1347` `ArchivePoorCandidatesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1368` `ArchivePoorCandidatesPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1388` `ArchivePoorCandidatesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1414` `ArchivePoorCandidatesManifestSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1435` `ArchivePoorCandidatesManifest` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1459` `DetectBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1479` `DetectFacesOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1501` `DetectFacesReportOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1522` `CropBordersOptions` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1542` `RgbColor` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1559` `DetectBorderSideMeasurement` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1580` `DetectBordersEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1603` `DetectBordersSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1622` `DetectBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1641` `DetectBordersReport` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1661` `DetectFacesEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1689` `DetectFacesSkippedEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1708` `DetectFacesSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1730` `DetectFacesReport` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1752` `CropBordersPlanEntry` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1778` `CropBordersPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1797` `CropBordersSummary` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1818` `SortableFileCollection` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1834` `RenamePlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1850` `StripMetadataPlan` (class) - missing @example
- `src/commands/Files/Files.schemas.ts:1868` `decodeImageSizeMetadata` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1876` `decodeFfprobeOutputJson` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1884` `decodeRotationNumber` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/commands/Files/Files.schemas.ts:1892` `decodeSafeFilePrefix` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1900` `decodeNormalizeMaxLongEdge` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1908` `decodeArchivePoorCandidatesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1916` `decodeCreateCaptionFilesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1924` `decodeDetectBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1931` `decodeDetectFacesOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1939` `decodeCropBordersOptions` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1947` `encodeNormalizeManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1955` `encodeArchivePoorCandidatesManifest` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1963` `encodeDetectBordersReport` (const) - missing @example
- `src/commands/Files/Files.schemas.ts:1970` `encodeDetectFacesReport` (const) - missing @example
- `src/commands/Files/Files.service.ts:253` `FilesCommandServiceShape` (interface) - missing @example
- `src/commands/Files/Files.service.ts:326` `FilesCommandService` (class) - missing @example
- `src/commands/Files/Files.service.ts:3708` `printFilesIndex` (const) - missing @example
- `src/commands/Files/Files.service.ts:4467` `FilesCommandServiceLive` (const) - missing @example
- `src/commands/Files/Files.service.ts:4478` `archivePoorCandidates` (const) - missing @example
- `src/commands/Files/Files.service.ts:4493` `createCaptionFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4508` `cropBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4523` `detectBordersFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4538` `detectFacesFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4553` `normalizeFiles` (const) - missing @example
- `src/commands/Files/Files.service.ts:4571` `sortAndRenameFiles` (const) - missing @example
- `src/commands/Files/index.ts:15` `export * from "./Files.command.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:22` `export * from "./Files.errors.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:29` `export * from "./Files.media.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:36` `export * from "./Files.progress.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:43` `export * from "./Files.schemas.js";` (re-export) - missing @example
- `src/commands/Files/index.ts:50` `export * from "./Files.service.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:13` `export * from "./Graphiti.command.js";` (re-export) - missing @example
- `src/commands/Graphiti/index.ts:20` `export * from "./Graphiti.errors.js";` (re-export) - missing @example
- `src/commands/Graphiti/internal/ProxyOps.ts:26` `export { GraphitiProxyOpsError } from "../Graphiti.errors.js";` (re-export) - missing @example
- `src/commands/Graphiti/internal/ProxyServices.ts:55` `ContainerHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Graphiti/internal/ProxyServices.ts:71` `DependencyHealthState` (const) - 1 schema annotation/type-alias gap(s)
- `src/commands/Image/Image.progress.ts:24` `renderExtractFramesEvent` (const) - missing @example
- `src/commands/Image/Image.progress.ts:53` `makeExtractFramesEvents` (const) - missing @example
- `src/commands/Image/Image.render.ts:33` `renderProgressBar` (const) - missing @example
- `src/commands/Image/Image.render.ts:52` `renderCompletedProgress` (const) - missing @example
- `src/commands/Image/Image.render.ts:69` `renderInitialProgress` (const) - missing @example
- `src/commands/Image/Image.render.ts:80` `renderExtractFramesSummary` (const) - missing @example
- `src/commands/Image/Image.render.ts:91` `renderExtractFramesCommandSummary` (const) - missing @example
- `src/commands/Image/Image.render.ts:102` `renderExtractFramesDirSuccess` (const) - missing @example
- `src/commands/Image/Image.render.ts:113` `renderExtractFramesDirFailure` (const) - missing @example
- `src/commands/Image/Image.render.ts:124` `renderExtractFramesDirOutcome` (const) - missing @example
- `src/commands/Image/Image.render.ts:139` `renderExtractFramesDirSummary` (const) - missing @example
- `src/commands/Image/Image.render.ts:150` `renderExtractFramesDirError` (const) - missing @example
- `src/commands/Image/Image.schemas.ts:200` `ExtractFramesDirOutcome` (const) - missing @example
- `src/commands/Image/Image.schemas.ts:212` `ExtractFramesDirOutcome` (type) - missing @example
- `src/commands/Image/Image.schemas.ts:250` `decodeExtractFramesOptions` (const) - missing @example
- `src/commands/Image/Image.schemas.ts:258` `decodeExtractFramesDirOptions` (const) - missing @example
- `src/commands/Image/Image.service.ts:48` `ImageCommandServiceShape` (interface) - missing @example
- `src/commands/Image/Image.service.ts:74` `ImageCommandService` (class) - missing @example
- `src/commands/Image/Image.service.ts:285` `ImageCommandServiceLive` (const) - missing @example
- `src/commands/Image/Image.service.ts:296` `extractFrames` (const) - missing @example
- `src/commands/Image/Image.service.ts:311` `extractFramesDir` (const) - missing @example
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
- `src/commands/Quality/index.ts:13` `export { qualityCommand } from "./Quality.command.js";` (re-export) - missing @example
- `src/commands/Quality/index.ts:20` `export * from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/internal/Config.ts:22` `configStringOptionSync` (const) - missing @example
- `src/commands/Quality/internal/Config.ts:35` `configStringEqualsSync` (const) - missing @example
- `src/commands/Quality/internal/Config.ts:54` `configStringOption` (const) - missing @example
- `src/commands/Quality/Quality.command.ts:36` `export { QualityScriptCommandError } from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/Tasks.ts:34` `export {
  QualityTaskConfigurationError,
  QualityTaskFailed,
  QualityTaskGroupFailed,
  UnexpectedQualityTaskFailure,
} from "./Quality.errors.js";` (re-export) - missing @example
- `src/commands/Quality/Tasks.ts:780` `sqlIntegrationStepForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:794` `runSqlIntegrationTestLaneForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:803` `sqlIntegrationConnectionUriFromEnvForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:974` `rootQualityStepsForTesting` (const) - missing @example
- `src/commands/Quality/Tasks.ts:1195` `runQualityTaskStepGroupForTesting` (const) - missing @example
- `src/commands/Reuse/index.ts:13` `export {
  buildCloneDocument,
  CloneBaselineDocument,
  CloneBaselineEntry,
  diffCloneBaseline,
} from "./internal/CloneBaseline.js";` (re-export) - missing @example
- `src/commands/Reuse/index.ts:25` `export * from "./Reuse.command.js";` (re-export) - missing @example
- `src/commands/Reuse/index.ts:32` `export * from "./Reuse.errors.js";` (re-export) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:22` `export { CodexRunnerError, CodexRunnerStage } from "../Reuse.errors.js";` (re-export) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:32` `CodexSmokeResult` (class) - missing @example
- `src/commands/Reuse/internal/CodexRunner.ts:53` `runCodexSmoke` (const) - missing @example
- `src/commands/Reuse/Reuse.command.ts:667` `reuseCommand` (const) - missing @example
- `src/commands/Reuse/Reuse.errors.ts:26` `CodexRunnerStage` (const) - missing @example
- `src/commands/Reuse/Reuse.errors.ts:38` `CodexRunnerStage` (type) - missing @example
- `src/commands/Reuse/Reuse.errors.ts:46` `CodexRunnerError` (class) - missing @example
- `src/commands/SyncDataToTs/index.ts:13` `export * from "./SyncDataToTs.command.js";` (re-export) - missing @example
- `src/commands/SyncDataToTs/index.ts:20` `export * from "./SyncDataToTs.errors.js";` (re-export) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:20` `export { SyncDataToTsDriftError, SyncDataToTsError } from "../SyncDataToTs.errors.js";` (re-export) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:32` `SyncDataSourceFormat` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:44` `SyncDataSourceFormat` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:54` `SyncDataRunMode` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:66` `SyncDataRunMode` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:74` `SyncDataTargetProjection` (class) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:140` `SyncDataTarget` (const) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:155` `SyncDataTarget` (type) - missing @example
- `src/commands/SyncDataToTs/internal/Models.ts:163` `SyncDataTargetResult` (class) - missing @example
- `src/commands/SyncDataToTs/SyncDataToTs.command.ts:441` `syncDataToTsCommand` (const) - missing @example
- `src/commands/SyncDataToTs/SyncDataToTs.errors.ts:35` `SyncDataToTsError` (class) - missing @example
- `src/commands/SyncDataToTs/SyncDataToTs.errors.ts:86` `SyncDataToTsDriftError` (class) - missing @example
- `src/commands/SyncDataToTs/targets/index.ts:16` `syncDataTargets` (const) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:27` `ISO4217_SOURCE_URL` (const) - missing @example
- `src/commands/SyncDataToTs/targets/Iso4217.ts:274` `iso4217Target` (const) - missing @example
- `src/commands/TopoSort/index.ts:14` `export * from "./TopoSort.command.js";` (re-export) - missing @example
- `src/commands/TsconfigSync/index.ts:13` `export * from "./TsconfigSync.command.js";` (re-export) - missing @example
- `src/commands/TsconfigSync/index.ts:20` `export * from "./TsconfigSync.errors.js";` (re-export) - missing @example
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
- `src/commands/TsconfigSync/TsconfigSync.command.ts:185` `TsconfigSyncMode` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:239` `TsconfigSyncRunOptions` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:257` `TsconfigSyncRunOptions` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:265` `TsconfigSyncSection` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:285` `TsconfigSyncSection` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:371` `TsconfigSyncChange` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:394` `TsconfigSyncChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:495` `PlannedFileChange` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:518` `PlannedFileChange` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:560` `TsconfigSyncResult` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:575` `TsconfigSyncResult` (type) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:591` `WorkspaceDescriptor` (class) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:642` `TsconfigWithReferences` (class) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:657` `TsconfigWithPaths` (class) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:1635` `syncTsconfigAtRoot` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.command.ts:1770` `tsconfigSyncCommand` (const) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.errors.ts:21` `TsconfigSyncDriftError` (class) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.errors.ts:60` `TsconfigSyncCycleError` (class) - missing @example
- `src/commands/TsconfigSync/TsconfigSync.errors.ts:99` `TsconfigSyncFilterError` (class) - missing @example
- `src/commands/VersionSync/index.ts:13` `export * from "./VersionSync.command.js";` (re-export) - missing @example
- `src/commands/VersionSync/index.ts:20` `export * from "./VersionSync.errors.js";` (re-export) - missing @example
- `src/commands/VersionSync/internal/Handler.ts:65` `handleVersionSync` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:21` `export { NetworkUnavailableError, VersionSyncDriftError, VersionSyncError } from "../VersionSync.errors.js";` (re-export) - missing @example
- `src/commands/VersionSync/internal/Models.ts:35` `VersionDriftItem` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:61` `VersionCategory` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:79` `VersionCategory` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:72` `VersionCategoryOptions` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:93` `VersionCategoryStatus` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:125` `VersionCategoryStatus` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:104` `VersionCategoryStatusMatch` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:111` `VersionCategoryStatusEnum` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:118` `VersionCategoryStatusThunk` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:214` `VersionCategoryReport` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:234` `VersionCategoryReport` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:242` `VersionSyncReport` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:265` `VersionSyncMode` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:284` `VersionSyncMode` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:276` `VersionSyncModeMatch` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:343` `VersionSyncOptions` (const) - missing @example
- `src/commands/VersionSync/internal/Models.ts:358` `VersionSyncOptions` (type) - missing @example
- `src/commands/VersionSync/internal/Models.ts:366` `VersionSyncUpdateLocation` (class) - missing @example
- `src/commands/VersionSync/internal/Models.ts:382` `VersionSyncResolution` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:141` `BiomeSchemaState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:161` `resolveBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:212` `buildBiomeReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BiomeResolver.ts:257` `updateBiomeSchema` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:101` `BunSemver` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:260` `BunVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:283` `resolveBunVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/BunResolver.ts:366` `buildBunReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:117` `DockerImageState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:319` `resolveDockerImages` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/DockerResolver.ts:423` `buildDockerReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:61` `EffectCatalogState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:146` `resolveEffectCatalog` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/EffectResolver.ts:199` `buildEffectReport` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:31` `NodeVersionLocation` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:50` `NodeVersionState` (class) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:127` `resolveNodeVersions` (const) - missing @example
- `src/commands/VersionSync/internal/resolvers/NodeResolver.ts:229` `buildNodeReport` (const) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:22` `CategorySelectionServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:33` `CategorySelectionService` (class) - missing @example
- `src/commands/VersionSync/internal/services/CategorySelectionService.ts:63` `CategorySelectionServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:28` `ReportRendererServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:39` `ReportRendererService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ReportRendererService.ts:123` `ReportRendererServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:39` `ResolverServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:52` `ResolverService` (class) - missing @example
- `src/commands/VersionSync/internal/services/ResolverService.ts:150` `ResolverServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:46` `UpdateApplierServiceShape` (type) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:59` `UpdateApplierService` (class) - missing @example
- `src/commands/VersionSync/internal/services/UpdateApplierService.ts:237` `UpdateApplierServiceLive` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:38` `updatePackageManagerField` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PackageJsonUpdater.ts:82` `updateCatalogEntry` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/PlainTextUpdater.ts:21` `updatePlainTextFile` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:50` `updateYamlValue` (const) - missing @example
- `src/commands/VersionSync/internal/updaters/YamlFileUpdater.ts:101` `replaceNodeVersionWithFile` (const) - missing @example
- `src/commands/VersionSync/VersionSync.command.ts:49` `versionSyncCommand` (const) - missing @example
- `src/commands/VersionSync/VersionSync.errors.ts:35` `VersionSyncError` (class) - missing @example
- `src/commands/VersionSync/VersionSync.errors.ts:79` `NetworkUnavailableError` (class) - missing @example
- `src/commands/VersionSync/VersionSync.errors.ts:100` `VersionSyncDriftError` (class) - missing @example
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

### @beep/ai-sync

Path: `packages/tooling/library/ai-sync`

Export findings:
- `src/_generated/source-metadata.gen.ts:16` `GENERATED_TIER_ONE_SOURCE_METADATA` (const) - missing @example
- `src/generator.ts:21` `GENERATED_SCHEMAS_PATH` (const) - missing @example
- `src/generator.ts:29` `GENERATED_SOURCE_METADATA_PATH` (const) - missing @example
- `src/generator.ts:408` `AiSyncHttpLayer` (const) - missing @example

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
- `src/aggregates/CanvasProject/CanvasProject.http.ts:150` `makeCanvasProjectHttpHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:23` `makeCanvasProjectServer` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:34` `CanvasProjectServer` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.layer.ts:45` `CanvasProjectServerLayer` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repo.ts:39` `makeInMemoryCanvasProjectRepository` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repo.ts:83` `makeCanvasProjectRepository` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.rpc.ts:27` `makeCanvasProjectRpcHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/CanvasProject.tools.ts:50` `makeCanvasProjectToolHandlers` (const) - 1 unsafe example violation(s)
- `src/aggregates/CanvasProject/index.ts:7` `export * from "./CanvasProject.http.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:14` `export * from "./CanvasProject.layer.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:21` `export * from "./CanvasProject.repo.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:28` `export * from "./CanvasProject.rpc.js";` (re-export) - missing @example
- `src/aggregates/CanvasProject/index.ts:35` `export * from "./CanvasProject.tools.js";` (re-export) - missing @example
- `src/index.ts:15` `export * as CanvasProject from "./aggregates/CanvasProject/index.js";` (re-export) - missing @example
- `src/index.ts:22` `export * from "./Layer.js";` (re-export) - missing @example
- `src/test.ts:17` `CanvasServerTest` (const) - missing @example

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
- `src/AiProviderCli.errors.ts:20` `AiProviderCliError` (class) - missing @example
- `src/AiProviderCli.models.ts:20` `AiProviderCliProvider` (const) - missing @example
- `src/AiProviderCli.models.ts:32` `AiProviderCliProvider` (type) - missing @example
- `src/AiProviderCli.models.ts:40` `AiProviderCliAuthStatus` (const) - missing @example
- `src/AiProviderCli.models.ts:52` `AiProviderCliAuthStatus` (type) - missing @example
- `src/AiProviderCli.models.ts:60` `AiProviderCliProcessResult` (class) - missing @example
- `src/AiProviderCli.models.ts:77` `AiProviderCliAuthProbe` (class) - missing @example
- `src/AiProviderCli.service.ts:31` `AiProviderCliRunner` (type) - missing @example
- `src/AiProviderCli.service.ts:126` `AiProviderCli` (class) - missing @example
- `src/index.ts:14` `export * from "./AiProviderCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./AiProviderCli.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./AiProviderCli.service.ts";` (re-export) - missing @example

### @beep/sandbox

Path: `packages/foundation/capability/sandbox`

Export findings:
- `src/Agent.provider.ts:332` `ParsedStreamEvent` (const) - missing @example
- `src/Agent.provider.ts:358` `ParsedStreamEvent` (type) - missing @example
- `src/Agent.provider.ts:366` `CodexEffort` (const) - missing @example
- `src/Agent.provider.ts:378` `CodexEffort` (type) - missing @example
- `src/Agent.provider.ts:386` `ClaudeEffort` (const) - missing @example
- `src/Agent.provider.ts:398` `ClaudeEffort` (type) - missing @example
- `src/Agent.provider.ts:406` `AgentCommandOptions` (class) - missing @example
- `src/Agent.provider.ts:423` `PrintCommand` (class) - missing @example
- `src/Agent.provider.ts:439` `IterationUsage` (class) - missing @example
- `src/Agent.provider.ts:457` `CodexOptions` (class) - missing @example
- `src/Agent.provider.ts:473` `PiOptions` (class) - missing @example
- `src/Agent.provider.ts:488` `OpenCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:503` `ClaudeCodeOptions` (class) - missing @example
- `src/Agent.provider.ts:520` `AgentProvider` (interface) - missing @example
- `src/Agent.provider.ts:536` `DEFAULT_CLAUDE_MODEL` (const) - missing @example
- `src/Agent.provider.ts:760` `codex` (const) - missing @example
- `src/Agent.provider.ts:784` `pi` (const) - missing @example
- `src/Agent.provider.ts:804` `opencode` (const) - missing @example
- `src/Agent.provider.ts:823` `claudeCode` (const) - missing @example
- `src/AgentStreamEmitter.ts:24` `AgentStreamEvent` (const) - missing @example
- `src/AgentStreamEmitter.ts:51` `AgentStreamEvent` (type) - missing @example
- `src/AgentStreamEmitter.ts:59` `AgentStreamEvent` (namespace) - missing @example
- `src/AgentStreamEmitter.ts:75` `AgentStreamEmitterShape` (interface) - missing @example
- `src/AgentStreamEmitter.ts:85` `AgentStreamEmitter` (class) - missing @example
- `src/AgentStreamEmitter.ts:95` `noopAgentStreamEmitterLayer` (const) - missing @example
- `src/AgentStreamEmitter.ts:110` `callbackAgentStreamEmitterLayer` (const) - missing @example
- `src/createSandbox.ts:26` `CreateSandboxOptions` (interface) - missing @example
- `src/createSandbox.ts:40` `CreateSandboxResult` (class) - missing @example
- `src/createSandbox.ts:56` `createSandbox` (const) - missing @example
- `src/createWorktree.ts:33` `CreateWorktreeOptions` (class) - missing @example
- `src/createWorktree.ts:51` `Worktree` (interface) - missing @example
- `src/createWorktree.ts:73` `CreateWorktreeResult` (class) - missing @example
- `src/createWorktree.ts:89` `createWorktree` (const) - missing @example
- `src/createWorktree.ts:130` `createWorktreeScoped` (const) - missing @example
- `src/Display.ts:25` `Severity` (const) - missing @example
- `src/Display.ts:37` `Severity` (type) - missing @example
- `src/Display.ts:45` `DisplayEntryStatus` (class) - missing @example
- `src/Display.ts:62` `DisplayEntryIntro` (class) - missing @example
- `src/Display.ts:78` `DisplayEntrySpinner` (class) - missing @example
- `src/Display.ts:94` `DisplayEntrySummary` (class) - missing @example
- `src/Display.ts:111` `DisplayEntryTaskLog` (class) - missing @example
- `src/Display.ts:128` `DisplayEntryText` (class) - missing @example
- `src/Display.ts:144` `DisplayEntryToolCall` (class) - missing @example
- `src/Display.ts:161` `DisplayEntry` (const) - missing @example
- `src/Display.ts:182` `DisplayEntry` (type) - missing @example
- `src/Display.ts:190` `DisplayServiceShape` (interface) - missing @example
- `src/Display.ts:215` `Display` (class) - missing @example
- `src/Display.ts:233` `SilentDisplay` (const) - missing @example
- `src/Display.ts:421` `FileDisplay` (const) - missing @example
- `src/Display.ts:451` `terminalStyle` (const) - missing @example
- `src/Display.ts:465` `ClackDisplay` (const) - missing @example
- `src/Env.ts:25` `MergeProviderEnvOptions` (class) - missing @example
- `src/Env.ts:78` `resolveEnv` (const) - missing @example
- `src/Env.ts:109` `mergeProviderEnv` (const) - missing @example
- `src/Image.ts:27` `ContainerImageRuntime` (const) - missing @example
- `src/Image.ts:39` `ContainerImageRuntime` (type) - missing @example
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
- `src/Init.ts:30` `SANDBOX_CONFIG_DIR` (const) - missing @example
- `src/Init.ts:38` `SandboxAgentName` (const) - missing @example
- `src/Init.ts:50` `SandboxAgentName` (type) - missing @example
- `src/Init.ts:58` `SandboxInitProviderName` (const) - missing @example
- `src/Init.ts:70` `SandboxInitProviderName` (type) - missing @example
- `src/interactive.ts:37` `InteractiveResult` (class) - missing @example
- `src/interactive.ts:57` `interactive` (const) - missing @example
- `src/Lifecycle.ts:42` `HostLifecycleHookCommand` (class) - missing @example
- `src/Lifecycle.ts:58` `SandboxLifecycleHookCommand` (class) - missing @example
- `src/Lifecycle.ts:75` `HostLifecycleHooks` (class) - missing @example
- `src/Lifecycle.ts:91` `SandboxLifecycleHooks` (class) - missing @example
- `src/Lifecycle.ts:106` `SandboxHooks` (class) - missing @example
- `src/Lifecycle.ts:122` `SandboxLifecycleSetupOptions` (class) - missing @example
- `src/Lifecycle.ts:144` `MergeToHeadOptions` (class) - missing @example
- `src/Lifecycle.ts:164` `RunHostHooksOptions` (class) - missing @example
- `src/Lifecycle.ts:298` `runHostHooks` (const) - missing @example
- `src/Lifecycle.ts:440` `prepareSandboxLifecycle` (const) - missing @example
- `src/Lifecycle.ts:512` `getHostHead` (const) - missing @example
- `src/Lifecycle.ts:537` `mergeToHead` (const) - missing @example
- `src/Orchestrator.ts:33` `IterationResult` (class) - missing @example
- `src/Orchestrator.ts:50` `CommitSummary` (class) - missing @example
- `src/Orchestrator.ts:65` `OrchestrateResult` (class) - missing @example
- `src/Orchestrator.ts:85` `OrchestrateOptions` (interface) - missing @example
- `src/Orchestrator.ts:187` `orchestrate` (const) - missing @example
- `src/Prompt.ts:32` `SHELL_BLOCK_MARKER` (const) - missing @example
- `src/Prompt.ts:42` `BUILT_IN_PROMPT_ARG_KEYS` (const) - missing @example
- `src/Prompt.ts:50` `BUILT_IN_PROMPT_ARG_KEY_SET` (const) - missing @example
- `src/Prompt.ts:58` `BuiltInPromptArgKey` (const) - missing @example
- `src/Prompt.ts:70` `BuiltInPromptArgKey` (type) - missing @example
- `src/Prompt.ts:78` `PromptArgValue` (const) - missing @example
- `src/Prompt.ts:90` `PromptArgValue` (type) - missing @example
- `src/Prompt.ts:98` `PromptArgs` (const) - missing @example
- `src/Prompt.ts:110` `PromptArgs` (type) - missing @example
- `src/Prompt.ts:120` `PromptSource` (const) - missing @example
- `src/Prompt.ts:132` `PromptSource` (type) - missing @example
- `src/Prompt.ts:140` `ResolvePromptOptions` (class) - missing @example
- `src/Prompt.ts:156` `ResolvedPrompt` (class) - missing @example
- `src/Prompt.ts:172` `ExpandPromptShellExpressionsOptions` (class) - missing @example
- `src/Prompt.ts:191` `resolvePrompt` (const) - missing @example
- `src/Prompt.ts:218` `validateNoArgsWithInlinePrompt` (const) - missing @example
- `src/Prompt.ts:237` `validateNoBuiltInArgOverride` (const) - missing @example
- `src/Prompt.ts:256` `findMissingPromptArgKeys` (const) - missing @example
- `src/Prompt.ts:288` `substitutePromptArgs` (const) - missing @example
- `src/Prompt.ts:337` `expandPromptShellExpressions` (const) - missing @example
- `src/RecoveryMessage.ts:41` `FailedStep` (type) - missing @example
- `src/Run.ts:76` `DEFAULT_MAX_ITERATIONS` (const) - missing @example
- `src/Run.ts:84` `LoggingOptionKind` (const) - missing @example
- `src/Run.ts:96` `LoggingOptionKind` (type) - missing @example
- `src/Run.ts:104` `Timeouts` (class) - missing @example
- `src/Run.ts:166` `FileLoggingOption` (class) - missing @example
- `src/Run.ts:183` `StdoutLoggingOption` (class) - missing @example
- `src/Run.ts:197` `LoggingOption` (const) - missing @example
- `src/Run.ts:209` `LoggingOption` (type) - missing @example
- `src/Run.ts:217` `RunSummaryRowOptions` (class) - missing @example
- `src/Run.ts:236` `FileDisplayStartupOptions` (class) - missing @example
- `src/Run.ts:254` `LogFilenameOptions` (class) - missing @example
- `src/Run.ts:270` `RunResult` (class) - missing @example
- `src/Run.ts:296` `RunOptions` (interface) - missing @example
- `src/Run.ts:320` `sanitizeBranchForFilename` (const) - missing @example
- `src/Run.ts:328` `buildLogFilename` (const) - missing @example
- `src/Run.ts:351` `buildRunSummaryRows` (const) - missing @example
- `src/Run.ts:364` `buildCompletionMessage` (const) - missing @example
- `src/Run.ts:393` `formatContextWindowSize` (const) - missing @example
- `src/Run.ts:409` `buildContextWindowLines` (const) - missing @example
- `src/Run.ts:747` `run` (const) - missing @example
- `src/Sandbox.error-handler.ts:57` `formatErrorMessage` (const) - missing @example
- `src/Sandbox.errors.ts:21` `ExecError` (class) - missing @example
- `src/Sandbox.errors.ts:37` `ExecHostError` (class) - missing @example
- `src/Sandbox.errors.ts:53` `CopyError` (class) - missing @example
- `src/Sandbox.errors.ts:67` `DockerError` (class) - missing @example
- `src/Sandbox.errors.ts:81` `PodmanError` (class) - missing @example
- `src/Sandbox.errors.ts:95` `SyncError` (class) - missing @example
- `src/Sandbox.errors.ts:109` `WorktreeError` (class) - missing @example
- `src/Sandbox.errors.ts:123` `PromptError` (class) - missing @example
- `src/Sandbox.errors.ts:137` `AgentError` (class) - missing @example
- `src/Sandbox.errors.ts:153` `ConfigDirError` (class) - missing @example
- `src/Sandbox.errors.ts:167` `InitError` (class) - missing @example
- `src/Sandbox.errors.ts:181` `AgentIdleTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:198` `WorktreeTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:216` `ContainerStartTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:234` `CopyToWorktreeTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:253` `CopyToWorktreeError` (class) - missing @example
- `src/Sandbox.errors.ts:271` `SyncInTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:287` `SyncOutTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:303` `HookTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:320` `GitSetupTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:337` `PromptExpansionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:356` `CommitCollectionTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:374` `MergeToHostTimeoutError` (class) - missing @example
- `src/Sandbox.errors.ts:392` `SessionCaptureError` (class) - missing @example
- `src/Sandbox.errors.ts:408` `CwdError` (class) - missing @example
- `src/Sandbox.errors.ts:424` `SandboxError` (const) - missing @example
- `src/Sandbox.errors.ts:490` `SandboxError` (type) - missing @example
- `src/Sandbox.errors.ts:498` `SandboxError` (namespace) - missing @example
- `src/Sandbox.observability.ts:138` `SandboxPhaseAttributes` (const) - missing @example
- `src/Sandbox.observability.ts:150` `SandboxPhaseAttributes` (type) - missing @example
- `src/Sandbox.process.ts:139` `SandboxProcessShape` (interface) - missing @example
- `src/Sandbox.process.ts:239` `SandboxProcessLive` (const) - missing @example
- `src/Sandbox.provider.ts:24` `SandboxProviderKind` (const) - missing @example
- `src/Sandbox.provider.ts:36` `SandboxProviderKind` (type) - missing @example
- `src/Sandbox.provider.ts:44` `ExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:61` `SandboxExecOptions` (class) - missing @example
- `src/Sandbox.provider.ts:79` `InteractiveExecResult` (class) - missing @example
- `src/Sandbox.provider.ts:94` `InteractiveExecOptions` (interface) - missing @example
- `src/Sandbox.provider.ts:107` `MountEntry` (class) - missing @example
- `src/Sandbox.provider.ts:124` `BindMountCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:142` `IsolatedCreateOptions` (class) - missing @example
- `src/Sandbox.provider.ts:157` `HeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:171` `MergeToHeadBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:185` `NamedBranchStrategy` (class) - missing @example
- `src/Sandbox.provider.ts:202` `BranchStrategy` (const) - missing @example
- `src/Sandbox.provider.ts:214` `BranchStrategy` (type) - missing @example
- `src/Sandbox.provider.ts:222` `SandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:239` `BindMountSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:249` `IsolatedSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:259` `NoSandboxHandle` (interface) - missing @example
- `src/Sandbox.provider.ts:267` `BindMountSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:281` `IsolatedSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:294` `NoSandboxProvider` (interface) - missing @example
- `src/Sandbox.provider.ts:310` `SandboxProvider` (type) - missing @example
- `src/Sandbox.provider.ts:321` `BindMountSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:334` `IsolatedSandboxProviderConfig` (interface) - missing @example
- `src/Sandbox.provider.ts:346` `createBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:362` `createIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:385` `fromPromiseBindMountSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:406` `fromPromiseIsolatedSandboxProvider` (const) - missing @example
- `src/Sandbox.provider.ts:427` `matchSandboxProvider` (const) - missing @example
- `src/Sandbox.providers.ts:58` `NoSandboxOptions` (class) - missing @example
- `src/Sandbox.providers.ts:73` `ContainerProviderOptions` (class) - missing @example
- `src/Sandbox.providers.ts:281` `noSandbox` (const) - missing @example
- `src/Sandbox.providers.ts:340` `docker` (const) - missing @example
- `src/Sandbox.providers.ts:349` `podman` (const) - missing @example
- `src/Session.ts:27` `SessionPathsShape` (class) - missing @example
- `src/Session.ts:43` `SessionId` (const) - missing @example
- `src/Session.ts:59` `SessionId` (type) - missing @example
- `src/Session.ts:67` `SessionPaths` (class) - missing @example
- `src/Session.ts:75` `SessionStore` (interface) - missing @example
- `src/Session.ts:87` `encodeProjectPath` (const) - missing @example
- `src/Session.ts:95` `sessionPathsLayer` (const) - missing @example
- `src/Session.ts:104` `defaultSessionPathsLayer` (const) - missing @example
- `src/Session.ts:132` `SessionTransferResult` (class) - missing @example
- `src/Session.ts:147` `hostSessionStore` (const) - missing @example
- `src/Session.ts:188` `sandboxSessionStore` (const) - missing @example
- `src/Session.ts:220` `transferSession` (const) - missing @example
- `src/SyncIn.ts:30` `SyncInResult` (class) - missing @example
- `src/SyncIn.ts:182` `syncIn` (const) - missing @example
- `src/SyncOut.ts:41` `SyncOutOptions` (class) - missing @example
- `src/SyncOut.ts:56` `SyncOutResult` (class) - missing @example
- `src/SyncOut.ts:360` `syncOut` (const) - missing @example
- `src/Template.ts:25` `SandboxTemplateName` (const) - missing @example
- `src/Template.ts:37` `SandboxTemplateName` (type) - missing @example
- `src/terminalCleanup.ts:29` `TerminalCleanupStdin` (interface) - missing @example
- `src/terminalCleanup.ts:40` `TerminalCleanupStdout` (interface) - missing @example
- `src/TextDeltaBuffer.ts:55` `TextDeltaFlush` (type) - missing @example
- `src/Worktree.ts:36` `WorktreeInfo` (class) - missing @example
- `src/Worktree.ts:52` `CreateWorktreeInfoOptions` (class) - missing @example
- `src/Worktree.ts:70` `sanitizeName` (const) - missing @example
- `src/Worktree.ts:78` `generateTempBranchName` (const) - missing @example
- `src/Worktree.ts:120` `getCurrentBranch` (const) - missing @example
- `src/Worktree.ts:132` `hasUncommittedChanges` (const) - missing @example
- `src/Worktree.ts:144` `createWorktreeInfo` (const) - missing @example
- `src/Worktree.ts:204` `removeWorktree` (const) - missing @example
- `src/Worktree.ts:217` `pruneStaleWorktrees` (const) - missing @example
- `src/Worktree.ts:243` `collectCommitShas` (const) - missing @example

### @beep/phoenix

Path: `packages/drivers/phoenix`

Export findings:
- `src/Phoenix.errors.ts:56` `PhoenixOperation` (type) - missing @example
- `src/Phoenix.errors.ts:84` `PhoenixErrorReason` (type) - missing @example
- `src/Phoenix.models.ts:40` `PhoenixDoctorStatus` (type) - missing @example
- `src/Phoenix.models.ts:67` `PhoenixDatasetSelectorKind` (type) - missing @example
- `src/Phoenix.models.ts:94` `PhoenixAnnotationTargetKind` (type) - missing @example
- `src/Phoenix.models.ts:121` `PhoenixAnnotatorKind` (type) - missing @example
- `src/Phoenix.models.ts:148` `PhoenixAnnotationValue` (type) - missing @example
- `src/Phoenix.models.ts:183` `PhoenixPromptChatRole` (type) - missing @example
- `src/Phoenix.models.ts:210` `PhoenixPromptTemplateFormat` (type) - missing @example
- `src/Phoenix.models.ts:245` `PhoenixPromptModelProvider` (type) - missing @example

### @beep/canvas-use-cases

Path: `packages/canvas/use-cases`

Export findings:
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:25` `CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:33` `CANVAS_PROJECT_CONFLICT_REASON` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:41` `CanvasProjectNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:61` `CanvasProjectConflict` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:103` `CanvasProjectActionRejected` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:124` `CanvasProjectActionFailed` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:144` `CanvasProjectActionError` (type) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.errors.ts:156` `CanvasProjectActionError` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:25` `CanvasProjectRepositoryNotFound` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:45` `CanvasProjectRepositoryConflict` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:66` `CanvasProjectRepositoryUnavailable` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:86` `CanvasProjectRepositoryError` (const) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:99` `CanvasProjectRepositoryError` (type) - missing summary; missing @example, @category, @since
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:107` `CanvasProjectRepositoryShape` (interface) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.repository.ts:135` `CanvasProjectRepository` (class) - missing @example
- `src/aggregates/CanvasProject/CanvasProject.service.ts:113` `makeCanvasProjectUseCases` (const) - 1 unsafe example violation(s)
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
- `src/index.ts:14` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./SqlTest.js";` (re-export) - missing @example
- `src/SqlTest.ts:190` `PgliteTestcontainersTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:241` `PgExternalTestDriverConfigInput` (type) - missing @example
- `src/SqlTest.ts:249` `PgliteSqlTestLayerMode` (type) - missing @example
- `src/SqlTest.ts:257` `PgliteSqlTestLayerOptions` (interface) - missing @example
- `src/SqlTest.ts:438` `PgliteTestcontainerResource` (interface) - 1 unsafe example violation(s)

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
- `src/entities/index.ts:7` `export * as Membership from "./Membership/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:14` `export * as Organization from "./Organization/index.ts";` (re-export) - missing @example
- `src/entities/index.ts:21` `export * as User from "./User/index.ts";` (re-export) - missing @example
- `src/entities/Membership/index.ts:7` `export * from "./Membership.table.ts";` (re-export) - missing @example
- `src/entities/Organization/index.ts:7` `export * from "./Organization.table.js";` (re-export) - missing @example
- `src/entities/User/index.ts:7` `export * from "./User.table.ts";` (re-export) - missing @example
- `src/index.ts:14` `export * as Entities from "./entities/index.ts";` (re-export) - missing @example
- `src/Schema.ts:22` `DbSchema` (const) - missing @example
- `src/Schema.ts:34` `DbSchema` (type) - missing @example
- `src/table/index.ts:14` `export * as Table from "./Table.ts";` (re-export) - missing @example
- `src/table/Table.ts:14` `export { EntityTable } from "@beep/drizzle";` (re-export) - missing @example

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
- `src/index.ts:112` `export * from "./GlobalValue.ts";` (re-export) - missing @example
- `src/index.ts:267` `export * as Utils from "./Utils.ts";` (re-export) - missing @example
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
- `src/Utils.ts:50` `export * from "effect/Utils";` (re-export) - missing @example
- `src/Utils.ts:15` `structuralRegionState` (const) - missing @example
- `src/Utils.ts:29` `structuralRegion` (const) - missing @example

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
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.table.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:22` `WORK_ITEM_TABLE_NAME` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:30` `workItemTable` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:46` `WorkItemRow` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:54` `WorkItemInsert` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:62` `toWorkItemInsert` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.table.ts:76` `fromWorkItemRow` (const) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.table.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.table.ts:20` `workerTable` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:28` `WORKER_TABLE_NAME` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:36` `WorkerRow` (type) - missing @example
- `src/entities/Worker/Worker.table.ts:44` `WorkerInsert` (type) - missing @example
- `src/entities/Worker/Worker.table.ts:55` `toWorkerInsert` (const) - missing @example
- `src/entities/Worker/Worker.table.ts:63` `fromWorkerRow` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./tables.js";` (re-export) - missing @example
- `src/tables.ts:23` `DbSchema` (const) - missing @example
- `src/tables.ts:34` `DbSchema` (type) - missing @example

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
- `src/Id.ts:119` `IdentityInterpolationError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:150` `IdentitySegmentCountError` (class) - 1 schema annotation/type-alias gap(s)
- `src/Id.ts:381` `IdentityString` (type) - 1 unsafe example violation(s)
- `src/Id.ts:398` `IdentitySymbol` (type) - 1 unsafe example violation(s)
- `src/packages.ts:678` `RepoPkgs` (const) - missing @example
- `src/packages.ts:684` `$MdId` (const) - missing summary; missing @example
- `src/packages.ts:690` `$CodedankWebId` (const) - missing summary; missing @example
- `src/packages.ts:696` `$OipWebId` (const) - missing summary; missing @example
- `src/packages.ts:702` `$DrizzleId` (const) - missing summary; missing @example
- `src/packages.ts:708` `$DuckdbId` (const) - missing summary; missing @example
- `src/packages.ts:714` `$FaceDetectionId` (const) - missing summary; missing @example
- `src/packages.ts:720` `$FfmpegId` (const) - missing summary; missing @example
- `src/packages.ts:726` `$PostgresId` (const) - missing summary; missing @example
- `src/packages.ts:889` `$VeniceAiId` (const) - missing summary; missing @example
- `src/packages.ts:895` `$XaiId` (const) - missing summary; missing @example
- `src/packages.ts:1105` `$InstallerDomainId` (const) - missing @example
- `src/packages.ts:1113` `$InstallerUseCasesId` (const) - missing @example
- `src/packages.ts:1122` `$InstallerServerId` (const) - missing @example

### @beep/drizzle

Path: `packages/drivers/drizzle`

Export findings:
- `src/index.ts:14` `export * from "./Drizzle.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Drizzle.service.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * as EntityTable from "./EntityTable.models.ts";` (re-export) - missing @example

### @beep/stack-installer

Path: `apps/stack-installer`

Export findings:
- `src/App.tsx:402` `App` (function) - missing @example
- `src/dry-run-registry.ts:17` `p1aDryRunRegistry` (const) - missing @example
- `src/dry-run-registry.ts:25` `p1aDryRunSnapshot` (const) - missing @example
- `src/index.ts:23` `export * from "./proof/P1ManualProof.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/proof/P1ManualProof.ts:9` `export {
  InstallerServerLive as P1ManualProofSliceLayer,
  previewP1ManualProof,
  runP1ManualProof,
} from "@beep/installer-server";` (re-export) - missing @example
- `src/proof/P1ProofArtifacts.ts:20` `PROOF_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:28` `COMMANDS_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:36` `CHECKSUMS_FILE_NAME` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:44` `P1_REQUIRED_PLATFORMS` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:52` `P1RequiredPlatform` (type) - missing @example
- `src/proof/P1ProofArtifacts.ts:94` `isP1ProofEvidenceFileName` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:103` `isP1ProofArtifactStatusFileName` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:112` `p1ProofMissingRequiredArtifactFiles` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:126` `p1ProofBundleFileNameForPlatform` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:135` `p1ProofBundleExtractionCommand` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:150` `p1ProofBundleExtractionProcess` (const) - missing @example
- `src/proof/P1ProofArtifacts.ts:167` `p1ProofBundleListingProcess` (const) - missing @example
- `src/proof/P1ProofCommands.ts:119` `buildP1ProofCommandsText` (const) - missing @example
- `src/proof/P1ProofCommands.ts:134` `p1ProofCommandsTextMatchesPlatform` (const) - missing @example

### @beep/professional-desktop

Path: `apps/professional-desktop`

Export findings:
- `src/App.tsx:94` `App` (function) - missing summary; missing @example, @category, @since

### @beep/architecture-lab-use-cases

Path: `packages/architecture-lab/use-cases`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.commands.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.use-cases.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:14` `export * from "./WorkItem.repository.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/server.ts:21` `export { makeWorkItemUseCases, toWorkItemActionError } from "./WorkItem.service.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:25` `CreateWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:45` `AssignWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:62` `CompleteWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:78` `ReopenWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:94` `ArchiveWorkItemCommand` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:110` `GetWorkItemQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.commands.ts:126` `ListWorkItemsQuery` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:22` `WORK_ITEM_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:30` `WorkItemNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:47` `WorkItemConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:65` `WorkItemActionRejected` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:83` `WorkItemActionFailed` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:100` `WorkItemActionError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:108` `WorkItemActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.repository.ts:24` `WorkItemRepositoryNotFound` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:43` `WorkItemRepositoryConflict` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:63` `WorkItemRepositoryUnavailable` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:82` `WorkItemRepositoryError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:93` `WorkItemRepositoryShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.repository.ts:112` `WorkItemRepository` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.service.ts:49` `toWorkItemActionError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.service.ts:87` `makeWorkItemUseCases` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:32` `WorkItemUseCasesShape` (interface) - missing @example
- `src/aggregates/WorkItem/WorkItem.use-cases.ts:50` `WorkItemUseCases` (class) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.commands.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.errors.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:21` `export * from "./Worker.use-cases.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:7` `export * from "./index.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:14` `export * from "./Worker.repository.js";` (re-export) - missing @example
- `src/entities/Worker/server.ts:21` `export { makeWorkerUseCases, toWorkerActionError } from "./Worker.service.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.commands.ts:23` `CreateWorkerCommand` (class) - missing @example
- `src/entities/Worker/Worker.commands.ts:41` `GetWorkerQuery` (class) - missing @example
- `src/entities/Worker/Worker.commands.ts:57` `ListWorkersQuery` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:22` `WORKER_ACTION_UNAVAILABLE_REASON` (const) - missing @example
- `src/entities/Worker/Worker.errors.ts:30` `WorkerNotFound` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:47` `WorkerConflict` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:65` `WorkerActionFailed` (class) - missing @example
- `src/entities/Worker/Worker.errors.ts:82` `WorkerActionError` (type) - missing @example
- `src/entities/Worker/Worker.errors.ts:90` `WorkerActionError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/entities/Worker/Worker.repository.ts:24` `WorkerRepositoryNotFound` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:41` `WorkerRepositoryConflict` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:59` `WorkerRepositoryUnavailable` (class) - missing @example
- `src/entities/Worker/Worker.repository.ts:78` `WorkerRepositoryError` (type) - missing @example
- `src/entities/Worker/Worker.repository.ts:86` `WorkerRepositoryShape` (interface) - missing @example
- `src/entities/Worker/Worker.repository.ts:102` `WorkerRepository` (class) - missing @example
- `src/entities/Worker/Worker.service.ts:40` `toWorkerActionError` (const) - missing @example
- `src/entities/Worker/Worker.service.ts:59` `makeWorkerUseCases` (const) - missing @example
- `src/entities/Worker/Worker.use-cases.ts:24` `WorkerUseCasesShape` (interface) - missing @example
- `src/entities/Worker/Worker.use-cases.ts:36` `WorkerUseCases` (class) - missing @example
- `src/index.ts:30` `export * from "./public.js";` (re-export) - missing @example
- `src/public.ts:7` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/public.ts:14` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/server.ts:7` `export * as WorkItem from "./aggregates/WorkItem/server.js";` (re-export) - missing @example
- `src/server.ts:14` `export * as Worker from "./entities/Worker/server.js";` (re-export) - missing @example

### @beep/acp

Path: `packages/drivers/acp`

Export findings:
- `src/Acp.errors.ts:421` `AcpError` (const) - 1 schema annotation/type-alias gap(s)

### @beep/nlp

Path: `packages/foundation/capability/nlp`

Export findings:
- `src/Core/index.ts:11` `export * from "./Document.ts";` (re-export) - missing @example
- `src/Core/index.ts:16` `export * from "./Pattern.ts";` (re-export) - missing @example
- `src/Core/index.ts:21` `export * from "./PatternBuilders.ts";` (re-export) - missing @example
- `src/Core/index.ts:26` `export * from "./PatternOperations.ts";` (re-export) - missing @example
- `src/Core/index.ts:31` `export * from "./PatternParsers.ts";` (re-export) - missing @example
- `src/Core/index.ts:36` `export * from "./Sentence.ts";` (re-export) - missing @example
- `src/Core/index.ts:41` `export * from "./Token.ts";` (re-export) - missing @example
- `src/Core/index.ts:46` `export * from "./Tokenization.ts";` (re-export) - missing @example
- `src/Core/PatternBuilders.ts:92` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:93` `pos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:117` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:118` `entity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:142` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:143` `literal` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:164` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:165` `optionalPos` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:189` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:190` `optionalEntity` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:214` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternBuilders.ts:215` `optionalLiteral` (function) - missing summary; missing @example, @category, @since
- `src/Core/PatternParsers.ts:103` `BracketStringToPOSPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:132` `BracketStringToEntityPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Core/PatternParsers.ts:163` `BracketStringToLiteralPatternElement` (const) - 1 schema annotation/type-alias gap(s)
- `src/Wink/index.ts:38` `export * from "./WinkCorpusManager.ts";` (re-export) - missing @example
- `src/Wink/index.ts:43` `export * from "./WinkEngine.ts";` (re-export) - missing @example
- `src/Wink/index.ts:72` `export * from "./WinkErrors.ts";` (re-export) - missing @example
- `src/Wink/index.ts:77` `export * from "./WinkPattern.ts";` (re-export) - missing @example
- `src/Wink/index.ts:82` `export * from "./WinkSimilarity.ts";` (re-export) - missing @example
- `src/Wink/index.ts:87` `export * from "./WinkTokenizer.ts";` (re-export) - missing @example
- `src/Wink/index.ts:92` `export * from "./WinkUtils.ts";` (re-export) - missing @example
- `src/Wink/index.ts:97` `export * from "./WinkVectorizer.ts";` (re-export) - missing @example

### @beep/installer-use-cases

Path: `packages/installer/use-cases`

Export findings:
- `src/index.ts:23` `export * from "./public.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/public.ts:40` `InstallerDryRunVerb` (class) - missing @example
- `src/public.ts:60` `HostDependencyPlan` (class) - missing @example
- `src/public.ts:78` `HostDependencyValidationResult` (class) - missing @example
- `src/public.ts:97` `ProviderAccountPlan` (class) - missing @example
- `src/public.ts:115` `ProviderAuthValidationResult` (class) - missing @example
- `src/public.ts:137` `SecretReferencePlan` (class) - missing @example
- `src/public.ts:155` `SecretReferenceValidationRequest` (class) - missing @example
- `src/public.ts:176` `SecretReferenceValidationResult` (class) - missing @example
- `src/public.ts:199` `SecretReferenceReadError` (class) - missing @example
- `src/public.ts:216` `DiscordChannelPlan` (class) - missing @example
- `src/public.ts:234` `DiscordLiveValidationRequest` (class) - missing @example
- `src/public.ts:253` `DiscordLiveValidationResult` (class) - missing @example
- `src/public.ts:272` `WorkspaceDryRunPlan` (class) - missing @example
- `src/public.ts:290` `P1ManualProofRequest` (class) - missing @example
- `src/public.ts:312` `P1ManualProofResult` (class) - missing @example
- `src/public.ts:328` `P1A_HOST_DEPENDENCY_VERB_INPUTS` (const) - missing @example
- `src/public.ts:351` `P1A_SECRET_REFERENCE_VERB_INPUTS` (const) - missing @example
- `src/public.ts:374` `P1A_PROVIDER_ACCOUNT_VERB_INPUTS` (const) - missing @example
- `src/public.ts:397` `P1A_DISCORD_CHANNEL_VERB_INPUTS` (const) - missing @example
- `src/public.ts:420` `P1A_WORKSPACE_VERB_INPUTS` (const) - missing @example
- `src/public.ts:443` `P1A_INSTALLER_DRY_RUN_REGISTRY_INPUTS` (const) - missing @example
- `src/public.ts:457` `P1A_DRY_RUN_SNAPSHOT_INPUT` (const) - missing @example
- `src/server.ts:50` `HostDependencyUseCases` (class) - missing @example
- `src/server.ts:76` `SecretReferenceUseCases` (class) - missing @example
- `src/server.ts:97` `ProviderAccountUseCases` (class) - missing @example
- `src/server.ts:121` `DiscordChannelUseCases` (class) - missing @example
- `src/server.ts:141` `StackManifestUseCases` (class) - missing @example
- `src/server.ts:164` `P1ManualProofWorkflow` (class) - missing @example

### @beep/runpod

Path: `packages/drivers/runpod`

Export findings:
- `src/_generated/Runpod.generated.ts:24` `Pods` (const) - missing @example
- `src/_generated/Runpod.generated.ts:37` `Pods` (type) - missing @example
- `src/_generated/Runpod.generated.ts:45` `Pod` (class) - missing @example
- `src/_generated/Runpod.generated.ts:150` `PodUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:166` `PodUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:192` `PodCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:239` `NetworkVolumes` (const) - missing @example
- `src/_generated/Runpod.generated.ts:258` `NetworkVolumes` (type) - missing @example
- `src/_generated/Runpod.generated.ts:266` `NetworkVolume` (class) - missing @example
- `src/_generated/Runpod.generated.ts:284` `NetworkVolumeCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:301` `NetworkVolumeUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:317` `Templates` (const) - missing @example
- `src/_generated/Runpod.generated.ts:330` `Templates` (type) - missing @example
- `src/_generated/Runpod.generated.ts:338` `Template` (class) - missing @example
- `src/_generated/Runpod.generated.ts:370` `TemplateCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:398` `TemplateUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:417` `TemplateUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:443` `Endpoints` (const) - missing @example
- `src/_generated/Runpod.generated.ts:456` `Endpoints` (type) - missing @example
- `src/_generated/Runpod.generated.ts:464` `Endpoint` (class) - missing @example
- `src/_generated/Runpod.generated.ts:502` `EndpointUpdateInPlaceInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:524` `EndpointUpdateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:556` `EndpointCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:589` `User` (const) - missing @example
- `src/_generated/Runpod.generated.ts:601` `User` (type) - missing @example
- `src/_generated/Runpod.generated.ts:609` `SavingsPlan` (class) - missing @example
- `src/_generated/Runpod.generated.ts:629` `Machine` (class) - missing @example
- `src/_generated/Runpod.generated.ts:682` `DataCenter` (class) - missing @example
- `src/_generated/Runpod.generated.ts:697` `UnauthorizedError` (class) - missing @example
- `src/_generated/Runpod.generated.ts:712` `CudaVersions` (const) - missing @example
- `src/_generated/Runpod.generated.ts:724` `CudaVersions` (type) - missing @example
- `src/_generated/Runpod.generated.ts:732` `GPUTypeId` (const) - missing @example
- `src/_generated/Runpod.generated.ts:744` `GPUTypeId` (type) - missing @example
- `src/_generated/Runpod.generated.ts:752` `ContainerRegistryAuth` (class) - missing @example
- `src/_generated/Runpod.generated.ts:768` `ContainerRegistryAuths` (const) - missing @example
- `src/_generated/Runpod.generated.ts:781` `ContainerRegistryAuths` (type) - missing @example
- `src/_generated/Runpod.generated.ts:789` `ContainerRegistryAuthCreateInput` (class) - missing @example
- `src/_generated/Runpod.generated.ts:808` `BillingRecord` (class) - missing @example
- `src/_generated/Runpod.generated.ts:829` `BillingRecords` (const) - missing @example
- `src/_generated/Runpod.generated.ts:851` `BillingRecords` (type) - missing @example
- `src/_generated/Runpod.generated.ts:859` `NetworkVolumeBillingRecord` (class) - missing @example
- `src/_generated/Runpod.generated.ts:878` `NetworkVolumeBillingRecords` (const) - missing @example
- `src/_generated/Runpod.generated.ts:898` `NetworkVolumeBillingRecords` (type) - missing @example
- `src/_generated/Runpod.generated.ts:906` `RUNPOD_ALLOWED_CUDA_VERSIONS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:927` `RUNPOD_CPU_FLAVOR_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:935` `RUNPOD_CPU_FLAVOR_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:943` `RUNPOD_CUDA_VERSIONS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:951` `RUNPOD_DATA_CENTER_ID_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:986` `RUNPOD_DATA_CENTER_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1021` `RUNPOD_DATA_CENTER_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1029` `RUNPOD_GPU_TYPE_ID_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1072` `RUNPOD_GPU_TYPE_IDS_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1130` `RUNPOD_GPU_TYPE_PRIORITY_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1138` `RUNPOD_MIN_CUDA_VERSION_VALUES` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1159` `GetOpenAPIStatus200Response` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1171` `GetOpenAPIStatus200Response` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1179` `GetDocsStatus200TextResponse` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1191` `GetDocsStatus200TextResponse` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1199` `GetOpenAPIRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1212` `GetDocsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1225` `ListPodsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1255` `CreatePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1270` `GetPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1290` `UpdatePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1306` `DeletePodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1321` `UpdatePodViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1337` `StartPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1352` `StopPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1367` `ResetPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1382` `RestartPodRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1397` `ListEndpointsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1413` `CreateEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1428` `GetEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1445` `UpdateEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1461` `DeleteEndpointRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1476` `UpdateEndpointViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1494` `ListTemplatesRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1511` `CreateTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1526` `GetTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1544` `UpdateTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1560` `DeleteTemplateRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1575` `UpdateTemplateViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1593` `ListNetworkVolumesRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1606` `CreateNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1621` `GetNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1636` `UpdateNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1652` `DeleteNetworkVolumeRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1667` `UpdateNetworkVolumeViaPostRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1685` `ListContainerRegistryAuthsRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1700` `CreateContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1717` `GetContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1734` `DeleteContainerRegistryAuthRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1751` `PodBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1771` `EndpointBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1794` `NetworkVolumeBillingRequest` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1811` `RunpodHttpMethod` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1819` `RunpodHttpMethod` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1827` `RunpodOperationId` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1869` `RunpodOperationId` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1877` `RunpodRequestBodyKind` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1885` `RunpodRequestBodyKind` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1893` `RunpodResponseBodyKind` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/_generated/Runpod.generated.ts:1901` `RunpodResponseBodyKind` (type) - missing @example
- `src/_generated/Runpod.generated.ts:1909` `RunpodOperationDescriptor` (class) - missing @example
- `src/_generated/Runpod.generated.ts:1934` `getOpenAPIOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1954` `getDocsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:1974` `listPodsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2011` `createPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2031` `getPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2051` `updatePodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2071` `deletePodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2091` `updatePodViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2111` `startPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2131` `stopPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2151` `resetPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2171` `restartPodOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2191` `listEndpointsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2211` `createEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2231` `getEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2251` `updateEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2271` `deleteEndpointOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2291` `updateEndpointViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2311` `listTemplatesOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2331` `createTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2351` `getTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2371` `updateTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2391` `deleteTemplateOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2411` `updateTemplateViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2431` `listNetworkVolumesOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2451` `createNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2471` `getNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2491` `updateNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2511` `deleteNetworkVolumeOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2531` `updateNetworkVolumeViaPostOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2551` `listContainerRegistryAuthsOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2571` `createContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2591` `getContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2611` `deleteContainerRegistryAuthOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2631` `podBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2651` `endpointBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2681` `networkVolumeBillingOperation` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2701` `RUNPOD_OPERATION_SPECS` (const) - missing @example
- `src/_generated/Runpod.generated.ts:2886` `RunpodOperationsShape` (interface) - missing @example
- `src/index.ts:14` `export * from "./_generated/Runpod.generated.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Runpod.config.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Runpod.errors.ts";` (re-export) - missing @example
- `src/index.ts:35` `export * from "./Runpod.service.ts";` (re-export) - missing @example
- `src/index.ts:42` `export * from "./RunpodDocs.service.ts";` (re-export) - missing @example
- `src/index.ts:50` `VERSION` (const) - missing @example
- `src/Runpod.config.ts:19` `RUNPOD_API_URL` (const) - missing @example
- `src/Runpod.config.ts:27` `RUNPOD_DOCS_INDEX_URL` (const) - missing @example
- `src/Runpod.config.ts:35` `RunpodConfigInput` (class) - missing @example
- `src/Runpod.config.ts:52` `RunpodDocsConfigInput` (class) - missing @example
- `src/Runpod.errors.ts:26` `RunpodErrorReason` (const) - missing @example
- `src/Runpod.errors.ts:44` `RunpodErrorReason` (type) - missing @example
- `src/Runpod.errors.ts:52` `RunpodDocsErrorReason` (const) - missing @example
- `src/Runpod.errors.ts:70` `RunpodDocsErrorReason` (type) - missing @example
- `src/Runpod.errors.ts:80` `RunpodError` (class) - missing @example
- `src/Runpod.errors.ts:158` `RunpodDocsError` (class) - missing @example
- `src/Runpod.errors.ts:199` `RunpodErrorOptions` (class) - missing @example
- `src/Runpod.errors.ts:215` `RunpodRawErrorOptions` (class) - missing @example
- `src/Runpod.errors.ts:234` `RunpodDocsErrorOptions` (class) - missing @example
- `src/Runpod.service.ts:32` `RunpodQueryScalar` (const) - missing @example
- `src/Runpod.service.ts:44` `RunpodQueryScalar` (type) - missing @example
- `src/Runpod.service.ts:55` `RunpodQueryValue` (const) - missing @example
- `src/Runpod.service.ts:67` `RunpodQueryValue` (type) - missing @example
- `src/Runpod.service.ts:75` `RunpodRawRequest` (class) - missing @example
- `src/Runpod.service.ts:95` `RunpodRawResponse` (class) - missing @example
- `src/Runpod.service.ts:113` `RunpodShape` (interface) - missing @example
- `src/Runpod.service.ts:785` `Runpod` (class) - missing @example
- `src/RunpodDocs.service.ts:29` `RunpodDocsIndexEntry` (class) - missing @example
- `src/RunpodDocs.service.ts:47` `RunpodDocsIndex` (class) - missing @example
- `src/RunpodDocs.service.ts:170` `parseRunpodDocsIndex` (const) - missing @example
- `src/RunpodDocs.service.ts:263` `RunpodDocs` (class) - missing @example

### @beep/repo-utils

Path: `packages/tooling/library/repo-utils`

Module findings:
- `src/TypeScript/index.ts:1` (jsdoc) - missing summary
- `src/TypeScript/models/index.ts:1` (jsdoc) - missing summary

Export findings:
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
- `src/JSDoc/index.ts:8` `export * as Models from "./models/index.js";` (re-export) - missing @example
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
- `src/JSDoc/models/tag-values/index.ts:530` `TagName` (const) - 1 schema annotation/type-alias gap(s)
- `src/JSDoc/models/TagValue.model.ts:11` `export * from "./tag-values/index.js";` (re-export) - missing @example
- `src/JSDoc/models/TSCategory.model.ts:276` `make` (const) - 1 schema annotation/type-alias gap(s)
- `src/Reuse/index.ts:7` `export * from "./Reuse.model.js";` (re-export) - missing @example
- `src/Reuse/index.ts:14` `export * from "./Reuse.service.js";` (re-export) - missing @example
- `src/Reuse/index.ts:21` `export * from "./TokenSimilarity.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:7` `export * from "./TSMorph.model.js";` (re-export) - missing @example
- `src/TSMorph/index.ts:14` `export * from "./TSMorph.service.js";` (re-export) - missing @example
- `src/TSMorph/TSMorph.model.ts:399` `SymbolKind` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:425` `SymbolCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:696` `TsMorphScopeMode` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:722` `TsMorphReferencePolicy` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.model.ts:1719` `TsMorphDiagnosticCategory` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.service.ts:271` `TSMorphServiceError` (const) - 1 schema annotation/type-alias gap(s)
- `src/TSMorph/TSMorph.shared.ts:339` `NamedDeclaration` (class) - missing @example
- `src/TypeScript/index.ts:5` `export * from "./models/index.js";` (re-export) - missing @example
- `src/TypeScript/models/index.ts:5` `export * from "./TSSyntaxKind.model.js";` (re-export) - missing @example

### @beep/schema

Path: `packages/foundation/modeling/schema`

Module findings:
- `src/Age/Age.schema.ts:1` (packageDocumentation) - missing summary
- `src/CardinalDirection/CardinalDirection.schema.ts:1` (packageDocumentation) - missing summary
- `src/Sex/Sex.schema.ts:1` (packageDocumentation) - missing summary

Export findings:
- `src/Age/Age.schema.ts:16` `Age` (const) - missing @example
- `src/Age/Age.schema.ts:34` `Age` (type) - missing @example
- `src/Age/Age.schema.ts:16` `Schema` (const) - missing @example
- `src/Age/Age.schema.ts:34` `Schema` (type) - missing @example
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
- `src/CardinalDirection/CardinalDirection.schema.ts:16` `CardinalDirection` (const) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:27` `CardinalDirection` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:35` `CardinalDirectionAbbrev` (const) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:47` `CardinalDirectionAbbrev` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:16` `Schema` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/CardinalDirection/CardinalDirection.schema.ts:27` `Schema` (type) - missing @example
- `src/CardinalDirection/CardinalDirection.schema.ts:35` `Abbrev` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/CardinalDirection/CardinalDirection.schema.ts:47` `Abbrev` (type) - missing @example
- `src/CardinalDirection/index.ts:22` `export * from "./CardinalDirection.schema.ts";` (re-export) - missing @example
- `src/CauseTaggedError/index.ts:12` `export * from "./CauseTaggedError.errors.ts";` (re-export) - missing @example
- `src/Color/Color.adjust.ts:83` `RgbaColorString` (const) - missing @example
- `src/Color/Color.adjust.ts:96` `RgbaColorString` (type) - missing @example
- `src/Color/Color.adjust.ts:104` `ColorAmount` (const) - missing @example
- `src/Color/Color.adjust.ts:117` `ColorAmount` (type) - missing @example
- `src/Color/Color.adjust.ts:125` `MixColorsInput` (class) - missing @example
- `src/Color/Color.adjust.ts:142` `MixColors` (const) - missing @example
- `src/Color/Color.adjust.ts:158` `MixColors` (type) - missing @example
- `src/Color/Color.adjust.ts:166` `LightenInput` (class) - missing @example
- `src/Color/Color.adjust.ts:182` `Lighten` (const) - missing @example
- `src/Color/Color.adjust.ts:198` `Lighten` (type) - missing @example
- `src/Color/Color.adjust.ts:206` `DarkenInput` (class) - missing @example
- `src/Color/Color.adjust.ts:222` `Darken` (const) - missing @example
- `src/Color/Color.adjust.ts:238` `Darken` (type) - missing @example
- `src/Color/Color.adjust.ts:246` `WithAlphaInput` (class) - missing @example
- `src/Color/Color.adjust.ts:262` `WithAlpha` (const) - missing @example
- `src/Color/Color.adjust.ts:278` `WithAlpha` (type) - missing @example
- `src/Color/Color.hex.ts:64` `hexToRgbValue` (const) - missing @example
- `src/Color/Color.hex.ts:93` `rgbToHexValue` (const) - missing @example
- `src/Color/Color.hex.ts:105` `HexColorInput` (const) - missing @example
- `src/Color/Color.hex.ts:117` `HexColorInput` (type) - missing @example
- `src/Color/Color.hex.ts:125` `HexColor` (const) - missing @example
- `src/Color/Color.hex.ts:138` `HexColor` (type) - missing @example
- `src/Color/Color.hex.ts:146` `NormalizeHexColor` (const) - missing @example
- `src/Color/Color.hex.ts:165` `NormalizeHexColor` (type) - missing @example
- `src/Color/Color.oklch.ts:68` `rgbToOklchValue` (const) - missing @example
- `src/Color/Color.oklch.ts:102` `oklchToRgbValue` (const) - missing @example
- `src/Color/Color.oklch.ts:131` `OklchCoordinate` (const) - missing @example
- `src/Color/Color.oklch.ts:144` `OklchCoordinate` (type) - missing @example
- `src/Color/Color.oklch.ts:152` `OklchLightness` (const) - missing @example
- `src/Color/Color.oklch.ts:166` `OklchLightness` (type) - missing @example
- `src/Color/Color.oklch.ts:174` `OklchChroma` (const) - missing @example
- `src/Color/Color.oklch.ts:188` `OklchChroma` (type) - missing @example
- `src/Color/Color.oklch.ts:196` `OklchHue` (const) - missing @example
- `src/Color/Color.oklch.ts:210` `OklchHue` (type) - missing @example
- `src/Color/Color.oklch.ts:218` `OklchInput` (class) - missing @example
- `src/Color/Color.oklch.ts:235` `OklchColor` (class) - missing @example
- `src/Color/Color.rgb.ts:30` `RgbInputChannel` (const) - missing @example
- `src/Color/Color.rgb.ts:43` `RgbInputChannel` (type) - missing @example
- `src/Color/Color.rgb.ts:51` `RgbChannel` (const) - missing @example
- `src/Color/Color.rgb.ts:65` `RgbChannel` (type) - missing @example
- `src/Color/Color.rgb.ts:73` `RgbInput` (class) - missing @example
- `src/Color/Color.rgb.ts:90` `Rgb` (class) - missing @example
- `src/Color/Color.scale.ts:124` `HexColorScale12` (const) - missing @example
- `src/Color/Color.scale.ts:139` `HexColorScale12` (type) - missing @example
- `src/Color/Color.scale.ts:155` `GenerateScaleInput` (class) - missing @example
- `src/Color/Color.scale.ts:171` `GenerateScale` (const) - missing @example
- `src/Color/Color.scale.ts:189` `GenerateScale` (type) - missing @example
- `src/Color/Color.scale.ts:197` `GenerateNeutralScaleInput` (class) - missing @example
- `src/Color/Color.scale.ts:213` `GenerateNeutralScale` (const) - missing @example
- `src/Color/Color.scale.ts:231` `GenerateNeutralScale` (type) - missing @example
- `src/Color/Color.scale.ts:239` `GenerateAlphaScaleInput` (class) - missing @example
- `src/Color/Color.scale.ts:255` `GenerateAlphaScale` (const) - missing @example
- `src/Color/Color.scale.ts:273` `GenerateAlphaScale` (type) - missing @example
- `src/Color/Color.shared.ts:18` `$I` (const) - missing @example
- `src/Color/Color.shared.ts:27` `schemaIssueToError` (const) - missing @example
- `src/Color/Color.shared.ts:36` `RgbEncoded` (type) - missing @example
- `src/Color/Color.shared.ts:49` `OklchEncoded` (type) - missing @example
- `src/Color/Color.transforms.ts:22` `oklchToHexValue` (const) - missing @example
- `src/Color/Color.transforms.ts:30` `hexToOklchValue` (const) - missing @example
- `src/Color/Color.transforms.ts:38` `HexToRgb` (const) - missing @example
- `src/Color/Color.transforms.ts:57` `HexToRgb` (type) - missing @example
- `src/Color/Color.transforms.ts:65` `RgbToHex` (const) - missing @example
- `src/Color/Color.transforms.ts:81` `RgbToHex` (type) - missing @example
- `src/Color/Color.transforms.ts:89` `RgbToOklch` (const) - missing @example
- `src/Color/Color.transforms.ts:105` `RgbToOklch` (type) - missing @example
- `src/Color/Color.transforms.ts:113` `OklchToRgb` (const) - missing @example
- `src/Color/Color.transforms.ts:129` `OklchToRgb` (type) - missing @example
- `src/Color/Color.transforms.ts:137` `HexToOklch` (const) - missing @example
- `src/Color/Color.transforms.ts:156` `HexToOklch` (type) - missing @example
- `src/Color/Color.transforms.ts:164` `OklchToHex` (const) - missing @example
- `src/Color/Color.transforms.ts:180` `OklchToHex` (type) - missing @example
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
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:30` `CoepValue` (const) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:41` `CoepValue` (type) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:49` `CrossOriginEmbedderPolicyOption` (const) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:60` `CrossOriginEmbedderPolicyOption` (type) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:67` `COEPResponseHeader` (class) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:89` `CrossOriginEmbedderPolicyHeader` (const) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:166` `CrossOriginEmbedderPolicyHeader` (type) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:67` `ResponseHeader` (class) - missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:89` `Header` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:166` `Header` (type) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:49` `Option` (const) - missing summary; missing @example
- `src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts:60` `Option` (type) - missing summary; missing @example
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
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:28` `CorpValue` (const) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:39` `CorpValue` (type) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:47` `CrossOriginResourcePolicyOption` (const) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:58` `CrossOriginResourcePolicyOption` (type) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:64` `CrossOriginResourcePolicyResponseHeader` (class) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:82` `CrossOriginResourcePolicyHeader` (const) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:140` `CrossOriginResourcePolicyHeader` (type) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:82` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:140` `Header` (type) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:47` `Option` (const) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:58` `Option` (type) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts:64` `ResponseHeader` (class) - missing summary; missing @example
- `src/CrossOriginResourcePolicy/index.ts:20` `export * from "./CrossOriginResourcePolicy.schema.ts";` (re-export) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:60` `CryptoTxnHash` (const) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:73` `CryptoTxnHash` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:81` `CryptoTxnHashRedacted` (const) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:97` `CryptoTxnHashRedacted` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:60` `Schema` (const) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:73` `Schema` (type) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:81` `Redacted` (const) - missing @example
- `src/CryptoTxnHash/CryptoTxnHash.schema.ts:97` `Redacted` (type) - missing @example
- `src/CryptoTxnHash/index.ts:22` `export * from "./CryptoTxnHash.schema.ts";` (re-export) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:181` `CryptoWalletAddress` (const) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:194` `CryptoWalletAddress` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:202` `CryptoWalletAddressRedacted` (const) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:218` `CryptoWalletAddressRedacted` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:181` `Schema` (const) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:194` `Schema` (type) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:202` `Redacted` (const) - missing @example
- `src/CryptoWalletAddress/CryptoWalletAddress.schema.ts:218` `Redacted` (type) - missing @example
- `src/CryptoWalletAddress/index.ts:22` `export * from "./CryptoWalletAddress.schema.ts";` (re-export) - missing @example
- `src/Csp/Csp.schema.ts:26` `DirectiveSource` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:36` `DirectiveSource` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:48` `ContentSecurityPolicyHeaderName` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:59` `ContentSecurityPolicyHeaderName` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:117` `createDirectiveValue` (const) - missing @example
- `src/Csp/Csp.schema.ts:146` `PluginTypes` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:156` `PluginTypes` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:179` `Sandbox` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:190` `Sandbox` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:233` `FetchDirective` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:302` `DocumentDirective` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:346` `NavigationDirective` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:390` `ReportURI` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:400` `ReportingDirective` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:436` `CspDirectives` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:451` `ContentSecurityPolicyOptionStruct` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:483` `ContentSecurityPolicyOption` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:493` `ContentSecurityPolicyOption` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:499` `ContentSecurityPolicyResponseHeader` (class) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:557` `createContentSecurityPolicyOptionHeaderValue` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:583` `ContentSecurityPolicyHeader` (const) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:648` `ContentSecurityPolicyHeader` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:583` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:648` `Header` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:483` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/Csp/Csp.schema.ts:493` `Option` (type) - missing summary; missing @example
- `src/Csp/Csp.schema.ts:499` `ResponseHeader` (class) - missing summary; missing @example
- `src/Csp/index.ts:20` `export * from "./Csp.schema.ts";` (re-export) - missing @example
- `src/Csv/Csv.schema.ts:38` `RowSchemaWithFields` (type) - missing @example
- `src/Csv/Csv.schema.ts:48` `CsvDocument` (type) - missing @example
- `src/Csv/Csv.schema.ts:316` `CsvText` (type) - missing @example
- `src/Csv/Csv.schema.ts:332` `CSV` (type) - missing @example
- `src/Csv/Csv.schema.ts:340` `Schema` (type) - missing @example
- `src/Csv/index.ts:12` `export * from "./Csv.schema.ts";` (re-export) - missing @example
- `src/CsvCodecOptions/CsvCodecOptions.schema.ts:38` `CsvCodecOptions` (class) - missing @example
- `src/CsvCodecOptions/CsvCodecOptions.schema.ts:105` `CsvCodecOptionsArgs` (type) - missing @example
- `src/CsvCodecOptions/CsvCodecOptions.schema.ts:113` `CsvCodecOptionsParseOptions` (const) - missing @example
- `src/CsvCodecOptions/CsvCodecOptions.schema.ts:38` `Schema` (class) - missing @example
- `src/CsvCodecOptions/CsvCodecOptions.schema.ts:113` `ParseOptions` (const) - missing @example
- `src/CsvCodecOptions/index.ts:21` `export * from "./CsvCodecOptions.schema.ts";` (re-export) - missing @example
- `src/CsvError/CsvError.errors.ts:35` `CsvError` (class) - missing @example
- `src/CsvError/CsvError.errors.ts:43` `csvError` (const) - missing @example
- `src/CsvError/CsvError.errors.ts:35` `Error` (class) - missing @example
- `src/CsvError/CsvError.errors.ts:43` `make` (const) - missing @example
- `src/CsvError/index.ts:21` `export * from "./CsvError.errors.ts";` (re-export) - missing @example
- `src/CsvFormatter/CsvFormatter.formatter.ts:101` `formatCsvHeaderRow` (const) - missing @example
- `src/CsvFormatter/CsvFormatter.formatter.ts:126` `formatCsvDataRow` (const) - missing @example
- `src/CsvFormatter/CsvFormatter.formatter.ts:153` `formatCsvDocument` (const) - missing @example
- `src/CsvFormatter/CsvFormatter.formatter.ts:153` `format` (const) - missing @example
- `src/CsvFormatter/index.ts:20` `export * from "./CsvFormatter.formatter.ts";` (re-export) - missing @example
- `src/CsvParser/CsvParser.parser.ts:99` `ParsedField` (class) - missing summary; missing @example
- `src/CsvParser/CsvParser.parser.ts:244` `ParsedRow` (class) - missing summary; missing @example
- `src/CsvParser/CsvParser.parser.ts:380` `parseCsvRows` (const) - missing @example
- `src/CsvParser/CsvParser.parser.ts:380` `parse` (const) - missing @example
- `src/CsvParser/index.ts:20` `export * from "./CsvParser.parser.ts";` (re-export) - missing @example
- `src/Cuid.ts:19` `sha512` (const) - missing @example
- `src/Cuid.ts:34` `Cuid` (const) - missing @example
- `src/Cuid.ts:45` `Cuid` (type) - missing @example
- `src/Cuid.ts:53` `isCuid` (const) - missing @example
- `src/Cuid.ts:62` `CuidSeed` (type) - missing @example
- `src/Cuid.ts:75` `CuidState` (class) - missing @example
- `src/Cuid.ts:117` `cuid` (const) - missing @example
- `src/CurrencyCode.ts:51` `CurrencyCode` (type) - 1 unsafe example violation(s)
- `src/CurrencyCode.ts:89` `EUR` (const) - missing @example
- `src/CurrencyCode.ts:96` `GBP` (const) - missing @example
- `src/CurrencyCode.ts:103` `JPY` (const) - missing @example
- `src/CurrencyCode.ts:110` `CHF` (const) - missing @example
- `src/CurrencyCode.ts:117` `CAD` (const) - missing @example
- `src/CurrencyCode.ts:124` `AUD` (const) - missing @example
- `src/CurrencyCode.ts:131` `CNY` (const) - missing @example
- `src/CurrencyCode.ts:138` `HKD` (const) - missing @example
- `src/CurrencyCode.ts:145` `SGD` (const) - missing @example
- `src/DateTimeUtcFromValid/index.ts:12` `export * from "./DateTimeUtcFromValid.schema.ts";` (re-export) - missing @example
- `src/DomainModel.ts:33` `defaultFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/DomCssProperties/DomCssProperties.schema.ts:20` `isCSSProperties` (const) - missing @example
- `src/DomCssProperties/DomCssProperties.schema.ts:33` `DOMCssProperties` (const) - missing @example
- `src/DomCssProperties/DomCssProperties.schema.ts:33` `DomCssProperties` (const) - missing @example
- `src/DomCssProperties/DomCssProperties.schema.ts:33` `Schema` (const) - missing @example
- `src/DomCssProperties/index.ts:20` `export * from "./DomCssProperties.schema.ts";` (re-export) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:18` `isDragEvent` (const) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:26` `DOMDragEvent` (const) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:38` `DOMDragEvent` (type) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:26` `DomDragEvent` (const) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:38` `DomDragEvent` (type) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:26` `Schema` (const) - missing @example
- `src/DomDragEvent/DomDragEvent.schema.ts:38` `Schema` (type) - missing @example
- `src/DomDragEvent/index.ts:20` `export * from "./DomDragEvent.schema.ts";` (re-export) - missing @example
- `src/DomEvent/DomEvent.schema.ts:18` `isEvent` (const) - missing @example
- `src/DomEvent/DomEvent.schema.ts:26` `DOMEvent` (const) - missing @example
- `src/DomEvent/DomEvent.schema.ts:38` `DOMEvent` (type) - missing @example
- `src/DomEvent/DomEvent.schema.ts:26` `DomEvent` (const) - missing @example
- `src/DomEvent/DomEvent.schema.ts:38` `DomEvent` (type) - missing @example
- `src/DomEvent/DomEvent.schema.ts:26` `Schema` (const) - missing @example
- `src/DomEvent/DomEvent.schema.ts:38` `Schema` (type) - missing @example
- `src/DomEvent/index.ts:20` `export * from "./DomEvent.schema.ts";` (re-export) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:18` `isHTMLElement` (const) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:26` `DOMHtmlElement` (const) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:38` `DOMHtmlElement` (type) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:26` `DomHtmlElement` (const) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:38` `DomHtmlElement` (type) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:26` `Schema` (const) - missing @example
- `src/DomHtmlElement/DomHtmlElement.schema.ts:38` `Schema` (type) - missing @example
- `src/DomHtmlElement/index.ts:20` `export * from "./DomHtmlElement.schema.ts";` (re-export) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:18` `isMouseEvent` (const) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:26` `DOMMouseEvent` (const) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:38` `DOMMouseEvent` (type) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:26` `DomMouseEvent` (const) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:38` `DomMouseEvent` (type) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:26` `Schema` (const) - missing @example
- `src/DomMouseEvent/DomMouseEvent.schema.ts:38` `Schema` (type) - missing @example
- `src/DomMouseEvent/index.ts:20` `export * from "./DomMouseEvent.schema.ts";` (re-export) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:20` `isReactNode` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:40` `DOMReactNode` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:52` `DOMReactNode` (type) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:60` `isReactRef` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:77` `createDOMRefSchema` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:40` `DomReactNode` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:52` `DomReactNode` (type) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:40` `Schema` (const) - missing @example
- `src/DomReactNode/DomReactNode.schema.ts:52` `Schema` (type) - missing @example
- `src/DomReactNode/index.ts:20` `export * from "./DomReactNode.schema.ts";` (re-export) - missing @example
- `src/Duration/Duration.input.ts:94` `DurationUnit` (type) - missing @example
- `src/Duration/Duration.input.ts:102` `Unit` (type) - missing @example
- `src/Duration/Duration.input.ts:185` `DurationInput` (type) - missing @example
- `src/Duration/Duration.input.ts:240` `DurationFromInput` (type) - missing @example
- `src/Duration/Duration.input.ts:165` `Input` (const) - 1 schema annotation/type-alias gap(s)
- `src/Duration/Duration.input.ts:185` `Input` (type) - missing @example
- `src/Duration/Duration.schema.ts:33` `Schema` (type) - missing @example
- `src/Duration/Duration.schema.ts:41` `Duration` (const) - missing @example
- `src/Duration/Duration.schema.ts:49` `Duration` (type) - missing @example
- `src/Duration/Duration.transforms.ts:12` `export { DurationFromInput, DurationFromInput as FromInput } from "./Duration.input.ts";` (re-export) - missing @example
- `src/Duration/index.ts:20` `export * from "./Duration.input.ts";` (re-export) - missing @example
- `src/Duration/index.ts:25` `export * from "./Duration.schema.ts";` (re-export) - missing @example
- `src/Duration/index.ts:30` `export * from "./Duration.transforms.ts";` (re-export) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:44` `persist` (const) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:62` `DateTimeFromMillis` (const) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:70` `int` (const) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:78` `literal` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/EntitySchema/EntitySchema.constructors.ts:90` `tableNameFromIdentifier` (const) - missing @example
- `src/EntitySchema/EntitySchema.constructors.ts:101` `columnNameFor` (const) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:34` `Definition` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:60` `EncodedShape` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:70` `TypeShape` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:80` `SchemaAnnotations` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:88` `SnakeCase` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:96` `LastPathSegment` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:106` `TableNameFromIdentifier` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:114` `ColumnNameFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:126` `ClassInput` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:144` `defineClassInput` (const) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:159` `VariantFieldFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:188` `VariantFieldForInput` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:199` `VariantFieldsFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:211` `EntityClass` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:237` `EntityClass` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.definition.ts:263` `Assign` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:273` `AssignPersisted` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:284` `AssignedEntityParts` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:300` `AssignedPersisted` (type) - missing @example
- `src/EntitySchema/EntitySchema.definition.ts:317` `assignEntityParts` (const) - missing @example
- `src/EntitySchema/EntitySchema.factory.ts:50` `ClassFactory` (type) - missing @example
- `src/EntitySchema/EntitySchema.factory.ts:540` `ClassFactory` (const) - missing @example
- `src/EntitySchema/EntitySchema.factory.ts:561` `getDefinition` (const) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:16` `Fields` (type) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:24` `EntityVariantFieldInput` (type) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:36` `EntityFieldInput` (type) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:44` `EntityFieldInputs` (type) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:52` `SelectedFieldOf` (type) - missing @example
- `src/EntitySchema/EntitySchema.fields.ts:68` `SelectedFieldsOf` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:19` `StorageKind` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:41` `StorageKind` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:49` `ValueStrategy` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:70` `ValueStrategy` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:78` `PersistStrategy` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:86` `PersistStrategy` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:94` `IndexHintKind` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:106` `IndexHintKind` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:126` `IndexHint` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:140` `IndexHint` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:148` `EncodedAbsenceKind` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:170` `EncodedAbsenceKind` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:178` `PersistOptions` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:217` `PersistDescriptor` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:242` `PersistDescriptor` (namespace) - 1 unsafe example violation(s)
- `src/EntitySchema/EntitySchema.persist.ts:291` `PersistDescriptor` (const) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:306` `PersistDescriptorByValueStrategy` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:324` `EntityIdLike` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:367` `PersistDescriptorFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:381` `PersistDescriptorForInput` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:389` `PersistedFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:399` `PersistedMap` (type) - missing @example
- `src/EntitySchema/EntitySchema.persist.ts:416` `CheckedPersistedFor` (type) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:54` `EntityFieldInputError` (class) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:72` `EntitySchemaAttachmentError` (class) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:144` `EncodedFieldShape` (const) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:173` `EncodedFieldShape` (type) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:181` `encodedAstFor` (const) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:217` `encodedFieldShape` (const) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:237` `selectedRowFieldShape` (const) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:257` `isEncodedNullable` (const) - missing @example
- `src/EntitySchema/EntitySchema.shape.ts:265` `isEncodedOptional` (const) - missing @example
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
- `src/EthAmount/EthAmount.schema.ts:46` `EthAmount` (const) - missing @example
- `src/EthAmount/EthAmount.schema.ts:62` `EthAmount` (type) - missing @example
- `src/EthAmount/EthAmount.schema.ts:46` `Schema` (const) - missing @example
- `src/EthAmount/EthAmount.schema.ts:62` `Schema` (type) - missing @example
- `src/EthAmount/index.ts:22` `export * from "./EthAmount.schema.ts";` (re-export) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:41` `EthereumValidatorPublicKey` (const) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:54` `EthereumValidatorPublicKey` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:62` `EthereumValidatorPublicKeyRedacted` (const) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:78` `EthereumValidatorPublicKeyRedacted` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:41` `Schema` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:54` `Schema` (type) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:62` `Redacted` (const) - missing @example
- `src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts:78` `Redacted` (type) - missing @example
- `src/EthereumValidatorPublicKey/index.ts:22` `export * from "./EthereumValidatorPublicKey.schema.ts";` (re-export) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:78` `EvmAddress` (const) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:91` `EvmAddress` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:99` `EvmAddressRedacted` (const) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:115` `EvmAddressRedacted` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:78` `Schema` (const) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:91` `Schema` (type) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:99` `Redacted` (const) - missing @example
- `src/EvmAddress/EvmAddress.schema.ts:115` `Redacted` (type) - missing @example
- `src/EvmAddress/index.ts:22` `export * from "./EvmAddress.schema.ts";` (re-export) - missing @example
- `src/ExpectCt/ExpectCt.schema.ts:28` `ExpectCTConfig` (class) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:43` `ExpectCTEnabled` (const) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:53` `ExpectCTEnabled` (type) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:59` `ExpectCTOption` (const) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:69` `ExpectCTOption` (type) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:75` `ExpectCTResponseHeader` (class) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:151` `ExpectCTHeader` (const) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:208` `ExpectCTHeader` (type) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:28` `Config` (class) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:151` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ExpectCt/ExpectCt.schema.ts:208` `Header` (type) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:59` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ExpectCt/ExpectCt.schema.ts:69` `Option` (type) - missing summary; missing @example
- `src/ExpectCt/ExpectCt.schema.ts:75` `ResponseHeader` (class) - missing summary; missing @example
- `src/ExpectCt/index.ts:20` `export * from "./ExpectCt.schema.ts";` (re-export) - missing @example
- `src/FileExtension.ts:121` `ApplicationFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:160` `VideoFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:199` `TextFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:238` `ImageFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:277` `AudioFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:315` `MiscFileExtension` (type) - 1 unsafe example violation(s)
- `src/FileExtension.ts:358` `FileExtension` (type) - 1 unsafe example violation(s)
- `src/FileName.ts:100` `FileName` (const) - missing summary; missing @example
- `src/FileName.ts:118` `FileName` (type) - 1 unsafe example violation(s)
- `src/FilePath/FilePath.guards.ts:49` `HasNullByte` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:58` `SupportedWindowsNamespace` (const) - missing @example
- `src/FilePath/FilePath.guards.ts:78` `SupportedWindowsNamespace` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:86` `UsesPosixSeparator` (const) - missing @example
- `src/FilePath/FilePath.guards.ts:106` `UsesPosixSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:114` `UsesWindowsSeparator` (const) - missing @example
- `src/FilePath/FilePath.guards.ts:134` `UsesWindowsSeparator` (type) - missing @example
- `src/FilePath/FilePath.guards.ts:142` `EndsWithSeparator` (const) - missing @example
- `src/FilePath/FilePath.guards.ts:162` `EndsWithSeparator` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:19` `WindowsDriveRoot` (const) - missing @example
- `src/FilePath/FilePath.roots.ts:39` `WindowsDriveRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:47` `WindowsUncRoot` (const) - missing @example
- `src/FilePath/FilePath.roots.ts:67` `WindowsUncRoot` (type) - missing @example
- `src/FilePath/FilePath.roots.ts:79` `HasLeafSegment` (const) - missing @example
- `src/FilePath/FilePath.roots.ts:126` `HasLeafSegment` (type) - missing @example
- `src/FilePath/FilePath.schema.ts:31` `SupportedPathFamily` (const) - missing @example
- `src/FilePath/FilePath.schema.ts:43` `SupportedPathFamily` (type) - missing @example
- `src/FilePath/FilePath.schema.ts:152` `FilePath` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:25` `WindowsDotSegment` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:37` `WindowsDotSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:46` `ValidWindowsPlainPathSegment` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:87` `ValidWindowsPlainPathSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:97` `ValidWindowsRootSegment` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:117` `ValidWindowsRootSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:126` `ValidWindowsPathSegment` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:139` `ValidWindowsPathSegment` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:147` `WindowsSegments` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:160` `WindowsSegments` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:169` `ValidWindowsUncRest` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:182` `ValidWindowsUncRest` (type) - missing @example
- `src/FilePath/FilePath.segments.ts:190` `ValidWindowsUncSegments` (const) - missing @example
- `src/FilePath/FilePath.segments.ts:206` `ValidWindowsUncSegments` (type) - missing @example
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
- `src/FilePath/FilePath.windows.ts:35` `WindowsDrivePath` (const) - missing @example
- `src/FilePath/FilePath.windows.ts:82` `WindowsDrivePath` (type) - missing @example
- `src/FilePath/FilePath.windows.ts:91` `WindowsUncPath` (const) - missing @example
- `src/FilePath/FilePath.windows.ts:144` `WindowsUncPath` (type) - missing @example
- `src/FilePath/FilePath.windows.ts:153` `WindowsRelativePath` (const) - missing @example
- `src/FilePath/FilePath.windows.ts:218` `WindowsRelativePath` (type) - missing @example
- `src/FilePath/index.ts:14` `export * from "./FilePath.guards.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:19` `export * from "./FilePath.roots.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:24` `export * from "./FilePath.schema.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:29` `export * from "./FilePath.segments.ts";` (re-export) - missing @example
- `src/FilePath/index.ts:34` `export * from "./FilePath.windows.ts";` (re-export) - missing @example
- `src/Float16Array.ts:52` `isFloat16Array` (const) - missing @example
- `src/Float16Array.ts:86` `Float16Arr` (type) - missing @example
- `src/Float16Array.ts:137` `Float16ArrayFromArray` (type) - missing @example
- `src/Float16Array.ts:145` `Float16ArrayFromArray` (namespace) - missing @example
- `src/Float16Array.ts:179` `Float16ArrayField` (const) - missing @example
- `src/Float32Array.ts:54` `Float32Arr` (type) - missing @example
- `src/Float32Array.ts:102` `Float32ArrayFromArray` (type) - missing @example
- `src/Float32Array.ts:110` `Float32ArrayFromArray` (namespace) - missing @example
- `src/Float32Array.ts:144` `Float32ArrayField` (const) - missing @example
- `src/Float64Array.ts:54` `Float64Arr` (type) - missing @example
- `src/Float64Array.ts:102` `Float64ArrayFromArray` (type) - missing @example
- `src/Float64Array.ts:110` `Float64ArrayFromArray` (namespace) - missing @example
- `src/Float64Array.ts:144` `Float64ArrayField` (const) - missing @example
- `src/Fn/Fn.schema.ts:457` `ThunkOf` (function) - missing @example
- `src/Fn/Fn.schema.ts:467` `ThunkOf` (function) - missing @example
- `src/Fn/Fn.schema.ts:582` `Fn` (function) - missing @example
- `src/Fn/Fn.schema.ts:130` `FnType` (type) - 1 unsafe example violation(s)
- `src/Fn/Fn.schema.ts:174` `FnSchemaNoArg` (interface) - missing @example
- `src/Fn/Fn.schema.ts:193` `FnSchemaUnary` (interface) - missing @example
- `src/Fn/Fn.schema.ts:213` `FnSchema` (type) - missing @example
- `src/Fn/Fn.schema.ts:229` `FnSchemaStatics` (type) - missing @example
- `src/Fn/Fn.schema.ts:426` `AnyFn` (type) - missing @example
- `src/Fn/index.ts:12` `export * from "./Fn.schema.ts";` (re-export) - missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:28` `ForceHttpsRedirectConfig` (class) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:43` `ForceHttpsRedirectEnabled` (const) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:53` `ForceHttpsRedirectEnabled` (type) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:59` `ForceHttpsRedirectOption` (const) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:69` `ForceHttpsRedirectOption` (type) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:75` `ForceHttpsRedirectResponseHeader` (class) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:104` `ForceHttpsRedirectHeader` (const) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:173` `ForceHttpsRedirectHeader` (type) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:28` `Config` (class) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:104` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:173` `Header` (type) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:59` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:69` `Option` (type) - missing summary; missing @example
- `src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts:75` `ResponseHeader` (class) - missing summary; missing @example
- `src/ForceHttpsRedirect/index.ts:20` `export * from "./ForceHttpsRedirect.schema.ts";` (re-export) - missing @example
- `src/FrameGuard/FrameGuard.schema.ts:31` `FrameGuardMode` (const) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:42` `FrameGuardMode` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:48` `FrameGuardAllowFromConfig` (class) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:61` `FrameGuardAllowFrom` (const) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:71` `FrameGuardAllowFrom` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:77` `FrameGuardOption` (const) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:87` `FrameGuardOption` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:93` `FrameGuardResponseHeader` (class) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:138` `FrameGuardHeader` (const) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:212` `FrameGuardHeader` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:138` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/FrameGuard/FrameGuard.schema.ts:212` `Header` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:31` `Mode` (const) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:42` `Mode` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:77` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/FrameGuard/FrameGuard.schema.ts:87` `Option` (type) - missing summary; missing @example
- `src/FrameGuard/FrameGuard.schema.ts:93` `ResponseHeader` (class) - missing summary; missing @example
- `src/FrameGuard/index.ts:20` `export * from "./FrameGuard.schema.ts";` (re-export) - missing @example
- `src/Glob/Glob.schema.ts:118` `Glob` (type) - missing @example
- `src/Glob/Glob.schema.ts:126` `Schema` (const) - missing @example
- `src/Glob/Glob.schema.ts:134` `Schema` (type) - missing @example
- `src/Glob/index.ts:12` `export * from "./Glob.schema.ts";` (re-export) - missing @example
- `src/Graph/Graph.edge.ts:20` `EdgeFromSelf` (interface) - missing @example
- `src/Graph/Graph.edge.ts:60` `EdgeFromSelf` (const) - missing @example
- `src/Graph/Graph.edge.ts:37` `EdgeTransform` (interface) - missing @example
- `src/Graph/Graph.edge.ts:123` `EdgeTransform` (const) - missing @example
- `src/Graph/Graph.edge.ts:49` `Edge` (interface) - missing @example
- `src/Graph/Graph.encoded.ts:19` `EdgeEncoded` (type) - missing @example
- `src/Graph/Graph.encoded.ts:118` `EdgeEncoded` (const) - missing @example
- `src/Graph/Graph.encoded.ts:31` `GraphEncoded` (type) - missing @example
- `src/Graph/Graph.encoded.ts:141` `GraphEncoded` (const) - missing @example
- `src/Graph/Graph.encoded.ts:50` `EdgeIso` (type) - missing @example
- `src/Graph/Graph.encoded.ts:63` `GraphIso` (type) - missing @example
- `src/Graph/Graph.encoded.ts:81` `EdgeEncodedSchema` (interface) - missing @example
- `src/Graph/Graph.encoded.ts:98` `GraphEncodedSchema` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:31` `GraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:247` `GraphFromSelf` (const) - missing @example
- `src/Graph/Graph.from-self.ts:49` `DirectedGraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:265` `DirectedGraphFromSelf` (const) - missing @example
- `src/Graph/Graph.from-self.ts:67` `UndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:286` `UndirectedGraphFromSelf` (const) - missing @example
- `src/Graph/Graph.from-self.ts:85` `MutableGraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:307` `MutableGraphFromSelf` (const) - missing @example
- `src/Graph/Graph.from-self.ts:103` `MutableDirectedGraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:325` `MutableDirectedGraphFromSelf` (const) - missing @example
- `src/Graph/Graph.from-self.ts:121` `MutableUndirectedGraphFromSelf` (interface) - missing @example
- `src/Graph/Graph.from-self.ts:346` `MutableUndirectedGraphFromSelf` (const) - missing @example
- `src/Graph/Graph.guards.ts:18` `isEdge` (const) - missing @example
- `src/Graph/Graph.guards.ts:28` `isGraph` (const) - missing @example
- `src/Graph/Graph.primitives.ts:43` `NodeIndex` (type) - missing @example
- `src/Graph/Graph.primitives.ts:75` `EdgeIndex` (const) - missing @example
- `src/Graph/Graph.primitives.ts:88` `EdgeIndex` (type) - missing @example
- `src/Graph/Graph.primitives.ts:96` `EdgeIndexFromString` (const) - missing @example
- `src/Graph/Graph.primitives.ts:109` `GraphKind` (const) - missing @example
- `src/Graph/Graph.primitives.ts:121` `GraphKind` (type) - missing @example
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
- `src/Graph/Graph.transforms.ts:184` `UndirectedGraph` (const) - missing @example
- `src/Graph/Graph.transforms.ts:53` `MutableDirectedGraph` (interface) - missing @example
- `src/Graph/Graph.transforms.ts:208` `MutableDirectedGraph` (const) - missing @example
- `src/Graph/Graph.transforms.ts:66` `MutableUndirectedGraph` (interface) - missing @example
- `src/Graph/Graph.transforms.ts:232` `MutableUndirectedGraph` (const) - missing @example
- `src/Graph/index.ts:14` `export * from "./Graph.edge.ts";` (re-export) - missing @example
- `src/Graph/index.ts:19` `export * from "./Graph.encoded.ts";` (re-export) - missing @example
- `src/Graph/index.ts:24` `export * from "./Graph.from-self.ts";` (re-export) - missing @example
- `src/Graph/index.ts:29` `export * from "./Graph.guards.ts";` (re-export) - missing @example
- `src/Graph/index.ts:34` `export * from "./Graph.primitives.ts";` (re-export) - missing @example
- `src/Graph/index.ts:39` `export * from "./Graph.transforms.ts";` (re-export) - missing @example
- `src/Http/Http.headers.shared.ts:22` `ArrayOfStrOrStr` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:32` `ArrayOfStrOrStr` (type) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:38` `StringOrUrl` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:48` `StringOrUrl` (type) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:54` `EncodedStrictURIFromStrOrURL` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:78` `EncodedStrictURIFromStrOrURL` (type) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:87` `encodeStrictURI` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:94` `wrapArray` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:101` `ResponseHeader` (class) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:115` `makeHeaderEncodeForbidden` (const) - missing summary; missing @example
- `src/Http/Http.headers.shared.ts:144` `makeResponseHeaderOption` (const) - missing summary; missing @example
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
- `src/HttpMethod/HttpMethod.schema.ts:19` `HttpMethod_` (const) - missing summary; missing @example; 2 schema annotation/type-alias gap(s)
- `src/HttpMethod/HttpMethod.schema.ts:49` `HttpMethod` (const) - missing summary; missing @example
- `src/HttpMethod/HttpMethod.schema.ts:79` `HttpMethod` (type) - missing summary; missing @example
- `src/HttpMethod/HttpMethod.schema.ts:49` `Schema` (const) - missing summary; missing @example
- `src/HttpMethod/HttpMethod.schema.ts:79` `Schema` (type) - missing summary; missing @example
- `src/HttpMethod/HttpMethod.schema.ts:19` `Literal` (const) - missing summary; missing @example; 2 schema annotation/type-alias gap(s)
- `src/HttpMethod/index.ts:22` `export * from "./HttpMethod.schema.ts";` (re-export) - missing @example
- `src/HttpProtocol/HttpProtocol.schema.ts:18` `HttpProtocol` (const) - missing @example
- `src/HttpProtocol/HttpProtocol.schema.ts:30` `HttpProtocol` (type) - missing @example
- `src/HttpProtocol/HttpProtocol.schema.ts:18` `Schema` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/HttpProtocol/HttpProtocol.schema.ts:30` `Schema` (type) - missing @example
- `src/HttpProtocol/index.ts:22` `export * from "./HttpProtocol.schema.ts";` (re-export) - missing @example
- `src/HttpStatus/HttpStatus.category.ts:19` `HttpStatusCategory` (const) - missing @example
- `src/HttpStatus/HttpStatus.category.ts:47` `HttpStatusCategory` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:23` `BadRequest` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:37` `BadRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:51` `Unauthorized` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:72` `Unauthorized` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:82` `PaymentRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:96` `PaymentRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:111` `Forbidden` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:125` `Forbidden` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:137` `NotFound` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:151` `NotFound` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:160` `MethodNotAllowed` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:174` `MethodNotAllowed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:183` `NotAcceptable` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:197` `NotAcceptable` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:207` `ProxyAuthenticationRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:221` `ProxyAuthenticationRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:234` `RequestTimeout` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:248` `RequestTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:259` `Conflict` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.core.ts:273` `Conflict` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:18` `MisdirectedRequest` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:31` `MisdirectedRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:42` `UnprocessableEntity` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:56` `UnprocessableEntity` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:64` `Locked` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:77` `Locked` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:86` `FailedDependency` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:100` `FailedDependency` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:109` `TooEarly` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:123` `TooEarly` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:133` `UpgradeRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:147` `UpgradeRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:159` `PreconditionRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:173` `PreconditionRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:191` `TooManyRequests` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:205` `TooManyRequests` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:215` `RequestHeaderFieldsTooLarge` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:229` `RequestHeaderFieldsTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:239` `UnavailableForLegalReasons` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.extended.ts:253` `UnavailableForLegalReasons` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:21` `Gone` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:35` `Gone` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:44` `LengthRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:58` `LengthRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:67` `PreconditionFailed` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:81` `PreconditionFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:94` `PayloadTooLarge` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:108` `PayloadTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:118` `UriTooLong` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:132` `UriTooLong` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:142` `UnsupportedMediaType` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:156` `UnsupportedMediaType` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:166` `RangeNotSatisfiable` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:180` `RangeNotSatisfiable` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:189` `ExpectationFailed` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:203` `ExpectationFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:212` `ImATeapot` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.resource.ts:226` `ImATeapot` (type) - missing @example
- `src/HttpStatus/HttpStatus.client-error.ts:56` `HttpStatus4XX` (const) - missing @example
- `src/HttpStatus/HttpStatus.client-error.ts:103` `HttpStatus4XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.client-error.ts:119` `HttpStatus4XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:23` `Continue` (const) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:37` `Continue` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:46` `SwitchingProtocols` (const) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:60` `SwitchingProtocols` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:70` `Processing` (const) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:84` `Processing` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:93` `EarlyHints` (const) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:107` `EarlyHints` (type) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:117` `HttpStatus1XX` (const) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:135` `HttpStatus1XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.informational.ts:151` `HttpStatus1XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:25` `MultipleChoices` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:43` `MultipleChoices` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:52` `MovedPermanently` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:66` `MovedPermanently` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:78` `Found` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:92` `Found` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:101` `SeeOther` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:115` `SeeOther` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:126` `NotModified` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:140` `NotModified` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:149` `UseProxy` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:163` `UseProxy` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:172` `SwitchProxy` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:186` `SwitchProxy` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:198` `TemporaryRedirect` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:212` `TemporaryRedirect` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:223` `PermanentRedirect` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:237` `PermanentRedirect` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:248` `HttpStatus3XX` (const) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:271` `HttpStatus3XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.redirection.ts:279` `HttpStatus3XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:27` `HttpStatus` (const) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:46` `HttpStatus` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:62` `HttpStatus` (type) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:70` `Schema` (const) - missing @example
- `src/HttpStatus/HttpStatus.schema.ts:78` `Schema` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.aggregate.ts:32` `HttpStatus5XX` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.aggregate.ts:57` `HttpStatus5XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.server-error.aggregate.ts:73` `HttpStatus5XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:26` `InternalServerError` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:40` `InternalServerError` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:49` `NotImplemented` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:63` `NotImplemented` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:74` `BadGateway` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:88` `BadGateway` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:99` `ServiceUnavailable` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:113` `ServiceUnavailable` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:126` `GatewayTimeout` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:140` `GatewayTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:149` `HttpVersionNotSupported` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:163` `HttpVersionNotSupported` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:175` `VariantAlsoNegotiates` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:189` `VariantAlsoNegotiates` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:198` `InsufficientStorage` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:212` `InsufficientStorage` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:221` `LoopDetected` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:234` `LoopDetected` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:243` `NotExtended` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:257` `NotExtended` (type) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:268` `NetworkAuthenticationRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.server-error.ts:282` `NetworkAuthenticationRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.shared.ts:17` `$I` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:22` `Ok` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:36` `Ok` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:44` `Created` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:57` `Created` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:67` `Accepted` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:81` `Accepted` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:92` `NonAuthoritativeInformation` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:106` `NonAuthoritativeInformation` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:115` `NoContent` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:128` `NoContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:137` `ResetContent` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:151` `ResetContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:162` `PartialContent` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:176` `PartialContent` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:186` `MultiStatus` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:200` `MultiStatus` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:210` `AlreadyReported` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:224` `AlreadyReported` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:234` `ImUsed` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:248` `ImUsed` (type) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:257` `HttpStatus2XX` (const) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:281` `HttpStatus2XX` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.success.ts:297` `HttpStatus2XX` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.aggregate.ts:32` `HttpStatusUnofficial` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.aggregate.ts:56` `HttpStatusUnofficial` (namespace) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.aggregate.ts:72` `HttpStatusUnofficial` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:23` `RequestHeaderFieldsTooLargeShopify` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:37` `RequestHeaderFieldsTooLargeShopify` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:47` `LoginTimeout` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:61` `LoginTimeout` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:70` `RequestHeaderTooLarge` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:84` `RequestHeaderTooLarge` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:93` `SslCertificateError` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:107` `SslCertificateError` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:116` `SslCertificateRequired` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:130` `SslCertificateRequired` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:139` `ClientClosedRequest` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:153` `ClientClosedRequest` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:163` `WebServerReturnedAnUnknownError` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:177` `WebServerReturnedAnUnknownError` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:187` `WebServerIsDown` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:201` `WebServerIsDown` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:210` `SslHandshakeFailed` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:224` `SslHandshakeFailed` (type) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:235` `InvalidSslCertificate` (const) - missing @example
- `src/HttpStatus/HttpStatus.unofficial.ts:249` `InvalidSslCertificate` (type) - missing @example
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
- `src/index.ts:8` `export * from "./Number.ts";` (re-export) - missing @example
- `src/index.ts:20` `export * from "./LiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:25` `export * from "./MappedLiteralKit/index.ts";` (re-export) - missing @example
- `src/index.ts:33` `export * from "./AbortSignal.ts";` (re-export) - missing @example
- `src/index.ts:38` `export * from "./ArrayOf.ts";` (re-export) - missing @example
- `src/index.ts:43` `export * from "./BigDecimal.ts";` (re-export) - missing @example
- `src/index.ts:48` `export * from "./BufferEncoding.ts";` (re-export) - missing @example
- `src/index.ts:53` `export * from "./CauseTaggedError/index.ts";` (re-export) - missing @example
- `src/index.ts:58` `export * from "./Color/index.ts";` (re-export) - missing @example
- `src/index.ts:63` `export * from "./CommonTextSchemas.ts";` (re-export) - missing @example
- `src/index.ts:68` `export { CSV, Csv, type CsvDocument, type CsvText, type RowSchemaWithFields } from "./Csv/index.ts";` (re-export) - missing @example
- `src/index.ts:73` `export * from "./DateTimeUtcFromValid/index.ts";` (re-export) - missing @example
- `src/index.ts:78` `export * as DomainModel from "./DomainModel.ts";` (re-export) - missing @example
- `src/index.ts:83` `export {
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
- `src/index.ts:100` `export * from "./EffectSchema.ts";` (re-export) - missing @example
- `src/index.ts:105` `export * from "./Email.ts";` (re-export) - missing @example
- `src/index.ts:110` `export * as EntitySchema from "./EntitySchema/index.ts";` (re-export) - missing @example
- `src/index.ts:115` `export * from "./FileExtension.ts";` (re-export) - missing @example
- `src/index.ts:120` `export * from "./FileName.ts";` (re-export) - missing @example
- `src/index.ts:125` `export * from "./FilePath/index.ts";` (re-export) - missing @example
- `src/index.ts:130` `export * from "./Float16Array.ts";` (re-export) - missing @example
- `src/index.ts:135` `export * from "./Float32Array.ts";` (re-export) - missing @example
- `src/index.ts:140` `export * from "./Float64Array.ts";` (re-export) - missing @example
- `src/index.ts:145` `export * from "./Fn/index.ts";` (re-export) - missing @example
- `src/index.ts:150` `export * from "./Glob/index.ts";` (re-export) - missing @example
- `src/index.ts:155` `export * from "./Graph/index.ts";` (re-export) - missing @example
- `src/index.ts:160` `export * from "./Html.ts";` (re-export) - missing @example
- `src/index.ts:165` `export * from "./Int.ts";` (re-export) - missing @example
- `src/index.ts:170` `export * from "./Json.ts";` (re-export) - missing @example
- `src/index.ts:175` `export * from "./Jsonc.ts";` (re-export) - missing @example
- `src/index.ts:180` `export * from "./Jsonl.ts";` (re-export) - missing @example
- `src/index.ts:185` `export * from "./KebabStr.ts";` (re-export) - missing @example
- `src/index.ts:190` `export * from "./LocalDate/index.ts";` (re-export) - missing @example
- `src/index.ts:195` `export * from "./Logs.ts";` (re-export) - missing @example
- `src/index.ts:200` `export * from "./Markdown.ts";` (re-export) - missing @example
- `src/index.ts:205` `export * from "./MimeType.ts";` (re-export) - missing @example
- `src/index.ts:210` `export * as Model from "./Model/index.ts";` (re-export) - missing @example
- `src/index.ts:215` `export * from "./MutableHashMap.ts";` (re-export) - missing @example
- `src/index.ts:220` `export * from "./MutableHashSet.ts";` (re-export) - missing @example
- `src/index.ts:225` `export * from "./Options.ts";` (re-export) - missing @example
- `src/index.ts:230` `export * from "./PascalStr.ts";` (re-export) - missing @example
- `src/index.ts:235` `export * from "./PosixPath.ts";` (re-export) - missing @example
- `src/index.ts:240` `export * from "./Primitive.ts";` (re-export) - missing @example
- `src/index.ts:245` `export * from "./PromiseSchema.ts";` (re-export) - missing @example
- `src/index.ts:250` `export * from "./Record/index.ts";` (re-export) - missing @example
- `src/index.ts:255` `export * from "./RegExp.ts";` (re-export) - missing @example
- `src/index.ts:260` `export * as SchemaUtils from "./SchemaUtils/index.ts";` (re-export) - missing @example
- `src/index.ts:265` `export * from "./SemanticVersion.ts";` (re-export) - missing @example
- `src/index.ts:270` `export * from "./SeverityLevel.ts";` (re-export) - missing @example
- `src/index.ts:275` `export * from "./Sha256.ts";` (re-export) - missing @example
- `src/index.ts:280` `export * from "./Slug.ts";` (re-export) - missing @example
- `src/index.ts:285` `export * from "./SnakeStr.ts";` (re-export) - missing @example
- `src/index.ts:290` `export * from "./StatusCauseError.ts";` (re-export) - missing @example
- `src/index.ts:295` `export * from "./StatusCauseTaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:300` `export * from "./String.ts";` (re-export) - missing @example
- `src/index.ts:305` `export * from "./TaggedErrorClass/index.ts";` (re-export) - missing @example
- `src/index.ts:310` `export * from "./Timezone.ts";` (re-export) - missing @example
- `src/index.ts:315` `export * from "./Toml.ts";` (re-export) - missing @example
- `src/index.ts:320` `export * from "./Transformations.ts";` (re-export) - missing @example
- `src/index.ts:325` `export * from "./URL.ts";` (re-export) - missing @example
- `src/index.ts:330` `export * as VariantSchema from "./VariantSchema/index.ts";` (re-export) - missing @example
- `src/index.ts:335` `export * from "./Xml.ts";` (re-export) - missing @example
- `src/index.ts:340` `export * from "./Yaml.ts";` (re-export) - missing @example
- `src/index.ts:14` `VERSION` (const) - missing summary; missing @example
- `src/Int.ts:98` `PosInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:137` `PostgresSerialInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:180` `NegInt` (type) - 1 unsafe example violation(s)
- `src/Int.ts:223` `NonPositiveInt` (type) - 1 unsafe example violation(s)
- `src/Json.ts:39` `JsonObject` (type) - missing @example
- `src/Json.ts:68` `JsonArray` (type) - missing @example
- `src/Jsonc.ts:90` `JsoncTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Jsonl.ts:102` `JsonlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/KebabStr.ts:54` `KebabCaseStr` (type) - 1 unsafe example violation(s)
- `src/LiteralKit/index.ts:12` `export * from "./LiteralKit.schema.ts";` (re-export) - missing @example
- `src/LiteralKit/LiteralKit.schema.ts:706` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/LiteralKit.schema.ts:710` `LiteralKit` (function) - missing summary; missing @example, @category, @since
- `src/LiteralKit/LiteralKit.schema.ts:652` `LiteralKit` (interface) - missing @example
- `src/LiteralKit/LiteralKit.schema.ts:38` `LiteralToKey` (type) - missing @example
- `src/LocalDate/index.ts:12` `export * from "./LocalDate.schema.ts";` (re-export) - missing @example
- `src/LocalDate/LocalDate.schema.ts:124` `isLocalDate` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:208` `fromString` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:231` `fromDate` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:245` `today` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:253` `todayEffect` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:264` `fromDateTime` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:279` `Order` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:298` `isBefore` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:309` `isAfter` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:320` `equals` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:335` `addDays` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:350` `addMonths` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:365` `addYears` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:380` `diffInDays` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:396` `startOfMonth` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:409` `endOfMonth` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:422` `startOfYear` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:435` `endOfYear` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:448` `isLeapYear` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:456` `daysInMonth` (const) - missing @example
- `src/LocalDate/LocalDate.schema.ts:503` `LocalDateFromString` (type) - missing @example
- `src/LocalDate/LocalDate.schema.ts:511` `LocalDateFromString` (namespace) - missing @example
- `src/Logs.ts:43` `LogLevel` (type) - missing @example
- `src/Logs.ts:74` `LogSeverity` (type) - missing @example
- `src/MappedLiteralKit/index.ts:12` `export * from "./MappedLiteralKit.schema.ts";` (re-export) - missing @example
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:334` `MappedLiteralKit` (function) - 1 unsafe example violation(s)
- `src/MappedLiteralKit/MappedLiteralKit.schema.ts:303` `MappedLiteralKit` (interface) - missing @example
- `src/Markdown.ts:139` `Markdown` (type) - missing @example
- `src/Markdown.ts:167` `MarkdownTextToHtml` (const) - 1 schema annotation/type-alias gap(s)
- `src/Model/index.ts:14` `export * from "./Model.codecs.ts";` (re-export) - missing @example
- `src/Model/index.ts:19` `export * from "./Model.datetime.ts";` (re-export) - missing @example
- `src/Model/index.ts:24` `export * from "./Model.fields.ts";` (re-export) - missing @example
- `src/Model/index.ts:29` `export * from "./Model.sqlite.ts";` (re-export) - missing @example
- `src/Model/index.ts:34` `export * from "./Model.uuid.ts";` (re-export) - missing @example
- `src/Model/index.ts:39` `export * from "./Model.variants.ts";` (re-export) - missing @example
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
- `src/Model/Model.fields.ts:79` `GeneratedByApp` (const) - missing @example
- `src/Model/Model.fields.ts:93` `Sensitive` (interface) - missing @example
- `src/Model/Model.fields.ts:142` `optionalOption` (interface) - 1 example import violation(s)
- `src/Model/Model.fields.ts:160` `optionalOption` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model/Model.fields.ts:192` `FieldOption` (interface) - 1 example import violation(s)
- `src/Model/Model.fields.ts:220` `FieldOption` (const) - 1 example import violation(s)
- `src/Model/Model.sqlite.ts:51` `BooleanSqlite` (const) - 1 example import violation(s); 2 schema annotation/type-alias gap(s)
- `src/Model/Model.uuid.ts:29` `UuidV4Insert` (interface) - 1 example import violation(s)
- `src/Model/Model.uuid.ts:96` `UuidV4Insert` (const) - 1 example import violation(s)
- `src/Model/Model.uuid.ts:71` `UuidV4WithGenerate` (const) - 1 example import violation(s)
- `src/Model/Model.variants.ts:26` `Any` (type) - missing @example
- `src/Model/Model.variants.ts:41` `VariantsDatabase` (type) - missing @example
- `src/Model/Model.variants.ts:49` `VariantsJson` (type) - missing @example
- `src/Model/Model.variants.ts:57` `Variant` (type) - missing @example
- `src/Model/Model.variants.ts:65` `DefaultVariant` (type) - missing @example
- `src/Model/Model.variants.ts:90` `ClassShape` (type) - missing @example
- `src/Model/Model.variants.ts:15` `Class` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `extract` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Field` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldExcept` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `FieldOnly` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `fieldEvolve` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Struct` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:15` `Union` (BindingElement) - missing summary; missing @example, @category, @since
- `src/Model/Model.variants.ts:279` `fields` (const) - 1 example import violation(s)
- `src/Model/Model.variants.ts:309` `Overridable` (interface) - missing @example
- `src/Model/Model.variants.ts:326` `Overridable` (const) - missing @example
- `src/Model/Model.variants.ts:317` `Overrideable` (interface) - missing @example
- `src/Model/Model.variants.ts:334` `Overrideable` (const) - missing @example
- `src/MutableHashMap.ts:81` `MutableHashMapIso` (type) - missing @example
- `src/MutableHashMap.ts:91` `MutableHashMapFromSelf` (interface) - missing @example
- `src/MutableHashMap.ts:161` `MutableHashMapFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashMap.ts:109` `MutableHashMap` (interface) - missing @example
- `src/MutableHashMap.ts:260` `MutableHashMap` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:53` `MutableHashSetIso` (type) - missing @example
- `src/MutableHashSet.ts:61` `MutableHashSetFromSelf` (interface) - missing @example
- `src/MutableHashSet.ts:126` `MutableHashSetFromSelf` (const) - 1 schema annotation/type-alias gap(s)
- `src/MutableHashSet.ts:78` `MutableHashSet` (interface) - missing @example
- `src/MutableHashSet.ts:219` `MutableHashSet` (const) - 1 schema annotation/type-alias gap(s)
- `src/NoOpen/index.ts:20` `export * from "./NoOpen.schema.ts";` (re-export) - missing @example
- `src/NoOpen/NoOpen.schema.ts:29` `NoOpenValue` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:40` `NoOpenValue` (type) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:48` `NoOpenOption` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:59` `NoOpenOption` (type) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:65` `NoOpenResponseHeader` (class) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:81` `NoOpenHeader` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:144` `NoOpenHeader` (type) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:81` `Header` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:144` `Header` (type) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:48` `Option` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:59` `Option` (type) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:65` `ResponseHeader` (class) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:29` `Value` (const) - missing summary; missing @example
- `src/NoOpen/NoOpen.schema.ts:40` `Value` (type) - missing summary; missing @example
- `src/NoSniff/index.ts:20` `export * from "./NoSniff.schema.ts";` (re-export) - missing @example
- `src/NoSniff/NoSniff.schema.ts:53` `NoSniffValue` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:85` `NoSniffOption` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:102` `NoSniffResponseHeader` (class) - 1 example import violation(s)
- `src/NoSniff/NoSniff.schema.ts:194` `NoSniffHeader` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:129` `Header` (const) - 1 schema annotation/type-alias gap(s)
- `src/NoSniff/NoSniff.schema.ts:194` `Header` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:85` `Option` (type) - missing @example
- `src/NoSniff/NoSniff.schema.ts:102` `ResponseHeader` (class) - 1 example import violation(s)
- `src/NoSniff/NoSniff.schema.ts:53` `Value` (type) - missing @example
- `src/Number.ts:163` `NonNegNum` (type) - 1 unsafe example violation(s)
- `src/Number.ts:213` `NonNegativeInt` (type) - 1 unsafe example violation(s)
- `src/Options.ts:78` `OptionFromOptionalNullishKey` (const) - forbidden @template
- `src/ParserOptions/index.ts:21` `export * from "./ParserOptions.schema.ts";` (re-export) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:61` `HeaderValueInput` (const) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:73` `HeaderValueInput` (type) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:81` `ParserOptionsError` (class) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:112` `ParserOptions` (class) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:231` `ParserOptionsArgs` (type) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:112` `Schema` (class) - missing @example
- `src/ParserOptions/ParserOptions.schema.ts:81` `Error` (class) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:20` `HeaderArray` (const) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:35` `HeaderArray` (type) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:44` `HeaderTransformFunction` (const) - missing @example
- `src/ParserOptions/ParserOptions.types.ts:59` `HeaderTransformFunction` (type) - missing @example
- `src/PascalStr.ts:54` `PascalCaseStr` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:55` `Percentage` (type) - 1 unsafe example violation(s)
- `src/Percentage.ts:93` `TWENTY` (const) - missing @example
- `src/Percentage.ts:100` `FIFTY` (const) - missing @example
- `src/Percentage.ts:107` `HUNDRED` (const) - missing @example
- `src/PermissionsPolicy/index.ts:20` `export * from "./PermissionsPolicy.schema.ts";` (re-export) - missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:58` `PermissionsPolicyDirective` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:69` `PermissionsPolicyDirective` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:75` `PermissionsPolicyDirectiveKey` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:92` `PermissionsPolicyDirectiveKey` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:98` `QuotedOrigin` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:114` `QuotedOrigin` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:122` `PermissionsPolicyDirectiveValueSingle` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:133` `PermissionsPolicyDirectiveValueSingle` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:139` `PermissionsPolicyAllowlistedOrigin` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:149` `PermissionsPolicyAllowlistedOrigin` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:155` `PermissionsPolicyDirectiveValue` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:169` `PermissionsPolicyDirectiveValue` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:175` `PermissionsPolicyDirectives` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:188` `PermissionsPolicyDirectives` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:194` `PermissionsPolicyOptionStruct` (class) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:209` `PermissionsPolicyOption` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:219` `PermissionsPolicyOption` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:225` `PermissionsPolicyResponseHeader` (class) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:273` `PermissionsPolicyHeader` (const) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:334` `PermissionsPolicyHeader` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:273` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:334` `Header` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:209` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:219` `Option` (type) - missing summary; missing @example
- `src/PermissionsPolicy/PermissionsPolicy.schema.ts:225` `ResponseHeader` (class) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/index.ts:20` `export * from "./PermittedCrossDomainPolicies.schema.ts";` (re-export) - missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:35` `PermittedCrossDomainPoliciesValue` (const) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:46` `PermittedCrossDomainPoliciesValue` (type) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:54` `PermittedCrossDomainPoliciesOption` (const) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:65` `PermittedCrossDomainPoliciesOption` (type) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:71` `PermittedCrossDomainPoliciesResponseHeader` (class) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:89` `PermittedCrossDomainPoliciesHeader` (const) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:155` `PermittedCrossDomainPoliciesHeader` (type) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:89` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:155` `Header` (type) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:54` `Option` (const) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:65` `Option` (type) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:71` `ResponseHeader` (class) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:35` `Value` (const) - missing summary; missing @example
- `src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts:46` `Value` (type) - missing summary; missing @example
- `src/PosixPath.ts:51` `PosixPath` (type) - 1 unsafe example violation(s)
- `src/PosixPath.ts:68` `NativePathToPosixPath` (const) - 1 schema annotation/type-alias gap(s)
- `src/Record/index.ts:12` `export * from "./Record.schema.ts";` (re-export) - missing @example
- `src/ReferrerPolicy/index.ts:20` `export * from "./ReferrerPolicy.schema.ts";` (re-export) - missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:38` `ReferrerPolicyValue` (const) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:49` `ReferrerPolicyValue` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:55` `ReferrerPolicyValueList` (const) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:65` `ReferrerPolicyValueList` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:71` `ReferrerPolicyOption` (const) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:81` `ReferrerPolicyOption` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:87` `ReferrerPolicyResponseHeader` (class) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:127` `ReferrerPolicyHeader` (const) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:193` `ReferrerPolicyHeader` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:127` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:193` `Header` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:71` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:81` `Option` (type) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:87` `ResponseHeader` (class) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:38` `Value` (const) - missing summary; missing @example
- `src/ReferrerPolicy/ReferrerPolicy.schema.ts:49` `Value` (type) - missing summary; missing @example
- `src/RegExp.ts:78` `RegExpStr` (type) - 1 unsafe example violation(s)
- `src/RegExp.ts:131` `RegExpFromStr` (type) - 1 unsafe example violation(s)
- `src/SchemaUtils/index.ts:12` `export * from "./optionalKeyWithDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:17` `export * from "./pluck.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:22` `export * from "./split.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:27` `export * from "./toEquivalence.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:32` `export * from "./withEncodeDefault.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:37` `export * from "./withKeyDefaults.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:42` `export * from "./withLiteralKitStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/index.ts:47` `export * from "./withStatics.ts";` (re-export) - missing @example
- `src/SchemaUtils/optionalKeyWithDefaults.ts:20` `optionalKeyWithDefault` (const) - missing @example
- `src/SchemaUtils/pluck.ts:58` `pluck` (function) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:32` `DualEquivalence` (type) - forbidden @template
- `src/SchemaUtils/toEquivalence.ts:64` `toEquivalence` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:40` `withEncodeDefault` (const) - forbidden @template
- `src/SchemaUtils/withEncodeDefault.ts:83` `boolWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withKeyDefaults.ts:114` `withEmptyArrayDefaults` (function) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:125` `withEmptyArrayDefaults` (function) - missing @example
- `src/SchemaUtils/withKeyDefaults.ts:136` `withEmptyArrayDefaults` (function) - missing @example
- `src/SchemaUtils/withKeyDefaults.ts:50` `withKeyDefaults` (const) - forbidden @template
- `src/SchemaUtils/withKeyDefaults.ts:166` `boolKeyWithDefault` (const) - 2 schema annotation/type-alias gap(s)
- `src/SchemaUtils/withLiteralKitStatics.ts:25` `withLiteralKitStatics` (const) - missing @example
- `src/SecureHeader/index.ts:22` `export * from "./SecureHeader.schema.ts";` (re-export) - missing @example
- `src/SecureHeader/SecureHeader.schema.ts:33` `SecureHeader` (const) - missing summary; missing @example
- `src/SecureHeader/SecureHeader.schema.ts:44` `SecureHeader` (type) - missing summary; missing @example
- `src/SecureHeader/SecureHeader.schema.ts:33` `Schema` (const) - missing summary; missing @example
- `src/SecureHeader/SecureHeader.schema.ts:44` `Schema` (type) - missing summary; missing @example
- `src/SecureHeaderError/index.ts:20` `export * from "./SecureHeaderError.errors.ts";` (re-export) - missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:110` `CspError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:116` `ForceHttpsRedirectError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:122` `XssProtectionError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:128` `ReferrerPolicyError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:134` `NoSniffError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:140` `NoOpenError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:146` `FrameGuardError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:152` `ExpectCtError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:158` `PermissionsPolicyError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:164` `CrossOriginOpenerPolicyError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:170` `CrossOriginEmbedderPolicyError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:176` `CrossOriginResourcePolicyError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:182` `PermittedCrossDomainPoliciesError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:188` `CoreError` (class) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:194` `SecureHeaderError` (const) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:222` `SecureHeaderError` (type) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:194` `Error` (const) - missing summary; missing @example
- `src/SecureHeaderError/SecureHeaderError.errors.ts:222` `Error` (type) - missing summary; missing @example
- `src/SecureHeaderOptions/index.ts:20` `export * from "./SecureHeaderOptions.schema.ts";` (re-export) - missing @example
- `src/Sex/index.ts:22` `export * from "./Sex.schema.ts";` (re-export) - missing @example
- `src/Sex/Sex.schema.ts:16` `Sex` (const) - missing @example
- `src/Sex/Sex.schema.ts:27` `Sex` (type) - missing @example
- `src/Sex/Sex.schema.ts:16` `Schema` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/Sex/Sex.schema.ts:27` `Schema` (type) - missing @example
- `src/Sha256.ts:77` `Sha256Hex` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:122` `Sha256HexFromBytes` (type) - 1 unsafe example violation(s)
- `src/Sha256.ts:163` `Sha256HexFromHexBytes` (type) - 1 unsafe example violation(s)
- `src/Slug.ts:96` `Slug` (type) - missing @example
- `src/Slug.ts:104` `SlugFromStr` (const) - missing @example
- `src/SnakeStr.ts:54` `SnakeCaseStr` (type) - 1 unsafe example violation(s)
- `src/StatusCauseError.ts:39` `StatusCauseFields` (const) - 2 schema annotation/type-alias gap(s)
- `src/StatusCauseTaggedErrorClass/index.ts:12` `export * from "./StatusCauseTaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/String.ts:49` `NonEmptyTrimmedStr` (type) - 1 unsafe example violation(s)
- `src/String.ts:87` `UUID` (type) - 1 unsafe example violation(s)
- `src/String.ts:154` `OptionFromNullableStr` (type) - missing @example
- `src/TaggedErrorClass/index.ts:12` `export * from "./TaggedErrorClass.errors.ts";` (re-export) - missing @example
- `src/Thunk.ts:37` `TypeId` (type) - missing @example
- `src/Thunk.ts:46` `ThunkUnknown` (type) - missing @example
- `src/Timestamp/index.ts:12` `export * from "./Timestamp.schema.ts";` (re-export) - missing @example
- `src/Timestamp/Timestamp.schema.ts:58` `ISOStr` (type) - missing @example
- `src/Timestamp/Timestamp.schema.ts:91` `EpochMillis` (type) - missing @example
- `src/Timestamp/Timestamp.schema.ts:110` `ToIsoStr` (const) - 1 schema annotation/type-alias gap(s)
- `src/Timestamp/Timestamp.schema.ts:138` `ToIsoStr` (namespace) - missing @example
- `src/Timestamp/Timestamp.schema.ts:130` `ToIsoString` (type) - missing @example
- `src/Timestamp/Timestamp.schema.ts:243` `isTimestamp` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:251` `fromDateTime` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:260` `fromDate` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:268` `fromString` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:283` `now` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:291` `nowEffect` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:302` `Order` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:314` `isBefore` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:325` `isAfter` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:336` `equals` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:347` `addMillis` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:358` `addSeconds` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:369` `addMinutes` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:380` `addHours` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:391` `addDays` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:402` `diffInMillis` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:413` `diffInSeconds` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:424` `min` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:435` `max` (const) - missing @example
- `src/Timestamp/Timestamp.schema.ts:446` `EPOCH` (const) - missing @example
- `src/Toml.ts:94` `TomlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/Transformations.ts:47` `destructiveTransform` (const) - 2 schema annotation/type-alias gap(s)
- `src/URL.ts:85` `URLStr` (type) - 1 unsafe example violation(s)
- `src/VariantSchema/index.ts:14` `export * from "./VariantSchema.core.ts";` (re-export) - missing @example
- `src/VariantSchema/index.ts:19` `export * from "./VariantSchema.overridable.ts";` (re-export) - missing @example
- `src/VariantSchema/VariantSchema.core.ts:20` `TypeId` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:28` `Struct` (interface) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:44` `Struct` (namespace) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:38` `isStruct` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:80` `Field` (interface) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:94` `Field` (namespace) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:89` `isField` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:148` `ExtractFields` (type) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:168` `Extract` (type) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:230` `fields` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:236` `Class` (interface) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:345` `Union` (interface) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:354` `Union` (namespace) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.core.ts:449` `make` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/VariantSchema/VariantSchema.overridable.ts:15` `Override` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.overridable.ts:21` `Overridable` (interface) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.overridable.ts:44` `Overridable` (const) - missing summary; missing @example
- `src/VariantSchema/VariantSchema.overridable.ts:95` `Overrideable` (const) - missing @example
- `src/Xml.ts:79` `XmlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)
- `src/XssProtection/index.ts:20` `export * from "./XssProtection.schema.ts";` (re-export) - missing @example
- `src/XssProtection/XssProtection.schema.ts:30` `XSSProtectionMode` (const) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:41` `XSSProtectionMode` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:47` `XSSProtectionReportConfig` (class) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:60` `XSSProtectionReport` (const) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:70` `XSSProtectionReport` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:76` `XSSProtectionOption` (const) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:86` `XSSProtectionOption` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:92` `XSSProtectionResponseHeader` (class) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:145` `XSSProtectionHeader` (const) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:196` `XSSProtectionHeader` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:145` `Header` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/XssProtection/XssProtection.schema.ts:196` `Header` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:30` `Mode` (const) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:41` `Mode` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:76` `Option` (const) - missing summary; missing @example; 1 schema annotation/type-alias gap(s)
- `src/XssProtection/XssProtection.schema.ts:86` `Option` (type) - missing summary; missing @example
- `src/XssProtection/XssProtection.schema.ts:92` `ResponseHeader` (class) - missing summary; missing @example
- `src/Yaml.ts:96` `YamlTextToUnknown` (const) - 1 schema annotation/type-alias gap(s)

### @beep/codedank-web

Path: `apps/codedank-web`

Export findings:
- `src/app/layout.tsx:41` `default` (function) - missing @example
- `src/app/layout.tsx:29` `metadata` (const) - missing @example
- `src/app/manifest.ts:16` `default` (function) - missing @example
- `src/app/page.tsx:17` `default` (function) - missing @example
- `src/mdx-components.tsx:18` `useMDXComponents` (function) - missing @example

### @beep/onepassword-cli

Path: `packages/drivers/onepassword-cli`

Export findings:
- `src/index.ts:14` `export * from "./OnePasswordCli.errors.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./OnePasswordCli.models.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./OnePasswordCli.service.ts";` (re-export) - missing @example
- `src/OnePasswordCli.errors.ts:22` `OnePasswordCliErrorOptions` (class) - missing @example
- `src/OnePasswordCli.errors.ts:41` `OnePasswordCliError` (class) - missing @example
- `src/OnePasswordCli.models.ts:20` `OnePasswordReferenceProbeStatus` (const) - missing @example
- `src/OnePasswordCli.models.ts:32` `OnePasswordReferenceProbeStatus` (type) - missing @example
- `src/OnePasswordCli.models.ts:40` `OnePasswordCliProcessResult` (class) - missing @example
- `src/OnePasswordCli.models.ts:57` `OnePasswordCliAccount` (class) - missing @example
- `src/OnePasswordCli.models.ts:73` `OnePasswordReferenceProbe` (class) - missing @example
- `src/OnePasswordCli.service.ts:35` `OnePasswordCliRunner` (type) - missing @example
- `src/OnePasswordCli.service.ts:141` `OnePasswordCli` (class) - missing @example

### @beep/architecture-lab-config

Path: `packages/architecture-lab/config`

Export findings:
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.config.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:20` `WorkItemPublicConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:37` `WorkItemServerConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:54` `WorkItemSecretConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:70` `defaultWorkItemPublicConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:81` `defaultWorkItemServerConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.config.ts:92` `defaultWorkItemSecretConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:29` `WorkItemConfigValue` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:47` `WorkItemConfigShape` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:55` `WorkItemConfig` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:87` `testWorkItemConfig` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:99` `ArchitectureLabConfigLive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:107` `ArchitectureLabConfigTest` (const) - missing @example
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
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.http.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.layer.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.repo.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:28` `export * from "./WorkItem.rpc.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:35` `export * from "./WorkItem.tools.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:30` `WorkItemHttpStatus` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:43` `WorkItemHttpStatus` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:51` `WorkItemHttpResponse` (class) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.http.ts:68` `toWorkItemHttpError` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.http.ts:92` `makeWorkItemHttpHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:23` `makeWorkItemServer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:34` `WorkItemServer` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.layer.ts:44` `WorkItemServerLayer` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:45` `makeInMemoryWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:127` `makeDrizzleWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.repo.ts:185` `makeWorkItemRepository` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.rpc.ts:17` `makeWorkItemRpcHandlers` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:17` `WorkItemToolNames` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.tools.ts:33` `makeWorkItemToolHandlers` (const) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.layer.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:14` `export * from "./Worker.repo.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.layer.ts:23` `makeWorkerServer` (const) - missing @example
- `src/entities/Worker/Worker.layer.ts:34` `WorkerServer` (class) - missing @example
- `src/entities/Worker/Worker.layer.ts:44` `WorkerServerLayer` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:44` `makeInMemoryWorkerRepository` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:118` `makeDrizzleWorkerRepository` (const) - missing @example
- `src/entities/Worker/Worker.repo.ts:160` `makeWorkerRepository` (const) - missing @example
- `src/index.ts:30` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * from "./Layer.js";` (re-export) - missing @example
- `src/Layer.ts:20` `ArchitectureLabServerLive` (const) - missing @example
- `src/test.ts:20` `ArchitectureLabServerTest` (const) - missing @example

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

### @beep/architecture-lab-proof

Path: `apps/architecture-lab-proof`

Export findings:
- `src/index.ts:42` `ArchitectureLabProofResult` (class) - missing @example
- `src/index.ts:59` `runArchitectureLabProof` (const) - missing @example

### @beep/installer-server

Path: `packages/installer/server`

Export findings:
- `src/index.ts:23` `export * from "./Layer.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example
- `src/Layer.ts:336` `makeHostDependencyServer` (const) - missing @example
- `src/Layer.ts:354` `makeSecretReferenceServer` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Layer.ts:437` `makeProviderAccountServer` (const) - missing @example
- `src/Layer.ts:478` `makeDiscordChannelServer` (const) - missing @example; 2 schema annotation/type-alias gap(s)
- `src/Layer.ts:535` `makeStackManifestServer` (const) - missing @example
- `src/Layer.ts:549` `makeP1ManualProofWorkflow` (const) - missing @example
- `src/Layer.ts:710` `HostDependencyServerLive` (const) - missing @example
- `src/Layer.ts:718` `SecretReferenceServerLive` (const) - missing @example
- `src/Layer.ts:726` `ProviderAccountServerLive` (const) - missing @example
- `src/Layer.ts:734` `DiscordChannelServerLive` (const) - missing @example
- `src/Layer.ts:742` `StackManifestServerLive` (const) - missing @example
- `src/Layer.ts:750` `InstallerConceptServerLive` (const) - missing @example
- `src/Layer.ts:764` `P1ManualProofWorkflowLive` (const) - missing @example
- `src/Layer.ts:772` `InstallerServerLive` (const) - missing @example
- `src/Layer.ts:780` `runP1ManualProof` (const) - missing @example
- `src/Layer.ts:793` `previewP1ManualProof` (const) - missing @example
- `src/test.ts:17` `InstallerServerTest` (const) - missing @example

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
- `src/Metric.ts:189` `trackDuration` (const) - missing @example
- `src/Metric.ts:311` `observeWorkflow` (const) - missing @example
- `src/Metric.ts:442` `observeHttpRequest` (const) - missing @example
- `src/PhaseProfiler.ts:265` `profilePhase` (const) - missing @example
- `src/server/Config.ts:69` `toOtlpResource` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:266` `makeHttpApiTelemetryDescriptor` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:303` `httpApiFailureStatus` (const) - 1 unsafe example violation(s)
- `src/server/HttpApiTelemetry.ts:426` `observeHttpApiEffect` (const) - missing @example
- `src/server/HttpApiTelemetry.ts:585` `observeHttpApiHandler` (const) - missing @example
- `src/server/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/server/index.ts:10` `export * from "./DevTools.ts";` (re-export) - missing @example
- `src/server/index.ts:15` `export * from "./ErrorReporting.ts";` (re-export) - missing @example
- `src/server/index.ts:20` `export * from "./HttpApiTelemetry.ts";` (re-export) - missing @example
- `src/server/index.ts:25` `export * from "./Layer.ts";` (re-export) - missing @example
- `src/server/index.ts:30` `export * from "./NodeSdk.ts";` (re-export) - missing @example
- `src/server/index.ts:35` `export * from "./Prometheus.ts";` (re-export) - missing @example
- `src/server/index.ts:40` `export * from "./TraceContext.ts";` (re-export) - missing @example
- `src/server/Layer.ts:31` `layerLocalLgtmServer` (const) - 1 unsafe example violation(s)
- `src/server/TraceContext.ts:93` `withIncomingTraceContext` (const) - missing @example
- `src/web/index.ts:5` `export * from "./Config.ts";` (re-export) - missing @example
- `src/web/index.ts:10` `export * from "./Layer.ts";` (re-export) - missing @example

### @beep/konva

Path: `packages/drivers/konva`

Export findings:
- `src/index.ts:11` `VERSION` (const) - missing summary; missing @example

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
- `src/components/accordion.tsx:11` `Accordion` (function) - missing summary; missing @example
- `src/components/accordion.tsx:58` `AccordionContent` (function) - missing summary; missing @example
- `src/components/accordion.tsx:19` `AccordionItem` (function) - missing summary; missing @example
- `src/components/accordion.tsx:29` `AccordionTrigger` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:12` `AlertDialog` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:168` `AlertDialogAction` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:188` `AlertDialogCancel` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:53` `AlertDialogContent` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:148` `AlertDialogDescription` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:97` `AlertDialogFooter` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:80` `AlertDialogHeader` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:114` `AlertDialogMedia` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:36` `AlertDialogOverlay` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:28` `AlertDialogPortal` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:131` `AlertDialogTitle` (function) - missing summary; missing @example
- `src/components/alert-dialog.tsx:20` `AlertDialogTrigger` (function) - missing summary; missing @example
- `src/components/alert.tsx:26` `Alert` (function) - missing summary; missing @example
- `src/components/alert.tsx:68` `AlertAction` (function) - missing summary; missing @example
- `src/components/alert.tsx:51` `AlertDescription` (function) - missing summary; missing @example
- `src/components/alert.tsx:34` `AlertTitle` (function) - missing summary; missing @example
- `src/components/aspect-ratio.tsx:7` `AspectRatio` (function) - missing summary; missing @example
- `src/components/avatar.tsx:14` `Avatar` (function) - missing summary; missing @example
- `src/components/avatar.tsx:86` `AvatarFallback` (function) - missing summary; missing @example
- `src/components/avatar.tsx:35` `AvatarImage` (function) - missing summary; missing @example
- `src/components/badge.tsx:36` `Badge` (function) - missing summary; missing @example
- `src/components/badge.tsx:12` `badgeVariants` (const) - missing summary; missing @example
- `src/components/banner.tsx:47` `Banner` (function) - missing summary; missing @example
- `src/components/banner.tsx:109` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:110` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:111` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:112` `Banner` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/banner.tsx:62` `BannerContent` (const) - missing summary; missing @example
- `src/components/banner.tsx:78` `BannerDescription` (const) - missing summary; missing @example
- `src/components/banner.tsx:90` `BannerDismiss` (const) - missing summary; missing @example
- `src/components/banner.tsx:70` `BannerTitle` (const) - missing summary; missing @example
- `src/components/banner.tsx:11` `bannerVariants` (const) - missing summary; missing @example
- `src/components/blocks/editor-00/editor.tsx:30` `Editor` (function) - missing @example
- `src/components/blocks/editor-00/nodes.ts:13` `nodes` (const) - missing @example
- `src/components/blocks/editor-00/plugins.tsx:11` `Plugins` (function) - missing @example
- `src/components/breadcrumb.tsx:11` `Breadcrumb` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:89` `BreadcrumbEllipsis` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:36` `BreadcrumbItem` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:44` `BreadcrumbLink` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:19` `BreadcrumbList` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:54` `BreadcrumbPage` (function) - missing summary; missing @example
- `src/components/breadcrumb.tsx:71` `BreadcrumbSeparator` (function) - missing summary; missing @example
- `src/components/button-group.tsx:34` `ButtonGroup` (function) - missing summary; missing @example
- `src/components/button-group.tsx:77` `ButtonGroupSeparator` (function) - missing summary; missing @example
- `src/components/button-group.tsx:54` `ButtonGroupText` (function) - missing summary; missing @example
- `src/components/button-group.tsx:13` `buttonGroupVariants` (const) - missing summary; missing @example
- `src/components/button.tsx:50` `Button` (function) - missing summary; missing @example
- `src/components/button.tsx:11` `buttonVariants` (const) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:37` `CalendarEventCard` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:138` `EventTitle` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:152` `EventTime` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:172` `EventLocation` (function) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:12` `EventStatus` (type) - missing summary; missing @example
- `src/components/calendar-event-card.tsx:17` `EventVariant` (type) - missing summary; missing @example
- `src/components/calendar.tsx:14` `Calendar` (function) - missing summary; missing @example
- `src/components/calendar.tsx:143` `CalendarDayButton` (function) - missing summary; missing @example
- `src/components/card.tsx:8` `Card` (function) - missing summary; missing @example
- `src/components/card.tsx:69` `CardAction` (function) - missing summary; missing @example
- `src/components/card.tsx:83` `CardContent` (function) - missing summary; missing @example
- `src/components/card.tsx:61` `CardDescription` (function) - missing summary; missing @example
- `src/components/card.tsx:91` `CardFooter` (function) - missing summary; missing @example
- `src/components/card.tsx:30` `CardHeader` (function) - missing summary; missing @example
- `src/components/card.tsx:47` `CardTitle` (function) - missing summary; missing @example
- `src/components/carousel.tsx:51` `Carousel` (function) - missing summary; missing @example
- `src/components/carousel.tsx:15` `CarouselApi` (type) - missing summary; missing @example
- `src/components/carousel.tsx:147` `CarouselContent` (function) - missing summary; missing @example
- `src/components/carousel.tsx:161` `CarouselItem` (function) - missing summary; missing @example
- `src/components/carousel.tsx:213` `CarouselNext` (function) - missing summary; missing @example
- `src/components/carousel.tsx:179` `CarouselPrevious` (function) - missing summary; missing @example
- `src/components/carousel.tsx:42` `useCarousel` (function) - missing summary; missing @example
- `src/components/chart.tsx:21` `ChartConfig` (type) - missing @example
- `src/components/chart.tsx:51` `ChartContainer` (function) - missing @example
- `src/components/chart.tsx:286` `ChartLegend` (const) - missing @example
- `src/components/chart.tsx:294` `ChartLegendContent` (function) - missing @example
- `src/components/chart.tsx:95` `ChartStyle` (const) - missing @example
- `src/components/chart.tsx:137` `ChartTooltip` (const) - missing @example
- `src/components/chart.tsx:145` `ChartTooltipContent` (function) - missing @example
- `src/components/checkbox.tsx:11` `Checkbox` (function) - missing summary; missing @example
- `src/components/collapsible.tsx:10` `Collapsible` (function) - missing summary; missing @example
- `src/components/collapsible.tsx:26` `CollapsibleContent` (function) - missing summary; missing @example
- `src/components/collapsible.tsx:18` `CollapsibleTrigger` (function) - missing summary; missing @example
- `src/components/combobox.tsx:14` `Combobox` (const) - missing summary; missing @example
- `src/components/combobox.tsx:256` `ComboboxChip` (function) - missing summary; missing @example
- `src/components/combobox.tsx:236` `ComboboxChips` (function) - missing summary; missing @example
- `src/components/combobox.tsx:291` `ComboboxChipsInput` (function) - missing summary; missing @example
- `src/components/combobox.tsx:197` `ComboboxCollection` (function) - missing summary; missing @example
- `src/components/combobox.tsx:94` `ComboboxContent` (function) - missing summary; missing @example
- `src/components/combobox.tsx:205` `ComboboxEmpty` (function) - missing summary; missing @example
- `src/components/combobox.tsx:175` `ComboboxGroup` (function) - missing summary; missing @example
- `src/components/combobox.tsx:58` `ComboboxInput` (function) - missing summary; missing @example
- `src/components/combobox.tsx:151` `ComboboxItem` (function) - missing summary; missing @example
- `src/components/combobox.tsx:183` `ComboboxLabel` (function) - missing summary; missing @example
- `src/components/combobox.tsx:134` `ComboboxList` (function) - missing summary; missing @example
- `src/components/combobox.tsx:222` `ComboboxSeparator` (function) - missing summary; missing @example
- `src/components/combobox.tsx:28` `ComboboxTrigger` (function) - missing summary; missing @example
- `src/components/combobox.tsx:20` `ComboboxValue` (function) - missing summary; missing @example
- `src/components/combobox.tsx:305` `useComboboxAnchor` (function) - missing summary; missing @example
- `src/components/command.tsx:14` `Command` (function) - missing summary; missing @example
- `src/components/command.tsx:31` `CommandDialog` (function) - missing summary; missing @example
- `src/components/command.tsx:97` `CommandEmpty` (function) - missing summary; missing @example
- `src/components/command.tsx:111` `CommandGroup` (function) - missing summary; missing @example
- `src/components/command.tsx:62` `CommandInput` (function) - missing summary; missing @example
- `src/components/command.tsx:142` `CommandItem` (function) - missing summary; missing @example
- `src/components/command.tsx:83` `CommandList` (function) - missing summary; missing @example
- `src/components/command.tsx:128` `CommandSeparator` (function) - missing summary; missing @example
- `src/components/command.tsx:162` `CommandShortcut` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:12` `ContextMenu` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:177` `ContextMenuCheckboxItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:42` `ContextMenuContent` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:77` `ContextMenuGroup` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:106` `ContextMenuItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:85` `ContextMenuLabel` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:20` `ContextMenuPortal` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:202` `ContextMenuRadioGroup` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:210` `ContextMenuRadioItem` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:234` `ContextMenuSeparator` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:248` `ContextMenuShortcut` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:133` `ContextMenuSub` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:169` `ContextMenuSubContent` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:141` `ContextMenuSubTrigger` (function) - missing summary; missing @example
- `src/components/context-menu.tsx:28` `ContextMenuTrigger` (function) - missing summary; missing @example
- `src/components/conversation.tsx:15` `ConversationProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:21` `Conversation` (const) - missing summary; missing @example
- `src/components/conversation.tsx:35` `ConversationContentProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:41` `ConversationContent` (const) - missing summary; missing @example
- `src/components/conversation.tsx:49` `ConversationEmptyStateProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:59` `ConversationEmptyState` (const) - missing summary; missing @example
- `src/components/conversation.tsx:87` `ConversationScrollButtonProps` (type) - missing summary; missing @example
- `src/components/conversation.tsx:93` `ConversationScrollButton` (const) - missing summary; missing @example
- `src/components/date-picker.tsx:32` `DatePicker` (function) - missing @example
- `src/components/dialog.tsx:13` `Dialog` (function) - missing summary; missing @example
- `src/components/dialog.tsx:163` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:164` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:165` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:166` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:167` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:168` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:169` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:170` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:171` `Dialog` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dialog.tsx:37` `DialogClose` (function) - missing summary; missing @example
- `src/components/dialog.tsx:62` `DialogContent` (function) - missing summary; missing @example
- `src/components/dialog.tsx:151` `DialogDescription` (function) - missing summary; missing @example
- `src/components/dialog.tsx:110` `DialogFooter` (function) - missing summary; missing @example
- `src/components/dialog.tsx:102` `DialogHeader` (function) - missing summary; missing @example
- `src/components/dialog.tsx:45` `DialogOverlay` (function) - missing summary; missing @example
- `src/components/dialog.tsx:29` `DialogPortal` (function) - missing summary; missing @example
- `src/components/dialog.tsx:137` `DialogTitle` (function) - missing summary; missing @example
- `src/components/dialog.tsx:21` `DialogTrigger` (function) - missing summary; missing @example
- `src/components/direction.tsx:9` `export { DirectionProvider, useDirection } from "@base-ui/react/direction-provider";` (re-export) - missing @example
- `src/components/drawer.tsx:11` `Drawer` (function) - missing summary; missing @example
- `src/components/drawer.tsx:35` `DrawerClose` (function) - missing summary; missing @example
- `src/components/drawer.tsx:60` `DrawerContent` (function) - missing summary; missing @example
- `src/components/drawer.tsx:122` `DrawerDescription` (function) - missing summary; missing @example
- `src/components/drawer.tsx:100` `DrawerFooter` (function) - missing summary; missing @example
- `src/components/drawer.tsx:83` `DrawerHeader` (function) - missing summary; missing @example
- `src/components/drawer.tsx:43` `DrawerOverlay` (function) - missing summary; missing @example
- `src/components/drawer.tsx:27` `DrawerPortal` (function) - missing summary; missing @example
- `src/components/drawer.tsx:108` `DrawerTitle` (function) - missing summary; missing @example
- `src/components/drawer.tsx:19` `DrawerTrigger` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:13` `DropdownMenu` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:281` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:282` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:283` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:284` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:285` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:286` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:287` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:288` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:289` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:290` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:291` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:292` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:293` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:294` `DropdownMenu` (Identifier) - missing summary; missing @example, @category, @since
- `src/components/dropdown-menu.tsx:191` `DropdownMenuCheckboxItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:37` `DropdownMenuContent` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:71` `DropdownMenuGroup` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:100` `DropdownMenuItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:79` `DropdownMenuLabel` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:21` `DropdownMenuPortal` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:219` `DropdownMenuRadioGroup` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:227` `DropdownMenuRadioItem` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:254` `DropdownMenuSeparator` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:268` `DropdownMenuShortcut` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:127` `DropdownMenuSub` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:163` `DropdownMenuSubContent` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:135` `DropdownMenuSubTrigger` (function) - missing summary; missing @example
- `src/components/dropdown-menu.tsx:29` `DropdownMenuTrigger` (function) - missing summary; missing @example
- `src/components/editor/editor-ui/content-editable.tsx:20` `ContentEditable` (function) - missing @example
- `src/components/editor/themes/editor-theme.ts:13` `editorTheme` (const) - missing @example
- `src/components/empty.tsx:10` `Empty` (function) - missing summary; missing @example
- `src/components/empty.tsx:100` `EmptyContent` (function) - missing summary; missing @example
- `src/components/empty.tsx:83` `EmptyDescription` (function) - missing summary; missing @example
- `src/components/empty.tsx:27` `EmptyHeader` (function) - missing summary; missing @example
- `src/components/empty.tsx:56` `EmptyMedia` (function) - missing summary; missing @example
- `src/components/empty.tsx:75` `EmptyTitle` (function) - missing summary; missing @example
- `src/components/field.tsx:89` `Field` (function) - missing summary; missing @example
- `src/components/field.tsx:109` `FieldContent` (function) - missing summary; missing @example
- `src/components/field.tsx:158` `FieldDescription` (function) - missing summary; missing @example
- `src/components/field.tsx:209` `FieldError` (function) - missing summary; missing @example
- `src/components/field.tsx:57` `FieldGroup` (function) - missing summary; missing @example
- `src/components/field.tsx:123` `FieldLabel` (function) - missing summary; missing @example
- `src/components/field.tsx:38` `FieldLegend` (function) - missing summary; missing @example
- `src/components/field.tsx:177` `FieldSeparator` (function) - missing summary; missing @example
- `src/components/field.tsx:21` `FieldSet` (function) - missing summary; missing @example
- `src/components/field.tsx:141` `FieldTitle` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:10` `HoverCard` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:26` `HoverCardContent` (function) - missing summary; missing @example
- `src/components/hover-card.tsx:18` `HoverCardTrigger` (function) - missing summary; missing @example
- `src/components/input-group.tsx:16` `InputGroup` (function) - missing summary; missing @example
- `src/components/input-group.tsx:52` `InputGroupAddon` (function) - missing summary; missing @example
- `src/components/input-group.tsx:92` `InputGroupButton` (function) - missing summary; missing @example
- `src/components/input-group.tsx:133` `InputGroupInput` (function) - missing summary; missing @example
- `src/components/input-group.tsx:117` `InputGroupText` (function) - missing summary; missing @example
- `src/components/input-group.tsx:150` `InputGroupTextarea` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:12` `InputOTP` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:34` `InputOTPGroup` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:85` `InputOTPSeparator` (function) - missing summary; missing @example
- `src/components/input-otp.tsx:51` `InputOTPSlot` (function) - missing summary; missing @example
- `src/components/input.tsx:9` `Input` (function) - missing summary; missing @example
- `src/components/item.tsx:53` `Item` (function) - missing summary; missing @example
- `src/components/item.tsx:167` `ItemActions` (function) - missing summary; missing @example
- `src/components/item.tsx:121` `ItemContent` (function) - missing summary; missing @example
- `src/components/item.tsx:149` `ItemDescription` (function) - missing summary; missing @example
- `src/components/item.tsx:189` `ItemFooter` (function) - missing summary; missing @example
- `src/components/item.tsx:14` `ItemGroup` (function) - missing summary; missing @example
- `src/components/item.tsx:175` `ItemHeader` (function) - missing summary; missing @example
- `src/components/item.tsx:102` `ItemMedia` (function) - missing summary; missing @example
- `src/components/item.tsx:24` `ItemSeparator` (function) - missing summary; missing @example
- `src/components/item.tsx:135` `ItemTitle` (function) - missing summary; missing @example
- `src/components/kbd.tsx:8` `Kbd` (function) - missing summary; missing @example
- `src/components/kbd.tsx:25` `KbdGroup` (function) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:18` `GraphNode` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:37` `GraphLink` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:71` `KnowledgeGraphHandle` (interface) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:112` `KnowledgeGraph` (const) - missing summary; missing @example
- `src/components/knowledge-graph.tsx:112` `default` (const) - missing summary; missing @example
- `src/components/label.tsx:10` `Label` (function) - missing summary; missing @example
- `src/components/link-preview.tsx:113` `LinkPreview` (function) - missing summary; missing @example
- `src/components/live-waveform.tsx:13` `LiveWaveformProps` (type) - missing summary; missing @example
- `src/components/live-waveform.tsx:52` `LiveWaveform` (const) - missing summary; missing @example
- `src/components/menubar.tsx:28` `Menubar` (function) - missing summary; missing @example
- `src/components/menubar.tsx:133` `MenubarCheckboxItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:83` `MenubarContent` (function) - missing summary; missing @example
- `src/components/menubar.tsx:50` `MenubarGroup` (function) - missing summary; missing @example
- `src/components/menubar.tsx:109` `MenubarItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:190` `MenubarLabel` (function) - missing summary; missing @example
- `src/components/menubar.tsx:42` `MenubarMenu` (function) - missing summary; missing @example
- `src/components/menubar.tsx:58` `MenubarPortal` (function) - missing summary; missing @example
- `src/components/menubar.tsx:158` `MenubarRadioGroup` (function) - missing summary; missing @example
- `src/components/menubar.tsx:166` `MenubarRadioItem` (function) - missing summary; missing @example
- `src/components/menubar.tsx:205` `MenubarSeparator` (function) - missing summary; missing @example
- `src/components/menubar.tsx:219` `MenubarShortcut` (function) - missing summary; missing @example
- `src/components/menubar.tsx:236` `MenubarSub` (function) - missing summary; missing @example
- `src/components/menubar.tsx:268` `MenubarSubContent` (function) - missing summary; missing @example
- `src/components/menubar.tsx:244` `MenubarSubTrigger` (function) - missing summary; missing @example
- `src/components/menubar.tsx:66` `MenubarTrigger` (function) - missing summary; missing @example
- `src/components/native-select.tsx:15` `NativeSelect` (function) - missing @example
- `src/components/native-select.tsx:55` `NativeSelectOptGroup` (function) - missing @example
- `src/components/native-select.tsx:43` `NativeSelectOption` (function) - missing @example
- `src/components/navigation-menu.tsx:11` `NavigationMenu` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:83` `NavigationMenuContent` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:150` `NavigationMenuIndicator` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:45` `NavigationMenuItem` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:133` `NavigationMenuLink` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:31` `NavigationMenuList` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:100` `NavigationMenuPositioner` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:63` `NavigationMenuTrigger` (function) - missing summary; missing @example
- `src/components/navigation-menu.tsx:55` `navigationMenuTriggerStyle` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:148` `NotificationCard` (function) - missing summary; missing @example
- `src/components/notification-card.tsx:24` `NotificationStatus` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:30` `ActionType` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:40` `ActionType` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:46` `ActionStyle` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:55` `ActionStyle` (type) - missing summary; missing @example
- `src/components/notification-card.tsx:83` `NotificationAction` (const) - missing summary; missing @example
- `src/components/notification-card.tsx:98` `NotificationAction` (type) - missing summary; missing @example
- `src/components/orb.tsx:45` `Orb` (function) - missing summary; missing @example
- `src/components/orb.tsx:17` `AgentState` (type) - missing summary; missing @example
- `src/components/pagination.tsx:10` `Pagination` (function) - missing summary; missing @example
- `src/components/pagination.tsx:25` `PaginationContent` (function) - missing summary; missing @example
- `src/components/pagination.tsx:92` `PaginationEllipsis` (function) - missing summary; missing @example
- `src/components/pagination.tsx:33` `PaginationItem` (function) - missing summary; missing @example
- `src/components/pagination.tsx:46` `PaginationLink` (function) - missing summary; missing @example
- `src/components/pagination.tsx:79` `PaginationNext` (function) - missing summary; missing @example
- `src/components/pagination.tsx:66` `PaginationPrevious` (function) - missing summary; missing @example
- `src/components/popover.tsx:11` `Popover` (function) - missing summary; missing @example
- `src/components/popover.tsx:27` `PopoverContent` (function) - missing summary; missing @example
- `src/components/popover.tsx:80` `PopoverDescription` (function) - missing summary; missing @example
- `src/components/popover.tsx:64` `PopoverHeader` (function) - missing summary; missing @example
- `src/components/popover.tsx:72` `PopoverTitle` (function) - missing summary; missing @example
- `src/components/popover.tsx:19` `PopoverTrigger` (function) - missing summary; missing @example
- `src/components/progress.tsx:10` `Progress` (function) - missing summary; missing @example
- `src/components/progress.tsx:44` `ProgressIndicator` (function) - missing summary; missing @example
- `src/components/progress.tsx:58` `ProgressLabel` (function) - missing summary; missing @example
- `src/components/progress.tsx:30` `ProgressTrack` (function) - missing summary; missing @example
- `src/components/progress.tsx:68` `ProgressValue` (function) - missing summary; missing @example
- `src/components/radio-group.tsx:12` `RadioGroup` (function) - missing summary; missing @example
- `src/components/radio-group.tsx:20` `RadioGroupItem` (function) - missing summary; missing @example
- `src/components/resizable.tsx:32` `ResizableHandle` (function) - missing summary; missing @example
- `src/components/resizable.tsx:19` `ResizablePanel` (function) - missing summary; missing @example
- `src/components/resizable.tsx:11` `ResizablePanelGroup` (function) - missing summary; missing @example
- `src/components/scroll-area.tsx:10` `ScrollArea` (function) - missing summary; missing @example
- `src/components/scroll-area.tsx:29` `ScrollBar` (function) - missing summary; missing @example
- `src/components/select.tsx:12` `Select` (const) - missing summary; missing @example
- `src/components/select.tsx:64` `SelectContent` (function) - missing summary; missing @example
- `src/components/select.tsx:18` `SelectGroup` (function) - missing summary; missing @example
- `src/components/select.tsx:120` `SelectItem` (function) - missing summary; missing @example
- `src/components/select.tsx:106` `SelectLabel` (function) - missing summary; missing @example
- `src/components/select.tsx:179` `SelectScrollDownButton` (function) - missing summary; missing @example
- `src/components/select.tsx:160` `SelectScrollUpButton` (function) - missing summary; missing @example
- `src/components/select.tsx:146` `SelectSeparator` (function) - missing summary; missing @example
- `src/components/select.tsx:36` `SelectTrigger` (function) - missing summary; missing @example
- `src/components/select.tsx:26` `SelectValue` (function) - missing summary; missing @example
- `src/components/separator.tsx:10` `Separator` (function) - missing summary; missing @example
- `src/components/sheet.tsx:13` `Sheet` (function) - missing summary; missing @example
- `src/components/sheet.tsx:29` `SheetClose` (function) - missing summary; missing @example
- `src/components/sheet.tsx:54` `SheetContent` (function) - missing summary; missing @example
- `src/components/sheet.tsx:125` `SheetDescription` (function) - missing summary; missing @example
- `src/components/sheet.tsx:103` `SheetFooter` (function) - missing summary; missing @example
- `src/components/sheet.tsx:95` `SheetHeader` (function) - missing summary; missing @example
- `src/components/sheet.tsx:111` `SheetTitle` (function) - missing summary; missing @example
- `src/components/sheet.tsx:21` `SheetTrigger` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:185` `Sidebar` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:450` `SidebarContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:426` `SidebarFooter` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:467` `SidebarGroup` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:495` `SidebarGroupAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:515` `SidebarGroupContent` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:477` `SidebarGroupLabel` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:416` `SidebarHeader` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:402` `SidebarInput` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:384` `SidebarInset` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:523` `SidebarMenu` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:612` `SidebarMenuAction` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:643` `SidebarMenuBadge` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:568` `SidebarMenuButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:531` `SidebarMenuItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:665` `SidebarMenuSkeleton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:693` `SidebarMenuSub` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:719` `SidebarMenuSubButton` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:711` `SidebarMenuSubItem` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:73` `SidebarProvider` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:356` `SidebarRail` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:440` `SidebarSeparator` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:331` `SidebarTrigger` (function) - missing summary; missing @example
- `src/components/sidebar.tsx:44` `useSidebar` (function) - missing summary; missing @example
- `src/components/skeleton.tsx:8` `Skeleton` (function) - missing summary; missing @example
- `src/components/slider.tsx:29` `Slider` (function) - missing summary; missing @example
- `src/components/sonner.tsx:13` `Toaster` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:148` `SpeechInput` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:408` `SpeechInputCancelButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:364` `SpeechInputPreview` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:307` `SpeechInputRecordButton` (const) - missing summary; missing @example
- `src/components/speech-input.tsx:62` `useSpeechInput` (function) - missing summary; missing @example
- `src/components/spinner.tsx:9` `Spinner` (function) - missing summary; missing @example
- `src/components/switch.tsx:10` `Switch` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:9` `BorderAllIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:44` `BorderBottomIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:91` `BorderLeftIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:138` `BorderNoneIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:191` `BorderRightIcon` (function) - missing summary; missing @example
- `src/components/table-icons.tsx:238` `BorderTopIcon` (function) - missing summary; missing @example
- `src/components/table.tsx:10` `Table` (function) - missing summary; missing @example
- `src/components/table.tsx:30` `TableBody` (function) - missing summary; missing @example
- `src/components/table.tsx:97` `TableCaption` (function) - missing summary; missing @example
- `src/components/table.tsx:83` `TableCell` (function) - missing summary; missing @example
- `src/components/table.tsx:38` `TableFooter` (function) - missing summary; missing @example
- `src/components/table.tsx:66` `TableHead` (function) - missing summary; missing @example
- `src/components/table.tsx:22` `TableHeader` (function) - missing summary; missing @example
- `src/components/table.tsx:52` `TableRow` (function) - missing summary; missing @example
- `src/components/tabs.tsx:12` `Tabs` (function) - missing summary; missing @example
- `src/components/tabs.tsx:85` `TabsContent` (function) - missing summary; missing @example
- `src/components/tabs.tsx:46` `TabsList` (function) - missing summary; missing @example
- `src/components/tabs.tsx:65` `TabsTrigger` (function) - missing summary; missing @example
- `src/components/tabs.tsx:27` `tabsListVariants` (const) - missing summary; missing @example
- `src/components/textarea.tsx:8` `Textarea` (function) - missing summary; missing @example
- `src/components/toast.tsx:62` `ToastVariant` (const) - missing summary; missing @example
- `src/components/toast.tsx:72` `ToastVariant` (type) - missing summary; missing @example
- `src/components/toast.tsx:78` `ToastData` (class) - missing summary; missing @example
- `src/components/toast.tsx:91` `Toast` (const) - missing summary; missing @example
- `src/components/toast.tsx:108` `ToastAction` (const) - missing summary; missing @example
- `src/components/toast.tsx:175` `ToastActionElement` (type) - missing summary; missing @example
- `src/components/toast.tsx:126` `ToastClose` (const) - missing summary; missing @example
- `src/components/toast.tsx:157` `ToastDescription` (const) - missing summary; missing @example
- `src/components/toast.tsx:169` `ToastProps` (type) - missing summary; missing @example
- `src/components/toast.tsx:19` `ToastProvider` (const) - missing summary; missing @example
- `src/components/toast.tsx:146` `ToastTitle` (const) - missing summary; missing @example
- `src/components/toast.tsx:25` `ToastViewport` (const) - missing summary; missing @example
- `src/components/toaster.tsx:61` `Toaster` (function) - missing summary; missing @example
- `src/components/todo-item.tsx:105` `TodoItem` (function) - missing summary; missing @example
- `src/components/toggle-group.tsx:26` `ToggleGroup` (function) - missing summary; missing @example
- `src/components/toggle-group.tsx:64` `ToggleGroupItem` (function) - missing summary; missing @example
- `src/components/toggle.tsx:37` `Toggle` (function) - missing summary; missing @example
- `src/components/toggle.tsx:12` `toggleVariants` (const) - missing summary; missing @example
- `src/components/toolbar.tsx:21` `Toolbar` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:29` `ToolbarToggleGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:66` `ToolbarLink` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:74` `ToolbarSeparator` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:199` `ToolbarSplitButton` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:209` `ToolbarSplitButtonPrimary` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:238` `ToolbarSplitButtonSecondary` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:267` `ToolbarToggleItem` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:280` `ToolbarGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:332` `ToolbarMenuGroup` (function) - missing summary; missing @example
- `src/components/toolbar.tsx:144` `ToolbarButton` (const) - missing summary; missing @example
- `src/components/tooltip.tsx:18` `Tooltip` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:34` `TooltipContent` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:10` `TooltipProvider` (function) - missing summary; missing @example
- `src/components/tooltip.tsx:26` `TooltipTrigger` (function) - missing summary; missing @example
- `src/components/tour.tsx:43` `Step` (interface) - missing summary; missing @example
- `src/components/tour.tsx:62` `Tour` (interface) - missing summary; missing @example
- `src/components/tour.tsx:71` `TourProvider` (function) - missing summary; missing @example
- `src/components/tour.tsx:34` `useTour` (function) - missing summary; missing @example
- `src/components/ui/button.tsx:65` `Button` (function) - missing @example
- `src/components/ui/button.tsx:21` `buttonVariants` (const) - missing @example
- `src/components/ui/tooltip.tsx:20` `Tooltip` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:36` `TooltipContent` (function) - missing summary; missing @example
- `src/components/ui/tooltip.tsx:12` `TooltipProvider` (function) - missing @example
- `src/components/ui/tooltip.tsx:28` `TooltipTrigger` (function) - missing summary; missing @example
- `src/hooks/index.ts:13` `export * from "./use-scribe.ts";` (re-export) - missing @example
- `src/hooks/index.ts:18` `export * from "./useNumberInput.ts";` (re-export) - missing @example
- `src/hooks/use-scribe.ts:147` `useScribe` (function) - missing @example
- `src/hooks/use-scribe.ts:41` `ScribeStatus` (type) - missing @example
- `src/hooks/useMobile.ts:32` `useIsMobile` (function) - missing @example
- `src/hooks/useMobile.ts:24` `resolveIsMobile` (const) - missing @example
- `src/hooks/useNumberInput.ts:207` `minSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:215` `maxSafeInteger` (const) - missing @example
- `src/hooks/useNumberInput.ts:223` `BoundaryParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:241` `SpinParams` (class) - missing @example
- `src/hooks/useNumberInput.ts:371` `NumberInputEventType` (const) - missing @example
- `src/hooks/useNumberInput.ts:383` `NumberInputEventType` (type) - missing @example
- `src/hooks/useNumberInput.ts:391` `NumberInputError` (const) - missing @example
- `src/hooks/useNumberInput.ts:403` `NumberInputError` (type) - missing @example
- `src/hooks/useNumberInput.ts:411` `NumberInputChangeMetadata` (class) - missing @example
- `src/hooks/useNumberInput.ts:449` `UseNumberInputOptions` (type) - missing @example
- `src/hooks/useNumberInput.ts:514` `useNumberBoundary` (const) - missing @example
- `src/hooks/useNumberInput.ts:579` `useNumberInput` (const) - missing @example
- `src/hooks/useSpinner.ts:115` `useSpinner` (function) - missing @example
- `src/index.ts:21` `VERSION` (const) - missing summary; missing @example
- `src/lib/index.ts:5` `export * from "./url.ts";` (re-export) - missing @example
- `src/lib/index.ts:10` `export * from "./utils.ts";` (re-export) - missing @example
- `src/lib/react-invariant.ts:20` `ReactContextInvariantOptions` (class) - missing @example
- `src/lib/toaster.ts:16` `globalToastManager` (const) - missing @example
- `src/lib/url.ts:89` `sanitizeAnchorHref` (const) - missing @example
- `src/lib/utils.ts:22` `cn` (function) - missing @example
- `src/themes/colors.ts:30` `colors` (const) - missing @example
- `src/themes/components/alert.ts:7` `alertTheme` (const) - missing summary; missing @example
- `src/themes/components/autocomplete.ts:14` `autocompleteTheme` (const) - missing summary; missing @example
- `src/themes/components/avatar.ts:7` `avatarTheme` (const) - missing summary; missing @example
- `src/themes/components/button.ts:8` `buttonTheme` (const) - missing summary; missing @example
- `src/themes/components/card.ts:7` `cardTheme` (const) - missing summary; missing @example
- `src/themes/components/chip.ts:14` `chipTheme` (const) - missing summary; missing @example
- `src/themes/components/controls.ts:85` `controlsTheme` (const) - missing summary; missing @example
- `src/themes/components/data-grid.ts:8` `dataGridTheme` (const) - missing summary; missing @example
- `src/themes/components/date-picker.ts:10` `datePickerTheme` (const) - missing summary; missing @example
- `src/themes/components/dialog.ts:7` `dialogTheme` (const) - missing summary; missing @example
- `src/themes/components/layout.ts:7` `layoutTheme` (const) - missing summary; missing @example
- `src/themes/components/link.ts:7` `linkTheme` (const) - missing summary; missing @example
- `src/themes/components/list.ts:7` `listTheme` (const) - missing summary; missing @example
- `src/themes/components/menu.ts:7` `menuTheme` (const) - missing summary; missing @example
- `src/themes/components/progress.ts:7` `progressTheme` (const) - missing summary; missing @example
- `src/themes/components/select.ts:8` `selectTheme` (const) - missing summary; missing @example
- `src/themes/components/svg-icon.ts:7` `svgIconTheme` (const) - missing summary; missing @example
- `src/themes/components/table.ts:7` `tableTheme` (const) - missing summary; missing @example
- `src/themes/components/text-field.ts:32` `textFieldTheme` (const) - missing summary; missing @example
- `src/themes/components/tree-view.ts:8` `treeViewTheme` (const) - missing summary; missing @example
- `src/themes/index.ts:12` `export * from "./theme.ts";` (re-export) - missing @example
- `src/themes/index.ts:17` `export * from "./theme-init-script.tsx";` (re-export) - missing @example
- `src/themes/index.ts:22` `export * from "./theme-provider.tsx";` (re-export) - missing @example
- `src/themes/index.ts:27` `export type * from "./types.ts";` (re-export) - missing @example
- `src/themes/scales.ts:7` `CONTROL_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:19` `CONTROL_TOUCH_HEIGHTS` (const) - missing @example
- `src/themes/scales.ts:35` `TOUCH_MEDIA_QUERY` (const) - missing @example
- `src/themes/scales.ts:44` `SWITCH_SIZES` (const) - missing @example
- `src/themes/scales.ts:56` `SWITCH_TOUCH_SIZES` (const) - missing @example
- `src/themes/shadows.ts:9` `shadows` (const) - missing @example
- `src/themes/theme-init-script.tsx:12` `AppThemeInitScript` (function) - missing @example
- `src/themes/theme-provider.tsx:105` `AppThemeProvider` (function) - missing @example
- `src/themes/theme-provider.tsx:125` `useThemeMode` (function) - missing @example
- `src/themes/theme-provider.tsx:27` `ThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:39` `ThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:47` `ResolvedThemeMode` (const) - missing @example
- `src/themes/theme-provider.tsx:59` `ResolvedThemeMode` (type) - missing @example
- `src/themes/theme-provider.tsx:87` `resolveThemeMode` (const) - missing @example
- `src/themes/theme.ts:35` `themeOptions` (const) - missing @example
- `src/themes/theme.ts:75` `createAppTheme` (const) - missing @example
- `src/themes/theme.ts:83` `theme` (const) - missing @example
- `src/themes/types.ts:9` `ThemeOptions` (type) - missing @example
- `src/themes/types.ts:17` `ThemeComponents` (type) - missing @example
- `src/themes/typography.ts:89` `typography` (const) - missing @example
- `src/themes/typography.ts:113` `typographyTheme` (const) - missing @example

### @beep/repo-configs

Path: `packages/tooling/policy-pack/repo-configs`

Export findings:
- `src/next.ts:14` `export * from "./next/index.ts";` (re-export) - missing @example
- `src/next/internal.ts:19` `schemaIssueToError` (const) - missing @example
- `src/next/internal.ts:30` `isFunctionValue` (const) - missing @example
- `src/next/models/AllowedDevOrigin.schema.ts:57` `AllowedDevOrigin` (type) - 1 unsafe example violation(s)
- `src/next/models/ImageConfig.schema.ts:28` `LoaderValue` (const) - 1 schema annotation/type-alias gap(s)

### @beep/canvas-client

Path: `packages/canvas/client`

Export findings:
- `src/index.ts:15` `VERSION` (const) - missing @example

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
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:22` `DiscordChannelKind` (const) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:34` `DiscordChannelKind` (type) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:42` `DiscordChannelStatus` (const) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:54` `DiscordChannelStatus` (type) - missing @example
- `src/aggregates/DiscordChannel/DiscordChannel.model.ts:62` `DiscordChannel` (class) - missing @example
- `src/aggregates/DiscordChannel/index.ts:7` `export * from "./DiscordChannel.model.js";` (re-export) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:21` `HostDependencyKind` (const) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:33` `HostDependencyKind` (type) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:41` `HostDependencyStatus` (const) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:53` `HostDependencyStatus` (type) - missing @example
- `src/aggregates/HostDependency/HostDependency.model.ts:61` `HostDependency` (class) - missing @example
- `src/aggregates/HostDependency/index.ts:7` `export * from "./HostDependency.model.js";` (re-export) - missing @example
- `src/aggregates/index.ts:15` `export * as DiscordChannel from "./DiscordChannel/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:22` `export * as HostDependency from "./HostDependency/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:29` `export * as ProviderAccount from "./ProviderAccount/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:36` `export * as SecretReference from "./SecretReference/index.js";` (re-export) - missing @example
- `src/aggregates/index.ts:43` `export * as StackManifest from "./StackManifest/index.js";` (re-export) - missing @example
- `src/aggregates/ProviderAccount/index.ts:7` `export * from "./ProviderAccount.model.js";` (re-export) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:22` `ProviderKind` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:34` `ProviderKind` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:42` `ProviderAuthMode` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:54` `ProviderAuthMode` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:62` `ProviderAccountStatus` (const) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:74` `ProviderAccountStatus` (type) - missing @example
- `src/aggregates/ProviderAccount/ProviderAccount.model.ts:82` `ProviderAccount` (class) - missing @example
- `src/aggregates/SecretReference/index.ts:7` `export * from "./SecretReference.model.js";` (re-export) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:22` `SecretReferencePurpose` (const) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:39` `SecretReferencePurpose` (type) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:47` `SecretReferenceStatus` (const) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:59` `SecretReferenceStatus` (type) - missing @example
- `src/aggregates/SecretReference/SecretReference.model.ts:67` `SecretReference` (class) - missing @example
- `src/aggregates/StackManifest/index.ts:7` `export * from "./StackManifest.model.js";` (re-export) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:22` `StackInstallerPlatform` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:34` `StackInstallerPlatform` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:42` `StackInstallerProvider` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:54` `StackInstallerProvider` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:62` `ValidationTier` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:74` `ValidationTier` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:82` `ValidationStatus` (const) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:94` `ValidationStatus` (type) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:102` `ManifestProvider` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:120` `ManifestDiscordChannel` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:138` `ManifestCapability` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:156` `AIStackManifest` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:179` `ValidationEvent` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:199` `P1aDryRunSnapshot` (class) - missing @example
- `src/aggregates/StackManifest/StackManifest.model.ts:217` `P1LiveProofSnapshot` (class) - missing @example
- `src/index.ts:23` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Values from "./values/index.js";` (re-export) - missing @example
- `src/index.ts:15` `VERSION` (const) - missing @example

### @beep/architecture-lab-domain

Path: `packages/architecture-lab/domain`

Export findings:
- `src/aggregates/index.ts:7` `export * as WorkItem from "./WorkItem/index.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:7` `export * from "./WorkItem.errors.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:14` `export * from "./WorkItem.model.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/index.ts:21` `export * from "./WorkItem.values.js";` (re-export) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:22` `WorkItemAlreadyArchived` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:39` `WorkItemInvalidTransition` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:78` `WorkItemAssigneeRequired` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:95` `WorkItemDomainError` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.errors.ts:103` `WorkItemDomainError` (const) - missing @example; 1 schema annotation/type-alias gap(s)
- `src/aggregates/WorkItem/WorkItem.model.ts:26` `WorkItem` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:46` `CreateWorkItemInput` (class) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:66` `create` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:84` `assign` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:109` `complete` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:133` `reopen` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.model.ts:151` `archive` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:21` `WorkItemId` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:36` `WorkItemId` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:44` `WorkItemTitle` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:58` `WorkItemTitle` (type) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:66` `WorkItemStatus` (const) - missing @example
- `src/aggregates/WorkItem/WorkItem.values.ts:79` `WorkItemStatus` (type) - missing @example
- `src/entities/index.ts:15` `export * as Worker from "./Worker/index.js";` (re-export) - missing @example
- `src/entities/Worker/index.ts:7` `export * from "./Worker.model.js";` (re-export) - missing @example
- `src/entities/Worker/Worker.model.ts:26` `WorkerId` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:34` `WorkerId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:42` `WorkerOrganizationId` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:50` `WorkerOrganizationId` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:58` `WorkerStatus` (const) - missing @example
- `src/entities/Worker/Worker.model.ts:71` `WorkerStatus` (type) - missing @example
- `src/entities/Worker/Worker.model.ts:79` `Worker` (class) - missing @example
- `src/entities/Worker/Worker.model.ts:107` `CreateWorkerInput` (class) - missing @example
- `src/entities/Worker/Worker.model.ts:132` `create` (const) - missing @example
- `src/identity/ArchitectureLab.ts:21` `WorkerId` (const) - missing @example
- `src/identity/ArchitectureLab.ts:31` `WorkerId` (type) - missing @example
- `src/identity/index.ts:15` `export * as ArchitectureLab from "./ArchitectureLab.js";` (re-export) - missing @example
- `src/index.ts:30` `export * as Aggregates from "./aggregates/index.js";` (re-export) - missing @example
- `src/index.ts:37` `export * as WorkItem from "./aggregates/WorkItem/index.js";` (re-export) - missing @example
- `src/index.ts:44` `export * as Entities from "./entities/index.js";` (re-export) - missing @example
- `src/index.ts:51` `export * as Worker from "./entities/Worker/index.js";` (re-export) - missing @example
- `src/index.ts:58` `export * as Identity from "./identity/index.js";` (re-export) - missing @example
- `src/index.ts:65` `export * as Values from "./values/index.js";` (re-export) - missing @example
- `src/index.ts:72` `export * as WorkPriority from "./values/WorkPriority/index.js";` (re-export) - missing @example
- `src/values/index.ts:15` `export * as WorkPriority from "./WorkPriority/index.js";` (re-export) - missing @example
- `src/values/WorkPriority/index.ts:7` `export * from "./WorkPriority.behavior.js";` (re-export) - missing @example
- `src/values/WorkPriority/index.ts:14` `export * from "./WorkPriority.model.js";` (re-export) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:20` `defaultWorkPriority` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:28` `rank` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.behavior.ts:41` `compare` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.model.ts:20` `WorkPriority` (const) - missing @example
- `src/values/WorkPriority/WorkPriority.model.ts:33` `WorkPriority` (type) - missing @example

### @beep/canvas-ui

Path: `packages/canvas/ui`

Export findings:
- `src/index.ts:15` `VERSION` (const) - missing @example

### @beep/messages

Path: `packages/foundation/modeling/messages`

Export findings:
- `src/i18n.ts:197` `logIssues` (const) - missing @example

### @beep/sanity

Path: `packages/drivers/sanity`

Export findings:
- `src/index.ts:14` `export * from "./Sanity.config.ts";` (re-export) - missing @example
- `src/index.ts:21` `export * from "./Sanity.errors.ts";` (re-export) - missing @example
- `src/index.ts:28` `export * from "./Sanity.service.ts";` (re-export) - missing @example
