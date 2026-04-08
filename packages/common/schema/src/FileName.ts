/**
 * Portable file-name schema helpers for strings shaped like `basename.ext`.
 *
 * The basename must be non-empty and may include additional dots, while the
 * final extension segment must be one of the known {@link FileExtension}
 * values.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { FileName } from "@beep/schema/FileName";
 *
 * const decodeFileName = S.decodeUnknownSync(FileName);
 *
 * decodeFileName("readme.txt");
 * decodeFileName("archive.tar.gz");
 * ```
 *
 * @module @beep/schema/FileName
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { FileExtension } from "./FileExtension.ts";
import { HasNullByte, UsesPosixSeparator, UsesWindowsSeparator } from "./FilePath.ts";

const $I = $SchemaId.create("FileName");

const isHasNullByte = S.is(HasNullByte);
const isUsesPosixSeparator = S.is(UsesPosixSeparator);
const isUsesWindowsSeparator = S.is(UsesWindowsSeparator);

const FileNameStemChecks = S.makeFilterGroup(
  [
    S.makeFilter(P.not(isHasNullByte), {
      identifier: $I`FileNameStemNoNullByteCheck`,
      title: "File Name Stem No Null Byte",
      description: "A file-name stem without embedded NUL bytes.",
      message: "File name stems must not contain embedded NUL bytes",
    }),
    S.makeFilter(P.not(isUsesPosixSeparator), {
      identifier: $I`FileNameStemNoPosixSeparatorCheck`,
      title: "File Name Stem No Posix Separator",
      description: "A file-name stem that does not contain the POSIX path separator /.",
      message: "File name stems must not contain /",
    }),
    S.makeFilter(P.not(isUsesWindowsSeparator), {
      identifier: $I`FileNameStemNoWindowsSeparatorCheck`,
      title: "File Name Stem No Windows Separator",
      description: "A file-name stem that does not contain the Windows path separator \\.",
      message: "File name stems must not contain \\",
    }),
  ],
  {
    identifier: $I`FileNameStemChecks`,
    title: "File Name Stem",
    description: "Checks for a non-empty file-name stem that can include additional dots but not path separators.",
  }
);

const FileNameStem = S.NonEmptyString.check(FileNameStemChecks);
const FileNameStemWithDot = S.TemplateLiteral([FileNameStem, "."]);

/**
 * Schema for portable file names with a non-empty basename and known file extension.
 *
 * This schema follows the same portability policy as {@link FilePath}: it
 * rejects universal filename hazards such as path separators and embedded NUL
 * bytes while still allowing names that are valid on at least one major
 * operating system.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema";
 * import { FileName } from "@beep/schema/FileName";
 *
 * const decodeFileName = S.decodeUnknownSync(FileName);
 *
 * decodeFileName("photo.png");
 * decodeFileName(".cache.png");
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const FileName = S.TemplateLiteral([FileNameStemWithDot, FileExtension]).pipe(
  $I.annoteSchema("FileName", {
    description: "A portable file name in the format basename.ext.",
    documentation:
      "Requires a non-empty basename before the final dot, allows additional dots in the basename, and validates the final extension against FileExtension.",
  })
);

/**
 * Type for {@link FileName}.
 *
 * @example
 * ```ts
 * import type { FileName } from "@beep/schema/FileName"
 *
 * const file: FileName = "readme.txt" as FileName
 * ```
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FileName = typeof FileName.Type;
