/**
 * TenantContext Service for RLS (Row-Level Security)
 *
 * Provides organization context management for multi-tenant database operations.
 * Uses PostgreSQL session variables (`SET app.current_org_id`) to scope queries
 * to a specific tenant organization.
 *
 * @remarks
 * This service uses session-level `SET` (not `SET LOCAL`) because connection pooling
 * can route sequential queries to different connections. Within a pooled environment,
 * `SET LOCAL` would only affect the current transaction on one connection.
 *
 * For production with proper connection-per-request or transaction wrapping, consider
 * using `withTransaction` combined with `SET LOCAL` for stricter isolation.
 *
 * PostgreSQL's SET statement doesn't support parameterized queries, so this service
 * uses `sql.unsafe()` with proper escaping to prevent SQL injection.
 *
 * @module TenantContext
 * @since 0.1.0
 */

import { $SharedServerId } from "@beep/identity/packages";
import * as SqlClient from "@effect/sql/SqlClient";
import type { SqlError } from "@effect/sql/SqlError";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const $I = $SharedServerId.create("TenantContext");

/**
 * Shape interface for TenantContext service
 *
 * @since 0.1.0
 * @category models
 */
export interface TenantContextShape {
  /**
   * Set the organization context for subsequent queries in this session.
   *
   * @remarks
   * Uses session-level `SET` to set the context. The context persists until
   * explicitly cleared or the connection is returned to the pool.
   *
   * @param orgId - The organization ID to set as the current context
   * @returns Effect that completes when the context is set
   */
  readonly setOrganizationId: (orgId: string) => Effect.Effect<void, SqlError>;

  /**
   * Clear the organization context by setting it to an empty string.
   *
   * @remarks
   * Sets the session variable to an empty string. RLS policies should treat
   * empty string as "no tenant" and block access accordingly.
   *
   * @returns Effect that completes when the context is cleared
   */
  readonly clearContext: () => Effect.Effect<void, SqlError>;

  /**
   * Execute an effect within a specific organization context.
   *
   * @remarks
   * Sets the organization context before executing the effect.
   * The context persists after the effect completes until explicitly cleared.
   *
   * @param orgId - The organization ID to set as the current context
   * @param effect - The effect to execute within the organization context
   * @returns The result of the effect
   */
  readonly withOrganization: <A, E, R>(
    orgId: string,
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, SqlError | E, R>;
}

/**
 * TenantContext service tag for dependency injection
 *
 * @since 0.1.0
 * @category tags
 */
export class TenantContext extends Context.Tag($I`TenantContext`)<TenantContext, TenantContextShape>() {
  /**
   * Layer that provides TenantContext, requires SqlClient
   *
   * @since 0.1.0
   * @category layers
   */
  static readonly layer: Layer.Layer<TenantContext, never, SqlClient.SqlClient> = Layer.effect(
    TenantContext,
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;

      // Escape single quotes to prevent SQL injection
      // Note: SET doesn't support parameterized queries, requiring raw SQL
      const escapeOrgId = (id: string) => id.replace(/'/g, "''");

      return {
        setOrganizationId: (orgId: string) =>
          sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`).pipe(Effect.asVoid),

        clearContext: () => sql.unsafe(`SET app.current_org_id = ''`).pipe(Effect.asVoid),

        withOrganization: Effect.fn("TenantContext.withOrganization")(
          <A, E, R>(orgId: string, effect: Effect.Effect<A, E, R>) =>
            Effect.gen(function* () {
              yield* sql.unsafe(`SET app.current_org_id = '${escapeOrgId(orgId)}'`);
              return yield* effect;
            })
        ),
      };
    })
  );
}
