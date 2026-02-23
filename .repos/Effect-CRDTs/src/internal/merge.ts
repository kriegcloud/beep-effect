/**
 * Internal utilities for merging CRDT states.
 *
 * @since 0.1.0
 * @internal
 */

import { Array, pipe } from "effect"

/**
 * Merges two maps using a custom merge function for conflicting keys.
 *
 * Uses a declarative approach with Effect's Array operations to transform
 * map entries into the merged result.
 *
 * @internal
 */
export const mergeMaps = <K, V>(
  a: ReadonlyMap<K, V>,
  b: ReadonlyMap<K, V>,
  mergeFn: (x: V, y: V) => V
): Map<K, V> => {
  const result = new Map(a)

  pipe(
    Array.fromIterable(b.entries()),
    Array.forEach(([key, value]) => {
      const existing = result.get(key)
      result.set(key, existing !== undefined ? mergeFn(existing, value) : value)
    })
  )

  return result
}

/**
 * Merges two sets using union.
 *
 * Uses a declarative approach with Effect's Array operations to union
 * the sets.
 *
 * @internal
 */
export const mergeSets = <A>(a: ReadonlySet<A>, b: ReadonlySet<A>): Set<A> => {
  const result = new Set(a)

  pipe(
    Array.fromIterable(b),
    Array.forEach((item) => {
      result.add(item)
    })
  )

  return result
}
