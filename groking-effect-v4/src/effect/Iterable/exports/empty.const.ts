/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Iterable
 * Export: empty
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Iterable.ts
 * Generated: 2026-02-19T04:14:14.234Z
 *
 * Overview:
 * Creates an empty iterable that yields no elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Iterable } from "effect"
 * 
 * const empty = Iterable.empty<string>()
 * console.log(Array.from(empty)) // []
 * console.log(Iterable.isEmpty(empty)) // true
 * 
 * // Useful as base case for reductions
 * const hasData = true
 * const result = hasData
 *   ? Iterable.range(1, 5)
 *   : Iterable.empty<number>()
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
import * as IterableModule from "effect/Iterable";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "empty";
const exportKind = "const";
const moduleImportPath = "effect/Iterable";
const sourceSummary = "Creates an empty iterable that yields no elements.";
const sourceExample = "import { Iterable } from \"effect\"\n\nconst empty = Iterable.empty<string>()\nconsole.log(Array.from(empty)) // []\nconsole.log(Iterable.isEmpty(empty)) // true\n\n// Useful as base case for reductions\nconst hasData = true\nconst result = hasData\n  ? Iterable.range(1, 5)\n  : Iterable.empty<number>()";
const moduleRecord = IterableModule as Record<string, unknown>;

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
