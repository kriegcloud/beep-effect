---
title: jsonld-context.ts
nav_order: 17
parent: "@beep/semantic-web"
---

## jsonld-context.ts overview

JSON-LD context service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [JsonLdContextError (class)](#jsonldcontexterror-class)
- [models](#models)
  - [CompactJsonLdIriRequest (class)](#compactjsonldirirequest-class)
  - [CompactJsonLdIriResult (class)](#compactjsonldiriresult-class)
  - [ExpandJsonLdTermRequest (class)](#expandjsonldtermrequest-class)
  - [ExpandJsonLdTermResult (class)](#expandjsonldtermresult-class)
  - [JsonLdContextErrorReason](#jsonldcontexterrorreason)
  - [JsonLdContextService (class)](#jsonldcontextservice-class)
  - [JsonLdContextServiceShape (interface)](#jsonldcontextserviceshape-interface)
  - [MergeJsonLdContextsRequest (class)](#mergejsonldcontextsrequest-class)
  - [NormalizeJsonLdContextRequest (class)](#normalizejsonldcontextrequest-class)
---

# error-handling

## JsonLdContextError (class)

Typed JSON-LD context service error.

**Example**

```ts
import { JsonLdContextError } from "@beep/semantic-web/services/jsonld-context"

console.log(JsonLdContextError)
```

**Signature**

```ts
declare class JsonLdContextError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L63)

Since v0.0.0

# models

## CompactJsonLdIriRequest (class)

Compact JSON-LD IRI request.

**Example**

```ts
import { CompactJsonLdIriRequest } from "@beep/semantic-web/services/jsonld-context"

console.log(CompactJsonLdIriRequest)
```

**Signature**

```ts
declare class CompactJsonLdIriRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L168)

Since v0.0.0

## CompactJsonLdIriResult (class)

Compact JSON-LD IRI result.

**Example**

```ts
import { CompactJsonLdIriResult } from "@beep/semantic-web/services/jsonld-context"

console.log(CompactJsonLdIriResult)
```

**Signature**

```ts
declare class CompactJsonLdIriResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L195)

Since v0.0.0

## ExpandJsonLdTermRequest (class)

Expand JSON-LD term request.

**Example**

```ts
import { ExpandJsonLdTermRequest } from "@beep/semantic-web/services/jsonld-context"

console.log(ExpandJsonLdTermRequest)
```

**Signature**

```ts
declare class ExpandJsonLdTermRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L117)

Since v0.0.0

## ExpandJsonLdTermResult (class)

Expand JSON-LD term result.

**Example**

```ts
import { ExpandJsonLdTermResult } from "@beep/semantic-web/services/jsonld-context"

console.log(ExpandJsonLdTermResult)
```

**Signature**

```ts
declare class ExpandJsonLdTermResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L144)

Since v0.0.0

## JsonLdContextErrorReason

JSON-LD context error reason.

**Example**

```ts
import { JsonLdContextErrorReason } from "@beep/semantic-web/services/jsonld-context"

console.log(JsonLdContextErrorReason)
```

**Signature**

```ts
declare const JsonLdContextErrorReason: AnnotatedSchema<LiteralKit<readonly ["unknownTerm", "policyViolation", "compactionFailure"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L44)

Since v0.0.0

## JsonLdContextService (class)

JSON-LD context service tag.

**Example**

```ts
import { JsonLdContextService } from "@beep/semantic-web/services/jsonld-context"

console.log(JsonLdContextService)
```

**Signature**

```ts
declare class JsonLdContextService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L267)

Since v0.0.0

## JsonLdContextServiceShape (interface)

JSON-LD context service contract shape.

**Example**

```ts
import type { JsonLdContextServiceShape } from "@beep/semantic-web/services/jsonld-context"

const acceptJsonLdContextServiceShape = (value: JsonLdContextServiceShape) => value
console.log(acceptJsonLdContextServiceShape)
```

**Signature**

```ts
export interface JsonLdContextServiceShape {
  readonly compactIri: (request: CompactJsonLdIriRequest) => Effect.Effect<CompactJsonLdIriResult, JsonLdContextError>;
  readonly expandTerm: (request: ExpandJsonLdTermRequest) => Effect.Effect<ExpandJsonLdTermResult, JsonLdContextError>;
  readonly merge: (request: MergeJsonLdContextsRequest) => Effect.Effect<JsonLdContext, JsonLdContextError>;
  readonly normalize: (request: NormalizeJsonLdContextRequest) => Effect.Effect<JsonLdContext, JsonLdContextError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L247)

Since v0.0.0

## MergeJsonLdContextsRequest (class)

Merge JSON-LD contexts request.

**Example**

```ts
import { MergeJsonLdContextsRequest } from "@beep/semantic-web/services/jsonld-context"

console.log(MergeJsonLdContextsRequest)
```

**Signature**

```ts
declare class MergeJsonLdContextsRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L219)

Since v0.0.0

## NormalizeJsonLdContextRequest (class)

Normalize JSON-LD context request.

**Example**

```ts
import { NormalizeJsonLdContextRequest } from "@beep/semantic-web/services/jsonld-context"

console.log(NormalizeJsonLdContextRequest)
```

**Signature**

```ts
declare class NormalizeJsonLdContextRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-context.ts#L89)

Since v0.0.0