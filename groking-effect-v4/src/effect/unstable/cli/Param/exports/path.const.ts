/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: path
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.510Z
 *
 * Overview:
 * Creates a path parameter that accepts file or directory paths.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Basic path parameter
 * const outputPath = Param.path(Param.flagKind, "output")
 *
 * // Path that must exist
 * const inputPath = Param.path(Param.flagKind, "input", { mustExist: true })
 *
 * // File-only path
 * const configFile = Param.path(Param.flagKind, "config", {
 *   pathType: "file",
 *   mustExist: true,
 *   typeName: "config-file"
 * })
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
const exportName = "path";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Creates a path parameter that accepts file or directory paths.";
const sourceExample =
  'import * as Param from "effect/unstable/cli/Param"\n\n// @internal - this module is not exported publicly\n\n// Basic path parameter\nconst outputPath = Param.path(Param.flagKind, "output")\n\n// Path that must exist\nconst inputPath = Param.path(Param.flagKind, "input", { mustExist: true })\n\n// File-only path\nconst configFile = Param.path(Param.flagKind, "config", {\n  pathType: "file",\n  mustExist: true,\n  typeName: "config-file"\n})';
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
