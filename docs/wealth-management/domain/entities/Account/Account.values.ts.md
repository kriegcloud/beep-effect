---
title: Account.values.ts
nav_order: 2
parent: "@beep/wealth-management-domain"
---

## Account.values.ts overview

Account value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [AccountType (type alias)](#accounttype-type-alias)
- [schemas](#schemas)
  - [AccountType](#accounttype)
---

# models

## AccountType (type alias)

Runtime type for `AccountType`.

**Example**

```ts
import type { AccountType } from "@beep/wealth-management-domain"

const value: AccountType = "taxable_brokerage"
console.log(value)
```

**Signature**

```ts
type AccountType = typeof AccountType.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Account/Account.values.ts#L46)

Since v0.0.0

# schemas

## AccountType

Fixture account type vocabulary.

**Example**

```ts
import { AccountType } from "@beep/wealth-management-domain"

console.log(AccountType.is.taxable_brokerage("taxable_brokerage"))
```

**Signature**

```ts
declare const AccountType: AnnotatedSchema<LiteralKit<readonly ["taxable_brokerage"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Account/Account.values.ts#L26)

Since v0.0.0