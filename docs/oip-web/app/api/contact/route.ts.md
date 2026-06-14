---
title: route.ts
nav_order: 2
parent: "@beep/oip-web"
---

## route.ts overview

OIP contact intake route.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [POST](#post)
---

# constructors

## POST

Handles OIP contact submissions at the Next.js route boundary.

**Example**

```ts
import { POST } from "@beep/oip-web/app/api/contact/route"

const handler: (request: Request) => Promise<Response> = POST
console.log(typeof handler)
```

**Signature**

```ts
declare const POST: (request: Request) => Promise<NextResponse>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/api/contact/route.ts#L26)

Since v0.0.0