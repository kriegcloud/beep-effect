/**
 * Shared schema helpers for POSIX-normalized path strings.
 *
 * @since 0.0.0
 * @module
 */

import { $SchemaId } from "@beep/identity/packages";
import { identity, SchemaTransformation } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("PosixPath");
const POSIX_PATH_PATTERN = /^[^\\]*$/;

/**
 * Branded schema for path strings using only POSIX `/` separators.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { PosixPath } from "@beep/schema/PosixPath"
 *
 * const p = S.decodeUnknownSync(PosixPath)("/usr/local/bin")
 * console.log(p) // "/usr/local/bin"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const PosixPath = S.String.check(S.isPattern(POSIX_PATH_PATTERN)).pipe(
  S.brand("PosixPath"),
  S.annotate(
    $I.annote("PosixPath", {
      description: "Path string normalized to use '/' separators only.",
    })
  )
);

/**
 * Type for {@link PosixPath}.
 *
 * @example
 * ```ts
 * import type { PosixPath } from "@beep/schema/PosixPath"
 *
 * const dir: PosixPath = "/home/user" as PosixPath
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PosixPath = typeof PosixPath.Type;

/**
 * Schema transformation that converts native file-system paths (with backslashes) to POSIX separators.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { NativePathToPosixPath } from "@beep/schema/PosixPath"
 *
 * const p = S.decodeUnknownSync(NativePathToPosixPath)("C:\\Users\\docs")
 * console.log(p) // "C:/Users/docs"
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const NativePathToPosixPath = S.String.pipe(
  S.decodeTo(
    PosixPath,
    SchemaTransformation.transform({
      decode: Str.replaceAll("\\", "/"),
      encode: identity,
    })
  ),
  S.annotate(
    $I.annote("NativePathToPosixPath", {
      description: "Schema transformation that normalizes native path separators to posix format.",
    })
  )
);

const decodePosixPath = S.decodeUnknownSync(NativePathToPosixPath);

/**
 * Normalize a file-system path string to POSIX separators.
 *
 * @example
 * ```ts
 * import { normalizePath } from "@beep/schema/PosixPath"
 *
 * const p = normalizePath("src\\lib\\index.ts")
 * console.log(p) // "src/lib/index.ts"
 * ```
 *
 * @param value - Input path string that may contain native separators.
 * @returns Path string normalized to POSIX separators.
 * @since 0.0.0
 * @category Utility
 */
export const normalizePath = (value: string): PosixPath => decodePosixPath(value);
