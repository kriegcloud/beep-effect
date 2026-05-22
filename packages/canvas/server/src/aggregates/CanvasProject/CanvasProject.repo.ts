/**
 * CanvasProject repository adapter.
 *
 * @packageDocumentation
 * @category repositories
 * @since 0.0.0
 */

import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import * as CanvasProjectUseCaseServer from "@beep/canvas-use-cases/server";
import { A } from "@beep/utils";
import { Effect, HashMap, Ref } from "effect";
import * as O from "effect/Option";

const CANVAS_PROJECT_STORE_NAME = "canvas_project";

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
    const store = yield* Ref.make(
      HashMap.empty<DomainCanvasProject.CanvasProjectId, DomainCanvasProject.CanvasProject>()
    );

    return CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepository.of({
      create: Effect.fn("Canvas.CanvasProjectRepository.create")(function* (canvasProject) {
        const inserted = yield* Ref.modify(store, (current) => {
          if (O.isSome(HashMap.get(current, canvasProject.id))) {
            return [O.none<DomainCanvasProject.CanvasProject>(), current] as const;
          }
          return [O.some(canvasProject), HashMap.set(current, canvasProject.id, canvasProject)] as const;
        });
        if (O.isNone(inserted)) {
          return yield* new CanvasProjectUseCaseServer.CanvasProject.CanvasProjectRepositoryConflict({
            canvasProjectId: canvasProject.id,
            reason: `${CANVAS_PROJECT_STORE_NAME} already contains ${canvasProject.id}`,
          });
        }
        return inserted.value;
      }),
      get: Effect.fn("Canvas.CanvasProjectRepository.get")(function* (id) {
        return yield* getStoredCanvasProject(store, id);
      }),
      list: Effect.gen(function* () {
        const canvasProjects = yield* Ref.get(store);
        return A.fromIterable(HashMap.values(canvasProjects));
      }).pipe(Effect.withSpan("Canvas.CanvasProjectRepository.list")),
      save: Effect.fn("Canvas.CanvasProjectRepository.save")(function* (canvasProject) {
        yield* getStoredCanvasProject(store, canvasProject.id);
        yield* Ref.update(store, (canvasProjects) => HashMap.set(canvasProjects, canvasProject.id, canvasProject));
        return canvasProject;
      }),
    });
  }
);

/**
 * Build the default CanvasProject repository for normal slice tests.
 *
 * @category repositories
 * @since 0.0.0
 */
export const makeCanvasProjectRepository = makeInMemoryCanvasProjectRepository;
