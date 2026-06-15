---
title: agent-effectiveness.ts
nav_order: 1
parent: "@beep/repo-ai-metrics"
---

## agent-effectiveness.ts overview

Agent-effectiveness doctor and annotation-plan helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [AGENT_EFFECTIVENESS_PHOENIX_PROJECT](#agent_effectiveness_phoenix_project)
  - [AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION](#agent_effectiveness_phoenix_write_confirmation)
  - [DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH](#default_agent_effectiveness_worker_eval_report_path)
- [encoding](#encoding)
  - [agentEffectivenessAnnotationCheckReportToJson](#agenteffectivenessannotationcheckreporttojson)
  - [agentEffectivenessAnnotationPlanToJson](#agenteffectivenessannotationplantojson)
  - [agentEffectivenessDatasetBundleToJson](#agenteffectivenessdatasetbundletojson)
  - [agentEffectivenessDoctorReportToJson](#agenteffectivenessdoctorreporttojson)
  - [agentEffectivenessExperimentBundleToJson](#agenteffectivenessexperimentbundletojson)
  - [agentEffectivenessPhoenixSyncResultToJson](#agenteffectivenessphoenixsyncresulttojson)
  - [agentEffectivenessPromptBundleToJson](#agenteffectivenesspromptbundletojson)
- [errors](#errors)
  - [AgentEffectivenessError (class)](#agenteffectivenesserror-class)
- [models](#models)
  - [AgentEffectivenessAiMetricsSection (class)](#agenteffectivenessaimetricssection-class)
  - [AgentEffectivenessAnnotationCheckFinding (class)](#agenteffectivenessannotationcheckfinding-class)
  - [AgentEffectivenessAnnotationCheckReport (class)](#agenteffectivenessannotationcheckreport-class)
  - [AgentEffectivenessAnnotationPlan (class)](#agenteffectivenessannotationplan-class)
  - [AgentEffectivenessAnnotationPlanInput (class)](#agenteffectivenessannotationplaninput-class)
  - [AgentEffectivenessAnnotationValue](#agenteffectivenessannotationvalue)
  - [AgentEffectivenessAnnotationValue (type alias)](#agenteffectivenessannotationvalue-type-alias)
  - [AgentEffectivenessDatasetBundle (class)](#agenteffectivenessdatasetbundle-class)
  - [AgentEffectivenessDatasetExample (class)](#agenteffectivenessdatasetexample-class)
  - [AgentEffectivenessDatasetKind](#agenteffectivenessdatasetkind)
  - [AgentEffectivenessDatasetKind (type alias)](#agenteffectivenessdatasetkind-type-alias)
  - [AgentEffectivenessDatasetSpec (class)](#agenteffectivenessdatasetspec-class)
  - [AgentEffectivenessDoctorInput (class)](#agenteffectivenessdoctorinput-class)
  - [AgentEffectivenessDoctorReport (class)](#agenteffectivenessdoctorreport-class)
  - [AgentEffectivenessDoctorSummary (class)](#agenteffectivenessdoctorsummary-class)
  - [AgentEffectivenessExperimentBundle (class)](#agenteffectivenessexperimentbundle-class)
  - [AgentEffectivenessExperimentSpec (class)](#agenteffectivenessexperimentspec-class)
  - [AgentEffectivenessForwarderSummary (class)](#agenteffectivenessforwardersummary-class)
  - [AgentEffectivenessJsdocWorkerSection (class)](#agenteffectivenessjsdocworkersection-class)
  - [AgentEffectivenessPhoenixProject (class)](#agenteffectivenessphoenixproject-class)
  - [AgentEffectivenessPhoenixSection (class)](#agenteffectivenessphoenixsection-class)
  - [AgentEffectivenessPhoenixSyncInput (class)](#agenteffectivenessphoenixsyncinput-class)
  - [AgentEffectivenessPhoenixSyncResult (class)](#agenteffectivenessphoenixsyncresult-class)
  - [AgentEffectivenessPlannedAnnotation (class)](#agenteffectivenessplannedannotation-class)
  - [AgentEffectivenessPromptBundle (class)](#agenteffectivenesspromptbundle-class)
  - [AgentEffectivenessPromptMessage (class)](#agenteffectivenesspromptmessage-class)
  - [AgentEffectivenessPromptRole](#agenteffectivenesspromptrole)
  - [AgentEffectivenessPromptRole (type alias)](#agenteffectivenesspromptrole-type-alias)
  - [AgentEffectivenessPromptSpec (class)](#agenteffectivenesspromptspec-class)
  - [AgentEffectivenessScorecardSummary (class)](#agenteffectivenessscorecardsummary-class)
  - [AgentEffectivenessSourceCoverage (class)](#agenteffectivenesssourcecoverage-class)
  - [AgentEffectivenessStatus](#agenteffectivenessstatus)
  - [AgentEffectivenessStatus (type alias)](#agenteffectivenessstatus-type-alias)
- [services](#services)
  - [makeAgentEffectivenessAnnotationCheckReport](#makeagenteffectivenessannotationcheckreport)
  - [makeAgentEffectivenessAnnotationPlan](#makeagenteffectivenessannotationplan)
  - [makeAgentEffectivenessDatasetBundle](#makeagenteffectivenessdatasetbundle)
  - [makeAgentEffectivenessDoctorReport](#makeagenteffectivenessdoctorreport)
  - [makeAgentEffectivenessExperimentBundle](#makeagenteffectivenessexperimentbundle)
  - [makeAgentEffectivenessPromptBundle](#makeagenteffectivenesspromptbundle)
  - [syncAgentEffectivenessPhoenix](#syncagenteffectivenessphoenix)
---

# constants

## AGENT_EFFECTIVENESS_PHOENIX_PROJECT

Dedicated Phoenix project namespace for the agent-effectiveness loop.

**Example**

```ts
import { AGENT_EFFECTIVENESS_PHOENIX_PROJECT } from "@beep/repo-ai-metrics"

console.log(AGENT_EFFECTIVENESS_PHOENIX_PROJECT)
```

**Signature**

```ts
declare const AGENT_EFFECTIVENESS_PHOENIX_PROJECT: "beep-agent-effectiveness"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L609)

Since v0.0.0

## AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION

Confirmation token required before live Phoenix writes.

**Example**

```ts
import { AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION } from "@beep/repo-ai-metrics"

console.log(AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION)
```

**Signature**

```ts
declare const AGENT_EFFECTIVENESS_PHOENIX_WRITE_CONFIRMATION: "agent-effectiveness-phoenix-write"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L623)

Since v0.0.0

## DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH

Stable default pointer used to locate the latest checked-in JSDoc worker-eval evidence.

**Example**

```ts
import { DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH } from "@beep/repo-ai-metrics"
console.log(DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH)
```

**Signature**

```ts
declare const DEFAULT_AGENT_EFFECTIVENESS_WORKER_EVAL_REPORT_PATH: "goals/jsdoc-worker-eval/ops/manifest.json"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L53)

Since v0.0.0

# encoding

## agentEffectivenessAnnotationCheckReportToJson

Encode an annotation-check report as JSON.

**Example**

```ts
import { agentEffectivenessAnnotationCheckReportToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessAnnotationCheckReportToJson)
```

**Signature**

```ts
declare const agentEffectivenessAnnotationCheckReportToJson: (report: AgentEffectivenessAnnotationCheckReport) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3069)

Since v0.0.0

## agentEffectivenessAnnotationPlanToJson

Encode an annotation plan as JSON.

**Example**

```ts
import { agentEffectivenessAnnotationPlanToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessAnnotationPlanToJson)
```

**Signature**

```ts
declare const agentEffectivenessAnnotationPlanToJson: (plan: AgentEffectivenessAnnotationPlan) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3044)

Since v0.0.0

## agentEffectivenessDatasetBundleToJson

Encode a dataset bundle as JSON.

**Example**

```ts
import { agentEffectivenessDatasetBundleToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessDatasetBundleToJson)
```

**Signature**

```ts
declare const agentEffectivenessDatasetBundleToJson: (bundle: AgentEffectivenessDatasetBundle) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3095)

Since v0.0.0

## agentEffectivenessDoctorReportToJson

Encode a doctor report as JSON.

**Example**

```ts
import { agentEffectivenessDoctorReportToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessDoctorReportToJson)
```

**Signature**

```ts
declare const agentEffectivenessDoctorReportToJson: (report: AgentEffectivenessDoctorReport) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3019)

Since v0.0.0

## agentEffectivenessExperimentBundleToJson

Encode an experiment bundle as JSON.

**Example**

```ts
import { agentEffectivenessExperimentBundleToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessExperimentBundleToJson)
```

**Signature**

```ts
declare const agentEffectivenessExperimentBundleToJson: (bundle: AgentEffectivenessExperimentBundle) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3145)

Since v0.0.0

## agentEffectivenessPhoenixSyncResultToJson

Encode a Phoenix sync result as JSON.

**Example**

```ts
import { agentEffectivenessPhoenixSyncResultToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessPhoenixSyncResultToJson)
```

**Signature**

```ts
declare const agentEffectivenessPhoenixSyncResultToJson: (result: AgentEffectivenessPhoenixSyncResult) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3170)

Since v0.0.0

## agentEffectivenessPromptBundleToJson

Encode a prompt bundle as JSON.

**Example**

```ts
import { agentEffectivenessPromptBundleToJson } from "@beep/repo-ai-metrics"
console.log(agentEffectivenessPromptBundleToJson)
```

**Signature**

```ts
declare const agentEffectivenessPromptBundleToJson: (bundle: AgentEffectivenessPromptBundle) => Effect.Effect<string, AgentEffectivenessError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L3120)

Since v0.0.0

# errors

## AgentEffectivenessError (class)

Error raised by agent-effectiveness report helpers.

**Example**

```ts
import { AgentEffectivenessError } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessError)
```

**Signature**

```ts
declare class AgentEffectivenessError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L140)

Since v0.0.0

# models

## AgentEffectivenessAiMetricsSection (class)

AI-metrics local evidence section for the doctor report.

**Example**

```ts
import { AgentEffectivenessAiMetricsSection } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAiMetricsSection)
```

**Signature**

```ts
declare class AgentEffectivenessAiMetricsSection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L382)

Since v0.0.0

## AgentEffectivenessAnnotationCheckFinding (class)

One validation finding for an annotation plan.

**Example**

```ts
import { AgentEffectivenessAnnotationCheckFinding } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAnnotationCheckFinding)
```

**Signature**

```ts
declare class AgentEffectivenessAnnotationCheckFinding
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L558)

Since v0.0.0

## AgentEffectivenessAnnotationCheckReport (class)

Report emitted by `agent-effectiveness annotations check`.

**Example**

```ts
import { AgentEffectivenessAnnotationCheckReport } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAnnotationCheckReport)
```

**Signature**

```ts
declare class AgentEffectivenessAnnotationCheckReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L582)

Since v0.0.0

## AgentEffectivenessAnnotationPlan (class)

Dry-run annotation plan for Phase 1.

**Example**

```ts
import { AgentEffectivenessAnnotationPlan } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAnnotationPlan)
```

**Signature**

```ts
declare class AgentEffectivenessAnnotationPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L531)

Since v0.0.0

## AgentEffectivenessAnnotationPlanInput (class)

Input for building a dry-run annotation plan.

**Example**

```ts
import { AgentEffectivenessAnnotationPlanInput } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAnnotationPlanInput.make({}).annotationLimit)
```

**Signature**

```ts
declare class AgentEffectivenessAnnotationPlanInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L203)

Since v0.0.0

## AgentEffectivenessAnnotationValue

Primitive annotation value allowed in local Phase 1 plans.

**Example**

```ts
import { AgentEffectivenessAnnotationValue } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessAnnotationValue)
```

**Signature**

```ts
declare const AgentEffectivenessAnnotationValue: AnnotatedSchema<S.Union<readonly [S.String, S.Finite, S.Boolean]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L115)

Since v0.0.0

## AgentEffectivenessAnnotationValue (type alias)

Runtime type for `AgentEffectivenessAnnotationValue`.

**Signature**

```ts
type AgentEffectivenessAnnotationValue = typeof AgentEffectivenessAnnotationValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L127)

Since v0.0.0

## AgentEffectivenessDatasetBundle (class)

Full Phoenix dataset bundle derived from a doctor report.

**Example**

```ts
import { AgentEffectivenessDatasetBundle } from "@beep/repo-ai-metrics"

const bundle = AgentEffectivenessDatasetBundle.make({
  datasets: [],
  generatedAt: "2026-05-20T00:00:00.000Z",
  projectName: "beep-agent-effectiveness",
  schemaVersion: "agent-effectiveness-datasets/v1"
})
console.log(bundle.projectName)
```

**Signature**

```ts
declare class AgentEffectivenessDatasetBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L744)

Since v0.0.0

## AgentEffectivenessDatasetExample (class)

One sanitized example destined for a Phoenix dataset.

**Example**

```ts
import { AgentEffectivenessDatasetExample } from "@beep/repo-ai-metrics"

const example = AgentEffectivenessDatasetExample.make({ id: "loop", input: { status: "passed" } })
console.log(example.id)
```

**Signature**

```ts
declare class AgentEffectivenessDatasetExample
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L670)

Since v0.0.0

## AgentEffectivenessDatasetKind

Phoenix dataset kinds owned by the agent-effectiveness loop.

**Example**

```ts
import { AgentEffectivenessDatasetKind } from "@beep/repo-ai-metrics"

console.log(AgentEffectivenessDatasetKind.Enum["agent-loop-health"])
```

**Signature**

```ts
declare const AgentEffectivenessDatasetKind: AnnotatedSchema<LiteralKit<readonly ["agent-config-snapshots", "agent-loop-health", "agent-outcomes", "jsdoc-worker-model-suitability", "source-coverage"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L637)

Since v0.0.0

## AgentEffectivenessDatasetKind (type alias)

Type for `AgentEffectivenessDatasetKind`.

**Signature**

```ts
type AgentEffectivenessDatasetKind = typeof AgentEffectivenessDatasetKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L655)

Since v0.0.0

## AgentEffectivenessDatasetSpec (class)

One repo-owned Phoenix dataset specification.

**Example**

```ts
import { AgentEffectivenessDatasetSpec } from "@beep/repo-ai-metrics"

const spec = AgentEffectivenessDatasetSpec.make({
  description: "Loop health.",
  examples: [],
  kind: "agent-loop-health",
  name: "agent-loop-health-v1"
})
console.log(spec.name)
```

**Signature**

```ts
declare class AgentEffectivenessDatasetSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L712)

Since v0.0.0

## AgentEffectivenessDoctorInput (class)

Input for the Phase 1 agent-effectiveness doctor.

**Example**

```ts
import { AgentEffectivenessDoctorInput } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessDoctorInput.make({}).target)
```

**Signature**

```ts
declare class AgentEffectivenessDoctorInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L162)

Since v0.0.0

## AgentEffectivenessDoctorReport (class)

Phase 1 agent-effectiveness doctor report.

**Example**

```ts
import { AgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessDoctorReport)
```

**Signature**

```ts
declare class AgentEffectivenessDoctorReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L470)

Since v0.0.0

## AgentEffectivenessDoctorSummary (class)

Aggregate summary emitted by the doctor report.

**Example**

```ts
import { AgentEffectivenessDoctorSummary } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessDoctorSummary)
```

**Signature**

```ts
declare class AgentEffectivenessDoctorSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L445)

Since v0.0.0

## AgentEffectivenessExperimentBundle (class)

Deterministic experiment bundle derived from dataset specs.

**Example**

```ts
import { AgentEffectivenessExperimentBundle } from "@beep/repo-ai-metrics"

const bundle = AgentEffectivenessExperimentBundle.make({
  experiments: [],
  generatedAt: "2026-05-20T00:00:00.000Z",
  projectName: "beep-agent-effectiveness",
  schemaVersion: "agent-effectiveness-experiments/v1"
})
console.log(bundle.projectName)
```

**Signature**

```ts
declare class AgentEffectivenessExperimentBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L925)

Since v0.0.0

## AgentEffectivenessExperimentSpec (class)

Deterministic experiment plan entry.

**Example**

```ts
import { AgentEffectivenessExperimentSpec } from "@beep/repo-ai-metrics"

const spec = AgentEffectivenessExperimentSpec.make({
  datasetName: "agent-loop-health-v1",
  description: "Deterministic loop-health readback.",
  name: "agent-loop-health-deterministic-v1"
})
console.log(spec.datasetName)
```

**Signature**

```ts
declare class AgentEffectivenessExperimentSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L890)

Since v0.0.0

## AgentEffectivenessForwarderSummary (class)

Latest forwarder summary from derived AI-metrics storage.

**Example**

```ts
import { AgentEffectivenessForwarderSummary } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessForwarderSummary)
```

**Signature**

```ts
declare class AgentEffectivenessForwarderSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L323)

Since v0.0.0

## AgentEffectivenessJsdocWorkerSection (class)

JSDoc worker-eval section for the doctor report.

**Example**

```ts
import { AgentEffectivenessJsdocWorkerSection } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessJsdocWorkerSection)
```

**Signature**

```ts
declare class AgentEffectivenessJsdocWorkerSection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L413)

Since v0.0.0

## AgentEffectivenessPhoenixProject (class)

Summary for one Phoenix project.

**Example**

```ts
import { AgentEffectivenessPhoenixProject } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessPhoenixProject)
```

**Signature**

```ts
declare class AgentEffectivenessPhoenixProject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L237)

Since v0.0.0

## AgentEffectivenessPhoenixSection (class)

Read-only Phoenix health and inventory section.

**Example**

```ts
import { AgentEffectivenessPhoenixSection } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessPhoenixSection)
```

**Signature**

```ts
declare class AgentEffectivenessPhoenixSection
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L265)

Since v0.0.0

## AgentEffectivenessPhoenixSyncInput (class)

Input for syncing agent-effectiveness evidence to Phoenix.

**Example**

```ts
import { AgentEffectivenessPhoenixSyncInput } from "@beep/repo-ai-metrics"

const input = AgentEffectivenessPhoenixSyncInput.make({ dryRun: true })
console.log(input.dryRun)
```

**Signature**

```ts
declare class AgentEffectivenessPhoenixSyncInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L952)

Since v0.0.0

## AgentEffectivenessPhoenixSyncResult (class)

Result from a guarded Phoenix sync attempt.

**Example**

```ts
import { AgentEffectivenessPhoenixSyncResult } from "@beep/repo-ai-metrics"

const result = AgentEffectivenessPhoenixSyncResult.make({
  annotationCount: 0,
  datasetCount: 0,
  dryRun: true,
  experimentCount: 0,
  mutationPolicy: "dry-run",
  promptCount: 0,
  skippedAnnotationCount: 0,
  status: "passed",
  writtenDatasetIds: [],
  writtenExperimentIds: [],
  writtenPromptVersionIds: []
})
console.log(result.mutationPolicy)
```

**Signature**

```ts
declare class AgentEffectivenessPhoenixSyncResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L1015)

Since v0.0.0

## AgentEffectivenessPlannedAnnotation (class)

One local-only annotation row that could be written to Phoenix later.

**Example**

```ts
import { AgentEffectivenessPlannedAnnotation } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessPlannedAnnotation)
```

**Signature**

```ts
declare class AgentEffectivenessPlannedAnnotation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L499)

Since v0.0.0

## AgentEffectivenessPromptBundle (class)

Full repo-owned Phoenix prompt bundle.

**Example**

```ts
import { AgentEffectivenessPromptBundle } from "@beep/repo-ai-metrics"

const bundle = AgentEffectivenessPromptBundle.make({
  generatedAt: "2026-05-20T00:00:00.000Z",
  projectName: "beep-agent-effectiveness",
  prompts: [],
  schemaVersion: "agent-effectiveness-prompts/v1"
})
console.log(bundle.projectName)
```

**Signature**

```ts
declare class AgentEffectivenessPromptBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L859)

Since v0.0.0

## AgentEffectivenessPromptMessage (class)

One repo-owned Phoenix prompt message.

**Example**

```ts
import { AgentEffectivenessPromptMessage } from "@beep/repo-ai-metrics"

const message = AgentEffectivenessPromptMessage.make({ content: "Review {{caseId}}", role: "user" })
console.log(message.role)
```

**Signature**

```ts
declare class AgentEffectivenessPromptMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L797)

Since v0.0.0

## AgentEffectivenessPromptRole

Prompt roles used by repo-owned agent-effectiveness prompt templates.

**Example**

```ts
import { AgentEffectivenessPromptRole } from "@beep/repo-ai-metrics"

console.log(AgentEffectivenessPromptRole.Enum.user)
```

**Signature**

```ts
declare const AgentEffectivenessPromptRole: AnnotatedSchema<LiteralKit<readonly ["system", "user"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L770)

Since v0.0.0

## AgentEffectivenessPromptRole (type alias)

Type for `AgentEffectivenessPromptRole`.

**Signature**

```ts
type AgentEffectivenessPromptRole = typeof AgentEffectivenessPromptRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L782)

Since v0.0.0

## AgentEffectivenessPromptSpec (class)

Repo-owned Phoenix prompt specification.

**Example**

```ts
import { AgentEffectivenessPromptSpec } from "@beep/repo-ai-metrics"

const spec = AgentEffectivenessPromptSpec.make({
  description: "Review evaluator.",
  messages: [],
  modelName: "gpt-4o-mini",
  name: "agent-effectiveness-review-evaluator-v1"
})
console.log(spec.name)
```

**Signature**

```ts
declare class AgentEffectivenessPromptSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L827)

Since v0.0.0

## AgentEffectivenessScorecardSummary (class)

Latest scorecard summary from derived AI-metrics storage.

**Example**

```ts
import { AgentEffectivenessScorecardSummary } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessScorecardSummary)
```

**Signature**

```ts
declare class AgentEffectivenessScorecardSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L351)

Since v0.0.0

## AgentEffectivenessSourceCoverage (class)

Source coverage row derived from AI-metrics storage.

**Example**

```ts
import { AgentEffectivenessSourceCoverage } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessSourceCoverage)
```

**Signature**

```ts
declare class AgentEffectivenessSourceCoverage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L296)

Since v0.0.0

## AgentEffectivenessStatus

Status emitted by agent-effectiveness reports.

**Example**

```ts
import { AgentEffectivenessStatus } from "@beep/repo-ai-metrics"
console.log(AgentEffectivenessStatus.Enum.passed)
```

**Signature**

```ts
declare const AgentEffectivenessStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "warning", "failed", "unavailable"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L90)

Since v0.0.0

## AgentEffectivenessStatus (type alias)

Runtime type for `AgentEffectivenessStatus`.

**Signature**

```ts
type AgentEffectivenessStatus = typeof AgentEffectivenessStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L102)

Since v0.0.0

# services

## makeAgentEffectivenessAnnotationCheckReport

Check a local annotation plan for Phase 1 privacy and schema safety.

**Example**

```ts
import { makeAgentEffectivenessAnnotationCheckReport } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessAnnotationCheckReport)
```

**Signature**

```ts
declare const makeAgentEffectivenessAnnotationCheckReport: (plan: AgentEffectivenessAnnotationPlan) => AgentEffectivenessAnnotationCheckReport
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2989)

Since v0.0.0

## makeAgentEffectivenessAnnotationPlan

Build a sanitized local-only annotation plan.

**Example**

```ts
import { makeAgentEffectivenessAnnotationPlan } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessAnnotationPlan)
```

**Signature**

```ts
declare const makeAgentEffectivenessAnnotationPlan: (input?: AgentEffectivenessAnnotationPlanInput) => Effect.Effect<AgentEffectivenessAnnotationPlan, never, DuckDb | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2150)

Since v0.0.0

## makeAgentEffectivenessDatasetBundle

Build the Phoenix dataset bundle from a doctor report.

**Example**

```ts
import { makeAgentEffectivenessDatasetBundle } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessDatasetBundle)
```

**Signature**

```ts
declare const makeAgentEffectivenessDatasetBundle: (doctor: AgentEffectivenessDoctorReport) => AgentEffectivenessDatasetBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2360)

Since v0.0.0

## makeAgentEffectivenessDoctorReport

Build the report-only Phase 1 agent-effectiveness doctor report.

**Example**

```ts
import { makeAgentEffectivenessDoctorReport } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessDoctorReport)
```

**Signature**

```ts
declare const makeAgentEffectivenessDoctorReport: (input?: AgentEffectivenessDoctorInput) => Effect.Effect<AgentEffectivenessDoctorReport, never, DuckDb | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L1814)

Since v0.0.0

## makeAgentEffectivenessExperimentBundle

Build deterministic experiment specs from a dataset bundle.

**Example**

```ts
import { makeAgentEffectivenessExperimentBundle } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessExperimentBundle)
```

**Signature**

```ts
declare const makeAgentEffectivenessExperimentBundle: (datasetBundle: AgentEffectivenessDatasetBundle) => AgentEffectivenessExperimentBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2443)

Since v0.0.0

## makeAgentEffectivenessPromptBundle

Build the repo-owned Phoenix prompt bundle.

**Example**

```ts
import { makeAgentEffectivenessPromptBundle } from "@beep/repo-ai-metrics"
console.log(makeAgentEffectivenessPromptBundle)
```

**Signature**

```ts
declare const makeAgentEffectivenessPromptBundle: (generatedAt: string) => AgentEffectivenessPromptBundle
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2389)

Since v0.0.0

## syncAgentEffectivenessPhoenix

Sync agent-effectiveness datasets, prompts, experiments, and resolved annotations to Phoenix.

**Example**

```ts
import { syncAgentEffectivenessPhoenix } from "@beep/repo-ai-metrics"
console.log(syncAgentEffectivenessPhoenix)
```

**Signature**

```ts
declare const syncAgentEffectivenessPhoenix: (input?: AgentEffectivenessPhoenixSyncInput) => Effect.Effect<AgentEffectivenessPhoenixSyncResult, AgentEffectivenessError, DuckDb | FileSystem.FileSystem | HttpClient.HttpClient | Path.Path | Phoenix>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/agent-effectiveness.ts#L2640)

Since v0.0.0