---
title: XAi.models.ts
nav_order: 4
parent: "@beep/xai"
---

## XAi.models.ts overview

Schema-backed request and response models for the xAI driver.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [XAiBinaryResponse (class)](#xaibinaryresponse-class)
  - [XAiJsonResponse (class)](#xaijsonresponse-class)
  - [XAiNoBodyResponse (class)](#xainobodyresponse-class)
  - [XAiQueryValue](#xaiqueryvalue)
  - [XAiQueryValue (type alias)](#xaiqueryvalue-type-alias)
  - [XAiRequestOptions (class)](#xairequestoptions-class)
  - [XAiResponse](#xairesponse)
  - [XAiResponse (type alias)](#xairesponse-type-alias)
  - [XAiServerSentEvent (class)](#xaiserversentevent-class)
  - [XAiTextResponse (class)](#xaitextresponse-class)
  - [XAiWebSocketEvent](#xaiwebsocketevent)
  - [XAiWebSocketEvent (type alias)](#xaiwebsocketevent-type-alias)
  - [XAiWebSocketEventKind (type alias)](#xaiwebsocketeventkind-type-alias)
- [schemas](#schemas)
  - [XAiWebSocketEventKind](#xaiwebsocketeventkind)
---

# models

## XAiBinaryResponse (class)

Binary response returned by the xAI driver.

**Example**

```ts
import { XAiBinaryResponse } from "@beep/xai"

const response = new XAiBinaryResponse({
  bytes: new Uint8Array([1, 2, 3]),
  headers: {},
  status: 200
})

console.log(response)
```

**Signature**

```ts
declare class XAiBinaryResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L177)

Since v0.0.0

## XAiJsonResponse (class)

JSON response returned by the xAI driver.

**Example**

```ts
import { XAiJsonResponse } from "@beep/xai"

const response = new XAiJsonResponse({
  body: { ok: true },
  headers: {},
  status: 200
})

console.log(response)
```

**Signature**

```ts
declare class XAiJsonResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L113)

Since v0.0.0

## XAiNoBodyResponse (class)

Empty response returned by xAI endpoints that have no body.

**Example**

```ts
import { XAiNoBodyResponse } from "@beep/xai"

const response = new XAiNoBodyResponse({
  headers: {},
  status: 204
})

console.log(response)
```

**Signature**

```ts
declare class XAiNoBodyResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L208)

Since v0.0.0

## XAiQueryValue

URL query value accepted by xAI request options.

**Example**

```ts
import type { XAiQueryValue } from "@beep/xai"

const value: XAiQueryValue = ["invoice", "usage"]
console.log(value)
```

**Signature**

```ts
declare const XAiQueryValue: AnnotatedSchema<S.Union<readonly [S.$Array<S.Union<readonly [S.Boolean, S.Null, S.Finite, S.String]>>, S.Boolean, S.Null, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L29)

Since v0.0.0

## XAiQueryValue (type alias)

Type for `XAiQueryValue`.

**Example**

```ts
import type { XAiQueryValue } from "@beep/xai"

const value: XAiQueryValue = "usage"
console.log(value)
```

**Signature**

```ts
type XAiQueryValue = typeof XAiQueryValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L55)

Since v0.0.0

## XAiRequestOptions (class)

Request options accepted by every xAI endpoint method.

`path` fills route parameters, `query` fills URL parameters, `body` sends
JSON, `formData` sends multipart/form-data, and `bytes` sends raw binary.

**Example**

```ts
import { XAiRequestOptions } from "@beep/xai"

const request = XAiRequestOptions.make({
  body: { model: "grok-4", messages: [] },
  query: { limit: 10 }
})

console.log(request)
```

**Signature**

```ts
declare class XAiRequestOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L78)

Since v0.0.0

## XAiResponse

Response union returned by non-streaming xAI endpoint methods.

**Example**

```ts
import type { XAiResponse } from "@beep/xai"

const tag = (response: XAiResponse) => response._tag
console.log(tag)
```

**Signature**

```ts
declare const XAiResponse: AnnotatedSchema<S.Union<readonly [typeof XAiBinaryResponse, typeof XAiJsonResponse, typeof XAiNoBodyResponse, typeof XAiTextResponse]> & TaggedUnionUtils<"_tag", readonly [typeof XAiBinaryResponse, typeof XAiJsonResponse, typeof XAiNoBodyResponse, typeof XAiTextResponse], [typeof XAiBinaryResponse, typeof XAiJsonResponse, typeof XAiNoBodyResponse, typeof XAiTextResponse]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L234)

Since v0.0.0

## XAiResponse (type alias)

Type for `XAiResponse`.

**Example**

```ts
import { XAiJsonResponse } from "@beep/xai"
import type { XAiResponse } from "@beep/xai"

const response: XAiResponse = new XAiJsonResponse({
  body: { ok: true },
  headers: {},
  status: 200
})

console.log(response)
```

**Signature**

```ts
type XAiResponse = typeof XAiResponse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L261)

Since v0.0.0

## XAiServerSentEvent (class)

Parsed server-sent event emitted by streaming xAI endpoints.

**Example**

```ts
import { XAiServerSentEvent } from "@beep/xai"

const event = XAiServerSentEvent.make({
  data: { delta: "hello" },
  done: false,
  index: 0
})

console.log(event)
```

**Signature**

```ts
declare class XAiServerSentEvent
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L282)

Since v0.0.0

## XAiTextResponse (class)

Text response returned by the xAI driver.

**Example**

```ts
import { XAiTextResponse } from "@beep/xai"

const response = new XAiTextResponse({
  headers: {},
  status: 200,
  text: "ok"
})

console.log(response)
```

**Signature**

```ts
declare class XAiTextResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L145)

Since v0.0.0

## XAiWebSocketEvent

Event emitted by an xAI WebSocket endpoint session.

**Example**

```ts
import { XAiWebSocketEvent } from "@beep/xai"

const event: XAiWebSocketEvent = {
  kind: "message",
  text: "{\"type\":\"session.created\"}"
}

console.log(event)
```

**Signature**

```ts
declare const XAiWebSocketEvent: S.toTaggedUnion<"kind", readonly [S.Class<XAiWebSocketEventMember<"close">, S.Struct<{ bytes: S.optionalKey<S.Uint8Array>; code: S.optionalKey<S.Finite>; data: S.optionalKey<S.Unknown>; isBinary: S.optionalKey<S.Boolean>; kind: S.tag<"close">; reason: S.optionalKey<S.String>; text: S.optionalKey<S.String>; }>, {}>, S.Class<XAiWebSocketEventMember<"error">, S.Struct<{ bytes: S.optionalKey<S.Uint8Array>; code: S.optionalKey<S.Finite>; data: S.optionalKey<S.Unknown>; isBinary: S.optionalKey<S.Boolean>; kind: S.tag<"error">; reason: S.optionalKey<S.String>; text: S.optionalKey<S.String>; }>, {}>, S.Class<XAiWebSocketEventMember<"message">, S.Struct<{ bytes: S.optionalKey<S.Uint8Array>; code: S.optionalKey<S.Finite>; data: S.optionalKey<S.Unknown>; isBinary: S.optionalKey<S.Boolean>; kind: S.tag<"message">; reason: S.optionalKey<S.String>; text: S.optionalKey<S.String>; }>, {}>]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L357)

Since v0.0.0

## XAiWebSocketEvent (type alias)

Type for `XAiWebSocketEvent`.

**Example**

```ts
import type { XAiWebSocketEvent } from "@beep/xai"

const event: XAiWebSocketEvent = { kind: "message", text: "ok" }
console.log(event)
```

**Signature**

```ts
type XAiWebSocketEvent = typeof XAiWebSocketEvent.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L414)

Since v0.0.0

## XAiWebSocketEventKind (type alias)

Type for `XAiWebSocketEventKind`.

**Example**

```ts
import type { XAiWebSocketEventKind } from "@beep/xai"

const kind: XAiWebSocketEventKind = "message"
console.log(kind)
```

**Signature**

```ts
type XAiWebSocketEventKind = typeof XAiWebSocketEventKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L327)

Since v0.0.0

# schemas

## XAiWebSocketEventKind

WebSocket event kinds emitted by xAI realtime and streaming audio sessions.

**Example**

```ts
import type { XAiWebSocketEventKind } from "@beep/xai"

const kind: XAiWebSocketEventKind = "message"
console.log(kind)
```

**Signature**

```ts
declare const XAiWebSocketEventKind: AnnotatedSchema<LiteralKit<readonly ["close", "error", "message"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.models.ts#L307)

Since v0.0.0