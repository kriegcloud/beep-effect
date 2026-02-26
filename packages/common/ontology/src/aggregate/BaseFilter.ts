/**
 * Shared base filter primitives used by aggregate where-clause types.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/BaseFilter
 */
import type { Just } from "./Just.js";

type EqFilterOption<T> = {
  $eq: T;
};

/**
 * Base equality-only discriminator namespace.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace EqFilter {
  /**
   * Equality filter.
   */
  /** @since 0.0.0 */
  export interface $eq<T> extends Just<"$eq", EqFilterOption<T>> {}
}

/**
 * Canonical base filter option surface.
 *
 * @since 0.0.0
 * @category models
 */
export interface BaseFilterOptions<T> extends EqFilterOption<T> {
  $ne: T;
  $isNull: boolean;
  /**
   * Matches any of the provided values. If an empty array is provided, the filter will match all objects.
   */
  $in: ReadonlyArray<T>;
}

/**
 * Base filter discriminators.
 *
 * @since 0.0.0
 * @category models
 */
export declare namespace BaseFilter {
  /** @since 0.0.0 */
  export interface $eq<T> extends Just<"$eq", BaseFilterOptions<T>> {}
  /** @since 0.0.0 */
  export interface $ne<T> extends Just<"$ne", BaseFilterOptions<T>> {}
  /** @since 0.0.0 */
  export interface $in<T> extends Just<"$in", BaseFilterOptions<T>> {}
  /** @since 0.0.0 */
  export interface $isNull<T> extends Just<"$isNull", BaseFilterOptions<T>> {}
}

/**
 * Canonical base filter union.
 *
 * @since 0.0.0
 * @category models
 */
export type BaseFilter<T> = BaseFilter.$eq<T> | BaseFilter.$ne<T> | BaseFilter.$in<T> | BaseFilter.$isNull<T>;

/** @internal */
export type CatchThemAll<T> = CatchThemAllInternal<T, keyof T>;

// `extends` forces distribution over unions.
/** @internal */
type CatchThemAllInternal<T, K extends keyof T> = K extends keyof T ? { [X in K]: T[X] } : never;
