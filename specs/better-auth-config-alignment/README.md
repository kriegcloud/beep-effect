# Better Auth Configuration Alignment Spec

> Systematic alignment of Better Auth plugin configurations with Drizzle table schemas to ensure OpenAPI documentation accuracy.

## Status: COMPLETE

**Completed**: 2026-01-15

All 5 phases have been executed successfully:
- Phase 0: Discovery & Documentation Gathering
- Phase 1: Core Models (User, Session, Account)
- Phase 2: Organization Models
- Phase 3: Authentication Plugin Models
- Phase 4: Integration Plugin Models
- Phase 5: Verification & Client Alignment

See `outputs/final-gap-analysis.md` for complete findings and recommendations.

---

## Purpose & Scope

Align the Better Auth `additionalFields` configuration in `packages/iam/server/src/adapters/better-auth/Options.ts` with the actual column definitions in Drizzle tables (`@beep/iam-tables`, `@beep/shared-tables`). This ensures the OpenAPI plugin generates accurate documentation reflecting our enhanced schemas.

### Problem Statement

Better Auth's configuration includes `additionalFields` for models (user, session, account, member, organization, etc.). These fields MUST match the actual Drizzle table columns for:
1. **OpenAPI accuracy**: The `openAPI()` plugin generates documentation from these configs
2. **Type safety**: Misalignment causes runtime errors or silent data loss
3. **Plugin interop**: Other plugins (stripe, passkey, organization) depend on accurate model definitions

### Critical Caveat: Plugin Heterogeneity

**NOT all Better Auth plugins support `additionalFields` configuration**. Different plugins have different configuration approaches:

| Configuration Pattern | Applies To |
|-----------------------|------------|
| `BetterAuthOptions.<model>.additionalFields` | user, session, account (core models) |
| `plugin({ schema: { <model>: { additionalFields } } })` | organization plugin models |
| `plugin({ schema: { <model>: { modelName } } })` | Some plugins (modelName only, no additionalFields) |
| **No schema config** | Many plugins (passkey, twoFactor, apiKey, etc.) |

For plugins without schema configuration support, the extra Drizzle columns (audit fields, custom columns) may not appear in OpenAPI documentation. The research phase must document which plugins support schema customization.

### Key Files

| File | Purpose |
|------|---------|
| `packages/iam/server/src/adapters/better-auth/Options.ts` | Server-side Better Auth configuration |
| `packages/iam/client/src/adapters/better-auth/client.ts` | Client-side Better Auth configuration |
| `packages/iam/tables/src/tables/*.table.ts` | IAM Drizzle table definitions |
| `packages/shared/tables/src/tables/*.table.ts` | Shared Drizzle table definitions |
| `tmp/better-auth/packages/core/src/db/type.ts` | **Better Auth source types** (authoritative reference) |

### Better Auth DBFieldAttributeConfig Reference

The `additionalFields` configuration uses `DBFieldAttribute<T>` type. **Critical defaults**:

| Property | Default | Description |
|----------|---------|-------------|
| `required` | **`true`** | Field required on create - MUST explicitly set `false` for nullable columns |
| `returned` | `true` | Include in API responses |
| `input` | `true` | Accept value on create |

See `tmp/better-auth/packages/core/src/db/type.ts` for complete type definitions including:
- `defaultValue`, `onUpdate`, `transform`, `references`, `unique`, `index`, `fieldName`, `validator`, `bigint`, `sortable`

---

## Table Factory Default Columns

Understanding these is CRITICAL - they are automatically included by `Table.make` and `OrgTable.make`:

### Table.make (all tables)
| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `id` | `string` | Yes | Branded entity ID (e.g., `user__uuid`) |
| `_rowId` | `number` | No | Auto-increment internal ID |
| `createdAt` | `date` | Yes | UTC timestamp, auto-set |
| `updatedAt` | `date` | Yes | UTC timestamp, auto-updated |
| `deletedAt` | `date` | No | Soft delete timestamp |
| `createdBy` | `string` | No | User/system ID |
| `updatedBy` | `string` | No | User/system ID |
| `deletedBy` | `string` | No | User/system ID |
| `version` | `number` | Yes | Optimistic locking |
| `source` | `string` | No | Origin tracking |

