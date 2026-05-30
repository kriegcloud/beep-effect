/**
 * WorkItem use-case service.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Context } from "effect";
import type * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import type { Effect } from "effect";
import type {
  ArchiveWorkItemCommand,
  AssignWorkItemCommand,
  CompleteWorkItemCommand,
  CreateWorkItemCommand,
  GetWorkItemQuery,
  ListWorkItemsQuery,
  ReopenWorkItemCommand,
} from "./WorkItem.commands.js";
import type { WorkItemActionError } from "./WorkItem.errors.js";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.use-cases");

/**
 * Public WorkItem use-case contract.
 *
 * @example
 * ```ts
 * import type { WorkItemUseCasesShape } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * const value = {} as WorkItemUseCasesShape
 * console.log(value)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export interface WorkItemUseCasesShape {
  readonly archive: (command: ArchiveWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly assign: (command: AssignWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly complete: (command: CompleteWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly create: (command: CreateWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly get: (query: GetWorkItemQuery) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
  readonly list: (
    query: ListWorkItemsQuery
  ) => Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemActionError>;
  readonly reopen: (command: ReopenWorkItemCommand) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError>;
}

/**
 * Public WorkItem use-case service.
 *
 * @example
 * ```ts
 * import { WorkItemUseCases } from "@beep/architecture-lab-use-cases/aggregates/WorkItem"
 *
 * console.log(WorkItemUseCases)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export class WorkItemUseCases extends Context.Service<WorkItemUseCases, WorkItemUseCasesShape>()(
  $I`WorkItemUseCases`
) {}
