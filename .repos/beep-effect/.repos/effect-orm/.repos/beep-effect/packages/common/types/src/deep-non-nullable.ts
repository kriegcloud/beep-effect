/**
 * Deep non-nullable type transformation utilities.
 *
 * @example
 * import type { DeepNonNullable } from "@beep/types/deep-non-nullable.types";
 *
 * type T = DeepNonNullable<{ a: string | null }>;
 * let example!: T;
 * void example;
 *
 * @category Types/Utilities
 * @since 0.1.0
 */
import type { Builtin } from "./built-in";

/**
 * Recursively removes `null` and `undefined` from all properties of a type.
 *
 * Unlike the built-in `NonNullable<T>` which only operates on the top level,
 * this utility traverses nested objects, Maps, Sets, and Promises to ensure
 * all nested properties are also non-nullable. Built-in types are handled
 * as leaf nodes using {@link Builtin}.
 *
 * @example
 * import type { DeepNonNullable } from "@beep/types/deep-non-nullable.types";
 *
 * interface User {
 *   name: string | null
 *   address: {
 *     city: string | undefined
 *     zip: number | null
 *   } | null
 * }
 *
 * type RequiredUser = DeepNonNullable<User>
 * // {
 * //   name: string
 * //   address: {
 * //     city: string
 * //     zip: number
 * //   }
 * // }
 * let example!: RequiredUser;
 * void example;
 *
 * @category Types/Utilities
 * @since 0.1.0
 */
export type DeepNonNullable<Type> = Type extends Builtin
  ? NonNullable<Type>
  : Type extends Map<infer Keys, infer Values>
    ? Map<DeepNonNullable<Keys>, DeepNonNullable<Values>>
    : Type extends ReadonlyMap<infer Keys, infer Values>
      ? ReadonlyMap<DeepNonNullable<Keys>, DeepNonNullable<Values>>
      : Type extends WeakMap<infer Keys, infer Values>
        ? WeakMap<DeepNonNullable<Keys>, DeepNonNullable<Values>>
        : Type extends Set<infer Values>
          ? Set<DeepNonNullable<Values>>
          : Type extends ReadonlySet<infer Values>
            ? ReadonlySet<DeepNonNullable<Values>>
            : Type extends WeakSet<infer Values>
              ? WeakSet<DeepNonNullable<Values>>
              : Type extends Promise<infer Values>
                ? Promise<DeepNonNullable<Values>>
                : Type extends {}
                  ? {
                      [Key in keyof Type]: DeepNonNullable<Type[Key]>;
                    }
                  : NonNullable<Type>;
