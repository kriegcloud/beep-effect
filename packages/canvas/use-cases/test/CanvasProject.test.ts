import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProject } from "@beep/canvas-use-cases/public";
import * as CanvasProjectServer from "@beep/canvas-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeCanvasProjectId = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId);
const decodeCanvasNodeId = S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId);

const makeRepository = (
  canvasProjectId: DomainCanvasProject.CanvasProjectId
): CanvasProjectServer.CanvasProject.CanvasProjectRepositoryShape => {
  const initial = DomainCanvasProject.create(
    DomainCanvasProject.CreateCanvasProjectInput.make({
      id: canvasProjectId,
      title: "Document topology",
    })
  );
  let current = initial;
  return {
    create: (canvasProject) =>
      Effect.sync(() => {
        current = canvasProject;
        return canvasProject;
      }),
    save: (canvasProject) =>
      canvasProject.id === current.id
        ? Effect.sync(() => {
            current = canvasProject;
            return canvasProject;
          })
        : Effect.fail(
            CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound.make({
              canvasProjectId: canvasProject.id,
            })
          ),
    get: (id) =>
      id === current.id
        ? Effect.succeed(current)
        : Effect.fail(CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound.make({ canvasProjectId: id })),
    list: Effect.sync(() => [current]),
  };
};

describe("CanvasProject use-cases", () => {
  it.effect(
    "redacts repository unavailable details at the public action boundary",
    Effect.fnUntraced(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases({
        create: () =>
          Effect.fail(
            CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable.make({
              reason: "insert CanvasProject failed against canvas_project",
            })
          ),
        get: () =>
          Effect.fail(
            CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable.make({
              reason: "select CanvasProject failed against canvas_project",
            })
          ),
        list: Effect.fail(
          CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable.make({
            reason: "list CanvasProject failed against canvas_project",
          })
        ),
        save: () =>
          Effect.fail(
            CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable.make({
              reason: "update CanvasProject failed against canvas_project",
            })
          ),
      });

      const error = yield* useCases
        .create(
          CanvasProject.CreateCanvasProjectCommand.make({
            id: canvasProjectId,
            title: "Document topology",
          })
        )
        .pipe(Effect.flip);

      expect(error._tag).toBe("CanvasProjectActionFailed");
      if (error._tag !== "CanvasProjectActionFailed") {
        return;
      }
      expect(error.reason).toBe(CanvasProject.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON);
    })
  );

  it.effect(
    "redacts repository conflict details at the public action boundary",
    Effect.fnUntraced(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases({
        create: () =>
          Effect.fail(
            CanvasProjectServer.CanvasProject.CanvasProjectRepositoryConflict.make({
              canvasProjectId,
              reason: "canvas_project already contains canvas-project-1",
            })
          ),
        get: () =>
          Effect.fail(CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound.make({ canvasProjectId })),
        list: Effect.succeed([]),
        save: () =>
          Effect.fail(CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound.make({ canvasProjectId })),
      });

      const error = yield* useCases
        .create(
          CanvasProject.CreateCanvasProjectCommand.make({
            id: canvasProjectId,
            title: "Document topology",
          })
        )
        .pipe(Effect.flip);

      expect(error._tag).toBe("CanvasProjectConflict");
      if (error._tag !== "CanvasProjectConflict") {
        return;
      }
      expect(error.reason).toBe(CanvasProject.CANVAS_PROJECT_CONFLICT_REASON);
      expect(error.reason).not.toContain("canvas_project");
    })
  );

  it.effect(
    "translates repository not-found failures to public failures",
    Effect.fnUntraced(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const missingCanvasProjectId = yield* decodeCanvasProjectId("missing");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases(makeRepository(canvasProjectId));
      const error = yield* useCases
        .get(
          CanvasProject.GetCanvasProjectQuery.make({
            id: missingCanvasProjectId,
          })
        )
        .pipe(Effect.flip);

      expect(error._tag).toBe("CanvasProjectNotFound");
    })
  );

  it.effect(
    "keeps archived projects terminal at the use-case boundary",
    Effect.fnUntraced(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const canvasNodeId = yield* decodeCanvasNodeId("node-1");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases(makeRepository(canvasProjectId));
      yield* useCases.archive(CanvasProject.ArchiveCanvasProjectCommand.make({ id: canvasProjectId }));

      const error = yield* useCases
        .addNode(
          CanvasProject.AddCanvasNodeCommand.make({
            id: canvasProjectId,
            node: DomainCanvasProject.CanvasNode.make({
              id: canvasNodeId,
              kind: "note",
              label: "Archived node",
            }),
          })
        )
        .pipe(Effect.flip);
      expect(error._tag).toBe("CanvasProjectActionRejected");
    })
  );

  it.effect(
    "restores a CanvasProject snapshot through the public use-case contract",
    Effect.fnUntraced(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const canvasNodeId = yield* decodeCanvasNodeId("restored-node");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases(makeRepository(canvasProjectId));
      const restoredScene = DomainCanvasProject.create(
        DomainCanvasProject.CreateCanvasProjectInput.make({
          id: canvasProjectId,
          nodes: O.some([
            DomainCanvasProject.CanvasNode.make({
              id: canvasNodeId,
              kind: "asset",
              label: "Restored node",
            }),
          ]),
          title: "Restored scene",
        })
      );

      const restored = yield* useCases.restore(
        CanvasProject.RestoreCanvasProjectCommand.make({ scene: restoredScene })
      );
      const loaded = yield* useCases.get(CanvasProject.GetCanvasProjectQuery.make({ id: canvasProjectId }));

      expect(restored.title).toBe("Restored scene");
      expect(loaded.nodes.map((node) => node.id)).toEqual(["restored-node"]);
    })
  );

  it.effect(
    "imports a missing CanvasProject snapshot through restore",
    Effect.fnUntraced(function* () {
      const existingCanvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const importedCanvasProjectId = yield* decodeCanvasProjectId("imported-scene");
      const useCases = CanvasProjectServer.CanvasProject.makeCanvasProjectUseCases(
        makeRepository(existingCanvasProjectId)
      );
      const importedScene = DomainCanvasProject.create(
        DomainCanvasProject.CreateCanvasProjectInput.make({
          id: importedCanvasProjectId,
          title: "Imported scene",
        })
      );

      const imported = yield* useCases.restore(
        CanvasProject.RestoreCanvasProjectCommand.make({ scene: importedScene })
      );
      const loaded = yield* useCases.get(CanvasProject.GetCanvasProjectQuery.make({ id: importedCanvasProjectId }));

      expect(imported.title).toBe("Imported scene");
      expect(loaded.id).toBe("imported-scene");
    })
  );
});
