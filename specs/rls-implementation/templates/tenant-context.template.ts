/**
 * TenantContext Effect Service Template
 *
 * This service manages the PostgreSQL session variable 'app.current_org_id'
 * which is used by RLS policies to filter data by organization.
 *
 * Usage:
 *   1. Copy to packages/shared/server/src/TenantContext/
 *   2. Export from package barrel
 *   3. Compose with existing Db layers
 *
 * Integration:
 *   - Request middleware should call setOrganizationId() with authenticated org
 *   - All org-scoped queries will automatically be filtered
 *   - Tests should use withOrganization() for isolation
 */

import * as SqlClient from "@effect/sql/SqlClient";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

// =============================================================================
// Service Interface
// =============================================================================

export interface TenantContextShape {
  /**
   * Set the current organization ID for RLS filtering.
   * Must be called before any org-scoped database operations.
   *
   * @param orgId - Organization UUID
   */
  readonly setOrganizationId: (orgId: string) => Effect.Effect<void>;

  /**
   * Execute an effect with a specific organization context.
   * Useful for testing or batch operations.
   *
   * @param orgId - Organization UUID
   * @param effect - Effect to execute within the context
   */
  readonly withOrganization: <A, E, R>(
    orgId: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E, R>;

  /**
   * Clear the current organization context.
   * Use when switching between organizations or for cleanup.
   */
  readonly clearContext: () => Effect.Effect<void>;

  /**
   * Get the currently set organization ID.
   * Returns undefined if not set.
   */
  readonly getCurrentOrganizationId: () => Effect.Effect<string | undefined>;
}

// =============================================================================
// Service Tag
// =============================================================================

/**
 * TenantContext provides RLS session management for multi-tenant isolation.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect";
 * import { TenantContext } from "@beep/shared-server/TenantContext";
 *
 * const myOperation = Effect.gen(function* () {
 *   const ctx = yield* TenantContext;
 *
 *   // Set context from authenticated session
 *   yield* ctx.setOrganizationId(session.organizationId);
 *
 *   // All subsequent queries are scoped to this org
 *   const members = yield* memberRepo.findAll();
 *
 *   return members;
 * });
 * ```
 */
export class TenantContext extends Context.Tag("@beep/shared-server/TenantContext")<
  TenantContext,
  TenantContextShape
>() {}

// =============================================================================
// Service Implementation
// =============================================================================

/**
 * Create the TenantContext service implementation.
 * Requires SqlClient.SqlClient dependency for executing SET statements.
 */
const makeTenantContext: Effect.Effect<TenantContextShape, never, SqlClient.SqlClient> = Effect.gen(
  function* () {
    const sql = yield* SqlClient.SqlClient;

    return {
      setOrganizationId: (orgId: string) =>
        Effect.gen(function* () {
          // Execute PostgreSQL SET statement to establish session context
          // This is used by RLS policies: USING (organization_id = current_setting('app.current_org_id')::uuid)
          yield* sql`SELECT set_config('app.current_org_id', ${orgId}, false)`;
          yield* Effect.logDebug("Set tenant context").pipe(
            Effect.annotateLogs({ organizationId: orgId })
          );
        }),

      withOrganization: <A, E, R>(orgId: string, effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          // Set context before executing effect
          yield* sql`SELECT set_config('app.current_org_id', ${orgId}, false)`;

          // Execute the effect within this context
          const result = yield* effect;

          // Reset context after execution
          // Using RESET ensures we don't leak context to subsequent operations
          yield* sql`SELECT set_config('app.current_org_id', '', false)`;

          return result;
        }).pipe(
          // Ensure cleanup even if effect fails
          Effect.onExit(() =>
            sql`SELECT set_config('app.current_org_id', '', false)`.pipe(Effect.ignore)
          )
        ),

      clearContext: () =>
        Effect.gen(function* () {
          yield* sql`SELECT set_config('app.current_org_id', '', false)`;
          yield* Effect.logDebug("Cleared tenant context");
        }),

      getCurrentOrganizationId: () =>
        Effect.gen(function* () {
          const result = yield* sql<{ org_id: string | null }>`
            SELECT nullif(current_setting('app.current_org_id', true), '') as org_id
          `;
          // Result is an array; get first row
          const row = result[0];
          return row?.org_id ?? undefined;
        }),
    } satisfies TenantContextShape;
  }
);

