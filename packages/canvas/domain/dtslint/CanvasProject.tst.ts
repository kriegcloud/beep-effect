import * as CanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import * as WorkPriority from "@beep/canvas-domain/values/WorkPriority";
import * as O from "effect/Option";
import { expect } from "tstyche";

declare const canvasProjectId: CanvasProject.CanvasProjectId;

const canvasProject = CanvasProject.create(
  new CanvasProject.CreateCanvasProjectInput({
    id: canvasProjectId,
    title: "Document topology",
    priority: O.some(WorkPriority.WorkPriority.Enum.normal),
  })
);

expect(canvasProject.status).type.toBe<CanvasProject.CanvasProjectStatus>();
expect(canvasProject).type.toBe<CanvasProject.CanvasProject>();
