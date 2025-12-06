/**
 * JavaScript primitive type utilities.
 *
 * @example
 * import type { PrimitiveTypes } from "@beep/types/primitive.types";
 *
 * const check = (v: unknown): v is PrimitiveTypes =>
 *   v === null || (typeof v !== "object" && typeof v !== "function");
 * void check;
 *
 * @category Types/Primitives
 * @since 0.1.0
 */

/**
 * Union of all JavaScript primitive types.
 *
 * Represents the seven primitive data types in JavaScript: string, number,
 * boolean, bigint, symbol, undefined, and null. Useful for type guards and
 * conditional types that need to distinguish primitives from objects.
 *
 * @example
 * import type { PrimitiveTypes } from "@beep/types/primitive.types";
 *
 * function isPrimitive(value: unknown): value is PrimitiveTypes {
 *   return value === null || (typeof value !== "object" && typeof value !== "function")
 * }
 *
 * isPrimitive("hello") // true
 * isPrimitive({}) // false
 *
 * @category Types/Primitives
 * @since 0.1.0
 */
export type PrimitiveTypes = string | number | boolean | bigint | symbol | undefined | null;
