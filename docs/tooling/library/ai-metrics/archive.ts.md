---
title: archive.ts
nav_order: 2
parent: "@beep/repo-ai-metrics"
---

## archive.ts overview

Encrypted raw archive helpers for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [AiMetricsArchiveError (class)](#aimetricsarchiveerror-class)
- [models](#models)
  - [AiMetricsEncryptedRawArchiveEnvelope (class)](#aimetricsencryptedrawarchiveenvelope-class)
  - [AiMetricsRawArchiveKey](#aimetricsrawarchivekey)
  - [AiMetricsRawArchiveKey (type alias)](#aimetricsrawarchivekey-type-alias)
  - [AiMetricsRawArchiveObject (class)](#aimetricsrawarchiveobject-class)
- [services](#services)
  - [decryptEncryptedRawArchiveEnvelope](#decryptencryptedrawarchiveenvelope)
  - [readEncryptedRawArchiveEnvelope](#readencryptedrawarchiveenvelope)
  - [writeEncryptedRawArchiveObject](#writeencryptedrawarchiveobject)
---

# errors

## AiMetricsArchiveError (class)

Error raised by AI metrics encrypted archive helpers.

**Example**

```ts
import { AiMetricsArchiveError } from "@beep/repo-ai-metrics"
const error = AiMetricsArchiveError.make({
  cause: "boom",
  message: "Archive failed."
})
console.log(error)
```

**Signature**

```ts
declare class AiMetricsArchiveError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L35)

Since v0.0.0

# models

## AiMetricsEncryptedRawArchiveEnvelope (class)

Encrypted raw transcript archive envelope stored on disk.

**Example**

```ts
import { AiMetricsEncryptedRawArchiveEnvelope } from "@beep/repo-ai-metrics"
console.log(AiMetricsEncryptedRawArchiveEnvelope)
```

**Signature**

```ts
declare class AiMetricsEncryptedRawArchiveEnvelope
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L57)

Since v0.0.0

## AiMetricsRawArchiveKey

Redacted base64 AES-256-GCM key used for raw archive encryption.

**Example**

```ts
import { AiMetricsRawArchiveKey } from "@beep/repo-ai-metrics"
import { Redacted } from "effect"
const key: AiMetricsRawArchiveKey = Redacted.make("base64-32-byte-key")
console.log(key)
```

**Signature**

```ts
declare const AiMetricsRawArchiveKey: AnnotatedSchema<S.RedactedFromValue<S.String>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L115)

Since v0.0.0

## AiMetricsRawArchiveKey (type alias)

Type for `AiMetricsRawArchiveKey`.

**Example**

```ts
import type { AiMetricsRawArchiveKey } from "@beep/repo-ai-metrics"
import { Redacted } from "effect"
const key: AiMetricsRawArchiveKey = Redacted.make("base64-32-byte-key")
console.log(key)
```

**Signature**

```ts
type AiMetricsRawArchiveKey = typeof AiMetricsRawArchiveKey.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L135)

Since v0.0.0

## AiMetricsRawArchiveObject (class)

Safe archive object metadata returned after an encrypted write or lookup.

**Example**

```ts
import { AiMetricsRawArchiveObject } from "@beep/repo-ai-metrics"
console.log(AiMetricsRawArchiveObject)
```

**Signature**

```ts
declare class AiMetricsRawArchiveObject
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L86)

Since v0.0.0

# services

## decryptEncryptedRawArchiveEnvelope

Decrypt an archive envelope for package-level verification.

**Example**

```ts
import {
  AiMetricsEncryptedRawArchiveEnvelope,
  decryptEncryptedRawArchiveEnvelope
} from "@beep/repo-ai-metrics"
import { Redacted } from "effect"
const program = decryptEncryptedRawArchiveEnvelope({
  envelope: AiMetricsEncryptedRawArchiveEnvelope.make({
    algorithm: "AES-256-GCM",
    archiveObjectId: "raw-example",
    ciphertextBase64: "ciphertext",
    encryptedAtEpochMillis: 0,
    nonceBase64: "nonce",
    plaintextContentHash: "hash",
    sourceKind: "codex",
    sourcePathHash: "source-hash"
  }),
  rawArchiveKey: Redacted.make("base64-32-byte-key")
})
console.log(program)
```

**Signature**

```ts
declare const decryptEncryptedRawArchiveEnvelope: (args_0: { readonly envelope: AiMetricsEncryptedRawArchiveEnvelope; readonly rawArchiveKey: AiMetricsRawArchiveKey; }) => Effect.Effect<string, AiMetricsArchiveError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L362)

Since v0.0.0

## readEncryptedRawArchiveEnvelope

Read and decode an encrypted raw archive envelope from disk.

**Example**

```ts
import { readEncryptedRawArchiveEnvelope } from "@beep/repo-ai-metrics"
const program = readEncryptedRawArchiveEnvelope(".ai-metrics/raw/codex/raw-example.json")
console.log(program)
```

**Signature**

```ts
declare const readEncryptedRawArchiveEnvelope: (archivePath: string) => Effect.Effect<AiMetricsEncryptedRawArchiveEnvelope, AiMetricsArchiveError, FileSystem.FileSystem>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L399)

Since v0.0.0

## writeEncryptedRawArchiveObject

Write one raw transcript file into the encrypted content-addressed archive.

**Example**

```ts
import {
  AiMetricsTranscriptSource,
  writeEncryptedRawArchiveObject
} from "@beep/repo-ai-metrics"
import { Effect, Redacted } from "effect"
const program = writeEncryptedRawArchiveObject({
  content: "{\"type\":\"event_msg\"}",
  hashSalt: "fixture-salt",
  rawArchiveDir: ".ai-metrics/raw",
  rawArchiveKey: Redacted.make("base64-32-byte-key"),
  sourceKind: AiMetricsTranscriptSource.Enum.codex,
  sourcePath: "session.jsonl"
})
console.log(Effect.map(program, (object) => object.archiveObjectId))
```

**Signature**

```ts
declare const writeEncryptedRawArchiveObject: (input: { readonly content: string; readonly hashSalt?: string; readonly rawArchiveDir: string; readonly rawArchiveKey: AiMetricsRawArchiveKey; readonly sourceKind: AiMetricsTranscriptSource; readonly sourcePath: string; }) => Effect.Effect<AiMetricsRawArchiveObject, PlatformError | AiMetricsArchiveError, FileSystem.FileSystem | Path.Path>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/archive.ts#L251)

Since v0.0.0