import * as S from "effect/Schema";

export class NoSuchFileError extends S.TaggedError<NoSuchFileError>(
  "NoSuchFileError",
)("NoSuchFileError", {
  path: S.String,
  message: S.optional(S.String),
}) {}

export class ProgramError extends S.TaggedError<ProgramError>("ProgramError")(
  "ProgramError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
) {}
