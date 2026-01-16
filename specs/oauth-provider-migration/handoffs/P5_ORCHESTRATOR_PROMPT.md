# Phase 5: Type Alignment Checks - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 5 of 7
- **Package**: `@beep/iam-tables`
- **Location**: `packages/iam/tables/src/_check.ts`
- **Prerequisites**: Phase 2 (Domain Models) and Phase 3 (Tables) complete

---

## Objective

Add type alignment checks that verify domain models match table schemas at compile time.

---

## Files to Modify

| File | Action |
|------|--------|
| `_check.ts` | Add 8 check statements (select + insert for each entity) |

---

## Implementation

### Add Imports

Add to the import statement at top of `_check.ts`:

```typescript
import type {
  // ... existing imports
  OAuthClient,
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthConsent,
} from "@beep/iam-domain/entities";
```

### Add Type Checks

```typescript
// OAuth Client
export const _oauthClientSelect: typeof OAuthClient.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthClient
>;
export const _checkInsertOAuthClient: typeof OAuthClient.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthClient
>;

// OAuth Access Token
export const _oauthAccessTokenSelect: typeof OAuthAccessToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthAccessToken
>;
export const _checkInsertOAuthAccessToken: typeof OAuthAccessToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthAccessToken
>;

// OAuth Refresh Token
export const _oauthRefreshTokenSelect: typeof OAuthRefreshToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthRefreshToken
>;
export const _checkInsertOAuthRefreshToken: typeof OAuthRefreshToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthRefreshToken
>;

// OAuth Consent
export const _oauthConsentSelect: typeof OAuthConsent.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthConsent
>;
export const _checkInsertOAuthConsent: typeof OAuthConsent.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthConsent
>;
```

---

## Purpose of Type Checks

These checks ensure:
1. Domain model field names match table column names (after snake_case conversion)
2. Field types are compatible (e.g., `S.String` → `text`)
3. Nullability matches (optional fields in domain → nullable columns in table)
4. Insert variants handle defaults correctly

If there's a mismatch, TypeScript will error at compile time, catching schema drift early.

---

## Troubleshooting

### Common Type Mismatches

1. **Field name mismatch**: Domain uses `clientId`, table uses `client_id` - check column naming
2. **Optionality mismatch**: Domain field is required but table column allows null
3. **Array type mismatch**: Domain uses `S.Array(S.String)`, table needs `text().array()`
4. **Date/timestamp mismatch**: Domain uses `BS.DateTimeUtcFromAllAcceptable`, table needs `datetime()` helper

### Resolution Strategy

If type check fails:
1. Identify which field has the mismatch
2. Compare domain model field definition with table column definition
3. Adjust either domain or table to match (prefer adjusting table if domain is correct per spec)

---

## Verification

```bash
bun run check --filter @beep/iam-tables
```

**Expected**: No type errors. Any errors indicate domain/table mismatch.

---

## Post-Execution Checklist

- [ ] All 8 type checks added (select + insert for 4 entities)
- [ ] Verification passes (no type mismatches)
- [ ] If errors, domain or table adjusted to resolve
- [ ] Updated REFLECTION_LOG.md
- [ ] Review/update P6_ORCHESTRATOR_PROMPT.md

---

## Handoff

Proceed to Phase 6 (Admin DB).
