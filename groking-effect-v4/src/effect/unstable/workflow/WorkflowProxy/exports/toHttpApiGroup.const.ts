/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/workflow/WorkflowProxy
 * Export: toHttpApiGroup
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/workflow/WorkflowProxy.ts
 * Generated: 2026-02-19T04:14:30.994Z
 *
 * Overview:
 * Derives an `HttpApiGroup` from a list of workflows.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Layer, Schema } from "effect"
 * import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
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
 * // Use WorkflowProxy.toHttpApiGroup to create a `HttpApiGroup` from the
 * // workflows
 * class MyApi extends HttpApi.make("api")
 *   .add(WorkflowProxy.toHttpApiGroup("workflows", myWorkflows))
 * {}
 *
 * // Use WorkflowProxyServer.layerHttpApi to create a layer that implements the
 * // workflows HttpApiGroup
 * const ApiLayer = HttpApiBuilder.layer(MyApi).pipe(
 *   Layer.provide(
 *     WorkflowProxyServer.layerHttpApi(MyApi, "workflows", myWorkflows)
 *   )
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
const exportName = "toHttpApiGroup";
const exportKind = "const";
const moduleImportPath = "effect/unstable/workflow/WorkflowProxy";
const sourceSummary = "Derives an `HttpApiGroup` from a list of workflows.";
const sourceExample =
  'import { Layer, Schema } from "effect"\nimport { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"\nimport {\n  Workflow,\n  WorkflowProxy,\n  WorkflowProxyServer\n} from "effect/unstable/workflow"\n\nconst EmailWorkflow = Workflow.make({\n  name: "EmailWorkflow",\n  payload: {\n    id: Schema.String,\n    to: Schema.String\n  },\n  idempotencyKey: ({ id }) => id\n})\n\nconst myWorkflows = [EmailWorkflow] as const\n\n// Use WorkflowProxy.toHttpApiGroup to create a `HttpApiGroup` from the\n// workflows\nclass MyApi extends HttpApi.make("api")\n  .add(WorkflowProxy.toHttpApiGroup("workflows", myWorkflows))\n{}\n\n// Use WorkflowProxyServer.layerHttpApi to create a layer that implements the\n// workflows HttpApiGroup\nconst ApiLayer = HttpApiBuilder.layer(MyApi).pipe(\n  Layer.provide(\n    WorkflowProxyServer.layerHttpApi(MyApi, "workflows", myWorkflows)\n  )\n)';
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
