/**
 * Array utility types for `@beep/types`.
 *
 * @since 0.0.0
 * @module
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
 * declare const elements: readonly [NumberElement, StringElement]
 * void elements
 * ```
 *
 * @since 0.0.0
 * @category utilities
 * @template T - The type from which the element type will be inferred.
 */
export type Elem<T> = T extends readonly (infer U)[] ? U : never;
