/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cluster/EntityProxy
 * Export: toRpcGroup
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cluster/EntityProxy.ts
 * Generated: 2026-02-19T04:50:47.138Z
 *
 * Overview:
 * Derives an `RpcGroup` from an `Entity`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Layer, Schema } from "effect"
 * import {
 *   ClusterSchema,
 *   Entity,
 *   EntityProxy,
 *   EntityProxyServer
 * } from "effect/unstable/cluster"
 * import { Rpc, RpcServer } from "effect/unstable/rpc"
 *
 * export const Counter = Entity.make("Counter", [
 *   Rpc.make("Increment", {
 *     payload: { id: Schema.String, amount: Schema.Number },
 *     primaryKey: ({ id }) => id,
 *     success: Schema.Number
 *   })
 * ]).annotateRpcs(ClusterSchema.Persisted, true)
 *
 * // Use EntityProxy.toRpcGroup to create a `RpcGroup` from the Counter entity
 * export class MyRpcs extends EntityProxy.toRpcGroup(Counter) {}
 *
 * // Use EntityProxyServer.layerRpcHandlers to create a layer that implements
 * // the rpc handlers
 * const RpcServerLayer = RpcServer.layer(MyRpcs).pipe(
 *   Layer.provide(EntityProxyServer.layerRpcHandlers(Counter))
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as EntityProxyModule from "effect/unstable/cluster/EntityProxy";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toRpcGroup";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cluster/EntityProxy";
const sourceSummary = "Derives an `RpcGroup` from an `Entity`.";
const sourceExample =
  'import { Layer, Schema } from "effect"\nimport {\n  ClusterSchema,\n  Entity,\n  EntityProxy,\n  EntityProxyServer\n} from "effect/unstable/cluster"\nimport { Rpc, RpcServer } from "effect/unstable/rpc"\n\nexport const Counter = Entity.make("Counter", [\n  Rpc.make("Increment", {\n    payload: { id: Schema.String, amount: Schema.Number },\n    primaryKey: ({ id }) => id,\n    success: Schema.Number\n  })\n]).annotateRpcs(ClusterSchema.Persisted, true)\n\n// Use EntityProxy.toRpcGroup to create a `RpcGroup` from the Counter entity\nexport class MyRpcs extends EntityProxy.toRpcGroup(Counter) {}\n\n// Use EntityProxyServer.layerRpcHandlers to create a layer that implements\n// the rpc handlers\nconst RpcServerLayer = RpcServer.layer(MyRpcs).pipe(\n  Layer.provide(EntityProxyServer.layerRpcHandlers(Counter))\n)';
const moduleRecord = EntityProxyModule as Record<string, unknown>;

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
