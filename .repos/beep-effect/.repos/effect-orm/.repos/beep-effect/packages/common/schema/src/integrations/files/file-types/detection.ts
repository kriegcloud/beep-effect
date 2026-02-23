/**
 * File detection utilities with Effect-first patterns.
 *
 * All functions are pure, immutable, and use Effect-first patterns:
 * - Either/Option for error handling instead of throws/undefined
 * - Effect Array/Record utilities instead of native methods
 * - Match for conditional logic instead of if-else chains
 * - Struct utilities for object property access
 *
 * @category Integrations/Files
 * @since 0.1.0
 */

import * as A from "effect/Array";
import * as Either from "effect/Either";
import * as F from "effect/Function";
import * as Match from "effect/Match";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Struct from "effect/Struct";
import type { DetectedFileInfo, FileInfo } from "./FileInfo";
import type { FileSignature } from "./FileSignature";
import { FILE_TYPES_REQUIRED_ADDITIONAL_CHECK, FileTypes } from "./FileTypes";
import type { DetectFileOptions } from "./types";
import { getFileChunkEither, type IllegalChunkError, InvalidFileTypeError } from "./utils";

/**
 * Indicates that the chunk size provided is invalid (must be greater than zero)
 *
 * @category Errors
 * @since 0.1.0
 */
export class InvalidChunkSizeError extends S.TaggedError<InvalidChunkSizeError>()("InvalidChunkSizeError", {
  message: S.String,
  receivedSize: S.Number,
}) {}

/**
 * Transform a matched signature into a DetectedFileInfo structure.
 *
 * Converts the signature's sequence bytes to hexadecimal strings.
 *
 * @param fileType - The file type information
 * @param matchedSignature - The matched signature
 * @returns DetectedFileInfo with hex-encoded signature sequence
 *
 * @category Helpers
 * @since 0.1.0
 */
const createDetectedFileInfo = (
  fileType: FileInfo.Type,
  matchedSignature: FileSignature.Type
): DetectedFileInfo.Type => ({
  extension: fileType.extension,
  mimeType: fileType.mimeType,
  description: fileType.description,
  signature: {
    ...matchedSignature,
    sequence: F.pipe(
      matchedSignature.sequence,
      A.map((num) => num.toString(16))
    ),
  },
});

/**
 * Process a single file type to detect if its signature matches the file chunk.
 *
 * @param fileChunk - The file chunk to analyze
 * @param typeName - The type name property from FileTypes
 * @returns Option containing tuple of [DetectedFileInfo, needsAdditionalCheck]
 *
 * @category Helpers
 * @since 0.1.0
 */
const detectFileType = (
  fileChunk: ReadonlyArray<number>,
  typeName: string
): O.Option<readonly [DetectedFileInfo.Type, boolean]> => {
  const signatures: ReadonlyArray<FileSignature.Type> = FileTypes.getSignaturesByName(typeName);
  const matchedSignature = FileTypes.detectBySignatures(fileChunk as Array<number>, signatures);

  return F.pipe(
    matchedSignature,
    O.fromNullable,
    O.map((signature) => {
      const fileType: FileInfo.Type = FileTypes.getInfoByName(typeName);
      const needsAdditionalCheck = F.pipe(FILE_TYPES_REQUIRED_ADDITIONAL_CHECK, A.contains(fileType.extension));
      const fileInfo = createDetectedFileInfo(fileType, signature);
      return [fileInfo, needsAdditionalCheck] as const;
    })
  );
};

/**
 * Validate chunk size from options.
 *
 * @param options - Optional detection options
 * @returns Either containing the validated chunk size or error
 *
 * @category Validation
 * @since 0.1.0
 */
const validateChunkSize = (options: DetectFileOptions | undefined): Either.Either<number, InvalidChunkSizeError> => {
  const chunkSizeOption = F.pipe(
    options,
    O.fromNullable,
    O.filter((opts): opts is { chunkSize: number } => opts.chunkSize !== undefined),
    O.map((opts) => opts.chunkSize)
  );

  return F.pipe(
    chunkSizeOption,
    O.match({
      onNone: () => Either.right(64), // Default chunk size
      onSome: (size: number) =>
        F.pipe(
          size <= 0,
          Match.value,
          Match.when(true, () =>
            Either.left(
              new InvalidChunkSizeError({
                message: "chunkSize must be bigger than zero",
                receivedSize: size,
              })
            )
          ),
          Match.orElse(() => Either.right(size))
        ),
    })
  );
};

/**
 * Detect a file by searching for valid file signatures (Effect-first version).
 *
 * Returns Option<DetectedFileInfo> for type-safe handling of detection results.
 * Uses Either internally for error handling during chunk extraction.
 *
 * @param file - File content as Array<number>, ArrayBuffer, or Uint8Array
 * @param options - Optional parameters for chunk size configuration
 * @returns Option containing DetectedFileInfo if signature found, None otherwise
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import * as O from "effect/Option";
 *
 * const file = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG signature
 * const result = detectFileOption(file);
 *
 * if (O.isSome(result)) {
 *   console.log("Detected:", result.value.extension);
 * } else {
 *   console.log("No file type detected");
 * }
 * ```
 */
