# @beep/iam-domain — Agent Guide

## Purpose & Fit
- Centralizes IAM domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving server and tables a single source of truth for schema variants (see `src/entities/Account/Account.model.ts` and `@beep/shared-domain` common utilities).
- Re-exports the IAM entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure.
- **Note**: This package contains ONLY domain entities and schemas. Error types are defined in `@beep/iam-client` (for client operations) and infrastructure packages (for server operations).
- Bridges shared-kernel entities (Organization, Team, User, Session) into the IAM slice so cross-slice consumers can stay on the IAM namespace without re-import juggling.

## Surface Map
- **Entities.Account** — OAuth account linkage with sensitive token wrappers and expiry metadata.
- **Entities.ApiKey** — API key issuance, hashed secrets, and rate limit defaults.
- **Entities.DeviceCode / OAuthAccessToken / OAuthApplication / OAuthConsent** — Device flow + OAuth client state machines, covering pending status enums and PKCE secrets.
- **Entities.Invitation / Member / TeamMember / OrganizationRole** — Membership constructs with schema kits for role/status enums plus PG enum helpers.
- **Entities.Passkey / TwoFactor / RateLimit** — Authentication hardening (WebAuthn, TOTP) and rate tracking.
- **Entities.Session** — Session context (re-exported from `@beep/shared-domain/entities`).
- **Entities.Subscription / WalletAddress / SsoProvider / Verification** — Billing, crypto wallets, SSO metadata, and verification tokens with expiry logic.
- **Entities.Jwks / ScimProvider** — Additional entities for JSON Web Key Sets and SCIM provider configuration.
- **Schema kits** — Literal kits expose `.Enum`, `.Options`, and `make*PgEnum` utilities for tables.

## Usage Snapshots
- Repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- Better Auth hooks lean on entity enums to seed owner memberships during session creation.
- PG enum factories ensure database enums stay synchronized with domain literals.
- Integration tests build insert payloads with `Entities.*.Model.insert.make` to validate repo flows end-to-end.
- Test harness seeds IAM fixtures directly from `Entities.*` model variants when spinning Postgres containers.

## EntityId Usage (MANDATORY)

EntityIds defined in this package MUST be used consistently across the entire IAM vertical slice:

| Package | Purpose | EntityId Import |
|---------|---------|-----------------|
| `@beep/iam-domain` | Domain models | `IamEntityIds` from `@beep/shared-domain` |
| `@beep/iam-tables` | Table columns with `.$type<>()` | Same EntityIds |
| `@beep/iam-client` | Contract schemas | Same EntityIds |

### Cross-Package Alignment

When domain models define an EntityId field, ALL downstream packages MUST use the same branded type:

```typescript
// Domain model (packages/iam/domain/src/entities/Member/Member.model.ts)
export class Member extends M.Class<Member>("Member")({
  id: IamEntityIds.MemberId,
  userId: SharedEntityIds.UserId,
  organizationId: SharedEntityIds.OrganizationId,
  // ...
}) {}

// Table definition (packages/iam/tables/src/tables/member.table.ts)
export const memberTable = OrgTable.make(IamEntityIds.MemberId)({
  userId: pg.text("user_id").notNull()
    .$type<SharedEntityIds.UserId.Type>(),  // MUST match domain
  // ...
});

// Client schema (packages/iam/client/src/organization/_common/member.schema.ts)
export class Member extends S.Class<Member>($I`Member`)({
  id: IamEntityIds.MemberId,  // MUST match domain
  userId: SharedEntityIds.UserId,  // MUST match domain
  organizationId: SharedEntityIds.OrganizationId,  // MUST match domain
}) {}
```

### Client Schema Alignment

Client schemas in `@beep/iam-client` MUST align with domain entities defined here. See `packages/iam/client/AGENTS.md` for:
- Contract payload EntityId patterns
- Transformation schema requirements (`DomainEntityFromBetterAuthEntity`)
- EntityId creation and validation methods (`.create()`, `.make()`, `.is()`)

### Verification

When updating domain models, verify downstream alignment:

```bash
# Domain compiles
bun run check --filter @beep/iam-domain

# Tables match domain EntityIds
bun run check --filter @beep/iam-tables

# Client schemas match domain EntityIds
bun run check --filter @beep/iam-client

# Check no plain S.String IDs in client
grep -r ": S.String" packages/iam/client/src/ | grep -iE "(id|Id):"
```

## Authoring Guardrails
- ALWAYS import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; NEVER redefine `id`, `_rowId`, `version`, or timestamps manually.
- Maintain `Symbol.for("@beep/iam-domain/<Entity>Model")` naming to keep schema metadata stable across database migrations and clients.
- Prefer `BS` helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `BoolWithDefault`) to describe optionality and defaults; this keeps insert/update variants aligned with `Model.Class` expectations.
- When updating schema kits, extend literals in the kit file **and** propagate matching enums via `make*PgEnum` within `@beep/iam-tables` to avoid PG drift.
- NEVER define error types in this package; IAM-specific errors belong in `@beep/iam-client` (for client-side operations) or downstream server packages. This package focuses purely on domain entities and schema definitions.

