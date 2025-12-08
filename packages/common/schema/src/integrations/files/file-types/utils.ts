/**
 * File type utilities for detecting and validating file formats.
 *
 * All functions are pure, immutable, and use Effect-first patterns:
 * - Effect Array/String utilities instead of native methods
 * - Either/Option for error handling instead of throws
 * - Match for conditional logic instead of if-else chains
 *
 * @category Integrations/Files
 * @since 0.1.0
 */

import type { UnsafeTypes } from "@beep/types";
import { slice } from "@beep/utils/data/array.utils";
import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as Num from "effect/Number";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import { ArrayBufferFromSelf, ArrayOfNumbers } from "../../../primitives";
import type { FileInfo } from "./FileInfo";
/**
 * Error types for file chunk validation
 */

/**
 * Indicates that the file type is not supported or invalid
 *
 * @category Errors
 * @since 0.1.0
 */
export class InvalidFileTypeError extends S.TaggedError<InvalidFileTypeError>()("InvalidFileTypeError", {
  message: S.String,
  receivedType: S.String,
}) {}

/**
 * Indicates that the file chunk contains illegal byte values
 *
 * @category Errors
 * @since 0.1.0
 */
export class IllegalChunkError extends S.TaggedError<IllegalChunkError>()("IllegalChunkError", {
  message: S.String,
}) {}

/**
 * Helper to check if a number is valid (not NaN)
 *
 * @category Helpers
 * @since 0.1.0
 */
const isValidNumber = (num: number): boolean => F.pipe(num, P.and(P.isNumber, F.pipe(Number.isNaN, P.not)));

/**
 * Determine if an array of numbers represents a legal file chunk.
 *
 * A chunk is legal if all numbers are valid (not NaN).
 *
 * @param fileChunk - File content represented as Array<number>
 * @returns True if the file content is verified, otherwise false
 *
 * @category Validation
 * @since 0.1.0
 */
const isLegalChunk = (fileChunk: ReadonlyArray<number>): boolean => F.pipe(fileChunk, A.every(isValidNumber));

/**
 * Type guard to check if input is a valid file type
 *
 * @category Guards
 * @since 0.1.0
 */
const isValidFileInput = (file: unknown): file is ReadonlyArray<number> | ArrayBuffer | Uint8Array =>
  F.pipe(file, P.or(P.and(A.isArray, ArrayOfNumbers.is), P.or(ArrayBufferFromSelf.is, S.is(S.Uint8ArrayFromSelf))));

/**
 * Extract a chunk from the beginning of a file (Effect-first version).
 *
 * Supports ReadonlyArray<number>, ArrayBuffer, and Uint8Array inputs.
 * Returns Either with error information on validation failure.
 *
 * @param file - File content as ReadonlyArray<number>, ArrayBuffer, or Uint8Array
 * @param fileChunkLength - Number of bytes to extract (default: 32)
 * @returns Either containing the chunk or error information
 *
 * @category File Processing
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import * as Either from "effect/Either";
 *
 * const file = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
 * const result = getFileChunkEither(file, 4);
 *
 * if (Either.isRight(result)) {
 *   console.log("Chunk:", result.right);
 * } else {
 *   console.error("Error:", result.left.message);
 * }
 * ```
 */
export const getFileChunkEither = (
  file: ReadonlyArray<number> | ArrayBuffer | Uint8Array,
  fileChunkLength = 32
): Either.Either<ReadonlyArray<number>, InvalidFileTypeError | IllegalChunkError> => {
  // Validate file type
  if (!isValidFileInput(file)) {
    return Either.left(
      new InvalidFileTypeError({
        message: "Expected file to be Array<number>, Uint8Array, or ArrayBuffer",
        receivedType: typeof file,
      })
    );
  }

  // Convert to array format
  const fileToCheck: ReadonlyArray<number> | Uint8Array = file instanceof ArrayBuffer ? new Uint8Array(file) : file;

  // Extract chunk
  const chunk = F.pipe(fileToCheck, A.fromIterable, A.take(fileChunkLength));

  // Validate chunk
  if (!isLegalChunk(chunk)) {
    return Either.left(
      new IllegalChunkError({
        message: "File content contains illegal values (NaN detected)",
      })
    );
  }

  return Either.right(chunk);
};

