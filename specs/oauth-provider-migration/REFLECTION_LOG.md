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

**Status**: DRY RUN COMPLETE (2026-01-15)

**Learnings**:
- Pattern reference was accurate - `EntityId.builder("iam")` with `.annotations()` worked as documented
- Existing inconsistency found: `AccountId` and `ApiKeyId` exist in `ids.ts`/`table-name.ts` but missing from `any-id.ts`
- Insertion order matters for consistency - now documented as "append after last entry"
- Verification (`bun run check`) handles upstream dependencies automatically

**Spec Improvements Applied**:
- Added insertion order guidance to P1_ORCHESTRATOR_PROMPT.md

---

### Phase 2: Domain Models

**Status**: DRY RUN COMPLETE (2026-01-15)

**Learnings**:
- `BS.toOptionalWithDefault(S.Boolean, false)` is deprecated; use `BS.BoolWithDefault(false)`
- Sensitive field consistency matters: OAuthRefreshToken.token should be marked sensitive like OAuthAccessToken.token
- `clientId` as string (not FK reference) follows OAuth spec for interoperability - this design decision wasn't documented
- Pre-flight check for Phase 1 completion prevents confusion

**Spec Improvements Applied**:
- Fixed BS helper naming in P2_ORCHESTRATOR_PROMPT.md
- Added pre-flight check section
- Made OAuthRefreshToken.token sensitive
- Added "Design Note: clientId as String" section

---

### Phase 3: Tables

**Status**: DRY RUN COMPLETE (2026-01-15)

**Learnings**:
- Critical FK design (clientId → oauthClient.clientId, not .id) works correctly
- Cross-phase verification dependency: Phase 3 check fails if Phase 2 has errors
- Import order matters for circular dependency prevention: oauthClient → oauthRefreshToken → oauthAccessToken
- `datetime` import only needed for tables with timestamp columns

**Spec Improvements Applied**:
- Added pre-flight checks to P3_ORCHESTRATOR_PROMPT.md
- Added cross-phase verification note with isolated syntax check
- Added import reference section showing which imports are conditional

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

### 1. Using Deprecated BS Helpers
**Problem**: Spec used `BS.toOptionalWithDefault(S.Boolean, false)` which caused linter errors.
**Fix**: Always use `BS.BoolWithDefault(false)` for boolean defaults.

### 2. Inconsistent Sensitive Field Marking
**Problem**: Access tokens marked sensitive but refresh tokens weren't, despite both being credentials.
**Fix**: Mark ALL credential fields (tokens, secrets, passwords) with `BS.FieldSensitiveOptionOmittable`.

### 3. Missing Pre-flight Checks
**Problem**: Agents proceeded without verifying prerequisite phases were complete.
**Fix**: Every phase prompt now includes verification commands for prerequisites.

---

## Pattern Improvements

### 1. Pre-flight Verification
Added to all orchestrator prompts:
```bash
grep -q "ExpectedPattern" target-file && echo "✓ Ready" || echo "✗ STOP"
```

### 2. Design Decision Documentation
Non-obvious patterns like "clientId is a string for OAuth interoperability" now have explicit design notes.

### 3. Cross-Phase Dependency Notes
Verification commands now explain that failures may come from upstream phases, with isolated syntax check alternatives.

### 4. Insertion Order Guidance
Added explicit "append after last entry" guidance to prevent inconsistent placement.
