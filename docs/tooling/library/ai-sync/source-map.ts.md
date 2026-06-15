---
title: source-map.ts
nav_order: 8
parent: "@beep/ai-sync"
---

## source-map.ts overview

V1 source map and support matrix for AI sync.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [TIER_ONE_SOURCES](#tier_one_sources)
  - [V1_SCHEMA_COVERAGE](#v1_schema_coverage)
- [interop](#interop)
  - [V1_TRANSFORM_EVIDENCE](#v1_transform_evidence)
---

# constants

## TIER_ONE_SOURCES

Tier-1 sources fetched by the generator and strict drift checker.

**Example**

```ts
import { TIER_ONE_SOURCES } from "@beep/ai-sync"
console.log(TIER_ONE_SOURCES.length)
```

**Signature**

```ts
declare const TIER_ONE_SOURCES: readonly [AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata, AiSyncSourceMetadata]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/source-map.ts#L21)

Since v0.0.0

## V1_SCHEMA_COVERAGE

Complete V1 schema support matrix.

**Example**

```ts
import { V1_SCHEMA_COVERAGE } from "@beep/ai-sync"
console.log(V1_SCHEMA_COVERAGE.some((cell) => cell.status === "unknown_schema"))
```

**Signature**

```ts
declare const V1_SCHEMA_COVERAGE: readonly [AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell, AiSyncSchemaCell]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/source-map.ts#L120)

Since v0.0.0

# interop

## V1_TRANSFORM_EVIDENCE

P4 transform evidence ledger.

**Example**

```ts
import { V1_TRANSFORM_EVIDENCE } from "@beep/ai-sync"
console.log(V1_TRANSFORM_EVIDENCE.map((entry) => entry.status))
```

**Signature**

```ts
declare const V1_TRANSFORM_EVIDENCE: readonly [AiSyncTransformEvidence, AiSyncTransformEvidence, AiSyncTransformEvidence, AiSyncTransformEvidence, AiSyncTransformEvidence, AiSyncTransformEvidence, AiSyncTransformEvidence]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-sync/src/source-map.ts#L320)

Since v0.0.0