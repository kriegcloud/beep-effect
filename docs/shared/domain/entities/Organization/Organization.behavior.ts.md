---
title: Organization.behavior.ts
nav_order: 9
parent: "@beep/shared-domain"
---

## Organization.behavior.ts overview

Pure Organization domain behavior.

Since v0.0.0

---
## Exports Grouped by Category
- [predicates](#predicates)
  - [hasParentOrganization](#hasparentorganization)
  - [hasValidTenantPlacement](#hasvalidtenantplacement)
  - [isTenantRoot](#istenantroot)
---

# predicates

## hasParentOrganization

Test whether an Organization belongs to a parent organization.

**Example**

```ts
import { Organization } from "@beep/shared-domain/entities"
import * as O from "effect/Option"

console.log(Organization.hasParentOrganization({ parentOrgId: O.none() }))
```

**Signature**

```ts
declare const hasParentOrganization: (organization: Pick<Model, "parentOrgId">) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.behavior.ts#L53)

Since v0.0.0

## hasValidTenantPlacement

Test whether Organization tenant placement fields form a valid root or child
relationship.

**Example**

```ts
import { Effect } from "effect"
import { Organization } from "@beep/shared-domain/entities"
import * as Shared from "@beep/shared-domain/identity/Shared"
import * as O from "effect/Option"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(Shared.OrganizationId)(1)
  return Organization.hasValidTenantPlacement({ id, orgId: id, parentOrgId: O.none() })
})
console.log(program)
```

**Signature**

```ts
declare const hasValidTenantPlacement: (organization: Pick<Model, "id" | "orgId" | "parentOrgId">) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.behavior.ts#L83)

Since v0.0.0

## isTenantRoot

Test whether an Organization row is its own tenant root.

**Example**

```ts
import { Effect } from "effect"
import { isTenantRoot } from "@beep/shared-domain/entities/Organization/Organization.behavior"
import * as Shared from "@beep/shared-domain/identity/Shared"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const id = yield* S.decodeUnknownEffect(Shared.OrganizationId)(1)
  return isTenantRoot({ id, orgId: id })
})
console.log(program)
```

**Signature**

```ts
declare const isTenantRoot: (organization: Pick<Model, "id" | "orgId">) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entities/Organization/Organization.behavior.ts#L36)

Since v0.0.0