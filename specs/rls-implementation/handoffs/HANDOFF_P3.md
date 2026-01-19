# Handoff: Phase 3 - Testing & Integration

> Context document for implementing Phase 3 of RLS Implementation.

**Created**: 2026-01-18
**From Phase**: P2 - RLS Policy Creation (COMPLETE)
**Target Phase**: P3 - Testing & Integration
**Estimated Sessions**: 2-3

---

## Phase 2 Summary

### Completed Tasks

1. **Created RLS Policy Migration**

   Migration file: `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql`

   Applied RLS policies to all 20 org-scoped tables.

2. **Tables with RLS Enabled**

   | Package | Table (DB Name) | Policy Name |
   |---------|-----------------|-------------|
   | `@beep/iam-tables` | `iam_member` | `tenant_isolation_iam_member` |
   | `@beep/shared-tables` | `shared_team` | `tenant_isolation_shared_team` |
   | `@beep/iam-tables` | `iam_team_member` | `tenant_isolation_iam_team_member` |
   | `@beep/iam-tables` | `iam_organization_role` | `tenant_isolation_iam_organization_role` |
   | `@beep/iam-tables` | `iam_subscription` | `tenant_isolation_iam_subscription` |
   | `@beep/iam-tables` | `iam_two_factor` | `tenant_isolation_iam_two_factor` |
   | `@beep/iam-tables` | `iam_apikey` | `tenant_isolation_iam_apikey` |
   | `@beep/iam-tables` | `iam_invitation` | `tenant_isolation_iam_invitation` |
   | `@beep/iam-tables` | `iam_sso_provider` | `tenant_isolation_iam_sso_provider` |
   | `@beep/iam-tables` | `iam_scim_provider` | `tenant_isolation_iam_scim_provider` |
   | `@beep/shared-tables` | `shared_session` | `tenant_isolation_shared_session` |
   | `@beep/shared-tables` | `shared_file` | `tenant_isolation_shared_file` |
   | `@beep/shared-tables` | `shared_folder` | `tenant_isolation_shared_folder` |
   | `@beep/shared-tables` | `shared_upload_session` | `tenant_isolation_shared_upload_session` |
   | `@beep/documents-tables` | `documents_document` | `tenant_isolation_documents_document` |
   | `@beep/documents-tables` | `documents_discussion` | `tenant_isolation_documents_discussion` |
   | `@beep/documents-tables` | `documents_comment` | `tenant_isolation_documents_comment` |
   | `@beep/documents-tables` | `documents_document_file` | `tenant_isolation_documents_document_file` |
   | `@beep/documents-tables` | `documents_document_version` | `tenant_isolation_documents_document_version` |
   | `@beep/knowledge-tables` | `knowledge_embedding` | `tenant_isolation_knowledge_embedding` |

3. **Session Table Special Handling**

   The `shared_session` table uses `active_organization_id` instead of `organization_id`:
   ```sql
   CREATE POLICY tenant_isolation_shared_session ON shared_session
     FOR ALL
     USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
     WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
   ```

4. **Admin Bypass Role Created**

   ```sql
   CREATE ROLE rls_bypass_admin WITH BYPASSRLS NOLOGIN;
   ```

### Verification Results

| Check | Status |
|-------|--------|
| `bun run db:migrate` | ✅ Migration applied |
| Policy count | ✅ 20 policies created |
| `rls_bypass_admin` role | ✅ Created with BYPASSRLS |

---

## Prerequisites Verification

Before starting Phase 3, verify the following:

### 1. Test Container Exists

```bash
ls packages/_internal/db-admin/test/container.ts
```

If not present, you'll need to create it with:
- PgTest container setup (testcontainers or similar)
- Migration application
- SqlClient Layer provision

### 2. TenantContext Layer Available

TenantContext.layer requires `SqlClient.SqlClient` as a dependency. Verify the test Layer composes correctly:

```typescript
import * as Layer from "effect/Layer";
import { TenantContext } from "@beep/shared-server";

const TestLayer = Layer.mergeAll(
  PgTestContainer,           // Must provide SqlClient.SqlClient
  TenantContext.layer,       // Depends on SqlClient.SqlClient
  // ... other layers
);
```

### 3. Session Table Consideration

The `shared_session` table uses `active_organization_id` instead of `organization_id`. This means:
- Test helpers need a variant for session table queries
- Assertions should check `activeOrganizationId` field for session rows
- RLS test for session table should query `active_organization_id` column

---

## Test Data Strategy

For meaningful RLS tests, you need organization-scoped test data. Choose one of these approaches:

### Option 1: Factory Functions (Recommended)

Create test data factories that insert rows with specific org IDs:

