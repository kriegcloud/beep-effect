---
title: Email.ts
nav_order: 66
parent: "@beep/schema"
---

## Email.ts overview

Public email address schema exports.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [Email](#email)
  - [EmailString](#emailstring)
- [models](#models)
  - [Email (type alias)](#email-type-alias)
  - [EmailString (type alias)](#emailstring-type-alias)
---

# constructors

## Email

RFC 5322 compliant email address schema.

Accepts a string, trims whitespace, lowercases, validates against RFC 5322,
and wraps the result in a `Redacted` to prevent accidental logging.

**Example**

```ts
import * as S from "effect/Schema"
import { Email } from "@beep/schema"

const decode = S.decodeUnknownSync(Email)

const email = decode("Alice@Example.COM")
```

**Signature**

```ts
declare const Email: AnnotatedSchema<RedactedFromValue<AnnotatedSchema<brand<decodeTo<toType<decodeTo<toType<NonEmptyString>, NonEmptyString, never, never>>, decodeTo<toType<NonEmptyString>, NonEmptyString, never, never>, never, never>, "Email">>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Email.ts#L67)

Since v0.0.0

## EmailString

RFC 5322 compliant email address string schema.

Accepts a string, trims whitespace, lowercases, validates against RFC 5322,
and keeps the decoded value as a branded string. Use this when the email
address must remain displayable or serializable as plain text. Use
`Email` when accidental logging should be prevented with `Redacted`.

**Example**

```ts
import * as S from "effect/Schema"
import { EmailString } from "@beep/schema"

const decode = S.decodeUnknownEffect(EmailString)
console.log(decode)
```

**Signature**

```ts
declare const EmailString: AnnotatedSchema<brand<decodeTo<toType<decodeTo<toType<NonEmptyString>, NonEmptyString, never, never>>, decodeTo<toType<NonEmptyString>, NonEmptyString, never, never>, never, never>, "Email">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Email.ts#L30)

Since v0.0.0

# models

## Email (type alias)

Branded, redacted email address type extracted from `Email`.

**Example**

```ts
import * as S from "effect/Schema"
import { Email, type Email as EmailValue } from "@beep/schema"

const decode = S.decodeUnknownSync(Email)
const email: EmailValue = decode("admin@example.com")

console.log(email)
```

**Signature**

```ts
type Email = typeof Email.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Email.ts#L86)

Since v0.0.0

## EmailString (type alias)

Branded email address string type extracted from `EmailString`.

**Example**

```ts
import type { EmailString } from "@beep/schema"

const email = "admin@example.com" as EmailString
console.log(email)
```

**Signature**

```ts
type EmailString = typeof EmailString.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Email.ts#L46)

Since v0.0.0