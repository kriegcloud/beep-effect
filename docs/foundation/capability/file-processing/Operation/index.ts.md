---
title: index.ts
nav_order: 4
parent: "@beep/file-processing"
---

## index.ts overview

Operation request and boundary error schemas for file processing.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [FileProcessingOperationError (class)](#fileprocessingoperationerror-class)
  - [FileProcessingOperationErrorReason](#fileprocessingoperationerrorreason)
  - [FileProcessingOperationErrorReason (type alias)](#fileprocessingoperationerrorreason-type-alias)
- [models](#models)
  - [DetectFileOperation (class)](#detectfileoperation-class)
  - [DetectionResult (class)](#detectionresult-class)
  - [ExportArchiveOperation (class)](#exportarchiveoperation-class)
  - [ExtractFileOperation (class)](#extractfileoperation-class)
  - [ProcessFileOperation (class)](#processfileoperation-class)
---

# errors

## FileProcessingOperationError (class)

Sanitized file-processing operation error.

**Example**

```ts
import { FileProcessingOperationError } from "@beep/file-processing/Operation"

const error = FileProcessingOperationError.fromReason("engine-unavailable", {
  message: "No extraction engine is available"
})
console.log(error.reason)
```

**Signature**

```ts
declare class FileProcessingOperationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L69)

Since v0.0.0

## FileProcessingOperationErrorReason

Machine-readable file-processing operation failure reasons.

**Example**

```ts
import { FileProcessingOperationErrorReason } from "@beep/file-processing/Operation"

console.log(FileProcessingOperationErrorReason)
```

**Signature**

```ts
declare const FileProcessingOperationErrorReason: AnnotatedSchema<LiteralKit<readonly ["file-detection-failed", "unsupported-file-format", "file-extraction-failed", "archive-export-failed", "engine-unavailable", "operation-timed-out", "output-limit-exceeded"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L30)

Since v0.0.0

## FileProcessingOperationErrorReason (type alias)

Type for `FileProcessingOperationErrorReason`.

**Signature**

```ts
type FileProcessingOperationErrorReason = typeof FileProcessingOperationErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L51)

Since v0.0.0

# models

## DetectFileOperation (class)

Operation request for format detection.

**Example**

```ts
import { DetectFileOperation } from "@beep/file-processing/Operation"

console.log(DetectFileOperation)
```

**Signature**

```ts
declare class DetectFileOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L118)

Since v0.0.0

## DetectionResult (class)

Result emitted by format detection.

**Example**

```ts
import { DetectionResult } from "@beep/file-processing/Operation"

console.log(DetectionResult)
```

**Signature**

```ts
declare class DetectionResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L143)

Since v0.0.0

## ExportArchiveOperation (class)

Operation request for archive child export.

**Example**

```ts
import { ExportArchiveOperation } from "@beep/file-processing/Operation"

console.log(ExportArchiveOperation)
```

**Signature**

```ts
declare class ExportArchiveOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L197)

Since v0.0.0

## ExtractFileOperation (class)

Operation request for text and metadata extraction.

**Example**

```ts
import { ExtractFileOperation } from "@beep/file-processing/Operation"

console.log(ExtractFileOperation)
```

**Signature**

```ts
declare class ExtractFileOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L170)

Since v0.0.0

## ProcessFileOperation (class)

Operation request for a full source processing pass.

**Example**

```ts
import { ProcessFileOperation } from "@beep/file-processing/Operation"

console.log(ProcessFileOperation)
```

**Signature**

```ts
declare class ProcessFileOperation
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Operation/index.ts#L224)

Since v0.0.0