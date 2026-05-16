/**
 * CanvasProject repository adapter.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import { CanvasProjectConfig } from "@beep/canvas-config/layer";
import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import {
  CANVAS_PROJECT_TABLE_NAME,
  canvasProjectTable,
  fromCanvasProjectRow,
  toCanvasProjectInsert,
} from "@beep/canvas-tables/aggregates/CanvasProject";
import * as CanvasProjectUseCaseServer from "@beep/canvas-use-cases/server";
import { PostgresDrizzle, type PostgresDrizzleDatabase } from "@beep/postgres";
import { A } from "@beep/utils";
import { eq } from "drizzle-orm";
import { Effect, HashMap, pipe, Ref } from "effect";
import * as O from "effect/Option";

type CanvasProjectStore = HashMap.HashMap<DomainCanvasProject.CanvasProjectId, DomainCanvasProject.CanvasProject>;

const getStoredCanvasProject = Effect.fn("Canvas.CanvasProjectRepository.getStored")(function* (
  store: Ref.Ref<CanvasProjectStore>,
  id: DomainCanvasProject.CanvasProjectId
) {
  const canvasProjects = yield* Ref.get(store);
  const found = HashMap.get(canvasProjects, id);
  if (O.isNone(found)) {
    return yield* new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId: id });
  }
  return found.value;
});

/**
 * Build the in-memory CanvasProject repository used by the fast canvas proof.
 *
 * @category repositories
 * @since 0.0.0
 */
export const makeInMemoryCanvasProjectRepository = Effect.fn("Canvas.CanvasProjectRepository.makeInMemory")(
  function* () {
    const config = yield* CanvasProjectConfig;
    const store = yield* Ref.make(
      HashMap.empty<DomainCanvasProject.CanvasProjectId, DomainCanvasProject.CanvasProject>()
    );

    return CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepository.of({
      create: Effect.fn("Canvas.CanvasProjectRepository.create")(function* (canvasProject) {
        const canvasProjects = yield* Ref.get(store);
        if (O.isSome(HashMap.get(canvasProjects, canvasProject.id))) {
          return yield* new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryConflict({
            canvasProjectId: canvasProject.id,
            reason: `${config.serverConfig.repositoryName} already contains ${CANVAS_PROJECT_TABLE_NAME}`,
          });
        }
        yield* Ref.update(store, (current) => HashMap.set(current, canvasProject.id, canvasProject));
        return canvasProject;
      }),
      get: Effect.fn("Canvas.CanvasProjectRepository.get")(function* (id) {
        return yield* getStoredCanvasProject(store, id);
      }),
      list: Effect.fn("Canvas.CanvasProjectRepository.list")(function* () {
        const canvasProjects = yield* Ref.get(store);
        return A.fromIterable(HashMap.values(canvasProjects));
      }),
      save: Effect.fn("Canvas.CanvasProjectRepository.save")(function* (canvasProject) {
        yield* getStoredCanvasProject(store, canvasProject.id);
        yield* Ref.update(store, (canvasProjects) => HashMap.set(canvasProjects, canvasProject.id, canvasProject));
        return canvasProject;
      }),
    });
  }
);

const repositoryUnavailable =
  (operation: string) =>
  <A, E, R>(
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryUnavailable, R> =>
    effect.pipe(
      Effect.tapError((cause) =>
        Effect.logDebug("Canvas CanvasProject repository adapter dropped driver failure").pipe(
          Effect.annotateLogs({ operation, table: CANVAS_PROJECT_TABLE_NAME, cause })
        )
      ),
      Effect.mapError(
        () =>
          new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryUnavailable({
            reason: `${operation} failed against ${CANVAS_PROJECT_TABLE_NAME}`,
          })
      )
    );

const findDrizzleCanvasProject = Effect.fn("Canvas.CanvasProjectRepository.findDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainCanvasProject.CanvasProjectId
) {
  const rows = yield* db
    .select()
    .from(canvasProjectTable)
    .where(eq(canvasProjectTable.id, id))
    .limit(1)
    .pipe(repositoryUnavailable("select CanvasProject"));

  return pipe(rows, A.head, O.map(fromCanvasProjectRow));
});

const getDrizzleCanvasProject = Effect.fn("Canvas.CanvasProjectRepository.getDrizzle")(function* (
  db: PostgresDrizzleDatabase,
  id: DomainCanvasProject.CanvasProjectId
) {
  const found = yield* findDrizzleCanvasProject(db, id);
  if (O.isNone(found)) {
    return yield* new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId: id });
  }
  return found.value;
});

/**
 * Build a Drizzle-backed CanvasProject repository used by live persistence tests.
 *
 * @category repositories
 * @since 0.0.0
 */
export const makeDrizzleCanvasProjectRepository = Effect.fn("Canvas.CanvasProjectRepository.makeDrizzle")(function* () {
  const db = yield* PostgresDrizzle;

  return CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepository.of({
    create: Effect.fn("Canvas.CanvasProjectRepository.drizzleCreate")(function* (canvasProject) {
      const existing = yield* findDrizzleCanvasProject(db, canvasProject.id);
      if (O.isSome(existing)) {
        return yield* new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryConflict({
          canvasProjectId: canvasProject.id,
          reason: `${CANVAS_PROJECT_TABLE_NAME} already contains ${canvasProject.id}`,
        });
      }

      const rows = yield* db
        .insert(canvasProjectTable)
        .values(toCanvasProjectInsert(canvasProject))
        .returning()
        .pipe(repositoryUnavailable("insert CanvasProject"));

      return pipe(
        rows,
        A.head,
        O.map(fromCanvasProjectRow),
        O.getOrElse(() => canvasProject)
      );
    }),
    get: Effect.fn("Canvas.CanvasProjectRepository.drizzleGet")(function* (id) {
      return yield* getDrizzleCanvasProject(db, id);
    }),
    list: Effect.fn("Canvas.CanvasProjectRepository.drizzleList")(function* () {
      const rows = yield* db.select().from(canvasProjectTable).pipe(repositoryUnavailable("list CanvasProject"));
      return A.map(rows, fromCanvasProjectRow);
    }),
    save: Effect.fn("Canvas.CanvasProjectRepository.drizzleSave")(function* (canvasProject) {
      yield* getDrizzleCanvasProject(db, canvasProject.id);
      const rows = yield* db
        .update(canvasProjectTable)
        .set(toCanvasProjectInsert(canvasProject))
        .where(eq(canvasProjectTable.id, canvasProject.id))
        .returning()
        .pipe(repositoryUnavailable("update CanvasProject"));

      return pipe(
        rows,
        A.head,
        O.map(fromCanvasProjectRow),
        O.getOrElse(() => canvasProject)
      );
    }),
  });
});

/**
 * Build the default CanvasProject repository for normal slice tests.
 *
 * @category repositories
 * @since 0.0.0
 */
export const makeCanvasProjectRepository = makeInMemoryCanvasProjectRepository;
