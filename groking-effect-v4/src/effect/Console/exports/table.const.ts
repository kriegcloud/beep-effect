/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Console
 * Export: table
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Console.ts
 * Generated: 2026-02-19T04:14:11.196Z
 *
 * Overview:
 * Displays tabular data as a table in the console.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Console, Effect } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const users = [
 *     { name: "John", age: 30, city: "New York" },
 *     { name: "Jane", age: 25, city: "London" },
 *     { name: "Bob", age: 35, city: "Paris" }
 *   ]
 *   yield* Console.table(users)
 *   yield* Console.table(users, ["name", "age"]) // Only show specific columns
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as ConsoleModule from "effect/Console";
import * as Effect from "effect/Effect";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "table";
const exportKind = "const";
const moduleImportPath = "effect/Console";
const sourceSummary = "Displays tabular data as a table in the console.";
const sourceExample =
  'import { Console, Effect } from "effect"\n\nconst program = Effect.gen(function*() {\n  const users = [\n    { name: "John", age: 30, city: "New York" },\n    { name: "Jane", age: 25, city: "London" },\n    { name: "Bob", age: 35, city: "Paris" }\n  ]\n  yield* Console.table(users)\n  yield* Console.table(users, ["name", "age"]) // Only show specific columns\n})';
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
