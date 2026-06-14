---
title: DiscordChannel.model.ts
nav_order: 1
parent: "@beep/installer-domain"
---

## DiscordChannel.model.ts overview

Discord channel aggregate model.

Since v0.0.0

---
## Exports Grouped by Category
- [aggregates](#aggregates)
  - [DiscordChannel (class)](#discordchannel-class)
  - [DiscordChannelKind](#discordchannelkind)
  - [DiscordChannelKind (type alias)](#discordchannelkind-type-alias)
  - [DiscordChannelStatus](#discordchannelstatus)
  - [DiscordChannelStatus (type alias)](#discordchannelstatus-type-alias)
---

# aggregates

## DiscordChannel (class)

Discord channel target for v1 installer notifications.

**Example**

```ts
import { DiscordChannel } from "@beep/installer-domain/aggregates/DiscordChannel"

console.log(DiscordChannel)
```

**Signature**

```ts
declare class DiscordChannel
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/DiscordChannel/DiscordChannel.model.ts#L83)

Since v0.0.0

## DiscordChannelKind

Discord channel family supported in v1.

**Example**

```ts
import { DiscordChannelKind } from "@beep/installer-domain/aggregates/DiscordChannel"

console.log(DiscordChannelKind)
```

**Signature**

```ts
declare const DiscordChannelKind: AnnotatedSchema<LiteralKit<readonly ["guild-text-channel"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/DiscordChannel/DiscordChannel.model.ts#L29)

Since v0.0.0

## DiscordChannelKind (type alias)

Runtime type for `DiscordChannelKind`.

**Signature**

```ts
type DiscordChannelKind = typeof DiscordChannelKind.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/DiscordChannel/DiscordChannel.model.ts#L41)

Since v0.0.0

## DiscordChannelStatus

Discord channel dry-run status.

**Example**

```ts
import { DiscordChannelStatus } from "@beep/installer-domain/aggregates/DiscordChannel"

console.log(DiscordChannelStatus)
```

**Signature**

```ts
declare const DiscordChannelStatus: AnnotatedSchema<LiteralKit<readonly ["configured", "missing", "unchecked"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/DiscordChannel/DiscordChannel.model.ts#L56)

Since v0.0.0

## DiscordChannelStatus (type alias)

Runtime type for `DiscordChannelStatus`.

**Signature**

```ts
type DiscordChannelStatus = typeof DiscordChannelStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/installer/domain/src/aggregates/DiscordChannel/DiscordChannel.model.ts#L68)

Since v0.0.0