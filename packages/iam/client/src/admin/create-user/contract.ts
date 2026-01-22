/**
 * @fileoverview
 * Create user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for creating a new user.
 *
 * @module @beep/iam-client/admin/create-user/contract
 * @category Admin/CreateUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/create-user");

/**
 * Payload for creating a new user as admin.
 *
 * @example
 * ```typescript
 * import { CreateUser } from "@beep/iam-client/admin"
 *
 * const payload = CreateUser.Payload.make({
 *   email: "user@example.com",
 *   password: "secret123",
 *   name: "John Doe",
 *   role: "user"
 * })
 * ```
 *
 * @category Admin/CreateUser/Schemas
 * @since 0.1.0
 */
/**
 * Role type matching Better Auth's admin role options.
 *
 * @category Admin/CreateUser/Schemas
 * @since 0.1.0
 */
export const UserRole = S.Union(S.Literal("user", "admin"), S.mutable(S.Array(S.Literal("user", "admin"))));

export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    email: S.String,
    password: S.optional(S.String),
    name: S.String,
    role: S.optional(UserRole),
    data: S.optional(S.Record({ key: S.String, value: S.Unknown })),
  },
  formValuesAnnotation({
    email: "",
    password: "",
    name: "",
    role: "user" as const,
  })
) {}

/**
 * Success response containing the newly created user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { CreateUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* CreateUser.Handler({
 *     email: "user@example.com",
 *     password: "secret123",
 *     name: "John Doe"
 *   })
 *   console.log(result.user.id)
 * })
 * ```
 *
 * @category Admin/CreateUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the newly created user.",
  })
) {}

/**
 * Contract wrapper for create user operations.
 *
 * @example
 * ```typescript
 * import { CreateUser } from "@beep/iam-client/admin"
 *
 * const handler = CreateUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/CreateUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("CreateUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
