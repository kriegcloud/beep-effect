import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProjectServer, makeCanvasProjectHttpHandlers } from "@beep/canvas-server/aggregates/CanvasProject";
import { CanvasServerTest } from "@beep/canvas-server/test";
import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import * as S from "effect/Schema";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const decodeCanvasProjectId = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId);
const decodeCanvasNodeId = S.decodeUnknownEffect(DomainCanvasProject.CanvasNodeId);

describe("CanvasProject server", () => {
  it.effect(
    "redacts unavailable details from HTTP failure bodies",
    Effect.fnUntraced(function* () {
      const id = yield* decodeCanvasProjectId("canvas-project-1");
      const unavailable = new CanvasProjectUseCases.CanvasProjectActionFailed({
        reason: "select CanvasProject failed against canvas_project",
      });
      const failUnavailable = () => Effect.fail(unavailable);
      const handlers = makeCanvasProjectHttpHandlers({
        addNode: failUnavailable,
        archive: failUnavailable,
        create: failUnavailable,
        get: failUnavailable,
        list: failUnavailable,
        removeNode: failUnavailable,
        restore: failUnavailable,
      });

      const response = yield* handlers.get(new CanvasProjectUseCases.GetCanvasProjectQuery({ id }));
      const body = response.body as CanvasProjectUseCases.CanvasProjectActionFailed;

      expect(response.status).toBe(503);
      expect(body._tag).toBe("CanvasProjectActionFailed");
      expect(body.reason).toBe(CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON);
      expect(body.reason).not.toContain("canvas_project");
    })
  );

  it.effect(
    "provides a configured CanvasProject use-case facade",
    Effect.fnUntraced(function* () {
      const server = yield* CanvasProjectServer;
      const id = yield* decodeCanvasProjectId("canvas-project-1");
      const nodeId = yield* decodeCanvasNodeId("node-1");
      const canvasProject = yield* server.create(
        new CanvasProjectUseCases.CreateCanvasProjectCommand({
          id,
          title: "Document topology",
        })
      );
      const withNode = yield* server.addNode(
        new CanvasProjectUseCases.AddCanvasNodeCommand({
          id: canvasProject.id,
          node: new DomainCanvasProject.CanvasNode({
            id: nodeId,
            kind: "note",
            label: "Opening note",
          }),
        })
      );

      expect(canvasProject.status).toBe("open");
      expect(withNode.nodes).toHaveLength(1);
    }, provideScopedLayer(CanvasServerTest))
  );
});
