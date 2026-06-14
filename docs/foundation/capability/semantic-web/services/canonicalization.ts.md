---
title: canonicalization.ts
nav_order: 16
parent: "@beep/semantic-web"
---

## canonicalization.ts overview

Dataset canonicalization service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [CanonicalizationError (class)](#canonicalizationerror-class)
- [models](#models)
  - [CanonicalDatasetResult (class)](#canonicaldatasetresult-class)
  - [CanonicalizationAlgorithm](#canonicalizationalgorithm)
  - [CanonicalizationService (class)](#canonicalizationservice-class)
  - [CanonicalizationServiceShape (interface)](#canonicalizationserviceshape-interface)
  - [CanonicalizeDatasetRequest (class)](#canonicalizedatasetrequest-class)
  - [DatasetFingerprint (class)](#datasetfingerprint-class)
  - [FingerprintDatasetRequest (class)](#fingerprintdatasetrequest-class)
---

# error-handling

## CanonicalizationError (class)

Typed canonicalization error.

**Example**

```ts
import { CanonicalizationError } from "@beep/semantic-web/services/canonicalization"

console.log(CanonicalizationError)
```

**Signature**

```ts
declare class CanonicalizationError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L67)

Since v0.0.0

# models

## CanonicalDatasetResult (class)

Canonical dataset output.

**Example**

```ts
import { CanonicalDatasetResult } from "@beep/semantic-web/services/canonicalization"

console.log(CanonicalDatasetResult)
```

**Signature**

```ts
declare class CanonicalDatasetResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L148)

Since v0.0.0

## CanonicalizationAlgorithm

Canonicalization algorithm name.

**Example**

```ts
import { CanonicalizationAlgorithm } from "@beep/semantic-web/services/canonicalization"

console.log(CanonicalizationAlgorithm)
```

**Signature**

```ts
declare const CanonicalizationAlgorithm: AnnotatedSchema<LiteralKit<readonly ["rdfc-1.0", "lexical-sort-v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L48)

Since v0.0.0

## CanonicalizationService (class)

Canonicalization service tag.

**Example**

```ts
import { CanonicalizationService } from "@beep/semantic-web/services/canonicalization"

console.log(CanonicalizationService)
```

**Signature**

```ts
declare class CanonicalizationService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L219)

Since v0.0.0

## CanonicalizationServiceShape (interface)

Canonicalization service contract shape.

**Example**

```ts
import type { CanonicalizationServiceShape } from "@beep/semantic-web/services/canonicalization"

const acceptCanonicalizationServiceShape = (value: CanonicalizationServiceShape) => value
console.log(acceptCanonicalizationServiceShape)
```

**Signature**

```ts
export interface CanonicalizationServiceShape {
  readonly canonicalize: (
    request: CanonicalizeDatasetRequest
  ) => Effect.Effect<CanonicalDatasetResult, CanonicalizationError>;
  readonly fingerprint: (
    request: FingerprintDatasetRequest
  ) => Effect.Effect<DatasetFingerprint, CanonicalizationError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L197)

Since v0.0.0

## CanonicalizeDatasetRequest (class)

Dataset canonicalization request.

**Example**

```ts
import { CanonicalizeDatasetRequest } from "@beep/semantic-web/services/canonicalization"

console.log(CanonicalizeDatasetRequest)
```

**Signature**

```ts
declare class CanonicalizeDatasetRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L92)

Since v0.0.0

## DatasetFingerprint (class)

Dataset fingerprint output.

**Example**

```ts
import { DatasetFingerprint } from "@beep/semantic-web/services/canonicalization"

console.log(DatasetFingerprint)
```

**Signature**

```ts
declare class DatasetFingerprint
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L172)

Since v0.0.0

## FingerprintDatasetRequest (class)

Dataset fingerprint request.

**Example**

```ts
import { FingerprintDatasetRequest } from "@beep/semantic-web/services/canonicalization"

console.log(FingerprintDatasetRequest)
```

**Signature**

```ts
declare class FingerprintDatasetRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/canonicalization.ts#L120)

Since v0.0.0