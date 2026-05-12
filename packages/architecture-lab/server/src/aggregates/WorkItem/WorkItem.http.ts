/**
 * WorkItem HTTP handlers.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.1.0
 */

import { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { Effect } from "effect";
import * as S from "effect/Schema";

const isNotFound = S.is(WorkItemUseCases.WorkItemNotFound);
const isConflict = S.is(WorkItemUseCases.WorkItemConflict);
const isActionRejected = S.is(WorkItemUseCases.WorkItemActionRejected);

/**
 * Minimal HTTP response envelope used by the architecture lab proof.
 *
 * @category handlers
 * @since 0.1.0
 */
export interface WorkItemHttpResponse {
  readonly body: unknown;
  readonly status: 200 | 201 | 404 | 409 | 422 | 503;
}

/**
 * Convert a public WorkItem failure to an HTTP response envelope.
 *
 * @category handlers
 * @since 0.1.0
 */
export const toWorkItemHttpError = (error: WorkItemUseCases.WorkItemActionError): WorkItemHttpResponse => {
  if (isNotFound(error)) {
    return { status: 404, body: error };
  }
  if (isConflict(error)) {
    return { status: 409, body: error };
  }
  if (isActionRejected(error)) {
    return { status: 422, body: error };
  }
  return { status: 503, body: error };
};

const toSuccess =
  (status: 200 | 201) =>
  (body: unknown): WorkItemHttpResponse => ({ status, body });

/**
 * Build HTTP-style WorkItem handlers from the public use-case facade.
 *
 * @category handlers
 * @since 0.1.0
 */
export const makeWorkItemHttpHandlers = (useCases: WorkItemUseCases.WorkItemUseCasesShape) => ({
  create: (command: WorkItemUseCases.CreateWorkItemCommand): Effect.Effect<WorkItemHttpResponse> =>
    useCases.create(command).pipe(
      Effect.match({
        onFailure: toWorkItemHttpError,
        onSuccess: toSuccess(201),
      })
    ),
  get: (query: WorkItemUseCases.GetWorkItemQuery): Effect.Effect<WorkItemHttpResponse> =>
    useCases.get(query).pipe(
      Effect.match({
        onFailure: toWorkItemHttpError,
        onSuccess: toSuccess(200),
      })
    ),
});
