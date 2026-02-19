/**
 * Export Playground
 *
 * Package: effect
 * Module: effect/Function
 * Export: dual
 * Kind: const
 * Source: .repos/effect-smol/packages/effect/src/Function.ts
 * Generated: 2026-02-19T04:14:13.309Z
 *
 * Overview:
 * Creates a function that can be used in a data-last (aka `pipe`able) or data-first style.
 *
 * Source JSDoc Example:
 * ```ts
 * import { dual, pipe } from "effect/Function"
 * 
 * // Using arity to determine data-first or data-last style
 * const sum = dual<
 *   (that: number) => (self: number) => number,
 *   (self: number, that: number) => number
 * >(2, (self, that) => self + that)
 * 
 * console.log(sum(2, 3)) // 5 (data-first)
 * console.log(pipe(2, sum(3))) // 5 (data-last)
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
import * as FunctionModule from "effect/Function";
import {
  createPlaygroundProgram,
  inspectNamedExport,
  probeNamedExportFunction
} from "@beep/groking-effect-v4/runtime/Playground";

/* ========================================================================== *
 * Export Coordinates
 * ========================================================================== */
const exportName = "dual";
const exportKind = "const";
const moduleImportPath = "effect/Function";
const sourceSummary = "Creates a function that can be used in a data-last (aka `pipe`able) or data-first style.";
const sourceExample = "import { dual, pipe } from \"effect/Function\"\n\n// Using arity to determine data-first or data-last style\nconst sum = dual<\n  (that: number) => (self: number) => number,\n  (self: number, that: number) => number\n>(2, (self, that) => self + that)\n\nconsole.log(sum(2, 3)) // 5 (data-first)\nconsole.log(pipe(2, sum(3))) // 5 (data-last)";
const moduleRecord = FunctionModule as Record<string, unknown>;

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
