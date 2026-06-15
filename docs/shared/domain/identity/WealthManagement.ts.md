---
title: WealthManagement.ts
nav_order: 28
parent: "@beep/shared-domain"
---

## WealthManagement.ts overview

Wealth-management slice entity-id registry.

Since v0.0.0

---
## Exports Grouped by Category
- [entity-ids](#entity-ids)
  - [AccountId](#accountid)
  - [AccountId (type alias)](#accountid-type-alias)
  - [HouseholdId](#householdid)
  - [HouseholdId (type alias)](#householdid-type-alias)
  - [PartyId](#partyid)
  - [PartyId (type alias)](#partyid-type-alias)
  - [WealthClientId](#wealthclientid)
  - [WealthClientId (type alias)](#wealthclientid-type-alias)
---

# entity-ids

## AccountId

Account entity identifier.

**Example**

```ts
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"

console.log(WealthManagement.AccountId.entityType)
```

**Signature**

```ts
declare const AccountId: EntityId.EntityId<"wealth_management", "account", "wealth_management_account", "wealth_management.account", "WealthManagementAccount", "WealthManagementAccountId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L141)

Since v0.0.0

## AccountId (type alias)

Runtime type for `AccountId`.

**Example**

```ts
import { Effect } from "effect"
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: WealthManagement.AccountId = yield* S.decodeUnknownEffect(WealthManagement.AccountId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type AccountId = typeof AccountId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L164)

Since v0.0.0

## HouseholdId

Household entity identifier.

**Example**

```ts
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"

console.log(WealthManagement.HouseholdId.entityType)
```

**Signature**

```ts
declare const HouseholdId: EntityId.EntityId<"wealth_management", "household", "wealth_management_household", "wealth_management.household", "WealthManagementHousehold", "WealthManagementHouseholdId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L27)

Since v0.0.0

## HouseholdId (type alias)

Runtime type for `HouseholdId`.

**Example**

```ts
import { Effect } from "effect"
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: WealthManagement.HouseholdId = yield* S.decodeUnknownEffect(WealthManagement.HouseholdId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type HouseholdId = typeof HouseholdId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L50)

Since v0.0.0

## PartyId

Party entity identifier.

**Example**

```ts
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"

console.log(WealthManagement.PartyId.entityType)
```

**Signature**

```ts
declare const PartyId: EntityId.EntityId<"wealth_management", "party", "wealth_management_party", "wealth_management.party", "WealthManagementParty", "WealthManagementPartyId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L103)

Since v0.0.0

## PartyId (type alias)

Runtime type for `PartyId`.

**Example**

```ts
import { Effect } from "effect"
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: WealthManagement.PartyId = yield* S.decodeUnknownEffect(WealthManagement.PartyId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type PartyId = typeof PartyId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L126)

Since v0.0.0

## WealthClientId

Wealth client entity identifier.

**Example**

```ts
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"

console.log(WealthManagement.WealthClientId.entityType)
```

**Signature**

```ts
declare const WealthClientId: EntityId.EntityId<"wealth_management", "wealth_client", "wealth_management_wealth_client", "wealth_management.wealth_client", "WealthManagementWealthClient", "WealthManagementWealthClientId">
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L65)

Since v0.0.0

## WealthClientId (type alias)

Runtime type for `WealthClientId`.

**Example**

```ts
import { Effect } from "effect"
import * as WealthManagement from "@beep/shared-domain/identity/WealthManagement"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id: WealthManagement.WealthClientId = yield* S.decodeUnknownEffect(WealthManagement.WealthClientId)(1)
  return id
})
console.log(program)
```

**Signature**

```ts
type WealthClientId = typeof WealthClientId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/identity/WealthManagement.ts#L88)

Since v0.0.0