### OrgTable.make (tenant-scoped tables)
All columns from `Table.make` PLUS:
| Column | Type | Required | Notes |
|--------|------|----------|-------|
| `organizationId` | `string` | Yes | FK to organization.id |

---

## Entity Configuration Audit Matrix

| # | Entity | Table Factory | Drizzle File | Options.ts Config | Status |
|---|--------|--------------|--------------|-------------------|--------|
| 1 | **User** | `Table.make` | `shared/tables/user.table.ts` | `user.additionalFields` | Partial |
| 2 | **Session** | `Table.make` | `shared/tables/session.table.ts` | `session.additionalFields` | Partial |
| 3 | **Account** | `Table.make` | `iam/tables/account.table.ts` | `account.additionalFields` | Partial |
| 4 | **Organization** | `Table.make` | `shared/tables/organization.table.ts` | `organization.schema.organization` | Partial |
| 5 | **Member** | `OrgTable.make` | `iam/tables/member.table.ts` | `organization.schema.member` | Partial |
| 6 | **Team** | `Table.make` | `shared/tables/team.table.ts` | `organization.schema.team` | Partial |
| 7 | **TeamMember** | `Table.make` | `iam/tables/teamMember.table.ts` | `organization.schema.teamMember` | Needs Review |
| 8 | **Invitation** | `OrgTable.make` | `iam/tables/invitation.table.ts` | `organization.schema.invitation` | Partial |
| 9 | **OrganizationRole** | `OrgTable.make` | `iam/tables/organizationRole.table.ts` | `organization.schema.organizationRole` | Partial |
| 10 | **Verification** | `Table.make` | `iam/tables/verification.table.ts` | `organization.schema.verification` | Partial |
| 11 | **Passkey** | `Table.make` | `iam/tables/passkey.table.ts` | *passkey plugin* | Needs Research |
| 12 | **TwoFactor** | `Table.make` | `iam/tables/twoFactor.table.ts` | *twoFactor plugin* | Needs Research |
| 13 | **ApiKey** | `Table.make` | `iam/tables/apiKey.table.ts` | *apiKey plugin* | Needs Research |
| 14 | **Jwks** | `Table.make` | `iam/tables/jwks.table.ts` | `jwt.schema.jwks` | Partial |
| 15 | **SsoProvider** | `OrgTable.make` | `iam/tables/ssoProvider.table.ts` | *sso plugin* | Needs Research |
| 16 | **ScimProvider** | `OrgTable.make` | `iam/tables/scimProvider.table.ts` | *sso plugin* | Needs Research |
| 17 | **OauthApplication** | `Table.make` | `iam/tables/oauthApplication.table.ts` | `oidcProvider.schema` | Partial |
| 18 | **OauthAccessToken** | `Table.make` | `iam/tables/oauthAccessToken.table.ts` | `oidcProvider.schema` | Partial |
| 19 | **OauthConsent** | `Table.make` | `iam/tables/oauthConsent.table.ts` | `oidcProvider.schema` | Partial |
| 20 | **DeviceCode** | `Table.make` | `iam/tables/deviceCodes.table.ts` | *deviceAuthorization* | Needs Research |
| 21 | **WalletAddress** | `Table.make` | `iam/tables/walletAddress.table.ts` | *siwe plugin* | Needs Research |
| 22 | **Subscription** | `Table.make` | `iam/tables/subscription.table.ts` | *stripe plugin* | Needs Research |
| 23 | **RateLimit** | `Table.make` | `iam/tables/rateLimit.table.ts` | N/A (internal) | Skip |

---

## Plugins Requiring Documentation Research

**Research Method**: Analyze Better Auth source code in `tmp/better-auth/` (see Prerequisites in MASTER_ORCHESTRATION.md).

