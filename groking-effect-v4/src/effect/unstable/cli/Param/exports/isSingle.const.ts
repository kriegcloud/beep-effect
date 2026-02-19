/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: isSingle
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.509Z
 *
 * Overview:
 * Type guard to check if a param is a Single param (not composed).
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * const nameParam = Param.string(Param.flagKind, "name")
 * const optionalParam = Param.optional(nameParam)
 * 
 * console.log(Param.isSingle(nameParam)) // true
 * console.log(Param.isSingle(optionalParam)) // false
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
const exportName = "isSingle";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Type guard to check if a param is a Single param (not composed).";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\nconst nameParam = Param.string(Param.flagKind, \"name\")\nconst optionalParam = Param.optional(nameParam)\n\nconsole.log(Param.isSingle(nameParam)) // true\nconsole.log(Param.isSingle(optionalParam)) // false";
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
