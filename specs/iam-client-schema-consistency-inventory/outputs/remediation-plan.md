# IAM Client Schema Consistency Remediation Plan

## Prioritization Rubric
- P0: Sensitive data exposure or redaction gaps (tokens, passwords, session secrets).
- P1: Domain correctness / schema alignment (domain transforms, Model.insert usage, branded IDs).
- P2: Nullability correctness (nullable vs optional, FieldOptionOmittable alignment).
- P3: Canonical primitive usage / consistency (BS.* vs raw S.* where required).

## Phase 0 — Validation (Short)
- Re-validate inventory entries against current source to ensure no drift.
- Confirm which ad-hoc schemas are intentionally BetterAuth-shaped and which must align to domain transforms.
- Outcome: marked inventory with "confirmed" vs "defer".

## P0 — Sensitive Field Redaction
Goal: Ensure all credential-bearing fields use `S.Redacted(S.String)` (or BS wrappers) per IAM client guardrails.

Targets (from inventory):
- `packages/iam/client/src/admin/revoke-user-session/contract.ts:34`
- `packages/iam/client/src/core/revoke-session/contract.ts:34`
- `packages/iam/client/src/multi-session/set-active/contract.ts:36`
- `packages/iam/client/src/multi-session/revoke/contract.ts:36`
- `packages/iam/client/src/one-time-token/generate/contract.ts:63`
- `packages/iam/client/src/one-time-token/verify/contract.ts:36`
- `packages/iam/client/src/password/reset/contract.ts:42`
- `packages/iam/client/src/password/change/contract.ts:101`
- `packages/iam/client/src/core/list-accounts/contract.ts:49`
- `packages/iam/client/src/core/list-accounts/contract.ts:50`
- `packages/iam/client/src/core/list-accounts/contract.ts:54`
- `packages/iam/client/src/core/list-accounts/contract.ts:56`
- `packages/iam/client/src/two-factor/totp/verify/contract.ts:47`
- `packages/iam/client/src/two-factor/backup/verify/contract.ts:49`
- `packages/iam/client/src/two-factor/otp/verify/contract.ts:46`
- `packages/iam/client/src/sso/register/contract.ts:149`
- `packages/iam/client/src/sso/request-domain-verification/contract.ts:66`

Notes:
- Replace `S.String` with `S.Redacted(S.String)` or reuse `BS.Password`/`Common.UserPassword` when applicable.
- Update any form defaults that assume raw strings to match encoded redacted forms.

## P1 — Domain Alignment (Transforms + Variants)
Goal: Route BetterAuth responses through domain transforms and use `Model.insert` for create payloads.

1) Use domain transforms instead of ad-hoc schemas:
- Multi-session list: `packages/iam/client/src/multi-session/list-sessions/contract.ts` → `Common.DomainSessionFromBetterAuthSession`
- Organization CRUD/Teams/Roles/Members contracts and `_common` schemas listed in inventory.
- Organization role + team schemas in `_internal` and `_common` should be replaced or consumed only via transforms.

2) Use `Model.insert` for create payloads:
- `packages/iam/client/src/admin/create-user/contract.ts:46`
- Review other create flows in org CRUD if they should map to `Organization.Model.insert` or `Model.jsonCreate`.

3) Enforce branded EntityIds in payloads:
- `packages/iam/client/src/organization/list-roles/contract.ts:15`
- `packages/iam/client/src/organization/invitations/list/contract.ts:27`
- `packages/iam/client/src/api-key/create/contract.ts:17`

Expected outcomes:
- All BetterAuth response shapes are transformed to domain models.
- Create payloads align with domain inserts, reducing drift.

## P2 — Nullability Corrections
Goal: Align optional audit fields and nullable domain fields with `S.optionalWith(..., { nullable: true })` and avoid `require*` for nullable columns.

1) Replace strict `require*` for optional audit fields:
- `packages/iam/client/src/_internal/user.schemas.ts:110`
- `packages/iam/client/src/_internal/session.schemas.ts:159`
- `packages/iam/client/src/_internal/member.schemas.ts:226`
- `packages/iam/client/src/_internal/invitation.schemas.ts:159`
- `packages/iam/client/src/_internal/organization.schemas.ts:176`
- `packages/iam/client/src/_internal/team.schemas.ts:128`
- `packages/iam/client/src/_internal/team.schemas.ts:337`
- `packages/iam/client/src/_internal/role.schemas.ts:146`
- `packages/iam/client/src/_internal/api-key.schemas.ts:206`

2) Replace `S.optional(...)` with `S.optionalWith(..., { nullable: true })` for nullable columns:
- `packages/iam/client/src/_internal/team.schemas.ts:66`
- `packages/iam/client/src/_internal/team.schemas.ts:244`
- `packages/iam/client/src/_internal/invitation.schemas.ts:44`
- `packages/iam/client/src/_internal/role.schemas.ts:76`
- `packages/iam/client/src/_internal/organization.schemas.ts:50`
- `packages/iam/client/src/_internal/api-key.schemas.ts:127`
- `packages/iam/client/src/_internal/member.schemas.ts:68`
- `packages/iam/client/src/_internal/member.schemas.ts:108`

3) Nullable user fields should not be required:
- `packages/iam/client/src/_internal/user.schemas.ts:131-140` (banReason, banExpires, phoneNumber, username, displayUsername, stripeCustomerId, lastLoginMethod)

Expected outcomes:
- Nullable audit columns no longer hard-fail at decode.
- Optional DB fields decode consistently with FieldOptionOmittable semantics.

## P3 — Canonical Primitive Replacement
Goal: Replace raw `S.String`/`S.Number` when `BS.*` or model fields exist.

High-impact replacements:
- Organization name/slug/logo: `packages/iam/client/src/organization/crud/*/contract.ts`
- Invitation role: `packages/iam/client/src/organization/_common/invitation.schema.ts:32`
- Team name: `packages/iam/client/src/organization/create-team/contract.ts:16`
- Organization role name: `packages/iam/client/src/organization/create-role/contract.ts:17`
- User name/role/password: `packages/iam/client/src/admin/create-user/contract.ts:49-51`

Expected outcomes:
- Shared schema primitives applied consistently across IAM client.

## Verification
- Run `bun run check --filter @beep/iam-client` after each phase.
- Update/extend `packages/iam/client/test/_internal/transformation.test.ts` for nullability changes.
- Re-run inventory scan to ensure no regressions.

