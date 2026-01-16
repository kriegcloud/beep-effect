# Phase 3: Database Tables - Orchestrator Prompt

## Context (Stable Prefix)
- **Spec**: oauth-provider-migration
- **Phase**: 3 of 7
- **Package**: `@beep/iam-tables`
- **Location**: `packages/iam/tables/src/tables/`
- **Prerequisites**: Phase 1 (Entity IDs) complete

---

## Pre-flight Checks

Before starting, verify prerequisites are complete:

```bash
# Check Phase 1 (Entity IDs)
grep -q "OAuthClientId" packages/shared/domain/src/entity-ids/iam/ids.ts && echo "✓ Phase 1 complete" || echo "✗ Phase 1 incomplete"

# Check Phase 2 (Domain Models) - optional but recommended
bun run check --filter @beep/iam-domain 2>&1 | tail -5
```

If Phase 1 check fails, complete Phase 1 first. Phase 2 errors won't block table creation but will block verification.

---

## Objective

Create 4 database table definitions using `Table.make` pattern.

---

## Files to Create/Modify

| File | Action |
|------|--------|
| `oauthClient.table.ts` | Implement full table |
| `oauthAccessToken.table.ts` | Implement full table |
| `oauthRefreshToken.table.ts` | Implement full table |
| `oauthConsent.table.ts` | Implement full table |
| `index.ts` | Add exports |

---

## Critical Design Note

**Foreign Keys**: OAuth tokens reference `oauthClient.clientId` (the public identifier), NOT `oauthClient.id` (the internal primary key). This matches the better-auth schema design from `scratchpad/auth.schema.ts`.

---

## Implementation Pattern

Use `packages/iam/tables/src/tables/account.table.ts` as reference.

### Import Reference

All table files need these standard imports. The `datetime` helper is only needed for tables with timestamp columns:

```typescript
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";  // Only if table has datetime columns
import { user, session } from "@beep/shared-tables/schema";  // Only FK'd tables needed
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
```

### oauthClient.table.ts

```typescript
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";

export const oauthClient = Table.make(IamEntityIds.OAuthClientId)(
  {
    clientId: pg.text("client_id").notNull().unique(),
    clientSecret: pg.text("client_secret"),
    disabled: pg.boolean("disabled").default(false),
    skipConsent: pg.boolean("skip_consent"),
    enableEndSession: pg.boolean("enable_end_session"),
    scopes: pg.text("scopes").array(),
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    name: pg.text("name"),
    uri: pg.text("uri"),
    icon: pg.text("icon"),
    contacts: pg.text("contacts").array(),
    tos: pg.text("tos"),
    policy: pg.text("policy"),
    softwareId: pg.text("software_id"),
    softwareVersion: pg.text("software_version"),
    softwareStatement: pg.text("software_statement"),
    redirectUris: pg.text("redirect_uris").array().notNull(),
    postLogoutRedirectUris: pg.text("post_logout_redirect_uris").array(),
    tokenEndpointAuthMethod: pg.text("token_endpoint_auth_method"),
    grantTypes: pg.text("grant_types").array(),
    responseTypes: pg.text("response_types").array(),
    public: pg.boolean("public"),
    type: pg.text("type"),
    referenceId: pg.text("reference_id"),
    metadata: pg.jsonb("metadata"),
  },
  (t) => [
    pg.uniqueIndex("oauth_client_client_id_uidx").on(t.clientId),
    pg.index("oauth_client_user_id_idx").on(t.userId),
  ]
);
```

### oauthAccessToken.table.ts

```typescript
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { user, session } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauthClient.table";
import { oauthRefreshToken } from "./oauthRefreshToken.table";

export const oauthAccessToken = Table.make(IamEntityIds.OAuthAccessTokenId)(
  {
    token: pg.text("token").unique(),
    clientId: pg.text("client_id").notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: pg.text("session_id").$type<SharedEntityIds.SessionId.Type>()
      .references(() => session.id, { onDelete: "set null" }),
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    refreshId: pg.text("refresh_id").$type<IamEntityIds.OAuthRefreshTokenId.Type>()
      .references(() => oauthRefreshToken.id, { onDelete: "cascade" }),
    expiresAt: datetime("expires_at"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_access_token_client_id_idx").on(t.clientId),
    pg.index("oauth_access_token_user_id_idx").on(t.userId),
    pg.index("oauth_access_token_session_id_idx").on(t.sessionId),
  ]
);
```

### oauthRefreshToken.table.ts

```typescript
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { user, session } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauthClient.table";

export const oauthRefreshToken = Table.make(IamEntityIds.OAuthRefreshTokenId)(
  {
    token: pg.text("token").notNull(),
    clientId: pg.text("client_id").notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    sessionId: pg.text("session_id").$type<SharedEntityIds.SessionId.Type>()
      .references(() => session.id, { onDelete: "set null" }),
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>().notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    expiresAt: datetime("expires_at"),
    revoked: datetime("revoked"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_refresh_token_client_id_idx").on(t.clientId),
    pg.index("oauth_refresh_token_user_id_idx").on(t.userId),
    pg.index("oauth_refresh_token_session_id_idx").on(t.sessionId),
  ]
);
```

### oauthConsent.table.ts

```typescript
import type { SharedEntityIds } from "@beep/shared-domain/entity-ids";
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { user } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as pg from "drizzle-orm/pg-core";
import { oauthClient } from "./oauthClient.table";

export const oauthConsent = Table.make(IamEntityIds.OAuthConsentId)(
  {
    clientId: pg.text("client_id").notNull()
      .references(() => oauthClient.clientId, { onDelete: "cascade" }),
    userId: pg.text("user_id").$type<SharedEntityIds.UserId.Type>()
      .references(() => user.id, { onDelete: "cascade" }),
    referenceId: pg.text("reference_id"),
    scopes: pg.text("scopes").array().notNull(),
  },
  (t) => [
    pg.index("oauth_consent_client_id_idx").on(t.clientId),
    pg.index("oauth_consent_user_id_idx").on(t.userId),
    pg.uniqueIndex("oauth_consent_client_user_uidx").on(t.clientId, t.userId),
  ]
);
```

---

## Index Update

Add to `packages/iam/tables/src/tables/index.ts`:

```typescript
export * from "./oauthClient.table";
export * from "./oauthAccessToken.table";
export * from "./oauthRefreshToken.table";
export * from "./oauthConsent.table";
```

---

## Verification

```bash
bun run check --filter @beep/iam-tables
```

### Cross-Phase Verification Note

**IMPORTANT**: The `--filter @beep/iam-tables` check cascades through all dependencies including `@beep/iam-domain`. If verification fails with errors in domain models, those are **Phase 2 issues**, not Phase 3.

To verify ONLY table syntax (without full dependency check):
```bash
# Quick syntax check - useful for debugging
bun tsc --noEmit packages/iam/tables/src/tables/oauth*.ts 2>&1 | head -20
```

---

## Post-Execution Checklist

- [ ] All 4 table files implemented
- [ ] Index exports added
- [ ] Foreign keys reference `clientId` not `id`
- [ ] Verification passes
- [ ] Updated REFLECTION_LOG.md
- [ ] Created HANDOFF_P3.md
- [ ] Review/update P4_ORCHESTRATOR_PROMPT.md

---

## Handoff

Proceed to Phase 4 (Relations).
