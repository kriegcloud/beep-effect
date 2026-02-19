/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: integer
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.509Z
 *
 * Overview:
 * Creates an integer parameter.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * // Create an integer flag
 * const portFlag = Param.integer(Param.flagKind, "port")
 * 
 * // Create an integer argument
 * const countArg = Param.integer(Param.argumentKind, "count")
 * 
 * // Usage in CLI: --port 8080 or as positional argument: 42
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
const exportName = "integer";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Creates an integer parameter.";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\n// Create an integer flag\nconst portFlag = Param.integer(Param.flagKind, \"port\")\n\n// Create an integer argument\nconst countArg = Param.integer(Param.argumentKind, \"count\")\n\n// Usage in CLI: --port 8080 or as positional argument: 42";
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
