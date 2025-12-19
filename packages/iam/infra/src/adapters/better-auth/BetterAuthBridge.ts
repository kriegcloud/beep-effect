/**
 * @module BetterAuthBridge
 *
 * Type bridge for Better Auth organization plugin operations.
 *
 * Better Auth's organization plugin provides Dynamic Access Control methods that
 * are added at runtime via the `dynamicAccessControl` option. These methods aren't
 * reflected in Better Auth's TypeScript types, so this module provides:
 *
 * 1. Type-safe wrappers for Dynamic Access Control methods (getOrgRole, createOrgRole, etc.)
 * 2. Input type definitions for these operations
 *
 * @category adapters
 * @since 0.1.0
 */

/**
 * Query parameter types for Better Auth organization operations.
 *
 * These types document the expected shape of query parameters for GET endpoints.
 */
export namespace OrganizationQuery {
  /**
   * Query for getOrgRole endpoint (dynamicAccessControl).
   */
  export interface GetRole {
    readonly roleId: string;
  }
}

/**
 * Input types for Dynamic Access Control operations.
 *
 * These methods are provided by the `dynamicAccessControl` option in the
 * organization plugin but are not reflected in Better Auth's TypeScript types.
 */
export namespace DynamicAccessControlInput {
  /**
   * Input for createOrgRole endpoint.
   */
  export interface CreateRole {
    readonly role: string;
    readonly permissions: readonly string[];
    readonly organizationId?: string;
  }

  /**
   * Input for deleteOrgRole endpoint.
   */
  export interface DeleteRole {
    readonly roleId: string;
    readonly organizationId?: string;
  }

  /**
   * Input for updateOrgRole endpoint.
   */
  export interface UpdateRole {
    readonly roleId: string;
    readonly permissions?: readonly string[];
    readonly organizationId?: string;
  }
}

import * as Effect from "effect/Effect";

/**
 * Safely calls a dynamic method on an API object.
 *
 * Better Auth's organization plugin adds methods like `getOrgRole`, `createOrgRole`, etc.
 * at runtime via the `dynamicAccessControl` option. These methods aren't in the TypeScript
 * types, so we need to access them dynamically.
 *
 * This function checks if the method exists at runtime and calls it if available.
 *
 * @internal
 */
const callDynamicMethod = <TArgs, TResult>(
  api: Record<string, unknown>,
  methodName: string,
  args: TArgs
): Effect.Effect<TResult, Error> =>
  Effect.gen(function* () {
    const method = api[methodName];
    if (typeof method !== "function") {
      return yield* Effect.fail(
        new Error(
          `Dynamic Access Control method '${methodName}' not available. Ensure dynamicAccessControl is enabled.`
        )
      );
    }
    return yield* Effect.tryPromise({
      try: () => method(args) as Promise<TResult>,
      catch: (error) => new Error(`Failed to call ${methodName}: ${String(error)}`),
    });
  });

/**
 * Get an organization role by ID.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const getOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly query: OrganizationQuery.GetRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "getOrgRole", opts);

/**
 * Create a new organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const createOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.CreateRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "createOrgRole", opts);

/**
 * Delete an organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const deleteOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.DeleteRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "deleteOrgRole", opts);

/**
 * Update an organization role.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const updateOrgRole = (
  api: Record<string, unknown>,
  opts: {
    readonly body: DynamicAccessControlInput.UpdateRole;
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "updateOrgRole", opts);

/**
 * List all organization roles.
 *
 * @category DynamicAccessControl
 * @since 0.1.0
 */
export const listOrgRoles = (
  api: Record<string, unknown>,
  opts: {
    readonly headers: unknown;
  }
): Effect.Effect<unknown, Error> => callDynamicMethod(api, "listOrgRoles", opts);
