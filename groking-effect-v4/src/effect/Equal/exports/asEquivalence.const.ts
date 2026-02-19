/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Equal
 * Export: asEquivalence
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Equal.ts
 * Generated: 2026-02-19T04:14:12.620Z
 *
 * Overview:
 * Creates an `Equivalence` instance using the `equals` function. This allows the equality logic to be used with APIs that expect an `Equivalence`.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array, Equal } from "effect"
 * 
 * const eq = Equal.asEquivalence<number>()
 * const result = Array.dedupeWith([1, 2, 2, 3, 1], eq)
 * console.log(result) // [1, 2, 3]
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
import * as EqualModule from "effect/Equal";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "asEquivalence";
const exportKind = "const";
const moduleImportPath = "effect/Equal";
const sourceSummary = "Creates an `Equivalence` instance using the `equals` function. This allows the equality logic to be used with APIs that expect an `Equivalence`.";
const sourceExample = "import { Array, Equal } from \"effect\"\n\nconst eq = Equal.asEquivalence<number>()\nconst result = Array.dedupeWith([1, 2, 2, 3, 1], eq)\nconsole.log(result) // [1, 2, 3]";
const moduleRecord = EqualModule as Record<string, unknown>;

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
