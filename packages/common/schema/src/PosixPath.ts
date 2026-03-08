/**
 * Shared schema helpers for POSIX-normalized path strings.
 *
 * @since 0.0.0
 * @module @beep/schema/PosixPath
 */

import { $SchemaId } from "@beep/identity/packages";
import { identity, SchemaTransformation } from "effect";
import * as S from "effect/Schema";
import * as Str from "effect/String";

const $I = $SchemaId.create("PosixPath");
const POSIX_PATH_PATTERN = /^[^\\]*$/;

/**
 * POSIX-normalized path string schema.
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
 * @since 0.0.0
 * @category DomainModel
 */
export type PosixPath = typeof PosixPath.Type;

/**
 * Transform native file-system paths to POSIX separators.
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
 * Normalize a file-system path to POSIX separators.
 *
 * @param value - Input path string that may contain native separators.
 * @returns Path string normalized to POSIX separators.
 * @since 0.0.0
 * @category Utility
 */
export const normalizePath = (value: string): PosixPath => decodePosixPath(value);
