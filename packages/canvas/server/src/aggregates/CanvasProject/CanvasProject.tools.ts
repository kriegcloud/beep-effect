/**
 * CanvasProject tool handlers.
 *
 * @packageDocumentation
 * @category tools
 * @since 0.0.0
 */

import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";

/**
 * CanvasProject tool names exposed by the canvas bootstrap proof.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 *
 * console.log(CanvasProject.CanvasProjectToolNames.restore)
 * ```
 *
 * @category tools
 * @since 0.0.0
 */
export const CanvasProjectToolNames = {
  addNode: "canvas.project.node.add",
  archive: "canvas.project.archive",
  create: "canvas.project.create",
  get: "canvas.project.get",
  list: "canvas.project.list",
  removeNode: "canvas.project.node.remove",
  restore: "canvas.project.restore",
} as const;

/**
 * Build tool-style CanvasProject handlers from the public use-case facade.
 *
 * @example
 * ```ts
 * import { CanvasProject } from "@beep/canvas-server"
 * import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public"
 *
 * declare const useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape
 * const handlers = CanvasProject.makeCanvasProjectToolHandlers(useCases)
 * console.log(handlers[CanvasProject.CanvasProjectToolNames.restore])
 * ```
 *
 * @category tools
 * @since 0.0.0
 */
export const makeCanvasProjectToolHandlers = (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => ({
  [CanvasProjectToolNames.addNode]: useCases.addNode,
  [CanvasProjectToolNames.archive]: useCases.archive,
  [CanvasProjectToolNames.create]: useCases.create,
  [CanvasProjectToolNames.get]: useCases.get,
  [CanvasProjectToolNames.list]: useCases.list,
  [CanvasProjectToolNames.removeNode]: useCases.removeNode,
  [CanvasProjectToolNames.restore]: useCases.restore,
});