// =============================================================================
// Layer Exports
// =============================================================================

/**
 * Live layer for TenantContext service.
 * Requires SqlClient.SqlClient to be provided.
 *
 * @example
 * ```typescript
 * import { TenantContext } from "@beep/shared-server/TenantContext";
 * import { DbClient } from "@beep/shared-server/factories";
 * import * as Layer from "effect/Layer";
 *
 * // Compose with database layer
 * const AppLayer = Layer.mergeAll(
 *   TenantContext.Live.pipe(Layer.provide(DbClient.layer)),
 *   IamDb.layer,
 *   IamRepos.layer
 * );
 * ```
 */
export const TenantContextLive: Layer.Layer<TenantContext, never, SqlClient.SqlClient> =
  Layer.effect(TenantContext, makeTenantContext);

// =============================================================================
// Test Utilities
// =============================================================================

/**
 * Test layer that provides a mock TenantContext.
 * Use in tests that don't need real database context.
 */
export const TenantContextTest: Layer.Layer<TenantContext> = Layer.succeed(TenantContext, {
  setOrganizationId: () => Effect.void,
  withOrganization: (_, effect) => effect,
  clearContext: () => Effect.void,
  getCurrentOrganizationId: () => Effect.succeed(undefined),
});

/**
 * Test layer with a fixed organization ID.
 * Use for tests that need consistent tenant context.
 *
 * @param orgId - Fixed organization ID to use for all operations
 */
export const TenantContextTestWith = (orgId: string): Layer.Layer<TenantContext> =>
  Layer.succeed(TenantContext, {
    setOrganizationId: () => Effect.void,
    withOrganization: (_, effect) => effect,
    clearContext: () => Effect.void,
    getCurrentOrganizationId: () => Effect.succeed(orgId),
  });

// =============================================================================
// Middleware Helper
// =============================================================================

/**
 * Higher-order function to wrap request handlers with tenant context.
 *
 * @example
 * ```typescript
 * const handler = withTenantContext((req) =>
 *   Effect.gen(function* () {
 *     // Tenant context is already set from req.session.organizationId
 *     const data = yield* myService.getData();
 *     return data;
 *   })
 * );
 * ```
 */
export const withTenantContext =
  <A, E, R>(
    handler: (request: { session: { organizationId: string } }) => Effect.Effect<A, E, R>
  ) =>
  (request: { session: { organizationId: string } }): Effect.Effect<A, E, R | TenantContext> =>
    Effect.gen(function* () {
      const ctx = yield* TenantContext;
      yield* ctx.setOrganizationId(request.session.organizationId);
      return yield* handler(request);
    });

// =============================================================================
// Connection Pooling Notes
// =============================================================================

/**
 * IMPORTANT: Connection Pooling Considerations
 *
 * PostgreSQL session variables (SET app.current_org_id) are connection-scoped,
 * not transaction-scoped by default. This has implications for connection pooling:
 *
 * 1. **Transaction Mode Pooling (PgBouncer)**:
 *    - Session variables may not persist across statements
 *    - Use `set_config('app.current_org_id', $1, true)` for LOCAL (transaction) scope
 *    - Or set at start of each transaction
 *
 * 2. **Session Mode Pooling**:
 *    - Variables persist for connection lifetime
 *    - MUST clear context when returning connection to pool
 *    - Use `clearContext()` in request cleanup
 *
 * 3. **Recommended Pattern**:
 *    - Always set context at request start
 *    - Always clear context at request end (finally block)
 *    - Consider using `withOrganization` for automatic cleanup
 *
 * 4. **Per-Statement vs Per-Transaction**:
 *    - `set_config(name, value, false)` - session-level, persists after transaction
 *    - `set_config(name, value, true)` - transaction-local, resets on commit/rollback
 *    - For RLS, prefer session-level (false) with explicit cleanup
 */
