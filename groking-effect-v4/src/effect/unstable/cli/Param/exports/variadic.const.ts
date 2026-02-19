/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: variadic
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.510Z
 *
 * Overview:
 * Creates a variadic parameter that can be specified multiple times.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * // Basic variadic parameter (0 to infinity)
 * const tags = Param.variadic(Param.string(Param.flagKind, "tag"))
 * 
 * // Variadic with minimum count
 * const inputs = Param.variadic(
 *   Param.string(Param.flagKind, "input"),
 *   { min: 1 } // at least 1 required
 * )
 * 
 * // Variadic with both min and max
 * const limited = Param.variadic(Param.string(Param.flagKind, "item"), {
 *   min: 2, // at least 2 times
 *   max: 2 // at most 5 times
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
import * as ParamModule from "effect/unstable/cli/Param";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "variadic";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Creates a variadic parameter that can be specified multiple times.";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\n// Basic variadic parameter (0 to infinity)\nconst tags = Param.variadic(Param.string(Param.flagKind, \"tag\"))\n\n// Variadic with minimum count\nconst inputs = Param.variadic(\n  Param.string(Param.flagKind, \"input\"),\n  { min: 1 } // at least 1 required\n)\n\n// Variadic with both min and max\nconst limited = Param.variadic(Param.string(Param.flagKind, \"item\"), {\n  min: 2, // at least 2 times\n  max: 2 // at most 5 times\n})";
const moduleRecord = ParamModule as Record<string, unknown>;

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
