---
title: index.ts
nav_order: 6
parent: "@beep/file-processing"
---

## index.ts overview

Strategy schemas for file-processing engine selection and V1 support.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [DeferredSelectedStrategy (class)](#deferredselectedstrategy-class)
  - [FileFormatFamily (type alias)](#fileformatfamily-type-alias)
  - [FileProcessingCapability (type alias)](#fileprocessingcapability-type-alias)
  - [FileProcessingEngineDescriptor (class)](#fileprocessingenginedescriptor-class)
  - [FileProcessingEngineFamily (type alias)](#fileprocessingenginefamily-type-alias)
  - [FileProcessingOperationKind (type alias)](#fileprocessingoperationkind-type-alias)
  - [FileProcessingSkipReason (type alias)](#fileprocessingskipreason-type-alias)
  - [FileProcessingSupportDisposition (type alias)](#fileprocessingsupportdisposition-type-alias)
  - [SelectedStrategy](#selectedstrategy)
  - [SelectedStrategy (type alias)](#selectedstrategy-type-alias)
  - [StrategyPreference (class)](#strategypreference-class)
  - [SupportedSelectedStrategy (class)](#supportedselectedstrategy-class)
  - [UnsupportedSelectedStrategy (class)](#unsupportedselectedstrategy-class)
- [schemas](#schemas)
  - [FileFormatFamily](#fileformatfamily)
  - [FileProcessingCapability](#fileprocessingcapability)
  - [FileProcessingEngineFamily](#fileprocessingenginefamily)
  - [FileProcessingOperationKind](#fileprocessingoperationkind)
  - [FileProcessingSkipReason](#fileprocessingskipreason)
  - [FileProcessingSupportDisposition](#fileprocessingsupportdisposition)
---

# models

## DeferredSelectedStrategy (class)

Strategy selected when an operation is intentionally deferred.

**Example**

```ts
import { DeferredSelectedStrategy } from "@beep/file-processing/Strategy"

const strategy = DeferredSelectedStrategy.make({
  disposition: "deferred",
  engine: "libpff",
  format: "pst",
  operationKind: "export-archive",
  skipReason: "engine-unavailable"
})

console.log(strategy.skipReason) // "engine-unavailable"
```

**Signature**

```ts
declare class DeferredSelectedStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L281)

Since v0.0.0

## FileFormatFamily (type alias)

Type for `FileFormatFamily`.

**Signature**

```ts
type FileFormatFamily = typeof FileFormatFamily.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L108)

Since v0.0.0

## FileProcessingCapability (type alias)

Type for `FileProcessingCapability`.

**Signature**

```ts
type FileProcessingCapability = typeof FileProcessingCapability.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L140)

Since v0.0.0

## FileProcessingEngineDescriptor (class)

Runtime-neutral engine descriptor.

**Example**

```ts
import { FileProcessingEngineDescriptor } from "@beep/file-processing/Strategy"

console.log(FileProcessingEngineDescriptor)
```

**Signature**

```ts
declare class FileProcessingEngineDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L373)

Since v0.0.0

## FileProcessingEngineFamily (type alias)

Type for `FileProcessingEngineFamily`.

**Signature**

```ts
type FileProcessingEngineFamily = typeof FileProcessingEngineFamily.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L66)

Since v0.0.0

## FileProcessingOperationKind (type alias)

Type for `FileProcessingOperationKind`.

**Signature**

```ts
type FileProcessingOperationKind = typeof FileProcessingOperationKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L39)

Since v0.0.0

## FileProcessingSkipReason (type alias)

Type for `FileProcessingSkipReason`.

**Signature**

```ts
type FileProcessingSkipReason = typeof FileProcessingSkipReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L203)

Since v0.0.0

## FileProcessingSupportDisposition (type alias)

Type for `FileProcessingSupportDisposition`.

**Signature**

```ts
type FileProcessingSupportDisposition = typeof FileProcessingSupportDisposition.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L167)

Since v0.0.0

## SelectedStrategy

Strategy selected for a concrete operation.

**Example**

```ts
import { SelectedStrategy } from "@beep/file-processing/Strategy"

console.log(SelectedStrategy)
```

**Signature**

```ts
declare const SelectedStrategy: AnnotatedSchema<S.Union<readonly [typeof SupportedSelectedStrategy, typeof DeferredSelectedStrategy, typeof UnsupportedSelectedStrategy]> & TaggedUnionUtils<"disposition", readonly [typeof SupportedSelectedStrategy, typeof DeferredSelectedStrategy, typeof UnsupportedSelectedStrategy], [typeof SupportedSelectedStrategy, typeof DeferredSelectedStrategy, typeof UnsupportedSelectedStrategy]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L341)

Since v0.0.0

## SelectedStrategy (type alias)

Type for `SelectedStrategy`.

**Signature**

```ts
type SelectedStrategy = typeof SelectedStrategy.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L358)

Since v0.0.0

## StrategyPreference (class)

Preferred engine selection for an operation.

**Example**

```ts
import { StrategyPreference } from "@beep/file-processing/Strategy"

const preference = StrategyPreference.make({ engine: "auto" })
console.log(preference.engine)
```

**Signature**

```ts
declare class StrategyPreference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L219)

Since v0.0.0

## SupportedSelectedStrategy (class)

Strategy selected when an operation is supported.

**Example**

```ts
import { SupportedSelectedStrategy } from "@beep/file-processing/Strategy"

const strategy = SupportedSelectedStrategy.make({
  disposition: "supported",
  engine: "tika",
  format: "docx",
  operationKind: "extract"
})

console.log(strategy.disposition) // "supported"
```

**Signature**

```ts
declare class SupportedSelectedStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L248)

Since v0.0.0

## UnsupportedSelectedStrategy (class)

Strategy selected when an operation is unsupported.

**Example**

```ts
import { UnsupportedSelectedStrategy } from "@beep/file-processing/Strategy"

const strategy = UnsupportedSelectedStrategy.make({
  disposition: "unsupported",
  engine: "tika",
  format: "xls",
  operationKind: "extract",
  skipReason: "format-out-of-scope"
})

console.log(strategy.format) // "xls"
```

**Signature**

```ts
declare class UnsupportedSelectedStrategy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L315)

Since v0.0.0

# schemas

## FileFormatFamily

V1 file format families recognized by the capability.

**Example**

```ts
import { FileFormatFamily } from "@beep/file-processing/Strategy"

console.log(FileFormatFamily)
```

**Signature**

```ts
declare const FileFormatFamily: AnnotatedSchema<LiteralKit<readonly ["doc", "docx", "docm", "rtf", "html", "xhtml", "pdf-text-layer", "pst", "plain-text", "markdown", "image-metadata", "xls", "xlsx", "unknown"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L81)

Since v0.0.0

## FileProcessingCapability

Processing capability advertised by an engine.

**Example**

```ts
import { FileProcessingCapability } from "@beep/file-processing/Strategy"

console.log(FileProcessingCapability)
```

**Signature**

```ts
declare const FileProcessingCapability: AnnotatedSchema<LiteralKit<readonly ["detect", "extract-text", "extract-metadata", "export-children"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L123)

Since v0.0.0

## FileProcessingEngineFamily

Concrete engine families known to P1.

**Example**

```ts
import { FileProcessingEngineFamily } from "@beep/file-processing/Strategy"

console.log(FileProcessingEngineFamily)
```

**Signature**

```ts
declare const FileProcessingEngineFamily: AnnotatedSchema<LiteralKit<readonly ["auto", "tika", "libpff", "test"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L54)

Since v0.0.0

## FileProcessingOperationKind

Operation kinds supported by the capability contract.

**Example**

```ts
import { FileProcessingOperationKind } from "@beep/file-processing/Strategy"

console.log(FileProcessingOperationKind)
```

**Signature**

```ts
declare const FileProcessingOperationKind: AnnotatedSchema<LiteralKit<readonly ["detect", "extract", "export-archive", "process"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L27)

Since v0.0.0

## FileProcessingSkipReason

Reason a source was skipped or deferred.

**Example**

```ts
import { FileProcessingSkipReason } from "@beep/file-processing/Strategy"

console.log(FileProcessingSkipReason)
```

**Signature**

```ts
declare const FileProcessingSkipReason: AnnotatedSchema<LiteralKit<readonly ["engine-unavailable", "encrypted-source", "fixture-unavailable", "format-out-of-scope", "ocr-disabled", "output-budget-exceeded", "unsupported-format", "operation-not-required"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L182)

Since v0.0.0

## FileProcessingSupportDisposition

Support disposition selected for a source artifact.

**Example**

```ts
import { FileProcessingSupportDisposition } from "@beep/file-processing/Strategy"

console.log(FileProcessingSupportDisposition)
```

**Signature**

```ts
declare const FileProcessingSupportDisposition: AnnotatedSchema<LiteralKit<readonly ["supported", "deferred", "unsupported"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Strategy/index.ts#L155)

Since v0.0.0