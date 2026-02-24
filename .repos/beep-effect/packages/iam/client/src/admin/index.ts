/**
 * @fileoverview Admin namespace export.
 *
 * @module @beep/iam-client/admin
 * @category Admin
 * @since 0.1.0
 */

/**
 * Admin namespace providing user management and administration operations.
 *
 * Exposes handlers for managing users, roles, bans, and sessions as an admin.
 *
 * @example
 * ```typescript
 * import { Admin } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // List all users
 *   const result = yield* Admin.ListUsers.Handler({ limit: 20 })
 *   console.log(`Found ${result.total} users`)
 *
 *   // Ban a user
 *   yield* Admin.BanUser.Handler({
 *     userId: "shared_user__abc123",
 *     banReason: "Violation of terms"
 *   })
 * })
 * ```
 *
 * @category Admin
 * @since 0.1.0
 */
export * as Admin from "./mod.ts";
