/**
 * WorkItem RPC handlers.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

import type { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";

/**
 * Build RPC-style WorkItem handlers from the public use-case facade.
 *
 * @example
 * ```ts
 * import { makeWorkItemRpcHandlers } from "@beep/architecture-lab-server/aggregates/WorkItem"
 *
 * console.log(makeWorkItemRpcHandlers)
 * ```
 *
 * @category handlers
 * @since 0.0.0
 */
export const makeWorkItemRpcHandlers = (useCases: WorkItemUseCases.WorkItemUseCasesShape) => ({
  createWorkItem: useCases.create,
  assignWorkItem: useCases.assign,
  completeWorkItem: useCases.complete,
  reopenWorkItem: useCases.reopen,
  archiveWorkItem: useCases.archive,
  getWorkItem: useCases.get,
  listWorkItems: useCases.list,
});
