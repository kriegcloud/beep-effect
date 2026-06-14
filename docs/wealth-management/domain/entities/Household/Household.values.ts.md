---
title: Household.values.ts
nav_order: 5
parent: "@beep/wealth-management-domain"
---

## Household.values.ts overview

Household value schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [HouseholdStatus (type alias)](#householdstatus-type-alias)
- [schemas](#schemas)
  - [HouseholdStatus](#householdstatus)
---

# models

## HouseholdStatus (type alias)

Runtime type for `HouseholdStatus`.

**Example**

```ts
import type { HouseholdStatus } from "@beep/wealth-management-domain"

const value: HouseholdStatus = "active"
console.log(value)
```

**Signature**

```ts
type HouseholdStatus = typeof HouseholdStatus.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Household/Household.values.ts#L46)

Since v0.0.0

# schemas

## HouseholdStatus

Fixture household status vocabulary.

**Example**

```ts
import { HouseholdStatus } from "@beep/wealth-management-domain"

console.log(HouseholdStatus.is.active("active"))
```

**Signature**

```ts
declare const HouseholdStatus: AnnotatedSchema<LiteralKit<readonly ["active"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/wealth-management/domain/src/entities/Household/Household.values.ts#L26)

Since v0.0.0