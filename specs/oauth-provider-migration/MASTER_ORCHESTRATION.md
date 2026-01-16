# Master Orchestration: OAuth Provider Migration

> Detailed phase-by-phase implementation workflow for OAuth Provider entities.

---

## Phase Dependencies

```
Phase 1 (Entity IDs) ─────────────────────┐
                                          │
Phase 2 (Domain Models) ← depends on P1 ──┤
                                          │
Phase 3 (Tables) ← depends on P1 ─────────┤
                                          │
Phase 4 (Relations) ← depends on P3 ──────┤
                                          │
Phase 5 (Type Checks) ← depends on P2+P3 ─┤
                                          │
Phase 6 (Admin DB) ← depends on P3+P4 ────┤
                                          │
Phase 7 (Migration) ← depends on all ─────┘
```

---

## Reflection-Driven Iteration Workflow

**CRITICAL**: After completing each phase, the handoff prompt for the NEXT phase must be created or updated based on reflections and improvements identified from the completed phase.

### Iteration Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHASE EXECUTION LOOP                          │
├─────────────────────────────────────────────────────────────────┤
│  1. Execute phase using P[N]_ORCHESTRATOR_PROMPT.md              │
│  2. Run verification command for the phase                       │
│  3. Record learnings in REFLECTION_LOG.md:                       │
│     - What worked well?                                          │
│     - What needed adjustment?                                    │
│     - What patterns emerged?                                     │
│     - What should be added to next phase prompt?                 │
│  4. Create/Update HANDOFF_P[N].md with completion context        │
│  5. Create/Update P[N+1]_ORCHESTRATOR_PROMPT.md incorporating:   │
│     - Refined instructions based on learnings                    │
│     - Additional checks discovered during execution              │
│     - Pattern clarifications that arose                          │
│     - Warnings about pitfalls encountered                        │
│  6. Proceed to next phase with improved prompt                   │
└─────────────────────────────────────────────────────────────────┘
```

### Handoff Document Structure

Each `HANDOFF_P[N].md` should contain:

```markdown
# HANDOFF_P[N].md - Phase N Completion

## Summary
- What was accomplished in Phase N
- Files created/modified
- Verification results

## Learnings Applied
- Issues encountered and solutions
- Pattern refinements discovered
- Prompt improvements made

## Context for Next Phase
- Prerequisites confirmed
- Dependencies ready
- Specific guidance for P[N+1]
- Link to P[N+1]_ORCHESTRATOR_PROMPT.md
```

### Example Reflection Entry

```markdown
### Phase 1: Entity IDs

**Status**: Completed

**What Worked**:
- Pattern copy from AccountId was straightforward
- Verification caught missing table-name.ts update

**What Needed Adjustment**:
- Forgot to update any-id.ts union initially
- Namespace declaration had incorrect RowId type

**Prompt Improvement for P2**:
Original: "Create domain models"
Refined: "Create domain models AND index.ts barrel exports. Remember that makeFields automatically adds audit columns - do not duplicate them."
```

---

## Phase 1: IAM Entity IDs

### Location
`packages/shared/domain/src/entity-ids/iam/`

### Files to Modify
- `ids.ts` - Add 4 new entity ID schemas
- `table-name.ts` - Add table names to TableName union
- `any-id.ts` - Add IDs to AnyId union

### Entity IDs to Create

| ID Schema | Table Prefix | Brand |
|-----------|--------------|-------|
| `OAuthClientId` | `oauth_client` | `"OAuthClientId"` |
| `OAuthAccessTokenId` | `oauth_access_token` | `"OAuthAccessTokenId"` |
| `OAuthRefreshTokenId` | `oauth_refresh_token` | `"OAuthRefreshTokenId"` |
| `OAuthConsentId` | `oauth_consent` | `"OAuthConsentId"` |

### Pattern Reference

```typescript
export const OAuthClientId = make("oauth_client", {
  brand: "OAuthClientId",
}).annotations(
  $I.annotations("OAuthClientId", {
    description: "A unique identifier for an OAuth client",
  })
);

export declare namespace OAuthClientId {
  export type Type = S.Schema.Type<typeof OAuthClientId>;
  export type Encoded = S.Schema.Encoded<typeof OAuthClientId>;

  export namespace RowId {
    export type Type = typeof OAuthClientId.privateSchema.Type;
    export type Encoded = typeof OAuthClientId.privateSchema.Encoded;
  }
}
```

### Verification
```bash
bun run check --filter @beep/shared-domain
```

---

## Phase 2: Domain Model Entities

### Location
`packages/iam/domain/src/entities/`

### Overview
Create 4 domain model entities using `M.Class` and `makeFields` pattern.

| Entity | Files to Create |
|--------|-----------------|
| OAuthClient | `OAuthClient/OAuthClient.model.ts`, `OAuthClient/index.ts` |
| OAuthAccessToken | `OAuthAccessToken/OAuthAccessToken.model.ts`, `OAuthAccessToken/index.ts` |
| OAuthRefreshToken | `OAuthRefreshToken/OAuthRefreshToken.model.ts`, `OAuthRefreshToken/index.ts` |
| OAuthConsent | `OAuthConsent/OAuthConsent.model.ts`, `OAuthConsent/index.ts` |

### Detailed Specifications
**See [P2_ORCHESTRATOR_PROMPT.md](./handoffs/P2_ORCHESTRATOR_PROMPT.md)** for complete field definitions and implementation code.

### Quick Pattern Reference
```typescript
export class Model extends M.Class<Model>($I`OAuthClientModel`)(
  makeFields(IamEntityIds.OAuthClientId, { /* fields */ }),
  $I.annotations("OAuthClientModel", { /* metadata */ })
) {
  static readonly utils = modelKit(Model);
}
```

### Verification
```bash
bun run check --filter @beep/iam-domain
```

---

## Phase 3: Database Tables

### Location
`packages/iam/tables/src/tables/`

### Files (exist but empty)
- `oauthClient.table.ts`
- `oauthAccessToken.table.ts`
- `oauthRefreshToken.table.ts`
- `oauthConsent.table.ts`

### Critical Note
OAuth tokens reference `oauthClient.clientId` (not `oauthClient.id`). This matches the better-auth schema design.

### Table Pattern (using Table.make)

```typescript
import { IamEntityIds } from "@beep/shared-domain/entity-ids";
import { datetime } from "@beep/shared-tables/columns";
import { user, session } from "@beep/shared-tables/schema";
import { Table } from "@beep/shared-tables/table";
import * as d from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

