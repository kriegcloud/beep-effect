import { BeepError } from "@beep/errors/shared";
import { $SharedDomainId } from "@beep/identity/packages";
import type { Organization, Session, User } from "@beep/shared-domain/entities";
import * as HttpApiMiddleware from "@effect/platform/HttpApiMiddleware";
import * as HttpApiSecurity from "@effect/platform/HttpApiSecurity";
import * as HttpLayerRouter from "@effect/platform/HttpLayerRouter";
import * as RpcMiddleware from "@effect/rpc/RpcMiddleware";
import type { NonEmptyReadonlyArray } from "effect/Array";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import type * as S from "effect/Schema";
import * as Schema from "effect/Schema";
import * as internal from "./_internal/policy";
import { PermissionAction, PolicyBuilder } from "./_internal/policy-builder";
import { EntityKind, IamEntityIds, SharedEntityIds } from "./entity-ids";

const $I = $SharedDomainId.create("Policy");

const policyBuilder = new PolicyBuilder({
  domains: EntityKind.Options,
  permissionActions: [PermissionAction.Enum.read, PermissionAction.Enum.manage, PermissionAction.Enum.delete],
});

export class PolicyRecord extends policyBuilder.PolicySchema.annotations({
  schemaId: Symbol.for("@beep/shared-domain/Policy/PolicyRecord"),
  identifier: "PolicyRecord",
  title: "Policy Record",
  description: "A record which defines an access control policy for a user or API key.",
}) {}

export declare namespace PolicyRecord {
  export type Type = typeof PolicyRecord.Type;
  export type Encoded = typeof PolicyRecord.Encoded;
}
// ==========================================
// Permissions
// ==========================================
const commonPermissions = ["read", "manage", "delete"] as const;

const Permissions = internal.makePermissions({
  __test: ["read", "manage", "delete"],
  [SharedEntityIds.OrganizationId.tableName]: commonPermissions,
  [SharedEntityIds.TeamId.tableName]: commonPermissions,
  [SharedEntityIds.FileId.tableName]: commonPermissions,
  [SharedEntityIds.AuditLogId.tableName]: commonPermissions,
  [IamEntityIds.AccountId.tableName]: commonPermissions,
  [IamEntityIds.ApiKeyId.tableName]: commonPermissions,
  [IamEntityIds.DeviceCodeId.tableName]: commonPermissions,
  [IamEntityIds.InvitationId.tableName]: commonPermissions,
  [IamEntityIds.JwksId.tableName]: commonPermissions,
  [IamEntityIds.MemberId.tableName]: commonPermissions,
  [IamEntityIds.OrganizationRoleId.tableName]: commonPermissions,
  [IamEntityIds.PasskeyId.tableName]: commonPermissions,
  [IamEntityIds.RateLimitId.tableName]: commonPermissions,
  [SharedEntityIds.SessionId.tableName]: commonPermissions,
  [IamEntityIds.SsoProviderId.tableName]: commonPermissions,
  [IamEntityIds.SubscriptionId.tableName]: commonPermissions,
  [IamEntityIds.TeamMemberId.tableName]: commonPermissions,
  [IamEntityIds.TwoFactorId.tableName]: commonPermissions,
  [SharedEntityIds.UserId.tableName]: commonPermissions,
  [IamEntityIds.VerificationId.tableName]: commonPermissions,
  [IamEntityIds.WalletAddressId.tableName]: commonPermissions,
} as const);

export const Permission = Schema.Literal(...Permissions).annotations({
  identifier: "Permission",
});
export type Permission = typeof Permission.Type;

// ==========================================
// Authentication Middleware
// ==========================================
export type AuthContextShape = {
  readonly user: typeof User.Model.Type;
  readonly session: typeof Session.Model.Type;
  readonly organization: typeof Organization.Model.Type;
};

export class AuthContext extends Context.Tag($I`AuthContext`)<AuthContext, AuthContextShape>() {}

export class AuthContextHttpMiddleware extends HttpApiMiddleware.Tag<AuthContextHttpMiddleware>()(
  "AuthContextHttpMiddleware",
  {
    failure: BeepError.Unauthorized,
    provides: AuthContext,
    security: {
      cookie: HttpApiSecurity.apiKey({
        in: "cookie",
        key: "better-auth.session_token",
      }),
    },
  }
) {}

export class AuthContextRpcMiddleware extends RpcMiddleware.Tag<AuthContextRpcMiddleware>()(
  "AuthContextRpcMiddleware",
  {
    failure: BeepError.Unauthorized,
    provides: AuthContext,
  }
) {}

export class CurrentUser extends Context.Tag($I`CurrentUser`)<
  CurrentUser,
  {
    readonly user: S.Schema.Type<typeof User.Model>;
    readonly permissions: Set<Permission>;
  }
>() {}

/**
 * Unified authentication middleware for HttpLayerRouter.
 * Works with both HttpApi routes and RpcServer routes.
 *
 * Usage:
 * ```ts
 * const routes = Layer.mergeAll(ApiRoutes, RpcRoutes).pipe(
 *   Layer.provide(AuthContextMiddleware.layer)
 * )
 * ```
 */
