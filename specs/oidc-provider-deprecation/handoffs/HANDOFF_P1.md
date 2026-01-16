# Phase 1 Handoff: OIDC Deprecation Cleanup

> Detailed execution instructions for removing deprecated OIDC provider code.

---

## Context

The `oidcProvider` plugin from better-auth is deprecated. This phase removes all related code:
- 4 tables
- 4 domain entity directories
- 4 entity ID schemas
- Relations and type checks

---

## Execution Steps

### Step 1: Clean Relations (`packages/iam/tables/src/relations.ts`)

**Remove standalone OAuth relation definitions:**
```typescript
// DELETE these entire relation blocks:
export const oauthAccessTokenRelations = ...
export const oauthApplicationRelations = ...
export const oauthConsentRelations = ...
```

**Remove OAuth references from `userRelations`:**
```typescript
// In userRelations, DELETE:
oauthApplications: many(oauthApplication),
oauthAccessTokens: many(oauthAccessToken),
oauthConsents: many(oauthConsent),
```

**Remove OAuth references from `organizationRelations`:**
```typescript
// In organizationRelations, DELETE:
oauthAccessTokens: many(oauthAccessToken),
oauthApplications: many(oauthApplication),
oauthConsents: many(oauthConsent),
```

**Also remove imports at top of file:**
```typescript
// DELETE these imports:
import { oauthAccessToken } from "./tables/oauthAccessToken.table";
import { oauthApplication } from "./tables/oauthApplication.table";
import { oauthConsent } from "./tables/oauthConsent.table";
```

### Step 2: Clean Type Checks (`packages/iam/tables/src/_check.ts`)

**Remove type check assertions:**
```typescript
// DELETE Jwks checks:
export const _checkSelectJwks: typeof Jwks.Model.select.Encoded = ...
export const _checkInsertJwks: typeof Jwks.Model.insert.Encoded = ...

// DELETE OAuthAccessToken checks:
export const _checkSelectOAuthAccessToken: typeof OAuthAccessToken.Model.select.Encoded = ...
export const _checkInsertOAuthAccessToken: typeof OAuthAccessToken.Model.insert.Encoded = ...

// DELETE OAuthApplication checks:
export const _checkSelectOAuthApplication: typeof OAuthApplication.Model.select.Encoded = ...
export const _checkInsertOAuthApplication: typeof OAuthApplication.Model.insert.Encoded = ...

// DELETE OAuthConsent checks:
export const _checkSelectOAuthConsent: typeof OAuthConsent.Model.select.Encoded = ...
export const _checkInsertOAuthConsent: typeof OAuthConsent.Model.insert.Encoded = ...
```

**Remove associated imports at top of file.**

### Step 3: Delete Table Files

Delete these files from `packages/iam/tables/src/tables/`:
- `oauthAccessToken.table.ts`
- `oauthApplication.table.ts`
- `oauthConsent.table.ts`
- `jwks.table.ts`

### Step 4: Update Table Index (`packages/iam/tables/src/tables/index.ts`)

Remove exports:
```typescript
// DELETE these lines:
export * from "./oauthAccessToken.table";
export * from "./oauthApplication.table";
export * from "./oauthConsent.table";
export * from "./jwks.table";
```

### Step 5: Delete Domain Entity Directories

Delete these directories from `packages/iam/domain/src/entities/`:
- `OAuthAccessToken/`
- `OAuthApplication/`
- `OAuthConsent/`
- `Jwks/`

### Step 6: Update Domain Entity Index (`packages/iam/domain/src/entities/index.ts`)

Remove exports:
```typescript
// DELETE these lines:
export * as OAuthAccessToken from "./OAuthAccessToken";
export * as OAuthApplication from "./OAuthApplication";
export * as OAuthConsent from "./OAuthConsent";
export * as Jwks from "./Jwks";
```

### Step 7: Remove Entity ID Schemas (`packages/shared/domain/src/entity-ids/iam/ids.ts`)

Remove these entity ID definitions:
```typescript
// DELETE JwksId block (including comments and export)
// DELETE OAuthAccessTokenId block
// DELETE OAuthApplicationId block
// DELETE OAuthConsentId block
```

Also update any aggregated exports in:
- `packages/shared/domain/src/entity-ids/iam/index.ts` (if exists)
- `packages/shared/domain/src/entity-ids/entity-ids.ts` (AnyEntityId union)

---

## Verification Commands

Run after each major step to catch errors early:

```bash
# After Steps 1-4 (tables package)
bun run check --filter @beep/iam-tables

# After Steps 5-6 (domain package)
bun run check --filter @beep/iam-domain

# After Step 7 (shared domain)
bun run check --filter @beep/shared-domain

# Full verification
bun run check
bun run build
bun run lint
```

---

## Expected Errors

During the cleanup process, you may encounter:

1. **Import errors**: When removing files, imports in other files will break. This is expected—fix by removing the imports.

2. **Type errors in _check.ts**: After removing entity imports, type assertions will fail. Remove them.

3. **Unused import warnings**: Biome will flag removed imports. Run `bun run lint:fix`.

4. **Missing exports**: Index files may reference deleted modules. Update exports.

---

## Rollback Plan

If issues arise, the changes are file deletions and removals. Git can restore any accidentally deleted content:

```bash
# Restore a deleted file
git checkout HEAD -- packages/iam/tables/src/tables/oauthAccessToken.table.ts

# Restore a deleted directory
git checkout HEAD -- packages/iam/domain/src/entities/OAuthAccessToken/
```

---

## Post-Completion

After successful cleanup:

1. **Update REFLECTION_LOG.md** with learnings
2. **Create HANDOFF_P2.md** for Phase 2 (new schema creation)
3. **Run database migration** if schema files are affected
4. **Inform user** that Phase 1 is complete and await instructions for Phase 2
