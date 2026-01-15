/**
 * Repository utilities error types.
 *
 * Defines tagged errors for file system and repository operations.
 *
 * @since 0.1.0
 */
import * as Effect from "effect/Effect";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
/**
 * Error indicating an expected file path does not exist.
 *
 * @example
 * ```typescript
 * import { NoSuchFileError } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const checkFile = (path: string) =>
 *   Effect.fail(
 *     new NoSuchFileError({
 *       path,
 *       message: "Configuration file not found"
 *     })
 *   )
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class NoSuchFileError extends S.TaggedError<NoSuchFileError>()("NoSuchFileError", {
  /**
   * The path that was expected to exist.
   *
   * @since 0.1.0
   */
  path: S.String,
  /**
   * Optional human-friendly details.
   *
   * @since 0.1.0
   */
  message: S.optionalWith(S.String, { exact: true, default: () => "Path does not exist" }),
}) {}

/**
 * Generic domain-level error used by repo utilities.
 *
 * Prefer this when an operation fails due to business logic rather than
 * a system-level fault.
 *
 * @example
 * ```typescript
 * import { DomainError } from "@beep/tooling-utils"
 * import * as Effect from "effect/Effect"
 *
 * const validateConfig = (config: unknown) =>
 *   Effect.fail(
 *     new DomainError({
 *       message: "Invalid workspace configuration",
 *       cause: new Error("Missing required field")
 *     })
 *   )
 * ```
 *
 * @category errors
 * @since 0.1.0
 */
export class DomainError extends S.TaggedError<DomainError>()("DomainError", {
  /**
   * Human-friendly error details.
   *
   * @since 0.1.0
   */
  message: S.String,
  /**
   * Optional underlying cause.
   *
   * @since 0.1.0
   */
  cause: S.Defect,
}) {
  /**
   * Type guard for DomainError instances.
   *
   * @since 0.1.0
   */
  static readonly is = S.is(DomainError);

  /**
   * Maps unknown errors to DomainError instances.
   *
   * @since 0.1.0
   */
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

  /**
   * Effect error mapper using selfOrMap.
   *
   * @since 0.1.0
   */
  static readonly mapError = Effect.mapError(DomainError.selfOrMap);
}
