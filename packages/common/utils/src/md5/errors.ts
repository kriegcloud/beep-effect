/**
 * Tagged errors for MD5 hashing operations
 * @module
 */
import * as S from "effect/Schema";

/**
 * Error thrown when MD5 hash computation fails
 * @since 1.0.0
 * @category Errors
 */
export class Md5ComputationError extends S.TaggedError<Md5ComputationError>()("Md5ComputationError", {
  message: S.String,
  cause: S.Unknown,
}) {}

/**
 * Error thrown when Unicode encoding fails
 * @since 1.0.0
 * @category Errors
 */
export class UnicodeEncodingError extends S.TaggedError<UnicodeEncodingError>()("UnicodeEncodingError", {
  message: S.String,
  codePoint: S.Number,
}) {}

/**
 * Error thrown when file reading fails
 * @since 1.0.0
 * @category Errors
 */
export class FileReadError extends S.TaggedError<FileReadError>()("FileReadError", {
  message: S.String,
  cause: S.Unknown,
}) {}

/**
 * Error thrown when blob slicing fails
 * @since 1.0.0
 * @category Errors
 */
export class BlobSliceError extends S.TaggedError<BlobSliceError>()("BlobSliceError", {
  message: S.String,
  cause: S.Unknown,
}) {}

/**
 * Error thrown when worker operations fail
 * @since 1.0.0
 * @category Errors
 */
export class WorkerHashError extends S.TaggedError<WorkerHashError>()("WorkerHashError", {
  message: S.String,
  cause: S.Unknown,
}) {}
