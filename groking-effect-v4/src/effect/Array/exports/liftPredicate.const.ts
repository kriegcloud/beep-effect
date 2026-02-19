/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Array
 * Export: liftPredicate
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Array.ts
 * Generated: 2026-02-19T04:14:09.704Z
 *
 * Overview:
 * Lifts a predicate into an array: returns `[value]` if the predicate holds, `[]` otherwise.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Array } from "effect"
 * 
 * const isEven = (n: number) => n % 2 === 0
 * const to = Array.liftPredicate(isEven)
 * console.log(to(1)) // []
 * console.log(to(2)) // [2]
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
const exportName = "liftPredicate";
const exportKind = "const";
const moduleImportPath = "effect/Array";
const sourceSummary = "Lifts a predicate into an array: returns `[value]` if the predicate holds, `[]` otherwise.";
const sourceExample = "import { Array } from \"effect\"\n\nconst isEven = (n: number) => n % 2 === 0\nconst to = Array.liftPredicate(isEven)\nconsole.log(to(1)) // []\nconsole.log(to(2)) // [2]";
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
