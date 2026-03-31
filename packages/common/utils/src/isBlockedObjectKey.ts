/**
 * A module containing a utility to check if a key is equal to one of the
 * blocked prototype keys
 *
 * @since 0.0.0
 * @module @beep/utils/isBlockedObjectKey
 */
import { HashSet } from "effect";

const BlockedObjectKeys = HashSet.make("__proto__", "prototype", "constructor");

/**
 * isBlockedObjectKey - check if a key is equal to one of the
 * blocked prototype keys
 *
 * @since 0.0.0
 * @category Utility
 */
export const isBlockedObjectKey = (key: string) => HashSet.has(BlockedObjectKeys, key);
