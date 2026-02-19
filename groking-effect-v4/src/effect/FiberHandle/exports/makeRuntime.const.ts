/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/FiberHandle
 * Export: makeRuntime
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/FiberHandle.ts
 * Generated: 2026-02-19T04:50:36.208Z
 *
 * Overview:
 * Create an Effect run function that is backed by a FiberHandle.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber, FiberHandle } from "effect"
 *
 * Effect.gen(function*() {
 *   const run = yield* FiberHandle.makeRuntime<never>()
 *
 *   // Run effects and get fibers back
 *   const fiberA = run(Effect.succeed("first"))
 *   const fiberB = run(Effect.succeed("second"))
 *
 *   // The second fiber will interrupt the first
 *   const resultA = yield* Fiber.await(fiberA)
 *   const resultB = yield* Fiber.await(fiberB)
 * }).pipe(Effect.scoped)
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
import * as FiberHandleModule from "effect/FiberHandle";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeRuntime";
const exportKind = "const";
const moduleImportPath = "effect/FiberHandle";
const sourceSummary = "Create an Effect run function that is backed by a FiberHandle.";
const sourceExample =
  'import { Effect, Fiber, FiberHandle } from "effect"\n\nEffect.gen(function*() {\n  const run = yield* FiberHandle.makeRuntime<never>()\n\n  // Run effects and get fibers back\n  const fiberA = run(Effect.succeed("first"))\n  const fiberB = run(Effect.succeed("second"))\n\n  // The second fiber will interrupt the first\n  const resultA = yield* Fiber.await(fiberA)\n  const resultB = yield* Fiber.await(fiberB)\n}).pipe(Effect.scoped)';
const moduleRecord = FiberHandleModule as Record<string, unknown>;

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
