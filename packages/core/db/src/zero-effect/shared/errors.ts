import * as S from "effect/Schema";

export class ZeroMutatorAuthError extends S.TaggedError<ZeroMutatorAuthError>()("ZeroMutatorAuthError", {
  cause: S.Defect.pipe(S.optional),
  message: S.String,
}) {}

export class ZeroMutatorValidationError extends S.TaggedError<ZeroMutatorValidationError>()(
  "ZeroMutatorValidationError",
  {
    field: S.String.pipe(S.optional),
    message: S.String,
  }
) {}

export class ZeroMutatorDatabaseError extends S.TaggedError<ZeroMutatorDatabaseError>()("ZeroMutatorDatabaseError", {
  cause: S.Defect,
  message: S.String,
}) {}

/**
 * @since 1.0.0
 * @category errors
 */
export class ZeroMutationProcessingError extends S.TaggedError<ZeroMutationProcessingError>()(
  "ZeroMutationProcessingError",
  {
    cause: S.Defect.pipe(S.optional),
    message: S.String,
  }
) {}
