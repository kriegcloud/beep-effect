/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: errorLines
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:50:43.277Z
 *
 * Overview:
 * Returns an array of all items that have been logged by the program using `Console.error` thus far.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.error("Error message")
 *   yield* Console.error("Another error", new Error("Something went wrong"))
 *
 *   const errors = yield* TestConsole.errorLines
 *
 *   console.log(errors)
 *   // [
 *   //   ["Error message"],
 *   //   ["Another error", Error: Something went wrong]
 *   // ]
 * }).pipe(Effect.provide(TestConsole.layer))
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
import * as TestConsoleModule from "effect/testing/TestConsole";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "errorLines";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary =
  "Returns an array of all items that have been logged by the program using `Console.error` thus far.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport * as TestConsole from "effect/testing/TestConsole"\n\nconst program = Effect.gen(function*() {\n  yield* Console.error("Error message")\n  yield* Console.error("Another error", new Error("Something went wrong"))\n\n  const errors = yield* TestConsole.errorLines\n\n  console.log(errors)\n  // [\n  //   ["Error message"],\n  //   ["Another error", Error: Something went wrong]\n  // ]\n}).pipe(Effect.provide(TestConsole.layer))';
const moduleRecord = TestConsoleModule as Record<string, unknown>;

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
