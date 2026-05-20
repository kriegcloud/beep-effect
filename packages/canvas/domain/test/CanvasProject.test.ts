import * as CanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { describe, expect, it } from "@effect/vitest";
import { Effect } from "effect";
import * as S from "effect/Schema";

const decodeCanvasProjectId = S.decodeUnknownEffect(CanvasProject.CanvasProjectId);
const decodeCanvasNodeId = S.decodeUnknownEffect(CanvasProject.CanvasNodeId);

const makeCanvasProject = (id: CanvasProject.CanvasProjectId) =>
  CanvasProject.create(
    new CanvasProject.CreateCanvasProjectInput({
      id,
      title: "Document topology",
    })
  );

describe("CanvasProject aggregate", () => {
  it.effect("adds and removes bootstrap node metadata", () =>
    Effect.gen(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const canvasNodeId = yield* decodeCanvasNodeId("node-1");
      const node = new CanvasProject.CanvasNode({
        id: canvasNodeId,
        kind: "note",
        label: "Opening note",
      });

      const withNode = yield* CanvasProject.addNode(makeCanvasProject(canvasProjectId), node);
      expect(withNode.nodes).toHaveLength(1);
      expect(withNode.nodes[0]?.id).toBe(canvasNodeId);

      const withoutNode = yield* CanvasProject.removeNode(withNode, canvasNodeId);
      expect(withoutNode.nodes).toHaveLength(0);
    })
  );

  it.effect("rejects mutating an archived CanvasProject", () =>
    Effect.gen(function* () {
      const canvasProjectId = yield* decodeCanvasProjectId("canvas-project-1");
      const canvasNodeId = yield* decodeCanvasNodeId("node-1");
      const archived = yield* CanvasProject.archive(makeCanvasProject(canvasProjectId));
      const exit = yield* CanvasProject.addNode(
        archived,
        new CanvasProject.CanvasNode({
          id: canvasNodeId,
          kind: "shape",
          label: "Archived node",
        })
      ).pipe(Effect.exit);
      expect(exit._tag).toBe("Failure");
    })
  );
});
