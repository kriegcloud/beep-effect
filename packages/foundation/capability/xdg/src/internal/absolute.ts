/**
 * The absolute-path predicates and schemas the XDG reads share.
 *
 * **Details**
 *
 * Two meanings of "absolute" live here, built from the same two patterns so
 * they cannot drift apart. The `$XDG_*` variables admit only a POSIX path, the
 * one form the spec defines, which is {@link AbsolutePosixPath}. `$HOME` (in
 * `Xdg.layer`) and the `AppDirs` overrides can name a Windows directory, so
 * they take {@link AbsolutePath}: a POSIX root, a drive root or a UNC share.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $XdgId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $XdgId.create("internal/absolute");

const posixAbsolute = /^\//;

const win32Absolute = /^(?:[A-Za-z]:[\\/]|[\\/]{2})/;

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
export const isAbsolutePosix = (value: string): boolean => posixAbsolute.test(value);

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

/**
 * The absolute-path pattern of either platform: a POSIX root, a drive root or a UNC share.
 *
 * **Details**
 *
 * The alternation of the two patterns behind {@link isAbsolutePosix} and
 * {@link isAbsoluteWin32}, built from their sources, as a pattern so a schema
 * check built on it also drives arbitrary generation.
 *
 * **Example** (Check values of either platform)
 *
 * ```ts
 * import { absolutePathPattern } from "@beep/xdg/internal/absolute";
 *
 * console.log(absolutePathPattern.test("/home/ada"), absolutePathPattern.test("D:/data")); // true true
 * console.log(absolutePathPattern.test("relative")); // false
 * ```
 *
 * @category predicates
 * @since 0.0.0
 */
export const absolutePathPattern: RegExp = new RegExp(`${posixAbsolute.source}|${win32Absolute.source}`);

/**
 * An absolute POSIX path: the form an `$XDG_*` value must take to count.
 *
 * **Example** (Validate an XDG value)
 *
 * ```ts
 * import { AbsolutePosixPath } from "@beep/xdg/internal/absolute";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(AbsolutePosixPath)("/var/state"), S.is(AbsolutePosixPath)("C:\\state")); // true false
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AbsolutePosixPath = S.String.check(
  S.isPattern(
    posixAbsolute,
    $I.annote("AbsolutePosixPathCheck", {
      description: "An XDG base directory value is an absolute POSIX path.",
      message: "Expected an absolute path",
    })
  )
).pipe($I.annoteSchema("AbsolutePosixPath", { description: "An absolute POSIX path." }));

/**
 * An absolute path of either platform: what `$HOME` in `Xdg.layer` and an `AppDirs` override must be.
 *
 * **Example** (Validate a HOME or an override)
 *
 * ```ts
 * import { AbsolutePath } from "@beep/xdg/internal/absolute";
 * import * as S from "effect/Schema";
 *
 * console.log(S.is(AbsolutePath)("/home/ada"), S.is(AbsolutePath)("\\\\server\\share")); // true true
 * console.log(S.is(AbsolutePath)("relative")); // false
 * ```
 *
 * @category schemas
 * @since 0.0.0
 */
export const AbsolutePath = S.String.check(
  S.isPattern(
    absolutePathPattern,
    $I.annote("AbsolutePathCheck", {
      description: "An absolute POSIX path, a Windows drive root or a UNC share.",
      message: "Expected an absolute path",
    })
  )
).pipe($I.annoteSchema("AbsolutePath", { description: "An absolute path of either platform." }));
