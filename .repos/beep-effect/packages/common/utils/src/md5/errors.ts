/**
 * Tagged errors for MD5 hashing operations
 * @module
 */
import { $UtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $UtilsId.create("md5/errors");

/**
 * Error thrown when MD5 hash computation fails
 * @since 0.1.0
 * @category Errors
 */
export class Md5ComputationError extends S.TaggedError<Md5ComputationError>()(
  $I`Md5ComputationError`,
  {
    message: S.String,
    cause: S.Unknown,
  },
  $I.annotations("Md5ComputationError", {
    description: "Thrown when the MD5 hash computation fails due to an internal error.",
  })
) {}

/**
 * Error thrown when Unicode encoding fails
 * @since 0.1.0
 * @category Errors
 */
export class UnicodeEncodingError extends S.TaggedError<UnicodeEncodingError>()(
  $I`UnicodeEncodingError`,
  {
    message: S.String,
    codePoint: S.Number,
  },
  $I.annotations("UnicodeEncodingError", {
    description: "Thrown when a Unicode code point cannot be encoded during MD5 hashing.",
  })
) {}

/**
 * Error thrown when file reading fails
 * @since 0.1.0
 * @category Errors
 */
export class FileReadError extends S.TaggedError<FileReadError>()(
  $I`FileReadError`,
  {
    message: S.String,
    cause: S.Unknown,
  },
  $I.annotations("FileReadError", {
    description: "Thrown when reading file content fails during MD5 hash computation.",
  })
) {}

/**
 * Error thrown when blob slicing fails
 * @since 0.1.0
 * @category Errors
 */
export class BlobSliceError extends S.TaggedError<BlobSliceError>()(
  $I`BlobSliceError`,
  {
    message: S.String,
    cause: S.Unknown,
  },
  $I.annotations("BlobSliceError", {
    description: "Thrown when slicing a Blob into chunks fails during incremental MD5 hashing.",
  })
) {}

/**
 * Error thrown when worker operations fail
 * @since 0.1.0
 * @category Errors
 */
export class WorkerHashError extends S.TaggedError<WorkerHashError>()(
  $I`WorkerHashError`,
  {
    message: S.String,
    cause: S.Unknown,
  },
  $I.annotations("WorkerHashError", { description: "Thrown when a Web Worker fails to compute the MD5 hash." })
) {}
