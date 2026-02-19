/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: forkChild
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.389Z
 *
 * Overview:
 * Returns an effect that forks this effect into its own separate fiber, returning the fiber immediately, without waiting for it to begin executing the effect.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, Fiber } from "effect"
 *
 * const longRunningTask = Effect.gen(function*() {
 *   yield* Effect.sleep("2 seconds")
 *   yield* Effect.log("Task completed")
 *   return "result"
 * })
 *
 * const program = Effect.gen(function*() {
 *   const fiber = yield* longRunningTask.pipe(Effect.forkChild)
 *
 *   // or fork a fiber that starts immediately:
 *   yield* longRunningTask.pipe(Effect.forkChild({ startImmediately: true }))
 *
 *   yield* Effect.log("Task forked, continuing...")
 *   const result = yield* Fiber.join(fiber)
 *   return result
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "forkChild";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Returns an effect that forks this effect into its own separate fiber, returning the fiber immediately, without waiting for it to begin executing the effect.";
const sourceExample =
  'import { Effect, Fiber } from "effect"\n\nconst longRunningTask = Effect.gen(function*() {\n  yield* Effect.sleep("2 seconds")\n  yield* Effect.log("Task completed")\n  return "result"\n})\n\nconst program = Effect.gen(function*() {\n  const fiber = yield* longRunningTask.pipe(Effect.forkChild)\n\n  // or fork a fiber that starts immediately:\n  yield* longRunningTask.pipe(Effect.forkChild({ startImmediately: true }))\n\n  yield* Effect.log("Task forked, continuing...")\n  const result = yield* Fiber.join(fiber)\n  return result\n})';
const moduleRecord = EffectModule as Record<string, unknown>;

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
