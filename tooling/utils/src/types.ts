/**
 * Type alias for `any` used to explicitly mark unsafe type boundaries.
 *
 * Use this when interacting with untyped external libraries or when
 * type safety must be temporarily bypassed. Prefer narrowing to a
 * safe type as soon as possible.
 *
 * @example
 * ```typescript
 * import type { UnsafeAny } from "@beep/tooling-utils"
 *
 * // Type annotation for untyped library results
 * const untypedResult: UnsafeAny = JSON.parse('{"key": "value"}')
 * console.log(untypedResult.key) // No type error, but be careful!
 * ```
 *
 * @category Types
 * @since 0.1.0
 */
// biome-ignore lint/suspicious/noExplicitAny: intentional unsafe escape hatch type
export type UnsafeAny = any;
