---
title: LegalClient.values.ts
nav_order: 4
parent: "@beep/law-practice-domain"
---

## LegalClient.values.ts overview

Legal client value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [LegalClientStatus (type alias)](#legalclientstatus-type-alias)
- [schemas](#schemas)
  - [LegalClientStatus](#legalclientstatus)
---

# models

## LegalClientStatus (type alias)

Runtime type for `LegalClientStatus`.

**Example**

```ts
import type { LegalClientStatus } from "@beep/law-practice-domain"

const value: LegalClientStatus = "active_client"
console.log(value)
```

**Signature**

```ts
type LegalClientStatus = typeof LegalClientStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/LegalClient/LegalClient.values.ts#L46)

Since v0.0.0

# schemas

## LegalClientStatus

Legal client status vocabulary represented in proof seeds.

**Example**

```ts
import { LegalClientStatus } from "@beep/law-practice-domain"

console.log(LegalClientStatus.is.active_client("active_client"))
```

**Signature**

```ts
declare const LegalClientStatus: AnnotatedSchema<LiteralKit<readonly ["active_client"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/law-practice/domain/src/entities/LegalClient/LegalClient.values.ts#L26)

Since v0.0.0