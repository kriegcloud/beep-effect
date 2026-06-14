---
title: sparql-query.ts
nav_order: 23
parent: "@beep/semantic-web"
---

## sparql-query.ts overview

Minimal engine-agnostic SPARQL query service contract.

Since v0.0.0

---
## Exports Grouped by Category
- [error-handling](#error-handling)
  - [SparqlQueryError (class)](#sparqlqueryerror-class)
- [layers](#layers)
  - [UnsupportedSparqlQueryServiceLive](#unsupportedsparqlqueryservicelive)
- [models](#models)
  - [SparqlAskResult (class)](#sparqlaskresult-class)
  - [SparqlConstructResult (class)](#sparqlconstructresult-class)
  - [SparqlQueryProfile](#sparqlqueryprofile)
  - [SparqlQueryRequest (class)](#sparqlqueryrequest-class)
  - [SparqlQueryResult](#sparqlqueryresult)
  - [SparqlQueryResult (type alias)](#sparqlqueryresult-type-alias)
  - [SparqlQueryService (class)](#sparqlqueryservice-class)
  - [SparqlQueryServiceShape (interface)](#sparqlqueryserviceshape-interface)
  - [SparqlSelectResult (class)](#sparqlselectresult-class)
---

# error-handling

## SparqlQueryError (class)

Typed SPARQL query error.

**Example**

```ts
import { SparqlQueryError } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlQueryError)
```

**Signature**

```ts
declare class SparqlQueryError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L195)

Since v0.0.0

# layers

## UnsupportedSparqlQueryServiceLive

Unsupported default live layer for the minimal v1 SPARQL contract.

**Example**

```ts
import { UnsupportedSparqlQueryServiceLive } from "@beep/semantic-web/services/sparql-query"

console.log(UnsupportedSparqlQueryServiceLive)
```

**Signature**

```ts
declare const UnsupportedSparqlQueryServiceLive: Layer.Layer<SparqlQueryService, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L255)

Since v0.0.0

# models

## SparqlAskResult (class)

SPARQL ask result.

**Example**

```ts
import { SparqlAskResult } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlAskResult)
```

**Signature**

```ts
declare class SparqlAskResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L111)

Since v0.0.0

## SparqlConstructResult (class)

SPARQL construct result.

**Example**

```ts
import { SparqlConstructResult } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlConstructResult)
```

**Signature**

```ts
declare class SparqlConstructResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L135)

Since v0.0.0

## SparqlQueryProfile

Minimal v1 SPARQL profile.

**Example**

```ts
import { SparqlQueryProfile } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlQueryProfile)
```

**Signature**

```ts
declare const SparqlQueryProfile: AnnotatedSchema<LiteralKit<readonly ["select", "ask", "construct"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L42)

Since v0.0.0

## SparqlQueryRequest (class)

SPARQL query request.

**Example**

```ts
import { SparqlQueryRequest } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlQueryRequest)
```

**Signature**

```ts
declare class SparqlQueryRequest
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L61)

Since v0.0.0

## SparqlQueryResult

SPARQL result union.

**Example**

```ts
import { SparqlQueryResult } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlQueryResult)
```

**Signature**

```ts
declare const SparqlQueryResult: AnnotatedSchema<S.Union<readonly [typeof SparqlSelectResult, typeof SparqlAskResult, typeof SparqlConstructResult]> & TaggedUnionUtils<"profile", readonly [typeof SparqlSelectResult, typeof SparqlAskResult, typeof SparqlConstructResult], [typeof SparqlSelectResult, typeof SparqlAskResult, typeof SparqlConstructResult]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L159)

Since v0.0.0

## SparqlQueryResult (type alias)

Type for `SparqlQueryResult`.

**Example**

```ts
import type { SparqlQueryResult } from "@beep/semantic-web/services/sparql-query"

const acceptSparqlQueryResult = (value: SparqlQueryResult) => value
console.log(acceptSparqlQueryResult)
```

**Signature**

```ts
type SparqlQueryResult = typeof SparqlQueryResult.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L180)

Since v0.0.0

## SparqlQueryService (class)

SPARQL query service tag.

**Example**

```ts
import { SparqlQueryService } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlQueryService)
```

**Signature**

```ts
declare class SparqlQueryService
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L238)

Since v0.0.0

## SparqlQueryServiceShape (interface)

SPARQL query service contract shape.

**Example**

```ts
import type { SparqlQueryServiceShape } from "@beep/semantic-web/services/sparql-query"

const acceptSparqlQueryServiceShape = (value: SparqlQueryServiceShape) => value
console.log(acceptSparqlQueryServiceShape)
```

**Signature**

```ts
export interface SparqlQueryServiceShape {
  readonly execute: (request: SparqlQueryRequest) => Effect.Effect<SparqlQueryResult, SparqlQueryError>;
}
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L221)

Since v0.0.0

## SparqlSelectResult (class)

SPARQL select result.

**Example**

```ts
import { SparqlSelectResult } from "@beep/semantic-web/services/sparql-query"

console.log(SparqlSelectResult)
```

**Signature**

```ts
declare class SparqlSelectResult
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/capability/semantic-web/src/services/sparql-query.ts#L87)

Since v0.0.0