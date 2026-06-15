---
title: packages.ts
nav_order: 3
parent: "@beep/identity"
---

## packages.ts overview

Canonical identity composers for every `@beep/*` workspace namespace.

Each export is a pre-built `Identity.IdentityComposer` scoped to a
specific workspace package. Use these to derive schema identifiers,
error tags, and service keys without manually calling `make`.

**Example**

```ts
```typescript
import { $I, $SchemaId } from "@beep/identity/packages"

const serviceId = $SchemaId`TenantService`
const customId = $I.create("custom").make("CustomService")
console.log(serviceId)
console.log(customId)
```
```

Since v0.0.0

---
## Exports Grouped by Category
- [$AgentsDomainId](#agentsdomainid)
- [$AgentsUseCasesId](#agentsusecasesid)
- [$AiProviderCliId](#aiprovidercliid)
- [$AiSyncId](#aisyncid)
- [$AnthropicId](#anthropicid)
- [$ArchitectureLabClientId](#architecturelabclientid)
- [$ArchitectureLabConfigId](#architecturelabconfigid)
- [$ArchitectureLabDomainId](#architecturelabdomainid)
- [$ArchitectureLabProofId](#architecturelabproofid)
- [$ArchitectureLabServerId](#architecturelabserverid)
- [$ArchitectureLabTablesId](#architecturelabtablesid)
- [$ArchitectureLabUiId](#architecturelabuiid)
- [$ArchitectureLabUseCasesId](#architecturelabusecasesid)
- [$BoxId](#boxid)
- [$ChalkId](#chalkid)
- [$ColorsId](#colorsid)
- [$DataId](#dataid)
- [$DiscordId](#discordid)
- [$DrizzleId](#drizzleid)
- [$DuckdbId](#duckdbid)
- [$EditorId](#editorid)
- [$EpistemicDomainId](#epistemicdomainid)
- [$FaceDetectionId](#facedetectionid)
- [$FfmpegId](#ffmpegid)
- [$FileProcessingId](#fileprocessingid)
- [$FirecrawlId](#firecrawlid)
- [$FormId](#formid)
- [$HubspotId](#hubspotid)
- [$I](#i)
- [$IdentityId](#identityid)
- [$InfraId](#infraid)
- [$KonvaId](#konvaid)
- [$LangExtractId](#langextractid)
- [$LawPracticeDomainId](#lawpracticedomainid)
- [$LexicalSchemaId](#lexicalschemaid)
- [$LibpffId](#libpffid)
- [$MdId](#mdid)
- [$NlpId](#nlpid)
- [$NlpMcpId](#nlpmcpid)
- [$ObservabilityId](#observabilityid)
- [$OipWebId](#oipwebid)
- [$OnepasswordCliId](#onepasswordcliid)
- [$OpenaiCompatId](#openaicompatid)
- [$PhoenixId](#phoenixid)
- [$PostgresId](#postgresid)
- [$ProfessionalDesktopId](#professionaldesktopid)
- [$RdfId](#rdfid)
- [$RepoAiMetricsId](#repoaimetricsid)
- [$RepoCliId](#repocliid)
- [$RepoCodegraphId](#repocodegraphid)
- [$RepoConfigsId](#repoconfigsid)
- [$RepoDocgenId](#repodocgenid)
- [$RepoUtilsId](#repoutilsid)
- [$RunpodId](#runpodid)
- [$SanityId](#sanityid)
- [$SchemaId](#schemaid)
- [$SemanticWebId](#semanticwebid)
- [$SharedClientId](#sharedclientid)
- [$SharedConfigId](#sharedconfigid)
- [$SharedDomainId](#shareddomainid)
- [$SharedServerId](#sharedserverid)
- [$SharedTablesId](#sharedtablesid)
- [$SharedUiId](#shareduiid)
- [$SharedUseCasesId](#sharedusecasesid)
- [$TestUtilsId](#testutilsid)
- [$TikaId](#tikaid)
- [$TypesId](#typesid)
- [$UiId](#uiid)
- [$UsptoId](#usptoid)
- [$UtilsId](#utilsid)
- [$VeniceAiId](#veniceaiid)
- [$WinkId](#winkid)
- [$WorkspaceDomainId](#workspacedomainid)
- [$WorkspaceServerId](#workspaceserverid)
- [$WorkspaceTablesId](#workspacetablesid)
- [$WorkspaceUseCasesId](#workspaceusecasesid)
- [$XaiId](#xaiid)
- [RepoPkgs](#repopkgs)
---

# configuration

## $AcpId

Identity composer for `@beep/acp`.

**Example**

```ts
```typescript
import { $AcpId } from "@beep/identity"

const id = $AcpId.make("AcpClient")
console.log(id)
```
```

**Signature**

```ts
declare const $AcpId: Identity.IdentityComposer<"@beep/acp">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L836)

Since v0.0.0

## $AgentsDomainId

Identity composer for the `@beep/agents-domain` package.

**Example**

```ts
```typescript
import { $AgentsDomainId } from "@beep/identity"

const id = $AgentsDomainId.make("Agent")
```
```

**Signature**

```ts
declare const $AgentsDomainId: Identity.IdentityComposer<"@beep/agents-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L598)

Since v0.0.0

## $AgentsUseCasesId

Identity composer for the `@beep/agents-use-cases` package.

**Example**

```ts
```typescript
import { $AgentsUseCasesId } from "@beep/identity"

const id = $AgentsUseCasesId.make("RuntimeScope")
```
```

**Signature**

```ts
declare const $AgentsUseCasesId: Identity.IdentityComposer<"@beep/agents-use-cases">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L613)

Since v0.0.0

## $AiProviderCliId

Identity composer for `@beep/ai-provider-cli`.

**Example**

```ts
```typescript
import { $AiProviderCliId } from "@beep/identity"

const id = $AiProviderCliId.make("AiProviderCli")
console.log(id)
```
```

**Signature**

```ts
declare const $AiProviderCliId: Identity.IdentityComposer<"@beep/ai-provider-cli">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1101)

Since v0.0.0

## $AiSyncId

Identity composer for `@beep/ai-sync`.

**Example**

```ts
```typescript
import { $AiSyncId } from "@beep/identity"

const id = $AiSyncId.make("AiSync")
console.log(id)
```
```

**Signature**

```ts
declare const $AiSyncId: Identity.IdentityComposer<"@beep/ai-sync">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1198)

Since v0.0.0

## $AnthropicId

Identity composer for `@beep/anthropic`.

**Example**

```ts
```typescript
import { $AnthropicId } from "@beep/identity"

const id = $AnthropicId.make("Anthropic")
console.log(id)
```
```

**Signature**

```ts
declare const $AnthropicId: Identity.IdentityComposer<"@beep/anthropic">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L788)

Since v0.0.0

## $ArchitectureLabClientId

Identity composer for `@beep/architecture-lab-client`.

**Example**

```ts
```typescript
import { $ArchitectureLabClientId } from "@beep/identity"

const id = $ArchitectureLabClientId.make("WorkItemClient")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabClientId: Identity.IdentityComposer<"@beep/architecture-lab-client">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1002)

Since v0.0.0

## $ArchitectureLabConfigId

Identity composer for `@beep/architecture-lab-config`.

**Example**

```ts
```typescript
import { $ArchitectureLabConfigId } from "@beep/identity"

const id = $ArchitectureLabConfigId.make("Config")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabConfigId: Identity.IdentityComposer<"@beep/architecture-lab-config">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L951)

Since v0.0.0

## $ArchitectureLabDomainId

Identity composer for `@beep/architecture-lab-domain`.

**Example**

```ts
```typescript
import { $ArchitectureLabDomainId } from "@beep/identity"

const id = $ArchitectureLabDomainId.make("WorkItem")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabDomainId: Identity.IdentityComposer<"@beep/architecture-lab-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L917)

Since v0.0.0

## $ArchitectureLabProofId

Identity composer for `@beep/architecture-lab-proof`.

**Example**

```ts
```typescript
import { $ArchitectureLabProofId } from "@beep/identity"

const id = $ArchitectureLabProofId.make("Proof")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabProofId: Identity.IdentityComposer<"@beep/architecture-lab-proof">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1036)

Since v0.0.0

## $ArchitectureLabServerId

Identity composer for `@beep/architecture-lab-server`.

**Example**

```ts
```typescript
import { $ArchitectureLabServerId } from "@beep/identity"

const id = $ArchitectureLabServerId.make("Layer")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabServerId: Identity.IdentityComposer<"@beep/architecture-lab-server">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L968)

Since v0.0.0

## $ArchitectureLabTablesId

Identity composer for `@beep/architecture-lab-tables`.

**Example**

```ts
```typescript
import { $ArchitectureLabTablesId } from "@beep/identity"

const id = $ArchitectureLabTablesId.make("WorkItemTable")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabTablesId: Identity.IdentityComposer<"@beep/architecture-lab-tables">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L985)

Since v0.0.0

## $ArchitectureLabUiId

Identity composer for `@beep/architecture-lab-ui`.

**Example**

```ts
```typescript
import { $ArchitectureLabUiId } from "@beep/identity"

const id = $ArchitectureLabUiId.make("WorkItemViewModel")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabUiId: Identity.IdentityComposer<"@beep/architecture-lab-ui">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1019)

Since v0.0.0

## $ArchitectureLabUseCasesId

Identity composer for `@beep/architecture-lab-use-cases`.

**Example**

```ts
```typescript
import { $ArchitectureLabUseCasesId } from "@beep/identity"

const id = $ArchitectureLabUseCasesId.make("WorkItemService")
console.log(id)
```
```

**Signature**

```ts
declare const $ArchitectureLabUseCasesId: Identity.IdentityComposer<"@beep/architecture-lab-use-cases">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L934)

Since v0.0.0

## $BoxId

Identity composer for `@beep/box`.

**Example**

```ts
```typescript
import { $BoxId } from "@beep/identity"

const id = $BoxId.make("Box")
void id
```
```

**Signature**

```ts
declare const $BoxId: Identity.IdentityComposer<"@beep/box">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1230)

Since v0.0.0

## $ChalkId

Identity composer for the `@beep/chalk` package.

**Example**

```ts
```typescript
import { $ChalkId } from "@beep/identity"

const id = $ChalkId.make("Formatter")
```
```

**Signature**

```ts
declare const $ChalkId: Identity.IdentityComposer<"@beep/chalk">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L506)

Since v0.0.0

## $ColorsId

Identity composer for the `@beep/colors` package.

**Example**

```ts
```typescript
import { $ColorsId } from "@beep/identity"

const id = $ColorsId.make("Palette")
```
```

**Signature**

```ts
declare const $ColorsId: Identity.IdentityComposer<"@beep/colors">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L491)

Since v0.0.0

## $DataId

Identity composer for the `@beep/data` package.

**Example**

```ts
```typescript
import { $DataId } from "@beep/identity"

const id = $DataId.make("Calendar")
```
```

**Signature**

```ts
declare const $DataId: Identity.IdentityComposer<"@beep/data">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L155)

Since v0.0.0

## $DiscordId

Identity composer for `@beep/discord`.

**Example**

```ts
```typescript
import { $DiscordId } from "@beep/identity"

const id = $DiscordId.make("Discord")
console.log(id)
```
```

**Signature**

```ts
declare const $DiscordId: Identity.IdentityComposer<"@beep/discord">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1085)

Since v0.0.0

## $DrizzleId

$drizzle id export.

**Example**

```ts
import { $DrizzleId } from "@beep/identity/packages"

console.log($DrizzleId)
```

**Signature**

```ts
declare const $DrizzleId: Identity.IdentityComposer<"@beep/drizzle">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L708)

Since v0.0.0

## $DuckdbId

$duckdb id export.

**Example**

```ts
import { $DuckdbId } from "@beep/identity/packages"

console.log($DuckdbId)
```

**Signature**

```ts
declare const $DuckdbId: Identity.IdentityComposer<"@beep/duckdb">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L724)

Since v0.0.0

## $EditorId

Identity composer for `@beep/editor`.

**Example**

```ts
```typescript
import { $EditorId } from "@beep/identity"

const id = $EditorId.make("Editor")
void id
```
```

**Signature**

```ts
declare const $EditorId: Identity.IdentityComposer<"@beep/editor">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1374)

Since v0.0.0

## $EpistemicDomainId

Identity composer for the `@beep/epistemic-domain` package.

**Example**

```ts
```typescript
import { $EpistemicDomainId } from "@beep/identity"

const id = $EpistemicDomainId.make("Evidence")
```
```

**Signature**

```ts
declare const $EpistemicDomainId: Identity.IdentityComposer<"@beep/epistemic-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L583)

Since v0.0.0

## $FaceDetectionId

$face detection id export.

**Example**

```ts
import { $FaceDetectionId } from "@beep/identity/packages"

console.log($FaceDetectionId)
```

**Signature**

```ts
declare const $FaceDetectionId: Identity.IdentityComposer<"@beep/face-detection">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L740)

Since v0.0.0

## $FfmpegId

$ffmpeg id export.

**Example**

```ts
import { $FfmpegId } from "@beep/identity/packages"

console.log($FfmpegId)
```

**Signature**

```ts
declare const $FfmpegId: Identity.IdentityComposer<"@beep/ffmpeg">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L756)

Since v0.0.0

## $FileProcessingId

Identity composer for `@beep/file-processing`.

**Example**

```ts
```typescript
import { $FileProcessingId } from "@beep/identity"

const id = $FileProcessingId.make("FileProcessing")
void id
```
```

**Signature**

```ts
declare const $FileProcessingId: Identity.IdentityComposer<"@beep/file-processing">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1278)

Since v0.0.0

## $FirecrawlId

Identity composer for `@beep/firecrawl`.

**Example**

```ts
```typescript
import { $FirecrawlId } from "@beep/identity"

const id = $FirecrawlId.make("Firecrawl")
void id
```
```

**Signature**

```ts
declare const $FirecrawlId: Identity.IdentityComposer<"@beep/firecrawl">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1326)

Since v0.0.0

## $FormId

Identity composer for `@beep/form`.

**Example**

```ts
```typescript
import { $FormId } from "@beep/identity"

const id = $FormId.make("Form")
console.log(id)
```
```

**Signature**

```ts
declare const $FormId: Identity.IdentityComposer<"@beep/form">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1214)

Since v0.0.0

## $HubspotId

Identity composer for `@beep/hubspot`.

**Example**

```ts
```typescript
import { $HubspotId } from "@beep/identity"

const id = $HubspotId.make("Hubspot")
console.log(id)
```
```

**Signature**

```ts
declare const $HubspotId: Identity.IdentityComposer<"@beep/hubspot">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1133)

Since v0.0.0

## $I

Root identity composer for the `@beep` namespace.

All other package composers are derived from this root via `compose`.

**Example**

```ts
```typescript
import { $I } from "@beep/identity/packages"

const id = $I.make("CustomSegment")
console.log(id)// "@beep/CustomSegment"
```
```

**Signature**

```ts
declare const $I: Identity.IdentityComposer<"@beep">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L40)

Since v0.0.0

## $IdentityId

Identity composer for the `@beep/identity` package.

**Example**

```ts
```typescript
import { $IdentityId } from "@beep/identity"

const id = $IdentityId.make("Composer")
```
```

**Signature**

```ts
declare const $IdentityId: Identity.IdentityComposer<"@beep/identity">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L170)

Since v0.0.0

## $InfraId

Identity composer for the `@beep/infra` package.

**Example**

```ts
```typescript
import { $InfraId } from "@beep/identity"

const id = $InfraId.make("Deploy")
```
```

**Signature**

```ts
declare const $InfraId: Identity.IdentityComposer<"@beep/infra">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L536)

Since v0.0.0

## $KonvaId

Identity composer for `@beep/konva`.

**Example**

```ts
```typescript
import { $KonvaId } from "@beep/identity"

const id = $KonvaId.make("Konva")
console.log(id)
```
```

**Signature**

```ts
declare const $KonvaId: Identity.IdentityComposer<"@beep/konva">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1165)

Since v0.0.0

## $LangExtractId

Identity composer for the `@beep/langextract` package.

**Example**

```ts
```typescript
import { $LangExtractId } from "@beep/identity"

const id = $LangExtractId.make("Extraction")
```
```

**Signature**

```ts
declare const $LangExtractId: Identity.IdentityComposer<"@beep/langextract">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L461)

Since v0.0.0

## $LawPracticeDomainId

Identity composer for the `@beep/law-practice-domain` package.

**Example**

```ts
```typescript
import { $LawPracticeDomainId } from "@beep/identity"

const id = $LawPracticeDomainId.make("Matter")
```
```

**Signature**

```ts
declare const $LawPracticeDomainId: Identity.IdentityComposer<"@beep/law-practice-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L628)

Since v0.0.0

## $LexicalSchemaId

Identity composer for `@beep/lexical-schema`.

**Example**

```ts
```typescript
import { $LexicalSchemaId } from "@beep/identity"

const id = $LexicalSchemaId.make("LexicalSchema")
void id
```
```

**Signature**

```ts
declare const $LexicalSchemaId: Identity.IdentityComposer<"@beep/lexical-schema">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1358)

Since v0.0.0

## $LibpffId

Identity composer for `@beep/libpff`.

**Example**

```ts
```typescript
import { $LibpffId } from "@beep/identity"

const id = $LibpffId.make("Libpff")
void id
```
```

**Signature**

```ts
declare const $LibpffId: Identity.IdentityComposer<"@beep/libpff">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1310)

Since v0.0.0

## $MdId

$md id export.

**Example**

```ts
import { $MdId } from "@beep/identity/packages"

console.log($MdId)
```

**Signature**

```ts
declare const $MdId: Identity.IdentityComposer<"@beep/md">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L676)

Since v0.0.0

## $NlpId

Identity composer for the `@beep/nlp` package.

**Example**

```ts
```typescript
import { $NlpId } from "@beep/identity"

const id = $NlpId.make("Tokenizer")
```
```

**Signature**

```ts
declare const $NlpId: Identity.IdentityComposer<"@beep/nlp">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L446)

Since v0.0.0

## $NlpMcpId

Identity composer for `@beep/nlp-mcp`.

**Example**

```ts
```typescript
import { $NlpMcpId } from "@beep/identity"

const id = $NlpMcpId.make("NlpMcp")
void id
```
```

**Signature**

```ts
declare const $NlpMcpId: Identity.IdentityComposer<"@beep/nlp-mcp">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1246)

Since v0.0.0

## $ObservabilityId

Identity composer for the `@beep/observability` package.

**Example**

```ts
```typescript
import { $ObservabilityId } from "@beep/identity"

const id = $ObservabilityId.make("Tracer")
```
```

**Signature**

```ts
declare const $ObservabilityId: Identity.IdentityComposer<"@beep/observability">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L476)

Since v0.0.0

## $OipWebId

$oip web id export.

**Example**

```ts
import { $OipWebId } from "@beep/identity/packages"

console.log($OipWebId)
```

**Signature**

```ts
declare const $OipWebId: Identity.IdentityComposer<"@beep/oip-web">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L692)

Since v0.0.0

## $OnepasswordCliId

Identity composer for `@beep/onepassword-cli`.

**Example**

```ts
```typescript
import { $OnepasswordCliId } from "@beep/identity"

const id = $OnepasswordCliId.make("OnepasswordCli")
console.log(id)
```
```

**Signature**

```ts
declare const $OnepasswordCliId: Identity.IdentityComposer<"@beep/onepassword-cli">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1069)

Since v0.0.0

## $OpenaiCompatId

Identity composer for `@beep/openai-compat`.

**Example**

```ts
```typescript
import { $OpenaiCompatId } from "@beep/identity"

const id = $OpenaiCompatId.make("LanguageModel")
console.log(id)
```
```

**Signature**

```ts
declare const $OpenaiCompatId: Identity.IdentityComposer<"@beep/openai-compat">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L852)

Since v0.0.0

## $PhoenixId

Identity composer for `@beep/phoenix`.

**Example**

```ts
```typescript
import { $PhoenixId } from "@beep/identity"

const id = $PhoenixId.make("Phoenix")
console.log(id)
```
```

**Signature**

```ts
declare const $PhoenixId: Identity.IdentityComposer<"@beep/phoenix">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1149)

Since v0.0.0

## $PostgresId

$postgres id export.

**Example**

```ts
import { $PostgresId } from "@beep/identity/packages"

console.log($PostgresId)
```

**Signature**

```ts
declare const $PostgresId: Identity.IdentityComposer<"@beep/postgres">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L772)

Since v0.0.0

## $ProfessionalDesktopId

Identity composer for the `@beep/professional-desktop` package.

**Example**

```ts
```typescript
import { $ProfessionalDesktopId } from "@beep/identity"

const id = $ProfessionalDesktopId.make("Workbench")
```
```

**Signature**

```ts
declare const $ProfessionalDesktopId: Identity.IdentityComposer<"@beep/professional-desktop">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L644)

Since v0.0.0

## $RdfId

Identity composer for the `@beep/rdf` package.

**Example**

```ts
```typescript
import { $RdfId } from "@beep/identity"

const id = $RdfId.make("Iri")
```
```

**Signature**

```ts
declare const $RdfId: Identity.IdentityComposer<"@beep/rdf">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L200)

Since v0.0.0

## $RepoAiMetricsId

Identity composer for the `@beep/repo-ai-metrics` package.

**Example**

```ts
```typescript
import { $RepoAiMetricsId } from "@beep/identity"

const id = $RepoAiMetricsId.make("AgentTask")
```
```

**Signature**

```ts
declare const $RepoAiMetricsId: Identity.IdentityComposer<"@beep/repo-ai-metrics">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L264)

Since v0.0.0

## $RepoCliId

Identity composer for the `@beep/repo-cli` package.

**Example**

```ts
```typescript
import { $RepoCliId } from "@beep/identity"

const id = $RepoCliId.make("Command")
```
```

**Signature**

```ts
declare const $RepoCliId: Identity.IdentityComposer<"@beep/repo-cli">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L279)

Since v0.0.0

## $RepoCodegraphId

Identity composer for `@beep/repo-codegraph`.

**Example**

```ts
```typescript
import { $RepoCodegraphId } from "@beep/identity"

const id = $RepoCodegraphId.make("RepoCodegraph")
console.log(id)
```
```

**Signature**

```ts
declare const $RepoCodegraphId: Identity.IdentityComposer<"@beep/repo-codegraph">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1182)

Since v0.0.0

## $RepoConfigsId

Identity composer for the `@beep/repo-configs` package.

**Example**

```ts
```typescript
import { $RepoConfigsId } from "@beep/identity"

const id = $RepoConfigsId.make("Command")
```
```

**Signature**

```ts
declare const $RepoConfigsId: Identity.IdentityComposer<"@beep/repo-configs">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L294)

Since v0.0.0

## $RepoDocgenId

Identity composer for the `@beep/repo-docgen` package.

**Example**

```ts
```typescript
import { $RepoDocgenId } from "@beep/identity"

const id = $RepoDocgenId.make("Generator")
```
```

**Signature**

```ts
declare const $RepoDocgenId: Identity.IdentityComposer<"@beep/repo-docgen">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L521)

Since v0.0.0

## $RepoUtilsId

Identity composer for the `@beep/repo-utils` package.

**Example**

```ts
```typescript
import { $RepoUtilsId } from "@beep/identity"

const id = $RepoUtilsId.make("FileTree")
```
```

**Signature**

```ts
declare const $RepoUtilsId: Identity.IdentityComposer<"@beep/repo-utils">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L309)

Since v0.0.0

## $RunpodId

Identity composer for `@beep/runpod`.

**Example**

```ts
```typescript
import { $RunpodId } from "@beep/identity"

const id = $RunpodId.make("Runpod")
console.log(id)
```
```

**Signature**

```ts
declare const $RunpodId: Identity.IdentityComposer<"@beep/runpod">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1053)

Since v0.0.0

## $SanityId

Identity composer for `@beep/sanity`.

**Example**

```ts
```typescript
import { $SanityId } from "@beep/identity"

const id = $SanityId.make("Sanity")
console.log(id)
```
```

**Signature**

```ts
declare const $SanityId: Identity.IdentityComposer<"@beep/sanity">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1117)

Since v0.0.0

## $SchemaId

Identity composer for the `@beep/schema` package.

**Example**

```ts
```typescript
import { $SchemaId } from "@beep/identity"

const id = $SchemaId.make("EntityId")
```
```

**Signature**

```ts
declare const $SchemaId: Identity.IdentityComposer<"@beep/schema">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L185)

Since v0.0.0

## $SemanticWebId

Identity composer for the `@beep/semantic-web` package.

**Example**

```ts
```typescript
import { $SemanticWebId } from "@beep/identity"

const id = $SemanticWebId.make("Triple")
```
```

**Signature**

```ts
declare const $SemanticWebId: Identity.IdentityComposer<"@beep/semantic-web">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L431)

Since v0.0.0

## $SharedClientId

Identity composer for the `@beep/shared-client` package.

**Example**

```ts
```typescript
import { $SharedClientId } from "@beep/identity"

const id = $SharedClientId.make("HttpClient")
```
```

**Signature**

```ts
declare const $SharedClientId: Identity.IdentityComposer<"@beep/shared-client">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L371)

Since v0.0.0

## $SharedConfigId

Identity composer for the `@beep/shared-config` package.

**Example**

```ts
```typescript
import { $SharedConfigId } from "@beep/identity"

const id = $SharedConfigId.make("DatabaseUrl")
```
```

**Signature**

```ts
declare const $SharedConfigId: Identity.IdentityComposer<"@beep/shared-config">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L416)

Since v0.0.0

## $SharedDomainId

Identity composer for the `@beep/shared-domain` package.

**Example**

```ts
```typescript
import { $SharedDomainId } from "@beep/identity"

const id = $SharedDomainId.make("TenantId")
```
```

**Signature**

```ts
declare const $SharedDomainId: Identity.IdentityComposer<"@beep/shared-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L341)

Since v0.0.0

## $SharedServerId

Identity composer for the `@beep/shared-server` package.

**Example**

```ts
```typescript
import { $SharedServerId } from "@beep/identity"

const id = $SharedServerId.make("Middleware")
```
```

**Signature**

```ts
declare const $SharedServerId: Identity.IdentityComposer<"@beep/shared-server">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L386)

Since v0.0.0

## $SharedTablesId

Identity composer for the `@beep/shared-tables` package.

**Example**

```ts
```typescript
import { $SharedTablesId } from "@beep/identity"

const id = $SharedTablesId.make("AuditColumns")
```
```

**Signature**

```ts
declare const $SharedTablesId: Identity.IdentityComposer<"@beep/shared-tables">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L356)

Since v0.0.0

## $SharedUiId

Identity composer for the `@beep/shared-ui` package.

**Example**

```ts
```typescript
import { $SharedUiId } from "@beep/identity"

const id = $SharedUiId.make("ThemeProvider")
```
```

**Signature**

```ts
declare const $SharedUiId: Identity.IdentityComposer<"@beep/shared-ui">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L401)

Since v0.0.0

## $SharedUseCasesId

Identity composer for the `@beep/shared-use-cases` package.

**Example**

```ts
```typescript
import { $SharedUseCasesId } from "@beep/identity"

const id = $SharedUseCasesId.make("Workflow")
```
```

**Signature**

```ts
declare const $SharedUseCasesId: Identity.IdentityComposer<"@beep/shared-use-cases">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L551)

Since v0.0.0

## $TestUtilsId

Identity composer for the `@beep/test-utils` package.

**Example**

```ts
```typescript
import { $TestUtilsId } from "@beep/identity"

const id = $TestUtilsId.make("Fixture")
```
```

**Signature**

```ts
declare const $TestUtilsId: Identity.IdentityComposer<"@beep/test-utils">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L324)

Since v0.0.0

## $TikaId

Identity composer for `@beep/tika`.

**Example**

```ts
```typescript
import { $TikaId } from "@beep/identity"

const id = $TikaId.make("Tika")
void id
```
```

**Signature**

```ts
declare const $TikaId: Identity.IdentityComposer<"@beep/tika">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1294)

Since v0.0.0

## $TypesId

Identity composer for the `@beep/types` package.

**Example**

```ts
```typescript
import { $TypesId } from "@beep/identity"

const id = $TypesId.make("NonEmpty")
```
```

**Signature**

```ts
declare const $TypesId: Identity.IdentityComposer<"@beep/types">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L215)

Since v0.0.0

## $UiId

Identity composer for the `@beep/ui` package.

**Example**

```ts
```typescript
import { $UiId } from "@beep/identity"

const id = $UiId.make("Button")
```
```

**Signature**

```ts
declare const $UiId: Identity.IdentityComposer<"@beep/ui">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L247)

Since v0.0.0

## $UsptoId

Identity composer for the `@beep/uspto` package.

**Example**

```ts
```typescript
import { $UsptoId } from "@beep/identity"

const id = $UsptoId.make("Uspto")
void id
```
```

**Signature**

```ts
declare const $UsptoId: Identity.IdentityComposer<"@beep/uspto">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1342)

Since v0.0.0

## $UtilsId

Identity composer for the `@beep/utils` package.

**Example**

```ts
```typescript
import { $UtilsId } from "@beep/identity"

const id = $UtilsId.make("Retry")
```
```

**Signature**

```ts
declare const $UtilsId: Identity.IdentityComposer<"@beep/utils">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L230)

Since v0.0.0

## $VeniceAiId

$venice ai id export.

**Example**

```ts
import { $VeniceAiId } from "@beep/identity/packages"

console.log($VeniceAiId)
```

**Signature**

```ts
declare const $VeniceAiId: Identity.IdentityComposer<"@beep/venice-ai">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L804)

Since v0.0.0

## $WinkId

Identity composer for `@beep/wink`.

**Example**

```ts
```typescript
import { $WinkId } from "@beep/identity"

const id = $WinkId.make("Wink")
void id
```
```

**Signature**

```ts
declare const $WinkId: Identity.IdentityComposer<"@beep/wink">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L1262)

Since v0.0.0

## $WorkspaceDomainId

Identity composer for the `@beep/workspace-domain` package.

**Example**

```ts
```typescript
import { $WorkspaceDomainId } from "@beep/identity"

const id = $WorkspaceDomainId.make("ContextPacket")
```
```

**Signature**

```ts
declare const $WorkspaceDomainId: Identity.IdentityComposer<"@beep/workspace-domain">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L568)

Since v0.0.0

## $WorkspaceServerId

Identity composer for `@beep/workspace-server`.

**Example**

```ts
```typescript
import { $WorkspaceServerId } from "@beep/identity"

const id = $WorkspaceServerId.make("ThreadStoreLive")
console.log(id)
```
```

**Signature**

```ts
declare const $WorkspaceServerId: Identity.IdentityComposer<"@beep/workspace-server">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L901)

Since v0.0.0

## $WorkspaceTablesId

Identity composer for `@beep/workspace-tables`.

**Example**

```ts
```typescript
import { $WorkspaceTablesId } from "@beep/identity"

const id = $WorkspaceTablesId.make("WorkspaceTable")
console.log(id)
```
```

**Signature**

```ts
declare const $WorkspaceTablesId: Identity.IdentityComposer<"@beep/workspace-tables">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L868)

Since v0.0.0

## $WorkspaceUseCasesId

Identity composer for `@beep/workspace-use-cases`.

**Example**

```ts
```typescript
import { $WorkspaceUseCasesId } from "@beep/identity"

const id = $WorkspaceUseCasesId.make("ThreadStore")
console.log(id)
```
```

**Signature**

```ts
declare const $WorkspaceUseCasesId: Identity.IdentityComposer<"@beep/workspace-use-cases">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L884)

Since v0.0.0

## $XaiId

$xai id export.

**Example**

```ts
import { $XaiId } from "@beep/identity/packages"

console.log($XaiId)
```

**Signature**

```ts
declare const $XaiId: Identity.IdentityComposer<"@beep/xai">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L820)

Since v0.0.0

## RepoPkgs

RepoPkgs - export object containing all package IdentityComposer's

**Example**

```ts
import { RepoPkgs } from "@beep/identity/packages"

console.log(RepoPkgs)
```

**Signature**

```ts
declare const RepoPkgs: { $LangExtractId: Identity.IdentityComposer<"@beep/langextract">; $InfraId: Identity.IdentityComposer<"@beep/infra">; $ChalkId: Identity.IdentityComposer<"@beep/chalk">; $ColorsId: Identity.IdentityComposer<"@beep/colors">; $DataId: Identity.IdentityComposer<"@beep/data">; $IdentityId: Identity.IdentityComposer<"@beep/identity">; $LangextractId: Identity.IdentityComposer<"@beep/langextract">; $MdId: Identity.IdentityComposer<"@beep/md">; $NlpId: Identity.IdentityComposer<"@beep/nlp">; $ObservabilityId: Identity.IdentityComposer<"@beep/observability">; $RdfId: Identity.IdentityComposer<"@beep/rdf">; $SchemaId: Identity.IdentityComposer<"@beep/schema">; $SemanticWebId: Identity.IdentityComposer<"@beep/semantic-web">; $TypesId: Identity.IdentityComposer<"@beep/types">; $UiId: Identity.IdentityComposer<"@beep/ui">; $UtilsId: Identity.IdentityComposer<"@beep/utils">; $AgentsDomainId: Identity.IdentityComposer<"@beep/agents-domain">; $AgentsUseCasesId: Identity.IdentityComposer<"@beep/agents-use-cases">; $EpistemicDomainId: Identity.IdentityComposer<"@beep/epistemic-domain">; $LawPracticeDomainId: Identity.IdentityComposer<"@beep/law-practice-domain">; $ProfessionalDesktopId: Identity.IdentityComposer<"@beep/professional-desktop">; $WorkspaceDomainId: Identity.IdentityComposer<"@beep/workspace-domain">; $RepoAiMetricsId: Identity.IdentityComposer<"@beep/repo-ai-metrics">; $RepoCliId: Identity.IdentityComposer<"@beep/repo-cli">; $RepoConfigsId: Identity.IdentityComposer<"@beep/repo-configs">; $RepoDocgenId: Identity.IdentityComposer<"@beep/repo-docgen">; $RepoUtilsId: Identity.IdentityComposer<"@beep/repo-utils">; $TestUtilsId: Identity.IdentityComposer<"@beep/test-utils">; $DbAdminId: Identity.IdentityComposer<"@beep/db-admin">; $SharedDomainId: Identity.IdentityComposer<"@beep/shared-domain">; $SharedUseCasesId: Identity.IdentityComposer<"@beep/shared-use-cases">; $SharedServerId: Identity.IdentityComposer<"@beep/shared-server">; $SharedClientId: Identity.IdentityComposer<"@beep/shared-client">; $SharedTablesId: Identity.IdentityComposer<"@beep/shared-tables">; $SharedUiId: Identity.IdentityComposer<"@beep/shared-ui">; $SharedConfigId: Identity.IdentityComposer<"@beep/shared-config">; $OipWebId: Identity.IdentityComposer<"@beep/oip-web">; $DrizzleId: Identity.IdentityComposer<"@beep/drizzle">; $DuckdbId: Identity.IdentityComposer<"@beep/duckdb">; $FaceDetectionId: Identity.IdentityComposer<"@beep/face-detection">; $FfmpegId: Identity.IdentityComposer<"@beep/ffmpeg">; $PostgresId: Identity.IdentityComposer<"@beep/postgres">; $AnthropicId: Identity.IdentityComposer<"@beep/anthropic">; $VeniceAiId: Identity.IdentityComposer<"@beep/venice-ai">; $XaiId: Identity.IdentityComposer<"@beep/xai">; $AcpId: Identity.IdentityComposer<"@beep/acp">; $OpenaiCompatId: Identity.IdentityComposer<"@beep/openai-compat">; $WorkspaceTablesId: Identity.IdentityComposer<"@beep/workspace-tables">; $WorkspaceUseCasesId: Identity.IdentityComposer<"@beep/workspace-use-cases">; $WorkspaceServerId: Identity.IdentityComposer<"@beep/workspace-server">; $ArchitectureLabDomainId: Identity.IdentityComposer<"@beep/architecture-lab-domain">; $ArchitectureLabUseCasesId: Identity.IdentityComposer<"@beep/architecture-lab-use-cases">; $ArchitectureLabConfigId: Identity.IdentityComposer<"@beep/architecture-lab-config">; $ArchitectureLabServerId: Identity.IdentityComposer<"@beep/architecture-lab-server">; $ArchitectureLabTablesId: Identity.IdentityComposer<"@beep/architecture-lab-tables">; $ArchitectureLabClientId: Identity.IdentityComposer<"@beep/architecture-lab-client">; $ArchitectureLabUiId: Identity.IdentityComposer<"@beep/architecture-lab-ui">; $ArchitectureLabProofId: Identity.IdentityComposer<"@beep/architecture-lab-proof">; $RunpodId: Identity.IdentityComposer<"@beep/runpod">; $OnepasswordCliId: Identity.IdentityComposer<"@beep/onepassword-cli">; $DiscordId: Identity.IdentityComposer<"@beep/discord">; $AiProviderCliId: Identity.IdentityComposer<"@beep/ai-provider-cli">; $SanityId: Identity.IdentityComposer<"@beep/sanity">; $HubspotId: Identity.IdentityComposer<"@beep/hubspot">; $PhoenixId: Identity.IdentityComposer<"@beep/phoenix">; $KonvaId: Identity.IdentityComposer<"@beep/konva">; $RepoCodegraphId: Identity.IdentityComposer<"@beep/repo-codegraph">; $AiSyncId: Identity.IdentityComposer<"@beep/ai-sync">; $FormId: Identity.IdentityComposer<"@beep/form">; $NlpMcpId: Identity.IdentityComposer<"@beep/nlp-mcp">; $WinkId: Identity.IdentityComposer<"@beep/wink">; $FileProcessingId: Identity.IdentityComposer<"@beep/file-processing">; $TikaId: Identity.IdentityComposer<"@beep/tika">; $LibpffId: Identity.IdentityComposer<"@beep/libpff">; $BoxId: Identity.IdentityComposer<"@beep/box">; $FirecrawlId: Identity.IdentityComposer<"@beep/firecrawl">; $UsptoId: Identity.IdentityComposer<"@beep/uspto">; $LexicalSchemaId: Identity.IdentityComposer<"@beep/lexical-schema">; $EditorId: Identity.IdentityComposer<"@beep/editor">; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/identity/src/packages.ts#L660)

Since v0.0.0