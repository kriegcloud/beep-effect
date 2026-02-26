/**
 * Array-property filter primitives.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/ArrayFilter
 */
import type { Just } from "./Just.js";

interface ArrayFilterOptions<T> {
  $contains: T;
  $isNull: boolean;
}

/**
 * Array filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace ArrayFilter {
  /** @since 0.0.0 */
  export interface $contains<T> extends Just<"$contains", ArrayFilterOptions<T>> {}
  /** @since 0.0.0 */
  export interface $isNull<T> extends Just<"$isNull", ArrayFilterOptions<T>> {}
}

/**
 * Canonical array filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type ArrayFilter<T> = ArrayFilter.$contains<T> | ArrayFilter.$isNull<T>;
