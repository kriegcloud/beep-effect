# OIDC Provider Deprecation Spec

> Systematic removal of deprecated `oidcProvider` plugin code from the beep-effect monorepo, followed by creation of new tables and domain models for the replacement `oauthProvider` plugin.

---

## Purpose & Scope

The `oidcProvider` plugin from better-auth is deprecated and will be replaced by `oauthProvider` from `@better-auth/oauth-provider`. This spec tracks the removal of all deprecated OIDC-related code from:

1. **Tables** (`packages/iam/tables`)
2. **Domain Entity Models** (`packages/iam/domain`)
3. **Entity ID Schemas** (`packages/shared/domain/src/entity-ids/iam`)
4. **Relations and Type Checks**

### Problem Statement

The codebase contains tables, domain models, entity IDs, and relations for the now-deprecated `oidcProvider` plugin:
- `OAuthAccessToken`
- `OAuthApplication`
- `OAuthConsent`
- `Jwks`

These artifacts create maintenance burden and potential confusion. The new `oauthProvider` plugin has different schema requirements.

### Solution

1. **Phase 1**: Remove all deprecated OIDC-related code
2. **Phase 2**: Create new tables and domain models for `oauthProvider` plugin (to be defined based on schema analysis)

---

## Inventory: Code to Remove

### Tables (`packages/iam/tables/src/tables/`)

| File | Entity | Purpose |
|------|--------|---------|
| `oauthAccessToken.table.ts` | OAuthAccessToken | OAuth2 access/refresh token storage |
| `oauthApplication.table.ts` | OAuthApplication | OAuth2 client application registration |
| `oauthConsent.table.ts` | OAuthConsent | User consent records for OAuth2 clients |
| `jwks.table.ts` | Jwks | JSON Web Key Sets for OIDC token signing |

### Domain Entities (`packages/iam/domain/src/entities/`)

| Directory | Entity | Purpose |
|-----------|--------|---------|
| `OAuthAccessToken/` | OAuthAccessToken | Access token domain model with M.Class |
| `OAuthApplication/` | OAuthApplication | OAuth client domain model |
| `OAuthConsent/` | OAuthConsent | Consent record domain model |
| `Jwks/` | Jwks | JWKS domain model |

### Entity IDs (`packages/shared/domain/src/entity-ids/iam/ids.ts`)

| ID Schema | Table Prefix | Lines |
|-----------|--------------|-------|
| `JwksId` | `iam_jwks` | 79-94 |
| `OAuthAccessTokenId` | `iam_oauth_access_token` | 113-128 |
| `OAuthApplicationId` | `iam_oauth_application` | 130-145 |
| `OAuthConsentId` | `iam_oauth_consent` | 147-162 |

### Relations (`packages/iam/tables/src/relations.ts`)

| Relation | Lines (approx) |
|----------|----------------|
| `oauthAccessTokenRelations` | 78-87 |
| `oauthApplicationRelations` | 89-98 |
| `oauthConsentRelations` | 100-109 |
| `userRelations` (refs to OAuth) | Remove `oauthApplications`, `oauthAccessTokens`, `oauthConsents` |
| `organizationRelations` (refs to OAuth) | Remove `oauthAccessTokens`, `oauthApplications`, `oauthConsents` |

### Type Checks (`packages/iam/tables/src/_check.ts`)

| Check | Lines (approx) |
|-------|----------------|
| Jwks checks | 50-51 |
| OAuthAccessToken checks | 57-63 |
| OAuthApplication checks | 65-71 |
| OAuthConsent checks | 73-79 |

### Index Exports

| File | Remove |
|------|--------|
| `packages/iam/tables/src/tables/index.ts` | `oauthAccessToken`, `oauthApplication`, `oauthConsent`, `jwks` exports |
| `packages/iam/domain/src/entities/index.ts` | `OAuthAccessToken`, `OAuthApplication`, `OAuthConsent`, `Jwks` exports |

---

## Phase Structure

### Phase 1: Deprecation Cleanup (Current)

Remove all OIDC-related code listed in the inventory above.

**Execution Order** (to prevent import errors):

1. Remove relation references in `relations.ts` (OAuth references in user/org relations)
2. Remove standalone OAuth relation definitions
3. Remove type checks in `_check.ts`
4. Remove table files
5. Update table index exports
6. Remove domain entity directories
7. Update domain entity index exports
8. Remove entity ID schemas
9. Verify with `bun run check`, `bun run build`, `bun run lint`

### Phase 2: OAuthProvider Schema Creation (Future)

After Phase 1 completion, analyze `@better-auth/oauth-provider` plugin schema and create:
- New tables for oauth provider entities
- New domain models
- New entity IDs

This phase will be defined based on the generated `auth.schema.ts` output.

---

## Success Criteria

### Phase 1 Checklist

- [ ] `oauthAccessToken.table.ts` deleted
- [ ] `oauthApplication.table.ts` deleted
- [ ] `oauthConsent.table.ts` deleted
- [ ] `jwks.table.ts` deleted
- [ ] `OAuthAccessToken/` directory deleted
- [ ] `OAuthApplication/` directory deleted
- [ ] `OAuthConsent/` directory deleted
- [ ] `Jwks/` directory deleted
- [ ] Entity IDs removed from `ids.ts`
- [ ] Relations cleaned in `relations.ts`
- [ ] Type checks removed from `_check.ts`
- [ ] Index exports updated
- [ ] `bun run check --filter @beep/iam-tables` passes
- [ ] `bun run check --filter @beep/iam-domain` passes
- [ ] `bun run check --filter @beep/shared-domain` passes
- [ ] `bun run build` succeeds
- [ ] `bun run lint` produces no new errors

### Phase 2 Checklist (TBD)

- [ ] New `oauthProvider` tables created
- [ ] New domain models created
- [ ] New entity IDs added
- [ ] Relations defined
- [ ] Type checks added
- [ ] All verification commands pass

---

## Execution Commands

```bash
# Run after each file modification to verify
bun run check --filter @beep/iam-tables
bun run check --filter @beep/iam-domain
bun run check --filter @beep/shared-domain

# Full build verification
bun run build

# Lint check
bun run lint

# Database migration (if applicable)
bun run db:generate
```

---

## Related Documentation

| File | Purpose |
|------|---------|
| [REFLECTION_LOG.md](./REFLECTION_LOG.md) | Learnings from execution |
| [packages/iam/tables/CLAUDE.md](../../packages/iam/tables/CLAUDE.md) | Table authoring guide |
| [packages/iam/domain/CLAUDE.md](../../packages/iam/domain/CLAUDE.md) | Domain entity guide |
| [packages/shared/domain/CLAUDE.md](../../packages/shared/domain/CLAUDE.md) | Entity ID guide |
| [scratchpad/auth.schema.ts](../../scratchpad/auth.schema.ts) | Generated Better Auth schema |

---

## Reference: better-auth Documentation

From the [better-auth OIDC Provider docs](https://www.better-auth.com/docs/plugins/oidc-provider):

> The `oidcProvider` plugin will be deprecated. Use `oauthProvider` from `@better-auth/oauth-provider` instead.

The new `oauthProvider` plugin provides OAuth2 authorization server functionality without the full OIDC complexity (no JWKS, no ID tokens, simpler consent model).
