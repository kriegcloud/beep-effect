import * as A from "effect/Array";
import { pipe } from "effect/Function";
import * as Str from "effect/String";

// A lone surrogate makes `encodeURIComponent` throw, so it becomes U+FFFD first.
const LONE_SURROGATE = /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;
/** One code point outside printable ASCII; `encodeForOsc8` tests the string one code point at a time. */
const NON_PRINTABLE_ASCII = /[^\x20-\x7e]/u;

/**
 * A Windows drive path (`C:\x`, `C:/x`): absolute whatever the `Path` flavour, so never resolved against a directory.
 *
 * **Details**
 *
 * The one false positive is a relative POSIX path whose first directory is a single letter followed by a colon, such
 * as `a:/b.txt`, which reads as drive `a`. Such a filename is vanishingly rare, and recognising a drive is what makes
 * `C:\x` work on a POSIX `Path`, where it is otherwise a relative filename. A colon anywhere else (`/a/C:b`,
 * `./C:x`, `src/C:/x.ts`) is data and stays encoded.
 *
 * **Example** (Recognize a Windows drive path)
 *
 * ```ts
 * import { DRIVE } from "@beep/cli-kit/internal/linkTarget"
 *
 * console.log(DRIVE.test("C:/src/main.ts")) // true
 * console.log(DRIVE.test("./src/main.ts")) // false
 * ```
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const DRIVE = /^[A-Za-z]:[\\/]/;

/**
 * A UNC path (`\\server\share\a.ts`, `//server/share/a.ts`): neither a drive nor a path on this machine, so it has no
 * link target. Left to a POSIX `Path` it would be read as a relative filename and linked to a file that does not exist.
 *
 * **Example** (Recognize a network share path)
 *
 * ```ts
 * import { UNC } from "@beep/cli-kit/internal/linkTarget"
 *
 * console.log(UNC.test("//server/share/main.ts")) // true
 * ```
 *
 * @internal
 * @category constants
 * @since 0.0.0
 */
export const UNC = /^(?:\\\\|\/\/)/;

/**
 * RFC 3986: everything but the unreserved characters is percent-encoded, in each segment, and `/` is kept.
 *
 * **Example** (Encode spaces while keeping separators)
 *
 * ```ts
 * import { encodePath } from "@beep/cli-kit/internal/linkTarget"
 *
 * console.log(encodePath("/my project/main.ts")) // /my%20project/main.ts
 * ```
 *
 * @internal
 * @category encoding
 * @since 0.0.0
 */
export const encodePath = (path: string): string =>
  pipe(
    path,
    Str.replace(LONE_SURROGATE, "�"),
    Str.split("/"),
    A.map((segment) =>
      // The RFC 3986 sub-delims encodeURIComponent leaves bare, as their upper-case percent escapes.
      pipe(
        encodeURIComponent(segment),
        Str.replace(/!/g, "%21"),
        Str.replace(/'/g, "%27"),
        Str.replace(/\(/g, "%28"),
        Str.replace(/\)/g, "%29"),
        Str.replace(/\*/g, "%2A")
      )
    ),
    A.join("/")
  );

/**
 * The encoded path part of a `file:` URL for an absolute path (the part after `file://`), or `undefined` for a UNC
 * path. One builder, so `CliLinks` and `Render.markdown` link a file the same way.
 *
 * **Details**
 *
 * A drive path keeps its drive and becomes `/C:/x/y.ts`: the colon is part of the URL's path, not data to encode.
 *
 * **Example** (Keep a Windows drive colon in a file URL)
 *
 * ```ts
 * import { fileUrlPath } from "@beep/cli-kit/internal/linkTarget"
 *
 * console.log(fileUrlPath("C:/my project/main.ts")) // /C:/my%20project/main.ts
 * console.log(fileUrlPath("//server/share/main.ts")) // undefined
 * ```
 *
 * @internal
 * @category encoding
 * @since 0.0.0
 */
export const fileUrlPath = (absolute: string): string | undefined => {
  if (UNC.test(absolute)) return undefined;
  if (DRIVE.test(absolute))
    return `/${Str.slice(0, 2)(absolute)}${encodePath(pipe(absolute, Str.slice(2), Str.replace(/\\/g, "/")))}`;
  return encodePath(Str.startsWith("/")(absolute) ? absolute : `/${Str.replace(/\\/g, "/")(absolute)}`);
};

/**
 * A URL for an OSC 8 sequence: every character outside printable ASCII (32 to 126) is percent-encoded as its UTF-8
 * bytes, as the OSC 8 convention asks, and nothing already encoded is touched, so `%C3%A9` is not encoded twice.
 *
 * **Example** (Encode non ASCII characters once)
 *
 * ```ts
 * import { encodeForOsc8 } from "@beep/cli-kit/internal/linkTarget"
 *
 * console.log(encodeForOsc8("https://example.com/café")) // https://example.com/caf%C3%A9
 * ```
 *
 * @internal
 * @category encoding
 * @since 0.0.0
 */
export const encodeForOsc8 = (url: string): string =>
  pipe(
    url,
    Str.replace(LONE_SURROGATE, "�"),
    A.fromIterable,
    A.map((char) => (NON_PRINTABLE_ASCII.test(char) ? encodeURIComponent(char) : char)),
    A.join("")
  );
