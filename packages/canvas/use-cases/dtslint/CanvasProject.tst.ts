import type * as DomainCanvasProject from "@beep/canvas-domain/aggregates/CanvasProject";
import { CanvasProject } from "@beep/canvas-use-cases/public";
import { expect } from "tstyche";

declare const canvasProjectId: DomainCanvasProject.CanvasProjectId;

expect(
  new CanvasProject.CreateCanvasProjectCommand({
    id: canvasProjectId,
    title: "Document topology",
  })
).type.toBe<CanvasProject.CreateCanvasProjectCommand>();

expect<"CanvasProjectRepository">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"makeCanvasProjectUseCases">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
expect<"toCanvasProjectActionError">().type.not.toBeAssignableTo<keyof typeof CanvasProject>();
