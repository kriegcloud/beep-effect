# Quick Start: OAuth Provider Migration

> 5-minute overview for fast triage.

---

## What This Spec Does

Creates 4 entities for the better-auth `oauthProvider` plugin:
- `OAuthClient` - OAuth client/application registration
- `OAuthAccessToken` - Access token storage
- `OAuthRefreshToken` - Refresh token storage
- `OAuthConsent` - User consent records

---

## Phases (Execute Sequentially)

| Phase | Action | Verify With |
|-------|--------|-------------|
| 1 | Create 4 entity IDs in `@beep/shared-domain` | `bun run check --filter @beep/shared-domain` |
| 2 | Create 4 domain models in `@beep/iam-domain` | `bun run check --filter @beep/iam-domain` |
| 3 | Create 4 tables in `@beep/iam-tables` | `bun run check --filter @beep/iam-tables` |
| 4 | Add drizzle relations | `bun run check --filter @beep/iam-tables` |
| 5 | Add type alignment checks | `bun run check --filter @beep/iam-tables` |
| 6 | Update `@beep/db-admin` relations | `bun run check --filter @beep/db-admin` |
| 7 | Generate and apply migrations | `bun run db:generate && bun run db:migrate` |

---

## Fast-Path Execution

```bash
# Start Phase 1
# Read and execute: handoffs/P1_ORCHESTRATOR_PROMPT.md
bun run check --filter @beep/shared-domain

# After each phase:
# 1. Log learnings to REFLECTION_LOG.md
# 2. Create/update next phase handoff based on reflections
# 3. Execute next phase
```

---

## Prerequisites

- Clean git state (recommend commit/stash first)
- Source schema available: `scratchpad/auth.schema.ts`
- Reference patterns:
  - Entity IDs: `packages/shared/domain/src/entity-ids/iam/ids.ts`
  - Domain Models: `packages/iam/domain/src/entities/Account/Account.model.ts`
  - Tables: `packages/iam/tables/src/tables/account.table.ts`

---

## Key Decision

**Foreign Keys**: OAuth tokens reference `oauthClient.clientId` (public identifier), NOT `oauthClient.id` (internal primary key). This matches better-auth's schema design.

---

## Detailed Docs

- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Full phase details
- [REFLECTION_LOG.md](./REFLECTION_LOG.md) - Learnings log
- [README.md](./README.md) - Full spec overview
