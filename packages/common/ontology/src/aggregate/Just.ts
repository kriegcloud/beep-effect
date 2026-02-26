/**
 * Exclusive-option type helpers for aggregate filters.
 *
 * @since 0.0.0
 * @module @beep/ontology/aggregate/Just
 */

/**
 * Select exactly one key from a filter option map and force all others to `never`.
 *
 * @since 0.0.0
 * @category models
 */
export type Just<Z extends keyof V, V> = {
  [K in Z]: V[K];
} & {
  [K in keyof V as K extends Z ? never : K]?: never;
};

/**
 * Mark a set of keys as forbidden on a type surface.
 *
 * @since 0.0.0
 * @category models
 */
export type NeverThese<V extends string | symbol | number> = {
  [K in V]?: never;
};
