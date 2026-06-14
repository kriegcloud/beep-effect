---
title: ContactSubmission.model.ts
nav_order: 8
parent: "@beep/oip-web"
---

## ContactSubmission.model.ts overview

Contact form submission contracts for OIP intake.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ContactSubmission (class)](#contactsubmission-class)
  - [ContactSubmissionResponse (class)](#contactsubmissionresponse-class)
  - [ContactSubmissionStatus (type alias)](#contactsubmissionstatus-type-alias)
- [schemas](#schemas)
  - [ContactSubmissionStatus](#contactsubmissionstatus)
- [utilities](#utilities)
  - [decodeContactSubmission](#decodecontactsubmission)
---

# models

## ContactSubmission (class)

Browser-submitted OIP contact form payload.

**Example**

```ts
import { Effect } from "effect"
import { decodeContactSubmission } from "@beep/oip-web/contact"

const program = decodeContactSubmission({
  email: "builder@example.com",
  message: "I would like to discuss a patent matter.",
  name: "Builder",
  submittedAt: 0
})

Effect.runPromise(program).then((submission) => {
  console.log(submission.email)
})
```

**Signature**

```ts
declare class ContactSubmission
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.model.ts#L119)

Since v0.0.0

## ContactSubmissionResponse (class)

Public contact submission response.

**Example**

```ts
import { ContactSubmissionResponse } from "@beep/oip-web/contact"

const response = new ContactSubmissionResponse({
  message: "Your note was received.",
  status: "accepted"
})

console.log(response.status)
```

**Signature**

```ts
declare class ContactSubmissionResponse
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.model.ts#L154)

Since v0.0.0

## ContactSubmissionStatus (type alias)

Type for `ContactSubmissionStatus`.

**Example**

```ts
import type { ContactSubmissionStatus } from "@beep/oip-web/contact"

const status: ContactSubmissionStatus = "accepted"
console.log(status)
```

**Signature**

```ts
type ContactSubmissionStatus = typeof ContactSubmissionStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.model.ts#L94)

Since v0.0.0

# schemas

## ContactSubmissionStatus

Public contact submission status.

**Example**

```ts
import { ContactSubmissionStatus } from "@beep/oip-web/contact"

const accepted = ContactSubmissionStatus.Enum.accepted
console.log(accepted)
```

**Signature**

```ts
declare const ContactSubmissionStatus: AnnotatedSchema<LiteralKit<readonly ["accepted", "rejected"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.model.ts#L74)

Since v0.0.0

# utilities

## decodeContactSubmission

Decodes unknown input into a contact submission.

**Example**

```ts
import { Effect } from "effect"
import { decodeContactSubmission } from "@beep/oip-web/contact"

const program = decodeContactSubmission({
  email: "builder@example.com",
  message: "I would like to discuss a patent matter.",
  name: "Builder",
  submittedAt: 0
})

Effect.runPromise(program)
```

**Signature**

```ts
declare const decodeContactSubmission: (input: unknown, options?: ParseOptions) => Effect<ContactSubmission, S.SchemaError, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/apps/oip-web/src/contact/ContactSubmission.model.ts#L185)

Since v0.0.0