/**
 * @since 0.0.0
 * @module @beep/types/TArray
 */

/**
 * Represents a utility type that extracts the type of an element from a tuple or an array.
 *
 * @since 0.0.0
 * @template T - The type from which the element type will be inferred.
 */
export type Elem<T> = T extends readonly (infer U)[] ? U : never;
