/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: filter
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.509Z
 *
 * Overview:
 * Filters parsed values, failing with a custom error message if the predicate returns false.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * const evenNumber = Param.integer(Param.flagKind, "num").pipe(
 *   Param.filter(
 *     (n) => n % 2 === 0,
 *     (n) => `Expected even number, got ${n}`
 *   )
 * )
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
const exportName = "filter";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Filters parsed values, failing with a custom error message if the predicate returns false.";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\nconst evenNumber = Param.integer(Param.flagKind, \"num\").pipe(\n  Param.filter(\n    (n) => n % 2 === 0,\n    (n) => `Expected even number, got ${n}`\n  )\n)";
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
