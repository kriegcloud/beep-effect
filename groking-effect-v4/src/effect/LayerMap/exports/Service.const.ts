/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LayerMap
 * Export: Service
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LayerMap.ts
 * Generated: 2026-02-19T04:50:37.405Z
 *
 * Overview:
 * Create a `LayerMap` service that provides a dynamic set of resources based on a key.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Layer, LayerMap, ServiceMap } from "effect"
 *
 * // Define a service key
 * const Greeter = ServiceMap.Service<{
 *   readonly greet: Effect.Effect<string>
 * }>("Greeter")
 *
 * // Create a service that wraps a LayerMap
 * class GreeterMap extends LayerMap.Service<GreeterMap>()("GreeterMap", {
 *   // Define the lookup function for the layer map
 *   lookup: (name: string) =>
 *     Layer.succeed(Greeter)({
 *       greet: Effect.succeed(`Hello, ${name}!`)
 *     }),
 *
 *   // If a layer is not used for a certain amount of time, it can be removed
 *   idleTimeToLive: "5 seconds"
 * }) {}
 *
 * // Usage
 * const program = Effect.gen(function*() {
 *   // Access and use the Greeter service
 *   const greeter = yield* Greeter
 *   yield* Console.log(yield* greeter.greet)
 * }).pipe(
 *   // Use the GreeterMap service to provide a variant of the Greeter service
 *   Effect.provide(GreeterMap.get("John"))
 * ).pipe(
 *   // Provide the GreeterMap layer
 *   Effect.provide(GreeterMap.layer)
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
import * as LayerMapModule from "effect/LayerMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Service";
const exportKind = "const";
const moduleImportPath = "effect/LayerMap";
const sourceSummary = "Create a `LayerMap` service that provides a dynamic set of resources based on a key.";
const sourceExample =
  'import { Console, Effect, Layer, LayerMap, ServiceMap } from "effect"\n\n// Define a service key\nconst Greeter = ServiceMap.Service<{\n  readonly greet: Effect.Effect<string>\n}>("Greeter")\n\n// Create a service that wraps a LayerMap\nclass GreeterMap extends LayerMap.Service<GreeterMap>()("GreeterMap", {\n  // Define the lookup function for the layer map\n  lookup: (name: string) =>\n    Layer.succeed(Greeter)({\n      greet: Effect.succeed(`Hello, ${name}!`)\n    }),\n\n  // If a layer is not used for a certain amount of time, it can be removed\n  idleTimeToLive: "5 seconds"\n}) {}\n\n// Usage\nconst program = Effect.gen(function*() {\n  // Access and use the Greeter service\n  const greeter = yield* Greeter\n  yield* Console.log(yield* greeter.greet)\n}).pipe(\n  // Use the GreeterMap service to provide a variant of the Greeter service\n  Effect.provide(GreeterMap.get("John"))\n).pipe(\n  // Provide the GreeterMap layer\n  Effect.provide(GreeterMap.layer)\n)';
const moduleRecord = LayerMapModule as Record<string, unknown>;

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