export const oauthClient = Table.make(IamEntityIds.OAuthClientId)(
  {
    clientId: pg.text("client_id").notNull().unique(),
    clientSecret: pg.text("client_secret"),
    disabled: pg.boolean("disabled").default(false),
    // ... remaining fields
  },
  (t) => [
    pg.index("oauth_client_client_id_idx").on(t.clientId),
    pg.index("oauth_client_user_id_idx").on(t.userId),
  ]
);
```

### Index Update
Add exports to `tables/index.ts`:
```typescript
export * from "./oauthClient.table";
export * from "./oauthAccessToken.table";
export * from "./oauthRefreshToken.table";
export * from "./oauthConsent.table";
```

### Verification
```bash
bun run check --filter @beep/iam-tables
```

---

## Phase 4: Drizzle Relations

### Location
`packages/iam/tables/src/relations.ts`

### Relations to Add

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

### Update Existing Relations
Add to `userRelations`:
```typescript
oauthClients: many(oauthClient),
oauthRefreshTokens: many(oauthRefreshToken),
oauthAccessTokens: many(oauthAccessToken),
oauthConsents: many(oauthConsent),
```

Add to `sessionRelations`:
```typescript
oauthRefreshTokens: many(oauthRefreshToken),
oauthAccessTokens: many(oauthAccessToken),
```

---

## Phase 5: Type Alignment Checks

### Location
`packages/iam/tables/src/_check.ts`

### Checks to Add

```typescript
import type {
  OAuthClient,
  OAuthAccessToken,
  OAuthRefreshToken,
  OAuthConsent,
} from "@beep/iam-domain/entities";

export const _oauthClientSelect: typeof OAuthClient.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthClient
>;
export const _checkInsertOAuthClient: typeof OAuthClient.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthClient
>;

export const _oauthAccessTokenSelect: typeof OAuthAccessToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthAccessToken
>;
export const _checkInsertOAuthAccessToken: typeof OAuthAccessToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthAccessToken
>;

export const _oauthRefreshTokenSelect: typeof OAuthRefreshToken.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthRefreshToken
>;
export const _checkInsertOAuthRefreshToken: typeof OAuthRefreshToken.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthRefreshToken
>;

export const _oauthConsentSelect: typeof OAuthConsent.Model.select.Encoded = {} as InferSelectModel<
  typeof tables.oauthConsent
>;
export const _checkInsertOAuthConsent: typeof OAuthConsent.Model.insert.Encoded = {} as InferInsertModel<
  typeof tables.oauthConsent
>;
```

### Verification
```bash
bun run check --filter @beep/iam-tables
```

---

## Phase 6: Admin Database Updates

### Location
`packages/_internal/db-admin/`

### Files to Update

**1. `src/slice-relations.ts`**
```typescript
export {
  // ... existing exports
  oauthClientRelations,
  oauthAccessTokenRelations,
  oauthRefreshTokenRelations,
  oauthConsentRelations,
} from "@beep/iam-tables/relations";
```

**2. `src/relations.ts`**

Update `userRelations`:
```typescript
oauthClients: many(Tables.oauthClient),
oauthRefreshTokens: many(Tables.oauthRefreshToken),
oauthAccessTokens: many(Tables.oauthAccessToken),
oauthConsents: many(Tables.oauthConsent),
```

Remove old `oauthApplication` references if they exist.

### Verification
```bash
bun run check --filter @beep/db-admin
```

---

## Phase 7: Database Migration

### Commands

```bash
# Generate migrations
bun run db:generate

# Apply migrations
bun run db:migrate

# Full verification
bun run check
bun run build
bun run lint
```

### Expected Artifacts
- New migration files in `drizzle/` directory
- Tables created: `oauth_client`, `oauth_access_token`, `oauth_refresh_token`, `oauth_consent`

---

## Reference Files

| File | Purpose |
|------|---------|
| `scratchpad/auth.schema.ts` | Source schema from better-auth |
| `packages/iam/domain/src/entities/Account/Account.model.ts` | Model pattern |
| `packages/iam/tables/src/tables/account.table.ts` | Table pattern |
| `packages/shared/domain/src/entity-ids/iam/ids.ts` | Entity ID pattern |
| `packages/iam/tables/src/_check.ts` | Type check pattern |
| `packages/iam/tables/src/relations.ts` | Relations pattern |
