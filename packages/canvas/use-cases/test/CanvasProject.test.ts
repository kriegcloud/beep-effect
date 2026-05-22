import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProject } from "@beep/canvas-use-cases/public";
import * as CanvasProjectServer from "@beep/canvas-use-cases/server";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeCanvasProjectId = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId);
const decodeCanvasNodeId = S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId);

const makeRepository = (
  canvasProjectId: DomainCanvasProject.CanvasProjectId
): CanvasProjectServer.CanvasProject.CanvasProjectRepositoryShape => {
  const initial = DomainCanvasProject.create(
    new DomainCanvasProject.CreateCanvasProjectInput({
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
            new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId: canvasProject.id })
          ),
    get: (id) =>
      id === current.id
        ? Effect.succeed(current)
        : Effect.fail(new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId: id })),
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
            new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable({
              reason: "insert CanvasProject failed against canvas_project",
            })
          ),
        get: () =>
          Effect.fail(
            new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable({
              reason: "select CanvasProject failed against canvas_project",
            })
          ),
        list: Effect.fail(
          new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable({
            reason: "list CanvasProject failed against canvas_project",
          })
        ),
        save: () =>
          Effect.fail(
            new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryUnavailable({
              reason: "update CanvasProject failed against canvas_project",
            })
          ),
      });

      const error = yield* useCases
        .create(
          new CanvasProject.CreateCanvasProjectCommand({
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
            new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryConflict({
              canvasProjectId,
              reason: "canvas_project already contains canvas-project-1",
            })
          ),
        get: () =>
          Effect.fail(new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId })),
        list: Effect.succeed([]),
        save: () =>
          Effect.fail(new CanvasProjectServer.CanvasProject.CanvasProjectRepositoryNotFound({ canvasProjectId })),
      });

      const error = yield* useCases
        .create(
          new CanvasProject.CreateCanvasProjectCommand({
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
          new CanvasProject.GetCanvasProjectQuery({
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
      yield* useCases.archive(new CanvasProject.ArchiveCanvasProjectCommand({ id: canvasProjectId }));

      const error = yield* useCases
        .addNode(
          new CanvasProject.AddCanvasNodeCommand({
            id: canvasProjectId,
            node: new DomainCanvasProject.CanvasNode({
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
      const restoredScene = new DomainCanvasProject.CanvasProject({
        id: canvasProjectId,
        nodes: [
          new DomainCanvasProject.CanvasNode({
            id: canvasNodeId,
            kind: "asset",
            label: "Restored node",
          }),
        ],
        status: "open",
        title: "Restored scene",
      });

      const restored = yield* useCases.restore(new CanvasProject.RestoreCanvasProjectCommand({ scene: restoredScene }));
      const loaded = yield* useCases.get(new CanvasProject.GetCanvasProjectQuery({ id: canvasProjectId }));

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
      const importedScene = new DomainCanvasProject.CanvasProject({
        id: importedCanvasProjectId,
        nodes: [],
        status: "open",
        title: "Imported scene",
      });

      const imported = yield* useCases.restore(new CanvasProject.RestoreCanvasProjectCommand({ scene: importedScene }));
      const loaded = yield* useCases.get(new CanvasProject.GetCanvasProjectQuery({ id: importedCanvasProjectId }));

      expect(imported.title).toBe("Imported scene");
      expect(loaded.id).toBe("imported-scene");
    })
  );
});
