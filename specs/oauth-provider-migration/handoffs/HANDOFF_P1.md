# HANDOFF_P1.md - Phase 1 Context

> Context document for Phase 1 (Entity IDs) execution and handoff.

---

## Phase 1 Objective

Create 4 new entity ID schemas in `packages/shared/domain/src/entity-ids/iam/`.

## Pre-Execution State

- Empty entity folders exist: `OAuthClient/`, `OAuthAccessToken/`, `OAuthRefreshToken/`, `OAuthConsent/`
- Empty table files exist in `packages/iam/tables/src/tables/`
- Reference schema available in `scratchpad/auth.schema.ts`

## Entity IDs to Create

| ID | Table Prefix | Brand |
|----|--------------|-------|
| `OAuthClientId` | `oauth_client` | `"OAuthClientId"` |
| `OAuthAccessTokenId` | `oauth_access_token` | `"OAuthAccessTokenId"` |
| `OAuthRefreshTokenId` | `oauth_refresh_token` | `"OAuthRefreshTokenId"` |
| `OAuthConsentId` | `oauth_consent` | `"OAuthConsentId"` |

## Files to Modify

1. `ids.ts` - Add 4 ID schema definitions
2. `table-name.ts` - Add table names to `TableName` class
3. `any-id.ts` - Add IDs to `AnyId` union

## Verification

```bash
bun run check --filter @beep/shared-domain
```

## Execute With

See [P1_ORCHESTRATOR_PROMPT.md](./P1_ORCHESTRATOR_PROMPT.md)

---

## Post-Execution (To Fill After Phase 1)

### Summary
- [ ] Files modified: `ids.ts`, `table-name.ts`, `any-id.ts`
- [ ] Verification passed
- [ ] Entity IDs exported and usable

### Learnings
(Fill after execution)

### Prompt Improvements for Phase 2
(Fill after execution - what should P2 prompt include based on P1 learnings)

---

## Next Phase

After Phase 1 completion:
1. Update this document with execution results
2. Update REFLECTION_LOG.md
3. Review/update P2_ORCHESTRATOR_PROMPT.md based on learnings
4. Proceed to Phase 2 (Domain Models)
