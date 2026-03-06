/**
 * @beep/schema
 *
 * @since 0.0.0
 */

import {
  isNegative as isNegativeInternal,
  isNonNegative as isNonNegativeInternal,
  isNonPositive as isNonPositiveInternal,
  isPositive as isPositiveInternal,
} from "./Number.js";

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
export * from "./Email.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./FilePath.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Int.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Logs.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MimeType.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export const isNegative = isNegativeInternal;
/**
 * @since 0.0.0
 * @category Validation
 */
export const isNonNegative = isNonNegativeInternal;
/**
 * @since 0.0.0
 * @category Validation
 */
export const isNonPositive = isNonPositiveInternal;
/**
 * @since 0.0.0
 * @category Validation
 */
export const isPositive = isPositiveInternal;
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Sha256.js";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./TaggedErrorClass.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Transformations.js";
