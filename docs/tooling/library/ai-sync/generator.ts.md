---
title: generator.ts
nav_order: 4
parent: "@beep/ai-sync"
---

## generator.ts overview

Generated artifact rendering and source fetching.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [GENERATED_SCHEMAS_PATH](#generated_schemas_path)
  - [GENERATED_SOURCE_METADATA_PATH](#generated_source_metadata_path)
- [services](#services)
  - [AiSyncHttpLayer](#aisynchttplayer)
  - [fetchSourceText](#fetchsourcetext)
- [utilities](#utilities)
  - [hashSourceText](#hashsourcetext)
  - [renderGeneratedSchemas](#rendergeneratedschemas)
  - [renderGeneratedSourceMetadata](#rendergeneratedsourcemetadata)
- [workflows](#workflows)
  - [generateAiSyncArtifacts](#generateaisyncartifacts)
---

# constants

## GENERATED_SCHEMAS_PATH

Generated schemas file path relative to the package root.

**Example**

```ts
import { GENERATED_SCHEMAS_PATH } from "@beep/ai-sync/generator"
console.log(GENERATED_SCHEMAS_PATH)
```

**Signature**

```ts
declare const GENERATED_SCHEMAS_PATH: "src/_generated/schemas.gen.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L26)

Since v0.0.0

## GENERATED_SOURCE_METADATA_PATH

Generated source metadata file path relative to the package root.

**Example**

```ts
import { GENERATED_SOURCE_METADATA_PATH } from "@beep/ai-sync/generator"
console.log(GENERATED_SOURCE_METADATA_PATH)
```

**Signature**

```ts
declare const GENERATED_SOURCE_METADATA_PATH: "src/_generated/source-metadata.gen.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L39)

Since v0.0.0

# services

## AiSyncHttpLayer

Runtime layer for generator and drift commands.

**Example**

```ts
import { AiSyncHttpLayer } from "@beep/ai-sync/generator"
console.log(AiSyncHttpLayer)
```

**Signature**

```ts
declare const AiSyncHttpLayer: Layer<HttpClient.HttpClient, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L429)

Since v0.0.0

## fetchSourceText

Fetch an upstream source body.

**Example**

```ts
import { fetchSourceText } from "@beep/ai-sync/generator"
console.log(fetchSourceText)
```

**Signature**

```ts
declare const fetchSourceText: (source: AiSyncSourceMetadata) => Effect.Effect<string, AiSyncError, HttpClient.HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L337)

Since v0.0.0

# utilities

## hashSourceText

Compute a public SHA-256 content hash.

**Example**

```ts
import { hashSourceText } from "@beep/ai-sync/generator"
console.log(hashSourceText)
```

**Signature**

```ts
declare const hashSourceText: (value: string) => Effect.Effect<string, AiSyncError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L313)

Since v0.0.0

## renderGeneratedSchemas

Render generated schemas without network access.

**Example**

```ts
import { renderGeneratedSchemas } from "@beep/ai-sync/generator"
console.log(renderGeneratedSchemas().includes("CodexConfig"))
```

**Signature**

```ts
declare const renderGeneratedSchemas: () => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L398)

Since v0.0.0

## renderGeneratedSourceMetadata

Render generated source metadata without network access.

**Example**

```ts
import { renderGeneratedSourceMetadata } from "@beep/ai-sync/generator"
console.log(renderGeneratedSourceMetadata([]))
```

**Signature**

```ts
declare const renderGeneratedSourceMetadata: (sources: ReadonlyArray<AiSyncSourceMetadata>) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L104)

Since v0.0.0

# workflows

## generateAiSyncArtifacts

Generate committed schema and source metadata files.

**Example**

```ts
import { generateAiSyncArtifacts } from "@beep/ai-sync/generator"
console.log(generateAiSyncArtifacts)
```

**Signature**

```ts
declare const generateAiSyncArtifacts: () => Effect.Effect<void, AiSyncError | PlatformError, FileSystem.FileSystem | Path.Path | HttpClient.HttpClient>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/generator.ts#L411)

Since v0.0.0