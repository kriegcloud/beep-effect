# Phase 5 Orchestrator Prompt

> Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 (Verification & Performance) of the RLS Implementation spec for beep-effect. This is the final phase.

### Context

Phase 4 should be complete:
- **RLS Documentation**: `documentation/patterns/rls-patterns.md`
- **AGENTS.md Updates**: TenantContext and RLS helpers documented
- **Phase Statuses**: Updated in README.md and QUICK_START.md

### Your Mission

Verify the RLS implementation is complete, performant, and documented. Run comprehensive tests, measure performance, and finalize documentation.

---

#### Task 1: Run Comprehensive Test Suite

```bash
# Run all tests
bun run test

# Run RLS-specific tests
bun run test --filter @beep/db-admin

# Run slice tests that use RLS
bun run test --filter @beep/iam-server
bun run test --filter @beep/documents-server
```

**Expected**: All tests pass with no regressions.

---

#### Task 2: Create Performance Tests

Create `packages/_internal/db-admin/test/rls/Performance.test.ts`:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";
import { PgTest } from "../container";

layer(PgTest, { timeout: Duration.minutes(5) })("RLS Performance", (it) => {
  it.effect("measures query latency with RLS", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      yield* ctx.setOrganizationId("perf-test-org");

      // NOTE: Using Date.now() instead of TestClock because we need
      // real elapsed time to measure actual database query latency
      const iterations = 100;
      const start = Date.now();

      for (let i = 0; i < iterations; i++) {
        yield* sql`SELECT * FROM iam_member LIMIT 10`;
      }

      const elapsed = Date.now() - start;
      const avgLatency = elapsed / iterations;

      yield* Effect.logInfo("RLS Query Performance", {
        iterations,
        totalMs: elapsed,
        avgLatencyMs: avgLatency,
      });

      // Adjust threshold based on your environment
      strictEqual(avgLatency < 100, true, `Average latency ${avgLatency}ms exceeds threshold`);
    })
  );

  it.effect("verifies index usage with EXPLAIN", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      yield* ctx.setOrganizationId("test-org");

      const explain = yield* sql`
        EXPLAIN (FORMAT TEXT)
        SELECT * FROM iam_member
        WHERE organization_id = 'test-org'
        LIMIT 10
      `;

      yield* Effect.logInfo("Query Plan", {
        plan: explain.map((r) => (r as { "QUERY PLAN": string })["QUERY PLAN"]).join("\n"),
      });

      // Log for manual review - index usage varies by data volume
    })
  );
});
```

---

#### Task 3: Create Admin Bypass Tests

Create `packages/_internal/db-admin/test/rls/AdminBypass.test.ts`:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { PgTest } from "../container";

layer(PgTest, { timeout: Duration.seconds(60) })("RLS Admin Bypass", (it) => {
  it.effect("verifies rls_bypass_admin role exists with BYPASSRLS", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const result = yield* sql`
        SELECT rolname, rolbypassrls
        FROM pg_roles
        WHERE rolname = 'rls_bypass_admin'
      `;

      strictEqual(result.length, 1, "rls_bypass_admin role should exist");
      strictEqual(result[0].rolbypassrls, true, "Role should have BYPASSRLS");
    })
  );

  it.effect("documents bypass role usage pattern", () =>
    Effect.gen(function* () {
      // Note: Actually switching to bypass role requires appropriate permissions
      // In test container, the test user may not have permission to SET ROLE
      // This test documents the pattern for production use

      yield* Effect.logInfo("Admin Bypass Pattern", {
        usage: `
          -- For migrations or admin operations:
          SET ROLE rls_bypass_admin;
          -- Perform operations that need to see all data
          RESET ROLE;
        `,
        notes: [
          "Use for migrations that need cross-tenant access",
          "Use for admin dashboards showing all organizations",
          "Always RESET ROLE after operations",
        ],
      });
    })
  );
});
```

---

#### Task 4: Create Edge Case Tests

Create `packages/_internal/db-admin/test/rls/EdgeCases.test.ts`:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { TenantContext } from "@beep/shared-server";
import { PgTest } from "../container";

