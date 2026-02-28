/**
 * Boolean-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/BooleanFilter
 */
import type { BaseFilterOptions } from "./BaseFilter.js";
import type { Just } from "./Just.js";

interface BooleanFilterOptions extends BaseFilterOptions<boolean> {}

/**
 * Boolean filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace BooleanFilter {
  /** @since 0.0.0 */
  export interface $eq extends Just<"$eq", BooleanFilterOptions> {}
  /** @since 0.0.0 */
  export interface $ne extends Just<"$ne", BooleanFilterOptions> {}
  /** @since 0.0.0 */
  export interface $isNull extends Just<"$isNull", BooleanFilterOptions> {}
  /**
   * Matches any of the provided values. If an empty array is provided, the filter will match all objects.
   */
  /** @since 0.0.0 */
  export interface $in extends Just<"$in", BooleanFilterOptions> {}
}

/**
 * Canonical boolean filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type BooleanFilter = boolean | BooleanFilter.$eq | BooleanFilter.$ne | BooleanFilter.$in | BooleanFilter.$isNull;
