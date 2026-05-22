import * as CanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { expect } from "tstyche";

declare const canvasProjectId: CanvasProject.CanvasProjectId;

const canvasProject = CanvasProject.create(
  CanvasProject.CreateCanvasProjectInput.make({
    id: canvasProjectId,
    title: "Document topology",
  })
);

expect(canvasProject.status).type.toBe<CanvasProject.CanvasProjectStatus>();
expect(canvasProject.nodes).type.toBe<ReadonlyArray<CanvasProject.CanvasNode>>();
expect(canvasProject).type.toBe<CanvasProject.CanvasProject>();
