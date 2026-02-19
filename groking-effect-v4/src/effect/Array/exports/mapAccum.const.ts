/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: mapAccum
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.705Z
 *
 * Overview:
 * Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * const result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])
 * console.log(result) // [6, [1, 3, 6]]
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
import * as ArrayModule from "effect/Array";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "mapAccum";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Maps over an array while threading an accumulator through each step, returning both the final state and the mapped array.";
const sourceExample = "import { Array } from \"effect\"\n\nconst result = Array.mapAccum([1, 2, 3], 0, (acc, n) => [acc + n, acc + n])\nconsole.log(result) // [6, [1, 3, 6]]";
const moduleRecord = ArrayModule as Record<string, unknown>;

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
