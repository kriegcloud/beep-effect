/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: atMost
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.508Z
 *
 * Overview:
 * Wraps an option to allow it to be specified at most `max` times.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 * 
 * // @internal - this module is not exported publicly
 * 
 * // Allow at most 3 warning suppressions
 * const suppressions = Param.string(Param.flagKind, "suppress").pipe(
 *   Param.atMost(3)
 * )
 * 
 * // Parse: --suppress warning1 --suppress warning2
 * // Result: ["warning1", "warning2"]
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
const exportName = "atMost";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Wraps an option to allow it to be specified at most `max` times.";
const sourceExample = "import * as Param from \"effect/unstable/cli/Param\"\n\n// @internal - this module is not exported publicly\n\n// Allow at most 3 warning suppressions\nconst suppressions = Param.string(Param.flagKind, \"suppress\").pipe(\n  Param.atMost(3)\n)\n\n// Parse: --suppress warning1 --suppress warning2\n// Result: [\"warning1\", \"warning2\"]";
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
