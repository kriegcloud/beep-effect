---
title: scorecard.ts
nav_order: 15
parent: "@beep/repo-ai-metrics"
---

## scorecard.ts overview

Labels, benchmark records, and weekly scorecard reports for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsScorecardError (class)](#aimetricsscorecarderror-class)
- [models](#models)
  - [AiMetricsBenchmarkCaseInput (class)](#aimetricsbenchmarkcaseinput-class)
  - [AiMetricsBenchmarkCaseListResult (class)](#aimetricsbenchmarkcaselistresult-class)
  - [AiMetricsBenchmarkRunInput (class)](#aimetricsbenchmarkruninput-class)
  - [AiMetricsLabelQueueInput (class)](#aimetricslabelqueueinput-class)
  - [AiMetricsLabelQueueItem (class)](#aimetricslabelqueueitem-class)
  - [AiMetricsLabelQueueResult (class)](#aimetricslabelqueueresult-class)
  - [AiMetricsOutcomeLabelInput (class)](#aimetricsoutcomelabelinput-class)
  - [AiMetricsWeeklyConfigScore (class)](#aimetricsweeklyconfigscore-class)
  - [AiMetricsWeeklyReportDocument (class)](#aimetricsweeklyreportdocument-class)
  - [AiMetricsWeeklyReportInput (class)](#aimetricsweeklyreportinput-class)
  - [AiMetricsWeeklyReportResult (class)](#aimetricsweeklyreportresult-class)
- [services](#services)
  - [addAiMetricsOutcomeLabel](#addaimetricsoutcomelabel)
  - [generateAiMetricsWeeklyReport](#generateaimetricsweeklyreport)
  - [listAiMetricsBenchmarkCases](#listaimetricsbenchmarkcases)
  - [queueAiMetricsLabels](#queueaimetricslabels)
  - [recordAiMetricsBenchmarkRun](#recordaimetricsbenchmarkrun)
  - [upsertAiMetricsBenchmarkCase](#upsertaimetricsbenchmarkcase)
- [utilities](#utilities)
  - [aiMetricsBenchmarkCaseListToJson](#aimetricsbenchmarkcaselisttojson)
  - [aiMetricsBenchmarkCaseToJson](#aimetricsbenchmarkcasetojson)
  - [aiMetricsBenchmarkRunToJson](#aimetricsbenchmarkruntojson)
  - [aiMetricsLabelQueueToJson](#aimetricslabelqueuetojson)
  - [aiMetricsOutcomeLabelToJson](#aimetricsoutcomelabeltojson)
  - [aiMetricsWeeklyReportToJson](#aimetricsweeklyreporttojson)
---

# errors

## AiMetricsScorecardError (class)

Error raised by AI metrics label, benchmark, or scorecard workflows.

**Example**

```ts
import { AiMetricsScorecardError } from "@beep/repo-ai-metrics"
console.log(AiMetricsScorecardError)
```

**Signature**

```ts
declare class AiMetricsScorecardError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L42)

Since v0.0.0

# models

## AiMetricsBenchmarkCaseInput (class)

Input for adding or replacing a benchmark case.

**Example**

```ts
import { AiMetricsBenchmarkCaseInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsBenchmarkCaseInput)
```

**Signature**

```ts
declare class AiMetricsBenchmarkCaseInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L167)

Since v0.0.0

## AiMetricsBenchmarkCaseListResult (class)

Result returned by the benchmark case list command.

**Example**

```ts
import { AiMetricsBenchmarkCaseListResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsBenchmarkCaseListResult)
```

**Signature**

```ts
declare class AiMetricsBenchmarkCaseListResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L191)

Since v0.0.0

## AiMetricsBenchmarkRunInput (class)

Input for recording an observed benchmark result.

**Example**

```ts
import { AiMetricsBenchmarkRunInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsBenchmarkRunInput)
```

**Signature**

```ts
declare class AiMetricsBenchmarkRunInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L213)

Since v0.0.0

## AiMetricsLabelQueueInput (class)

Input for reading unlabeled tasks from the label queue.

**Example**

```ts
import { AiMetricsLabelQueueInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsLabelQueueInput)
```

**Signature**

```ts
declare class AiMetricsLabelQueueInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L94)

Since v0.0.0

## AiMetricsLabelQueueItem (class)

One task waiting for a human outcome label.

**Example**

```ts
import { AiMetricsLabelQueueItem } from "@beep/repo-ai-metrics"
console.log(AiMetricsLabelQueueItem)
```

**Signature**

```ts
declare class AiMetricsLabelQueueItem
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L64)

Since v0.0.0

## AiMetricsLabelQueueResult (class)

Result returned by the label queue.

**Example**

```ts
import { AiMetricsLabelQueueResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsLabelQueueResult)
```

**Signature**

```ts
declare class AiMetricsLabelQueueResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L117)

Since v0.0.0

## AiMetricsOutcomeLabelInput (class)

Input for adding or replacing the current label for one task.

**Example**

```ts
import { AiMetricsOutcomeLabelInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsOutcomeLabelInput)
```

**Signature**

```ts
declare class AiMetricsOutcomeLabelInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L140)

Since v0.0.0

## AiMetricsWeeklyConfigScore (class)

One config-snapshot row inside a weekly report.

**Example**

```ts
import { AiMetricsWeeklyConfigScore } from "@beep/repo-ai-metrics"
console.log(AiMetricsWeeklyConfigScore)
```

**Signature**

```ts
declare class AiMetricsWeeklyConfigScore
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L239)

Since v0.0.0

## AiMetricsWeeklyReportDocument (class)

Machine-readable weekly report document.

**Example**

```ts
import { AiMetricsWeeklyReportDocument } from "@beep/repo-ai-metrics"
console.log(AiMetricsWeeklyReportDocument)
```

**Signature**

```ts
declare class AiMetricsWeeklyReportDocument
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L259)

Since v0.0.0

## AiMetricsWeeklyReportInput (class)

Input for generating a weekly config-impact report.

**Example**

```ts
import { AiMetricsWeeklyReportInput } from "@beep/repo-ai-metrics"
console.log(AiMetricsWeeklyReportInput)
```

**Signature**

```ts
declare class AiMetricsWeeklyReportInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L286)

Since v0.0.0

## AiMetricsWeeklyReportResult (class)

Result returned after writing weekly report artifacts.

**Example**

```ts
import { AiMetricsWeeklyReportResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsWeeklyReportResult)
```

**Signature**

```ts
declare class AiMetricsWeeklyReportResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L309)

Since v0.0.0

# services

## addAiMetricsOutcomeLabel

Add or replace the current structured human label for a task.

**Example**

```ts
import { addAiMetricsOutcomeLabel } from "@beep/repo-ai-metrics"
console.log(addAiMetricsOutcomeLabel)
```

**Signature**

```ts
declare const addAiMetricsOutcomeLabel: (input: AiMetricsOutcomeLabelInput) => Effect.Effect<OutcomeLabel, AiMetricsScorecardError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L603)

Since v0.0.0

## generateAiMetricsWeeklyReport

Generate and persist a weekly config-impact report.

**Example**

```ts
import { generateAiMetricsWeeklyReport } from "@beep/repo-ai-metrics"
console.log(generateAiMetricsWeeklyReport)
```

**Signature**

```ts
declare const generateAiMetricsWeeklyReport: (input: AiMetricsWeeklyReportInput) => Effect.Effect<AiMetricsWeeklyReportResult, AiMetricsScorecardError, DuckDb | FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1224)

Since v0.0.0

## listAiMetricsBenchmarkCases

List deploy-safe benchmark cases.

**Example**

```ts
import { listAiMetricsBenchmarkCases } from "@beep/repo-ai-metrics"
console.log(listAiMetricsBenchmarkCases)
```

**Signature**

```ts
declare const listAiMetricsBenchmarkCases: Effect.Effect<AiMetricsBenchmarkCaseListResult, AiMetricsScorecardError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L760)

Since v0.0.0

## queueAiMetricsLabels

Read unlabeled tasks for human review.

**Example**

```ts
import { queueAiMetricsLabels } from "@beep/repo-ai-metrics"
console.log(queueAiMetricsLabels)
```

**Signature**

```ts
declare const queueAiMetricsLabels: (input: AiMetricsLabelQueueInput) => Effect.Effect<AiMetricsLabelQueueResult, AiMetricsScorecardError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L527)

Since v0.0.0

## recordAiMetricsBenchmarkRun

Record an observed benchmark run for one config snapshot.

**Example**

```ts
import { recordAiMetricsBenchmarkRun } from "@beep/repo-ai-metrics"
console.log(recordAiMetricsBenchmarkRun)
```

**Signature**

```ts
declare const recordAiMetricsBenchmarkRun: (input: AiMetricsBenchmarkRunInput) => Effect.Effect<BenchmarkRun, AiMetricsScorecardError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L796)

Since v0.0.0

## upsertAiMetricsBenchmarkCase

Add or replace a deploy-safe benchmark case.

**Example**

```ts
import { upsertAiMetricsBenchmarkCase } from "@beep/repo-ai-metrics"
console.log(upsertAiMetricsBenchmarkCase)
```

**Signature**

```ts
declare const upsertAiMetricsBenchmarkCase: (input: AiMetricsBenchmarkCaseInput) => Effect.Effect<BenchmarkCase, AiMetricsScorecardError, DuckDb>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L681)

Since v0.0.0

# utilities

## aiMetricsBenchmarkCaseListToJson

Render benchmark cases as JSON.

**Example**

```ts
import { aiMetricsBenchmarkCaseListToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsBenchmarkCaseListToJson)
```

**Signature**

```ts
declare const aiMetricsBenchmarkCaseListToJson: (result: AiMetricsBenchmarkCaseListResult) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1368)

Since v0.0.0

## aiMetricsBenchmarkCaseToJson

Render a benchmark case as JSON.

**Example**

```ts
import { aiMetricsBenchmarkCaseToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsBenchmarkCaseToJson)
```

**Signature**

```ts
declare const aiMetricsBenchmarkCaseToJson: (result: BenchmarkCase) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1350)

Since v0.0.0

## aiMetricsBenchmarkRunToJson

Render a benchmark run as JSON.

**Example**

```ts
import { aiMetricsBenchmarkRunToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsBenchmarkRunToJson)
```

**Signature**

```ts
declare const aiMetricsBenchmarkRunToJson: (result: BenchmarkRun) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1389)

Since v0.0.0

## aiMetricsLabelQueueToJson

Render a label queue result as JSON.

**Example**

```ts
import { aiMetricsLabelQueueToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsLabelQueueToJson)
```

**Signature**

```ts
declare const aiMetricsLabelQueueToJson: (result: AiMetricsLabelQueueResult) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1311)

Since v0.0.0

## aiMetricsOutcomeLabelToJson

Render an outcome label as JSON.

**Example**

```ts
import { aiMetricsOutcomeLabelToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsOutcomeLabelToJson)
```

**Signature**

```ts
declare const aiMetricsOutcomeLabelToJson: (result: OutcomeLabel) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1332)

Since v0.0.0

## aiMetricsWeeklyReportToJson

Render a weekly report result as JSON.

**Example**

```ts
import { aiMetricsWeeklyReportToJson } from "@beep/repo-ai-metrics"
console.log(aiMetricsWeeklyReportToJson)
```

**Signature**

```ts
declare const aiMetricsWeeklyReportToJson: (result: AiMetricsWeeklyReportResult) => Effect.Effect<string, AiMetricsScorecardError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/scorecard.ts#L1407)

Since v0.0.0