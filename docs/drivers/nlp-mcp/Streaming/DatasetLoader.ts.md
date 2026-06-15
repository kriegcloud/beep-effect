---
title: DatasetLoader.ts
nav_order: 4
parent: "@beep/nlp-mcp"
---

## DatasetLoader.ts overview

Dataset loading helpers backing the streaming dataset tools.

Loads text, line, JSONL, or JSON datasets from either a local file (via
`TextStream`) or a remote `http(s)` URL (via the `HttpClient`
service, provided at the entrypoint). Remote reads are bounded by
`Effect.timeout`; JSON payloads are parsed with
`S.UnknownFromJsonString` rather than raw `JSON.parse`. Each loader
returns the data alongside a `DatasetMeta` record describing provenance,
and the load timestamp comes from `Clock.currentTimeMillis`.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [loadJson](#loadjson)
  - [loadJsonl](#loadjsonl)
  - [loadLines](#loadlines)
  - [loadText](#loadtext)
- [errors](#errors)
  - [DatasetLoadError (class)](#datasetloaderror-class)
- [models](#models)
  - [DatasetFormat](#datasetformat)
  - [DatasetFormat (type alias)](#datasetformat-type-alias)
  - [DatasetMeta (class)](#datasetmeta-class)
  - [DatasetResult (type alias)](#datasetresult-type-alias)
  - [DatasetSourceType](#datasetsourcetype)
  - [DatasetSourceType (type alias)](#datasetsourcetype-type-alias)
- [predicates](#predicates)
  - [isUrl](#isurl)
- [schemas](#schemas)
  - [DatasetResult](#datasetresult)
---

# constructors

## loadJson

Load and parse a single JSON document from a file or remote URL.

**Example**

```ts
import { loadJson } from "@beep/nlp-mcp/Streaming/DatasetLoader"

console.log(loadJson("/tmp/data.json"))
```

**Signature**

```ts
declare const loadJson: (location: string, options?: { readonly timeout?: number | undefined; } | undefined) => Effect.Effect<{ readonly data: unknown; readonly meta: DatasetMeta; }, DatasetLoadError | PlatformError, FileSystem | HttpClient.HttpClient | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L529)

Since v0.0.0

## loadJsonl

Load a JSONL dataset as an array of parsed records from a file or remote URL.

Blank lines are skipped. When `skipInvalid` is `true` lines that fail to parse
are dropped; otherwise the first malformed line fails the effect.

**Example**

```ts
import { loadJsonl } from "@beep/nlp-mcp/Streaming/DatasetLoader"

console.log(loadJsonl("/tmp/data.jsonl", { skipInvalid: true }))
```

**Signature**

```ts
declare const loadJsonl: (location: string, options?: { readonly skipInvalid?: boolean | undefined; readonly timeout?: number | undefined; } | undefined) => Effect.Effect<{ readonly data: ReadonlyArray<unknown>; readonly meta: DatasetMeta; }, DatasetLoadError | PlatformError, FileSystem | HttpClient.HttpClient | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L478)

Since v0.0.0

## loadLines

Load a dataset as an array of lines from a file or remote URL.

**Example**

```ts
import { loadLines } from "@beep/nlp-mcp/Streaming/DatasetLoader"

console.log(loadLines("/tmp/data.txt", { skipEmpty: true }))
```

**Signature**

```ts
declare const loadLines: (location: string, options?: { readonly skipEmpty?: boolean | undefined; readonly timeout?: number | undefined; readonly trim?: boolean | undefined; } | undefined) => Effect.Effect<{ readonly data: ReadonlyArray<string>; readonly meta: DatasetMeta; }, DatasetLoadError | PlatformError, FileSystem | HttpClient.HttpClient | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L409)

Since v0.0.0

## loadText

Load raw text from a file or remote URL.

**Example**

```ts
import { loadText } from "@beep/nlp-mcp/Streaming/DatasetLoader"

console.log(loadText("/tmp/data.txt"))
```

**Signature**

```ts
declare const loadText: (location: string, options?: { readonly encoding?: TextEncoding | undefined; readonly timeout?: number | undefined; } | undefined) => Effect.Effect<{ readonly data: string; readonly meta: DatasetMeta; }, DatasetLoadError | PlatformError, FileSystem | HttpClient.HttpClient | Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L358)

Since v0.0.0

# errors

## DatasetLoadError (class)

Structured failure raised when a remote fetch or JSON decode fails.

**Example**

```ts
import { DatasetLoadError } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const error = DatasetLoadError.make({ location: "https://example.com/data.json", message: "failed" })
console.log(error._tag)
```

**Signature**

```ts
declare class DatasetLoadError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L220)

Since v0.0.0

# models

## DatasetFormat

Dataset formats supported by the file and URL loaders.

**Example**

```ts
import type { DatasetFormat } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const format: DatasetFormat = "jsonl"
console.log(format)
```

**Signature**

```ts
declare const DatasetFormat: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L45)

Since v0.0.0

## DatasetFormat (type alias)

Type for `DatasetFormat`.

**Example**

```ts
import type { DatasetFormat } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const format: DatasetFormat = "text"
console.log(format)
```

**Signature**

```ts
type DatasetFormat = typeof DatasetFormat.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L65)

Since v0.0.0

## DatasetMeta (class)

Provenance metadata returned alongside every loaded dataset.

**Example**

```ts
import { DatasetMeta } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const meta = DatasetMeta.make({
  format: "text",
  loadedAt: 0,
  location: "/tmp/data.txt",
  sourceType: "file"
})
console.log(meta.location)
```

**Signature**

```ts
declare class DatasetMeta
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L122)

Since v0.0.0

## DatasetResult (type alias)

Type for `DatasetResult`.

**Example**

```ts
import type { DatasetResult } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const result: DatasetResult<string> = {
  data: "hello",
  meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
}
console.log(result.data)
```

**Signature**

```ts
type { readonly data: A; readonly meta: DatasetMeta; } = S.Schema.Type<ReturnType<typeof DatasetResult<S.Schema<A>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L204)

Since v0.0.0

## DatasetSourceType

Provenance source channels supported by dataset loaders.

**Example**

```ts
import type { DatasetSourceType } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const sourceType: DatasetSourceType = "file"
console.log(sourceType)
```

**Signature**

```ts
declare const DatasetSourceType: LiteralKit<readonly ["file", "url"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L81)

Since v0.0.0

## DatasetSourceType (type alias)

Type for `DatasetSourceType`.

**Example**

```ts
import type { DatasetSourceType } from "@beep/nlp-mcp/Streaming/DatasetLoader"

const sourceType: DatasetSourceType = "url"
console.log(sourceType)
```

**Signature**

```ts
type DatasetSourceType = typeof DatasetSourceType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L101)

Since v0.0.0

# predicates

## isUrl

Report whether a location should be treated as a remote `http(s)` URL.

**Example**

```ts
import { isUrl } from "@beep/nlp-mcp/Streaming/DatasetLoader"

console.log(isUrl("https://example.com/data.txt"))
```

**Signature**

```ts
declare const isUrl: (location: string) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L262)

Since v0.0.0

# schemas

## DatasetResult

A loaded dataset payload paired with its `DatasetMeta`.

**Example**

```ts
import { DatasetResult } from "@beep/nlp-mcp/Streaming/DatasetLoader"
import * as S from "effect/Schema"

const TextDataset = DatasetResult(S.String)
const result = TextDataset.make({
  data: "hello",
  meta: { format: "text", loadedAt: 0, location: "/tmp/data.txt", sourceType: "file" }
})
console.log(result.data)
```

**Signature**

```ts
declare const DatasetResult: <Data extends S.Top>(data: Data) => S.Class<{ readonly data: Data["Type"]; readonly meta: DatasetMeta; }, S.Struct<{ readonly data: Data["Rebuild"]; readonly meta: S.decodeTo<S.declareConstructor<DatasetMeta, { readonly format: "json" | "jsonl" | "lines" | "text"; readonly loadedAt: number; readonly location: string; readonly sourceType: "file" | "url"; readonly sizeBytes?: number | undefined; }, readonly [S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>], { readonly format: "json" | "jsonl" | "lines" | "text"; readonly loadedAt: number; readonly location: string; readonly sourceType: "file" | "url"; readonly sizeBytes?: number | undefined; }>, S.Struct<{ readonly format: LiteralKit<readonly ["json", "jsonl", "lines", "text"], undefined>; readonly loadedAt: S.Finite; readonly location: S.String; readonly sizeBytes: S.optionalKey<S.Finite>; readonly sourceType: LiteralKit<readonly ["file", "url"], undefined>; }>, never, never>; }>, {}>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/DatasetLoader.ts#L169)

Since v0.0.0