/**
 * Strips `readonly` modifiers from every property.
 *
 * Helpful in tests where you need to mutate fixtures that originate from
 * readonly schemas.
 *
 * @example
 * import type { Mutable } from "@beep/types/mut.types";
 *
 * type Editable = Mutable<{ readonly id: string }>;
 * let example!: Editable;
 * void example;
 *
 * @category Types/Mutation
 * @since 0.1.0
 */
export type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

/**
 * Recursively removes `readonly` modifiers from nested structures.
 *
 * Applies {@link Mutable} depth-first so nested arrays, objects, and tuples
 * become editable.
 *
 * @example
 * import type { DeepMutable } from "@beep/types/mut.types";
 *
 * type Editable = DeepMutable<{
 *   readonly id: string;
 *   readonly meta: { readonly tags: readonly string[] };
 * }>;
 * let example!: Editable;
 * void example;
 *
 * @category Types/Mutation
 * @since 0.1.0
 */
export type DeepMutable<T> = T extends (...args: ReadonlyArray<unknown>) => unknown
  ? T
  : T extends ReadonlyArray<infer Item>
    ? Array<DeepMutable<Item>>
    : T extends object
      ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
      : T;
