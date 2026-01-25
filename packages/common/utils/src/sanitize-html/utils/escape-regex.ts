/**
 * Regex escaping utility for sanitize-html
 *
 * @since 0.1.0
 * @module
 */

import * as Str from "effect/String";

/**
 * Characters that have special meaning in regular expressions
 * and need to be escaped when used as literal characters.
 *
 * @since 0.1.0
 * @category constants
 */
const SPECIAL_CHARS = /[\\^$.*+?()[\]{}|]/g;

/**
 * Escapes special regex characters in a string so it can be used
 * as a literal pattern in a RegExp.
 *
 * @example
 * ```typescript
 * import { escapeRegex } from "@beep/utils/sanitize-html/utils/escape-regex"
 *
 * const pattern = escapeRegex("foo.bar")
 * // pattern is "foo\\.bar"
 *
 * const regex = new RegExp(pattern)
 * regex.test("foo.bar") // true
 * regex.test("fooXbar") // false
 * ```
 *
 * @since 0.1.0
 * @category utils
 */
export const escapeRegex = (str: string): string => Str.replace(SPECIAL_CHARS, "\\$&")(str);
