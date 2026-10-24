/**
 * The absolute-path predicates the XDG reads share.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Str from "effect/String";

/**
 * Whether a value is an absolute POSIX path, the only form the XDG spec admits.
 *
 * **Details**
 *
 * Checks the first character only: no trimming, no normalization. A value
 * with leading whitespace is relative, as it is to `systemd-path`.
 *
 * **Example** (Check XDG values)
 *
 * ```ts
 * import { isAbsolutePosix } from "@beep/xdg/internal/absolute";
 *
 * console.log(isAbsolutePosix("/home/ada"), isAbsolutePosix(" /home/ada")); // true false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isAbsolutePosix: (value: string) => boolean = Str.startsWith("/");

const win32Absolute = /^(?:[A-Za-z]:[\\/]|[\\/]{2})/;

/**
 * Whether a value is an absolute Windows path: a drive root or a UNC share.
 *
 * **Example** (Check Windows values)
 *
 * ```ts
 * import { isAbsoluteWin32 } from "@beep/xdg/internal/absolute";
 *
 * console.log(isAbsoluteWin32("C:\\Users\\ada"), isAbsoluteWin32("Users\\ada")); // true false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const isAbsoluteWin32 = (value: string): boolean => win32Absolute.test(value);
