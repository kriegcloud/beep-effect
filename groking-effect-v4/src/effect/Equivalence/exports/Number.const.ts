/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equivalence
 * Export: Number
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equivalence.ts
 * Generated: 2026-02-19T04:14:12.631Z
 *
 * Overview:
 * An `Equivalence` instance for numbers.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence } from "effect"
 *
 * console.log(Equivalence.Number(1, 1)) // true
 * console.log(Equivalence.Number(1, 2)) // false
 * console.log(Equivalence.Number(NaN, NaN)) // true
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
import * as EquivalenceModule from "effect/Equivalence";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "Number";
const exportKind = "const";
const moduleImportPath = "effect/Equivalence";
const sourceSummary = "An `Equivalence` instance for numbers.";
const sourceExample =
  'import { Equivalence } from "effect"\n\nconsole.log(Equivalence.Number(1, 1)) // true\nconsole.log(Equivalence.Number(1, 2)) // false\nconsole.log(Equivalence.Number(NaN, NaN)) // true';
const moduleRecord = EquivalenceModule as Record<string, unknown>;

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
