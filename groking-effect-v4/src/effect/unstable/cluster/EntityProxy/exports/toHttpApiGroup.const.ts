/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cluster/EntityProxy
 * Export: toHttpApiGroup
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cluster/EntityProxy.ts
 * Generated: 2026-02-19T04:14:25.091Z
 *
 * Overview:
 * Derives an `HttpApiGroup` from an `Entity`.
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
 * import { HttpApi, HttpApiBuilder } from "effect/unstable/httpapi"
 * import { Rpc } from "effect/unstable/rpc"
 * 
 * export const Counter = Entity.make("Counter", [
 *   Rpc.make("Increment", {
 *     payload: { id: Schema.String, amount: Schema.Number },
 *     primaryKey: ({ id }) => id,
 *     success: Schema.Number
 *   })
 * ]).annotateRpcs(ClusterSchema.Persisted, true)
 * 
 * // Use EntityProxy.toHttpApiGroup to create a `HttpApiGroup` from the
 * // Counter entity
 * export class MyApi extends HttpApi.make("api")
 *   .add(
 *     EntityProxy.toHttpApiGroup("counter", Counter)
 *       .prefix("/counter")
 *   )
 * {}
 * 
 * // Use EntityProxyServer.layerHttpApi to create a layer that implements
 * // the handlers for the HttpApiGroup
 * const ApiLayer = HttpApiBuilder.layer(MyApi).pipe(
 *   Layer.provide(EntityProxyServer.layerHttpApi(MyApi, "counter", Counter))
 * )
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as EntityProxyModule from "effect/unstable/cluster/EntityProxy";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "toHttpApiGroup";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cluster/EntityProxy";
const sourceSummary = "Derives an `HttpApiGroup` from an `Entity`.";
const sourceExample = "import { Layer, Schema } from \"effect\"\nimport {\n  ClusterSchema,\n  Entity,\n  EntityProxy,\n  EntityProxyServer\n} from \"effect/unstable/cluster\"\nimport { HttpApi, HttpApiBuilder } from \"effect/unstable/httpapi\"\nimport { Rpc } from \"effect/unstable/rpc\"\n\nexport const Counter = Entity.make(\"Counter\", [\n  Rpc.make(\"Increment\", {\n    payload: { id: Schema.String, amount: Schema.Number },\n    primaryKey: ({ id }) => id,\n    success: Schema.Number\n  })\n]).annotateRpcs(ClusterSchema.Persisted, true)\n\n// Use EntityProxy.toHttpApiGroup to create a `HttpApiGroup` from the\n// Counter entity\nexport class MyApi extends HttpApi.make(\"api\")\n  .add(\n    EntityProxy.toHttpApiGroup(\"counter\", Counter)\n      .prefix(\"/counter\")\n  )\n{}\n\n// Use EntityProxyServer.layerHttpApi to create a layer that implements\n// the handlers for the HttpApiGroup\nconst ApiLayer = HttpApiBuilder.layer(MyApi).pipe(\n  Layer.provide(EntityProxyServer.layerHttpApi(MyApi, \"counter\", Counter))\n)";
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
  bunContext: BunContext,
  examples: [
    {
      title: "Runtime Shape Inspection",
      description: "Inspect module export count, runtime type, and formatted preview.",
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
