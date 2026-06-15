---
title: Membership.values.ts
nav_order: 7
parent: "@beep/shared-domain"
---

## Membership.values.ts overview

Shared-kernel Membership value vocabulary.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Role (type alias)](#role-type-alias)
  - [Status (type alias)](#status-type-alias)
- [schemas](#schemas)
  - [Role](#role)
  - [Status](#status)
---

# models

## Role (type alias)

Runtime type for `Role`.

**Example**

```ts
import type { Role } from "@beep/shared-domain/entities/Membership"

const role: Role = "owner"
console.log(role)
```

**Signature**

```ts
type Role = typeof Role.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/Membership.values.ts#L46)

Since v0.0.0

## Status (type alias)

Runtime type for `Status`.

**Example**

```ts
import type { Status } from "@beep/shared-domain/entities/Membership"

const status: Status = "active"
console.log(status)
```

**Signature**

```ts
type Status = typeof Status.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/Membership.values.ts#L81)

Since v0.0.0

# schemas

## Role

Organization membership role.

**Example**

```ts
import { Role } from "@beep/shared-domain/entities/Membership"

console.log(Role.is.owner("owner"))
```

**Signature**

```ts
declare const Role: AnnotatedSchema<LiteralKit<readonly ["owner", "member"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/Membership.values.ts#L26)

Since v0.0.0

## Status

Organization membership lifecycle status.

**Example**

```ts
import { Status } from "@beep/shared-domain/entities/Membership"

console.log(Status.is.active("active"))
```

**Signature**

```ts
declare const Status: AnnotatedSchema<LiteralKit<readonly ["active"], undefined>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Membership/Membership.values.ts#L61)

Since v0.0.0