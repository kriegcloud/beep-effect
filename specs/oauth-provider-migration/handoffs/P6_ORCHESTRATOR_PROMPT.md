# Phase 6: Admin Database Updates - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 6 of 7
- **Package**: `@beep/db-admin`
- **Location**: `packages/_internal/db-admin/src/`
- **Prerequisites**: Phases 3 (Tables) and 4 (Relations) complete

---

## Objective

Update the unified db-admin relations to include OAuth entities, enabling migrations and admin tools.

---

## Files to Modify

| File | Action |
|------|--------|
| `slice-relations.ts` | Export new OAuth relations |
| `relations.ts` | Update unified user/organization relations |

---

## Implementation

### Update slice-relations.ts

Add OAuth relation exports from IAM tables:

```typescript
export {
  // ... existing exports
  oauthClientRelations,
  oauthAccessTokenRelations,
  oauthRefreshTokenRelations,
  oauthConsentRelations,
} from "@beep/iam-tables/relations";
```

### Update relations.ts

#### Add to userRelations

Find the `userRelations` definition and add:

```typescript
oauthClients: many(Tables.oauthClient),
oauthRefreshTokens: many(Tables.oauthRefreshToken),
oauthAccessTokens: many(Tables.oauthAccessToken),
oauthConsents: many(Tables.oauthConsent),
```

#### Add to sessionRelations (if exists)

```typescript
oauthRefreshTokens: many(Tables.oauthRefreshToken),
oauthAccessTokens: many(Tables.oauthAccessToken),
```

### Remove Old References

If the file still contains old `oauthApplication` references, remove them:
- Remove from imports
- Remove from user/organization relations
- Remove standalone `oauthApplicationRelations`

---

## Why db-admin Needs Updates

The `db-admin` package serves as the unified schema for:
1. Database migrations (drizzle-kit)
2. Admin tooling
3. Cross-slice relation queries

It aggregates all slice tables and relations into a single schema definition.

---

## Verification

```bash
bun run check --filter @beep/db-admin
```

---

## Post-Execution Checklist

- [ ] `slice-relations.ts` exports 4 new OAuth relations
- [ ] `relations.ts` userRelations updated
- [ ] Old `oauthApplication` references removed (if present)
- [ ] Verification passes
- [ ] Updated REFLECTION_LOG.md
- [ ] Review/update P7_ORCHESTRATOR_PROMPT.md

---

## Handoff

Proceed to Phase 7 (Migration).
