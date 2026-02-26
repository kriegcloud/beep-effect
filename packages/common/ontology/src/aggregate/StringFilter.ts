/**
 * String-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/StringFilter
 */
import type { BaseFilterOptions } from "./BaseFilter.js";
import type { Just } from "./Just.js";

interface StringFilterOptions extends BaseFilterOptions<string> {
  $startsWith: string;
  $containsAllTermsInOrder: string;
  $containsAnyTerm: string | { term: string; fuzzySearch?: boolean };
  $containsAllTerms: string | { term: string; fuzzySearch?: boolean };
  /**
   * Matches any of the provided values. If an empty array is provided, the filter will match all objects.
   */
  $in: ReadonlyArray<string>;
}

/**
 * String filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace StringFilter {
  /** @since 0.0.0 */
  export interface $eq extends Just<"$eq", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $ne extends Just<"$ne", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $isNull extends Just<"$isNull", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $startsWith extends Just<"$startsWith", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $containsAllTermsInOrder extends Just<"$containsAllTermsInOrder", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $containsAnyTerm extends Just<"$containsAnyTerm", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $containsAllTerms extends Just<"$containsAllTerms", StringFilterOptions> {}
  /** @since 0.0.0 */
  export interface $in extends Just<"$in", StringFilterOptions> {}
}

/**
 * Canonical string filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type StringFilter =
  | string
  | StringFilter.$eq
  | StringFilter.$ne
  | StringFilter.$isNull
  | StringFilter.$in
  | StringFilter.$startsWith
  | StringFilter.$containsAllTermsInOrder
  | StringFilter.$containsAnyTerm
  | StringFilter.$containsAllTerms;
