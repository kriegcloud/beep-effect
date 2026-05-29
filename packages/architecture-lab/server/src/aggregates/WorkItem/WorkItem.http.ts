/**
 * WorkItem HTTP handlers.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

import { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { $ArchitectureLabServerId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { Effect } from "effect";
import * as S from "effect/Schema";

const $I = $ArchitectureLabServerId.create("aggregates/WorkItem/WorkItem.http");

const isNotFound = S.is(WorkItemUseCases.WorkItemNotFound);
const isConflict = S.is(WorkItemUseCases.WorkItemConflict);
const isActionRejected = S.is(WorkItemUseCases.WorkItemActionRejected);
const serviceUnavailableBody = WorkItemUseCases.WorkItemActionFailed.make({
  reason: WorkItemUseCases.WORK_ITEM_ACTION_UNAVAILABLE_REASON,
});

/**
 * HTTP status values emitted by the WorkItem proof protocol adapter.
 *
 * @category handlers
 * @since 0.0.0
 */
export const WorkItemHttpStatus = LiteralKit([200, 201, 404, 409, 422, 503]).pipe(
  $I.annoteSchema("WorkItemHttpStatus", {
    title: "WorkItem HTTP status",
    description: "HTTP status vocabulary emitted by the WorkItem proof protocol adapter.",
  })
);

/**
 * Runtime type for {@link WorkItemHttpStatus}.
 *
 * @category handlers
 * @since 0.0.0
 */
export type WorkItemHttpStatus = typeof WorkItemHttpStatus.Type;

/**
 * Minimal HTTP response envelope used by the architecture lab proof.
 *
 * @category handlers
 * @since 0.0.0
 */
export class WorkItemHttpResponse extends S.Class<WorkItemHttpResponse>($I`WorkItemHttpResponse`)(
  {
    body: S.Unknown,
    status: WorkItemHttpStatus,
  },
  {
    title: "WorkItem HTTP response",
    description: "Minimal protocol response envelope used by the architecture lab proof.",
  }
) {}

/**
 * Convert a public WorkItem failure to an HTTP response envelope.
 *
 * @category handlers
 * @since 0.0.0
 */
export const toWorkItemHttpError = (error: WorkItemUseCases.WorkItemActionError): WorkItemHttpResponse => {
  if (isNotFound(error)) {
    return WorkItemHttpResponse.make({ status: 404, body: error });
  }
  if (isConflict(error)) {
    return WorkItemHttpResponse.make({ status: 409, body: error });
  }
  if (isActionRejected(error)) {
    return WorkItemHttpResponse.make({ status: 422, body: error });
  }
  return WorkItemHttpResponse.make({ status: 503, body: serviceUnavailableBody });
};

const toSuccess =
  (status: 200 | 201) =>
  (body: unknown): WorkItemHttpResponse =>
    WorkItemHttpResponse.make({ status, body });

/**
 * Build HTTP-style WorkItem handlers from the public use-case facade.
 *
 * @category handlers
 * @since 0.0.0
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
