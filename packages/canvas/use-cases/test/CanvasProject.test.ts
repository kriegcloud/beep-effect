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
    create: (canvasProject) => Effect.succeed(canvasProject),
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
    list: () => Effect.succeed([current]),
  };
};

describe("CanvasProject use-cases", () => {
  it.effect("redacts repository unavailable details at the public action boundary", () =>
    Effect.gen(function* () {
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
        list: () =>
          Effect.fail(
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
      expect(error.reason).toBe(CanvasProject.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON);
    })
  );

  it.effect("translates repository not-found failures to public failures", () =>
    Effect.gen(function* () {
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

  it.effect("keeps archived projects terminal at the use-case boundary", () =>
    Effect.gen(function* () {
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
});
