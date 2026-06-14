---
title: ContactRouteResponse.ts
nav_order: 1
parent: "@beep/oip-web"
---

## ContactRouteResponse.ts overview

OIP contact route response helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [workflows](#workflows)
  - [contactRequestResponse](#contactrequestresponse)
  - [contactRequestResponseWithSubmit](#contactrequestresponsewithsubmit)
---

# workflows

## contactRequestResponse

Builds an OIP contact route response inside an Effect runtime.

**Example**

```ts
import { Effect } from "effect"
import {
  contactRequestResponse,
} from "@beep/oip-web/app/api/contact/ContactRouteResponse"

const request = new Request("https://oip.law/api/contact", { method: "POST" })
const program = contactRequestResponse(request)

Effect.runPromise(program)
```

**Signature**

```ts
declare const contactRequestResponse: (request: Request) => Effect.Effect<NextResponse>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/api/contact/ContactRouteResponse.ts#L141)

Since v0.0.0

## contactRequestResponseWithSubmit

Builds an OIP contact route response using an injected contact workflow.

**Example**

```ts
import { Effect } from "effect"
import {
  contactRequestResponseWithSubmit,
} from "@beep/oip-web/app/api/contact/ContactRouteResponse"

const request = new Request("https://oip.law/api/contact", { method: "POST" })
const submit = () => Effect.succeed({ message: "Received.", status: "accepted" as const })
const program = contactRequestResponseWithSubmit(request, submit)

Effect.runPromise(program)
```

**Signature**

```ts
declare const contactRequestResponseWithSubmit: { (request: Request, submit: SubmitContact): Effect.Effect<NextResponse>; (submit: SubmitContact): (request: Request) => Effect.Effect<NextResponse>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/app/api/contact/ContactRouteResponse.ts#L83)

Since v0.0.0