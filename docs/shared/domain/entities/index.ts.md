---
title: index.ts
nav_order: 4
parent: "@beep/shared-domain"
---

## index.ts overview

Shared-kernel membership concept namespace.

**Example**

```ts
import { Membership } from "@beep/shared-domain/entities"

console.log(Membership.Model.definition.tableName)
```

Since v0.0.0

---
## Exports Grouped by Category
- [entities](#entities)
  - [Membership (namespace export)](#membership-namespace-export)
  - [Organization (namespace export)](#organization-namespace-export)
  - [User (namespace export)](#user-namespace-export)
---

# entities

## Membership (namespace export)

Re-exports all named exports from the "./Membership/index.js" module as `Membership`.

**Example**

```ts
import { Membership } from "@beep/shared-domain/entities"

console.log(Membership.Model.definition.tableName)
```

**Signature**

```ts
export * as Membership from "./Membership/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/index.ts#L14)

Since v0.0.0

## Organization (namespace export)

Re-exports all named exports from the "./Organization/index.js" module as `Organization`.

**Example**

```ts
import { Organization } from "@beep/shared-domain/entities"

console.log(Organization.Model.definition.tableName)
```

**Signature**

```ts
export * as Organization from "./Organization/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/index.ts#L28)

Since v0.0.0

## User (namespace export)

Re-exports all named exports from the "./User/index.js" module as `User`.

**Example**

```ts
import { User } from "@beep/shared-domain/entities"

console.log(User.Model.definition.tableName)
```

**Signature**

```ts
export * as User from "./User/index.js"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/index.ts#L42)

Since v0.0.0