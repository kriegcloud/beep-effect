/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: Do
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.702Z
 *
 * Overview:
 * Starting point for the "do simulation" — an array comprehension pattern.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, pipe } from "effect"
 * 
 * const result = pipe(
 *   Array.Do,
 *   Array.bind("x", () => [1, 3, 5]),
 *   Array.bind("y", () => [2, 4, 6]),
 *   Array.filter(({ x, y }) => x < y),
 *   Array.map(({ x, y }) => [x, y] as const)
 * )
 * console.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]
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
const exportName = "Do";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Starting point for the \"do simulation\" — an array comprehension pattern.";
const sourceExample = "import { Array, pipe } from \"effect\"\n\nconst result = pipe(\n  Array.Do,\n  Array.bind(\"x\", () => [1, 3, 5]),\n  Array.bind(\"y\", () => [2, 4, 6]),\n  Array.filter(({ x, y }) => x < y),\n  Array.map(({ x, y }) => [x, y] as const)\n)\nconsole.log(result) // [[1, 2], [1, 4], [1, 6], [3, 4], [3, 6], [5, 6]]";
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
