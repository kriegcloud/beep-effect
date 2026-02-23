/**
 * @fileoverview Passkey namespace export.
 *
 * @module @beep/iam-client/passkey
 * @category Passkey
 * @since 0.1.0
 */

/**
 * Passkey namespace providing WebAuthn passkey management operations.
 *
 * Exposes handlers for adding, listing, updating, and deleting passkeys.
 *
 * @example
 * ```typescript
 * import { Passkey } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // List all passkeys
 *   const passkeys = yield* Passkey.ListUserPasskeys.Handler
 *   console.log(`Found ${passkeys.length} passkeys`)
 *
 *   // Add a new passkey
 *   const newPasskey = yield* Passkey.AddPasskey.Handler({
 *     name: "My Laptop"
 *   })
 * })
 * ```
 *
 * @category Passkey
 * @since 0.1.0
 */
export * as Passkey from "./mod.ts";
