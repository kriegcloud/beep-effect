---
title: privacy.ts
nav_order: 13
parent: "@beep/repo-ai-metrics"
---

## privacy.ts overview

Privacy and hashing helpers for repo AI metrics.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [AI_METRICS_LOCAL_INSECURE_HASH_SALT](#ai_metrics_local_insecure_hash_salt)
- [constructors](#constructors)
  - [makeAiMetricsPrivacyCheckResult](#makeaimetricsprivacycheckresult)
  - [makeAiMetricsSourceAttribution](#makeaimetricssourceattribution)
  - [makeSanitizedTranscript](#makesanitizedtranscript)
- [errors](#errors)
  - [AiMetricsPrivacyError (class)](#aimetricsprivacyerror-class)
- [models](#models)
  - [AiMetricsHashSaltStatus](#aimetricshashsaltstatus)
  - [AiMetricsHashSaltStatus (type alias)](#aimetricshashsaltstatus-type-alias)
  - [AiMetricsPrivacyCheckResult (class)](#aimetricsprivacycheckresult-class)
  - [AiMetricsRawEventEnvelope (class)](#aimetricsraweventenvelope-class)
  - [AiMetricsRedactionResult (class)](#aimetricsredactionresult-class)
  - [AiMetricsSanitizedTranscript (class)](#aimetricssanitizedtranscript-class)
- [utilities](#utilities)
  - [hashPrivateIdentifier](#hashprivateidentifier)
  - [hashPublicTextSha256](#hashpublictextsha256)
  - [privacyCheckToJson](#privacychecktojson)
  - [redactAiMetricsSensitiveText](#redactaimetricssensitivetext)
  - [resolveAiMetricsHashSaltStatus](#resolveaimetricshashsaltstatus)
  - [resolveAiMetricsHashSaltValue](#resolveaimetricshashsaltvalue)
---

# constants

## AI_METRICS_LOCAL_INSECURE_HASH_SALT

Local fallback salt used only for smoke-mode private identifier hashes.

**Example**

```ts
import { AI_METRICS_LOCAL_INSECURE_HASH_SALT } from "@beep/repo-ai-metrics"
console.log(AI_METRICS_LOCAL_INSECURE_HASH_SALT)
```

**Signature**

```ts
declare const AI_METRICS_LOCAL_INSECURE_HASH_SALT: "beep-ai-metrics-local-smoke-insecure-salt"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L32)

Since v0.0.0

# constructors

## makeAiMetricsPrivacyCheckResult

Build the P1 privacy proof payload for one transcript.

**Example**

```ts
import { makeAiMetricsPrivacyCheckResult } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsPrivacyCheckResult)
```

**Signature**

```ts
declare const makeAiMetricsPrivacyCheckResult: (args_0: { readonly content: string; readonly hashSalt?: string; readonly relativePath?: string; readonly sourcePath: string; readonly summary: TranscriptIngestSummary; }) => Effect.Effect<AiMetricsPrivacyCheckResult, AiMetricsPrivacyError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L653)

Since v0.0.0

## makeAiMetricsSourceAttribution

Derive privacy-safe source attribution from local transcript metadata.

**Example**

```ts
import { makeAiMetricsSourceAttribution } from "@beep/repo-ai-metrics"
console.log(makeAiMetricsSourceAttribution)
```

**Signature**

```ts
declare const makeAiMetricsSourceAttribution: (args_0: { readonly content: string; readonly hashSalt?: string; readonly relativePath: string; readonly sourceKind: AiMetricsTranscriptSource; readonly sourcePath: string; }) => Effect.Effect<AiMetricsSourceAttribution, AiMetricsPrivacyError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L426)

Since v0.0.0

## makeSanitizedTranscript

Build a sanitized transcript projection from an ingest summary and raw JSONL text.

**Example**

```ts
import { makeSanitizedTranscript } from "@beep/repo-ai-metrics"
console.log(makeSanitizedTranscript)
```

**Signature**

```ts
declare const makeSanitizedTranscript: (args_0: { readonly content: string; readonly hashSalt?: string; readonly relativePath?: string; readonly sourcePath: string; readonly summary: TranscriptIngestSummary; }) => Effect.Effect<AiMetricsSanitizedTranscript, AiMetricsPrivacyError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L593)

Since v0.0.0

# errors

## AiMetricsPrivacyError (class)

Error raised by AI metrics privacy helpers.

**Example**

```ts
import { AiMetricsPrivacyError } from "@beep/repo-ai-metrics"
console.log(AiMetricsPrivacyError)
```

**Signature**

```ts
declare class AiMetricsPrivacyError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L206)

Since v0.0.0

# models

## AiMetricsHashSaltStatus

Whether private identifier hashes used an operator-provided salt or a local smoke fallback.

**Example**

```ts
import { AiMetricsHashSaltStatus } from "@beep/repo-ai-metrics"
console.log(AiMetricsHashSaltStatus.Enum.provided)
```

**Signature**

```ts
declare const AiMetricsHashSaltStatus: AnnotatedSchema<LiteralKit<readonly ["provided", "insecure_default"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L56)

Since v0.0.0

## AiMetricsHashSaltStatus (type alias)

Runtime type for `AiMetricsHashSaltStatus`.

**Example**

```ts
import type { AiMetricsHashSaltStatus } from "@beep/repo-ai-metrics"
const status: AiMetricsHashSaltStatus = "provided"
console.log(status)
```

**Signature**

```ts
type AiMetricsHashSaltStatus = typeof AiMetricsHashSaltStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L74)

Since v0.0.0

## AiMetricsPrivacyCheckResult (class)

Result produced by the P1 privacy proof command.

**Example**

```ts
import { AiMetricsPrivacyCheckResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsPrivacyCheckResult)
```

**Signature**

```ts
declare class AiMetricsPrivacyCheckResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L182)

Since v0.0.0

## AiMetricsRawEventEnvelope (class)

Hash-only envelope for a raw transcript event line.

**Example**

```ts
import { AiMetricsRawEventEnvelope } from "@beep/repo-ai-metrics"
console.log(AiMetricsRawEventEnvelope)
```

**Signature**

```ts
declare class AiMetricsRawEventEnvelope
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L112)

Since v0.0.0

## AiMetricsRedactionResult (class)

Redaction proof for text that crossed the raw-transcript boundary.

**Example**

```ts
import { AiMetricsRedactionResult } from "@beep/repo-ai-metrics"
console.log(AiMetricsRedactionResult)
```

**Signature**

```ts
declare class AiMetricsRedactionResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L87)

Since v0.0.0

## AiMetricsSanitizedTranscript (class)

Redacted transcript summary safe for derived tables, dashboards, and OTLP attributes.

**Example**

```ts
import { AiMetricsSanitizedTranscript } from "@beep/repo-ai-metrics"
console.log(AiMetricsSanitizedTranscript)
```

**Signature**

```ts
declare class AiMetricsSanitizedTranscript
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L141)

Since v0.0.0

# utilities

## hashPrivateIdentifier

Compute a salted SHA-256 digest for private identifiers such as local paths and session ids.

**Example**

```ts
import { hashPrivateIdentifier } from "@beep/repo-ai-metrics"
console.log(hashPrivateIdentifier)
```

**Signature**

```ts
declare const hashPrivateIdentifier: { (value: string, hashSalt: string | undefined): Effect.Effect<string, AiMetricsPrivacyError>; (hashSalt: string | undefined): (value: string) => Effect.Effect<string, AiMetricsPrivacyError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L347)

Since v0.0.0

## hashPublicTextSha256

Compute a deterministic public SHA-256 digest for non-private content identity.

**Example**

```ts
import { hashPublicTextSha256 } from "@beep/repo-ai-metrics"
console.log(hashPublicTextSha256)
```

**Signature**

```ts
declare const hashPublicTextSha256: (value: string) => Effect.Effect<string, AiMetricsPrivacyError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L323)

Since v0.0.0

## privacyCheckToJson

Render a privacy check result as JSON.

**Example**

```ts
import { privacyCheckToJson } from "@beep/repo-ai-metrics"
console.log(privacyCheckToJson)
```

**Signature**

```ts
declare const privacyCheckToJson: (result: AiMetricsPrivacyCheckResult) => Effect.Effect<string, AiMetricsPrivacyError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L692)

Since v0.0.0

## redactAiMetricsSensitiveText

Redact secret-shaped text before any diagnostic rendering.

**Example**

```ts
import { redactAiMetricsSensitiveText } from "@beep/repo-ai-metrics"
console.log(redactAiMetricsSensitiveText("OPENAI_API_KEY=sk-testfixture"))
```

**Signature**

```ts
declare const redactAiMetricsSensitiveText: (text: string) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L502)

Since v0.0.0

## resolveAiMetricsHashSaltStatus

Resolve the effective private hash salt status.

**Example**

```ts
import { resolveAiMetricsHashSaltStatus } from "@beep/repo-ai-metrics"
console.log(resolveAiMetricsHashSaltStatus("salt"))
```

**Signature**

```ts
declare const resolveAiMetricsHashSaltStatus: (hashSalt: string | undefined) => AiMetricsHashSaltStatus
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L307)

Since v0.0.0

## resolveAiMetricsHashSaltValue

Resolve the effective private hash salt value.

**Example**

```ts
import { resolveAiMetricsHashSaltValue } from "@beep/repo-ai-metrics"
console.log(resolveAiMetricsHashSaltValue("salt"))
```

**Signature**

```ts
declare const resolveAiMetricsHashSaltValue: (hashSalt: string | undefined) => string
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/tooling/library/ai-metrics/src/privacy.ts#L291)

Since v0.0.0