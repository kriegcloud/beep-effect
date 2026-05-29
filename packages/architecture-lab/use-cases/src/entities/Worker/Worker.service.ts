/**
 * Worker server-side use-case implementation.
 *
 * @packageDocumentation
 * @category use-cases
 * @since 0.0.0
 */

import * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import { A } from "@beep/utils";
import { Effect, pipe } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  WORKER_ACTION_UNAVAILABLE_REASON,
  WorkerActionFailed,
  WorkerConflict,
  WorkerNotFound,
} from "./Worker.errors.js";
import {
  WorkerRepositoryConflict,
  WorkerRepositoryNotFound,
  WorkerRepositoryUnavailable,
} from "./Worker.repository.js";
import type { CreateWorkerCommand, GetWorkerQuery, ListWorkersQuery } from "./Worker.commands.js";
import type { WorkerActionError } from "./Worker.errors.js";
import type { WorkerRepositoryError, WorkerRepositoryShape } from "./Worker.repository.js";
import type { WorkerUseCasesShape } from "./Worker.use-cases.js";

const isRepositoryNotFound = S.is(WorkerRepositoryNotFound);
const isRepositoryConflict = S.is(WorkerRepositoryConflict);
const isRepositoryUnavailable = S.is(WorkerRepositoryUnavailable);

/**
 * Translate repository failures to public Worker action failures.
 *
 * @example
 * ```ts
 * import { toWorkerActionError } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(toWorkerActionError)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const toWorkerActionError = (error: WorkerRepositoryError): WorkerActionError => {
  if (isRepositoryNotFound(error)) {
    return WorkerNotFound.make({ workerId: error.workerId });
  }
  if (isRepositoryConflict(error)) {
    return WorkerConflict.make({ workerId: error.workerId, reason: error.reason });
  }
  if (isRepositoryUnavailable(error)) {
    return WorkerActionFailed.make({ reason: WORKER_ACTION_UNAVAILABLE_REASON });
  }
  return WorkerActionFailed.make({ reason: "Unknown Worker repository failure." });
};

/**
 * Build Worker use-cases from the server repository port.
 *
 * @example
 * ```ts
 * import { makeWorkerUseCases } from "@beep/architecture-lab-use-cases/entities/Worker/server"
 *
 * console.log(makeWorkerUseCases)
 * ```
 *
 * @category use-cases
 * @since 0.0.0
 */
export const makeWorkerUseCases = (repository: WorkerRepositoryShape): WorkerUseCasesShape => ({
  create: Effect.fn("ArchitectureLab.WorkerUseCases.create")(function* (command: CreateWorkerCommand) {
    return yield* pipe(
      Effect.succeed(DomainWorker.create(DomainWorker.CreateWorkerInput.make(command))),
      Effect.flatMap(repository.create),
      Effect.mapError(toWorkerActionError)
    );
  }),
  get: Effect.fn("ArchitectureLab.WorkerUseCases.get")(function* (query: GetWorkerQuery) {
    return yield* pipe(repository.get(query.id), Effect.mapError(toWorkerActionError));
  }),
  list: Effect.fn("ArchitectureLab.WorkerUseCases.list")(function* (query: ListWorkersQuery) {
    return yield* pipe(
      repository.list,
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
    );
  }),
});
