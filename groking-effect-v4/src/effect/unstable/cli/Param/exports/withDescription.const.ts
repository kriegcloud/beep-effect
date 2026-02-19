/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: withDescription
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.510Z
 *
 * Overview:
 * Adds a description to an option for help text.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * const verbose = Param.boolean(Param.flagKind, "verbose").pipe(
 *   Param.withAlias("-v"),
 *   Param.withDescription("Enable verbose output")
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
const exportName = "withDescription";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Adds a description to an option for help text.";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\nconst verbose = Param.boolean(Param.flagKind, \"verbose\").pipe(\n  Param.withAlias(\"-v\"),\n  Param.withDescription(\"Enable verbose output\")\n)";
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
