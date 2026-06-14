---
title: Box.schemas.ts
nav_order: 8
parent: "@beep/box"
---

## Box.schemas.ts overview

Experimental effect/Schema models for Box Node SDK payloads.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [BoxApiError](#boxapierror)
  - [BoxSdkError](#boxsdkerror)
- [models](#models)
  - [AiAgentAsk](#aiagentask)
  - [RequestInfo (class)](#requestinfo-class)
  - [ResponseInfo (class)](#responseinfo-class)
  - [SerializedData](#serializeddata)
  - [SerializedDataList](#serializeddatalist)
  - [SerializedDataMap](#serializeddatamap)
- [type-level](#type-level)
  - [BoxApiError (type alias)](#boxapierror-type-alias)
  - [BoxSdkError (type alias)](#boxsdkerror-type-alias)
  - [SerializedData (type alias)](#serializeddata-type-alias)
  - [SerializedData (namespace)](#serializeddata-namespace)
    - [Encoded (type alias)](#encoded-type-alias)
  - [SerializedDataList (type alias)](#serializeddatalist-type-alias)
  - [SerializedDataList (namespace)](#serializeddatalist-namespace)
    - [Encoded (type alias)](#encoded-type-alias-1)
  - [SerializedDataMap (type alias)](#serializeddatamap-type-alias)
  - [SerializedDataMap (namespace)](#serializeddatamap-namespace)
    - [Encoded (type alias)](#encoded-type-alias-2)
---

# errors

## BoxApiError

Schema matching instances of the Box SDK's `BoxApiError` returned by the Box API.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const isBoxApiError = S.is(BoxSchemas.BoxApiError)
console.log(isBoxApiError(new Error("not a box api error")))
```

**Signature**

```ts
declare const BoxApiError: AnnotatedSchema<S.instanceOf<Box.BoxApiError, Box.BoxApiError>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L307)

Since v0.0.0

## BoxSdkError

Schema matching instances of the Box SDK's `BoxSdkError`.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const isBoxSdkError = S.is(BoxSchemas.BoxSdkError)
console.log(isBoxSdkError(new Error("not a box error")))
```

**Signature**

```ts
declare const BoxSdkError: AnnotatedSchema<S.instanceOf<Box.BoxSdkError, Box.BoxSdkError>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L278)

Since v0.0.0

# models

## AiAgentAsk

Schema matching instances of the Box SDK's `AiAgentAsk` AI-agent request configuration.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const isAiAgentAsk = S.is(BoxSchemas.AiAgentAsk)
console.log(isAiAgentAsk({ type: "ai_agent_ask" }))
```

**Signature**

```ts
declare const AiAgentAsk: AnnotatedSchema<S.instanceOf<BoxSchemas.AiAgentAsk, BoxSchemas.AiAgentAsk>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L336)

Since v0.0.0

## RequestInfo (class)

Schema class describing an outgoing Box API request: method, URL, query params, headers, and body.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"

const request = BoxSchemas.RequestInfo.make({
  method: "GET",
  url: new URL("https://api.box.com/2.0/users/me"),
  queryParams: {},
  headers: {}
})
console.log(request.url.href)
```

**Signature**

```ts
declare class RequestInfo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L218)

Since v0.0.0

## ResponseInfo (class)

Schema class describing a Box API response: status code, headers, body, and error context fields.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const isResponseInfo = S.is(BoxSchemas.ResponseInfo)
console.log(isResponseInfo({ statusCode: 0 }))
```

**Signature**

```ts
declare class ResponseInfo
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L247)

Since v0.0.0

## SerializedData

Recursive schema for serializable Box payload data: primitives, lists, and string-keyed maps.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const decoded = S.decodeUnknownSync(BoxSchemas.SerializedData)({ name: "report.pdf", size: 1024 })
console.log(decoded)
```

**Signature**

```ts
declare const SerializedData: AnnotatedSchema<S.Union<readonly [S.Undefined, S.Null, S.Boolean, S.Finite, S.String, S.suspend<S.Codec<SerializedDataList.Encoded, SerializedDataList.Encoded, never, never>>, S.suspend<S.Codec<SerializedDataMap.Encoded, SerializedDataMap.Encoded, never, never>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L63)

Since v0.0.0

## SerializedDataList

Schema for lists of serializable Box payload data.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataList)(["file.txt", 42, true])
console.log(decoded)
```

**Signature**

```ts
declare const SerializedDataList: AnnotatedSchema<S.$Array<S.suspend<S.Codec<SerializedData.Encoded, SerializedData.Encoded, never, never>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L125)

Since v0.0.0

## SerializedDataMap

Schema for string-keyed maps of serializable Box payload data.

**Example**

```ts
import * as BoxSchemas from "@beep/box/experimental/Box.schemas"
import * as S from "effect/Schema"

const decoded = S.decodeUnknownSync(BoxSchemas.SerializedDataMap)({ name: "report.pdf", size: 1024 })
console.log(decoded)
```

**Signature**

```ts
declare const SerializedDataMap: AnnotatedSchema<S.$Record<S.String, S.suspend<S.Codec<SerializedData.Encoded, SerializedData.Encoded, never, never>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L181)

Since v0.0.0

# type-level

## BoxApiError (type alias)

Type for `BoxApiError`. {@inheritDoc BoxApiError}

**Signature**

```ts
type BoxApiError = typeof BoxApiError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L319)

Since v0.0.0

## BoxSdkError (type alias)

Type for `BoxSdkError`. {@inheritDoc BoxSdkError}

**Signature**

```ts
type BoxSdkError = typeof BoxSdkError.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L290)

Since v0.0.0

## SerializedData (type alias)

Type for `SerializedData`. {@inheritDoc SerializedData}

**Signature**

```ts
type SerializedData = typeof SerializedData.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L84)

Since v0.0.0

## SerializedData (namespace)

Namespace for `SerializedData` containing the recursive encoded type.

**Example**

```ts
import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"

const encoded: BoxSchemas.SerializedData.Encoded = ["report.pdf", 1024, true, null]
console.log(encoded)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L31)

Since v0.0.0

### Encoded (type alias)

The encoded form of `SerializedData`, expressed recursively to break the schema cycle.

**Signature**

```ts
type Encoded = | undefined
    | null
    | boolean
    | number
    | string
    | SerializedDataList.Encoded
    | SerializedDataMap.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L38)

Since v0.0.0

## SerializedDataList (type alias)

Type for `SerializedDataList`. {@inheritDoc SerializedDataList}

**Signature**

```ts
type SerializedDataList = typeof SerializedDataList.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L138)

Since v0.0.0

## SerializedDataList (namespace)

Namespace for `SerializedDataList` containing the recursive encoded type.

**Example**

```ts
import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"

const encoded: BoxSchemas.SerializedDataList.Encoded = ["file.txt", 42, false]
console.log(encoded.length)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L100)

Since v0.0.0

### Encoded (type alias)

The encoded form of `SerializedDataList`: a readonly array of encoded serialized data.

**Signature**

```ts
type Encoded = readonly SerializedData.Encoded[]
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L107)

Since v0.0.0

## SerializedDataMap (type alias)

Type for `SerializedDataMap`. {@inheritDoc SerializedDataMap}

**Signature**

```ts
type SerializedDataMap = typeof SerializedDataMap.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L197)

Since v0.0.0

## SerializedDataMap (namespace)

Namespace for `SerializedDataMap` containing the recursive encoded type.

**Example**

```ts
import type * as BoxSchemas from "@beep/box/experimental/Box.schemas"

const encoded: BoxSchemas.SerializedDataMap.Encoded = { name: "report.pdf", size: 1024 }
console.log(encoded)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L154)

Since v0.0.0

### Encoded (type alias)

The encoded form of `SerializedDataMap`: string keys to encoded serialized data values.

**Signature**

```ts
type Encoded = {
    readonly [key: string]: SerializedData.Encoded;
  }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/box/src/experimental/Box.schemas.ts#L161)

Since v0.0.0