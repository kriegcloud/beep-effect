/**
 * Numeric-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/NumberFilter
 */
import type { BaseFilterOptions } from "./BaseFilter.js";
import type { Just } from "./Just.js";

interface NumberFilterOptions extends BaseFilterOptions<number> {
  $gt: number;
  $gte: number;
  $lt: number;
  $lte: number;
}

/**
 * Number filter discriminators.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export declare namespace NumberFilter {
  /** @since 0.0.0 */
  export interface $eq extends Just<"$eq", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $ne extends Just<"$ne", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $isNull extends Just<"$isNull", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $gt extends Just<"$gt", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $gte extends Just<"$gte", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $lt extends Just<"$lt", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $lte extends Just<"$lte", NumberFilterOptions> {}
  /** @since 0.0.0 */
  export interface $in extends Just<"$in", NumberFilterOptions> {}
}

/**
 * Canonical number filter union.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type NumberFilter =
  | number
  | NumberFilter.$eq
  | NumberFilter.$ne
  | NumberFilter.$isNull
  | NumberFilter.$in
  | NumberFilter.$gt
  | NumberFilter.$gte
  | NumberFilter.$lt
  | NumberFilter.$lte;
