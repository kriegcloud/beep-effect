---
title: install.ts
nav_order: 9
parent: "@beep/repo-ai-metrics"
---

## install.ts overview

Target-agnostic install spec for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [makeAiMetricsInstallApplyDryRunResult](#makeaimetricsinstallapplydryrunresult)
  - [makeAiMetricsInstallDoctorResult](#makeaimetricsinstalldoctorresult)
  - [makeAiMetricsInstallPlan](#makeaimetricsinstallplan)
  - [makeAiMetricsInstallSpec](#makeaimetricsinstallspec)
- [errors](#errors)
  - [AiMetricsInstallConfigurationError (class)](#aimetricsinstallconfigurationerror-class)
- [models](#models)
  - [AiMetricsInstallApplyDryRunResult (class)](#aimetricsinstallapplydryrunresult-class)
  - [AiMetricsInstallDoctorCheck (class)](#aimetricsinstalldoctorcheck-class)
  - [AiMetricsInstallDoctorCheckStatus](#aimetricsinstalldoctorcheckstatus)
  - [AiMetricsInstallDoctorCheckStatus (type alias)](#aimetricsinstalldoctorcheckstatus-type-alias)
  - [AiMetricsInstallDoctorInput (class)](#aimetricsinstalldoctorinput-class)
  - [AiMetricsInstallDoctorResult (class)](#aimetricsinstalldoctorresult-class)
  - [AiMetricsInstallDoctorStatus](#aimetricsinstalldoctorstatus)
  - [AiMetricsInstallDoctorStatus (type alias)](#aimetricsinstalldoctorstatus-type-alias)
  - [AiMetricsInstallInput (class)](#aimetricsinstallinput-class)
  - [AiMetricsInstallPlan (class)](#aimetricsinstallplan-class)
  - [AiMetricsInstallPlanStep (class)](#aimetricsinstallplanstep-class)
  - [AiMetricsInstallPlanStepKind](#aimetricsinstallplanstepkind)
  - [AiMetricsInstallPlanStepKind (type alias)](#aimetricsinstallplanstepkind-type-alias)
  - [AiMetricsInstallSpec (class)](#aimetricsinstallspec-class)
  - [AiMetricsServiceSpec (class)](#aimetricsservicespec-class)
  - [AiMetricsStorageLayout (class)](#aimetricsstoragelayout-class)
- [utilities](#utilities)
  - [aiMetricsInstallApplyDryRunToJson](#aimetricsinstallapplydryruntojson)
  - [aiMetricsInstallDoctorToJson](#aimetricsinstalldoctortojson)
  - [aiMetricsInstallPlanToJson](#aimetricsinstallplantojson)
---

# constructors

## makeAiMetricsInstallApplyDryRunResult

Resolve the P5a dry-run apply result.

**Example**

```ts
import { makeAiMetricsInstallApplyDryRunResult } from "@beep/repo-ai-metrics"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const result = yield* makeAiMetricsInstallApplyDryRunResult()
  console.log(result.dryRun)
})
console.log(program)
```

**Signature**

```ts
declare const makeAiMetricsInstallApplyDryRunResult: (input?: AiMetricsInstallInput) => Effect.Effect<AiMetricsInstallApplyDryRunResult, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1220)

Since v0.0.0

## makeAiMetricsInstallDoctorResult

Evaluate the P5a install doctor contract checks.

**Example**

```ts
import { makeAiMetricsInstallDoctorResult } from "@beep/repo-ai-metrics"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const result = yield* makeAiMetricsInstallDoctorResult()
  console.log(result.status)
})
console.log(program)
```

**Signature**

```ts
declare const makeAiMetricsInstallDoctorResult: (input?: AiMetricsInstallDoctorInput) => Effect.Effect<AiMetricsInstallDoctorResult, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1115)

Since v0.0.0

## makeAiMetricsInstallPlan

Resolve the typed P5a install plan for a target without mutating local or remote state.

**Example**

```ts
import { makeAiMetricsInstallPlan } from "@beep/repo-ai-metrics"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const plan = yield* makeAiMetricsInstallPlan()
  console.log(plan.dryRunOnly)
})
console.log(program)
```

**Signature**

```ts
declare const makeAiMetricsInstallPlan: (input?: AiMetricsInstallInput) => Effect.Effect<AiMetricsInstallPlan, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1074)

Since v0.0.0

## makeAiMetricsInstallSpec

Resolve an install spec for the requested AI metrics target.

**Example**

```ts
import { makeAiMetricsInstallSpec } from "@beep/repo-ai-metrics"
import { Effect } from "effect"
const spec = Effect.runSync(makeAiMetricsInstallSpec())
console.log(spec.storage.rawArchiveDir)
```

**Signature**

```ts
declare const makeAiMetricsInstallSpec: (input?: AiMetricsInstallInput) => Effect.Effect<AiMetricsInstallSpec, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1023)

Since v0.0.0

# errors

## AiMetricsInstallConfigurationError (class)

Error raised when an AI metrics install spec would be unsafe for the requested target.

**Example**

```ts
import { AiMetricsInstallConfigurationError } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallConfigurationError)
```

**Signature**

```ts
declare class AiMetricsInstallConfigurationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L109)

Since v0.0.0

# models

## AiMetricsInstallApplyDryRunResult (class)

P5a dry-run apply result.

**Example**

```ts
import { AiMetricsInstallApplyDryRunResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallApplyDryRunResult)
```

**Signature**

```ts
declare class AiMetricsInstallApplyDryRunResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L506)

Since v0.0.0

## AiMetricsInstallDoctorCheck (class)

One P5a install doctor check.

**Example**

```ts
import { AiMetricsInstallDoctorCheck } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallDoctorCheck)
```

**Signature**

```ts
declare class AiMetricsInstallDoctorCheck
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L430)

Since v0.0.0

## AiMetricsInstallDoctorCheckStatus

Doctor check status for P5a install contract validation.

**Example**

```ts
import { AiMetricsInstallDoctorCheckStatus } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallDoctorCheckStatus.Enum.passed)
```

**Signature**

```ts
declare const AiMetricsInstallDoctorCheckStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "warning", "failed", "skipped"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L368)

Since v0.0.0

## AiMetricsInstallDoctorCheckStatus (type alias)

Runtime type for `AiMetricsInstallDoctorCheckStatus`.

**Example**

```ts
import type { AiMetricsInstallDoctorCheckStatus } from "@beep/repo-ai-metrics"
const status: AiMetricsInstallDoctorCheckStatus = "passed"
console.log(status)
```

**Signature**

```ts
type AiMetricsInstallDoctorCheckStatus = typeof AiMetricsInstallDoctorCheckStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L386)

Since v0.0.0

## AiMetricsInstallDoctorInput (class)

Input for P5a install doctor evaluation.

**Example**

```ts
import { AiMetricsInstallDoctorInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallDoctorInput.make({}))
```

**Signature**

```ts
declare class AiMetricsInstallDoctorInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L456)

Since v0.0.0

## AiMetricsInstallDoctorResult (class)

P5a install doctor result.

**Example**

```ts
import { AiMetricsInstallDoctorResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallDoctorResult)
```

**Signature**

```ts
declare class AiMetricsInstallDoctorResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L480)

Since v0.0.0

## AiMetricsInstallDoctorStatus

Overall P5a install doctor result status.

**Example**

```ts
import { AiMetricsInstallDoctorStatus } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallDoctorStatus.Enum.warning)
```

**Signature**

```ts
declare const AiMetricsInstallDoctorStatus: AnnotatedSchema<LiteralKit<readonly ["passed", "warning", "failed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L399)

Since v0.0.0

## AiMetricsInstallDoctorStatus (type alias)

Runtime type for `AiMetricsInstallDoctorStatus`.

**Example**

```ts
import type { AiMetricsInstallDoctorStatus } from "@beep/repo-ai-metrics"
const status: AiMetricsInstallDoctorStatus = "warning"
console.log(status)
```

**Signature**

```ts
type AiMetricsInstallDoctorStatus = typeof AiMetricsInstallDoctorStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L417)

Since v0.0.0

## AiMetricsInstallInput (class)

Input for resolving an AI metrics install spec.

**Example**

```ts
import { AiMetricsInstallInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallInput.make({}).target)
```

**Signature**

```ts
declare class AiMetricsInstallInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L134)

Since v0.0.0

## AiMetricsInstallPlan (class)

Typed P5a install plan for local smoke or dankserver deployment.

**Example**

```ts
import { AiMetricsInstallPlan } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallPlan)
```

**Signature**

```ts
declare class AiMetricsInstallPlan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L341)

Since v0.0.0

## AiMetricsInstallPlanStep (class)

One typed P5a install plan step.

**Example**

```ts
import { AiMetricsInstallPlanStep } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallPlanStep)
```

**Signature**

```ts
declare class AiMetricsInstallPlanStep
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L313)

Since v0.0.0

## AiMetricsInstallPlanStepKind

P5a install-plan step kinds.

**Example**

```ts
import { AiMetricsInstallPlanStepKind } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallPlanStepKind.Enum.storage)
```

**Signature**

```ts
declare const AiMetricsInstallPlanStepKind: AnnotatedSchema<LiteralKit<readonly ["storage", "backend", "health", "source_discovery", "config_snapshot", "privacy_check", "forwarder", "forwarder_timer", "otlp_export", "label_queue", "retention_drill", "weekly_report", "pulumi"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L268)

Since v0.0.0

## AiMetricsInstallPlanStepKind (type alias)

Runtime type for `AiMetricsInstallPlanStepKind`.

**Example**

```ts
import type { AiMetricsInstallPlanStepKind } from "@beep/repo-ai-metrics"
const kind: AiMetricsInstallPlanStepKind = "storage"
console.log(kind)
```

**Signature**

```ts
type AiMetricsInstallPlanStepKind = typeof AiMetricsInstallPlanStepKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L300)

Since v0.0.0

## AiMetricsInstallSpec (class)

Resolved target-agnostic install spec for AI metrics.

**Example**

```ts
import { AiMetricsInstallSpec } from "@beep/repo-ai-metrics"
console.log(AiMetricsInstallSpec)
```

**Signature**

```ts
declare class AiMetricsInstallSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L236)

Since v0.0.0

## AiMetricsServiceSpec (class)

One candidate service in the local bakeoff or promoted install target.

**Example**

```ts
import { AiMetricsServiceSpec } from "@beep/repo-ai-metrics"
console.log(AiMetricsServiceSpec)
```

**Signature**

```ts
declare class AiMetricsServiceSpec
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L209)

Since v0.0.0

## AiMetricsStorageLayout (class)

Storage layout resolved for an AI metrics target.

**Example**

```ts
import { AiMetricsStorageLayout } from "@beep/repo-ai-metrics"
console.log(AiMetricsStorageLayout)
```

**Signature**

```ts
declare class AiMetricsStorageLayout
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L185)

Since v0.0.0

# utilities

## aiMetricsInstallApplyDryRunToJson

Render a P5a dry-run apply result as JSON.

**Example**

```ts
import { aiMetricsInstallApplyDryRunToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsInstallApplyDryRunToJson)
```

**Signature**

```ts
declare const aiMetricsInstallApplyDryRunToJson: (result: AiMetricsInstallApplyDryRunResult) => Effect.Effect<string, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1280)

Since v0.0.0

## aiMetricsInstallDoctorToJson

Render a P5a install doctor result as JSON.

**Example**

```ts
import { aiMetricsInstallDoctorToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsInstallDoctorToJson)
```

**Signature**

```ts
declare const aiMetricsInstallDoctorToJson: (result: AiMetricsInstallDoctorResult) => Effect.Effect<string, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1263)

Since v0.0.0

## aiMetricsInstallPlanToJson

Render a P5a install plan as JSON.

**Example**

```ts
import { aiMetricsInstallPlanToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsInstallPlanToJson)
```

**Signature**

```ts
declare const aiMetricsInstallPlanToJson: (result: AiMetricsInstallPlan) => Effect.Effect<string, AiMetricsInstallConfigurationError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/install.ts#L1246)

Since v0.0.0