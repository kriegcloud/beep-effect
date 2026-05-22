/**
 * CanvasProject server-side use-case implementation.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { A } from "@beep/utils";
import { Effect, Match, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type {
  AddCanvasNodeCommand,
  ArchiveCanvasProjectCommand,
  CreateCanvasProjectCommand,
  GetCanvasProjectQuery,
  ListCanvasProjectsQuery,
  RemoveCanvasNodeCommand,
  RestoreCanvasProjectCommand,
} from "./CanvasProject.commands.js";
import {
  CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON,
  CANVAS_PROJECT_CONFLICT_REASON,
  type CanvasProjectActionError,
  CanvasProjectActionFailed,
  CanvasProjectActionRejected,
  CanvasProjectConflict,
  CanvasProjectNotFound,
} from "./CanvasProject.errors.js";
import {
  CanvasProjectRepositoryConflict,
  type CanvasProjectRepositoryError,
  CanvasProjectRepositoryNotFound,
  type CanvasProjectRepositoryShape,
  CanvasProjectRepositoryUnavailable,
} from "./CanvasProject.repository.js";
import type { CanvasProjectUseCasesShape } from "./CanvasProject.use-cases.js";

const isRepositoryNotFound = S.is(CanvasProjectRepositoryNotFound);
const isRepositoryConflict = S.is(CanvasProjectRepositoryConflict);
const isRepositoryUnavailable = S.is(CanvasProjectRepositoryUnavailable);

/**
 * Translate server and aggregate failures to public action failures.
 *
 * @example
 * ```ts
 * import { CanvasProject as CanvasProjectServer } from "@beep/canvas-use-cases/server"
 *
 * const error = CanvasProjectServer.toCanvasProjectActionError(
 *   new CanvasProjectServer.CanvasProjectRepositoryUnavailable({ reason: "offline" })
 * )
 * console.log(error._tag)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const toCanvasProjectActionError = (
  error: CanvasProjectRepositoryError | DomainCanvasProject.CanvasProjectDomainError
): CanvasProjectActionError =>
  Match.value(error).pipe(
    Match.when(isRepositoryNotFound, (error) => new CanvasProjectNotFound({ canvasProjectId: error.canvasProjectId })),
    Match.when(
      isRepositoryConflict,
      (error) =>
        new CanvasProjectConflict({
          canvasProjectId: error.canvasProjectId,
          reason: CANVAS_PROJECT_CONFLICT_REASON,
        })
    ),
    Match.when(
      isRepositoryUnavailable,
      () => new CanvasProjectActionFailed({ reason: CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON })
    ),
    Match.orElse(
      (error) =>
        new CanvasProjectActionRejected({
          canvasProjectId: error.canvasProjectId,
          reason: error._tag,
        })
    )
  );

const mutateStoredCanvasProject = (
  repository: CanvasProjectRepositoryShape,
  id: DomainCanvasProject.CanvasProjectId,
  transition: (
    canvasProject: DomainCanvasProject.CanvasProject
  ) => Effect.Effect<DomainCanvasProject.CanvasProject, DomainCanvasProject.CanvasProjectDomainError>
): Effect.Effect<DomainCanvasProject.CanvasProject, CanvasProjectActionError> =>
  pipe(
    repository.get(id),
    Effect.flatMap(transition),
    Effect.flatMap(repository.save),
    Effect.mapError(toCanvasProjectActionError)
  );

/**
 * Build CanvasProject use-cases from the server repository port.
 *
 * @example
 * ```ts
 * import { CanvasProject as CanvasProjectServer } from "@beep/canvas-use-cases/server"
 *
 * declare const repository: CanvasProjectServer.CanvasProjectRepositoryShape
 * const useCases = CanvasProjectServer.makeCanvasProjectUseCases(repository)
 * console.log(Object.keys(useCases))
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const makeCanvasProjectUseCases = (repository: CanvasProjectRepositoryShape): CanvasProjectUseCasesShape => ({
  addNode: Effect.fn("Canvas.CanvasProjectUseCases.addNode")(function* (command: AddCanvasNodeCommand) {
    return yield* mutateStoredCanvasProject(repository, command.id, (canvasProject) =>
      DomainCanvasProject.addNode(canvasProject, command.node)
    );
  }),
  archive: Effect.fn("Canvas.CanvasProjectUseCases.archive")(function* (command: ArchiveCanvasProjectCommand) {
    return yield* mutateStoredCanvasProject(repository, command.id, DomainCanvasProject.archive);
  }),
  create: Effect.fn("Canvas.CanvasProjectUseCases.create")(function* (command: CreateCanvasProjectCommand) {
    return yield* pipe(
      Effect.succeed(DomainCanvasProject.create(new DomainCanvasProject.CreateCanvasProjectInput(command))),
      Effect.flatMap(repository.create),
      Effect.mapError(toCanvasProjectActionError)
    );
  }),
  get: Effect.fn("Canvas.CanvasProjectUseCases.get")(function* (query: GetCanvasProjectQuery) {
    return yield* pipe(repository.get(query.id), Effect.mapError(toCanvasProjectActionError));
  }),
  list: Effect.fn("Canvas.CanvasProjectUseCases.list")(function* (query: ListCanvasProjectsQuery) {
    return yield* pipe(
      repository.list,
      Effect.map((canvasProjects) =>
        pipe(
          query.status,
          O.match({
            onNone: () => canvasProjects,
            onSome: (status) => A.filter(canvasProjects, (canvasProject) => canvasProject.status === status),
          })
        )
      ),
      Effect.mapError(toCanvasProjectActionError)
    );
  }),
  removeNode: Effect.fn("Canvas.CanvasProjectUseCases.removeNode")(function* (command: RemoveCanvasNodeCommand) {
    return yield* mutateStoredCanvasProject(repository, command.id, (canvasProject) =>
      DomainCanvasProject.removeNode(canvasProject, command.nodeId)
    );
  }),
  restore: Effect.fn("Canvas.CanvasProjectUseCases.restore")(function* (command: RestoreCanvasProjectCommand) {
    return yield* repository.save(command.scene).pipe(
      Effect.catchTag("CanvasProjectRepositoryNotFound", () => repository.create(command.scene)),
      Effect.mapError(toCanvasProjectActionError)
    );
  }),
});
