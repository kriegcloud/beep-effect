/**
 * WorkItem use-case service.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.1.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Context, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type {
  ArchiveWorkItemCommand,
  AssignWorkItemCommand,
  CompleteWorkItemCommand,
  CreateWorkItemCommand,
  GetWorkItemQuery,
  ListWorkItemsQuery,
  ReopenWorkItemCommand,
} from "./WorkItem.commands.js";
import {
  type WorkItemActionError,
  WorkItemActionFailed,
  WorkItemActionRejected,
  WorkItemConflict,
  WorkItemNotFound,
} from "./WorkItem.errors.js";
import {
  WorkItemRepositoryConflict,
  type WorkItemRepositoryError,
  WorkItemRepositoryNotFound,
  type WorkItemRepositoryShape,
  WorkItemRepositoryUnavailable,
} from "./WorkItem.repository.js";

const $I = $ArchitectureLabUseCasesId.create("aggregates/WorkItem/WorkItem.use-cases");
const isRepositoryNotFound = S.is(WorkItemRepositoryNotFound);
const isRepositoryConflict = S.is(WorkItemRepositoryConflict);
const isRepositoryUnavailable = S.is(WorkItemRepositoryUnavailable);

/**
 * Public WorkItem use-case contract.
 *
 * @category use-cases
 * @since 0.1.0
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
 * @category use-cases
 * @since 0.1.0
 */
export class WorkItemUseCases extends Context.Service<WorkItemUseCases, WorkItemUseCasesShape>()(
  $I`WorkItemUseCases`
) {}

/**
 * Translate server and aggregate failures to public action failures.
 *
 * @category use-cases
 * @since 0.1.0
 */
export const toWorkItemActionError = (
  error: WorkItemRepositoryError | DomainWorkItem.WorkItemDomainError
): WorkItemActionError => {
  if (isRepositoryNotFound(error)) {
    return new WorkItemNotFound({ workItemId: error.workItemId });
  }
  if (isRepositoryConflict(error)) {
    return new WorkItemConflict({ workItemId: error.workItemId, reason: error.reason });
  }
  if (isRepositoryUnavailable(error)) {
    return new WorkItemActionFailed({ reason: error.reason });
  }
  return new WorkItemActionRejected({
    workItemId: error.workItemId,
    reason: error._tag,
  });
};

const mutateStoredWorkItem = (
  repository: WorkItemRepositoryShape,
  id: DomainWorkItem.WorkItemId,
  transition: (
    workItem: DomainWorkItem.WorkItem
  ) => Effect.Effect<DomainWorkItem.WorkItem, DomainWorkItem.WorkItemDomainError>
): Effect.Effect<DomainWorkItem.WorkItem, WorkItemActionError> =>
  pipe(
    repository.get(id),
    Effect.flatMap(transition),
    Effect.flatMap(repository.save),
    Effect.mapError(toWorkItemActionError)
  );

/**
 * Build WorkItem use-cases from the server repository port.
 *
 * @category use-cases
 * @since 0.1.0
 */
export const makeWorkItemUseCases = (repository: WorkItemRepositoryShape): WorkItemUseCasesShape => ({
  create: (command) =>
    pipe(
      Effect.succeed(DomainWorkItem.create(new DomainWorkItem.CreateWorkItemInput(command))),
      Effect.flatMap(repository.create),
      Effect.mapError(toWorkItemActionError)
    ),
  assign: (command) =>
    mutateStoredWorkItem(repository, command.id, (workItem) => DomainWorkItem.assign(workItem, command.assignee)),
  complete: (command) => mutateStoredWorkItem(repository, command.id, DomainWorkItem.complete),
  reopen: (command) => mutateStoredWorkItem(repository, command.id, DomainWorkItem.reopen),
  archive: (command) => mutateStoredWorkItem(repository, command.id, DomainWorkItem.archive),
  get: (query) => pipe(repository.get(query.id), Effect.mapError(toWorkItemActionError)),
  list: (query) =>
    pipe(
      repository.list(),
      Effect.map((workItems) =>
        pipe(
          query.status,
          O.match({
            onNone: () => workItems,
            onSome: (status) => A.filter(workItems, (workItem) => workItem.status === status),
          })
        )
      ),
      Effect.mapError(toWorkItemActionError)
    ),
});
