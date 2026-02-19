/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: timeLog
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:50:34.528Z
 *
 * Overview:
 * Logs the current value of a timer that was previously started by calling time.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   yield* Effect.scoped(
 *     Effect.gen(function*() {
 *       yield* Console.time("long-operation")
 *       yield* Effect.sleep("500 millis")
 *       yield* Console.timeLog("long-operation", "Halfway done")
 *       yield* Effect.sleep("500 millis")
 *       // Timer ends when scope closes
 *     })
 *   )
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
import * as ConsoleModule from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "timeLog";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Logs the current value of a timer that was previously started by calling time.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  yield* Effect.scoped(\n    Effect.gen(function*() {\n      yield* Console.time("long-operation")\n      yield* Effect.sleep("500 millis")\n      yield* Console.timeLog("long-operation", "Halfway done")\n      yield* Effect.sleep("500 millis")\n      // Timer ends when scope closes\n    })\n  )\n})';
const moduleRecord = ConsoleModule as Record<string, unknown>;

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
