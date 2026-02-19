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
import * as Data from "effect/Data";

/**
 * Raised when topological sorting or cycle detection finds circular
 * dependencies in the workspace dependency graph.
 *
 * @since 0.0.0
 * @category errors
 */
export class CyclicDependencyError extends Data.TaggedError("CyclicDependencyError")<{
  readonly message: string;
  readonly cycles: ReadonlyArray<ReadonlyArray<string>>;
}> {}
