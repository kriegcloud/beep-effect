---
title: XAi.service.ts
nav_order: 5
parent: "@beep/xai"
---

## XAi.service.ts overview

Effect service for xAI REST and WebSocket API endpoints.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [XAiEndpointMethod (type alias)](#xaiendpointmethod-type-alias)
  - [XAiHttpEndpointMethodName (type alias)](#xaihttpendpointmethodname-type-alias)
  - [XAiStreamMethod (type alias)](#xaistreammethod-type-alias)
  - [XAiWebSocketEndpointMethodName (type alias)](#xaiwebsocketendpointmethodname-type-alias)
  - [XAiWebSocketMethod (type alias)](#xaiwebsocketmethod-type-alias)
  - [XAiWebSocketSession (interface)](#xaiwebsocketsession-interface)
- [services](#services)
  - [XAi (class)](#xai-class)
  - [XAiShape (type alias)](#xaishape-type-alias)
---

# models

## XAiEndpointMethod (type alias)

Function shape used by every non-streaming xAI HTTP endpoint method.

**Example**

```ts
import { Effect } from "effect"
import type { XAiEndpointMethod } from "@beep/xai"
import { XAiNoBodyResponse } from "@beep/xai"

const method: XAiEndpointMethod = () =>
  Effect.succeed(XAiNoBodyResponse.make({ headers: {}, status: 204 }))

console.log(method)
```

**Signature**

```ts
type XAiEndpointMethod = (request?: XAiRequestOptions) => Effect.Effect<XAiResponse, XAiError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L93)

Since v0.0.0

## XAiHttpEndpointMethodName (type alias)

Endpoint method names backed by normal HTTP requests.

**Example**

```ts
import type { XAiHttpEndpointMethodName } from "@beep/xai"

const methodName: XAiHttpEndpointMethodName = "listModels"
console.log(methodName)
```

**Signature**

```ts
type XAiHttpEndpointMethodName = Exclude<
  XAiEndpointMethodName,
  "connectRealtimeVoice" | "connectStreamingStt" | "connectStreamingTts"
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L51)

Since v0.0.0

## XAiStreamMethod (type alias)

Function shape used by streaming xAI server-sent event helpers.

**Example**

```ts
import { Stream } from "effect"
import type { XAiStreamMethod } from "@beep/xai"

const stream: XAiStreamMethod = () => Stream.empty

console.log(stream)
```

**Signature**

```ts
type XAiStreamMethod = (request?: XAiRequestOptions) => Stream.Stream<XAiServerSentEvent, XAiError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L111)

Since v0.0.0

## XAiWebSocketEndpointMethodName (type alias)

Endpoint method names backed by WebSocket sessions.

**Example**

```ts
import type { XAiWebSocketEndpointMethodName } from "@beep/xai"

const methodName: XAiWebSocketEndpointMethodName = "connectRealtimeVoice"
console.log(methodName)
```

**Signature**

```ts
type XAiWebSocketEndpointMethodName = Extract<
  XAiEndpointMethodName,
  "connectRealtimeVoice" | "connectStreamingStt" | "connectStreamingTts"
>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L70)

Since v0.0.0

## XAiWebSocketMethod (type alias)

Function shape used by xAI WebSocket endpoint methods.

**Example**

```ts
import { Effect, Stream } from "effect"
import type { XAiWebSocketMethod } from "@beep/xai"

const connect: XAiWebSocketMethod = () =>
  Effect.succeed({
    close: () => Effect.void,
    events: Stream.empty,
    sendBytes: () => Effect.void,
    sendJson: () => Effect.void,
    sendText: () => Effect.void
  })

console.log(connect)
```

**Signature**

```ts
type XAiWebSocketMethod = (request?: XAiRequestOptions) => Effect.Effect<XAiWebSocketSession, XAiError>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L158)

Since v0.0.0

## XAiWebSocketSession (interface)

Active xAI WebSocket session handle.

**Example**

```ts
import type { XAiWebSocketSession } from "@beep/xai"

const sendDone = (session: XAiWebSocketSession) => session.sendJson({ type: "audio.done" })
console.log(sendDone)
```

**Signature**

```ts
export interface XAiWebSocketSession {
  readonly close: (code?: number, reason?: string) => Effect.Effect<void, never>;
  readonly events: Stream.Stream<XAiWebSocketEvent>;
  readonly sendBytes: (bytes: Uint8Array) => Effect.Effect<void, XAiError>;
  readonly sendJson: (body: unknown) => Effect.Effect<void, XAiError>;
  readonly sendText: (text: string) => Effect.Effect<void, XAiError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L127)

Since v0.0.0

# services

## XAi (class)

Effect service for all documented xAI API endpoints.

**Example**

```ts
import { Effect } from "effect"
import { XAi } from "@beep/xai"

const program = Effect.gen(function* () {
  const xai = yield* XAi
  return yield* xai.listModels()
})
```

**Signature**

```ts
declare class XAi
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L978)

Since v0.0.0

## XAiShape (type alias)

Public service shape for every documented xAI endpoint plus SSE helpers.

**Example**

```ts
import type { XAiShape } from "@beep/xai"

type XAiServiceKey = keyof XAiShape

const key: XAiServiceKey = "listModels"
console.log(key)
```

**Signature**

```ts
type XAiShape = {
  readonly [MethodName in XAiHttpEndpointMethodName]: XAiEndpointMethod;
} & {
  readonly [MethodName in XAiWebSocketEndpointMethodName]: XAiWebSocketMethod;
} & {
  readonly streamAnthropicMessage: XAiStreamMethod;
  readonly streamChatCompletion: XAiStreamMethod;
  readonly streamLegacyCompletion: XAiStreamMethod;
  readonly streamResponse: XAiStreamMethod;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/xai/src/XAi.service.ts#L176)

Since v0.0.0