## Quick Recipes
- **Compose an invitation insert payload with audit metadata**
  ```ts
  import { Entities } from "@beep/iam-domain";
  import { IamEntityIds, SharedEntityIds } from "@beep/shared-domain";
  import { BS } from "@beep/schema";
  import * as DateTime from "effect/DateTime";
  import * as Effect from "effect/Effect";
  import * as O from "effect/Option";

  export const makeInvitationInsert = Effect.gen(function* () {
    const now = yield* DateTime.now;
    const nowDate = DateTime.toDate(now);
    const invitationId = IamEntityIds.InvitationId.create();

    return Entities.Invitation.Model.insert.make({
      id: invitationId,
      email: BS.EmailBase.make("new-user@example.com"),
      inviterId: SharedEntityIds.UserId.make("user_1"),
      organizationId: O.some(SharedEntityIds.OrganizationId.create()),
      expiresAt: nowDate,
      createdAt: nowDate,
      updatedAt: nowDate,
      source: O.some("guide"),
      createdBy: O.some("guide"),
      updatedBy: O.some("guide"),
    });
  });
  ```
- **Promote a member using the update variant**
```ts
import { Entities } from "@beep/iam-domain";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";

export const promoteMember = (member: Entities.Member.Model.Type) =>
  Effect.gen(function* () {
    const now = yield* DateTime.now;
    const updated = Entities.Member.Model.update.make({
      ...member,
      role: Entities.Member.MemberRoleEnum.admin,
      updatedAt: DateTime.toDate(now),
    });
    return updated;
  });
```
- **Decode session JSON before persisting**
```ts
import { Entities } from "@beep/iam-domain";
import * as Effect from "effect/Effect";
import * as S from "effect/Schema";

export const parseSessionPayload = (payload: unknown) =>
  Effect.flatMap(
    S.decodeUnknown(Entities.Session.Model.json)(payload),
    (session) =>
      Effect.succeed({
        token: session.token,
        expiresAt: session.expiresAt,
        activeOrganizationId: session.activeOrganizationId,
      })
  );
```

## Verifications
- `bun run check --filter @beep/iam-domain`
- `bun run lint --filter @beep/iam-domain`
- `bun run test --filter @beep/iam-domain`

## Security

### Sensitive Field Modeling
- ALWAYS use `FieldSensitiveOptionOmittable` or equivalent `BS` helpers for fields containing credentials, tokens, or secrets.
- NEVER define password fields as plain `S.String`; use sensitive wrappers that prevent accidental serialization.
- ALWAYS wrap OAuth tokens (`accessToken`, `refreshToken`, `idToken`) with sensitive field helpers to prevent logging.

### Schema Validation
- ALWAYS validate password strength requirements at the schema level using `S.filter` or custom refinements.
- ALWAYS validate email format using `BS.EmailBase` to prevent injection attacks.
- NEVER trust user-provided IDs without validation through `IamEntityIds` branded types.

### Token Expiry Modeling
- ALWAYS include `expiresAt` fields for time-bounded credentials (sessions, API keys, verification tokens, OAuth tokens).
- ALWAYS model verification tokens with short expiry windows (15-60 minutes for email verification, 5-10 minutes for OTP).
- NEVER create entities representing credentials without explicit expiry semantics.

### Error Information Disclosure
- Domain models should focus on data validation, not error handling; error types belong in client/server layers.
- NEVER include credential values, token fragments, or user-identifiable data in schema validation error messages.
- Schema validation failures should provide minimal context to prevent information leakage.

### Audit Field Integrity
- ALWAYS use `makeFields` to ensure audit columns (`createdAt`, `updatedAt`, `createdBy`, `updatedBy`) are present.
- NEVER allow audit fields to be modified directly by user input—they should be set by infrastructure layers.
- ALWAYS maintain `_rowId` and `version` fields for optimistic concurrency and audit trails.

## Contributor Checklist
- [ ] Align entity changes with `@beep/iam-tables` enums/columns and regenerate migrations (`bun run db:generate`, `bun run db:migrate`).
- [ ] Update `packages/_internal/db-admin` fixtures/tests when adding or removing fields to keep container smoke tests honest.
- [ ] Maintain `Symbol.for` identifiers and audit field structure via `makeFields`.
- [ ] Prefer `Model.insert/update/json` helpers for transformations—avoid handcrafting payloads in repos or services.
- [ ] Re-run verification commands above before handing work off; add Vitest coverage beyond the placeholder suite when touching new behavior.
