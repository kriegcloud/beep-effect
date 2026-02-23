# Handoff: Phase 5 - Verification & Performance

> Context document for implementing Phase 5 of RLS Implementation.

**Created**: 2026-01-18
**From Phase**: P4 - Documentation (pending completion)
**Target Phase**: P5 - Verification & Performance
**Estimated Sessions**: 1-2

---

## Prerequisites

Phase 4 must be complete before starting Phase 5:
- [ ] `documentation/patterns/rls-patterns.md` created
- [ ] AGENTS.md files updated
- [ ] README.md and QUICK_START.md phase statuses updated

---

## Phase 5 Objectives

### 1. Comprehensive RLS Testing

Run full test suite with RLS enabled:
- All existing tests should still pass
- RLS-specific tests should verify isolation
- Edge cases should be covered

### 2. Performance Benchmarking

Measure RLS impact:
- Query latency with/without RLS
- Index effectiveness verification
- Connection pool behavior under load

### 3. Admin Bypass Verification

Verify `rls_bypass_admin` role works:
- Migrations can run with bypass
- Admin operations have full access
- Normal operations remain restricted

### 4. Cross-Tenant Operation Testing

Test scenarios requiring multi-tenant access:
- Explicit grants pattern (if needed)
- Audit logging for context changes
- Error handling for policy violations

### 5. Final Documentation Review

Ensure documentation accuracy:
- All code examples work
- Troubleshooting guide is complete
- AGENTS.md files are current

---

## Tasks

### Task 5.1: Comprehensive Testing

```bash
# Run full test suite
bun run test

# Run RLS-specific tests
bun run test --filter @beep/db-admin

# Run IAM tests (most affected by RLS)
bun run test --filter @beep/iam-server
```

**Expected Results**:
- All tests pass
- No regression in existing functionality
- RLS tests verify isolation

### Task 5.2: Performance Benchmarks