```typescript
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server";

const createTestMember = (orgId: string, data: MemberCreateInput) =>
  Effect.gen(function* () {
    const ctx = yield* TenantContext.TenantContext;
    const memberRepo = yield* MemberRepo;

    yield* ctx.setOrganizationId(orgId);
    return yield* memberRepo.insert({ ...data, organizationId: orgId });
  });

// Usage in tests
const member = yield* createTestMember("org-a", { userId: "user-1", role: "member" });
```

### Option 2: Seed Scripts

Run SQL seed before tests to populate test data:

```sql
-- seed/rls-test-data.sql
INSERT INTO iam_member (id, organization_id, user_id, role)
VALUES
  ('mem-1', 'org-a', 'user-1', 'admin'),
  ('mem-2', 'org-a', 'user-2', 'member'),
  ('mem-3', 'org-b', 'user-3', 'admin');
```

### Option 3: Inline Creation

Create test data within each test (isolated but verbose):

```typescript
it.effect("isolates data between orgs", () =>
  Effect.gen(function* () {
    // Setup: Create data for both orgs
    yield* createTestMember("org-a", { ... });
    yield* createTestMember("org-b", { ... });

    // Test: Verify isolation
    const ctx = yield* TenantContext.TenantContext;
    yield* ctx.setOrganizationId("org-a");
    const orgAMembers = yield* memberRepo.findAll();
    // Assert only org-a data visible
  })
);
```

---

## Phase 3 Objectives

### 1. Create RLS Test Helpers

Create test utilities in `tooling/testkit/` for RLS verification:

```typescript
// packages/tooling/testkit/src/rls/helpers.ts
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import { TenantContext } from "@beep/shared-server";

/** Test helper to execute effect with tenant context */
export const withTestTenant = <A, E, R>(
  orgId: string,
  effect: Effect.Effect<A, E, R>
) => Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  return yield* ctx.withOrganization(orgId, effect);
});

/** Assert that query returns empty when no tenant context is set */
export const assertNoRowsWithoutContext = <A, E, R>(
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.gen(function* () {
  const result = yield* queryEffect;
  if (result.length > 0) {
    yield* Effect.die(new Error(`Expected 0 rows without tenant context, got ${result.length}`));
  }
  return result;
});

/**
 * Assert tenant isolation - org A cannot see org B's data.
 * NOTE: For session table queries, use assertTenantIsolationForSession instead.
 */
export const assertTenantIsolation = <A extends { organizationId: string }, E, R>(
  orgAId: string,
  orgBId: string,
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;

  // Query with org A context
  const orgAResults = yield* ctx.withOrganization(orgAId, queryEffect);

  // Verify all results belong to org A
  for (const row of orgAResults) {
    if (row.organizationId !== orgAId) {
      yield* Effect.die(new Error(`Tenant isolation violation: org ${orgAId} saw data from org ${row.organizationId}`));
    }
  }

  // Query with org B context
  const orgBResults = yield* ctx.withOrganization(orgBId, queryEffect);

  // Verify all results belong to org B
  for (const row of orgBResults) {
    if (row.organizationId !== orgBId) {
      yield* Effect.die(new Error(`Tenant isolation violation: org ${orgBId} saw data from org ${row.organizationId}`));
    }
  }

  return { orgAResults, orgBResults };
});

/**
 * Special variant for session table which uses activeOrganizationId.
 * The session table RLS policy filters by active_organization_id column.
 */
export const assertTenantIsolationForSession = <A extends { activeOrganizationId: string }, E, R>(
  orgAId: string,
  orgBId: string,
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;

  const orgAResults = yield* ctx.withOrganization(orgAId, queryEffect);
  for (const row of orgAResults) {
    if (row.activeOrganizationId !== orgAId) {
      yield* Effect.die(new Error(`Session isolation violation: org ${orgAId} saw session from org ${row.activeOrganizationId}`));
    }
  }

  const orgBResults = yield* ctx.withOrganization(orgBId, queryEffect);
  for (const row of orgBResults) {
    if (row.activeOrganizationId !== orgBId) {
      yield* Effect.die(new Error(`Session isolation violation: org ${orgBId} saw session from org ${row.activeOrganizationId}`));
    }
  }

  return { orgAResults, orgBResults };
});
```

### 2. Write Integration Tests

Create integration tests in `packages/_internal/db-admin/test/`:

