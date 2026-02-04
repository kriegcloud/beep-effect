/**
 * Client Identity Management
 *
 * Manages persistent client identity for event sync.
 * Stores identity in localStorage to persist across sessions.
 *
 * Identity includes:
 * - publicKey: Unique client identifier (UUID)
 * - privateKey: Encryption key for secure sync (Redacted)
 *
 * @since 1.0.0
 * @module services/IdentityClient
 */

import * as EventLog from "@effect/experimental/EventLog"
import * as BrowserKeyValueStore from "@effect/platform-browser/BrowserKeyValueStore"
import { Effect, Layer } from "effect"

/**
 * Identity tag from @effect/experimental
 */
export const Identity = EventLog.Identity

/**
 * Layer that provides a persistent Identity using localStorage
 *
 * The identity is generated once and stored persistently.
 * Subsequent loads retrieve the same identity.
 *
 * @example
 * ```ts
 * const layer = IdentityLayer
 * // Stores identity at localStorage key: effect-ontology-identity
 * ```
 *
 * @since 1.0.0
 */
export const IdentityLayer = EventLog.layerIdentityKvs({
  key: "effect-ontology-identity"
}).pipe(Layer.provide(BrowserKeyValueStore.layerLocalStorage))

/**
 * Get the current identity from context
 *
 * @since 1.0.0
 */
export const getIdentity = Identity

/**
 * Generate a random identity (for testing or reset)
 *
 * @since 1.0.0
 */
export const makeRandomIdentity = () => Effect.sync(() => Identity.makeRandom())

/**
 * Clear the stored identity
 *
 * After clearing, the next session will generate a new identity.
 * This effectively creates a "new" client from the server's perspective.
 *
 * @since 1.0.0
 */
export const clearIdentity = () =>
  Effect.sync(() => {
    localStorage.removeItem("effect-ontology-identity")
  })

/**
 * Get the current identity as a string (for debugging)
 *
 * @since 1.0.0
 */
export const identityToString = (identity: typeof Identity.Service) =>
  `Identity(publicKey=${identity.publicKey}, privateKey=<redacted>)`

/**
 * Check if an identity exists in storage
 *
 * @since 1.0.0
 */
export const hasStoredIdentity = () => Effect.sync(() => localStorage.getItem("effect-ontology-identity") !== null)
