---
title: Discord.errors.ts
nav_order: 1
parent: "@beep/discord"
---

## Discord.errors.ts overview

Typed errors for the Discord REST driver.

Since v0.0.0

---
## Exports Grouped by Category
- [errors](#errors)
  - [DiscordError (class)](#discorderror-class)
  - [DiscordErrorReason](#discorderrorreason)
  - [DiscordErrorReason (type alias)](#discorderrorreason-type-alias)
---

# errors

## DiscordError (class)

Technical failure raised by the Discord driver boundary.

**Example**

```ts
import { DiscordError } from "@beep/discord/Discord.errors"

console.log(DiscordError)
```

**Signature**

```ts
declare class DiscordError
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/discord/src/Discord.errors.ts#L54)

Since v0.0.0

## DiscordErrorReason

Discord driver error reason vocabulary.

**Example**

```ts
import { DiscordErrorReason } from "@beep/discord/Discord.errors"

console.log(DiscordErrorReason)
```

**Signature**

```ts
declare const DiscordErrorReason: AnnotatedSchema<LiteralKit<readonly ["request", "transport", "response-status", "response-decoding"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/discord/src/Discord.errors.ts#L27)

Since v0.0.0

## DiscordErrorReason (type alias)

Runtime type for `DiscordErrorReason`.

**Signature**

```ts
type DiscordErrorReason = typeof DiscordErrorReason.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/drivers/discord/src/Discord.errors.ts#L39)

Since v0.0.0