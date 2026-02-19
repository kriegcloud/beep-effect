/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: log
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:14:11.196Z
 *
 * Overview:
 * Outputs a message to the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   yield* Console.log("Hello, world!")
 *   yield* Console.log("User data:", { name: "John", age: 30 })
 *   yield* Console.log("Processing", 42, "items")
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
const exportName = "log";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Outputs a message to the console.";
const sourceExample = "import { Console, Effect } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  yield* Console.log(\"Hello, world!\")\n  yield* Console.log(\"User data:\", { name: \"John\", age: 30 })\n  yield* Console.log(\"Processing\", 42, \"items\")\n})";
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
