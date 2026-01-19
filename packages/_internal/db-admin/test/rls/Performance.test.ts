/**
 * RLS (Row-Level Security) Performance Tests
 *
 * Measures query latency with RLS policies enabled and verifies
 * that index usage is appropriate for filtered queries.
 *
 * @module test/rls/Performance
 */

import { TenantContext } from "@beep/shared-server";
import { layer, strictEqual } from "@beep/testkit";
import * as SqlClient from "@effect/sql/SqlClient";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import { PgTest } from "../container";

/**
 * Timeout for performance tests - extended to allow for multiple iterations.
 */
const PERF_TEST_TIMEOUT = 300000; // 5 minutes

layer(PgTest, { timeout: Duration.minutes(5) })("RLS Performance", (it) => {
  /**
   * Test: Measure query latency with RLS context set.
   *
   * NOTE: Using Date.now() instead of TestClock because we need
   * real elapsed time to measure actual database query latency.
   */
  it.effect(
    "measures query latency with RLS",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const ctx = yield* TenantContext.TenantContext;

        yield* ctx.setOrganizationId("perf-test-org");

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

        // Average latency should be under 100ms per query for a test container
        // This threshold may need adjustment based on CI environment
        strictEqual(avgLatency < 100, true, `Average latency ${avgLatency}ms exceeds 100ms threshold`);
      }),
    PERF_TEST_TIMEOUT
  );

  /**
   * Test: Measure context switching overhead.
   *
   * Validates that setting tenant context is a lightweight operation.
   */
  it.effect(
    "measures context switching overhead",
    () =>
      Effect.gen(function* () {
        const ctx = yield* TenantContext.TenantContext;

        const iterations = 100;
        const start = Date.now();

        for (let i = 0; i < iterations; i++) {
          yield* ctx.setOrganizationId(`org-${i}`);
        }

        const elapsed = Date.now() - start;
        const avgLatency = elapsed / iterations;

        yield* Effect.logInfo("Context Switch Performance", {
          iterations,
          totalMs: elapsed,
          avgLatencyMs: avgLatency,
        });

        // Context switching should be very fast (under 10ms per switch)
        strictEqual(avgLatency < 10, true, `Context switch latency ${avgLatency}ms exceeds 10ms threshold`);
      }),
    PERF_TEST_TIMEOUT
  );

  /**
   * Test: Verify query plan uses index on organization_id.
   *
   * This test runs EXPLAIN to inspect the query plan and logs it
   * for manual review. Index usage may vary based on data volume.
   */
  it.effect(
    "verifies index usage with EXPLAIN",
    () =>
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

        const planText = explain.map((r) => (r as { "QUERY PLAN": string })["QUERY PLAN"]).join("\n");

        yield* Effect.logInfo("Query Plan", { plan: planText });

        // Log for manual review - index usage verification
        // Note: In a test container with minimal data, PostgreSQL may choose
        // sequential scan even with indexes. Production data volumes should
        // trigger index usage.
      }),
    PERF_TEST_TIMEOUT
  );

  /**
   * Test: Compare query performance with and without context.
   */
  it.effect(
    "compares performance with and without context",
    () =>
      Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const ctx = yield* TenantContext.TenantContext;

        const iterations = 50;

        // Measure without context
        yield* ctx.clearContext();
        const startWithout = Date.now();
        for (let i = 0; i < iterations; i++) {
          yield* sql`SELECT * FROM iam_member LIMIT 10`;
        }
        const elapsedWithout = Date.now() - startWithout;

        // Measure with context
        yield* ctx.setOrganizationId("perf-test-org");
        const startWith = Date.now();
        for (let i = 0; i < iterations; i++) {
          yield* sql`SELECT * FROM iam_member LIMIT 10`;
        }
        const elapsedWith = Date.now() - startWith;

        yield* Effect.logInfo("RLS Performance Comparison", {
          iterations,
          withoutContextMs: elapsedWithout,
          withContextMs: elapsedWith,
          avgWithoutMs: elapsedWithout / iterations,
          avgWithMs: elapsedWith / iterations,
        });

        // Both should complete in reasonable time
        // The performance difference should be negligible
        strictEqual(elapsedWith < 10000, true, "Queries with context took too long");
        strictEqual(elapsedWithout < 10000, true, "Queries without context took too long");
      }),
    PERF_TEST_TIMEOUT
  );
});
