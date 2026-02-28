/**
 * Utility type for filtering object keys by value compatibility.
 *
 * @since 0.0.0
 * @module @beep/ontology/util/IncludeValuesExtending
 */

/**
 * Include only members from `T` whose value type extends `M`.
 *
 * @since 0.0.0
 * @category models
 */
export type IncludeValuesExtending<T extends Record<PropertyKey, unknown>, M> = {
  [K in keyof T as T[K] extends M ? K : never]: T[K];
};
