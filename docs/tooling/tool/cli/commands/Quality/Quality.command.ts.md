---
title: Quality.command.ts
nav_order: 67
parent: "@beep/repo-cli"
---

## Quality.command.ts overview

Repo operational quality commands migrated from root scripts.

Since v0.0.0

---
## Exports Grouped by Category
- [cli-commands](#cli-commands)
  - [qualityCommand](#qualitycommand)
- [configuration](#configuration)
  - [detectQualityProfileForTesting](#detectqualityprofilefortesting)
  - [qualityProfileConfigForTesting](#qualityprofileconfigfortesting)
- [errors](#errors)
  - [QualityScriptCommandError](#qualityscriptcommanderror)
- [models](#models)
  - [GithubCheckLaneSpec (class)](#githubchecklanespec-class)
  - [GithubCheckLaneStage](#githubchecklanestage)
  - [GithubCheckMode](#githubcheckmode)
  - [GithubCheckMode (type alias)](#githubcheckmode-type-alias)
  - [GithubChecksFallowFeatureMatrix (class)](#githubchecksfallowfeaturematrix-class)
  - [QualityHardwareProfile](#qualityhardwareprofile)
  - [QualityHardwareProfile (type alias)](#qualityhardwareprofile-type-alias)
  - [QualityProfileConfig (class)](#qualityprofileconfig-class)
  - [QualityProfileDetection (class)](#qualityprofiledetection-class)
- [testing](#testing)
  - [affectedRepoExportsCatalogPlanForTesting](#affectedrepoexportscatalogplanfortesting)
  - [fullRepoExportsCatalogEscalationCommandForTesting](#fullrepoexportscatalogescalationcommandfortesting)
  - [githubCheckLanesForModeForTesting](#githubchecklanesformodefortesting)
  - [githubCheckPrePushExternalLanesForTesting](#githubcheckprepushexternallanesfortesting)
  - [githubCheckPromotedFallowLaneDiagnosticsForTesting](#githubcheckpromotedfallowlanediagnosticsfortesting)
  - [githubCheckQualityLanesForTesting](#githubcheckqualitylanesfortesting)
  - [githubCheckRepoSanityLanesForTesting](#githubcheckreposanitylanesfortesting)
  - [promotedFallowGithubCheckLaneIdsForTesting](#promotedfallowgithubchecklaneidsfortesting)
  - [reviewFixDocgenLocalArgsForTesting](#reviewfixdocgenlocalargsfortesting)
- [type-level](#type-level)
  - [GithubCheckLaneStage (type alias)](#githubchecklanestage-type-alias)
- [use-cases](#use-cases)
  - [runBunAudit](#runbunaudit)
  - [runDtslintTsgoChecks](#rundtslinttsgochecks)
  - [runGithubChecks](#rungithubchecks)
  - [runJSDocInventory](#runjsdocinventory)
  - [runJSDocModuleTagsCheck](#runjsdocmoduletagscheck)
  - [runJSDocQuality](#runjsdocquality)
  - [runRepoExportsCatalog](#runrepoexportscatalog)
  - [runTestTsgoChecks](#runtesttsgochecks)
  - [runTsgoRulesCheck](#runtsgorulescheck)
  - [runTsgoSmokeCheck](#runtsgosmokecheck)
- [utilities](#utilities)
  - [collectEffectTsgoDiagnosticLines](#collecteffecttsgodiagnosticlines)
---

# cli-commands

## qualityCommand

Quality command group for repo operational checks.

**Example**

```ts
console.log("qualityCommand")
```

**Signature**

```ts
declare const qualityCommand: Command.Command<"quality", {} | {}, {}, GithubCheckError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2941)

Since v0.0.0

# configuration

## detectQualityProfileForTesting

Detect the quality hardware profile from host facts.

**Example**

```ts
import { detectQualityProfileForTesting } from "@beep/repo-cli/test/Quality"

const profile = detectQualityProfileForTesting({
  ci: false,
  cpuCount: 64,
  totalMemoryBytes: 128 * 1024 * 1024 * 1024
})
console.log(profile.profile)
```

**Signature**

```ts
declare const detectQualityProfileForTesting: (input: QualityProfileDetectionInput) => QualityProfileDetection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L249)

Since v0.0.0

## qualityProfileConfigForTesting

Return static quality scheduling settings for a hardware profile.

**Example**

```ts
import { qualityProfileConfigForTesting } from "@beep/repo-cli/test/Quality"

console.log(qualityProfileConfigForTesting("workstation").reviewFixSlots)
```

**Signature**

```ts
declare const qualityProfileConfigForTesting: (profile: QualityHardwareProfile) => QualityProfileConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L201)

Since v0.0.0

# errors

## QualityScriptCommandError

Public quality script command error export.

**Signature**

```ts
declare const QualityScriptCommandError: typeof QualityScriptCommandError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L51)

Since v0.0.0

# models

## GithubCheckLaneSpec (class)

Executable lane specification for GitHub check collectors.

**Example**

```ts
import { GithubCheckLaneSpec } from "@beep/repo-cli/commands/Quality/Quality.command"
import { QualityTaskStep } from "@beep/repo-cli/commands/Quality/Tasks"
const lane = GithubCheckLaneSpec.make({
  id: "quality:build",
  stage: "repo-quality",
  blockedBy: [],
  step: QualityTaskStep.make({ label: "build", command: "bun", args: ["run", "build"], cwd: "/repo" })
})
console.log(lane.id)
```

**Signature**

```ts
declare class GithubCheckLaneSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L593)

Since v0.0.0

## GithubCheckLaneStage

Stage label for a GitHub check collector lane.

**Example**

```ts
import { GithubCheckLaneStage } from "@beep/repo-cli/commands/Quality/Quality.command"
const stage = GithubCheckLaneStage
console.log(stage)
```

**Signature**

```ts
declare const GithubCheckLaneStage: AnnotatedSchema<LiteralKit<readonly ["repo-quality", "repo-sanity", "diff-security", "environment"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L556)

Since v0.0.0

## GithubCheckMode

GitHub check mode handled by `beep quality github-checks`.

**Example**

```ts
import { GithubCheckMode } from "@beep/repo-cli/commands/Quality/Quality.command"
const mode: GithubCheckMode = "repo-sanity"
```

**Signature**

```ts
declare const GithubCheckMode: AnnotatedSchema<LiteralKit<readonly ["quality", "review-fix", "repo-sanity", "secrets", "security", "sast", "nix", "pre-push"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L364)

Since v0.0.0

## GithubCheckMode (type alias)

GitHub check mode handled by `beep quality github-checks`.

**Example**

```ts
import type { GithubCheckMode } from "@beep/repo-cli/commands/Quality/Quality.command"
const mode: GithubCheckMode = "quality"
```

**Signature**

```ts
type GithubCheckMode = GithubCheckModeType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L377)

Since v0.0.0

## GithubChecksFallowFeatureMatrix (class)

Minimal Fallow feature matrix used by GitHub check plan contract validation.

**Example**

```ts
import { GithubChecksFallowFeatureMatrix } from "@beep/repo-cli/commands/Quality/Quality.command"
const matrix = GithubChecksFallowFeatureMatrix.make({ features: [] })
console.log(matrix.features.length)
```

**Signature**

```ts
declare class GithubChecksFallowFeatureMatrix
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L447)

Since v0.0.0

## QualityHardwareProfile

Explicit machine profile used to tune future quality scheduling.

**Example**

```ts
import { QualityHardwareProfile } from "@beep/repo-cli/commands/Quality"

console.log(QualityHardwareProfile.is.workstation("workstation"))
```

**Signature**

```ts
declare const QualityHardwareProfile: AnnotatedSchema<LiteralKit<readonly ["current", "workstation", "ci"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L89)

Since v0.0.0

## QualityHardwareProfile (type alias)

Explicit machine profile used to tune future quality scheduling.

**Example**

```ts
import type { QualityHardwareProfile } from "@beep/repo-cli/commands/Quality"

const profile: QualityHardwareProfile = "current"
console.log(profile)
```

**Signature**

```ts
type QualityHardwareProfile = typeof QualityHardwareProfile.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L108)

Since v0.0.0

## QualityProfileConfig (class)

Static quality scheduling settings for a hardware profile.

**Example**

```ts
import { QualityProfileConfig } from "@beep/repo-cli/commands/Quality"

const config = QualityProfileConfig.make({
  profile: "current",
  turboConcurrency: 3,
  docgenParallel: 3,
  fullProofSlots: 1,
  reviewFixSlots: 1,
  notes: []
})
console.log(config.profile)
```

**Signature**

```ts
declare class QualityProfileConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L130)

Since v0.0.0

## QualityProfileDetection (class)

Detected quality profile plus host facts.

**Example**

```ts
import { QualityProfileDetection } from "@beep/repo-cli/commands/Quality"

const detection = QualityProfileDetection.make({
  profile: "current",
  cpuCount: 8,
  memoryGiB: 16,
  config: {
    profile: "current",
    turboConcurrency: 3,
    docgenParallel: 3,
    fullProofSlots: 1,
    reviewFixSlots: 1,
    notes: []
  }
})
console.log(detection.profile)
```

**Signature**

```ts
declare class QualityProfileDetection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L169)

Since v0.0.0

# testing

## affectedRepoExportsCatalogPlanForTesting

Build the conservative affected repo export catalog plan for a set of changed paths.

**Signature**

```ts
declare const affectedRepoExportsCatalogPlanForTesting: { (changedPaths: ReadonlyArray<string>, packages: ReadonlyArray<WorkspacePackageInfo>): AffectedRepoExportsCatalogPlan; (packages: ReadonlyArray<WorkspacePackageInfo>): (changedPaths: ReadonlyArray<string>) => AffectedRepoExportsCatalogPlan; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2592)

Since v0.0.0

## fullRepoExportsCatalogEscalationCommandForTesting

Resolve the full repo export catalog command used by affected escalation.

**Signature**

```ts
declare const fullRepoExportsCatalogEscalationCommandForTesting: (check: boolean) => { readonly args: ReadonlyArray<string>; readonly label: string; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2524)

Since v0.0.0

## githubCheckLanesForModeForTesting

Return the static GitHub check collector lanes for a mode.

**Example**

```ts
import { githubCheckLanesForModeForTesting } from "@beep/repo-cli/test/Quality"

console.log(githubCheckLanesForModeForTesting("/repo", "pre-push").map((lane) => lane.id))
```

**Signature**

```ts
declare const githubCheckLanesForModeForTesting: (repoRoot: string, mode: GithubCheckMode) => ReadonlyArray<GithubCheckLaneSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L943)

Since v0.0.0

## githubCheckPrePushExternalLanesForTesting

Build the external pre-push diagnostic lanes used by GitHub check collectors.

**Example**

```ts
import { githubCheckPrePushExternalLanesForTesting } from "@beep/repo-cli/test/Quality"
console.log(githubCheckPrePushExternalLanesForTesting("/repo"))
```

**Signature**

```ts
declare const githubCheckPrePushExternalLanesForTesting: (repoRoot: string) => ReadonlyArray<GithubCheckLaneSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1059)

Since v0.0.0

## githubCheckPromotedFallowLaneDiagnosticsForTesting

Compare promoted Fallow matrix rows against static GitHub check lanes.

**Example**

```ts
import { GithubChecksFallowFeatureMatrix, githubCheckPromotedFallowLaneDiagnosticsForTesting } from "@beep/repo-cli/test/Quality"

const matrix = GithubChecksFallowFeatureMatrix.make({ features: [] })
console.log(githubCheckPromotedFallowLaneDiagnosticsForTesting("/repo", "pre-push", matrix))
```

**Signature**

```ts
declare const githubCheckPromotedFallowLaneDiagnosticsForTesting: (repoRoot: string, mode: GithubCheckMode, matrix: GithubChecksFallowFeatureMatrix) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L994)

Since v0.0.0

## githubCheckQualityLanesForTesting

Build the repo-quality diagnostic lanes used by GitHub check collectors.

**Example**

```ts
import { githubCheckQualityLanesForTesting } from "@beep/repo-cli/test/Quality"
console.log(githubCheckQualityLanesForTesting("/repo"))
```

**Signature**

```ts
declare const githubCheckQualityLanesForTesting: (repoRoot: string) => ReadonlyArray<GithubCheckLaneSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1029)

Since v0.0.0

## githubCheckRepoSanityLanesForTesting

Build the repo-sanity diagnostic lanes used by GitHub check collectors.

**Example**

```ts
import { githubCheckRepoSanityLanesForTesting } from "@beep/repo-cli/test/Quality"
console.log(githubCheckRepoSanityLanesForTesting("/repo"))
```

**Signature**

```ts
declare const githubCheckRepoSanityLanesForTesting: (repoRoot: string) => ReadonlyArray<GithubCheckLaneSpec>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1044)

Since v0.0.0

## promotedFallowGithubCheckLaneIdsForTesting

Derive the GitHub check lane ids required by currently promoted Fallow matrix rows.

**Example**

```ts
import { GithubChecksFallowFeatureMatrix, promotedFallowGithubCheckLaneIdsForTesting } from "@beep/repo-cli/test/Quality"

const matrix = GithubChecksFallowFeatureMatrix.make({ features: [] })
console.log(promotedFallowGithubCheckLaneIdsForTesting(matrix))
```

**Signature**

```ts
declare const promotedFallowGithubCheckLaneIdsForTesting: (matrix: GithubChecksFallowFeatureMatrix) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L917)

Since v0.0.0

## reviewFixDocgenLocalArgsForTesting

Build the docgen command arguments for the review-fix proof lane.

**Example**

```ts
import { reviewFixDocgenLocalArgsForTesting } from "@beep/repo-cli/test/Quality"

console.log(reviewFixDocgenLocalArgsForTesting("origin/main", "HEAD"))
```

**Signature**

```ts
declare const reviewFixDocgenLocalArgsForTesting: (base: string, head: string) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1119)

Since v0.0.0

# type-level

## GithubCheckLaneStage (type alias)

Stage label for a GitHub check collector lane.

**Example**

```ts
import type { GithubCheckLaneStage } from "@beep/repo-cli/commands/Quality/Quality.command"
const stage: GithubCheckLaneStage = "repo-quality"
```

**Signature**

```ts
type GithubCheckLaneStage = typeof GithubCheckLaneStage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L573)

Since v0.0.0

# use-cases

## runBunAudit

Run Bun's high-severity package audit with OSV ignores mirrored from config.

**Example**

```ts
import { runBunAudit } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runBunAudit("/repo")
```

**Signature**

```ts
declare const runBunAudit: (repoRoot: string) => Effect.Effect<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L782)

Since v0.0.0

## runDtslintTsgoChecks

Run repo-wide tsgo diagnostics for dtslint files.

**Example**

```ts
import { runDtslintTsgoChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runDtslintTsgoChecks([])
```

**Signature**

```ts
declare const runDtslintTsgoChecks: (extraArgs: ReadonlyArray<string>) => Effect.Effect<void, QualityScriptCommandError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1987)

Since v0.0.0

## runGithubChecks

Run a GitHub checks mode from the repository root.

**Example**

```ts
import { runGithubChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runGithubChecks("repo-sanity")
```

**Signature**

```ts
declare const runGithubChecks: (mode: "quality" | "security" | "review-fix" | "repo-sanity" | "secrets" | "sast" | "nix" | "pre-push", options?: GithubCheckRunOptions | undefined) => Effect.Effect<void, GithubCheckError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1342)

Since v0.0.0

## runJSDocInventory

Run the JSDoc inventory generator now owned by repo-cli.

**Example**

```ts
import { runJSDocInventory } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runJSDocInventory()
```

**Signature**

```ts
declare const runJSDocInventory: () => Effect.Effect<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2307)

Since v0.0.0

## runJSDocModuleTagsCheck

Verify tracked fileoverview comments do not use the legacy `@module` tag.

**Example**

```ts
import { runJSDocModuleTagsCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runJSDocModuleTagsCheck()
```

**Signature**

```ts
declare const runJSDocModuleTagsCheck: () => Effect.Effect<void, QualityScriptCommandError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2230)

Since v0.0.0

## runJSDocQuality

Run the repo-wide JSDoc quality gate.

**Example**

```ts
import { runJSDocQuality } from "@beep/repo-cli/commands/Quality/Quality.command"

const program = runJSDocQuality()
console.log(program)
```

**Signature**

```ts
declare const runJSDocQuality: () => Effect.Effect<void, QualityScriptCommandError, FileSystem.FileSystem | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2424)

Since v0.0.0

## runRepoExportsCatalog

Run the repo export catalog generator now owned by repo-cli.

**Example**

```ts
import { runRepoExportsCatalog } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runRepoExportsCatalog(false)
```

**Signature**

```ts
declare const runRepoExportsCatalog: (check: boolean, options?: RepoExportsCatalogRunOptions | undefined) => Effect.Effect<void, QualityScriptCommandError, FileSystem.FileSystem | Path.Path | ChildProcessSpawner.ChildProcessSpawner>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2342)

Since v0.0.0

## runTestTsgoChecks

Run repo-wide Effect diagnostics for test files.

**Example**

```ts
import { runTestTsgoChecks } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runTestTsgoChecks([])
```

**Signature**

```ts
declare const runTestTsgoChecks: (extraArgs: unknown) => Effect.Effect<void, QualityScriptCommandError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2033)

Since v0.0.0

## runTsgoRulesCheck

Check that the root tsgo Effect diagnostics configuration enables every installed rule as an error.

**Example**

```ts
import { runTsgoRulesCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runTsgoRulesCheck()
```

**Signature**

```ts
declare const runTsgoRulesCheck: () => Effect.Effect<void, QualityScriptCommandError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1796)

Since v0.0.0

## runTsgoSmokeCheck

Verify that tsgo reports the Effect diagnostic expected by this repo.

**Example**

```ts
import { runTsgoSmokeCheck } from "@beep/repo-cli/commands/Quality/Quality.command"
const program = runTsgoSmokeCheck()
```

**Signature**

```ts
declare const runTsgoSmokeCheck: () => Effect.Effect<void, QualityScriptCommandError, QualityScriptEnvironment>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L2129)

Since v0.0.0

# utilities

## collectEffectTsgoDiagnosticLines

Collect Effect tsgo diagnostics from command output regardless of process exit code.

**Example**

```ts
import { collectEffectTsgoDiagnosticLines } from "@beep/repo-cli/commands/Quality/Quality.command"
const diagnostics = collectEffectTsgoDiagnosticLines([{ output: "warning TS90001: effect(service)\\n" }])
```

**Signature**

```ts
declare const collectEffectTsgoDiagnosticLines: (results: ReadonlyArray<TsgoDiagnosticOutput>) => ReadonlyArray<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/tool/cli/src/commands/Quality/Quality.command.ts#L1650)

Since v0.0.0