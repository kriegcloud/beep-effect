/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: clear
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.038Z
 *
 * Overview:
 * Remove all fibers from the FiberMap, interrupting them.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Add some fibers to the map
 *   yield* FiberMap.run(map, "task1", Effect.never)
 *   yield* FiberMap.run(map, "task2", Effect.never)
 *   yield* FiberMap.run(map, "task3", Effect.never)
 *
 *   console.log(yield* FiberMap.size(map)) // 3
 *
 *   // Clear all fibers (this will interrupt all of them)
 *   yield* FiberMap.clear(map)
 *
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FiberMapModule from "effect/FiberMap";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "clear";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Remove all fibers from the FiberMap, interrupting them.";
const sourceExample =
  'import { Effect, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Add some fibers to the map\n  yield* FiberMap.run(map, "task1", Effect.never)\n  yield* FiberMap.run(map, "task2", Effect.never)\n  yield* FiberMap.run(map, "task3", Effect.never)\n\n  console.log(yield* FiberMap.size(map)) // 3\n\n  // Clear all fibers (this will interrupt all of them)\n  yield* FiberMap.clear(map)\n\n  console.log(yield* FiberMap.size(map)) // 0\n})';
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
