/**
 * Primitive schemas (strings, numbers, binary, locale, etc.).
 *
 * Maintains a stable import target for primitives while schema finalizes each bundle.
 *
 * @example
 * import * as SchemaPrimitives from "@beep/schema/primitives";
 *
 * const emailSchema = SchemaPrimitives.Email;
 *
 * @category Surface/Primitives
 * @since 0.1.0
 *
 */

/**
 * Array helpers (comma-separated transforms, number lists, etc.).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./array";
/**
 * ArrayBuffer schema helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./array-buffer";

/**
 * Boolean schemas with defaults and refinements.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./bool";
export * from "./buffer";
/**
 * Duration schemas and tagged representations.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./duration";
export * from "./effect";
/**
 * Function type schemas and guards.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./function";
/**
 * Geographic primitive schemas (latitude/longitude, coordinates).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./geo";
/**
 * Graph schemas for Effect's Graph module (nodes, edges, directed/undirected graphs).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./graph";
/**
 * JSON-safe schema helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./json";
/**
 * Locale and language code schemas.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./locales";
export * from "./mutable-hash-map";
/**
 * Network protocol primitives (IP, hostnames).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./network";
/**
 * Numeric schemas and branded number helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./number";
/**
 * Person-related primitives (names, person identifiers).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./person";
/**
 * Regular expression schemas and helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./regex";
/**
 * String schemas (email, slug, password, etc.).
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./string";
/**
 * Temporal schemas for dates, times, and durations.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./temporal";
/**
 * URL schemas and helpers.
 *
 * @category Surface/Primitives
 * @since 0.1.0
 */
export * from "./url";
