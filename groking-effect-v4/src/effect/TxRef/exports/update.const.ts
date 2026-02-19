/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: update
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:14:23.331Z
 *
 * Overview:
 * Updates the value of the `TxRef` using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 *
 * const program = Effect.gen(function*() {
 *   const counter = yield* TxRef.make(10)
 *
 *   // Update the value using a function
 *   yield* Effect.atomic(
 *     TxRef.update(counter, (current) => current * 2)
 *   )
 *
 *   console.log(yield* TxRef.get(counter)) // 20
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
import * as TxRefModule from "effect/TxRef";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "update";
const exportKind = "const";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "Updates the value of the `TxRef` using the provided function.";
const sourceExample =
  'import { Effect, TxRef } from "effect"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* TxRef.make(10)\n\n  // Update the value using a function\n  yield* Effect.atomic(\n    TxRef.update(counter, (current) => current * 2)\n  )\n\n  console.log(yield* TxRef.get(counter)) // 20\n})';
const moduleRecord = TxRefModule as Record<string, unknown>;

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
