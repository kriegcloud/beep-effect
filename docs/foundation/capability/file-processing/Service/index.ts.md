---
title: index.ts
nav_order: 5
parent: "@beep/file-processing"
---

## index.ts overview

Effect service contracts for runtime-neutral file processing.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [makeFileProcessingServiceLayer](#makefileprocessingservicelayer)
- [services](#services)
  - [FileProcessingEngineShape (type alias)](#fileprocessingengineshape-type-alias)
  - [FileProcessingService (class)](#fileprocessingservice-class)
  - [FileProcessingServiceShape (type alias)](#fileprocessingserviceshape-type-alias)
- [use-cases](#use-cases)
  - [detectFile](#detectfile)
  - [exportArchive](#exportarchive)
  - [extractFile](#extractfile)
  - [processFile](#processfile)
---

# layers

## makeFileProcessingServiceLayer

Build a runtime-neutral file-processing service layer from concrete drivers.

**Example**

```ts
import { makeFileProcessingServiceLayer } from "@beep/file-processing/Service"

const layer = makeFileProcessingServiceLayer([])
console.log(layer)
```

**Signature**

```ts
declare const makeFileProcessingServiceLayer: (engines: ReadonlyArray<FileProcessingEngineShape>) => Layer.Layer<FileProcessingService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L196)

Since v0.0.0

# services

## FileProcessingEngineShape (type alias)

Runtime-neutral file-processing engine shape implemented by drivers.

**Example**

```ts
import type { FileProcessingEngineShape } from "@beep/file-processing/Service"

const engine = {} as FileProcessingEngineShape
console.log(engine)
```

**Signature**

```ts
type FileProcessingEngineShape = {
  readonly descriptor: FileProcessingEngineDescriptor;
  readonly detect: (operation: DetectFileOperation) => Effect.Effect<DetectionResult, FileProcessingOperationError>;
  readonly exportArchive: (
    operation: ExportArchiveOperation
  ) => Effect.Effect<ArchiveExportResult, FileProcessingOperationError>;
  readonly extract: (operation: ExtractFileOperation) => Effect.Effect<ExtractionResult, FileProcessingOperationError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L51)

Since v0.0.0

## FileProcessingService (class)

File-processing service tag.

**Example**

```ts
import { FileProcessingService } from "@beep/file-processing/Service"

console.log(FileProcessingService)
```

**Signature**

```ts
declare class FileProcessingService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L96)

Since v0.0.0

## FileProcessingServiceShape (type alias)

Service contract exposed by the file-processing capability.

**Example**

```ts
import type { FileProcessingServiceShape } from "@beep/file-processing/Service"

const service = {} as FileProcessingServiceShape
console.log(service)
```

**Signature**

```ts
type FileProcessingServiceShape = {
  readonly detect: (operation: DetectFileOperation) => Effect.Effect<DetectionResult, FileProcessingOperationError>;
  readonly exportArchive: (
    operation: ExportArchiveOperation
  ) => Effect.Effect<ArchiveExportResult, FileProcessingOperationError>;
  readonly extract: (operation: ExtractFileOperation) => Effect.Effect<ExtractionResult, FileProcessingOperationError>;
  readonly process: (operation: ProcessFileOperation) => Effect.Effect<ProcessFileResult, FileProcessingOperationError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L74)

Since v0.0.0

# use-cases

## detectFile

Detect a source artifact with the configured service.

**Example**

```ts
import { ArtifactId, ArtifactLocator, ContentDigest, SourceArtifact, OperationId } from "@beep/file-processing/Artifact"
import { DetectFileOperation } from "@beep/file-processing/Operation"
import { detectFile, makeFileProcessingServiceLayer } from "@beep/file-processing/Service"
import { TestFileProcessingEngine } from "@beep/file-processing/test"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("README.md")
  const source = SourceArtifact.make({
    digest,
    extension: "md",
    id: artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: "README.md",
    relativePath,
    sizeBytes: NonNegativeInt.make(11),
    text: "hello"
  })

  return yield* detectFile(DetectFileOperation.make({
    operationId,
    operationKind: "detect",
    preference: { engine: "test" },
    source
  })).pipe(Effect.provide(makeFileProcessingServiceLayer([TestFileProcessingEngine])))
})

Effect.runPromise(program).then((result) => console.log(result.format)) // "markdown"
```

**Signature**

```ts
declare const detectFile: (operation: DetectFileOperation) => Effect.Effect<DetectionResult, OperationError, FileProcessingService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L333)

Since v0.0.0

## exportArchive

Export child artifacts from an archive source with the configured service.

**Example**

```ts
import { ArtifactId, ArtifactLocator, ContentDigest, SourceArtifact, OperationId } from "@beep/file-processing/Artifact"
import { ExportArchiveOperation } from "@beep/file-processing/Operation"
import { exportArchive, makeFileProcessingServiceLayer } from "@beep/file-processing/Service"
import { TestFileProcessingEngine } from "@beep/file-processing/test"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("mailbox.pst")
  const source = SourceArtifact.make({
    digest,
    extension: "pst",
    id: artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: "mailbox.pst",
    relativePath,
    sizeBytes: NonNegativeInt.make(128)
  })

  return yield* exportArchive(ExportArchiveOperation.make({
    format: "pst",
    operationId,
    operationKind: "export-archive",
    preference: { engine: "test" },
    source
  })).pipe(Effect.provide(makeFileProcessingServiceLayer([TestFileProcessingEngine])))
})

Effect.runPromise(program).then((result) => console.log(result.children.length)) // 1
```

**Signature**

```ts
declare const exportArchive: (operation: ExportArchiveOperation) => Effect.Effect<ArchiveExportResult, OperationError, FileProcessingService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L438)

Since v0.0.0

## extractFile

Extract text and metadata from a source artifact with the configured service.

**Example**

```ts
import { ArtifactId, ArtifactLocator, ContentDigest, SourceArtifact, OperationId } from "@beep/file-processing/Artifact"
import { ExtractFileOperation } from "@beep/file-processing/Operation"
import { extractFile, makeFileProcessingServiceLayer } from "@beep/file-processing/Service"
import { TestFileProcessingEngine } from "@beep/file-processing/test"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("note.txt")
  const source = SourceArtifact.make({
    digest,
    extension: "txt",
    id: artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: "note.txt",
    relativePath,
    sizeBytes: NonNegativeInt.make(5),
    text: "hello"
  })

  return yield* extractFile(ExtractFileOperation.make({
    format: "plain-text",
    operationId,
    operationKind: "extract",
    preference: { engine: "test" },
    source
  })).pipe(Effect.provide(makeFileProcessingServiceLayer([TestFileProcessingEngine])))
})

Effect.runPromise(program).then((result) => console.log(result.text)) // "hello"
```

**Signature**

```ts
declare const extractFile: (operation: ExtractFileOperation) => Effect.Effect<ExtractionResult, OperationError, FileProcessingService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L386)

Since v0.0.0

## processFile

Process a source artifact with the configured service.

**Example**

```ts
import { ArtifactId, ArtifactLocator, ContentDigest, SourceArtifact, OperationId } from "@beep/file-processing/Artifact"
import { ProcessFileOperation } from "@beep/file-processing/Operation"
import { makeFileProcessingServiceLayer, processFile } from "@beep/file-processing/Service"
import { TestFileProcessingEngine } from "@beep/file-processing/test"
import { NonNegativeInt } from "@beep/schema"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const artifactId = yield* S.decodeUnknownEffect(ArtifactId)("artifact:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const digest = yield* S.decodeUnknownEffect(ContentDigest)("sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const operationId = yield* S.decodeUnknownEffect(OperationId)("operation:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
  const relativePath = yield* S.decodeUnknownEffect(PosixPath)("note.txt")
  const source = SourceArtifact.make({
    digest,
    extension: "txt",
    id: artifactId,
    locator: ArtifactLocator.make({ kind: "synthetic", value: relativePath }),
    name: "note.txt",
    relativePath,
    sizeBytes: NonNegativeInt.make(5),
    text: "hello"
  })

  return yield* processFile(ProcessFileOperation.make({
    exportChildren: false,
    operationId,
    operationKind: "process",
    preference: { engine: "test" },
    source
  })).pipe(Effect.provide(makeFileProcessingServiceLayer([TestFileProcessingEngine])))
})

Effect.runPromise(program).then((result) => console.log(result.resultKind)) // "extracted"
```

**Signature**

```ts
declare const processFile: (operation: ProcessFileOperation) => Effect.Effect<ExtractedProcessFileResult | ArchiveExportProcessFileResult | SkippedProcessFileResult, OperationError, FileProcessingService>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Service/index.ts#L491)

Since v0.0.0