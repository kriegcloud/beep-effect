/**
 * Service contracts for goal completion GitHub reads and merge-time evidence.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type { YeetCommandError } from "../Yeet/Yeet.errors.ts";
import type { GoalMergeTimeEvidence, GoalMergeTimeEvidenceRequest } from "./CompletionEvidence.schemas.ts";

const $I = $RepoCliId.create("commands/Goals/CompletionEvidence.service");

/**
 * Supplies read-only GitHub and git observations; fixture providers never contact the network.
 *
 * **Example** (Inspect the observation port)
 *
 * ```ts
 * import { GoalCompletionIo } from "@beep/repo-cli/commands/Goals/CompletionEvidence.service"
 * console.log(typeof GoalCompletionIo.of)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class GoalCompletionIo extends Context.Service<
  GoalCompletionIo,
  {
    readonly github: (root: string, args: ReadonlyArray<string>) => Effect.Effect<string, YeetCommandError>;
    readonly git: (root: string, args: ReadonlyArray<string>) => Effect.Effect<string, YeetCommandError>;
  }
>()($I`GoalCompletionIo`) {}

/**
 * Operations a merge-time evidence provider supplies.
 *
 * @category models
 * @since 0.0.0
 */
export type GoalMergeTimeEvidenceProviderShape = {
  readonly observe: (root: string, request: GoalMergeTimeEvidenceRequest) => Effect.Effect<GoalMergeTimeEvidence>;
};

/**
 * Reads the merge-time required-check inventory and binds each required context to the accepted head.
 *
 * **Details**
 *
 * The provider never fails: a failed or partial read is recorded as an
 * evidence gap so the verdict stays unknown. The live layer reads GitHub's
 * rule suite for the merge push, the current ruleset inventory and each
 * ruleset's history version at merge through {@link GoalCompletionIo} (or the
 * `gh` adapter when no port is provided). Tests provide `GoalCompletionIo`
 * with recorded fixtures.
 *
 * **Example** (Read the service key)
 *
 * ```ts
 * import { GoalMergeTimeEvidenceProvider } from "@beep/repo-cli/commands/Goals/CompletionEvidence.service"
 * console.log(GoalMergeTimeEvidenceProvider.key)
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class GoalMergeTimeEvidenceProvider extends Context.Service<
  GoalMergeTimeEvidenceProvider,
  GoalMergeTimeEvidenceProviderShape
>()($I`GoalMergeTimeEvidenceProvider`) {}
