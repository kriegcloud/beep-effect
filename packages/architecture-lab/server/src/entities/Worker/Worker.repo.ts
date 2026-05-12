/**
 * Worker repository adapter.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.1.0
 */

import type * as DomainWorker from "@beep/architecture-lab-domain/entities/Worker";
import {
  fromWorkerRow,
  toWorkerInsert,
  WORKER_TABLE_NAME,
  workerTable,
} from "@beep/architecture-lab-tables/entities/Worker";
import * as WorkerUseCaseServer from "@beep/architecture-lab-use-cases/server";
import { PostgresDrizzle, type PostgresDrizzleDatabase } from "@beep/postgres";
import { eq } from "drizzle-orm";
import { Effect, HashMap, pipe, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";

type WorkerStore = HashMap.HashMap<DomainWorker.WorkerId, DomainWorker.Worker>;

const getStoredWorker = Effect.fn("ArchitectureLab.WorkerRepository.getStored")(function* (
  store: Ref.Ref<WorkerStore>,
  id: DomainWorker.WorkerId
) {
  const workers = yield* Ref.get(store);
  const found = HashMap.get(workers, id);
  if (O.isNone(found)) {
    return yield* new WorkerUseCaseServer.Worker.WorkerRepositoryNotFound({ workerId: id });
  }
  return found.value;
});

/**
 * Build the in-memory Worker repository used by the fast architecture lab proof.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeInMemoryWorkerRepository = Effect.fn("ArchitectureLab.WorkerRepository.makeInMemory")(function* () {
  const store = yield* Ref.make(HashMap.empty<DomainWorker.WorkerId, DomainWorker.Worker>());

  return WorkerUseCaseServer.Worker.WorkerRepository.of({
    create: Effect.fn("ArchitectureLab.WorkerRepository.create")(function* (worker) {
      const workers = yield* Ref.get(store);
      if (O.isSome(HashMap.get(workers, worker.id))) {
        return yield* new WorkerUseCaseServer.Worker.WorkerRepositoryConflict({
          workerId: worker.id,
          reason: `${WORKER_TABLE_NAME} already contains ${worker.id}`,
        });
      }
      yield* Ref.update(store, (current) => HashMap.set(current, worker.id, worker));
      return worker;
    }),
    get: Effect.fn("ArchitectureLab.WorkerRepository.get")(function* (id) {
      return yield* getStoredWorker(store, id);
    }),
    list: Effect.fn("ArchitectureLab.WorkerRepository.list")(function* () {
      const workers = yield* Ref.get(store);
      return A.fromIterable(HashMap.values(workers));
    }),
  });
});

const repositoryUnavailable = (operation: string) =>
  Effect.mapError(
    () =>
      new WorkerUseCaseServer.Worker.WorkerRepositoryUnavailable({
        reason: `${operation} failed against ${WORKER_TABLE_NAME}`,
      })
  );

const findDrizzleWorker = Effect.fn("ArchitectureLab.WorkerRepository.findDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainWorker.WorkerId
) {
  const rows = yield* db
    .select()
    .from(workerTable)
    .where(eq(workerTable.id, id))
    .limit(1)
    .pipe(repositoryUnavailable("select Worker"));

  return pipe(rows, A.head, O.map(fromWorkerRow));
});

const getDrizzleWorker = Effect.fn("ArchitectureLab.WorkerRepository.getDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainWorker.WorkerId
) {
  const found = yield* findDrizzleWorker(db, id);
  if (O.isNone(found)) {
    return yield* new WorkerUseCaseServer.Worker.WorkerRepositoryNotFound({ workerId: id });
  }
  return found.value;
});

/**
 * Build a Drizzle-backed Worker repository used by live persistence tests.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeDrizzleWorkerRepository = Effect.fn("ArchitectureLab.WorkerRepository.makeDrizzle")(function* () {
  const db = yield* PostgresDrizzle;

  return WorkerUseCaseServer.Worker.WorkerRepository.of({
    create: Effect.fn("ArchitectureLab.WorkerRepository.drizzleCreate")(function* (worker) {
      const existing = yield* findDrizzleWorker(db, worker.id);
      if (O.isSome(existing)) {
        return yield* new WorkerUseCaseServer.Worker.WorkerRepositoryConflict({
          workerId: worker.id,
          reason: `${WORKER_TABLE_NAME} already contains ${worker.id}`,
        });
      }

      const rows = yield* db
        .insert(workerTable)
        .values(toWorkerInsert(worker))
        .returning()
        .pipe(repositoryUnavailable("insert Worker"));

      return pipe(
        rows,
        A.head,
        O.map(fromWorkerRow),
        O.getOrElse(() => worker)
      );
    }),
    get: Effect.fn("ArchitectureLab.WorkerRepository.drizzleGet")(function* (id) {
      return yield* getDrizzleWorker(db, id);
    }),
    list: Effect.fn("ArchitectureLab.WorkerRepository.drizzleList")(function* () {
      const rows = yield* db.select().from(workerTable).pipe(repositoryUnavailable("list Worker"));
      return A.map(rows, fromWorkerRow);
    }),
  });
});

/**
 * Build the default Worker repository for normal slice tests.
 *
 * @category repositories
 * @since 0.1.0
 */
export const makeWorkerRepository = makeInMemoryWorkerRepository;
