/**
 * Request and result schemas for the merge-time completion evidence provider.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $RepoCliId } from "@beep/identity/packages";
import * as S from "effect/Schema";
import { MergeGateCheckRun } from "../Yeet/internal/MergeGate.schemas.ts";
import { GoalRequiredCheckFact, GoalRequiredCheckSnapshot } from "./Goals.schemas.ts";

const $I = $RepoCliId.create("commands/Goals/CompletionEvidence.schemas");

/**
 * One GitHub check run on a commit, with its head and timing.
 *
 * **Details**
 *
 * This is the shape the completion observation already fetches from
 * `commits/<head>/check-runs?filter=all`. `filter=all` keeps reruns, so a
 * post-merge rerun cannot erase a pre-merge result.
 *
 * **Example** (Inspect the check-run head field)
 *
 * ```ts
 * import { GoalObservedCheckRun } from "@beep/repo-cli/commands/Goals/CompletionEvidence.schemas"
 * console.log(GoalObservedCheckRun.fields.head_sha)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GoalObservedCheckRun extends S.Opaque<GoalObservedCheckRun, { readonly brand: unique symbol }>()(
  S.Struct({
    ...MergeGateCheckRun.fields,
    head_sha: S.NonEmptyString,
    started_at: S.OptionFromNullOr(S.DateTimeUtcFromString),
    completed_at: S.OptionFromNullOr(S.DateTimeUtcFromString),
  }).pipe(
    $I.annoteSchema("GoalObservedCheckRun", {
      description: "One GitHub check run on a commit, with its head and timing.",
    })
  )
) {}

/**
 * The merge facts the completion observation already holds when it asks for merge-time evidence.
 *
 * **Details**
 *
 * The provider takes the pull request's base ref, merge commit, merge time,
 * accepted head and the check runs the CLI already read. It reads only the
 * ruleset inventory, ruleset history and rule suite itself.
 *
 * **Example** (Inspect the request boundary)
 *
 * ```ts
 * import { GoalMergeTimeEvidenceRequest } from "@beep/repo-cli/commands/Goals/CompletionEvidence.schemas"
 * console.log(GoalMergeTimeEvidenceRequest.fields.mergeCommit)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GoalMergeTimeEvidenceRequest extends S.Opaque<
  GoalMergeTimeEvidenceRequest,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    base: S.NonEmptyString,
    mergeCommit: S.NonEmptyString,
    mergedAt: S.DateTimeUtcFromString,
    acceptedHead: S.NonEmptyString,
    checkRuns: S.Array(GoalObservedCheckRun),
  }).pipe(
    $I.annoteSchema("GoalMergeTimeEvidenceRequest", {
      description: "Merge facts and check runs the completion observation already holds.",
    })
  )
) {}

/**
 * The merge-time required-check inventory and the head-bound result of every required context.
 *
 * **Details**
 *
 * `requiredChecks` is absent only when no ruleset source could be read at all.
 * `facts` holds one entry per required context, in context order.
 *
 * **Example** (Inspect the evidence result)
 *
 * ```ts
 * import { GoalMergeTimeEvidence } from "@beep/repo-cli/commands/Goals/CompletionEvidence.schemas"
 * console.log(GoalMergeTimeEvidence.fields.facts)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GoalMergeTimeEvidence extends S.Opaque<GoalMergeTimeEvidence, { readonly brand: unique symbol }>()(
  S.Struct({
    requiredChecks: S.Option(GoalRequiredCheckSnapshot),
    facts: S.Array(GoalRequiredCheckFact),
  }).pipe(
    $I.annoteSchema("GoalMergeTimeEvidence", {
      description: "Merge-time required-check inventory with one head-bound fact per required context.",
    })
  )
) {}

/**
 * Inputs to the pure completion-evidence verdict.
 *
 * **Example** (Inspect the verdict input)
 *
 * ```ts
 * import { GoalCompletionEvidenceInput } from "@beep/repo-cli/commands/Goals/CompletionEvidence.schemas"
 * console.log(GoalCompletionEvidenceInput.fields.facts)
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export class GoalCompletionEvidenceInput extends S.Opaque<
  GoalCompletionEvidenceInput,
  { readonly brand: unique symbol }
>()(
  S.Struct({
    acceptedHead: S.Option(S.NonEmptyString),
    mergeCommit: S.Option(S.NonEmptyString),
    requiredChecks: S.Option(GoalRequiredCheckSnapshot),
    facts: S.Array(GoalRequiredCheckFact),
  }).pipe(
    $I.annoteSchema("GoalCompletionEvidenceInput", {
      description: "Accepted head, merge commit, stored merge-time inventory and head-bound facts for the verdict.",
    })
  )
) {}
