/**
 * WorkItem UI view model.
 *
 * @packageDocumentation
 * @category models
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
 * UI action values for the WorkItem proof surface.
 *
 * @category models
 * @since 0.0.0
 */
export const WorkItemVisibleAction = LiteralKit(["assign", "complete", "reopen", "archive"]).pipe(
  $I.annoteSchema("WorkItemVisibleAction", {
    title: "WorkItem visible action",
    description: "Action key exposed by the architecture lab WorkItem UI view model.",
  })
);

/**
 * UI action value for the WorkItem proof surface.
 *
 * @category models
 * @since 0.0.0
 */
export type WorkItemVisibleAction = typeof WorkItemVisibleAction.Type;

/**
 * UI-facing WorkItem summary.
 *
 * @category models
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
 * Create the UI-facing WorkItem summary view model.
 *
 * @category models
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
