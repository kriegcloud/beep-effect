# Handoff: Phase 2 - RLS Policy Creation

> Context document for implementing Phase 2 of RLS Implementation.

**Created**: 2026-01-18
**From Phase**: P1 - Infrastructure & TenantContext (COMPLETE)
**Target Phase**: P2 - RLS Policy Creation
**Estimated Sessions**: 2-3

---

## Phase 1 Summary

### Completed Tasks

1. **Added Organization ID Indexes (16 tables)**

   | Package | Tables Updated |
   |---------|----------------|
   | `@beep/iam-tables` | teamMember, organizationRole, subscription, twoFactor, apiKey, ssoProvider, scimProvider |
   | `@beep/shared-tables` | file, folder, uploadSession |
   | `@beep/documents-tables` | document, discussion, comment, documentFile, documentVersion |
   | `@beep/knowledge-tables` | embedding |

2. **Created TenantContext Service**

   Location: `packages/shared/server/src/TenantContext/TenantContext.ts`

   ```typescript
   export interface TenantContextShape {
     readonly setOrganizationId: (orgId: string) => Effect.Effect<void, SqlError>;
     readonly clearContext: () => Effect.Effect<void, SqlError>;
     readonly withOrganization: <A, E, R>(
       orgId: string,
       effect: Effect.Effect<A, E, R>
     ) => Effect.Effect<A, SqlError | E, R>;
   }

   export class TenantContext extends Context.Tag($I`TenantContext`)<TenantContext, TenantContextShape>() {
     static readonly layer: Layer.Layer<TenantContext, never, SqlClient.SqlClient>;
   }
   ```

   Exported from: `packages/shared/server/src/index.ts`

3. **Added transactionWithTenant to PgClient**

   Location: `packages/shared/server/src/factories/db-client/pg/PgClient.ts`

   ```typescript
   const transactionWithTenant: TransactionWithTenant = Effect.fn("Database.transactionWithTenant")(
     <T, E, R>(orgId: string, txExecute: (tx: TransactionContextShape) => Effect.Effect<T, E, R>) =>
       // Sets SET LOCAL app.current_org_id before executing transaction
   );
   ```

4. **Generated and Applied Migrations**

   - `bun run db:generate` - Created migration file
   - `bun run db:migrate` - Applied indexes to database

### Verification Results

| Check | Status |
|-------|--------|
| `bun run lint:fix` | ✅ Passed |
| `bun run check --filter @beep/iam-tables` | ✅ Passed |
| `bun run check --filter @beep/shared-tables` | ✅ Passed |
| `bun run check --filter @beep/documents-tables` | ✅ Passed |
| `bun run check --filter @beep/shared-server` | ✅ Passed |
| `bun run db:generate` | ✅ Migration created |
| `bun run db:migrate` | ✅ Indexes applied |

---

## Phase 2 Objectives

### 1. Create RLS Policy Migration

Create a migration file that enables RLS and creates policies for all 21 org-scoped tables:

```sql
-- Enable RLS on table
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

-- Create tenant isolation policy
CREATE POLICY tenant_isolation_{table} ON {table}
  FOR ALL
  USING (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

### 2. Tables Requiring RLS Policies (21 total)

**IAM Tables** (11):
- `member`
- `team`
- `team_member`
- `organization_role`
- `subscription`
- `two_factor`
- `api_key`
- `invitation`
- `sso_provider`
- `scim_provider`
- `session` (special: uses `active_organization_id`)

**Shared Tables** (3):
- `file`
- `folder`
- `upload_session`

**Documents Tables** (5):
- `document`
- `discussion`
- `comment`
- `document_file`
- `document_version`

**Knowledge Tables** (1):
- `embedding`

### 3. Special Handling

#### Session Table
The `session` table uses `activeOrganizationId` instead of `organizationId`:

```sql
CREATE POLICY tenant_isolation_session ON session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

#### Admin Bypass Role
Create an admin role that bypasses RLS for migrations and admin operations:

```sql
CREATE ROLE rls_bypass_admin WITH BYPASSRLS;
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/_internal/db-admin/drizzle/XXXX_enable_rls.sql` | RLS policy migration |

## Files to Reference

| File | Purpose |
|------|---------|
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext service |
| `specs/rls-implementation/outputs/codebase-context.md` | Complete table inventory |
| `specs/rls-implementation/templates/rls-policy.template.sql` | Policy template |

---

## Verification Steps

After Phase 2:
- [ ] RLS enabled on all 21 org-scoped tables
- [ ] `tenant_isolation_{table}` policies created
- [ ] `bun run db:generate` passes
- [ ] `bun run db:migrate` applies policies
- [ ] Manual SQL verification:
  ```sql
  SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
  ```

---

## Testing Requirements

### Basic RLS Verification

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";

effect("RLS blocks queries without tenant context", () =>
  Effect.gen(function* () {
    const memberRepo = yield* MemberRepo;
    // Without setting tenant context, query should return empty
    const result = yield* memberRepo.findAll();
    strictEqual(result.length, 0);
  })
);
```

### Tenant Isolation Test

```typescript
import { layer } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";

layer(TestLayer, { timeout: Duration.seconds(60) })("RLS Integration", (it) => {
  it.effect("enforces tenant isolation", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const memberRepo = yield* MemberRepo;

      // Set org A context
      yield* ctx.setOrganizationId("org-a");
      const orgAMembers = yield* memberRepo.findAll();

      // Set org B context
      yield* ctx.setOrganizationId("org-b");
      const orgBMembers = yield* memberRepo.findAll();

      // Results should be isolated
      // (specific assertions depend on test data setup)
    })
  );
});
```

---

## Handoff to Phase 3

After Phase 2, Phase 3 will:
1. Create test helpers for RLS verification
2. Build shared utilities for tenant context management
3. Add comprehensive integration tests

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/rls-implementation/outputs/codebase-context.md` | Complete table inventory |
| `specs/rls-implementation/outputs/drizzle-research.md` | Drizzle patterns |
| `specs/rls-implementation/handoffs/HANDOFF_P1.md` | Phase 1 context |
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext implementation |
