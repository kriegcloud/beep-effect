---
title: Sanity.service.ts
nav_order: 4
parent: "@beep/sanity"
---

## Sanity.service.ts overview

Effect service for Sanity content API requests.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [SanityQueryParamValue](#sanityqueryparamvalue)
  - [SanityQueryParamValue (type alias)](#sanityqueryparamvalue-type-alias)
  - [SanityQueryRequest (class)](#sanityqueryrequest-class)
  - [SanityQueryResponse (class)](#sanityqueryresponse-class)
- [services](#services)
  - [Sanity (class)](#sanity-class)
  - [SanityShape (type alias)](#sanityshape-type-alias)
---

# models

## SanityQueryParamValue

Scalar JSON value accepted in Sanity query params.

**Example**

```ts
import { SanityQueryParamValue } from "@beep/sanity"
import * as S from "effect/Schema"

const isQueryParamValue = S.is(SanityQueryParamValue)

console.log(isQueryParamValue("home")) // true
console.log(isQueryParamValue({ slug: "home" })) // false
```

**Signature**

```ts
declare const SanityQueryParamValue: AnnotatedSchema<S.Union<readonly [S.Boolean, S.Finite, S.String]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L43)

Since v0.0.0

## SanityQueryParamValue (type alias)

Type for `SanityQueryParamValue`.

**Example**

```ts
import type { SanityQueryParamValue } from "@beep/sanity"

const params = {
  draft: false,
  limit: 10,
  slug: "home"
} satisfies Record<string, SanityQueryParamValue>

console.log(params.slug) // "home"
```

**Signature**

```ts
type SanityQueryParamValue = typeof SanityQueryParamValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L68)

Since v0.0.0

## SanityQueryRequest (class)

Sanity GROQ query request.

**Example**

```ts
import { SanityQueryRequest } from "@beep/sanity"

const request = SanityQueryRequest.make({
  params: { slug: "home" },
  query: "*[_type == 'page' && slug.current == $slug][0]"
})

console.log(request.params?.slug) // "home"
```

**Signature**

```ts
declare class SanityQueryRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L88)

Since v0.0.0

## SanityQueryResponse (class)

Sanity query response.

**Example**

```ts
import { SanityQueryResponse } from "@beep/sanity"

const response = SanityQueryResponse.make({
  ms: 7,
  result: { title: "Home" }
})

console.log(response.ms) // 7
```

**Signature**

```ts
declare class SanityQueryResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L116)

Since v0.0.0

# services

## Sanity (class)

Effect service for Sanity content API requests.

**Example**

```ts
import { Sanity, SanityConfigInput, SanityQueryRequest } from "@beep/sanity"
import { Effect, Layer } from "effect"
import { FetchHttpClient } from "effect/unstable/http"

const layer = Sanity.makeLayer(
  SanityConfigInput.make({
    dataset: "production",
    projectId: "content-project"
  })
).pipe(Layer.provide(FetchHttpClient.layer))

const program = Effect.gen(function* () {
  const sanity = yield* Sanity
  return yield* sanity.fetch(SanityQueryRequest.make({ query: "*[]" }))
}).pipe(Effect.provide(layer))

console.log(Effect.isEffect(program)) // true
```

**Signature**

```ts
declare class Sanity
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L337)

Since v0.0.0

## SanityShape (type alias)

Public Sanity service shape.

**Example**

```ts
import { SanityQueryResponse, type SanityShape } from "@beep/sanity"
import { Effect } from "effect"

const service: SanityShape = {
  fetch: () => Effect.succeed(SanityQueryResponse.make({ result: [] }))
}

const program = service.fetch({ query: "*[]" })

console.log(Effect.runSync(program).result) // []
```

**Signature**

```ts
type SanityShape = {
  readonly fetch: (request: SanityQueryRequest) => Effect.Effect<SanityQueryResponse, SanityError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/sanity/src/Sanity.service.ts#L146)

Since v0.0.0