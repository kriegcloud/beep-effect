/**
 * WorkItem client facade.
 *
 * @packageDocumentation
 * @category clients
 * @since 0.1.0
 */

import type * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import type { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { $ArchitectureLabClientId } from "@beep/identity/packages";
import { Context, type Effect } from "effect";

const $I = $ArchitectureLabClientId.create("aggregates/WorkItem/WorkItem.client");

/**
 * Client transport contract for WorkItem commands and queries.
 *
 * @category clients
 * @since 0.1.0
 */
export interface WorkItemClientTransport {
  readonly archive: (
    command: WorkItemUseCases.ArchiveWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly assign: (
    command: WorkItemUseCases.AssignWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly complete: (
    command: WorkItemUseCases.CompleteWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly create: (
    command: WorkItemUseCases.CreateWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly get: (
    query: WorkItemUseCases.GetWorkItemQuery
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
  readonly list: (
    query: WorkItemUseCases.ListWorkItemsQuery
  ) => Effect.Effect<ReadonlyArray<DomainWorkItem.WorkItem>, WorkItemUseCases.WorkItemActionError>;
  readonly reopen: (
    command: WorkItemUseCases.ReopenWorkItemCommand
  ) => Effect.Effect<DomainWorkItem.WorkItem, WorkItemUseCases.WorkItemActionError>;
}

/**
 * WorkItem client facade.
 *
 * @category clients
 * @since 0.1.0
 */
export interface WorkItemClientShape extends WorkItemClientTransport {}

/**
 * WorkItem client service.
 *
 * @category clients
 * @since 0.1.0
 */
export class WorkItemClient extends Context.Service<WorkItemClient, WorkItemClientShape>()($I`WorkItemClient`) {}

/**
 * Build a client facade over a WorkItem transport.
 *
 * @category clients
 * @since 0.1.0
 */
export const makeWorkItemClient = (transport: WorkItemClientTransport): WorkItemClientShape => ({
  create: transport.create,
  assign: transport.assign,
  complete: transport.complete,
  reopen: transport.reopen,
  archive: transport.archive,
  get: transport.get,
  list: transport.list,
});
