/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: set
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:14:23.331Z
 *
 * Overview:
 * Sets the value of the `TxRef`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const counter = yield* TxRef.make(0)
 * 
 *   // Set a new value within a transaction
 *   yield* Effect.atomic(
 *     TxRef.set(counter, 100)
 *   )
 * 
 *   console.log(yield* TxRef.get(counter)) // 100
 * })
 * ```
 *
 * Focus:
 * - Value-like exports (`const`, `let`, `var`, `enum`, `namespace`, `reexport`).
 * - Clean executable examples with shared logging/error utilities.
 */
import * as Effect from "effect/Effect";
import * as Console from "effect/Console";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunRuntime from "@effect/platform-bun/BunRuntime";
import * as TxRefModule from "effect/TxRef";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "set";
const exportKind = "const";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "Sets the value of the `TxRef`.";
const sourceExample = "import { Effect, TxRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* TxRef.make(0)\n\n  // Set a new value within a transaction\n  yield* Effect.atomic(\n    TxRef.set(counter, 100)\n  )\n\n  console.log(yield* TxRef.get(counter)) // 100\n})";
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
      run: exampleRuntimeInspection
    },
    {
      title: "Callable Value Probe",
      description: "Attempt a zero-arg invocation when the value is function-like.",
      run: exampleCallableProbe
    }
  ]
});

BunRuntime.runMain(program);
