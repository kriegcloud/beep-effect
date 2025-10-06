import * as S from "effect/Schema";

/**
 * Error indicating an expected file path does not exist.
 *
 * @property path - The path that was expected to exist.
 * @property message - Optional human-friendly details.
 */
export class NoSuchFileError extends S.TaggedError<NoSuchFileError>("NoSuchFileError")("NoSuchFileError", {
  path: S.String,
  message: S.optional(S.String),
}) {}

/**
 * Generic domain-level error used by repo utilities.
 *
 * Prefer this when an operation fails due to business logic rather than
 * a system-level fault.
 *
 * @property message - Human-friendly details.
 * @property cause - Optional underlying cause.
 */
export class DomainError extends S.TaggedError<DomainError>("DomainError")("DomainError", {
  message: S.String,
  cause: S.optional(S.Unknown),
}) {}

/**
 * Error raised when a package.json that is required cannot be located.
 *
 * @property message - Human-friendly details.
 * @property cause - Underlying cause.
 */
export class PackageJsonNotFound extends S.TaggedError<PackageJsonNotFound>("PackageJsonNotFound")(
  "PackageJsonNotFound",
  {
    message: S.String,
    cause: S.Any,
  }
) {}
