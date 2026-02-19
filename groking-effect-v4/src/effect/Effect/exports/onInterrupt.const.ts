/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: onInterrupt
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:14:12.391Z
 *
 * Overview:
 * Runs the specified finalizer effect if this effect is interrupted.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Fiber } from "effect"
 * 
 * const task = Effect.forever(Effect.succeed("working..."))
 * 
 * const program = Effect.onInterrupt(
 *   task,
 *   () => Console.log("Task was interrupted, cleaning up...")
 * )
 * 
 * const fiber = Effect.runFork(program)
 * // Later interrupt the task
 * Effect.runFork(Fiber.interrupt(fiber))
 * // Output: Task was interrupted, cleaning up...
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
import * as EffectModule from "effect/Effect";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "onInterrupt";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary = "Runs the specified finalizer effect if this effect is interrupted.";
const sourceExample = "import { Console, Effect, Fiber } from \"effect\"\n\nconst task = Effect.forever(Effect.succeed(\"working...\"))\n\nconst program = Effect.onInterrupt(\n  task,\n  () => Console.log(\"Task was interrupted, cleaning up...\")\n)\n\nconst fiber = Effect.runFork(program)\n// Later interrupt the task\nEffect.runFork(Fiber.interrupt(fiber))\n// Output: Task was interrupted, cleaning up...";
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
