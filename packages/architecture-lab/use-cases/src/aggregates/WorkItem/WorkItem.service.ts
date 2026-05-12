/**
 * WorkItem server-side use-case implementation.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { Effect, pipe } from "effect";
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
import type { WorkItemUseCasesShape } from "./WorkItem.use-cases.js";

const isRepositoryNotFound = S.is(WorkItemRepositoryNotFound);
const isRepositoryConflict = S.is(WorkItemRepositoryConflict);
const isRepositoryUnavailable = S.is(WorkItemRepositoryUnavailable);

/**
 * Translate server and aggregate failures to public action failures.
 *
 * @category use-cases
 * @since 0.0.0
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
 * @since 0.0.0
 */
export const makeWorkItemUseCases = (repository: WorkItemRepositoryShape): WorkItemUseCasesShape => ({
  create: Effect.fn("ArchitectureLab.WorkItemUseCases.create")(function* (command: CreateWorkItemCommand) {
    return yield* pipe(
      Effect.succeed(DomainWorkItem.create(new DomainWorkItem.CreateWorkItemInput(command))),
      Effect.flatMap(repository.create),
      Effect.mapError(toWorkItemActionError)
    );
  }),
  assign: Effect.fn("ArchitectureLab.WorkItemUseCases.assign")(function* (command: AssignWorkItemCommand) {
    return yield* mutateStoredWorkItem(repository, command.id, (workItem) =>
      DomainWorkItem.assign(workItem, command.assignee)
    );
  }),
  complete: Effect.fn("ArchitectureLab.WorkItemUseCases.complete")(function* (command: CompleteWorkItemCommand) {
    return yield* mutateStoredWorkItem(repository, command.id, DomainWorkItem.complete);
  }),
  reopen: Effect.fn("ArchitectureLab.WorkItemUseCases.reopen")(function* (command: ReopenWorkItemCommand) {
    return yield* mutateStoredWorkItem(repository, command.id, DomainWorkItem.reopen);
  }),
  archive: Effect.fn("ArchitectureLab.WorkItemUseCases.archive")(function* (command: ArchiveWorkItemCommand) {
    return yield* mutateStoredWorkItem(repository, command.id, DomainWorkItem.archive);
  }),
  get: Effect.fn("ArchitectureLab.WorkItemUseCases.get")(function* (query: GetWorkItemQuery) {
    return yield* pipe(repository.get(query.id), Effect.mapError(toWorkItemActionError));
  }),
  list: Effect.fn("ArchitectureLab.WorkItemUseCases.list")(function* (query: ListWorkItemsQuery) {
    return yield* pipe(
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
    );
  }),
});