| Plugin | Import | Support Level | Models | Priority |
|--------|--------|---------------|--------|----------|
| `organization()` | `better-auth/plugins/organization` | **Full** | org, member, team, invitation, role | P0 |
| `username()` | `better-auth/plugins` | Partial | User (extends) | P1 |
| `twoFactor()` | `better-auth/plugins` | Partial | TwoFactor | P1 |
| `passkey()` | `@better-auth/passkey` | Partial | Passkey | P1 |
| `phoneNumber()` | `better-auth/plugins/phone-number` | Partial | User (extends) | P1 |
| `anonymous()` | `better-auth/plugins/anonymous` | Partial | User (extends) | P1 |
| `admin()` | `better-auth/plugins/admin` | Partial | User (extends) | P1 |
| `stripe()` | `@better-auth/stripe` | TBD | Subscription | P2 |
| `sso()` | `@better-auth/sso` | **Minimal** | SsoProvider | P2 |
| `siwe()` | `better-auth/plugins/siwe` | **None** | WalletAddress | P2 |
| `jwt()` | `better-auth/plugins/jwt` | Partial | Jwks | P3 |
| `oidcProvider()` | `better-auth/plugins/oidc-provider` | Partial | OAuth models | P3 |
| `deviceAuthorization()` | `better-auth/plugins/device-authorization` | TBD | DeviceCode | P3 |
| `apiKey()` | `better-auth/plugins` | Partial | ApiKey | P3 |
| `lastLoginMethod()` | `better-auth/plugins` | TBD | User (extends) | P3 |
| `scim()` | `@better-auth/scim` | **None** | ScimProvider | P3 |

---

## Phase Structure

### Phase 0: Discovery & Documentation Gathering
- Research Better Auth docs for each plugin's schema options
- Map plugin configurations to their model extensions
- Document which plugins add which fields to which models

### Phase 1: Core Models (User, Session, Account)
- Align `user.additionalFields` with user.table.ts
- Align `session.additionalFields` with session.table.ts
- Align `account.additionalFields` with account.table.ts

### Phase 2: Organization Models
- Align organization plugin schema configurations
- Cover: Organization, Member, Team, TeamMember, Invitation, OrganizationRole

### Phase 3: Authentication Plugins
- twoFactor, passkey, phoneNumber, anonymous, admin, username
- Map their model extensions to table columns

### Phase 4: Integration Plugins
- stripe (Subscription), sso (SsoProvider, ScimProvider), siwe (WalletAddress)
- jwt, oidcProvider, deviceAuthorization, apiKey

### Phase 5: Verification & Client Alignment
- Run OpenAPI generation to verify
- Update client.ts if needed for type inference
- Create tests if applicable

---

## Success Criteria

- [x] All `additionalFields` in Options.ts match Drizzle table columns
- [x] Plugin schema configurations include custom table columns (where supported)
- [x] OpenAPI documentation reflects all enhanced fields (for FULL-support plugins)
- [x] `bun run check --filter @beep/iam-server` passes
- [x] `bun run build --filter @beep/iam-server` succeeds
- [x] Client types infer correctly via transformation schemas
- [x] REFLECTION_LOG.md updated after each phase

**Note**: Many plugins only support PARTIAL schema configuration (modelName + fields renaming). Custom columns for these plugins exist at the database level but cannot be exposed via Better Auth's API. See `outputs/final-gap-analysis.md` for details.

---

## Quick Start

```bash
# Setup: Clone Better Auth source for research
mkdir -p tmp && git clone https://github.com/better-auth/better-auth.git tmp/better-auth

# Research plugin schema support (source code analysis)
grep -r "additionalFields" tmp/better-auth/packages/<plugin>/src/

# Verification commands
bun run check --filter @beep/iam-server
bun run build --filter @beep/iam-server
bun run lint:fix --filter @beep/iam-server

# For client alignment
bun run check --filter @beep/iam-client
bun run build --filter @beep/iam-client
```

---

## Related Documentation

| File | Purpose |
|------|---------|
| [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) | Detailed workflow per entity |
| [QUICK_START.md](./QUICK_START.md) | 5-minute onboarding |
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Cumulative learnings |
| [handoffs/](./handoffs/) | Phase transition documents |
| [packages/shared/tables/CLAUDE.md](../../packages/shared/tables/CLAUDE.md) | Table factory patterns |
| [packages/iam/tables/CLAUDE.md](../../packages/iam/tables/CLAUDE.md) | IAM table patterns |
