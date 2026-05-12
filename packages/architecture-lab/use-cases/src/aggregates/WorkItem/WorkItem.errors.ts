/**
 * WorkItem use-case errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.1.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.errors");

/**
 * Public failure raised when a requested WorkItem is absent.
 *
 * @category errors
 * @since 0.1.0
 */
export class WorkItemNotFound extends TaggedErrorClass<WorkItemNotFound>($I`WorkItemNotFound`)(
  "WorkItemNotFound",
  {
    workItemId: DomainWorkItem.WorkItemId,
  },
  $I.annote("WorkItemNotFound", {
    title: "WorkItem not found",
    description: "The requested architecture lab WorkItem does not exist.",
  })
) {}

/**
 * Public failure raised when a command conflicts with persisted state.
 *
 * @category errors
 * @since 0.1.0
 */
export class WorkItemConflict extends TaggedErrorClass<WorkItemConflict>($I`WorkItemConflict`)(
  "WorkItemConflict",
  {
    workItemId: DomainWorkItem.WorkItemId,
    reason: S.String,
  },
  $I.annote("WorkItemConflict", {
    title: "WorkItem conflict",
    description: "The requested WorkItem command conflicts with persisted state.",
  })
) {}

/**
 * Public failure raised when the domain rejects a WorkItem action.
 *
 * @category errors
 * @since 0.1.0
 */
export class WorkItemActionRejected extends TaggedErrorClass<WorkItemActionRejected>($I`WorkItemActionRejected`)(
  "WorkItemActionRejected",
  {
    workItemId: DomainWorkItem.WorkItemId,
    reason: S.String,
  },
  $I.annote("WorkItemActionRejected", {
    title: "WorkItem action rejected",
    description: "The WorkItem aggregate rejected the requested action.",
  })
) {}

/**
 * Public failure raised when an action cannot be completed.
 *
 * @category errors
 * @since 0.1.0
 */
export class WorkItemActionFailed extends TaggedErrorClass<WorkItemActionFailed>($I`WorkItemActionFailed`)(
  "WorkItemActionFailed",
  {
    reason: S.String,
  },
  $I.annote("WorkItemActionFailed", {
    title: "WorkItem action failed",
    description: "The WorkItem use-case action could not be completed.",
  })
) {}

/**
 * Public WorkItem use-case failure.
 *
 * @category errors
 * @since 0.1.0
 */
export type WorkItemActionError = WorkItemNotFound | WorkItemConflict | WorkItemActionRejected | WorkItemActionFailed;

/**
 * Public WorkItem use-case failure schema.
 *
 * @category errors
 * @since 0.1.0
 */
export const WorkItemActionError = S.Union([
  WorkItemNotFound,
  WorkItemConflict,
  WorkItemActionRejected,
  WorkItemActionFailed,
]);
