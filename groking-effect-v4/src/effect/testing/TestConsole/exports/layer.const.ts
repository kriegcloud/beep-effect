/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: layer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:14:22.354Z
 *
 * Overview:
 * Creates a `Layer` which constructs a `TestConsole`. This layer can be used to provide a TestConsole implementation for testing purposes.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 *
 * const program = Effect.gen(function*() {
 *   yield* Console.log("This will be captured")
 *   yield* Console.error("This error will be captured")
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as TestConsoleModule from "effect/testing/TestConsole";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "layer";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary =
  "Creates a `Layer` which constructs a `TestConsole`. This layer can be used to provide a TestConsole implementation for testing purposes.";
const sourceExample =
  'import { Console, Effect } from "effect"\nimport * as TestConsole from "effect/testing/TestConsole"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log("This will be captured")\n  yield* Console.error("This error will be captured")\n\n  const logs = yield* TestConsole.logLines\n  const errors = yield* TestConsole.errorLines\n\n  console.log("Captured logs:", logs)\n  console.log("Captured errors:", errors)\n}).pipe(Effect.provide(TestConsole.layer))';
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
