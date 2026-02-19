/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/testing/TestConsole
 * Export: logLines
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/testing/TestConsole.ts
 * Generated: 2026-02-19T04:14:22.354Z
 *
 * Overview:
 * Returns an array of all items that have been logged by the program using `Console.log` thus far.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * import * as TestConsole from "effect/testing/TestConsole"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Console.log("First message")
 *   yield* Console.log("Second message", { key: "value" })
 *   yield* Console.log("Third message", 42, true)
 * 
 *   const logs = yield* TestConsole.logLines
 * 
 *   console.log(logs)
 *   // [
 *   //   ["First message"],
 *   //   ["Second message", { key: "value" }],
 *   //   ["Third message", 42, true]
 *   // ]
 * }).pipe(Effect.provide(TestConsole.layer))
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
import * as TestConsoleModule from "effect/testing/TestConsole";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "logLines";
const exportKind = "const";
const moduleImportPath = "effect/testing/TestConsole";
const sourceSummary = "Returns an array of all items that have been logged by the program using `Console.log` thus far.";
const sourceExample = "import { Console, Effect } from \"effect\"\nimport * as TestConsole from \"effect/testing/TestConsole\"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log(\"First message\")\n  yield* Console.log(\"Second message\", { key: \"value\" })\n  yield* Console.log(\"Third message\", 42, true)\n\n  const logs = yield* TestConsole.logLines\n\n  console.log(logs)\n  // [\n  //   [\"First message\"],\n  //   [\"Second message\", { key: \"value\" }],\n  //   [\"Third message\", 42, true]\n  // ]\n}).pipe(Effect.provide(TestConsole.layer))";
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
