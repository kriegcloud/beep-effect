/**
 * Error raised when a cyclic dependency is detected in the workspace
 * dependency graph.
 *
 * Contains the list of cycles found, where each cycle is an ordered
 * array of package names forming the loop.
 *
 * @since 0.0.0
 * @category errors
 */
import { $RepoUtilsId } from "@beep/identity/packages";
import * as S from "effect/Schema";

const $I = $RepoUtilsId.create("errors/CyclicDependencyError");

/**
 * Raised when topological sorting or cycle detection finds circular
 * dependencies in the workspace dependency graph.
 *
 * @since 0.0.0
 * @category errors
 */
export class CyclicDependencyError extends S.TaggedErrorClass<CyclicDependencyError>($I`CyclicDependencyError`)(
  "CyclicDependencyError",
  {
    message: S.String,
    cycles: S.Array(S.Array(S.String)),
  },
  $I.annote("CyclicDependencyError", {
    title: "Cyclic Dependency Error",
    description:
      "Raised when topological sorting or cycle detection finds circular\ndependencies in the workspace dependency graph.",
  })
) {}
// bench
