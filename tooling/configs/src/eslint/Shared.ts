import { identity, SchemaTransformation, String as Str } from "effect";
import * as S from "effect/Schema";

const POSIX_PATH_PATTERN = /^[^\\]*$/;

/**
 * POSIX-normalized path string schema.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const PosixPath = S.String.check(S.isPattern(POSIX_PATH_PATTERN));

const NativePathToPosixPath = S.String.pipe(
  S.decodeTo(
    PosixPath,
    SchemaTransformation.transform({
      decode: Str.replaceAll("\\", "/"),
      encode: identity,
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
export const normalizePath = (value: string): string => decodePosixPath(value);
