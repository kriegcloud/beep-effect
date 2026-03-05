/**
 * @beep/schema
 *
 * @since 0.0.0
 */

/**
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./LiteralKit.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MappedLiteralKit.js";

// bench

/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./ArrayOf.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./CommonTextSchemas.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MimeType.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Number.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Transformations.js";
