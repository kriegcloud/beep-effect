import * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProjectServer, makeCanvasProjectHttpHandlers } from "@beep/canvas-server/aggregates/CanvasProject";
import { CanvasServerTest } from "@beep/canvas-server/test";
import { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option as O } from "effect";
import * as S from "effect/Schema";

const decodeCanvasProjectId = S.decodeUnknownEffect(DomainCanvasProject.CanvasProjectId);

describe("CanvasProject server", () => {
  it.effect("redacts unavailable details from HTTP failure bodies", () =>
    Effect.gen(function* () {
      const id = yield* decodeCanvasProjectId("canvas-project-1");
      const unavailable = new CanvasProjectUseCases.CanvasProjectActionFailed({
        reason: "select CanvasProject failed against canvas_canvas_project",
      });
      const failUnavailable = () => Effect.fail(unavailable);
      const handlers = makeCanvasProjectHttpHandlers({
        archive: failUnavailable,
        assign: failUnavailable,
        complete: failUnavailable,
        create: failUnavailable,
        get: failUnavailable,
        list: failUnavailable,
        reopen: failUnavailable,
      });

      const response = yield* handlers.get(new CanvasProjectUseCases.GetCanvasProjectQuery({ id }));
      const body = response.body as CanvasProjectUseCases.CanvasProjectActionFailed;

      expect(response.status).toBe(503);
      expect(body._tag).toBe("CanvasProjectActionFailed");
      expect(body.reason).toBe(CanvasProjectUseCases.CANVAS_PROJECT_ACTION_UNAVAILABLE_REASON);
      expect(body.reason).not.toContain("canvas_canvas_project");
    })
  );

  it.effect("provides a configured CanvasProject use-case facade", () =>
    Effect.gen(function* () {
      const server = yield* CanvasProjectServer;
      const id = yield* decodeCanvasProjectId("canvas-project-1");
      const canvasProject = yield* server.create(
        new CanvasProjectUseCases.CreateCanvasProjectCommand({
          id,
          title: "Document topology",
        })
      );

      expect(canvasProject.status).toBe("open");
      expect(O.isNone(canvasProject.assignee)).toBe(true);
    }).pipe(Effect.provide(CanvasServerTest))
  );
});
