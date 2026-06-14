---
title: index.ts
nav_order: 1
parent: "@beep/file-processing"
---

## index.ts overview

Artifact schemas for runtime-neutral file processing operations.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [deriveArtifactId](#deriveartifactid)
- [models](#models)
  - [ArtifactId (type alias)](#artifactid-type-alias)
  - [ArtifactLocator (class)](#artifactlocator-class)
  - [ArtifactLocatorKind (type alias)](#artifactlocatorkind-type-alias)
  - [ArtifactReference (class)](#artifactreference-class)
  - [ContentDigest (type alias)](#contentdigest-type-alias)
  - [OperationId (type alias)](#operationid-type-alias)
  - [SourceArtifact (class)](#sourceartifact-class)
- [schemas](#schemas)
  - [ArtifactId](#artifactid)
  - [ArtifactLocatorKind](#artifactlocatorkind)
  - [ContentDigest](#contentdigest)
  - [OperationId](#operationid)
---

# constructors

## deriveArtifactId

Derive a stable artifact identifier from deterministic artifact parts.

**Example**

```ts
import { deriveArtifactId } from "@beep/file-processing/Artifact"
import { Effect } from "effect"

const program = Effect.gen(function* () {
  const id = yield* deriveArtifactId(["artifact:parent", "children/message.txt"])
  return id.startsWith("artifact:")
})

Effect.runPromise(program).then((valid) => console.log(valid)) // true
```

**Signature**

```ts
declare const deriveArtifactId: (parts: ReadonlyArray<string>) => Effect.Effect<`artifact:${string}` & Brand<"FileProcessingArtifactId">, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L184)

Since v0.0.0

# models

## ArtifactId (type alias)

Type for `ArtifactId`.

**Signature**

```ts
type ArtifactId = typeof ArtifactId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L95)

Since v0.0.0

## ArtifactLocator (class)

Runtime-neutral artifact locator.

**Example**

```ts
import { ArtifactLocator } from "@beep/file-processing/Artifact"
import { PosixPath } from "@beep/schema/PosixPath"
import { Effect } from "effect"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const value = yield* S.decodeUnknownEffect(PosixPath)("fixtures/readme.md")
  return ArtifactLocator.make({ kind: "synthetic", value }).kind
})

Effect.runPromise(program).then(console.log) // "synthetic"
```

**Signature**

```ts
declare class ArtifactLocator
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L237)

Since v0.0.0

## ArtifactLocatorKind (type alias)

Type for `ArtifactLocatorKind`.

**Signature**

```ts
type ArtifactLocatorKind = typeof ArtifactLocatorKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L214)

Since v0.0.0

## ArtifactReference (class)

Lightweight reference to a materialized artifact.

**Example**

```ts
import { ArtifactReference } from "@beep/file-processing/Artifact"

console.log(ArtifactReference)
```

**Signature**

```ts
declare class ArtifactReference
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L291)

Since v0.0.0

## ContentDigest (type alias)

Type for `ContentDigest`.

**Signature**

```ts
type ContentDigest = typeof ContentDigest.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L159)

Since v0.0.0

## OperationId (type alias)

Type for `OperationId`.

**Signature**

```ts
type OperationId = typeof OperationId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L127)

Since v0.0.0

## SourceArtifact (class)

Source artifact supplied to a file-processing operation.

**Example**

```ts
import { SourceArtifact } from "@beep/file-processing/Artifact"

console.log(SourceArtifact)
```

**Signature**

```ts
declare class SourceArtifact
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L260)

Since v0.0.0

# schemas

## ArtifactId

Stable artifact identifier derived from a content digest.

**Example**

```ts
import { ArtifactId } from "@beep/file-processing/Artifact"

console.log(ArtifactId)
```

**Signature**

```ts
declare const ArtifactId: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly ["artifact:", AnnotatedSchema<S.brand<S.String, "Sha256Hex">>]>, "FileProcessingArtifactId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L78)

Since v0.0.0

## ArtifactLocatorKind

Origin kind for a source artifact locator.

**Example**

```ts
import { ArtifactLocatorKind } from "@beep/file-processing/Artifact"

console.log(ArtifactLocatorKind)
```

**Signature**

```ts
declare const ArtifactLocatorKind: AnnotatedSchema<LiteralKit<readonly ["file", "synthetic", "memory"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L202)

Since v0.0.0

## ContentDigest

SHA-256 content digest recorded with the source or emitted artifact.

**Example**

```ts
import { ContentDigest } from "@beep/file-processing/Artifact"

console.log(ContentDigest)
```

**Signature**

```ts
declare const ContentDigest: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly ["sha256:", AnnotatedSchema<S.brand<S.String, "Sha256Hex">>]>, "FileProcessingContentDigest">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L142)

Since v0.0.0

## OperationId

Stable operation identifier derived from source, operation kind, and strategy.

**Example**

```ts
import { OperationId } from "@beep/file-processing/Artifact"

console.log(OperationId)
```

**Signature**

```ts
declare const OperationId: AnnotatedSchema<S.brand<S.TemplateLiteral<readonly ["operation:", AnnotatedSchema<S.brand<S.String, "Sha256Hex">>]>, "FileProcessingOperationId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/file-processing/src/Artifact/index.ts#L110)

Since v0.0.0