/**
 * Tagged errors for the Graphiti command suite.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import { Runtime } from "effect";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Graphiti/Graphiti.errors"); /**
 * Raised when graphiti proxy configuration cannot be loaded.
 *
 * @example
 * ```ts
 * console.log("GraphitiProxyConfigLoadError")
 * ```
 * @category models
 * @since 0.0.0
 */
export class GraphitiProxyConfigLoadError extends TaggedErrorClass<GraphitiProxyConfigLoadError>(
  $I`GraphitiProxyConfigLoadError`
)(
  "GraphitiProxyConfigLoadError",
  {
    message: S.String,
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("GraphitiProxyConfigLoadError", {
    description: "Raised when graphiti proxy config cannot be decoded from Effect Config values.",
  })
) {
  static readonly new = (message: string) => (cause: unknown) =>
    new GraphitiProxyConfigLoadError({
      message,
      cause,
    });
}

/**
 * Typed failure for Graphiti proxy operational helpers.
 *
 * @example
 * ```ts
 * import { GraphitiProxyOpsError } from "@beep/repo-cli/commands/Graphiti/internal/ProxyOps"
 * const error = new GraphitiProxyOpsError({ message: "failed" })
 * ```
 * @category errors
 * @since 0.0.0
 */
export class GraphitiProxyOpsError extends TaggedErrorClass<GraphitiProxyOpsError>($I`GraphitiProxyOpsError`)(
  "GraphitiProxyOpsError",
  {
    message: S.String,
    command: S.optionalKey(S.String),
    exitCode: S.optionalKey(S.Number),
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("GraphitiProxyOpsError", {
    description: "Failure raised while managing the local Graphiti proxy.",
  })
) {
  /** Process exit code reported when this error reaches the runtime boundary. */
  override readonly [Runtime.errorExitCode] = this.exitCode ?? 1;
}
