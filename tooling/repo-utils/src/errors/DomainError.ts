/**
 * Generic domain error for operations that fail for non-file-specific reasons.
 *
 * Use this for JSON parse failures, glob failures, and other operational
 * errors where a more specific error type is not warranted.
 *
 * @since 0.0.0
 * @category errors
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("errors/DomainError");

/**
 * A generic domain-level error with an optional underlying cause.
 *
 * @since 0.0.0
 * @category errors
 */
export class DomainError extends S.TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    message: S.String,
    cause: S.optional(S.Unknown),
  },
  $I.annote("DomainError", {
    title: "Domain Error",
    description:
      "A generic domain-level error with an optional underlying cause for JSON parse failures, glob failures, and other operational errors.",
  })
) {}
// bench
