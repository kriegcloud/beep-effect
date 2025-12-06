/**
 * Built-in type definitions for recursive type transformations.
 *
 * @example
 * import type { Builtin } from "@beep/types/built-in.types";
 *
 * type Check<T> = T extends Builtin ? T : { [K in keyof T]: Check<T[K]> };
 * type Result = Check<Date>;
 * let example!: Result;
 * void example;
 *
 * @category Types/Primitives
 * @since 0.1.0
 */
import type { PrimitiveTypes } from "./primitive.types.ts";

/**
 * Union of all JavaScript built-in types that should be treated as leaf nodes
 * in recursive type transformations.
 *
 * Extends {@link PrimitiveTypes} with common built-in object types (Function,
 * Date, Error, RegExp) that typically should not be recursively traversed
 * when applying deep type transformations.
 *
 * @example
 * import type { Builtin } from "@beep/types/built-in.types";
 *
 * // Used as a base case in recursive type utilities
 * type DeepTransform<T> = T extends Builtin
 *   ? T // Stop recursion for built-in types
 *   : { [K in keyof T]: DeepTransform<T[K]> }
 *
 * // Builtin types pass through unchanged
 * type A = DeepTransform<Date>
 * type B = DeepTransform<RegExp>
 * let exampleA!: A;
 * let exampleB!: B;
 * void exampleA;
 * void exampleB;
 *
 * @category Types/Primitives
 * @since 0.1.0
 */
export type Builtin = PrimitiveTypes | Function | Date | Error | RegExp;
