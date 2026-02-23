/**
 * @fileoverview Connections namespace export.
 *
 * @module @beep/iam-client/Connections
 * @category Connections
 * @since 0.1.0
 */

/**
 * Connections namespace providing Connections provider operations.
 *
 * Exposes handlers for managing Connections clients, consents, and authorization flows.
 *
 * @example
 * ```typescript
 * import { Connections } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Register a new Connections client
 *   const client = yield* Connections.Register.Handler({
 *     name: "My Application",
 *     redirectURLs: ["https://myapp.com/callback"]
 *   })
 *   console.log(`Client ID: ${client.clientId}`)
 * })
 * ```
 *
 * @category Connections
 * @since 0.1.0
 */
export * as Connections from "./mod.ts";
