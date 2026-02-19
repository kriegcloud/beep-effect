/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Tuple
 * Export: makeOrder
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Tuple.ts
 * Generated: 2026-02-19T04:14:22.584Z
 *
 * Overview:
 * Creates an `Order` for tuples by comparing corresponding elements using the provided per-position `Order`s. Elements are compared left-to-right; the first non-zero comparison determines the result.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Number, String, Tuple } from "effect"
 *
 * const ord = Tuple.makeOrder([String.Order, Number.Order])
 *
 * console.log(ord(["Alice", 30], ["Bob", 25]))   // -1
 * console.log(ord(["Alice", 30], ["Alice", 30])) // 0
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
import * as TupleModule from "effect/Tuple";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "makeOrder";
const exportKind = "const";
const moduleImportPath = "effect/Tuple";
const sourceSummary =
  "Creates an `Order` for tuples by comparing corresponding elements using the provided per-position `Order`s. Elements are compared left-to-right; the first non-zero comparison de...";
const sourceExample =
  'import { Number, String, Tuple } from "effect"\n\nconst ord = Tuple.makeOrder([String.Order, Number.Order])\n\nconsole.log(ord(["Alice", 30], ["Bob", 25]))   // -1\nconsole.log(ord(["Alice", 30], ["Alice", 30])) // 0';
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
