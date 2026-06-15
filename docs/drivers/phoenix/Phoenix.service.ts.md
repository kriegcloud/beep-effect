---
title: Phoenix.service.ts
nav_order: 5
parent: "@beep/phoenix"
---

## Phoenix.service.ts overview

Effect service for Phoenix datasets, prompts, experiments, and annotations.

Since v0.0.0

---
## Exports Grouped by Category
- [services](#services)
  - [Phoenix (class)](#phoenix-class)
  - [PhoenixSdkShape (interface)](#phoenixsdkshape-interface)
  - [PhoenixShape (interface)](#phoenixshape-interface)
---

# services

## Phoenix (class)

Effect service for Phoenix datasets, prompts, experiments, and annotations.

**Example**

```ts
import { Effect } from "effect"
import { Phoenix } from "@beep/phoenix"

const program = Effect.gen(function* () {
  const phoenix = yield* Phoenix
  return yield* phoenix.doctor
})

console.log(program)
```

**Signature**

```ts
declare class Phoenix
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.service.ts#L661)

Since v0.0.0

## PhoenixSdkShape (interface)

Promise-returning SDK adapter used behind the Effect service.

**Example**

```ts
import type { PhoenixSdkShape } from "@beep/phoenix"

const keys = [
  "doctor",
  "createDataset",
  "addAnnotation"
] satisfies ReadonlyArray<keyof PhoenixSdkShape>
console.log(keys)
```

**Signature**

```ts
export interface PhoenixSdkShape {
  readonly addAnnotation: (input: PhoenixAnnotationInput) => Promise<PhoenixAnnotationWriteResult>;
  readonly appendDatasetExamples: (input: PhoenixDatasetAppendInput) => Promise<PhoenixDatasetAppendResult>;
  readonly createDataset: (input: PhoenixDatasetCreateInput) => Promise<PhoenixDatasetCreateResult>;
  readonly createExperiment: (input: PhoenixExperimentCreateInput) => Promise<PhoenixExperimentInfoResult>;
  readonly createPrompt: (input: PhoenixPromptCreateInput) => Promise<PhoenixPromptWriteResult>;
  readonly doctor: () => Promise<PhoenixDoctorResult>;
  readonly getDatasetExamples: (selector: PhoenixDatasetSelector) => Promise<PhoenixDatasetExamplesResult>;
  readonly getDatasetInfo: (selector: PhoenixDatasetSelector) => Promise<PhoenixDatasetInfoResult>;
  readonly getExperimentInfo: (experimentId: string) => Promise<PhoenixExperimentInfoResult>;
  readonly getPrompt: (selector: PhoenixPromptSelector) => Promise<PhoenixPromptReadResult>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.service.ts#L81)

Since v0.0.0

## PhoenixShape (interface)

Public Effect service shape for Phoenix operations.

**Example**

```ts
import type { PhoenixShape } from "@beep/phoenix"

type PhoenixOperationName = keyof PhoenixShape
const operation: PhoenixOperationName = "doctor"
console.log(operation)
```

**Signature**

```ts
export interface PhoenixShape {
  readonly addAnnotation: (input: PhoenixAnnotationInput) => Effect.Effect<PhoenixAnnotationWriteResult, PhoenixError>;
  readonly appendDatasetExamples: (
    input: PhoenixDatasetAppendInput
  ) => Effect.Effect<PhoenixDatasetAppendResult, PhoenixError>;
  readonly createDataset: (input: PhoenixDatasetCreateInput) => Effect.Effect<PhoenixDatasetCreateResult, PhoenixError>;
  readonly createExperiment: (
    input: PhoenixExperimentCreateInput
  ) => Effect.Effect<PhoenixExperimentInfoResult, PhoenixError>;
  readonly createPrompt: (input: PhoenixPromptCreateInput) => Effect.Effect<PhoenixPromptWriteResult, PhoenixError>;
  readonly doctor: Effect.Effect<PhoenixDoctorResult, PhoenixError>;
  readonly getDatasetExamples: (
    selector: PhoenixDatasetSelector
  ) => Effect.Effect<PhoenixDatasetExamplesResult, PhoenixError>;
  readonly getDatasetInfo: (selector: PhoenixDatasetSelector) => Effect.Effect<PhoenixDatasetInfoResult, PhoenixError>;
  readonly getExperimentInfo: (experimentId: string) => Effect.Effect<PhoenixExperimentInfoResult, PhoenixError>;
  readonly getPrompt: (selector: PhoenixPromptSelector) => Effect.Effect<PhoenixPromptReadResult, PhoenixError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.service.ts#L109)

Since v0.0.0