/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: andLeft
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:14:13.258Z
 *
 * Overview:
 * Combines two filters but only returns the result of the left filter.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Filter } from "effect"
 *
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const evenNumbers = Filter.fromPredicate((n: number) => n % 2 === 0)
 *
 * const positiveEven = Filter.andLeft(positiveNumbers, evenNumbers)
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
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "andLeft";
const exportKind = "const";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Combines two filters but only returns the result of the left filter.";
const sourceExample =
  'import { Filter } from "effect"\n\nconst positiveNumbers = Filter.fromPredicate((n: number) => n > 0)\nconst evenNumbers = Filter.fromPredicate((n: number) => n % 2 === 0)\n\nconst positiveEven = Filter.andLeft(positiveNumbers, evenNumbers)';
const moduleRecord = FilterModule as Record<string, unknown>;

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
