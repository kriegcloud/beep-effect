/**
 * Entry point that mirrors the legacy `@beep/schema/schema` barrel.
 *
 * Provides a compatibility surface while downstream packages finish migrating to the new namespace structure.
 *
 * @example
 * import { BS } from "@beep/schema";
 *
 * const emailSchema = BS.Email;
 *
 * @category Surface
 * @since 0.1.0
 */
/**
 * Re-exports core schema helpers and base annotations.
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./builders";
/**
 * Re-exports foundational schema utilities, annotations, and variance tokens.
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./core";
/**
 * Re-exports derived kits and helpers built on top of primitives.
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./derived";

/**
 * Re-exports identity helpers for schema annotations.
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./identity";
/**
 * Re-exports third-party integration schemas (HTTP, SQL, config).
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./integrations";
/**
 * Re-exports primitive schemas (string, number, temporal, etc.).
 *
 * @category Surface
 * @since 0.1.0
 */
export * from "./primitives";
