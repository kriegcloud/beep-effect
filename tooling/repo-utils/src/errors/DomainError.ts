/**
 * Generic domain error for operations that fail for non-file-specific reasons.
 *
 * Use this for JSON parse failures, glob failures, and other operational
 * errors where a more specific error type is not warranted.
 *
 * @category error handling
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { dual } from "effect/Function";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("errors/DomainError");

/**
 * A generic domain-level error with an optional underlying cause.
 *
 * @example
 * ```ts
 * import { DomainError } from "@beep/repo-utils/errors/DomainError"
 * const error = new DomainError({
 *   message: "Operation failed"
 * })
 * void error.message
 * ```
 * @category error handling
 * @since 0.0.0
 */
export class DomainError extends TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    message: S.String,
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("DomainError", {
    title: "Domain Error",
    description:
      "A generic domain-level error with an optional underlying cause for JSON parse failures, glob failures, and other operational errors.",
  })
) {
  static readonly newCause: {
    (cause: unknown, message: string): DomainError;
    (message: string): (cause: unknown) => DomainError;
  } = dual(
    2,
    (cause: unknown, message: string) =>
      new DomainError({
        message,
        cause,
      })
  );

  static readonly newMessage = (message: string) => new DomainError({ message });
}
