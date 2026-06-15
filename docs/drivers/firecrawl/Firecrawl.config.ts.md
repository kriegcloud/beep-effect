---
title: Firecrawl.config.ts
nav_order: 1
parent: "@beep/firecrawl"
---

## Firecrawl.config.ts overview

Runtime configuration models for the Firecrawl driver.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [FIRECRAWL_API_URL](#firecrawl_api_url)
- [models](#models)
  - [FirecrawlConfigInput (class)](#firecrawlconfiginput-class)
---

# constants

## FIRECRAWL_API_URL

Default Firecrawl API base URL used by the live driver layer.

**Example**

```ts
import { FIRECRAWL_API_URL } from "@beep/firecrawl"

console.log(FIRECRAWL_API_URL)
```

**Signature**

```ts
declare const FIRECRAWL_API_URL: "https://api.firecrawl.dev"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.config.ts#L26)

Since v0.0.0

# models

## FirecrawlConfigInput (class)

Runtime configuration accepted by `Firecrawl.makeLayer`.

**Example**

```ts
import { Redacted } from "effect"
import { FirecrawlConfigInput } from "@beep/firecrawl"

const config = FirecrawlConfigInput.make({
  apiKey: Redacted.make("fc-test-key")
})

console.log(config)
```

**Signature**

```ts
declare class FirecrawlConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/firecrawl/src/Firecrawl.config.ts#L46)

Since v0.0.0