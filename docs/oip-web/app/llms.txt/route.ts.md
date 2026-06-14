---
title: route.ts
nav_order: 3
parent: "@beep/oip-web"
---

## route.ts overview

LLM-readable OIP site summary.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [GET](#get)
---

# constructors

## GET

Returns `llms.txt` for oip.law.

**Example**

```ts
import { GET } from "@beep/oip-web/app/llms.txt/route"

const response = await GET()
console.log(response.headers.get("content-type"))
```

**Signature**

```ts
declare const GET: () => Promise<Response>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/llms.txt/route.ts#L24)

Since v0.0.0