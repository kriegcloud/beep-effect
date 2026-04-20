/**
 * A module containing a utility to check if a key is equal to one of the
 * blocked prototype keys
 *
 * @since 0.0.0
 * @module \@beep/utils/isBlockedObjectKey
 */
import { HashSet } from "effect";

const BlockedObjectKeys = HashSet.make("__proto__", "prototype", "constructor");

/**
 * Returns `true` when `key` is a blocked prototype key (`__proto__`,
 * `prototype`, or `constructor`).
 *
 * Useful for sanitizing user-provided object keys to prevent prototype
 * pollution attacks.
 *
 * @example
 * ```ts
 * import { isBlockedObjectKey } from "@beep/utils/isBlockedObjectKey"
 *
 * const safe = isBlockedObjectKey("name")
 * // false
 *
 * const blocked = isBlockedObjectKey("__proto__")
 * // true
 *
 * void safe
 * void blocked
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isBlockedObjectKey = (key: string) => HashSet.has(BlockedObjectKeys, key);
