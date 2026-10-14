/**
 * Typed failures at the observability command boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Observability/Observability.errors");

/**
 * A file read, declaration import, or document encode failed while building
 * the instrumentation catalog.
 *
 * **Example** (Describe a failed declaration import)
 *
 * ```ts
 * import { ObservabilityCommandError } from "@beep/repo-cli/commands/Observability"
 *
 * const error = ObservabilityCommandError.make({
 *   path: "apps/desktop/src/Desktop.instruments.ts",
 *   message: "Failed to import instrument declarations."
 * })
 * console.log(error.path) // "apps/desktop/src/Desktop.instruments.ts"
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export class ObservabilityCommandError extends S.TaggedError<ObservabilityCommandError>($I`ObservabilityCommandError`)(
  "ObservabilityCommandError",
  { path: S.String, message: S.String, cause: S.optionalKey(S.Defect({ includeStack: true })) },
  $I.annoteError<ObservabilityCommandError>("ObservabilityCommandError", {
    description: "Instrumentation catalog build failed on a file, import or encode step.",
  })
) {}
