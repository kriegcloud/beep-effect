import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProject } from "@beep/canvas-use-cases/public";
import { expect } from "tstyche";

declare const canvasProjectId: DomainCanvasProject.CanvasProjectId;
declare const canvasNode: DomainCanvasProject.CanvasNode;
declare const canvasProject: DomainCanvasProject.CanvasProject;

expect(
  new CanvasProject.CreateCanvasProjectCommand({
    id: canvasProjectId,
    title: "Document topology",
  })
).type.toBe<CanvasProject.CreateCanvasProjectCommand>();

expect(
  new CanvasProject.AddCanvasNodeCommand({
    id: canvasProjectId,
    node: canvasNode,
  })
).type.toBe<CanvasProject.AddCanvasNodeCommand>();

expect(
  new CanvasProject.RestoreCanvasProjectCommand({ scene: canvasProject })
).type.toBe<CanvasProject.RestoreCanvasProjectCommand>();

expect<"CanvasProjectRepository">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"makeCanvasProjectUseCases">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"toCanvasProjectActionError">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
