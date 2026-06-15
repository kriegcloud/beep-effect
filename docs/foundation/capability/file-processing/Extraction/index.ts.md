---
title: index.ts
nav_order: 2
parent: "@beep/file-processing"
---

## index.ts overview

Extraction result and manifest schemas for file processing.

Since v0.0.0

---
## Exports Grouped by Category
- [codecs](#codecs)
  - [encodeChildArtifactRecordJson](#encodechildartifactrecordjson)
  - [encodeFileProcessingCoverageSummaryJson](#encodefileprocessingcoveragesummaryjson)
  - [encodeFileProcessingFailureRecordJson](#encodefileprocessingfailurerecordjson)
  - [encodeProcessRunManifestJson](#encodeprocessrunmanifestjson)
  - [encodeSourceProcessingRecordJson](#encodesourceprocessingrecordjson)
- [models](#models)
  - [ArchiveExportProcessFileResult (class)](#archiveexportprocessfileresult-class)
  - [ArchiveExportResult (class)](#archiveexportresult-class)
  - [ChildArtifactRecord (class)](#childartifactrecord-class)
  - [ExtractedProcessFileResult (class)](#extractedprocessfileresult-class)
  - [ExtractionResult (class)](#extractionresult-class)
  - [FailedFileProcessingFailureRecord (class)](#failedfileprocessingfailurerecord-class)
  - [FailedSourceProcessingRecord (class)](#failedsourceprocessingrecord-class)
  - [FileProcessingCoverageSummary (class)](#fileprocessingcoveragesummary-class)
  - [FileProcessingFailureReason (type alias)](#fileprocessingfailurereason-type-alias)
  - [FileProcessingFailureRecord](#fileprocessingfailurerecord)
  - [FileProcessingFailureRecord (type alias)](#fileprocessingfailurerecord-type-alias)
  - [ProcessFileResult](#processfileresult)
  - [ProcessFileResult (type alias)](#processfileresult-type-alias)
  - [ProcessRunManifest (class)](#processrunmanifest-class)
  - [SkippedFileProcessingFailureRecord (class)](#skippedfileprocessingfailurerecord-class)
  - [SkippedProcessFileResult (class)](#skippedprocessfileresult-class)
  - [SkippedSourceProcessingRecord (class)](#skippedsourceprocessingrecord-class)
  - [SourceProcessingRecord](#sourceprocessingrecord)
  - [SourceProcessingRecord (type alias)](#sourceprocessingrecord-type-alias)
  - [SourceProcessingStatus (type alias)](#sourceprocessingstatus-type-alias)
  - [SucceededSourceProcessingRecord (class)](#succeededsourceprocessingrecord-class)
  - [TextArtifactReference (class)](#textartifactreference-class)
  - [TextSpan (class)](#textspan-class)
- [schemas](#schemas)
  - [FileProcessingFailureReason](#fileprocessingfailurereason)
  - [SourceProcessingStatus](#sourceprocessingstatus)
---

# codecs

## encodeChildArtifactRecordJson

JSONL encoder for `ChildArtifactRecord`.

**Example**

```ts
import { ArtifactId, ArtifactReference } from "@beep/file-processing/Artifact"
import { ChildArtifactRecord, encodeChildArtifactRecordJson } from "@beep/file-processing/Extraction"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("children/message.txt")
  const child = ArtifactReference.make({
    id: artifactId,
    mediaType: "text/plain",
    relativePath,
    sizeBytes: NonNegativeInt.make(12)
  })

  return yield* encodeChildArtifactRecordJson(ChildArtifactRecord.make({ child, sourceArtifactId: artifactId }))
})

Effect.runPromise(program).then((json) => console.log(json.includes("children/message.txt"))) // true
```

**Signature**

```ts
declare const encodeChildArtifactRecordJson: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L984)

Since v0.0.0

## encodeFileProcessingCoverageSummaryJson

JSON encoder for `FileProcessingCoverageSummary`.

**Example**

```ts
import { encodeFileProcessingCoverageSummaryJson, FileProcessingCoverageSummary } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const formats = [
  "doc", "docx", "docm", "rtf", "html", "xhtml", "pdf-text-layer",
  "pst", "plain-text", "markdown", "image-metadata", "xls", "xlsx", "unknown"
]
const statusCounts = { succeeded: 0, skipped: 0, failed: 0 }

const program = Effect.gen(function* () {
  const coverage = yield* S.decodeUnknownEffect(FileProcessingCoverageSummary)({
    byFormat: Object.fromEntries(formats.map((format) => [format, statusCounts])),
    failedCount: 0,
    skippedCount: 0,
    sourceCount: 0,
    succeededCount: 0,
    textArtifactCount: 0
  })

  return yield* encodeFileProcessingCoverageSummaryJson(coverage)
})

Effect.runPromise(program).then((json) => console.log(json.includes("\"sourceCount\":0"))) // true
```

**Signature**

```ts
declare const encodeFileProcessingCoverageSummaryJson: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L875)

Since v0.0.0

## encodeFileProcessingFailureRecordJson

JSONL encoder for `FileProcessingFailureRecord`.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { encodeFileProcessingFailureRecordJson, SkippedFileProcessingFailureRecord } from "@beep/file-processing/Extraction"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("table.xls")

  return yield* encodeFileProcessingFailureRecordJson(SkippedFileProcessingFailureRecord.make({
    artifactId,
    format: "xls",
    message: "XLS is classified but extraction is deferred in V1.",
    operationId,
    reason: "format-out-of-scope",
    relativePath,
    status: "skipped"
  }))
})

Effect.runPromise(program).then((json) => console.log(json.includes("\"status\":\"skipped\""))) // true
```

**Signature**

```ts
declare const encodeFileProcessingFailureRecordJson: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L949)

Since v0.0.0

## encodeProcessRunManifestJson

JSON encoder for `ProcessRunManifest`.

**Example**

```ts
import { OperationId } from "@beep/file-processing/Artifact"
import { encodeProcessRunManifestJson, ProcessRunManifest } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const formats = [
  "doc", "docx", "docm", "rtf", "html", "xhtml", "pdf-text-layer",
  "pst", "plain-text", "markdown", "image-metadata", "xls", "xlsx", "unknown"
]
const statusCounts = { succeeded: 0, skipped: 0, failed: 0 }

const program = Effect.gen(function* () {
  const runId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const manifest = yield* S.decodeUnknownEffect(ProcessRunManifest)({
    coverage: {
      byFormat: Object.fromEntries(formats.map((format) => [format, statusCounts])),
      failedCount: 0,
      skippedCount: 0,
      sourceCount: 0,
      succeededCount: 0,
      textArtifactCount: 0
    },
    engine: "test",
    manifestVersion: "beep.file-processing.run.v1",
    outputRoot: ".",
    runId,
    sourceRootLabel: "input",
    strategies: []
  })

  return yield* encodeProcessRunManifestJson(manifest)
})

Effect.runPromise(program).then((json) => console.log(json.includes("\"outputRoot\":\".\""))) // true
```

**Signature**

```ts
declare const encodeProcessRunManifestJson: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L839)

Since v0.0.0

## encodeSourceProcessingRecordJson

JSONL encoder for `SourceProcessingRecord`.

**Example**

```ts
import { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact"
import { encodeSourceProcessingRecordJson, SucceededSourceProcessingRecord } from "@beep/file-processing/Extraction"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("note.txt")

  return yield* encodeSourceProcessingRecordJson(SucceededSourceProcessingRecord.make({
    artifactId,
    digest,
    format: "plain-text",
    operationId,
    relativePath,
    sizeBytes: NonNegativeInt.make(4),
    status: "succeeded"
  }))
})

Effect.runPromise(program).then((json) => console.log(json.includes("\"status\":\"succeeded\""))) // true
```

**Signature**

```ts
declare const encodeSourceProcessingRecordJson: (input: unknown, options?: ParseOptions) => Effect<string, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L914)

Since v0.0.0

# models

## ArchiveExportProcessFileResult (class)

Successful archive export result of a full source processing operation.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { ArchiveExportProcessFileResult, ArchiveExportResult } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const archiveExport = ArchiveExportResult.make({
    children: [],
    engine: "libpff",
    operationId,
    sourceArtifactId: artifactId,
    warnings: []
  })

  return ArchiveExportProcessFileResult.make({
    archiveExport,
    engine: "libpff",
    format: "pst",
    operationId,
    resultKind: "archive-exported",
    sourceArtifactId: artifactId,
    warnings: []
  }).resultKind
})

Effect.runPromise(program).then(console.log) // "archive-exported"
```

**Signature**

```ts
declare class ArchiveExportProcessFileResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L240)

Since v0.0.0

## ArchiveExportResult (class)

Archive export result.

**Example**

```ts
import { ArchiveExportResult } from "@beep/file-processing/Extraction"

console.log(ArchiveExportResult)
```

**Signature**

```ts
declare class ArchiveExportResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L134)

Since v0.0.0

## ChildArtifactRecord (class)

Child artifact row written to children/<source-artifact-id>/artifacts.jsonl.

**Example**

```ts
import { ChildArtifactRecord } from "@beep/file-processing/Extraction"

console.log(ChildArtifactRecord)
```

**Signature**

```ts
declare class ChildArtifactRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L728)

Since v0.0.0

## ExtractedProcessFileResult (class)

Successful extraction result of a full source processing operation.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { ExtractedProcessFileResult, ExtractionResult } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const extraction = ExtractionResult.make({
    engine: "beep-test",
    format: "markdown",
    metadata: {},
    operationId,
    sourceArtifactId: artifactId,
    text: "hello",
    warnings: []
  })

  return ExtractedProcessFileResult.make({
    engine: "beep-test",
    extraction,
    format: "markdown",
    operationId,
    resultKind: "extracted",
    sourceArtifactId: artifactId,
    warnings: []
  }).resultKind
})

Effect.runPromise(program).then(console.log) // "extracted"
```

**Signature**

```ts
declare class ExtractedProcessFileResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L187)

Since v0.0.0

## ExtractionResult (class)

Text and metadata extraction result.

**Example**

```ts
import { ExtractionResult } from "@beep/file-processing/Extraction"

console.log(ExtractionResult)
```

**Signature**

```ts
declare class ExtractionResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L105)

Since v0.0.0

## FailedFileProcessingFailureRecord (class)

Hard failure row written to failures.jsonl.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { FailedFileProcessingFailureRecord } from "@beep/file-processing/Extraction"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("mystery.bin")

  return FailedFileProcessingFailureRecord.make({
    artifactId,
    format: "unknown",
    message: "No engine could classify the source.",
    operationId,
    reason: "unsupported-file-format",
    relativePath,
    status: "failed"
  }).reason
})

Effect.runPromise(program).then(console.log) // "unsupported-file-format"
```

**Signature**

```ts
declare class FailedFileProcessingFailureRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L666)

Since v0.0.0

## FailedSourceProcessingRecord (class)

Failed source row written to sources.jsonl.

**Example**

```ts
import { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact"
import { FailedSourceProcessingRecord } from "@beep/file-processing/Extraction"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("broken.bin")

  return FailedSourceProcessingRecord.make({
    artifactId,
    digest,
    format: "unknown",
    operationId,
    relativePath,
    sizeBytes: NonNegativeInt.make(0),
    status: "failed"
  }).status
})

Effect.runPromise(program).then(console.log) // "failed"
```

**Signature**

```ts
declare class FailedSourceProcessingRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L502)

Since v0.0.0

## FileProcessingCoverageSummary (class)

Coverage summary written to coverage.json.

**Example**

```ts
import { FileProcessingCoverageSummary } from "@beep/file-processing/Extraction"

console.log(FileProcessingCoverageSummary)
```

**Signature**

```ts
declare class FileProcessingCoverageSummary
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L751)

Since v0.0.0

## FileProcessingFailureReason (type alias)

Type for `FileProcessingFailureReason`.

**Signature**

```ts
type FileProcessingFailureReason = typeof FileProcessingFailureReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L600)

Since v0.0.0

## FileProcessingFailureRecord

Failure row written to failures.jsonl.

**Example**

```ts
import { FileProcessingFailureRecord } from "@beep/file-processing/Extraction"

console.log(FileProcessingFailureRecord)
```

**Signature**

```ts
declare const FileProcessingFailureRecord: AnnotatedSchema<S.Union<readonly [typeof SkippedFileProcessingFailureRecord, typeof FailedFileProcessingFailureRecord]> & TaggedUnionUtils<"status", readonly [typeof SkippedFileProcessingFailureRecord, typeof FailedFileProcessingFailureRecord], [typeof SkippedFileProcessingFailureRecord, typeof FailedFileProcessingFailureRecord]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L697)

Since v0.0.0

## FileProcessingFailureRecord (type alias)

Type for `FileProcessingFailureRecord`.

**Signature**

```ts
type FileProcessingFailureRecord = typeof FileProcessingFailureRecord.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L713)

Since v0.0.0

## ProcessFileResult

Result of a full source processing operation.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { ProcessFileResult } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

  return yield* S.decodeUnknownEffect(ProcessFileResult)({
    engine: "beep-test",
    format: "xls",
    operationId,
    resultKind: "skipped",
    skipReason: "format-out-of-scope",
    sourceArtifactId: artifactId,
    warnings: []
  })
})

Effect.runPromise(program).then((result) => console.log(result.resultKind)) // "skipped"
```

**Signature**

```ts
declare const ProcessFileResult: AnnotatedSchema<S.Union<readonly [typeof ExtractedProcessFileResult, typeof ArchiveExportProcessFileResult, typeof SkippedProcessFileResult]> & TaggedUnionUtils<"resultKind", readonly [typeof ExtractedProcessFileResult, typeof ArchiveExportProcessFileResult, typeof SkippedProcessFileResult], [typeof ExtractedProcessFileResult, typeof ArchiveExportProcessFileResult, typeof SkippedProcessFileResult]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L335)

Since v0.0.0

## ProcessFileResult (type alias)

Type for `ProcessFileResult`.

**Signature**

```ts
type ProcessFileResult = typeof ProcessFileResult.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L352)

Since v0.0.0

## ProcessRunManifest (class)

Top-level run manifest written to run.json.

**Example**

```ts
import { ProcessRunManifest } from "@beep/file-processing/Extraction"

console.log(ProcessRunManifest)
```

**Signature**

```ts
declare class ProcessRunManifest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L780)

Since v0.0.0

## SkippedFileProcessingFailureRecord (class)

Skipped row written to failures.jsonl.

**Example**

```ts
import { SkippedFileProcessingFailureRecord } from "@beep/file-processing/Extraction"

console.log(SkippedFileProcessingFailureRecord)
```

**Signature**

```ts
declare class SkippedFileProcessingFailureRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L615)

Since v0.0.0

## SkippedProcessFileResult (class)

Intentional skip result of a full source processing operation.

**Example**

```ts
import { ArtifactId, OperationId } from "@beep/file-processing/Artifact"
import { SkippedProcessFileResult } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const result = SkippedProcessFileResult.make({
    engine: "beep-test",
    format: "xls",
    operationId,
    resultKind: "skipped",
    skipReason: "format-out-of-scope",
    sourceArtifactId: artifactId,
    warnings: []
  })

  return result.skipReason
})

Effect.runPromise(program).then(console.log) // "format-out-of-scope"
```

**Signature**

```ts
declare class SkippedProcessFileResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L289)

Since v0.0.0

## SkippedSourceProcessingRecord (class)

Skipped source row written to sources.jsonl.

**Example**

```ts
import { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact"
import { SkippedSourceProcessingRecord } from "@beep/file-processing/Extraction"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("table.xls")

  return SkippedSourceProcessingRecord.make({
    artifactId,
    digest,
    engine: "beep-test",
    format: "xls",
    operationId,
    relativePath,
    sizeBytes: NonNegativeInt.make(64),
    skipReason: "format-out-of-scope",
    status: "skipped"
  }).skipReason
})

Effect.runPromise(program).then(console.log) // "format-out-of-scope"
```

**Signature**

```ts
declare class SkippedSourceProcessingRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L448)

Since v0.0.0

## SourceProcessingRecord

Source row written to sources.jsonl.

**Example**

```ts
import { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact"
import { SourceProcessingRecord } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")

  return yield* S.decodeUnknownEffect(SourceProcessingRecord)({
    artifactId,
    digest,
    format: "markdown",
    operationId,
    relativePath: "README.md",
    sizeBytes: 11,
    status: "succeeded"
  })
})

Effect.runPromise(program).then((record) => console.log(record.status)) // "succeeded"
```

**Signature**

```ts
declare const SourceProcessingRecord: AnnotatedSchema<S.Union<readonly [typeof SucceededSourceProcessingRecord, typeof SkippedSourceProcessingRecord, typeof FailedSourceProcessingRecord]> & TaggedUnionUtils<"status", readonly [typeof SucceededSourceProcessingRecord, typeof SkippedSourceProcessingRecord, typeof FailedSourceProcessingRecord], [typeof SucceededSourceProcessingRecord, typeof SkippedSourceProcessingRecord, typeof FailedSourceProcessingRecord]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L552)

Since v0.0.0

## SourceProcessingRecord (type alias)

Type for `SourceProcessingRecord`.

**Signature**

```ts
type SourceProcessingRecord = typeof SourceProcessingRecord.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L569)

Since v0.0.0

## SourceProcessingStatus (type alias)

Type for `SourceProcessingStatus`.

**Signature**

```ts
type SourceProcessingStatus = typeof SourceProcessingStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L43)

Since v0.0.0

## SucceededSourceProcessingRecord (class)

Succeeded source row written to sources.jsonl.

**Example**

```ts
import { ArtifactId, ContentDigest, OperationId } from "@beep/file-processing/Artifact"
import { SucceededSourceProcessingRecord } from "@beep/file-processing/Extraction"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("README.md")
  const textPath = yield* S.decodeUnknownEffect(PosixPath)("text/example.txt")

  return SucceededSourceProcessingRecord.make({
    artifactId,
    digest,
    engine: "beep-test",
    format: "markdown",
    operationId,
    relativePath,
    sizeBytes: NonNegativeInt.make(11),
    status: "succeeded",
    textPath
  }).status
})

Effect.runPromise(program).then(console.log) // "succeeded"
```

**Signature**

```ts
declare class SucceededSourceProcessingRecord
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L392)

Since v0.0.0

## TextArtifactReference (class)

Materialized text artifact reference.

**Example**

```ts
import { TextArtifactReference } from "@beep/file-processing/Extraction"

console.log(TextArtifactReference)
```

**Signature**

```ts
declare class TextArtifactReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L58)

Since v0.0.0

## TextSpan (class)

Text span emitted by a text extraction operation.

**Example**

```ts
import { TextSpan } from "@beep/file-processing/Extraction"

console.log(TextSpan)
```

**Signature**

```ts
declare class TextSpan
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L81)

Since v0.0.0

# schemas

## FileProcessingFailureReason

Machine-readable failure row reason.

**Example**

```ts
import { FileProcessingFailureReason } from "@beep/file-processing/Extraction"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = S.decodeUnknownEffect(FileProcessingFailureReason)("format-out-of-scope")

Effect.runPromise(program).then(console.log) // "format-out-of-scope"
```

**Signature**

```ts
declare const FileProcessingFailureReason: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<LiteralKit<readonly ["file-detection-failed", "unsupported-file-format", "file-extraction-failed", "archive-export-failed", "engine-unavailable", "operation-timed-out", "output-limit-exceeded"], undefined>>, AnnotatedSchema<LiteralKit<readonly ["engine-unavailable", "encrypted-source", "fixture-unavailable", "format-out-of-scope", "ocr-disabled", "output-budget-exceeded", "unsupported-format", "operation-not-required"], undefined>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L588)

Since v0.0.0

## SourceProcessingStatus

Processing status emitted for each source row.

**Example**

```ts
import { SourceProcessingStatus } from "@beep/file-processing/Extraction"

console.log(SourceProcessingStatus)
```

**Signature**

```ts
declare const SourceProcessingStatus: AnnotatedSchema<LiteralKit<readonly ["succeeded", "skipped", "failed"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Extraction/index.ts#L31)

Since v0.0.0