/**
 * WorkItem tool handlers.
 *
 * @packageDocumentation
 * @category tools
 * @since 0.0.0
 */

import type { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";

/**
 * WorkItem tool names exposed by the architecture lab proof.
 *
 * @category tools
 * @since 0.0.0
 */
export const WorkItemToolNames = {
  create: "architecture_lab.work_item.create",
  assign: "architecture_lab.work_item.assign",
  complete: "architecture_lab.work_item.complete",
  reopen: "architecture_lab.work_item.reopen",
  archive: "architecture_lab.work_item.archive",
  get: "architecture_lab.work_item.get",
  list: "architecture_lab.work_item.list",
} as const;

/**
 * Build tool-style WorkItem handlers from the public use-case facade.
 *
 * @category tools
 * @since 0.0.0
 */
export const makeWorkItemToolHandlers = (useCases: WorkItemUseCases.WorkItemUseCasesShape) => ({
  [WorkItemToolNames.create]: useCases.create,
  [WorkItemToolNames.assign]: useCases.assign,
  [WorkItemToolNames.complete]: useCases.complete,
  [WorkItemToolNames.reopen]: useCases.reopen,
  [WorkItemToolNames.archive]: useCases.archive,
  [WorkItemToolNames.get]: useCases.get,
  [WorkItemToolNames.list]: useCases.list,
});
