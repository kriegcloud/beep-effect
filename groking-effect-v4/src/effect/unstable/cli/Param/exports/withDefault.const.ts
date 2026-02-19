/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/unstable/cli/Param
 * Export: withDefault
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/unstable/cli/Param.ts
 * Generated: 2026-02-19T04:14:24.510Z
 *
 * Overview:
 * Makes an option optional by providing a default value.
 *
 * Source JSDoc Example:
 * ```ts
 * import * as Param from "effect/unstable/cli/Param"
 *
 * // @internal - this module is not exported publicly
 *
 * // Using the pipe operator to make an option optional
 * const port = Param.integer(Param.flagKind, "port").pipe(
 *   Param.withDefault(8080)
 * )
 *
 * // Can also be used with other combinators
 * const verbose = Param.boolean(Param.flagKind, "verbose").pipe(
 *   Param.withAlias("-v"),
 *   Param.withDescription("Enable verbose output"),
 *   Param.withDefault(false)
 * )
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
const exportName = "withDefault";
const exportKind = "const";
const moduleImportPath = "effect/unstable/cli/Param";
const sourceSummary = "Makes an option optional by providing a default value.";
const sourceExample =
  'import * as Param from "effect/unstable/cli/Param"\n\n// @internal - this module is not exported publicly\n\n// Using the pipe operator to make an option optional\nconst port = Param.integer(Param.flagKind, "port").pipe(\n  Param.withDefault(8080)\n)\n\n// Can also be used with other combinators\nconst verbose = Param.boolean(Param.flagKind, "verbose").pipe(\n  Param.withAlias("-v"),\n  Param.withDescription("Enable verbose output"),\n  Param.withDefault(false)\n)';
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
