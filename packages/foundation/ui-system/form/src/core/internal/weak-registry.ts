/**
 * Small registry abstraction used by form atom caches.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { HashMap } from "effect";
import * as O from "effect/Option";

/**
 * String-keyed registry used to cache atom instances.
 *
 * @example
 * ```ts
 * import type { WeakRegistry } from "@beep/form/core/internal/weak-registry"
 *
 * type RegistryKeys = keyof WeakRegistry<{ readonly value: string }>
 * const key: RegistryKeys = "get"
 * console.log(key) // "get"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface WeakRegistry<V extends object> {
  readonly clear: () => void;
  readonly delete: (key: string) => boolean;
  readonly get: (key: string) => V | undefined;
  readonly set: (key: string, value: V) => void;
  readonly values: () => Iterable<V>;
}

/**
 * Creates an Effect collection-backed registry for atom caches.
 *
 * @example
 * ```ts
 * import { createWeakRegistry } from "@beep/form/core/internal/weak-registry"
 *
 * const registry = createWeakRegistry<{ readonly value: string }>()
 * registry.set("name", { value: "Ada" })
 * console.log(registry.get("name")?.value) // "Ada"
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export const createWeakRegistry = <V extends object>(): WeakRegistry<V> => {
  let map = HashMap.empty<string, V>();

  return {
    get: (key) => HashMap.get(map, key).pipe(O.getOrElse(() => undefined)),
    set: (key, value) => {
      map = HashMap.set(map, key, value);
    },
    delete: (key) => {
      const existed = HashMap.has(map, key);
      map = HashMap.remove(map, key);
      return existed;
    },
    clear: () => {
      map = HashMap.empty();
    },
    values: () => HashMap.values(map),
  };
};
