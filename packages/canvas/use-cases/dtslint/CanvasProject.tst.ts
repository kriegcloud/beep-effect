import { CanvasProject } from "@beep/canvas-use-cases/public";
import { expect } from "tstyche";
import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";

declare const canvasProjectId: DomainCanvasProject.CanvasProjectId;
declare const canvasNode: DomainCanvasProject.CanvasNode;
declare const canvasProject: DomainCanvasProject.CanvasProject;

expect(
  CanvasProject.CreateCanvasProjectCommand.make({
    id: canvasProjectId,
    title: "Document topology",
  })
).type.toBe<CanvasProject.CreateCanvasProjectCommand>();

expect(
  CanvasProject.AddCanvasNodeCommand.make({
    id: canvasProjectId,
    node: canvasNode,
  })
).type.toBe<CanvasProject.AddCanvasNodeCommand>();

expect(
  CanvasProject.RestoreCanvasProjectCommand.make({ scene: canvasProject })
).type.toBe<CanvasProject.RestoreCanvasProjectCommand>();

expect<"CanvasProjectRepository">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"makeCanvasProjectUseCases">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"toCanvasProjectActionError">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