export const AuthContextMiddleware = HttpLayerRouter.middleware<{
  provides: AuthContext;
}>();
// ==========================================
// Policy
// ==========================================

/**
 * Represents an access policy that can be evaluated against the current user.
 * A policy is a function that returns Effect.void if access is granted,
 * or fails with a BeepError.Forbidden if access is denied.
 */
type Policy<E = never, R = never> = Effect.Effect<void, BeepError.Forbidden | E, CurrentUser | R>;

/**
 * Creates a policy from a predicate function that evaluates the current user.
 */
export const policy = <E, R>(
  predicate: (user: CurrentUser["Type"]) => Effect.Effect<boolean, E, R>,
  message?: string | undefined
): Policy<E, R> =>
  Effect.flatMap(CurrentUser, (user) =>
    Effect.flatMap(predicate(user), (result) =>
      result
        ? Effect.void
        : Effect.fail(message !== undefined ? new BeepError.Forbidden({ message }) : new BeepError.Forbidden())
    )
  );

/**
 * Applies a predicate as a pre-check to an effect.
 * If the predicate returns false, the effect will fail with Forbidden.
 */
export const withPolicy =
  <E, R>(policy: Policy<E, R>) =>
  <A, E2, R2>(self: Effect.Effect<A, E2, R2>) =>
    Effect.zipRight(policy, self);

/**
 * Composes multiple policies with AND semantics - all policies must pass.
 * Returns a new policy that succeeds only if all the given policies succeed.
 *
 * @example
 * ```typescript
 * import * as Policy from "@beep/shared-domain/Policy";
 * import * as Effect from "effect/Effect";
 *
 * // Combine multiple permission checks - user must have ALL permissions
 * const canManageTeam = Policy.all(
 *   Policy.permission("teams:read"),
 *   Policy.permission("teams:manage"),
 *   Policy.permission("members:manage")
 * );
 *
 * // Use in an Effect program
 * const createTeamMember = Effect.gen(function* () {
 *   yield* canManageTeam; // Fails with Forbidden if any permission is missing
 *   // ... proceed with team member creation
 * });
 *
 * // Combine custom policies
 * const canEditDocument = Policy.all(
 *   Policy.permission("documents:manage"),
 *   Policy.policy((user) => Effect.succeed(user.user.emailVerified))
 * );
 * ```
 */
export const all = <E, R>(...policies: NonEmptyReadonlyArray<Policy<E, R>>): Policy<E, R> =>
  Effect.all(policies, {
    concurrency: 1,
    discard: true,
  });

/**
 * Composes multiple policies with OR semantics - at least one policy must pass.
 * Returns a new policy that succeeds if any of the given policies succeed.
 *
 * @example
 * ```typescript
 * import * as Policy from "@beep/shared-domain/Policy";
 * import * as Effect from "effect/Effect";
 *
 * // User needs at least ONE of these permissions to proceed
 * const canViewDocument = Policy.any(
 *   Policy.permission("documents:read"),
 *   Policy.permission("documents:manage"),
 *   Policy.permission("admin:all")
 * );
 *
 * // Use in an Effect program
 * const getDocument = (id: string) => Effect.gen(function* () {
 *   yield* canViewDocument; // Succeeds if user has any of the permissions
 *   // ... fetch and return document
 * });
 *
 * // Combine with Policy.all for complex authorization
 * const canModifyTeamSettings = Policy.all(
 *   Policy.permission("teams:read"),
 *   Policy.any(
 *     Policy.permission("teams:manage"),
 *     Policy.permission("admin:all")
 *   )
 * );
 * ```
 */
export const any = <E, R>(...policies: NonEmptyReadonlyArray<Policy<E, R>>): Policy<E, R> =>
  Effect.firstSuccessOf(policies);

/**
 * Creates a policy that checks if the current user has a specific permission.
 *
 * @example
 * ```typescript
 * import * as Policy from "@beep/shared-domain/Policy";
 * import * as Effect from "effect/Effect";
 *
 * // Create a policy for a specific permission
 * const canReadUsers = Policy.permission("users:read");
 * const canManageTeams = Policy.permission("teams:manage");
 *
 * // Use directly in an Effect program
 * const listUsers = Effect.gen(function* () {
 *   yield* canReadUsers; // Fails with Forbidden if permission missing
 *   // ... return list of users
 * });
 *
 * // Use with withPolicy to guard an effect
 * const deleteTeam = (teamId: string) =>
 *   Effect.succeed({ deleted: teamId }).pipe(
 *     Policy.withPolicy(Policy.permission("teams:delete"))
 *   );
 *
 * // Combine with other policies
 * const adminOrOwner = Policy.any(
 *   Policy.permission("admin:all"),
 *   Policy.permission("organizations:manage")
 * );
 * ```
 */
export const permission = (requiredPermission: Permission): Policy =>
  policy((user) => Effect.succeed(user.permissions.has(requiredPermission)));
