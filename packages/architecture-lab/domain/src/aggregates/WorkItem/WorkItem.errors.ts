/**
 * WorkItem domain errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import { $ArchitectureLabDomainId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";
import { WorkItemId, WorkItemStatus } from "./WorkItem.values.js";

const $I = $ArchitectureLabDomainId.create("aggregates/WorkItem/WorkItem.errors");

/**
 * Failure raised when a command attempts to mutate an archived WorkItem.
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkItemAlreadyArchived extends TaggedErrorClass<WorkItemAlreadyArchived>($I`WorkItemAlreadyArchived`)(
  "WorkItemAlreadyArchived",
  {
    workItemId: WorkItemId,
  },
  $I.annote("WorkItemAlreadyArchived", {
    title: "WorkItem already archived",
    description: "The WorkItem is archived and no further lifecycle transition is allowed.",
  })
) {}

/**
 * Failure raised when a command attempts an unsupported lifecycle transition.
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkItemInvalidTransition extends TaggedErrorClass<WorkItemInvalidTransition>(
  $I`WorkItemInvalidTransition`
)(
  "WorkItemInvalidTransition",
  {
    workItemId: WorkItemId,
    from: WorkItemStatus,
    to: WorkItemStatus,
  },
  $I.annote("WorkItemInvalidTransition", {
    title: "WorkItem invalid transition",
    description: "The requested lifecycle transition is not valid for the current WorkItem state.",
  })
) {
  /**
   * Create a typed WorkItem transition failure from lifecycle values.
   *
   * @category errors
   * @since 0.0.0
   */
  static fromStatus(input: {
    readonly workItemId: WorkItemId;
    readonly from: WorkItemStatus;
    readonly to: WorkItemStatus;
  }) {
    return WorkItemInvalidTransition.make({
      workItemId: input.workItemId,
      from: input.from,
      to: input.to,
    });
  }
}

/**
 * Failure raised when an assignment command omits a valid assignee.
 *
 * @category errors
 * @since 0.0.0
 */
export class WorkItemAssigneeRequired extends TaggedErrorClass<WorkItemAssigneeRequired>($I`WorkItemAssigneeRequired`)(
  "WorkItemAssigneeRequired",
  {
    workItemId: WorkItemId,
  },
  $I.annote("WorkItemAssigneeRequired", {
    title: "WorkItem assignee required",
    description: "Assigning a WorkItem requires a valid Worker identity.",
  })
) {}

/**
 * WorkItem aggregate domain failure.
 *
 * @category errors
 * @since 0.0.0
 */
export type WorkItemDomainError = WorkItemAlreadyArchived | WorkItemInvalidTransition | WorkItemAssigneeRequired;

/**
 * WorkItem aggregate domain failure schema.
 *
 * @category errors
 * @since 0.0.0
 */
export const WorkItemDomainError = S.Union([
  WorkItemAlreadyArchived,
  WorkItemInvalidTransition,
  WorkItemAssigneeRequired,
]);
