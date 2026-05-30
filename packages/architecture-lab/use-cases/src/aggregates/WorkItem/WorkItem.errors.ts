/**
 * WorkItem use-case errors.
 *
 * @packageDocumentation
 * @category errors
 * @since 0.0.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { TaggedErrorClass } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.errors");

/**
 * Generic public reason used when internal WorkItem repository details are redacted.
 *
 * @example
 * ```ts
 * import { WORK_ITEM_ACTION_UNAVAILABLE_REASON } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WORK_ITEM_ACTION_UNAVAILABLE_REASON)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const WORK_ITEM_ACTION_UNAVAILABLE_REASON = "WorkItem service is unavailable." as const;

/**
 * Public failure raised when a requested WorkItem is absent.
 *
 * @example
 * ```ts
 * import { WorkItemNotFound } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemNotFound)
 * ```
 *
 * @category errors
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { WorkItemConflict } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemConflict)
 * ```
 *
 * @category errors
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { WorkItemActionRejected } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemActionRejected)
 * ```
 *
 * @category errors
 * @since 0.0.0
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
 * @example
 * ```ts
 * import { WorkItemActionFailed } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemActionFailed)
 * ```
 *
 * @category errors
 * @since 0.0.0
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
 * @example
 * ```ts
 * import type { WorkItemActionError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * const value = {} as WorkItemActionError
 * console.log(value)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export type WorkItemActionError = WorkItemNotFound | WorkItemConflict | WorkItemActionRejected | WorkItemActionFailed;

/**
 * Public WorkItem use-case failure schema.
 *
 * @example
 * ```ts
 * import { WorkItemActionError } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemActionError)
 * ```
 *
 * @category errors
 * @since 0.0.0
 */
export const WorkItemActionError = S.Union([
  WorkItemNotFound,
  WorkItemConflict,
  WorkItemActionRejected,
  WorkItemActionFailed,
]);
