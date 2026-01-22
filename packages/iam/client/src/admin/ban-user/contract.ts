/**
 * @fileoverview
 * Ban user contract schemas for the IAM admin client.
 *
 * Defines the payload and success response schemas for banning a user.
 *
 * @module @beep/iam-client/admin/ban-user/contract
 * @category Admin/BanUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { formValuesAnnotation } from "@beep/iam-client/_internal";
import { $IamClientId } from "@beep/identity/packages";
import * as W from "@beep/wrap";
import * as S from "effect/Schema";

const $I = $IamClientId.create("admin/ban-user");

/**
 * Payload for banning a user.
 *
 * @example
 * ```typescript
 * import { BanUser } from "@beep/iam-client/admin"
 *
 * // Permanent ban
 * const permanentBan = BanUser.Payload.make({
 *   userId: "shared_user__abc123",
 *   banReason: "Terms of service violation"
 * })
 *
 * // Temporary ban (1 hour)
 * const tempBan = BanUser.Payload.make({
 *   userId: "shared_user__abc123",
 *   banReason: "Spam activity",
 *   banExpiresIn: 3600
 * })
 * ```
 *
 * @category Admin/BanUser/Schemas
 * @since 0.1.0
 */
export class Payload extends S.Class<Payload>($I`Payload`)(
  {
    userId: S.String,
    banReason: S.optional(S.String),
    banExpiresIn: S.optional(S.Number),
  },
  formValuesAnnotation({
    userId: "",
    banReason: "",
  })
) {}

/**
 * Success response containing the banned user.
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { BanUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   const result = yield* BanUser.Handler({
 *     userId: "shared_user__abc123",
 *     banReason: "Violation of terms"
 *   })
 *   console.log(`User ${result.user.name} has been banned`)
 * })
 * ```
 *
 * @category Admin/BanUser/Schemas
 * @since 0.1.0
 */
export class Success extends S.Class<Success>($I`Success`)(
  {
    user: Common.DomainUserFromBetterAuthUser,
  },
  $I.annotations("Success", {
    description: "Success response containing the banned user.",
  })
) {}

/**
 * Contract wrapper for ban user operations.
 *
 * @example
 * ```typescript
 * import { BanUser } from "@beep/iam-client/admin"
 *
 * const handler = BanUser.Wrapper.implement((payload) => {
 *   // Implementation returns { data: Success } or { error: IamError }
 * })
 * ```
 *
 * @category Admin/BanUser/Contracts
 * @since 0.1.0
 */
export const Wrapper = W.Wrapper.make("BanUser", {
  payload: Payload,
  success: Success,
  error: Common.IamError,
});
