/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: run
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:14:13.039Z
 *
 * Overview:
 * Run an Effect and add the forked fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *
 *   // Run effects and add the fibers to the map
 *   const fiber1 = yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))
 *   const fiber2 = yield* FiberMap.run(map, "task2", Effect.succeed("World"))
 *
 *   // Wait for the results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "Hello", "World"
 *   console.log(yield* FiberMap.size(map)) // 0 (fibers are removed after completion)
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
const exportName = "run";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary =
  "Run an Effect and add the forked fiber to the FiberMap. When the fiber completes, it will be removed from the FiberMap.";
const sourceExample =
  'import { Effect, Fiber, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n\n  // Run effects and add the fibers to the map\n  const fiber1 = yield* FiberMap.run(map, "task1", Effect.succeed("Hello"))\n  const fiber2 = yield* FiberMap.run(map, "task2", Effect.succeed("World"))\n\n  // Wait for the results\n  const result1 = yield* Fiber.await(fiber1)\n  const result2 = yield* Fiber.await(fiber2)\n\n  console.log(result1, result2) // "Hello", "World"\n  console.log(yield* FiberMap.size(map)) // 0 (fibers are removed after completion)\n})';
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
