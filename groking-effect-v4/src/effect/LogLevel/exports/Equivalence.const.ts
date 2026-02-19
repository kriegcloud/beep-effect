/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/LogLevel
 * Export: Equivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/LogLevel.ts
 * Generated: 2026-02-19T04:14:14.517Z
 *
 * Overview:
 * An `Equivalence` instance for log levels using strict equality (`===`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { LogLevel } from "effect"
 * 
 * console.log(LogLevel.Equivalence("Error", "Error")) // true
 * console.log(LogLevel.Equivalence("Error", "Info")) // false
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
import * as LogLevelModule from "effect/LogLevel";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Equivalence";
const exportKind = "const";
const moduleImportPath = "effect/LogLevel";
const sourceSummary = "An `Equivalence` instance for log levels using strict equality (`===`).";
const sourceExample = "import { LogLevel } from \"effect\"\n\nconsole.log(LogLevel.Equivalence(\"Error\", \"Error\")) // true\nconsole.log(LogLevel.Equivalence(\"Error\", \"Info\")) // false";
const moduleRecord = LogLevelModule as Record<string, unknown>;

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
