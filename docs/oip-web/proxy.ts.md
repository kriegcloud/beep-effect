---
title: proxy.ts
nav_order: 18
parent: "@beep/oip-web"
---

## proxy.ts overview

Request proxy for dynamic OIP response security.

Since v0.0.0

---
## Exports Grouped by Category
- [configuration](#configuration)
  - [config](#config)
- [constructors](#constructors)
  - [proxy](#proxy)
---

# configuration

## config

Route matcher for the OIP CSP proxy.

**Example**

```ts
import { config } from "@beep/oip-web/proxy"

console.log(config.matcher[0]?.source)
```

**Signature**

```ts
declare const config: { matcher: Array<{ source: string; missing: Array<{ type: string; key: string; value?: undefined; } | { type: string; key: string; value: string; }>; }>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/proxy.ts#L106)

Since v0.0.0

# constructors

## proxy

Adds a per-request CSP nonce to OIP document responses.

**Example**

```ts
import type { NextRequest, NextResponse } from "next/server"
import { proxy } from "@beep/oip-web/proxy"

const handler: (request: NextRequest) => NextResponse = proxy
console.log(typeof handler)
```

**Signature**

```ts
declare const proxy: (request: NextRequest) => NextResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/proxy.ts#L75)

Since v0.0.0