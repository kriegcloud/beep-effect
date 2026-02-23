/**
 * Generic domain error for operations that fail for non-file-specific reasons.
 *
 * Use this for JSON parse failures, glob failures, and other operational
 * errors where a more specific error type is not warranted.
 *
 * @since 0.0.0
 * @category errors
 */
import * as S from "effect/Schema";

/**
 * A generic domain-level error with an optional underlying cause.
 *
 * @since 0.0.0
 * @category errors
 */
export class DomainError extends S.TaggedErrorClass<DomainError>("@beep/repo-utils/errors/DomainError/DomainError")(
  "DomainError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  {
    title: "Domain Error",
    description:
      "A generic domain-level error with an optional underlying cause for JSON parse failures, glob failures, and other operational errors.",
  }
) {}
// bench
