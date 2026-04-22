/**
 * Workflow contracts used by repo run orchestration.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { IndexRepoRunInput, IndexRun, QueryRepoRunInput, QueryRun, RunStreamFailure } from "@beep/repo-memory-model";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Workflow from "effect/unstable/workflow/Workflow";

let workflowVersion = "cluster-first-v0";

/**
 * Set the deterministic workflow version prefix used for repo-run execution ids.
 *
 * @example
 * ```ts
 * import { setRepoRunWorkflowVersion } from "../../src/internal/RepoRunWorkflowContracts.js"
 *
 * setRepoRunWorkflowVersion("cluster-first-v1")
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const setRepoRunWorkflowVersion = (value: string): void => {
  workflowVersion = value;
};

/**
 * Workflow contract for deterministic repository indexing runs.
 *
 * @example
 * ```ts
 * import { IndexRepoRunWorkflow } from "../../src/internal/RepoRunWorkflowContracts.js"
 *
 * const workflow = IndexRepoRunWorkflow
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export const IndexRepoRunWorkflow = Workflow.make({
  name: "IndexRepoRun",
  payload: IndexRepoRunInput,
  success: IndexRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.sourceFingerprint,
      O.getOrElse(() => payload.repoId),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Workflow contract for deterministic repository query runs.
 *
 * @example
 * ```ts
 * import { QueryRepoRunWorkflow } from "../../src/internal/RepoRunWorkflowContracts.js"
 *
 * const workflow = QueryRepoRunWorkflow
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export const QueryRepoRunWorkflow = Workflow.make({
  name: "QueryRepoRun",
  payload: QueryRepoRunInput,
  success: QueryRun,
  error: RunStreamFailure,
  idempotencyKey: (payload) =>
    pipe(
      payload.questionFingerprint,
      O.getOrElse(() => Str.toLowerCase(Str.trim(payload.question))),
      (fingerprint) => `${workflowVersion}:${payload.repoId}:${fingerprint}`
    ),
});

/**
 * Tuple of workflow contracts exposed by the repo run service.
 *
 * @example
 * ```ts
 * import { RepoRunWorkflows } from "../../src/internal/RepoRunWorkflowContracts.js"
 *
 * const workflows = RepoRunWorkflows
 * ```
 *
 * @since 0.0.0
 * @category port contract
 */
export const RepoRunWorkflows = [IndexRepoRunWorkflow, QueryRepoRunWorkflow] as const;
