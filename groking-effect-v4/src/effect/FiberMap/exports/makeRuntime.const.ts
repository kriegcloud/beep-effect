/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: makeRuntime
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:50:36.325Z
 *
 * Overview:
 * Create an Effect run function that is backed by a FiberMap.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const run = yield* FiberMap.makeRuntime<never, string>()
 *
 *   // Run effects and get back fibers
 *   const fiber1 = run("task1", Effect.succeed("Hello"))
 *   const fiber2 = run("task2", Effect.succeed("World"))
 *
 *   // Await the results
 *   const result1 = yield* Fiber.await(fiber1)
 *   const result2 = yield* Fiber.await(fiber2)
 *
 *   console.log(result1, result2) // "Hello", "World"
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
const exportName = "makeRuntime";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary = "Create an Effect run function that is backed by a FiberMap.";
const sourceExample =
  'import { Effect, Fiber, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const run = yield* FiberMap.makeRuntime<never, string>()\n\n  // Run effects and get back fibers\n  const fiber1 = run("task1", Effect.succeed("Hello"))\n  const fiber2 = run("task2", Effect.succeed("World"))\n\n  // Await the results\n  const result1 = yield* Fiber.await(fiber1)\n  const result2 = yield* Fiber.await(fiber2)\n\n  console.log(result1, result2) // "Hello", "World"\n})';
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
