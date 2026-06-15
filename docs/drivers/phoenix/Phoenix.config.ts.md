---
title: Phoenix.config.ts
nav_order: 2
parent: "@beep/phoenix"
---

## Phoenix.config.ts overview

Runtime configuration models for the Phoenix driver.

Since v0.0.0

---
## Exports Grouped by Category
- [constants](#constants)
  - [PHOENIX_API_URL](#phoenix_api_url)
- [models](#models)
  - [PhoenixConfigInput (class)](#phoenixconfiginput-class)
---

# constants

## PHOENIX_API_URL

Default Phoenix HTTP API base URL.

**Example**

```ts
import { PHOENIX_API_URL } from "@beep/phoenix"

console.log(PHOENIX_API_URL)
```

**Signature**

```ts
declare const PHOENIX_API_URL: "http://localhost:6006"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.config.ts#L26)

Since v0.0.0

# models

## PhoenixConfigInput (class)

Runtime configuration accepted by `Phoenix.makeLayer`.

**Example**

```ts
import { Redacted } from "effect"
import { PhoenixConfigInput } from "@beep/phoenix"

const config = PhoenixConfigInput.make({
  apiKey: Redacted.make("test-key"),
  baseUrl: "https://phoenix.test"
})

console.log(config.baseUrl)
```

**Signature**

```ts
declare class PhoenixConfigInput
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/phoenix/src/Phoenix.config.ts#L47)

Since v0.0.0