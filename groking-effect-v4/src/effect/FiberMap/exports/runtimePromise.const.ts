/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberMap
 * Export: runtimePromise
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberMap.ts
 * Generated: 2026-02-19T04:50:36.328Z
 *
 * Overview:
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap. Returns a Promise instead of a Fiber for convenience.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberMap } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const map = yield* FiberMap.make<string>()
 *   const runPromise = yield* FiberMap.runtimePromise(map)<never>()
 *
 *   // Create promises that will be backed by fibers in the map
 *   const promise1 = runPromise("task1", Effect.succeed("Hello"))
 *   const promise2 = runPromise("task2", Effect.succeed("World"))
 *
 *   // Convert promises back to Effects and await
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
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
const exportName = "runtimePromise";
const exportKind = "const";
const moduleImportPath = "effect/FiberMap";
const sourceSummary =
  "Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberMap. Returns a Promise instead of a Fiber for convenience.";
const sourceExample =
  'import { Effect, FiberMap } from "effect"\n\nconst program = Effect.gen(function*() {\n  const map = yield* FiberMap.make<string>()\n  const runPromise = yield* FiberMap.runtimePromise(map)<never>()\n\n  // Create promises that will be backed by fibers in the map\n  const promise1 = runPromise("task1", Effect.succeed("Hello"))\n  const promise2 = runPromise("task2", Effect.succeed("World"))\n\n  // Convert promises back to Effects and await\n  const result1 = yield* Effect.promise(() => promise1)\n  const result2 = yield* Effect.promise(() => promise2)\n\n  console.log(result1, result2) // "Hello", "World"\n})';
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
