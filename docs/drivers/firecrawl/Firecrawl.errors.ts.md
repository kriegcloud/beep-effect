---
title: Firecrawl.errors.ts
nav_order: 2
parent: "@beep/firecrawl"
---

## Firecrawl.errors.ts overview

Typed technical errors for the Firecrawl driver boundary.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [FirecrawlApiFailure (class)](#firecrawlapifailure-class)
  - [FirecrawlError (class)](#firecrawlerror-class)
  - [FirecrawlErrorOptions (class)](#firecrawlerroroptions-class)
- [models](#models)
  - [FirecrawlErrorReason (type alias)](#firecrawlerrorreason-type-alias)
  - [FirecrawlMethodName (type alias)](#firecrawlmethodname-type-alias)
- [schemas](#schemas)
  - [FirecrawlErrorReason](#firecrawlerrorreason)
  - [FirecrawlMethodName](#firecrawlmethodname)
---

# errors

## FirecrawlApiFailure (class)

Decoded Firecrawl API failure body.

**Example**

```ts
import { FirecrawlApiFailure } from "@beep/firecrawl"
import * as O from "effect/Option"

const failure = FirecrawlApiFailure.make({
  code: O.none(),
  details: O.none(),
  error: "Unauthorized",
  status: O.none(),
  success: false
})

console.log(failure.error)
```

**Signature**

```ts
declare class FirecrawlApiFailure
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L163)

Since v0.0.0

## FirecrawlError (class)

Technical failure raised by the Firecrawl driver boundary.

**Example**

```ts
import { FirecrawlError } from "@beep/firecrawl"

const error = FirecrawlError.fromReason("transport", { method: "scrape" })
console.log(error.reason)
```

**Signature**

```ts
declare class FirecrawlError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L239)

Since v0.0.0

## FirecrawlErrorOptions (class)

Options used when constructing Firecrawl driver errors.

**Example**

```ts
import { FirecrawlErrorOptions } from "@beep/firecrawl"
import * as O from "effect/Option"

const options = FirecrawlErrorOptions.make({
  cause: O.none(),
  failure: O.none(),
  method: O.some("scrape"),
  retryAfterSeconds: O.none(),
  retryable: O.none(),
  sdkVersion: O.none(),
  status: O.some(429)
})

console.log(options.status)
```

**Signature**

```ts
declare class FirecrawlErrorOptions
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L200)

Since v0.0.0

# models

## FirecrawlErrorReason (type alias)

Type for `FirecrawlErrorReason`.

**Example**

```ts
import type { FirecrawlErrorReason } from "@beep/firecrawl"

const reason: FirecrawlErrorReason = "response status"
console.log(reason)
```

**Signature**

```ts
type FirecrawlErrorReason = typeof FirecrawlErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L139)

Since v0.0.0

## FirecrawlMethodName (type alias)

Type for `FirecrawlMethodName`.

**Example**

```ts
import type { FirecrawlMethodName } from "@beep/firecrawl"

const method: FirecrawlMethodName = "scrape"
console.log(method)
```

**Signature**

```ts
type FirecrawlMethodName = typeof FirecrawlMethodName.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L93)

Since v0.0.0

# schemas

## FirecrawlErrorReason

Technical error reasons emitted by the Firecrawl driver.

**Example**

```ts
import { FirecrawlErrorReason } from "@beep/firecrawl"

console.log(FirecrawlErrorReason.is.transport("transport"))
```

**Signature**

```ts
declare const FirecrawlErrorReason: AnnotatedSchema<LiteralKit<readonly ["config", "request encoding", "response decoding", "response status", "transport", "sdk thrown", "schema decoding", "watcher", "timeout", "interrupted"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L108)

Since v0.0.0

## FirecrawlMethodName

Firecrawl SDK methods wrapped by this driver.

**Example**

```ts
import { FirecrawlMethodName } from "@beep/firecrawl"

console.log(FirecrawlMethodName.is.scrape("scrape"))
```

**Signature**

```ts
declare const FirecrawlMethodName: AnnotatedSchema<LiteralKit<readonly ["scrape", "interact", "stopInteraction", "parse", "search", "map", "startCrawl", "getCrawlStatus", "cancelCrawl", "crawl", "getCrawlErrors", "getActiveCrawls", "crawlParamsPreview", "createMonitor", "listMonitors", "getMonitor", "updateMonitor", "deleteMonitor", "runMonitor", "listMonitorChecks", "getMonitorCheck", "startBatchScrape", "getBatchScrapeStatus", "getBatchScrapeErrors", "cancelBatchScrape", "batchScrape", "startAgent", "getAgentStatus", "agent", "cancelAgent", "browser", "browserExecute", "deleteBrowser", "listBrowsers", "getConcurrency", "getCreditUsage", "getTokenUsage", "getCreditUsageHistorical", "getTokenUsageHistorical", "getQueueStatus", "watcher"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.errors.ts#L31)

Since v0.0.0