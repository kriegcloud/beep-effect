---
title: jsonld-stream-parse.ts
nav_order: 19
parent: "@beep/semantic-web"
---

## jsonld-stream-parse.ts overview

JSON-LD streaming parse service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [JsonLdStreamParseError (class)](#jsonldstreamparseerror-class)
- [models](#models)
  - [JsonLdByteChunkStream (class)](#jsonldbytechunkstream-class)
  - [JsonLdStreamMode](#jsonldstreammode)
  - [JsonLdStreamMode (type alias)](#jsonldstreammode-type-alias)
  - [JsonLdStreamParseErrorReason](#jsonldstreamparseerrorreason)
  - [JsonLdStreamParseInput](#jsonldstreamparseinput)
  - [JsonLdStreamParseInput (type alias)](#jsonldstreamparseinput-type-alias)
  - [JsonLdStreamParseRequest (class)](#jsonldstreamparserequest-class)
  - [JsonLdStreamParseResult (class)](#jsonldstreamparseresult-class)
  - [JsonLdStreamParseService (class)](#jsonldstreamparseservice-class)
  - [JsonLdStreamParseServiceShape (interface)](#jsonldstreamparseserviceshape-interface)
  - [JsonLdTextChunkStream (class)](#jsonldtextchunkstream-class)
---

# error-handling

## JsonLdStreamParseError (class)

Typed streaming parse error.

**Example**

```ts
import { JsonLdStreamParseError } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseError)
```

**Signature**

```ts
declare class JsonLdStreamParseError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L254)

Since v0.0.0

# models

## JsonLdByteChunkStream (class)

JSON-LD UTF-8 byte chunk stream.

**Example**

```ts
import { JsonLdByteChunkStream } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdByteChunkStream)
```

**Signature**

```ts
declare class JsonLdByteChunkStream
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L112)

Since v0.0.0

## JsonLdStreamMode

Streaming adapter mode.

**Example**

```ts
import { JsonLdStreamMode } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamMode)
```

**Signature**

```ts
declare const JsonLdStreamMode: AnnotatedSchema<LiteralKit<readonly ["true-streaming", "buffered-fallback"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L49)

Since v0.0.0

## JsonLdStreamMode (type alias)

Type for `JsonLdStreamMode`.

**Example**

```ts
import type { JsonLdStreamMode } from "@beep/semantic-web/services/jsonld-stream-parse"

const acceptJsonLdStreamMode = (value: JsonLdStreamMode) => value
console.log(acceptJsonLdStreamMode)
```

**Signature**

```ts
type JsonLdStreamMode = typeof JsonLdStreamMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L69)

Since v0.0.0

## JsonLdStreamParseErrorReason

Streaming parse error reason.

**Example**

```ts
import { JsonLdStreamParseErrorReason } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseErrorReason)
```

**Signature**

```ts
declare const JsonLdStreamParseErrorReason: AnnotatedSchema<LiteralKit<readonly ["parseFailure", "loaderPolicyViolation", "unsupportedEncoding"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L231)

Since v0.0.0

## JsonLdStreamParseInput

Streaming parse input union.

**Example**

```ts
import { JsonLdStreamParseInput } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseInput)
```

**Signature**

```ts
declare const JsonLdStreamParseInput: AnnotatedSchema<S.Union<readonly [typeof JsonLdTextChunkStream, typeof JsonLdByteChunkStream]> & TaggedUnionUtils<"kind", readonly [typeof JsonLdTextChunkStream, typeof JsonLdByteChunkStream], [typeof JsonLdTextChunkStream, typeof JsonLdByteChunkStream]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L140)

Since v0.0.0

## JsonLdStreamParseInput (type alias)

Type for `JsonLdStreamParseInput`.

**Example**

```ts
import type { JsonLdStreamParseInput } from "@beep/semantic-web/services/jsonld-stream-parse"

const acceptJsonLdStreamParseInput = (value: JsonLdStreamParseInput) => value
console.log(acceptJsonLdStreamParseInput)
```

**Signature**

```ts
type JsonLdStreamParseInput = typeof JsonLdStreamParseInput.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L161)

Since v0.0.0

## JsonLdStreamParseRequest (class)

Streaming parse request.

**Example**

```ts
import { JsonLdStreamParseRequest } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseRequest)
```

**Signature**

```ts
declare class JsonLdStreamParseRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L176)

Since v0.0.0

## JsonLdStreamParseResult (class)

Streaming parse result.

**Example**

```ts
import { JsonLdStreamParseResult } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseResult)
```

**Signature**

```ts
declare class JsonLdStreamParseResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L203)

Since v0.0.0

## JsonLdStreamParseService (class)

JSON-LD streaming parse service tag.

**Example**

```ts
import { JsonLdStreamParseService } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdStreamParseService)
```

**Signature**

```ts
declare class JsonLdStreamParseService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L300)

Since v0.0.0

## JsonLdStreamParseServiceShape (interface)

JSON-LD streaming parse service contract shape.

**Example**

```ts
import type { JsonLdStreamParseServiceShape } from "@beep/semantic-web/services/jsonld-stream-parse"

const acceptJsonLdStreamParseServiceShape = (value: JsonLdStreamParseServiceShape) => value
console.log(acceptJsonLdStreamParseServiceShape)
```

**Signature**

```ts
export interface JsonLdStreamParseServiceShape {
  readonly parse: (request: JsonLdStreamParseRequest) => Effect.Effect<JsonLdStreamParseResult, JsonLdStreamParseError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L283)

Since v0.0.0

## JsonLdTextChunkStream (class)

JSON-LD UTF-8 text chunk stream.

**Example**

```ts
import { JsonLdTextChunkStream } from "@beep/semantic-web/services/jsonld-stream-parse"

console.log(JsonLdTextChunkStream)
```

**Signature**

```ts
declare class JsonLdTextChunkStream
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/jsonld-stream-parse.ts#L84)

Since v0.0.0