/**
 * CanvasProject RPC handlers.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.0.0
 */

import type { CanvasProject as CanvasProjectUseCases } from "@beep/canvas-use-cases/public";

/**
 * Build RPC-style CanvasProject handlers from the public use-case facade.
 *
 * @category handlers
 * @since 0.0.0
 */
export const makeCanvasProjectRpcHandlers = (useCases: CanvasProjectUseCases.CanvasProjectUseCasesShape) => ({
  addCanvasNode: useCases.addNode,
  archiveCanvasProject: useCases.archive,
  createCanvasProject: useCases.create,
  getCanvasProject: useCases.get,
  listCanvasProjects: useCases.list,
  removeCanvasNode: useCases.removeNode,
});
