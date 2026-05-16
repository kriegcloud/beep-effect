import * as CanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import * as Worker from "@beep/canvas-domain/entities/Worker";
import * as WorkPriority from "@beep/canvas-domain/values/WorkPriority";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const decodeCanvasProjectId = S.decodeUnknownEffect(CanvasProject.CanvasProjectId);
const decodeWorkerId = S.decodeUnknownEffect(Worker.WorkerId);

const makeCanvasProject = (id: CanvasProject.CanvasProjectId) =>
  CanvasProject.create(
    new CanvasProject.CreateCanvasProjectInput({
      id,
      title: "Document topology",
      priority: O.some(WorkPriority.WorkPriority.Enum.high),
    })
  );

describe("CanvasProject aggregate", () => {
  it.effect("moves through assignment, completion, reopen, and archive", () =>
    Effect.gen(function* () {
      const workerId = yield* decodeWorkerId(1);
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const assigned = yield* CanvasProject.assign(makeCanvasProject(canvasProjectId), workerId);
      expect(assigned.status).toBe("assigned");
      expect(O.getOrThrow(assigned.assignee)).toBe(workerId);
      expect(O.getOrThrow(assigned.priority)).toBe("high");

      const completed = yield* CanvasProject.complete(assigned);
      expect(completed.status).toBe("completed");

      const reopened = yield* CanvasProject.reopen(completed);
      expect(reopened.status).toBe("open");

      const archived = yield* CanvasProject.archive(reopened);
      expect(archived.status).toBe("archived");
    })
  );

  it.effect("rejects reopening an archived CanvasProject", () =>
    Effect.gen(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const archived = yield* CanvasProject.archive(makeCanvasProject(canvasProjectId));
      const exit = yield* CanvasProject.reopen(archived).pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    })
  );
});
