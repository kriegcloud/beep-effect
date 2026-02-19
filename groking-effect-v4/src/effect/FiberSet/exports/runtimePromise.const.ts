/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberSet
 * Export: runtimePromise
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberSet.ts
 * Generated: 2026-02-19T04:50:36.413Z
 *
 * Overview:
 * Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, FiberSet } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const set = yield* FiberSet.make()
 *   const runPromise = yield* FiberSet.runtimePromise(set)()
 *
 *   // Run effects as promises
 *   const promise1 = runPromise(Effect.succeed("hello"))
 *   const promise2 = runPromise(Effect.succeed("world"))
 *
 *   const result1 = yield* Effect.promise(() => promise1)
 *   const result2 = yield* Effect.promise(() => promise2)
 *
 *   console.log(result1, result2) // "hello" "world"
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
import * as FiberSetModule from "effect/FiberSet";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runtimePromise";
const exportKind = "const";
const moduleImportPath = "effect/FiberSet";
const sourceSummary = "Capture a Runtime and use it to fork Effect's, adding the forked fibers to the FiberSet.";
const sourceExample =
  'import { Effect, FiberSet } from "effect"\n\nconst program = Effect.gen(function*() {\n  const set = yield* FiberSet.make()\n  const runPromise = yield* FiberSet.runtimePromise(set)()\n\n  // Run effects as promises\n  const promise1 = runPromise(Effect.succeed("hello"))\n  const promise2 = runPromise(Effect.succeed("world"))\n\n  const result1 = yield* Effect.promise(() => promise1)\n  const result2 = yield* Effect.promise(() => promise2)\n\n  console.log(result1, result2) // "hello" "world"\n})';
const moduleRecord = FiberSetModule as Record<string, unknown>;

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
