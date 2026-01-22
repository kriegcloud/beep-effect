/**
 * @fileoverview Passkey module re-exports.
 *
 * @module @beep/iam-client/passkey/mod
 * @category Passkey
 * @since 0.1.0
 */

/**
 * Re-exports AddPasskey feature namespace.
 *
 * @category Passkey/Exports
 * @since 0.1.0
 */
export { AddPasskey } from "./add-passkey";

/**
 * Re-exports DeletePasskey feature namespace.
 *
 * @category Passkey/Exports
 * @since 0.1.0
 */
export { DeletePasskey } from "./delete-passkey";

/**
 * Re-exports WrapperGroup and composed Layer for passkey handlers.
 *
 * @example
 * ```typescript
 * import { Passkey } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Passkey handlers available via dependency injection
 * }).pipe(Effect.provide(Passkey.layer))
 * ```
 *
 * @category Passkey/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports ListUserPasskeys feature namespace.
 *
 * @category Passkey/Exports
 * @since 0.1.0
 */
export { ListUserPasskeys } from "./list-user-passkeys";

/**
 * Re-exports UpdatePasskey feature namespace.
 *
 * @category Passkey/Exports
 * @since 0.1.0
 */
export { UpdatePasskey } from "./update-passkey";
