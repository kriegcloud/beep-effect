/**
 * Safe failures for reviewer credentials and GitHub operations.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Reviewer/Reviewer.errors");

/**
 * Reports an operation without retaining HTTP headers, response bodies, or secret process output.
 *
 * **Example** (Describe a failed operation)
 * ```ts
 * import { ReviewerError } from "@beep/repo-cli/commands/Reviewer";
 * console.log(ReviewerError.make({ message: "Token exchange failed", operation: "token" }).operation);
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ReviewerError extends S.TaggedError<ReviewerError>($I`ReviewerError`)(
  "ReviewerError",
  {
    operation: S.String,
    message: S.String,
  },
  $I.annote("ReviewerError", { description: "A sanitized reviewer operation failure." })
) {}
