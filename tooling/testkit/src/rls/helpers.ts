/**
 * RLS (Row-Level Security) Test Helpers
 *
 * Provides utilities for testing tenant isolation enforcement in the database.
 * These helpers are designed to work with any TenantContext-like service that
 * provides organization scoping capabilities.
 *
 * @module rls/helpers
 * @since 0.1.0
 */

import type { SqlError } from "@effect/sql/SqlError";
import * as A from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";

/**
 * Interface that a TenantContext service must implement to work with these helpers.
 *
 * @since 0.1.0
 * @category models
 */
export interface TenantContextLike {
  readonly setOrganizationId: (orgId: string) => Effect.Effect<void, SqlError>;
  readonly clearContext: () => Effect.Effect<void, SqlError>;
  readonly withOrganization: <A, E, R>(
    orgId: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, SqlError | E, R>;
}

/**
 * Tag for TenantContext service used in RLS helpers.
 * Consumers must provide their own TenantContext implementation.
 *
 * @since 0.1.0
 * @category tags
 */
export class TenantContextTag extends Context.Tag("@beep/testkit/rls/TenantContext")<
  TenantContextTag,
  TenantContextLike
>() {}

/**
 * Execute an effect within a specific tenant context.
 *
 * @since 0.1.0
 * @category helpers
 *
 * @example
 * ```typescript
 * import { withTestTenant, TenantContextTag } from "@beep/testkit/rls";
 * import { TenantContext } from "@beep/shared-server";
 * import * as Effect from "effect/Effect";
 * import * as Layer from "effect/Layer";
 *
 * // Provide TenantContext as TenantContextTag
 * const TestLayer = Layer.succeed(TenantContextTag, yield* TenantContext.TenantContext);
 *
 * const result = yield* withTestTenant("org-123", Effect.gen(function* () {
 *   const sql = yield* SqlClient.SqlClient;
 *   return yield* sql`SELECT * FROM iam_member`;
 * }));
 * ```
 */
export const withTestTenant: <A, E, R>(
  orgId: string,
  effect: Effect.Effect<A, E, R>
) => Effect.Effect<A, SqlError | E, R | TenantContextTag> = Effect.fnUntraced(function* <A, E, R>(
  orgId: string,
  effect: Effect.Effect<A, E, R>
) {
  const ctx = yield* TenantContextTag;
  return yield* ctx.withOrganization(orgId, effect);
});

/**
 * Assert that a query returns no rows when executed without tenant context.
 *
 * This verifies that RLS policies properly block access to data when
 * no organization context is set.
 *
 * @since 0.1.0
 * @category assertions
 *
 * @example
 * ```typescript
 * import { assertNoRowsWithoutContext } from "@beep/testkit/rls";
 *
 * yield* assertNoRowsWithoutContext(
 *   sql`SELECT * FROM iam_member LIMIT 10`
 * );
 * ```
 */
export const assertNoRowsWithoutContext: <A, E, R>(
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.Effect<ReadonlyArray<A>, E, R> = Effect.fnUntraced(function* <A, E, R>(
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) {
  const result = yield* queryEffect;
  if (result.length > 0) {
    return yield* Effect.die(new Error(`Expected 0 rows without tenant context, got ${result.length}`));
  }
  return result;
});

/**
 * Result of tenant isolation assertion containing data from both organizations.
 *
 * @since 0.1.0
 * @category models
 */
export interface TenantIsolationResult<A> {
  readonly orgAResults: ReadonlyArray<A>;
  readonly orgBResults: ReadonlyArray<A>;
}

/**
 * Assert that tenant isolation is enforced - org A cannot see org B's data.
 *
 * This helper verifies that:
 * 1. When querying with org A's context, all returned rows have organizationId === orgAId
 * 2. When querying with org B's context, all returned rows have organizationId === orgBId
 *
 * @since 0.1.0
 * @category assertions
 *
 * @remarks
 * For the session table which uses `activeOrganizationId` instead of `organizationId`,
 * use {@link assertTenantIsolationForSession} instead.
 *
 * @example
 * ```typescript
 * import { assertTenantIsolation } from "@beep/testkit/rls";
 *
 * const { orgAResults, orgBResults } = yield* assertTenantIsolation(
 *   "org-123",
 *   "org-456",
 *   Effect.gen(function* () {
 *     const repo = yield* MemberRepo;
 *     return yield* repo.findAll();
 *   })
 * );
 * ```
 */
export const assertTenantIsolation: <A extends { readonly organizationId: string }, E, R>(
  orgAId: string,
  orgBId: string,
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.Effect<TenantIsolationResult<A>, SqlError | E, R | TenantContextTag> = Effect.fnUntraced(function* <
  A extends { readonly organizationId: string },
  E,
  R,
>(orgAId: string, orgBId: string, queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>) {
  const ctx = yield* TenantContextTag;

  // Query with org A context
  const orgAResults = yield* ctx.withOrganization(orgAId, queryEffect);

  // Verify all results belong to org A
  const orgAViolations = A.filter(orgAResults, (row) => row.organizationId !== orgAId);
  if (orgAViolations.length > 0) {
    const violatingOrgs = A.map(orgAViolations, (row) => row.organizationId);
    return yield* Effect.die(
      new Error(`Tenant isolation violation: org ${orgAId} saw data from orgs: ${violatingOrgs.join(", ")}`)
    );
  }

  // Query with org B context
  const orgBResults = yield* ctx.withOrganization(orgBId, queryEffect);

  // Verify all results belong to org B
  const orgBViolations = A.filter(orgBResults, (row) => row.organizationId !== orgBId);
  if (orgBViolations.length > 0) {
    const violatingOrgs = A.map(orgBViolations, (row) => row.organizationId);
    return yield* Effect.die(
      new Error(`Tenant isolation violation: org ${orgBId} saw data from orgs: ${violatingOrgs.join(", ")}`)
    );
  }

  return { orgAResults, orgBResults };
});

/**
 * Assert tenant isolation for session table which uses `activeOrganizationId`.
 *
 * The session table uses `active_organization_id` column instead of `organization_id`
 * for RLS filtering. This helper specifically checks that field.
 *
 * @since 0.1.0
 * @category assertions
 *
 * @example
 * ```typescript
 * import { assertTenantIsolationForSession } from "@beep/testkit/rls";
 *
 * const { orgAResults, orgBResults } = yield* assertTenantIsolationForSession(
 *   "org-123",
 *   "org-456",
 *   Effect.gen(function* () {
 *     const sql = yield* SqlClient.SqlClient;
 *     return yield* sql`SELECT * FROM shared_session`;
 *   })
 * );
 * ```
 */
export const assertTenantIsolationForSession: <A extends { readonly activeOrganizationId: string }, E, R>(
  orgAId: string,
  orgBId: string,
  queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>
) => Effect.Effect<TenantIsolationResult<A>, SqlError | E, R | TenantContextTag> = Effect.fnUntraced(function* <
  A extends { readonly activeOrganizationId: string },
  E,
  R,
>(orgAId: string, orgBId: string, queryEffect: Effect.Effect<ReadonlyArray<A>, E, R>) {
  const ctx = yield* TenantContextTag;

  // Query with org A context
  const orgAResults = yield* ctx.withOrganization(orgAId, queryEffect);

  // Verify all results belong to org A
  const orgAViolations = A.filter(orgAResults, (row) => row.activeOrganizationId !== orgAId);
  if (orgAViolations.length > 0) {
    const violatingOrgs = A.map(orgAViolations, (row) => row.activeOrganizationId);
    return yield* Effect.die(
      new Error(`Session isolation violation: org ${orgAId} saw sessions from orgs: ${violatingOrgs.join(", ")}`)
    );
  }

  // Query with org B context
  const orgBResults = yield* ctx.withOrganization(orgBId, queryEffect);

  // Verify all results belong to org B
  const orgBViolations = A.filter(orgBResults, (row) => row.activeOrganizationId !== orgBId);
  if (orgBViolations.length > 0) {
    const violatingOrgs = A.map(orgBViolations, (row) => row.activeOrganizationId);
    return yield* Effect.die(
      new Error(`Session isolation violation: org ${orgBId} saw sessions from orgs: ${violatingOrgs.join(", ")}`)
    );
  }

  return { orgAResults, orgBResults };
});

/**
 * Assert that INSERT requires valid tenant context.
 *
 * Attempts to insert a row and verifies it fails when no context is set,
 * and succeeds when proper context is provided.
 *
 * @since 0.1.0
 * @category assertions
 *
 * @example
 * ```typescript
 * import { assertInsertRequiresContext } from "@beep/testkit/rls";
 *
 * yield* assertInsertRequiresContext(
 *   "org-123",
 *   () => memberRepo.insert({ organizationId: "org-123", userId: "user-1" })
 * );
 * ```
 */
export const assertInsertRequiresContext: <A, E, R>(
  orgId: string,
  insertFn: () => Effect.Effect<A, E, R>
) => Effect.Effect<A, SqlError | E, R | TenantContextTag> = Effect.fnUntraced(function* <A, E, R>(
  orgId: string,
  insertFn: () => Effect.Effect<A, E, R>
) {
  const ctx = yield* TenantContextTag;

  // Attempt insert without context - should fail
  const withoutContextResult = yield* Effect.either(insertFn());
  if (withoutContextResult._tag === "Right") {
    return yield* Effect.die(new Error("INSERT succeeded without tenant context - RLS policy not enforced"));
  }

  // Attempt insert with context - should succeed
  yield* ctx.setOrganizationId(orgId);
  return yield* insertFn();
});

/**
 * Set tenant context for a test block.
 *
 * A simple wrapper around TenantContext.setOrganizationId for cleaner test code.
 *
 * @since 0.1.0
 * @category helpers
 *
 * @example
 * ```typescript
 * import { setTestTenant } from "@beep/testkit/rls";
 *
 * yield* setTestTenant("org-123");
 * // subsequent queries will be scoped to org-123
 * ```
 */
export const setTestTenant: (orgId: string) => Effect.Effect<void, SqlError, TenantContextTag> = Effect.fnUntraced(
  function* (orgId: string) {
    const ctx = yield* TenantContextTag;
    yield* ctx.setOrganizationId(orgId);
  }
);

/**
 * Clear tenant context.
 *
 * @since 0.1.0
 * @category helpers
 */
export const clearTestTenant: () => Effect.Effect<void, SqlError, TenantContextTag> = Effect.fnUntraced(function* () {
  const ctx = yield* TenantContextTag;
  yield* ctx.clearContext();
});
