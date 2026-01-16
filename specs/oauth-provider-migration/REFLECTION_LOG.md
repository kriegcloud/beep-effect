# Reflection Log

> Cumulative learnings from OAuth Provider migration implementation.

---

## Spec Creation (2026-01-15)

### Context Gathered

- Reviewed `scratchpad/auth.schema.ts` for complete table schema definitions
- Analyzed existing patterns in `packages/shared/domain/src/entity-ids/iam/ids.ts`
- Studied `Account.model.ts` as canonical domain model pattern
- Examined `account.table.ts` and `member.table.ts` for Table.make vs OrgTable.make usage
- Reviewed `_check.ts` for type alignment verification pattern
- Analyzed `relations.ts` for drizzle relation definitions
- Checked `db-admin/relations.ts` for unified relation patterns

### Key Decisions

1. **Table.make vs OrgTable.make**: OAuth entities are user-scoped (via userId), not organization-scoped, so `Table.make` is appropriate (similar to `account.table.ts`)

2. **Foreign Key Strategy**: OAuth tables reference `oauthClient.clientId` (the public identifier) rather than `oauthClient.id` (internal primary key). This matches the better-auth schema design.

3. **Entity ID Prefixes**: Using `oauth_client`, `oauth_access_token`, `oauth_refresh_token`, `oauth_consent` to match typical IAM naming conventions

4. **Sensitive Field Handling**: Token fields use `BS.FieldSensitiveOptionOmittable` to prevent accidental logging

### Observations

- Empty entity folders (`OAuthClient/`, `OAuthAccessToken/`, etc.) already exist from prior work
- Empty table files exist but need full implementation
- `db-admin/relations.ts` still references old `oauthApplication` which needs cleanup

### Phase Dependencies

```
Phase 1 (Entity IDs)
    ↓
Phase 2 (Domain Models) ← depends on Phase 1 IDs
    ↓
Phase 3 (Tables) ← depends on Phase 1 IDs
    ↓
Phase 4 (Relations) ← depends on Phase 3 tables
    ↓
Phase 5 (Type Checks) ← depends on Phases 2 & 3
    ↓
Phase 6 (Admin DB) ← depends on Phases 3 & 4
    ↓
Phase 7 (Migration) ← depends on all above
```

---

## Phase Execution Logs

### Phase 1: Entity IDs

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 2: Domain Models

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 3: Tables

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 4: Relations

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 5: Type Checks

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 6: Admin DB

**Status**: Not started

**Learnings**: (To be filled during execution)

---

### Phase 7: Migration

**Status**: Not started

**Learnings**: (To be filled during execution)

---

## Anti-Patterns Identified

(To be filled as issues are encountered)

---

## Pattern Improvements

(To be filled as better approaches are discovered)
