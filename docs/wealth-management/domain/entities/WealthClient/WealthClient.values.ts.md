---
title: WealthClient.values.ts
nav_order: 13
parent: "@beep/wealth-management-domain"
---

## WealthClient.values.ts overview

Wealth-client value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [WealthClientStatus (type alias)](#wealthclientstatus-type-alias)
- [schemas](#schemas)
  - [WealthClientStatus](#wealthclientstatus)
---

# models

## WealthClientStatus (type alias)

Runtime type for `WealthClientStatus`.

**Example**

```ts
import type { WealthClientStatus } from "@beep/wealth-management-domain"

const value: WealthClientStatus = "active_client"
console.log(value)
```

**Signature**

```ts
type WealthClientStatus = typeof WealthClientStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/WealthClient/WealthClient.values.ts#L46)

Since v0.0.0

# schemas

## WealthClientStatus

Fixture wealth-client status vocabulary.

**Example**

```ts
import { WealthClientStatus } from "@beep/wealth-management-domain"

console.log(WealthClientStatus.is.active_client("active_client"))
```

**Signature**

```ts
declare const WealthClientStatus: AnnotatedSchema<LiteralKit<readonly ["active_client"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/WealthClient/WealthClient.values.ts#L26)

Since v0.0.0