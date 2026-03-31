import { IndexRepoRunInput, IndexRun, QueryRepoRunInput, QueryRun, RunStreamFailure } from "@beep/repo-memory-model";
import { pipe } from "effect";
import * as O from "effect/Option";
import * as Str from "effect/String";
import * as Workflow from "effect/unstable/workflow/Workflow";

let workflowVersion = "cluster-first-v0";

/**
 * Set the deterministic workflow version prefix used for repo-run execution ids.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const setRepoRunWorkflowVersion = (value: string): void => {
  workflowVersion = value;
};

/**
 * Workflow contract for deterministic repository indexing runs.
 *
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category PortContract
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
 * @since 0.0.0
 * @category PortContract
 */
export const RepoRunWorkflows = [IndexRepoRunWorkflow, QueryRepoRunWorkflow] as const;
