# Phase 3 Orchestrator Prompt

> Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (Testing & Integration) of the RLS Implementation spec for beep-effect.

### Context

Phase 2 is complete. RLS policies applied:
- **20 tables** with `tenant_isolation_*` policies
- **TenantContext Service**: `packages/shared/server/src/TenantContext/TenantContext.ts`
- **Session Pattern**: `SET LOCAL app.current_org_id = 'uuid'`
- **Admin Role**: `rls_bypass_admin` with BYPASSRLS
- **Session Table**: Uses `active_organization_id` (not `organization_id`)

### Your Mission

Create test helpers and integration tests to verify RLS enforcement.

---

#### Task 0: Verify Test Infrastructure (FIRST)

Before writing tests, verify the test infrastructure exists:

```bash
# Check if test container exists
ls packages/_internal/db-admin/test/container.ts

# If it doesn't exist, you'll need to create it
```

If `container.ts` exists, verify it includes:
- PgTest container setup (testcontainers or similar)
- Migration application
- SqlClient Layer

If creating new, ensure the test Layer composes:
```typescript
import * as Layer from "effect/Layer";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";

// TenantContext requires SqlClient.SqlClient
const TestLayer = Layer.mergeAll(
  PgTestContainer,           // Provides SqlClient.SqlClient
  TenantContext.layer,       // Depends on SqlClient.SqlClient
  // ... other layers
);
```

---

#### Task 1: Create RLS Test Helpers

Create `tooling/testkit/src/rls/helpers.ts`:

```typescript
import * as Effect from "effect/Effect";
import { TenantContext } from "@beep/shared-server";

/** Execute effect with tenant context */
export const withTestTenant = <A, E, R>(
  orgId: string,
  effect: Effect.Effect<A, E, R>
) => Effect.gen(function* () {
  const ctx = yield* TenantContext.TenantContext;
  return yield* ctx.withOrganization(orgId, effect);
});

/** Assert query returns empty without context */
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
 *
 * NOTE: For session table queries, the returned field is `activeOrganizationId`
 * not `organizationId`. Use assertTenantIsolationForSession for session table.
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

Create barrel export `tooling/testkit/src/rls/index.ts`:

```typescript
export * from "./helpers";
```

Update `tooling/testkit/src/index.ts` to export RLS helpers.

---

#### Task 2: Write Integration Tests

Create `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts`:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";

// Use existing PgTest container from test/container.ts
import { PgTestLayer } from "../container";

layer(PgTestLayer, { timeout: Duration.seconds(60) })("RLS Tenant Isolation", (it) => {
  /**
   * Test: Without tenant context, RLS should block all rows.
   *
   * We use direct SQL here (bypassing repo abstraction) to test RLS
   * at the database level, ensuring the policy works regardless of
   * application code.
   */
  it.effect("blocks queries without tenant context", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
      strictEqual(result.length, 0);
    })
  );

  it.effect("returns data with context set", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const sql = yield* SqlClient.SqlClient;

      // Set context and query
      yield* ctx.setOrganizationId("test-org-id");
      const result = yield* sql`SELECT * FROM iam_member WHERE organization_id = 'test-org-id'`;
      // Assertions depend on seeded test data
      // If no test data exists, this will return 0 rows (which is correct behavior)
    })
  );

  /**
   * Test session table special handling.
   * Session table uses active_organization_id column instead of organization_id.
   */
  it.effect("filters session table by active_organization_id", () =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext.TenantContext;
      const sql = yield* SqlClient.SqlClient;

      // Without context - should return 0 rows
      const noContextResult = yield* sql`SELECT * FROM shared_session LIMIT 10`;
      strictEqual(noContextResult.length, 0);

      // With context - should only return sessions for that org
      yield* ctx.setOrganizationId("test-org-id");
      const withContextResult = yield* sql`SELECT * FROM shared_session WHERE active_organization_id = 'test-org-id'`;
      // Assertions depend on seeded test data
    })
  );
});
```

---

#### Task 3: Verify Existing Test Infrastructure

Check `packages/_internal/db-admin/test/container.ts` for:
- PgTest container setup
- Migration application
- TenantContext Layer composition

Ensure the test Layer includes:
```typescript
import * as Layer from "effect/Layer";
import { TenantContext } from "@beep/shared-server";

const TestLayer = Layer.mergeAll(
  PgTestContainer,
  TenantContext.layer,
  // ... other layers
);
```

---

#### Task 4: Run Tests and Verify

```bash
bun run test --filter @beep/db-admin
```

---

### Session Table Special Handling

**IMPORTANT**: The `shared_session` table uses `active_organization_id` instead of `organization_id`.

This affects:
1. **Test assertions**: Check `activeOrganizationId` field, not `organizationId`
2. **Test helpers**: Use `assertTenantIsolationForSession` for session queries
3. **Direct SQL**: Query `active_organization_id` column in session table tests

The RLS policy for session table:
```sql
CREATE POLICY tenant_isolation_shared_session ON shared_session
  FOR ALL
  USING (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text)
  WITH CHECK (active_organization_id = NULLIF(current_setting('app.current_org_id', TRUE), '')::text);
```

---

### Critical Patterns

1. **Test without context** → should return 0 rows
2. **Test with context** → should return only matching tenant rows
3. **Test isolation** → org A cannot see org B's data
4. **Test INSERT** → should require valid context
5. **Test session table** → uses `active_organization_id` column

---

### Test Data Strategy

For meaningful RLS tests, you need organization-scoped test data. Options:

1. **Factory Functions** (Recommended): Create test data factories that insert rows with specific org IDs
   ```typescript
   const createTestMember = (orgId: string) =>
     Effect.gen(function* () {
       const ctx = yield* TenantContext.TenantContext;
       yield* ctx.setOrganizationId(orgId);
       // Insert member...
     });
   ```

2. **Seed Scripts**: Run SQL seed before tests

3. **Inline Creation**: Create test data within each test (isolated but verbose)

---

### Verification Checklist

Before completing Phase 3:
- [ ] Task 0: Test infrastructure verified/created
- [ ] RLS test helpers in `tooling/testkit/src/rls/`
- [ ] Session table helper (`assertTenantIsolationForSession`) included
- [ ] Helpers exported from `@beep/testkit`
- [ ] Integration tests in `packages/_internal/db-admin/test/rls/`
- [ ] Session table tests included
- [ ] `bun run test --filter @beep/db-admin` passes
- [ ] Manual verification:
  ```sql
  -- Without context: returns 0 rows
  SELECT * FROM iam_member LIMIT 10;

  -- With context: returns filtered rows
  SET LOCAL app.current_org_id = 'your-org-id';
  SELECT * FROM iam_member LIMIT 10;

  -- Session table: uses active_organization_id
  SELECT * FROM shared_session LIMIT 10;
  SET LOCAL app.current_org_id = 'your-org-id';
  SELECT * FROM shared_session LIMIT 10;
  ```
- [ ] Update REFLECTION_LOG.md

---

### Handoff Document

Full context in: `specs/rls-implementation/handoffs/HANDOFF_P3.md`

---

### Notes

- Use `@beep/testkit` patterns for Effect tests (NEVER use raw `bun:test` with `Effect.runPromise`)
- Reference `tooling/testkit/README.md` for test utilities
- The PgTest container in `db-admin` should apply migrations automatically
- TenantContext requires SqlClient in its Layer dependencies
- Session table is special: uses `active_organization_id` not `organization_id`
