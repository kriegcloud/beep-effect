/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Filter
 * Export: fromPredicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Filter.ts
 * Generated: 2026-02-19T04:14:13.259Z
 *
 * Overview:
 * Creates a Filter from a predicate or refinement function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Filter, Result } from "effect"
 *
 * // Create filter from predicate
 * const positiveNumbers = Filter.fromPredicate((n: number) => n > 0)
 * const nonEmptyStrings = Filter.fromPredicate((s: string) => s.length > 0)
 *
 * // Type refinement
 * const isString = Filter.fromPredicate((x: unknown): x is string =>
 *   typeof x === "string"
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
import * as FilterModule from "effect/Filter";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "fromPredicate";
const exportKind = "const";
const moduleImportPath = "effect/Filter";
const sourceSummary = "Creates a Filter from a predicate or refinement function.";
const sourceExample =
  'import { Filter, Result } from "effect"\n\n// Create filter from predicate\nconst positiveNumbers = Filter.fromPredicate((n: number) => n > 0)\nconst nonEmptyStrings = Filter.fromPredicate((s: string) => s.length > 0)\n\n// Type refinement\nconst isString = Filter.fromPredicate((x: unknown): x is string =>\n  typeof x === "string"\n)';
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
