/**
 * WorkItem server layer.
 *
 * @packageDocumentation
 * @category layers
 * @since 0.0.0
 */

import type { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import * as WorkItemUseCaseServer from "@beep/architecture-lab-use-cases/server";
import { $ArchitectureLabServerId } from "@beep/identity/packages";
import { Context, Effect, Layer } from "effect";

import { makeWorkItemRepository } from "./WorkItem.repo.js";

const $I = $ArchitectureLabServerId.create("aggregates/WorkItem/WorkItem.layer");

/**
 * Build the WorkItem server facade.
 *
 * @category layers
 * @since 0.0.0
 */
export const makeWorkItemServer = Effect.fn("ArchitectureLab.WorkItemServer.make")(function* () {
  const repository = yield* makeWorkItemRepository();
  return WorkItemUseCaseServer.WorkItem.makeWorkItemUseCases(repository);
});

/**
 * WorkItem server facade service.
 *
 * @category layers
 * @since 0.0.0
 */
export class WorkItemServer extends Context.Service<WorkItemServer, WorkItemUseCases.WorkItemUseCasesShape>()(
  $I`WorkItemServer`
) {}

/**
 * Config-dependent WorkItem server layer.
 *
 * @category layers
 * @since 0.0.0
 */
export const WorkItemServerLayer = Layer.effect(WorkItemServer, makeWorkItemServer());
