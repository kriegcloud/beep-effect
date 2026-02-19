/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/workflow/WorkflowProxy
 * Export: toRpcGroup
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/workflow/WorkflowProxy.ts
 * Generated: 2026-02-19T04:14:30.995Z
 *
 * Overview:
 * Derives an `RpcGroup` from a list of workflows.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Layer, Schema } from "effect"
 * import { RpcServer } from "effect/unstable/rpc"
 * import {
 *   Workflow,
 *   WorkflowProxy,
 *   WorkflowProxyServer
 * } from "effect/unstable/workflow"
 *
 * const EmailWorkflow = Workflow.make({
 *   name: "EmailWorkflow",
 *   payload: {
 *     id: Schema.String,
 *     to: Schema.String
 *   },
 *   idempotencyKey: ({ id }) => id
 * })
 *
 * const myWorkflows = [EmailWorkflow] as const
 *
 * // Use WorkflowProxy.toRpcGroup to create a `RpcGroup` from the
 * // workflows
 * class MyRpcs extends WorkflowProxy.toRpcGroup(myWorkflows) {}
 *
 * // Use WorkflowProxyServer.layerRpcHandlers to create a layer that implements
 * // the rpc handlers
 * const ApiLayer = RpcServer.layer(MyRpcs).pipe(
 *   Layer.provide(WorkflowProxyServer.layerRpcHandlers(myWorkflows))
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */

import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction,
} from "@beep/groking-effect-v4/runtime/Playground";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as WorkflowProxyModule from "effect/unstable/workflow/WorkflowProxy";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toRpcGroup";
const exportKind = "const";
const moduleImportPath = "effect/unstable/workflow/WorkflowProxy";
const sourceSummary = "Derives an `RpcGroup` from a list of workflows.";
const sourceExample =
  'import { Layer, Schema } from "effect"\nimport { RpcServer } from "effect/unstable/rpc"\nimport {\n  Workflow,\n  WorkflowProxy,\n  WorkflowProxyServer\n} from "effect/unstable/workflow"\n\nconst EmailWorkflow = Workflow.make({\n  name: "EmailWorkflow",\n  payload: {\n    id: Schema.String,\n    to: Schema.String\n  },\n  idempotencyKey: ({ id }) => id\n})\n\nconst myWorkflows = [EmailWorkflow] as const\n\n// Use WorkflowProxy.toRpcGroup to create a `RpcGroup` from the\n// workflows\nclass MyRpcs extends WorkflowProxy.toRpcGroup(myWorkflows) {}\n\n// Use WorkflowProxyServer.layerRpcHandlers to create a layer that implements\n// the rpc handlers\nconst ApiLayer = RpcServer.layer(MyRpcs).pipe(\n  Layer.provide(WorkflowProxyServer.layerRpcHandlers(myWorkflows))\n)';
const moduleRecord = WorkflowProxyModule as Record<string, unknown>;

/* ========================================================================== *
 * Example Blocks
 * ========================================================================== */
const exampleRuntimeInspection = Effect.gen(function* () {
  yield* Console.log("Inspect the export as a runtime value and capture shape/preview.");
  yield* inspectNamedExport({ moduleRecord, exportName });
});

const exampleCallableProbe = Effect.gen(function* () {
  yield* Console.log("If the value is callable, run a zero-arg probe to observe behavior.");
  yield* probeNamedExportFunction({ moduleRecord, exportName });
});

/* ========================================================================== *
 * Program
 * ========================================================================== */
const program = createPlaygroundProgram({
  icon: "🔎",
  moduleImportPath,
  exportName,
  exportKind,
  summary: sourceSummary,
  sourceExample,
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection,
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe,
    },
  ],
});

BunRuntime.runMain(program);
