/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Exit
 * Export: findDefect
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Exit.ts
 * Generated: 2026-02-19T04:14:12.654Z
 *
 * Overview:
 * Extracts the first defect from a failed Exit for use in filter pipelines.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Exit, Filter } from "effect"
 *
 * const exit = Exit.die("boom")
 * const result = Exit.findDefect(exit)
 * // result is "boom"
 *
 * const typed = Exit.fail("err")
 * const noDefect = Exit.findDefect(typed)
 * // noDefect is a Filter.fail marker
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
import * as ExitModule from "effect/Exit";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "findDefect";
const exportKind = "const";
const moduleImportPath = "effect/Exit";
const sourceSummary = "Extracts the first defect from a failed Exit for use in filter pipelines.";
const sourceExample =
  'import { Exit, Filter } from "effect"\n\nconst exit = Exit.die("boom")\nconst result = Exit.findDefect(exit)\n// result is "boom"\n\nconst typed = Exit.fail("err")\nconst noDefect = Exit.findDefect(typed)\n// noDefect is a Filter.fail marker';
const moduleRecord = ExitModule as Record<string, unknown>;

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
