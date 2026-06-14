---
title: index.ts
nav_order: 5
parent: "@beep/firecrawl"
---

## index.ts overview

Firecrawl driver configuration exports.

**Example**

```ts
import { FirecrawlConfigInput } from "@beep/firecrawl"

console.log(FirecrawlConfigInput)
```

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [VERSION](#version)
- [errors](#errors)
  - ["./Firecrawl.errors.ts" (namespace export)](#firecrawlerrorsts-namespace-export)
- [models](#models)
  - ["./Firecrawl.config.ts" (namespace export)](#firecrawlconfigts-namespace-export)
  - ["./Firecrawl.models.ts" (namespace export)](#firecrawlmodelsts-namespace-export)
- [services](#services)
  - ["./Firecrawl.service.ts" (namespace export)](#firecrawlservicets-namespace-export)
---

# constants

## VERSION

Package version for `@beep/firecrawl`.

**Example**

```ts
import { VERSION } from "@beep/firecrawl"

console.log(VERSION)
```

**Signature**

```ts
declare const VERSION: "0.0.0"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/index.ts#L78)

Since v0.0.0

# errors

## "./Firecrawl.errors.ts" (namespace export)

Re-exports all named exports from the "./Firecrawl.errors.ts" module.

**Example**

```ts
import { FirecrawlError } from "@beep/firecrawl"

console.log(FirecrawlError)
```

**Signature**

```ts
export * from "./Firecrawl.errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/index.ts#L35)

Since v0.0.0

# models

## "./Firecrawl.config.ts" (namespace export)

Re-exports all named exports from the "./Firecrawl.config.ts" module.

**Example**

```ts
import { FirecrawlConfigInput } from "@beep/firecrawl"

console.log(FirecrawlConfigInput)
```

**Signature**

```ts
export * from "./Firecrawl.config.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/index.ts#L21)

Since v0.0.0

## "./Firecrawl.models.ts" (namespace export)

Re-exports all named exports from the "./Firecrawl.models.ts" module.

**Example**

```ts
import { FirecrawlScrapePayload } from "@beep/firecrawl"

console.log(FirecrawlScrapePayload)
```

**Signature**

```ts
export * from "./Firecrawl.models.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/index.ts#L49)

Since v0.0.0

# services

## "./Firecrawl.service.ts" (namespace export)

Re-exports all named exports from the "./Firecrawl.service.ts" module.

**Example**

```ts
import { Firecrawl } from "@beep/firecrawl"

console.log(Firecrawl)
```

**Signature**

```ts
export * from "./Firecrawl.service.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/index.ts#L63)

Since v0.0.0