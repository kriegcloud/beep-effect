/**
 * @fileoverview OAuth2 module re-exports.
 *
 * @module @beep/iam-client/oauth2/mod
 * @category OAuth2
 * @since 0.1.0
 */

/**
 * Re-exports Consent feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { Consent } from "./consent";

/**
 * Re-exports Continue feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { Continue } from "./continue";

/**
 * Re-exports DeleteClient feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { DeleteClient } from "./delete-client";

/**
 * Re-exports DeleteConsent feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { DeleteConsent } from "./delete-consent";

/**
 * Re-exports GetClient feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { GetClient } from "./get-client";

/**
 * Re-exports GetClients feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { GetClients } from "./get-clients";

/**
 * Re-exports GetConsent feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { GetConsent } from "./get-consent";

/**
 * Re-exports GetConsents feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { GetConsents } from "./get-consents";

/**
 * Re-exports WrapperGroup and composed Layer for OAuth2 handlers.
 *
 * @example
 * ```typescript
 * import { OAuth2 } from "@beep/iam-client"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // OAuth2 handlers available via dependency injection
 * }).pipe(Effect.provide(OAuth2.layer))
 * ```
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { Group, layer } from "./layer";

/**
 * Re-exports Link feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { Link } from "./link";

/**
 * Re-exports PublicClient feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { PublicClient } from "./public-client";

/**
 * Re-exports Register feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { Register } from "./register";

/**
 * Re-exports RotateSecret feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { RotateSecret } from "./rotate-secret";

/**
 * Re-exports UpdateClient feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { UpdateClient } from "./update-client";

/**
 * Re-exports UpdateConsent feature namespace.
 *
 * @category OAuth2/Exports
 * @since 0.1.0
 */
export { UpdateConsent } from "./update-consent";
