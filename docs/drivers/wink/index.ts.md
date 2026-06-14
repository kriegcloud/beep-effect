---
title: index.ts
nav_order: 1
parent: "@beep/wink"
---

## index.ts overview

Package version constant.

**Example**

```ts
import { VERSION } from "@beep/wink"

console.log(VERSION)
```

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [VERSION](#version)
- [errors](#errors)
  - ["./Wink.errors.ts" (namespace export)](#winkerrorsts-namespace-export)
- [layers](#layers)
  - [WinkLayerAllLive](#winklayeralllive)
  - [WinkLayerLive](#winklayerlive)
- [models](#models)
  - ["./Wink.models.ts" (namespace export)](#winkmodelsts-namespace-export)
- [observability](#observability)
  - ["./WinkObservability.ts" (namespace export)](#winkobservabilityts-namespace-export)
- [services](#services)
  - ["./Wink.service.ts" (namespace export)](#winkservicets-namespace-export)
  - ["./WinkBackend.service.ts" (namespace export)](#winkbackendservicets-namespace-export)
  - ["./WinkCorpus.service.ts" (namespace export)](#winkcorpusservicets-namespace-export)
  - ["./WinkSimilarity.service.ts" (namespace export)](#winksimilarityservicets-namespace-export)
  - ["./WinkTokenization.service.ts" (namespace export)](#winktokenizationservicets-namespace-export)
  - ["./WinkTools.service.ts" (namespace export)](#winktoolsservicets-namespace-export)
  - ["./WinkVectorizer.service.ts" (namespace export)](#winkvectorizerservicets-namespace-export)
  - [WinkEngineRef](#winkengineref)
  - [WinkEngineRefLive](#winkenginereflive)
- [utilities](#utilities)
  - ["./WinkUtils.service.ts" (namespace export)](#winkutilsservicets-namespace-export)
---

# configuration

## VERSION

Package version constant.

**Example**

```ts
import { VERSION } from "@beep/wink"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L21)

Since v0.0.0

# errors

## "./Wink.errors.ts" (namespace export)

Re-exports all named exports from the "./Wink.errors.ts" module.

**Signature**

```ts
export * from "./Wink.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L27)

Since v0.0.0

# layers

## WinkLayerAllLive

**Signature**

```ts
declare const WinkLayerAllLive: Layer<Tokenization | WinkEngine | WinkCorpusManager | WinkSimilarity | WinkEngineRef | WinkVectorizer | WinkUtils, WinkEngineError | CorpusManagerError | SimilarityError | VectorizerError | WinkUtilsError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L32)

Since v0.0.0

## WinkLayerLive

**Signature**

```ts
declare const WinkLayerLive: Layer<Tokenization | WinkEngine, WinkEngineError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L32)

Since v0.0.0

# models

## "./Wink.models.ts" (namespace export)

Re-exports all named exports from the "./Wink.models.ts" module.

**Signature**

```ts
export * from "./Wink.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L37)

Since v0.0.0

# observability

## "./WinkObservability.ts" (namespace export)

Re-exports all named exports from the "./WinkObservability.ts" module.

**Signature**

```ts
export * from "./WinkObservability.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L62)

Since v0.0.0

# services

## "./Wink.service.ts" (namespace export)

Re-exports all named exports from the "./Wink.service.ts" module.

**Signature**

```ts
export * from "./Wink.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L42)

Since v0.0.0

## "./WinkBackend.service.ts" (namespace export)

Re-exports all named exports from the "./WinkBackend.service.ts" module.

**Signature**

```ts
export * from "./WinkBackend.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L47)

Since v0.0.0

## "./WinkCorpus.service.ts" (namespace export)

Re-exports all named exports from the "./WinkCorpus.service.ts" module.

**Signature**

```ts
export * from "./WinkCorpus.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L52)

Since v0.0.0

## "./WinkSimilarity.service.ts" (namespace export)

Re-exports all named exports from the "./WinkSimilarity.service.ts" module.

**Signature**

```ts
export * from "./WinkSimilarity.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L67)

Since v0.0.0

## "./WinkTokenization.service.ts" (namespace export)

Re-exports all named exports from the "./WinkTokenization.service.ts" module.

**Signature**

```ts
export * from "./WinkTokenization.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L72)

Since v0.0.0

## "./WinkTools.service.ts" (namespace export)

Re-exports all named exports from the "./WinkTools.service.ts" module.

**Signature**

```ts
export * from "./WinkTools.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L77)

Since v0.0.0

## "./WinkVectorizer.service.ts" (namespace export)

Re-exports all named exports from the "./WinkVectorizer.service.ts" module.

**Signature**

```ts
export * from "./WinkVectorizer.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L87)

Since v0.0.0

## WinkEngineRef

**Signature**

```ts
declare const WinkEngineRef: typeof WinkEngineRef
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L57)

Since v0.0.0

## WinkEngineRefLive

**Signature**

```ts
declare const WinkEngineRefLive: Layer<WinkEngineRef, never, WinkEngine>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L57)

Since v0.0.0

# utilities

## "./WinkUtils.service.ts" (namespace export)

Re-exports all named exports from the "./WinkUtils.service.ts" module.

**Signature**

```ts
export * from "./WinkUtils.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/wink/src/index.ts#L82)

Since v0.0.0