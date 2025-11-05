import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
/**
 * Error indicating an expected file path does not exist.
 *
 * @property path - The path that was expected to exist.
 * @property message - Optional human-friendly details.
 */
export class NoSuchFileError extends S.TaggedError<NoSuchFileError>("NoSuchFileError")("NoSuchFileError", {
  path: S.String,
  message: S.optionalWith(S.String, { exact: true, default: () => "Path does not exist" }),
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
  cause: S.Defect,
}) {
  static readonly is = S.is(DomainError);

  static readonly selfOrMap = (e: unknown) => {
    if (DomainError.is(e)) {
      return e;
    }

    if (e instanceof Error) {
      return new DomainError({
        message: e.message,
        cause: e,
      });
    }

    return new DomainError({
      cause: e,
      message:
        P.or(P.isObject, P.isRecord)(e) && P.hasProperty("message")(e) && P.isString(e.message) ? e.message : String(e),
    });
  };

  static readonly mapError = Effect.mapError(DomainError.selfOrMap);
}
