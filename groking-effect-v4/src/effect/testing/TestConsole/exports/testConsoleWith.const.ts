/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: testConsoleWith
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:50:43.277Z
 *
 * Overview:
 * Retrieves the `TestConsole` service for this test and uses it to run the specified workflow.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 *
 * const program = TestConsole.testConsoleWith((testConsole) =>
 *   Effect.gen(function*() {
 *     testConsole.log("Test message")
 *     testConsole.error("Test error")
 *
 *     const logs = yield* testConsole.logLines
 *     const errors = yield* testConsole.errorLines
 *
 *     console.log("Logs:", logs) // [["Test message"]]
 *     console.log("Errors:", errors) // [["Test error"]]
 *   })
 * ).pipe(Effect.provide(TestConsole.layer))
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
const exportName = "testConsoleWith";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary = "Retrieves the `TestConsole` service for this test and uses it to run the specified workflow.";
const sourceExample =
  'import { Effect } from "effect"\nimport * as TestConsole from "effect/testing/TestConsole"\n\nconst program = TestConsole.testConsoleWith((testConsole) =>\n  Effect.gen(function*() {\n    testConsole.log("Test message")\n    testConsole.error("Test error")\n\n    const logs = yield* testConsole.logLines\n    const errors = yield* testConsole.errorLines\n\n    console.log("Logs:", logs) // [["Test message"]]\n    console.log("Errors:", errors) // [["Test error"]]\n  })\n).pipe(Effect.provide(TestConsole.layer))';
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
