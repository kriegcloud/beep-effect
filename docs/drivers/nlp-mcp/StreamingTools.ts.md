---
title: StreamingTools.ts
nav_order: 9
parent: "@beep/nlp-mcp"
---

## StreamingTools.ts overview

Streaming and dataset MCP tool definitions.

Declares the 17 agent-facing streaming tools (file IO, JSONL handling,
dataset loading, and line-transform pipelines) together with their output
schemas and the `StreamingToolkit` that groups them. Every tool fails
with `AiToolError` using `failureMode: "return"` so callers can inspect
structured failures. All output schemas are plain `S.Struct` values
because the toolkit encodes results structurally.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DataOutput (type alias)](#dataoutput-type-alias)
  - [DatasetMetaOutput (type alias)](#datasetmetaoutput-type-alias)
  - [FileInfoOutput (type alias)](#fileinfooutput-type-alias)
  - [JsonlOutput (type alias)](#jsonloutput-type-alias)
  - [JsonlStatsOutput (type alias)](#jsonlstatsoutput-type-alias)
  - [LinesOutput (type alias)](#linesoutput-type-alias)
  - [PipelineOutput (type alias)](#pipelineoutput-type-alias)
  - [TextStatsOutput (type alias)](#textstatsoutput-type-alias)
- [schemas](#schemas)
  - [DataOutput](#dataoutput)
  - [DatasetMetaOutput](#datasetmetaoutput)
  - [FileInfoOutput](#fileinfooutput)
  - [JsonlOutput](#jsonloutput)
  - [JsonlStatsOutput](#jsonlstatsoutput)
  - [LinesOutput](#linesoutput)
  - [PipelineOutput](#pipelineoutput)
  - [TextStatsOutput](#textstatsoutput)
- [tools](#tools)
  - [CountJsonl](#countjsonl)
  - [CountLines](#countlines)
  - [ExtractMatches](#extractmatches)
  - [FileInfo](#fileinfo)
  - [FilterLines](#filterlines)
  - [JsonlStats](#jsonlstats)
  - [LoadJson](#loadjson)
  - [LoadJsonl](#loadjsonl)
  - [LoadLines](#loadlines)
  - [LoadText](#loadtext)
  - [ProcessFile](#processfile)
  - [ReadJsonl](#readjsonl)
  - [ReadLines](#readlines)
  - [SampleJsonl](#samplejsonl)
  - [SampleLines](#samplelines)
  - [StreamingToolkit](#streamingtoolkit)
  - [StreamingToolkit (type alias)](#streamingtoolkit-type-alias)
  - [TextStats](#textstats)
  - [ValidateJsonl](#validatejsonl)
---

# models

## DataOutput (type alias)

Type for `DataOutput`.

**Signature**

```ts
type DataOutput = typeof DataOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L343)

Since v0.0.0

## DatasetMetaOutput (type alias)

Type for `DatasetMetaOutput`.

**Signature**

```ts
type DatasetMetaOutput = typeof DatasetMetaOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L294)

Since v0.0.0

## FileInfoOutput (type alias)

Type for `FileInfoOutput`.

**Signature**

```ts
type FileInfoOutput = typeof FileInfoOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L136)

Since v0.0.0

## JsonlOutput (type alias)

Type for `JsonlOutput`.

**Signature**

```ts
type JsonlOutput = typeof JsonlOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L226)

Since v0.0.0

## JsonlStatsOutput (type alias)

Type for `JsonlStatsOutput`.

**Signature**

```ts
type JsonlStatsOutput = typeof JsonlStatsOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L260)

Since v0.0.0

## LinesOutput (type alias)

Type for `LinesOutput`.

**Signature**

```ts
type LinesOutput = typeof LinesOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L86)

Since v0.0.0

## PipelineOutput (type alias)

Type for `PipelineOutput`.

**Signature**

```ts
type PipelineOutput = typeof PipelineOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L382)

Since v0.0.0

## TextStatsOutput (type alias)

Type for `TextStatsOutput`.

**Signature**

```ts
type TextStatsOutput = typeof TextStatsOutput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L172)

Since v0.0.0

# schemas

## DataOutput

Output schema pairing loaded data with its `DatasetMetaOutput`.

**Example**

```ts
import * as S from "effect/Schema"
import { DataOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(DataOutput)({
  data: "hello",
  meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
})
console.log(output)
```

**Signature**

```ts
declare const DataOutput: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L314)

Since v0.0.0

## DatasetMetaOutput

Output schema for dataset provenance metadata.

**Example**

```ts
import * as S from "effect/Schema"
import { DatasetMetaOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(DatasetMetaOutput)({
  format: "text",
  loadedAt: 0,
  location: "/tmp/data.txt",
  sourceType: "file"
})
console.log(output)
```

**Signature**

```ts
declare const DatasetMetaOutput: AnnotatedSchema<S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L282)

Since v0.0.0

## FileInfoOutput

Output schema for file existence and size metadata.

**Example**

```ts
import * as S from "effect/Schema"
import { FileInfoOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(FileInfoOutput)({ exists: true, lineCount: 3, sizeBytes: 12 })
console.log(output)
```

**Signature**

```ts
declare const FileInfoOutput: AnnotatedSchema<S.Struct<{ readonly exists: S.Boolean; readonly lineCount: S.optionalKey<S.Finite>; readonly sizeBytes: S.optionalKey<S.Finite>; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L103)

Since v0.0.0

## JsonlOutput

Output schema for JSONL record reads, with optional collected errors.

**Example**

```ts
import * as S from "effect/Schema"
import { JsonlOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(JsonlOutput)({ count: 1, records: [{ id: 1 }], truncated: false })
console.log(output)
```

**Signature**

```ts
declare const JsonlOutput: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L189)

Since v0.0.0

## JsonlStatsOutput

Output schema for JSONL parse statistics.

**Example**

```ts
import * as S from "effect/Schema"
import { JsonlStatsOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(JsonlStatsOutput)({
  errorCount: 0,
  skippedCount: 0,
  successCount: 3,
  totalLines: 3
})
console.log(output)
```

**Signature**

```ts
declare const JsonlStatsOutput: AnnotatedSchema<S.Struct<{ readonly errorCount: S.Finite; readonly skippedCount: S.Finite; readonly successCount: S.Finite; readonly totalLines: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L248)

Since v0.0.0

## LinesOutput

Output schema for line-returning streaming tools.

**Example**

```ts
import * as S from "effect/Schema"
import { LinesOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(LinesOutput)({ count: 1, lines: ["hi"], truncated: false })
console.log(output)
```

**Signature**

```ts
declare const LinesOutput: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L53)

Since v0.0.0

## PipelineOutput

Output schema for line-transform pipeline runs.

**Example**

```ts
import * as S from "effect/Schema"
import { PipelineOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(PipelineOutput)({
  durationMs: 1,
  errors: [],
  failed: 0,
  processed: 2,
  results: ["a", "b"],
  skipped: 0
})
console.log(output)
```

**Signature**

```ts
declare const PipelineOutput: AnnotatedSchema<S.Struct<{ readonly errors: S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly item: S.Unknown; readonly stage: S.String; }>>>; readonly durationMs: S.Finite; readonly failed: S.Finite; readonly processed: S.Finite; readonly results: S.$Array<S.Unknown>; readonly skipped: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L367)

Since v0.0.0

## TextStatsOutput

Output schema for aggregate text statistics.

**Example**

```ts
import * as S from "effect/Schema"
import { TextStatsOutput } from "@beep/nlp-mcp/StreamingTools"

const output = S.decodeUnknownResult(TextStatsOutput)({
  avgLineLength: 4,
  maxLineLength: 8,
  minLineLength: 1,
  nonEmptyLines: 2,
  totalBytes: 12,
  totalLines: 3
})
console.log(output)
```

**Signature**

```ts
declare const TextStatsOutput: AnnotatedSchema<S.Struct<{ readonly avgLineLength: S.Finite; readonly maxLineLength: S.Finite; readonly minLineLength: S.Finite; readonly nonEmptyLines: S.Finite; readonly totalBytes: S.Finite; readonly totalLines: S.Finite; }>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L160)

Since v0.0.0

# tools

## CountJsonl

Tool: count valid JSONL records in a file.

**Example**

```ts
import { CountJsonl } from "@beep/nlp-mcp/StreamingTools"

console.log(CountJsonl.name)
```

**Signature**

```ts
declare const CountJsonl: Tool.Tool<"stream_count_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.Finite>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L1051)

Since v0.0.0

## CountLines

Tool: count total lines in a file.

**Example**

```ts
import { CountLines } from "@beep/nlp-mcp/StreamingTools"

console.log(CountLines.name)
```

**Signature**

```ts
declare const CountLines: Tool.Tool<"stream_count_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L1030)

Since v0.0.0

## ExtractMatches

Tool: extract regex matches from a file.

**Example**

```ts
import { ExtractMatches } from "@beep/nlp-mcp/StreamingTools"

console.log(ExtractMatches.name)
```

**Signature**

```ts
declare const ExtractMatches: Tool.Tool<"stream_extract_matches", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly caseInsensitive: S.optionalKey<S.Boolean>; readonly fullLines: S.optionalKey<S.Boolean>; readonly maxMatches: S.optionalKey<S.Finite>; }>>; readonly path: S.String; readonly pattern: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L1009)

Since v0.0.0

## FileInfo

Tool: report whether a file exists plus its size and line count.

**Example**

```ts
import { FileInfo } from "@beep/nlp-mcp/StreamingTools"

console.log(FileInfo.name)
```

**Signature**

```ts
declare const FileInfo: Tool.Tool<"stream_file_info", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly exists: S.Boolean; readonly lineCount: S.optionalKey<S.Finite>; readonly sizeBytes: S.optionalKey<S.Finite>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L736)

Since v0.0.0

## FilterLines

Tool: filter file lines by a regex pattern.

**Example**

```ts
import { FilterLines } from "@beep/nlp-mcp/StreamingTools"

console.log(FilterLines.name)
```

**Signature**

```ts
declare const FilterLines: Tool.Tool<"stream_filter_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly caseInsensitive: S.optionalKey<S.Boolean>; readonly invert: S.optionalKey<S.Boolean>; readonly maxLines: S.optionalKey<S.Finite>; }>>; readonly path: S.String; readonly pattern: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L988)

Since v0.0.0

## JsonlStats

Tool: compute JSONL parse statistics for a file.

**Example**

```ts
import { JsonlStats } from "@beep/nlp-mcp/StreamingTools"

console.log(JsonlStats.name)
```

**Signature**

```ts
declare const JsonlStats: Tool.Tool<"stream_jsonl_stats", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly errorCount: S.Finite; readonly skippedCount: S.Finite; readonly successCount: S.Finite; readonly totalLines: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L820)

Since v0.0.0

## LoadJson

Tool: load and parse JSON from a local file or remote URL.

**Example**

```ts
import { LoadJson } from "@beep/nlp-mcp/StreamingTools"

console.log(LoadJson.name)
```

**Signature**

```ts
declare const LoadJson: Tool.Tool<"stream_load_json", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L946)

Since v0.0.0

## LoadJsonl

Tool: load JSONL records from a local file or remote URL.

**Example**

```ts
import { LoadJsonl } from "@beep/nlp-mcp/StreamingTools"

console.log(LoadJsonl.name)
```

**Signature**

```ts
declare const LoadJsonl: Tool.Tool<"stream_load_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly maxRecords: S.optionalKey<S.Finite>; readonly skipInvalid: S.optionalKey<S.Boolean>; readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L925)

Since v0.0.0

## LoadLines

Tool: load lines from a local file or remote URL.

**Example**

```ts
import { LoadLines } from "@beep/nlp-mcp/StreamingTools"

console.log(LoadLines.name)
```

**Signature**

```ts
declare const LoadLines: Tool.Tool<"stream_load_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly maxLines: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly timeout: S.optionalKey<S.Finite>; readonly trim: S.optionalKey<S.Boolean>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L904)

Since v0.0.0

## LoadText

Tool: load text from a local file or remote URL.

**Example**

```ts
import { LoadText } from "@beep/nlp-mcp/StreamingTools"

console.log(LoadText.name)
```

**Signature**

```ts
declare const LoadText: Tool.Tool<"stream_load_text", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly encoding: S.optionalKey<LiteralKit<readonly ["ascii", "latin1", "utf-8"], undefined>>; readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L883)

Since v0.0.0

## ProcessFile

Tool: run a line-transform pipeline over a file.

**Example**

```ts
import { ProcessFile } from "@beep/nlp-mcp/StreamingTools"

console.log(ProcessFile.name)
```

**Signature**

```ts
declare const ProcessFile: Tool.Tool<"stream_process_file", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly maxLines: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly stopOnError: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly stages: S.NonEmptyArray<LiteralKit<readonly ["lowercase", "normalizeWhitespace", "removePunctuation", "trim", "uppercase"], undefined>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly errors: S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly item: S.Unknown; readonly stage: S.String; }>>>; readonly durationMs: S.Finite; readonly failed: S.Finite; readonly processed: S.Finite; readonly results: S.$Array<S.Unknown>; readonly skipped: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L967)

Since v0.0.0

## ReadJsonl

Tool: read JSONL/NDJSON records from a file.

**Example**

```ts
import { ReadJsonl } from "@beep/nlp-mcp/StreamingTools"

console.log(ReadJsonl.name)
```

**Signature**

```ts
declare const ReadJsonl: Tool.Tool<"stream_read_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly collectErrors: S.optionalKey<S.Boolean>; readonly maxRecords: S.optionalKey<S.Finite>; readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L799)

Since v0.0.0

## ReadLines

Tool: read lines from a text file with optional head/tail windowing.

**Example**

```ts
import { ReadLines } from "@beep/nlp-mcp/StreamingTools"

console.log(ReadLines.name)
```

**Signature**

```ts
declare const ReadLines: Tool.Tool<"stream_read_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly encoding: S.optionalKey<LiteralKit<readonly ["ascii", "latin1", "utf-8"], undefined>>; readonly maxLines: S.optionalKey<S.Finite>; readonly skip: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly tail: S.optionalKey<S.Finite>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L714)

Since v0.0.0

## SampleJsonl

Tool: sample random JSONL records from a file.

**Example**

```ts
import { SampleJsonl } from "@beep/nlp-mcp/StreamingTools"

console.log(SampleJsonl.name)
```

**Signature**

```ts
declare const SampleJsonl: Tool.Tool<"stream_sample_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly sampleSize: S.Finite; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L862)

Since v0.0.0

## SampleLines

Tool: sample random lines from a text file.

**Example**

```ts
import { SampleLines } from "@beep/nlp-mcp/StreamingTools"

console.log(SampleLines.name)
```

**Signature**

```ts
declare const SampleLines: Tool.Tool<"stream_sample_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly sampleSize: S.Finite; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L778)

Since v0.0.0

## StreamingToolkit

The complete streaming toolkit grouping all 17 streaming tools.

**Example**

```ts
import { StreamingToolkit } from "@beep/nlp-mcp/StreamingTools"

const names = Object.keys(StreamingToolkit.tools)
console.log(names.length)
```

**Signature**

```ts
declare const StreamingToolkit: Toolkit.Toolkit<{ readonly stream_read_lines: Tool.Tool<"stream_read_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly encoding: S.optionalKey<LiteralKit<readonly ["ascii", "latin1", "utf-8"], undefined>>; readonly maxLines: S.optionalKey<S.Finite>; readonly skip: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly tail: S.optionalKey<S.Finite>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_file_info: Tool.Tool<"stream_file_info", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly exists: S.Boolean; readonly lineCount: S.optionalKey<S.Finite>; readonly sizeBytes: S.optionalKey<S.Finite>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_text_stats: Tool.Tool<"stream_text_stats", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly avgLineLength: S.Finite; readonly maxLineLength: S.Finite; readonly minLineLength: S.Finite; readonly nonEmptyLines: S.Finite; readonly totalBytes: S.Finite; readonly totalLines: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_sample_lines: Tool.Tool<"stream_sample_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly sampleSize: S.Finite; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_read_jsonl: Tool.Tool<"stream_read_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly collectErrors: S.optionalKey<S.Boolean>; readonly maxRecords: S.optionalKey<S.Finite>; readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_jsonl_stats: Tool.Tool<"stream_jsonl_stats", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly errorCount: S.Finite; readonly skippedCount: S.Finite; readonly successCount: S.Finite; readonly totalLines: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_validate_jsonl: Tool.Tool<"stream_validate_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly maxErrors: S.optionalKey<S.Finite>; readonly maxRecords: S.optionalKey<S.Finite>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_sample_jsonl: Tool.Tool<"stream_sample_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly sampleSize: S.Finite; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_load_text: Tool.Tool<"stream_load_text", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly encoding: S.optionalKey<LiteralKit<readonly ["ascii", "latin1", "utf-8"], undefined>>; readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_load_lines: Tool.Tool<"stream_load_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly maxLines: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly timeout: S.optionalKey<S.Finite>; readonly trim: S.optionalKey<S.Boolean>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_load_jsonl: Tool.Tool<"stream_load_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly maxRecords: S.optionalKey<S.Finite>; readonly skipInvalid: S.optionalKey<S.Boolean>; readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_load_json: Tool.Tool<"stream_load_json", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly location: S.String; readonly options: S.optionalKey<S.Struct<{ readonly timeout: S.optionalKey<S.Finite>; }>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly data: S.Unknown; readonly meta: S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_process_file: Tool.Tool<"stream_process_file", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly maxLines: S.optionalKey<S.Finite>; readonly skipEmpty: S.optionalKey<S.Boolean>; readonly stopOnError: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; readonly stages: S.NonEmptyArray<LiteralKit<readonly ["lowercase", "normalizeWhitespace", "removePunctuation", "trim", "uppercase"], undefined>>; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly errors: S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly item: S.Unknown; readonly stage: S.String; }>>>; readonly durationMs: S.Finite; readonly failed: S.Finite; readonly processed: S.Finite; readonly results: S.$Array<S.Unknown>; readonly skipped: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_filter_lines: Tool.Tool<"stream_filter_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly caseInsensitive: S.optionalKey<S.Boolean>; readonly invert: S.optionalKey<S.Boolean>; readonly maxLines: S.optionalKey<S.Finite>; }>>; readonly path: S.String; readonly pattern: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_extract_matches: Tool.Tool<"stream_extract_matches", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly caseInsensitive: S.optionalKey<S.Boolean>; readonly fullLines: S.optionalKey<S.Boolean>; readonly maxMatches: S.optionalKey<S.Finite>; }>>; readonly path: S.String; readonly pattern: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly lines: S.$Array<S.String>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_count_lines: Tool.Tool<"stream_count_lines", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; readonly stream_count_jsonl: Tool.Tool<"stream_count_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipInvalid: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.Finite>; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L1073)

Since v0.0.0

## StreamingToolkit (type alias)

Type of the `StreamingToolkit`.

**Example**

```ts
import { StreamingToolkit } from "@beep/nlp-mcp/StreamingTools"
import type { StreamingToolkit as StreamingToolkitType } from "@beep/nlp-mcp/StreamingTools"

const toolkit: StreamingToolkitType = StreamingToolkit
console.log(toolkit.tools)
```

**Signature**

```ts
type StreamingToolkit = typeof StreamingToolkit
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L1108)

Since v0.0.0

## TextStats

Tool: compute aggregate line-length and byte statistics for a file.

**Example**

```ts
import { TextStats } from "@beep/nlp-mcp/StreamingTools"

console.log(TextStats.name)
```

**Signature**

```ts
declare const TextStats: Tool.Tool<"stream_text_stats", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly skipEmpty: S.optionalKey<S.Boolean>; readonly trim: S.optionalKey<S.Boolean>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly avgLineLength: S.Finite; readonly maxLineLength: S.Finite; readonly minLineLength: S.Finite; readonly nonEmptyLines: S.Finite; readonly totalBytes: S.Finite; readonly totalLines: S.Finite; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L757)

Since v0.0.0

## ValidateJsonl

Tool: validate a JSONL file and collect parse errors.

**Example**

```ts
import { ValidateJsonl } from "@beep/nlp-mcp/StreamingTools"

console.log(ValidateJsonl.name)
```

**Signature**

```ts
declare const ValidateJsonl: Tool.Tool<"stream_validate_jsonl", { readonly parameters: AnnotatedSchema<S.Struct<{ readonly options: S.optionalKey<S.Struct<{ readonly maxErrors: S.optionalKey<S.Finite>; readonly maxRecords: S.optionalKey<S.Finite>; }>>; readonly path: S.String; }>>; readonly success: AnnotatedSchema<S.Struct<{ readonly count: S.Finite; readonly errors: S.optionalKey<S.$Array<AnnotatedSchema<S.Struct<{ readonly error: S.String; readonly lineNumber: S.Finite; }>>>>; readonly records: S.$Array<S.Unknown>; readonly truncated: S.Boolean; }>>; readonly failure: typeof AiToolError; readonly failureMode: "return"; }, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/StreamingTools.ts#L841)

Since v0.0.0