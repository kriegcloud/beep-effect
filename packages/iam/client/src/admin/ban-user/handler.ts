/**
 * @fileoverview
 * Ban user handler implementation.
 *
 * Implements the ban user contract using Better Auth's admin client.
 *
 * @module @beep/iam-client/admin/ban-user/handler
 * @category Admin/BanUser
 * @since 0.1.0
 */
import * as Common from "@beep/iam-client/_internal";
import { client } from "@beep/iam-client/adapters";
import * as Contract from "./contract.ts";

/**
 * Ban user handler that bans a user and revokes their sessions.
 *
 * Calls Better Auth's admin.banUser method and validates the response.
 * Does not mutate session state (admin operation, but affects target user).
 *
 * @example
 * ```typescript
 * import * as Effect from "effect/Effect"
 * import { BanUser } from "@beep/iam-client/admin"
 *
 * const program = Effect.gen(function* () {
 *   // Permanent ban
 *   const result = yield* BanUser.Handler({
 *     userId: "shared_user__abc123",
 *     banReason: "Terms of service violation"
 *   })
 *   console.log(`User ${result.user.name} has been banned`)
 *
 *   // Temporary ban (1 hour)
 *   const tempResult = yield* BanUser.Handler({
 *     userId: "shared_user__def456",
 *     banReason: "Spam activity",
 *     banExpiresIn: 3600
 *   })
 * })
 * ```
 *
 * @category Admin/BanUser/Handlers
 * @since 0.1.0
 */
export const Handler = Contract.Wrapper.implement(
  Common.wrapIamMethod({
    wrapper: Contract.Wrapper,
    mutatesSession: false,
  })((encodedPayload) => client.admin.banUser(encodedPayload))
);
