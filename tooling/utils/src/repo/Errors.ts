import * as S from "effect/Schema";

export class NoSuchFileError extends S.TaggedError<NoSuchFileError>(
  "NoSuchFileError",
)("NoSuchFileError", {
  path: S.String,
  message: S.optional(S.String),
}) {}

export class DomainError extends S.TaggedError<DomainError>("DomainError")(
  "DomainError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
) {}

export class PackageJsonNotFound extends S.TaggedError<PackageJsonNotFound>(
  "PackageJsonNotFound",
)("PackageJsonNotFound", {
  message: S.String,
  cause: S.Any,
}) {}