```typescript
// packages/_internal/db-admin/test/rls/TenantIsolation.test.ts
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { TenantContext } from "@beep/shared-server";
import { MemberRepo } from "@beep/iam-server/repos";

layer(TestDbLayer, { timeout: Duration.seconds(60) })("RLS Tenant Isolation", (it) => {
  it.effect("blocks queries without tenant context", () =>
    Effect.gen(function* () {
      const memberRepo = yield* MemberRepo;
      const result = yield* memberRepo.findAll();
      strictEqual(result.length, 0);
    })
  );

  it.effect("returns only tenant's data with context set", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const memberRepo = yield* MemberRepo;

      // Assuming test data exists for org-test-a
      yield* ctx.setOrganizationId("org-test-a");
      const results = yield* memberRepo.findAll();

      // All results should belong to org-test-a
      for (const member of results) {
        strictEqual(member.organizationId, "org-test-a");
      }
    })
  );

  it.effect("enforces tenant isolation between organizations", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const memberRepo = yield* MemberRepo;

      // Get org A members
      yield* ctx.setOrganizationId("org-a");
      const orgAMembers = yield* memberRepo.findAll();

      // Get org B members
      yield* ctx.setOrganizationId("org-b");
      const orgBMembers = yield* memberRepo.findAll();

      // Verify no overlap
      const orgAIds = new Set(orgAMembers.map(m => m.id));
      const orgBIds = new Set(orgBMembers.map(m => m.id));

      for (const id of orgAIds) {
        strictEqual(orgBIds.has(id), false);
      }
    })
  );
});
```

### 3. Update Existing Repositories

Ensure repositories use `TenantContext` for tenant-scoped operations:

```typescript
// Example: packages/iam/server/src/adapters/repos/Member.repo.ts
import { TenantContext } from "@beep/shared-server";

export class MemberRepo extends Effect.Service<MemberRepo>()("@beep/iam-server/repos/MemberRepo", {
  effect: Effect.gen(function* () {
    const db = yield* IamDb.IamDb;
    const tenantCtx = yield* TenantContext.TenantContext;

    const findAllForCurrentTenant = () =>
      // RLS automatically filters by tenant context
      db.query.member.findMany();

    // ...
  }),
}) {}
```

### 4. Add TenantContext to Request Pipeline

Integrate `TenantContext` into the HTTP request pipeline:

```typescript
// Example: packages/runtime/server/src/middleware/tenant.ts
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server";

export const withTenantFromSession = <A, E, R>(
  effect: Effect.Effect<A, E, R>
) => Effect.gen(function* () {
  const session = yield* SessionService;
  const tenantCtx = yield* TenantContext.TenantContext;

  if (session.activeOrganizationId) {
    return yield* tenantCtx.withOrganization(
      session.activeOrganizationId,
      effect
    );
  }

  return yield* effect;
});
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `tooling/testkit/src/rls/helpers.ts` | RLS test utilities |
| `tooling/testkit/src/rls/index.ts` | Barrel export |
| `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts` | Integration tests |
| `packages/runtime/server/src/middleware/tenant.ts` | Request pipeline integration |

## Files to Modify

| File | Purpose |
|------|---------|
| `tooling/testkit/src/index.ts` | Export RLS helpers |
| Repository files in `packages/*/server/` | Add TenantContext usage |
| `packages/runtime/server/src/index.ts` | Export tenant middleware |

---

## Verification Steps

After Phase 3:
- [ ] RLS test helpers created and exported from `@beep/testkit`
- [ ] Integration tests pass with real database
- [ ] Existing repositories updated to use `TenantContext`
- [ ] Request pipeline integrates tenant context from session
- [ ] `bun run test --filter @beep/db-admin` passes
- [ ] Manual verification of tenant isolation

---

## Testing Requirements

### Unit Test: RLS Blocks Uncontexted Queries

```typescript
effect("RLS blocks queries without tenant context", () =>
  Effect.gen(function* () {
    const memberRepo = yield* MemberRepo;
    const result = yield* memberRepo.findAll();
    strictEqual(result.length, 0);
  })
);
```

### Integration Test: Tenant Isolation

```typescript
layer(TestDbLayer)("Tenant Isolation", (it) => {
  it.effect("prevents cross-tenant data access", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const documentRepo = yield* DocumentRepo;

      // Create document in org A
      yield* ctx.setOrganizationId("org-a");
      yield* documentRepo.insert({ title: "Org A Doc", ... });

      // Try to access from org B - should not see it
      yield* ctx.setOrganizationId("org-b");
      const docs = yield* documentRepo.findAll();
      strictEqual(docs.filter(d => d.title === "Org A Doc").length, 0);
    })
  );
});
```

---

## Handoff to Phase 4 (Future)

Phase 4 would cover:
1. Performance testing and optimization
2. Admin bypass workflows
3. Cross-tenant operations (with explicit grants)
4. Audit logging for tenant context changes

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/rls-implementation/handoffs/HANDOFF_P2.md` | Phase 2 context |
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext service |
| `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` | RLS migration |
| `tooling/testkit/README.md` | Testkit patterns |
