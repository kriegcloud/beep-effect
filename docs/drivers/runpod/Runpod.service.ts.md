---
title: Runpod.service.ts
nav_order: 5
parent: "@beep/runpod"
---

## Runpod.service.ts overview

Effect service for Runpod REST API v1 operations.

Since v0.1.0

---
## Exports Grouped by Category
- [models](#models)
  - [RunpodQueryScalar](#runpodqueryscalar)
  - [RunpodQueryScalar (type alias)](#runpodqueryscalar-type-alias)
  - [RunpodQueryValue](#runpodqueryvalue)
  - [RunpodQueryValue (type alias)](#runpodqueryvalue-type-alias)
  - [RunpodRawRequest (class)](#runpodrawrequest-class)
  - [RunpodRawResponse (class)](#runpodrawresponse-class)
- [services](#services)
  - [Runpod (class)](#runpod-class)
  - [RunpodShape (interface)](#runpodshape-interface)
---

# models

## RunpodQueryScalar

Scalar query values accepted by Runpod request models and raw requests.

**Example**

```ts
import { RunpodQueryScalar } from "@beep/runpod"

console.log(RunpodQueryScalar.ast)
```

**Signature**

```ts
declare const RunpodQueryScalar: AnnotatedSchema<S.Union<readonly [S.Boolean, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L40)

Since v0.1.0

## RunpodQueryScalar (type alias)

Type for `RunpodQueryScalar`.

**Example**

```ts
import type { RunpodQueryScalar } from "@beep/runpod"

const value: RunpodQueryScalar = "running"
console.log(value)
```

**Signature**

```ts
type RunpodQueryScalar = typeof RunpodQueryScalar.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L60)

Since v0.1.0

## RunpodQueryValue

Query value accepted by the raw Runpod request escape hatch.

**Example**

```ts
import { RunpodQueryValue } from "@beep/runpod"

console.log(RunpodQueryValue.ast)
```

**Signature**

```ts
declare const RunpodQueryValue: AnnotatedSchema<S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, S.Finite, S.String]>>, S.$Array<AnnotatedSchema<S.Union<readonly [S.Boolean, S.Finite, S.String]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L78)

Since v0.1.0

## RunpodQueryValue (type alias)

Type for `RunpodQueryValue`.

**Example**

```ts
import type { RunpodQueryValue } from "@beep/runpod"

const value: RunpodQueryValue = ["running", "stopped"]
console.log(value)
```

**Signature**

```ts
type RunpodQueryValue = typeof RunpodQueryValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L98)

Since v0.1.0

## RunpodRawRequest (class)

Raw Runpod HTTP request escape hatch for endpoints ahead of the checked-in OpenAPI document.

**Example**

```ts
import { RunpodRawRequest } from "@beep/runpod"

const request = RunpodRawRequest.make({
  method: "GET",
  path: "/health"
})
console.log(request.path)
```

**Signature**

```ts
declare class RunpodRawRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L117)

Since v0.1.0

## RunpodRawResponse (class)

Raw Runpod HTTP response returned by `Runpod.raw`.

**Example**

```ts
import { RunpodRawResponse } from "@beep/runpod"

const response = RunpodRawResponse.make({
  headers: {},
  status: 200,
  text: "ok"
})
console.log(response.status)
```

**Signature**

```ts
declare class RunpodRawResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L149)

Since v0.1.0

# services

## Runpod (class)

Effect service for all documented Runpod REST API v1 operations.

**Example**

```ts
import { Runpod, RunpodConfigInput } from "@beep/runpod"

const layer = Runpod.makeLayer(
  RunpodConfigInput.make({ apiUrl: "https://rest.runpod.io/v1" })
)
console.log(layer)
```

**Signature**

```ts
declare class Runpod
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L864)

Since v0.1.0

## RunpodShape (interface)

Public service shape for generated Runpod operations plus the raw request escape hatch.

**Example**

```ts
import type { RunpodShape } from "@beep/runpod"

type RawRequest = Parameters<RunpodShape["raw"]>[0]
type RawResponse = Awaited<ReturnType<RunpodShape["raw"]>>
console.log({} as { request: RawRequest; response: RawResponse })
```

**Signature**

```ts
export interface RunpodShape extends G.RunpodOperationsShape<RunpodError> {
  readonly raw: (request: RunpodRawRequest) => Effect.Effect<RunpodRawResponse, RunpodError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/runpod/src/Runpod.service.ts#L176)

Since v0.1.0