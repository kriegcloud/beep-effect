/**
 * WorkItem UI read models for architecture-lab proof screens.
 *
 * @remarks
 * The declarations in this module are intentionally presentation-shaped:
 * domain identifiers and statuses are preserved, while display labels and
 * visible action keys are derived for browser-safe consumers.
 *
 * @packageDocumentation
 * @category read-models
 * @since 0.0.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUiId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { A, Str } from "@beep/utils";
import { pipe } from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { WorkItemPublicConfig } from "@beep/architecture-lab-config/public";

const $I = $ArchitectureLabUiId.create("aggregates/WorkItem/WorkItem.view-model");

/**
 * Closed action vocabulary the WorkItem UI may expose for a summary row.
 *
 * @example
 * ```ts
 * import { WorkItemVisibleAction } from "@beep/architecture-lab-ui/aggregates/WorkItem"
 * import * as S from "effect/Schema"
 *
 * const action = S.decodeUnknownSync(WorkItemVisibleAction)("archive")
 *
 * if (action !== WorkItemVisibleAction.Enum.archive) {
 *   throw new Error("expected archive to be a visible WorkItem action")
 * }
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export const WorkItemVisibleAction = LiteralKit(["assign", "complete", "reopen", "archive"]).pipe(
  $I.annoteSchema("WorkItemVisibleAction", {
    title: "WorkItem visible action",
    description: "Action key exposed by the architecture lab WorkItem UI view model.",
  })
);

/**
 * Runtime type for {@link WorkItemVisibleAction}.
 *
 * @example
 * ```ts
 * import {
 *   WorkItemVisibleAction,
 *   type WorkItemVisibleAction as WorkItemVisibleActionValue
 * } from "@beep/architecture-lab-ui/aggregates/WorkItem"
 *
 * const action: WorkItemVisibleActionValue = WorkItemVisibleAction.Enum.assign
 * const visibleActions: ReadonlyArray<WorkItemVisibleActionValue> = [action]
 * const visibleActionList = visibleActions.join(",")
 *
 * console.log(visibleActionList) // "assign"
 *
 * if (visibleActions[0] !== "assign") {
 *   throw new Error("expected typed visible action evidence")
 * }
 * ```
 *
 * @category value-objects
 * @since 0.0.0
 */
export type WorkItemVisibleAction = typeof WorkItemVisibleAction.Type;

/**
 * Client-renderable summary for a canonical WorkItem aggregate.
 *
 * @example
 * ```ts
 * import {
 *   WorkItemSummaryViewModel,
 *   WorkItemVisibleAction
 * } from "@beep/architecture-lab-ui/aggregates/WorkItem"
 * import {
 *   WorkItemId,
 *   WorkItemTitle
 * } from "@beep/architecture-lab-domain/aggregates/WorkItem"
 * import * as O from "effect/Option"
 * import * as S from "effect/Schema"
 *
 * const summary = WorkItemSummaryViewModel.make({
 *   id: S.decodeUnknownSync(WorkItemId)("work-item-1"),
 *   title: S.decodeUnknownSync(WorkItemTitle)("Document topology"),
 *   status: "assigned",
 *   statusLabel: "ASSIGNED",
 *   assigneeLabel: O.some("Assigned to 1"),
 *   visibleActions: [WorkItemVisibleAction.Enum.complete]
 * })
 *
 * if (summary.statusLabel !== "ASSIGNED") {
 *   throw new Error("expected display-ready WorkItem status")
 * }
 * ```
 *
 * @category read-models
 * @since 0.0.0
 */
export class WorkItemSummaryViewModel extends S.Class<WorkItemSummaryViewModel>($I`WorkItemSummaryViewModel`)(
  {
    id: DomainWorkItem.WorkItemId,
    title: DomainWorkItem.WorkItemTitle,
    status: DomainWorkItem.WorkItemStatus,
    statusLabel: S.String,
    assigneeLabel: S.OptionFromOptionalKey(S.String),
    visibleActions: S.Array(WorkItemVisibleAction),
  },
  $I.annote("WorkItemSummaryViewModel", {
    title: "WorkItem summary view model",
    description: "Client-renderable summary for the canonical architecture lab WorkItem aggregate.",
  })
) {}

const makeStatusLabel: (status: DomainWorkItem.WorkItemStatus) => string = Str.toUpperCase;

const makeVisibleActions = (
  workItem: DomainWorkItem.WorkItem,
  config: WorkItemPublicConfig
): ReadonlyArray<WorkItemVisibleAction> => {
  if (workItem.status === "archived") {
    return [];
  }
  const baseActions: ReadonlyArray<WorkItemVisibleAction> =
    workItem.status === "completed" ? ["reopen", "archive"] : ["assign", "complete", "archive"];
  return pipe(
    baseActions,
    A.filter((action) => action !== "assign" || config.assignmentEnabled),
    A.filter((action) => action !== "reopen" || config.reopenCompletedEnabled)
  );
};

/**
 * Project a domain WorkItem into its UI summary read model.
 *
 * @remarks
 * Supports both data-first and config-first forms. The projection uppercases
 * the status label, formats an assignee label when present, and filters
 * visible actions through the browser-safe public WorkItem config.
 *
 * @example
 * ```ts
 * import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/public"
 * import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem"
 * import { toWorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem"
 * import * as S from "effect/Schema"
 *
 * const toSummary = toWorkItemSummaryViewModel(defaultWorkItemPublicConfig)
 * const workItem = DomainWorkItem.create(
 *   DomainWorkItem.CreateWorkItemInput.make({
 *     id: S.decodeUnknownSync(DomainWorkItem.WorkItemId)("work-item-1"),
 *     title: "Document topology"
 *   })
 * )
 * const summary = toSummary(workItem)
 *
 * if (summary.statusLabel !== "OPEN" || !summary.visibleActions.includes("complete")) {
 *   throw new Error("expected open WorkItem summary actions")
 * }
 * ```
 *
 * @category mappers
 * @since 0.0.0
 */
export const toWorkItemSummaryViewModel: {
  (config: WorkItemPublicConfig): (workItem: DomainWorkItem.WorkItem) => WorkItemSummaryViewModel;
  (workItem: DomainWorkItem.WorkItem, config: WorkItemPublicConfig): WorkItemSummaryViewModel;
} = dual(
  2,
  (workItem: DomainWorkItem.WorkItem, config: WorkItemPublicConfig): WorkItemSummaryViewModel =>
    WorkItemSummaryViewModel.make({
      id: workItem.id,
      title: workItem.title,
      status: workItem.status,
      statusLabel: makeStatusLabel(workItem.status),
      assigneeLabel: pipe(
        workItem.assignee,
        O.map((assignee) => `Assigned to ${assignee}`)
      ),
      visibleActions: makeVisibleActions(workItem, config),
    })
);
