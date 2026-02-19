/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Utils
 * Export: isGeneratorFunction
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Utils.ts
 * Generated: 2026-02-19T04:50:53.315Z
 *
 * Overview:
 * No summary found in JSDoc.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Utils } from "effect"
 *
 * function* generatorFn() {
 *   yield 1
 *   yield 2
 * }
 *
 * console.log(Utils.isGeneratorFunction(generatorFn)) // true
 * console.log(Utils.isGeneratorFunction(() => {})) // false
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
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as UtilsModule from "effect/Utils";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isGeneratorFunction";
const exportKind = "const";
const moduleImportPath = "effect/Utils";
const sourceSummary = "No summary found in JSDoc.";
const sourceExample =
  'import { Utils } from "effect"\n\nfunction* generatorFn() {\n  yield 1\n  yield 2\n}\n\nconsole.log(Utils.isGeneratorFunction(generatorFn)) // true\nconsole.log(Utils.isGeneratorFunction(() => {})) // false';
const moduleRecord = UtilsModule as Record<string, unknown>;

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
