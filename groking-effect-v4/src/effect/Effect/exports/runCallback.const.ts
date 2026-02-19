/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Effect
 * Export: runCallback
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Effect.ts
 * Generated: 2026-02-19T04:50:35.913Z
 *
 * Overview:
 * Runs an effect asynchronously, registering `onExit` as a fiber observer and returning an interruptor.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect, Exit } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("working")
 *   return "done"
 * })
 *
 * const interrupt = Effect.runCallback(program, {
 *   onExit: (exit) => {
 *     Effect.runSync(
 *       Exit.match(exit, {
 *         onFailure: () => Console.log("failed"),
 *         onSuccess: (value) => Console.log(`success: ${value}`)
 *       })
 *     )
 *   }
 * })
 *
 * // Output:
 * // working
 * // success: done
 *
 * // interrupt() to cancel the fiber if needed
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
import * as EffectModule from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "runCallback";
const exportKind = "const";
const moduleImportPath = "effect/Effect";
const sourceSummary =
  "Runs an effect asynchronously, registering `onExit` as a fiber observer and returning an interruptor.";
const sourceExample =
  'import { Console, Effect, Exit } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log("working")\n  return "done"\n})\n\nconst interrupt = Effect.runCallback(program, {\n  onExit: (exit) => {\n    Effect.runSync(\n      Exit.match(exit, {\n        onFailure: () => Console.log("failed"),\n        onSuccess: (value) => Console.log(`success: ${value}`)\n      })\n    )\n  }\n})\n\n// Output:\n// working\n// success: done\n\n// interrupt() to cancel the fiber if needed';
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
