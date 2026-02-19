/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: get
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.703Z
 *
 * Overview:
 * Safely reads an element at the given index, returning `Option.some` or `Option.none` if the index is out of bounds.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * console.log(Array.get([1, 2, 3], 1)) // Some(2)
 * console.log(Array.get([1, 2, 3], 10)) // None
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
import * as ArrayModule from "effect/Array";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "get";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Safely reads an element at the given index, returning `Option.some` or `Option.none` if the index is out of bounds.";
const sourceExample = "import { Array } from \"effect\"\n\nconsole.log(Array.get([1, 2, 3], 1)) // Some(2)\nconsole.log(Array.get([1, 2, 3], 10)) // None";
const moduleRecord = ArrayModule as Record<string, unknown>;

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
