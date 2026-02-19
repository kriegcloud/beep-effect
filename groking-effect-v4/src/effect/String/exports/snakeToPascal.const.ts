/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/String
 * Export: snakeToPascal
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/String.ts
 * Generated: 2026-02-19T04:50:42.515Z
 *
 * Overview:
 * Converts a snake_case string to PascalCase.
 *
 * Source JSDoc Example:
 * ```ts
 * import { String } from "effect"
 *
 * console.log(String.snakeToPascal("hello_world")) // "HelloWorld"
 * console.log(String.snakeToPascal("foo_bar_baz")) // "FooBarBaz"
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
import * as StringModule from "effect/String";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "snakeToPascal";
const exportKind = "const";
const moduleImportPath = "effect/String";
const sourceSummary = "Converts a snake_case string to PascalCase.";
const sourceExample =
  'import { String } from "effect"\n\nconsole.log(String.snakeToPascal("hello_world")) // "HelloWorld"\nconsole.log(String.snakeToPascal("foo_bar_baz")) // "FooBarBaz"';
const moduleRecord = StringModule as Record<string, unknown>;

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
