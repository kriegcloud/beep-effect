/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/TxRef
 * Export: modify
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/TxRef.ts
 * Generated: 2026-02-19T04:14:23.331Z
 *
 * Overview:
 * Modifies the value of the `TxRef` using the provided function.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Effect, TxRef } from "effect"
 * 
 * const program = Effect.gen(function*() {
 *   const counter = yield* TxRef.make(0)
 * 
 *   // Modify and return both old and new value
 *   const result = yield* Effect.atomic(
 *     TxRef.modify(counter, (current) => [current * 2, current + 1])
 *   )
 * 
 *   console.log(result) // 0 (the return value: current * 2)
 *   console.log(yield* TxRef.get(counter)) // 1 (the new value: current + 1)
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
const exportName = "modify";
const exportKind = "const";
const moduleImportPath = "effect/TxRef";
const sourceSummary = "Modifies the value of the `TxRef` using the provided function.";
const sourceExample = "import { Effect, TxRef } from \"effect\"\n\nconst program = Effect.gen(function*() {\n  const counter = yield* TxRef.make(0)\n\n  // Modify and return both old and new value\n  const result = yield* Effect.atomic(\n    TxRef.modify(counter, (current) => [current * 2, current + 1])\n  )\n\n  console.log(result) // 0 (the return value: current * 2)\n  console.log(yield* TxRef.get(counter)) // 1 (the new value: current + 1)\n})";
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
