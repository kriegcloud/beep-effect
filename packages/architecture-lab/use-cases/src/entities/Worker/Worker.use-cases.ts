/**
 * Worker use-case service.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.1.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { $ArchitectureLabUseCasesId } from "@beep/identity/packages";
import { Context, Effect, pipe } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import type { CreateWorkerCommand, GetWorkerQuery, ListWorkersQuery } from "./Worker.commands.js";
import { type WorkerActionError, WorkerActionFailed, WorkerConflict, WorkerNotFound } from "./Worker.errors.js";
import {
  WorkerRepositoryConflict,
  type WorkerRepositoryError,
  WorkerRepositoryNotFound,
  type WorkerRepositoryShape,
  WorkerRepositoryUnavailable,
} from "./Worker.repository.js";

const $I = $ArchitectureLabUseCasesId.create("entities/Worker/Worker.use-cases");
const isRepositoryNotFound = S.is(WorkerRepositoryNotFound);
const isRepositoryConflict = S.is(WorkerRepositoryConflict);
const isRepositoryUnavailable = S.is(WorkerRepositoryUnavailable);

/**
 * Public Worker use-case contract.
 *
 * @category use-cases
 * @since 0.1.0
 */
export interface WorkerUseCasesShape {
  readonly create: (command: CreateWorkerCommand) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly get: (query: GetWorkerQuery) => Effect.Effect<DomainWorker.Worker, WorkerActionError>;
  readonly list: (query: ListWorkersQuery) => Effect.Effect<ReadonlyArray<DomainWorker.Worker>, WorkerActionError>;
}

/**
 * Public Worker use-case service.
 *
 * @category use-cases
 * @since 0.1.0
 */
export class WorkerUseCases extends Context.Service<WorkerUseCases, WorkerUseCasesShape>()($I`WorkerUseCases`) {}

/**
 * Translate repository failures to public Worker action failures.
 *
 * @category use-cases
 * @since 0.1.0
 */
export const toWorkerActionError = (error: WorkerRepositoryError): WorkerActionError => {
  if (isRepositoryNotFound(error)) {
    return new WorkerNotFound({ workerId: error.workerId });
  }
  if (isRepositoryConflict(error)) {
    return new WorkerConflict({ workerId: error.workerId, reason: error.reason });
  }
  if (isRepositoryUnavailable(error)) {
    return new WorkerActionFailed({ reason: error.reason });
  }
  return new WorkerActionFailed({ reason: "Unknown Worker repository failure." });
};

/**
 * Build Worker use-cases from the server repository port.
 *
 * @category use-cases
 * @since 0.1.0
 */
export const makeWorkerUseCases = (repository: WorkerRepositoryShape): WorkerUseCasesShape => ({
  create: (command) =>
    pipe(
      Effect.succeed(DomainWorker.create(new DomainWorker.CreateWorkerInput(command))),
      Effect.flatMap(repository.create),
      Effect.mapError(toWorkerActionError)
    ),
  get: (query) => pipe(repository.get(query.id), Effect.mapError(toWorkerActionError)),
  list: (query) =>
    pipe(
      repository.list(),
      Effect.map((workers) =>
        pipe(
          query.status,
          O.match({
            onNone: () => workers,
            onSome: (status) => A.filter(workers, (worker) => worker.status === status),
          })
        )
      ),
      Effect.mapError(toWorkerActionError)
    ),
});
