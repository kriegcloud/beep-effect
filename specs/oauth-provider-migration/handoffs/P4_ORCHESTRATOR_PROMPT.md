# Phase 4: Drizzle Relations - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 4 of 7
- **Package**: `@beep/iam-tables`
- **Location**: `packages/iam/tables/src/relations.ts`
- **Prerequisites**: Phase 3 (Tables) complete

---

## Objective

Define drizzle relations for the 4 OAuth tables and update existing user/session relations.

---

## Files to Modify

| File | Action |
|------|--------|
| `relations.ts` | Add 4 new relation exports + update existing |

---

## Implementation

### Add Imports

```typescript
import {
  oauthClient,
  oauthAccessToken,
  oauthRefreshToken,
  oauthConsent,
} from "./tables";
```

### Add OAuth Client Relations

```typescript
export const oauthClientRelations = d.relations(oauthClient, ({ one, many }) => ({
  user: one(user, {
    fields: [oauthClient.userId],
    references: [user.id],
  }),
  oauthRefreshTokens: many(oauthRefreshToken),
  oauthAccessTokens: many(oauthAccessToken),
  oauthConsents: many(oauthConsent),
}));
```

### Add OAuth Refresh Token Relations

```typescript
export const oauthRefreshTokenRelations = d.relations(oauthRefreshToken, ({ one, many }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthRefreshToken.clientId],
    references: [oauthClient.clientId],
  }),
  session: one(session, {
    fields: [oauthRefreshToken.sessionId],
    references: [session.id],
  }),
  user: one(user, {
    fields: [oauthRefreshToken.userId],
    references: [user.id],
  }),
  oauthAccessTokens: many(oauthAccessToken),
}));
```

### Add OAuth Access Token Relations

```typescript
export const oauthAccessTokenRelations = d.relations(oauthAccessToken, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthAccessToken.clientId],
    references: [oauthClient.clientId],
  }),
  session: one(session, {
    fields: [oauthAccessToken.sessionId],
    references: [session.id],
  }),
  user: one(user, {
    fields: [oauthAccessToken.userId],
    references: [user.id],
  }),
  oauthRefreshToken: one(oauthRefreshToken, {
    fields: [oauthAccessToken.refreshId],
    references: [oauthRefreshToken.id],
  }),
}));
```

### Add OAuth Consent Relations

```typescript
export const oauthConsentRelations = d.relations(oauthConsent, ({ one }) => ({
  oauthClient: one(oauthClient, {
    fields: [oauthConsent.clientId],
    references: [oauthClient.clientId],
  }),
  user: one(user, {
    fields: [oauthConsent.userId],
    references: [user.id],
  }),
}));
```

### Update userRelations

Add to existing `userRelations`:

```typescript
oauthClients: many(oauthClient),
oauthRefreshTokens: many(oauthRefreshToken),
oauthAccessTokens: many(oauthAccessToken),
oauthConsents: many(oauthConsent),
```

### Update sessionRelations

Add to existing `sessionRelations`:

```typescript
oauthRefreshTokens: many(oauthRefreshToken),
oauthAccessTokens: many(oauthAccessToken),
```

---

## Critical Note

Relations reference `oauthClient.clientId` (not `oauthClient.id`) for foreign key fields. This matches the table definitions.

---

## Verification

```bash
bun run check --filter @beep/iam-tables
```

---

## Post-Execution Checklist

- [ ] All 4 OAuth relation exports added
- [ ] userRelations updated
- [ ] sessionRelations updated
- [ ] Verification passes
- [ ] Updated REFLECTION_LOG.md
- [ ] Review/update P5_ORCHESTRATOR_PROMPT.md

---

## Handoff

Proceed to Phase 5 (Type Checks).
