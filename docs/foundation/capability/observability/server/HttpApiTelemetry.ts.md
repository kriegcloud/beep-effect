---
title: HttpApiTelemetry.ts
nav_order: 15
parent: "@beep/observability"
---

## HttpApiTelemetry.ts overview

HTTP API telemetry descriptors, metrics, and middleware helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [layers](#layers)
  - [layerHttpApiTelemetryMiddleware](#layerhttpapitelemetrymiddleware)
- [models](#models)
  - [HttpApiTelemetryDescriptor (class)](#httpapitelemetrydescriptor-class)
- [observability](#observability)
  - [httpApiFailureStatus](#httpapifailurestatus)
  - [httpApiSuccessStatus](#httpapisuccessstatus)
  - [makeHttpApiMetrics](#makehttpapimetrics)
  - [makeHttpApiTelemetryDescriptor](#makehttpapitelemetrydescriptor)
  - [observeHttpApiEffect](#observehttpapieffect)
  - [observeHttpApiHandler](#observehttpapihandler)
- [services](#services)
  - [HttpApiTelemetryMiddleware (class)](#httpapitelemetrymiddleware-class)
---

# layers

## layerHttpApiTelemetryMiddleware

Build a layer that instruments all endpoints where the middleware is
applied.

**Example**

```ts
```typescript
import { makeHttpApiMetrics, layerHttpApiTelemetryMiddleware } from "@beep/observability/server"

const metrics = makeHttpApiMetrics("todox_api")
const TelemetryLive = layerHttpApiTelemetryMiddleware({
  apiName: "TodoApi",
  metrics,
})
console.log(TelemetryLive)
```
```

**Signature**

```ts
declare const layerHttpApiTelemetryMiddleware: (options: HttpApiTelemetryMiddlewareOptions) => Layer.Layer<HttpApiTelemetryMiddleware>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L539)

Since v0.0.0

# models

## HttpApiTelemetryDescriptor (class)

Shared HTTP API telemetry descriptor.

**Example**

```ts
```typescript
import { NonNegativeInt } from "@beep/schema"
import * as S from "effect/Schema"
import { HttpApiTelemetryDescriptor } from "@beep/observability/server"

const successStatus = S.decodeUnknownSync(NonNegativeInt)(201)
const descriptor = HttpApiTelemetryDescriptor.make({
  apiName: "TodoApi",
  endpointName: "createTodo",
  groupName: "todos",
  method: "POST",
  route: "/todos",
  successStatus
})
console.log(descriptor.route)
```
```

**Signature**

```ts
declare class HttpApiTelemetryDescriptor
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L61)

Since v0.0.0

# observability

## httpApiFailureStatus

Resolve the concrete status of a failed HTTP API effect from the runtime
error first, then from matching endpoint error schemas.

**Example**

```ts
```typescript
import { httpApiFailureStatus } from "@beep/observability/server"
import type { HttpApiEndpoint } from "effect/unstable/httpapi"

declare const endpoint: HttpApiEndpoint.AnyWithProps
const status = httpApiFailureStatus(endpoint, new Error("not found"))
console.log(status)
```
```

**Signature**

```ts
declare const httpApiFailureStatus: { (endpoint: HttpApiEndpoint.AnyWithProps, error: unknown): number | undefined; (error: unknown): (endpoint: HttpApiEndpoint.AnyWithProps) => number | undefined; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L309)

Since v0.0.0

## httpApiSuccessStatus

Resolve the declared success status from an HttpApiSchema value.

**Example**

```ts
```typescript
import * as S from "effect/Schema"
import { httpApiSuccessStatus } from "@beep/observability/server"

const status = httpApiSuccessStatus(S.String, 200)
console.log(status)
```
```

**Signature**

```ts
declare const httpApiSuccessStatus: (schema: S.Top, fallback?: number) => NonNegativeInt
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L150)

Since v0.0.0

## makeHttpApiMetrics

Create a reusable HTTP API metric set for one metric prefix.

**Example**

```ts
```typescript
import { makeHttpApiMetrics } from "@beep/observability/server"

const metrics = makeHttpApiMetrics("todox_api")
console.log(metrics.requestsTotal)
```
```

**Signature**

```ts
declare const makeHttpApiMetrics: (prefix: string, descriptionPrefix?: string) => HttpApiMetricSet
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L192)

Since v0.0.0

## makeHttpApiTelemetryDescriptor

Create a telemetry descriptor directly from Effect HttpApi metadata.

**Example**

```ts
```typescript
import { makeHttpApiTelemetryDescriptor } from "@beep/observability/server"
import type { HttpApiGroup, HttpApiEndpoint } from "effect/unstable/httpapi"

declare const group: HttpApiGroup.AnyWithProps
declare const endpoint: HttpApiEndpoint.AnyWithProps
const descriptor = makeHttpApiTelemetryDescriptor("TodoApi", group, endpoint)
console.log(descriptor.endpointName)
```
```

**Signature**

```ts
declare const makeHttpApiTelemetryDescriptor: { (apiName: string, group: HttpApiGroup.AnyWithProps, endpoint: HttpApiEndpoint.AnyWithProps): HttpApiTelemetryDescriptor; (group: HttpApiGroup.AnyWithProps, endpoint: HttpApiEndpoint.AnyWithProps): (apiName: string) => HttpApiTelemetryDescriptor; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L271)

Since v0.0.0

## observeHttpApiEffect

Observes an HTTP API Effect and records request metrics.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { NonNegativeInt } from "@beep/schema"
import * as S from "effect/Schema"
import {
  HttpApiTelemetryDescriptor,
  makeHttpApiMetrics,
  observeHttpApiEffect
} from "@beep/observability/server"
import type { HttpApiEndpoint } from "effect/unstable/httpapi"
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"

declare const endpoint: HttpApiEndpoint.AnyWithProps
const successStatus = S.decodeUnknownSync(NonNegativeInt)(200)
const descriptor = HttpApiTelemetryDescriptor.make({
  apiName: "TodoApi",
  endpointName: "listTodos",
  groupName: "todos",
  method: "GET",
  route: "/todos",
  successStatus
})
const metrics = makeHttpApiMetrics("todo_api")
const observed = observeHttpApiEffect(
  Effect.succeed(HttpServerResponse.empty({ status: 200 })),
  { descriptor, endpoint, metrics }
)
console.log(observed)
```
```

**Signature**

```ts
declare const observeHttpApiEffect: { <E, R>(effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>, options: ObserveHttpApiEffectOptions): Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>; (options: ObserveHttpApiEffectOptions): <E, R>(effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L462)

Since v0.0.0

## observeHttpApiHandler

Observes an HTTP API handler Effect and records request metrics.

**Example**

```ts
```typescript
import { Effect } from "effect"
import { NonNegativeInt } from "@beep/schema"
import * as S from "effect/Schema"
import {
  HttpApiTelemetryDescriptor,
  makeHttpApiMetrics,
  observeHttpApiHandler
} from "@beep/observability/server"

const successStatus = S.decodeUnknownSync(NonNegativeInt)(200)
const descriptor = HttpApiTelemetryDescriptor.make({
  apiName: "TodoApi",
  endpointName: "listTodos",
  groupName: "todos",
  method: "GET",
  route: "/todos",
  successStatus
})
const metrics = makeHttpApiMetrics("todo_api")
const observed = observeHttpApiHandler(
  descriptor,
  metrics,
  Effect.succeed({ status: 200 })
)
console.log(Effect.runPromise(observed))
```
```

**Signature**

```ts
declare const observeHttpApiHandler: { <A, E extends { readonly status: number; }, R>(effect: Effect.Effect<A, E, R>, options: ObserveHttpApiHandlerOptions): Effect.Effect<A, E, R>; (options: ObserveHttpApiHandlerOptions): <A, E extends { readonly status: number; }, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>; <A, E extends { readonly status: number; }, R>(descriptor: HttpApiTelemetryDescriptor, metrics: HttpApiMetricSet, effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L650)

Since v0.0.0

# services

## HttpApiTelemetryMiddleware (class)

Shared server-side HttpApi middleware service for request metrics, span
annotations, and log correlation.

**Example**

```ts
```typescript
import { HttpApiTelemetryMiddleware } from "@beep/observability/server"

console.log(HttpApiTelemetryMiddleware)
```
```

**Signature**

```ts
declare class HttpApiTelemetryMiddleware
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/observability/src/server/HttpApiTelemetry.ts#L516)

Since v0.0.0