---
title: jsonld-stream-serialize.ts
nav_order: 20
parent: "@beep/semantic-web"
---

## jsonld-stream-serialize.ts overview

JSON-LD streaming serialize service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [JsonLdStreamSerializeError (class)](#jsonldstreamserializeerror-class)
- [models](#models)
  - [JsonLdStreamSerializeErrorReason](#jsonldstreamserializeerrorreason)
  - [JsonLdStreamSerializeRequest (class)](#jsonldstreamserializerequest-class)
  - [JsonLdStreamSerializeResult (class)](#jsonldstreamserializeresult-class)
  - [JsonLdStreamSerializeService (class)](#jsonldstreamserializeservice-class)
  - [JsonLdStreamSerializeServiceShape (interface)](#jsonldstreamserializeserviceshape-interface)
---

# error-handling

## JsonLdStreamSerializeError (class)

Typed streaming serialize error.

**Example**

```ts
import { JsonLdStreamSerializeError } from "@beep/semantic-web/services/jsonld-stream-serialize"

console.log(JsonLdStreamSerializeError)
```

**Signature**

```ts
declare class JsonLdStreamSerializeError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L127)

Since v0.0.0

# models

## JsonLdStreamSerializeErrorReason

Streaming serialize error reason.

**Example**

```ts
import { JsonLdStreamSerializeErrorReason } from "@beep/semantic-web/services/jsonld-stream-serialize"

console.log(JsonLdStreamSerializeErrorReason)
```

**Signature**

```ts
declare const JsonLdStreamSerializeErrorReason: AnnotatedSchema<LiteralKit<readonly ["serializeFailure", "invalidChunkSize"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L108)

Since v0.0.0

## JsonLdStreamSerializeRequest (class)

Streaming serialize request.

**Example**

```ts
import { JsonLdStreamSerializeRequest } from "@beep/semantic-web/services/jsonld-stream-serialize"

console.log(JsonLdStreamSerializeRequest)
```

**Signature**

```ts
declare class JsonLdStreamSerializeRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L50)

Since v0.0.0

## JsonLdStreamSerializeResult (class)

Streaming serialize result.

**Example**

```ts
import { JsonLdStreamSerializeResult } from "@beep/semantic-web/services/jsonld-stream-serialize"

console.log(JsonLdStreamSerializeResult)
```

**Signature**

```ts
declare class JsonLdStreamSerializeResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L80)

Since v0.0.0

## JsonLdStreamSerializeService (class)

JSON-LD streaming serialize service tag.

**Example**

```ts
import { JsonLdStreamSerializeService } from "@beep/semantic-web/services/jsonld-stream-serialize"

console.log(JsonLdStreamSerializeService)
```

**Signature**

```ts
declare class JsonLdStreamSerializeService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L177)

Since v0.0.0

## JsonLdStreamSerializeServiceShape (interface)

JSON-LD streaming serialize service contract shape.

**Example**

```ts
import type { JsonLdStreamSerializeServiceShape } from "@beep/semantic-web/services/jsonld-stream-serialize"

const acceptJsonLdStreamSerializeServiceShape = (value: JsonLdStreamSerializeServiceShape) => value
console.log(acceptJsonLdStreamSerializeServiceShape)
```

**Signature**

```ts
export interface JsonLdStreamSerializeServiceShape {
  readonly serialize: (
    request: JsonLdStreamSerializeRequest
  ) => Effect.Effect<JsonLdStreamSerializeResult, JsonLdStreamSerializeError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-serialize.ts#L158)

Since v0.0.0