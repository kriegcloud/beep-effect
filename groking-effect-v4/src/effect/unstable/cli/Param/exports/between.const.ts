/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: between
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.508Z
 *
 * Overview:
 * Wraps an option to allow it to be specified multiple times within a range.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Allow 1-3 file inputs
 * const files = Param.string(Param.flagKind, "file").pipe(
 *   Param.between(1, 3),
 *   Param.withAlias("-f")
 * )
 *
 * // Parse: --file a.txt --file b.txt
 * // Result: ["a.txt", "b.txt"]
 *
 * // Allow 0 or more tags
 * const tags = Param.string(Param.flagKind, "tag").pipe(
 *   Param.between(0, Number.MAX_SAFE_INTEGER)
 * )
 *
 * // Parse: --tag dev --tag staging --tag v1.0
 * // Result: ["dev", "staging", "v1.0"]
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
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ParamModule from "effect/unstable/cli/Param";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "between";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Wraps an option to allow it to be specified multiple times within a range.";
const sourceExample =
  'import * as Param from "effect/unstable/cli/Param"\n\n// @internal - this module is not exported publicly\n\n// Allow 1-3 file inputs\nconst files = Param.string(Param.flagKind, "file").pipe(\n  Param.between(1, 3),\n  Param.withAlias("-f")\n)\n\n// Parse: --file a.txt --file b.txt\n// Result: ["a.txt", "b.txt"]\n\n// Allow 0 or more tags\nconst tags = Param.string(Param.flagKind, "tag").pipe(\n  Param.between(0, Number.MAX_SAFE_INTEGER)\n)\n\n// Parse: --tag dev --tag staging --tag v1.0\n// Result: ["dev", "staging", "v1.0"]';
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