export const detectFileOption = (
  file: ReadonlyArray<number> | ArrayBuffer | Uint8Array<ArrayBufferLike>,
  options?: DetectFileOptions | undefined
): O.Option<DetectedFileInfo.Type> => {
  // Validate chunk size
  const chunkSizeResult = validateChunkSize(options);
  if (Either.isLeft(chunkSizeResult)) {
    return O.none();
  }

  const chunkSize = chunkSizeResult.right;

  // Get file chunk using Effect-first version
  const fileChunkResult = getFileChunkEither(file, chunkSize);
  if (Either.isLeft(fileChunkResult)) {
    return O.none();
  }

  const fileChunk = fileChunkResult.right;

  // Early return if chunk is empty
  if (fileChunk.length === 0) {
    return O.none();
  }

  // Get all file type names from FileTypes class
  const typeNames = F.pipe(FileTypes, Struct.keys);

  // Process all file types and collect detected files
  const detectionResults = F.pipe(
    typeNames,
    A.filterMap((typeName) => detectFileType(fileChunk, typeName))
  );

  // Separate detected files and those requiring additional checks
  const detectedFiles = F.pipe(
    detectionResults,
    A.map(([fileInfo, _]) => fileInfo)
  );

  const filesRequiringCheck = F.pipe(
    detectionResults,
    A.filter(([_, needsCheck]) => needsCheck),
    A.map(([fileInfo, _]) => fileInfo)
  );

  // Handle detection results
  return F.pipe(
    detectedFiles,
    A.head,
    O.flatMap((firstDetected) =>
      F.pipe(
        detectedFiles.length,
        Match.value,
        Match.when(
          (len) => len === 1 && filesRequiringCheck.length === 0,
          () => O.some(firstDetected)
        ),
        Match.when(
          (len) => len > 1 || filesRequiringCheck.length > 0,
          () =>
            F.pipe(
              FileTypes.detectTypeByAdditionalCheck(fileChunk as Array<number>, detectedFiles),
              O.fromNullable,
              O.flatMap((detectedExtension) =>
                F.pipe(
                  detectedFiles,
                  A.findFirst((df) => df.extension === detectedExtension)
                )
              )
            )
        ),
        Match.orElse(() => O.none())
      )
    )
  );
};

/**
 * Detect a file by searching for valid file signatures (Either version).
 *
 * Returns Either with detailed error information for validation and chunk extraction failures.
 *
 * @param file - File content as Array<number>, ArrayBuffer, or Uint8Array
 * @param options - Optional parameters for chunk size configuration
 * @returns Either containing DetectedFileInfo or error information
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * import * as Either from "effect/Either";
 *
 * const file = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG signature
 * const result = detectFileEither(file);
 *
 * if (Either.isRight(result)) {
 *   console.log("Detected:", result.right.extension);
 * } else {
 *   console.error("Error:", result.left.message);
 * }
 * ```
 */
export const detectFileEither = (
  file: ReadonlyArray<number> | ArrayBuffer | Uint8Array<ArrayBufferLike>,
  options?: DetectFileOptions | undefined
): Either.Either<DetectedFileInfo.Type, InvalidChunkSizeError | InvalidFileTypeError | IllegalChunkError> => {
  // Validate chunk size
  const chunkSizeResult = validateChunkSize(options);
  if (Either.isLeft(chunkSizeResult)) {
    return Either.left(chunkSizeResult.left);
  }

  const chunkSize = chunkSizeResult.right;

  // Get file chunk using Effect-first version to validate early
  const fileChunkResult = getFileChunkEither(file, chunkSize);
  if (Either.isLeft(fileChunkResult)) {
    return Either.left(fileChunkResult.left);
  }

  // Convert Option result to Either
  return F.pipe(
    detectFileOption(file, options),
    Either.fromOption(
      () =>
        new InvalidFileTypeError({
          message: "No valid file signature detected",
          receivedType: "unknown",
        })
    )
  );
};

/**
 * Detect a file by searching for valid file signatures (throwing version).
 *
 * This is a convenience wrapper around detectFileEither that throws on invalid
 * input and returns undefined when no file type is detected.
 *
 * @param file - File content as Array<number>, ArrayBuffer, or Uint8Array
 * @param options - Optional parameters for chunk size configuration
 * @returns DetectedFileInfo if signature found, undefined otherwise
 * @throws TypeError if file type is invalid
 * @throws RangeError if chunkSize is invalid
 *
 * @category File Detection
 * @since 0.1.0
 *
 * @example
 * ```typescript
 * const file = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]); // JPEG signature
 * const result = detectFile(file);
 *
 * if (result) {
 *   console.log("Detected:", result.extension);
 * } else {
 *   console.log("No file type detected");
 * }
 * ```
 */
export const detectFile = (
  file: ReadonlyArray<number> | ArrayBuffer | Uint8Array<ArrayBufferLike>,
  options?: DetectFileOptions | undefined
): DetectedFileInfo.Type | undefined => {
  // Validate chunk size - throw RangeError if invalid
  const chunkSizeResult = validateChunkSize(options);
  if (Either.isLeft(chunkSizeResult)) {
    throw new RangeError(chunkSizeResult.left.message);
  }

  // Validate file input - throw TypeError if invalid
  const fileChunkResult = getFileChunkEither(file, chunkSizeResult.right);
  if (Either.isLeft(fileChunkResult)) {
    throw new TypeError(fileChunkResult.left.message);
  }

  // Return Option result as undefined or value
  return F.pipe(detectFileOption(file, options), O.getOrUndefined);
};
