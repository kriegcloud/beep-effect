---
title: jsonld-document.ts
nav_order: 18
parent: "@beep/semantic-web"
---

## jsonld-document.ts overview

JSON-LD document service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [JsonLdDocumentError (class)](#jsonlddocumenterror-class)
- [models](#models)
  - [CompactJsonLdDocumentRequest (class)](#compactjsonlddocumentrequest-class)
  - [ExpandJsonLdDocumentRequest (class)](#expandjsonlddocumentrequest-class)
  - [FlattenJsonLdDocumentRequest (class)](#flattenjsonlddocumentrequest-class)
  - [FrameJsonLdDocumentRequest (class)](#framejsonlddocumentrequest-class)
  - [JsonLdDocumentErrorReason](#jsonlddocumenterrorreason)
  - [JsonLdDocumentLoaderPolicy (class)](#jsonlddocumentloaderpolicy-class)
  - [JsonLdDocumentNormalizationProfile](#jsonlddocumentnormalizationprofile)
  - [JsonLdDocumentNormalizationProfile (type alias)](#jsonlddocumentnormalizationprofile-type-alias)
  - [JsonLdDocumentResult (class)](#jsonlddocumentresult-class)
  - [JsonLdDocumentService (class)](#jsonlddocumentservice-class)
  - [JsonLdDocumentServiceShape (interface)](#jsonlddocumentserviceshape-interface)
  - [JsonLdFromRdfRequest (class)](#jsonldfromrdfrequest-class)
  - [JsonLdToRdfRequest (class)](#jsonldtordfrequest-class)
  - [JsonLdToRdfResult (class)](#jsonldtordfresult-class)
  - [NormalizeJsonLdDocumentRequest (class)](#normalizejsonlddocumentrequest-class)
---

# error-handling

## JsonLdDocumentError (class)

Typed JSON-LD document service error.

**Example**

```ts
import { JsonLdDocumentError } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentError)
```

**Signature**

```ts
declare class JsonLdDocumentError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L72)

Since v0.0.0

# models

## CompactJsonLdDocumentRequest (class)

Compact JSON-LD document request.

**Example**

```ts
import { CompactJsonLdDocumentRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(CompactJsonLdDocumentRequest)
```

**Signature**

```ts
declare class CompactJsonLdDocumentRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L98)

Since v0.0.0

## ExpandJsonLdDocumentRequest (class)

Expand JSON-LD document request.

**Example**

```ts
import { ExpandJsonLdDocumentRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(ExpandJsonLdDocumentRequest)
```

**Signature**

```ts
declare class ExpandJsonLdDocumentRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L245)

Since v0.0.0

## FlattenJsonLdDocumentRequest (class)

Flatten JSON-LD document request.

**Example**

```ts
import { FlattenJsonLdDocumentRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(FlattenJsonLdDocumentRequest)
```

**Signature**

```ts
declare class FlattenJsonLdDocumentRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L127)

Since v0.0.0

## FrameJsonLdDocumentRequest (class)

Frame JSON-LD document request.

**Example**

```ts
import { FrameJsonLdDocumentRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(FrameJsonLdDocumentRequest)
```

**Signature**

```ts
declare class FrameJsonLdDocumentRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L155)

Since v0.0.0

## JsonLdDocumentErrorReason

JSON-LD document error reason.

**Example**

```ts
import { JsonLdDocumentErrorReason } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentErrorReason)
```

**Signature**

```ts
declare const JsonLdDocumentErrorReason: AnnotatedSchema<LiteralKit<readonly ["invalidNodeReference", "unknownPredicate", "bridgingFailure", "framingFailure", "loaderPolicyViolation", "normalizationFailure"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L46)

Since v0.0.0

## JsonLdDocumentLoaderPolicy (class)

Bounded JSON-LD document loader policy.

**Example**

```ts
import { JsonLdDocumentLoaderPolicy } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentLoaderPolicy)
```

**Signature**

```ts
declare class JsonLdDocumentLoaderPolicy
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L182)

Since v0.0.0

## JsonLdDocumentNormalizationProfile

JSON-LD document normalization profile.

**Example**

```ts
import { JsonLdDocumentNormalizationProfile } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentNormalizationProfile)
```

**Signature**

```ts
declare const JsonLdDocumentNormalizationProfile: AnnotatedSchema<LiteralKit<readonly ["bounded-v1", "expanded-v1"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L210)

Since v0.0.0

## JsonLdDocumentNormalizationProfile (type alias)

Type for `JsonLdDocumentNormalizationProfile`.

**Example**

```ts
import type { JsonLdDocumentNormalizationProfile } from "@beep/semantic-web/services/jsonld-document"

const acceptJsonLdDocumentNormalizationProfile = (value: JsonLdDocumentNormalizationProfile) => value
console.log(acceptJsonLdDocumentNormalizationProfile)
```

**Signature**

```ts
type JsonLdDocumentNormalizationProfile = typeof JsonLdDocumentNormalizationProfile.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L230)

Since v0.0.0

## JsonLdDocumentResult (class)

JSON-LD document result wrapper.

**Example**

```ts
import { JsonLdDocumentResult } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentResult)
```

**Signature**

```ts
declare class JsonLdDocumentResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L356)

Since v0.0.0

## JsonLdDocumentService (class)

JSON-LD document service tag.

**Example**

```ts
import { JsonLdDocumentService } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdDocumentService)
```

**Signature**

```ts
declare class JsonLdDocumentService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L428)

Since v0.0.0

## JsonLdDocumentServiceShape (interface)

JSON-LD document service contract shape.

**Example**

```ts
import type { JsonLdDocumentServiceShape } from "@beep/semantic-web/services/jsonld-document"

const acceptJsonLdDocumentServiceShape = (value: JsonLdDocumentServiceShape) => value
console.log(acceptJsonLdDocumentServiceShape)
```

**Signature**

```ts
export interface JsonLdDocumentServiceShape {
  readonly compact: (request: CompactJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly expand: (request: ExpandJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly flatten: (request: FlattenJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly frame: (request: FrameJsonLdDocumentRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly fromRdf: (request: JsonLdFromRdfRequest) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly normalize: (
    request: NormalizeJsonLdDocumentRequest
  ) => Effect.Effect<JsonLdDocumentResult, JsonLdDocumentError>;
  readonly toRdf: (request: JsonLdToRdfRequest) => Effect.Effect<JsonLdToRdfResult, JsonLdDocumentError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L403)

Since v0.0.0

## JsonLdFromRdfRequest (class)

RDF to JSON-LD request.

**Example**

```ts
import { JsonLdFromRdfRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdFromRdfRequest)
```

**Signature**

```ts
declare class JsonLdFromRdfRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L329)

Since v0.0.0

## JsonLdToRdfRequest (class)

JSON-LD to RDF request.

**Example**

```ts
import { JsonLdToRdfRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdToRdfRequest)
```

**Signature**

```ts
declare class JsonLdToRdfRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L303)

Since v0.0.0

## JsonLdToRdfResult (class)

JSON-LD to RDF result wrapper.

**Example**

```ts
import { JsonLdToRdfResult } from "@beep/semantic-web/services/jsonld-document"

console.log(JsonLdToRdfResult)
```

**Signature**

```ts
declare class JsonLdToRdfResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L379)

Since v0.0.0

## NormalizeJsonLdDocumentRequest (class)

Normalize JSON-LD document request.

**Example**

```ts
import { NormalizeJsonLdDocumentRequest } from "@beep/semantic-web/services/jsonld-document"

console.log(NormalizeJsonLdDocumentRequest)
```

**Signature**

```ts
declare class NormalizeJsonLdDocumentRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-document.ts#L272)

Since v0.0.0