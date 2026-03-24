/**
 * Generic domain error for operations that fail for non-file-specific reasons.
 *
 * Use this for JSON parse failures, glob failures, and other operational
 * errors where a more specific error type is not warranted.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("errors/DomainError");

/**
 * A generic domain-level error with an optional underlying cause.
 *
 * @category CrossCutting
 * @since 0.0.0
 */
export class DomainError extends TaggedErrorClass<DomainError>($I`DomainError`)(
  "DomainError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("DomainError", {
    title: "Domain Error",
    description:
      "A generic domain-level error with an optional underlying cause for JSON parse failures, glob failures, and other operational errors.",
  })
) {}
// bench
