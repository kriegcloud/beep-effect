/**
 * Array utility types for `@beep/types`.
 *
 * @since 0.0.0
 * @packageDocumentation
 */

/**
 * Extracts the element type from a tuple or array type.
 *
 * @example
 * ```typescript
 * import type { TArray } from "@beep/types"
 *
 * type NumberElement = TArray.Elem<readonly [1, 2, 3]>
 * // 1 | 2 | 3
 *
 * type StringElement = TArray.Elem<string[]>
 * // string
 *
 * const elements: readonly [NumberElement, StringElement] = [1, "name"]
 * console.log(elements)
 * ```
 *
 * @since 0.0.0
 * @category utilities
 * @typeParam T - The type from which the element type will be inferred.
 */
export type Elem<T> = T extends readonly (infer U)[] ? U : never;
