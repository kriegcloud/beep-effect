/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: awaitEmpty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:50:36.324Z
 *
 * Overview:
 * Wait for the FiberMap to be empty. This will wait for all currently running fibers to complete.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add some fibers that will complete after a delay
 *   yield* FiberMap.run(map, "task1", Effect.sleep(1000))
 *   yield* FiberMap.run(map, "task2", Effect.sleep(2000))
 *
 *   console.log("Waiting for all fibers to complete...")
 *
 *   // Wait for the map to be empty
 *   yield* FiberMap.awaitEmpty(map)
 *
 *   console.log("All fibers completed!")
 *   console.log(yield* FiberMap.size(map)) // 0
 * })
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
import * as FiberMapModule from "effect/FiberMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "awaitEmpty";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Wait for the FiberMap to be empty. This will wait for all currently running fibers to complete.";
const sourceExample =
  'import { Effect, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Add some fibers that will complete after a delay\n  yield* FiberMap.run(map, "task1", Effect.sleep(1000))\n  yield* FiberMap.run(map, "task2", Effect.sleep(2000))\n\n  console.log("Waiting for all fibers to complete...")\n\n  // Wait for the map to be empty\n  yield* FiberMap.awaitEmpty(map)\n\n  console.log("All fibers completed!")\n  console.log(yield* FiberMap.size(map)) // 0\n})';
const moduleRecord = FiberMapModule as Record<string, unknown>;

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
