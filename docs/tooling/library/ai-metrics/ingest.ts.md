---
title: ingest.ts
nav_order: 8
parent: "@beep/repo-ai-metrics"
---

## ingest.ts overview

Transcript ingest helpers for AI-agent metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsIngestError (class)](#aimetricsingesterror-class)
- [services](#services)
  - [summarizeTranscriptText](#summarizetranscripttext)
  - [summaryToJson](#summarytojson)
---

# errors

## AiMetricsIngestError (class)

Error raised by AI metrics ingest helpers.

**Example**

```ts
import { AiMetricsIngestError } from "@beep/repo-ai-metrics"
console.log(AiMetricsIngestError)
```

**Signature**

```ts
declare class AiMetricsIngestError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/ingest.ts#L43)

Since v0.0.0

# services

## summarizeTranscriptText

Summarize JSONL transcript text into a stable ingest summary.

**Example**

```ts
import { summarizeTranscriptText } from "@beep/repo-ai-metrics"
import { Effect } from "effect"
const result = Effect.runPromise(
  summarizeTranscriptText({
    content: "{\"type\":\"event_msg\"}",
    hashSalt: "local-smoke-salt",
    sourceKind: "codex",
    sourcePath: "sample.jsonl"
  })
)
console.log(result)
```

**Signature**

```ts
declare const summarizeTranscriptText: (input: TranscriptTextSummaryInput) => Effect.Effect<TranscriptIngestSummary, AiMetricsIngestError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/ingest.ts#L177)

Since v0.0.0

## summaryToJson

Render a transcript ingest summary as JSON.

**Example**

```ts
import { summaryToJson } from "@beep/repo-ai-metrics"
console.log(summaryToJson)
```

**Signature**

```ts
declare const summaryToJson: (summary: TranscriptIngestSummary) => Effect.Effect<string, AiMetricsIngestError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/ingest.ts#L220)

Since v0.0.0