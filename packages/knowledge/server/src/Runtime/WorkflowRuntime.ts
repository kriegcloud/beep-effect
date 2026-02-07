import { $KnowledgeServerId } from "@beep/identity/packages";
import { WorkflowEngine } from "@effect/workflow";
import * as Config from "effect/Config";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

const $I = $KnowledgeServerId.create("Runtime/WorkflowRuntime");

export type WorkflowRuntimeMode = "engine";

export interface WorkflowRuntimeConfigShape {
  readonly mode: WorkflowRuntimeMode;
}

export class WorkflowRuntimeConfig extends Context.Tag($I`WorkflowRuntimeConfig`)<
  WorkflowRuntimeConfig,
  WorkflowRuntimeConfigShape
>() {}

const decodeMode = (_value: string): WorkflowRuntimeMode => "engine";

export const DEFAULT_WORKFLOW_RUNTIME_MODE: WorkflowRuntimeMode = "engine";

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

export const WorkflowEngineLive = WorkflowEngine.layerMemory;

export const WorkflowRuntimeLive = Layer.mergeAll(WorkflowRuntimeConfigLive, WorkflowEngineLive);
