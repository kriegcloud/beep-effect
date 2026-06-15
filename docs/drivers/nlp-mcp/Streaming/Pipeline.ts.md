---
title: Pipeline.ts
nav_order: 6
parent: "@beep/nlp-mcp"
---

## Pipeline.ts overview

Line-transform pipeline helper backing the streaming process tool.

Applies an ordered list of pure line transforms over a file's lines, tracking
processed/failed/skipped counts, wall-clock duration (via `Clock`), and
per-item failures as `{ item, error, stage }`. The built-in transforms are
total functions, so the failure path exists for completeness and for
`stopOnError` semantics rather than because the stages throw.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PipelineError (class)](#pipelineerror-class)
  - [PipelineResult (class)](#pipelineresult-class)
  - [PipelineStage](#pipelinestage)
  - [PipelineStage (type alias)](#pipelinestage-type-alias)
- [processes](#processes)
  - [processFile](#processfile)
---

# models

## PipelineError (class)

A single pipeline failure entry describing the item, message, and stage.

**Example**

```ts
import { PipelineError } from "@beep/nlp-mcp/Streaming/Pipeline"

const error = PipelineError.make({ error: "failed", item: "raw", stage: "trim" })
console.log(error.stage)
```

**Signature**

```ts
declare class PipelineError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Pipeline.ts#L80)

Since v0.0.0

## PipelineResult (class)

Outcome of running a line-transform pipeline over a file.

**Example**

```ts
import { PipelineResult } from "@beep/nlp-mcp/Streaming/Pipeline"

const result = PipelineResult.make({
  durationMs: 1,
  errors: [],
  failed: 0,
  processed: 1,
  results: ["hello"],
  skipped: 0
})
console.log(result.processed)
```

**Signature**

```ts
declare class PipelineResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Pipeline.ts#L118)

Since v0.0.0

## PipelineStage

Identifier of a supported, pure line transform stage.

**Example**

```ts
import type { PipelineStage } from "@beep/nlp-mcp/Streaming/Pipeline"

const stage: PipelineStage = "normalizeWhitespace"
console.log(stage)
```

**Signature**

```ts
declare const PipelineStage: LiteralKit<readonly ["lowercase", "normalizeWhitespace", "removePunctuation", "trim", "uppercase"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Pipeline.ts#L38)

Since v0.0.0

## PipelineStage (type alias)

Type for `PipelineStage`.

**Example**

```ts
import type { PipelineStage } from "@beep/nlp-mcp/Streaming/Pipeline"

const stages: ReadonlyArray<PipelineStage> = ["trim", "lowercase"]
console.log(stages.length)
```

**Signature**

```ts
type PipelineStage = typeof PipelineStage.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Pipeline.ts#L64)

Since v0.0.0

# processes

## processFile

Run an ordered list of line transforms over the lines of a file.

Lines are read via `readLines` (optionally skipping blanks), each
surviving line is folded through `stages`, and aggregate counts plus duration
are returned. `maxLines` caps how many lines are considered; `stopOnError`
stops processing after the first failure (the built-in stages never fail, so
this only affects future custom stages).

**Example**

```ts
import { processFile } from "@beep/nlp-mcp/Streaming/Pipeline"

console.log(processFile("/tmp/data.txt", ["trim", "lowercase"], { skipEmpty: true }))
```

**Signature**

```ts
declare const processFile: (filePath: string, stages: ReadonlyArray<"trim" | "lowercase" | "normalizeWhitespace" | "removePunctuation" | "uppercase">, options?: { readonly maxLines?: number | undefined; readonly skipEmpty?: boolean | undefined; readonly stopOnError?: boolean | undefined; } | undefined) => Effect.Effect<PipelineResult, PlatformError, FileSystem | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Pipeline.ts#L179)

Since v0.0.0