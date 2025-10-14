# @beep/iam-domain — Agent Guide

## Purpose & Fit
- Centralizes IAM domain models via `M.Class` definitions that merge shared audit fields through `makeFields`, giving infra and tables a single source of truth for schema variants (`packages/iam/domain/src/entities/Account/Account.model.ts:15`, `packages/shared/domain/src/common.ts:67`).
- Re-exports the IAM entity inventory to consumers through the package root so repos, tables, and runtimes can import `Entities.*` without piercing folder structure (`packages/iam/domain/src/index.ts:1`, `packages/iam/domain/src/entities/index.ts:3`).
- Provides IAM-specific tagged errors while delegating unknown fallbacks to the shared Beep error stack, keeping error channels typed across slices (`packages/iam/domain/src/IamError.ts:4`).
- Bridges shared-kernel entities (Organization, Team, User) into the IAM slice so cross-slice consumers can stay on the IAM namespace without re-import juggling (`packages/iam/domain/src/entities/index.ts:20`).

## Surface Map
- **Entities.Account** — OAuth account linkage with sensitive token wrappers and expiry metadata (`packages/iam/domain/src/entities/Account/Account.model.ts:32`).
- **Entities.ApiKey** — API key issuance, hashed secrets, and rate limit defaults (`packages/iam/domain/src/entities/ApiKey/ApiKey.model.ts:94`).
- **Entities.DeviceCode / OAuthAccessToken / OAuthApplication / OAuthConsent** — Device flow + OAuth client state machines, covering pending status enums and PKCE secrets (`packages/iam/domain/src/entities/DeviceCode/DeviceCode.model.ts:23`, `packages/iam/domain/src/entities/OAuthAccessToken/OAuthAccessToken.model.ts:14`, `packages/iam/domain/src/entities/OAuthApplication/OAuthApplication.model.ts:44`, `packages/iam/domain/src/entities/OAuthConsent/OAuthConsent.model.ts:13`).
- **Entities.Invitation / Member / TeamMember / OrganizationRole** — Membership constructs with schema kits for role/status enums plus PG enum helpers (`packages/iam/domain/src/entities/Invitation/Invitation.model.ts:27`, `packages/iam/domain/src/entities/Member/Member.model.ts:12`, `packages/iam/domain/src/entities/TeamMember/TeamMember.model.ts:12`, `packages/iam/domain/src/entities/OrganizationRole/OrganizationRole.model.ts:13`).
- **Entities.Passkey / TwoFactor / Session / RateLimit** — Authentication hardening (WebAuthn, TOTP, session context) and rate tracking (`packages/iam/domain/src/entities/Passkey/Passkey.model.ts:24`, `packages/iam/domain/src/entities/TwoFactor/TwoFactor.model.ts:19`, `packages/iam/domain/src/entities/Session/Session.model.ts:14`, `packages/iam/domain/src/entities/RateLimit/RateLimit.model.ts:14`).
- **Entities.Subscription / WalletAddress / SsoProvider / Verification** — Billing, crypto wallets, SSO metadata, and verification tokens with expiry logic (`packages/iam/domain/src/entities/Subscription/Subscription.model.ts:14`, `packages/iam/domain/src/entities/WalletAddress/WalletAddress.model.ts:14`, `packages/iam/domain/src/entities/SsoProvider/SsoProvider.model.ts:13`, `packages/iam/domain/src/entities/Verification/Verification.model.ts:14`).
- **Schema kits** — Literal kits expose `.Enum`, `.Options`, and `make*PgEnum` utilities for tables (`packages/iam/domain/src/entities/Member/schemas/MemberRole.ts:4`, `packages/iam/domain/src/entities/Invitation/schemas/InvitationStatus.ts:7`).
- **IamError exports** — `IamError` (tagged) and `IamUnknownError` (blends shared unknown error contract) (`packages/iam/domain/src/IamError.ts:4`).

## Usage Snapshots
- `packages/iam/infra/src/adapters/repos/User.repo.ts:2` — repositories import `Entities` to seed `Repo.make` factories that enforce typed persistence.
- `packages/iam/infra/src/adapters/better-auth/Auth.service.ts:195` — Better Auth hooks lean on `IamEntities.Member.MemberStatusEnum` to seed owner memberships during session creation.
- `packages/iam/tables/src/tables/member.table.ts:11` — PG enum factories (`makeMemberRolePgEnum`) ensure database enums stay synchronized with domain literals.
- `packages/_internal/db-admin/test/iam-infra/repos/AccountRepo.test.ts:38` — Integration tests build insert payloads with `Entities.User.Model.insert.make` to validate repo flows end-to-end.
- `packages/_internal/db-admin/test/pg-container.ts:223` — Test harness seeds IAM fixtures directly from `Entities.*` model variants when spinning Postgres containers.

## Tooling & Docs Shortcuts
- `context7__resolve-library-id` — `{"libraryName":"effect"}`
- `context7__get-library-docs` — `{"context7CompatibleLibraryID":"/effect-ts/effect","topic":"Schema","tokens":2000}`
- `effect_docs__effect_docs_search` — `{"query":"@effect/sql Model Class schema"}`
- `effect_docs__get_effect_doc` — `{"documentId":4304}`

## Authoring Guardrails
- Always import Effect modules with namespaces (`Effect`, `A`, `F`, `O`, `Str`, `S`, `M`) and rely on Effect collections/utilities instead of native helpers (see global repo guardrails).
- Use `makeFields` so every entity inherits the audit + tracking columns and typed IDs; never redefine `id`, `_rowId`, `version`, or timestamps manually (`packages/shared/domain/src/common.ts:67`).
- Maintain `Symbol.for("@beep/iam-domain/<Entity>Model")` naming to keep schema metadata stable across database migrations and clients (example: `packages/iam/domain/src/entities/Session/Session.model.ts:7`).
- Prefer `BS` helpers (`FieldOptionOmittable`, `FieldSensitiveOptionOmittable`, `toOptionalWithDefault`, `BoolWithDefault`) to describe optionality and defaults; this keeps insert/update variants aligned with `Model.Class` expectations (`packages/iam/domain/src/entities/Account/Account.model.ts:32`, `packages/iam/domain/src/entities/Member/Member.model.ts:16`).
- When updating schema kits, extend literals in the kit file **and** propagate matching enums via `make*PgEnum` within `@beep/iam-tables` to avoid PG drift (`packages/iam/domain/src/entities/Member/schemas/MemberRole.ts:4`, `packages/iam/tables/src/tables/member.table.ts:1`).
- Route new error types through `IamError` (or compose new tagged subclasses) rather than throwing bare `Error`, ensuring RPC and HTTP layers can map causes predictably (`packages/iam/domain/src/IamError.ts:4`).

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
