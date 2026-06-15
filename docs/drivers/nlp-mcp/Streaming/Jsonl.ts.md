---
title: Jsonl.ts
nav_order: 5
parent: "@beep/nlp-mcp"
---

## Jsonl.ts overview

JSONL (JSON Lines / NDJSON) streaming helpers backing the streaming JSONL
tools.

Records are parsed line-by-line on top of `streamLines`, with
optional skip-invalid behavior and structured per-line error collection. All
operations require the `FileSystem.FileSystem` and `Path.Path`
services and surface the platform error channel.

Since v0.0.0

---
## Exports Grouped by Category
- [diagnostics](#diagnostics)
  - [computeJsonlStats](#computejsonlstats)
- [models](#models)
  - [JsonlLineError (class)](#jsonllineerror-class)
  - [JsonlStats (class)](#jsonlstats-class)
- [streams](#streams)
  - [streamJsonl](#streamjsonl)
  - [streamJsonlResults](#streamjsonlresults)
- [utilities](#utilities)
  - [readJsonl](#readjsonl)
  - [sampleJsonl](#samplejsonl)
- [validation](#validation)
  - [validateJsonl](#validatejsonl)
---

# diagnostics

## computeJsonlStats

Compute aggregate parse statistics for a JSONL file.

**Example**

```ts
import { computeJsonlStats } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(computeJsonlStats("/tmp/data.jsonl"))
```

**Signature**

```ts
declare const computeJsonlStats: (filePath: string) => Effect.Effect<JsonlStats, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L199)

Since v0.0.0

# models

## JsonlLineError (class)

Structured parse failure for a single JSONL line.

**Example**

```ts
import { JsonlLineError } from "@beep/nlp-mcp/Streaming/Jsonl"

const error = JsonlLineError.make({ error: "Unexpected token", lineNumber: 4 })
console.log(error.lineNumber)
```

**Signature**

```ts
declare class JsonlLineError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L40)

Since v0.0.0

## JsonlStats (class)

Aggregate parse statistics for a JSONL file.

**Example**

```ts
import { JsonlStats } from "@beep/nlp-mcp/Streaming/Jsonl"

const stats = JsonlStats.make({ errorCount: 0, skippedCount: 0, successCount: 2, totalLines: 2 })
console.log(stats.successCount)
```

**Signature**

```ts
declare class JsonlStats
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L69)

Since v0.0.0

# streams

## streamJsonl

Stream parsed JSONL records, optionally dropping invalid lines.

Blank lines are filtered before parsing. When `skipInvalid` is `true` parse
failures are silently discarded; otherwise the first failure fails the stream
with a `JsonlLineError`.

**Example**

```ts
import * as Stream from "effect/Stream"
import { streamJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(Stream.runCollect(streamJsonl("/tmp/data.jsonl", { skipInvalid: true })))
```

**Signature**

```ts
declare const streamJsonl: (filePath: string, options?: { readonly skipInvalid?: boolean | undefined; }) => Stream.Stream<unknown, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L133)

Since v0.0.0

## streamJsonlResults

Stream per-line parse results, never failing on malformed JSON.

Each emitted `Result.Result` is either a parsed record (`Success`) or a
`JsonlLineError` (`Failure`), enabling callers to fold over outcomes.

**Example**

```ts
import * as Stream from "effect/Stream"
import { streamJsonlResults } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(Stream.runCollect(streamJsonlResults("/tmp/data.jsonl")))
```

**Signature**

```ts
declare const streamJsonlResults: (filePath: string) => Stream.Stream<Result.Result<unknown, JsonlLineError>, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L162)

Since v0.0.0

# utilities

## readJsonl

Collect parsed JSONL records into an array.

**Example**

```ts
import { readJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(readJsonl("/tmp/data.jsonl", { skipInvalid: true }))
```

**Signature**

```ts
declare const readJsonl: (filePath: string, options?: { readonly skipInvalid?: boolean | undefined; }) => Effect.Effect<ReadonlyArray<unknown>, JsonlLineError | PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L180)

Since v0.0.0

## sampleJsonl

Sample up to `sampleSize` parsed JSONL records uniformly at random.

Records are first parsed (honoring `skipInvalid`); when at most `sampleSize`
are available they are returned in order, otherwise a `Random` shuffle
selects the sample which is then re-sorted into original order.

**Example**

```ts
import { sampleJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(sampleJsonl("/tmp/data.jsonl", 3, { skipInvalid: true }))
```

**Signature**

```ts
declare const sampleJsonl: (filePath: string, sampleSize: number, options?: { readonly skipInvalid?: boolean | undefined; } | undefined) => Effect.Effect<ReadonlyArray<unknown>, PlatformError | JsonlLineError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L285)

Since v0.0.0

# validation

## validateJsonl

Validate a JSONL file, returning parsed records and collected line errors.

**Example**

```ts
import { validateJsonl } from "@beep/nlp-mcp/Streaming/Jsonl"

console.log(validateJsonl("/tmp/data.jsonl"))
```

**Signature**

```ts
declare const validateJsonl: (filePath: string) => Effect.Effect<{ readonly errors: ReadonlyArray<JsonlLineError>; readonly records: ReadonlyArray<unknown>; }, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/Jsonl.ts#L234)

Since v0.0.0