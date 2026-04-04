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
 * const readme = S.decodeUnknownSync(FileName)("readme.txt");
 * const archive = S.decodeUnknownSync(FileName)("archive.tar.gz");
 *
 * console.log([readme, archive]);
 * ```
 *
 * @module @beep/schema/FileName
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity/packages";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { FileExtension } from "./FileExtension.ts";
import { HasNullByte, UsesPosixSeparator, UsesWindowsSeparator } from "./FilePath.ts";

const $I = $SchemaId.create("FileName");

const isHasNullByte = S.is(HasNullByte);
const isUsesPosixSeparator = S.is(UsesPosixSeparator);
const isUsesWindowsSeparator = S.is(UsesWindowsSeparator);
const isFileExtension = S.is(FileExtension);

const lastExtensionSeparatorIndex = (value: string) => Str.lastIndexOf(".")(value);

const fileNameStemSegment = (value: string) =>
  pipe(
    lastExtensionSeparatorIndex(value),
    O.filter((index) => index > 0),
    O.map((index) => Str.takeLeft(index)(value))
  );

const fileNameExtensionSegment = (value: string) =>
  pipe(
    lastExtensionSeparatorIndex(value),
    O.filter((index) => index < Str.length(value) - 1),
    O.map((index) => Str.takeRight(Str.length(value) - index - 1)(value))
  );

const FileNameChecks = S.makeFilterGroup(
  [
    S.makeFilter(
      (value: `${string}.${string}`): value is `${string}.${string}` => pipe(fileNameStemSegment(value), O.isSome),
      {
        identifier: $I`FileNameNonEmptyBasenameCheck`,
        title: "File Name Non-Empty Basename",
        description: "A file name with a non-empty basename before the final extension separator.",
        message: "File names must have a non-empty basename before the final extension",
      }
    ),
    S.makeFilter(
      (value: `${string}.${string}`): value is `${string}.${string}` =>
        pipe(
          fileNameStemSegment(value),
          O.match({
            onNone: () => true,
            onSome: P.not(isHasNullByte),
          })
        ),
      {
        identifier: $I`FileNameNoNullByteCheck`,
        title: "File Name No Null Byte",
        description: "A file name whose basename before the final extension separator contains no embedded NUL bytes.",
        message: "File name stems must not contain embedded NUL bytes",
      }
    ),
    S.makeFilter(
      (value: `${string}.${string}`): value is `${string}.${string}` =>
        pipe(
          fileNameStemSegment(value),
          O.match({
            onNone: () => true,
            onSome: P.not(isUsesPosixSeparator),
          })
        ),
      {
        identifier: $I`FileNameNoPosixSeparatorCheck`,
        title: "File Name No Posix Separator",
        description:
          "A file name whose basename before the final extension separator does not contain the POSIX path separator /.",
        message: "File name stems must not contain /",
      }
    ),
    S.makeFilter(
      (value: `${string}.${string}`): value is `${string}.${string}` =>
        pipe(
          fileNameStemSegment(value),
          O.match({
            onNone: () => true,
            onSome: P.not(isUsesWindowsSeparator),
          })
        ),
      {
        identifier: $I`FileNameNoWindowsSeparatorCheck`,
        title: "File Name No Windows Separator",
        description:
          "A file name whose basename before the final extension separator does not contain the Windows path separator \\.",
        message: "File name stems must not contain \\",
      }
    ),
    S.makeFilter(
      (value: `${string}.${string}`): value is `${string}.${string}` =>
        pipe(fileNameExtensionSegment(value), O.exists(isFileExtension)),
      {
        identifier: $I`FileNameKnownExtensionCheck`,
        title: "File Name Known Extension",
        description: "A file name whose final extension segment is accepted by the shared FileExtension schema.",
        message: "File names must end with a known file extension",
      }
    ),
  ],
  {
    identifier: $I`FileNameChecks`,
    title: "File Name",
    description: "Checks for portable file names with a non-empty basename and known final extension segment.",
  }
);

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
 * S.decodeUnknownSync(FileName)("photo.png");
 * S.decodeUnknownSync(FileName)(".cache.png");
 * ```
 *
 * @since 0.0.0
 * @category Validation
 */
export const FileName = S.TemplateLiteral([S.String, ".", S.String])
  .check(FileNameChecks)
  .pipe(
    $I.annoteSchema("FileName", {
      description: "A portable file name in the format basename.ext.",
      documentation:
        "Requires a non-empty basename before the final dot, allows additional dots in the basename, and validates the final extension against FileExtension.",
    })
  );

/**
 * Type for {@link FileName}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type FileName = typeof FileName.Type;
