---
title: Phoenix.models.ts
nav_order: 4
parent: "@beep/phoenix"
---

## Phoenix.models.ts overview

Schema-backed request and response models for the Phoenix driver.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PhoenixAnnotationInput (class)](#phoenixannotationinput-class)
  - [PhoenixAnnotationTargetKind](#phoenixannotationtargetkind)
  - [PhoenixAnnotationTargetKind (type alias)](#phoenixannotationtargetkind-type-alias)
  - [PhoenixAnnotationValue](#phoenixannotationvalue)
  - [PhoenixAnnotationValue (type alias)](#phoenixannotationvalue-type-alias)
  - [PhoenixAnnotationWriteResult (class)](#phoenixannotationwriteresult-class)
  - [PhoenixAnnotatorKind](#phoenixannotatorkind)
  - [PhoenixAnnotatorKind (type alias)](#phoenixannotatorkind-type-alias)
  - [PhoenixDatasetAppendInput (class)](#phoenixdatasetappendinput-class)
  - [PhoenixDatasetAppendResult (class)](#phoenixdatasetappendresult-class)
  - [PhoenixDatasetCreateInput (class)](#phoenixdatasetcreateinput-class)
  - [PhoenixDatasetCreateResult (class)](#phoenixdatasetcreateresult-class)
  - [PhoenixDatasetExample (class)](#phoenixdatasetexample-class)
  - [PhoenixDatasetExamplesResult (class)](#phoenixdatasetexamplesresult-class)
  - [PhoenixDatasetInfoResult (class)](#phoenixdatasetinforesult-class)
  - [PhoenixDatasetSelector (class)](#phoenixdatasetselector-class)
  - [PhoenixDatasetSelectorKind](#phoenixdatasetselectorkind)
  - [PhoenixDatasetSelectorKind (type alias)](#phoenixdatasetselectorkind-type-alias)
  - [PhoenixDoctorResult (class)](#phoenixdoctorresult-class)
  - [PhoenixDoctorStatus](#phoenixdoctorstatus)
  - [PhoenixDoctorStatus (type alias)](#phoenixdoctorstatus-type-alias)
  - [PhoenixExperimentCreateInput (class)](#phoenixexperimentcreateinput-class)
  - [PhoenixExperimentInfoResult (class)](#phoenixexperimentinforesult-class)
  - [PhoenixPromptChatMessage (class)](#phoenixpromptchatmessage-class)
  - [PhoenixPromptChatRole](#phoenixpromptchatrole)
  - [PhoenixPromptChatRole (type alias)](#phoenixpromptchatrole-type-alias)
  - [PhoenixPromptCreateInput (class)](#phoenixpromptcreateinput-class)
  - [PhoenixPromptModelProvider](#phoenixpromptmodelprovider)
  - [PhoenixPromptModelProvider (type alias)](#phoenixpromptmodelprovider-type-alias)
  - [PhoenixPromptReadResult (class)](#phoenixpromptreadresult-class)
  - [PhoenixPromptSelector (class)](#phoenixpromptselector-class)
  - [PhoenixPromptTemplateFormat](#phoenixprompttemplateformat)
  - [PhoenixPromptTemplateFormat (type alias)](#phoenixprompttemplateformat-type-alias)
  - [PhoenixPromptWriteResult (class)](#phoenixpromptwriteresult-class)
---

# models

## PhoenixAnnotationInput (class)

Input for writing one Phoenix annotation.

**Example**

```ts
import { PhoenixAnnotationInput } from "@beep/phoenix"

const input = PhoenixAnnotationInput.make({
  label: "passed",
  name: "agent.outcome",
  targetId: "trace-id",
  targetKind: "trace"
})
console.log(input.targetKind)
```

**Signature**

```ts
declare class PhoenixAnnotationInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L723)

Since v0.0.0

## PhoenixAnnotationTargetKind

Phoenix annotation target kind.

**Example**

```ts
import { PhoenixAnnotationTargetKind } from "@beep/phoenix"

console.log(PhoenixAnnotationTargetKind.Enum.trace)
```

**Signature**

```ts
declare const PhoenixAnnotationTargetKind: AnnotatedSchema<LiteralKit<readonly ["span", "session", "trace"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L83)

Since v0.0.0

## PhoenixAnnotationTargetKind (type alias)

Type for `PhoenixAnnotationTargetKind`.

**Signature**

```ts
type PhoenixAnnotationTargetKind = typeof PhoenixAnnotationTargetKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L95)

Since v0.0.0

## PhoenixAnnotationValue

Primitive annotation value accepted by repo-owned Phoenix annotations.

**Example**

```ts
import { PhoenixAnnotationValue } from "@beep/phoenix"

console.log(PhoenixAnnotationValue)
```

**Signature**

```ts
declare const PhoenixAnnotationValue: AnnotatedSchema<S.Union<readonly [S.Boolean, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L137)

Since v0.0.0

## PhoenixAnnotationValue (type alias)

Type for `PhoenixAnnotationValue`.

**Signature**

```ts
type PhoenixAnnotationValue = typeof PhoenixAnnotationValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L149)

Since v0.0.0

## PhoenixAnnotationWriteResult (class)

Result from writing one Phoenix annotation.

**Example**

```ts
import { PhoenixAnnotationWriteResult } from "@beep/phoenix"

const result = PhoenixAnnotationWriteResult.make({
  annotationId: "annotation-id",
  name: "agent.outcome",
  targetId: "trace-id",
  targetKind: "trace"
})
console.log(result.annotationId)
```

**Signature**

```ts
declare class PhoenixAnnotationWriteResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L760)

Since v0.0.0

## PhoenixAnnotatorKind

Phoenix annotator kind.

**Example**

```ts
import { PhoenixAnnotatorKind } from "@beep/phoenix"

console.log(PhoenixAnnotatorKind.Enum.CODE)
```

**Signature**

```ts
declare const PhoenixAnnotatorKind: AnnotatedSchema<LiteralKit<readonly ["CODE", "HUMAN", "LLM"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L110)

Since v0.0.0

## PhoenixAnnotatorKind (type alias)

Type for `PhoenixAnnotatorKind`.

**Signature**

```ts
type PhoenixAnnotatorKind = typeof PhoenixAnnotatorKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L122)

Since v0.0.0

## PhoenixDatasetAppendInput (class)

Input for appending examples to a Phoenix dataset.

**Example**

```ts
import { PhoenixDatasetAppendInput, PhoenixDatasetExample, PhoenixDatasetSelector } from "@beep/phoenix"

const input = PhoenixDatasetAppendInput.make({
  dataset: PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-outcomes-v1" }),
  examples: [PhoenixDatasetExample.make({ input: { task: "outcome" } })]
})
console.log(input.dataset.kind)
```

**Signature**

```ts
declare class PhoenixDatasetAppendInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L408)

Since v0.0.0

## PhoenixDatasetAppendResult (class)

Result from appending Phoenix dataset examples.

**Example**

```ts
import { PhoenixDatasetAppendResult } from "@beep/phoenix"

const result = PhoenixDatasetAppendResult.make({ datasetId: "dataset-id", versionId: "version-id" })
console.log(result.versionId)
```

**Signature**

```ts
declare class PhoenixDatasetAppendResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L432)

Since v0.0.0

## PhoenixDatasetCreateInput (class)

Input for creating or replacing a Phoenix dataset.

**Example**

```ts
import { PhoenixDatasetCreateInput, PhoenixDatasetExample } from "@beep/phoenix"

const input = PhoenixDatasetCreateInput.make({
  description: "Agent loop health examples.",
  examples: [PhoenixDatasetExample.make({ input: { task: "loop-health" } })],
  name: "agent-loop-health-v1"
})
console.log(input.name)
```

**Signature**

```ts
declare class PhoenixDatasetCreateInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L357)

Since v0.0.0

## PhoenixDatasetCreateResult (class)

Result from creating a Phoenix dataset.

**Example**

```ts
import { PhoenixDatasetCreateResult } from "@beep/phoenix"

const result = PhoenixDatasetCreateResult.make({ datasetId: "dataset-id" })
console.log(result.datasetId)
```

**Signature**

```ts
declare class PhoenixDatasetCreateResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L382)

Since v0.0.0

## PhoenixDatasetExample (class)

Phoenix dataset example.

**Example**

```ts
import { PhoenixDatasetExample } from "@beep/phoenix"

const example = PhoenixDatasetExample.make({
  input: { task: "score-loop-health" },
  metadata: { suite: "agent-effectiveness" }
})
console.log(example.input)
```

**Signature**

```ts
declare class PhoenixDatasetExample
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L322)

Since v0.0.0

## PhoenixDatasetExamplesResult (class)

Readback result for Phoenix dataset examples.

**Example**

```ts
import { PhoenixDatasetExamplesResult } from "@beep/phoenix"

const result = PhoenixDatasetExamplesResult.make({ examples: [], versionId: "version-id" })
console.log(result.examples.length)
```

**Signature**

```ts
declare class PhoenixDatasetExamplesResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L482)

Since v0.0.0

## PhoenixDatasetInfoResult (class)

Readback summary for a Phoenix dataset.

**Example**

```ts
import { PhoenixDatasetInfoResult } from "@beep/phoenix"

const result = PhoenixDatasetInfoResult.make({ datasetId: "dataset-id", name: "agent-outcomes-v1" })
console.log(result.name)
```

**Signature**

```ts
declare class PhoenixDatasetInfoResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L456)

Since v0.0.0

## PhoenixDatasetSelector (class)

Phoenix dataset selector.

**Example**

```ts
import { PhoenixDatasetSelector } from "@beep/phoenix"

const selector = PhoenixDatasetSelector.make({ kind: "dataset-name", value: "agent-loop-health-v1" })
console.log(selector.value)
```

**Signature**

```ts
declare class PhoenixDatasetSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L293)

Since v0.0.0

## PhoenixDatasetSelectorKind

Selector kinds used when addressing Phoenix datasets.

**Example**

```ts
import { PhoenixDatasetSelectorKind } from "@beep/phoenix"

console.log(PhoenixDatasetSelectorKind.Enum["dataset-name"])
```

**Signature**

```ts
declare const PhoenixDatasetSelectorKind: AnnotatedSchema<LiteralKit<readonly ["dataset-id", "dataset-name"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L56)

Since v0.0.0

## PhoenixDatasetSelectorKind (type alias)

Type for `PhoenixDatasetSelectorKind`.

**Signature**

```ts
type PhoenixDatasetSelectorKind = typeof PhoenixDatasetSelectorKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L68)

Since v0.0.0

## PhoenixDoctorResult (class)

Phoenix driver doctor result.

**Example**

```ts
import { PhoenixDoctorResult } from "@beep/phoenix"

const result = PhoenixDoctorResult.make({
  baseUrl: "https://phoenix.test",
  message: "Phoenix is reachable.",
  status: "passed",
  version: "1.2.3"
})
console.log(result.status)
```

**Signature**

```ts
declare class PhoenixDoctorResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L267)

Since v0.0.0

## PhoenixDoctorStatus

Driver health states returned by `Phoenix.doctor`.

**Example**

```ts
import { PhoenixDoctorStatus } from "@beep/phoenix"

console.log(PhoenixDoctorStatus.Enum.passed)
```

**Signature**

```ts
declare const PhoenixDoctorStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "unavailable"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L29)

Since v0.0.0

## PhoenixDoctorStatus (type alias)

Type for `PhoenixDoctorStatus`.

**Signature**

```ts
type PhoenixDoctorStatus = typeof PhoenixDoctorStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L41)

Since v0.0.0

## PhoenixExperimentCreateInput (class)

Input for creating a Phoenix experiment record.

**Example**

```ts
import { PhoenixExperimentCreateInput } from "@beep/phoenix"

const input = PhoenixExperimentCreateInput.make({
  datasetId: "dataset-id",
  experimentName: "agent-effectiveness-deterministic-v1"
})
console.log(input.datasetId)
```

**Signature**

```ts
declare class PhoenixExperimentCreateInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L646)

Since v0.0.0

## PhoenixExperimentInfoResult (class)

Readback summary for a Phoenix experiment.

**Example**

```ts
import { PhoenixExperimentInfoResult } from "@beep/phoenix"

const result = PhoenixExperimentInfoResult.make({
  datasetId: "dataset-id",
  datasetVersionId: "version-id",
  exampleCount: 1,
  experimentId: "experiment-id",
  failedRunCount: 0,
  missingRunCount: 1,
  repetitions: 1,
  successfulRunCount: 0
})
console.log(result.experimentId)
```

**Signature**

```ts
declare class PhoenixExperimentInfoResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L686)

Since v0.0.0

## PhoenixPromptChatMessage (class)

Phoenix prompt chat message.

**Example**

```ts
import { PhoenixPromptChatMessage } from "@beep/phoenix"

const message = PhoenixPromptChatMessage.make({ content: "Score {{caseId}}", role: "user" })
console.log(message.role)
```

**Signature**

```ts
declare class PhoenixPromptChatMessage
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L508)

Since v0.0.0

## PhoenixPromptChatRole

Prompt chat roles accepted by repo-owned Phoenix prompt templates.

**Example**

```ts
import { PhoenixPromptChatRole } from "@beep/phoenix"

console.log(PhoenixPromptChatRole.Enum.system)
```

**Signature**

```ts
declare const PhoenixPromptChatRole: AnnotatedSchema<LiteralKit<readonly ["ai", "assistant", "developer", "model", "system", "tool", "user"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L164)

Since v0.0.0

## PhoenixPromptChatRole (type alias)

Type for `PhoenixPromptChatRole`.

**Signature**

```ts
type PhoenixPromptChatRole = typeof PhoenixPromptChatRole.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L184)

Since v0.0.0

## PhoenixPromptCreateInput (class)

Input for creating a repo-owned Phoenix prompt version.

**Example**

```ts
import { PhoenixPromptChatMessage, PhoenixPromptCreateInput } from "@beep/phoenix"

const input = PhoenixPromptCreateInput.make({
  modelName: "gpt-4o-mini",
  modelProvider: "OPENAI",
  name: "agent-effectiveness-review-evaluator-v1",
  template: [PhoenixPromptChatMessage.make({ content: "Review {{caseId}}", role: "user" })]
})
console.log(input.name)
```

**Signature**

```ts
declare class PhoenixPromptCreateInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L537)

Since v0.0.0

## PhoenixPromptModelProvider

Prompt model providers supported by the Phoenix SDK helper without extra invocation parameters.

**Example**

```ts
import { PhoenixPromptModelProvider } from "@beep/phoenix"

console.log(PhoenixPromptModelProvider.Enum.GOOGLE)
```

**Signature**

```ts
declare const PhoenixPromptModelProvider: AnnotatedSchema<LiteralKit<readonly ["OPENAI", "AZURE_OPENAI", "GOOGLE", "DEEPSEEK", "XAI", "OLLAMA", "AWS"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L226)

Since v0.0.0

## PhoenixPromptModelProvider (type alias)

Type for `PhoenixPromptModelProvider`.

**Signature**

```ts
type PhoenixPromptModelProvider = typeof PhoenixPromptModelProvider.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L246)

Since v0.0.0

## PhoenixPromptReadResult (class)

Readback result for a Phoenix prompt selector.

**Example**

```ts
import { PhoenixPromptReadResult } from "@beep/phoenix"

const result = PhoenixPromptReadResult.make({ exists: true, promptVersionId: "version-id" })
console.log(result.exists)
```

**Signature**

```ts
declare class PhoenixPromptReadResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L619)

Since v0.0.0

## PhoenixPromptSelector (class)

Phoenix prompt selector by name, id, version id, or tag.

**Example**

```ts
import { PhoenixPromptSelector } from "@beep/phoenix"

const selector = PhoenixPromptSelector.make({ name: "agent-effectiveness-review-evaluator-v1" })
console.log(selector.name)
```

**Signature**

```ts
declare class PhoenixPromptSelector
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L593)

Since v0.0.0

## PhoenixPromptTemplateFormat

Prompt template format accepted by repo-owned Phoenix prompt templates.

**Example**

```ts
import { PhoenixPromptTemplateFormat } from "@beep/phoenix"

console.log(PhoenixPromptTemplateFormat.Enum.MUSTACHE)
```

**Signature**

```ts
declare const PhoenixPromptTemplateFormat: AnnotatedSchema<LiteralKit<readonly ["F_STRING", "MUSTACHE"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L199)

Since v0.0.0

## PhoenixPromptTemplateFormat (type alias)

Type for `PhoenixPromptTemplateFormat`.

**Signature**

```ts
type PhoenixPromptTemplateFormat = typeof PhoenixPromptTemplateFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L211)

Since v0.0.0

## PhoenixPromptWriteResult (class)

Result from creating a Phoenix prompt version.

**Example**

```ts
import { PhoenixPromptWriteResult } from "@beep/phoenix"

const result = PhoenixPromptWriteResult.make({ name: "prompt", promptVersionId: "version-id" })
console.log(result.promptVersionId)
```

**Signature**

```ts
declare class PhoenixPromptWriteResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.models.ts#L569)

Since v0.0.0