/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Boolean
 * Export: Equivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Boolean.ts
 * Generated: 2026-02-19T04:14:10.094Z
 *
 * Overview:
 * An `Equivalence` instance for booleans using strict equality (`===`).
 *
 * Source JSDoc Example:
 * ```ts
 * import { Boolean } from "effect"
 * 
 * console.log(Boolean.Equivalence(true, true)) // true
 * console.log(Boolean.Equivalence(true, false)) // false
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
import * as BooleanModule from "effect/Boolean";
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
const moduleImportPath = "effect/Boolean";
const sourceSummary = "An `Equivalence` instance for booleans using strict equality (`===`).";
const sourceExample = "import { Boolean } from \"effect\"\n\nconsole.log(Boolean.Equivalence(true, true)) // true\nconsole.log(Boolean.Equivalence(true, false)) // false";
const moduleRecord = BooleanModule as Record<string, unknown>;

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
