/**
 * Tagged errors for the Ci command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Ci/Ci.errors"); /**
 * Typed failure for CI helper commands.
 *
 * @example
 * ```ts
 * import { CiCommandError } from "@beep/repo-cli/commands/Ci"
 * const error = new CiCommandError({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class CiCommandError extends TaggedErrorClass<CiCommandError>($I`CiCommandError`)(
  "CiCommandError",
  {
    message: S.String,
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("CiCommandError", {
    description: "Failure raised by CI helper commands.",
  })
) {}