/**
 * Fetch a nested property from an object by dot-notation path.
 *
 * Uses recursion to traverse nested objects. Returns the value at the path,
 * or undefined if the path doesn't exist.
 *
 * @param obj - The object to traverse
 * @param prop - Property path in dot notation (e.g., "user.name.first")
 * @returns The value at the specified path
 *
 * @category Object Utilities
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const obj = { user: { name: { first: "John" } } };
 * const result = fetchFromObject(obj, "user.name.first");
 * // result: "John"
 * ```
 */
export const fetchFromObject = (obj: UnsafeTypes.UnsafeAny, prop: string): FileInfo.Type => {
  return F.pipe(
    prop,
    Str.indexOf("."),
    O.flatMap((index) =>
      F.pipe(
        index,
        Num.greaterThanOrEqualTo(0),
        Match.value,
        Match.when(true, () =>
          O.some(
            fetchFromObject(obj[F.pipe(prop, Str.takeLeft(index))], F.pipe(prop, Str.slice(index + 1, prop.length)))
          )
        ),
        Match.orElse(() => O.some(obj[prop]))
      )
    ),
    O.getOrElse(() => obj[prop])
  );
};

/**
 * Convert an array of byte numbers to a string.
 *
 * @param bytes - Array of byte values
 * @returns Decoded string
 *
 * @category Byte Conversion
 * @since 0.1.0
 */
const bytesToString = (bytes: ReadonlyArray<number>): string =>
  F.pipe(
    bytes,
    A.map((num) => String.fromCharCode(num)),
    A.join("")
  );

/**
 * Identify whether a Matroska file is 'mkv' or 'webm' (Effect-first version).
 *
 * Checks for the presence of the "DocType" element in the webm header,
 * or the "Segment" element in the mkv header.
 *
 * @param fileChunk - A chunk from the beginning of file content
 * @returns Option containing 'webm', 'mkv', or None if not identified
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option";
 *
 * const chunk = [0x1A, 0x45, ...]; // Matroska header
 * const result = findMatroskaDocTypeElementsOption(chunk);
 *
 * if (O.isSome(result)) {
 *   console.log("Format:", result.value); // "webm" or "mkv"
 * }
 * ```
 */
export const findMatroskaDocTypeElementsOption = (fileChunk: ReadonlyArray<number>): O.Option<"webm" | "mkv"> => {
  const webmString = "webm";
  const mkvString = "matroska";

  const byteString = bytesToString(fileChunk);

  return F.pipe(
    byteString,
    Match.value,
    Match.when(
      (str) => F.pipe(str, Str.includes(webmString)),
      () => O.some("webm" as const)
    ),
    Match.when(
      (str) => F.pipe(str, Str.includes(mkvString)),
      () => O.some("mkv" as const)
    ),
    Match.orElse(() => O.none())
  );
};

/**
 * Check if a byte sequence matches a signature at a given position.
 *
 * @param fileChunk - File chunk to search
 * @param signature - Byte signature to find
 * @param startIndex - Position to start checking
 * @returns True if signature matches at position
 *
 * @category Helpers
 * @since 0.1.0
 */
const matchesSignatureAt = (
  fileChunk: ReadonlyArray<number>,
  signature: ReadonlyArray<number>,
  startIndex: number
): boolean =>
  F.pipe(
    signature,
    A.every((byte, offset) =>
      F.pipe(
        fileChunk,
        A.get(startIndex + offset),
        O.map((chunkByte) => chunkByte === byte),
        O.getOrElse(() => false)
      )
    )
  );

/**
 * Search for a byte signature anywhere in the file chunk.
 *
 * @param fileChunk - File chunk to search
 * @param signature - Byte signature to find
 * @returns True if signature found anywhere in chunk
 *
 * @category Helpers
 * @since 0.1.0
 */
const containsSignature = (fileChunk: ReadonlyArray<number>, signature: ReadonlyArray<number>): boolean => {
  const maxSearchIndex = fileChunk.length - signature.length;

  return F.pipe(
    A.range(0, maxSearchIndex),
    A.some((i) => matchesSignatureAt(fileChunk, signature, i))
  );
};

