/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: makeEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:50:43.574Z
 *
 * Overview:
 * Creates an `Equivalence` for tuples by comparing corresponding elements using the provided per-position `Equivalence`s. Two tuples are equivalent when all their corresponding elements are equivalent.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Equivalence, Tuple } from "effect"
 *
 * const eq = Tuple.makeEquivalence([
 *   Equivalence.strictEqual<string>(),
 *   Equivalence.strictEqual<number>()
 * ])
 *
 * console.log(eq(["Alice", 30], ["Alice", 30])) // true
 * console.log(eq(["Alice", 30], ["Bob", 30]))   // false
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
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary =
  "Creates an `Equivalence` for tuples by comparing corresponding elements using the provided per-position `Equivalence`s. Two tuples are equivalent when all their corresponding el...";
const sourceExample =
  'import { Equivalence, Tuple } from "effect"\n\nconst eq = Tuple.makeEquivalence([\n  Equivalence.strictEqual<string>(),\n  Equivalence.strictEqual<number>()\n])\n\nconsole.log(eq(["Alice", 30], ["Alice", 30])) // true\nconsole.log(eq(["Alice", 30], ["Bob", 30]))   // false';
const moduleRecord = TupleModule as Record<string, unknown>;

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
