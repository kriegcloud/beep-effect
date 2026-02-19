/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: make
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:50:43.277Z
 *
 * Overview:
 * Creates a new TestConsole instance that captures all console output. The returned TestConsole implements the Console interface and provides additional methods to retrieve logged messages.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("Debug message")
 *   yield* Console.error("Error occurred")
 *
 *   const logs = yield* TestConsole.logLines
 *   const errors = yield* TestConsole.errorLines
 *
 *   console.log("Captured logs:", logs)
 *   console.log("Captured errors:", errors)
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
const exportName = "make";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary =
  "Creates a new TestConsole instance that captures all console output. The returned TestConsole implements the Console interface and provides additional methods to retrieve logged...";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport * as TestConsole from "effect/testing/TestConsole"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log("Debug message")\n  yield* Console.error("Error occurred")\n\n  const logs = yield* TestConsole.logLines\n  const errors = yield* TestConsole.errorLines\n\n  console.log("Captured logs:", logs)\n  console.log("Captured errors:", errors)\n}).pipe(Effect.provide(TestConsole.layer))';
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
