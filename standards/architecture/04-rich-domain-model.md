# Rich Domain Model

beep-effect prefers a hybrid rich-domain style.

The domain should not be only schemas. Shape and validation are necessary, but
they are not enough. Domain concepts should also own pure behavior: lifecycle
transitions, invariant checks, value-object operations, and domain decisions.

## Rich Versus Anemic

An anemic domain model is a value bag. It may have a schema, but behavior lives
elsewhere.

A rich domain model owns:

- shape
- validation
- identity or value semantics
- pure transformations
- pure decision rules
- actionable domain failures

## Why Schema-First

A schema is not a fancier interface. It is executable domain evidence.

Type aliases and interfaces disappear at runtime. They can describe what we hope
is true, but they cannot decode unknown input, reject invalid data, normalize a
boundary value, produce documentation metadata, or explain a failure. Types can
lie; schemas have to check.

Rich annotated schemas pay back that ceremony because the same definition can:

- create fast backpressure at API, config, persistence, and UI boundaries
- derive TypeScript types instead of duplicating parallel shape definitions
- provide constructors, defaults, normalization, JSON codecs, and boundary
  decoders
- derive guards and equivalence instead of hand-written predicate helpers
- feed generated docs, validation messages, and agent context with the same
  domain descriptions humans read
- keep runtime guarantees attached to the domain language instead of scattered
  through handlers and adapters

For pure data models, define the schema value first and derive the TypeScript
type from it. Plain `interface` and object type aliases remain appropriate for
service contracts, complex type-level transforms, utility types, and overload
surfaces that `Schema` cannot represent cleanly.

## Hybrid Style

Rich behavior does not mean every function must be an instance method.

Use the shape that best communicates the rule:

| Form | Use when |
|---|---|
| Model method | The behavior is obvious single-object behavior. |
| Exported function | The behavior is pipeable, collection-oriented, or clearer as a named operation. |
| `.behavior.ts` | The behavior is pure but large enough to deserve a visible role file. |
| `.policy.ts` | The behavior is a pure decision rule, often involving multiple values or concepts. |

## Pure Does Not Mean Effect-Free

Domain behavior may return `Effect` when typed validation or typed failure makes
the rule clearer.

Pure means:

- no repositories
- no driver services
- no HTTP
- no database
- no filesystem
- no browser APIs
- no environment reads
- no config reads
- no hidden runtime dependency

An Effect that only models domain success/failure can still be pure in the
architectural sense.

Domain may define driver-neutral schemas and value objects that config
packages reuse when resolving typed settings. Domain behavior must still receive
explicit values from callers rather than reading `Config`, `ConfigProvider`,
`@beep/<kernel>-config`, environment variables, secrets, files, or process state.

## Example Shape

`Membership.model.ts` can own simple behavior:

```ts
import { $IamDomainId } from "@beep/identity/packages"
import { LiteralKit } from "@beep/schema"
import * as Model from "@beep/schema/Model"
import { Effect } from "effect"
import * as S from "effect/Schema"
import { AccountId } from "@beep/iam-domain/entities/Account"
import { OrganizationId } from "@beep/iam-domain/entities/Organization"
import { MembershipAlreadyRevoked } from "./Membership.errors.js"

const $I = $IamDomainId.create("entities/Membership/Membership.model")

export const MembershipId = S.String.pipe(
  S.brand("MembershipId"),
  $I.annoteSchema("MembershipId", {
    description: "Unique identifier for an organization membership.",
  }),
)
export type MembershipId = typeof MembershipId.Type

export const MembershipRole = LiteralKit(["owner", "admin", "member"]).pipe(
  $I.annoteSchema("MembershipRole", {
    description: "Role granted by an organization membership.",
  }),
)
export type MembershipRole = typeof MembershipRole.Type

export const MembershipStatus = LiteralKit([
  "active",
  "invited",
  "revoked",
]).pipe(
  $I.annoteSchema("MembershipStatus", {
    description: "Lifecycle status of an organization membership.",
  }),
)
export type MembershipStatus = typeof MembershipStatus.Type

export class Membership extends Model.Class<Membership>($I`Membership`)(
  {
    id: MembershipId,
    organizationId: OrganizationId,
    accountId: AccountId,
    role: MembershipRole,
    status: MembershipStatus,
  },
  $I.annote("Membership", {
    description: "Account participation in an organization.",
  }),
) {
  readonly canRevoke = (): boolean => !MembershipStatus.is.revoked(this.status)

  readonly revoke = Effect.fn("Membership.revoke")(() =>
    this.canRevoke()
      ? Effect.succeed(
          Membership.make({
            id: this.id,
            organizationId: this.organizationId,
            accountId: this.accountId,
            role: this.role,
            status: MembershipStatus.Enum.revoked,
          }),
        )
      : Effect.fail(new MembershipAlreadyRevoked()),
  )
}
```

`Membership.policy.ts` can own larger pure decisions:

```ts
import {
  type Membership,
  MembershipRole,
  MembershipStatus,
} from "./Membership.model.js"

export const canPromoteToOwner = (model: Membership) =>
  MembershipStatus.is.active(model.status) && !MembershipRole.is.owner(model.role)
```

`Membership.behavior.ts` can own pure transitions:

```ts
import { Effect } from "effect"
import { MembershipRoleChangeRejected } from "./Membership.errors.js"
import { canPromoteToOwner } from "./Membership.policy.js"
import { Membership, MembershipRole } from "./Membership.model.js"

export const promoteToOwner = Effect.fn("Membership.promoteToOwner")(
  (model: Membership) =>
    canPromoteToOwner(model)
      ? Effect.succeed(
          Membership.make({
            id: model.id,
            organizationId: model.organizationId,
            accountId: model.accountId,
            role: MembershipRole.Enum.owner,
            status: model.status,
          }),
        )
      : Effect.fail(new MembershipRoleChangeRejected()),
)
```

The use-case service then orchestrates loading, authorization, persistence, and
event publication around these pure domain rules.
