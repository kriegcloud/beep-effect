/**
 * Package entry point for `@beep/architecture-lab-proof`.
 *
 * @packageDocumentation
 * @category workflows
 * @since 0.1.0
 */

import { defaultWorkItemPublicConfig } from "@beep/architecture-lab-config/public";
import type * as DomainWorkItem from "@beep/architecture-lab-domain/aggregates/WorkItem";
import { WorkItemServer } from "@beep/architecture-lab-server/aggregates/WorkItem";
import { ArchitectureLabServerLive } from "@beep/architecture-lab-server/layer";
import { toWorkItemSummaryViewModel } from "@beep/architecture-lab-ui/aggregates/WorkItem";
import { WorkItem as WorkItemUseCases } from "@beep/architecture-lab-use-cases/public";
import { Effect } from "effect";

/**
 * Package version for the architecture lab proof harness.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-proof"
 *
 * console.log(VERSION)
 * ```
 *
 * @category workflows
 * @since 0.1.0
 */
export const VERSION = "0.0.0" as const;

/**
 * App-level WorkItem proof result.
 *
 * @category workflows
 * @since 0.1.0
 */
export interface ArchitectureLabProofResult {
  readonly created: DomainWorkItem.WorkItem;
  readonly summary: ReturnType<typeof toWorkItemSummaryViewModel>;
}

/**
 * App-level layer used by the architecture lab proof harness.
 *
 * @category workflows
 * @since 0.1.0
 */
export const ArchitectureLabProofLive: typeof ArchitectureLabServerLive = ArchitectureLabServerLive;

/**
 * Execute the architecture lab proof harness against the composed server layer.
 *
 * @category workflows
 * @since 0.1.0
 */
export const runArchitectureLabProof: Effect.Effect<
  ArchitectureLabProofResult,
  WorkItemUseCases.WorkItemActionError,
  WorkItemServer
> = Effect.gen(function* () {
  const server = yield* WorkItemServer;
  const created = yield* server.create(
    new WorkItemUseCases.CreateWorkItemCommand({
      id: "architecture-lab-proof-1" as DomainWorkItem.WorkItemId,
      title: "Prove canonical slice topology",
    })
  );
  return {
    created,
    summary: toWorkItemSummaryViewModel(created, defaultWorkItemPublicConfig),
  };
});
