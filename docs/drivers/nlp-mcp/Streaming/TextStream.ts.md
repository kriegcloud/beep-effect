---
title: TextStream.ts
nav_order: 7
parent: "@beep/nlp-mcp"
---

## TextStream.ts overview

Line-oriented text streaming helpers backing the streaming file tools.

Provides memory-efficient, line-by-line access to text files using the
platform `FileSystem.FileSystem` and `Path.Path` services
(`FileSystem.stream` -\> `Stream.decodeText` -\> `Stream.splitLines`). All
operations stay platform-agnostic: a node `FileSystem`/`Path` implementation
is provided at the entrypoint, not here.

Since v0.0.0

---
## Exports Grouped by Category
- [diagnostics](#diagnostics)
  - [computeStats](#computestats)
  - [countLines](#countlines)
  - [fileExists](#fileexists)
  - [getFileSize](#getfilesize)
- [models](#models)
  - [TextEncoding](#textencoding)
  - [TextEncoding (type alias)](#textencoding-type-alias)
  - [TextReadOptions (class)](#textreadoptions-class)
  - [TextStreamOptions (class)](#textstreamoptions-class)
  - [TextStreamStats (class)](#textstreamstats-class)
- [streams](#streams)
  - [streamLines](#streamlines)
- [utilities](#utilities)
  - [head](#head)
  - [readLines](#readlines)
  - [readTextFile](#readtextfile)
  - [sampleLines](#samplelines)
  - [tail](#tail)
---

# diagnostics

## computeStats

Compute aggregate line-length and byte statistics for a text file.

The accumulator runs in a single streaming pass; `totalBytes` charges each
processed line its UTF-8 byte length plus one newline separator.

**Example**

```ts
import { computeStats } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(computeStats("/tmp/data.txt", { trim: true }))
```

**Signature**

```ts
declare const computeStats: (filePath: string, options?: TextReadOptions) => Effect.Effect<TextStreamStats, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L426)

Since v0.0.0

## countLines

Count the processed lines in a text file without buffering them.

**Example**

```ts
import { countLines } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(countLines("/tmp/data.txt"))
```

**Signature**

```ts
declare const countLines: (filePath: string, options?: TextReadOptions) => Effect.Effect<number, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L359)

Since v0.0.0

## fileExists

Report whether a path exists.

**Example**

```ts
import { fileExists } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(fileExists("/tmp/data.txt"))
```

**Signature**

```ts
declare const fileExists: (filePath: string) => Effect.Effect<boolean, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L381)

Since v0.0.0

## getFileSize

Report the size of a file in bytes.

**Example**

```ts
import { getFileSize } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(getFileSize("/tmp/data.txt"))
```

**Signature**

```ts
declare const getFileSize: (filePath: string) => Effect.Effect<number, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L403)

Since v0.0.0

# models

## TextEncoding

Text decoding labels accepted by the streaming text helpers.

**Example**

```ts
import type { TextEncoding } from "@beep/nlp-mcp/Streaming/TextStream"

const encoding: TextEncoding = "utf-8"
console.log(encoding)
```

**Signature**

```ts
declare const TextEncoding: LiteralKit<readonly ["ascii", "latin1", "utf-8"], undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L38)

Since v0.0.0

## TextEncoding (type alias)

Type for `TextEncoding`.

**Example**

```ts
import type { TextEncoding } from "@beep/nlp-mcp/Streaming/TextStream"

const encoding: TextEncoding = "latin1"
console.log(encoding)
```

**Signature**

```ts
type TextEncoding = typeof TextEncoding.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L58)

Since v0.0.0

## TextReadOptions (class)

Per-line processing options shared by the read-oriented helpers.

**Example**

```ts
import { TextReadOptions } from "@beep/nlp-mcp/Streaming/TextStream"

const options = TextReadOptions.make({ skipEmpty: true, trim: true })
console.log(options.skipEmpty)
```

**Signature**

```ts
declare class TextReadOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L76)

Since v0.0.0

## TextStreamOptions (class)

Streaming options that extend `TextReadOptions` with windowing controls.

**Example**

```ts
import { TextStreamOptions } from "@beep/nlp-mcp/Streaming/TextStream"

const options = TextStreamOptions.make({ maxLines: 10, skip: 2 })
console.log(options.maxLines)
```

**Signature**

```ts
declare class TextStreamOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L107)

Since v0.0.0

## TextStreamStats (class)

Aggregate line-length and byte statistics computed for a text file.

**Example**

```ts
import { TextStreamStats } from "@beep/nlp-mcp/Streaming/TextStream"

const stats = TextStreamStats.make({
  avgLineLength: 4,
  maxLineLength: 7,
  minLineLength: 1,
  nonEmptyLines: 2,
  totalBytes: 12,
  totalLines: 3
})
console.log(stats.totalLines)
```

**Signature**

```ts
declare class TextStreamStats
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L143)

Since v0.0.0

# streams

## streamLines

Stream a text file as a sequence of processed lines.

Bytes are decoded with the requested encoding then split on line boundaries;
`skip` and `maxLines` window the result while `trim`/`skipEmpty` shape each
emitted line. The stream surfaces the platform's `PlatformError` channel and
requires the `FileSystem.FileSystem` and `Path.Path` services.

**Example**

```ts
import * as Stream from "effect/Stream"
import { streamLines } from "@beep/nlp-mcp/Streaming/TextStream"

const lines = streamLines("/tmp/data.txt", { maxLines: 10, trim: true })
console.log(Stream.runCollect(lines))
```

**Signature**

```ts
declare const streamLines: (filePath: string, options?: TextStreamOptions) => Stream.Stream<string, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L191)

Since v0.0.0

# utilities

## head

Read the first `n` processed lines of a text file.

**Example**

```ts
import { head } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(head("/tmp/data.txt", 5))
```

**Signature**

```ts
declare const head: (filePath: string, n: number, options?: TextReadOptions) => Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L279)

Since v0.0.0

## readLines

Collect a text file into an array of processed lines.

Loads every emitted line into memory; prefer `streamLines` for large
inputs where incremental processing is sufficient.

**Example**

```ts
import { readLines } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(readLines("/tmp/data.txt", { skipEmpty: true }))
```

**Signature**

```ts
declare const readLines: (filePath: string, options?: TextStreamOptions) => Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L235)

Since v0.0.0

## readTextFile

Read an entire text file into a single decoded string.

**Example**

```ts
import { readTextFile } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(readTextFile("/tmp/data.txt"))
```

**Signature**

```ts
declare const readTextFile: (filePath: string, encoding?: "ascii" | "latin1" | "utf-8" | undefined) => Effect.Effect<string, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L257)

Since v0.0.0

## sampleLines

Sample up to `sampleSize` processed lines uniformly at random.

When the file has at most `sampleSize` processed lines they are returned in
order; otherwise a deterministic-by-`Random` shuffle selects the sample,
which is then re-sorted into original document order.

**Example**

```ts
import { sampleLines } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(sampleLines("/tmp/data.txt", 3))
```

**Signature**

```ts
declare const sampleLines: (filePath: string, sampleSize: number, options?: TextReadOptions | undefined) => Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L327)

Since v0.0.0

## tail

Read the last `n` processed lines of a text file.

**Example**

```ts
import { tail } from "@beep/nlp-mcp/Streaming/TextStream"

console.log(tail("/tmp/data.txt", 5))
```

**Signature**

```ts
declare const tail: (filePath: string, n: number, options?: TextReadOptions) => Effect.Effect<ReadonlyArray<string>, PlatformError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/nlp-mcp/src/Streaming/TextStream.ts#L299)

Since v0.0.0