/**
 * Determine if array of numbers contains the "ftyp" string.
 *
 * M4V files typically have a "ftyp" box in the first few bytes,
 * which can be identified by this signature.
 *
 * @param fileChunk - A chunk from the beginning of file content
 * @returns True if "ftyp" signature found, otherwise false
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const chunk = [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70];
 * const isFtyp = isftypStringIncluded(chunk); // true
 * ```
 */
export const isftypStringIncluded = (fileChunk: ReadonlyArray<number>): boolean => {
  const ftypSignature = [0x66, 0x74, 0x79, 0x70] as const; // "ftyp"
  return containsSignature(fileChunk, ftypSignature);
};

/**
 * Determine if array of numbers contains the "FLV" string.
 *
 * FLV files typically have a "FLV" string in the first three bytes.
 *
 * @param fileChunk - A chunk from the beginning of file content
 * @returns True if "FLV" signature found, otherwise false
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const chunk = [0x46, 0x4C, 0x56, 0x01]; // "FLV" + version
 * const isFlv = isFlvStringIncluded(chunk); // true
 * ```
 */
export const isFlvStringIncluded = (fileChunk: ReadonlyArray<number>): boolean => {
  return F.pipe(
    fileChunk,
    A.take(3),
    (signature) => new TextDecoder().decode(new Uint8Array(signature)),
    Str.includes("FLV")
  );
};

/**
 * Check if a JPEG file contains JFIF or EXIF header markers.
 *
 * The fourth byte (index 3) contains the marker indicating header type.
 *
 * @param file - File content as array of numbers
 * @returns True if JFIF (0xE0) or EXIF (0xE1) marker found
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const jpegFile = [0xFF, 0xD8, 0xFF, 0xE0, ...]; // JFIF
 * const hasHeader = isFileContaineJfiforExifHeader(jpegFile); // true
 * ```
 */
export const isFileContaineJfiforExifHeader = (file: ReadonlyArray<number>): boolean => {
  const jfifMarker = 0xe0;
  const exifMarker = 0xe1;

  return F.pipe(
    file,
    A.get(3),
    O.map((headerMarker) =>
      F.pipe(
        headerMarker,
        Match.value,
        Match.when(
          (marker) => marker === jfifMarker || marker === exifMarker,
          () => true
        ),
        Match.orElse(() => false)
      )
    ),
    O.getOrElse(() => false)
  );
};

/**
 * Determine if array of numbers contains the "ftypavif" string.
 *
 * AVIF files typically have a "ftypavif" string at bytes 4-11 (0-indexed).
 *
 * @param fileChunk - A chunk from the beginning of file content
 * @returns True if "ftypavif" signature found, otherwise false
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const chunk = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70,
 *                0x61, 0x76, 0x69, 0x66]; // Contains "ftypavif"
 * const isAvif = isAvifStringIncluded(chunk); // true
 * ```
 */
export const isAvifStringIncluded = (fileChunk: ReadonlyArray<number>): boolean => {
  return F.pipe(fileChunk, slice(4, 12), bytesToString, (signature) => signature === "ftypavif");
};

/**
 * Determine if a file chunk contains a HEIC file signature.
 *
 * HEIC files have an 'ftyp' box with specific major brand signatures:
 * 'heic', 'hevc', 'mif1', or 'msf1'.
 *
 * @param fileChunk - A chunk from the beginning of file content
 * @returns True if any HEIC signature found, otherwise false
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const chunk = [..., 0x66, 0x74, 0x79, 0x70,
 *                0x68, 0x65, 0x69, 0x63]; // Contains "ftypheic"
 * const isHeic = isHeicSignatureIncluded(chunk); // true
 * ```
 */
export const isHeicSignatureIncluded = (fileChunk: ReadonlyArray<number>): boolean => {
  const heicSignatures = ["ftypheic", "ftyphevc", "ftypmif1", "ftypmsf1"] as const;

  const byteString = bytesToString(fileChunk);

  return F.pipe(
    heicSignatures,
    A.some((signature) => F.pipe(byteString, Str.includes(signature)))
  );
};
