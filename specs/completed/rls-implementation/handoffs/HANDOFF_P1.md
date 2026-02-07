# Handoff: Phase 1 - Infrastructure & TenantContext

> Context document for implementing Phase 1 of RLS Implementation.

**Created**: 2026-01-18
**From Phase**: P0 - Research & Discovery (COMPLETE)
**Target Phase**: P1 - Infrastructure Setup
**Estimated Sessions**: 2-3

---

## Phase 0 Summary

### Key Decisions Made

1. **Provider**: Self-hosted PostgreSQL (no migration needed)
2. **Session Pattern**: `SET LOCAL app.current_org_id = 'uuid'` per transaction
3. **Policy Approach**: Custom SQL migrations (not Drizzle RLS helpers)
4. **Integration Point**: New `TenantContext` Effect service

### Research Findings

- 21 tables require RLS policies
- 16 tables need `organization_id` indexes added
- 4 tables have existing indexes
- Session table requires special handling (activeOrganizationId)

---

## Phase 1 Objectives

### 1. Add Missing Indexes (17 tables)

Update table definitions to add `organization_id` indexes:

| Table | Package | Index to Add |
|-------|---------|--------------|
| `teamMember` | `@beep/iam-tables` | `team_member_organization_id_idx` |
| `organizationRole` | `@beep/iam-tables` | `organization_role_org_id_idx` |
| `subscription` | `@beep/iam-tables` | `subscription_organization_id_idx` |
| `twoFactor` | `@beep/iam-tables` | `two_factor_organization_id_idx` |
| `apiKey` | `@beep/iam-tables` | `api_key_organization_id_idx` |
| `file` | `@beep/shared-tables` | `file_organization_id_idx` |
| `folder` | `@beep/shared-tables` | `folder_organization_id_idx` |
| `uploadSession` | `@beep/shared-tables` | `upload_session_org_id_idx` |
| `document` | `@beep/documents-tables` | `document_organization_id_idx` |
| `discussion` | `@beep/documents-tables` | `discussion_org_id_idx` |
| `comment` | `@beep/documents-tables` | `comment_organization_id_idx` |
| `documentFile` | `@beep/documents-tables` | `document_file_org_id_idx` |
| `documentVersion` | `@beep/documents-tables` | `document_version_org_id_idx` |
| `embedding` | `@beep/knowledge-tables` | `embedding_organization_id_idx` |
| `ssoProvider` | `@beep/iam-tables` | `sso_provider_org_id_idx` |
| `scimProvider` | `@beep/iam-tables` | `scim_provider_org_id_idx` |

**Note**: `session` table already has `session_active_org_idx` index on `activeOrganizationId`.

### 2. Create TenantContext Service

Create Effect service in `packages/shared/server/src/TenantContext/`:

```typescript
// TenantContext.ts
import * as SqlClient from "@effect/sql/SqlClient";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

/** Shape interface for TenantContext service */
export interface TenantContextShape {
  /** Set the organization context for subsequent queries in this transaction */
  readonly setOrganizationId: (orgId: string) => Effect.Effect<void>;
  /** Clear the organization context */
  readonly clearContext: () => Effect.Effect<void>;
  /** Execute an effect within a specific organization context */
  readonly withOrganization: <A, E, R>(
    orgId: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;
}

/** TenantContext service tag for dependency injection */
export class TenantContext extends Context.Tag("@beep/shared-server/TenantContext")<
  TenantContext,
  TenantContextShape
>() {
  /** Layer that provides TenantContext, requires SqlClient */
  static readonly layer: Layer.Layer<TenantContext, never, SqlClient.SqlClient> =
    Layer.effect(
      TenantContext,
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;

        return {
          setOrganizationId: (orgId: string) =>
            sql`SET LOCAL app.current_org_id = ${orgId}`.pipe(Effect.asVoid),

          clearContext: () =>
            sql`RESET app.current_org_id`.pipe(Effect.asVoid),

          withOrganization: <A, E, R>(orgId: string, effect: Effect.Effect<A, E, R>) =>
            Effect.gen(function* () {
              yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
              return yield* effect;
            }),
        };
      })
    );
}
```

### 3. Integrate with PgClient Transaction

Enhance `DbClient.make` to support tenant-scoped transactions:

```typescript
// In PgClient.ts, add transactionWithTenant method
const transactionWithTenant = (orgId: string) =>
  <T, E, R>(txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>) =>
    transaction((tx) =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`SET LOCAL app.current_org_id = ${orgId}`;
        return yield* txExecute(tx);
      })
    );
```

### 4. Update Layer Composition

Add TenantContext to DbClient layer stack:

```typescript
// packages/shared/server/src/factories/db-client/pg/PgClient.ts
export const layerWithTenant: Layer.Layer<
  PgClientServices | TenantContext,
  never,
  never
> = layer.pipe(
  Layer.provideMerge(TenantContext.layer)
);
```

---

## Files to Modify

### Table Files (Add Indexes)

| File | Change |
|------|--------|
| `packages/iam/tables/src/tables/teamMember.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/organizationRole.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/subscription.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/twoFactor.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/apiKey.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/ssoProvider.table.ts` | Add orgId index |
| `packages/iam/tables/src/tables/scimProvider.table.ts` | Add orgId index |
| `packages/shared/tables/src/tables/file.table.ts` | Add orgId index |
| `packages/shared/tables/src/tables/folder.table.ts` | Add orgId index |
| `packages/shared/tables/src/tables/upload-session.table.ts` | Add orgId index |
| `packages/documents/tables/src/tables/document.table.ts` | Add orgId index |
| `packages/documents/tables/src/tables/discussion.table.ts` | Add orgId index |
| `packages/documents/tables/src/tables/comment.table.ts` | Add orgId index |
| `packages/documents/tables/src/tables/documentFile.table.ts` | Add orgId index |
| `packages/documents/tables/src/tables/documentVersion.table.ts` | Add orgId index |
| `packages/knowledge/tables/src/tables/embedding.table.ts` | Add orgId index |

### New Files to Create

| File | Purpose |
|------|---------|
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext service |
| `packages/shared/server/src/TenantContext/index.ts` | Barrel export |

### Files to Update

| File | Change |
|------|--------|
| `packages/shared/server/src/factories/db-client/pg/PgClient.ts` | Add transactionWithTenant |
| `packages/shared/server/src/index.ts` | Export TenantContext |

---

## Verification Steps

After Phase 1:
- [ ] All 17 missing indexes added to table definitions
- [ ] TenantContext service created and exported
- [ ] transactionWithTenant method added to PgClient
- [ ] `bun run check` passes
- [ ] `bun run db:generate` creates index migrations
- [ ] Unit tests for TenantContext

---

## Testing Requirements

### TenantContext Unit Tests

```typescript
// test/TenantContext.test.ts
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("sets organization context", () =>
  Effect.gen(function* () {
    const tenant = yield* TenantContext;
    yield* tenant.setOrganizationId("org-123");

    const sql = yield* SqlClient.SqlClient;
    const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;

    strictEqual(result[0].org_id, "org-123");
  })
);
```

---

## Handoff to Phase 2

After Phase 1, Phase 2 will:
1. Create RLS policy migrations
2. Enable RLS on all 21 tables
3. Test tenant isolation
4. Update Better Auth hooks

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/rls-implementation/outputs/codebase-context.md` | Complete table inventory |
| `specs/rls-implementation/outputs/drizzle-research.md` | Drizzle patterns |
| `specs/rls-implementation/outputs/provider-comparison.md` | Provider decision |
| `specs/rls-implementation/templates/rls-policy.template.sql` | Policy template |
