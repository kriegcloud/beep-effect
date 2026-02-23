/**
 * @since 0.1.0
 */

import * as Str from "effect/String";

/**
 * Generates a random hexadecimal string of the specified length.
 *
 * @example
 * ```typescript
 * import { randomHexString } from "@beep/utils"
 *
 * const hex = randomHexString(16)
 * console.log(hex)
 * // => "a3f9c2e4b8d1f0c5"
 * ```
 *
 * @category utilities
 * @since 0.1.0
 */
export const randomHexString = (() => {
  const characters = "abcdef0123456789";
  const charactersLength = Str.length(characters);
  return (length: number) => {
    let result = Str.empty;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };
})();
