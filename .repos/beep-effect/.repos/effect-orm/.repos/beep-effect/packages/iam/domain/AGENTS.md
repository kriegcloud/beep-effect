# @beep/iam-domain — Agent Guide

## Purpose & Fit
- Centralizes IAM domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infra and tables a single source of truth for schema variants (see `src/entities/Account/Account.model.ts` and `@beep/shared-domain` common utilities).
- Re-exports the IAM entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure.
- Provides IAM-specific tagged errors while delegating unknown fallbacks to the shared Beep error stack, keeping error channels typed across slices.
- Bridges shared-kernel entities (Organization, Team, User) into the IAM slice so cross-slice consumers can stay on the IAM namespace without re-import juggling.

## Surface Map
- **Entities.Account** — OAuth account linkage with sensitive token wrappers and expiry metadata.
- **Entities.ApiKey** — API key issuance, hashed secrets, and rate limit defaults.
- **Entities.DeviceCode / OAuthAccessToken / OAuthApplication / OAuthConsent** — Device flow + OAuth client state machines, covering pending status enums and PKCE secrets.
- **Entities.Invitation / Member / TeamMember / OrganizationRole** — Membership constructs with schema kits for role/status enums plus PG enum helpers.
- **Entities.Passkey / TwoFactor / Session / RateLimit** — Authentication hardening (WebAuthn, TOTP, session context) and rate tracking.
- **Entities.Subscription / WalletAddress / SsoProvider / Verification** — Billing, crypto wallets, SSO metadata, and verification tokens with expiry logic.
- **Entities.Jwks / ScimProvider** — Additional entities for JSON Web Key Sets and SCIM provider configuration.
- **Schema kits** — Literal kits expose `.Enum`, `.Options`, and `make*PgEnum` utilities for tables.
- **IamError exports** — `IamError` (tagged) and `IamUnknownError` (blends shared unknown error contract).

## Usage Snapshots
- Repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- Better Auth hooks lean on entity enums to seed owner memberships during session creation.
- PG enum factories ensure database enums stay synchronized with domain literals.
- Integration tests build insert payloads with `Entities.*.Model.insert.make` to validate repo flows end-to-end.
- Test harness seeds IAM fixtures directly from `Entities.*` model variants when spinning Postgres containers.

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; never redefine `id`, `_rowId`, `version`, or timestamps manually.
- Maintain `Symbol.for("@beep/iam-domain/<Entity>Model")` naming to keep schema metadata stable across database migrations and clients.
- Prefer `BS` helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `toOptionalWithDefault`, `BoolWithDefault`) to describe optionality and defaults; this keeps insert/update variants aligned with `Model.Class` expectations.
- When updating schema kits, extend literals in the kit file **and** propagate matching enums via `make*PgEnum` within `@beep/iam-tables` to avoid PG drift.
- Route new error types through `IamError` (or compose new tagged subclasses) rather than throwing bare `Error`, ensuring RPC and HTTP layers can map causes predictably.

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

## Contributor Checklist
- [ ] Align entity changes with `@beep/iam-tables` enums/columns and regenerate migrations (`bun run db:generate`, `bun run db:migrate`).
- [ ] Update `packages/_internal/db-admin` fixtures/tests when adding or removing fields to keep container smoke tests honest.
- [ ] Maintain `Symbol.for` identifiers and audit field structure via `makeFields`.
- [ ] Prefer `Model.insert/update/json` helpers for transformations—avoid handcrafting payloads in repos or services.
- [ ] Re-run verification commands above before handing work off; add Vitest coverage beyond the placeholder suite when touching new behavior.
