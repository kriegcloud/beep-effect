---
title: ContactSubmission.service.ts
nav_order: 9
parent: "@beep/oip-web"
---

## ContactSubmission.service.ts overview

Server-side OIP contact submission workflow.

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - [contactResponseBody](#contactresponsebody)
- [workflows](#workflows)
  - [submitContact](#submitcontact)
---

# utilities

## contactResponseBody

Builds a JSON-safe contact response object.

**Example**

```ts
import { ContactSubmissionResponse, contactResponseBody } from "@beep/oip-web/contact"

const body = contactResponseBody(ContactSubmissionResponse.make({
  message: "Your note was received.",
  status: "accepted"
}))

console.log(body.status)
```

**Signature**

```ts
declare const contactResponseBody: (response: ContactSubmissionResponse) => typeof ContactSubmissionResponse.Encoded
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.service.ts#L333)

Since v0.0.0

# workflows

## submitContact

Submits an OIP contact payload to HubSpot when runtime config is present.

**Example**

```ts
import { Effect } from "effect"
import { submitContact } from "@beep/oip-web/contact"

const program = submitContact({
  email: "builder@example.com",
  message: "I would like to discuss a patent matter.",
  name: "Builder",
  submittedAt: 0
})

Effect.runPromise(program)
```

**Signature**

```ts
declare const submitContact: (input: unknown) => Effect.Effect<ContactSubmissionResponse>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.service.ts#L281)

Since v0.0.0