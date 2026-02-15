/**
 * @fileoverview OAuth2 namespace export.
 *
 * @module @beep/iam-client/oauth2
 * @category OAuth2
 * @since 0.1.0
 */

/**
 * OAuth2 namespace providing OAuth2 provider operations.
 *
 * Exposes handlers for managing OAuth2 clients, consents, and authorization flows.
 *
 * @example
 * ```typescript
 * import { OAuth2 } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Register a new OAuth2 client
 *   const client = yield* OAuth2.Register.Handler({
 *     name: "My Application",
 *     redirectURLs: ["https://myapp.com/callback"]
 *   })
 *   console.log(`Client ID: ${client.clientId}`)
 * })
 * ```
 *
 * @category OAuth2
 * @since 0.1.0
 */
export * as OAuth2 from "./mod.ts";
