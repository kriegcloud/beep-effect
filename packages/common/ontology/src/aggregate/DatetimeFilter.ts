/**
 * Datetime/timestamp-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/DatetimeFilter
 */
import type { BaseFilterOptions } from "./BaseFilter.js";
import type { Just } from "./Just.js";
/**
 * Datetime filter option surface.
 *
 * @since 0.0.0
 * @category models
 */
export interface DatetimeFilterOptions extends BaseFilterOptions<string> {
  $gt: string;
  $gte: string;
  $lt: string;
  $lte: string;
}

/**
 * Datetime filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace DatetimeFilter {
  /** @since 0.0.0 */
  export interface $eq extends Just<"$eq", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $ne extends Just<"$ne", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $isNull extends Just<"$isNull", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $gt extends Just<"$gt", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $gte extends Just<"$gte", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $lt extends Just<"$lt", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $lte extends Just<"$lte", DatetimeFilterOptions> {}
  /** @since 0.0.0 */
  export interface $in extends Just<"$in", DatetimeFilterOptions> {}
}

/**
 * Canonical datetime filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type DatetimeFilter =
  | string
  | DatetimeFilter.$eq
  | DatetimeFilter.$ne
  | DatetimeFilter.$isNull
  | DatetimeFilter.$in
  | DatetimeFilter.$gt
  | DatetimeFilter.$gte
  | DatetimeFilter.$lt
  | DatetimeFilter.$lte;