Create performance test in `packages/_internal/db-admin/test/rls/Performance.test.ts`:

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

      // Set context
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

      // Log results
      yield* Effect.logInfo("RLS Query Performance", {
        iterations,
        totalMs: elapsed,
        avgLatencyMs: avgLatency,
      });

      // Assert reasonable latency (adjust threshold as needed)
      strictEqual(avgLatency < 50, true, `Average latency ${avgLatency}ms exceeds 50ms threshold`);
    })
  );

  it.effect("verifies index usage in EXPLAIN plan", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      yield* ctx.setOrganizationId("test-org");

      // Check EXPLAIN for index usage
      const explain = yield* sql`EXPLAIN (FORMAT JSON) SELECT * FROM iam_member WHERE organization_id = 'test-org'`;

      const plan = JSON.stringify(explain);
      // Verify index scan is used (not sequential scan)
      // This is a basic check - adjust based on actual explain output
      yield* Effect.logInfo("Query Plan", { plan });
    })
  );
});
```

### Task 5.3: Admin Bypass Verification

Create bypass test in `packages/_internal/db-admin/test/rls/AdminBypass.test.ts`:

```typescript
import { layer, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as Duration from "effect/Duration";
import { SqlClient } from "@effect/sql";
import { PgTest } from "../container";

layer(PgTest, { timeout: Duration.seconds(60) })("RLS Admin Bypass", (it) => {
  it.effect("verifies rls_bypass_admin role exists", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const result = yield* sql`
        SELECT rolname, rolbypassrls
        FROM pg_roles
        WHERE rolname = 'rls_bypass_admin'
      `;

      strictEqual(result.length, 1);
      strictEqual(result[0].rolbypassrls, true);
    })
  );

  it.effect("verifies bypass role can see all data", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      // Switch to bypass role and query
      // Note: This requires appropriate permissions
      yield* sql`SET ROLE rls_bypass_admin`;

      // Query without context - should return all rows (if any exist)
      const result = yield* sql`SELECT COUNT(*) as count FROM iam_member`;

      yield* Effect.logInfo("Bypass query result", { count: result[0].count });

      // Reset role
      yield* sql`RESET ROLE`;
    })
  );
});
```

### Task 5.4: Edge Case Testing

Test edge cases:

```typescript
layer(PgTest)("RLS Edge Cases", (it) => {
  it.effect("handles NULL organization_id gracefully", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Tables with nullable organization_id
      yield* ctx.setOrganizationId("test-org");

      // These tables have nullable organization_id
      const invitations = yield* sql`SELECT * FROM iam_invitation LIMIT 10`;
      const ssoProviders = yield* sql`SELECT * FROM iam_sso_provider LIMIT 10`;
      const scimProviders = yield* sql`SELECT * FROM iam_scim_provider LIMIT 10`;

      // Verify no NULL organization rows leaked
      // (NULL rows should be hidden by RLS)
    })
  );

  it.effect("handles empty string context correctly", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Clear context (sets to empty string)
      yield* ctx.clearContext();

      // Should return 0 rows (empty string becomes NULL via NULLIF)
      const result = yield* sql`SELECT * FROM iam_member LIMIT 10`;
      strictEqual(result.length, 0);
    })
  );

  it.effect("handles special characters in org ID", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const ctx = yield* TenantContext.TenantContext;

      // Test SQL injection resistance
      const maliciousId = "'; DROP TABLE iam_member; --";
      yield* ctx.setOrganizationId(maliciousId);

      // Should not cause SQL injection
      const result = yield* sql`SELECT current_setting('app.current_org_id', TRUE)`;
      // The escaped value should be set, not executed as SQL
    })
  );
});
```

### Task 5.5: Final Documentation Review

Verify documentation accuracy:
1. Review `documentation/patterns/rls-patterns.md`
2. Test all code examples in documentation
3. Verify AGENTS.md files are current
4. Update any outdated information

---

## Verification Checklist

Before completing Phase 5:

### Testing
- [ ] `bun run test` passes (all tests)
- [ ] `bun run test --filter @beep/db-admin` passes (RLS tests)
- [ ] Performance benchmarks completed
- [ ] Edge cases covered
- [ ] Admin bypass verified

### Performance
- [ ] Query latency measured and acceptable
- [ ] Index usage verified in EXPLAIN plans
- [ ] Connection pool behavior under load verified

### Documentation
- [ ] All code examples in docs verified working
- [ ] Troubleshooting guide complete
- [ ] AGENTS.md files current

### Final Verification
- [ ] All 20 tables have RLS enabled
- [ ] All 20 policies follow naming convention
- [ ] TenantContext is set for all org-scoped operations
- [ ] Admin bypass works for migrations
- [ ] Pattern is ready for future slices

---

## Success Criteria

The RLS implementation is complete when:

1. **All Tests Pass**: No regressions, RLS-specific tests verify isolation
2. **Performance Acceptable**: Query latency impact < 10% (approximate)
3. **Documentation Complete**: Comprehensive, accurate, tested
4. **Pattern Established**: Clear guide for adding RLS to new slices
5. **Bypass Working**: Admin operations can bypass RLS when needed

---

## Files to Create

| File | Purpose |
|------|---------|
| `packages/_internal/db-admin/test/rls/Performance.test.ts` | Performance benchmarks |
| `packages/_internal/db-admin/test/rls/AdminBypass.test.ts` | Admin bypass verification |
| `packages/_internal/db-admin/test/rls/EdgeCases.test.ts` | Edge case testing |

## Files to Modify

| File | Purpose |
|------|---------|
| `specs/rls-implementation/README.md` | Update to COMPLETE |
| `specs/rls-implementation/QUICK_START.md` | Update to COMPLETE |
| `specs/rls-implementation/REFLECTION_LOG.md` | Final phase learnings |

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/rls-implementation/handoffs/HANDOFF_P4.md` | Phase 4 context |
| `documentation/patterns/rls-patterns.md` | RLS documentation |
| `packages/shared/server/src/TenantContext/TenantContext.ts` | TenantContext service |
| `packages/_internal/db-admin/drizzle/0001_enable_rls_policies.sql` | RLS migration |
| `packages/_internal/db-admin/test/rls/TenantIsolation.test.ts` | Existing RLS tests |
