/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: countReset
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:14:11.195Z
 *
 * Overview:
 * Resets the counter for the given label.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Console.count("my-counter")
 *   yield* Console.count("my-counter") // Will show: my-counter: 2
 *   yield* Console.countReset("my-counter")
 *   yield* Console.count("my-counter") // Will show: my-counter: 1
 * })
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
import * as ConsoleModule from "effect/Console";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "countReset";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Resets the counter for the given label.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Console.count(\"my-counter\")\n  yield* Console.count(\"my-counter\") // Will show: my-counter: 2\n  yield* Console.countReset(\"my-counter\")\n  yield* Console.count(\"my-counter\") // Will show: my-counter: 1\n})";
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
