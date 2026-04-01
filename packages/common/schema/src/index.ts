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
} from "./Number.ts";

/**
 * @since 0.0.0
 * @category Configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./LiteralKit.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MappedLiteralKit.ts";

// bench

/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./ArrayOf.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./CommonTextSchemas.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./color/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./csv.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Email.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./FileExtension.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./FilePath.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Glob.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Graph.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Int.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Jsonc.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Logs.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MimeType.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MutableHashMap.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./MutableHashSet.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./PosixPath.ts";
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
export * from "./AbortSignal.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./BigDecimal.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./BufferEncoding.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./blockchain/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Duration.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./dom/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Fn.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./http/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Json.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./LocalDate.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./location/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * as Model from "./Model.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Primitive.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./person/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./RegExp.ts";
/**
 * @since 0.0.0
 * @category Utility
 */
export * as SchemaUtils from "./SchemaUtils/index.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./SemanticVersion.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./SeverityLevel.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Sha256.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Slug.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./StatusCauseError.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./String.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./TaggedErrorClass.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * as Thunk from "./Thunk.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Timezone.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Transformations.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./URL.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * as VariantSchema from "./VariantSchema.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Xml.ts";
/**
 * @since 0.0.0
 * @category Validation
 */
export * from "./Yaml.ts";
