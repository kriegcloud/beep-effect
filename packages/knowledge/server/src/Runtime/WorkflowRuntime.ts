import { $KnowledgeServerId } from "@beep/identity/packages";
import { ClusterWorkflowEngine, SingleRunner } from "@effect/cluster";
import { WorkflowEngine } from "@effect/workflow";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Match from "effect/Match";

const $I = $KnowledgeServerId.create("Runtime/WorkflowRuntime");

/**
 * Workflow runtime modes.
 *
 * NOTE:
 * - `engine-memory` uses `WorkflowEngine.layerMemory` (no durable engine state across restarts).
 * - `engine-durable-sql` uses `@effect/cluster`'s `SingleRunner` + `ClusterWorkflowEngine` for
 *   SQL-backed durable engine state (tables auto-migrated via SqlMessageStorage / SqlRunnerStorage).
 *
 * This is intentionally separate from `WorkflowPersistence`, which persists *domain-facing execution
 * records* (status, timestamps, output summaries) for observability and RPC status queries.
 */
export type WorkflowRuntimeMode = "engine-memory" | "engine-durable-sql";

export interface WorkflowRuntimeConfigShape {
  readonly mode: WorkflowRuntimeMode;
}

export class WorkflowRuntimeConfig extends Context.Tag($I`WorkflowRuntimeConfig`)<
  WorkflowRuntimeConfig,
  WorkflowRuntimeConfigShape
>() {}

const thunkEngineMemory = () => "engine-memory" as const;
const decodeMode = Match.type<string>().pipe(
  Match.whenOr("engine", "engine-memory", "memory", thunkEngineMemory),
  Match.whenOr("engine-durable-sql", "durable-sql", "cluster-sql", () => "engine-durable-sql" as const),
  Match.orElse(thunkEngineMemory)
);

export const DEFAULT_WORKFLOW_RUNTIME_MODE: WorkflowRuntimeMode = "engine-memory";

export const WorkflowRuntimeConfigLive = Layer.effect(
  WorkflowRuntimeConfig,
  Effect.gen(function* () {
    const mode = yield* Config.string("KNOWLEDGE_WORKFLOW_MODE").pipe(
      Config.withDefault(DEFAULT_WORKFLOW_RUNTIME_MODE),
      Effect.map(decodeMode)
    );
    return WorkflowRuntimeConfig.of({ mode });
  })
);

const matchConfigMode = Match.type<WorkflowRuntimeConfigShape>().pipe(
  Match.when({ mode: "engine-memory" as const }, () => WorkflowEngine.layerMemory),
  Match.when({ mode: "engine-durable-sql" as const }, () =>
    ClusterWorkflowEngine.layer.pipe(Layer.provideMerge(Layer.orDie(SingleRunner.layer({ runnerStorage: "sql" }))))
  ),
  Match.exhaustive
);

export const WorkflowEngineLive = Layer.unwrapEffect(WorkflowRuntimeConfig.pipe(Effect.map(matchConfigMode)));

// Provide config first, then select engine layer based on that config.
export const WorkflowRuntimeLive = WorkflowEngineLive.pipe(Layer.provideMerge(WorkflowRuntimeConfigLive));
