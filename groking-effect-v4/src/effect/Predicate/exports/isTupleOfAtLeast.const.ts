/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Predicate
 * Export: isTupleOfAtLeast
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Predicate.ts
 * Generated: 2026-02-19T04:14:15.913Z
 *
 * Overview:
 * Checks whether a readonly array has at least `n` elements.
 *
 * Source JSDoc Example:
 * ```ts
 * import { Predicate } from "effect"
 * 
 * const hasAtLeast2 = Predicate.isTupleOfAtLeast(2)
 * 
 * console.log(hasAtLeast2([1, 2, 3]))
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
import * as PredicateModule from "effect/Predicate";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "isTupleOfAtLeast";
const exportKind = "const";
const moduleImportPath = "effect/Predicate";
const sourceSummary = "Checks whether a readonly array has at least `n` elements.";
const sourceExample = "import { Predicate } from \"effect\"\n\nconst hasAtLeast2 = Predicate.isTupleOfAtLeast(2)\n\nconsole.log(hasAtLeast2([1, 2, 3]))";
const moduleRecord = PredicateModule as Record<string, unknown>;

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
