/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Struct
 * Export: evolveEntries
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Struct.ts
 * Generated: 2026-02-19T04:50:42.533Z
 *
 * Overview:
 * Selectively transforms both keys and values of a struct. Each per-key function receives `(key, value)` and must return a `[newKey, newValue]` tuple. Keys without a corresponding function are copied unchanged.
 *
 * Source JSDoc Example:
 * ```ts
 * import { pipe, Struct } from "effect"
 *
 * const result = pipe(
 *   { amount: 100, label: "total" },
 *   Struct.evolveEntries({
 *     amount: (k, v) => [`${k}Cents`, v * 100],
 *     label: (k, v) => [k, v.toUpperCase()]
 *   })
 * )
 * console.log(result) // { amountCents: 10000, label: "TOTAL" }
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
import * as StructModule from "effect/Struct";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "evolveEntries";
const exportKind = "const";
const moduleImportPath = "effect/Struct";
const sourceSummary =
  "Selectively transforms both keys and values of a struct. Each per-key function receives `(key, value)` and must return a `[newKey, newValue]` tuple. Keys without a corresponding...";
const sourceExample =
  'import { pipe, Struct } from "effect"\n\nconst result = pipe(\n  { amount: 100, label: "total" },\n  Struct.evolveEntries({\n    amount: (k, v) => [`${k}Cents`, v * 100],\n    label: (k, v) => [k, v.toUpperCase()]\n  })\n)\nconsole.log(result) // { amountCents: 10000, label: "TOTAL" }';
const moduleRecord = StructModule as Record<string, unknown>;

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
