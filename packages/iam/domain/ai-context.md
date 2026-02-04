---
path: packages/iam/domain
summary: IAM domain models via M.Class - entities, schema kits, PG enum factories, audit fields
tags: [iam, domain, effect, schema, entities, model-class]
---

# @beep/iam-domain

Centralizes IAM domain models using Effect's `M.Class` definitions with shared audit fields via `makeFields`. Provides the single source of truth for entity schemas consumed by tables, server, and client packages. Re-exports shared-kernel entities (Organization, Team, User, Session) into the IAM namespace.

## Architecture

```
|-------------------|     |-------------------|     |-------------------|
|  @beep/iam-domain | --> | @beep/iam-tables  | --> | @beep/iam-server  |
|-------------------|     |-------------------|     |-------------------|
        |                         |
        v                         v
|-------------------|     |-------------------|
| @beep/shared-     |     | @beep/iam-client  |
| domain (EntityIds)|     | (contracts)       |
|-------------------|     |-------------------|
```

## Core Modules

| Module | Purpose |
|--------|---------|
| `Entities.Account` | OAuth account linkage with sensitive token wrappers |
| `Entities.ApiKey` | API key issuance with hashed secrets |
| `Entities.Member` | Organization membership with role enums |
| `Entities.Session` | Session context (re-exported from shared-domain) |
| `Entities.Invitation` | Membership invitations with expiry |
| `Entities.Passkey` | WebAuthn credential storage |
| `Entities.TwoFactor` | TOTP/MFA configuration |
| `Entities.OAuth*` | OAuth flow entities (AccessToken, Application, Consent, DeviceCode) |
| `Entities.SsoProvider` | Enterprise SSO metadata |
| Schema kits | `.Enum`, `.Options`, `make*PgEnum` utilities |

## Usage Patterns

### Create Entity Insert Payload
```typescript
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";
import { Entities } from "@beep/iam-domain";
import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";

const makeInvitation = Effect.gen(function* () {
  const now = yield* DateTime.now;
  return Entities.Invitation.Model.insert.make({
    id: IamEntityIds.InvitationId.create(),
    email: "user@example.com",
    inviterId: SharedEntityIds.UserId.make("user_1"),
    organizationId: O.some(SharedEntityIds.OrganizationId.create()),
    expiresAt: DateTime.toDate(now),
    createdAt: DateTime.toDate(now),
    updatedAt: DateTime.toDate(now),
  });
});
```

### Update Entity with Audit Fields
```typescript
import * as Effect from "effect/Effect";
import * as DateTime from "effect/DateTime";
import { Entities } from "@beep/iam-domain";

const promoteMember = (member: Entities.Member.Model.Type) =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    return Entities.Member.Model.update.make({
      ...member,
      role: Entities.Member.MemberRoleEnum.admin,
      updatedAt: DateTime.toDate(now),
    });
  });
```

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| `makeFields` for audit columns | Single source for `id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`, `_rowId`, `version` |
| Schema kits with PG enum factories | Keep domain enums synchronized with database enums |
| No error types in domain | Errors belong in `@beep/iam-client` (client) or server packages |
| `Symbol.for` identifiers | Stable schema metadata across migrations and clients |
| `BS` helpers for optionality | `FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `BoolWithDefault` |

## Dependencies

**Internal**: `@beep/shared-domain` (EntityIds, shared entities), `@beep/schema` (BS helpers), `@beep/identity`, `@beep/constants`

**External**: `effect`, `@effect/sql` (M.Class), `@effect/experimental`, `drizzle-orm`

## Related

- **AGENTS.md** - Detailed contributor guidance with security patterns and recipes
- **@beep/iam-tables** - Drizzle table definitions consuming these models
- **@beep/iam-client** - Client contracts aligned with domain EntityIds