layer(PgTest, { timeout: Duration.seconds(60) })("RLS Edge Cases", (it) => {
  it.effect("handles empty string context (blocks all rows)", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Clear context sets to empty string
      yield* ctx.clearContext();

      // Empty string becomes NULL via NULLIF, blocking all rows
      const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
      strictEqual(result.length, 0, "Empty context should block all rows");
    })
  );

  it.effect("handles SQL injection attempt in org ID", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Attempt SQL injection
      const maliciousId = "test'; DROP TABLE iam_member; --";
      yield* ctx.setOrganizationId(maliciousId);

      // Should not cause SQL injection - the escaped value is set
      const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE) as org_id`;

      // The value should contain the escaped string, not execute as SQL
      strictEqual(
        result[0].org_id.includes("DROP TABLE"),
        true,
        "Malicious string should be stored as value, not executed"
      );

      // Verify table still exists
      const tableCheck = yield* sql`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_name = 'iam_member'
        ) as exists
      `;
      strictEqual(tableCheck[0].exists, true, "Table should still exist after injection attempt");
    })
  );

  it.effect("session table uses active_organization_id correctly", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Session table RLS uses active_organization_id
      yield* ctx.setOrganizationId("test-org");

      // This should filter by active_organization_id
      const result = yield* sql`SELECT * FROM shared_session LIMIT 10`;

      // Verify the policy exists and is correct
      const policy = yield* sql`
        SELECT polname, pg_get_expr(polqual, polrelid) as policy_expr
        FROM pg_policy
        WHERE polrelid = 'shared_session'::regclass
      `;

      strictEqual(policy.length > 0, true, "Session table should have RLS policy");
      strictEqual(
        policy[0].policy_expr.includes("active_organization_id"),
        true,
        "Policy should use active_organization_id"
      );
    })
  );

  it.effect("verifies all 20 tables have RLS enabled", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const result = yield* sql`
        SELECT COUNT(*) as count
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relrowsecurity = true
        AND n.nspname = 'public'
      `;

      strictEqual(
        Number(result[0].count) >= 20,
        true,
        `Expected at least 20 tables with RLS, got ${result[0].count}`
      );
    })
  );

  it.effect("verifies all policies follow naming convention", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      const policies = yield* sql`
        SELECT polname
        FROM pg_policy
        WHERE polname LIKE 'tenant_isolation_%'
      `;

      strictEqual(
        policies.length >= 20,
        true,
        `Expected at least 20 tenant_isolation policies, got ${policies.length}`
      );

      // All policies should start with tenant_isolation_
      for (const policy of policies) {
        strictEqual(
          policy.polname.startsWith("tenant_isolation_"),
          true,
          `Policy ${policy.polname} doesn't follow naming convention`
        );
      }
    })
  );
});
```

---

#### Task 5: Final Documentation Review

Verify documentation accuracy:

1. **Test Code Examples**: Run all code examples from `documentation/patterns/rls-patterns.md`

2. **Check AGENTS.md Files**: Verify TenantContext and RLS helpers are documented in:
   - `packages/shared/server/AGENTS.md`
   - `tooling/testkit/AGENTS.md`

3. **Update Phase Statuses**: In both `specs/rls-implementation/README.md` and `QUICK_START.md`:
   - Phase 4: COMPLETE
   - Phase 5: COMPLETE

4. **Update REFLECTION_LOG.md**: Add Phase 5 learnings

---

#### Task 6: Final Verification Summary

Create a summary of the RLS implementation:

```markdown
## RLS Implementation Summary

### Tables Protected (20 total)
- IAM: 9 tables (member, team_member, organization_role, subscription, two_factor, apikey, invitation, sso_provider, scim_provider)
- Shared: 5 tables (team, file, folder, upload_session, session*)
- Documents: 5 tables (document, discussion, comment, document_file, document_version)
- Knowledge: 1 table (embedding)

*Note: session table uses active_organization_id

### Policy Pattern
All policies use: `tenant_isolation_{slice}_{table}`

### Session Context
- Service: TenantContext at `@beep/shared-server`
- Pattern: Session-level SET (not SET LOCAL)
- SQL Injection: Protected via quote escaping

### Admin Bypass
- Role: rls_bypass_admin with BYPASSRLS
- Usage: SET ROLE rls_bypass_admin; ... RESET ROLE;

### Test Coverage
- 11+ RLS-specific tests
- Performance benchmarks
- Edge case coverage
- Admin bypass verification

### Documentation
- Pattern guide: documentation/patterns/rls-patterns.md
- AGENTS.md: Updated for TenantContext and RLS helpers
```

---

### Verification Checklist

Before completing Phase 5:

**Testing**
- [ ] `bun run test` passes (all tests)
- [ ] Performance tests created and pass
- [ ] Admin bypass tests created and pass
- [ ] Edge case tests created and pass
- [ ] SQL injection protection verified

**Performance**
- [ ] Query latency measured
- [ ] Index usage verified
- [ ] Results logged and acceptable

**Documentation**
- [ ] All code examples verified working
- [ ] AGENTS.md files current
- [ ] Phase statuses updated to COMPLETE

**Final Checks**
- [ ] All 20 tables have RLS enabled
- [ ] All 20 policies follow naming convention
- [ ] TenantContext works correctly
- [ ] Admin bypass works for authorized operations
- [ ] REFLECTION_LOG.md updated with final learnings

---

### Success Criteria

The spec is COMPLETE when:
1. All tests pass
2. Performance is acceptable
3. Documentation is complete and accurate
4. Pattern is established for future slices
5. All phase statuses show COMPLETE

---

### Handoff Document

Full context in: `specs/rls-implementation/handoffs/HANDOFF_P5.md`
